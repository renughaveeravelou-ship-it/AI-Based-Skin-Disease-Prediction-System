import os
import sqlite3
import json
from werkzeug.security import generate_password_hash, check_password_hash

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(BASE_DIR, "users.db")

def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Users table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        email TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)
    
    # Scans table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS scans (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        filename TEXT NOT NULL,
        heatmap_filename TEXT,
        result TEXT NOT NULL,
        confidence TEXT NOT NULL, -- JSON string of all class probabilities
        severity TEXT NOT NULL,
        doctor TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    )
    """)
    
    # Settings table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS settings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER UNIQUE,
        theme TEXT DEFAULT 'dark',
        voice_active INTEGER DEFAULT 1,
        FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    )
    """)
    
    # Daily Checklist table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS checklist (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        date TEXT NOT NULL, -- Format: YYYY-MM-DD
        spf INTEGER DEFAULT 0, -- 0 or 1
        cleanse INTEGER DEFAULT 0,
        hydrate INTEGER DEFAULT 0,
        UNIQUE(user_id, date),
        FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    )
    """)
    
    conn.commit()
    conn.close()
    print("SQLite database successfully initialized!")

def register_user(username, password, email=None):
    hashed_pwd = generate_password_hash(password)
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute(
            "INSERT INTO users (username, password, email) VALUES (?, ?, ?)",
            (username, hashed_pwd, email)
        )
        user_id = cursor.lastrowid
        # Initialize default settings
        cursor.execute(
            "INSERT INTO settings (user_id, theme) VALUES (?, 'dark')",
            (user_id,)
        )
        conn.commit()
        return True, "User registered successfully!"
    except sqlite3.IntegrityError:
        return False, "Username already exists."
    except Exception as e:
        return False, f"Database error: {e}"
    finally:
        conn.close()

def login_user(username, password):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users WHERE username = ?", (username,))
    user = cursor.fetchone()
    conn.close()
    
    if user and check_password_hash(user["password"], password):
        return True, dict(user)
    return False, "Invalid username or password."

def add_scan(user_id, filename, heatmap_filename, result, confidence_dict, severity, doctor):
    conn = get_db_connection()
    cursor = conn.cursor()
    confidence_json = json.dumps(confidence_dict)
    try:
        cursor.execute(
            "INSERT INTO scans (user_id, filename, heatmap_filename, result, confidence, severity, doctor) VALUES (?, ?, ?, ?, ?, ?, ?)",
            (user_id, filename, heatmap_filename, result, confidence_json, severity, doctor)
        )
        scan_id = cursor.lastrowid
        conn.commit()
        return scan_id
    except Exception as e:
        print(f"Error saving scan: {e}")
        return None
    finally:
        conn.close()

def get_user_scans(user_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM scans WHERE user_id = ? ORDER BY created_at DESC", (user_id,))
    rows = cursor.fetchall()
    conn.close()
    return [dict(r) for r in rows]

def get_scan(scan_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM scans WHERE id = ?", (scan_id,))
    row = cursor.fetchone()
    conn.close()
    return dict(row) if row else None

def get_user_theme(user_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT theme FROM settings WHERE user_id = ?", (user_id,))
    row = cursor.fetchone()
    conn.close()
    return row["theme"] if row else "dark"

def update_user_theme(user_id, theme):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO settings (user_id, theme) VALUES (?, ?) ON CONFLICT(user_id) DO UPDATE SET theme = EXCLUDED.theme",
        (user_id, theme)
    )
    conn.commit()
    conn.close()

def get_user_checklist(user_id, date_str):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM checklist WHERE user_id = ? AND date = ?", (user_id, date_str))
    row = cursor.fetchone()
    conn.close()
    if row:
        return dict(row)
    return {"spf": 0, "cleanse": 0, "hydrate": 0}

def update_user_checklist(user_id, date_str, spf, cleanse, hydrate):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(
        """
        INSERT INTO checklist (user_id, date, spf, cleanse, hydrate) VALUES (?, ?, ?, ?, ?)
        ON CONFLICT(user_id, date) DO UPDATE SET 
            spf = EXCLUDED.spf,
            cleanse = EXCLUDED.cleanse,
            hydrate = EXCLUDED.hydrate
        """,
        (user_id, date_str, spf, cleanse, hydrate)
    )
    conn.commit()
    conn.close()

# Automatically initialize database when database.py is imported or run
init_db()
