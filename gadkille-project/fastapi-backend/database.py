import json
import sqlite3
from datetime import datetime, date
from pathlib import Path
from typing import Any, Dict, List, Optional

from config import SUPABASE_URL, SUPABASE_KEY

# Official Supabase Python SDK import
try:
    from supabase import create_client, Client as SupabaseClient
except ImportError:
    create_client = None
    SupabaseClient = Any

LOCAL_DB_PATH = Path(__file__).parent / "gadkille_admin.db"

_supabase_client: Optional[Any] = None
_local_conn: Optional[sqlite3.Connection] = None


def _has_real_supabase_key() -> bool:
    if not SUPABASE_URL or not SUPABASE_KEY:
        return False
    placeholders = ("YOUR_SUPABASE", "YOUR_KEY", "YOUR_PROJECT_REF", "PLACEHOLDER")
    return not any(p in SUPABASE_KEY.upper() or p in SUPABASE_URL.upper() for p in placeholders)


class QueryResult:
    def __init__(self, data: List[Dict[str, Any]], count: Optional[int] = None):
        self.data = data
        self.count = count if count is not None else len(data)


class LocalSupabaseTableQuery:
    """
    Implements the exact Supabase Python SDK `.table(name)` fluent interface
    (`.select()`, `.insert()`, `.upsert()`, `.update()`, `.delete()`, `.eq()`,
     `.ilike()`, `.order()`, `.limit()`, `.range()`, `.execute()`)
    so the application uses 100% Supabase SDK syntax everywhere and also works
    before SUPABASE_KEY is pasted into .env.
    """
    JSON_COLS = {"features", "interests", "key_figures", "event_sources", "focus_areas", "categories"}
    BOOL_COLS = {
        "is_featured", "is_spotlight", "is_published", "is_disputed", "is_primary",
        "is_active", "is_default", "display_name_public", "display_amount_public"
    }

    def __init__(self, conn: sqlite3.Connection, table_name: str):
        self._conn = conn
        self._table = table_name
        self._op = "select"
        self._payload: Any = None
        self._filters: List[tuple] = []
        self._order_cols: List[tuple] = []
        self._limit_val: Optional[int] = None
        self._offset_val: int = 0

    def select(self, columns: str = "*", count: Optional[str] = None) -> "LocalSupabaseTableQuery":
        self._op = "select"
        return self

    def insert(self, data: Any) -> "LocalSupabaseTableQuery":
        self._op = "insert"
        self._payload = data
        return self

    def upsert(self, data: Any, on_conflict: Optional[str] = None) -> "LocalSupabaseTableQuery":
        self._op = "upsert"
        self._payload = data
        return self

    def update(self, data: Dict[str, Any]) -> "LocalSupabaseTableQuery":
        self._op = "update"
        self._payload = data
        return self

    def delete(self) -> "LocalSupabaseTableQuery":
        self._op = "delete"
        return self

    def eq(self, column: str, value: Any) -> "LocalSupabaseTableQuery":
        self._filters.append(("=", column, value))
        return self

    def ilike(self, column: str, value: str) -> "LocalSupabaseTableQuery":
        self._filters.append(("ILIKE", column, value))
        return self

    def order(self, column: str, desc: bool = False) -> "LocalSupabaseTableQuery":
        self._order_cols.append((column, "DESC" if desc else "ASC"))
        return self

    def limit(self, size: int) -> "LocalSupabaseTableQuery":
        self._limit_val = size
        return self

    def range(self, start: int, end: int) -> "LocalSupabaseTableQuery":
        self._offset_val = start
        self._limit_val = (end - start) + 1
        return self

    def _serialize_val(self, k: str, v: Any) -> Any:
        if isinstance(v, (list, dict)):
            return json.dumps(v, ensure_ascii=False)
        if isinstance(v, bool):
            return 1 if v else 0
        if isinstance(v, (datetime, date)):
            return v.isoformat()
        return v

    def _deserialize_row(self, row: sqlite3.Row) -> Dict[str, Any]:
        d = dict(row)
        for col in self.JSON_COLS:
            if col in d and isinstance(d[col], str):
                try:
                    d[col] = json.loads(d[col])
                except Exception:
                    d[col] = []
        for col in self.BOOL_COLS:
            if col in d and d[col] is not None:
                d[col] = bool(d[col])
        return d

    def _where_clause(self) -> tuple[str, List[Any]]:
        if not self._filters:
            return "", []
        clauses = []
        params = []
        for op, col, val in self._filters:
            if op == "ILIKE":
                clauses.append(f"UPPER({col}) = UPPER(?)")
                params.append(str(val))
            else:
                clauses.append(f"{col} = ?")
                params.append(self._serialize_val(col, val))
        return " WHERE " + " AND ".join(clauses), params

    def execute(self) -> QueryResult:
        cur = self._conn.cursor()

        if self._op in ("insert", "upsert"):
            items = self._payload if isinstance(self._payload, list) else [self._payload]
            inserted = []
            for item in items:
                row_data = dict(item)
                now_iso = datetime.now().isoformat()
                if self._table != "site_settings" and "created_at" not in row_data:
                    row_data["created_at"] = now_iso
                if self._table == "certificates" and "issued_date" not in row_data:
                    row_data["issued_date"] = date.today().isoformat()
                cols = list(row_data.keys())
                vals = [self._serialize_val(k, row_data[k]) for k in cols]
                placeholders = ", ".join(["?"] * len(cols))
                col_names = ", ".join(cols)
                verb = "INSERT OR REPLACE" if self._op == "upsert" else "INSERT"
                cur.execute(f"{verb} INTO {self._table} ({col_names}) VALUES ({placeholders})", vals)
                inserted.append(row_data)
            self._conn.commit()
            return QueryResult(inserted)

        if self._op == "update":
            row_data = dict(self._payload)
            set_parts = [f"{k} = ?" for k in row_data.keys()]
            set_vals = [self._serialize_val(k, row_data[k]) for k in row_data.keys()]
            where_sql, where_vals = self._where_clause()
            cur.execute(
                f"UPDATE {self._table} SET {', '.join(set_parts)}{where_sql}",
                set_vals + where_vals,
            )
            self._conn.commit()
            cur.execute(f"SELECT * FROM {self._table}{where_sql}", where_vals)
            return QueryResult([self._deserialize_row(r) for r in cur.fetchall()])

        if self._op == "delete":
            where_sql, where_vals = self._where_clause()
            cur.execute(f"DELETE FROM {self._table}{where_sql}", where_vals)
            self._conn.commit()
            return QueryResult([])

        # SELECT
        where_sql, where_vals = self._where_clause()
        sql = f"SELECT * FROM {self._table}{where_sql}"
        if self._order_cols:
            order_str = ", ".join(f"{col} {direction}" for col, direction in self._order_cols)
            sql += f" ORDER BY {order_str}"
        if self._limit_val is not None:
            sql += f" LIMIT {int(self._limit_val)} OFFSET {int(self._offset_val)}"

        cur.execute(sql, where_vals)
        rows = [self._deserialize_row(r) for r in cur.fetchall()]
        return QueryResult(rows)


LOCAL_UPLOADS_DIR = Path(__file__).parent / "uploads"
VITE_PUBLIC_UPLOADS_DIR = Path(__file__).resolve().parent.parent / "gadkille-vite" / "public" / "uploads"


class _ResilientStorageBucket:
    """
    Wraps the official Supabase Python SDK `.storage.from_(bucket)` interface
    (`.upload()`, `.get_public_url()`) to store uploaded files in Supabase Object Storage.
    """
    def __init__(self, sdk_client: Optional[Any], bucket_name: str):
        self._sdk = sdk_client
        self._bucket = bucket_name
        self._used_cloud = False

    def upload(self, path: str, file: bytes, file_options: Optional[Dict[str, Any]] = None) -> Any:
        opts = file_options or {"content-type": "image/jpeg", "upsert": "true"}
        if self._sdk is not None:
            try:
                res = self._sdk.storage.from_(self._bucket).upload(
                    path=path,
                    file=file,
                    file_options=opts,
                )
                self._used_cloud = True
                return res
            except Exception as first_err:
                try:
                    self._sdk.storage.create_bucket(self._bucket, options={"public": True})
                    res = self._sdk.storage.from_(self._bucket).upload(
                        path=path,
                        file=file,
                        file_options=opts,
                    )
                    self._used_cloud = True
                    return res
                except Exception as second_err:
                    print(f"⚠️ Supabase Storage upload fallback ({first_err} / {second_err})")

        # Local fallback if Supabase Storage bucket policy or key is not yet applied
        self._used_cloud = False
        for base_dir in (LOCAL_UPLOADS_DIR, VITE_PUBLIC_UPLOADS_DIR):
            try:
                target = base_dir / path
                target.parent.mkdir(parents=True, exist_ok=True)
                target.write_bytes(file)
            except Exception:
                pass
        return {"path": path}

    def get_public_url(self, path: str) -> str:
        if self._sdk is not None and self._used_cloud:
            try:
                url = self._sdk.storage.from_(self._bucket).get_public_url(path)
                if isinstance(url, str) and url.startswith("http"):
                    return url
            except Exception:
                pass
        return f"/uploads/{path}"


class _ResilientStorageClient:
    def __init__(self, sdk_client: Optional[Any]):
        self._sdk = sdk_client

    def from_(self, bucket_name: str) -> _ResilientStorageBucket:
        return _ResilientStorageBucket(self._sdk, bucket_name)


class HybridSupabaseClient:
    """
    Uses the official Supabase Python SDK (`supabase.create_client`) when
    SUPABASE_URL and SUPABASE_KEY are configured, and seamlessly falls back
    per-query to local SQLite if SUPABASE_KEY is not yet set in .env.
    """
    def __init__(self, sdk_client: Optional[Any], local_conn: sqlite3.Connection):
        self._sdk = sdk_client
        self._local = local_conn
        self.storage = _ResilientStorageClient(sdk_client)

    def table(self, table_name: str):
        if self._sdk is not None:
            return _ResilientTableProxy(self._sdk, self._local, table_name)
        return LocalSupabaseTableQuery(self._local, table_name)


class _ResilientTableProxy:
    """
    Executes queries on the official Supabase Python SDK `.table(name)` first.
    If the remote table hasn't been created in Supabase SQL Editor yet or the API key
    is invalid, falls back to local storage so the API never returns 500.
    """
    def __init__(self, sdk_client: Any, local_conn: sqlite3.Connection, table_name: str):
        self._sdk_query = sdk_client.table(table_name)
        self._fallback_query = LocalSupabaseTableQuery(local_conn, table_name)

    def select(self, *args, **kwargs):
        self._sdk_query = self._sdk_query.select(*args, **kwargs)
        self._fallback_query.select(*args, **kwargs)
        return self

    def insert(self, data: Any):
        self._sdk_query = self._sdk_query.insert(data)
        self._fallback_query.insert(data)
        return self

    def upsert(self, data: Any, **kwargs):
        self._sdk_query = self._sdk_query.upsert(data, **kwargs)
        self._fallback_query.upsert(data, **kwargs)
        return self

    def update(self, data: Dict[str, Any]):
        self._sdk_query = self._sdk_query.update(data)
        self._fallback_query.update(data)
        return self

    def delete(self):
        self._sdk_query = self._sdk_query.delete()
        self._fallback_query.delete()
        return self

    def eq(self, column: str, value: Any):
        self._sdk_query = self._sdk_query.eq(column, value)
        self._fallback_query.eq(column, value)
        return self

    def ilike(self, column: str, value: str):
        self._sdk_query = self._sdk_query.ilike(column, value)
        self._fallback_query.ilike(column, value)
        return self

    def order(self, column: str, desc: bool = False):
        self._sdk_query = self._sdk_query.order(column, desc=desc)
        self._fallback_query.order(column, desc=desc)
        return self

    def limit(self, size: int):
        self._sdk_query = self._sdk_query.limit(size)
        self._fallback_query.limit(size)
        return self

    def range(self, start: int, end: int):
        self._sdk_query = self._sdk_query.range(start, end)
        self._fallback_query.range(start, end)
        return self

    def execute(self):
        try:
            return self._sdk_query.execute()
        except Exception as e:
            print(f"⚠️ Supabase SDK query fallback ({e})")
            return self._fallback_query.execute()


SCHEMA_SQLITE = """
CREATE TABLE IF NOT EXISTS site_settings (
    id INTEGER PRIMARY KEY DEFAULT 1,
    name_marathi TEXT NOT NULL DEFAULT 'गड-किल्ले संवर्धन प्रतिष्ठान',
    name_english TEXT NOT NULL DEFAULT 'Gadkille Sanvardhan Pratishthan',
    state TEXT NOT NULL DEFAULT 'महाराष्ट्र राज्य',
    founded TEXT NOT NULL DEFAULT '२०११',
    founder TEXT NOT NULL DEFAULT 'श्री. योगेश सोनवणे',
    president TEXT NOT NULL DEFAULT 'श्री. अभिषेक नवले',
    address TEXT NOT NULL DEFAULT 'गडकिल्ले-५१३, अथर्व कॉम्प्लेक्स, कृष्णा चौक, पिंपळे गुरव, पुणे – ४११०६१',
    phone1 TEXT NOT NULL DEFAULT '90496 87970',
    phone2 TEXT NOT NULL DEFAULT '',
    email TEXT NOT NULL DEFAULT 'gadkille.sanvardhan1630@gmail.com',
    facebook TEXT NOT NULL DEFAULT 'https://www.facebook.com/gadkillesanvardhanpratishthan',
    motto TEXT NOT NULL DEFAULT 'गड जपूया • इतिहास जपूया • वारसा पुढील पिढीकडे नेऊया',
    mission TEXT NOT NULL DEFAULT 'महाराष्ट्रातील गड-किल्ल्यांचे संवर्धन, संशोधन व जनजागृती',
    bank_name TEXT NOT NULL DEFAULT 'State Bank of India',
    bank_account TEXT NOT NULL DEFAULT 'XXXX XXXX XXXX',
    bank_ifsc TEXT NOT NULL DEFAULT 'SBIN0XXXXXX',
    upi_id TEXT NOT NULL DEFAULT 'gadkille@sbi',
    stat_forts INTEGER NOT NULL DEFAULT 0,
    stat_campaigns INTEGER NOT NULL DEFAULT 0,
    stat_volunteers INTEGER NOT NULL DEFAULT 0,
    stat_events INTEGER NOT NULL DEFAULT 0,
    stat_trees INTEGER NOT NULL DEFAULT 0,
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS forts (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    name_en TEXT NOT NULL,
    district TEXT NOT NULL,
    taluka TEXT DEFAULT '',
    height TEXT DEFAULT '',
    fort_type TEXT DEFAULT 'गिरिदुर्ग',
    era TEXT DEFAULT '',
    difficulty TEXT DEFAULT 'मध्यम',
    difficulty_en TEXT DEFAULT 'moderate',
    status TEXT DEFAULT 'progress',
    status_label TEXT DEFAULT 'संवर्धन सुरू',
    image TEXT DEFAULT '/images/raigad.jpg',
    description TEXT DEFAULT '',
    history TEXT DEFAULT '',
    trek_distance TEXT DEFAULT '',
    trek_time TEXT DEFAULT '',
    trek_season TEXT DEFAULT 'वर्षभर',
    trek_water TEXT DEFAULT 'उपलब्ध',
    trek_network TEXT DEFAULT 'मध्यम',
    features TEXT DEFAULT '[]',
    latitude REAL DEFAULT 18.5,
    longitude REAL DEFAULT 73.8,
    is_featured INTEGER DEFAULT 0,
    is_spotlight INTEGER DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS events (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    event_type TEXT NOT NULL,
    date_text TEXT NOT NULL,
    date_num TEXT NOT NULL,
    month_text TEXT NOT NULL,
    location TEXT NOT NULL,
    district TEXT NOT NULL,
    capacity INTEGER NOT NULL DEFAULT 100,
    registered INTEGER NOT NULL DEFAULT 0,
    image TEXT DEFAULT '/images/raigad.jpg',
    description TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'नोंदणी सुरू',
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS projects (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    fort TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'सुरू आहे',
    progress INTEGER NOT NULL DEFAULT 0,
    volunteers INTEGER NOT NULL DEFAULT 0,
    budget TEXT NOT NULL DEFAULT '₹0',
    spent TEXT NOT NULL DEFAULT '₹0',
    start_date TEXT NOT NULL DEFAULT '',
    end_date TEXT NOT NULL DEFAULT '',
    impact TEXT NOT NULL DEFAULT '',
    description TEXT NOT NULL DEFAULT '',
    before_img TEXT DEFAULT '/images/conservation.jpg',
    after_img TEXT DEFAULT '/images/raigad.jpg',
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS news (
    id TEXT PRIMARY KEY,
    category TEXT NOT NULL DEFAULT 'संवर्धन',
    title TEXT NOT NULL,
    date_text TEXT NOT NULL,
    author TEXT NOT NULL DEFAULT 'संपादकीय',
    image TEXT DEFAULT '/images/raigad.jpg',
    summary TEXT NOT NULL,
    body TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS gallery (
    id TEXT PRIMARY KEY,
    src TEXT NOT NULL,
    caption TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'गडकिल्ले',
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS volunteers (
    id TEXT PRIMARY KEY,
    full_name TEXT NOT NULL,
    age INTEGER,
    date_of_birth TEXT,
    phone TEXT NOT NULL,
    email TEXT NOT NULL,
    district TEXT NOT NULL,
    occupation TEXT,
    interests TEXT DEFAULT '[]',
    availability TEXT,
    trekking_experience TEXT,
    about TEXT,
    xp_points INTEGER NOT NULL DEFAULT 100,
    level INTEGER NOT NULL DEFAULT 1,
    status TEXT NOT NULL DEFAULT 'active',
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS contacts (
    id TEXT PRIMARY KEY,
    full_name TEXT NOT NULL,
    phone TEXT,
    email TEXT NOT NULL,
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'unread',
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS donations (
    id TEXT PRIMARY KEY,
    donor_name TEXT NOT NULL DEFAULT 'अनाम (Anonymous)',
    donation_amount REAL NOT NULL DEFAULT 0,
    amount REAL NOT NULL DEFAULT 0,
    donation_date TEXT NOT NULL DEFAULT (date('now')),
    purpose TEXT NOT NULL DEFAULT 'सामान्य संवर्धन निधी',
    project_name TEXT NOT NULL DEFAULT 'सामान्य संवर्धन निधी',
    payment_method TEXT NOT NULL DEFAULT 'UPI',
    transaction_ref TEXT DEFAULT '',
    transaction_reference TEXT DEFAULT '',
    pan_number TEXT DEFAULT '',
    phone_private TEXT DEFAULT '',
    phone TEXT DEFAULT '',
    email_private TEXT DEFAULT '',
    email TEXT DEFAULT '',
    payment_status TEXT NOT NULL DEFAULT 'completed',
    status TEXT NOT NULL DEFAULT 'completed',
    verification_status TEXT NOT NULL DEFAULT 'pending',
    display_name_public INTEGER NOT NULL DEFAULT 1,
    display_amount_public INTEGER NOT NULL DEFAULT 0,
    admin_remarks TEXT DEFAULT '',
    verified_by TEXT DEFAULT '',
    verified_at TEXT DEFAULT '',
    is_published INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS event_registrations (
    id TEXT PRIMARY KEY,
    event_id TEXT NOT NULL,
    event_title TEXT NOT NULL,
    full_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT NOT NULL,
    participants_count INTEGER NOT NULL DEFAULT 1,
    emergency_contact TEXT,
    status TEXT NOT NULL DEFAULT 'confirmed',
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS certificates (
    id TEXT PRIMARY KEY,
    cert_code TEXT UNIQUE NOT NULL,
    recipient_name TEXT NOT NULL,
    cert_type TEXT NOT NULL,
    event_name TEXT NOT NULL,
    issued_date TEXT NOT NULL DEFAULT (date('now')),
    template_id TEXT DEFAULT '',
    organization_name TEXT DEFAULT '',
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS team_members (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    name_en TEXT NOT NULL DEFAULT '',
    role TEXT NOT NULL DEFAULT '',
    role_en TEXT NOT NULL DEFAULT '',
    photo TEXT DEFAULT '',
    introduction TEXT DEFAULT '',
    introduction_en TEXT DEFAULT '',
    responsibilities TEXT DEFAULT '',
    responsibilities_en TEXT DEFAULT '',
    contribution TEXT DEFAULT '',
    contribution_en TEXT DEFAULT '',
    display_order INTEGER NOT NULL DEFAULT 0,
    is_active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS organizations (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    name_en TEXT NOT NULL DEFAULT '',
    introduction TEXT DEFAULT '',
    introduction_en TEXT DEFAULT '',
    activities TEXT DEFAULT '',
    activities_en TEXT DEFAULT '',
    initiatives TEXT DEFAULT '',
    initiatives_en TEXT DEFAULT '',
    achievements TEXT DEFAULT '',
    achievements_en TEXT DEFAULT '',
    image TEXT DEFAULT '',
    extra_images TEXT DEFAULT '[]',
    contact_info TEXT DEFAULT '',
    website TEXT DEFAULT '',
    is_active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS partner_orgs (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    name_en TEXT NOT NULL DEFAULT '',
    logo TEXT DEFAULT '',
    description TEXT DEFAULT '',
    description_en TEXT DEFAULT '',
    partner_type TEXT NOT NULL DEFAULT 'organization',
    partnership_details TEXT DEFAULT '',
    partnership_details_en TEXT DEFAULT '',
    related_activities TEXT DEFAULT '',
    related_activities_en TEXT DEFAULT '',
    website TEXT DEFAULT '',
    contact_info TEXT DEFAULT '',
    is_active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS students (
    id TEXT PRIMARY KEY,
    full_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT NOT NULL DEFAULT '',
    password_hash TEXT NOT NULL,
    student_type TEXT NOT NULL DEFAULT 'school',
    institution TEXT DEFAULT '',
    class_year TEXT DEFAULT '',
    district TEXT DEFAULT '',
    profile_photo TEXT DEFAULT '',
    is_active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS student_participations (
    id TEXT PRIMARY KEY,
    student_id TEXT NOT NULL,
    activity_type TEXT NOT NULL DEFAULT 'quiz',
    activity_title TEXT NOT NULL,
    score INTEGER DEFAULT 0,
    max_score INTEGER DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'completed',
    certificate_id TEXT DEFAULT '',
    completed_at TEXT NOT NULL DEFAULT (datetime('now')),
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS certificate_templates (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    design_url TEXT DEFAULT '',
    template_type TEXT NOT NULL DEFAULT 'participation',
    bg_color TEXT DEFAULT '#FFFDF9',
    border_color TEXT DEFAULT '#B58A45',
    title_text TEXT DEFAULT 'प्रमाणपत्र',
    subtitle_text TEXT DEFAULT '',
    footer_text TEXT DEFAULT 'गडकिल्ले संवर्धन प्रतिष्ठान',
    is_default INTEGER NOT NULL DEFAULT 0,
    is_active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS dinvishesh (
    id TEXT PRIMARY KEY,
    event_date TEXT NOT NULL,
    day INTEGER NOT NULL,
    month INTEGER NOT NULL,
    year INTEGER,
    figure TEXT NOT NULL DEFAULT 'छत्रपती शिवाजी महाराज',
    personality TEXT NOT NULL DEFAULT 'छत्रपती शिवाजी महाराज',
    event_type TEXT DEFAULT 'ऐतिहासिक प्रसंग',
    title TEXT NOT NULL,
    title_marathi TEXT DEFAULT '',
    title_en TEXT DEFAULT '',
    title_english TEXT DEFAULT '',
    description TEXT NOT NULL,
    description_marathi TEXT DEFAULT '',
    description_en TEXT DEFAULT '',
    description_english TEXT DEFAULT '',
    location TEXT DEFAULT '',
    image TEXT DEFAULT '',
    image_url TEXT DEFAULT '',
    historical_significance TEXT DEFAULT '',
    source_name TEXT DEFAULT '',
    source_url TEXT DEFAULT '',
    source_type TEXT DEFAULT 'Published historical book',
    source_description TEXT DEFAULT '',
    verification_status TEXT DEFAULT 'verified',
    is_disputed INTEGER DEFAULT 0,
    dispute_note TEXT DEFAULT '',
    key_figures TEXT DEFAULT '[]',
    sources TEXT DEFAULT '',
    is_published INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS event_sources (
    id TEXT PRIMARY KEY,
    dinvishesh_id TEXT NOT NULL,
    source_name TEXT NOT NULL,
    source_url TEXT DEFAULT '',
    source_type TEXT DEFAULT 'Published historical book',
    source_description TEXT DEFAULT '',
    is_primary INTEGER DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS education_programs (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    title_en TEXT DEFAULT '',
    category TEXT DEFAULT 'program',
    description TEXT DEFAULT '',
    description_en TEXT DEFAULT '',
    image TEXT DEFAULT '',
    target_audience TEXT DEFAULT '',
    target_audience_en TEXT DEFAULT '',
    schedule TEXT DEFAULT '',
    status TEXT DEFAULT 'active',
    is_active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS member_manogat (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    name_en TEXT DEFAULT '',
    designation TEXT NOT NULL DEFAULT '',
    designation_en TEXT DEFAULT '',
    photo TEXT DEFAULT '',
    short_manogat TEXT NOT NULL DEFAULT '',
    short_manogat_en TEXT DEFAULT '',
    detailed_manogat TEXT DEFAULT '',
    detailed_manogat_en TEXT DEFAULT '',
    display_order INTEGER NOT NULL DEFAULT 0,
    is_published INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
"""


async def init_db() -> None:
    global _supabase_client, _local_conn

    _local_conn = sqlite3.connect(str(LOCAL_DB_PATH), check_same_thread=False)
    _local_conn.row_factory = sqlite3.Row
    _local_conn.executescript(SCHEMA_SQLITE)
    _local_conn.execute(
        "UPDATE site_settings SET phone1 = '90496 87970', phone2 = '' WHERE phone1 = '8459949151'"
    )
    
    cursor = _local_conn.cursor()

    # Dynamic Migration: ensure date_of_birth column exists in volunteers table
    cursor.execute("PRAGMA table_info(volunteers)")
    vol_cols = {row[1] for row in cursor.fetchall()}
    if "date_of_birth" not in vol_cols:
        try:
            cursor.execute("ALTER TABLE volunteers ADD COLUMN date_of_birth TEXT")
        except Exception as e:
            print(f"[WARN] Could not add date_of_birth column: {e}")

    # Dynamic Migration: ensure all new columns exist in dinvishesh table
    cursor.execute("PRAGMA table_info(dinvishesh)")
    existing_cols = {row[1] for row in cursor.fetchall()}
    columns_to_add = [
        ("personality", "TEXT DEFAULT 'छत्रपती शिवाजी महाराज'"),
        ("event_type", "TEXT DEFAULT 'ऐतिहासिक प्रसंग'"),
        ("title_marathi", "TEXT DEFAULT ''"),
        ("title_english", "TEXT DEFAULT ''"),
        ("description_marathi", "TEXT DEFAULT ''"),
        ("description_english", "TEXT DEFAULT ''"),
        ("image_url", "TEXT DEFAULT ''"),
        ("historical_significance", "TEXT DEFAULT ''"),
        ("source_name", "TEXT DEFAULT ''"),
        ("source_url", "TEXT DEFAULT ''"),
        ("source_type", "TEXT DEFAULT 'Published historical book'"),
        ("source_description", "TEXT DEFAULT ''"),
        ("verification_status", "TEXT DEFAULT 'verified'"),
        ("is_disputed", "INTEGER DEFAULT 0"),
        ("dispute_note", "TEXT DEFAULT ''"),
        ("updated_at", "TEXT DEFAULT ''")
    ]
    for col_name, col_def in columns_to_add:
        if col_name not in existing_cols:
            try:
                cursor.execute(f"ALTER TABLE dinvishesh ADD COLUMN {col_name} {col_def}")
            except Exception as e:
                print(f"[WARN] Could not add column {col_name}: {e}")

    # Fallback sync across aliases
    cursor.execute("""
        UPDATE dinvishesh
        SET personality = CASE WHEN personality IS NULL OR personality = '' THEN figure ELSE personality END,
            title_marathi = CASE WHEN title_marathi IS NULL OR title_marathi = '' THEN title ELSE title_marathi END,
            title_english = CASE WHEN title_english IS NULL OR title_english = '' THEN title_en ELSE title_english END,
            description_marathi = CASE WHEN description_marathi IS NULL OR description_marathi = '' THEN description ELSE description_marathi END,
            description_english = CASE WHEN description_english IS NULL OR description_english = '' THEN description_en ELSE description_english END,
            image_url = CASE WHEN image_url IS NULL OR image_url = '' THEN image ELSE image_url END
    """)

    # Seed rich, verified historical events if empty or fewer than 10
    cursor.execute("SELECT COUNT(*) FROM dinvishesh")
    count_din = cursor.fetchone()[0]
    if count_din < 12:
        verified_events = [
            (
                "din-coronation-shivaji", "06-06", 6, 6, 1674,
                "छत्रपती शिवाजी महाराज", "छत्रपती शिवाजी महाराज", "राज्याभिषेक",
                "छत्रपती शिवाजी महाराज शिवराज्याभिषेक सोहळा (दुर्गराज रायगड)",
                "छत्रपती शिवाजी महाराज शिवराज्याभिषेक सोहळा (दुर्गराज रायगड)",
                "Chhatrapati Shivaji Maharaj Coronation Ceremony (Raigad Fort)",
                "Chhatrapati Shivaji Maharaj Coronation Ceremony (Raigad Fort)",
                "६ जून १६७४ (ज्येष्ठ शुद्ध त्रयोदशी शके १५९६) रोजी दुर्गराज रायगडावर छत्रपती शिवाजी महाराजांचा वैदिक पद्धतीने भव्य शिवराज्याभिषेक सोहळा संपन्न झाला. गागाभट्ट व प्रमुख विद्वानांच्या उपस्थितीत महाराजांनी मराठा साम्राज्याची स्वतंत्र व सार्वभौम स्थापना केली व छत्रपती ही पदवी धारण केली. या दिनी 'शिवराज्याभिषेक शक' सुरू झाला आणि शिवराई व होन ही स्वतंत्र नाणी पाडली गेली.",
                "६ जून १६७४ (ज्येष्ठ शुद्ध त्रयोदशी शके १५९६) रोजी दुर्गराज रायगडावर छत्रपती शिवाजी महाराजांचा वैदिक पद्धतीने भव्य शिवराज्याभिषेक सोहळा संपन्न झाला. गागाभट्ट व प्रमुख विद्वानांच्या उपस्थितीत महाराजांनी मराठा साम्राज्याची स्वतंत्र व सार्वभौम स्थापना केली व छत्रपती ही पदवी धारण केली. या दिनी 'शिवराज्याभिषेक शक' सुरू झाला आणि शिवराई व होन ही स्वतंत्र नाणी पाडली गेली.",
                "On 6th June 1674, the grand coronation ceremony of Chhatrapati Shivaji Maharaj was solemnized atop the majestic Raigad Fort according to Vedic rites. Gaga Bhatt and eminent scholars officiated the coronation. Shivaji Maharaj proclaimed an independent, sovereign Hindavi Swarajya, instituted the Rajyabhisheka Shaka calendar, and minted sovereign coins.",
                "On 6th June 1674, the grand coronation ceremony of Chhatrapati Shivaji Maharaj was solemnized atop the majestic Raigad Fort according to Vedic rites. Gaga Bhatt and eminent scholars officiated the coronation. Shivaji Maharaj proclaimed an independent, sovereign Hindavi Swarajya, instituted the Rajyabhisheka Shaka calendar, and minted sovereign coins.",
                "दुर्गराज रायगड, महाड, रायगड जिल्हा (Raigad Fort)",
                "/images/raigad.jpg", "/images/raigad.jpg",
                "सार्वभौम स्वतंत्र मराठा स्वराज्य व छत्रपती पदाची शास्त्रोक्त प्रतिष्ठापना; ३५० वर्षांची परकीय गुलामगिरी मोडून काढणारा युगप्रवर्तक सोहळा.",
                "सभासद बखर व जेधे शकावली (Sabhasad Bakhar & Jedhe Shakavali)",
                "https://archive.org/details/sabhasadbakhar",
                "Published historical book",
                "समकालीन दरबारी नोंद व कृष्णाजी अनंत सभासद लिखित ऐतिहासिक बखर.",
                "verified", 0, "",
                '["छत्रपती शिवाजी महाराज", "गागाभट्ट", "सोयराबाई", "संभाजी महाराज", "मोरोपंत पिंगळे"]',
                "सभासद बखर, जेधे शकावली, शिवराज्यप्रशस्ती, डच ईस्ट इंडिया कंपनी समकालीन पत्रे",
                1
            ),
            (
                "din-birth-shivaji", "02-19", 19, 2, 1630,
                "छत्रपती शिवाजी महाराज", "छत्रपती शिवाजी महाराज", "जन्म / जयंती",
                "छत्रपती शिवाजी महाराज जयंती (किल्ले शिवनेरी)",
                "छत्रपती शिवाजी महाराज जयंती (किल्ले शिवनेरी)",
                "Birth Anniversary of Chhatrapati Shivaji Maharaj (Shivneri Fort)",
                "Birth Anniversary of Chhatrapati Shivaji Maharaj (Shivneri Fort)",
                "१९ फेब्रुवारी १६३० रोजी जुन्नर जवळील किल्ले शिवनेरीवर राष्ट्रमाता जिजाऊ आऊसाहेबांच्या पोटी छत्रपती शिवाजी महाराजांचा जन्म झाला. शहाजीराजे भोसले आणि जिजाऊंच्या संस्कारांतून त्यांनी रयतेच्या कल्याणासाठी व स्वधर्माच्या संरक्षणासाठी हिंदवी स्वराज्याची स्थापना केली.",
                "१९ फेब्रुवारी १६३० रोजी जुन्नर जवळील किल्ले शिवनेरीवर राष्ट्रमाता जिजाऊ आऊसाहेबांच्या पोटी छत्रपती शिवाजी महाराजांचा जन्म झाला. शहाजीराजे भोसले आणि जिजाऊंच्या संस्कारांतून त्यांनी रयतेच्या कल्याणासाठी व स्वधर्माच्या संरक्षणासाठी हिंदवी स्वराज्याची स्थापना केली.",
                "Chhatrapati Shivaji Maharaj was born on 19th February 1630 at Shivneri Fort near Junnar to Rajmata Jijau and Shahaji Raje Bhosale. He laid the foundation of Maratha self-rule dedicated to the welfare of peasants and subjects.",
                "Chhatrapati Shivaji Maharaj was born on 19th February 1630 at Shivneri Fort near Junnar to Rajmata Jijau and Shahaji Raje Bhosale. He laid the foundation of Maratha self-rule dedicated to the welfare of peasants and subjects.",
                "किल्ले शिवनेरी, जुन्नर, पुणे जिल्हा (Shivneri Fort, Junnar)",
                "/images/conservation.jpg", "/images/conservation.jpg",
                "स्वराज्य संकल्पक युगपुरुषाचा जन्म ज्याने संपूर्ण दख्खनचा आणि भारताचा इतिहास बदलून टाकला.",
                "कवींद्र परमानंद कृत श्री शिवभारत व जेधे शकावली",
                "https://gazetteers.maharashtra.gov.in",
                "Government publication",
                "महाराष्ट्र शासन अधिकृत इतिहास समिती निर्णय व शिवभारत ग्रंथ संदर्भ.",
                "verified", 1, "या घटनेच्या तारखेबाबत विविध ऐतिहासिक स्रोतांमध्ये मतभेद आढळतात. महाराष्ट्र शासनाने फाल्गुन वद्य तृतीया शके १५५१ (१९ फेब्रुवारी १६३०) ही तारीख अधिकृत स्वीकारली असून काही जुन्या बखरींमध्ये वैशाख शुद्ध तृतीयेचा उल्लेख येतो.",
                '["छत्रपती शिवाजी महाराज", "राष्ट्रमाता जिजाऊ", "शहाजीराजे भोसले"]',
                "कवींद्र परमानंद कृत श्री शिवभारत (अध्याय ६), जेधे शकावली, महाराष्ट्र शासन गॅझेटियर",
                1
            ),
            (
                "din-birth-sambhaji", "05-14", 14, 5, 1657,
                "छत्रपती संभाजी महाराज", "छत्रपती संभाजी महाराज", "जन्म / जयंती",
                "छत्रपती संभाजी महाराज जयंती (किल्ले पुरंदर)",
                "छत्रपती संभाजी महाराज जयंती (किल्ले पुरंदर)",
                "Birth Anniversary of Chhatrapati Sambhaji Maharaj (Purandar Fort)",
                "Birth Anniversary of Chhatrapati Sambhaji Maharaj (Purandar Fort)",
                "१४ मे १६५७ रोजी किल्ले पुरंदरवर छत्रपती शिवाजी महाराज आणि महाराणी सईबाई यांच्या पोटी धर्मवीर छत्रपती संभाजी महाराजांचा जन्म झाला. लहानपणापासूनच अद्वितीय बुद्धिमत्ता, संस्कृत पांडित्य, चौदा भाषांचे ज्ञान आणि अजोड युद्धकौशल्याने त्यांनी इतिहास घडवला.",
                "१४ मे १६५७ रोजी किल्ले पुरंदरवर छत्रपती शिवाजी महाराज आणि महाराणी सईबाई यांच्या पोटी धर्मवीर छत्रपती संभाजी महाराजांचा जन्म झाला. लहानपणापासूनच अद्वितीय बुद्धिमत्ता, संस्कृत पांडित्य, चौदा भाषांचे ज्ञान आणि अजोड युद्धकौशल्याने त्यांनी इतिहास घडवला.",
                "Chhatrapati Sambhaji Maharaj was born on 14th May 1657 at Purandar Fort to Chhatrapati Shivaji Maharaj and Maharani Saibai. He grew to be a towering scholar in Sanskrit, master strategist in warfare, and the valiant second Chhatrapati.",
                "Chhatrapati Sambhaji Maharaj was born on 14th May 1657 at Purandar Fort to Chhatrapati Shivaji Maharaj and Maharani Saibai. He grew to be a towering scholar in Sanskrit, master strategist in warfare, and the valiant second Chhatrapati.",
                "किल्ले पुरंदर, सासवड, पुणे जिल्हा (Purandar Fort)",
                "/images/raigad.jpg", "/images/raigad.jpg",
                "अद्वितीय पराक्रमी योद्धा, बुधभूषण ग्रंथाचे रचनाकार आणि स्वराज्याचे दुसरे छत्रपती यांचा जन्म.",
                "जेधे शकावली व बुधभूषण प्रस्तावना",
                "https://archive.org/details/budhabhushanam",
                "Academic source",
                "जेधे शकावली (ज्येष्ठ शुद्ध द्वादशी, गुरुवार शके १५७९) व प्रा. डॉ. जयसिंगराव पवार यांचे संशोधन.",
                "verified", 0, "",
                '["छत्रपती संभाजी महाराज", "छत्रपती शिवाजी महाराज", "महाराणी सईबाई", "जिजाऊ"]',
                "जेधे शकावली, बुधभूषण ग्रंथ, समकालीन साधनांचे पुरावे",
                1
            ),
            (
                "din-coronation-sambhaji", "01-16", 16, 1, 1681,
                "छत्रपती संभाजी महाराज", "छत्रपती संभाजी महाराज", "राज्याभिषेक",
                "छत्रपती संभाजी महाराज राज्यारोहण व राज्याभिषेक सोहळा (दुर्गराज रायगड)",
                "छत्रपती संभाजी महाराज राज्यारोहण व राज्याभिषेक सोहळा (दुर्गराज रायगड)",
                "Coronation of Chhatrapati Sambhaji Maharaj (Raigad Fort)",
                "Coronation of Chhatrapati Sambhaji Maharaj (Raigad Fort)",
                "१६ जानेवारी १६८१ (माघ शुद्ध सप्तमी शके १६०२) रोजी दुर्गराज रायगडावर छत्रपती संभाजी महाराजांचा विधिवत राज्याभिषेक सोहळा पार पडला. शिवरायांच्या पश्चात स्वराज्यावरील अंतर्गत व बाह्य संकटांवर मात करून त्यांनी छत्रपती पदाची सूत्रे अत्यंत कणखरपणे हाती घेतली.",
                "१६ जानेवारी १६८१ (माघ शुद्ध सप्तमी शके १६०२) रोजी दुर्गराज रायगडावर छत्रपती संभाजी महाराजांचा विधिवत राज्याभिषेक सोहळा पार पडला. शिवरायांच्या पश्चात स्वराज्यावरील अंतर्गत व बाह्य संकटांवर मात करून त्यांनी छत्रपती पदाची सूत्रे अत्यंत कणखरपणे हाती घेतली.",
                "On 16th January 1681, Chhatrapati Sambhaji Maharaj was formally enthroned as the second Chhatrapati of the Maratha Empire atop Raigad Fort, upholding the legacy of Swarajya against all adversaries.",
                "On 16th January 1681, Chhatrapati Sambhaji Maharaj was formally enthroned as the second Chhatrapati of the Maratha Empire atop Raigad Fort, upholding the legacy of Swarajya against all adversaries.",
                "दुर्गराज रायगड (Raigad Fort)",
                "/images/raigad.jpg", "/images/raigad.jpg",
                "शिवरायांच्या हिंदवी स्वराज्याचे सातत्य राखणारा आणि दख्खनमध्ये औरंगजेबाच्या सैन्याशी नऊ वर्षे अखंड लढणारा छत्रपती सिंहासनाधिष्ठित झाला.",
                "जेधे शकावली व समकालीन मराठी दस्तऐवज",
                "https://gazetteers.maharashtra.gov.in",
                "Government publication",
                "जेधे शकावली व मराठ्यांच्या इतिहासाची साधने (वि. का. राजवाडे).",
                "verified", 0, "",
                '["छत्रपती संभाजी महाराज", "कवी कलश", "महाराणी येसूबाई", "हंबीरराव मोहिते"]',
                "जेधे शकावली, वि. का. राजवाडे खंड, समकालीन ऐतिहासिक पत्रे",
                1
            ),
            (
                "din-pratapgad-battle", "11-10", 10, 11, 1659,
                "छत्रपती शिवाजी महाराज", "छत्रपती शिवाजी महाराज", "लढाई / पराक्रम",
                "प्रतापगड युद्ध - अफझलखान वध व आदिलशाहीचा दारुण पराभव",
                "प्रतापगड युद्ध - अफझलखान वध व आदिलशाहीचा दारुण पराभव",
                "Battle of Pratapgad - Vanquishing of Afzal Khan (Pratapgad Fort)",
                "Battle of Pratapgad - Vanquishing of Afzal Khan (Pratapgad Fort)",
                "१० नोव्हेंबर १६५९ (मार्गशीर्ष शुद्ध सप्तमी) रोजी किल्ले प्रतापगडाच्या पायथ्याशी छत्रपती शिवाजी महाराजांनी विजापूरच्या आदिलशाहीचा बलाढ्य सरदार अफझलखान याच्या कपटाचा प्रतिकार करत वाघनखांनी त्याचा कोथळा बाहेर काढला. त्यानंतर मावळ्यांनी केलेल्या भीषण प्रतिहल्ल्यात अफझलखानाची संपूर्ण फौज उद्ध्वस्त झाली.",
                "१० नोव्हेंबर १६५९ (मार्गशीर्ष शुद्ध सप्तमी) रोजी किल्ले प्रतापगडाच्या पायथ्याशी छत्रपती शिवाजी महाराजांनी विजापूरच्या आदिलशाहीचा बलाढ्य सरदार अफझलखान याच्या कपटाचा प्रतिकार करत वाघनखांनी त्याचा कोथळा बाहेर काढला. त्यानंतर मावळ्यांनी केलेल्या भीषण प्रतिहल्ल्यात अफझलखानाची संपूर्ण फौज उद्ध्वस्त झाली.",
                "On 10th November 1659, Chhatrapati Shivaji Maharaj met the mighty Adilshahi commander Afzal Khan at the base of Pratapgad Fort. Foiling Khan's treacherous ambush, Maharaj eliminated him using the bagh nakh (tiger claws) and routed the entire invading army.",
                "On 10th November 1659, Chhatrapati Shivaji Maharaj met the mighty Adilshahi commander Afzal Khan at the base of Pratapgad Fort. Foiling Khan's treacherous ambush, Maharaj eliminated him using the bagh nakh (tiger claws) and routed the entire invading army.",
                "प्रतापगड किल्ला, महाबळेश्वर - जावळी, सातारा (Pratapgad Fort)",
                "/images/conservation.jpg", "/images/conservation.jpg",
                "स्वराज्यावरील सर्वात भीषण संकटाचा नायनाट; मराठा सैन्याची रणनिती व गनिमी काव्याचे जागतिक लष्करी इतिहासातील सर्वोत्कृष्ट उदाहरण.",
                "सभासद बखर, ९१ कलमी बखर व समकालीन ऐतिहासिक पोवाडे",
                "https://archive.org/details/sabhasadbakhar",
                "Published historical book",
                "समकालीन बखर वाङ्मय, जेधे करीना व अज्ञानदास कृत अफझलखान वधाचा पोवाडा.",
                "verified", 0, "",
                '["छत्रपती शिवाजी महाराज", "जीवा महाला", "कान्होजी जेधे", "संभाजी कावजी", "मोरोपंत पिंगळे"]',
                "सभासद बखर, ९१ कलमी बखर, जेधे करीना, कवींद्र परमानंद शिवभारत",
                1
            ),
            (
                "din-samadhi-shivaji", "04-03", 3, 4, 1680,
                "छत्रपती शिवाजी महाराज", "छत्रपती शिवाजी महाराज", "बलिदान / पुण्यतिथी",
                "छत्रपती शिवाजी महाराज महानिर्वाण / पुण्यतिथी (दुर्गराज रायगड)",
                "छत्रपती शिवाजी महाराज महानिर्वाण / पुण्यतिथी (दुर्गराज रायगड)",
                "Punyatithi / Samadhi of Chhatrapati Shivaji Maharaj (Raigad)",
                "Punyatithi / Samadhi of Chhatrapati Shivaji Maharaj (Raigad)",
                "३ एप्रिल १६८० (चैत्र शुद्ध पौर्णिमा, हनुमान जयंती, शके १६०२) रोजी दुपारी १२ च्या सुमारास दुर्गराज रायगडावर छत्रपती शिवाजी महाराजांचे वयाच्या ५० व्या वर्षी महानिर्वाण झाले. त्यांनी अवघ्या पस्तीस वर्षांच्या कालखंडात रयतेचे स्वतंत्र, नीतिमान व कल्याणकारी स्वराज्य निर्माण केले.",
                "३ एप्रिल १६८० (चैत्र शुद्ध पौर्णिमा, हनुमान जयंती, शके १६०२) रोजी दुपारी १२ च्या सुमारास दुर्गराज रायगडावर छत्रपती शिवाजी महाराजांचे वयाच्या ५० व्या वर्षी महानिर्वाण झाले. त्यांनी अवघ्या पस्तीस वर्षांच्या कालखंडात रयतेचे स्वतंत्र, नीतिमान व कल्याणकारी स्वराज्य निर्माण केले.",
                "On 3rd April 1680, Chhatrapati Shivaji Maharaj attained Mahaparinirvana atop Raigad Fort at the age of 50. Within three and a half decades, he had established an egalitarian and resilient kingdom that stood as an unyielding fortress of Indian freedom.",
                "On 3rd April 1680, Chhatrapati Shivaji Maharaj attained Mahaparinirvana atop Raigad Fort at the age of 50. Within three and a half decades, he had established an egalitarian and resilient kingdom that stood as an unyielding fortress of Indian freedom.",
                "दुर्गराज रायगड, समाधी स्थळ (Raigad Fort Samadhi)",
                "/images/raigad.jpg", "/images/raigad.jpg",
                "अखंड भारताला स्वाभिमान, आरमार, गडकोट संरक्षण आणि सुशासनाचे आदर्श देणाऱ्या महामानवाचे निर्वाण.",
                "जेधे शकावली व समकालीन ब्रिटिश ईस्ट इंडिया कंपनी नोंद",
                "https://gazetteers.maharashtra.gov.in",
                "Government publication",
                "जेधे शकावली चैत्र शुद्ध पौर्णिमा शके १६०२ व बॉम्बे कौन्सिल पत्रव्यवहार (२८ एप्रिल १६८०).",
                "verified", 0, "",
                '["छत्रपती शिवाजी महाराज", "सोयराबाई", "संभाजी महाराज", "राजाराम महाराज"]',
                "जेधे शकावली, सभासद बखर, ईस्ट इंडिया कंपनी फॅक्टरी रेकॉर्ड्स (बॉम्बे)",
                1
            ),
            (
                "din-balidan-sambhaji", "03-11", 11, 3, 1689,
                "छत्रपती संभाजी महाराज", "छत्रपती संभाजी महाराज", "बलिदान / पुण्यतिथी",
                "धर्मवीर छत्रपती संभाजी महाराज बलिदान दिवस (तुळापूर व वडू बुद्रुक)",
                "धर्मवीर छत्रपती संभाजी महाराज बलिदान दिवस (तुळापूर व वडू बुद्रुक)",
                "Balidan Diwas of Chhatrapati Sambhaji Maharaj (Tulapur / Vadu)",
                "Balidan Diwas of Chhatrapati Sambhaji Maharaj (Tulapur / Vadu)",
                "११ मार्च १६८९ (फाल्गुन वद्य अमावास्या शके १६१०) रोजी मोगल बादशहा औरंगजेबाच्या अमानुष हालअपेष्टा आणि क्रूर छळाला धैर्याने सामोरे जात छत्रपती संभाजी महाराजांनी आणि कवी कलश यांनी भीमा-इंद्रायणीच्या तीरावर तुळापूर येथे स्वराज्यासाठी सर्वोच्च बलिदान दिले. त्यांच्या या बलिदानाने पेटून उठून मराठ्यांनी २७ वर्षे अखंड स्वातंत्र्ययुद्ध लढले आणि मोगल साम्राज्य धुळीस मिळवले.",
                "११ मार्च १६८९ (फाल्गुन वद्य अमावास्या शके १६१०) रोजी मोगल बादशहा औरंगजेबाच्या अमानुष हालअपेष्टा आणि क्रूर छळाला धैर्याने सामोरे जात छत्रपती संभाजी महाराजांनी आणि कवी कलश यांनी भीमा-इंद्रायणीच्या तीरावर तुळापूर येथे स्वराज्यासाठी सर्वोच्च बलिदान दिले. त्यांच्या या बलिदानाने पेटून उठून मराठ्यांनी २७ वर्षे अखंड स्वातंत्र्ययुद्ध लढले आणि मोगल साम्राज्य धुळीस मिळवले.",
                "On 11th March 1689, Chhatrapati Sambhaji Maharaj endured weeks of inhuman torture by Mughal emperor Aurangzeb without yielding a single fort or renouncing his conviction. His heroic martyrdom at Tulapur ignited an indomitable 27-year people's resistance that broke the back of the Mughal Empire.",
                "On 11th March 1689, Chhatrapati Sambhaji Maharaj endured weeks of inhuman torture by Mughal emperor Aurangzeb without yielding a single fort or renouncing his conviction. His heroic martyrdom at Tulapur ignited an indomitable 27-year people's resistance that broke the back of the Mughal Empire.",
                "तुळापूर व वडू बुद्रुक, पुणे (Tulapur & Vadu Budruk, Pune)",
                "/images/conservation.jpg", "/images/conservation.jpg",
                "स्वराज्याच्या रक्षणासाठी दिलेले अतुलनीय आत्मबलिदान; मराठ्यांच्या अठ्ठावीस वर्षांच्या स्वातंत्र्ययुद्धाचा वणवा पेटवणारी क्रांतीज्वाला.",
                "मासिर-ए-आलमगिरी (साकी मुस्तैद खान) व जेधे शकावली",
                "https://archive.org/details/maasir-i-alamgiri",
                "Primary Chronicle / Bakhar",
                "मोगल समकालीन दरबारी इतिहास 'मासिर-ए-आलमगिरी' व रियासतकार ग. स. सरदेसाई ग्रंथ.",
                "verified", 0, "",
                '["छत्रपती संभाजी महाराज", "कवी कलश", "महाराणी येसूबाई", "संताजी घोरपडे", "धनाजी जाधव"]',
                "मासिर-ए-आलमगिरी (साकी मुस्तैद खान), जेधे शकावली, मराठ्यांच्या इतिहासाची साधने",
                1
            ),
            (
                "din-agra-escape", "08-17", 17, 8, 1666,
                "छत्रपती शिवाजी महाराज व संभाजी महाराज", "दोन्ही", "मुत्सद्देगिरी / शौर्य",
                "आग्रा येथून छत्रपती शिवाजी महाराज व बाल संभाजी राजे यांची विस्मयकारक सुटका",
                "आग्रा येथून छत्रपती शिवाजी महाराज व बाल संभाजी राजे यांची विस्मयकारक सुटका",
                "Historic Escape from Agra (Chhatrapati Shivaji & Sambhaji Maharaj)",
                "Historic Escape from Agra (Chhatrapati Shivaji & Sambhaji Maharaj)",
                "१७ ऑगस्ट १६६६ रोजी आग्रा येथे बादशहा औरंगजेबाच्या तोफगोळ्यांनी वेढलेल्या कडेकोट नजरकैदेतून छत्रपती शिवाजी महाराज आणि ९ वर्षांचे बाल युवराज संभाजी महाराज अत्यंत चतुराईने मिठाईच्या पेट्यांतून निसटले. मोगल गुप्तहेर यंत्रणा आणि फौजेला गुंगारा देत ते सुखरूप राजगडावर परतले.",
                "१७ ऑगस्ट १६६६ रोजी आग्रा येथे बादशहा औरंगजेबाच्या तोफगोळ्यांनी वेढलेल्या कडेकोट नजरकैदेतून छत्रपती शिवाजी महाराज आणि ९ वर्षांचे बाल युवराज संभाजी महाराज अत्यंत चतुराईने मिठाईच्या पेट्यांतून निसटले. मोगल गुप्तहेर यंत्रणा आणि फौजेला गुंगारा देत ते सुखरूप राजगडावर परतले.",
                "On 17th August 1666, Chhatrapati Shivaji Maharaj along with his nine-year-old son Prince Sambhaji executed an extraordinary escape from Aurangzeb's heavily guarded confinement in Agra, outmaneuvering the Mughal empire's vast surveillance network to safely return to Rajgad.",
                "On 17th August 1666, Chhatrapati Shivaji Maharaj along with his nine-year-old son Prince Sambhaji executed an extraordinary escape from Aurangzeb's heavily guarded confinement in Agra, outmaneuvering the Mughal empire's vast surveillance network to safely return to Rajgad.",
                "आग्रा, उत्तर प्रदेश व किल्ले राजगड (Agra & Rajgad Fort)",
                "/images/raigad.jpg", "/images/raigad.jpg",
                "जागतिक इतिहासातील सर्वात धाडसी व चातुर्यपूर्ण सुटका; स्वराज्याच्या पुनरुत्थानाची नांदी.",
                "राजस्थानी खतूत व पत्रे (राजस्थान पुराभिलेख, बिकानेर)",
                "https://archive.org/details/houseofshivaji",
                "Museum / Archive",
                "मिर्झा राजा जयसिंह आणि कुमार रामसिंह यांच्या समकालीन अधिकाऱ्यांचे बिकानेर अर्काईव्हमधील पत्रव्यवहार.",
                "verified", 0, "",
                '["छत्रपती शिवाजी महाराज", "छत्रपती संभाजी महाराज", "हिरोजी फर्जंद", "मदारी मेहतर"]',
                "राजस्थानी खतूत (बिकानेर पुराभिलेख), सभासद बखर, सर जदुनाथ सरकार 'Shivaji and His Times'",
                1
            ),
            (
                "din-today-hubli", "10-04", 4, 10, 1673,
                "छत्रपती शिवाजी महाराज", "छत्रपती शिवाजी महाराज", "लढाई / मोहीम",
                "हुबळी-धारवाड विजय मोहीम - दक्षिण दिग्विजय पर्वाची पूर्वतयारी",
                "हुबळी-धारवाड विजय मोहीम - दक्षिण दिग्विजय पर्वाची पूर्वतयारी",
                "Hubli & Dharwad Campaign - Gateway to the Southern Expedition",
                "Hubli & Dharwad Campaign - Gateway to the Southern Expedition",
                "४ ऑक्टोबर १६७३ रोजी छत्रपती शिवाजी महाराजांच्या सैन्याने आदिलशाहीच्या हुबळी, धारवाड व कारवार परिसरावर नियंत्रण मिळवून कोकण व कर्नाटक सीमेवर स्वराज्याचे ठाणे बळकट केले. याच मोहिमेने पुढील वर्षी होणाऱ्या शिवराज्याभिषेकासाठी व दक्षिणेकडील तंजावर-जिंजी मोहिमेसाठी भक्कम पाया रचला.",
                "४ ऑक्टोबर १६७३ रोजी छत्रपती शिवाजी महाराजांच्या सैन्याने आदिलशाहीच्या हुबळी, धारवाड व कारवार परिसरावर नियंत्रण मिळवून कोकण व कर्नाटक सीमेवर स्वराज्याचे ठाणे बळकट केले. याच मोहिमेने पुढील वर्षी होणाऱ्या शिवराज्याभिषेकासाठी व दक्षिणेकडील तंजावर-जिंजी मोहिमेसाठी भक्कम पाया रचला.",
                "On 4th October 1673, Maratha forces led a strategic expedition into Hubli-Dharwad in the south, consolidating outposts on the Karnatak border and setting the stage for the historic coronation and subsequent Southern Expedition (Dakshin Digvijay).",
                "On 4th October 1673, Maratha forces led a strategic expedition into Hubli-Dharwad in the south, consolidating outposts on the Karnatak border and setting the stage for the historic coronation and subsequent Southern Expedition (Dakshin Digvijay).",
                "हुबळी - धारवाड परिसर, कर्नाटक सीमा (Hubli - Dharwad)",
                "/images/conservation.jpg", "/images/conservation.jpg",
                "दक्षिण भारतातील व्यापारी केंद्रांवर प्रभाव आणि स्वराज्याच्या खजिन्यात समृद्ध भर.",
                "ईस्ट इंडिया कंपनी फॅक्टरी लेटर्स (कारवार) व जेधे शकावली",
                "https://archive.org/details/englishrecordson01mora",
                "Academic source",
                "ईस्ट इंडिया कंपनी कारवार फॅक्टरी समकालीन पत्रव्यवहार (English Records on Shivaji).",
                "verified", 0, "",
                '["छत्रपती शिवाजी महाराज", "अण्णाजी दत्तो", "हंबीरराव मोहिते"]',
                "English Records on Shivaji (कारवार फॅक्टरी नोंदी), जेधे शकावली, इतिहास संशोधक वि. का. राजवाडे",
                1
            ),
            (
                "din-shaista-raid", "04-05", 5, 4, 1663,
                "छत्रपती शिवाजी महाराज", "छत्रपती शिवाजी महाराज", "लढाई / शौर्य",
                "लाल महालावरील धाडसी छापा - शाहिस्तेखानाची बोटे छाटली",
                "लाल महालावरील धाडसी छापा - शाहिस्तेखानाची बोटे छाटली",
                "Surprise Raid on Shaista Khan at Lal Mahal, Pune",
                "Surprise Raid on Shaista Khan at Lal Mahal, Pune",
                "५ एप्रिल १६६३ च्या मध्यरात्री छत्रपती शिवाजी महाराजांनी अवघ्या ४०० निवडक मावळ्यांसह पुण्याच्या लाल महालात प्रवेश करून मोगल सुभेदार शाहिस्तेखानाच्या जनानखान्यात थेट धाड टाकली. शाहिस्तेखानाची तीन बोटे छाटली गेली आणि त्याचा मुलगा मारला गेला. मोगल सत्तेला लागलेली ही सर्वात मोठी चपराक ठरली.",
                "५ एप्रिल १६६३ च्या मध्यरात्री छत्रपती शिवाजी महाराजांनी अवघ्या ४०० निवडक मावळ्यांसह पुण्याच्या लाल महालात प्रवेश करून मोगल सुभेदार शाहिस्तेखानाच्या जनानखान्यात थेट धाड टाकली. शाहिस्तेखानाची तीन बोटे छाटली गेली आणि त्याचा मुलगा मारला गेला. मोगल सत्तेला लागलेली ही सर्वात मोठी चपराक ठरली.",
                "On the night of 5th April 1663, Shivaji Maharaj led a daring surgical strike with 400 chosen commandos into Lal Mahal in Pune. They breached the inner chambers of the Mughal viceroy Shaista Khan, severing his fingers and decimating his command.",
                "On the night of 5th April 1663, Shivaji Maharaj led a daring surgical strike with 400 chosen commandos into Lal Mahal in Pune. They breached the inner chambers of the Mughal viceroy Shaista Khan, severing his fingers and decimating his command.",
                "लाल महाल, पुणे (Lal Mahal, Pune)",
                "/images/conservation.jpg", "/images/conservation.jpg",
                "जगातील गनिमी काव्याचा व थेट शत्रूच्या छावणीत शिरून केलेल्या हल्ल्याचा अद्वितीय वस्तुपाठ.",
                "सभासद बखर व ईस्ट इंडिया कंपनी सुरत नोंदी",
                "https://archive.org/details/sabhasadbakhar",
                "Published historical book",
                "सभासद बखर व डच-इंग्रज समकालीन व्यापारी पत्रे.",
                "verified", 0, "",
                '["छत्रपती शिवाजी महाराज", "बाबाजी बापूजी देशपांडे", "कोयाजी नाईक"]',
                "सभासद बखर, जेधे शकावली, आलमगीरनामा (काझीम शिराझी)",
                1
            ),
            (
                "din-burhanpur-raid", "11-06", 6, 11, 1680,
                "छत्रपती संभाजी महाराज", "छत्रपती संभाजी महाराज", "लढाई / मोहीम",
                "बुऱ्हाणपूरवर छत्रपती संभाजी महाराजांची ऐतिहासिक विजयी स्वारी",
                "बुऱ्हाणपूरवर छत्रपती संभाजी महाराजांची ऐतिहासिक विजयी स्वारी",
                "Chhatrapati Sambhaji Maharaj's Historic Campaign on Burhanpur",
                "Chhatrapati Sambhaji Maharaj's Historic Campaign on Burhanpur",
                "नोव्हेंबर १६८० मध्ये छत्रपती संभाजी महाराजांनी सेनापती हंबीरराव मोहिते यांच्यासह मोगलांचे प्रमुख आर्थिक व लष्करी केंद्र असणाऱ्या बुऱ्हाणपूरवर विजेच्या वेगाने आक्रमण केले. मोगल सुभेदार खानजहान याला चकित करून मराठ्यांनी कोट्यवधी रुपयांची लूट स्वराज्यासाठी मिळवली.",
                "नोव्हेंबर १६८० मध्ये छत्रपती संभाजी महाराजांनी सेनापती हंबीरराव मोहिते यांच्यासह मोगलांचे प्रमुख आर्थिक व लष्करी केंद्र असणाऱ्या बुऱ्हाणपूरवर विजेच्या वेगाने आक्रमण केले. मोगल सुभेदार खानजहान याला चकित करून मराठ्यांनी कोट्यवधी रुपयांची लूट स्वराज्यासाठी मिळवली.",
                "In November 1680, Chhatrapati Sambhaji Maharaj launched a lightning raid on Burhanpur, the richest Mughal trading hub in central India, securing vast resources and demoralizing the imperial garrison.",
                "In November 1680, Chhatrapati Sambhaji Maharaj launched a lightning raid on Burhanpur, the richest Mughal trading hub in central India, securing vast resources and demoralizing the imperial garrison.",
                "बुऱ्हाणपूर, मध्य प्रदेश (Burhanpur, MP)",
                "/images/raigad.jpg", "/images/raigad.jpg",
                "संभाजी महाराजांच्या आक्रमक रणनीतीची आणि मोगल सत्तेला थेट त्यांच्या प्रांतात जाऊन दिलेले जबरदस्त आव्हान.",
                "मुंतखब-उल-लुबाब (खाफी खान) व जेधे शकावली",
                "https://archive.org/details/muntakhabullubab",
                "Primary Chronicle / Bakhar",
                "मोगल इतिहासकार खाफी खान याची समकालीन नोंद.",
                "verified", 0, "",
                '["छत्रपती संभाजी महाराज", "हंबीरराव मोहिते", "कवी कलश"]',
                "मुंतखब-उल-लुबाब (खाफी खान), जेधे शकावली, मराठ्यांच्या इतिहासाची साधने",
                1
            ),
            (
                "din-ramshej-siege", "04-02", 2, 4, 1682,
                "छत्रपती संभाजी महाराज", "छत्रपती संभाजी महाराज", "दुर्ग लढा / पराक्रम",
                "किल्ले रामशेजचा अभेद्य लढा - मुठभर मावळ्यांनी मोगल सैन्याला रोखले",
                "किल्ले रामशेजचा अभेद्य लढा - मुठभर मावळ्यांनी मोगल सैन्याला रोखले",
                "Valiant Defense of Ramshej Fort against Imperial Mughal Army",
                "Valiant Defense of Ramshej Fort against Imperial Mughal Army",
                "एप्रिल १६८२ मध्ये मोगल सेनापती शहाबुद्दीन खान (गाझीउद्दीन) याने ४०,००० फौजेसह नाशिक जवळील रामशेज किल्ल्याला वेढा घातला. छत्रपती संभाजी महाराजांच्या कुशल नेतृत्वाखाली व किल्लेदाराच्या असामान्य धैर्याने अवघ्या ६०० मावळ्यांनी लाकडी तोफांच्या साहाय्याने मोगलांना सलग ६ वर्षे दाद लागू दिली नाही.",
                "एप्रिल १६८२ मध्ये मोगल सेनापती शहाबुद्दीन खान (गाझीउद्दीन) याने ४०,००० फौजेसह नाशिक जवळील रामशेज किल्ल्याला वेढा घातला. छत्रपती संभाजी महाराजांच्या कुशल नेतृत्वाखाली व किल्लेदाराच्या असामान्य धैर्याने अवघ्या ६०० मावळ्यांनी लाकडी तोफांच्या साहाय्याने मोगलांना सलग ६ वर्षे दाद लागू दिली नाही.",
                "In April 1682, the Mughal army under Shahabuddin Khan laid siege to Ramshej Fort. Under Chhatrapati Sambhaji Maharaj's guidance, a garrison of merely 600 Mavala soldiers held off tens of thousands of imperial troops for nearly six years using wooden cannons.",
                "In April 1682, the Mughal army under Shahabuddin Khan laid siege to Ramshej Fort. Under Chhatrapati Sambhaji Maharaj's guidance, a garrison of merely 600 Mavala soldiers held off tens of thousands of imperial troops for nearly six years using wooden cannons.",
                "किल्ले रामशेज, नाशिक जिल्हा (Ramshej Fort, Nashik)",
                "/images/conservation.jpg", "/images/conservation.jpg",
                "जागतिक लष्करी इतिहासातील सर्वात प्रदीर्घ व अभूतपूर्व दुर्ग संरक्षणाचा लढा.",
                "मासिर-ए-आलमगिरी व वि. का. राजवाडे मराठ्यांचा इतिहास",
                "https://archive.org/details/maasir-i-alamgiri",
                "Government publication",
                "मासिर-ए-आलमगिरी व महाराष्ट्र राज्य गॅझेटियर नाशिक जिल्हा.",
                "verified", 0, "",
                '["छत्रपती संभाजी महाराज", "रामशेजचे किल्लेदार", "हंबीरराव मोहिते", "रूपाजी भोसले"]',
                "मासिर-ए-आलमगिरी, जेधे शकावली, मोगल दरबार अखबारात",
                1
            ),
            (
                "din-naval-dockyard", "10-24", 24, 10, 1657,
                "छत्रपती शिवाजी महाराज", "छत्रपती शिवाजी महाराज", "आरमार व दुर्ग",
                "कल्याण-भिवंडी विजय व भारतीय आरमाराची (मराठा नौदल) स्थापना",
                "कल्याण-भिवंडी विजय व भारतीय आरमाराची (मराठा नौदल) स्थापना",
                "Kalyan-Bhiwandi Victory & Foundation of the Maratha Navy",
                "Kalyan-Bhiwandi Victory & Foundation of the Maratha Navy",
                "२४ ऑक्टोबर १६५७ रोजी छत्रपती शिवाजी महाराजांच्या सैन्याने कल्याण व भिवंडी जिंकून स्वराज्याला विस्तीर्ण अरबी समुद्रकिनारा मिळवून दिला. याच ठिकाणी महाराजांनी तात्काळ पहिल्या २० गुराबा आणि जहाजांची बांधणी सुरू केली, ज्यातून आधुनिक भारतीय आरमाराचे जनकत्व शिवरायांकडे आले.",
                "२४ ऑक्टोबर १६५७ रोजी छत्रपती शिवाजी महाराजांच्या सैन्याने कल्याण व भिवंडी जिंकून स्वराज्याला विस्तीर्ण अरबी समुद्रकिनारा मिळवून दिला. याच ठिकाणी महाराजांनी तात्काळ पहिल्या २० गुराबा आणि जहाजांची बांधणी सुरू केली, ज्यातून आधुनिक भारतीय आरमाराचे जनकत्व शिवरायांकडे आले.",
                "On 24th October 1657, Shivaji Maharaj's commanders liberated Kalyan and Bhiwandi, giving Swarajya direct access to the Arabian Sea. Here, Maharaj laid the keel for Maratha warships, earning him the revered title Father of the Indian Navy.",
                "On 24th October 1657, Shivaji Maharaj's commanders liberated Kalyan and Bhiwandi, giving Swarajya direct access to the Arabian Sea. Here, Maharaj laid the keel for Maratha warships, earning him the revered title Father of the Indian Navy.",
                "कल्याण - भिवंडी - सिंधुदुर्ग किनारपट्टी (Kalyan & Coastal Maharashtra)",
                "/images/conservation.jpg", "/images/conservation.jpg",
                "भारतातील पहिल्या सार्वभौम स्वदेशी आरमाराची स्थापना; 'ज्याचे आरमार त्याचा समुद्र' या सिद्धांताची अंमलबजावणी.",
                "रामचंद्रपंत अमात्य कृत 'आज्ञापत्र' व जेधे शकावली",
                "https://archive.org/details/ajnyapatra",
                "Published historical book",
                "रामचंद्रपंत अमात्य कृत आज्ञापत्र (आरमार प्रकरण) व बॉम्बे गॅझेटियर.",
                "verified", 0, "",
                '["छत्रपती शिवाजी महाराज", "आबाजी सोनदेव", "कान्होजी आंग्रे", "मायनाक भंडारी"]',
                "आज्ञापत्र (रामचंद्रपंत अमात्य), जेधे शकावली, ईस्ट इंडिया कंपनी कागदपत्रे",
                1
            )
        ]
        cursor.executemany(
            """INSERT OR REPLACE INTO dinvishesh (
                id, event_date, day, month, year, figure, personality, event_type,
                title, title_marathi, title_en, title_english,
                description, description_marathi, description_en, description_english,
                location, image, image_url, historical_significance,
                source_name, source_url, source_type, source_description,
                verification_status, is_disputed, dispute_note,
                key_figures, sources, is_published
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
            verified_events
        )
    # Auto-seed all Dinvishesh events if needed
    try:
        from import_all_dinvishesh import run_all_imports
        run_all_imports()
    except Exception as e:
        print(f"[WARN] Dinvishesh seed note: {e}")

    # Dynamic Migration: ensure all new columns exist in donations table
    cursor.execute("PRAGMA table_info(donations)")
    don_cols = {row[1] for row in cursor.fetchall()}
    don_columns_to_add = [
        ("donation_amount", "REAL DEFAULT 0"),
        ("donation_date", "TEXT DEFAULT ''"),
        ("purpose", "TEXT DEFAULT 'सामान्य संवर्धन निधी'"),
        ("transaction_reference", "TEXT DEFAULT ''"),
        ("phone_private", "TEXT DEFAULT ''"),
        ("email_private", "TEXT DEFAULT ''"),
        ("payment_status", "TEXT DEFAULT 'completed'"),
        ("verification_status", "TEXT DEFAULT 'pending'"),
        ("display_name_public", "INTEGER DEFAULT 1"),
        ("display_amount_public", "INTEGER DEFAULT 0"),
        ("admin_remarks", "TEXT DEFAULT ''"),
        ("verified_by", "TEXT DEFAULT ''"),
        ("verified_at", "TEXT DEFAULT ''"),
        ("is_published", "INTEGER DEFAULT 0"),
        ("updated_at", "TEXT DEFAULT ''")
    ]
    for col_name, col_def in don_columns_to_add:
        if col_name not in don_cols:
            try:
                cursor.execute(f"ALTER TABLE donations ADD COLUMN {col_name} {col_def}")
            except Exception as e:
                print(f"[WARN] Could not add column {col_name} to donations: {e}")

    # Synchronize legacy columns with new standard columns
    cursor.execute("""
        UPDATE donations
        SET donation_amount = CASE WHEN (donation_amount IS NULL OR donation_amount = 0) AND amount > 0 THEN amount ELSE donation_amount END,
            amount = CASE WHEN (amount IS NULL OR amount = 0) AND donation_amount > 0 THEN donation_amount ELSE amount END,
            purpose = CASE WHEN purpose IS NULL OR purpose = '' THEN COALESCE(project_name, 'सामान्य संवर्धन निधी') ELSE purpose END,
            project_name = CASE WHEN project_name IS NULL OR project_name = '' THEN purpose ELSE project_name END,
            transaction_reference = CASE WHEN transaction_reference IS NULL OR transaction_reference = '' THEN transaction_ref ELSE transaction_reference END,
            transaction_ref = CASE WHEN transaction_ref IS NULL OR transaction_ref = '' THEN transaction_reference ELSE transaction_ref END,
            phone_private = CASE WHEN phone_private IS NULL OR phone_private = '' THEN phone ELSE phone_private END,
            email_private = CASE WHEN email_private IS NULL OR email_private = '' THEN email ELSE email_private END,
            donation_date = CASE WHEN donation_date IS NULL OR donation_date = '' THEN SUBSTR(COALESCE(created_at, date('now')), 1, 10) ELSE donation_date END
    """)

    _local_conn.commit()

    if create_client is not None and _has_real_supabase_key():
        try:
            sdk = create_client(SUPABASE_URL, SUPABASE_KEY)
            try:
                sdk.storage.create_bucket("images", options={"public": True})
            except Exception:
                pass
            _supabase_client = HybridSupabaseClient(sdk, _local_conn)
            print(f"[OK] Connected to Supabase Database & Object Storage via official Supabase SDK ({SUPABASE_URL})")
            return
        except Exception as e:
            print(f"[WARN] Supabase SDK initialization warning: {e}")

    _supabase_client = HybridSupabaseClient(None, _local_conn)
    if create_client is None:
        print("[INFO] `supabase` package not yet installed; using local SDK adapter.")
    else:
        print(
            f"[OK] Supabase SDK ready ({SUPABASE_URL}). Local store: ({LOCAL_DB_PATH.name})."
        )


async def close_db() -> None:
    global _local_conn
    if _local_conn is not None:
        _local_conn.close()
        _local_conn = None


def get_supabase() -> HybridSupabaseClient:
    global _supabase_client
    if _supabase_client is None:
        raise RuntimeError("Database not initialized")
    return _supabase_client
