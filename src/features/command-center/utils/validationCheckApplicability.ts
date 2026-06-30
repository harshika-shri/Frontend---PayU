import type { ValidationCheckDefinition } from '../constants/validationCheckCatalog';
import type {
  InvoiceExtractionResponse,
  InvoiceHeaderResponse,
  ValidationIssueDetails,
} from '../types/invoiceReview.types';

export interface CheckApplicabilityContext {
  header: InvoiceHeaderResponse | null;
  extraction: InvoiceExtractionResponse | null;
}

const hasValue = (value: unknown): boolean => {
  if (value == null) return false;
  if (typeof value === 'string') return value.trim().length > 0;
  if (typeof value === 'number') return value !== 0;
  if (typeof value === 'boolean') return value;
  return true;
};

const resolveContextValue = (
  context: CheckApplicabilityContext,
  path: string,
): unknown => {
  const vendor = context.extraction?.vendor_details;
  const company = context.header?.company;
  const lineItems = context.extraction?.line_items ?? [];

  switch (path) {
    case 'vendor.vendor_gstin':
      return vendor?.vendor_gstin;
    case 'vendor.vendor_phone':
      return vendor?.vendor_phone;
    case 'vendor.vendor_address':
      return vendor?.vendor_address;
    case 'vendor.bank_account_number':
      return vendor?.bank_account_number;
    case 'vendor.ifsc_code':
      return vendor?.ifsc_code;
    case 'vendor.bank_name':
      return vendor?.bank_name;
    case 'vendor.account_holder_name':
      return vendor?.account_holder_name;
    case 'company.gstin':
      return company?.gstin;
    case 'company.pan':
      return null;
    case 'company.address':
      return null;
    case 'company.email':
      return null;
    case 'company.phone':
      return null;
    case 'shipping.address':
      return null;
    case 'invoice.tax_amount':
      return context.header?.tax_amount;
    case 'invoice.has_discount':
      return (
        (context.header?.discount_amount ?? 0) > 0 ||
        lineItems.some((item) => (item.discount_amount ?? 0) > 0)
      );
    case 'invoice.has_line_tax':
      return lineItems.some(
        (item) =>
          item.tax_details != null &&
          Object.keys(item.tax_details).length > 0,
      );
    default:
      return undefined;
  }
};

const hasExtractionData = (
  definition: ValidationCheckDefinition,
  context: CheckApplicabilityContext,
): boolean => {
  if (!definition.extractionFields?.length) {
    return false;
  }

  if (
    definition.extractionFields.some((path) => path.startsWith('vendor.'))
  ) {
    const vendor = context.extraction?.vendor_details;
    if (!vendor) return false;

    if (definition.checkName === 'bank_match') {
      return (
        hasValue(vendor.bank_account_number) ||
        hasValue(vendor.ifsc_code) ||
        hasValue(vendor.bank_name)
      );
    }
  }

  return definition.extractionFields.some((path) =>
    hasValue(resolveContextValue(context, path)),
  );
};

export const isCheckApplicable = (
  definition: ValidationCheckDefinition,
  issues: ValidationIssueDetails[],
  context: CheckApplicabilityContext,
): boolean => {
  if (issues.length > 0) {
    return true;
  }

  if (definition.internalOnly) {
    return false;
  }

  if (definition.optional) {
    return hasExtractionData(definition, context);
  }

  return true;
};

export const buildApplicabilityContext = (
  header: InvoiceHeaderResponse | null,
  extraction: InvoiceExtractionResponse | null,
): CheckApplicabilityContext => ({
  header,
  extraction,
});
