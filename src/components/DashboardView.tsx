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
  CartesianGrid
} from 'recharts';
import { BudgetItem, KPIStats } from '../types/budget';
import { 
  computeMonthlyBreakdown, 
  computeTopPartidas, 
  computeTopProveedores, 
  computeCuentasBreakdown, 
  formatCurrency, 
  formatCompactCurrency 
} from '../services/budgetService';
import { TrendingUp, PieChart as PieIcon, BarChart2, CreditCard, Award, Activity, Layers, Stethoscope } from 'lucide-react';

interface DashboardViewProps {
  items: BudgetItem[];
  kpis: KPIStats;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ items, kpis }) => {
  const [chartMode, setChartMode] = useState<'mensual' | 'capitulos' | 'proveedores'>('mensual');

  const monthlyData = computeMonthlyBreakdown(items);
  const topPartidas = computeTopPartidas(items, 8);
  const topProveedores = computeTopProveedores(items, 8);
  const cuentasData = computeCuentasBreakdown(items);

  // Capítulo 1000 ($906.48 M), Capítulo 3000 ($329.85 M), Capítulo 2000 ($76.60 M)
  const chapterPieData = [
    { name: 'Capítulo 1000 (Sueldos y Nómina)', value: 906482936, color: '#007AFF' },
    { name: 'Capítulo 3000 (Servicios Generales)', value: kpis.cap3000Parcial, color: '#5856D6' },
    { name: 'Capítulo 2000 (Medicinas y Materiales)', value: kpis.cap2000Parcial, color: '#34C759' }
  ];

  const cap2024vs2025 = [
    { cap: 'Cap 1000 (Sueldos)', y2024: 855934344, y2025: 906482936 },
    { cap: 'Cap 2000 (Medicinas)', y2024: 164480532, y2025: 76595744 },
    { cap: 'Cap 3000 (Servicios)', y2024: 400856497, y2025: 329849243 },
  ];

  const partida35201Chart = [
    { name: 'Act 18 (Prog E23)', mod: 885859, dev: 885859 },
    { name: 'Act 2 (Prog M1)', mod: 147292, dev: 147292 },
    { name: 'Act 24 (Prog E22)', mod: 716783, dev: 716783 },
    { name: 'Fte Financiera 4', mod: 52000, dev: 7150 },
  ];

  const totalModificadoCalculado = 1317064845;

  return (
    <div className="space-y-8">
      
      {/* Chart Section Header */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            Panel Integrado de Gráficas Financieras INPER
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Análisis multidimensional del presupuesto (Tendencias, Composición, Comparativos y Proveedores)
          </p>
        </div>

        {/* Dynamic View Selector */}
        <div className="flex items-center space-x-1.5 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs font-bold">
          <button
            onClick={() => setChartMode('mensual')}
            className={`px-3.5 py-1.5 rounded-xl transition-all ${
              chartMode === 'mensual'
                ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            📈 Tendencia Mensual
          </button>
          <button
            onClick={() => setChartMode('capitulos')}
            className={`px-3.5 py-1.5 rounded-xl transition-all ${
              chartMode === 'capitulos'
                ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            📊 Comparativo 2024 vs 2025
          </button>
          <button
            onClick={() => setChartMode('proveedores')}
            className={`px-3.5 py-1.5 rounded-xl transition-all ${
              chartMode === 'proveedores'
                ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            🏆 Ranking Proveedores
          </button>
        </div>
      </div>

      {/* Gráfica 1: Comportamiento Mensual del Presupuesto (Enero - Diciembre) */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
          <div>
            <h3 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              Gráfica 1: Ejercicio Presupuestal Mensual (Capítulo 3000 vs Capítulo 2000)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Distribución de dispersiones mes a mes en el año fiscal</p>
          </div>
          <div className="flex items-center space-x-4 text-xs font-semibold">
            <span className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
              <span className="w-3 h-3 rounded bg-blue-600 inline-block"></span>
              Cap 3000 (Servicios)
            </span>
            <span className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
              <span className="w-3 h-3 rounded bg-emerald-500 inline-block"></span>
              Cap 2000 (Medicinas)
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
                tickFormatter={(val) => formatCompactCurrency(val)} 
                tickLine={false}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#ffffff', 
                  borderColor: '#cbd5e1', 
                  borderRadius: '16px',
                  color: '#0f172a',
                  fontSize: '12px',
                  boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)'
                }}
                formatter={(val: any) => [formatCurrency(Number(val)), '']}
              />
              <Bar dataKey="cap3000" name="Servicios Generales (3000)" fill="#007AFF" radius={[4, 4, 0, 0]} stackId="a" />
              <Bar dataKey="cap2000" name="Materiales y Medicinas (2000)" fill="#34C759" radius={[4, 4, 0, 0]} stackId="a" />
              <Area type="monotone" dataKey="total" stroke="#ff9500" strokeWidth={2.5} fill="transparent" name="Total Mes" />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Grid Row 2: Gráfica 2 (Donut Capítulo) & Gráfica 3 (Top Partidas) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Gráfica 2: Donut Chart por Capítulo */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2 mb-1">
              <PieIcon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              Gráfica 2: Estructura del Gasto Público por Capítulo
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">Proporción del presupuesto oficial INPER ($1,317 M)</p>
          </div>

          <div className="h-64 w-full relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chapterPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={95}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {chapterPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#ffffff', 
                    borderColor: '#cbd5e1', 
                    borderRadius: '16px',
                    fontSize: '12px',
                    boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)'
                  }}
                  formatter={(val: any) => [formatCurrency(Number(val)), '']}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-[11px] text-slate-500 font-semibold uppercase">Techo Modificado</span>
              <span className="text-base font-black text-slate-900 dark:text-white">{formatCompactCurrency(totalModificadoCalculado)}</span>
            </div>
          </div>

          <div className="space-y-2 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs">
            {chapterPieData.map((item, idx) => {
              const pct = (item.value / totalModificadoCalculado) * 100;
              return (
                <div key={idx} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></span>
                    <span className="text-slate-700 dark:text-slate-300 font-bold">{item.name.split(' ')[0]} {item.name.split(' ')[1]}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-extrabold text-slate-900 dark:text-white">{formatCompactCurrency(item.value)}</span>
                    <span className="text-slate-500 ml-1 font-mono">({pct.toFixed(1)}%)</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Gráfica 3: Top Partidas Presupuestales */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <BarChart2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                Gráfica 3: Top Partidas Presupuestales de Mayor Importe
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Ranking por volumen de gasto asignado</p>
            </div>
          </div>

          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart layout="vertical" data={topPartidas} margin={{ top: 0, right: 20, left: 40, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" stroke="#64748b" fontSize={11} tickFormatter={(v) => formatCompactCurrency(v)} />
                <YAxis dataKey="code" type="category" stroke="#64748b" fontSize={11} width={50} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '16px', fontSize: '12px' }}
                  formatter={(val: any) => [formatCurrency(Number(val)), 'Importe Parcial']}
                />
                <Bar dataKey="totalParcial" fill="#007AFF" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Grid Row 3: Gráfica 4 (Comparativo 2024 vs 2025) & Gráfica 5 (Partida 35201 Equipo Médico) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Gráfica 4: Comparativo 2024 vs 2025 */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="mb-6">
            <h3 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              Gráfica 4: Comparativo Presupuestal Anual (2024 vs 2025)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Variación por capítulo de gasto</p>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={cap2024vs2025} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="cap" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} tickFormatter={(v) => formatCompactCurrency(v)} />
                <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderRadius: '16px', fontSize: '12px' }} />
                <Legend />
                <Bar dataKey="y2024" name="Cuenta Pública 2024" fill="#94a3b8" radius={[4, 4, 0, 0]} />
                <Bar dataKey="y2025" name="Cuenta Pública 2025" fill="#007AFF" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gráfica 5: Partida 35201 Mantenimiento Equipo Médico */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="mb-6">
            <h3 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <Stethoscope className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              Gráfica 5: Monitoreo Especial Partida 35201 (Mantenimiento Equipo Médico)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Presupuesto Modificado vs Devengado por programa hospitalario</p>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={partida35201Chart} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} tickFormatter={(v) => formatCompactCurrency(v)} />
                <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderRadius: '16px', fontSize: '12px' }} />
                <Legend />
                <Bar dataKey="mod" name="Modificado Autorizado" fill="#ff9500" radius={[4, 4, 0, 0]} />
                <Bar dataKey="dev" name="Devengado Ejercido" fill="#34c759" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Grid Row 4: Gráfica 6 (Proveedores) & Gráfica 7 (Cuentas Bancarias) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Gráfica 6: Concentración de Proveedores Top 8 */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="mb-6">
            <h3 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-500" />
              Gráfica 6: Principales Proveedores por Monto Acumulado
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Concentración de erogaciones públicas</p>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topProveedores} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="name" stroke="#64748b" fontSize={9} tickFormatter={(name) => name.slice(0, 10) + '...'} />
                <YAxis stroke="#64748b" fontSize={11} tickFormatter={(v) => formatCompactCurrency(v)} />
                <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderRadius: '16px', fontSize: '12px' }} />
                <Bar dataKey="totalParcial" fill="#af52de" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gráfica 7: Cuentas Bancarias / Dispersión */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2 mb-1">
              <CreditCard className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              Gráfica 7: Distribución por Cuenta Bancaria
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">Canales de dispersión contable</p>
          </div>

          <div className="space-y-3">
            {cuentasData.map((cta, idx) => (
              <div key={idx} className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-slate-900 dark:text-white block">{cta.name}</span>
                  <span className="text-[10px] text-slate-500 font-mono">{cta.count.toLocaleString()} pagos procesados</span>
                </div>
                <div className="text-right">
                  <span className="font-black text-slate-900 dark:text-white text-sm block">{formatCompactCurrency(cta.total)}</span>
                  <span className="text-[10px] text-purple-600 dark:text-purple-400 font-bold">{formatCurrency(cta.total)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};
