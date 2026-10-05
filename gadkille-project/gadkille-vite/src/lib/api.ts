/**
 * Complete Dynamic API Client for Gadkille Sanvardhan Pratishthan (Vite + FastAPI)
 */
import { uploadToSupabaseStorage } from '@/lib/supabase';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = err => reject(err);
    reader.readAsDataURL(file);
  });
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    let errorMessage = `त्रुटी (HTTP ${response.status})`;
    if (data?.detail) {
      if (typeof data.detail === 'string') {
        errorMessage = data.detail;
      } else if (Array.isArray(data.detail)) {
        errorMessage = data.detail.map((err: any) => err.msg).join(', ');
      }
    } else if (data?.message) {
      errorMessage = data.message;
    }
    throw new Error(errorMessage);
  }

  return data as T;
}

// ============================================================================
// Types
// ============================================================================
export interface SiteSettings {
  nameMarathi: string;
  nameEnglish: string;
  state: string;
  founded: string;
  founder: string;
  president: string;
  address: string;
  phone1: string;
  phone2: string;
  email: string;
  facebook: string;
  motto: string;
  mission: string;
  bankName: string;
  bankAccount: string;
  bankIfsc: string;
  upiId: string;
  statForts: number;
  statCampaigns: number;
  statVolunteers: number;
  statEvents: number;
  statTrees: number;
}

export interface TrekInfo {
  distance: string;
  time: string;
  season: string;
  water: string;
  network: string;
}

export interface Fort {
  id: string;
  name: string;
  nameEn: string;
  district: string;
  taluka: string;
  height: string;
  type: string;
  era: string;
  difficulty: string;
  difficultyEn: string;
  status: string;
  statusLabel: string;
  image: string;
  desc: string;
  history: string;
  trek: TrekInfo;
  features: string[];
  latitude: number;
  longitude: number;
  isFeatured: boolean;
  isSpotlight: boolean;
}

export interface EventItem {
  id: string;
  title: string;
  type: string;
  date: string;
  dateNum: string;
  month: string;
  location: string;
  district: string;
  capacity: number;
  registered: number;
  image: string;
  desc: string;
  status: string;
}

export interface ConservationProject {
  id: string;
  title: string;
  fort: string;
  status: string;
  progress: number;
  volunteers: number;
  budget: string;
  spent: string;
  start: string;
  end: string;
  impact: string;
  desc: string;
  beforeImg: string;
  afterImg: string;
}

export interface NewsArticle {
  id: string;
  category: string;
  title: string;
  date: string;
  author: string;
  image: string;
  desc: string;
  body: string;
}

export interface GalleryItem {
  id: string;
  src: string;
  caption: string;
  category: string;
}

export interface VolunteerPayload {
  fullName: string;
  age?: number | null;
  phone: string;
  email: string;
  district?: string;
  occupation?: string;
  interests?: string[];
  availability?: string;
  trekkingExperience?: string;
  about?: string;
}

export interface VolunteerRecord {
  id: string;
  full_name: string;
  age?: number;
  phone: string;
  email: string;
  district?: string;
  occupation?: string;
  interests: string[];
  availability?: string;
  trekking_experience?: string;
  about?: string;
  xp_points: number;
  level: number;
  status: string;
  created_at: string;
}

export interface ContactPayload {
  fullName: string;
  phone?: string;
  email: string;
  subject?: string;
  message: string;
}

export interface ContactRecord {
  id: string;
  full_name: string;
  phone?: string;
  email: string;
  subject: string;
  message: string;
  status: string;
  created_at: string;
}

export interface DonationPayload {
  donorName: string;
  email?: string;
  phone?: string;
  amount: number;
  projectName: string;
  paymentMethod: string;
  transactionRef?: string;
  panNumber?: string;
}

export interface DonationRecord {
  id: string;
  donor_name: string;
  email?: string;
  phone?: string;
  amount: number;
  project_name: string;
  payment_method: string;
  transaction_ref?: string;
  status: string;
  created_at: string;
}

export interface EventRegistrationPayload {
  eventId: string;
  eventTitle: string;
  fullName: string;
  phone: string;
  email: string;
  participantsCount: number;
  emergencyContact?: string;
}

export interface CertificateData {
  id: string;
  cert_code: string;
  recipient_name: string;
  cert_type: string;
  event_name: string;
  issued_date: string;
}

export interface AdminStats {
  totalDonationsAmount: number;
  totalDonationsCount: number;
  totalVolunteersCount: number;
  totalEventRegistrationsCount: number;
  unreadContactsCount: number;
  totalFortsCount: number;
  totalEventsCount: number;
  totalProjectsCount: number;
  totalNewsCount: number;
  totalGalleryCount: number;
  recentDonations: DonationRecord[];
  recentVolunteers: VolunteerRecord[];
  recentContacts: ContactRecord[];
}

// ============================================================================
// API Functions
// ============================================================================
export const api = {
  // Admin Auth & Seed
  adminLogin: (username: string, password: string) =>
    request<{ token: string; username: string; message: string }>('/api/admin/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    }),
  seedDatabase: () =>
    request<{ status: string; message: string }>('/api/admin/seed', { method: 'POST' }),
  fetchAdminStats: () => request<AdminStats>('/api/admin/stats'),

  // Image Upload to Supabase Object Storage (returns public URL link)
  uploadImage: async (
    file: File,
    folder = 'general'
  ): Promise<{ url: string; path: string; bucket: string }> => {
    const direct = await uploadToSupabaseStorage(file, folder).catch(() => null);
    if (direct && direct.url) {
      return direct;
    }
    const base64Data = await fileToBase64(file);
    return request<{ url: string; path: string; bucket: string }>('/api/upload', {
      method: 'POST',
      body: JSON.stringify({
        fileName: file.name,
        contentType: file.type || 'image/jpeg',
        base64Data,
        folder,
      }),
    });
  },

  // Site Settings
  getSettings: () => request<SiteSettings>('/api/settings'),
  updateSettings: (payload: SiteSettings) =>
    request<SiteSettings>('/api/settings', {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),

  // Forts CRUD
  getForts: () => request<Fort[]>('/api/forts'),
  getFort: (id: string) => request<Fort>(`/api/forts/${encodeURIComponent(id)}`),
  saveFort: (fort: Fort) =>
    request<Fort>('/api/forts', {
      method: 'POST',
      body: JSON.stringify(fort),
    }),
  deleteFort: (id: string) =>
    request<{ deleted: string }>(`/api/forts/${encodeURIComponent(id)}`, { method: 'DELETE' }),

  // Events CRUD
  getEvents: () => request<EventItem[]>('/api/events'),
  createEvent: (evt: Omit<EventItem, 'id'>) =>
    request<EventItem>('/api/events', {
      method: 'POST',
      body: JSON.stringify(evt),
    }),
  updateEvent: (id: string, evt: Omit<EventItem, 'id'>) =>
    request<EventItem>(`/api/events/${encodeURIComponent(id)}`, {
      method: 'PUT',
      body: JSON.stringify(evt),
    }),
  deleteEvent: (id: string) =>
    request<{ deleted: string }>(`/api/events/${encodeURIComponent(id)}`, { method: 'DELETE' }),
  registerForEvent: (payload: EventRegistrationPayload) =>
    request<{ id: string; message: string }>('/api/events/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  // Conservation Projects CRUD
  getProjects: () => request<ConservationProject[]>('/api/projects'),
  createProject: (proj: Omit<ConservationProject, 'id'>) =>
    request<ConservationProject>('/api/projects', {
      method: 'POST',
      body: JSON.stringify(proj),
    }),
  updateProject: (id: string, proj: Omit<ConservationProject, 'id'>) =>
    request<ConservationProject>(`/api/projects/${encodeURIComponent(id)}`, {
      method: 'PUT',
      body: JSON.stringify(proj),
    }),
  deleteProject: (id: string) =>
    request<{ deleted: string }>(`/api/projects/${encodeURIComponent(id)}`, { method: 'DELETE' }),

  // News CRUD
  getNews: () => request<NewsArticle[]>('/api/news'),
  createNews: (article: Omit<NewsArticle, 'id'>) =>
    request<NewsArticle>('/api/news', {
      method: 'POST',
      body: JSON.stringify(article),
    }),
  deleteNews: (id: string) =>
    request<{ deleted: string }>(`/api/news/${encodeURIComponent(id)}`, { method: 'DELETE' }),

  // Gallery CRUD
  getGallery: () => request<GalleryItem[]>('/api/gallery'),
  createGalleryItem: (item: Omit<GalleryItem, 'id'>) =>
    request<GalleryItem>('/api/gallery', {
      method: 'POST',
      body: JSON.stringify(item),
    }),
  deleteGalleryItem: (id: string) =>
    request<{ deleted: string }>(`/api/gallery/${encodeURIComponent(id)}`, { method: 'DELETE' }),

  // Volunteers
  getVolunteers: () => request<VolunteerRecord[]>('/api/volunteers'),
  registerVolunteer: (payload: VolunteerPayload) =>
    request<{ id: string; certCode?: string; message: string }>('/api/volunteers', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  deleteVolunteer: (id: string) =>
    request<{ deleted: string }>(`/api/volunteers/${encodeURIComponent(id)}`, { method: 'DELETE' }),

  // Contacts
  getContacts: () => request<ContactRecord[]>('/api/contacts'),
  sendContactMessage: (payload: ContactPayload) =>
    request<{ id: string; message: string }>('/api/contact', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  deleteContact: (id: string) =>
    request<{ deleted: string }>(`/api/contacts/${encodeURIComponent(id)}`, { method: 'DELETE' }),

  // Donations
  getDonations: () => request<DonationRecord[]>('/api/donations'),
  submitDonation: (payload: DonationPayload) =>
    request<{ id: string; receiptNumber: string; message: string }>('/api/donations', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  deleteDonation: (id: string) =>
    request<{ deleted: string }>(`/api/donations/${encodeURIComponent(id)}`, { method: 'DELETE' }),

  // Certificates (Admin creates/deletes; Public only gets/verifies)
  getCertificates: () => request<CertificateData[]>('/api/certificates'),
  issueCertificate: (payload: { recipientName: string; certType: string; eventName: string }) =>
    request<CertificateData>('/api/certificates', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  verifyCertificate: (certCodeOrName: string) =>
    request<CertificateData>(`/api/certificates/${encodeURIComponent(certCodeOrName)}`),
  deleteCertificate: (id: string) =>
    request<{ deleted: string }>(`/api/certificates/${encodeURIComponent(id)}`, { method: 'DELETE' }),

  // Team Members
  getTeamMembers: () => request<TeamMemberRecord[]>('/api/team-members'),
  createTeamMember: (payload: Omit<TeamMemberRecord, 'id'>) =>
    request<TeamMemberRecord>('/api/team-members', { method: 'POST', body: JSON.stringify(payload) }),
  deleteTeamMember: (id: string) =>
    request<{ deleted: string }>(`/api/team-members/${encodeURIComponent(id)}`, { method: 'DELETE' }),

  // Organizations
  getOrganizations: () => request<OrganizationRecord[]>('/api/organizations'),
  getOrganization: (id: string) => request<OrganizationRecord>(`/api/organizations/${encodeURIComponent(id)}`),
  createOrganization: (payload: Omit<OrganizationRecord, 'id'>) =>
    request<OrganizationRecord>('/api/organizations', { method: 'POST', body: JSON.stringify(payload) }),
  deleteOrganization: (id: string) =>
    request<{ deleted: string }>(`/api/organizations/${encodeURIComponent(id)}`, { method: 'DELETE' }),

  // Partner Organizations
  getPartners: () => request<PartnerOrgRecord[]>('/api/partners'),
  createPartner: (payload: Omit<PartnerOrgRecord, 'id'>) =>
    request<PartnerOrgRecord>('/api/partners', { method: 'POST', body: JSON.stringify(payload) }),
  deletePartner: (id: string) =>
    request<{ deleted: string }>(`/api/partners/${encodeURIComponent(id)}`, { method: 'DELETE' }),

  // Students
  studentRegister: (payload: StudentRegisterPayload) =>
    request<StudentLoginResponse>('/api/students/register', { method: 'POST', body: JSON.stringify(payload) }),
  studentLogin: (email: string, password: string) =>
    request<StudentLoginResponse>('/api/students/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  getStudents: () => request<StudentRecord[]>('/api/students'),
  getStudent: (id: string) => request<StudentRecord>(`/api/students/${encodeURIComponent(id)}`),
  deleteStudent: (id: string) =>
    request<{ deleted: string }>(`/api/students/${encodeURIComponent(id)}`, { method: 'DELETE' }),
  getStudentParticipations: (studentId: string) =>
    request<StudentParticipationRecord[]>(`/api/students/${encodeURIComponent(studentId)}/participations`),
  createStudentParticipation: (payload: Omit<StudentParticipationRecord, 'id' | 'completedAt'>) =>
    request<StudentParticipationRecord>('/api/student-participations', { method: 'POST', body: JSON.stringify(payload) }),

  // Certificate Templates
  getCertificateTemplates: () => request<CertificateTemplateRecord[]>('/api/certificate-templates'),
  createCertificateTemplate: (payload: Omit<CertificateTemplateRecord, 'id'>) =>
    request<CertificateTemplateRecord>('/api/certificate-templates', { method: 'POST', body: JSON.stringify(payload) }),
  deleteCertificateTemplate: (id: string) =>
    request<{ deleted: string }>(`/api/certificate-templates/${encodeURIComponent(id)}`, { method: 'DELETE' }),

  // Education Programs
  getEducationPrograms: () => request<EducationProgramRecord[]>('/api/education-programs'),
  createEducationProgram: (payload: Omit<EducationProgramRecord, 'id'>) =>
    request<EducationProgramRecord>('/api/education-programs', { method: 'POST', body: JSON.stringify(payload) }),
  deleteEducationProgram: (id: string) =>
    request<{ deleted: string }>(`/api/education-programs/${encodeURIComponent(id)}`, { method: 'DELETE' }),

  // Donation Summary
  getDonationSummary: () => request<DonationSummaryResponse>('/api/donations/summary'),

  // Dinvishesh (Historical Events)
  getDinvishesh: (params?: {
    month?: number;
    day?: number;
    year?: number;
    figure?: string;
    personality?: string;
    event_type?: string;
    verification_status?: string;
    search?: string;
    event_date?: string;
    is_published?: boolean;
  }) => {
    const q = new URLSearchParams();
    if (params?.month) q.append('month', params.month.toString());
    if (params?.day) q.append('day', params.day.toString());
    if (params?.year) q.append('year', params.year.toString());
    if (params?.figure) q.append('figure', params.figure);
    if (params?.personality) q.append('personality', params.personality);
    if (params?.event_type) q.append('event_type', params.event_type);
    if (params?.verification_status) q.append('verification_status', params.verification_status);
    if (params?.search) q.append('search', params.search);
    if (params?.event_date) q.append('event_date', params.event_date);
    if (params?.is_published !== undefined) q.append('is_published', params.is_published ? 'true' : 'false');
    const queryStr = q.toString() ? `?${q.toString()}` : '';
    return request<DinvisheshRecord[]>(`/api/dinvishesh${queryStr}`);
  },
  getDinvisheshStats: () => request<DinvisheshStatsRecord>('/api/dinvishesh/stats'),
  createDinvishesh: (payload: any) =>
    request<DinvisheshRecord>('/api/dinvishesh', { method: 'POST', body: JSON.stringify(payload) }),
  updateDinvishesh: (id: string, payload: any) =>
    request<DinvisheshRecord>(`/api/dinvishesh/${encodeURIComponent(id)}`, { method: 'PUT', body: JSON.stringify(payload) }),
  deleteDinvishesh: (id: string) =>
    request<{ deleted: string }>(`/api/dinvishesh/${encodeURIComponent(id)}`, { method: 'DELETE' }),
};

// ============================================================================
// New Types
// ============================================================================
export interface EventSourceItem {
  id?: string;
  source_name: string;
  source_url?: string;
  source_type?: string;
  source_description?: string;
  is_primary?: boolean;
}

export interface DinvisheshStatsRecord {
  total_events: number;
  personality_distribution: Record<string, number>;
  category_distribution: Record<string, number>;
  location_distribution: Record<string, number>;
  year_distribution: Record<string, number>;
  timeline_milestones: Array<{
    id: string;
    year: number;
    day: number;
    month: number;
    title: string;
    personality: string;
    location: string;
    event_type: string;
    image: string;
  }>;
}

export interface DinvisheshRecord {
  id: string;
  event_date: string;
  day: number;
  month: number;
  year?: number | null;
  figure: string;
  personality?: string;
  event_type?: string;
  title: string;
  title_marathi?: string;
  title_en?: string;
  title_english?: string;
  description: string;
  description_marathi?: string;
  description_en?: string;
  description_english?: string;
  historical_significance?: string;
  location?: string;
  image?: string;
  image_url?: string;
  key_figures?: string[];
  source_name?: string;
  source_url?: string;
  source_type?: string;
  source_description?: string;
  verification_status?: 'verified' | 'under_review' | 'archived' | string;
  is_disputed?: boolean;
  dispute_note?: string;
  sources?: string;
  event_sources?: EventSourceItem[];
  is_published?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface TeamMemberRecord {
  id: string;
  name: string;
  nameEn: string;
  role: string;
  roleEn: string;
  photo: string;
  introduction: string;
  introductionEn: string;
  responsibilities: string;
  responsibilitiesEn: string;
  contribution: string;
  contributionEn: string;
  displayOrder: number;
  isActive: boolean;
}

export interface OrganizationRecord {
  id: string;
  name: string;
  nameEn: string;
  introduction: string;
  introductionEn: string;
  activities: string;
  activitiesEn: string;
  initiatives: string;
  initiativesEn: string;
  achievements: string;
  achievementsEn: string;
  image: string;
  extraImages: string[];
  contactInfo: string;
  website: string;
  isActive: boolean;
}

export interface PartnerOrgRecord {
  id: string;
  name: string;
  nameEn: string;
  logo: string;
  description: string;
  descriptionEn: string;
  partnerType: string;
  partnershipDetails: string;
  partnershipDetailsEn: string;
  relatedActivities: string;
  relatedActivitiesEn: string;
  website: string;
  contactInfo: string;
  isActive: boolean;
}

export interface StudentRegisterPayload {
  fullName: string;
  email: string;
  phone?: string;
  password: string;
  studentType: string;
  institution?: string;
  classYear?: string;
  district?: string;
}

export interface StudentLoginResponse {
  token: string;
  studentId: string;
  fullName: string;
  email: string;
  studentType: string;
  message: string;
}

export interface StudentRecord {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  studentType: string;
  institution: string;
  classYear: string;
  district: string;
  profilePhoto: string;
  isActive: boolean;
  createdAt?: string;
}

export interface StudentParticipationRecord {
  id: string;
  studentId: string;
  activityType: string;
  activityTitle: string;
  score: number;
  maxScore: number;
  status: string;
  certificateId: string;
  completedAt?: string;
}

export interface CertificateTemplateRecord {
  id: string;
  name: string;
  designUrl: string;
  templateType: string;
  bgColor: string;
  borderColor: string;
  titleText: string;
  subtitleText: string;
  footerText: string;
  isDefault: boolean;
  isActive: boolean;
}

export interface EducationProgramRecord {
  id: string;
  title: string;
  titleEn: string;
  category: string;
  description: string;
  descriptionEn: string;
  image: string;
  targetAudience: string;
  targetAudienceEn: string;
  schedule: string;
  status: string;
  isActive: boolean;
}

export interface DonationSummaryResponse {
  totalAmount: number;
  totalDonors: number;
  totalDonations: number;
  recentDonations: DonationRecord[];
  monthlyData: { month: string; amount: number }[];
}
