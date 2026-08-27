import React from 'react';
import { HelpCircle, Sparkles, DollarSign, Users, Activity, HeartPulse, CheckCircle2, TrendingUp, AlertTriangle } from 'lucide-react';
import { formatCompactCurrency, formatCurrency } from '../services/budgetService';

interface EasyExplainerProps {
  totalBudget: number;
  totalDevengado: number;
  topProveedorName: string;
  topProveedorAmount: number;
  cap1000Total: number;
  cap2000Total: number;
  cap3000Total: number;
}

export const EasyExplainer: React.FC<EasyExplainerProps> = ({
  totalBudget,
  totalDevengado,
  topProveedorName,
  topProveedorAmount,
  cap1000Total,
  cap2000Total,
  cap3000Total
}) => {
  const pctUsado = totalBudget > 0 ? (totalDevengado / totalBudget) * 100 : 0;
  const sobrante = totalBudget - totalDevengado;

  return (
    <div className="glass-panel rounded-3xl p-6 border border-blue-200/80 dark:border-blue-500/30 bg-gradient-to-br from-white via-slate-50 to-blue-50/40 dark:from-slate-900/90 dark:via-slate-900/50 dark:to-blue-950/40 shadow-xl shadow-slate-200/50 dark:shadow-none mb-8 relative overflow-hidden transition-all">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-200/80 dark:border-slate-800">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-400 to-amber-500 text-slate-950 flex items-center justify-center font-bold shadow-md shadow-amber-500/20">
            <Sparkles className="w-5 h-5 fill-slate-950" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">Resumen en Español Sencillo</h3>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300 text-[10px] font-bold border border-emerald-200 dark:border-emerald-500/30">
                🍎 Modo Fácil Activo
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400">¿Qué está pasando con el dinero del hospital INPER explicadito paso a paso?</p>
          </div>
        </div>

        <div className="text-xs font-bold px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 shadow-sm">
          💡 1,317 Millones = $1,317,000,000 MXN
        </div>
      </div>

      {/* 4 Super Intuitive Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Q1: Total Dinero */}
        <div className="p-4.5 rounded-2xl bg-white/90 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center space-x-2 text-blue-600 dark:text-blue-400 mb-2">
            <DollarSign className="w-4 h-4" />
            <span className="text-xs font-bold uppercase">1. ¿Cuánto dinero hay?</span>
          </div>
          <h4 className="text-xl font-extrabold text-slate-900 dark:text-white">
            {formatCompactCurrency(totalBudget)}
          </h4>
          <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-snug">
            Bolsa total aprobada para operar el hospital este año.
          </p>
          <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-emerald-600 dark:text-emerald-400 font-bold">
            🟢 Se ha gastado el {pctUsado.toFixed(1)}% del presupuesto.
          </div>
        </div>

        {/* Q2: ¿En qué se gasta la mayoría? */}
        <div className="p-4.5 rounded-2xl bg-white/90 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center space-x-2 text-indigo-600 dark:text-indigo-400 mb-2">
            <Users className="w-4 h-4" />
            <span className="text-xs font-bold uppercase">2. ¿En qué se gasta más?</span>
          </div>
          <h4 className="text-xl font-extrabold text-slate-900 dark:text-white">
            👨‍⚕️ Sueldos (Nómina)
          </h4>
          <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-snug">
            El <strong className="text-slate-900 dark:text-white">{((cap1000Total / (cap1000Total + cap2000Total + cap3000Total || 1)) * 100).toFixed(0)}%</strong> ($906 M) es para doctores y personal.
          </p>
          <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-indigo-600 dark:text-indigo-300 font-bold">
            💉 Medicinas y 🛠️ Servicios completan el resto.
          </div>
        </div>

        {/* Q3: ¿Quién es el proveedor #1? */}
        <div className="p-4.5 rounded-2xl bg-white/90 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center space-x-2 text-amber-600 dark:text-amber-400 mb-2">
            <TrendingUp className="w-4 h-4" />
            <span className="text-xs font-bold uppercase">3. ¿Quién cobra más?</span>
          </div>
          <h4 className="text-sm font-extrabold text-slate-900 dark:text-white truncate" title={topProveedorName}>
            {topProveedorName || 'Cargando...'}
          </h4>
          <p className="text-xs text-amber-600 dark:text-amber-300 font-bold mt-1">
            {formatCompactCurrency(topProveedorAmount)} cobrados
          </p>
          <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400">
            Empresa #1 en volumen de pagos del hospital.
          </div>
        </div>

        {/* Q4: ¿Cuánto nos queda? */}
        <div className="p-4.5 rounded-2xl bg-white/90 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center space-x-2 text-emerald-600 dark:text-emerald-400 mb-2">
            <CheckCircle2 className="w-4 h-4" />
            <span className="text-xs font-bold uppercase">4. ¿Disponible sobrante?</span>
          </div>
          <h4 className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400">
            {sobrante > 0 ? formatCompactCurrency(sobrante) : '$0.00 MXN'}
          </h4>
          <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-snug">
            {sobrante > 0 ? 'Fondo disponible antes de cerrar el presupuesto.' : 'Todo el presupuesto ha sido asignado.'}
          </p>
          <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-emerald-600 dark:text-emerald-300 font-bold">
            Semáforo: Presupuesto Saludable 🟢
          </div>
        </div>

      </div>

      {/* Dictionary Banner */}
      <div className="mt-6 p-4 rounded-2xl bg-slate-100/90 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
        <span className="font-bold text-slate-900 dark:text-amber-300 flex items-center gap-1.5">
          <HelpCircle className="w-4 h-4 text-amber-500" />
          Diccionario de Gobierno a Español Fácil:
        </span>
        <div className="flex flex-wrap items-center gap-2 text-[11px]">
          <span className="px-2.5 py-1 rounded-xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 shadow-xs font-medium">
            <strong>Capítulo 1000</strong> = 👨‍⚕️ Sueldos y Nómina
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 shadow-xs font-medium">
            <strong>Capítulo 2000</strong> = 💉 Medicinas y Materiales
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 shadow-xs font-medium">
            <strong>Capítulo 3000</strong> = 🛠️ Luz, Agua, Mantenimiento
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 shadow-xs font-medium">
            <strong>Devengado</strong> = 💸 Dinero Ya Pagado
          </span>
        </div>
      </div>

    </div>
  );
};
