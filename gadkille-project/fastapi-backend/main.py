import uuid
import random
import base64
import re
import hashlib
import urllib.request
from contextlib import asynccontextmanager
from typing import List, Any, Optional
from datetime import date, datetime
from fastapi import FastAPI, Depends, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import uvicorn

from config import CORS_ORIGINS, PORT, HOST, ADMIN_USERNAME, ADMIN_PASSWORD
from database import init_db, close_db, get_supabase, LOCAL_UPLOADS_DIR
from models import (
    AdminLoginRequest, AdminLoginResponse, SiteSettingsSchema,
    FortSchema, TrekInfoSchema,
    EventCreate, EventRecord,
    ProjectCreate, ProjectRecord,
    NewsCreate, NewsRecord,
    GalleryCreate, GalleryRecord,
    ImageUploadRequest, ImageUploadResponse,
    VolunteerCreate, VolunteerResponse, VolunteerRecord,
    ContactCreate, ContactResponse, ContactRecord,
    DonationCreate, DonationAdminCreate, DonationAdminUpdate, DonationResponse, DonationRecord, PublicDonorRecord,
    EventRegistrationCreate, EventRegistrationResponse, EventRegistrationRecord,
    CertificateCreate, CertificateRecord,
    AdminStatsResponse,
    TeamMemberCreate, TeamMemberRecord,
    OrganizationCreate, OrganizationRecord,
    PartnerOrgCreate, PartnerOrgRecord,
    StudentRegisterRequest, StudentLoginRequest, StudentLoginResponse, StudentRecord,
    StudentParticipationCreate, StudentParticipationRecord,
    CertificateTemplateCreate, CertificateTemplateRecord,
    EducationProgramCreate, EducationProgramRecord,
    DonationSummaryResponse,
    DinvisheshCreate, DinvisheshRecord,
    ManogatCreate, ManogatUpdate, ManogatRecord,
)

def _hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    yield
    await close_db()

app = FastAPI(
    title="Gadkille Sanvardhan Pratishthan — Supabase SDK API",
    description="100% Admin-Driven Dynamic REST API powered by Supabase SDK",
    version="4.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

LOCAL_UPLOADS_DIR.mkdir(parents=True, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=str(LOCAL_UPLOADS_DIR)), name="uploads")


# ============================================================================
# Health & Admin Auth
# ============================================================================
@app.get("/api/health", tags=["Health"])
async def health_check(supabase: Any = Depends(get_supabase)):
    try:
        supabase.table("site_settings").select("id").limit(1).execute()
        return {"status": "healthy", "database": "supabase_sdk"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database unreachable: {str(e)}")


@app.post("/api/admin/login", response_model=AdminLoginResponse, tags=["Admin"])
async def admin_login(req: AdminLoginRequest):
    if req.username == ADMIN_USERNAME and req.password == ADMIN_PASSWORD:
        return AdminLoginResponse(
            token=f"gsp-admin-{uuid.uuid4()}",
            username=req.username,
            message="प्रशासन लॉगिन यशस्वी!"
        )
    raise HTTPException(status_code=401, detail="चुकीचे वापरकर्ता नाव किंवा पासवर्ड!")


@app.post("/api/upload", response_model=ImageUploadResponse, tags=["Storage"])
async def upload_image_to_storage(req: ImageUploadRequest, supabase: Any = Depends(get_supabase)):
    """
    Uploads an image file to Supabase Object Storage (`images` bucket) via the
    official Supabase SDK and returns its public URL so the link can be stored in DB.
    """
    raw_b64 = req.base64Data
    if "," in raw_b64:
        raw_b64 = raw_b64.split(",", 1)[1]
    try:
        file_bytes = base64.b64decode(raw_b64)
    except Exception:
        raise HTTPException(status_code=400, detail="अवैध इमेज फाइल डेटा (Invalid base64 image data).")

    ext = "jpg"
    if "." in req.fileName:
        ext = re.sub(r"[^a-zA-Z0-9]", "", req.fileName.rsplit(".", 1)[-1].lower()) or "jpg"
    safe_folder = re.sub(r"[^a-zA-Z0-9_-]", "", req.folder or "general") or "general"
    storage_path = f"{safe_folder}/{int(datetime.now().timestamp())}-{uuid.uuid4().hex[:8]}.{ext}"

    bucket = supabase.storage.from_("images")
    bucket.upload(
        path=storage_path,
        file=file_bytes,
        file_options={"content-type": req.contentType or "image/jpeg", "upsert": "true"},
    )
    public_url = bucket.get_public_url(storage_path)

    return ImageUploadResponse(
        url=public_url,
        path=storage_path,
        bucket="images",
    )


# ============================================================================
# 0. Site Settings API (Dynamic Org Info & Counters)
# ============================================================================
@app.get("/api/settings", response_model=SiteSettingsSchema, tags=["Settings"])
async def get_site_settings(supabase: Any = Depends(get_supabase)):
    res = supabase.table("site_settings").select("*").eq("id", 1).execute()
    if not res.data:
        return SiteSettingsSchema()
    row = res.data[0]
    return SiteSettingsSchema(
        nameMarathi=row.get("name_marathi", "गड-किल्ले संवर्धन प्रतिष्ठान"),
        nameEnglish=row.get("name_english", "Gadkille Sanvardhan Pratishthan"),
        state=row.get("state", "महाराष्ट्र राज्य"),
        founded=row.get("founded", "२०११"),
        founder=row.get("founder", "श्री. योगेश सोनवणे"),
        president=row.get("president", "श्री. अभिषेक नावले"),
        address=row.get("address", ""),
        phone1=row.get("phone1", ""),
        phone2=row.get("phone2", ""),
        email=row.get("email", ""),
        facebook=row.get("facebook", ""),
        motto=row.get("motto", ""),
        mission=row.get("mission", ""),
        bankName=row.get("bank_name", ""),
        bankAccount=row.get("bank_account", ""),
        bankIfsc=row.get("bank_ifsc", ""),
        upiId=row.get("upi_id", ""),
        statForts=int(row.get("stat_forts") or 0),
        statCampaigns=int(row.get("stat_campaigns") or 0),
        statVolunteers=int(row.get("stat_volunteers") or 0),
        statEvents=int(row.get("stat_events") or 0),
        statTrees=int(row.get("stat_trees") or 0),
    )


@app.put("/api/settings", response_model=SiteSettingsSchema, tags=["Settings"])
async def update_site_settings(req: SiteSettingsSchema, supabase: Any = Depends(get_supabase)):
    payload = {
        "id": 1,
        "name_marathi": req.nameMarathi,
        "name_english": req.nameEnglish,
        "state": req.state,
        "founded": req.founded,
        "founder": req.founder,
        "president": req.president,
        "address": req.address,
        "phone1": req.phone1,
        "phone2": req.phone2,
        "email": req.email,
        "facebook": req.facebook,
        "motto": req.motto,
        "mission": req.mission,
        "bank_name": req.bankName,
        "bank_account": req.bankAccount,
        "bank_ifsc": req.bankIfsc,
        "upi_id": req.upiId,
        "stat_forts": req.statForts,
        "stat_campaigns": req.statCampaigns,
        "stat_volunteers": req.statVolunteers,
        "stat_events": req.statEvents,
        "stat_trees": req.statTrees,
        "updated_at": datetime.now().isoformat(),
    }
    supabase.table("site_settings").upsert(payload, on_conflict="id").execute()
    return req


# ============================================================================
# 1. Forts CRUD API (गडकिल्ले — Only Admin-added Forts appear)
# ============================================================================
def _row_to_fort(row: dict) -> FortSchema:
    return FortSchema(
        id=row["id"],
        name=row["name"],
        nameEn=row["name_en"],
        district=row["district"],
        taluka=row.get("taluka") or "",
        height=row.get("height") or "",
        type=row.get("fort_type") or "गिरिदुर्ग",
        era=row.get("era") or "",
        difficulty=row.get("difficulty") or "मध्यम",
        difficultyEn=row.get("difficulty_en") or "moderate",
        status=row.get("status") or "progress",
        statusLabel=row.get("status_label") or "संवर्धन सुरू",
        image=row.get("image") or "/images/raigad.jpg",
        desc=row.get("description") or "",
        history=row.get("history") or "",
        trek=TrekInfoSchema(
            distance=row.get("trek_distance") or "",
            time=row.get("trek_time") or "",
            season=row.get("trek_season") or "वर्षभर",
            water=row.get("trek_water") or "उपलब्ध",
            network=row.get("trek_network") or "मध्यम",
        ),
        features=list(row.get("features") or []),
        latitude=float(row["latitude"] if row.get("latitude") is not None else 18.5),
        longitude=float(row["longitude"] if row.get("longitude") is not None else 73.8),
        isFeatured=bool(row.get("is_featured")),
        isSpotlight=bool(row.get("is_spotlight")),
    )


@app.get("/api/forts", response_model=List[FortSchema], tags=["Forts"])
async def list_forts(supabase: Any = Depends(get_supabase)):
    res = (
        supabase.table("forts")
        .select("*")
        .order("is_spotlight", desc=True)
        .order("is_featured", desc=True)
        .order("created_at", desc=False)
        .execute()
    )
    return [_row_to_fort(r) for r in res.data]


@app.get("/api/forts/{fort_id}", response_model=FortSchema, tags=["Forts"])
async def get_fort(fort_id: str, supabase: Any = Depends(get_supabase)):
    res = supabase.table("forts").select("*").eq("id", fort_id).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="किल्ला सापडला नाही")
    return _row_to_fort(res.data[0])


@app.post("/api/forts", response_model=FortSchema, status_code=201, tags=["Forts"])
async def create_or_update_fort(req: FortSchema, supabase: Any = Depends(get_supabase)):
    slug = req.id.strip().lower().replace(" ", "-")
    if req.isSpotlight:
        supabase.table("forts").update({"is_spotlight": False}).eq("is_spotlight", True).execute()

    payload = {
        "id": slug,
        "name": req.name,
        "name_en": req.nameEn,
        "district": req.district,
        "taluka": req.taluka,
        "height": req.height,
        "fort_type": req.type,
        "era": req.era,
        "difficulty": req.difficulty,
        "difficulty_en": req.difficultyEn,
        "status": req.status,
        "status_label": req.statusLabel,
        "image": req.image,
        "description": req.desc,
        "history": req.history,
        "trek_distance": req.trek.distance,
        "trek_time": req.trek.time,
        "trek_season": req.trek.season,
        "trek_water": req.trek.water,
        "trek_network": req.trek.network,
        "features": req.features,
        "latitude": req.latitude,
        "longitude": req.longitude,
        "is_featured": req.isFeatured,
        "is_spotlight": req.isSpotlight,
    }
    supabase.table("forts").upsert(payload, on_conflict="id").execute()
    req.id = slug
    return req


@app.delete("/api/forts/{fort_id}", tags=["Forts"])
async def delete_fort(fort_id: str, supabase: Any = Depends(get_supabase)):
    supabase.table("forts").delete().eq("id", fort_id).execute()
    return {"deleted": fort_id}


def extract_coords_from_url_or_text(text: str) -> Optional[dict]:
    if not text:
        return None
    # 1. Standard @lat,lng format
    m = re.search(r"@(-?\d+\.\d+),(-?\d+\.\d+)", text)
    if m:
        return {"latitude": float(m.group(1)), "longitude": float(m.group(2))}
    # 2. Embed / place parameters: !3d(lat)!4d(lng)
    m = re.search(r"!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)", text)
    if m:
        return {"latitude": float(m.group(1)), "longitude": float(m.group(2))}
    # 3. !2d(lng)!3d(lat)
    m = re.search(r"!2d(-?\d+\.\d+)!3d(-?\d+\.\d+)", text)
    if m:
        return {"latitude": float(m.group(2)), "longitude": float(m.group(1))}
    # 4. Query params ?q=lat,lng or ll=lat,lng or query=lat,lng or daddr=lat,lng
    m = re.search(r"[?&](?:q|query|ll|daddr|saddr|center)=(-?\d+\.\d+)[,%20]+(-?\d+\.\d+)", text, re.IGNORECASE)
    if m:
        return {"latitude": float(m.group(1)), "longitude": float(m.group(2))}
    # 5. DMS coordinates format
    m = re.search(r"(\d+)°(\d+)'([\d.]+)\"?([NS])[,\s]+(\d+)°(\d+)'([\d.]+)\"?([EW])", text, re.IGNORECASE)
    if m:
        lat = int(m.group(1)) + int(m.group(2)) / 60.0 + float(m.group(3)) / 3600.0
        if m.group(4).upper() == "S":
            lat = -lat
        lng = int(m.group(5)) + int(m.group(6)) / 60.0 + float(m.group(7)) / 3600.0
        if m.group(8).upper() == "W":
            lng = -lng
        return {"latitude": round(lat, 6), "longitude": round(lng, 6)}
    # 6. Raw coordinate numbers
    m = re.search(r"(-?\d{1,2}\.\d{4,})[,\s/]+(-?\d{1,3}\.\d{4,})", text)
    if m:
        lat, lng = float(m.group(1)), float(m.group(2))
        if -90 <= lat <= 90 and -180 <= lng <= 180:
            return {"latitude": lat, "longitude": lng}
    return None


@app.post("/api/resolve-maps-url", tags=["Forts"])
async def resolve_maps_url(payload: dict):
    raw_url = payload.get("url", "").strip()
    if not raw_url:
        raise HTTPException(status_code=400, detail="Google Maps URL किंवा मजकूर आवश्यक आहे.")
    
    # Check if we can extract directly without web request
    direct = extract_coords_from_url_or_text(raw_url)
    if direct:
        return {**direct, "resolvedUrl": raw_url}

    # If it's a web URL (e.g. maps.app.goo.gl shortlink), follow redirects
    if raw_url.startswith("http://") or raw_url.startswith("https://"):
        try:
            req = urllib.request.Request(
                raw_url,
                headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"}
            )
            with urllib.request.urlopen(req, timeout=5) as response:
                final_url = response.geturl()
                content = response.read(20000).decode("utf-8", errors="ignore")
                
                coords = extract_coords_from_url_or_text(final_url) or extract_coords_from_url_or_text(content)
                if coords:
                    return {**coords, "resolvedUrl": final_url}
        except Exception:
            pass

    coords = extract_coords_from_url_or_text(raw_url)
    if coords:
        return {**coords, "resolvedUrl": raw_url}
        
    raise HTTPException(
        status_code=422,
        detail="दिलेल्या Google Maps लिंक किंवा मजकुरामधून अक्षांश/रेखांश (Coordinates) सापडले नाहीत. कृपया योग्य लिंक किंवा Coordinates तपासा."
    )


# ============================================================================
# 2. Events CRUD API (मोहिमा व कार्यक्रम — Only Admin-added Events appear)
# ============================================================================
def _row_to_event(row: dict) -> EventRecord:
    return EventRecord(
        id=str(row["id"]),
        title=row["title"],
        type=row["event_type"],
        date=row["date_text"],
        dateNum=row["date_num"],
        month=row["month_text"],
        location=row["location"],
        district=row["district"],
        capacity=int(row["capacity"]),
        registered=int(row["registered"]),
        image=row["image"],
        desc=row["description"],
        status=row["status"],
    )


@app.get("/api/events", response_model=List[EventRecord], tags=["Events"])
async def list_events(supabase: Any = Depends(get_supabase)):
    res = supabase.table("events").select("*").order("created_at", desc=True).execute()
    return [_row_to_event(r) for r in res.data]


@app.post("/api/events", response_model=EventRecord, status_code=201, tags=["Events"])
async def create_event(req: EventCreate, supabase: Any = Depends(get_supabase)):
    new_id = str(uuid.uuid4())
    payload = {
        "id": new_id,
        "title": req.title,
        "event_type": req.type,
        "date_text": req.date,
        "date_num": req.dateNum,
        "month_text": req.month,
        "location": req.location,
        "district": req.district,
        "capacity": req.capacity,
        "registered": req.registered,
        "image": req.image,
        "description": req.desc,
        "status": req.status,
    }
    supabase.table("events").insert(payload).execute()
    return EventRecord(id=new_id, **req.model_dump())


@app.put("/api/events/{event_id}", response_model=EventRecord, tags=["Events"])
async def update_event(event_id: str, req: EventCreate, supabase: Any = Depends(get_supabase)):
    payload = {
        "title": req.title,
        "event_type": req.type,
        "date_text": req.date,
        "date_num": req.dateNum,
        "month_text": req.month,
        "location": req.location,
        "district": req.district,
        "capacity": req.capacity,
        "registered": req.registered,
        "image": req.image,
        "description": req.desc,
        "status": req.status,
    }
    supabase.table("events").update(payload).eq("id", event_id).execute()
    return EventRecord(id=event_id, **req.model_dump())


@app.delete("/api/events/{event_id}", tags=["Events"])
async def delete_event(event_id: str, supabase: Any = Depends(get_supabase)):
    supabase.table("events").delete().eq("id", event_id).execute()
    return {"deleted": event_id}


# ============================================================================
# 3. Conservation Projects CRUD API (संवर्धन प्रकल्प — Only Admin-added Projects)
# ============================================================================
def _row_to_project(row: dict) -> ProjectRecord:
    return ProjectRecord(
        id=str(row["id"]),
        title=row["title"],
        fort=row["fort"],
        status=row["status"],
        progress=int(row["progress"]),
        volunteers=int(row["volunteers"]),
        budget=row["budget"],
        spent=row["spent"],
        start=row["start_date"],
        end=row["end_date"],
        impact=row["impact"],
        desc=row["description"],
        beforeImg=row.get("before_img") or "/images/conservation.jpg",
        afterImg=row.get("after_img") or "/images/raigad.jpg",
    )


@app.get("/api/projects", response_model=List[ProjectRecord], tags=["Projects"])
async def list_projects(supabase: Any = Depends(get_supabase)):
    res = supabase.table("projects").select("*").order("created_at", desc=True).execute()
    return [_row_to_project(r) for r in res.data]


@app.post("/api/projects", response_model=ProjectRecord, status_code=201, tags=["Projects"])
async def create_project(req: ProjectCreate, supabase: Any = Depends(get_supabase)):
    new_id = str(uuid.uuid4())
    payload = {
        "id": new_id,
        "title": req.title,
        "fort": req.fort,
        "status": req.status,
        "progress": req.progress,
        "volunteers": req.volunteers,
        "budget": req.budget,
        "spent": req.spent,
        "start_date": req.start,
        "end_date": req.end,
        "impact": req.impact,
        "description": req.desc,
        "before_img": req.beforeImg,
        "after_img": req.afterImg,
    }
    supabase.table("projects").insert(payload).execute()
    return ProjectRecord(id=new_id, **req.model_dump())


@app.put("/api/projects/{project_id}", response_model=ProjectRecord, tags=["Projects"])
async def update_project(project_id: str, req: ProjectCreate, supabase: Any = Depends(get_supabase)):
    payload = {
        "title": req.title,
        "fort": req.fort,
        "status": req.status,
        "progress": req.progress,
        "volunteers": req.volunteers,
        "budget": req.budget,
        "spent": req.spent,
        "start_date": req.start,
        "end_date": req.end,
        "impact": req.impact,
        "description": req.desc,
        "before_img": req.beforeImg,
        "after_img": req.afterImg,
    }
    supabase.table("projects").update(payload).eq("id", project_id).execute()
    return ProjectRecord(id=project_id, **req.model_dump())


@app.delete("/api/projects/{project_id}", tags=["Projects"])
async def delete_project(project_id: str, supabase: Any = Depends(get_supabase)):
    supabase.table("projects").delete().eq("id", project_id).execute()
    return {"deleted": project_id}


# ============================================================================
# 4. News CRUD API (बातम्या व लेख — Only Admin-added News)
# ============================================================================
@app.get("/api/news", response_model=List[NewsRecord], tags=["News"])
async def list_news(supabase: Any = Depends(get_supabase)):
    res = supabase.table("news").select("*").order("created_at", desc=True).execute()
    return [
        NewsRecord(
            id=str(r["id"]),
            category=r["category"],
            title=r["title"],
            date=r["date_text"],
            author=r["author"],
            image=r["image"],
            desc=r["summary"],
            body=r["body"],
        )
        for r in res.data
    ]


@app.post("/api/news", response_model=NewsRecord, status_code=201, tags=["News"])
async def create_news(req: NewsCreate, supabase: Any = Depends(get_supabase)):
    new_id = str(uuid.uuid4())
    payload = {
        "id": new_id,
        "category": req.category,
        "title": req.title,
        "date_text": req.date,
        "author": req.author,
        "image": req.image,
        "summary": req.desc,
        "body": req.body,
    }
    supabase.table("news").insert(payload).execute()
    return NewsRecord(id=new_id, **req.model_dump())


@app.delete("/api/news/{news_id}", tags=["News"])
async def delete_news(news_id: str, supabase: Any = Depends(get_supabase)):
    supabase.table("news").delete().eq("id", news_id).execute()
    return {"deleted": news_id}


# ============================================================================
# 5. Gallery CRUD API (फोटो गॅलरी — Only Admin-added Photos)
# ============================================================================
@app.get("/api/gallery", response_model=List[GalleryRecord], tags=["Gallery"])
async def list_gallery(supabase: Any = Depends(get_supabase)):
    res = supabase.table("gallery").select("*").order("created_at", desc=True).execute()
    return [
        GalleryRecord(
            id=str(r["id"]),
            src=r["src"],
            caption=r["caption"],
            category=r["category"],
        )
        for r in res.data
    ]


@app.post("/api/gallery", response_model=GalleryRecord, status_code=201, tags=["Gallery"])
async def create_gallery_item(req: GalleryCreate, supabase: Any = Depends(get_supabase)):
    new_id = str(uuid.uuid4())
    payload = {
        "id": new_id,
        "src": req.src,
        "caption": req.caption,
        "category": req.category,
    }
    supabase.table("gallery").insert(payload).execute()
    return GalleryRecord(id=new_id, **req.model_dump())


@app.delete("/api/gallery/{item_id}", tags=["Gallery"])
async def delete_gallery_item(item_id: str, supabase: Any = Depends(get_supabase)):
    supabase.table("gallery").delete().eq("id", item_id).execute()
    return {"deleted": item_id}


# ============================================================================
# 6. Volunteers API
# ============================================================================
@app.post("/api/volunteers", response_model=VolunteerResponse, status_code=201, tags=["Volunteers"])
async def create_volunteer(req: VolunteerCreate, supabase: Any = Depends(get_supabase)):
    new_id = str(uuid.uuid4())
    payload = {
        "id": new_id,
        "full_name": req.fullName,
        "age": req.age,
        "phone": req.phone,
        "email": req.email,
        "district": req.district,
        "occupation": req.occupation,
        "interests": req.interests,
        "availability": req.availability,
        "trekking_experience": req.trekkingExperience,
        "about": req.about,
        "xp_points": 100,
        "level": 1,
        "status": "active",
    }
    supabase.table("volunteers").insert(payload).execute()

    return VolunteerResponse(
        id=uuid.UUID(new_id),
        certCode=None,
        message="नोंदणी यशस्वी झाली! प्रशासनातर्फे पडताळणीनंतर आपले प्रमाणपत्र जारी केले जाईल."
    )


@app.get("/api/volunteers", response_model=List[VolunteerRecord], tags=["Volunteers"])
async def list_volunteers(
    limit: int = Query(100, ge=1, le=500),
    offset: int = Query(0, ge=0),
    supabase: Any = Depends(get_supabase)
):
    res = (
        supabase.table("volunteers")
        .select("*")
        .order("created_at", desc=True)
        .range(offset, offset + limit - 1)
        .execute()
    )
    return [
        VolunteerRecord(
            id=row["id"],
            full_name=row["full_name"],
            age=row.get("age"),
            phone=row["phone"],
            email=row["email"],
            district=row["district"],
            occupation=row.get("occupation"),
            interests=list(row.get("interests") or []),
            availability=row.get("availability"),
            trekking_experience=row.get("trekking_experience"),
            about=row.get("about"),
            xp_points=int(row.get("xp_points") or 100),
            level=int(row.get("level") or 1),
            status=row.get("status") or "active",
            created_at=row["created_at"],
        )
        for row in res.data
    ]


@app.delete("/api/volunteers/{vol_id}", tags=["Volunteers"])
async def delete_volunteer(vol_id: str, supabase: Any = Depends(get_supabase)):
    supabase.table("volunteers").delete().eq("id", vol_id).execute()
    return {"deleted": vol_id}


# ============================================================================
# 7. Contact Us API
# ============================================================================
@app.post("/api/contact", response_model=ContactResponse, status_code=201, tags=["Contact"])
async def create_contact(req: ContactCreate, supabase: Any = Depends(get_supabase)):
    new_id = str(uuid.uuid4())
    payload = {
        "id": new_id,
        "full_name": req.fullName.strip(),
        "phone": req.phone.strip() if req.phone else None,
        "email": req.email.strip().lower(),
        "subject": req.subject,
        "message": req.message.strip(),
        "status": "unread",
    }
    supabase.table("contacts").insert(payload).execute()
    return ContactResponse(
        id=uuid.UUID(new_id),
        message="आपला संदेश यशस्वीरित्या पाठवला गेला आहे. आम्ही लवकरच संपर्क करू."
    )


@app.get("/api/contacts", response_model=List[ContactRecord], tags=["Contact"])
async def list_contacts(limit: int = Query(100, ge=1, le=500), supabase: Any = Depends(get_supabase)):
    res = supabase.table("contacts").select("*").order("created_at", desc=True).limit(limit).execute()
    return [ContactRecord(**dict(row)) for row in res.data]


@app.delete("/api/contacts/{contact_id}", tags=["Contact"])
async def delete_contact(contact_id: str, supabase: Any = Depends(get_supabase)):
    supabase.table("contacts").delete().eq("id", contact_id).execute()
    return {"deleted": contact_id}


# ============================================================================
# 8. Donations & Verified Donors API
# ============================================================================
def _format_donation_record(row: dict) -> DonationRecord:
    raw_amount = float(row.get("donation_amount") or row.get("amount") or 0.0)
    raw_purpose = row.get("purpose") or row.get("project_name") or "सामान्य संवर्धन निधी"
    raw_tx = row.get("transaction_reference") or row.get("transaction_ref") or ""
    raw_phone = row.get("phone_private") or row.get("phone") or ""
    raw_email = row.get("email_private") or row.get("email") or ""
    raw_status = row.get("payment_status") or row.get("status") or "completed"
    raw_verif = row.get("verification_status") or "pending"
    raw_name_pub = bool(row.get("display_name_public", 1))
    raw_amt_pub = bool(row.get("display_amount_public", 0))
    raw_pub = bool(row.get("is_published", 0))

    return DonationRecord(
        id=str(row["id"]),
        donor_name=row.get("donor_name") or "अनाम (Anonymous)",
        donorName=row.get("donor_name") or "अनाम (Anonymous)",
        donation_amount=raw_amount,
        amount=raw_amount,
        donation_date=row.get("donation_date") or (row.get("created_at")[:10] if row.get("created_at") else ""),
        donationDate=row.get("donation_date") or (row.get("created_at")[:10] if row.get("created_at") else ""),
        purpose=raw_purpose,
        project_name=raw_purpose,
        projectName=raw_purpose,
        payment_method=row.get("payment_method") or "UPI",
        paymentMethod=row.get("payment_method") or "UPI",
        transaction_ref=raw_tx,
        transactionRef=raw_tx,
        transaction_reference=raw_tx,
        phone_private=raw_phone,
        phone=raw_phone,
        email_private=raw_email,
        email=raw_email,
        payment_status=raw_status,
        paymentStatus=raw_status,
        verification_status=raw_verif,
        verificationStatus=raw_verif,
        display_name_public=raw_name_pub,
        displayNamePublic=raw_name_pub,
        display_amount_public=raw_amt_pub,
        displayAmountPublic=raw_amt_pub,
        admin_remarks=row.get("admin_remarks") or "",
        adminRemarks=row.get("admin_remarks") or "",
        verified_by=row.get("verified_by") or "",
        verifiedBy=row.get("verified_by") or "",
        verified_at=row.get("verified_at") or "",
        verifiedAt=row.get("verified_at") or "",
        is_published=raw_pub,
        isPublished=raw_pub,
        created_at=row.get("created_at") or "",
        createdAt=row.get("created_at") or "",
        updated_at=row.get("updated_at") or "",
        updatedAt=row.get("updated_at") or "",
    )


def _format_public_donor(row: dict) -> PublicDonorRecord:
    """Sanitize donor record: only approved & published donors with public name consent."""
    raw_amount = float(row.get("donation_amount") or row.get("amount") or 0.0)
    raw_amt_pub = bool(row.get("display_amount_public", 0))
    raw_purpose = row.get("purpose") or row.get("project_name") or "सामान्य संवर्धन निधी"
    raw_date = row.get("donation_date") or (row.get("created_at")[:10] if row.get("created_at") else "")

    return PublicDonorRecord(
        id=str(row["id"]),
        donor_name=row.get("donor_name") or "अनाम देणगीदार",
        donorName=row.get("donor_name") or "अनाम देणगीदार",
        purpose=raw_purpose,
        donation_date=raw_date,
        donationDate=raw_date,
        display_amount_public=raw_amt_pub,
        displayAmountPublic=raw_amt_pub,
        donation_amount=raw_amount if raw_amt_pub else None,
        created_at=row.get("created_at") or "",
    )


@app.get("/api/donations/public", response_model=List[PublicDonorRecord], tags=["Donations"])
@app.get("/api/donations/public-donors", response_model=List[PublicDonorRecord], tags=["Donations"])
async def list_public_donors(supabase: Any = Depends(get_supabase)):
    """
    Public website endpoint: strictly returns ONLY donors where:
    verification_status = 'approved' AND is_published = TRUE AND display_name_public = TRUE.
    Private phone, email, transaction references, and admin remarks are NEVER returned.
    """
    res = (
        supabase.table("donations")
        .select("*")
        .eq("verification_status", "approved")
        .eq("is_published", 1)
        .eq("display_name_public", 1)
        .order("created_at", desc=True)
        .execute()
    )
    return [_format_public_donor(r) for r in res.data]


@app.get("/api/admin/donations", response_model=List[DonationRecord], tags=["Donations"])
@app.get("/api/donations", response_model=List[DonationRecord], tags=["Donations"])
async def list_admin_donations(
    status_filter: Optional[str] = Query(None, alias="verification_status"),
    search: Optional[str] = None,
    limit: int = Query(200, ge=1, le=1000),
    offset: int = Query(0, ge=0),
    supabase: Any = Depends(get_supabase)
):
    """
    Admin management endpoint: returns full donation records with private verification data.
    """
    query = supabase.table("donations").select("*")
    if status_filter and status_filter.lower() != "all":
        query = query.eq("verification_status", status_filter.lower())
    
    res = query.order("created_at", desc=True).range(offset, offset + limit - 1).execute()
    data = res.data

    if search:
        s = search.lower().strip()
        data = [
            r for r in data
            if s in (r.get("donor_name") or "").lower()
            or s in (r.get("purpose") or "").lower()
            or s in (r.get("phone_private") or r.get("phone") or "").lower()
            or s in (r.get("transaction_reference") or r.get("transaction_ref") or "").lower()
        ]

    return [_format_donation_record(r) for r in data]


@app.get("/api/admin/donations/{donation_id}", response_model=DonationRecord, tags=["Donations"])
async def get_donation_detail(donation_id: str, supabase: Any = Depends(get_supabase)):
    res = supabase.table("donations").select("*").eq("id", donation_id).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="देणगी नोंद सापडली नाही.")
    return _format_donation_record(res.data[0])


@app.post("/api/donations", response_model=DonationResponse, status_code=201, tags=["Donations"])
async def create_public_donation(req: DonationCreate, supabase: Any = Depends(get_supabase)):
    """
    Public donation submission:
    Creates a record with verification_status = 'pending' and is_published = False.
    The name is NOT displayed publicly until an Admin verifies and approves the record.
    """
    new_id = str(uuid.uuid4())
    today_str = date.today().isoformat()
    now_iso = datetime.now().isoformat()
    receipt_no = f"GSP-80G-{date.today().year}-{random.randint(10000, 99999)}"
    tx_ref = (req.transactionRef or "").strip() or receipt_no
    donor_name = req.donorName.strip() or "अनाम (Anonymous)"
    clean_phone = (req.phone or "").strip()
    clean_email = (req.email or "").strip().lower() if req.email else ""

    payload = {
        "id": new_id,
        "donor_name": donor_name,
        "donation_amount": req.amount,
        "amount": req.amount,
        "donation_date": today_str,
        "purpose": req.projectName,
        "project_name": req.projectName,
        "payment_method": req.paymentMethod,
        "transaction_ref": tx_ref,
        "transaction_reference": tx_ref,
        "pan_number": req.panNumber or "",
        "phone_private": clean_phone,
        "phone": clean_phone,
        "email_private": clean_email,
        "email": clean_email,
        "payment_status": "completed",
        "status": "completed",
        "verification_status": "pending", # 🟡 Pending admin approval
        "display_name_public": 1 if req.displayNamePublic else 0,
        "display_amount_public": 1 if req.displayAmountPublic else 0, # OFF by default
        "admin_remarks": "संकेतस्थळावरून थेट नोंदणी. प्रशासकीय पडताळणी प्रलंबित.",
        "verified_by": "",
        "verified_at": "",
        "is_published": 0, # ⚪ Not published until approved
        "created_at": now_iso,
        "updated_at": now_iso,
    }
    supabase.table("donations").insert(payload).execute()
    return DonationResponse(
        id=uuid.UUID(new_id),
        receiptNumber=receipt_no,
        message=f"धन्यवाद! ₹{req.amount:,.0f} ची देणगी यशस्वीरित्या नोंदवली गेली आहे. प्रशासकीय पडताळणीनंतर देणगीदारांच्या यादीत आपले नाव समाविष्ट केले जाईल."
    )


@app.post("/api/admin/donations", response_model=DonationRecord, status_code=201, tags=["Donations"])
async def create_admin_donation(req: DonationAdminCreate, supabase: Any = Depends(get_supabase)):
    """Admin manual donation entry."""
    new_id = str(uuid.uuid4())
    today_str = req.donationDate or date.today().isoformat()
    now_iso = datetime.now().isoformat()
    receipt_no = f"GSP-80G-{date.today().year}-{random.randint(10000, 99999)}"
    tx_ref = (req.transactionRef or "").strip() or receipt_no
    clean_phone = (req.phonePrivate or "").strip()
    clean_email = (str(req.emailPrivate) if req.emailPrivate else "").strip().lower()

    payload = {
        "id": new_id,
        "donor_name": req.donorName.strip(),
        "donation_amount": req.amount,
        "amount": req.amount,
        "donation_date": today_str,
        "purpose": req.purpose,
        "project_name": req.purpose,
        "payment_method": req.paymentMethod,
        "transaction_ref": tx_ref,
        "transaction_reference": tx_ref,
        "pan_number": "",
        "phone_private": clean_phone,
        "phone": clean_phone,
        "email_private": clean_email,
        "email": clean_email,
        "payment_status": req.paymentStatus,
        "status": req.paymentStatus,
        "verification_status": req.verificationStatus,
        "display_name_public": 1 if req.displayNamePublic else 0,
        "display_amount_public": 1 if req.displayAmountPublic else 0,
        "admin_remarks": req.adminRemarks or "प्रशासकाद्वारे थेट नोंद.",
        "verified_by": "Admin",
        "verified_at": now_iso if req.verificationStatus == "approved" else "",
        "is_published": 1 if req.isPublished else 0,
        "created_at": now_iso,
        "updated_at": now_iso,
    }
    supabase.table("donations").insert(payload).execute()
    return _format_donation_record(payload)


@app.put("/api/admin/donations/{donation_id}", response_model=DonationRecord, tags=["Donations"])
@app.patch("/api/admin/donations/{donation_id}", response_model=DonationRecord, tags=["Donations"])
async def update_admin_donation(
    donation_id: str,
    req: DonationAdminUpdate,
    supabase: Any = Depends(get_supabase)
):
    """
    Admin verification & approval endpoint:
    Approve, Reject, Hide/Unpublish, Edit donor name, Add admin remarks, and Toggle privacy settings.
    """
    existing = supabase.table("donations").select("*").eq("id", donation_id).execute()
    if not existing.data:
        raise HTTPException(status_code=404, detail="देणगी नोंद सापडली नाही.")

    now_iso = datetime.now().isoformat()
    update_dict: Dict[str, Any] = {"updated_at": now_iso}

    if req.donorName is not None:
        update_dict["donor_name"] = req.donorName.strip()
    if req.amount is not None:
        update_dict["donation_amount"] = req.amount
        update_dict["amount"] = req.amount
    if req.donationDate is not None:
        update_dict["donation_date"] = req.donationDate
    if req.purpose is not None:
        update_dict["purpose"] = req.purpose
        update_dict["project_name"] = req.purpose
    if req.paymentMethod is not None:
        update_dict["payment_method"] = req.paymentMethod
    if req.transactionRef is not None:
        update_dict["transaction_ref"] = req.transactionRef
        update_dict["transaction_reference"] = req.transactionRef
    if req.phonePrivate is not None:
        update_dict["phone_private"] = req.phonePrivate
        update_dict["phone"] = req.phonePrivate
    if req.emailPrivate is not None:
        update_dict["email_private"] = str(req.emailPrivate).lower()
        update_dict["email"] = str(req.emailPrivate).lower()
    if req.paymentStatus is not None:
        update_dict["payment_status"] = req.paymentStatus
        update_dict["status"] = req.paymentStatus
    if req.verificationStatus is not None:
        update_dict["verification_status"] = req.verificationStatus
        if req.verificationStatus == "approved":
            update_dict["verified_at"] = now_iso
            update_dict["verified_by"] = req.verifiedBy or "Admin"
    if req.displayNamePublic is not None:
        update_dict["display_name_public"] = 1 if req.displayNamePublic else 0
    if req.displayAmountPublic is not None:
        update_dict["display_amount_public"] = 1 if req.displayAmountPublic else 0
    if req.adminRemarks is not None:
        update_dict["admin_remarks"] = req.adminRemarks
    if req.verifiedBy is not None:
        update_dict["verified_by"] = req.verifiedBy
    if req.isPublished is not None:
        update_dict["is_published"] = 1 if req.isPublished else 0

    supabase.table("donations").update(update_dict).eq("id", donation_id).execute()
    updated = supabase.table("donations").select("*").eq("id", donation_id).execute()
    return _format_donation_record(updated.data[0])


@app.delete("/api/admin/donations/{donation_id}", tags=["Donations"])
@app.delete("/api/donations/{donation_id}", tags=["Donations"])
async def delete_donation(donation_id: str, supabase: Any = Depends(get_supabase)):
    supabase.table("donations").delete().eq("id", donation_id).execute()
    return {"deleted": donation_id}


# ============================================================================
# 9. Events Registration API
# ============================================================================
@app.post("/api/events/register", response_model=EventRegistrationResponse, status_code=201, tags=["Events"])
async def register_for_event(req: EventRegistrationCreate, supabase: Any = Depends(get_supabase)):
    new_id = str(uuid.uuid4())
    payload = {
        "id": new_id,
        "event_id": req.eventId,
        "event_title": req.eventTitle,
        "full_name": req.fullName.strip(),
        "phone": req.phone.strip(),
        "email": req.email.strip().lower(),
        "participants_count": req.participantsCount,
        "emergency_contact": req.emergencyContact,
        "status": "confirmed",
    }
    supabase.table("event_registrations").insert(payload).execute()

    try:
        ev_res = supabase.table("events").select("*").eq("id", req.eventId).execute()
        if ev_res.data:
            ev = ev_res.data[0]
            cap = int(ev.get("capacity") or 100)
            reg = min(cap, int(ev.get("registered") or 0) + req.participantsCount)
            new_status = "पूर्ण भरले" if reg >= cap else ev.get("status", "नोंदणी सुरू")
            supabase.table("events").update({"registered": reg, "status": new_status}).eq("id", req.eventId).execute()
    except Exception:
        pass

    return EventRegistrationResponse(
        id=uuid.UUID(new_id),
        message=f"'{req.eventTitle}' मोहिमेसाठी आपली नोंदणी निश्चित झाली आहे!"
    )


@app.get("/api/events/registrations", response_model=List[EventRegistrationRecord], tags=["Events"])
async def list_event_registrations(limit: int = Query(100, ge=1, le=500), supabase: Any = Depends(get_supabase)):
    res = supabase.table("event_registrations").select("*").order("created_at", desc=True).limit(limit).execute()
    return [EventRegistrationRecord(**dict(row)) for row in res.data]


# ============================================================================
# 10. Digital Certificates API (Admin creates/issues; Public only gets/downloads)
# ============================================================================
@app.get("/api/certificates", response_model=List[CertificateRecord], tags=["Certificates"])
async def list_certificates(supabase: Any = Depends(get_supabase)):
    res = supabase.table("certificates").select("*").order("created_at", desc=True).execute()
    return [CertificateRecord(**dict(row)) for row in res.data]


@app.post("/api/certificates", response_model=CertificateRecord, status_code=201, tags=["Certificates"])
async def issue_certificate(req: CertificateCreate, supabase: Any = Depends(get_supabase)):
    new_id = str(uuid.uuid4())
    cert_code = f"GSP-CERT-{date.today().year}-{random.randint(1000, 9999)}"
    payload = {
        "id": new_id,
        "cert_code": cert_code,
        "recipient_name": req.recipientName.strip(),
        "cert_type": req.certType,
        "event_name": req.eventName.strip(),
        "issued_date": date.today().isoformat(),
    }
    supabase.table("certificates").insert(payload).execute()
    res = supabase.table("certificates").select("*").eq("id", new_id).execute()
    return CertificateRecord(**dict(res.data[0]))


@app.get("/api/certificates/{cert_query}", response_model=CertificateRecord, tags=["Certificates"])
async def verify_certificate(cert_query: str, supabase: Any = Depends(get_supabase)):
    q = cert_query.strip()
    # 1. Exact match by cert_code (case-insensitive)
    res = supabase.table("certificates").select("*").ilike("cert_code", q).execute()
    if res.data:
        return CertificateRecord(**dict(res.data[0]))

    # 2. Match by recipient_name (exact or partial case-insensitive match)
    all_certs = supabase.table("certificates").select("*").order("created_at", desc=True).execute().data
    q_lower = q.lower()
    for row in all_certs:
        r_name = str(row.get("recipient_name") or "").strip().lower()
        r_code = str(row.get("cert_code") or "").strip().lower()
        if q_lower == r_code or q_lower == r_name or (len(q_lower) >= 3 and q_lower in r_name):
            return CertificateRecord(**dict(row))

    raise HTTPException(
        status_code=404,
        detail="प्रमाणपत्र सापडले नाही. कृपया प्रशासनाने जारी केलेला प्रमाणपत्र क्रमांक किंवा आपले अचूक नाव टाका."
    )


@app.delete("/api/certificates/{cert_id}", tags=["Certificates"])
async def delete_certificate(cert_id: str, supabase: Any = Depends(get_supabase)):
    supabase.table("certificates").delete().eq("id", cert_id).execute()
    return {"deleted": cert_id}


# ============================================================================
# 11. Admin Dashboard Aggregated Stats
# ============================================================================
@app.get("/api/admin/stats", response_model=AdminStatsResponse, tags=["Admin"])
async def get_admin_stats(supabase: Any = Depends(get_supabase)):
    vols = supabase.table("volunteers").select("*").order("created_at", desc=True).execute().data
    dons = supabase.table("donations").select("*").order("created_at", desc=True).execute().data
    evt_regs = supabase.table("event_registrations").select("id").execute().data
    msgs = supabase.table("contacts").select("*").order("created_at", desc=True).execute().data
    forts = supabase.table("forts").select("id").execute().data
    events = supabase.table("events").select("id").execute().data
    projects = supabase.table("projects").select("id").execute().data
    news = supabase.table("news").select("id").execute().data
    gallery = supabase.table("gallery").select("id").execute().data
    students = supabase.table("students").select("id").execute().data
    team = supabase.table("team_members").select("id").execute().data
    orgs = supabase.table("organizations").select("id").execute().data
    partners = supabase.table("partner_orgs").select("id").execute().data
    edu_progs = supabase.table("education_programs").select("id").execute().data
    cert_tmpl = supabase.table("certificate_templates").select("id").execute().data
    manogats = supabase.table("member_manogat").select("id").execute().data

    total_don_amount = sum(float(d.get("amount") or 0) for d in dons)
    unread_msgs = sum(1 for m in msgs if m.get("status") == "unread")

    return AdminStatsResponse(
        totalDonationsAmount=total_don_amount,
        totalDonationsCount=len(dons),
        totalVolunteersCount=len(vols),
        totalEventRegistrationsCount=len(evt_regs),
        unreadContactsCount=unread_msgs,
        totalFortsCount=len(forts),
        totalEventsCount=len(events),
        totalProjectsCount=len(projects),
        totalNewsCount=len(news),
        totalGalleryCount=len(gallery),
        totalStudentsCount=len(students),
        totalTeamMembersCount=len(team),
        totalOrganizationsCount=len(orgs),
        totalPartnerOrgsCount=len(partners),
        totalEducationProgramsCount=len(edu_progs),
        totalCertificateTemplatesCount=len(cert_tmpl),
        totalManogatCount=len(manogats),
        recentDonations=[_format_donation_record(r) for r in dons[:30]],
        recentVolunteers=[
            VolunteerRecord(
                id=r["id"],
                full_name=r["full_name"],
                age=r.get("age"),
                phone=r["phone"],
                email=r["email"],
                district=r["district"],
                occupation=r.get("occupation"),
                interests=list(r.get("interests") or []),
                availability=r.get("availability"),
                trekking_experience=r.get("trekking_experience"),
                about=r.get("about"),
                xp_points=int(r.get("xp_points") or 100),
                level=int(r.get("level") or 1),
                status=r.get("status") or "active",
                created_at=r["created_at"],
            )
            for r in vols[:25]
        ],
        recentContacts=[ContactRecord(**dict(r)) for r in msgs[:25]],
    )


# ============================================================================
# 12. Team Members CRUD API
# ============================================================================
@app.get("/api/team-members", response_model=List[TeamMemberRecord], tags=["Team"])
async def list_team_members(supabase: Any = Depends(get_supabase)):
    res = supabase.table("team_members").select("*").order("display_order", desc=False).execute()
    return [
        TeamMemberRecord(
            id=r["id"], name=r["name"], nameEn=r.get("name_en") or "",
            role=r.get("role") or "", roleEn=r.get("role_en") or "",
            photo=r.get("photo") or "", introduction=r.get("introduction") or "",
            introductionEn=r.get("introduction_en") or "",
            responsibilities=r.get("responsibilities") or "",
            responsibilitiesEn=r.get("responsibilities_en") or "",
            contribution=r.get("contribution") or "",
            contributionEn=r.get("contribution_en") or "",
            displayOrder=int(r.get("display_order") or 0),
            isActive=bool(r.get("is_active", 1)),
        )
        for r in res.data
    ]

@app.post("/api/team-members", response_model=TeamMemberRecord, status_code=201, tags=["Team"])
async def create_team_member(req: TeamMemberCreate, supabase: Any = Depends(get_supabase)):
    new_id = str(uuid.uuid4())
    payload = {
        "id": new_id, "name": req.name, "name_en": req.nameEn,
        "role": req.role, "role_en": req.roleEn, "photo": req.photo,
        "introduction": req.introduction, "introduction_en": req.introductionEn,
        "responsibilities": req.responsibilities, "responsibilities_en": req.responsibilitiesEn,
        "contribution": req.contribution, "contribution_en": req.contributionEn,
        "display_order": req.displayOrder, "is_active": 1 if req.isActive else 0,
    }
    supabase.table("team_members").insert(payload).execute()
    return TeamMemberRecord(id=new_id, **req.model_dump())

@app.delete("/api/team-members/{member_id}", tags=["Team"])
async def delete_team_member(member_id: str, supabase: Any = Depends(get_supabase)):
    supabase.table("team_members").delete().eq("id", member_id).execute()
    return {"deleted": member_id}


# ============================================================================
# 13. Organizations CRUD API
# ============================================================================
@app.get("/api/organizations", response_model=List[OrganizationRecord], tags=["Organizations"])
async def list_organizations(supabase: Any = Depends(get_supabase)):
    res = supabase.table("organizations").select("*").order("created_at", desc=True).execute()
    return [
        OrganizationRecord(
            id=r["id"], name=r["name"], nameEn=r.get("name_en") or "",
            introduction=r.get("introduction") or "", introductionEn=r.get("introduction_en") or "",
            activities=r.get("activities") or "", activitiesEn=r.get("activities_en") or "",
            initiatives=r.get("initiatives") or "", initiativesEn=r.get("initiatives_en") or "",
            achievements=r.get("achievements") or "", achievementsEn=r.get("achievements_en") or "",
            image=r.get("image") or "",
            extraImages=r.get("extra_images") if isinstance(r.get("extra_images"), list) else [],
            contactInfo=r.get("contact_info") or "", website=r.get("website") or "",
            isActive=bool(r.get("is_active", 1)),
        )
        for r in res.data
    ]

@app.get("/api/organizations/{org_id}", response_model=OrganizationRecord, tags=["Organizations"])
async def get_organization(org_id: str, supabase: Any = Depends(get_supabase)):
    res = supabase.table("organizations").select("*").eq("id", org_id).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="संस्था सापडली नाही")
    r = res.data[0]
    return OrganizationRecord(
        id=r["id"], name=r["name"], nameEn=r.get("name_en") or "",
        introduction=r.get("introduction") or "", introductionEn=r.get("introduction_en") or "",
        activities=r.get("activities") or "", activitiesEn=r.get("activities_en") or "",
        initiatives=r.get("initiatives") or "", initiativesEn=r.get("initiatives_en") or "",
        achievements=r.get("achievements") or "", achievementsEn=r.get("achievements_en") or "",
        image=r.get("image") or "",
        extraImages=r.get("extra_images") if isinstance(r.get("extra_images"), list) else [],
        contactInfo=r.get("contact_info") or "", website=r.get("website") or "",
        isActive=bool(r.get("is_active", 1)),
    )

@app.post("/api/organizations", response_model=OrganizationRecord, status_code=201, tags=["Organizations"])
async def create_organization(req: OrganizationCreate, supabase: Any = Depends(get_supabase)):
    new_id = str(uuid.uuid4())
    payload = {
        "id": new_id, "name": req.name, "name_en": req.nameEn,
        "introduction": req.introduction, "introduction_en": req.introductionEn,
        "activities": req.activities, "activities_en": req.activitiesEn,
        "initiatives": req.initiatives, "initiatives_en": req.initiativesEn,
        "achievements": req.achievements, "achievements_en": req.achievementsEn,
        "image": req.image, "extra_images": req.extraImages,
        "contact_info": req.contactInfo, "website": req.website,
        "is_active": 1 if req.isActive else 0,
    }
    supabase.table("organizations").insert(payload).execute()
    return OrganizationRecord(id=new_id, **req.model_dump())

@app.delete("/api/organizations/{org_id}", tags=["Organizations"])
async def delete_organization(org_id: str, supabase: Any = Depends(get_supabase)):
    supabase.table("organizations").delete().eq("id", org_id).execute()
    return {"deleted": org_id}


# ============================================================================
# 14. Partner Organizations CRUD API
# ============================================================================
@app.get("/api/partners", response_model=List[PartnerOrgRecord], tags=["Partners"])
async def list_partner_orgs(supabase: Any = Depends(get_supabase)):
    res = supabase.table("partner_orgs").select("*").order("created_at", desc=True).execute()
    return [
        PartnerOrgRecord(
            id=r["id"], name=r["name"], nameEn=r.get("name_en") or "",
            logo=r.get("logo") or "", description=r.get("description") or "",
            descriptionEn=r.get("description_en") or "",
            partnerType=r.get("partner_type") or "organization",
            partnershipDetails=r.get("partnership_details") or "",
            partnershipDetailsEn=r.get("partnership_details_en") or "",
            relatedActivities=r.get("related_activities") or "",
            relatedActivitiesEn=r.get("related_activities_en") or "",
            website=r.get("website") or "", contactInfo=r.get("contact_info") or "",
            isActive=bool(r.get("is_active", 1)),
        )
        for r in res.data
    ]

@app.post("/api/partners", response_model=PartnerOrgRecord, status_code=201, tags=["Partners"])
async def create_partner_org(req: PartnerOrgCreate, supabase: Any = Depends(get_supabase)):
    new_id = str(uuid.uuid4())
    payload = {
        "id": new_id, "name": req.name, "name_en": req.nameEn,
        "logo": req.logo, "description": req.description, "description_en": req.descriptionEn,
        "partner_type": req.partnerType, "partnership_details": req.partnershipDetails,
        "partnership_details_en": req.partnershipDetailsEn,
        "related_activities": req.relatedActivities, "related_activities_en": req.relatedActivitiesEn,
        "website": req.website, "contact_info": req.contactInfo,
        "is_active": 1 if req.isActive else 0,
    }
    supabase.table("partner_orgs").insert(payload).execute()
    return PartnerOrgRecord(id=new_id, **req.model_dump())

@app.delete("/api/partners/{partner_id}", tags=["Partners"])
async def delete_partner_org(partner_id: str, supabase: Any = Depends(get_supabase)):
    supabase.table("partner_orgs").delete().eq("id", partner_id).execute()
    return {"deleted": partner_id}


# ============================================================================
# 15. Students Auth & CRUD API
# ============================================================================
@app.post("/api/students/register", response_model=StudentLoginResponse, status_code=201, tags=["Students"])
async def register_student(req: StudentRegisterRequest, supabase: Any = Depends(get_supabase)):
    existing = supabase.table("students").select("id").eq("email", req.email.lower()).execute()
    if existing.data:
        raise HTTPException(status_code=400, detail="हा ईमेल आधीपासून नोंदणीकृत आहे.")
    new_id = str(uuid.uuid4())
    payload = {
        "id": new_id, "full_name": req.fullName.strip(),
        "email": req.email.strip().lower(), "phone": req.phone,
        "password_hash": _hash_password(req.password),
        "student_type": req.studentType, "institution": req.institution,
        "class_year": req.classYear, "district": req.district,
        "is_active": 1,
    }
    supabase.table("students").insert(payload).execute()
    return StudentLoginResponse(
        token=f"gsp-student-{uuid.uuid4()}",
        studentId=new_id, fullName=req.fullName,
        email=req.email.lower(), studentType=req.studentType,
        message="नोंदणी यशस्वी!"
    )

@app.post("/api/students/login", response_model=StudentLoginResponse, tags=["Students"])
async def login_student(req: StudentLoginRequest, supabase: Any = Depends(get_supabase)):
    res = supabase.table("students").select("*").eq("email", req.email.strip().lower()).execute()
    if not res.data:
        raise HTTPException(status_code=401, detail="ईमेल किंवा पासवर्ड चुकीचा आहे.")
    student = res.data[0]
    if student.get("password_hash") != _hash_password(req.password):
        raise HTTPException(status_code=401, detail="ईमेल किंवा पासवर्ड चुकीचा आहे.")
    return StudentLoginResponse(
        token=f"gsp-student-{uuid.uuid4()}",
        studentId=student["id"], fullName=student["full_name"],
        email=student["email"], studentType=student.get("student_type") or "school",
        message="लॉगिन यशस्वी!"
    )

@app.get("/api/students", response_model=List[StudentRecord], tags=["Students"])
async def list_students(supabase: Any = Depends(get_supabase)):
    res = supabase.table("students").select("*").order("created_at", desc=True).execute()
    return [
        StudentRecord(
            id=r["id"], fullName=r["full_name"], email=r["email"],
            phone=r.get("phone") or "", studentType=r.get("student_type") or "school",
            institution=r.get("institution") or "", classYear=r.get("class_year") or "",
            district=r.get("district") or "", profilePhoto=r.get("profile_photo") or "",
            isActive=bool(r.get("is_active", 1)), createdAt=r.get("created_at"),
        )
        for r in res.data
    ]

@app.get("/api/students/{student_id}", response_model=StudentRecord, tags=["Students"])
async def get_student(student_id: str, supabase: Any = Depends(get_supabase)):
    res = supabase.table("students").select("*").eq("id", student_id).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="विद्यार्थी सापडला नाही")
    r = res.data[0]
    return StudentRecord(
        id=r["id"], fullName=r["full_name"], email=r["email"],
        phone=r.get("phone") or "", studentType=r.get("student_type") or "school",
        institution=r.get("institution") or "", classYear=r.get("class_year") or "",
        district=r.get("district") or "", profilePhoto=r.get("profile_photo") or "",
        isActive=bool(r.get("is_active", 1)), createdAt=r.get("created_at"),
    )

@app.delete("/api/students/{student_id}", tags=["Students"])
async def delete_student(student_id: str, supabase: Any = Depends(get_supabase)):
    supabase.table("students").delete().eq("id", student_id).execute()
    return {"deleted": student_id}


# ============================================================================
# 16. Student Participations API
# ============================================================================
@app.get("/api/students/{student_id}/participations", response_model=List[StudentParticipationRecord], tags=["Students"])
async def list_student_participations(student_id: str, supabase: Any = Depends(get_supabase)):
    res = supabase.table("student_participations").select("*").eq("student_id", student_id).order("created_at", desc=True).execute()
    return [
        StudentParticipationRecord(
            id=r["id"], studentId=r["student_id"],
            activityType=r.get("activity_type") or "quiz",
            activityTitle=r["activity_title"],
            score=int(r.get("score") or 0), maxScore=int(r.get("max_score") or 0),
            status=r.get("status") or "completed",
            certificateId=r.get("certificate_id") or "",
            completedAt=r.get("completed_at"),
        )
        for r in res.data
    ]

@app.post("/api/student-participations", response_model=StudentParticipationRecord, status_code=201, tags=["Students"])
async def create_student_participation(req: StudentParticipationCreate, supabase: Any = Depends(get_supabase)):
    new_id = str(uuid.uuid4())
    payload = {
        "id": new_id, "student_id": req.studentId,
        "activity_type": req.activityType, "activity_title": req.activityTitle,
        "score": req.score, "max_score": req.maxScore,
        "status": req.status, "certificate_id": req.certificateId,
        "completed_at": datetime.now().isoformat(),
    }
    supabase.table("student_participations").insert(payload).execute()
    return StudentParticipationRecord(id=new_id, completedAt=payload["completed_at"], **req.model_dump())


# ============================================================================
# 17. Certificate Templates CRUD API
# ============================================================================
@app.get("/api/certificate-templates", response_model=List[CertificateTemplateRecord], tags=["Certificates"])
async def list_certificate_templates(supabase: Any = Depends(get_supabase)):
    res = supabase.table("certificate_templates").select("*").order("created_at", desc=True).execute()
    return [
        CertificateTemplateRecord(
            id=r["id"], name=r["name"], designUrl=r.get("design_url") or "",
            templateType=r.get("template_type") or "participation",
            bgColor=r.get("bg_color") or "#FFFDF9",
            borderColor=r.get("border_color") or "#B58A45",
            titleText=r.get("title_text") or "प्रमाणपत्र",
            subtitleText=r.get("subtitle_text") or "",
            footerText=r.get("footer_text") or "गडकिल्ले संवर्धन प्रतिष्ठान",
            isDefault=bool(r.get("is_default", 0)),
            isActive=bool(r.get("is_active", 1)),
        )
        for r in res.data
    ]

@app.post("/api/certificate-templates", response_model=CertificateTemplateRecord, status_code=201, tags=["Certificates"])
async def create_certificate_template(req: CertificateTemplateCreate, supabase: Any = Depends(get_supabase)):
    new_id = str(uuid.uuid4())
    if req.isDefault:
        supabase.table("certificate_templates").update({"is_default": 0}).eq("is_default", 1).execute()
    payload = {
        "id": new_id, "name": req.name, "design_url": req.designUrl,
        "template_type": req.templateType, "bg_color": req.bgColor,
        "border_color": req.borderColor, "title_text": req.titleText,
        "subtitle_text": req.subtitleText, "footer_text": req.footerText,
        "is_default": 1 if req.isDefault else 0, "is_active": 1 if req.isActive else 0,
    }
    supabase.table("certificate_templates").insert(payload).execute()
    return CertificateTemplateRecord(id=new_id, **req.model_dump())

@app.delete("/api/certificate-templates/{template_id}", tags=["Certificates"])
async def delete_certificate_template(template_id: str, supabase: Any = Depends(get_supabase)):
    supabase.table("certificate_templates").delete().eq("id", template_id).execute()
    return {"deleted": template_id}


# ============================================================================
# 18. Education Programs CRUD API
# ============================================================================
@app.get("/api/education-programs", response_model=List[EducationProgramRecord], tags=["Education"])
async def list_education_programs(supabase: Any = Depends(get_supabase)):
    res = supabase.table("education_programs").select("*").order("created_at", desc=True).execute()
    return [
        EducationProgramRecord(
            id=r["id"], title=r["title"], titleEn=r.get("title_en") or "",
            category=r.get("category") or "program",
            description=r.get("description") or "", descriptionEn=r.get("description_en") or "",
            image=r.get("image") or "",
            targetAudience=r.get("target_audience") or "",
            targetAudienceEn=r.get("target_audience_en") or "",
            schedule=r.get("schedule") or "",
            status=r.get("status") or "active",
            isActive=bool(r.get("is_active", 1)),
        )
        for r in res.data
    ]

@app.post("/api/education-programs", response_model=EducationProgramRecord, status_code=201, tags=["Education"])
async def create_education_program(req: EducationProgramCreate, supabase: Any = Depends(get_supabase)):
    new_id = str(uuid.uuid4())
    payload = {
        "id": new_id, "title": req.title, "title_en": req.titleEn,
        "category": req.category, "description": req.description,
        "description_en": req.descriptionEn, "image": req.image,
        "target_audience": req.targetAudience, "target_audience_en": req.targetAudienceEn,
        "schedule": req.schedule, "status": req.status,
        "is_active": 1 if req.isActive else 0,
    }
    supabase.table("education_programs").insert(payload).execute()
    return EducationProgramRecord(id=new_id, **req.model_dump())

@app.delete("/api/education-programs/{program_id}", tags=["Education"])
async def delete_education_program(program_id: str, supabase: Any = Depends(get_supabase)):
    supabase.table("education_programs").delete().eq("id", program_id).execute()
    return {"deleted": program_id}


# ============================================================================
# 19. Donation Summary Dashboard API
# ============================================================================
@app.get("/api/donations/summary", response_model=DonationSummaryResponse, tags=["Donations"])
async def get_donation_summary(supabase: Any = Depends(get_supabase)):
    dons = supabase.table("donations").select("*").order("created_at", desc=True).execute().data
    total_amount = sum(float(d.get("amount") or 0) for d in dons)
    unique_donors = len(set(d.get("donor_name", "") for d in dons if d.get("donor_name")))
    monthly: dict = {}
    for d in dons:
        month_key = (d.get("created_at") or "")[:7]
        if month_key:
            monthly.setdefault(month_key, 0)
            monthly[month_key] += float(d.get("amount") or 0)
    monthly_data = [{"month": k, "amount": v} for k, v in sorted(monthly.items(), reverse=True)[:12]]
    recent = [
        DonationRecord(
            id=r["id"], donor_name=r["donor_name"], email=r.get("email"),
            phone=r.get("phone"), amount=float(r["amount"]),
            project_name=r["project_name"], payment_method=r["payment_method"],
            transaction_ref=r.get("transaction_ref"), status=r["status"],
            created_at=r["created_at"],
        )
        for r in dons[:10]
    ]
    return DonationSummaryResponse(
        totalAmount=total_amount, totalDonors=unique_donors,
        totalDonations=len(dons), recentDonations=recent, monthlyData=monthly_data,
    )


# ============================================================================
# 20. Dinvishesh (Historical Events) CRUD API
# ============================================================================
@app.get("/api/dinvishesh", response_model=List[DinvisheshRecord], tags=["Dinvishesh"])
async def list_dinvishesh(
    month: Optional[int] = Query(None, ge=1, le=12),
    day: Optional[int] = Query(None, ge=1, le=31),
    year: Optional[int] = Query(None),
    figure: Optional[str] = Query(None),
    personality: Optional[str] = Query(None),
    event_type: Optional[str] = Query(None),
    verification_status: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    event_date: Optional[str] = Query(None),
    is_published: Optional[bool] = Query(None),
    supabase: Any = Depends(get_supabase)
):
    query = supabase.table("dinvishesh").select("*")
    if month is not None and isinstance(month, int):
        query = query.eq("month", month)
    if day is not None and isinstance(day, int):
        query = query.eq("day", day)
    if year is not None and isinstance(year, int):
        query = query.eq("year", year)
    if event_date and isinstance(event_date, str):
        query = query.eq("event_date", event_date)
    if is_published is not None and isinstance(is_published, bool):
        query = query.eq("is_published", 1 if is_published else 0)
    
    res = query.order("month", desc=False).order("day", desc=False).execute()
    
    # In-memory post filtering for multi-attribute matching and fuzzy search
    target_pers = (personality if isinstance(personality, str) else (figure if isinstance(figure, str) else "")).strip()
    target_search = (search.strip().lower() if isinstance(search, str) else "")
    target_type = (event_type.strip() if isinstance(event_type, str) else "")
    target_status = (verification_status.strip() if isinstance(verification_status, str) else "")

    records = []
    # Pre-fetch all event sources if possible to avoid N+1 query slowdown
    event_sources_map: Dict[str, List[Dict[str, Any]]] = {}
    try:
        all_src_res = supabase.table("event_sources").select("*").execute()
        if all_src_res.data:
            for s in all_src_res.data:
                did = s.get("dinvishesh_id")
                if did:
                    event_sources_map.setdefault(did, []).append(s)
    except Exception:
        pass

    for r in res.data:
        # Check personality filter
        r_pers = r.get("personality") or r.get("figure") or "छत्रपती शिवाजी महाराज"
        if target_pers and target_pers.lower() != "all" and target_pers != "सर्व":
            if target_pers not in r_pers and r_pers not in target_pers and "दोन्ही" not in r_pers:
                continue

        # Check event_type filter
        r_type = r.get("event_type") or "ऐतिहासिक प्रसंग"
        if target_type and target_type.lower() != "all" and target_type != "सर्व":
            if target_type not in r_type:
                continue

        # Check verification_status filter
        r_status = r.get("verification_status") or "verified"
        if target_status and target_status.lower() != "all" and target_status != "सर्व":
            if target_status != r_status:
                continue

        # Check search query across titles, descriptions, location, sources, and year
        if target_search:
            t_mr = (r.get("title_marathi") or r.get("title") or "").lower()
            t_en = (r.get("title_english") or r.get("title_en") or "").lower()
            d_mr = (r.get("description_marathi") or r.get("description") or "").lower()
            d_en = (r.get("description_english") or r.get("description_en") or "").lower()
            loc = (r.get("location") or "").lower()
            src = (r.get("sources") or r.get("source_name") or "").lower()
            sig = (r.get("historical_significance") or "").lower()
            yr_str = str(r.get("year") or "")
            
            searchable = f"{t_mr} {t_en} {d_mr} {d_en} {loc} {src} {sig} {yr_str} {r_pers.lower()}"
            if target_search not in searchable:
                continue

        kf = r.get("key_figures")
        if isinstance(kf, str):
            try:
                import json
                kf = json.loads(kf)
            except Exception:
                kf = [kf] if kf else []
        elif not isinstance(kf, list):
            kf = []

        title_mr = r.get("title_marathi") or r.get("title") or ""
        title_en = r.get("title_english") or r.get("title_en") or ""
        desc_mr = r.get("description_marathi") or r.get("description") or ""
        desc_en = r.get("description_english") or r.get("description_en") or ""
        img = r.get("image_url") or r.get("image") or ""
        event_srcs = event_sources_map.get(r["id"], [])

        records.append(
            DinvisheshRecord(
                id=r["id"],
                event_date=r.get("event_date") or "",
                day=int(r.get("day") or 1),
                month=int(r.get("month") or 1),
                year=r.get("year"),
                figure=r.get("figure") or r_pers,
                personality=r_pers,
                event_type=r_type,
                title=title_mr,
                title_en=title_en,
                title_marathi=title_mr,
                title_english=title_en,
                description=desc_mr,
                description_en=desc_en,
                description_marathi=desc_mr,
                description_english=desc_en,
                historical_significance=r.get("historical_significance") or "",
                location=r.get("location") or "",
                image=img,
                image_url=img,
                key_figures=kf,
                source_name=r.get("source_name") or "",
                source_url=r.get("source_url") or "",
                source_type=r.get("source_type") or "Published historical book",
                source_description=r.get("source_description") or "",
                verification_status=r_status,
                is_disputed=bool(r.get("is_disputed", 0)),
                dispute_note=r.get("dispute_note") or "",
                sources=r.get("sources") or "",
                event_sources=event_srcs,
                is_published=bool(r.get("is_published", 1)),
                created_at=r.get("created_at"),
                updated_at=r.get("updated_at"),
            )
        )
    return records


@app.get("/api/dinvishesh/stats", tags=["Dinvishesh"])
async def get_dinvishesh_stats(supabase: Any = Depends(get_supabase)):
    """Provides historical data visualization metrics for Dinvishesh."""
    res = supabase.table("dinvishesh").select("*").eq("is_published", 1).execute()
    total_events = len(res.data)
    
    personality_dist = {
        "छत्रपती शिवाजी महाराज": 0,
        "छत्रपती संभाजी महाराज": 0,
        "दोन्ही": 0
    }
    category_dist: Dict[str, int] = {}
    location_dist: Dict[str, int] = {}
    year_dist: Dict[int, int] = {}
    timeline_events: List[Dict[str, Any]] = []

    for r in res.data:
        p = r.get("personality") or r.get("figure") or "छत्रपती शिवाजी महाराज"
        if "संभाजी" in p and "शिवाजी" in p:
            personality_dist["दोन्ही"] = personality_dist.get("दोन्ही", 0) + 1
        elif "संभाजी" in p:
            personality_dist["छत्रपती संभाजी महाराज"] = personality_dist.get("छत्रपती संभाजी महाराज", 0) + 1
        else:
            personality_dist["छत्रपती शिवाजी महाराज"] = personality_dist.get("छत्रपती शिवाजी महाराज", 0) + 1

        cat = r.get("event_type") or "ऐतिहासिक प्रसंग"
        category_dist[cat] = category_dist.get(cat, 0) + 1

        loc = (r.get("location") or "").split(",")[0].strip()
        if loc:
            location_dist[loc] = location_dist.get(loc, 0) + 1

        yr = r.get("year")
        if yr:
            year_dist[yr] = year_dist.get(yr, 0) + 1
            timeline_events.append({
                "id": r["id"],
                "year": yr,
                "day": r.get("day"),
                "month": r.get("month"),
                "title": r.get("title_marathi") or r.get("title"),
                "personality": p,
                "location": r.get("location") or "",
                "event_type": cat,
                "image": r.get("image_url") or r.get("image") or ""
            })

    timeline_events.sort(key=lambda x: (x.get("year") or 0, x.get("month") or 0, x.get("day") or 0))

    return {
        "total_events": total_events,
        "personality_distribution": personality_dist,
        "category_distribution": category_dist,
        "location_distribution": location_dist,
        "year_distribution": dict(sorted(year_dist.items())),
        "timeline_milestones": timeline_events
    }


@app.post("/api/dinvishesh", response_model=DinvisheshRecord, status_code=201, tags=["Dinvishesh"])
async def create_dinvishesh(req: DinvisheshCreate, supabase: Any = Depends(get_supabase)):
    import json
    new_id = f"din-{uuid.uuid4().hex[:8]}"
    title_mr = req.titleMarathi or req.title
    title_en = req.titleEnglish or req.titleEn
    desc_mr = req.descriptionMarathi or req.description
    desc_en = req.descriptionEnglish or req.descriptionEn
    img = req.imageUrl or req.image
    pers = req.personality or req.figure or "छत्रपती शिवाजी महाराज"

    now_iso = datetime.now().isoformat()
    payload = {
        "id": new_id,
        "event_date": req.eventDate,
        "day": req.day,
        "month": req.month,
        "year": req.year,
        "figure": pers,
        "personality": pers,
        "event_type": req.eventType,
        "title": title_mr,
        "title_marathi": title_mr,
        "title_en": title_en,
        "title_english": title_en,
        "description": desc_mr,
        "description_marathi": desc_mr,
        "description_en": desc_en,
        "description_english": desc_en,
        "location": req.location,
        "image": img,
        "image_url": img,
        "historical_significance": req.historicalSignificance,
        "source_name": req.sourceName,
        "source_url": req.sourceUrl,
        "source_type": req.sourceType,
        "source_description": req.sourceDescription,
        "verification_status": req.verificationStatus,
        "is_disputed": 1 if req.isDisputed else 0,
        "dispute_note": req.disputeNote,
        "key_figures": json.dumps(req.keyFigures, ensure_ascii=False),
        "sources": req.sources or req.sourceName,
        "is_published": 1 if req.isPublished else 0,
        "created_at": now_iso,
        "updated_at": now_iso,
    }
    supabase.table("dinvishesh").insert(payload).execute()

    # Save multiple event sources if passed
    created_sources: List[Dict[str, Any]] = []
    if req.eventSources:
        for s in req.eventSources:
            s_payload = {
                "id": f"src-{uuid.uuid4().hex[:8]}",
                "dinvishesh_id": new_id,
                "source_name": s.source_name,
                "source_url": s.source_url,
                "source_type": s.source_type,
                "source_description": s.source_description,
                "is_primary": 1 if s.is_primary else 0,
                "created_at": now_iso,
            }
            try:
                supabase.table("event_sources").insert(s_payload).execute()
                created_sources.append(s_payload)
            except Exception:
                pass

    return DinvisheshRecord(
        id=new_id,
        event_date=req.eventDate,
        day=req.day,
        month=req.month,
        year=req.year,
        figure=pers,
        personality=pers,
        event_type=req.eventType,
        title=title_mr,
        title_en=title_en,
        title_marathi=title_mr,
        title_english=title_en,
        description=desc_mr,
        description_en=desc_en,
        description_marathi=desc_mr,
        description_english=desc_en,
        historical_significance=req.historicalSignificance,
        location=req.location,
        image=img,
        image_url=img,
        key_figures=req.keyFigures,
        source_name=req.sourceName,
        source_url=req.sourceUrl,
        source_type=req.sourceType,
        source_description=req.sourceDescription,
        verification_status=req.verificationStatus,
        is_disputed=req.isDisputed,
        dispute_note=req.disputeNote,
        sources=req.sources or req.sourceName,
        event_sources=created_sources,
        is_published=req.isPublished,
        created_at=now_iso,
        updated_at=now_iso,
    )


@app.put("/api/dinvishesh/{event_id}", response_model=DinvisheshRecord, tags=["Dinvishesh"])
async def update_dinvishesh(event_id: str, req: DinvisheshCreate, supabase: Any = Depends(get_supabase)):
    import json
    title_mr = req.titleMarathi or req.title
    title_en = req.titleEnglish or req.titleEn
    desc_mr = req.descriptionMarathi or req.description
    desc_en = req.descriptionEnglish or req.descriptionEn
    img = req.imageUrl or req.image
    pers = req.personality or req.figure or "छत्रपती शिवाजी महाराज"

    now_iso = datetime.now().isoformat()
    payload = {
        "event_date": req.eventDate,
        "day": req.day,
        "month": req.month,
        "year": req.year,
        "figure": pers,
        "personality": pers,
        "event_type": req.eventType,
        "title": title_mr,
        "title_marathi": title_mr,
        "title_en": title_en,
        "title_english": title_en,
        "description": desc_mr,
        "description_marathi": desc_mr,
        "description_en": desc_en,
        "description_english": desc_en,
        "location": req.location,
        "image": img,
        "image_url": img,
        "historical_significance": req.historicalSignificance,
        "source_name": req.sourceName,
        "source_url": req.sourceUrl,
        "source_type": req.sourceType,
        "source_description": req.sourceDescription,
        "verification_status": req.verificationStatus,
        "is_disputed": 1 if req.isDisputed else 0,
        "dispute_note": req.disputeNote,
        "key_figures": json.dumps(req.keyFigures, ensure_ascii=False),
        "sources": req.sources or req.sourceName,
        "is_published": 1 if req.isPublished else 0,
        "updated_at": now_iso,
    }
    supabase.table("dinvishesh").update(payload).eq("id", event_id).execute()

    # If new event sources passed, sync them
    if req.eventSources:
        try:
            supabase.table("event_sources").delete().eq("dinvishesh_id", event_id).execute()
            for s in req.eventSources:
                s_payload = {
                    "id": f"src-{uuid.uuid4().hex[:8]}",
                    "dinvishesh_id": event_id,
                    "source_name": s.source_name,
                    "source_url": s.source_url,
                    "source_type": s.source_type,
                    "source_description": s.source_description,
                    "is_primary": 1 if s.is_primary else 0,
                    "created_at": now_iso,
                }
                supabase.table("event_sources").insert(s_payload).execute()
        except Exception:
            pass

    return DinvisheshRecord(
        id=event_id,
        event_date=req.eventDate,
        day=req.day,
        month=req.month,
        year=req.year,
        figure=pers,
        personality=pers,
        event_type=req.eventType,
        title=title_mr,
        title_en=title_en,
        title_marathi=title_mr,
        title_english=title_en,
        description=desc_mr,
        description_en=desc_en,
        description_marathi=desc_mr,
        description_english=desc_en,
        historical_significance=req.historicalSignificance,
        location=req.location,
        image=img,
        image_url=img,
        key_figures=req.keyFigures,
        source_name=req.sourceName,
        source_url=req.sourceUrl,
        source_type=req.sourceType,
        source_description=req.sourceDescription,
        verification_status=req.verificationStatus,
        is_disputed=req.isDisputed,
        dispute_note=req.disputeNote,
        sources=req.sources or req.sourceName,
        event_sources=[s.dict() for s in req.eventSources],
        is_published=req.isPublished,
        updated_at=now_iso,
    )


@app.delete("/api/dinvishesh/{event_id}", tags=["Dinvishesh"])
async def delete_dinvishesh(event_id: str, supabase: Any = Depends(get_supabase)):
    try:
        supabase.table("event_sources").delete().eq("dinvishesh_id", event_id).execute()
    except Exception:
        pass
    supabase.table("dinvishesh").delete().eq("id", event_id).execute()
    return {"deleted": event_id}


# ============================================================================
# 21. Member Manogat (मनोगत) CRUD API
# ============================================================================
def _format_manogat_record(r: dict) -> ManogatRecord:
    return ManogatRecord(
        id=r["id"],
        name=r["name"],
        nameEn=r.get("name_en") or "",
        name_en=r.get("name_en") or "",
        designation=r.get("designation") or "",
        designationEn=r.get("designation_en") or "",
        designation_en=r.get("designation_en") or "",
        photo=r.get("photo") or "",
        shortManogat=r.get("short_manogat") or "",
        short_manogat=r.get("short_manogat") or "",
        shortManogatEn=r.get("short_manogat_en") or "",
        short_manogat_en=r.get("short_manogat_en") or "",
        detailedManogat=r.get("detailed_manogat") or "",
        detailed_manogat=r.get("detailed_manogat") or "",
        detailedManogatEn=r.get("detailed_manogat_en") or "",
        detailed_manogat_en=r.get("detailed_manogat_en") or "",
        displayOrder=int(r.get("display_order") or 0),
        display_order=int(r.get("display_order") or 0),
        isPublished=bool(r.get("is_published", 1)),
        is_published=bool(r.get("is_published", 1)),
        createdAt=r.get("created_at") or "",
        created_at=r.get("created_at") or "",
        updatedAt=r.get("updated_at") or "",
        updated_at=r.get("updated_at") or "",
    )


@app.get("/api/manogat", response_model=List[ManogatRecord], tags=["Manogat"])
async def list_published_manogats(supabase: Any = Depends(get_supabase)):
    """Public list of published member reflections ordered by display order."""
    res = (
        supabase.table("member_manogat")
        .select("*")
        .eq("is_published", 1)
        .order("display_order", desc=False)
        .execute()
    )
    return [_format_manogat_record(r) for r in res.data]


@app.get("/api/admin/manogat", response_model=List[ManogatRecord], tags=["Manogat"])
async def list_all_manogats_admin(supabase: Any = Depends(get_supabase)):
    """Admin list of all member reflections including drafts and unpublished ones."""
    res = (
        supabase.table("member_manogat")
        .select("*")
        .order("display_order", desc=False)
        .execute()
    )
    return [_format_manogat_record(r) for r in res.data]


@app.get("/api/manogat/{manogat_id}", response_model=ManogatRecord, tags=["Manogat"])
async def get_manogat(manogat_id: str, supabase: Any = Depends(get_supabase)):
    res = supabase.table("member_manogat").select("*").eq("id", manogat_id).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="मनोगत सापडले नाही")
    return _format_manogat_record(res.data[0])


@app.post("/api/manogat", response_model=ManogatRecord, status_code=201, tags=["Manogat"])
async def create_manogat(req: ManogatCreate, supabase: Any = Depends(get_supabase)):
    new_id = str(uuid.uuid4())
    now_iso = datetime.now().isoformat()
    payload = {
        "id": new_id,
        "name": req.name,
        "name_en": req.nameEn,
        "designation": req.designation,
        "designation_en": req.designationEn,
        "photo": req.photo,
        "short_manogat": req.shortManogat,
        "short_manogat_en": req.shortManogatEn,
        "detailed_manogat": req.detailedManogat,
        "detailed_manogat_en": req.detailedManogatEn,
        "display_order": req.displayOrder,
        "is_published": 1 if req.isPublished else 0,
        "created_at": now_iso,
        "updated_at": now_iso,
    }
    supabase.table("member_manogat").insert(payload).execute()
    return _format_manogat_record(payload)


@app.put("/api/manogat/{manogat_id}", response_model=ManogatRecord, tags=["Manogat"])
@app.patch("/api/manogat/{manogat_id}", response_model=ManogatRecord, tags=["Manogat"])
async def update_manogat(
    manogat_id: str, req: ManogatUpdate, supabase: Any = Depends(get_supabase)
):
    now_iso = datetime.now().isoformat()
    existing = supabase.table("member_manogat").select("*").eq("id", manogat_id).execute()
    if not existing.data:
        raise HTTPException(status_code=404, detail="मनोगत सापडले नाही")

    update_dict: Dict[str, Any] = {"updated_at": now_iso}
    if req.name is not None:
        update_dict["name"] = req.name
    if req.nameEn is not None:
        update_dict["name_en"] = req.nameEn
    if req.designation is not None:
        update_dict["designation"] = req.designation
    if req.designationEn is not None:
        update_dict["designation_en"] = req.designationEn
    if req.photo is not None:
        update_dict["photo"] = req.photo
    if req.shortManogat is not None:
        update_dict["short_manogat"] = req.shortManogat
    if req.shortManogatEn is not None:
        update_dict["short_manogat_en"] = req.shortManogatEn
    if req.detailedManogat is not None:
        update_dict["detailed_manogat"] = req.detailedManogat
    if req.detailedManogatEn is not None:
        update_dict["detailed_manogat_en"] = req.detailedManogatEn
    if req.displayOrder is not None:
        update_dict["display_order"] = req.displayOrder
    if req.isPublished is not None:
        update_dict["is_published"] = 1 if req.isPublished else 0

    supabase.table("member_manogat").update(update_dict).eq("id", manogat_id).execute()
    updated = supabase.table("member_manogat").select("*").eq("id", manogat_id).execute()
    return _format_manogat_record(updated.data[0])


@app.delete("/api/manogat/{manogat_id}", tags=["Manogat"])
async def delete_manogat(manogat_id: str, supabase: Any = Depends(get_supabase)):
    supabase.table("member_manogat").delete().eq("id", manogat_id).execute()
    return {"deleted": manogat_id}


@app.post("/api/admin/seed", tags=["Admin"])
async def seed_initial_data():
    """
    Disabled pre-seeded sample data per user requirement:
    No data is added unless explicitly created by the Admin.
    """
    return {
        "status": "disabled",
        "message": "कृपया प्रशासन पॅनेलमधील फॉर्म्स वापरून स्वतःचा डेटा जोडा."
    }


@app.get("/", tags=["Root"])
def root():
    return {
        "organization": "गडकिल्ले संवर्धन प्रतिष्ठान (Gadkille Sanvardhan Pratishthan)",
        "sdk": "supabase-py",
        "docs": "/docs",
        "health": "/api/health"
    }


if __name__ == "__main__":
    uvicorn.run("main:app", host=HOST, port=PORT, reload=True)
