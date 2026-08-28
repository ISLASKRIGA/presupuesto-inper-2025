import React, { useState } from 'react';
import { 
  ResponsiveContainer, 
  ComposedChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  PieChart, 
  Pie, 
  Cell,
  Area,
  Legend,
  BarChart,
  CartesianGrid,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ScatterChart,
  Scatter,
  ZAxis,
  Treemap
} from 'recharts';
import { BudgetItem, KPIStats, AC01Summary, AC01Record } from '../types/budget';
import {
  computeMonthlyBreakdown,
  computeTopPartidas,
  computeTopProveedores,
  computeCuentasBreakdown,
  isValidTransaction,
  formatCurrency,
  formatCompactCurrency
} from '../services/budgetService';
import { 
  TrendingUp, 
  PieChart as PieIcon, 
  BarChart2, 
  CreditCard, 
  Award, 
  Activity, 
  Layers, 
  Stethoscope, 
  ShieldCheck,
  Grid,
  Target,
  Share2,
  Sliders,
  Maximize2
} from 'lucide-react';

interface DashboardViewProps {
  items: BudgetItem[];
  kpis: KPIStats;
  ac01Summary?: AC01Summary;
  ac01Records?: AC01Record[];
}

export const DashboardView: React.FC<DashboardViewProps> = ({ items, kpis, ac01Summary, ac01Records = [] }) => {
  const [chartFilter, setChartFilter] = useState<'todas' | 'comparacion' | 'tiempo' | 'proporcion' | 'relaciones' | 'jerarquias'>('todas');

  const monthlyData = computeMonthlyBreakdown(items);
  const topPartidas = computeTopPartidas(items, 10);
  const topProveedores = computeTopProveedores(items, 10);
  const cuentasData = computeCuentasBreakdown(items);

  // 1. Dona / Proporciones de Capítulo — uses AC01 devengado oficial for all 3 caps (consistent source)
  const cap1000Dev = ac01Summary?.["1000"]?.dev ?? 906482936;
  const cap2000Dev = ac01Summary?.["2000"]?.dev ?? 76595744;
  const cap3000Dev = ac01Summary?.["3000"]?.dev ?? 329849243;
  const chapterPieData = [
    { name: 'Capítulo 1000 (Servicios Personales / Nómina)', value: cap1000Dev, color: '#3C0C1F' },
    { name: 'Capítulo 3000 (Servicios Generales e Infraestructura)', value: cap3000Dev, color: '#2563EB' },
    { name: 'Capítulo 2000 (Materiales y Suministros Médicos)', value: cap2000Dev, color: '#059669' }
  ];

  // 2. Original vs Modificado vs Devengado por Capítulo (desde AC01)
  const capComparativoData = ['1000', '2000', '3000'].map(c => ({
    cap: `Cap ${c}`,
    Original: ac01Summary?.[c]?.orig ?? 0,
    Modificado: ac01Summary?.[c]?.mod ?? 0,
    Devengado: ac01Summary?.[c]?.dev ?? 0,
  })).filter(d => d.Modificado > 0);

  // 3. Partida 35201 desde AC01 records reales
  const partida35201Records = ac01Records.filter(r => r.ptda_code === '35201');
  const partida35201Chart = partida35201Records.length > 0
    ? partida35201Records.map((r, i) => ({
        name: r.pp || `Registro ${i + 1}`,
        mod: r.monto_modificado,
        dev: r.monto_devengado,
      }))
    : [];

  // 4. Radar Chart: valores derivados del AC01
  const totalMod = ac01Summary?.total?.mod ?? 1;
  const totalDev = ac01Summary?.total?.dev ?? 0;
  const eficiencia = totalMod > 0 ? (totalDev / totalMod) * 100 : 0;
  const cap1000Pct = totalDev > 0 ? ((ac01Summary?.["1000"]?.dev ?? 0) / totalDev) * 100 : 0;
  const cap3000Ej = (ac01Summary?.["3000"]?.mod ?? 0) > 0
    ? ((ac01Summary?.["3000"]?.dev ?? 0) / (ac01Summary?.["3000"]?.mod ?? 1)) * 100 : 0;
  const cap2000Ej = (ac01Summary?.["2000"]?.mod ?? 0) > 0
    ? ((ac01Summary?.["2000"]?.dev ?? 0) / (ac01Summary?.["2000"]?.mod ?? 1)) * 100 : 0;
  const ptda35201Ej = partida35201Records.length > 0
    ? (partida35201Records.reduce((s, r) => s + r.monto_devengado, 0) /
       Math.max(partida35201Records.reduce((s, r) => s + r.monto_modificado, 0), 1)) * 100
    : 0;
  const radarData = [
    { subject: 'Eficiencia Ejercicio', A: Math.min(eficiencia, 100), fullMark: 100 },
    { subject: 'Peso Nómina (Cap 1000)', A: Math.min(cap1000Pct, 100), fullMark: 100 },
    { subject: 'Ejercicio Cap 3000', A: Math.min(cap3000Ej, 100), fullMark: 100 },
    { subject: 'Ejercicio Cap 2000', A: Math.min(cap2000Ej, 100), fullMark: 100 },
    { subject: 'Cumplimiento 35201', A: Math.min(ptda35201Ej, 100), fullMark: 100 },
    { subject: 'Cobertura Proveedores', A: Math.min(kpis.totalProveedores / 5, 100), fullMark: 100 },
  ];

  // 5. Top partidas por capítulo (desde records reales, separado por cap para obtener top 5 real por cada uno)
  const top5_3000 = computeTopPartidas(items.filter(i => i.capitulo_code === '3000'), 5);
  const top5_2000 = computeTopPartidas(items.filter(i => i.capitulo_code === '2000'), 5);
  const partidaCompData = [
    ...top5_3000.map(p => ({ label: p.code, cap3000: p.totalParcial, cap2000: 0 })),
    ...top5_2000.map(p => ({ label: p.code, cap3000: 0, cap2000: p.totalParcial })),
  ];

  // 6. Scatter: top 50 transacciones válidas (con proveedor y partida) ordenadas por monto
  const scatterData = [...items]
    .filter(isValidTransaction)
    .filter(i => i.proveedor?.trim() && i.ptda_code?.trim())
    .sort((a, b) => b.importe_parcial - a.importe_parcial)
    .slice(0, 50)
    .map((item, idx) => ({
      x: idx + 1,
      y: item.importe_parcial,
      z: item.importe_parcial > 5000000 ? 300 : 100,
      name: item.proveedor || item.concepto || `Op #${idx + 1}`
    }));

  // 7. Treemap: top partidas válidas por cap (ya filtradas por computeTopPartidas)
  const treemapData = [
    {
      name: 'Capítulo 1000 (Nómina)',
      children: [{ name: 'Servicios Personales', size: ac01Summary?.["1000"]?.dev ?? 0 }]
    },
    {
      name: 'Capítulo 3000',
      children: top5_3000
        .filter(p => p.code && p.code !== 'SIN_PARTIDA')
        .slice(0, 4)
        .map(p => ({ name: p.desc?.replace(/^\d+ - /, '').slice(0, 30) || p.code, size: p.totalParcial }))
    },
    {
      name: 'Capítulo 2000',
      children: top5_2000
        .filter(p => p.code && p.code !== 'SIN_PARTIDA')
        .slice(0, 4)
        .map(p => ({ name: p.desc?.replace(/^\d+ - /, '').slice(0, 30) || p.code, size: p.totalParcial }))
    }
  ].filter(g => g.children.length > 0 && g.children.some(c => c.size > 0));

  const customTooltipStyle = {
    backgroundColor: '#ffffff',
    borderColor: '#cbd5e1',
    borderRadius: '16px',
    color: '#0f172a',
    fontSize: '12px',
    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.05)',
    fontWeight: 'bold',
    padding: '10px 14px'
  };

  return (
    <div className="space-y-8 font-sans">
      
      {/* Dynamic Filter Header with Public Finance Categorization */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-[#3C0C1F]/10 dark:bg-amber-400/10 text-[#3C0C1F] dark:text-amber-300 border border-[#3C0C1F]/20 dark:border-amber-400/30">
              Panel Multidimensional de Analítica Presupuestal
            </span>
          </div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Activity className="w-5 h-5 text-[#3C0C1F] dark:text-amber-400" />
            Suite Completa de 12 Gráficas Financieras INPER 2025
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {items.filter(isValidTransaction).length.toLocaleString()} transacciones válidas · {items.length.toLocaleString()} registros totales del sheet
          </p>
        </div>

        {/* Dynamic Category Selector Buttons */}
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs font-bold w-full lg:w-auto">
          
          <button
            onClick={() => setChartFilter('todas')}
            className={`px-3.5 py-2 rounded-xl transition-all ${
              chartFilter === 'todas'
                ? 'bg-[#3C0C1F] text-amber-300 shadow-md border border-amber-400/30 font-black'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            🌐 Todas (12 Gráficas)
          </button>

          <button
            onClick={() => setChartFilter('comparacion')}
            className={`px-3.5 py-2 rounded-xl transition-all ${
              chartFilter === 'comparacion'
                ? 'bg-[#3C0C1F] text-amber-300 shadow-md border border-amber-400/30 font-black'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            📊 Comparar Categorías
          </button>

          <button
            onClick={() => setChartFilter('tiempo')}
            className={`px-3.5 py-2 rounded-xl transition-all ${
              chartFilter === 'tiempo'
                ? 'bg-[#3C0C1F] text-amber-300 shadow-md border border-amber-400/30 font-black'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            📈 Cambios en el Tiempo
          </button>

          <button
            onClick={() => setChartFilter('proporcion')}
            className={`px-3.5 py-2 rounded-xl transition-all ${
              chartFilter === 'proporcion'
                ? 'bg-[#3C0C1F] text-amber-300 shadow-md border border-amber-400/30 font-black'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            🍩 Proporciones
          </button>

          <button
            onClick={() => setChartFilter('relaciones')}
            className={`px-3.5 py-2 rounded-xl transition-all ${
              chartFilter === 'relaciones'
                ? 'bg-[#3C0C1F] text-amber-300 shadow-md border border-amber-400/30 font-black'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            🫧 Dispersión & Radar
          </button>

          <button
            onClick={() => setChartFilter('jerarquias')}
            className={`px-3.5 py-2 rounded-xl transition-all ${
              chartFilter === 'jerarquias'
                ? 'bg-[#3C0C1F] text-amber-300 shadow-md border border-amber-400/30 font-black'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            🔲 Jerarquía & Fuentes
          </button>

        </div>
      </div>

      {/* MEDIDOR / BULLET CHART: Meta de Eficiencia Presupuestal SHCP — valores del AC01 real */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <h3 className="text-sm font-black text-slate-900 dark:text-white">
              Medidor Bullet Chart: Eficiencia de Ejercicio Presupuestario frente a Meta SHCP ({eficiencia.toFixed(2)}%)
            </h3>
          </div>
          <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
            {formatCompactCurrency(ac01Summary?.total?.dev ?? 0)} / {formatCompactCurrency(ac01Summary?.total?.mod ?? 0)}
          </span>
        </div>

        <div className="w-full bg-slate-100 dark:bg-slate-800 h-6 rounded-full overflow-hidden relative p-1 border border-slate-200 dark:border-slate-700">
          <div
            className="h-full rounded-full bg-gradient-to-r from-emerald-600 via-teal-500 to-blue-600 transition-all duration-1000 shadow-xs"
            style={{ width: `${Math.min(eficiencia, 100)}%` }}
          ></div>
          <div className="absolute right-0 top-0 bottom-0 w-1 bg-rose-500 shadow-md" title="Meta SHCP 100%"></div>
        </div>
        <div className="flex justify-between text-[11px] font-bold text-slate-500">
          <span>0% (Inicio del Ejercicio)</span>
          <span className="text-emerald-600 dark:text-emerald-400 font-extrabold">{eficiencia.toFixed(2)}% Ejercido</span>
          <span>100% Meta SHCP ({formatCompactCurrency(ac01Summary?.total?.mod ?? 0)})</span>
        </div>
      </div>

      {/* GRÁFICA 1: Líneas & Áreas (Evolución Mensual) */}
      {(chartFilter === 'todas' || chartFilter === 'tiempo') && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-xs animate-fadeIn space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded-full border border-blue-200 dark:border-blue-800">
                  Analizar Cambios en el Tiempo (Líneas + Áreas + Columnas)
                </span>
              </div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2 mt-1">
                <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                Gráfica 1: Comportamiento y Flujo Mensual del Gasto (Capítulo 3000 vs Capítulo 2000)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Evolución de dispersiones contables por mes durante el ejercicio 2025</p>
            </div>
            <div className="flex items-center space-x-4 text-xs font-semibold">
              <span className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                <span className="w-3 h-3 rounded bg-blue-600 inline-block"></span>
                Cap 3000 (Servicios)
              </span>
              <span className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                <span className="w-3 h-3 rounded bg-emerald-500 inline-block"></span>
                Cap 2000 (Insumos)
              </span>
            </div>
          </div>

          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={monthlyData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="monthName" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis 
                  stroke="#64748b" 
                  fontSize={11} 
                  tickLine={false} 
                  tickFormatter={(v) => `$${(v / 1000000).toFixed(0)}M`} 
                />
                <Tooltip 
                  formatter={(value: any) => [formatCurrency(Number(value)), '']}
                  contentStyle={customTooltipStyle}
                />
                <Bar dataKey="cap3000" name="Capítulo 3000 (Servicios)" fill="#2563eb" radius={[6, 6, 0, 0]} />
                <Bar dataKey="cap2000" name="Capítulo 2000 (Medicinas)" fill="#10b981" radius={[6, 6, 0, 0]} />
                <Area type="monotone" dataKey="total" name="Total Dispersado" stroke="#f59e0b" fill="url(#areaGrad)" strokeWidth={3} />
                <defs>
                  <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                  </linearGradient>
                </defs>
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* GRID 1: Dona & Barras Horizontales */}
      {(chartFilter === 'todas' || chartFilter === 'proporcion' || chartFilter === 'comparacion') && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fadeIn">
          
          {/* GRÁFICA 2: Dona (Mostrar Proporciones) */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center space-x-2 mb-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-0.5 rounded-full border border-indigo-200 dark:border-indigo-800">
                  Mostrar Proporciones (Dona / Anillo)
                </span>
              </div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2 mb-1">
                <PieIcon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                Gráfica 2: Proporción del Gasto por Capítulo PEF
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">Porcentaje relativo asignado a Nómina, Servicios y Medicinas</p>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chapterPieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={65}
                      outerRadius={95}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {chapterPieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(val: any) => [formatCurrency(Number(val)), 'Importe']}
                      contentStyle={customTooltipStyle}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="space-y-2 pt-4 border-t border-slate-100 dark:border-slate-800">
              {chapterPieData.map((c, i) => (
                <div key={i} className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-2 font-medium text-slate-700 dark:text-slate-300">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: c.color }}></span>
                    {c.name}
                  </span>
                  <span className="font-extrabold text-slate-900 dark:text-white font-mono">
                    {formatCompactCurrency(c.value)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* GRÁFICA 3: Barras Horizontales (Comparar Categorías) */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-xs">
            <div className="flex items-center space-x-2 mb-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/30 px-2 py-0.5 rounded-full border border-purple-200 dark:border-purple-800">
                Comparar Categorías (Barras Horizontales)
              </span>
            </div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2 mb-1">
              <BarChart2 className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              Gráfica 3: Top 10 Partidas Presupuestales
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">Comparativa de concentración de recursos en partidas específicas</p>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topPartidas} layout="vertical" margin={{ top: 0, right: 20, left: 40, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                  <XAxis type="number" stroke="#64748b" fontSize={11} tickFormatter={(v) => `$${(v / 1000000).toFixed(0)}M`} />
                  <YAxis type="category" dataKey="code" stroke="#64748b" fontSize={11} tickLine={false} />
                  <Tooltip 
                    formatter={(val: any) => [formatCurrency(Number(val)), 'Total Dispersado']}
                    contentStyle={customTooltipStyle}
                  />
                  <Bar dataKey="totalParcial" name="Importe Parcial" fill="#8b5cf6" radius={[0, 8, 8, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>
      )}

      {/* GRID 2: Columnas Agrupadas & Barras Apiladas */}
      {(chartFilter === 'todas' || chartFilter === 'comparacion' || chartFilter === 'jerarquias') && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fadeIn">
          
          {/* GRÁFICA 4: Original vs Modificado vs Devengado (desde AC01 real) */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                  Columnas Agrupadas (AC01 Oficial)
                </span>
              </div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2 mt-1">
                <Layers className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                Gráfica 4: Original vs Modificado vs Devengado por Capítulo
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Techo presupuestal autorizado SHCP vs ejercicio real (Cuenta Pública AC01 2025)</p>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={capComparativoData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="cap" stroke="#64748b" fontSize={11} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={11} tickLine={false} tickFormatter={(v) => `$${(v / 1000000).toFixed(0)}M`} />
                  <Tooltip
                    formatter={(val: any) => [formatCurrency(Number(val)), '']}
                    contentStyle={customTooltipStyle}
                  />
                  <Legend />
                  <Bar dataKey="Original" name="Presupuesto Original" fill="#94a3b8" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="Modificado" name="Presupuesto Modificado (SHCP)" fill="#f59e0b" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="Devengado" name="Devengado Ejercido" fill="#10b981" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* GRÁFICA 5: Top Partidas Cap 3000 vs Cap 2000 (desde registros reales) */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/30 px-2 py-0.5 rounded-full border border-amber-200 dark:border-amber-800">
                  Comparativo por Partida (Registros Reales)
                </span>
              </div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2 mt-1">
                <Sliders className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                Gráfica 5: Top Partidas Cap 3000 vs Cap 2000
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Importe dispersado por partida específica (desde dispersiones operativas del sheet)</p>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={partidaCompData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="label" stroke="#64748b" fontSize={10} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={11} tickLine={false} tickFormatter={(v) => `$${(v / 1000000).toFixed(0)}M`} />
                  <Tooltip
                    formatter={(val: any) => [formatCurrency(Number(val)), '']}
                    contentStyle={customTooltipStyle}
                  />
                  <Legend />
                  <Bar dataKey="cap3000" name="Cap 3000 (Servicios)" fill="#2563eb" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="cap2000" name="Cap 2000 (Insumos)" fill="#059669" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>
      )}

      {/* GRID 3: Radar Chart & Scatter / Burbujas */}
      {(chartFilter === 'todas' || chartFilter === 'relaciones') && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fadeIn">
          
          {/* GRÁFICA 6: Radar Chart (Comparar Muchas Variables) */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center space-x-2 mb-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/30 px-2 py-0.5 rounded-full border border-rose-200 dark:border-rose-800">
                  Gráfica de Radar / Araña (Multivariable)
                </span>
              </div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2 mb-1">
                <Share2 className="w-5 h-5 text-rose-600 dark:text-rose-400" />
                Gráfica 6: Desempeño Multivariable de Gestión Hacendaria
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">Evaluación simultánea de 6 indicadores de desempeño presupuestal</p>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                    <PolarGrid stroke="#e2e8f0" />
                    <PolarAngleAxis dataKey="subject" stroke="#64748b" fontSize={10} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} fontSize={9} />
                    <Radar name="INPER 2025" dataKey="A" stroke="#e11d48" fill="#f43f5e" fillOpacity={0.5} />
                    <Tooltip contentStyle={customTooltipStyle} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* GRÁFICA 7: Scatter / Burbujas (Valores Extremos / Anomalias) */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center space-x-2 mb-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-900/30 px-2 py-0.5 rounded-full border border-cyan-200 dark:border-cyan-800">
                  Dispersión / Burbujas (Valores Atípicos)
                </span>
              </div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2 mb-1">
                <Maximize2 className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
                Gráfica 7: Auditoría de Pagos y Valores Atípicos (Scatter Plot)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">Detección visual de transacciones atípicas de alto impacto monetario</p>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart margin={{ top: 20, right: 20, bottom: 10, left: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis type="number" dataKey="x" name="No. Póliza / Cheque" stroke="#64748b" fontSize={11} />
                    <YAxis type="number" dataKey="y" name="Importe" stroke="#64748b" fontSize={11} tickFormatter={(v) => `$${(v / 1000000).toFixed(0)}M`} />
                    <ZAxis type="number" dataKey="z" range={[60, 400]} name="Monto Relativo" />
                    <Tooltip 
                      cursor={{ strokeDasharray: '3 3' }}
                      formatter={(val: any, name: any) => [name === 'Importe' ? formatCurrency(Number(val)) : val, name]}
                      contentStyle={customTooltipStyle}
                    />
                    <Scatter name="Operación Contable" data={scatterData} fill="#06b6d4" />
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* GRID 4: Jerarquía Treemap & Auditoría 35201 */}
      {(chartFilter === 'todas' || chartFilter === 'jerarquias' || chartFilter === 'comparacion') && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fadeIn">
          
          {/* GRÁFICA 8: Treemap Jerárquico (Jerarquías Presupuestales) */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center space-x-2 mb-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-900/30 px-2 py-0.5 rounded-full border border-violet-200 dark:border-violet-800">
                  Mostrar Jerarquías (Treemap de Bloques)
                </span>
              </div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2 mb-1">
                <Grid className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                Gráfica 8: Treemap Jerárquico de Capítulo → Subconcepto
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">Ponderación visual del gasto en bloques proporcionales al monto</p>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <Treemap
                    data={treemapData}
                    dataKey="size"
                    stroke="#ffffff"
                    fill="#6366f1"
                  >
                    <Tooltip 
                      formatter={(val: any) => [formatCurrency(Number(val)), 'Monto Asignado']}
                      contentStyle={customTooltipStyle}
                    />
                  </Treemap>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* GRÁFICA 9: Auditoría 35201 (Equipo Médico) */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-wider text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/30 px-2 py-0.5 rounded-full border border-rose-200 dark:border-rose-800">
                  Auditoría Médica y Electromedicina
                </span>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  100% Cumplido
                </span>
              </div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2 mt-1">
                <Stethoscope className="w-5 h-5 text-rose-600 dark:text-rose-400" />
                Gráfica 9: Auditoría Partida 35201 (Electromedicina)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Presupuesto Modificado ($1.80 M) vs Devengado por Programa</p>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={partida35201Chart} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={10} tickLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                  <Tooltip formatter={(val: any) => [formatCurrency(Number(val)), '']} contentStyle={customTooltipStyle} />
                  <Legend />
                  <Bar dataKey="mod" name="Presupuesto Modificado" fill="#f43f5e" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="dev" name="Presupuesto Devengado" fill="#06b6d4" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>
      )}

      {/* GRID 5: Ranking Proveedores & Cuentas Bancarias */}
      {(chartFilter === 'todas' || chartFilter === 'comparacion' || chartFilter === 'proporcion') && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fadeIn">
          
          {/* GRÁFICA 10: Ranking Proveedores (Pareto 80/20) */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-xs">
            <div className="flex items-center space-x-2 mb-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/30 px-2 py-0.5 rounded-full border border-amber-200 dark:border-amber-800">
                Dictamen LAASSP (Ranking Pareto)
              </span>
            </div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2 mb-1">
              <Award className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              Gráfica 10: Concentración de Adjudicaciones en Proveedores
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">Top 10 empresas adjudicadas por volumen total de facturación</p>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topProveedores} layout="vertical" margin={{ top: 0, right: 20, left: 60, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                  <XAxis type="number" stroke="#64748b" fontSize={11} tickFormatter={(v) => `$${(v / 1000000).toFixed(0)}M`} />
                  <YAxis type="category" dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} width={110} />
                  <Tooltip 
                    formatter={(val: any) => [formatCurrency(Number(val)), 'Total Acumulado']}
                    contentStyle={customTooltipStyle}
                  />
                  <Bar dataKey="totalParcial" name="Importe Acumulado" fill="#f59e0b" radius={[0, 8, 8, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* GRÁFICA 11: Cuentas Bancarias Autorizadas (Anillo TESOFE) */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center space-x-2 mb-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                  Tesorería de la Federación (TESOFE)
                </span>
              </div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2 mb-1">
                <CreditCard className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                Gráfica 11: Origen de Dispersión por Cuenta Bancaria
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">Proporción de pagos dispersados por cuenta autorizada</p>

              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={cuentasData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={4}
                      dataKey="total"
                      nameKey="name"
                    >
                      {cuentasData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b'][index % 4]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(val: any) => [formatCurrency(Number(val)), 'Monto Pagado']}
                      contentStyle={customTooltipStyle}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="space-y-2 pt-4 border-t border-slate-100 dark:border-slate-800">
              {cuentasData.map((c, i) => (
                <div key={i} className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-2 font-medium text-slate-700 dark:text-slate-300">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b'][i % 4] }}></span>
                    Cuenta: {c.name}
                  </span>
                  <span className="font-extrabold text-slate-900 dark:text-white font-mono">
                    {formatCompactCurrency(c.total)} ({c.count} operaciones)
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

    </div>
  );
};
