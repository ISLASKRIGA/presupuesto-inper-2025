export interface BudgetItem {
  id: string;
  capitulo: string;
  capitulo_code: string; // "2000" | "3000"
  ff: string;
  mes_aplic: number | null;
  cta_banc_nombre: string;
  cuenta_bancaria: string;
  fecha_pago: string;
  cheque: string;
  cr_contra: string;
  tr: string;
  tipo_sol: string;
  contrato: string;
  factura: string;
  contrato_interno: string;
  proveedor: string;
  concepto: string;
  importe_parcial: number;
  importe_total: number;
  pp: string;
  ptda_code: string;
  ptda_desc: string;
  actidad: string;
  cod_area: string;
  estatus: string;
  mes_txt: string;
  origen?: string;
}

export interface AC01Record {
  id: string;
  ramo: string;
  unidad: string;
  pp: string;
  capitulo_code: string;
  ptda_code: string;
  ptda_desc: string;
  monto_original: number;
  monto_modificado: number;
  monto_devengado: number;
}

export interface AC01CapituloTotals {
  orig: number;
  mod: number;
  dev: number;
}

export interface AC01Summary {
  [key: string]: AC01CapituloTotals;
}

export interface SheetMetadataInfo {
  id: string;
  name: string;
  records_count: number;
}

export interface BudgetMetadata {
  title: string;
  generated_at: string;
  total_records: number;
  total_ac01_records: number;
  sheets: SheetMetadataInfo[];
  service_account: string;
}

export interface BudgetDataset {
  metadata: BudgetMetadata;
  ac01_summary?: AC01Summary;
  ac01_records?: AC01Record[];
  records: BudgetItem[];
}

export interface FilterOptions {
  search: string;
  capitulo: string;
  mes: string;
  cuentaBancaria: string;
  partida: string;
  proveedor: string;
  tipoSol: string;
}

export interface KPIStats {
  totalParcial: number;
  totalTotal: number;
  totalOperaciones: number;
  cap2000Parcial: number;
  cap3000Parcial: number;
  totalProveedores: number;
  promedioOperacion: number;
}

export interface MonthlyBreakdown {
  monthNum: number;
  monthName: string;
  cap2000: number;
  cap3000: number;
  total: number;
  count: number;
}

export interface PartidaGroup {
  code: string;
  desc: string;
  totalParcial: number;
  totalTotal: number;
  count: number;
  capitulo: string;
}

export interface ProveedorGroup {
  name: string;
  totalParcial: number;
  count: number;
  topConcepto: string;
}

export interface CuentaGroup {
  name: string;
  total: number;
  count: number;
}
