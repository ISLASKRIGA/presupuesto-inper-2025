import openpyxl
import json
from datetime import datetime

wb = openpyxl.load_workbook("presupuesto_inper.xlsx", data_only=True)

def process_sheet(sheet_name, cap_name):
    sheet = wb[sheet_name]
    rows = list(sheet.iter_rows(values_only=True))
    if not rows:
        return []
    
    raw_headers = rows[0]
    headers = [str(h).strip() if h is not None else f"col_{i}" for i, h in enumerate(raw_headers)]
    
    data = []
    for r_idx, r in enumerate(rows[1:], start=2):
        if not any(r):
            continue
        row_dict = {}
        for h, val in zip(headers, r):
            if isinstance(val, datetime):
                row_dict[h] = val.strftime("%Y-%m-%d")
            else:
                row_dict[h] = val
        row_dict["_CAPITULO"] = cap_name
        data.append(row_dict)
    return data

data_3000 = process_sheet("3000", "3000 - Servicios Generales")
data_2000 = process_sheet("2000", "2000 - Materiales y Suministros")

print(f"Total rows in 3000: {len(data_3000)}")
print(f"Total rows in 2000: {len(data_2000)}")

# Let's check headers of 3000 and 2000
headers_3000 = list(data_3000[0].keys()) if data_3000 else []
headers_2000 = list(data_2000[0].keys()) if data_2000 else []

print("\n3000 Headers:", headers_3000)
print("\n2000 Headers:", headers_2000)

# Calculate financial totals
def sum_total(data, key):
    total = 0.0
    count = 0
    for row in data:
        val = row.get(key)
        if isinstance(val, (int, float)):
            total += val
            count += 1
    return total, count

t3000_par, c3000_par = sum_total(data_3000, "IMPORTE PARCIAL")
t3000_tot, c3000_tot = sum_total(data_3000, "IMPORTE TOTAL")

t2000_par, c2000_par = sum_total(data_2000, "IMPORTE PARCIAL")
t2000_tot, c2000_tot = sum_total(data_2000, "IMPORTE TOTAL")

print(f"\n3000 Total Importe Parcial: ${t3000_par:,.2f} ({c3000_par} rows)")
print(f"3000 Total Importe Total: ${t3000_tot:,.2f} ({c3000_tot} rows)")

print(f"\n2000 Total Importe Parcial: ${t2000_par:,.2f} ({c2000_par} rows)")
print(f"2000 Total Importe Total: ${t2000_tot:,.2f} ({c2000_tot} rows)")

# Total combined budget recorded
grand_par = t3000_par + t2000_par
grand_tot = t3000_tot + t2000_tot
print(f"\nGRAND TOTAL IMPORTE PARCIAL: ${grand_par:,.2f}")
print(f"GRAND TOTAL IMPORTE TOTAL: ${grand_tot:,.2f}")
