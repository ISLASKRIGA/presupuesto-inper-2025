import { BudgetItem, KPIStats, MonthlyBreakdown, PartidaBreakdown, ProveedorBreakdown, BudgetDataset } from '../types/budget';

export const fetchBudgetData = async (): Promise<BudgetDataset> => {
  const response = await fetch('/budget_data.json?v=' + new Date().getTime());
  if (!response.ok) {
    throw new Error(`Error al cargar los datos presupuestales (${response.status})`);
  }
  return await response.json();
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
};

export const formatCompactCurrency = (amount: number): string => {
  if (amount >= 1000000000) {
    return `$${(amount / 1000000000).toFixed(2)} B`;
  }
  if (amount >= 1000000) {
    return `$${(amount / 1000000).toFixed(2)} M`;
  }
  if (amount >= 1000) {
    return `$${(amount / 1000).toFixed(1)} k`;
  }
  return `$${amount.toFixed(2)}`;
};

export const computeKPIs = (items: BudgetItem[]): KPIStats => {
  let totalParcial = 0;
  let totalTotal = 0;
  let cap3000Parcial = 0;
  let cap2000Parcial = 0;
  const proveedoresSet = new Set<string>();

  items.forEach(item => {
    totalParcial += item.importe_parcial;
    totalTotal += item.importe_total;

    if (item.capitulo_code === '3000') {
      cap3000Parcial += item.importe_parcial;
    } else if (item.capitulo_code === '2000') {
      cap2000Parcial += item.importe_parcial;
    }

    if (item.proveedor) {
      proveedoresSet.add(item.proveedor.trim().toUpperCase());
    }
  });

  const totalOperaciones = items.length;
  const promedioOperacion = totalOperaciones > 0 ? totalParcial / totalOperaciones : 0;

  return {
    totalParcial,
    totalTotal,
    cap3000Parcial,
    cap2000Parcial,
    totalOperaciones,
    totalProveedores: proveedoresSet.size,
    promedioOperacion
  };
};

export const computeMonthlyBreakdown = (items: BudgetItem[]): MonthlyBreakdown[] => {
  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const monthMap = new Map<number, { cap3000: number; cap2000: number; total: number; count: number }>();

  for (let m = 1; m <= 12; m++) {
    monthMap.set(m, { cap3000: 0, cap2000: 0, total: 0, count: 0 });
  }

  items.forEach(item => {
    let monthIndex = item.mes_aplic;

    if (!monthIndex && item.fecha_pago) {
      const parts = item.fecha_pago.split('-');
      if (parts.length === 3) {
        monthIndex = parseInt(parts[1], 10);
      }
    }

    if (!monthIndex || monthIndex < 1 || monthIndex > 12) {
      monthIndex = 1;
    }

    const current = monthMap.get(monthIndex)!;
    current.total += item.importe_parcial;
    current.count += 1;

    if (item.capitulo_code === '3000') {
      current.cap3000 += item.importe_parcial;
    } else if (item.capitulo_code === '2000') {
      current.cap2000 += item.importe_parcial;
    }
  });

  return Array.from(monthMap.entries()).map(([m, data]) => ({
    month: m,
    monthName: monthNames[m - 1],
    cap3000: data.cap3000,
    cap2000: data.cap2000,
    total: data.total,
    count: data.count
  }));
};

export const computeTopPartidas = (items: BudgetItem[], limit: number = 10): PartidaBreakdown[] => {
  const map = new Map<string, { desc: string; cap: string; totalParcial: number; count: number }>();

  items.forEach(item => {
    const code = item.ptda_code || 'SIN_PARTIDA';
    const desc = item.ptda_desc || 'Sin Descripción';
    const cap = item.capitulo_code || 'N/A';

    if (!map.has(code)) {
      map.set(code, { desc, cap, totalParcial: 0, count: 0 });
    }

    const curr = map.get(code)!;
    curr.totalParcial += item.importe_parcial;
    curr.count += 1;
  });

  const sorted = Array.from(map.entries()).map(([code, val]) => ({
    code,
    desc: val.desc,
    capitulo: val.cap,
    totalParcial: val.totalParcial,
    count: val.count
  })).sort((a, b) => b.totalParcial - a.totalParcial);

  return sorted.slice(0, limit);
};

export const computeTopProveedores = (items: BudgetItem[], limit: number = 10): ProveedorBreakdown[] => {
  const map = new Map<string, { totalParcial: number; count: number; conceptos: Map<string, number> }>();

  items.forEach(item => {
    const name = item.proveedor ? item.proveedor.trim().toUpperCase() : 'SIN ESPECIFICAR';
    if (!map.has(name)) {
      map.set(name, { totalParcial: 0, count: 0, conceptos: new Map() });
    }
    const curr = map.get(name)!;
    curr.totalParcial += item.importe_parcial;
    curr.count += 1;

    const conc = item.concepto || 'Varios';
    curr.conceptos.set(conc, (curr.conceptos.get(conc) || 0) + 1);
  });

  return Array.from(map.entries()).map(([name, val]) => {
    let topConcepto = 'Varios conceptos';
    let maxC = 0;
    val.conceptos.forEach((cnt, cName) => {
      if (cnt > maxC) {
        maxC = cnt;
        topConcepto = cName;
      }
    });

    return {
      name,
      totalParcial: val.totalParcial,
      count: val.count,
      topConcepto
    };
  }).sort((a, b) => b.totalParcial - a.totalParcial).slice(0, limit);
};

export const computeCuentasBreakdown = (items: BudgetItem[]): { name: string; total: number; count: number }[] => {
  const map = new Map<string, { total: number; count: number }>();

  items.forEach(item => {
    const cta = item.cuenta_bancaria || 'Sin Cuenta';
    if (!map.has(cta)) {
      map.set(cta, { total: 0, count: 0 });
    }
    const curr = map.get(cta)!;
    curr.total += item.importe_parcial;
    curr.count += 1;
  });

  return Array.from(map.entries())
    .map(([name, val]) => ({ name, total: val.total, count: val.count }))
    .sort((a, b) => b.total - a.total);
};
