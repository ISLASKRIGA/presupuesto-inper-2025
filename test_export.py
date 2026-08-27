import requests

SPREADSHEET_ID = '1SW5AkaJ_uTMt5zmeatFT5iIu2Yg7es5W'

# 1. Try public export as excel (.xlsx)
export_url = f"https://docs.google.com/spreadsheets/d/{SPREADSHEET_ID}/export?format=xlsx"
r = requests.get(export_url, allow_redirects=True)
print("XLSX Export Status:", r.status_code, "Content length:", len(r.content))

if r.status_code == 200 and len(r.content) > 1000:
    with open("presupuesto_inper.xlsx", "wb") as f:
        f.write(r.content)
    print("Successfully saved budget file as XLSX!")

# 2. Try CSV export
csv_url = f"https://docs.google.com/spreadsheets/d/{SPREADSHEET_ID}/export?format=csv"
r_csv = requests.get(csv_url, allow_redirects=True)
print("CSV Export Status:", r_csv.status_code, "Content length:", len(r_csv.content))
if r_csv.status_code == 200:
    print("Top 500 chars of CSV:")
    print(r_csv.text[:500])
