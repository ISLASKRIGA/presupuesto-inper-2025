import React, { useEffect, useRef } from 'react';
import { Settings, ShieldCheck, Key, ExternalLink, RefreshCw, Database, CheckCircle2, AlertCircle, Terminal } from 'lucide-react';
import { BudgetMetadata } from '../types/budget';

interface SyncViewProps {
  metadata: BudgetMetadata;
  isSyncing: boolean;
  syncLogs: string[];
  onRefresh: () => void;
}

export const SyncView: React.FC<SyncViewProps> = ({ metadata, isSyncing, syncLogs, onRefresh }) => {
  const logsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [syncLogs]);

  const sheetsList = metadata.sheets?.length ? metadata.sheets : [
    {
      id: "1SW5AkaJ_uTMt5zmeatFT5iIu2Yg7es5W",
      name: "Erogaciones & Pagos Operativos (Cap. 2000 y 3000)",
      records_count: metadata.total_records || 0
    },
    {
      id: "1SgtkWFKfGcjv-9pWIezz1nkQbRZ8y-DY",
      name: "Presupuesto Oficial Autorizado AC01 2025 (SHCP / Cuenta Pública)",
      records_count: metadata.total_ac01_records || 0
    }
  ];

  const lastLog = syncLogs[syncLogs.length - 1] || '';
  const isDone = !isSyncing && syncLogs.length > 0;
  const isSuccess = isDone && syncLogs.some(l => l.includes('✅'));

  return (
    <div className="space-y-6 max-w-4xl mx-auto">

      {/* Header */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <h2 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
          <Settings className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          Sincronización en Vivo — Google Sheets → Dashboard
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Lee directamente de los sheets oficiales via Service Account y actualiza todos los dashboards.
          Última actualización: <span className="font-mono font-bold text-slate-700 dark:text-slate-200">{metadata.generated_at ? new Date(metadata.generated_at).toLocaleString('es-MX') : 'Nunca'}</span>
        </p>
      </div>

      {/* Security Badge */}
      <div className="p-5 rounded-3xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-500/40 flex items-start space-x-4">
        <div className="p-2.5 rounded-2xl bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <div>
          <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            Credenciales Protegidas
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-200 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300 text-[10px] font-bold border border-emerald-300">
              .gitignore 🔒
            </span>
          </h4>
          <p className="text-xs text-emerald-900 dark:text-emerald-200/80 mt-1">
            <code className="bg-white dark:bg-slate-900 px-1.5 py-0.5 rounded border border-emerald-300 font-mono text-emerald-800 dark:text-emerald-300">service_account.json</code> protegido localmente. Nunca se sube a git.
          </p>
        </div>
      </div>

      {/* Google Sheets Sources */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
          <Database className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          Orígenes de Datos (Google Sheets Oficiales)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sheetsList.map((sheet, idx) => (
            <div key={sheet.id} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300 border border-blue-200 dark:border-blue-500/30">
                  Hoja #{idx + 1}
                </span>
                <span className="text-xs font-mono font-extrabold text-emerald-600 dark:text-emerald-400">
                  {sheet.records_count.toLocaleString()} registros
                </span>
              </div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white leading-snug">{sheet.name}</h4>
              <p className="text-[10px] font-mono text-slate-400 truncate">ID: {sheet.id}</p>
              <a
                href={`https://docs.google.com/spreadsheets/d/${sheet.id}/edit`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-1.5 text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 font-bold"
              >
                <ExternalLink className="w-3 h-3" />
                <span>Abrir en Google Sheets</span>
              </a>
            </div>
          ))}
        </div>
      </div>

      {/* Service Account */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Key className="w-4 h-4 text-amber-500" />
          Service Account Configurada
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <span className="text-slate-500 font-semibold block">Client Email:</span>
            <span className="font-mono text-amber-700 dark:text-amber-300 font-bold block mt-0.5 break-all">
              {metadata.service_account}
            </span>
          </div>
          <div>
            <span className="text-slate-500 font-semibold block">GCP Project:</span>
            <span className="font-mono text-slate-900 dark:text-slate-200 font-bold block mt-0.5">presupuesto-506721</span>
          </div>
        </div>
      </div>

      {/* Sync Terminal */}
      {syncLogs.length > 0 && (
        <div className="bg-slate-950 rounded-3xl p-5 border border-slate-700 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-300 flex items-center gap-2">
              <Terminal className="w-4 h-4 text-green-400" />
              Log de Sincronización
            </h4>
            {isDone && (
              <span className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full ${isSuccess ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : 'bg-rose-500/20 text-rose-400 border border-rose-500/40'}`}>
                {isSuccess ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
                {isSuccess ? 'Sync exitoso' : 'Error en sync'}
              </span>
            )}
          </div>
          <div className="bg-slate-900 rounded-2xl p-4 max-h-64 overflow-y-auto space-y-1 font-mono text-xs">
            {syncLogs.map((log, i) => (
              <div key={i} className={`leading-relaxed ${log.includes('ERROR') || log.includes('❌') ? 'text-rose-400' : log.includes('✅') ? 'text-emerald-400' : 'text-slate-300'}`}>
                <span className="text-slate-600 select-none">{'> '}</span>{log}
              </div>
            ))}
            {isSyncing && (
              <div className="text-amber-400 animate-pulse">
                <span className="text-slate-600 select-none">{'> '}</span>
                <span className="inline-block w-2 h-3 bg-amber-400 align-middle animate-blink" />
              </div>
            )}
            <div ref={logsEndRef} />
          </div>
        </div>
      )}

      {/* Prerequisite reminder */}
      <div className="p-5 rounded-3xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-700/40 text-xs space-y-1.5">
        <p className="font-bold text-amber-800 dark:text-amber-300">Requisito previo: Google Sheets API habilitada en GCP</p>
        <p className="text-amber-700 dark:text-amber-400">
          Si es la primera vez, activa la API en:{' '}
          <a
            href="https://console.developers.google.com/apis/api/sheets.googleapis.com/overview?project=presupuesto-506721"
            target="_blank" rel="noopener noreferrer"
            className="underline font-semibold hover:text-amber-900"
          >
            console.developers.google.com → Sheets API → Habilitar
          </a>
          {' '}y espera 2 minutos.
        </p>
      </div>

      {/* Sync Button */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h4 className="text-sm font-bold text-slate-900 dark:text-white">Sincronizar Datos desde Sheets</h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Lee los sheets en vivo via Service Account y recarga todos los dashboards con datos frescos.
          </p>
        </div>
        <button
          onClick={onRefresh}
          disabled={isSyncing}
          className="flex items-center space-x-2 px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-bold text-sm shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
        >
          <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
          <span>{isSyncing ? 'Sincronizando...' : 'Sincronizar Ahora'}</span>
        </button>
      </div>

    </div>
  );
};
