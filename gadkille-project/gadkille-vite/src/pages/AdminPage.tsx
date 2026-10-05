import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  LayoutDashboard,
  Castle,
  CalendarDays,
  Hammer,
  Newspaper,
  Image as ImageIcon,
  Users,
  HandCoins,
  MessageSquare,
  Settings,
  LogOut,
  RefreshCw,
  ArrowLeft,
  ShieldCheck,
  Plus,
  Trash2,
  Edit3,
  Award,
  Save,
  Upload,
  Loader2,
  CheckCircle2,
} from 'lucide-react';
import {
  api,
  type AdminStats,
  type Fort,
  type EventItem,
  type ConservationProject,
  type SiteSettings,
  type CertificateData,
  type DinvisheshRecord,
} from '@/lib/api';
import { useSiteData } from '@/context/SiteContext';

interface ImageUploadFieldProps {
  label: string;
  value: string;
  folder: string;
  onChange: (url: string) => void;
  required?: boolean;
}

function ImageUploadField({ label, value, folder, onChange, required }: ImageUploadFieldProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>('');

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadError(null);
    setFileName(file.name);

    try {
      const res = await api.uploadImage(file, folder);
      onChange(res.url);
    } catch (err: any) {
      setUploadError(err.message || 'फोटो अपलोड करताना त्रुटी आली.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-1.5">
      <label className="block text-[11px] text-white/65 font-semibold">
        {label} {required && <span className="text-[#F4956A]">*</span>}
      </label>

      <label className="flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-dashed border-[#D4A955]/50 cursor-pointer transition-colors">
        <div className="flex items-center gap-2.5 min-w-0">
          {uploading ? (
            <Loader2 size={16} className="text-[#D4A955] animate-spin shrink-0" />
          ) : (
            <Upload size={16} className="text-[#D4A955] shrink-0" />
          )}
          <div className="truncate">
            <div className="text-xs font-semibold text-white truncate">
              {uploading
                ? 'Supabase Storage मध्ये अपलोड होत आहे...'
                : fileName
                ? `निवडलेली फाइल: ${fileName}`
                : '📁 फोटो फाइल निवडा (Upload Image)'}
            </div>
            <div className="text-[10px] text-white/40 truncate">
              JPG, PNG, WEBP · थेट Supabase Object Storage मध्ये जतन होते
            </div>
          </div>
        </div>
        <span className="px-2.5 py-1 rounded-lg bg-[#A84A20] text-white text-[10px] font-bold shrink-0">
          Browse
        </span>
        <input
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />
      </label>

      {uploadError && (
        <p className="text-[11px] text-red-400">{uploadError}</p>
      )}

      {value && !uploading && (
        <div className="flex items-center gap-2.5 p-2 rounded-lg bg-white/5 border border-white/10">
          <img
            src={value}
            alt="Preview"
            className="w-10 h-10 rounded object-cover shrink-0 border border-white/15"
          />
          <div className="min-w-0 flex-1">
            <div className="text-[10px] text-[#6DC87A] flex items-center gap-1 font-semibold">
              <CheckCircle2 size={11} /> फोटो लिंक जतन झाली
            </div>
            <div className="text-[10px] text-white/40 truncate font-mono">{value}</div>
          </div>
        </div>
      )}
    </div>
  );
}

type TabId =
  | 'overview'
  | 'dinvishesh'
  | 'forts'
  | 'events'
  | 'projects'
  | 'news'
  | 'gallery'
  | 'certificates'
  | 'volunteers'
  | 'donations'
  | 'contacts'
  | 'settings';

const EMPTY_STATS: AdminStats = {
  totalDonationsAmount: 0,
  totalDonationsCount: 0,
  totalVolunteersCount: 0,
  totalEventRegistrationsCount: 0,
  unreadContactsCount: 0,
  totalFortsCount: 0,
  totalEventsCount: 0,
  totalProjectsCount: 0,
  totalNewsCount: 0,
  totalGalleryCount: 0,
  recentDonations: [],
  recentVolunteers: [],
  recentContacts: [],
};

const EMPTY_FORT: Fort = {
  id: '',
  name: '',
  nameEn: '',
  district: 'पुणे',
  taluka: '',
  height: '1000 मी',
  type: 'गिरिदुर्ग',
  era: 'इ.स. १६वे शतक',
  difficulty: 'मध्यम',
  difficultyEn: 'moderate',
  status: 'progress',
  statusLabel: 'संवर्धन सुरू',
  image: '',
  desc: '',
  history: '',
  trek: {
    distance: '3 किमी',
    time: '2-3 तास',
    season: 'ऑक्टोबर–मार्च',
    water: 'उपलब्ध',
    network: 'मध्यम',
  },
  features: ['बालेकिल्ला', 'मुख्य दरवाजा'],
  latitude: 18.3,
  longitude: 73.75,
  isFeatured: false,
  isSpotlight: false,
};

export function AdminPage() {
  const {
    settings,
    forts,
    events,
    projects,
    news,
    gallery,
    refreshAll,
  } = useSiteData();

  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem('gsp_admin_token')
  );
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginErr, setLoginErr] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const [stats, setStats] = useState<AdminStats>(EMPTY_STATS);
  const [certificates, setCertificates] = useState<CertificateData[]>([]);
  const [loading, setLoading] = useState(false);
  const [statusBanner, setStatusBanner] = useState<string | null>(null);

  // Forms state
  const [fortForm, setFortForm] = useState<Fort>(EMPTY_FORT);
  const [featuresText, setFeaturesText] = useState('बालेकिल्ला, मुख्य दरवाजा');

  const [eventForm, setEventForm] = useState<Omit<EventItem, 'id'>>({
    title: '',
    type: 'स्वच्छता',
    date: '15 ऑक्टोबर 2026',
    dateNum: '15',
    month: 'OCT',
    location: '',
    district: 'पुणे',
    capacity: 100,
    registered: 0,
    image: '',
    desc: '',
    status: 'नोंदणी सुरू',
  });
  const [editingEventId, setEditingEventId] = useState<string | null>(null);

  const [projectForm, setProjectForm] = useState<Omit<ConservationProject, 'id'>>({
    title: '',
    fort: '',
    status: 'सुरू आहे',
    progress: 50,
    volunteers: 25,
    budget: '₹2,50,000',
    spent: '₹1,25,000',
    start: 'जानेवारी 2026',
    end: 'डिसेंबर 2026',
    impact: '',
    desc: '',
    beforeImg: '',
    afterImg: '',
  });
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);

  const [newsForm, setNewsForm] = useState({
    category: 'संवर्धन',
    title: '',
    date: '28 सप्टेंबर 2026',
    author: 'संपादकीय',
    image: '',
    desc: '',
    body: '',
  });

  const [galleryForm, setGalleryForm] = useState({
    src: '',
    caption: '',
    category: 'गडकिल्ले',
  });

  const [certForm, setCertForm] = useState({
    recipientName: '',
    certType: 'volunteer',
    eventName: 'गडकिल्ले स्वच्छता व संवर्धन मोहीम',
  });

  const [settingsForm, setSettingsForm] = useState<SiteSettings>(settings);

  useEffect(() => {
    setSettingsForm(settings);
  }, [settings]);

  const [dinvisheshList, setDinvisheshList] = useState<DinvisheshRecord[]>([]);
  const [editingDinId, setEditingDinId] = useState<string | null>(null);
  const [dinSearch, setDinSearch] = useState('');
  const [dinFilterFigure, setDinFilterFigure] = useState('all');
  const [dinFilterStatus, setDinFilterStatus] = useState('all');
  const [showDinPreview, setShowDinPreview] = useState(false);
  const [dinForm, setDinForm] = useState<{
    day: number;
    month: number;
    year: number | '';
    personality: string;
    eventType: string;
    titleMarathi: string;
    titleEnglish: string;
    descriptionMarathi: string;
    descriptionEnglish: string;
    location: string;
    image: string;
    historicalSignificance: string;
    sourceName: string;
    sourceUrl: string;
    sourceType: string;
    sourceDescription: string;
    verificationStatus: string;
    isDisputed: boolean;
    disputeNote: string;
    keyFiguresStr: string;
    sources: string;
    isPublished: boolean;
  }>({
    day: 6,
    month: 6,
    year: 1674,
    personality: 'छत्रपती शिवाजी महाराज',
    eventType: 'राज्याभिषेक',
    titleMarathi: '',
    titleEnglish: '',
    descriptionMarathi: '',
    descriptionEnglish: '',
    location: '',
    image: '',
    historicalSignificance: '',
    sourceName: '',
    sourceUrl: '',
    sourceType: 'Published historical book',
    sourceDescription: '',
    verificationStatus: 'verified',
    isDisputed: false,
    disputeNote: '',
    keyFiguresStr: '',
    sources: '',
    isPublished: true,
  });

  const loadStats = async () => {
    setLoading(true);
    try {
      const [live, certs, dinList] = await Promise.all([
        api.fetchAdminStats(),
        api.getCertificates().catch(() => []),
        api.getDinvishesh().catch(() => []),
      ]);
      setStats(live);
      setCertificates(certs);
      setDinvisheshList(dinList);
    } catch (err: any) {
      setStatusBanner(`⚠️ बॅकएंड कनेक्शन त्रुटी: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDinvishesh = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dinForm.titleMarathi.trim() || !dinForm.descriptionMarathi.trim()) {
      setStatusBanner('⚠️ कृपया मराठी शीर्षक आणि सविस्तर वर्णन पूर्ण भरा.');
      return;
    }

    const keyFigures = dinForm.keyFiguresStr
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);

    const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
    const eventDate = `${pad(dinForm.month)}-${pad(dinForm.day)}`;

    const payload = {
      eventDate,
      event_date: eventDate,
      day: Number(dinForm.day),
      month: Number(dinForm.month),
      year: dinForm.year === '' ? undefined : Number(dinForm.year),
      figure: dinForm.personality,
      personality: dinForm.personality,
      eventType: dinForm.eventType,
      event_type: dinForm.eventType,
      title: dinForm.titleMarathi,
      titleMarathi: dinForm.titleMarathi,
      title_marathi: dinForm.titleMarathi,
      titleEn: dinForm.titleEnglish,
      titleEnglish: dinForm.titleEnglish,
      title_en: dinForm.titleEnglish,
      title_english: dinForm.titleEnglish,
      description: dinForm.descriptionMarathi,
      descriptionMarathi: dinForm.descriptionMarathi,
      description_marathi: dinForm.descriptionMarathi,
      descriptionEn: dinForm.descriptionEnglish,
      descriptionEnglish: dinForm.descriptionEnglish,
      description_en: dinForm.descriptionEnglish,
      description_english: dinForm.descriptionEnglish,
      location: dinForm.location,
      image: dinForm.image,
      imageUrl: dinForm.image,
      image_url: dinForm.image,
      historicalSignificance: dinForm.historicalSignificance,
      historical_significance: dinForm.historicalSignificance,
      sourceName: dinForm.sourceName,
      source_name: dinForm.sourceName,
      sourceUrl: dinForm.sourceUrl,
      source_url: dinForm.sourceUrl,
      sourceType: dinForm.sourceType,
      source_type: dinForm.sourceType,
      sourceDescription: dinForm.sourceDescription,
      source_description: dinForm.sourceDescription,
      verificationStatus: dinForm.verificationStatus,
      verification_status: dinForm.verificationStatus,
      isDisputed: dinForm.isDisputed,
      is_disputed: dinForm.isDisputed,
      disputeNote: dinForm.disputeNote,
      dispute_note: dinForm.disputeNote,
      keyFigures,
      key_figures: keyFigures,
      sources: dinForm.sources || dinForm.sourceName,
      isPublished: dinForm.isPublished,
      is_published: dinForm.isPublished,
    };

    try {
      if (editingDinId) {
        await api.updateDinvishesh(editingDinId, payload);
        setStatusBanner(`✅ ऐतिहासिक घटना "${dinForm.titleMarathi}" अद्ययावत झाली!`);
      } else {
        await api.createDinvishesh(payload);
        setStatusBanner(`✅ नवीन ऐतिहासिक प्रसंग "${dinForm.titleMarathi}" जोडला गेला!`);
      }

      setEditingDinId(null);
      setDinForm({
        day: 6,
        month: 6,
        year: 1674,
        personality: 'छत्रपती शिवाजी महाराज',
        eventType: 'राज्याभिषेक',
        titleMarathi: '',
        titleEnglish: '',
        descriptionMarathi: '',
        descriptionEnglish: '',
        location: '',
        image: '',
        historicalSignificance: '',
        sourceName: '',
        sourceUrl: '',
        sourceType: 'Published historical book',
        sourceDescription: '',
        verificationStatus: 'verified',
        isDisputed: false,
        disputeNote: '',
        keyFiguresStr: '',
        sources: '',
        isPublished: true,
      });
      setShowDinPreview(false);
      await loadStats();
    } catch (err: any) {
      setStatusBanner(`❌ त्रुटी: ${err.message}`);
    }
  };

  const handleDeleteDinvishesh = async (id: string) => {
    if (!window.confirm('तुम्हाला खरोखर ही ऐतिहासिक घटना हटवायची आहे का?')) return;
    try {
      await api.deleteDinvishesh(id);
      setStatusBanner('✅ प्रसंग हटवला गेला!');
      await loadStats();
    } catch (err: any) {
      setStatusBanner(`❌ ${err.message}`);
    }
  };

  const handleTogglePublishDinvishesh = async (item: DinvisheshRecord) => {
    try {
      await api.updateDinvishesh(item.id, { is_published: !item.is_published });
      setStatusBanner(`✅ स्थिती बदलली: ${!item.is_published ? 'प्रकाशित' : 'अप्रकाशित'}`);
      await loadStats();
    } catch (err: any) {
      setStatusBanner(`❌ ${err.message}`);
    }
  };

  useEffect(() => {
    if (token) {
      loadStats();
    }
  }, [token]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginErr(null);
    try {
      const res = await api.adminLogin(username, password);
      localStorage.setItem('gsp_admin_token', res.token);
      setToken(res.token);
    } catch (err: any) {
      setLoginErr(err.message || 'चुकीचे लॉगिन तपशील!');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('gsp_admin_token');
    setToken(null);
  };

  const handleSeed = async () => {
    setLoading(true);
    setStatusBanner(null);
    try {
      const res = await api.seedDatabase();
      setStatusBanner(`✅ ${res.message}`);
      await refreshAll();
      await loadStats();
    } catch (err: any) {
      setStatusBanner(`❌ ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Fort Save / Delete
  const handleSaveFort = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fortForm.image) {
      setStatusBanner('⚠️ कृपया आधी किल्ल्याचा फोटो अपलोड करा.');
      return;
    }
    try {
      const payload: Fort = {
        ...fortForm,
        features: featuresText
          .split(',')
          .map(s => s.trim())
          .filter(Boolean),
      };
      await api.saveFort(payload);
      setStatusBanner(`✅ किल्ला "${payload.name}" जतन झाला!`);
      setFortForm(EMPTY_FORT);
      await refreshAll();
      await loadStats();
    } catch (err: any) {
      setStatusBanner(`❌ ${err.message}`);
    }
  };

  const handleDeleteFort = async (id: string) => {
    await api.deleteFort(id);
    setStatusBanner(`🗑️ किल्ला (${id}) हटवला.`);
    await refreshAll();
    await loadStats();
  };

  // Event Save / Delete
  const handleSaveEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventForm.image) {
      setStatusBanner('⚠️ कृपया आधी कार्यक्रमाचा फोटो अपलोड करा.');
      return;
    }
    try {
      if (editingEventId) {
        await api.updateEvent(editingEventId, eventForm);
        setStatusBanner('✅ कार्यक्रम अद्ययावत झाला!');
      } else {
        await api.createEvent(eventForm);
        setStatusBanner('✅ नवीन कार्यक्रम जोडला गेला!');
      }
      setEditingEventId(null);
      setEventForm({
        title: '',
        type: 'स्वच्छता',
        date: '15 ऑक्टोबर 2026',
        dateNum: '15',
        month: 'OCT',
        location: '',
        district: 'पुणे',
        capacity: 100,
        registered: 0,
        image: '',
        desc: '',
        status: 'नोंदणी सुरू',
      });
      await refreshAll();
      await loadStats();
    } catch (err: any) {
      setStatusBanner(`❌ ${err.message}`);
    }
  };

  const handleDeleteEvent = async (id: string) => {
    await api.deleteEvent(id);
    await refreshAll();
    await loadStats();
  };

  // Project Save / Delete
  const handleSaveProject = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...projectForm,
        beforeImg: projectForm.beforeImg || '/images/conservation.jpg',
        afterImg: projectForm.afterImg || '/images/raigad.jpg',
      };
      if (editingProjectId) {
        await api.updateProject(editingProjectId, payload);
        setStatusBanner('✅ संवर्धन प्रकल्प अद्ययावत झाला!');
      } else {
        await api.createProject(payload);
        setStatusBanner('✅ नवीन संवर्धन प्रकल्प जोडला गेला!');
      }
      setEditingProjectId(null);
      await refreshAll();
      await loadStats();
    } catch (err: any) {
      setStatusBanner(`❌ ${err.message}`);
    }
  };

  const handleDeleteProject = async (id: string) => {
    await api.deleteProject(id);
    await refreshAll();
    await loadStats();
  };

  // News Save / Delete
  const handleSaveNews = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsForm.image) {
      setStatusBanner('⚠️ कृपया आधी बातमीचा फोटो अपलोड करा.');
      return;
    }
    try {
      await api.createNews(newsForm);
      setStatusBanner('✅ नवीन बातमी प्रकाशित झाली!');
      setNewsForm({
        category: 'संवर्धन',
        title: '',
        date: '28 सप्टेंबर 2026',
        author: 'संपादकीय',
        image: '',
        desc: '',
        body: '',
      });
      await refreshAll();
      await loadStats();
    } catch (err: any) {
      setStatusBanner(`❌ ${err.message}`);
    }
  };

  // Gallery Save / Delete
  const handleSaveGallery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!galleryForm.src) {
      setStatusBanner('⚠️ कृपया आधी गॅलरी फोटो फाइल निवडा व अपलोड करा.');
      return;
    }
    try {
      await api.createGalleryItem(galleryForm);
      setStatusBanner('✅ नवीन फोटो गॅलरीमध्ये जोडला गेला!');
      setGalleryForm({ src: '', caption: '', category: 'गडकिल्ले' });
      await refreshAll();
      await loadStats();
    } catch (err: any) {
      setStatusBanner(`❌ ${err.message}`);
    }
  };

  // Certificate Issue (Admin Only)
  const handleIssueCert = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const created = await api.issueCertificate(certForm);
      setStatusBanner(
        `✅ प्रमाणपत्र जारी झाले! नाव: ${created.recipient_name} | कोड: ${created.cert_code}`
      );
      setCertForm({
        recipientName: '',
        certType: 'volunteer',
        eventName: 'गडकिल्ले स्वच्छता व संवर्धन मोहीम',
      });
      await loadStats();
    } catch (err: any) {
      setStatusBanner(`❌ ${err.message}`);
    }
  };

  // Settings Save
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.updateSettings(settingsForm);
      setStatusBanner('✅ वेबसाइट सेटिंग्ज यशस्वीरित्या जतन झाल्या!');
      await refreshAll();
    } catch (err: any) {
      setStatusBanner(`❌ ${err.message}`);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-[#0f1117] flex items-center justify-center p-6 pt-24">
        <div className="bg-[#1a1f2e] rounded-2xl p-8 w-full max-w-sm border border-[rgba(255,255,255,0.08)] shadow-2xl">
          <div className="text-center mb-6">
            <img
              src="/images/logo-white.png"
              alt="GSP Logo"
              className="w-16 h-16 mx-auto mb-3 object-contain"
            />
            <h1 className="font-serif text-xl font-bold text-white">प्रशासन लॉगिन</h1>
            <p className="text-xs text-[rgba(255,255,255,0.4)] mt-1">
              Gadkille Sanvardhan Pratishthan
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="admin-username" className="block text-xs text-[rgba(255,255,255,0.5)] mb-1">
                वापरकर्ता नाव
              </label>
              <input
                id="admin-username"
                type="text"
                required
                placeholder="वापरकर्ता नाव टाका"
                value={username}
                onChange={e => setUsername(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.12)] text-white text-sm focus:border-[#D4A955] focus:outline-none"
              />
            </div>
            <div>
              <label htmlFor="admin-password" className="block text-xs text-[rgba(255,255,255,0.5)] mb-1">पासवर्ड</label>
              <input
                id="admin-password"
                type="password"
                required
                placeholder="पासवर्ड टाका"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.12)] text-white text-sm focus:border-[#D4A955] focus:outline-none"
              />
            </div>

            {loginErr && <p className="text-xs text-[#F4956A] text-center">{loginErr}</p>}

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-[#A84A20] hover:bg-[#c15a2a] text-white font-bold text-sm transition-colors"
            >
              लॉगिन करा →
            </button>
          </form>
        </div>
      </div>
    );
  }

  const navItems: { id: TabId; label: string; icon: any; count?: number }[] = [
    { id: 'overview', label: 'डॅशबोर्ड आढावा', icon: LayoutDashboard },
    { id: 'dinvishesh', label: 'दिनविशेष (ऐतिहासिक कॅलेंडर)', icon: CalendarDays, count: dinvisheshList.length },
    { id: 'forts', label: 'गडकिल्ले (Forts)', icon: Castle, count: forts.length },
    { id: 'events', label: 'कार्यक्रम (Events)', icon: CalendarDays, count: events.length },
    { id: 'projects', label: 'संवर्धन प्रकल्प', icon: Hammer, count: projects.length },
    { id: 'news', label: 'बातम्या व लेख', icon: Newspaper, count: news.length },
    { id: 'gallery', label: 'फोटो गॅलरी', icon: ImageIcon, count: gallery.length },
    { id: 'certificates', label: 'प्रमाणपत्रे (Certificates)', icon: Award, count: certificates.length },
    { id: 'volunteers', label: 'स्वयंसेवक यादी', icon: Users, count: stats.totalVolunteersCount },
    { id: 'donations', label: 'देणगी व्यवहार', icon: HandCoins, count: stats.totalDonationsCount },
    { id: 'contacts', label: 'संपर्क संदेश', icon: MessageSquare, count: stats.recentContacts.length },
    { id: 'settings', label: 'वेबसाइट सेटिंग्ज', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[#0f1117] text-white pt-[68px] flex">
      {/* Sidebar */}
      <aside className="w-64 bg-[#1a1f2e] border-r border-[rgba(255,255,255,0.06)] p-4 hidden md:flex flex-col justify-between shrink-0">
        <div className="space-y-4">
          <div className="pb-3 border-b border-[rgba(255,255,255,0.06)] flex items-center gap-3">
            <ShieldCheck className="text-[#D4A955]" size={24} />
            <div>
              <div className="font-bold text-sm">GSP डायनॅमिक CMS</div>
              <div className="text-[10px] text-[rgba(255,255,255,0.4)]">संपूर्ण वेबसाइट नियंत्रण</div>
            </div>
          </div>

          <nav className="space-y-1">
            {navItems.map(item => {
              const Icon = item.icon;
              const active = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    active
                      ? 'bg-[rgba(168,74,32,0.25)] text-[#F4956A] border border-[rgba(168,74,32,0.4)]'
                      : 'text-[rgba(255,255,255,0.6)] hover:bg-[rgba(255,255,255,0.05)] hover:text-white'
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <Icon size={15} />
                    <span>{item.label}</span>
                  </span>
                  {item.count !== undefined && (
                    <span className="px-2 py-0.5 rounded-full bg-white/10 text-[10px]">
                      {item.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs text-[rgba(255,255,255,0.45)] hover:text-[#F4956A] hover:bg-[rgba(255,255,255,0.04)] transition-colors"
        >
          <LogOut size={15} /> लॉगआउट
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-5 sm:p-8 overflow-x-auto space-y-6">
        {/* Top bar */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="font-serif text-2xl font-bold text-white">
              प्रशासन व डायनॅमिक वेबसाइट नियंत्रण
            </h1>
            <p className="text-xs text-[rgba(255,255,255,0.45)] mt-0.5">
              येथून केलेला प्रत्येक बदल थेट Supabase डेटाबेस आणि वेबसाइटवर तात्काळ दिसतो.
            </p>
          </div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={() => {
                refreshAll();
                loadStats();
              }}
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-semibold transition-colors"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> रिफ्रेश
            </button>
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[rgba(181,138,69,0.15)] text-[#D4A955] text-xs font-semibold"
            >
              <ArrowLeft size={14} /> वेबसाइट पहा
            </Link>
          </div>
        </div>

        {/* Mobile Tab Switcher */}
        <div className="flex md:hidden gap-2 overflow-x-auto pb-2">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 ${
                activeTab === item.id
                  ? 'bg-[#A84A20] text-white'
                  : 'bg-[#1a1f2e] text-white/60'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {statusBanner && (
          <div className="p-3.5 rounded-xl bg-[rgba(181,138,69,0.15)] border border-[rgba(181,138,69,0.3)] text-xs text-[#D4A955] flex justify-between items-center">
            <span>{statusBanner}</span>
            <button onClick={() => setStatusBanner(null)} className="text-white/50 hover:text-white">
              ✕
            </button>
          </div>
        )}

        {/* 1. OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                {
                  label: 'एकूण देणगी निधी',
                  val: `₹${stats.totalDonationsAmount.toLocaleString('en-IN')}`,
                  sub: `${stats.totalDonationsCount} व्यवहार`,
                },
                {
                  label: 'नोंदणीकृत स्वयंसेवक',
                  val: stats.totalVolunteersCount,
                  sub: 'थेट डेटाबेस संख्या',
                },
                {
                  label: 'गडकिल्ले / प्रकल्प',
                  val: `${forts.length} / ${projects.length}`,
                  sub: 'सक्रिय यादी',
                },
                {
                  label: 'मोहीम नोंदणी / संदेश',
                  val: `${stats.totalEventRegistrationsCount} / ${stats.recentContacts.length}`,
                  sub: 'सहभागी व चौकशी',
                },
              ].map(k => (
                <div
                  key={k.label}
                  className="bg-[#1a1f2e] rounded-2xl p-5 border border-[rgba(255,255,255,0.06)]"
                >
                  <div className="text-xs text-white/45 mb-1">{k.label}</div>
                  <div className="text-2xl font-black text-[#D4A955]">{k.val}</div>
                  <div className="text-[11px] text-white/30 mt-1">{k.sub}</div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-[#1a1f2e] rounded-2xl p-5 border border-white/10">
                <h3 className="font-bold text-sm mb-3 text-[#D4A955]">
                  👥 अलीकडील स्वयंसेवक ({stats.recentVolunteers.length})
                </h3>
                {stats.recentVolunteers.length === 0 ? (
                  <p className="text-xs text-white/40 py-4">अद्याप कोणतीही स्वयंसेवक नोंदणी नाही.</p>
                ) : (
                  <div className="space-y-2.5 text-xs">
                    {stats.recentVolunteers.slice(0, 6).map(v => (
                      <div
                        key={v.id}
                        className="flex justify-between items-center p-2.5 rounded-xl bg-white/5"
                      >
                        <div>
                          <div className="font-bold text-white">{v.full_name}</div>
                          <div className="text-white/50">
                            {v.district} · {v.phone}
                          </div>
                        </div>
                        <span className="text-[#6DC87A] font-semibold">{v.email}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="bg-[#1a1f2e] rounded-2xl p-5 border border-white/10">
                <h3 className="font-bold text-sm mb-3 text-[#D4A955]">
                  💰 अलीकडील देणग्या ({stats.recentDonations.length})
                </h3>
                {stats.recentDonations.length === 0 ? (
                  <p className="text-xs text-white/40 py-4">अद्याप कोणतीही देणगी नोंद नाही.</p>
                ) : (
                  <div className="space-y-2.5 text-xs">
                    {stats.recentDonations.slice(0, 6).map(d => (
                      <div
                        key={d.id}
                        className="flex justify-between items-center p-2.5 rounded-xl bg-white/5"
                      >
                        <div>
                          <div className="font-bold text-white">{d.donor_name}</div>
                          <div className="text-white/50">{d.project_name}</div>
                        </div>
                        <span className="font-bold text-[#D4A955]">
                          ₹{Number(d.amount).toLocaleString('en-IN')}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 2. FORTS MANAGEMENT TAB */}
        {activeTab === 'forts' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <form
              onSubmit={handleSaveFort}
              className="bg-[#1a1f2e] rounded-2xl p-5 border border-white/10 space-y-3 h-fit"
            >
              <h3 className="font-bold text-sm text-[#D4A955] flex items-center gap-2">
                <Plus size={16} /> किल्ला जोडा किंवा संपादित करा
              </h3>
              <div className="grid grid-cols-2 gap-2.5">
                <input
                  required
                  placeholder="Slug ID (उदा. raigad)"
                  value={fortForm.id}
                  onChange={e => setFortForm({ ...fortForm, id: e.target.value })}
                  className="px-3 py-2 rounded-lg bg-white/5 border border-white/15 text-xs"
                />
                <input
                  required
                  placeholder="मराठी नाव (उदा. रायगड)"
                  value={fortForm.name}
                  onChange={e => setFortForm({ ...fortForm, name: e.target.value })}
                  className="px-3 py-2 rounded-lg bg-white/5 border border-white/15 text-xs"
                />
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                <input
                  required
                  placeholder="English Name"
                  value={fortForm.nameEn}
                  onChange={e => setFortForm({ ...fortForm, nameEn: e.target.value })}
                  className="px-3 py-2 rounded-lg bg-white/5 border border-white/15 text-xs"
                />
                <input
                  required
                  placeholder="जिल्हा (उदा. पुणे)"
                  value={fortForm.district}
                  onChange={e => setFortForm({ ...fortForm, district: e.target.value })}
                  className="px-3 py-2 rounded-lg bg-white/5 border border-white/15 text-xs"
                />
              </div>
              <div className="grid grid-cols-3 gap-2">
                <input
                  placeholder="तालुका"
                  value={fortForm.taluka}
                  onChange={e => setFortForm({ ...fortForm, taluka: e.target.value })}
                  className="px-3 py-2 rounded-lg bg-white/5 border border-white/15 text-xs"
                />
                <input
                  placeholder="उंची (820 मी)"
                  value={fortForm.height}
                  onChange={e => setFortForm({ ...fortForm, height: e.target.value })}
                  className="px-3 py-2 rounded-lg bg-white/5 border border-white/15 text-xs"
                />
                <input
                  placeholder="प्रकार (गिरिदुर्ग)"
                  value={fortForm.type}
                  onChange={e => setFortForm({ ...fortForm, type: e.target.value })}
                  className="px-3 py-2 rounded-lg bg-white/5 border border-white/15 text-xs"
                />
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                <select
                  value={fortForm.status}
                  onChange={e => {
                    const st = e.target.value;
                    const lbl =
                      st === 'conserved'
                        ? 'संवर्धित'
                        : st === 'needed'
                        ? 'संवर्धन आवश्यक'
                        : 'संवर्धन सुरू';
                    setFortForm({ ...fortForm, status: st, statusLabel: lbl });
                  }}
                  className="px-3 py-2 rounded-lg bg-[#0f1117] border border-white/15 text-xs"
                >
                  <option value="conserved">संवर्धित (Conserved)</option>
                  <option value="progress">संवर्धन सुरू (In Progress)</option>
                  <option value="needed">संवर्धन आवश्यक (Needed)</option>
                </select>
                <select
                  value={fortForm.difficultyEn}
                  onChange={e => {
                    const df = e.target.value;
                    const lbl = df === 'easy' ? 'सोपे' : df === 'hard' ? 'कठीण' : 'मध्यम';
                    setFortForm({ ...fortForm, difficultyEn: df, difficulty: lbl });
                  }}
                  className="px-3 py-2 rounded-lg bg-[#0f1117] border border-white/15 text-xs"
                >
                  <option value="easy">सोपे (Easy)</option>
                  <option value="moderate">मध्यम (Moderate)</option>
                  <option value="hard">कठीण (Hard)</option>
                </select>
              </div>
              <ImageUploadField
                label="किल्ल्याचा फोटो अपलोड करा (Fort Image)"
                folder="forts"
                value={fortForm.image}
                onChange={url => setFortForm({ ...fortForm, image: url })}
                required
              />
              <textarea
                rows={2}
                placeholder="थोडक्यात माहिती (Description)"
                value={fortForm.desc}
                onChange={e => setFortForm({ ...fortForm, desc: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/15 text-xs"
              />
              <textarea
                rows={3}
                placeholder="सविस्तर इतिहास (History)"
                value={fortForm.history}
                onChange={e => setFortForm({ ...fortForm, history: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/15 text-xs"
              />
              <input
                placeholder="वैशिष्ट्ये (स्वल्पविरामाने वेगळी करा)"
                value={featuresText}
                onChange={e => setFeaturesText(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/15 text-xs"
              />
              <div className="grid grid-cols-2 gap-2.5">
                <input
                  type="number"
                  step="any"
                  placeholder="Latitude (18.23)"
                  value={fortForm.latitude}
                  onChange={e => setFortForm({ ...fortForm, latitude: Number(e.target.value) })}
                  className="px-3 py-2 rounded-lg bg-white/5 border border-white/15 text-xs"
                />
                <input
                  type="number"
                  step="any"
                  placeholder="Longitude (73.44)"
                  value={fortForm.longitude}
                  onChange={e => setFortForm({ ...fortForm, longitude: Number(e.target.value) })}
                  className="px-3 py-2 rounded-lg bg-white/5 border border-white/15 text-xs"
                />
              </div>
              <div className="flex gap-4 text-xs pt-1">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={fortForm.isFeatured}
                    onChange={e => setFortForm({ ...fortForm, isFeatured: e.target.checked })}
                  />
                  मुखपृष्ठावर दाखवा (Featured)
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={fortForm.isSpotlight}
                    onChange={e => setFortForm({ ...fortForm, isSpotlight: e.target.checked })}
                  />
                  महिन्याचा किल्ला (Spotlight)
                </label>
              </div>
              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-[#A84A20] hover:bg-[#c15a2a] text-white font-bold text-xs"
              >
                💾 किल्ला सेव्ह करा
              </button>
            </form>

            <div className="lg:col-span-2 bg-[#1a1f2e] rounded-2xl p-5 border border-white/10">
              <h3 className="font-bold text-sm mb-4">सध्याचे गडकिल्ले ({forts.length})</h3>
              <div className="space-y-2.5">
                {forts.map(f => (
                  <div
                    key={f.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={f.image}
                        alt={f.name}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                      <div>
                        <div className="font-bold text-sm">
                          {f.name} ({f.nameEn}){' '}
                          {f.isSpotlight && (
                            <span className="text-[10px] px-2 py-0.5 rounded bg-[#D4A955] text-black font-bold">
                              Spotlight
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-white/50">
                          {f.district} · {f.height} · {f.statusLabel}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setFortForm(f);
                          setFeaturesText(f.features.join(', '));
                        }}
                        className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-[#D4A955]"
                        title="संपादित करा"
                      >
                        <Edit3 size={14} />
                      </button>
                      <button
                        onClick={() => handleDeleteFort(f.id)}
                        className="p-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400"
                        title="हटवा"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 3. EVENTS MANAGEMENT TAB */}
        {activeTab === 'events' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <form
              onSubmit={handleSaveEvent}
              className="bg-[#1a1f2e] rounded-2xl p-5 border border-white/10 space-y-3 h-fit"
            >
              <h3 className="font-bold text-sm text-[#D4A955]">
                {editingEventId ? '✏️ कार्यक्रम संपादित करा' : '➕ नवीन कार्यक्रम जोडा'}
              </h3>
              <input
                required
                placeholder="कार्यक्रमाचे नाव"
                value={eventForm.title}
                onChange={e => setEventForm({ ...eventForm, title: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/15 text-xs"
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  placeholder="प्रकार (स्वच्छता / संवर्धन)"
                  value={eventForm.type}
                  onChange={e => setEventForm({ ...eventForm, type: e.target.value })}
                  className="px-3 py-2 rounded-lg bg-white/5 border border-white/15 text-xs"
                />
                <input
                  placeholder="पूर्ण तारीख (15 ऑक्टोबर 2026)"
                  value={eventForm.date}
                  onChange={e => setEventForm({ ...eventForm, date: e.target.value })}
                  className="px-3 py-2 rounded-lg bg-white/5 border border-white/15 text-xs"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input
                  placeholder="दिवस अंक (15)"
                  value={eventForm.dateNum}
                  onChange={e => setEventForm({ ...eventForm, dateNum: e.target.value })}
                  className="px-3 py-2 rounded-lg bg-white/5 border border-white/15 text-xs"
                />
                <input
                  placeholder="महिना (OCT)"
                  value={eventForm.month}
                  onChange={e => setEventForm({ ...eventForm, month: e.target.value })}
                  className="px-3 py-2 rounded-lg bg-white/5 border border-white/15 text-xs"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input
                  required
                  placeholder="ठिकाण (रायगड)"
                  value={eventForm.location}
                  onChange={e => setEventForm({ ...eventForm, location: e.target.value })}
                  className="px-3 py-2 rounded-lg bg-white/5 border border-white/15 text-xs"
                />
                <input
                  placeholder="जिल्हा"
                  value={eventForm.district}
                  onChange={e => setEventForm({ ...eventForm, district: e.target.value })}
                  className="px-3 py-2 rounded-lg bg-white/5 border border-white/15 text-xs"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  placeholder="क्षमता (Capacity)"
                  value={eventForm.capacity}
                  onChange={e => setEventForm({ ...eventForm, capacity: Number(e.target.value) })}
                  className="px-3 py-2 rounded-lg bg-white/5 border border-white/15 text-xs"
                />
                <input
                  type="number"
                  placeholder="नोंदणीकृत (Registered)"
                  value={eventForm.registered}
                  onChange={e =>
                    setEventForm({ ...eventForm, registered: Number(e.target.value) })
                  }
                  className="px-3 py-2 rounded-lg bg-white/5 border border-white/15 text-xs"
                />
              </div>
              <ImageUploadField
                label="कार्यक्रमाचा फोटो अपलोड करा (Event Image)"
                folder="events"
                value={eventForm.image}
                onChange={url => setEventForm({ ...eventForm, image: url })}
                required
              />
              <textarea
                rows={2}
                placeholder="वर्णन"
                value={eventForm.desc}
                onChange={e => setEventForm({ ...eventForm, desc: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/15 text-xs"
              />
              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-[#A84A20] hover:bg-[#c15a2a] text-white font-bold text-xs"
              >
                💾 कार्यक्रम जतन करा
              </button>
            </form>

            <div className="lg:col-span-2 bg-[#1a1f2e] rounded-2xl p-5 border border-white/10 space-y-2.5">
              <h3 className="font-bold text-sm mb-3">सध्याचे कार्यक्रम ({events.length})</h3>
              {events.map(ev => (
                <div
                  key={ev.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-white/5"
                >
                  <div>
                    <div className="font-bold text-sm">{ev.title}</div>
                    <div className="text-xs text-white/50">
                      {ev.date} · {ev.location} · नोंदणी: {ev.registered}/{ev.capacity}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setEditingEventId(ev.id);
                        setEventForm(ev);
                      }}
                      className="p-2 rounded-lg bg-white/10 text-[#D4A955]"
                    >
                      <Edit3 size={14} />
                    </button>
                    <button
                      onClick={() => handleDeleteEvent(ev.id)}
                      className="p-2 rounded-lg bg-red-500/20 text-red-400"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 4. PROJECTS MANAGEMENT TAB */}
        {activeTab === 'projects' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <form
              onSubmit={handleSaveProject}
              className="bg-[#1a1f2e] rounded-2xl p-5 border border-white/10 space-y-3 h-fit"
            >
              <h3 className="font-bold text-sm text-[#D4A955]">
                {editingProjectId ? '✏️ संवर्धन प्रकल्प संपादित करा' : '➕ नवीन संवर्धन प्रकल्प'}
              </h3>
              <input
                required
                placeholder="प्रकल्पाचे नाव"
                value={projectForm.title}
                onChange={e => setProjectForm({ ...projectForm, title: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/15 text-xs"
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  required
                  placeholder="किल्ला (रायगड)"
                  value={projectForm.fort}
                  onChange={e => setProjectForm({ ...projectForm, fort: e.target.value })}
                  className="px-3 py-2 rounded-lg bg-white/5 border border-white/15 text-xs"
                />
                <select
                  value={projectForm.status}
                  onChange={e => setProjectForm({ ...projectForm, status: e.target.value })}
                  className="px-3 py-2 rounded-lg bg-[#0f1117] border border-white/15 text-xs"
                >
                  <option value="सुरू आहे">सुरू आहे</option>
                  <option value="पूर्ण">पूर्ण</option>
                  <option value="नियोजित">नियोजित</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  min={0}
                  max={100}
                  placeholder="प्रगती % (0-100)"
                  value={projectForm.progress}
                  onChange={e =>
                    setProjectForm({ ...projectForm, progress: Number(e.target.value) })
                  }
                  className="px-3 py-2 rounded-lg bg-white/5 border border-white/15 text-xs"
                />
                <input
                  type="number"
                  placeholder="स्वयंसेवक संख्या"
                  value={projectForm.volunteers}
                  onChange={e =>
                    setProjectForm({ ...projectForm, volunteers: Number(e.target.value) })
                  }
                  className="px-3 py-2 rounded-lg bg-white/5 border border-white/15 text-xs"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input
                  placeholder="अंदाजपत्रक (₹4,50,000)"
                  value={projectForm.budget}
                  onChange={e => setProjectForm({ ...projectForm, budget: e.target.value })}
                  className="px-3 py-2 rounded-lg bg-white/5 border border-white/15 text-xs"
                />
                <input
                  placeholder="खर्च (₹2,92,500)"
                  value={projectForm.spent}
                  onChange={e => setProjectForm({ ...projectForm, spent: e.target.value })}
                  className="px-3 py-2 rounded-lg bg-white/5 border border-white/15 text-xs"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input
                  placeholder="सुरुवात (जानेवारी 2026)"
                  value={projectForm.start}
                  onChange={e => setProjectForm({ ...projectForm, start: e.target.value })}
                  className="px-3 py-2 rounded-lg bg-white/5 border border-white/15 text-xs"
                />
                <input
                  placeholder="समाप्ती (डिसेंबर 2026)"
                  value={projectForm.end}
                  onChange={e => setProjectForm({ ...projectForm, end: e.target.value })}
                  className="px-3 py-2 rounded-lg bg-white/5 border border-white/15 text-xs"
                />
              </div>
              <input
                placeholder="प्रभाव (Impact)"
                value={projectForm.impact}
                onChange={e => setProjectForm({ ...projectForm, impact: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/15 text-xs"
              />
              <ImageUploadField
                label="संवर्धनापूर्वीचा फोटो अपलोड करा (Before Image)"
                folder="projects"
                value={projectForm.beforeImg}
                onChange={url => setProjectForm({ ...projectForm, beforeImg: url })}
              />
              <ImageUploadField
                label="संवर्धनानंतरचा फोटो अपलोड करा (After Image)"
                folder="projects"
                value={projectForm.afterImg}
                onChange={url => setProjectForm({ ...projectForm, afterImg: url })}
              />
              <textarea
                rows={2}
                placeholder="सविस्तर माहिती"
                value={projectForm.desc}
                onChange={e => setProjectForm({ ...projectForm, desc: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/15 text-xs"
              />
              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-[#A84A20] hover:bg-[#c15a2a] text-white font-bold text-xs"
              >
                💾 प्रकल्प जतन करा
              </button>
            </form>

            <div className="lg:col-span-2 bg-[#1a1f2e] rounded-2xl p-5 border border-white/10 space-y-2.5">
              <h3 className="font-bold text-sm mb-3">संवर्धन प्रकल्प यादी ({projects.length})</h3>
              {projects.map(p => (
                <div
                  key={p.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-white/5"
                >
                  <div>
                    <div className="font-bold text-sm">
                      {p.title} ({p.fort})
                    </div>
                    <div className="text-xs text-white/50">
                      {p.status} · प्रगती: {p.progress}% · अंदाजपत्रक: {p.budget}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setEditingProjectId(p.id);
                        setProjectForm(p);
                      }}
                      className="p-2 rounded-lg bg-white/10 text-[#D4A955]"
                    >
                      <Edit3 size={14} />
                    </button>
                    <button
                      onClick={() => handleDeleteProject(p.id)}
                      className="p-2 rounded-lg bg-red-500/20 text-red-400"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 5. NEWS MANAGEMENT TAB */}
        {activeTab === 'news' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <form
              onSubmit={handleSaveNews}
              className="bg-[#1a1f2e] rounded-2xl p-5 border border-white/10 space-y-3 h-fit"
            >
              <h3 className="font-bold text-sm text-[#D4A955]">➕ नवीन बातमी / लेख प्रकाशित करा</h3>
              <input
                required
                placeholder="शीर्षक"
                value={newsForm.title}
                onChange={e => setNewsForm({ ...newsForm, title: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/15 text-xs"
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  placeholder="श्रेणी (संवर्धन / मोहीम)"
                  value={newsForm.category}
                  onChange={e => setNewsForm({ ...newsForm, category: e.target.value })}
                  className="px-3 py-2 rounded-lg bg-white/5 border border-white/15 text-xs"
                />
                <input
                  placeholder="तारीख"
                  value={newsForm.date}
                  onChange={e => setNewsForm({ ...newsForm, date: e.target.value })}
                  className="px-3 py-2 rounded-lg bg-white/5 border border-white/15 text-xs"
                />
              </div>
              <input
                placeholder="लेखक"
                value={newsForm.author}
                onChange={e => setNewsForm({ ...newsForm, author: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/15 text-xs"
              />
              <ImageUploadField
                label="बातमीचा फोटो अपलोड करा (News Image)"
                folder="news"
                value={newsForm.image}
                onChange={url => setNewsForm({ ...newsForm, image: url })}
                required
              />
              <textarea
                rows={4}
                required
                placeholder="संपूर्ण बातमी मजकूर"
                value={newsForm.body}
                onChange={e => setNewsForm({ ...newsForm, body: e.target.value, desc: e.target.value.slice(0, 120) })}
                className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/15 text-xs"
              />
              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-[#A84A20] text-white font-bold text-xs"
              >
                📰 प्रकाशित करा
              </button>
            </form>

            <div className="lg:col-span-2 bg-[#1a1f2e] rounded-2xl p-5 border border-white/10 space-y-2.5">
              <h3 className="font-bold text-sm mb-3">प्रकाशित बातम्या ({news.length})</h3>
              {news.map(n => (
                <div
                  key={n.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-white/5"
                >
                  <div>
                    <div className="font-bold text-sm">{n.title}</div>
                    <div className="text-xs text-white/50">
                      {n.category} · {n.date} · {n.author}
                    </div>
                  </div>
                  <button
                    onClick={async () => {
                      await api.deleteNews(n.id);
                      await refreshAll();
                    }}
                    className="p-2 rounded-lg bg-red-500/20 text-red-400"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 6. GALLERY MANAGEMENT TAB */}
        {activeTab === 'gallery' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <form
              onSubmit={handleSaveGallery}
              className="bg-[#1a1f2e] rounded-2xl p-5 border border-white/10 space-y-3 h-fit"
            >
              <h3 className="font-bold text-sm text-[#D4A955]">➕ गॅलरीमध्ये फोटो जोडा</h3>
              <ImageUploadField
                label="गॅलरी फोटो फाइल अपलोड करा (Upload Gallery Photo)"
                folder="gallery"
                value={galleryForm.src}
                onChange={url => setGalleryForm({ ...galleryForm, src: url })}
                required
              />
              <input
                required
                placeholder="फोटो शीर्षक (Caption)"
                value={galleryForm.caption}
                onChange={e => setGalleryForm({ ...galleryForm, caption: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/15 text-xs"
              />
              <select
                value={galleryForm.category}
                onChange={e => setGalleryForm({ ...galleryForm, category: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-[#0f1117] border border-white/15 text-xs"
              >
                <option value="गडकिल्ले">गडकिल्ले</option>
                <option value="संवर्धन">संवर्धन</option>
                <option value="कार्यक्रम">कार्यक्रम</option>
                <option value="स्वयंसेवक">स्वयंसेवक</option>
              </select>
              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-[#A84A20] text-white font-bold text-xs"
              >
                🖼️ फोटो जोडा
              </button>
            </form>

            <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-3 gap-4">
              {gallery.map(g => (
                <div
                  key={g.id}
                  className="bg-[#1a1f2e] rounded-xl overflow-hidden border border-white/10 relative group"
                >
                  <img src={g.src} alt={g.caption} className="w-full h-36 object-cover" />
                  <div className="p-2.5 flex justify-between items-center">
                    <div>
                      <div className="text-xs font-bold truncate">{g.caption}</div>
                      <div className="text-[10px] text-[#D4A955]">{g.category}</div>
                    </div>
                    <button
                      onClick={async () => {
                        await api.deleteGalleryItem(g.id);
                        await refreshAll();
                      }}
                      className="p-1.5 rounded bg-red-500/20 text-red-400"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 6.5 CERTIFICATES TAB (Admin-Only Certificate Creation & Management) */}
        {activeTab === 'certificates' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <form
              onSubmit={handleIssueCert}
              className="bg-[#1a1f2e] rounded-2xl p-5 border border-white/10 space-y-3 h-fit"
            >
              <h3 className="font-bold text-sm text-[#D4A955] flex items-center gap-2">
                <Award size={16} /> नवीन प्रमाणपत्र जारी करा (Admin Only)
              </h3>
              <p className="text-[11px] text-white/45">
                येथून जारी केलेले प्रमाणपत्र संबंधित व्यक्तीला <strong>/certificate</strong> पृष्ठावर नाव किंवा क्रमांक टाकून डाउनलोड करता येईल.
              </p>

              <div>
                <label className="block text-[11px] text-white/50 mb-1">प्राप्तकर्त्याचे पूर्ण नाव *</label>
                <input
                  required
                  placeholder="उदा. श्री. राहुल देशमुख"
                  value={certForm.recipientName}
                  onChange={e => setCertForm({ ...certForm, recipientName: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/15 text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] text-white/50 mb-1">प्रमाणपत्र प्रकार *</label>
                <select
                  value={certForm.certType}
                  onChange={e => setCertForm({ ...certForm, certType: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-[#0f1117] border border-white/15 text-xs"
                >
                  <option value="volunteer">स्वयंसेवक सन्मान प्रमाणपत्र</option>
                  <option value="conservation">गडकिल्ले संवर्धन योगदान प्रमाणपत्र</option>
                  <option value="trek">दुर्गभ्रमण (ट्रेक) पूर्णता प्रमाणपत्र</option>
                  <option value="quiz">मराठा इतिहास ज्ञान गुणवत्ता प्रमाणपत्र</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] text-white/50 mb-1">मोहीम / उपक्रम नाव *</label>
                <input
                  required
                  placeholder="उदा. रायगड स्वच्छता व संवर्धन मोहीम"
                  value={certForm.eventName}
                  onChange={e => setCertForm({ ...certForm, eventName: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/15 text-xs"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-[#A84A20] hover:bg-[#c15a2a] text-white font-bold text-xs transition-colors"
              >
                📜 प्रमाणपत्र तयार करा (Issue Certificate)
              </button>
            </form>

            <div className="lg:col-span-2 bg-[#1a1f2e] rounded-2xl border border-white/10 overflow-hidden">
              <div className="px-6 py-4 border-b border-white/10 flex justify-between items-center">
                <h3 className="font-bold text-sm">
                  📜 जारी केलेली प्रमाणपत्रे ({certificates.length})
                </h3>
              </div>
              {certificates.length === 0 ? (
                <div className="p-8 text-center text-xs text-white/45">
                  अद्याप कोणतेही प्रमाणपत्र जारी केलेले नाही. डावीकडील फॉर्म वापरून नवीन प्रमाणपत्र तयार करा.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="border-b border-white/10 text-white/40 uppercase">
                      <tr>
                        <th className="py-3.5 px-4">प्रमाणपत्र क्रमांक</th>
                        <th className="py-3.5 px-4">प्राप्तकर्ता नाव</th>
                        <th className="py-3.5 px-4">उपक्रम / मोहीम</th>
                        <th className="py-3.5 px-4">दिनांक</th>
                        <th className="py-3.5 px-4">कृती</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {certificates.map(c => (
                        <tr key={c.id}>
                          <td className="py-3.5 px-4 font-mono font-bold text-[#D4A955]">
                            {c.cert_code}
                          </td>
                          <td className="py-3.5 px-4 font-bold">{c.recipient_name}</td>
                          <td className="py-3.5 px-4 text-white/70">{c.event_name}</td>
                          <td className="py-3.5 px-4 text-white/50">{c.issued_date}</td>
                          <td className="py-3.5 px-4 flex items-center gap-2">
                            <Link
                              to={`/certificate?code=${encodeURIComponent(c.cert_code)}`}
                              className="px-2.5 py-1 rounded bg-[#2C4A32] text-white font-semibold text-[11px] hover:bg-[#36583C]"
                            >
                              👁️ पहा / प्रिंट
                            </Link>
                            <button
                              onClick={async () => {
                                await api.deleteCertificate(c.id);
                                await loadStats();
                              }}
                              className="p-1.5 rounded bg-red-500/20 text-red-400"
                              title="प्रमाणपत्र हटवा"
                            >
                              <Trash2 size={13} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 7. VOLUNTEERS TAB */}
        {activeTab === 'volunteers' && (
          <div className="bg-[#1a1f2e] rounded-2xl border border-white/10 overflow-hidden">
            <div className="px-6 py-4 border-b border-white/10 flex justify-between items-center">
              <h3 className="font-bold text-sm">👥 नोंदणीकृत स्वयंसेवक ({stats.recentVolunteers.length})</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-white/10 text-white/40 uppercase">
                  <tr>
                    <th className="py-3.5 px-6">नाव</th>
                    <th className="py-3.5 px-6">जिल्हा</th>
                    <th className="py-3.5 px-6">मोबाईल / ईमेल</th>
                    <th className="py-3.5 px-6">आवड</th>
                    <th className="py-3.5 px-6">कृती</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {stats.recentVolunteers.map(v => (
                    <tr key={v.id}>
                      <td className="py-3.5 px-6 font-bold">{v.full_name}</td>
                      <td className="py-3.5 px-6">{v.district || '—'}</td>
                      <td className="py-3.5 px-6">
                        {v.phone} · {v.email}
                      </td>
                      <td className="py-3.5 px-6 text-[#D4A955]">
                        {(v.interests || []).join(', ')}
                      </td>
                      <td className="py-3.5 px-6 flex items-center gap-2">
                        <button
                          onClick={async () => {
                            const created = await api.issueCertificate({
                              recipientName: v.full_name,
                              certType: 'volunteer',
                              eventName: 'स्वयंसेवक नोंदणी व वारसा संवर्धन उपक्रम',
                            });
                            setStatusBanner(
                              `✅ ${v.full_name} यांच्यासाठी प्रमाणपत्र जारी झाले! कोड: ${created.cert_code}`
                            );
                            await loadStats();
                          }}
                          className="px-2.5 py-1 rounded bg-[#2C4A32] hover:bg-[#36583C] text-white font-semibold text-[11px]"
                        >
                          📜 प्रमाणपत्र द्या
                        </button>
                        <button
                          onClick={async () => {
                            await api.deleteVolunteer(v.id);
                            await loadStats();
                          }}
                          className="p-1.5 rounded bg-red-500/20 text-red-400"
                        >
                          <Trash2 size={13} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 8. DONATIONS TAB */}
        {activeTab === 'donations' && (
          <div className="bg-[#1a1f2e] rounded-2xl border border-white/10 overflow-hidden">
            <div className="px-6 py-4 border-b border-white/10 flex justify-between items-center">
              <h3 className="font-bold text-sm">💰 देणगी व्यवहार ({stats.recentDonations.length})</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-white/10 text-white/40 uppercase">
                  <tr>
                    <th className="py-3.5 px-6">देणगीदार</th>
                    <th className="py-3.5 px-6">रक्कम</th>
                    <th className="py-3.5 px-6">प्रकल्प</th>
                    <th className="py-3.5 px-6">माध्यम</th>
                    <th className="py-3.5 px-6">कृती</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {stats.recentDonations.map(d => (
                    <tr key={d.id}>
                      <td className="py-3.5 px-6 font-bold">{d.donor_name}</td>
                      <td className="py-3.5 px-6 font-bold text-[#D4A955]">
                        ₹{Number(d.amount).toLocaleString('en-IN')}
                      </td>
                      <td className="py-3.5 px-6">{d.project_name}</td>
                      <td className="py-3.5 px-6">{d.payment_method}</td>
                      <td className="py-3.5 px-6">
                        <button
                          onClick={async () => {
                            await api.deleteDonation(d.id);
                            await loadStats();
                          }}
                          className="p-1.5 rounded bg-red-500/20 text-red-400"
                        >
                          <Trash2 size={13} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* DINVISHESH MANAGEMENT TAB */}
        {activeTab === 'dinvishesh' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-4 bg-[#1a1f2e] p-6 rounded-2xl border border-white/10">
              <div>
                <h3 className="font-bold text-lg text-[#D4A955]">
                  🚩 दिनविशेष व्यवस्थापन (Dinvishesh Management)
                </h3>
                <p className="text-xs text-white/50 mt-1">
                  छत्रपती शिवाजी महाराज व छत्रपती संभाजी महाराज यांच्या ऐतिहासिक घटनांची नोंद व प्रकाशन करा.
                </p>
              </div>

              <button
                onClick={() => setShowDinPreview(!showDinPreview)}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-white transition-all flex items-center gap-2 border border-white/15"
              >
                👁️ {showDinPreview ? 'फॉर्मवर परत जा' : 'कार्डाचे पूर्वदृश्य (Live Preview)'}
              </button>
            </div>

            {/* Event Form */}
            <form
              onSubmit={handleSaveDinvishesh}
              className="bg-[#1a1f2e] rounded-2xl p-6 border border-white/10 space-y-4"
            >
              <h4 className="font-bold text-sm text-[#F4956A]">
                {editingDinId ? '✏️ ऐतिहासिक घटना संपादित करा' : '➕ नवीन ऐतिहासिक घटना जोडा'}
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs text-white/60 mb-1 font-semibold">दिवस (Day 1-31) *</label>
                  <select
                    value={dinForm.day}
                    onChange={e => setDinForm({ ...dinForm, day: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/15 text-white text-xs"
                  >
                    {Array.from({ length: 31 }, (_, i) => i + 1).map(d => (
                      <option key={d} value={d} className="bg-[#1a1f2e]">
                        {d}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-white/60 mb-1 font-semibold">महिना (Month 1-12) *</label>
                  <select
                    value={dinForm.month}
                    onChange={e => setDinForm({ ...dinForm, month: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/15 text-white text-xs"
                  >
                    {[
                      '१- जानेवारी', '२- फेब्रुवारी', '३- मार्च', '४- एप्रिल',
                      '५- मे', '६- जून', '७- जुलै', '८- ऑगस्ट',
                      '९- सप्टेंबर', '१०- ऑक्टोबर', '११- नोव्हेंबर', '१२- डिसेंबर'
                    ].map((m, idx) => (
                      <option key={idx + 1} value={idx + 1} className="bg-[#1a1f2e]">
                        {m}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-white/60 mb-1 font-semibold">ऐतिहासिक वर्ष (उदा. 1674)</label>
                  <input
                    type="number"
                    placeholder="उदा. 1674"
                    value={dinForm.year}
                    onChange={e =>
                      setDinForm({
                        ...dinForm,
                        year: e.target.value === '' ? '' : Number(e.target.value),
                      })
                    }
                    className="w-full px-3.5 py-2 rounded-xl bg-white/5 border border-white/15 text-white text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs text-white/60 mb-1 font-semibold">संबंधित महापुरुष *</label>
                  <select
                    value={dinForm.personality}
                    onChange={e => setDinForm({ ...dinForm, personality: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/15 text-white text-xs"
                  >
                    <option value="छत्रपती शिवाजी महाराज" className="bg-[#1a1f2e]">
                      छत्रपती शिवाजी महाराज
                    </option>
                    <option value="छत्रपती संभाजी महाराज" className="bg-[#1a1f2e]">
                      छत्रपती संभाजी महाराज
                    </option>
                    <option value="छत्रपती शिवाजी महाराज व संभाजी महाराज" className="bg-[#1a1f2e]">
                      दोन्ही (Both)
                    </option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs text-white/60 mb-1 font-semibold">घटनेचा प्रकार (Event Category) *</label>
                  <select
                    value={dinForm.eventType}
                    onChange={e => setDinForm({ ...dinForm, eventType: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/15 text-white text-xs"
                  >
                    <option value="राज्याभिषेक" className="bg-[#1a1f2e]">राज्याभिषेक (Coronation)</option>
                    <option value="लढाई / पराक्रम" className="bg-[#1a1f2e]">लढाई / पराक्रम (Military Campaign)</option>
                    <option value="मुत्सद्देगिरी / तह" className="bg-[#1a1f2e]">मुत्सद्देगिरी / तह (Diplomacy & Treaty)</option>
                    <option value="दुर्ग स्थापना / विजय" className="bg-[#1a1f2e]">दुर्ग स्थापना / विजय (Fort Acquisition)</option>
                    <option value="जन्म / जयंती" className="bg-[#1a1f2e]">जन्म / जयंती (Birth Anniversary)</option>
                    <option value="बलिदान / पुण्यतिथी" className="bg-[#1a1f2e]">बलिदान / पुण्यतिथी (Martyrdom / Remembrance)</option>
                    <option value="प्रशासन व न्याय" className="bg-[#1a1f2e]">प्रशासन व न्याय (Governance & Decrees)</option>
                    <option value="आरमार" className="bg-[#1a1f2e]">आरमार व सागरी मोहीम (Naval Expeditions)</option>
                    <option value="इतर" className="bg-[#1a1f2e]">इतर ऐतिहासिक प्रसंग (Other)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-white/60 mb-1 font-semibold">स्थान / किल्ला (Location)</label>
                  <input
                    type="text"
                    placeholder="उदा. रायगड किल्ला (Raigad Fort)"
                    value={dinForm.location}
                    onChange={e => setDinForm({ ...dinForm, location: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/15 text-white text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs text-white/60 mb-1 font-semibold">महत्त्वाच्या व्यक्ती (Key Figures - स्वल्पविराम द्या)</label>
                  <input
                    type="text"
                    placeholder="उदा. गागाभट्ट, सोयराबाई, मोरोपंत पिंगळे"
                    value={dinForm.keyFiguresStr}
                    onChange={e => setDinForm({ ...dinForm, keyFiguresStr: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/15 text-white text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-white/60 mb-1 font-semibold">घटनेचे शीर्षक (मराठी) *</label>
                  <input
                    type="text"
                    required
                    placeholder="उदा. छत्रपती शिवाजी महाराज शिवराज्याभिषेक सोहळा"
                    value={dinForm.titleMarathi}
                    onChange={e => setDinForm({ ...dinForm, titleMarathi: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/15 text-white text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs text-white/60 mb-1 font-semibold">Event Title (English)</label>
                  <input
                    type="text"
                    placeholder="e.g. Coronation of Chhatrapati Shivaji Maharaj"
                    value={dinForm.titleEnglish}
                    onChange={e => setDinForm({ ...dinForm, titleEnglish: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/15 text-white text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-white/60 mb-1 font-semibold">सविस्तर ऐतिहासिक वर्णन (मराठी) *</label>
                  <textarea
                    rows={4}
                    required
                    placeholder="घटनेचा सविस्तर इतिहास, प्रसंग व पार्श्वभूमी..."
                    value={dinForm.descriptionMarathi}
                    onChange={e => setDinForm({ ...dinForm, descriptionMarathi: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-white/5 border border-white/15 text-white text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs text-white/60 mb-1 font-semibold">Detailed Description (English)</label>
                  <textarea
                    rows={4}
                    placeholder="Detailed historical explanation in English..."
                    value={dinForm.descriptionEnglish}
                    onChange={e => setDinForm({ ...dinForm, descriptionEnglish: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-white/5 border border-white/15 text-white text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-white/60 mb-1 font-semibold">ऐतिहासिक महत्त्व व परिणाम (Historical Significance)</label>
                <textarea
                  rows={2}
                  placeholder="उदा. सार्वभौम स्वतंत्र मराठा स्वराज्य निर्मितीची आंतरराष्ट्रीय मान्यता..."
                  value={dinForm.historicalSignificance}
                  onChange={e => setDinForm({ ...dinForm, historicalSignificance: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-white/5 border border-white/15 text-white text-xs"
                />
              </div>

              <ImageUploadField
                label="ऐतिहासिक चित्र / छायाचित्र (Historical Image URL)"
                folder="dinvishesh"
                value={dinForm.image}
                onChange={url => setDinForm({ ...dinForm, image: url })}
              />

              {/* Historical Data Source System */}
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-amber-500/20 space-y-4">
                <div className="flex items-center justify-between">
                  <h5 className="text-xs font-bold text-[#D4A955] uppercase tracking-wider flex items-center gap-2">
                    📜 ऐतिहासिक संदर्भ व प्रमाण प्रणाली (Historical Source & Verification)
                  </h5>
                  <span className="text-[11px] text-white/50">प्रमाणित माहिती स्रोत बंधनकारक</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs text-white/60 mb-1 font-semibold">मुख्य ऐतिहासिक स्रोत नाव (Source Name) *</label>
                    <input
                      type="text"
                      placeholder="उदा. सभासद बखर / जेधे शकावली / Maasir-i-Alamgiri"
                      value={dinForm.sourceName}
                      onChange={e => setDinForm({ ...dinForm, sourceName: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl bg-white/5 border border-white/15 text-white text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-white/60 mb-1 font-semibold">स्रोत प्रकार (Source Type)</label>
                    <select
                      value={dinForm.sourceType}
                      onChange={e => setDinForm({ ...dinForm, sourceType: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/15 text-white text-xs"
                    >
                      <option value="Published historical book" className="bg-[#1a1f2e]">Published historical book (प्रकाशित ऐतिहासिक ग्रंथ)</option>
                      <option value="Museum / Archive" className="bg-[#1a1f2e]">Museum / Archive (पुराभिलेख व वस्तुसंग्रहालय)</option>
                      <option value="Government publication" className="bg-[#1a1f2e]">Government publication (शासकीय गॅझेटियर / पुराभिलेख)</option>
                      <option value="Academic source" className="bg-[#1a1f2e]">Academic source (संशोधन निबंध / विद्यापीठ अभ्यास)</option>
                      <option value="Google Arts & Culture" className="bg-[#1a1f2e]">Google Arts & Culture</option>
                      <option value="Wikimedia Commons" className="bg-[#1a1f2e]">Wikimedia Commons</option>
                      <option value="Wikipedia" className="bg-[#1a1f2e]">Wikipedia (Secondary)</option>
                      <option value="Other reliable reference" className="bg-[#1a1f2e]">Other reliable reference</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs text-white/60 mb-1 font-semibold">पडताळणी स्थिती (Verification Status)</label>
                    <select
                      value={dinForm.verificationStatus}
                      onChange={e => setDinForm({ ...dinForm, verificationStatus: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/15 text-white text-xs"
                    >
                      <option value="verified" className="bg-[#1a1f2e]">✅ प्रमाणित (Verified by Source)</option>
                      <option value="under_review" className="bg-[#1a1f2e]">⏳ पुनरावलोकनाधीन (Under Review)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-white/60 mb-1 font-semibold">स्रोत लिंक / URL (Source URL)</label>
                    <input
                      type="url"
                      placeholder="https://..."
                      value={dinForm.sourceUrl}
                      onChange={e => setDinForm({ ...dinForm, sourceUrl: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl bg-white/5 border border-white/15 text-white text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-white/60 mb-1 font-semibold">स्रोत संदर्भ तपशील (पृष्ठ क्र., खंड, प्रत)</label>
                    <input
                      type="text"
                      placeholder="उदा. खंड १, पृष्ठ ४४-४८, संपादन: प्रा. सेतुमाधवराव पगडी"
                      value={dinForm.sourceDescription}
                      onChange={e => setDinForm({ ...dinForm, sourceDescription: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl bg-white/5 border border-white/15 text-white text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-white/60 mb-1 font-semibold">अतिरिक्त संदर्भ यादी (Multiple References)</label>
                  <input
                    type="text"
                    placeholder="उदा. ९१ कलमी बखर, इंग्रजी फॅक्टरी रेकॉर्ड्स, शिवभारत"
                    value={dinForm.sources}
                    onChange={e => setDinForm({ ...dinForm, sources: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-white/5 border border-white/15 text-white text-xs"
                  />
                </div>

                {/* Disputed Date Toggle */}
                <div className="pt-2 border-t border-white/10 space-y-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="din-disputed"
                      checked={dinForm.isDisputed}
                      onChange={e => setDinForm({ ...dinForm, isDisputed: e.target.checked })}
                      className="rounded bg-white/10 border-white/20 text-[#A84A20] focus:ring-0"
                    />
                    <label htmlFor="din-disputed" className="text-xs text-amber-300 font-semibold cursor-pointer">
                      ⚠️ या घटनेच्या तारखेबाबत विविध ऐतिहासिक स्रोतांमध्ये मतभेद आहेत का?
                    </label>
                  </div>
                  {dinForm.isDisputed && (
                    <input
                      type="text"
                      placeholder="मतभेदाचा तपशील (उदा. जेधे शकावलीनुसार ६ जून तर इंग्रज पत्रात १६ मे अशी नोंद आढळते.)"
                      value={dinForm.disputeNote}
                      onChange={e => setDinForm({ ...dinForm, disputeNote: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs"
                    />
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="din-published"
                  checked={dinForm.isPublished}
                  onChange={e => setDinForm({ ...dinForm, isPublished: e.target.checked })}
                  className="rounded bg-white/10 border-white/20 text-[#A84A20] focus:ring-0"
                />
                <label htmlFor="din-published" className="text-xs text-white font-medium cursor-pointer">
                  वेबसाइटवर तात्काळ प्रकाशित करा (Publish Event Live)
                </label>
              </div>

              {/* Form Buttons */}
              <div className="flex items-center gap-3 pt-4 border-t border-white/10">
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-[#A84A20] hover:bg-[#c15a2a] text-white font-bold text-xs flex items-center gap-2 shadow-lg"
                >
                  <Save size={15} /> {editingDinId ? 'बदल सेव्ह करा' : 'ऐतिहासिक घटना जोडा'}
                </button>

                {editingDinId && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingDinId(null);
                      setDinForm({
                        day: 6,
                        month: 6,
                        year: 1674,
                        personality: 'छत्रपती शिवाजी महाराज',
                        eventType: 'राज्याभिषेक',
                        titleMarathi: '',
                        titleEnglish: '',
                        descriptionMarathi: '',
                        descriptionEnglish: '',
                        location: '',
                        image: '',
                        historicalSignificance: '',
                        sourceName: '',
                        sourceUrl: '',
                        sourceType: 'Published historical book',
                        sourceDescription: '',
                        verificationStatus: 'verified',
                        isDisputed: false,
                        disputeNote: '',
                        keyFiguresStr: '',
                        sources: '',
                        isPublished: true,
                      });
                    }}
                    className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-white/80"
                  >
                    रद्द करा
                  </button>
                )}
              </div>
            </form>

            {/* Event Preview Component */}
            {showDinPreview && (
              <div className="p-6 bg-[#16120b] text-[#f4ecd8] rounded-3xl border-2 border-[#D4A955]/40 space-y-4 shadow-2xl">
                <div className="text-xs font-bold text-[#D4A955] uppercase tracking-wider flex items-center gap-2">
                  👁️ थेट कार्ड पूर्वदृश्य (Live Card Preview)
                </div>
                <div className="bg-[#20180f] p-6 rounded-2xl border border-[#D4A955]/20 shadow-xl space-y-3">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 bg-[#A84A20] text-white text-xs font-bold rounded-full">
                        {dinForm.personality}
                      </span>
                      <span className="px-2.5 py-0.5 bg-amber-500/20 text-amber-300 text-xs font-medium rounded-full">
                        {dinForm.eventType}
                      </span>
                    </div>
                    <span className="text-xs font-bold text-[#D4A955]">
                      तारीख: {dinForm.day}/{dinForm.month} {dinForm.year && `(${dinForm.year} ई.स.)`}
                    </span>
                  </div>

                  <h3 className="font-serif text-2xl font-bold text-white">
                    {dinForm.titleMarathi || 'घटनेचे शीर्षक येथे दिसेल'}
                  </h3>

                  {dinForm.location && (
                    <div className="text-xs text-amber-200/80">📍 स्थान: {dinForm.location}</div>
                  )}

                  {dinForm.image && (
                    <img src={dinForm.image} alt="Preview" className="w-full h-52 object-cover rounded-xl border border-white/10" />
                  )}

                  <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
                    {dinForm.descriptionMarathi || 'सविस्तर ऐतिहासिक वर्णन येथे दिसेल...'}
                  </p>

                  {dinForm.historicalSignificance && (
                    <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-500/20 text-xs text-amber-200">
                      <strong>🚩 ऐतिहासिक महत्त्व:</strong> {dinForm.historicalSignificance}
                    </div>
                  )}

                  {dinForm.isDisputed && (
                    <div className="p-3 rounded-xl bg-red-950/30 border border-red-500/30 text-xs text-red-200">
                      ⚠️ <strong>ऐतिहासिक नोंद:</strong> या घटनेच्या तारखेबाबत विविध ऐतिहासिक स्रोतांमध्ये मतभेद आढळतात.
                      {dinForm.disputeNote && ` (${dinForm.disputeNote})`}
                    </div>
                  )}

                  <div className="text-xs text-stone-400 bg-black/40 p-3 rounded-xl border border-white/10 flex items-center justify-between flex-wrap gap-2">
                    <div>
                      📚 <strong>मुख्य स्रोत:</strong> {dinForm.sourceName || 'नोंदवलेला नाही'} ({dinForm.sourceType})
                      {dinForm.sources && ` | संदर्भ: ${dinForm.sources}`}
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      dinForm.verificationStatus === 'verified' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
                    }`}>
                      {dinForm.verificationStatus === 'verified' ? '✅ प्रमाणित' : '⏳ तपासणी बाकी'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Filter & Search Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#1a1f2e] p-4 rounded-2xl border border-white/10">
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <input
                  type="text"
                  placeholder="शोधा (शीर्षक, तारीख, वर्ष, स्थान)..."
                  value={dinSearch}
                  onChange={e => setDinSearch(e.target.value)}
                  className="px-3.5 py-2 rounded-xl bg-white/5 border border-white/15 text-xs text-white w-full sm:w-64 focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-3 flex-wrap">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-white/60 font-semibold">महापुरुष:</span>
                  <select
                    value={dinFilterFigure}
                    onChange={e => setDinFilterFigure(e.target.value)}
                    className="px-3 py-2 rounded-xl bg-white/5 border border-white/15 text-xs text-white"
                  >
                    <option value="all" className="bg-[#1a1f2e]">सर्व प्रसंग</option>
                    <option value="छत्रपती शिवाजी महाराज" className="bg-[#1a1f2e]">छत्रपती शिवाजी महाराज</option>
                    <option value="छत्रपती संभाजी महाराज" className="bg-[#1a1f2e]">छत्रपती संभाजी महाराज</option>
                  </select>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-white/60 font-semibold">स्थिती:</span>
                  <select
                    value={dinFilterStatus}
                    onChange={e => setDinFilterStatus(e.target.value)}
                    className="px-3 py-2 rounded-xl bg-white/5 border border-white/15 text-xs text-white"
                  >
                    <option value="all" className="bg-[#1a1f2e]">सर्व स्थिती</option>
                    <option value="verified" className="bg-[#1a1f2e]">✅ प्रमाणित (Verified)</option>
                    <option value="under_review" className="bg-[#1a1f2e]">⏳ पुनरावलोकन (Under Review)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Dinvishesh List */}
            <div className="bg-[#1a1f2e] rounded-2xl border border-white/10 overflow-hidden">
              <div className="p-4 bg-white/5 font-bold text-xs text-[#D4A955]">
                नोंदवलेल्या ऐतिहासिक घटनांची यादी ({dinvisheshList.length})
              </div>

              <div className="divide-y divide-white/5">
                {dinvisheshList
                  .filter(item => {
                    const figure = item.personality || item.figure || '';
                    if (dinFilterFigure !== 'all' && !figure.includes(dinFilterFigure)) return false;
                    const status = item.verification_status || item.verificationStatus || 'verified';
                    if (dinFilterStatus !== 'all' && status !== dinFilterStatus) return false;
                    if (dinSearch.trim()) {
                      const q = dinSearch.toLowerCase();
                      const matchTitle = (item.title_marathi || item.title || '').toLowerCase().includes(q) ||
                        (item.title_english || item.title_en || '').toLowerCase().includes(q);
                      const matchDate = (item.event_date || '').includes(q) || `${item.day}/${item.month}`.includes(q);
                      const matchLoc = (item.location || '').toLowerCase().includes(q);
                      const matchYear = String(item.year || '').includes(q);
                      if (!matchTitle && !matchDate && !matchLoc && !matchYear) return false;
                    }
                    return true;
                  })
                  .map(item => (
                    <div key={item.id} className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-white/[0.02]">
                      <div className="flex items-start gap-4">
                        {item.image_url || item.image ? (
                          <img src={item.image_url || item.image} alt={item.title_marathi || item.title} className="w-16 h-16 rounded-xl object-cover shrink-0 border border-white/10" />
                        ) : (
                          <div className="w-16 h-16 rounded-xl bg-white/5 flex items-center justify-center text-xs text-white/40 shrink-0">
                            फोटो नाही
                          </div>
                        )}
                        <div>
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <span className="px-2.5 py-0.5 rounded-full bg-[#A84A20]/30 text-[#F4956A] text-[10px] font-bold">
                              {item.personality || item.figure}
                            </span>
                            {(item.event_type || item.eventType) && (
                              <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 text-[10px] font-semibold">
                                {item.event_type || item.eventType}
                              </span>
                            )}
                            <span className="text-xs font-bold text-[#D4A955]">
                              {item.day}/{item.month} {item.year && `(${item.year})`}
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                item.is_published
                                  ? 'bg-emerald-500/20 text-emerald-400'
                                  : 'bg-amber-500/20 text-amber-400'
                              }`}
                            >
                              {item.is_published ? 'प्रकाशित' : 'अप्रकाशित'}
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                (item.verification_status || item.verificationStatus) === 'verified'
                                  ? 'bg-emerald-500/10 text-emerald-300'
                                  : 'bg-amber-500/10 text-amber-300'
                              }`}
                            >
                              {(item.verification_status || item.verificationStatus) === 'verified' ? 'प्रमाणित' : 'तपासणी बाकी'}
                            </span>
                            {(item.is_disputed || item.isDisputed) && (
                              <span className="px-1.5 py-0.5 rounded bg-red-500/20 text-red-300 text-[10px] font-semibold">
                                मतभेद नोंद
                              </span>
                            )}
                          </div>
                          <h4 className="font-bold text-sm text-white mb-1">{item.title_marathi || item.title}</h4>
                          {item.location && (
                            <div className="text-[11px] text-white/50 mb-1">📍 {item.location}</div>
                          )}
                          <p className="text-xs text-white/60 line-clamp-2">{item.description_marathi || item.description}</p>
                          {(item.source_name || item.sources) && (
                            <div className="text-[11px] text-[#D4A955]/80 mt-1">
                              📚 स्त्रोत: {item.source_name || item.sources} {item.source_type && `(${item.source_type})`}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                        <button
                          onClick={() => handleTogglePublishDinvishesh(item)}
                          className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs text-white font-semibold"
                          title="Publish / Unpublish"
                        >
                          {item.is_published ? 'अप्रकाशित करा' : 'प्रकाशित करा'}
                        </button>
                        <button
                          onClick={() => {
                            setEditingDinId(item.id);
                            setDinForm({
                              day: item.day,
                              month: item.month,
                              year: item.year || '',
                              personality: item.personality || item.figure || 'छत्रपती शिवाजी महाराज',
                              eventType: item.event_type || item.eventType || 'राज्याभिषेक',
                              titleMarathi: item.title_marathi || item.title || '',
                              titleEnglish: item.title_english || item.title_en || item.titleEn || '',
                              descriptionMarathi: item.description_marathi || item.description || '',
                              descriptionEnglish: item.description_english || item.description_en || item.descriptionEn || '',
                              location: item.location || '',
                              image: item.image_url || item.image || '',
                              historicalSignificance: item.historical_significance || item.historicalSignificance || '',
                              sourceName: item.source_name || item.sourceName || (item.sources || ''),
                              sourceUrl: item.source_url || item.sourceUrl || '',
                              sourceType: item.source_type || item.sourceType || 'Published historical book',
                              sourceDescription: item.source_description || item.sourceDescription || '',
                              verificationStatus: item.verification_status || item.verificationStatus || 'verified',
                              isDisputed: Boolean(item.is_disputed ?? item.isDisputed),
                              disputeNote: item.dispute_note || item.disputeNote || '',
                              keyFiguresStr: (item.key_figures || []).join(', '),
                              sources: item.sources || '',
                              isPublished: item.is_published ?? true,
                            });
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }}
                          className="p-2 rounded-lg bg-blue-500/20 text-blue-400 hover:bg-blue-500/30"
                          title="Edit"
                        >
                          <Edit3 size={15} />
                        </button>
                        <button
                          onClick={() => handleDeleteDinvishesh(item.id)}
                          className="p-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30"
                          title="Delete"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}

        {/* 10. SITE SETTINGS TAB */}
        {activeTab === 'settings' && (
          <form
            onSubmit={handleSaveSettings}
            className="bg-[#1a1f2e] rounded-2xl p-6 border border-white/10 max-w-3xl space-y-4"
          >
            <h3 className="font-bold text-base text-[#D4A955]">
              ⚙️ वेबसाइट व संस्था माहिती सेटिंग्ज (Site Settings)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-white/50 mb-1">संस्थेचे नाव (मराठी)</label>
                <input
                  value={settingsForm.nameMarathi}
                  onChange={e =>
                    setSettingsForm({ ...settingsForm, nameMarathi: e.target.value })
                  }
                  className="w-full px-3.5 py-2 rounded-lg bg-white/5 border border-white/15 text-xs"
                />
              </div>
              <div>
                <label className="block text-xs text-white/50 mb-1">Organization Name (EN)</label>
                <input
                  value={settingsForm.nameEnglish}
                  onChange={e =>
                    setSettingsForm({ ...settingsForm, nameEnglish: e.target.value })
                  }
                  className="w-full px-3.5 py-2 rounded-lg bg-white/5 border border-white/15 text-xs"
                />
              </div>
              <div>
                <label className="block text-xs text-white/50 mb-1">संस्थापक नाव</label>
                <input
                  value={settingsForm.founder}
                  onChange={e => setSettingsForm({ ...settingsForm, founder: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-lg bg-white/5 border border-white/15 text-xs"
                />
              </div>
              <div>
                <label className="block text-xs text-white/50 mb-1">राज्य अध्यक्ष नाव</label>
                <input
                  value={settingsForm.president}
                  onChange={e => setSettingsForm({ ...settingsForm, president: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-lg bg-white/5 border border-white/15 text-xs"
                />
              </div>
              <div>
                <label className="block text-xs text-white/50 mb-1">मोबाईल १ (WhatsApp)</label>
                <input
                  value={settingsForm.phone1}
                  onChange={e => setSettingsForm({ ...settingsForm, phone1: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-lg bg-white/5 border border-white/15 text-xs"
                />
              </div>
              <div>
                <label className="block text-xs text-white/50 mb-1">ईमेल</label>
                <input
                  value={settingsForm.email}
                  onChange={e => setSettingsForm({ ...settingsForm, email: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-lg bg-white/5 border border-white/15 text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs text-white/50 mb-1">पत्ता</label>
              <input
                value={settingsForm.address}
                onChange={e => setSettingsForm({ ...settingsForm, address: e.target.value })}
                className="w-full px-3.5 py-2 rounded-lg bg-white/5 border border-white/15 text-xs"
              />
            </div>

            <div>
              <label className="block text-xs text-white/50 mb-1">ब्रीदवाक्य (Motto)</label>
              <input
                value={settingsForm.motto}
                onChange={e => setSettingsForm({ ...settingsForm, motto: e.target.value })}
                className="w-full px-3.5 py-2 rounded-lg bg-white/5 border border-white/15 text-xs"
              />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-white/10">
              <div>
                <label className="block text-xs text-white/50 mb-1">UPI ID</label>
                <input
                  value={settingsForm.upiId}
                  onChange={e => setSettingsForm({ ...settingsForm, upiId: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/15 text-xs"
                />
              </div>
              <div>
                <label className="block text-xs text-white/50 mb-1">गडकिल्ले आकडा</label>
                <input
                  type="number"
                  value={settingsForm.statForts}
                  onChange={e =>
                    setSettingsForm({ ...settingsForm, statForts: Number(e.target.value) })
                  }
                  className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/15 text-xs"
                />
              </div>
              <div>
                <label className="block text-xs text-white/50 mb-1">स्वयंसेवक आकडा</label>
                <input
                  type="number"
                  value={settingsForm.statVolunteers}
                  onChange={e =>
                    setSettingsForm({ ...settingsForm, statVolunteers: Number(e.target.value) })
                  }
                  className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/15 text-xs"
                />
              </div>
              <div>
                <label className="block text-xs text-white/50 mb-1">संवर्धन मोहिमा</label>
                <input
                  type="number"
                  value={settingsForm.statCampaigns}
                  onChange={e =>
                    setSettingsForm({ ...settingsForm, statCampaigns: Number(e.target.value) })
                  }
                  className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/15 text-xs"
                />
              </div>
            </div>

            <button
              type="submit"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#A84A20] hover:bg-[#c15a2a] text-white font-bold text-xs"
            >
              <Save size={15} /> सर्व सेटिंग्ज सेव्ह करा
            </button>
          </form>
        )}
      </main>
    </div>
  );
}
