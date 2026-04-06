
export interface GSTInvoice {
  id: string;
  supplierName: string;
  gstin: string;
  invoiceNumber: string;
  invoiceDate: string;
  taxableValue: number;
  igst: number;
  cgst: number;
  sgst: number;
  totalTax: number;
  source: 'Books' | 'Portal';
}

export type MatchStatus = 
  | 'Matched' 
  | 'Mismatch in Amount' 
  | 'Missing in Portal' 
  | 'Missing in Books'
  | 'Potential Match (Approx)';

export interface ReconResult {
  invoiceNumber: string;
  gstin: string;
  supplierName: string;
  bookData?: GSTInvoice;
  portalData?: GSTInvoice;
  status: MatchStatus;
  diff: number;
}

export interface SummaryStats {
  totalInvoices: number;
  matchedCount: number;
  mismatchCount: number;
  missingInPortalCount: number;
  missingInBooksCount: number;
  totalTaxBooks: number;
  totalTaxPortal: number;
}
