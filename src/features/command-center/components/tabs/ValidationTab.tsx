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
}) => (
  <ValidationIssuesSection
    validation={validation}
    header={header}
    extraction={extraction}
  />
);
