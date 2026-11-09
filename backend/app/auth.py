import json
import os

import firebase_admin
from fastapi import Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from firebase_admin import auth, credentials

bearer_scheme = HTTPBearer(auto_error=False)


def _init_firebase():
    try:
        firebase_admin.get_app()
    except ValueError:
        service_account = os.environ.get("FIREBASE_SERVICE_ACCOUNT_JSON")
        if service_account:
            cred = credentials.Certificate(json.loads(service_account))
        else:
            cred = credentials.ApplicationDefault()
        firebase_admin.initialize_app(cred)


def get_current_user(
    creds: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
) -> dict:
    headers = {"WWW-Authenticate": "Bearer"}
    if creds is None:
        raise HTTPException(status_code=401, detail="Missing authentication token", headers=headers)
    _init_firebase()
    try:
        return auth.verify_id_token(creds.credentials)
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid or expired token", headers=headers)