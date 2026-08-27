import json
import requests
from google.oauth2 import service_account
from google.auth.transport.requests import Request

SCOPES = ['https://www.googleapis.com/auth/spreadsheets.readonly', 'https://www.googleapis.com/auth/drive.readonly']
SERVICE_ACCOUNT_FILE = 'service_account.json'
SPREADSHEET_ID = '1SW5AkaJ_uTMt5zmeatFT5iIu2Yg7es5W'

creds = service_account.Credentials.from_service_account_file(
    SERVICE_ACCOUNT_FILE, scopes=SCOPES)

creds.refresh(Request())
token = creds.token
print("Token obtained successfully!")

headers = {"Authorization": f"Bearer {token}"}
url = f"https://sheets.googleapis.com/v4/spreadsheets/{SPREADSHEET_ID}"

r = requests.get(url, headers=headers)
print("Status Code:", r.status_code)
if r.status_code == 200:
    data = r.json()
    print("Spreadsheet Title:", data.get("properties", {}).get("title"))
    sheets = data.get("sheets", [])
    print("Sheets count:", len(sheets))
    for s in sheets:
        title = s.get("properties", {}).get("title")
        print("Sheet title:", title)
        # fetch values
        val_url = f"https://sheets.googleapis.com/v4/spreadsheets/{SPREADSHEET_ID}/values/'{title}'!A1:Z50"
        vr = requests.get(val_url, headers=headers)
        if vr.status_code == 200:
            vdata = vr.json()
            rows = vdata.get("values", [])
            print(f"--- Top 15 rows of '{title}' (Total fetched: {len(rows)}) ---")
            for i, row in enumerate(rows[:15]):
                print(f"Row {i+1}: {row}")
        else:
            print("Error fetching values for sheet", title, vr.text)
else:
    print("Error getting spreadsheet:", r.text)
