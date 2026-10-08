import sqlite3
from pathlib import Path

db_path = Path(__file__).parent / "gadkille_admin.db"
conn = sqlite3.connect(db_path)
cur = conn.cursor()

cur.execute("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name")
tables = [r[0] for r in cur.fetchall() if not r[0].startswith("sqlite_")]

print(f"Connected to {db_path.name}")
print("=" * 50)
for t in tables:
    cur.execute(f"SELECT count(*) FROM {t}")
    cnt = cur.fetchone()[0]
    print(f"{t.ljust(25)} : {cnt} rows")

conn.close()
