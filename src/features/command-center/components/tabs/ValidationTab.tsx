import React from 'react';
import { ValidationIssuesSection } from '../validation/ValidationIssuesSection';
import type {
  InvoiceExtractionResponse,
  InvoiceHeaderResponse,
  InvoiceValidationResponse,
} from '../../types/invoiceReview.types';

interface ValidationTabProps {
  validation: InvoiceValidationResponse;
  header: InvoiceHeaderResponse | null;
  extraction: InvoiceExtractionResponse | null;
}

export const ValidationTab: React.FC<ValidationTabProps> = ({
  validation,
  header,
  extraction,
}) => {
  if (validation.issues.length === 0) {
    return (
      <p className="text-sm text-[var(--color-muted-foreground)] text-center py-8">
        No validation results available for this invoice.
      </p>
    );
  }

  return (
    <ValidationIssuesSection
      validation={validation}
      header={header}
      extraction={extraction}
    />
  );
};
