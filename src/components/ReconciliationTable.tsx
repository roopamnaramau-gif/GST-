import React from 'react';
import { ReconResult } from '../types';
import { formatCurrency, cn } from '../lib/utils';
import { AlertCircle, CheckCircle2, HelpCircle, FileSearch } from 'lucide-react';

interface TableProps {
  results: ReconResult[];
}

export const ReconciliationTable: React.FC<TableProps> = ({ results }) => {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-bottom border-slate-200">
              <th className="px-6 py-4 text-sm font-semibold text-slate-700">Status</th>
              <th className="px-6 py-4 text-sm font-semibold text-slate-700">Supplier / GSTIN</th>
              <th className="px-6 py-4 text-sm font-semibold text-slate-700">Invoice No.</th>
              <th className="px-6 py-4 text-sm font-semibold text-slate-700 text-right">Tax (Books)</th>
              <th className="px-6 py-4 text-sm font-semibold text-slate-700 text-right">Tax (Portal)</th>
              <th className="px-6 py-4 text-sm font-semibold text-slate-700 text-right">Difference</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {results.map((res, idx) => (
              <tr key={idx} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4">
                  <StatusBadge status={res.status} />
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-slate-900">{res.supplierName}</div>
                  <div className="text-xs text-slate-500 font-mono">{res.gstin}</div>
                </td>
                <td className="px-6 py-4 text-sm text-slate-600 font-medium">
                  {res.invoiceNumber}
                </td>
                <td className="px-6 py-4 text-sm text-right text-slate-600">
                  {res.bookData ? formatCurrency(res.bookData.totalTax) : '-'}
                </td>
                <td className="px-6 py-4 text-sm text-right text-slate-600">
                  {res.portalData ? formatCurrency(res.portalData.totalTax) : '-'}
                </td>
                <td className={cn(
                  "px-6 py-4 text-sm text-right font-semibold",
                  res.diff > 0 ? "text-rose-600" : "text-emerald-600"
                )}>
                  {res.diff > 0 ? formatCurrency(res.diff) : '₹0.00'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const StatusBadge = ({ status }: { status: ReconResult['status'] }) => {
  const configs = {
    'Matched': { icon: <CheckCircle2 size={14} />, className: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    'Mismatch in Amount': { icon: <AlertCircle size={14} />, className: 'bg-amber-50 text-amber-700 border-amber-200' },
    'Missing in Portal': { icon: <HelpCircle size={14} />, className: 'bg-blue-50 text-blue-700 border-blue-200' },
    'Missing in Books': { icon: <FileSearch size={14} />, className: 'bg-rose-50 text-rose-700 border-rose-200' },
    'Potential Match (Approx)': { icon: <AlertCircle size={14} />, className: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  };

  const config = configs[status];

  return (
    <span className={cn(
      "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border",
      config.className
    )}>
      {config.icon}
      {status}
    </span>
  );
};
