import openpyxl
import json
from datetime import datetime

# 1. Load Workbook 1 (Operaciones y Dispersiones de Pagos)
wb1 = openpyxl.load_workbook("presupuesto_inper.xlsx", data_only=True)

# 2. Load Workbook 2 (Presupuesto Autorizado / Cuenta Pública AC01 2025)
wb2 = openpyxl.load_workbook("sheet_2_inper.xlsx", data_only=True)

# Parse PARTIDAS catalog from both workbooks
partidas_cat = {}

if "Catálogos" in wb2.sheetnames:
    sheet_cat = wb2["Catálogos"]
    for r in list(sheet_cat.iter_rows(values_only=True))[1:]:
        if r[0] is not None and r[1] is not None:
            try:
                code = str(int(float(r[0])))
                name = str(r[1]).strip()
                partidas_cat[code] = name
            except Exception:
                pass

if "PARTIDAS" in wb1.sheetnames:
    sheet_p = wb1["PARTIDAS"]
    for r in list(sheet_p.iter_rows(values_only=True))[1:]:
        if r[0] is not None and r[1] is not None:
            try:
                code = str(int(float(r[0])))
                name = str(r[1]).strip()
                if code not in partidas_cat:
                    partidas_cat[code] = name
            except Exception:
                pass

print(f"Total Partidas in Catalog: {len(partidas_cat)}")

# Helpers
def parse_float(val):
    if val is None:
        return 0.0
    if isinstance(val, (int, float)):
        return float(val)
    val_str = str(val).replace("$", "").replace(",", "").strip()
    try:
        return float(val_str)
    except ValueError:
        return 0.0

def clean_str(val):
    if val is None:
        return ""
    s = str(val).strip()
    if s.lower() == "none" or s.lower() == "n/a":
        return ""
    return s

def clean_date(val):
    if isinstance(val, datetime):
        return val.strftime("%Y-%m-%d")
    if isinstance(val, str) and val.strip():
        return val.strip()
    return ""

# Process Sheet 1 (Operaciones contables)
def process_chapter_wb1(sheet_name, cap_code, cap_name):
    sheet = wb1[sheet_name]
    rows = list(sheet.iter_rows(values_only=True))
    if not rows:
        return []
    
    records = []
    for idx, r in enumerate(rows[1:], start=2):
        if not any(r):
            continue
        
        ff = clean_str(r[0])
        mes_aplic = r[1] if isinstance(r[1], (int, float)) else None
        cta_banc_nombre = clean_str(r[2])
        cuenta_bancaria = clean_str(r[3])
        fecha_pago = clean_date(r[4])
        cheque = clean_str(r[6])
        cr_contra = clean_str(r[8])
        tr = clean_str(r[9])
        tipo_sol = clean_str(r[10])
        contrato_pedido = clean_str(r[11])
        factura = clean_str(r[12])
        contrato_interno = clean_str(r[13])
        proveedor = clean_str(r[14])
        concepto = clean_str(r[15])
        imp_parcial = parse_float(r[16])
        imp_total = parse_float(r[17])
        pp = clean_str(r[18])
        
        ptda_raw = r[19]
        ptda_code = ""
        if ptda_raw is not None:
            try:
                ptda_code = str(int(float(ptda_raw)))
            except:
                ptda_code = str(ptda_raw).strip()
                
        act = clean_str(r[20])
        cod_area = clean_str(r[21])
        estatus_obs = clean_str(r[22])
        mes_txt = clean_str(r[23])
        ptda_desc = clean_str(r[26])
        desc = clean_str(r[27])
        
        partida_nombre = ptda_desc
        if not partida_nombre and ptda_code in partidas_cat:
            partida_nombre = f"{ptda_code} - {partidas_cat[ptda_code]}"
        elif not partida_nombre and desc:
            partida_nombre = f"{ptda_code} - {desc}" if ptda_code else desc

        if imp_parcial == 0 and imp_total == 0 and not proveedor:
            continue

        records.append({
            "id": f"{cap_code}-{idx}",
            "capitulo": cap_name,
            "capitulo_code": cap_code,
            "ff": ff,
            "mes_aplic": int(mes_aplic) if mes_aplic else None,
            "cta_banc_nombre": cta_banc_nombre,
            "cuenta_bancaria": cuenta_bancaria,
            "fecha_pago": fecha_pago,
            "cheque": cheque,
            "cr_contra": cr_contra,
            "tr": tr,
            "tipo_sol": tipo_sol,
            "contrato": contrato_pedido,
            "factura": factura,
            "contrato_interno": contrato_interno,
            "proveedor": proveedor,
            "concepto": concepto,
            "importe_parcial": imp_parcial,
            "importe_total": imp_total,
            "pp": pp,
            "ptda_code": ptda_code,
            "ptda_desc": partida_nombre,
            "actidad": act,
            "cod_area": cod_area,
            "estatus": estatus_obs,
            "mes_txt": mes_txt,
            "origen": "Dispersión Operativa"
        })
    return records

rec_3000 = process_chapter_wb1("3000", "3000", "Servicios Generales (Cap. 3000)")
rec_2000 = process_chapter_wb1("2000", "2000", "Materiales y Suministros (Cap. 2000)")

# Process Sheet 2: BASE AC01 2025 (Presupuesto Autorizado y Devengado Oficial SHCP)
ac01_records = []
if "BASE AC01 2025" in wb2.sheetnames:
    sheet_ac = wb2["BASE AC01 2025"]
    rows_ac = list(sheet_ac.iter_rows(values_only=True))
    if rows_ac:
        # Header is row 0
        for idx, r in enumerate(rows_ac[1:], start=2):
            if not any(r):
                continue
            
            ramo = clean_str(r[0])
            unidad = clean_str(r[1])
            pp = clean_str(r[7])
            cap_raw = r[10]
            cap_code = str(int(float(cap_raw))) if cap_raw is not None else ""
            
            ptda_raw = r[11]
            ptda_code = str(int(float(ptda_raw))) if ptda_raw is not None else ""
            
            ptda_desc = clean_str(r[12])
            if not ptda_desc and ptda_code in partidas_cat:
                ptda_desc = partidas_cat[ptda_code]
                
            orig = parse_float(r[17])
            mod = parse_float(r[18])
            dev = parse_float(r[19])
            
            ac01_records.append({
                "id": f"AC01-{idx}",
                "ramo": ramo,
                "unidad": unidad,
                "pp": pp,
                "capitulo_code": cap_code,
                "ptda_code": ptda_code,
                "ptda_desc": ptda_desc,
                "monto_original": orig,
                "monto_modificado": mod,
                "monto_devengado": dev
            })

print(f"Sheet 1 Records: {len(rec_3000) + len(rec_2000)}")
print(f"Sheet 2 AC01 Line Items: {len(ac01_records)}")

# Financial comparison metrics
ac01_totals = {
  "1000": {"orig": 0, "mod": 0, "dev": 0},
  "2000": {"orig": 0, "mod": 0, "dev": 0},
  "3000": {"orig": 0, "mod": 0, "dev": 0},
  "4000": {"orig": 0, "mod": 0, "dev": 0},
  "5000": {"orig": 0, "mod": 0, "dev": 0},
  "total": {"orig": 0, "mod": 0, "dev": 0}
}

for item in ac01_records:
    c = item["capitulo_code"]
    if c in ac01_totals:
        ac01_totals[c]["orig"] += item["monto_original"]
        ac01_totals[c]["mod"] += item["monto_modificado"]
        ac01_totals[c]["dev"] += item["monto_devengado"]
    ac01_totals["total"]["orig"] += item["monto_original"]
    ac01_totals["total"]["mod"] += item["monto_modificado"]
    ac01_totals["total"]["dev"] += item["monto_devengado"]

print("\n--- PRESUPUESTO AUTORIZADO AC01 2025 (Sheet 2) ---")
for c, vals in ac01_totals.items():
    print(f"Capítulo {c}: Original=${vals['orig']:,.2f} | Modificado=${vals['mod']:,.2f} | Devengado=${vals['dev']:,.2f}")

# Save JSON
all_operations = rec_3000 + rec_2000

dataset = {
    "metadata": {
        "title": "Presupuesto Instituto Nacional de Perinatología (INPER)",
        "generated_at": datetime.now().isoformat(),
        "total_records": len(all_operations),
        "total_ac01_records": len(ac01_records),
        "sheets": [
            {
                "id": "1SW5AkaJ_uTMt5zmeatFT5iIu2Yg7es5W",
                "name": "Erogaciones & Pagos Operativos (Cap. 2000 y 3000)",
                "records_count": len(all_operations)
            },
            {
                "id": "1SgtkWFKfGcjv-9pWIezz1nkQbRZ8y-DY",
                "name": "Presupuesto Oficial Autorizado AC01 2025 (SHCP / Cuenta Pública)",
                "records_count": len(ac01_records)
            }
        ],
        "service_account": "visualizador@presupuesto-506721.iam.gserviceaccount.com"
    },
    "ac01_summary": ac01_totals,
    "ac01_records": ac01_records,
    "records": all_operations
}

with open("budget_data.json", "w", encoding="utf-8") as f:
    json.dump(dataset, f, ensure_ascii=False, indent=2)

# Copy to public/
import shutil, os
os.makedirs("public", exist_ok=True)
shutil.copy("budget_data.json", "public/budget_data.json")

print("\nSaved budget_data.json and updated public/budget_data.json successfully!")
