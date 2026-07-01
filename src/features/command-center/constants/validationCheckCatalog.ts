export interface ValidationCheckDefinition {
  checkName: string;
  label: string;
  purpose: string;
  /** Only shown when extracted data exists or an issue was recorded. */
  optional?: boolean;
  /** Dot-paths on the applicability context, e.g. `vendor.bank_account_number`. */
  extractionFields?: string[];
  /** Internal resolution step — hidden unless an issue exists. */
  internalOnly?: boolean;
}

export const VALIDATION_CHECK_CATALOG: Record<
  string,
  ValidationCheckDefinition[]
> = {
  invoice_header_resolution: [
    {
      checkName: 'invoice_number_missing',
      label: 'Invoice Number',
      purpose: 'Invoice number is present or recovered.',
    },
    {
      checkName: 'invoice_date_resolution',
      label: 'Invoice Date',
      purpose: 'Invoice date is present or recovered.',
    },
  ],
  buyer_company_validation: [
    {
      checkName: 'company_details_missing',
      label: 'Company Details',
      purpose: 'Buyer company details were extracted.',
    },
    {
      checkName: 'company_name',
      label: 'Company Name',
      purpose: 'Buyer name matches the company master record.',
    },
    {
      checkName: 'company_gstin',
      label: 'Company GSTIN',
      purpose: 'Buyer GSTIN matches the company master record.',
      optional: true,
      extractionFields: ['company.gstin'],
    },
    {
      checkName: 'pan_number',
      label: 'Company PAN',
      purpose: 'Buyer PAN matches the company master record.',
      optional: true,
      extractionFields: ['company.pan'],
    },
    {
      checkName: 'company_address',
      label: 'Company Address',
      purpose: 'Buyer address matches the company master record.',
      optional: true,
      extractionFields: ['company.address'],
    },
    {
      checkName: 'shipping_address',
      label: 'Shipping Address',
      purpose: 'Shipping address matches the company master record.',
      optional: true,
      extractionFields: ['shipping.address'],
    },
    {
      checkName: 'email',
      label: 'Company Email',
      purpose: 'Buyer email matches the company master record.',
      optional: true,
      extractionFields: ['company.email'],
    },
    {
      checkName: 'phone',
      label: 'Company Phone',
      purpose: 'Buyer phone matches the company master record.',
      optional: true,
      extractionFields: ['company.phone'],
    },
  ],
  vendor_resolution: [
    {
      checkName: 'vendor_details_missing',
      label: 'Vendor Details',
      purpose: 'Vendor details were extracted from the invoice.',
    },
    {
      checkName: 'vendor_resolution',
      label: 'Vendor Lookup',
      purpose: 'Vendor was matched to a master record.',
    },
    {
      checkName: 'gstin_match',
      label: 'GSTIN Lookup',
      purpose: 'Vendor identified using GSTIN.',
      internalOnly: true,
    },
    {
      checkName: 'exact_name_match',
      label: 'Name Lookup',
      purpose: 'Vendor identified using exact name.',
      internalOnly: true,
    },
    {
      checkName: 'bank_match',
      label: 'Bank Lookup',
      purpose: 'Vendor identified using bank details.',
      internalOnly: true,
    },
    {
      checkName: 'llm_name_match',
      label: 'Semantic Name Lookup',
      purpose: 'Vendor identified using semantic name matching.',
      internalOnly: true,
    },
    {
      checkName: 'vendor_name_verification',
      label: 'Vendor Name',
      purpose: 'Extracted vendor name matches the master record.',
    },
    {
      checkName: 'gstin_verification',
      label: 'Vendor GSTIN',
      purpose: 'Extracted GSTIN matches the master record.',
      optional: true,
      extractionFields: ['vendor.vendor_gstin'],
    },
    {
      checkName: 'phone_verification',
      label: 'Vendor Phone',
      purpose: 'Extracted phone matches the master record.',
      optional: true,
      extractionFields: ['vendor.vendor_phone'],
    },
    {
      checkName: 'address_verification',
      label: 'Vendor Address',
      purpose: 'Extracted address matches the master record.',
      optional: true,
      extractionFields: ['vendor.vendor_address'],
    },
    {
      checkName: 'bank_account_verification',
      label: 'Bank Account',
      purpose: 'Extracted bank account matches the master record.',
      optional: true,
      extractionFields: ['vendor.bank_account_number'],
    },
    {
      checkName: 'ifsc_verification',
      label: 'IFSC Code',
      purpose: 'Extracted IFSC matches the master record.',
      optional: true,
      extractionFields: ['vendor.ifsc_code'],
    },
    {
      checkName: 'bank_name_verification',
      label: 'Bank Name',
      purpose: 'Extracted bank name matches the master record.',
      optional: true,
      extractionFields: ['vendor.bank_name'],
    },
    {
      checkName: 'vendor_status',
      label: 'Vendor Status',
      purpose: 'Vendor is active and allowed for payment.',
    },
  ],
  po_resolution: [
    {
      checkName: 'vendor_precondition',
      label: 'Vendor Precondition',
      purpose: 'Vendor resolution completed before PO matching.',
      internalOnly: true,
    },
    {
      checkName: 'extracted_po_validation',
      label: 'PO Number Extraction',
      purpose: 'PO reference on the invoice was validated.',
    },
    {
      checkName: 'candidate_pool',
      label: 'PO Candidate Pool',
      purpose: 'Eligible purchase orders were identified.',
      internalOnly: true,
    },
    {
      checkName: 'po_set_search',
      label: 'PO Search',
      purpose: 'Purchase orders covering invoice items were searched.',
      internalOnly: true,
    },
    {
      checkName: 'po_status_validation',
      label: 'PO Status',
      purpose: 'Matched POs are open and usable.',
      internalOnly: true,
    },
    {
      checkName: 'invalid_po_reference',
      label: 'PO Reference',
      purpose: 'Referenced PO exists and matches billed content.',
    },
    {
      checkName: 'vendor_consistency',
      label: 'PO Vendor Match',
      purpose: 'Matched POs belong to the invoice vendor.',
    },
    {
      checkName: 'po_recovery',
      label: 'PO Recovery',
      purpose: 'Replacement PO candidates were evaluated.',
      internalOnly: true,
    },
  ],
  line_item_validation: [
    {
      checkName: 'coverage_validation',
      label: 'PO Line Coverage',
      purpose: 'Invoice lines are covered by purchase orders.',
    },
    {
      checkName: 'allocation_search',
      label: 'Line Allocation',
      purpose: 'Invoice lines were mapped to PO lines.',
      internalOnly: true,
    },
    {
      checkName: 'line_item_vendor_consistency',
      label: 'Line Vendor Match',
      purpose: 'Allocated PO lines belong to the invoice vendor.',
    },
    {
      checkName: 'duplicate_detection',
      label: 'Duplicate Lines',
      purpose: 'No duplicate invoice line items detected.',
    },
    {
      checkName: 'quantity_validation',
      label: 'Ordered Quantity',
      purpose: 'Billed quantity is within the PO ordered quantity.',
    },
    {
      checkName: 'remaining_quantity_validation',
      label: 'Remaining Quantity',
      purpose: 'Billed quantity is within the remaining PO quantity.',
    },
    {
      checkName: 'allocation_consistency',
      label: 'Allocation Totals',
      purpose: 'Allocation totals match billed quantities.',
      internalOnly: true,
    },
  ],
  amount_validation: [
    {
      checkName: 'unit_price_validation',
      label: 'Unit Price',
      purpose: 'Unit prices match the purchase order.',
    },
    {
      checkName: 'line_total_validation',
      label: 'Line Totals',
      purpose: 'Line totals match quantity × unit price.',
    },
    {
      checkName: 'allocation_amount_validation',
      label: 'Allocated Amounts',
      purpose: 'Allocated amounts match expected PO amounts.',
      internalOnly: true,
    },
    {
      checkName: 'line_tax_validation',
      label: 'Line Tax',
      purpose: 'Line tax amounts are correct.',
      optional: true,
      extractionFields: ['invoice.has_line_tax'],
    },
    {
      checkName: 'invoice_tax_validation',
      label: 'Invoice Tax',
      purpose: 'Total tax on the invoice is correct.',
      optional: true,
      extractionFields: ['invoice.tax_amount'],
    },
    {
      checkName: 'subtotal_validation',
      label: 'Subtotal',
      purpose: 'Subtotal matches the sum of line totals.',
    },
    {
      checkName: 'grand_total_validation',
      label: 'Grand Total',
      purpose: 'Invoice total matches the purchase order.',
    },
    {
      checkName: 'discount_validation',
      label: 'Discount',
      purpose: 'Discount amounts are correct.',
      optional: true,
      extractionFields: ['invoice.has_discount'],
    },
    {
      checkName: 'additional_charge_detection',
      label: 'Additional Charges',
      purpose: 'Extra charges on the invoice were reviewed.',
      internalOnly: true,
    },
    {
      checkName: 'charge_mismatch_validation',
      label: 'Charge Amounts',
      purpose: 'Handling, freight, and other charges were validated.',
      internalOnly: true,
    },
    {
      checkName: 'rounding_validation',
      label: 'Rounding',
      purpose: 'Rounding differences on totals are acceptable.',
      internalOnly: true,
    },
  ],
  duplicate_detection: [
    {
      checkName: 'invoice_number_reuse',
      label: 'Invoice Number Reuse',
      purpose: 'Invoice number has not been used before for this vendor.',
    },
    {
      checkName: 'potential_duplicate_detection',
      label: 'Duplicate Invoice Check',
      purpose: 'Invoice is not a duplicate of a prior submission.',
    },
  ],
};

const VALIDATION_STAGE_ALIASES: Record<string, string> = {
  company_name_missing: 'company_details_missing',
  company_gstin_missing: 'company_details_missing',
  company_address_missing: 'company_details_missing',
  vendor_name_missing: 'vendor_details_missing',
  vendor_gstin_missing: 'vendor_details_missing',
  vendor_address_missing: 'vendor_details_missing',
};

export const getCheckDefinition = (
  stageId: string,
  checkName: string,
): ValidationCheckDefinition => {
  const catalog = VALIDATION_CHECK_CATALOG[stageId] ?? [];
  const normalizedCheckName = VALIDATION_STAGE_ALIASES[checkName] ?? checkName;
  const match = catalog.find(
    (definition) => definition.checkName === normalizedCheckName,
  );

  if (match) {
    return match;
  }

  return {
    checkName,
    label: checkName.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
    purpose: 'Validation check performed for this step.',
  };
};
