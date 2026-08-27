import json
import sys
import requests
from google.oauth2 import service_account
from google.auth.transport.requests import Request

# Force UTF-8 stdout
if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

SCOPES = [
    'https://www.googleapis.com/auth/drive.readonly',
    'https://www.googleapis.com/auth/drive.metadata.readonly'
]
SERVICE_ACCOUNT_FILE = 'service_account.json'

try:
    creds = service_account.Credentials.from_service_account_file(
        SERVICE_ACCOUNT_FILE, scopes=SCOPES)
    creds.refresh(Request())
    token = creds.token
    print("[OK] Token de Service Account generado correctamente.")
    print("[INFO] Service Account Email:", creds.service_account_email)
    
    headers = {"Authorization": f"Bearer {token}"}
    
    # 1. Query all files and folders shared with this Service Account
    url = "https://www.googleapis.com/drive/v3/files?pageSize=50&fields=files(id,name,mimeType,owners,parents)"
    
    r = requests.get(url, headers=headers)
    print("\n[INFO] Status de consulta a Google Drive API:", r.status_code)
    
    if r.status_code == 200:
        files = r.json().get('files', [])
        print(f"\n[ACCESO CONFIRMADO] Se encontraron {len(files)} archivos/carpetas compartidos con esta Service Account:\n")
        if not files:
            print(" -> Aún no hay carpetas ni archivos compartidos con este correo.")
            print("    Para compartir una carpeta, abre Google Drive, da clic secundario > Compartir")
            print(f"    y agrega el correo: {creds.service_account_email}")
        else:
            for f in files:
                is_folder = f.get('mimeType') == 'application/vnd.google-apps.folder'
                tipo = "[CARPETA]" if is_folder else "[ARCHIVO]"
                print(f" {tipo} {f.get('name')} | ID: {f.get('id')}")
    elif r.status_code == 403:
        err = r.json()
        msg = err.get('error', {}).get('message', '')
        print("\n[ALERTA] Respuesta de Google API:", msg)
        if "has not been used" in msg or "disabled" in msg:
            print("\n[PASO REQUERIDO] Para activar Google Drive API en el proyecto de tu Service Account, abre este enlace:")
            print(" https://console.developers.google.com/apis/api/drive.googleapis.com/overview?project=presupuesto-506721")
    else:
        print("[ERROR]", r.text)

except Exception as e:
    print("[ERROR] Falló la verificación:", e)
