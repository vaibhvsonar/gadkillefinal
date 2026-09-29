from typing import Optional, List
from uuid import UUID
from datetime import datetime, date
from pydantic import BaseModel, EmailStr, Field, field_validator

# ============================================================================
# 0. Site Settings & Admin Auth Schemas
# ============================================================================
class AdminLoginRequest(BaseModel):
    username: str
    password: str

class AdminLoginResponse(BaseModel):
    token: str
    username: str
    message: str

class SiteSettingsSchema(BaseModel):
    nameMarathi: str = "गड-किल्ले संवर्धन प्रतिष्ठान"
    nameEnglish: str = "Gadkille Sanvardhan Pratishthan"
    state: str = "महाराष्ट्र राज्य"
    founded: str = "२०११"
    founder: str = "श्री. योगेश सोनवणे"
    president: str = "श्री. अभिषेक नवले"
    address: str = "गडकिल्ले-५१३, अथर्व कॉम्प्लेक्स, कृष्णा चौक, पिंपळे गुरव, पुणे – ४११०६१"
    phone1: str = "90496 87970"
    phone2: str = ""
    email: str = "gadkille.sanvardhan1630@gmail.com"
    facebook: str = "https://www.facebook.com/gadkillesanvardhanpratishthan"
    motto: str = "गड जपूया • इतिहास जपूया • वारसा पुढील पिढीकडे नेऊया"
    mission: str = "महाराष्ट्रातील गड-किल्ल्यांचे संवर्धन, संशोधन व जनजागृती"
    bankName: str = "State Bank of India"
    bankAccount: str = "XXXX XXXX XXXX"
    bankIfsc: str = "SBIN0XXXXXX"
    upiId: str = "gadkille@sbi"
    statForts: int = 0
    statCampaigns: int = 0
    statVolunteers: int = 0
    statEvents: int = 0
    statTrees: int = 0

# ============================================================================
# 1. Forts Schemas
# ============================================================================
class TrekInfoSchema(BaseModel):
    distance: str = "3 किमी"
    time: str = "2-3 तास"
    season: str = "ऑक्टोबर–मार्च"
    water: str = "उपलब्ध"
    network: str = "चांगले"

class FortSchema(BaseModel):
    id: str
    name: str
    nameEn: str
    district: str
    taluka: str = ""
    height: str = ""
    type: str = "गिरिदुर्ग"
    era: str = ""
    difficulty: str = "मध्यम"
    difficultyEn: str = "moderate"
    status: str = "progress"
    statusLabel: str = "संवर्धन सुरू"
    image: str = "/images/raigad.jpg"
    desc: str = ""
    history: str = ""
    trek: TrekInfoSchema = Field(default_factory=TrekInfoSchema)
    features: List[str] = Field(default_factory=list)
    latitude: float = 18.5
    longitude: float = 73.8
    isFeatured: bool = False
    isSpotlight: bool = False

# ============================================================================
# 2. Events Schemas
# ============================================================================
class EventCreate(BaseModel):
    title: str
    type: str = "स्वच्छता"
    date: str
    dateNum: str = "15"
    month: str = "OCT"
    location: str
    district: str = "पुणे"
    capacity: int = 100
    registered: int = 0
    image: str = "/images/raigad.jpg"
    desc: str = ""
    status: str = "नोंदणी सुरू"

class EventRecord(EventCreate):
    id: str

# ============================================================================
# 3. Conservation Projects Schemas
# ============================================================================
class ProjectCreate(BaseModel):
    title: str
    fort: str
    status: str = "सुरू आहे"
    progress: int = Field(0, ge=0, le=100)
    volunteers: int = 0
    budget: str = "₹1,00,000"
    spent: str = "₹0"
    start: str = ""
    end: str = ""
    impact: str = ""
    desc: str = ""
    beforeImg: str = "/images/conservation.jpg"
    afterImg: str = "/images/raigad.jpg"

class ProjectRecord(ProjectCreate):
    id: str

# ============================================================================
# 4. News Schemas
# ============================================================================
class NewsCreate(BaseModel):
    category: str = "संवर्धन"
    title: str
    date: str
    author: str = "संपादकीय"
    image: str = "/images/raigad.jpg"
    desc: str = ""
    body: str = ""

class NewsRecord(NewsCreate):
    id: str

# ============================================================================
# 5. Gallery Schemas
# ============================================================================
class GalleryCreate(BaseModel):
    src: str
    caption: str
    category: str = "गडकिल्ले"

class GalleryRecord(GalleryCreate):
    id: str

class ImageUploadRequest(BaseModel):
    fileName: str
    contentType: str = "image/jpeg"
    base64Data: str
    folder: str = "general"

class ImageUploadResponse(BaseModel):
    url: str
    path: str
    bucket: str = "images"

# ============================================================================
# 6. Volunteers Schemas
# ============================================================================
class VolunteerCreate(BaseModel):
    fullName: str = Field(..., min_length=1, max_length=150)
    age: Optional[int] = Field(None, ge=15, le=75)
    phone: str = Field(..., min_length=1, max_length=30)
    email: EmailStr = Field(..., max_length=255)
    district: Optional[str] = Field(None, max_length=80)
    occupation: Optional[str] = Field(None, max_length=150)
    interests: List[str] = Field(default_factory=list)
    availability: Optional[str] = Field(None, max_length=80)
    trekkingExperience: Optional[str] = Field(None, max_length=80)
    about: Optional[str] = Field(None, max_length=2000)

    @field_validator("fullName", "phone", mode="before")
    @classmethod
    def strip_strings(cls, v):
        return v.strip() if isinstance(v, str) else v

    @field_validator("email", mode="before")
    @classmethod
    def lowercase_email(cls, v):
        return v.strip().lower() if isinstance(v, str) else v

class VolunteerResponse(BaseModel):
    id: UUID
    certCode: Optional[str] = None
    message: str

class VolunteerRecord(BaseModel):
    id: UUID
    full_name: str
    age: Optional[int] = None
    phone: str
    email: str
    district: Optional[str] = None
    occupation: Optional[str] = None
    interests: List[str] = []
    availability: Optional[str] = None
    trekking_experience: Optional[str] = None
    about: Optional[str] = None
    xp_points: int = 100
    level: int = 1
    status: str = "active"
    created_at: datetime

# ============================================================================
# 7. Contact Us Schemas
# ============================================================================
class ContactCreate(BaseModel):
    fullName: str = Field(..., min_length=1, max_length=150)
    phone: Optional[str] = Field(None, max_length=30)
    email: EmailStr = Field(..., max_length=255)
    subject: Optional[str] = Field("सामान्य चौकशी", max_length=150)
    message: str = Field(..., min_length=1, max_length=3000)

class ContactResponse(BaseModel):
    id: UUID
    message: str

class ContactRecord(BaseModel):
    id: UUID
    full_name: str
    phone: Optional[str] = None
    email: str
    subject: Optional[str] = None
    message: str
    status: str
    created_at: datetime

# ============================================================================
# 8. Donations Schemas
# ============================================================================
class DonationCreate(BaseModel):
    donorName: str = Field("अनाम (Anonymous)", max_length=150)
    email: Optional[EmailStr] = None
    phone: Optional[str] = Field(None, max_length=30)
    amount: float = Field(..., gt=0)
    projectName: str = Field("सामान्य संवर्धन निधी", max_length=150)
    paymentMethod: str = Field("UPI", max_length=50)
    transactionRef: Optional[str] = Field(None, max_length=100)
    panNumber: Optional[str] = Field(None, max_length=20)

class DonationResponse(BaseModel):
    id: UUID
    receiptNumber: str
    message: str

class DonationRecord(BaseModel):
    id: UUID
    donor_name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    amount: float
    project_name: str
    payment_method: str
    transaction_ref: Optional[str] = None
    status: str
    created_at: datetime

# ============================================================================
# 9. Event Registrations Schemas
# ============================================================================
class EventRegistrationCreate(BaseModel):
    eventId: str = Field(..., min_length=1, max_length=100)
    eventTitle: str = Field(..., min_length=1, max_length=200)
    fullName: str = Field(..., min_length=1, max_length=150)
    phone: str = Field(..., min_length=1, max_length=30)
    email: EmailStr = Field(..., max_length=255)
    participantsCount: int = Field(1, ge=1, le=20)
    emergencyContact: Optional[str] = Field(None, max_length=50)

class EventRegistrationResponse(BaseModel):
    id: UUID
    message: str

class EventRegistrationRecord(BaseModel):
    id: UUID
    event_id: str
    event_title: str
    full_name: str
    phone: str
    email: str
    participants_count: int
    status: str
    created_at: datetime

# ============================================================================
# 10. Digital Certificates Schemas
# ============================================================================
class CertificateCreate(BaseModel):
    recipientName: str = Field(..., min_length=1, max_length=150)
    certType: str = Field("volunteer", max_length=50)
    eventName: str = Field(..., min_length=1, max_length=200)

class CertificateRecord(BaseModel):
    id: UUID
    cert_code: str
    recipient_name: str
    cert_type: str
    event_name: str
    issued_date: date
    created_at: datetime

# ============================================================================
# 11. Admin Dashboard Stats Schema
# ============================================================================
class AdminStatsResponse(BaseModel):
    totalDonationsAmount: float
    totalDonationsCount: int
    totalVolunteersCount: int
    totalEventRegistrationsCount: int
    unreadContactsCount: int
    totalFortsCount: int
    totalEventsCount: int
    totalProjectsCount: int
    totalNewsCount: int
    totalGalleryCount: int
    recentDonations: List[DonationRecord]
    recentVolunteers: List[VolunteerRecord]
    recentContacts: List[ContactRecord]
