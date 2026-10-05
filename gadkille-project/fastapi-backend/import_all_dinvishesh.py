# -*- coding: utf-8 -*-
"""
Master Import Script for all Dinvishesh Events (जानेवारी, फेब्रुवारी, मार्च, एप्रिल, मे, सप्टेंबर)
from 'शिवसाम्राज्याचे दिनविशेष' - गडकिल्ले संवर्धन प्रतिष्ठान, महाराष्ट्र राज्य.
"""
import sys
import io
import sqlite3
from pathlib import Path

# Ensure UTF-8 stdout on Windows
if sys.stdout and hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

# Add backend directory to sys.path
BASE_DIR = Path(__file__).parent
sys.path.insert(0, str(BASE_DIR))

from import_january_dinvishesh import run_import as import_jan
from import_february_dinvishesh import run_import as import_feb
from import_march_dinvishesh import run_import as import_mar
from import_april_dinvishesh import run_import as import_apr
from import_may_dinvishesh import run_import as import_may
from import_september_dinvishesh import run_import as import_sep

DB_PATH = BASE_DIR / "gadkille_admin.db"

def run_all_imports():
    print("=" * 70)
    print("🚩 गडकिल्ले संवर्धन प्रतिष्ठान - शिवसाम्राज्याचे दिनविशेष डेटाबेस आयात 🚩")
    print("=" * 70)

    print("\n[1/6] Importing January (जानेवारी) Dinvishesh...")
    import_jan()

    print("\n[2/6] Importing February (फेब्रुवारी) Dinvishesh...")
    import_feb()

    print("\n[3/6] Importing March (मार्च) Dinvishesh...")
    import_mar()

    print("\n[4/6] Importing April (एप्रिल) Dinvishesh...")
    import_apr()

    print("\n[5/6] Importing May (मे) Dinvishesh...")
    import_may()

    print("\n[6/6] Importing September (सप्टेंबर) Dinvishesh...")
    import_sep()

    # Query statistics from DB
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("SELECT month, COUNT(*) FROM dinvishesh GROUP BY month ORDER BY month")
    month_stats = cursor.fetchall()

    cursor.execute("SELECT COUNT(*) FROM dinvishesh")
    grand_total = cursor.fetchone()[0]
    conn.close()

    month_names = {
        1: "जानेवारी (January)",
        2: "फेब्रुवारी (February)",
        3: "मार्च (March)",
        4: "एप्रिल (April)",
        5: "मे (May)",
        6: "जून (June)",
        7: "जुलै (July)",
        8: "ऑगस्ट (August)",
        9: "सप्टेंबर (September)",
        10: "ऑक्टोबर (October)",
        11: "नोव्हेंबर (November)",
        12: "डिसेंबर (December)",
    }

    print("\n" + "=" * 70)
    print("📊 आयात सांख्यिकी (Dinvishesh Database Summary):")
    print("-" * 70)
    for m, count in month_stats:
        m_name = month_names.get(m, f"Month {m}")
        print(f"  • {m_name:<25}: {count} ऐतिहासिक नोंदी")
    print("-" * 70)
    print(f"  🚩 एकूण ऐतिहासिक दिनविशेष नोंदी (Total Events in DB): {grand_total}")
    print("=" * 70 + "\n")

if __name__ == "__main__":
    run_all_imports()
