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
};
