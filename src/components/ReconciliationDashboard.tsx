import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell 
} from 'recharts';
import { ReconResult, SummaryStats } from '../types';
import { formatCurrency, cn } from '../lib/utils';
import { CheckCircle2, AlertCircle, HelpCircle, FileSearch } from 'lucide-react';

interface DashboardProps {
  results: ReconResult[];
  stats: SummaryStats;
}

const COLORS = ['#10b981', '#f59e0b', '#ef4444', '#3b82f6'];

export const ReconciliationDashboard: React.FC<DashboardProps> = ({ results, stats }) => {
  const pieData = [
    { name: 'Matched', value: stats.matchedCount },
    { name: 'Mismatch', value: stats.mismatchCount },
    { name: 'Missing in Portal', value: stats.missingInPortalCount },
    { name: 'Missing in Books', value: stats.missingInBooksCount },
  ];

  const barData = [
    { name: 'Books', tax: stats.totalTaxBooks },
    { name: 'Portal', tax: stats.totalTaxPortal },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Matched" 
          value={stats.matchedCount} 
          icon={<CheckCircle2 className="text-emerald-500" />} 
          color="border-emerald-500"
        />
        <StatCard 
          title="Mismatch" 
          value={stats.mismatchCount} 
          icon={<AlertCircle className="text-amber-500" />} 
          color="border-amber-500"
        />
        <StatCard 
          title="Missing in Portal" 
          value={stats.missingInPortalCount} 
          icon={<HelpCircle className="text-blue-500" />} 
          color="border-blue-500"
        />
        <StatCard 
          title="Missing in Books" 
          value={stats.missingInBooksCount} 
          icon={<FileSearch className="text-rose-500" />} 
          color="border-rose-500"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-semibold mb-4 text-slate-800">Reconciliation Status</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-semibold mb-4 text-slate-800">Total Tax Comparison</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis tickFormatter={(value) => `₹${value/1000}k`} />
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                <Bar dataKey="tax" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon, color }: { title: string, value: number, icon: React.ReactNode, color: string }) => (
  <div className={cn("bg-white p-6 rounded-xl border-l-4 shadow-sm border border-slate-200", color)}>
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">{title}</p>
        <p className="text-2xl font-bold text-slate-900 mt-1">{value}</p>
      </div>
      <div className="p-3 bg-slate-50 rounded-lg">
        {icon}
      </div>
    </div>
  </div>
);
