import React from 'react';
import { X, Building2, Tag, FileText, ShieldCheck } from 'lucide-react';
import { BudgetItem } from '../types/budget';
import { formatCurrency } from '../services/budgetService';

interface DetailModalProps {
  item: BudgetItem | null;
  onClose: () => void;
}

export const DetailModal: React.FC<DetailModalProps> = ({ item, onClose }) => {
  if (!item) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-fadeIn">
      <div 
        className="glass-panel w-full max-w-3xl rounded-3xl border border-slate-200 dark:border-slate-700 shadow-2xl overflow-hidden flex flex-col max-h-[90vh] bg-white dark:bg-slate-950"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-extrabold text-lg ${
              item.capitulo_code === '3000'
                ? 'bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-300 border border-blue-200 dark:border-blue-500/40'
                : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/40'
            }`}>
              {item.capitulo_code}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-300">
                  {item.capitulo}
                </span>
                {item.tipo_sol && (
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-500/20 text-indigo-800 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/30">
                    Tipo Sol: {item.tipo_sol}
                  </span>
                )}
              </div>
              <h3 className="text-lg font-extrabold text-slate-900 dark:text-white mt-1 line-clamp-1">
                {item.proveedor || 'Beneficiario No Especificado'}
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-200/80 dark:bg-slate-800 hover:bg-slate-300 text-slate-700 dark:text-slate-300 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          
          {/* Main Concept Card */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Concepto del Gasto</span>
            <p className="text-sm font-medium text-slate-900 dark:text-slate-200 mt-1 leading-relaxed">
              {item.concepto || 'Sin concepto detallado'}
            </p>
          </div>

          {/* Amounts Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4.5 rounded-2xl bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-500/30">
              <span className="text-xs text-blue-800 dark:text-blue-300 font-bold uppercase">Importe Parcial (Ejercido)</span>
              <h4 className="text-2xl font-extrabold text-blue-900 dark:text-white mt-1">
                {formatCurrency(item.importe_parcial)}
              </h4>
            </div>
            <div className="p-4.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800">
              <span className="text-xs text-slate-500 font-bold uppercase">Importe Total</span>
              <h4 className="text-2xl font-extrabold text-slate-900 dark:text-slate-300 mt-1">
                {formatCurrency(item.importe_total)}
              </h4>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            
            <div className="space-y-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800">
              <h5 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5 border-b border-slate-200 dark:border-slate-800 pb-2">
                <Tag className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                Clasificación Presupuestal
              </h5>
              
              <div className="flex justify-between py-1 border-b border-slate-200/60 dark:border-slate-800/40">
                <span className="text-slate-500">Partida (PTDA):</span>
                <span className="font-mono font-bold text-blue-600 dark:text-blue-300">{item.ptda_code}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/60 dark:border-slate-800/40">
                <span className="text-slate-500">Descripción PTDA:</span>
                <span className="font-medium text-slate-900 dark:text-slate-200 text-right max-w-[60%]">{item.ptda_desc}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/60 dark:border-slate-800/40">
                <span className="text-slate-500">Programa (PP):</span>
                <span className="font-mono text-slate-800 dark:text-slate-200 font-bold">{item.pp || 'N/A'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/60 dark:border-slate-800/40">
                <span className="text-slate-500">Actividad:</span>
                <span className="font-mono text-slate-800 dark:text-slate-200">{item.actidad || 'N/A'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/60 dark:border-slate-800/40">
                <span className="text-slate-500">Código Área:</span>
                <span className="font-mono text-slate-800 dark:text-slate-200">{item.cod_area || 'N/A'}</span>
              </div>
            </div>

            <div className="space-y-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800">
              <h5 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5 border-b border-slate-200 dark:border-slate-800 pb-2">
                <FileText className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                Documentos & Dispersión
              </h5>

              <div className="flex justify-between py-1 border-b border-slate-200/60 dark:border-slate-800/40">
                <span className="text-slate-500">Fecha de Pago:</span>
                <span className="font-bold text-slate-900 dark:text-slate-200">{item.fecha_pago || 'Pendiente'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/60 dark:border-slate-800/40">
                <span className="text-slate-500">Mes Aplicación:</span>
                <span className="font-bold text-slate-900 dark:text-slate-200">{item.mes_aplic ? `Mes ${item.mes_aplic}` : 'N/A'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/60 dark:border-slate-800/40">
                <span className="text-slate-500">Contrato / Pedido:</span>
                <span className="font-mono text-indigo-600 dark:text-indigo-300 font-bold">{item.contrato || 'N/A'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/60 dark:border-slate-800/40">
                <span className="text-slate-500">Factura:</span>
                <span className="font-mono text-emerald-600 dark:text-emerald-300 font-bold">{item.factura || 'N/A'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/60 dark:border-slate-800/40">
                <span className="text-slate-500">Cuenta Bancaria:</span>
                <span className="font-medium text-slate-900 dark:text-slate-200">{item.cuenta_bancaria || 'N/A'}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Cheque / Dispersión:</span>
                <span className="font-mono text-slate-900 dark:text-slate-200">{item.cheque || 'N/A'}</span>
              </div>
            </div>

          </div>

          <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-500/30 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <ShieldCheck className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              <div>
                <h6 className="text-xs font-bold text-slate-900 dark:text-white">Registro Validado en Sistema</h6>
                <p className="text-[11px] text-emerald-800 dark:text-emerald-300/80">INPER Presupuesto - Sheet ID: 1SW5AkaJ_uTMt5zmeatFT5iIu2Yg7es5W</p>
              </div>
            </div>
            <span className="text-xs font-mono px-3 py-1 rounded-xl bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 shadow-xs">
              ID: {item.id}
            </span>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md transition-all"
          >
            Cerrar Detalles
          </button>
        </div>
      </div>
    </div>
  );
};
