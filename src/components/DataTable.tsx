import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Download, 
  ChevronLeft, 
  ChevronRight, 
  Eye, 
  ArrowUpDown
} from 'lucide-react';
import { BudgetItem, FilterOptions } from '../types/budget';
import { formatCurrency } from '../services/budgetService';

interface DataTableProps {
  items: BudgetItem[];
  onSelectItem: (item: BudgetItem) => void;
}

export const DataTable: React.FC<DataTableProps> = ({ items, onSelectItem }) => {
  const [filters, setFilters] = useState<FilterOptions>({
    search: '',
    capitulo: 'all',
    mes: 'all',
    cuentaBancaria: 'all',
    partida: 'all',
    proveedor: 'all',
    tipoSol: 'all'
  });

  const [sortField, setSortField] = useState<keyof BudgetItem>('importe_parcial');
  const [sortAsc, setSortAsc] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const uniqueCuentas = useMemo(() => {
    const set = new Set<string>();
    items.forEach(i => { if (i.cuenta_bancaria) set.add(i.cuenta_bancaria); });
    return Array.from(set).sort();
  }, [items]);

  const uniquePartidas = useMemo(() => {
    const map = new Map<string, string>();
    items.forEach(i => {
      if (i.ptda_code && !map.has(i.ptda_code)) {
        map.set(i.ptda_code, `${i.ptda_code} - ${i.ptda_desc}`);
      }
    });
    return Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  }, [items]);

  const filteredItems = useMemo(() => {
    const query = filters.search.toLowerCase().trim();

    return items.filter(item => {
      if (filters.capitulo !== 'all' && item.capitulo_code !== filters.capitulo) return false;
      if (filters.mes !== 'all' && item.mes_aplic !== parseInt(filters.mes, 10)) return false;
      if (filters.cuentaBancaria !== 'all' && item.cuenta_bancaria !== filters.cuentaBancaria) return false;
      if (filters.partida !== 'all' && item.ptda_code !== filters.partida) return false;
      if (filters.tipoSol !== 'all' && item.tipo_sol !== filters.tipoSol) return false;

      if (query) {
        const inText = 
          item.concepto.toLowerCase().includes(query) ||
          item.proveedor.toLowerCase().includes(query) ||
          item.ptda_desc.toLowerCase().includes(query) ||
          item.contrato.toLowerCase().includes(query) ||
          item.factura.toLowerCase().includes(query) ||
          item.ptda_code.toLowerCase().includes(query) ||
          item.cheque.toLowerCase().includes(query);
        if (!inText) return false;
      }
      return true;
    });
  }, [items, filters]);

  const sortedItems = useMemo(() => {
    return [...filteredItems].sort((a, b) => {
      let aVal = a[sortField] ?? '';
      let bVal = b[sortField] ?? '';

      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortAsc ? aVal - bVal : bVal - aVal;
      }
      return sortAsc 
        ? String(aVal).localeCompare(String(bVal)) 
        : String(bVal).localeCompare(String(aVal));
    });
  }, [filteredItems, sortField, sortAsc]);

  const totalPages = Math.ceil(sortedItems.length / pageSize) || 1;
  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedItems.slice(start, start + pageSize);
  }, [sortedItems, currentPage, pageSize]);

  const handleSort = (field: keyof BudgetItem) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  const handleExportCSV = () => {
    if (filteredItems.length === 0) return;

    const headers = [
      "ID", "Capítulo", "Mes Aplicación", "Fecha Pago", "Partida Código", "Partida Descripción", 
      "Proveedor", "Concepto", "Contrato", "Factura", "Cuenta Bancaria", "Cheque", 
      "Importe Parcial", "Importe Total"
    ];

    const rows = filteredItems.map(i => [
      `"${i.id}"`,
      `"${i.capitulo}"`,
      `"${i.mes_aplic || ''}"`,
      `"${i.fecha_pago}"`,
      `"${i.ptda_code}"`,
      `"${i.ptda_desc.replace(/"/g, '""')}"`,
      `"${i.proveedor.replace(/"/g, '""')}"`,
      `"${i.concepto.replace(/"/g, '""')}"`,
      `"${i.contrato}"`,
      `"${i.factura}"`,
      `"${i.cuenta_bancaria}"`,
      `"${i.cheque}"`,
      i.importe_parcial,
      i.importe_total
    ]);

    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `presupuesto_inper_export_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const totalFilteredAmount = useMemo(() => {
    return filteredItems.reduce((acc, curr) => acc + curr.importe_parcial, 0);
  }, [filteredItems]);

  return (
    <div className="space-y-6">
      
      {/* Search & Filter Panel */}
      <div className="glass-panel rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
        
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Buscar por concepto, proveedor, contrato, factura..."
              value={filters.search}
              onChange={(e) => {
                setFilters({ ...filters, search: e.target.value });
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 transition-all shadow-xs"
            />
          </div>

          <div className="flex items-center space-x-3 w-full sm:w-auto justify-between sm:justify-end">
            <div className="text-xs text-slate-600 dark:text-slate-400">
              Mostrando <span className="font-bold text-slate-900 dark:text-white">{filteredItems.length.toLocaleString()}</span> operaciones 
              <span className="ml-1 text-emerald-600 dark:text-emerald-400 font-bold">({formatCurrency(totalFilteredAmount)})</span>
            </div>

            <button
              onClick={handleExportCSV}
              className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Exportar CSV</span>
            </button>
          </div>
        </div>

        {/* Filter Dropdowns */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          
          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Capítulo</label>
            <select
              value={filters.capitulo}
              onChange={(e) => { setFilters({ ...filters, capitulo: e.target.value }); setCurrentPage(1); }}
              className="w-full px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-200 focus:border-blue-500"
            >
              <option value="all">Todos los Capítulos</option>
              <option value="3000">Cap 3000 - Servicios</option>
              <option value="2000">Cap 2000 - Materiales</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Mes de Aplicación</label>
            <select
              value={filters.mes}
              onChange={(e) => { setFilters({ ...filters, mes: e.target.value }); setCurrentPage(1); }}
              className="w-full px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-200 focus:border-blue-500"
            >
              <option value="all">Todos los Meses</option>
              <option value="1">Enero</option>
              <option value="2">Febrero</option>
              <option value="3">Marzo</option>
              <option value="4">Abril</option>
              <option value="5">Mayo</option>
              <option value="6">Junio</option>
              <option value="7">Julio</option>
              <option value="8">Agosto</option>
              <option value="9">Septiembre</option>
              <option value="10">Octubre</option>
              <option value="11">Noviembre</option>
              <option value="12">Diciembre</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Cuenta Bancaria</label>
            <select
              value={filters.cuentaBancaria}
              onChange={(e) => { setFilters({ ...filters, cuentaBancaria: e.target.value }); setCurrentPage(1); }}
              className="w-full px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-200 focus:border-blue-500"
            >
              <option value="all">Todas las Cuentas</option>
              {uniqueCuentas.map(cta => (
                <option key={cta} value={cta}>{cta}</option>
              ))}
            </select>
          </div>

          <div className="col-span-2 sm:col-span-1">
            <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Partida Presupuestal</label>
            <select
              value={filters.partida}
              onChange={(e) => { setFilters({ ...filters, partida: e.target.value }); setCurrentPage(1); }}
              className="w-full px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-200 focus:border-blue-500 truncate"
            >
              <option value="all">Todas las Partidas</option>
              {uniquePartidas.map(([code, label]) => (
                <option key={code} value={code}>{label}</option>
              ))}
            </select>
          </div>

          <div className="col-span-2 sm:col-span-1 flex items-end">
            <button
              onClick={() => {
                setFilters({
                  search: '',
                  capitulo: 'all',
                  mes: 'all',
                  cuentaBancaria: 'all',
                  partida: 'all',
                  proveedor: 'all',
                  tipoSol: 'all'
                });
                setCurrentPage(1);
              }}
              className="w-full py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold border border-slate-200 transition-all"
            >
              Limpiar Filtros
            </button>
          </div>

        </div>
      </div>

      {/* Main Table */}
      <div className="glass-panel rounded-3xl border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900 text-slate-500 uppercase tracking-wider text-[10px] font-bold border-b border-slate-200 dark:border-slate-800">
                <th className="py-3.5 px-4 font-bold">Cap</th>
                <th className="py-3.5 px-4 font-bold cursor-pointer hover:text-slate-900" onClick={() => handleSort('fecha_pago')}>
                  <div className="flex items-center space-x-1">
                    <span>Fecha / Mes</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3.5 px-4 font-bold cursor-pointer hover:text-slate-900" onClick={() => handleSort('ptda_code')}>
                  <div className="flex items-center space-x-1">
                    <span>Partida</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3.5 px-4 font-bold cursor-pointer hover:text-slate-900" onClick={() => handleSort('proveedor')}>
                  <div className="flex items-center space-x-1">
                    <span>Proveedor / Beneficiario</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3.5 px-4 font-bold max-w-xs">Concepto</th>
                <th className="py-3.5 px-4 font-bold cursor-pointer hover:text-slate-900 text-right" onClick={() => handleSort('importe_parcial')}>
                  <div className="flex items-center justify-end space-x-1">
                    <span>Importe Parcial (MXN)</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3.5 px-4 text-center font-bold">Acción</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {paginatedItems.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    No se encontraron operaciones con los filtros seleccionados.
                  </td>
                </tr>
              ) : (
                paginatedItems.map((item) => (
                  <tr 
                    key={item.id}
                    onClick={() => onSelectItem(item)}
                    className="hover:bg-blue-50/50 dark:hover:bg-slate-900/60 cursor-pointer transition-colors duration-150 group"
                  >
                    <td className="py-3 px-4">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full font-mono text-[10px] font-bold ${
                        item.capitulo_code === '3000'
                          ? 'bg-blue-50 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300 border border-blue-200 dark:border-blue-500/30'
                          : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30'
                      }`}>
                        {item.capitulo_code}
                      </span>
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap text-slate-800 dark:text-slate-300 font-medium">
                      <div>{item.fecha_pago || 'Pendiente'}</div>
                      {item.mes_aplic && (
                        <div className="text-[10px] text-slate-500">Mes {item.mes_aplic}</div>
                      )}
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-mono font-bold text-blue-600 dark:text-blue-400">{item.ptda_code}</div>
                      <div className="text-[10px] text-slate-500 truncate max-w-[140px]" title={item.ptda_desc}>
                        {item.ptda_desc.replace(`${item.ptda_code} - `, '')}
                      </div>
                    </td>

                    <td className="py-3 px-4 max-w-[200px]">
                      <div className="font-bold text-slate-900 dark:text-white truncate" title={item.proveedor}>
                        {item.proveedor || 'No especificado'}
                      </div>
                      {item.contrato && (
                        <div className="text-[10px] font-mono text-indigo-600 dark:text-indigo-400 truncate">
                          Ctr: {item.contrato}
                        </div>
                      )}
                    </td>

                    <td className="py-3 px-4 max-w-xs">
                      <div className="text-slate-700 dark:text-slate-300 line-clamp-2 leading-tight" title={item.concepto}>
                        {item.concepto || 'Sin concepto'}
                      </div>
                    </td>

                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="font-extrabold text-slate-900 dark:text-white text-sm">
                        {formatCurrency(item.importe_parcial)}
                      </div>
                      {item.importe_total !== item.importe_parcial && (
                        <div className="text-[10px] text-slate-500">
                          Tot: {formatCurrency(item.importe_total)}
                        </div>
                      )}
                    </td>

                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectItem(item);
                        }}
                        className="p-1.5 rounded-xl bg-blue-50 dark:bg-slate-800 hover:bg-blue-600 hover:text-white text-blue-600 dark:text-slate-300 border border-blue-200 dark:border-slate-700 transition-all"
                        title="Ver detalle completo"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-4 bg-slate-50/80 dark:bg-slate-900/90 border-t border-slate-200/80 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-3 text-xs text-slate-600 dark:text-slate-400">
            <span>Mostrar</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="px-2 py-1 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-bold"
            >
              <option value={20}>20 filas</option>
              <option value={50}>50 filas</option>
              <option value={100}>100 filas</option>
            </select>
            <span>Página <strong className="text-slate-900 dark:text-white">{currentPage}</strong> de <strong className="text-slate-900 dark:text-white">{totalPages}</strong></span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 text-slate-700 dark:text-slate-300 disabled:opacity-40 transition-all border border-slate-200 dark:border-slate-700"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            
            <span className="text-xs text-slate-700 dark:text-slate-300 px-3 font-bold">
              {currentPage} / {totalPages}
            </span>

            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 text-slate-700 dark:text-slate-300 disabled:opacity-40 transition-all border border-slate-200 dark:border-slate-700"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};
