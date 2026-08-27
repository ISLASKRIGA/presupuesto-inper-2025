import React from 'react';
import { formatCompactCurrency } from '../services/budgetService';

interface ExecutiveHeaderProps {
  totalModificado: number;
  totalDevengado: number;
  cap1000: number;
  cap2000: number;
  cap3000: number;
  totalOperaciones: number;
}

export const ExecutiveHeader: React.FC<ExecutiveHeaderProps> = ({
  totalModificado,
  totalDevengado,
  cap1000,
  cap2000,
  cap3000,
  totalOperaciones
}) => {
  const pctEjecutado = totalModificado > 0 ? (totalDevengado / totalModificado) * 100 : 0;
  const sobrante = totalModificado - totalDevengado;

  return (
    <div className="space-y-6 mb-8">
      
      {/* 4 Simple Explainer Cards (Transparent Style) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Card 1 */}
        <div className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-sm rounded-3xl p-6 border border-slate-200/50 dark:border-slate-800/50 flex flex-col justify-between hover:bg-white/60 transition-all">
          <div>
            <div className="w-10 h-10 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold mb-3">
              🏦
            </div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">1. Dinero Total del Hospital</span>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
              {formatCompactCurrency(totalModificado)}
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
              Es todo el dinero que el gobierno le dio al hospital para cuidar a las mamás y bebés durante todo el año.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-200/40 dark:border-slate-800/40 text-[11px] font-bold text-blue-600 dark:text-blue-400">
            💡 Equivale a 1,317 Millones de Pesos
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-sm rounded-3xl p-6 border border-slate-200/50 dark:border-slate-800/50 flex flex-col justify-between hover:bg-white/60 transition-all">
          <div>
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold mb-3">
              💸
            </div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">2. Dinero Ya Utilizado</span>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
              {formatCompactCurrency(totalDevengado)}
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
              Ya se ha pagado el <strong className="text-emerald-600 dark:text-emerald-400">{pctEjecutado.toFixed(1)}%</strong> del dinero en medicinas, luz y sueldos.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-200/40 dark:border-slate-800/40 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
            🟢 Quedan {formatCompactCurrency(sobrante)} disponibles
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-sm rounded-3xl p-6 border border-slate-200/50 dark:border-slate-800/50 flex flex-col justify-between hover:bg-white/60 transition-all">
          <div>
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold mb-3">
              👨‍⚕️
            </div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">3. ¿En qué se gasta más?</span>
            <h3 className="text-xl font-black text-slate-900 dark:text-white mt-1">
              En Doctores y Enfermeras
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
              La mayor parte del dinero (<strong>{formatCompactCurrency(cap1000)}</strong>) se usa para pagar los sueldos del personal médico.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-200/40 dark:border-slate-800/40 text-[11px] font-bold text-indigo-600 dark:text-indigo-400">
            💉 El resto es para medicinas y equipo
          </div>
        </div>

        {/* Card 4 */}
        <div className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-sm rounded-3xl p-6 border border-slate-200/50 dark:border-slate-800/50 flex flex-col justify-between hover:bg-white/60 transition-all">
          <div>
            <div className="w-10 h-10 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold mb-3">
              🧾
            </div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">4. Transparencia de Pagos</span>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
              {totalOperaciones.toLocaleString()} Pagos
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
              Cada compra y pago está guardado con su factura y número de cheque para que todo sea transparente.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-200/40 dark:border-slate-800/40 text-[11px] font-bold text-purple-600 dark:text-purple-400">
            ✅ 100% de los pagos revisados
          </div>
        </div>

      </div>

      {/* Progress Meter Bar (Transparent Background) */}
      <div className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-sm rounded-3xl p-6 border border-slate-200/50 dark:border-slate-800/50 space-y-3">
        <div className="flex items-center justify-between text-xs font-bold">
          <span className="text-slate-800 dark:text-slate-200">
            📊 Termómetro del Dinero del Hospital ({pctEjecutado.toFixed(1)}% usado)
          </span>
          <span className="text-blue-600 dark:text-blue-400 font-mono">
            {formatCompactCurrency(totalDevengado)} de {formatCompactCurrency(totalModificado)}
          </span>
        </div>

        <div className="w-full h-3.5 bg-slate-200/60 dark:bg-slate-800/60 rounded-full overflow-hidden p-0.5 border border-slate-300/40 dark:border-slate-700/40">
          <div 
            className="h-full rounded-full bg-gradient-to-r from-blue-600 via-indigo-500 to-emerald-500 transition-all duration-500"
            style={{ width: `${Math.min(pctEjecutado, 100)}%` }}
          ></div>
        </div>

        <div className="flex items-center justify-between text-[11px] text-slate-500">
          <span>0% (Inicio del año)</span>
          <span className="font-bold text-emerald-600 dark:text-emerald-400">🟢 Quedan {formatCompactCurrency(sobrante)} disponibles</span>
          <span>100% (Límite total)</span>
        </div>
      </div>

    </div>
  );
};
