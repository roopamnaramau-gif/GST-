import React, { useState, useMemo } from 'react';
import { 
  Calculator, 
  FileText, 
  Download, 
  RefreshCw, 
  Plus, 
  Info,
  Database,
  Globe,
  Upload
} from 'lucide-react';
import { ReconciliationDashboard } from './components/ReconciliationDashboard';
import { ReconciliationTable } from './components/ReconciliationTable';
import { FileUpload } from './components/FileUpload';
import { reconcileData, sampleBooksData, samplePortalData } from './lib/reconciliationLogic';
import { SummaryStats, GSTInvoice } from './types';
import { cn } from './lib/utils';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [books, setBooks] = useState<GSTInvoice[]>(sampleBooksData);
  const [portal, setPortal] = useState<GSTInvoice[]>(samplePortalData);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'table' | 'upload' | 'guide'>('dashboard');

  const handleDataLoaded = (data: GSTInvoice[], source: 'Books' | 'Portal') => {
    if (source === 'Books') {
      setBooks(data);
    } else {
      setPortal(data);
    }
  };

  const results = useMemo(() => reconcileData(books, portal), [books, portal]);

  const stats = useMemo((): SummaryStats => {
    return {
      totalInvoices: results.length,
      matchedCount: results.filter(r => r.status === 'Matched').length,
      mismatchCount: results.filter(r => r.status === 'Mismatch in Amount').length,
      missingInPortalCount: results.filter(r => r.status === 'Missing in Portal').length,
      missingInBooksCount: results.filter(r => r.status === 'Missing in Books').length,
      totalTaxBooks: books.reduce((acc, curr) => acc + curr.totalTax, 0),
      totalTaxPortal: portal.reduce((acc, curr) => acc + curr.totalTax, 0),
    };
  }, [results, books, portal]);

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-2 rounded-lg">
              <Calculator className="text-white" size={20} />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">GST Reconciler Pro</h1>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => { setBooks(sampleBooksData); setPortal(samplePortalData); }}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors"
            >
              <RefreshCw size={16} />
              Reset Data
            </button>
            <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-all shadow-sm flex items-center gap-2">
              <Download size={16} />
              Export Report
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 mb-8 overflow-x-auto">
          <TabButton 
            active={activeTab === 'dashboard'} 
            onClick={() => setActiveTab('dashboard')}
            icon={<Database size={18} />}
            label="Dashboard"
          />
          <TabButton 
            active={activeTab === 'table'} 
            onClick={() => setActiveTab('table')}
            icon={<FileText size={18} />}
            label="Detailed Reconciliation"
          />
          <TabButton 
            active={activeTab === 'upload'} 
            onClick={() => setActiveTab('upload')}
            icon={<Upload size={18} />}
            label="Upload Data"
          />
          <TabButton 
            active={activeTab === 'guide'} 
            onClick={() => setActiveTab('guide')}
            icon={<Info size={18} />}
            label="Data Requirements"
          />
        </div>

        {/* Content Area */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'dashboard' && (
              <ReconciliationDashboard results={results} stats={stats} />
            )}

            {activeTab === 'table' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-slate-800">Invoice Comparison</h2>
                  <div className="flex gap-2">
                    <button className="px-3 py-1.5 text-xs font-semibold bg-white border border-slate-200 rounded-md hover:bg-slate-50 transition-colors flex items-center gap-1">
                      <Plus size={14} /> Add Book Entry
                    </button>
                    <button className="px-3 py-1.5 text-xs font-semibold bg-white border border-slate-200 rounded-md hover:bg-slate-50 transition-colors flex items-center gap-1">
                      <Plus size={14} /> Add Portal Entry
                    </button>
                  </div>
                </div>
                <ReconciliationTable results={results} />
              </div>
            )}

            {activeTab === 'upload' && (
              <div className="max-w-4xl mx-auto space-y-8">
                <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm space-y-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="bg-indigo-100 p-2 rounded-lg text-indigo-600">
                      <Upload size={20} />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-slate-900">Upload CSV Data</h2>
                      <p className="text-sm text-slate-500">Upload your Purchase Register and GSTR-2B files to start reconciling.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <FileUpload 
                      source="Books" 
                      label="Purchase Register (Books)" 
                      onDataLoaded={handleDataLoaded} 
                    />
                    <FileUpload 
                      source="Portal" 
                      label="GSTR-2B (Portal Data)" 
                      onDataLoaded={handleDataLoaded} 
                    />
                  </div>

                  <div className="bg-amber-50 border border-amber-100 p-4 rounded-lg flex gap-3">
                    <Info className="text-amber-600 shrink-0" size={20} />
                    <div className="text-sm text-amber-800">
                      <p className="font-bold mb-1">CSV Header Requirements:</p>
                      <p>Ensure your CSV has headers like: <code className="bg-amber-100 px-1 rounded">Supplier Name</code>, <code className="bg-amber-100 px-1 rounded">GSTIN</code>, <code className="bg-amber-100 px-1 rounded">Invoice Number</code>, <code className="bg-amber-100 px-1 rounded">Invoice Date</code>, <code className="bg-amber-100 px-1 rounded">Taxable Value</code>, <code className="bg-amber-100 px-1 rounded">IGST</code>, <code className="bg-amber-100 px-1 rounded">CGST</code>, <code className="bg-amber-100 px-1 rounded">SGST</code>.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'guide' && <GuideContent />}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}

const TabButton = ({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) => (
  <button
    onClick={onClick}
    className={cn(
      "flex items-center gap-2 px-6 py-4 text-sm font-semibold transition-all relative",
      active ? "text-indigo-600" : "text-slate-500 hover:text-slate-700"
    )}
  >
    {icon}
    {label}
    {active && (
      <motion.div 
        layoutId="activeTab" 
        className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600" 
      />
    )}
  </button>
);

const GuideContent = () => (
  <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8 max-w-4xl mx-auto space-y-8">
    <section>
      <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
        <Database className="text-indigo-600" />
        Data Requirements
      </h2>
      <p className="text-slate-600 mb-6">
        To perform an accurate GST reconciliation, you need data from two primary sources: your internal accounting records (Purchase Register) and the GST Portal (GSTR-2B/2A).
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-5 bg-slate-50 rounded-lg border border-slate-200">
          <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
            <FileText size={18} className="text-indigo-500" />
            1. Purchase Register (Books)
          </h3>
          <ul className="text-sm text-slate-600 space-y-2 list-disc pl-4">
            <li>Supplier Name & GSTIN</li>
            <li>Invoice Number & Date</li>
            <li>Taxable Value</li>
            <li>Tax Components (IGST, CGST, SGST)</li>
            <li>Total Invoice Value</li>
          </ul>
        </div>
        <div className="p-5 bg-slate-50 rounded-lg border border-slate-200">
          <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
            <Globe size={18} className="text-indigo-500" />
            2. GSTR-2B (Portal)
          </h3>
          <ul className="text-sm text-slate-600 space-y-2 list-disc pl-4">
            <li>Supplier GSTIN (Counterparty)</li>
            <li>Filing Status of Supplier</li>
            <li>Invoice Details as uploaded by Supplier</li>
            <li>ITC Eligibility (Eligible/Ineligible)</li>
            <li>GSTR-1 Filing Period</li>
          </ul>
        </div>
      </div>
    </section>

    <section className="space-y-4">
      <h2 className="text-2xl font-bold text-slate-900 mb-4">Reconciliation Formulas</h2>
      <div className="space-y-4">
        <FormulaCard 
          title="Tax Difference"
          formula="Difference = |Total Tax (Books) - Total Tax (Portal)|"
          description="Used to identify rounding errors or data entry mistakes. A tolerance of ₹1 is usually acceptable."
        />
        <FormulaCard 
          title="Invoice Matching Logic"
          formula="Match = (GSTIN_Books == GSTIN_Portal) AND (Normalized(InvNo_Books) == Normalized(InvNo_Portal))"
          description="Normalization involves removing special characters (/, -, \) and leading zeros to ensure 'INV/001' matches 'INV001'."
        />
      </div>
    </section>

    <section className="bg-indigo-50 p-6 rounded-xl border border-indigo-100">
      <h3 className="text-lg font-bold text-indigo-900 mb-2">Pro Tip: The 5% Rule</h3>
      <p className="text-sm text-indigo-800 leading-relaxed">
        As per GST rules, taxpayers can claim ITC only if it appears in GSTR-2B. However, there are provisions for provisional ITC (subject to current limits, often 5% of eligible ITC available in 2B) for invoices missing in the portal but present in books.
      </p>
    </section>
  </div>
);

const FormulaCard = ({ title, formula, description }: { title: string, formula: string, description: string }) => (
  <div className="p-4 border border-slate-200 rounded-lg">
    <h4 className="font-bold text-slate-800 mb-1">{title}</h4>
    <code className="block bg-slate-900 text-indigo-300 p-3 rounded my-2 font-mono text-sm">
      {formula}
    </code>
    <p className="text-xs text-slate-500">{description}</p>
  </div>
);
