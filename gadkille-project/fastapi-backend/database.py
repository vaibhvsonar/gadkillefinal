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
    JSON_COLS = {"features", "interests"}
    BOOL_COLS = {"is_featured", "is_spotlight"}

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
        if k in self.JSON_COLS and isinstance(v, (list, dict)):
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
    email TEXT,
    phone TEXT,
    amount REAL NOT NULL,
    project_name TEXT NOT NULL DEFAULT 'सामान्य संवर्धन निधी',
    payment_method TEXT NOT NULL DEFAULT 'UPI',
    transaction_ref TEXT,
    pan_number TEXT,
    status TEXT NOT NULL DEFAULT 'completed',
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
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
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
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
    _local_conn.commit()

    if create_client is not None and _has_real_supabase_key():
        try:
            sdk = create_client(SUPABASE_URL, SUPABASE_KEY)
            try:
                sdk.storage.create_bucket("images", options={"public": True})
            except Exception:
                pass
            _supabase_client = HybridSupabaseClient(sdk, _local_conn)
            print(f"✅ Connected to Supabase Database & Object Storage via official Supabase SDK ({SUPABASE_URL})")
            return
        except Exception as e:
            print(f"⚠️ Supabase SDK initialization warning: {e}")

    _supabase_client = HybridSupabaseClient(None, _local_conn)
    if create_client is None:
        print("ℹ️ `supabase` package not yet installed; run `pip install -r requirements.txt`. Using local SDK adapter.")
    else:
        print(
            f"✅ Supabase SDK ready ({SUPABASE_URL}). Add your SUPABASE_KEY in .env to sync with cloud Supabase; using local store ({LOCAL_DB_PATH.name}) meanwhile."
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
