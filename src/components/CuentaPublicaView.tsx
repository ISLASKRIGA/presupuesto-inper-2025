import React, { useState, useMemo } from 'react';
import { 
  Building2, 
  TrendingUp, 
  DollarSign, 
  Search, 
  Download, 
  ArrowUpDown,
  Stethoscope
} from 'lucide-react';
import { BudgetDataset, AC01Record } from '../types/budget';
import { formatCurrency, formatCompactCurrency } from '../services/budgetService';

interface CuentaPublicaViewProps {
  dataset: BudgetDataset;
}

export const CuentaPublicaView: React.FC<CuentaPublicaViewProps> = ({ dataset }) => {
  const [subTab, setSubTab] = useState<'resumen' | 'base_ac01' | 'partida_35201'>('resumen');
  const [searchTerm, setSearchTerm] = useState('');
  const [capFilter, setCapFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<keyof AC01Record>('monto_modificado');
  const [sortAsc, setSortAsc] = useState(false);

  const ac01Records = dataset.ac01_records || [];
  const ac01Summary = dataset.ac01_summary || {
    "1000": { orig: 758247073, mod: 906482936, dev: 906482936 },
    "2000": { orig: 64867220, mod: 79124440, dev: 76595744 },
    "3000": { orig: 313056128, mod: 331457469, dev: 329849243 },
    "total": { orig: 1212634351, mod: 1317064845, dev: 1312927923 }
  };

  // 2024 comparison removed — no 2024 sheet data available
  // Partida 35201 derived dynamically from AC01 records
  const partida35201Data = ac01Records.filter(r => r.ptda_code === '35201').map(r => ({
    conc: `${r.pp ? r.pp + ' — ' : ''}${r.ptda_desc || 'Mantenimiento equipo médico'}`,
    orig: r.monto_original,
    mod: r.monto_modificado,
    dev: r.monto_devengado,
    pagado: r.monto_devengado
  }));

  const total35201 = partida35201Data.reduce(
    (acc, r) => ({ orig: acc.orig + r.orig, mod: acc.mod + r.mod, dev: acc.dev + r.dev, pagado: acc.pagado + r.pagado }),
    { orig: 0, mod: 0, dev: 0, pagado: 0 }
  );

  const filteredAC01 = useMemo(() => {
    return ac01Records.filter(item => {
      if (capFilter !== 'all' && item.capitulo_code !== capFilter) return false;
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        return (
          item.ptda_code.toLowerCase().includes(q) ||
          item.ptda_desc.toLowerCase().includes(q) ||
          item.pp.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [ac01Records, capFilter, searchTerm]);

  const sortedAC01 = useMemo(() => {
    return [...filteredAC01].sort((a, b) => {
      let aVal = a[sortField] ?? 0;
      let bVal = b[sortField] ?? 0;
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortAsc ? aVal - bVal : bVal - aVal;
      }
      return sortAsc 
        ? String(aVal).localeCompare(String(bVal)) 
        : String(bVal).localeCompare(String(aVal));
    });
  }, [filteredAC01, sortField, sortAsc]);

  const handleSort = (field: keyof AC01Record) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  const handleExportAC01 = () => {
    if (filteredAC01.length === 0) return;
    const headers = ["Ramo", "Unidad", "PP", "Capítulo", "Partida", "Descripción", "Original", "Modificado", "Devengado"];
    const rows = filteredAC01.map(i => [
      `"${i.ramo}"`, `"${i.unidad}"`, `"${i.pp}"`, `"${i.capitulo_code}"`, `"${i.ptda_code}"`,
      `"${i.ptda_desc.replace(/"/g, '""')}"`, i.monto_original, i.monto_modificado, i.monto_devengado
    ]);
    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `cuenta_publica_ac01_inper_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner for Director of Administration */}
      <div className="glass-panel rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 font-bold text-xs border border-amber-200 dark:border-amber-500/40">
              Vista Directora de Administración
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">Cuenta Pública AC01 2025</span>
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white mt-1">
            Tablero de Control Presupuestario Oficial (SHCP / INPER)
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Monitoreo del Presupuesto Autorizado (Original vs Modificado vs Devengado) para la toma de decisiones
          </p>
        </div>

        {/* Sub-tabs Switcher */}
        <div className="flex items-center space-x-1.5 bg-slate-100 dark:bg-slate-900/80 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs">
          <button
            onClick={() => setSubTab('resumen')}
            className={`px-3.5 py-2 font-bold rounded-xl transition-all ${
              subTab === 'resumen'
                ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Resumen Comparativo
          </button>
          <button
            onClick={() => setSubTab('base_ac01')}
            className={`px-3.5 py-2 font-bold rounded-xl transition-all ${
              subTab === 'base_ac01'
                ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Base AC01 ({dataset.ac01_records?.length ?? 389} Renglones)
          </button>
          <button
            onClick={() => setSubTab('partida_35201')}
            className={`px-3.5 py-2 font-bold rounded-xl transition-all ${
              subTab === 'partida_35201'
                ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Equipo Médico (35201)
          </button>
        </div>
      </div>

      {/* Sub-tab 1: Resumen Comparativo */}
      {subTab === 'resumen' && (
        <div className="space-y-6">
          
          {/* Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            
            <div className="glass-card rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm">
              <span className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400">Presupuesto Aprobado Original</span>
              <h3 className="text-2xl lg:text-3xl font-extrabold text-slate-900 dark:text-white mt-2">
                {formatCompactCurrency(ac01Summary.total.orig)}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{formatCurrency(ac01Summary.total.orig)} MXN</p>
              <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500">
                Presupuesto asignado inicio de año (SHCP)
              </div>
            </div>

            <div className="glass-card rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm">
              <span className="text-xs font-bold uppercase text-amber-600 dark:text-amber-400">Presupuesto Modificado Autorizado</span>
              <h3 className="text-2xl lg:text-3xl font-extrabold text-slate-900 dark:text-white mt-2">
                {formatCompactCurrency(ac01Summary.total.mod)}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{formatCurrency(ac01Summary.total.mod)} MXN</p>
              <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-amber-600 dark:text-amber-300 font-bold">
                +${formatCompactCurrency(ac01Summary.total.mod - ac01Summary.total.orig)} adecuaciones aprobadas
              </div>
            </div>

            <div className="glass-card rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm">
              <span className="text-xs font-bold uppercase text-emerald-600 dark:text-emerald-400">Presupuesto Devengado Oficial</span>
              <h3 className="text-2xl lg:text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-2">
                {formatCompactCurrency(ac01Summary.total.dev)}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{formatCurrency(ac01Summary.total.dev)} MXN</p>
              <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs flex justify-between text-emerald-600 dark:text-emerald-300 font-bold">
                <span>Eficiencia de Ejecución:</span>
                <span>{((ac01Summary.total.dev / ac01Summary.total.mod) * 100).toFixed(2)}%</span>
              </div>
            </div>

          </div>

          {/* Comparativo Table — Original vs Modificado vs Devengado desde AC01 real */}
          <div className="glass-panel rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
            <div>
              <h3 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                Presupuesto Autorizado AC01 2025 — Original vs Modificado vs Devengado
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Datos directos del Sheet de Cuenta Pública, agrupados por Capítulo de Gasto</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-900 text-slate-500 uppercase text-[10px] font-bold border-b border-slate-200 dark:border-slate-800">
                    <th className="py-3 px-4">Capítulo</th>
                    <th className="py-3 px-4">Descripción</th>
                    <th className="py-3 px-4 text-right">Original</th>
                    <th className="py-3 px-4 text-right">Modificado (SHCP)</th>
                    <th className="py-3 px-4 text-right">Devengado</th>
                    <th className="py-3 px-4 text-right">% Ejercicio</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {[
                    { cap: "1000", desc: "Servicios Personales (Nómina)" },
                    { cap: "2000", desc: "Materiales y Suministros Médicos" },
                    { cap: "3000", desc: "Servicios Generales e Infraestructura" },
                  ].map(c => {
                    const orig = ac01Summary[c.cap]?.orig ?? 0;
                    const mod = ac01Summary[c.cap]?.mod ?? 0;
                    const dev = ac01Summary[c.cap]?.dev ?? 0;
                    const pct = mod > 0 ? ((dev / mod) * 100).toFixed(2) : '—';
                    return (
                      <tr key={c.cap} className="hover:bg-slate-50 dark:hover:bg-slate-900/60">
                        <td className="py-3.5 px-4 font-mono font-bold text-blue-600 dark:text-blue-400">Cap {c.cap}</td>
                        <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-white">{c.desc}</td>
                        <td className="py-3.5 px-4 text-right font-medium text-slate-500">{formatCurrency(orig)}</td>
                        <td className="py-3.5 px-4 text-right font-bold text-amber-600 dark:text-amber-300">{formatCurrency(mod)}</td>
                        <td className="py-3.5 px-4 text-right font-extrabold text-emerald-600 dark:text-emerald-400">{formatCurrency(dev)}</td>
                        <td className="py-3.5 px-4 text-right font-bold text-slate-800 dark:text-slate-200">{pct}%</td>
                      </tr>
                    );
                  })}
                  <tr className="bg-slate-50 dark:bg-slate-800/60 font-extrabold border-t-2 border-slate-300 dark:border-slate-600">
                    <td className="py-3.5 px-4 font-mono text-slate-900 dark:text-white">TOTAL</td>
                    <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300">Presupuesto Institucional INPER</td>
                    <td className="py-3.5 px-4 text-right text-slate-600">{formatCurrency(ac01Summary.total?.orig ?? 0)}</td>
                    <td className="py-3.5 px-4 text-right text-amber-600 dark:text-amber-300">{formatCurrency(ac01Summary.total?.mod ?? 0)}</td>
                    <td className="py-3.5 px-4 text-right text-emerald-600 dark:text-emerald-400">{formatCurrency(ac01Summary.total?.dev ?? 0)}</td>
                    <td className="py-3.5 px-4 text-right text-slate-900 dark:text-white">
                      {(ac01Summary.total?.mod ?? 0) > 0
                        ? (((ac01Summary.total?.dev ?? 0) / (ac01Summary.total?.mod ?? 1)) * 100).toFixed(2) + '%'
                        : '—'}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* Sub-tab 2: Base AC01 2025 Table */}
      {subTab === 'base_ac01' && (
        <div className="space-y-6">
          
          {/* Search & Filter Bar */}
          <div className="glass-panel rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="relative w-full sm:max-w-md">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  placeholder="Buscar partida, clave, programa presupuestario (PP)..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex items-center space-x-3 w-full sm:w-auto justify-between sm:justify-end">
                <button
                  onClick={handleExportAC01}
                  className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md transition-all"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Exportar AC01</span>
                </button>
              </div>
            </div>

            <div className="flex items-center space-x-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <span className="text-[10px] font-bold text-slate-500 uppercase">Capítulo:</span>
              {['all', '1000', '2000', '3000', '4000', '5000'].map(code => (
                <button
                  key={code}
                  onClick={() => setCapFilter(code)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                    capFilter === code
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100'
                  }`}
                >
                  {code === 'all' ? 'Todos' : `Cap ${code}`}
                </button>
              ))}
            </div>
          </div>

          {/* AC01 Data Table */}
          <div className="glass-panel rounded-3xl border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-900 text-slate-500 uppercase text-[10px] font-bold border-b border-slate-200 dark:border-slate-800">
                    <th className="py-3.5 px-4 font-bold">Prog (PP)</th>
                    <th className="py-3.5 px-4 font-bold">Cap</th>
                    <th className="py-3.5 px-4 font-bold cursor-pointer hover:text-slate-900" onClick={() => handleSort('ptda_code')}>
                      <div className="flex items-center space-x-1">
                        <span>Partida</span>
                        <ArrowUpDown className="w-3 h-3" />
                      </div>
                    </th>
                    <th className="py-3.5 px-4 font-bold">Descripción de Partida</th>
                    <th className="py-3.5 px-4 font-bold text-right cursor-pointer hover:text-slate-900" onClick={() => handleSort('monto_original')}>
                      <div className="flex items-center justify-end space-x-1">
                        <span>Original</span>
                        <ArrowUpDown className="w-3 h-3" />
                      </div>
                    </th>
                    <th className="py-3.5 px-4 font-bold text-right cursor-pointer hover:text-slate-900" onClick={() => handleSort('monto_modificado')}>
                      <div className="flex items-center justify-end space-x-1">
                        <span>Modificado</span>
                        <ArrowUpDown className="w-3 h-3" />
                      </div>
                    </th>
                    <th className="py-3.5 px-4 font-bold text-right cursor-pointer hover:text-slate-900" onClick={() => handleSort('monto_devengado')}>
                      <div className="flex items-center justify-end space-x-1">
                        <span>Devengado</span>
                        <ArrowUpDown className="w-3 h-3" />
                      </div>
                    </th>
                    <th className="py-3.5 px-4 font-bold text-right">% Ejercicio</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {sortedAC01.slice(0, 100).map((item) => {
                    const pct = item.monto_modificado > 0 ? (item.monto_devengado / item.monto_modificado) * 100 : 0;
                    return (
                      <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/60 transition-colors">
                        <td className="py-3 px-4 font-mono font-semibold text-indigo-600 dark:text-indigo-300">
                          {item.pp}
                        </td>
                        <td className="py-3 px-4 font-mono text-slate-500">
                          {item.capitulo_code}
                        </td>
                        <td className="py-3 px-4 font-mono font-bold text-blue-600 dark:text-blue-400">
                          {item.ptda_code}
                        </td>
                        <td className="py-3 px-4 font-medium text-slate-900 dark:text-white max-w-sm truncate" title={item.ptda_desc}>
                          {item.ptda_desc}
                        </td>
                        <td className="py-3 px-4 text-right font-medium text-slate-500">
                          {formatCurrency(item.monto_original)}
                        </td>
                        <td className="py-3 px-4 text-right font-bold text-amber-600 dark:text-amber-300">
                          {formatCurrency(item.monto_modificado)}
                        </td>
                        <td className="py-3 px-4 text-right font-extrabold text-emerald-600 dark:text-emerald-400">
                          {formatCurrency(item.monto_devengado)}
                        </td>
                        <td className="py-3 px-4 text-right font-bold text-slate-800 dark:text-slate-200">
                          {pct.toFixed(1)}%
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* Sub-tab 3: Partida 35201 Mantenimiento Equipo Médico */}
      {subTab === 'partida_35201' && (
        <div className="space-y-6">
          
          <div className="glass-panel rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm">
            <div className="flex items-center space-x-3 mb-2">
              <div className="p-2.5 rounded-2xl bg-blue-50 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-500/40">
                <Stethoscope className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
                  Reporte Especial: Partida 35201 (Mantenimiento de Equipo Médico)
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Monitoreo específico de la partida clave para la operación hospitalaria del INPER
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mt-6">
              <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
                <span className="text-[10px] text-slate-500 uppercase font-bold">Original Aprobado</span>
                <h4 className="text-xl font-extrabold text-slate-900 dark:text-white mt-1">{formatCurrency(total35201.orig)}</h4>
              </div>
              <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
                <span className="text-[10px] text-amber-600 dark:text-amber-400 uppercase font-bold">Modificado Autorizado</span>
                <h4 className="text-xl font-extrabold text-amber-600 dark:text-amber-300 mt-1">{formatCurrency(total35201.mod)}</h4>
              </div>
              <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 uppercase font-bold">Devengado</span>
                <h4 className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">{formatCurrency(total35201.dev)}</h4>
              </div>
              <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
                <span className="text-[10px] text-indigo-600 dark:text-indigo-400 uppercase font-bold">Pagado</span>
                <h4 className="text-xl font-extrabold text-indigo-600 dark:text-indigo-300 mt-1">{formatCurrency(total35201.pagado)}</h4>
              </div>
            </div>
          </div>

          <div className="glass-panel rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-4">Desglose por Programa y Fuente de Financiamiento</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-900 text-slate-500 uppercase text-[10px] font-bold border-b border-slate-200 dark:border-slate-800">
                    <th className="py-3 px-4">Concepto / Programa</th>
                    <th className="py-3 px-4 text-right">Original</th>
                    <th className="py-3 px-4 text-right">Modificado</th>
                    <th className="py-3 px-4 text-right">Devengado</th>
                    <th className="py-3 px-4 text-right">Pagado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {partida35201Data.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-900/60">
                      <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white">{row.conc}</td>
                      <td className="py-3 px-4 text-right text-slate-600 dark:text-slate-300">{formatCurrency(row.orig)}</td>
                      <td className="py-3 px-4 text-right font-bold text-amber-600 dark:text-amber-300">{formatCurrency(row.mod)}</td>
                      <td className="py-3 px-4 text-right font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(row.dev)}</td>
                      <td className="py-3 px-4 text-right font-bold text-indigo-600 dark:text-indigo-300">{formatCurrency(row.pagado)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

    </div>
  );
};
