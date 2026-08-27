import React, { useState, useMemo } from 'react';
import { FolderTree, Search } from 'lucide-react';
import { BudgetItem } from '../types/budget';
import { computeTopPartidas, formatCurrency, formatCompactCurrency } from '../services/budgetService';

interface PartidasViewProps {
  items: BudgetItem[];
  onSelectPartida: (partidaCode: string) => void;
}

export const PartidasView: React.FC<PartidasViewProps> = ({ items, onSelectPartida }) => {
  const [activeCapitulo, setActiveCapitulo] = useState<'all' | '3000' | '2000'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const allPartidas = useMemo(() => {
    return computeTopPartidas(items, 500);
  }, [items]);

  const filteredPartidas = useMemo(() => {
    return allPartidas.filter(ptd => {
      if (activeCapitulo !== 'all' && ptd.capitulo !== activeCapitulo) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return ptd.code.toLowerCase().includes(q) || ptd.desc.toLowerCase().includes(q);
      }
      return true;
    });
  }, [allPartidas, activeCapitulo, searchQuery]);

  const totalCap3000 = useMemo(() => {
    return allPartidas.filter(p => p.capitulo === '3000').reduce((acc, c) => acc + c.totalParcial, 0);
  }, [allPartidas]);

  const totalCap2000 = useMemo(() => {
    return allPartidas.filter(p => p.capitulo === '2000').reduce((acc, c) => acc + c.totalParcial, 0);
  }, [allPartidas]);

  return (
    <div className="space-y-6">
      
      {/* Chapter Tabs & Filter Bar */}
      <div className="glass-panel rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm">
        <div>
          <h2 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <FolderTree className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            Catálogo de Partidas Presupuestales INPER
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">Análisis y agrupación de gasto por objeto de gasto (COG)</p>
        </div>

        {/* Chapter Filter Pills */}
        <div className="flex items-center space-x-2 bg-slate-100 dark:bg-slate-900/80 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800">
          <button
            onClick={() => setActiveCapitulo('all')}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all ${
              activeCapitulo === 'all'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Todas ({allPartidas.length})
          </button>
          <button
            onClick={() => setActiveCapitulo('3000')}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all ${
              activeCapitulo === '3000'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Cap 3000 ({formatCompactCurrency(totalCap3000)})
          </button>
          <button
            onClick={() => setActiveCapitulo('2000')}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all ${
              activeCapitulo === '2000'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Cap 2000 ({formatCompactCurrency(totalCap2000)})
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full md:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Buscar por partida..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* Partidas Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPartidas.map((ptd) => (
          <div
            key={ptd.code}
            onClick={() => onSelectPartida(ptd.code)}
            className="glass-card rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 hover:border-blue-500/50 cursor-pointer transition-all duration-200 group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className={`px-2.5 py-0.5 rounded-full font-mono text-xs font-bold ${
                  ptd.capitulo === '3000'
                    ? 'bg-blue-50 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300 border border-blue-200 dark:border-blue-500/40'
                    : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/40'
                }`}>
                  PTDA {ptd.code}
                </span>
                <span className="text-[11px] text-slate-500 font-semibold">
                  {ptd.count} operaciones
                </span>
              </div>

              <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors line-clamp-2 leading-snug">
                {ptd.desc}
              </h4>
            </div>

            <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <span className="text-xs text-slate-500 font-medium">Monto Parcial:</span>
              <span className="text-base font-extrabold text-slate-900 dark:text-white">
                {formatCurrency(ptd.totalParcial)}
              </span>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};
