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
  const [chartFilter, setChartFilter] = useState<'todas' | 'mensual' | 'capitulos' | 'proveedores'>('todas');

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

  return (
    <div className="space-y-8">
      
      {/* Chart Section Header & Functional View Filter */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <Activity className="w-5 h-5 text-[#3C0C1F] dark:text-amber-400" />
            Panel Integrado de Gráficas Financieras INPER
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Análisis multidimensional del presupuesto (Tendencias, Composición, Comparativos y Proveedores)
          </p>
        </div>

        {/* Dynamic Functional View Selector Buttons */}
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs font-bold w-full lg:w-auto">
          
          <button
            onClick={() => setChartFilter('todas')}
            className={`px-3.5 py-2 rounded-xl transition-all ${
              chartFilter === 'todas'
                ? 'bg-[#3C0C1F] text-amber-300 shadow-md border border-amber-400/30 font-black'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            🌐 Ver Todas (7 Gráficas)
          </button>

          <button
            onClick={() => setChartFilter('mensual')}
            className={`px-3.5 py-2 rounded-xl transition-all ${
              chartFilter === 'mensual'
                ? 'bg-[#3C0C1F] text-amber-300 shadow-md border border-amber-400/30 font-black'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            📈 Tendencia Mensual
          </button>

          <button
            onClick={() => setChartFilter('capitulos')}
            className={`px-3.5 py-2 rounded-xl transition-all ${
              chartFilter === 'capitulos'
                ? 'bg-[#3C0C1F] text-amber-300 shadow-md border border-amber-400/30 font-black'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            📊 Comparativo 2024 vs 2025
          </button>

          <button
            onClick={() => setChartFilter('proveedores')}
            className={`px-3.5 py-2 rounded-xl transition-all ${
              chartFilter === 'proveedores'
                ? 'bg-[#3C0C1F] text-amber-300 shadow-md border border-amber-400/30 font-black'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            🏆 Ranking Proveedores
          </button>

        </div>
      </div>

      {/* Gráfica 1: Comportamiento Mensual del Presupuesto */}
      {(chartFilter === 'todas' || chartFilter === 'mensual') && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-sm animate-fadeIn">
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
                  tickLine={false} 
                  tickFormatter={(v) => `$${(v / 1000000).toFixed(0)}M`} 
                />
                <Tooltip 
                  formatter={(value: any) => [formatCurrency(Number(value)), '']}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '16px', color: '#fff', fontSize: '12px' }}
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

      {/* Grid of Chapter & Breakdown Charts */}
      {(chartFilter === 'todas' || chartFilter === 'capitulos') && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fadeIn">
          
          {/* Gráfica 2: Composición del Gasto por Capítulo */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between">
            <div>
              <h3 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2 mb-1">
                <PieIcon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                Gráfica 2: Estructura del Gasto Público por Capítulo
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">Distribución porcentual del presupuesto autorizado ($1,317 M)</p>

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
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '16px', color: '#fff', fontSize: '12px' }}
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

          {/* Gráfica 3: Top Partidas Presupuestales */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-sm">
            <h3 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2 mb-1">
              <BarChart2 className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              Gráfica 3: Top Partidas Presupuestales de Mayor Importe
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">Partidas con mayor concentración de recursos en 2025</p>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topPartidas} layout="vertical" margin={{ top: 0, right: 20, left: 40, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                  <XAxis type="number" stroke="#64748b" fontSize={11} tickFormatter={(v) => `$${(v / 1000000).toFixed(0)}M`} />
                  <YAxis type="category" dataKey="code" stroke="#64748b" fontSize={11} tickLine={false} />
                  <Tooltip 
                    formatter={(val: any) => [formatCurrency(Number(val)), 'Total Dispersado']}
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '16px', color: '#fff', fontSize: '12px' }}
                  />
                  <Bar dataKey="total" fill="#8b5cf6" radius={[0, 8, 8, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>
      )}

      {/* Comparative 2024 vs 2025 Chart */}
      {(chartFilter === 'todas' || chartFilter === 'capitulos') && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-sm animate-fadeIn">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
            <div>
              <h3 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Layers className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                Gráfica 4: Comparativo Anual de Techo Presupuestal (Cuenta Pública 2024 vs 2025)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Variación y comportamiento por capítulo de gasto</p>
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={cap2024vs2025} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="cap" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} tickFormatter={(v) => `$${(v / 1000000).toFixed(0)}M`} />
                <Tooltip 
                  formatter={(val: any) => [formatCurrency(Number(val)), '']}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '16px', color: '#fff', fontSize: '12px' }}
                />
                <Legend />
                <Bar dataKey="y2024" name="Cuenta Pública 2024" fill="#94a3b8" radius={[6, 6, 0, 0]} />
                <Bar dataKey="y2025" name="Cuenta Pública 2025" fill="#10b981" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Partida 35201 Special Monitoring Chart */}
      {(chartFilter === 'todas' || chartFilter === 'mensual') && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-sm animate-fadeIn">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
            <div>
              <h3 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Stethoscope className="w-5 h-5 text-rose-600 dark:text-rose-400" />
                Gráfica 5: Auditoría Especial Partida 35201 (Mantenimiento Equipo Médico)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Techo Modificado ($1.80 M) vs Devengado por Actividad Institucional</p>
            </div>
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
              100% Cumplimiento Operativo
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={partida35201Chart} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                <Tooltip 
                  formatter={(val: any) => [formatCurrency(Number(val)), '']}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '16px', color: '#fff', fontSize: '12px' }}
                />
                <Legend />
                <Bar dataKey="mod" name="Presupuesto Modificado" fill="#f43f5e" radius={[6, 6, 0, 0]} />
                <Bar dataKey="dev" name="Presupuesto Devengado" fill="#06b6d4" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Grid of Vendor & Bank Account Dispersion Charts */}
      {(chartFilter === 'todas' || chartFilter === 'proveedores') && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fadeIn">
          
          {/* Gráfica 6: Ranking de Proveedores Pareto */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-sm">
            <h3 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2 mb-1">
              <Award className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              Gráfica 6: Concentración de Proveedores Principales
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">Top 8 proveedores por volumen total adjudicado</p>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topProveedores} layout="vertical" margin={{ top: 0, right: 20, left: 60, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                  <XAxis type="number" stroke="#64748b" fontSize={11} tickFormatter={(v) => `$${(v / 1000000).toFixed(0)}M`} />
                  <YAxis type="category" dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} width={110} />
                  <Tooltip 
                    formatter={(val: any) => [formatCurrency(Number(val)), 'Total Acumulado']}
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '16px', color: '#fff', fontSize: '12px' }}
                  />
                  <Bar dataKey="total" fill="#f59e0b" radius={[0, 8, 8, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Gráfica 7: Distribución por Cuenta Bancaria */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between">
            <div>
              <h3 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2 mb-1">
                <CreditCard className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                Gráfica 7: Distribución por Cuentas Bancarias Institucionales
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">Origen y dispersión contable de los pagos</p>

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
                      nameKey="account"
                    >
                      {cuentasData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b'][index % 4]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(val: any) => [formatCurrency(Number(val)), 'Monto Pagado']}
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '16px', color: '#fff', fontSize: '12px' }}
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
                    Cuenta: {c.account}
                  </span>
                  <span className="font-extrabold text-slate-900 dark:text-white font-mono">
                    {formatCompactCurrency(c.total)} ({c.count} pagos)
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
