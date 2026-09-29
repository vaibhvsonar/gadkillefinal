import os
import re
from dotenv import load_dotenv

load_dotenv()

def _extract_supabase_url() -> str:
    url = (
        os.getenv("SUPABASE_URL")
        or os.getenv("VITE_SUPABASE_URL")
        or os.getenv("NEXT_PUBLIC_SUPABASE_URL")
        or ""
    ).strip()
    if url:
        return url
    db_url = os.getenv("DATABASE_URL", "")
    match = re.search(r"db\.([a-z0-9]+)\.supabase\.co", db_url)
    if match:
        return f"https://{match.group(1)}.supabase.co"
    return "https://zsuwbwgtfjmgqgwlwnwd.supabase.co"

SUPABASE_URL = _extract_supabase_url()
SUPABASE_KEY = (
    os.getenv("SUPABASE_KEY")
    or os.getenv("SUPABASE_SERVICE_ROLE_KEY")
    or os.getenv("SUPABASE_ANON_KEY")
    or os.getenv("VITE_SUPABASE_ANON_KEY")
    or os.getenv("NEXT_PUBLIC_SUPABASE_ANON_KEY")
    or ""
).strip()

DATABASE_URL = os.getenv("DATABASE_URL", "")
PORT = int(os.getenv("PORT", "8000"))
HOST = os.getenv("HOST", "0.0.0.0")

# Admin Credentials (configurable via .env)
ADMIN_USERNAME = os.getenv("ADMIN_USERNAME", "admin")
ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD", "admin123")

# CORS Configuration
raw_origins = os.getenv("CORS_ALLOWED_ORIGIN", "*")
CORS_ORIGINS = [origin.strip() for origin in raw_origins.split(",") if origin.strip()]
if "*" in CORS_ORIGINS:
    CORS_ORIGINS = ["*"]
