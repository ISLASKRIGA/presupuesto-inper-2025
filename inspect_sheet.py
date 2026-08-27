import json
import os
from google.oauth2 import service_account
from googleapiclient.discovery import build

SCOPES = ['https://www.googleapis.com/auth/spreadsheets.readonly']
SERVICE_ACCOUNT_FILE = 'service_account.json'
SPREADSHEET_ID = '1SW5AkaJ_uTMt5zmeatFT5iIu2Yg7es5W'

creds = service_account.Credentials.from_service_account_file(
    SERVICE_ACCOUNT_FILE, scopes=SCOPES)

service = build('sheets', 'v4', credentials=creds)

sheet = service.spreadsheets()
result = sheet.get(spreadsheetId=SPREADSHEET_ID).execute()

sheets = result.get('sheets', [])
print(f"Spreadsheet Title: {result.get('properties', {}).get('title')}")
print(f"Found {len(sheets)} sheets:")
for s in sheets:
    props = s.get('properties', {})
    print(f" - {props.get('title')} (grid: {props.get('gridProperties')})")

# Let's inspect the first 10 rows of each sheet
for s in sheets:
    title = s.get('properties', {}).get('title')
    res = sheet.values().get(spreadsheetId=SPREADSHEET_ID, range=f"'{title}'!A1:Z20").execute()
    values = res.get('values', [])
    print(f"\n--- Top rows of '{title}' ({len(values)} rows sample) ---")
    for i, row in enumerate(values[:10]):
        print(f"Row {i+1}: {row}")
