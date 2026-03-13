from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from pydantic import BaseModel
from datetime import datetime, timedelta
from typing import Optional, List
import sqlite3
import hashlib
import jwt
import os
import json

app = FastAPI(title="FlyerForge API")

# ── CORS ── allow your Vercel frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # replace with your Vercel URL after deploy
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── CONFIG ──
SECRET_KEY = os.environ.get("SECRET_KEY", "musa-flyerforge-secret-2026")
ALGORITHM = "HS256"
TOKEN_EXPIRE_HOURS = 24 * 7  # 1 week

# ── YOUR CREDENTIALS (change these!) ──
ADMIN_USERNAME = os.environ.get("ADMIN_USERNAME", "musa")
ADMIN_PASSWORD = os.environ.get("ADMIN_PASSWORD", "bilal2026")

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

# ── DATABASE ──
DB_PATH = "flyerforge.db"

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db()
    conn.execute("""
        CREATE TABLE IF NOT EXISTS flyers (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            institute TEXT,
            guest TEXT,
            role TEXT,
            date TEXT,
            time TEXT,
            venue TEXT,
            description TEXT,
            template_id INTEGER,
            template_name TEXT,
            created_at TEXT DEFAULT (datetime('now'))
        )
    """)
    conn.commit()
    conn.close()

init_db()

# ── MODELS ──
class Token(BaseModel):
    access_token: str
    token_type: str

class FlyerCreate(BaseModel):
    title: str
    institute: Optional[str] = ""
    guest: Optional[str] = ""
    role: Optional[str] = ""
    date: Optional[str] = ""
    time: Optional[str] = ""
    venue: Optional[str] = ""
    description: Optional[str] = ""
    template_id: int
    template_name: str

class FlyerOut(BaseModel):
    id: int
    title: str
    institute: Optional[str]
    guest: Optional[str]
    role: Optional[str]
    date: Optional[str]
    time: Optional[str]
    venue: Optional[str]
    description: Optional[str]
    template_id: int
    template_name: str
    created_at: str

# ── AUTH HELPERS ──
def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()

def create_token(username: str) -> str:
    expire = datetime.utcnow() + timedelta(hours=TOKEN_EXPIRE_HOURS)
    payload = {"sub": username, "exp": expire}
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)

def verify_token(token: str = Depends(oauth2_scheme)) -> str:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username = payload.get("sub")
        if username != ADMIN_USERNAME:
            raise HTTPException(status_code=401, detail="Invalid token")
        return username
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token")

# ── ROUTES ──

@app.get("/")
def root():
    return {"message": "FlyerForge API is running ✅"}

@app.post("/login", response_model=Token)
def login(form: OAuth2PasswordRequestForm = Depends()):
    if form.username != ADMIN_USERNAME or form.password != ADMIN_PASSWORD:
        raise HTTPException(status_code=401, detail="Wrong username or password")
    token = create_token(form.username)
    return {"access_token": token, "token_type": "bearer"}

@app.post("/flyers", response_model=FlyerOut)
def save_flyer(flyer: FlyerCreate, username: str = Depends(verify_token)):
    conn = get_db()
    cursor = conn.execute("""
        INSERT INTO flyers (title, institute, guest, role, date, time, venue, description, template_id, template_name)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (flyer.title, flyer.institute, flyer.guest, flyer.role,
          flyer.date, flyer.time, flyer.venue, flyer.description,
          flyer.template_id, flyer.template_name))
    conn.commit()
    row = conn.execute("SELECT * FROM flyers WHERE id = ?", (cursor.lastrowid,)).fetchone()
    conn.close()
    return dict(row)

@app.get("/flyers", response_model=List[FlyerOut])
def get_flyers(username: str = Depends(verify_token)):
    conn = get_db()
    rows = conn.execute("SELECT * FROM flyers ORDER BY created_at DESC").fetchall()
    conn.close()
    return [dict(r) for r in rows]

@app.delete("/flyers/{flyer_id}")
def delete_flyer(flyer_id: int, username: str = Depends(verify_token)):
    conn = get_db()
    conn.execute("DELETE FROM flyers WHERE id = ?", (flyer_id,))
    conn.commit()
    conn.close()
    return {"message": "Deleted"}

@app.get("/me")
def get_me(username: str = Depends(verify_token)):
    conn = get_db()
    count = conn.execute("SELECT COUNT(*) FROM flyers").fetchone()[0]
    conn.close()
    return {"username": username, "total_flyers": count}
