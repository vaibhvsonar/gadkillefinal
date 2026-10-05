from typing import Optional, List, Dict, Any
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
    dateOfBirth: Optional[str] = Field(None, max_length=10)  # YYYY-MM-DD format
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
    date_of_birth: Optional[str] = None
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
    totalStudentsCount: int = 0
    totalTeamMembersCount: int = 0
    totalOrganizationsCount: int = 0
    totalPartnerOrgsCount: int = 0
    totalEducationProgramsCount: int = 0
    totalCertificateTemplatesCount: int = 0
    recentDonations: List[DonationRecord]
    recentVolunteers: List[VolunteerRecord]
    recentContacts: List[ContactRecord]

# ============================================================================
# 12. Team Members Schemas
# ============================================================================
class TeamMemberCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=150)
    nameEn: str = ""
    role: str = ""
    roleEn: str = ""
    photo: str = ""
    introduction: str = ""
    introductionEn: str = ""
    responsibilities: str = ""
    responsibilitiesEn: str = ""
    contribution: str = ""
    contributionEn: str = ""
    displayOrder: int = 0
    isActive: bool = True

class TeamMemberRecord(BaseModel):
    id: str
    name: str
    nameEn: str = ""
    role: str = ""
    roleEn: str = ""
    photo: str = ""
    introduction: str = ""
    introductionEn: str = ""
    responsibilities: str = ""
    responsibilitiesEn: str = ""
    contribution: str = ""
    contributionEn: str = ""
    displayOrder: int = 0
    isActive: bool = True

# ============================================================================
# 13. Organizations Schemas
# ============================================================================
class OrganizationCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=200)
    nameEn: str = ""
    introduction: str = ""
    introductionEn: str = ""
    activities: str = ""
    activitiesEn: str = ""
    initiatives: str = ""
    initiativesEn: str = ""
    achievements: str = ""
    achievementsEn: str = ""
    image: str = ""
    extraImages: List[str] = Field(default_factory=list)
    contactInfo: str = ""
    website: str = ""
    isActive: bool = True

class OrganizationRecord(BaseModel):
    id: str
    name: str
    nameEn: str = ""
    introduction: str = ""
    introductionEn: str = ""
    activities: str = ""
    activitiesEn: str = ""
    initiatives: str = ""
    initiativesEn: str = ""
    achievements: str = ""
    achievementsEn: str = ""
    image: str = ""
    extraImages: List[str] = Field(default_factory=list)
    contactInfo: str = ""
    website: str = ""
    isActive: bool = True

# ============================================================================
# 14. Partner Organizations Schemas
# ============================================================================
class PartnerOrgCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=200)
    nameEn: str = ""
    logo: str = ""
    description: str = ""
    descriptionEn: str = ""
    partnerType: str = "organization"
    partnershipDetails: str = ""
    partnershipDetailsEn: str = ""
    relatedActivities: str = ""
    relatedActivitiesEn: str = ""
    website: str = ""
    contactInfo: str = ""
    isActive: bool = True

class PartnerOrgRecord(BaseModel):
    id: str
    name: str
    nameEn: str = ""
    logo: str = ""
    description: str = ""
    descriptionEn: str = ""
    partnerType: str = "organization"
    partnershipDetails: str = ""
    partnershipDetailsEn: str = ""
    relatedActivities: str = ""
    relatedActivitiesEn: str = ""
    website: str = ""
    contactInfo: str = ""
    isActive: bool = True

# ============================================================================
# 15. Students Schemas (Auth)
# ============================================================================
class StudentRegisterRequest(BaseModel):
    fullName: str = Field(..., min_length=1, max_length=150)
    email: EmailStr
    phone: str = Field("", max_length=30)
    password: str = Field(..., min_length=6, max_length=100)
    studentType: str = Field("school", max_length=30)
    institution: str = ""
    classYear: str = ""
    district: str = ""

class StudentLoginRequest(BaseModel):
    email: EmailStr
    password: str

class StudentLoginResponse(BaseModel):
    token: str
    studentId: str
    fullName: str
    email: str
    studentType: str
    message: str

class StudentRecord(BaseModel):
    id: str
    fullName: str
    email: str
    phone: str = ""
    studentType: str = "school"
    institution: str = ""
    classYear: str = ""
    district: str = ""
    profilePhoto: str = ""
    isActive: bool = True
    createdAt: Optional[str] = None

# ============================================================================
# 16. Student Participations Schemas
# ============================================================================
class StudentParticipationCreate(BaseModel):
    studentId: str
    activityType: str = "quiz"
    activityTitle: str
    score: int = 0
    maxScore: int = 0
    status: str = "completed"
    certificateId: str = ""

class StudentParticipationRecord(BaseModel):
    id: str
    studentId: str
    activityType: str = "quiz"
    activityTitle: str
    score: int = 0
    maxScore: int = 0
    status: str = "completed"
    certificateId: str = ""
    completedAt: Optional[str] = None

# ============================================================================
# 17. Certificate Templates Schemas
# ============================================================================
class CertificateTemplateCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=200)
    designUrl: str = ""
    templateType: str = "participation"
    bgColor: str = "#FFFDF9"
    borderColor: str = "#B58A45"
    titleText: str = "प्रमाणपत्र"
    subtitleText: str = ""
    footerText: str = "गडकिल्ले संवर्धन प्रतिष्ठान"
    isDefault: bool = False
    isActive: bool = True

class CertificateTemplateRecord(BaseModel):
    id: str
    name: str
    designUrl: str = ""
    templateType: str = "participation"
    bgColor: str = "#FFFDF9"
    borderColor: str = "#B58A45"
    titleText: str = "प्रमाणपत्र"
    subtitleText: str = ""
    footerText: str = "गडकिल्ले संवर्धन प्रतिष्ठान"
    isDefault: bool = False
    isActive: bool = True

# ============================================================================
# 18. Education Programs Schemas
# ============================================================================
class EducationProgramCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    titleEn: str = ""
    category: str = "program"
    description: str = ""
    descriptionEn: str = ""
    image: str = ""
    targetAudience: str = ""
    targetAudienceEn: str = ""
    schedule: str = ""
    status: str = "active"
    isActive: bool = True

class EducationProgramRecord(BaseModel):
    id: str
    title: str
    titleEn: str = ""
    category: str = "program"
    description: str = ""
    descriptionEn: str = ""
    image: str = ""
    targetAudience: str = ""
    targetAudienceEn: str = ""
    schedule: str = ""
    status: str = "active"
    isActive: bool = True

# ============================================================================
# 19. Donation Summary Schema
# ============================================================================
class DonationSummaryResponse(BaseModel):
    totalAmount: float = 0
    totalDonors: int = 0
    totalDonations: int = 0
    recentDonations: List[DonationRecord] = []
    monthlyData: List[dict] = Field(default_factory=list)

# ============================================================================
# 20. Dinvishesh (Historical Events) Schemas
# ============================================================================
class EventSourceItem(BaseModel):
    id: Optional[str] = None
    source_name: str = ""
    source_url: str = ""
    source_type: str = "Published historical book"
    source_description: str = ""
    is_primary: bool = False

class DinvisheshCreate(BaseModel):
    eventDate: str = Field(..., max_length=10) # e.g. "06-06" or "1674-06-06"
    day: int = Field(..., ge=1, le=31)
    month: int = Field(..., ge=1, le=12)
    year: Optional[int] = None
    figure: str = Field("छत्रपती शिवाजी महाराज", max_length=100) # Backward compatibility
    personality: Optional[str] = Field(None, max_length=100) # "छत्रपती शिवाजी महाराज" or "छत्रपती संभाजी महाराज" or "दोन्ही"
    eventType: str = Field("ऐतिहासिक प्रसंग", max_length=80) # राज्याभिषेक, लढाई / पराक्रम, मुत्सद्देगिरी / तह, दुर्ग स्थापना / विजय, जन्म / जयंती, बलिदान / पुण्यतिथी, प्रशासन व न्याय, आरमार
    title: str = Field(..., min_length=1, max_length=250)
    titleEn: str = ""
    titleMarathi: Optional[str] = None
    titleEnglish: Optional[str] = None
    description: str = Field(..., min_length=1)
    descriptionEn: str = ""
    descriptionMarathi: Optional[str] = None
    descriptionEnglish: Optional[str] = None
    historicalSignificance: str = ""
    location: str = ""
    image: str = ""
    imageUrl: Optional[str] = None
    keyFigures: List[str] = Field(default_factory=list)
    sourceName: str = ""
    sourceUrl: str = ""
    sourceType: str = "Published historical book"
    sourceDescription: str = ""
    verificationStatus: str = "verified" # verified, under_review, archived
    isDisputed: bool = False
    disputeNote: str = ""
    sources: str = ""
    eventSources: List[EventSourceItem] = Field(default_factory=list)
    isPublished: bool = True

class DinvisheshRecord(BaseModel):
    id: str
    event_date: str
    day: int
    month: int
    year: Optional[int] = None
    figure: str
    personality: str = "छत्रपती शिवाजी महाराज"
    event_type: str = "ऐतिहासिक प्रसंग"
    title: str
    title_en: str = ""
    title_marathi: str = ""
    title_english: str = ""
    description: str
    description_en: str = ""
    description_marathi: str = ""
    description_english: str = ""
    historical_significance: str = ""
    location: str = ""
    image: str = ""
    image_url: str = ""
    key_figures: List[str] = Field(default_factory=list)
    source_name: str = ""
    source_url: str = ""
    source_type: str = "Published historical book"
    source_description: str = ""
    verification_status: str = "verified"
    is_disputed: bool = False
    dispute_note: str = ""
    sources: str = ""
    event_sources: List[Dict[str, Any]] = Field(default_factory=list)
    is_published: bool = True
    created_at: Optional[str] = None
    updated_at: Optional[str] = None



