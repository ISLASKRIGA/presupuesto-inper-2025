import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { ExecutiveHeader } from './components/ExecutiveHeader';
import { KPICards } from './components/KPICards';
import { DashboardView } from './components/DashboardView';
import { CuentaPublicaView } from './components/CuentaPublicaView';
import { DataTable } from './components/DataTable';
import { ProveedoresView } from './components/ProveedoresView';
import { PartidasView } from './components/PartidasView';
import { DetailModal } from './components/DetailModal';
import { SyncView } from './components/SyncView';
import { ChatWidget } from './components/ChatWidget';
import { BudgetItem, BudgetDataset } from './types/budget';
import { fetchBudgetData, computeKPIs, formatCurrency } from './services/budgetService';
import { Loader2, AlertCircle, Wallet, RefreshCw } from 'lucide-react';

export function App() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [dataset, setDataset] = useState<BudgetDataset | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<BudgetItem | null>(null);
  const [darkMode, setDarkMode] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncLogs, setSyncLogs] = useState<string[]>([]);

  // Sync dark class on html root element
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Load budget dataset on mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setErrorMsg(null);
      const data = await fetchBudgetData();
      setDataset(data);
    } catch (err: any) {
      console.error("Error loading budget data:", err);
      setErrorMsg(err.message || "Error al cargar los datos presupuestales.");
    } finally {
      setLoading(false);
    }
  };

  const handleSync = () => {
    if (isSyncing) return;
    setIsSyncing(true);
    setSyncLogs(['Conectando con Google Sheets...']);

    const es = new EventSource('/api/sync');

    // EventSource only supports GET; use fetch for POST + ReadableStream instead
    es.close();

    fetch('/api/sync', { method: 'POST' }).then(res => {
      if (!res.body) return;
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      const pump = (): Promise<void> => reader.read().then(({ done, value }) => {
        if (done) return;
        buffer += decoder.decode(value, { stream: true });
        const parts = buffer.split('\n\n');
        buffer = parts.pop() || '';
        parts.forEach(part => {
          const line = part.replace(/^data: /, '').trim();
          if (!line) return;
          try {
            const parsed = JSON.parse(line);
            if (parsed.msg) setSyncLogs(prev => [...prev, parsed.msg]);
            if (parsed.done) {
              setIsSyncing(false);
              if (parsed.success) {
                setTimeout(() => loadData(), 500);
              }
            }
          } catch {
            if (line) setSyncLogs(prev => [...prev, line]);
          }
        });
        return pump();
      });

      pump().catch(() => setIsSyncing(false));
    }).catch(err => {
      setSyncLogs(prev => [...prev, `Error de conexión: ${err.message}`]);
      setIsSyncing(false);
    });
  };

  const kpis = computeKPIs(dataset?.records || []);
  const totalPresupuestoTecho = dataset?.ac01_summary?.total?.mod || 1317064845;

  // Fallback dataset for instant rendering
  const activeDataset: BudgetDataset = dataset || {
    ac01_summary: {
      "1000": { orig: 758247073, mod: 906482936, dev: 906482936 },
      "2000": { orig: 64867220, mod: 79124440, dev: 76595744 },
      "3000": { orig: 313056128, mod: 331457469, dev: 329849243 },
      "total": { orig: 1212634351, mod: 1317064845, dev: 1312927923 }
    },
    ac01_records: [],
    records: [],
    metadata: {
      title: "Presupuesto INPER 2025",
      generated_at: "",
      total_records: 3637,
      total_ac01_records: 389,
      sheets: [],
      service_account: "visualizador@presupuesto-506721.iam.gserviceaccount.com"
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col lg:flex-row font-sans transition-colors duration-300">
      
      {/* Left Pill Floating Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        metadata={activeDataset.metadata}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
      />

      {/* Main Right Content Panel */}
      <main className="flex-1 p-4 lg:p-8 overflow-y-auto space-y-6">
        
        {/* Top Header Bar matching Reference Layout */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200/80 dark:border-slate-800">
          <div>
            <h1 className="text-2xl lg:text-3xl font-black text-slate-900 dark:text-white tracking-tight uppercase">
              DIRECCIÓN DE ADMINISTRACIÓN Y FINANZAS
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider mt-0.5">
              INSTITUTO NACIONAL DE PERINATOLOGÍA (INPER) — PRESUPUESTO OFICIAL 2025
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap justify-end">
            {/* Sync Button — always visible */}
            <button
              onClick={handleSync}
              disabled={isSyncing}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white text-xs font-bold shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed border border-blue-500"
              title="Sincronizar datos desde Google Sheets"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Sincronizando...' : 'Sincronizar Sheets'}</span>
            </button>

            {/* Top Right Floating Value Pill */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-3.5 px-5 border border-slate-200 dark:border-slate-800 shadow-md flex items-center space-x-3">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 block text-right">VALOR PRESUPUESTAL SHCP</span>
                <span className="text-xl font-black text-emerald-600 dark:text-emerald-400 font-mono block text-right">
                  {formatCurrency(totalPresupuestoTecho)}
                </span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-200 dark:border-emerald-500/30">
                <Wallet className="w-5 h-5" />
              </div>
            </div>
          </div>
        </div>

        {/* Sync Progress Banner */}
        {(isSyncing || (syncLogs.length > 0 && syncLogs[syncLogs.length - 1]?.includes('exitoso'))) && (
          <div className={`rounded-2xl px-4 py-3 text-xs flex items-center gap-3 border ${
            isSyncing
              ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-700/50 text-blue-800 dark:text-blue-300'
              : 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-700/50 text-emerald-800 dark:text-emerald-300'
          }`}>
            <RefreshCw className={`w-4 h-4 flex-shrink-0 ${isSyncing ? 'animate-spin text-blue-500' : 'text-emerald-500'}`} />
            <span className="font-mono font-semibold">
              {syncLogs[syncLogs.length - 1] || 'Conectando con Google Sheets...'}
            </span>
          </div>
        )}

        {/* Error Notification Banner */}
        {errorMsg && (
          <div className="bg-rose-500/10 border border-rose-500/30 rounded-2xl p-4 text-xs text-rose-700 dark:text-rose-300 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <AlertCircle className="w-5 h-5 text-rose-500 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
            <button 
              onClick={loadData}
              className="px-3 py-1.5 rounded-xl bg-rose-600 text-white font-bold hover:bg-rose-700 transition-all"
            >
              Reintentar
            </button>
          </div>
        )}

        {/* Loading State Overlay if initial fetch */}
        {loading && !dataset && (
          <div className="flex flex-col items-center justify-center p-12 space-y-3 bg-white/50 dark:bg-slate-900/50 rounded-3xl border border-slate-200/50 dark:border-slate-800">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            <p className="text-xs font-bold text-slate-600 dark:text-slate-300">Cargando base de datos oficial del INPER 2025...</p>
          </div>
        )}

        {/* Tab 1: Dashboard View */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <ExecutiveHeader
              totalModificado={totalPresupuestoTecho}
              totalDevengado={activeDataset.ac01_summary?.total?.dev || 1312927923}
              cap1000={activeDataset.ac01_summary?.["1000"]?.dev || 906482936}
              cap2000={activeDataset.ac01_summary?.["2000"]?.dev || 76595744}
              cap3000={activeDataset.ac01_summary?.["3000"]?.dev || 329849243}
              totalOperaciones={activeDataset.records?.length || 3637}
            />
            <KPICards kpis={kpis} totalRecords={activeDataset.records?.length || 0} />
            <DashboardView items={activeDataset.records || []} kpis={kpis} ac01Summary={activeDataset.ac01_summary} ac01Records={activeDataset.ac01_records || []} />
          </div>
        )}

        {/* Tab 2: Cuenta Pública AC01 View */}
        {activeTab === 'cuenta_publica' && (
          <CuentaPublicaView dataset={activeDataset} />
        )}

        {/* Tab 3: Operaciones Table View */}
        {activeTab === 'table' && (
          <DataTable 
            items={activeDataset.records || []} 
            onSelectItem={(item) => setSelectedItem(item)} 
          />
        )}

        {/* Tab 4: Proveedores Directory View */}
        {activeTab === 'proveedores' && (
          <ProveedoresView 
            items={activeDataset.records || []} 
            onSelectVendor={() => {
              setActiveTab('table');
            }} 
          />
        )}

        {/* Tab 5: Partidas Presupuestales View */}
        {activeTab === 'partidas' && (
          <PartidasView
            items={activeDataset.records || []}
            onSelectPartida={() => {
              setActiveTab('table');
            }}
          />
        )}

        {/* Tab 6: Sincronización Google Sheets */}
        {activeTab === 'sync' && (
          <SyncView
            metadata={activeDataset.metadata}
            isSyncing={isSyncing}
            syncLogs={syncLogs}
            onRefresh={handleSync}
          />
        )}

      </main>

      {/* Row Detail Drawer Modal */}
      <DetailModal 
        item={selectedItem} 
        onClose={() => setSelectedItem(null)} 
      />

      {/* Floating Bottom-Right Chatbot Widget with 7 Rotating API Keys */}
      <ChatWidget dataset={activeDataset} />

    </div>
  );
}
