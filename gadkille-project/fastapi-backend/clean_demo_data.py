import sqlite3
from pathlib import Path

db_path = Path(__file__).parent / "gadkille_admin.db"
conn = sqlite3.connect(db_path)
cur = conn.cursor()

tables_to_clear = [
    "donations",
    "member_manogat",
    "events",
    "event_registrations",
    "students",
    "student_participations",
    "volunteers",
    "contacts",
    "forts",
    "gallery",
    "projects",
    "news",
    "certificates",
    "certificate_templates",
    "education_programs",
    "organizations",
    "partner_orgs",
    "team_members"
]

print(f"Cleaning demo data from: {db_path.name}")
for t in tables_to_clear:
    try:
        cur.execute(f"DELETE FROM {t}")
        print(f"Cleared table: {t}")
    except Exception as e:
        print(f"Error clearing {t}: {e}")

conn.commit()

print("\nVerifying row counts after clearing:")
cur.execute("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name")
tables = [r[0] for r in cur.fetchall() if not r[0].startswith("sqlite_")]
for t in tables:
    cur.execute(f"SELECT count(*) FROM {t}")
    cnt = cur.fetchone()[0]
    print(f"{t.ljust(25)} : {cnt} rows")

conn.close()
