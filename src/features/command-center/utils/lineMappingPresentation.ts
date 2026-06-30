import type { ValidationIssueDetails } from '../types/invoiceReview.types';
import { buildIssuePresentation } from './validationIssuePresentation';

export interface CandidatePOLine {
  description: string;
  hsnSac?: string;
  ordered?: string;
  unitPrice?: string;
  available?: string;
}

export interface CandidatePOCard {
  poNumber: string;
  status?: string;
  date?: string;
  lines: CandidatePOLine[];
}

export interface ParsedIssueDescription {
  summary: string;
  candidatePos: CandidatePOCard[];
  validSolutions: string[][];
  allocationPlans: string[];
}

const CANDIDATE_SECTION_MARKERS = [
  'Candidate purchase orders checked:',
  'Valid PO combinations found:',
  'Valid line allocation plans found:',
];

export const splitIssueDescription = (
  description: string,
): { summary: string; context: string } => {
  let earliestIndex = description.length;

  for (const marker of CANDIDATE_SECTION_MARKERS) {
    const index = description.indexOf(marker);
    if (index >= 0 && index < earliestIndex) {
      earliestIndex = index;
    }
  }

  if (earliestIndex < description.length) {
    return {
      summary: description.slice(0, earliestIndex).trim(),
      context: description.slice(earliestIndex).trim(),
    };
  }

  const doubleNewline = description.indexOf('\n\n');
  if (doubleNewline >= 0 && description.length - doubleNewline > 120) {
    return {
      summary: description.slice(0, doubleNewline).trim(),
      context: description.slice(doubleNewline).trim(),
    };
  }

  return { summary: description.trim(), context: '' };
};

const parsePoLineText = (line: string): CandidatePOLine => {
  const trimmed = line.replace(/^\s*-\s*/, '').trim();
  const hsnMatch = trimmed.match(/\(HSN\/SAC:\s*([^,)]+)/i);
  const orderedMatch = trimmed.match(/ordered\s+([^,]+)/i);
  const priceMatch = trimmed.match(/unit price\s+([^,)]+)/i);
  const availableMatch = trimmed.match(/available\s+([^)]+)\)?/i);

  let description = trimmed;
  const parenIndex = trimmed.indexOf('(HSN/SAC:');
  if (parenIndex > 0) {
    description = trimmed.slice(0, parenIndex).trim();
  }

  return {
    description,
    hsnSac: hsnMatch?.[1]?.trim(),
    ordered: orderedMatch?.[1]?.trim(),
    unitPrice: priceMatch?.[1]?.trim(),
    available: availableMatch?.[1]?.trim(),
  };
};

export const parseCandidatePosFromText = (context: string): CandidatePOCard[] => {
  if (!context.trim()) return [];

  const cards: CandidatePOCard[] = [];
  const lines = context.split('\n');
  let current: CandidatePOCard | null = null;

  for (const line of lines) {
    const poHeader = line.match(
      /^-\s+(\S+)\s+\(status:\s*([^,]+),\s*date:\s*([^)]+)\)/i,
    );

    if (poHeader) {
      if (current) cards.push(current);
      current = {
        poNumber: poHeader[1],
        status: poHeader[2].trim(),
        date: poHeader[3].trim(),
        lines: [],
      };
      continue;
    }

    if (line.match(/^\s+-\s+/) && current) {
      current.lines.push(parsePoLineText(line));
    }
  }

  if (current) cards.push(current);
  return cards;
};

export const parseValidSolutionsFromText = (context: string): string[][] => {
  const solutions: string[][] = [];
  const lines = context.split('\n');

  for (const line of lines) {
    const match = line.match(/^\s*\d+\.\s+(.+)$/);
    if (!match) continue;

    solutions.push(
      match[1]
        .split(',')
        .map((value) => value.trim())
        .filter(Boolean),
    );
  }

  return solutions;
};

export const parseAllocationPlansFromText = (context: string): string[] => {
  const plans: string[] = [];
  const lines = context.split('\n');

  for (const line of lines) {
    const match = line.match(/^\s*\d+\.\s+(.+)$/);
    if (match) plans.push(match[1].trim());
  }

  return plans;
};

interface MetadataCandidatePO {
  po_number?: string;
  matching_items?: string[];
  available_quantities?: Record<string, string>;
  status?: string;
  po_date?: string;
}

export const candidatePosFromMetadata = (
  metadata: Record<string, unknown> | null | undefined,
): CandidatePOCard[] => {
  const raw = metadata?.candidate_pos;
  if (!Array.isArray(raw)) return [];

  return raw
    .map((entry) => {
      if (!entry || typeof entry !== 'object') return null;
      const po = entry as MetadataCandidatePO;
      const quantities = po.available_quantities ?? {};

      return {
        poNumber: String(po.po_number ?? 'Unknown PO'),
        status: po.status ? String(po.status) : undefined,
        date: po.po_date ? String(po.po_date) : undefined,
        lines: (po.matching_items ?? []).map((description) => ({
          description: String(description),
          available: quantities[description],
        })),
      } satisfies CandidatePOCard;
    })
    .filter((card): card is CandidatePOCard => card != null);
};

export const validSolutionsFromMetadata = (
  metadata: Record<string, unknown> | null | undefined,
): string[][] => {
  const raw = metadata?.valid_solutions;
  if (!Array.isArray(raw)) return [];

  return raw
    .filter((entry): entry is unknown[] => Array.isArray(entry))
    .map((entry) => entry.map((value) => String(value)));
};

export const parseValidationIssueForMapping = (
  issue: ValidationIssueDetails,
): ParsedIssueDescription & ReturnType<typeof buildIssuePresentation> => {
  const presentation = buildIssuePresentation(issue, issue.check_stage);
  const { summary: splitSummary, context } = splitIssueDescription(issue.description);

  const metadataCandidates = candidatePosFromMetadata(issue.metadata);
  const metadataSolutions = validSolutionsFromMetadata(issue.metadata);

  const textCandidates = parseCandidatePosFromText(context);
  const textSolutions = context.includes('Valid PO combinations')
    ? parseValidSolutionsFromText(context)
    : [];
  const allocationPlans = context.includes('Valid line allocation plans')
    ? parseAllocationPlansFromText(context)
    : [];

  return {
    ...presentation,
    summary: presentation.summary || splitSummary,
    candidatePos: metadataCandidates.length > 0 ? metadataCandidates : textCandidates,
    validSolutions: metadataSolutions.length > 0 ? metadataSolutions : textSolutions,
    allocationPlans,
  };
};
