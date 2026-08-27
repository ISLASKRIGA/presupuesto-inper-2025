import React, { useState, useMemo } from 'react';
import { Users, Search, Building2, DollarSign, Award } from 'lucide-react';
import { BudgetItem } from '../types/budget';
import { computeTopProveedores, formatCurrency, formatCompactCurrency } from '../services/budgetService';

interface ProveedoresViewProps {
  items: BudgetItem[];
  onSelectVendor: (vendorName: string) => void;
}

export const ProveedoresView: React.FC<ProveedoresViewProps> = ({ items, onSelectVendor }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const allProveedores = useMemo(() => {
    return computeTopProveedores(items, 1000);
  }, [items]);

  const filteredProveedores = useMemo(() => {
    if (!searchTerm.trim()) return allProveedores;
    const q = searchTerm.toLowerCase();
    return allProveedores.filter(p => p.name.toLowerCase().includes(q));
  }, [allProveedores, searchTerm]);

  const totalVendorBudget = useMemo(() => {
    return allProveedores.reduce((acc, curr) => acc + curr.totalParcial, 0);
  }, [allProveedores]);

  const top5Total = useMemo(() => {
    return allProveedores.slice(0, 5).reduce((acc, curr) => acc + curr.totalParcial, 0);
  }, [allProveedores]);

  const top5Pct = totalVendorBudget > 0 ? (top5Total / totalVendorBudget) * 100 : 0;

  return (
    <div className="space-y-6">
      
      {/* Top Banner KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        <div className="glass-panel rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between shadow-sm">
          <div>
            <span className="text-xs text-slate-500 font-bold uppercase">Total Proveedores Activos</span>
            <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1">{allProveedores.length.toLocaleString()}</h3>
            <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold mt-1">Empresas e instituciones registradas</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center">
            <Building2 className="w-6 h-6" />
          </div>
        </div>

        <div className="glass-panel rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between shadow-sm">
          <div>
            <span className="text-xs text-slate-500 font-bold uppercase">Monto Total Adjudicado</span>
            <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1">{formatCompactCurrency(totalVendorBudget)}</h3>
            <p className="text-xs text-slate-500 font-medium mt-1">{formatCurrency(totalVendorBudget)}</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        <div className="glass-panel rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between shadow-sm">
          <div>
            <span className="text-xs text-slate-500 font-bold uppercase">Concentración (Top 5)</span>
            <h3 className="text-3xl font-extrabold text-amber-600 dark:text-amber-400 mt-1">{top5Pct.toFixed(1)}%</h3>
            <p className="text-xs text-slate-500 font-medium mt-1">{formatCompactCurrency(top5Total)} en 5 proveedores</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center">
            <Award className="w-6 h-6" />
          </div>
        </div>

      </div>

      {/* Vendor Leaderboard Table */}
      <div className="glass-panel rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 space-y-4 shadow-sm">
        
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              Directorio y Desglose por Proveedor
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Ranking por importe acumulado e historial de dispersiones</p>
          </div>

          <div className="relative w-full sm:max-w-xs">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Buscar proveedor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto pt-2">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900 text-slate-500 uppercase tracking-wider text-[10px] font-bold border-b border-slate-200 dark:border-slate-800">
                <th className="py-3 px-4">#</th>
                <th className="py-3 px-4">Proveedor / Razon Social</th>
                <th className="py-3 px-4 text-center">Operaciones</th>
                <th className="py-3 px-4">Principal Concepto / Servicio</th>
                <th className="py-3 px-4 text-right">Monto Acumulado (MXN)</th>
                <th className="py-3 px-4 text-right">% Del Presupuesto</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredProveedores.slice(0, 50).map((prov, index) => {
                const pct = totalVendorBudget > 0 ? (prov.totalParcial / totalVendorBudget) * 100 : 0;
                return (
                  <tr 
                    key={prov.name} 
                    className="hover:bg-blue-50/50 dark:hover:bg-slate-900/60 transition-colors duration-150 cursor-pointer group"
                    onClick={() => onSelectVendor(prov.name)}
                  >
                    <td className="py-3.5 px-4 font-bold text-slate-500 font-mono">
                      #{index + 1}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors">
                        {prov.name}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-center font-bold text-slate-700 dark:text-slate-300">
                      {prov.count}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300 max-w-xs truncate" title={prov.topConcepto}>
                      {prov.topConcepto || 'Varios conceptos'}
                    </td>
                    <td className="py-3.5 px-4 text-right font-extrabold text-slate-900 dark:text-white text-sm">
                      {formatCurrency(prov.totalParcial)}
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold text-emerald-600 dark:text-emerald-400">
                      {pct.toFixed(2)}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

      </div>

    </div>
  );
};
