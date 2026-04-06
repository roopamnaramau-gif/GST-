import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileType, CheckCircle, AlertCircle } from 'lucide-react';
import Papa from 'papaparse';
import { GSTInvoice } from '../types';
import { cn } from '../lib/utils';

interface FileUploadProps {
  onDataLoaded: (data: GSTInvoice[], source: 'Books' | 'Portal') => void;
  source: 'Books' | 'Portal';
  label: string;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onDataLoaded, source, label }) => {
  const [status, setStatus] = React.useState<'idle' | 'parsing' | 'success' | 'error'>('idle');
  const [fileName, setFileName] = React.useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setFileName(file.name);
    setStatus('parsing');

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          const parsedData: GSTInvoice[] = results.data.map((row: any, index: number) => {
            // Basic mapping logic - assuming standard headers or fallback
            // In a real app, we'd have a mapping UI
            const taxableValue = parseFloat(row['Taxable Value'] || row['taxable_value'] || '0');
            const igst = parseFloat(row['IGST'] || row['igst'] || '0');
            const cgst = parseFloat(row['CGST'] || row['cgst'] || '0');
            const sgst = parseFloat(row['SGST'] || row['sgst'] || '0');
            
            return {
              id: `${source.toLowerCase()}-${index}-${Date.now()}`,
              supplierName: row['Supplier Name'] || row['supplier_name'] || 'Unknown',
              gstin: row['GSTIN'] || row['gstin'] || '',
              invoiceNumber: row['Invoice Number'] || row['invoice_number'] || '',
              invoiceDate: row['Invoice Date'] || row['invoice_date'] || '',
              taxableValue,
              igst,
              cgst,
              sgst,
              totalTax: igst + cgst + sgst,
              source
            };
          });

          onDataLoaded(parsedData, source);
          setStatus('success');
        } catch (err) {
          console.error('Error parsing CSV:', err);
          setStatus('error');
        }
      },
      error: (err) => {
        console.error('Papa Parse Error:', err);
        setStatus('error');
      }
    });
  }, [onDataLoaded, source]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
    },
    multiple: false
  } as any);

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-semibold text-slate-700">{label}</label>
      <div
        {...getRootProps()}
        className={cn(
          "relative border-2 border-dashed rounded-xl p-6 transition-all cursor-pointer flex flex-col items-center justify-center gap-3",
          isDragActive ? "border-indigo-500 bg-indigo-50" : "border-slate-200 hover:border-indigo-400 hover:bg-slate-50",
          status === 'success' && "border-emerald-500 bg-emerald-50",
          status === 'error' && "border-rose-500 bg-rose-50"
        )}
      >
        <input {...getInputProps()} />
        
        {status === 'idle' || status === 'parsing' ? (
          <>
            <div className={cn(
              "p-3 rounded-full",
              isDragActive ? "bg-indigo-100 text-indigo-600" : "bg-slate-100 text-slate-500"
            )}>
              <Upload size={24} className={status === 'parsing' ? "animate-bounce" : ""} />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-slate-900">
                {status === 'parsing' ? 'Parsing CSV...' : 'Click or drag CSV file'}
              </p>
              <p className="text-xs text-slate-500 mt-1">Only .csv files supported</p>
            </div>
          </>
        ) : status === 'success' ? (
          <>
            <div className="p-3 rounded-full bg-emerald-100 text-emerald-600">
              <CheckCircle size={24} />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-emerald-900">Successfully Loaded</p>
              <p className="text-xs text-emerald-600 mt-1 font-mono">{fileName}</p>
            </div>
          </>
        ) : (
          <>
            <div className="p-3 rounded-full bg-rose-100 text-rose-600">
              <AlertCircle size={24} />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-rose-900">Error Loading File</p>
              <p className="text-xs text-rose-600 mt-1">Please check CSV format</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
