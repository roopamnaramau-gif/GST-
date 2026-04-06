import { GSTInvoice, ReconResult, MatchStatus } from '../types';

export const reconcileData = (books: GSTInvoice[], portal: GSTInvoice[]): ReconResult[] => {
  const results: ReconResult[] = [];
  const matchedPortalIds = new Set<string>();

  // Iterate through books and find matches in portal
  books.forEach(bookInv => {
    // Exact match search
    const portalMatch = portal.find(p => 
      p.gstin.toLowerCase() === bookInv.gstin.toLowerCase() && 
      normalizeInvoice(p.invoiceNumber) === normalizeInvoice(bookInv.invoiceNumber)
    );

    if (portalMatch) {
      matchedPortalIds.add(portalMatch.id);
      const diff = Math.abs(bookInv.totalTax - portalMatch.totalTax);
      
      let status: MatchStatus = 'Matched';
      if (diff > 1) { // 1 rupee tolerance
        status = 'Mismatch in Amount';
      }

      results.push({
        invoiceNumber: bookInv.invoiceNumber,
        gstin: bookInv.gstin,
        supplierName: bookInv.supplierName,
        bookData: bookInv,
        portalData: portalMatch,
        status,
        diff
      });
    } else {
      results.push({
        invoiceNumber: bookInv.invoiceNumber,
        gstin: bookInv.gstin,
        supplierName: bookInv.supplierName,
        bookData: bookInv,
        status: 'Missing in Portal',
        diff: bookInv.totalTax
      });
    }
  });

  // Find invoices in portal that are not in books
  portal.forEach(portalInv => {
    if (!matchedPortalIds.has(portalInv.id)) {
      results.push({
        invoiceNumber: portalInv.invoiceNumber,
        gstin: portalInv.gstin,
        supplierName: portalInv.supplierName,
        portalData: portalInv,
        status: 'Missing in Books',
        diff: portalInv.totalTax
      });
    }
  });

  return results;
};

// Helper to normalize invoice numbers (remove special chars, leading zeros)
const normalizeInvoice = (inv: string) => {
  return inv.replace(/[^a-zA-Z0-9]/g, '').replace(/^0+/, '').toUpperCase();
};

export const sampleBooksData: GSTInvoice[] = [
  { id: 'b1', supplierName: 'Tech Solutions Ltd', gstin: '27AAAAA0000A1Z5', invoiceNumber: 'INV/001', invoiceDate: '2023-10-01', taxableValue: 10000, igst: 1800, cgst: 0, sgst: 0, totalTax: 1800, source: 'Books' },
  { id: 'b2', supplierName: 'Global Traders', gstin: '27BBBBB1111B1Z6', invoiceNumber: 'GT-202', invoiceDate: '2023-10-05', taxableValue: 5000, igst: 0, cgst: 450, sgst: 450, totalTax: 900, source: 'Books' },
  { id: 'b3', supplierName: 'Office Needs', gstin: '27CCCCC2222C1Z7', invoiceNumber: 'OFF-99', invoiceDate: '2023-10-10', taxableValue: 2000, igst: 0, cgst: 180, sgst: 180, totalTax: 360, source: 'Books' },
  { id: 'b4', supplierName: 'Cloud Services', gstin: '27DDDDD3333D1Z8', invoiceNumber: 'CS/OCT/01', invoiceDate: '2023-10-15', taxableValue: 15000, igst: 2700, cgst: 0, sgst: 0, totalTax: 2700, source: 'Books' },
];

export const samplePortalData: GSTInvoice[] = [
  { id: 'p1', supplierName: 'Tech Solutions Ltd', gstin: '27AAAAA0000A1Z5', invoiceNumber: 'INV/001', invoiceDate: '2023-10-01', taxableValue: 10000, igst: 1800, cgst: 0, sgst: 0, totalTax: 1800, source: 'Portal' },
  { id: 'p2', supplierName: 'Global Traders', gstin: '27BBBBB1111B1Z6', invoiceNumber: 'GT-202', invoiceDate: '2023-10-05', taxableValue: 5000, igst: 0, cgst: 445, sgst: 445, totalTax: 890, source: 'Portal' }, // Mismatch
  { id: 'p4', supplierName: 'Cloud Services', gstin: '27DDDDD3333D1Z8', invoiceNumber: 'CS/OCT/01', invoiceDate: '2023-10-15', taxableValue: 15000, igst: 2700, cgst: 0, sgst: 0, totalTax: 2700, source: 'Portal' },
  { id: 'p5', supplierName: 'Unrecorded Vendor', gstin: '27EEEEE4444E1Z9', invoiceNumber: 'UV-101', invoiceDate: '2023-10-20', taxableValue: 3000, igst: 540, cgst: 0, sgst: 0, totalTax: 540, source: 'Portal' }, // Missing in Books
];
