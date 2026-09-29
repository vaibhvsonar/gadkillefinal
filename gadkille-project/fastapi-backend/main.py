import uuid
import random
import base64
import re
from contextlib import asynccontextmanager
from typing import List, Any
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
    DonationCreate, DonationResponse, DonationRecord,
    EventRegistrationCreate, EventRegistrationResponse, EventRegistrationRecord,
    CertificateCreate, CertificateRecord,
    AdminStatsResponse
)

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
# 8. Donations API
# ============================================================================
@app.post("/api/donations", response_model=DonationResponse, status_code=201, tags=["Donations"])
async def create_donation(req: DonationCreate, supabase: Any = Depends(get_supabase)):
    new_id = str(uuid.uuid4())
    receipt_no = f"GSP-80G-{date.today().year}-{random.randint(10000, 99999)}"
    tx_ref = req.transactionRef or receipt_no

    payload = {
        "id": new_id,
        "donor_name": req.donorName.strip() or "अनाम (Anonymous)",
        "email": req.email.lower() if req.email else None,
        "phone": req.phone,
        "amount": req.amount,
        "project_name": req.projectName,
        "payment_method": req.paymentMethod,
        "transaction_ref": tx_ref,
        "pan_number": req.panNumber,
        "status": "completed",
    }
    supabase.table("donations").insert(payload).execute()
    return DonationResponse(
        id=uuid.UUID(new_id),
        receiptNumber=receipt_no,
        message=f"धन्यवाद! ₹{req.amount:,.0f} ची देणगी यशस्वीरित्या नोंदवली गेली आहे."
    )


@app.get("/api/donations", response_model=List[DonationRecord], tags=["Donations"])
async def list_donations(limit: int = Query(100, ge=1, le=500), supabase: Any = Depends(get_supabase)):
    res = supabase.table("donations").select("*").order("created_at", desc=True).limit(limit).execute()
    return [
        DonationRecord(
            id=row["id"],
            donor_name=row["donor_name"],
            email=row.get("email"),
            phone=row.get("phone"),
            amount=float(row["amount"]),
            project_name=row["project_name"],
            payment_method=row["payment_method"],
            transaction_ref=row.get("transaction_ref"),
            status=row["status"],
            created_at=row["created_at"],
        )
        for row in res.data
    ]


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
        recentDonations=[
            DonationRecord(
                id=r["id"],
                donor_name=r["donor_name"],
                email=r.get("email"),
                phone=r.get("phone"),
                amount=float(r["amount"]),
                project_name=r["project_name"],
                payment_method=r["payment_method"],
                transaction_ref=r.get("transaction_ref"),
                status=r["status"],
                created_at=r["created_at"],
            )
            for r in dons[:25]
        ],
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
