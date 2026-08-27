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
import { TrendingUp, PieChart as PieIcon, BarChart2, CreditCard, Award, Activity, Layers, Stethoscope, ShieldCheck, AlertTriangle } from 'lucide-react';

interface DashboardViewProps {
  items: BudgetItem[];
  kpis: KPIStats;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ items, kpis }) => {
  const [chartFilter, setChartFilter] = useState<'todas' | 'ejecutivo' | 'capitulos' | 'criticas' | 'laassp'>('todas');

  const monthlyData = computeMonthlyBreakdown(items);
  const topPartidas = computeTopPartidas(items, 8);
  const topProveedores = computeTopProveedores(items, 8);
  const cuentasData = computeCuentasBreakdown(items);

  // Capítulo 1000 ($906.48 M), Capítulo 3000 ($329.85 M), Capítulo 2000 ($76.60 M)
  const chapterPieData = [
    { name: 'Capítulo 1000 (Servicios Personales / Nómina)', value: 906482936, color: '#3C0C1F' },
    { name: 'Capítulo 3000 (Servicios Generales e Infraestructura)', value: kpis.cap3000Parcial, color: '#2563EB' },
    { name: 'Capítulo 2000 (Materiales y Suministros Médicos)', value: kpis.cap2000Parcial, color: '#059669' }
  ];

  const cap2024vs2025 = [
    { cap: 'Cap 1000 (Personal)', y2024: 855934344, y2025: 906482936 },
    { cap: 'Cap 2000 (Insumos)', y2024: 164480532, y2025: 76595744 },
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
      
      {/* Dynamic Executive View Selector - Public Finance Expert Style */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-[#3C0C1F]/10 dark:bg-amber-400/10 text-[#3C0C1F] dark:text-amber-300 border border-[#3C0C1F]/20 dark:border-amber-400/30">
              Gobernanza Financiera Institucional
            </span>
          </div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Activity className="w-5 h-5 text-[#3C0C1F] dark:text-amber-400" />
            Tablero de Control para la Dirección de Administración y Finanzas
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Monitoreo analítico del Techo Presupuestal SHCP, Eficiencia de Devengado y Auditoría de Contratación Pública
          </p>
        </div>

        {/* Executive Tab Selector Buttons */}
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs font-bold w-full lg:w-auto">
          
          <button
            onClick={() => setChartFilter('todas')}
            className={`px-3.5 py-2 rounded-xl transition-all ${
              chartFilter === 'todas'
                ? 'bg-[#3C0C1F] text-amber-300 shadow-md border border-amber-400/30 font-black'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            📊 Ver Consolidado Integral
          </button>

          <button
            onClick={() => setChartFilter('ejecutivo')}
            className={`px-3.5 py-2 rounded-xl transition-all ${
              chartFilter === 'ejecutivo'
                ? 'bg-[#3C0C1F] text-amber-300 shadow-md border border-amber-400/30 font-black'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            📈 Resumen Ejecutivo SHCP
          </button>

          <button
            onClick={() => setChartFilter('capitulos')}
            className={`px-3.5 py-2 rounded-xl transition-all ${
              chartFilter === 'capitulos'
                ? 'bg-[#3C0C1F] text-amber-300 shadow-md border border-amber-400/30 font-black'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            📑 Composición PEF por Capítulo
          </button>

          <button
            onClick={() => setChartFilter('criticas')}
            className={`px-3.5 py-2 rounded-xl transition-all ${
              chartFilter === 'criticas'
                ? 'bg-[#3C0C1F] text-amber-300 shadow-md border border-amber-400/30 font-black'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            🏥 Partidas Críticas Hospitalarias
          </button>

          <button
            onClick={() => setChartFilter('laassp')}
            className={`px-3.5 py-2 rounded-xl transition-all ${
              chartFilter === 'laassp'
                ? 'bg-[#3C0C1F] text-amber-300 shadow-md border border-amber-400/30 font-black'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            ⚖️ Dictamen Proveedores (LAASSP)
          </button>

        </div>
      </div>

      {/* Gráfica 1: Comportamiento Mensual del Presupuesto */}
      {(chartFilter === 'todas' || chartFilter === 'ejecutivo') && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-sm animate-fadeIn space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded-full border border-blue-200 dark:border-blue-800">
                  Curva S de Devengado Institucional
                </span>
              </div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2 mt-1">
                <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                Ejecución Presupuestal Mensual (Capítulo 3000 Servicios vs Capítulo 2000 Insumos)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Comportamiento de la dispersión de flujo contable Enero - Diciembre 2025</p>
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
              <div className="flex items-center space-x-2 mb-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-0.5 rounded-full border border-indigo-200 dark:border-indigo-800">
                  Estructura PEF 2025
                </span>
              </div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2 mb-1">
                <PieIcon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                Estructura del Gasto Autorizado por Capítulo
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">Ponderación presupuestal del Techo Modificado ($1,317 M)</p>

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
            <div className="flex items-center space-x-2 mb-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/30 px-2 py-0.5 rounded-full border border-purple-200 dark:border-purple-800">
                Clasificación por Objeto del Gasto (COG)
              </span>
            </div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2 mb-1">
              <BarChart2 className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              Partidas Presupuestales de Mayor Impacto Financiero
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">Partidas con mayor devengado acumulado en el ejercicio 2025</p>

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
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-sm animate-fadeIn space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                  Variación Interanual
                </span>
              </div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2 mt-1">
                <Layers className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                Comparativo de Techo Presupuestal (Cuenta Pública 2024 vs 2025)
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
      {(chartFilter === 'todas' || chartFilter === 'criticas') && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-sm animate-fadeIn space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/30 px-2 py-0.5 rounded-full border border-rose-200 dark:border-rose-800">
                  Auditoría Médica y Electromedicina
                </span>
              </div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2 mt-1">
                <Stethoscope className="w-5 h-5 text-rose-600 dark:text-rose-400" />
                Monitoreo Especial Partida 35201 (Mantenimiento de Equipo Médico de Alta Especialidad)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Techo Modificado ($1.80 M) vs Devengado por Actividad Institucional</p>
            </div>
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
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
                <Bar dataKey="mod" name="Presupuesto Modificado Autorizado" fill="#f43f5e" radius={[6, 6, 0, 0]} />
                <Bar dataKey="dev" name="Presupuesto Devengado Ejercido" fill="#06b6d4" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Grid of Vendor & Bank Account Dispersion Charts */}
      {(chartFilter === 'todas' || chartFilter === 'laassp') && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fadeIn">
          
          {/* Gráfica 6: Ranking de Proveedores Pareto */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-sm">
            <div className="flex items-center space-x-2 mb-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/30 px-2 py-0.5 rounded-full border border-amber-200 dark:border-amber-800">
                Dictamen LAASSP
              </span>
            </div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2 mb-1">
              <Award className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              Concentración de Contratación Pública en Proveedores (Pareto 80/20)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">Top 8 empresas adjudicadas por volumen total de facturación</p>

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
              <div className="flex items-center space-x-2 mb-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                  Tesorería de la Federación (TESOFE)
                </span>
              </div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2 mb-1">
                <CreditCard className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                Distribución por Cuentas Bancarias Autorizadas
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">Origen y dispersión de fondos para pagos y contra-recibos</p>

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
