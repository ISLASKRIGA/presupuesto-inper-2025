import React from 'react';
import { DollarSign, Receipt, Building, Layers, TrendingUp } from 'lucide-react';
import { KPIStats } from '../types/budget';
import { formatCurrency, formatCompactCurrency } from '../services/budgetService';

interface KPICardsProps {
  kpis: KPIStats;
  totalRecords: number;
}

export const KPICards: React.FC<KPICardsProps> = ({ kpis, totalRecords }) => {
  const cap2000Pct = kpis.totalParcial > 0 ? (kpis.cap2000Parcial / kpis.totalParcial) * 100 : 0;
  const cap3000Pct = kpis.totalParcial > 0 ? (kpis.cap3000Parcial / kpis.totalParcial) * 100 : 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
      
      {/* Card 1 */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all">
        <div className="flex items-center justify-between mb-3">
          <div>
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-blue-700 dark:text-blue-400">Dispersiones Operativas</span>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Cap 2000 + 3000 (Pólizas)</p>
          </div>
          <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400 flex items-center justify-center border border-blue-100 dark:border-blue-500/30">
            <DollarSign className="w-4 h-4" />
          </div>
        </div>
        <div className="mb-2">
          <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            {formatCompactCurrency(kpis.totalParcial)}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-mono">
            {formatCurrency(kpis.totalParcial)} MXN
          </p>
        </div>
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
          <span className="text-slate-500 dark:text-slate-400 font-medium">Estado Fiscal</span>
          <span className="font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded text-[11px] border border-emerald-200 dark:border-emerald-500/30">
            100% Dispersado
          </span>
        </div>
      </div>

      {/* Card 2 */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all">
        <div className="flex items-center justify-between mb-3">
          <div>
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-indigo-700 dark:text-indigo-400">Servicios Generales</span>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Capítulo 3000 INPER</p>
          </div>
          <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-400 flex items-center justify-center border border-indigo-100 dark:border-indigo-500/30">
            <Layers className="w-4 h-4" />
          </div>
        </div>
        <div className="mb-2">
          <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            {formatCompactCurrency(kpis.cap3000Parcial)}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
            Proporción: {cap3000Pct.toFixed(1)}% del total ejercido
          </p>
        </div>
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
          <span className="text-slate-500 dark:text-slate-400">Cap 2000 Insumos:</span>
          <span className="font-semibold text-slate-900 dark:text-slate-200">{formatCompactCurrency(kpis.cap2000Parcial)} ({cap2000Pct.toFixed(1)}%)</span>
        </div>
      </div>

      {/* Card 3 */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all">
        <div className="flex items-center justify-between mb-3">
          <div>
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-purple-700 dark:text-purple-400">Partidas Auditadas</span>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Total dispersiones contables</p>
          </div>
          <div className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-500/20 text-purple-700 dark:text-purple-400 flex items-center justify-center border border-purple-100 dark:border-purple-500/30">
            <Receipt className="w-4 h-4" />
          </div>
        </div>
        <div className="mb-2">
          <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            {kpis.totalOperaciones.toLocaleString()}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
            Registros contables únicos
          </p>
        </div>
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
          <span className="text-slate-500 dark:text-slate-400">Promedio/Poliza:</span>
          <span className="font-semibold text-purple-700 dark:text-purple-300 font-mono">{formatCompactCurrency(kpis.promedioOperacion)}</span>
        </div>
      </div>

      {/* Card 4 */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all">
        <div className="flex items-center justify-between mb-3">
          <div>
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">Padrón de Proveedores</span>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Empresas e instituciones</p>
          </div>
          <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 flex items-center justify-center border border-emerald-100 dark:border-emerald-500/30">
            <Building className="w-4 h-4" />
          </div>
        </div>
        <div className="mb-2">
          <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            {kpis.totalProveedores.toLocaleString()}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
            Beneficiarios adjudicados
          </p>
        </div>
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
          <span className="text-slate-500 dark:text-slate-400">Importe Total:</span>
          <span className="font-semibold text-emerald-700 dark:text-emerald-300 font-mono">{formatCompactCurrency(kpis.totalTotal)}</span>
        </div>
      </div>

    </div>
  );
};
