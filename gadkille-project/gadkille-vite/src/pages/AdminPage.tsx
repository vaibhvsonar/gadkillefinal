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
  AlertCircle,
  MapPin,
  ExternalLink,
  MessageSquareQuote,
  Quote,
  Eye,
  EyeOff,
  Sparkles,
  Search,
  Filter,
  X,
  Lock,
  Check,
  Ban,
  UserCheck,
  UserX,
  FileText,
  DollarSign,
  Phone,
  Mail,
  Calendar,
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
  type ManogatRecord,
  type DonationRecord,
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
  | 'manogat'
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

function parseGoogleMapsCoordinates(input: string): { lat: number; lng: number } | null {
  if (!input || !input.trim()) return null;
  const str = input.trim();

  // 1. Direct Lat, Lng format (e.g. "18.2335, 73.4442")
  const directMatch = str.match(/^[-+]?([1-8]?\d(\.\d+)?|90(\.0+)?)[,\s]+[-+]?(180(\.0+)?|((1[0-7]\d)|([1-9]?\d))(\.\d+)?)$/);
  if (directMatch) {
    const parts = str.split(/[,\s]+/).map(Number);
    if (parts.length >= 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
      return { lat: Number(parts[0].toFixed(6)), lng: Number(parts[1].toFixed(6)) };
    }
  }

  // 2. Google Maps URL @lat,lng format (@18.2335198,73.4442111)
  const atMatch = str.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
  if (atMatch) {
    const lat = parseFloat(atMatch[1]);
    const lng = parseFloat(atMatch[2]);
    if (!isNaN(lat) && !isNaN(lng)) return { lat: Number(lat.toFixed(6)), lng: Number(lng.toFixed(6)) };
  }

  // 3. Google Maps data parameters: !3d(lat)!4d(lng) or !2d(lng)!3d(lat)
  const d3d4Match = str.match(/!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/);
  if (d3d4Match) {
    const lat = parseFloat(d3d4Match[1]);
    const lng = parseFloat(d3d4Match[2]);
    if (!isNaN(lat) && !isNaN(lng)) return { lat: Number(lat.toFixed(6)), lng: Number(lng.toFixed(6)) };
  }

  const d2d3Match = str.match(/!2d(-?\d+\.\d+)!3d(-?\d+\.\d+)/);
  if (d2d3Match) {
    const lng = parseFloat(d2d3Match[1]);
    const lat = parseFloat(d2d3Match[2]);
    if (!isNaN(lat) && !isNaN(lng)) return { lat: Number(lat.toFixed(6)), lng: Number(lng.toFixed(6)) };
  }

  // 4. Query param format: ?q=lat,lng or &query=lat,lng or ?ll=lat,lng or ?daddr=lat,lng
  const queryParamMatch = str.match(/[?&](?:q|query|ll|daddr|saddr|center)=(-?\d+\.\d+)[,%20]+(-?\d+\.\d+)/i);
  if (queryParamMatch) {
    const lat = parseFloat(queryParamMatch[1]);
    const lng = parseFloat(queryParamMatch[2]);
    if (!isNaN(lat) && !isNaN(lng)) return { lat: Number(lat.toFixed(6)), lng: Number(lng.toFixed(6)) };
  }

  // 5. Degree Minute Second (DMS) format
  const dmsMatch = str.match(/(\d+)°(\d+)'([\d.]+)"?([NS])[,\s]+(\d+)°(\d+)'([\d.]+)"?([EW])/i);
  if (dmsMatch) {
    let lat = parseInt(dmsMatch[1], 10) + parseInt(dmsMatch[2], 10) / 60 + parseFloat(dmsMatch[3]) / 3600;
    if (dmsMatch[4].toUpperCase() === 'S') lat = -lat;
    let lng = parseInt(dmsMatch[5], 10) + parseInt(dmsMatch[6], 10) / 60 + parseFloat(dmsMatch[7]) / 3600;
    if (dmsMatch[8].toUpperCase() === 'W') lng = -lng;
    return { lat: Number(lat.toFixed(6)), lng: Number(lng.toFixed(6)) };
  }

  // 6. Generic regex for any two decimal numbers in the string
  const genericMatch = str.match(/(-?\d{1,2}\.\d{4,})[,\s/]+(-?\d{1,3}\.\d{4,})/);
  if (genericMatch) {
    const lat = parseFloat(genericMatch[1]);
    const lng = parseFloat(genericMatch[2]);
    if (lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
      return { lat: Number(lat.toFixed(6)), lng: Number(lng.toFixed(6)) };
    }
  }

  return null;
}

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
  const [loginLoading, setLoginLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const [stats, setStats] = useState<AdminStats>(EMPTY_STATS);
  const [certificates, setCertificates] = useState<CertificateData[]>([]);
  const [loading, setLoading] = useState(false);
  const [statusBanner, setStatusBanner] = useState<string | null>(null);

  // Forms state
  const [fortForm, setFortForm] = useState<Fort>(EMPTY_FORT);
  const [featuresText, setFeaturesText] = useState('बालेकिल्ला, मुख्य दरवाजा');
  const [mapsUrlInput, setMapsUrlInput] = useState('');
  const [detectingCoords, setDetectingCoords] = useState(false);
  const [coordDetectionStatus, setCoordDetectionStatus] = useState<{ success?: boolean; message?: string } | null>(null);

  const handleDetectCoordinates = async (inputStr?: string) => {
    const textToParse = (inputStr !== undefined ? inputStr : mapsUrlInput).trim();
    if (!textToParse) {
      setCoordDetectionStatus({
        success: false,
        message: 'कृपया Google Maps लिंक किंवा अक्षांश/रेखांश प्रविष्ट करा.',
      });
      return;
    }

    // 1. First attempt instant local parse
    const local = parseGoogleMapsCoordinates(textToParse);
    if (local) {
      setFortForm(prev => ({
        ...prev,
        latitude: local.lat,
        longitude: local.lng,
      }));
      setCoordDetectionStatus({
        success: true,
        message: `📍 अक्षांश (Lat): ${local.lat}, रेखांश (Lng): ${local.lng}`,
      });
      return;
    }

    // 2. If it is a short link or web URL, query backend resolver
    setDetectingCoords(true);
    setCoordDetectionStatus(null);
    try {
      const res = await api.resolveMapsUrl(textToParse);
      setFortForm(prev => ({
        ...prev,
        latitude: res.latitude,
        longitude: res.longitude,
      }));
      setCoordDetectionStatus({
        success: true,
        message: `📍 अक्षांश (Lat): ${res.latitude}, रेखांश (Lng): ${res.longitude}`,
      });
    } catch (err: any) {
      setCoordDetectionStatus({
        success: false,
        message:
          err.message ||
          'दिलेल्या लिंकमधून Coordinates ओळखता आले नाहीत. कृपया अचूक लिंक किंवा मॅन्युअली व्हॅल्यू भरा.',
      });
    } finally {
      setDetectingCoords(false);
    }
  };


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
  const [dinFilterMonth, setDinFilterMonth] = useState<number | 'all'>('all');
  const [dinFilterCategory, setDinFilterCategory] = useState<string>('all');
  const [dinFilterPublish, setDinFilterPublish] = useState<string>('all');
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

  // Manogat (मनोगत) state
  const EMPTY_MANOGAT = {
    name: '',
    nameEn: '',
    designation: '',
    designationEn: '',
    photo: '',
    shortManogat: '',
    shortManogatEn: '',
    detailedManogat: '',
    detailedManogatEn: '',
    displayOrder: 1,
    isPublished: true,
  };

  const [manogatList, setManogatList] = useState<ManogatRecord[]>([]);
  const [editingManogatId, setEditingManogatId] = useState<string | null>(null);
  const [manogatForm, setManogatForm] = useState(EMPTY_MANOGAT);
  const [manogatSearch, setManogatSearch] = useState('');
  const [showManogatPreview, setShowManogatPreview] = useState(false);

  // Donations Verification & Management State
  const EMPTY_DONATION_FORM = {
    donorName: '',
    amount: 1000,
    donationDate: new Date().toISOString().slice(0, 10),
    purpose: 'सामान्य संवर्धन निधी',
    paymentMethod: 'PhonePe UPI',
    transactionRef: '',
    phonePrivate: '',
    emailPrivate: '',
    paymentStatus: 'completed',
    verificationStatus: 'approved',
    displayNamePublic: true,
    displayAmountPublic: false,
    adminRemarks: '',
    isPublished: true,
  };

  const [donationsList, setDonationsList] = useState<DonationRecord[]>([]);
  const [donationFilterStatus, setDonationFilterStatus] = useState<string>('all');
  const [donationSearch, setDonationSearch] = useState('');
  const [selectedDonation, setSelectedDonation] = useState<DonationRecord | null>(null);
  const [showAddDonationModal, setShowAddDonationModal] = useState(false);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [addDonationForm, setAddDonationForm] = useState(EMPTY_DONATION_FORM);
  const [editDonationForm, setEditDonationForm] = useState(EMPTY_DONATION_FORM);
  const [savingDonation, setSavingDonation] = useState(false);

  const loadStats = async () => {
    setLoading(true);
    try {
      const [live, certs, dinList, mList, donList] = await Promise.all([
        api.fetchAdminStats(),
        api.getCertificates().catch(() => []),
        api.getDinvishesh().catch(() => []),
        api.getAllManogatsAdmin().catch(() => []),
        api.getAdminDonations().catch(() => []),
      ]);
      setStats(live);
      setCertificates(certs);
      setDinvisheshList(dinList);
      setManogatList(mList);
      setDonationsList(donList);
    } catch (err: any) {
      setStatusBanner(`⚠️ बॅकएंड कनेक्शन त्रुटी: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveManogat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manogatForm.name.trim() || !manogatForm.designation.trim() || !manogatForm.shortManogat.trim()) {
      setStatusBanner('⚠️ कृपया नाव, पद आणि संक्षिप्त मनोगत ही आवश्यक माहिती भरा.');
      return;
    }

    try {
      if (editingManogatId) {
        await api.updateManogat(editingManogatId, manogatForm);
        setStatusBanner(`✅ "${manogatForm.name}" यांचे मनोगत यशस्वीरित्या अद्ययावत झाले!`);
      } else {
        await api.createManogat(manogatForm);
        setStatusBanner(`✅ "${manogatForm.name}" यांचे नवीन मनोगत जोडले गेले!`);
      }

      setEditingManogatId(null);
      setManogatForm(EMPTY_MANOGAT);
      setShowManogatPreview(false);
      await refreshAll();
      await loadStats();
    } catch (err: any) {
      setStatusBanner(`❌ त्रुटी: ${err.message}`);
    }
  };

  const handleEditManogat = (item: ManogatRecord) => {
    setEditingManogatId(item.id);
    setManogatForm({
      name: item.name,
      nameEn: item.nameEn || item.name_en || '',
      designation: item.designation,
      designationEn: item.designationEn || item.designation_en || '',
      photo: item.photo || '',
      shortManogat: item.shortManogat || item.short_manogat || '',
      shortManogatEn: item.shortManogatEn || item.short_manogat_en || '',
      detailedManogat: item.detailedManogat || item.detailed_manogat || '',
      detailedManogatEn: item.detailedManogatEn || item.detailed_manogat_en || '',
      displayOrder: item.displayOrder !== undefined ? item.displayOrder : item.display_order || 1,
      isPublished: item.isPublished !== undefined ? item.isPublished : item.is_published !== false,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteManogat = async (id: string, name: string) => {
    if (!window.confirm(`तुम्हाला खरोखर "${name}" यांचे मनोगत हटवायचे आहे का?`)) return;
    try {
      await api.deleteManogat(id);
      setStatusBanner('✅ मनोगत हटवले गेले!');
      await refreshAll();
      await loadStats();
    } catch (err: any) {
      setStatusBanner(`❌ ${err.message}`);
    }
  };

  const handleTogglePublishManogat = async (item: ManogatRecord) => {
    const currentPub = item.isPublished !== undefined ? item.isPublished : item.is_published !== false;
    try {
      await api.updateManogat(item.id, { isPublished: !currentPub });
      setStatusBanner(`✅ स्थिती बदलली: ${!currentPub ? 'प्रकाशित' : 'अप्रकाशित'}`);
      await refreshAll();
      await loadStats();
    } catch (err: any) {
      setStatusBanner(`❌ ${err.message}`);
    }
  };

  // --------------------------------------------------------------------------
  // Donation Verification & Management Handlers
  // --------------------------------------------------------------------------
  const handleOpenVerifyModal = (d: DonationRecord) => {
    setSelectedDonation(d);
    setEditDonationForm({
      donorName: d.donor_name || d.donorName || '',
      amount: Number(d.donation_amount || d.amount || 0),
      donationDate: d.donation_date || d.donationDate || (d.created_at ? d.created_at.slice(0, 10) : ''),
      purpose: d.purpose || d.project_name || 'सामान्य संवर्धन निधी',
      paymentMethod: d.payment_method || d.paymentMethod || 'UPI',
      transactionRef: d.transaction_reference || d.transaction_ref || '',
      phonePrivate: d.phone_private || d.phone || '',
      emailPrivate: d.email_private || d.email || '',
      paymentStatus: d.payment_status || d.paymentStatus || 'completed',
      verificationStatus: d.verification_status || d.verificationStatus || 'pending',
      displayNamePublic: d.display_name_public !== undefined ? Boolean(d.display_name_public) : true,
      displayAmountPublic: d.display_amount_public !== undefined ? Boolean(d.display_amount_public) : false,
      adminRemarks: d.admin_remarks || d.adminRemarks || '',
      isPublished: d.is_published !== undefined ? Boolean(d.is_published) : false,
    });
    setShowVerifyModal(true);
  };

  const handleQuickApproveDonation = async (id: string, name: string) => {
    try {
      await api.updateAdminDonation(id, {
        verificationStatus: 'approved',
        isPublished: true,
        verifiedBy: 'Admin',
      });
      setStatusBanner(`🟢 "${name}" यांची देणगी मंजूर व प्रकाशित झाली!`);
      await refreshAll();
      await loadStats();
    } catch (err: any) {
      setStatusBanner(`❌ त्रुटी: ${err.message}`);
    }
  };

  const handleQuickRejectDonation = async (id: string, name: string) => {
    if (!window.confirm(`तुम्हाला खरोखर "${name}" यांची देणगी नोंद नाकारायची आहे का?`)) return;
    try {
      await api.updateAdminDonation(id, {
        verificationStatus: 'rejected',
        isPublished: false,
        verifiedBy: 'Admin',
      });
      setStatusBanner(`🔴 "${name}" यांची देणगी नाकारण्यात आली.`);
      await refreshAll();
      await loadStats();
    } catch (err: any) {
      setStatusBanner(`❌ त्रुटी: ${err.message}`);
    }
  };

  const handleQuickTogglePublishDonation = async (d: DonationRecord) => {
    const nextState = !d.is_published;
    try {
      await api.updateAdminDonation(d.id, {
        isPublished: nextState,
      });
      setStatusBanner(
        nextState
          ? `🟢 "${d.donor_name}" यांचे नाव वेबसाइटवर प्रकाशित झाले.`
          : `⚪ "${d.donor_name}" यांचे नाव वेबसाइटवरून तात्काळ अप्रकाशित (Hide) केले.`
      );
      await refreshAll();
      await loadStats();
    } catch (err: any) {
      setStatusBanner(`❌ त्रुटी: ${err.message}`);
    }
  };

  const handleSaveVerifyDonation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDonation) return;
    setSavingDonation(true);
    try {
      await api.updateAdminDonation(selectedDonation.id, editDonationForm);
      setStatusBanner(`✅ देणगीदार माहिती व पडताळणी तपशील यशस्वीरित्या जतन केले!`);
      setShowVerifyModal(false);
      setSelectedDonation(null);
      await refreshAll();
      await loadStats();
    } catch (err: any) {
      setStatusBanner(`❌ त्रुटी: ${err.message}`);
    } finally {
      setSavingDonation(false);
    }
  };

  const handleCreateManualDonation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addDonationForm.donorName.trim() || addDonationForm.amount <= 0) {
      setStatusBanner('⚠️ कृपया देणगीदाराचे नाव आणि योग्य रक्कम प्रविष्ट करा.');
      return;
    }
    setSavingDonation(true);
    try {
      await api.createAdminDonation(addDonationForm);
      setStatusBanner(`✅ नवीन देणगी नोंद यशस्वीरित्या जोडली गेली!`);
      setShowAddDonationModal(false);
      setAddDonationForm(EMPTY_DONATION_FORM);
      await refreshAll();
      await loadStats();
    } catch (err: any) {
      setStatusBanner(`❌ त्रुटी: ${err.message}`);
    } finally {
      setSavingDonation(false);
    }
  };

  const handleDeleteDonationRecord = async (id: string, name: string) => {
    if (!window.confirm(`तुम्हाला खरोखर "${name}" यांची देणगी नोंद कायमची हटवायची आहे का?`)) return;
    try {
      await api.deleteDonation(id);
      setStatusBanner('✅ देणगी नोंद हटवली गेली.');
      if (showVerifyModal && selectedDonation?.id === id) {
        setShowVerifyModal(false);
        setSelectedDonation(null);
      }
      await refreshAll();
      await loadStats();
    } catch (err: any) {
      setStatusBanner(`❌ त्रुटी: ${err.message}`);
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
      await refreshAll();
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
      await refreshAll();
      await loadStats();
    } catch (err: any) {
      setStatusBanner(`❌ ${err.message}`);
    }
  };

  const handleTogglePublishDinvishesh = async (item: DinvisheshRecord) => {
    try {
      await api.updateDinvishesh(item.id, { is_published: !item.is_published });
      setStatusBanner(`✅ स्थिती बदलली: ${!item.is_published ? 'प्रकाशित' : 'अप्रकाशित'}`);
      await refreshAll();
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

  useEffect(() => {
    const pendingEditId = localStorage.getItem('gsp_edit_din_id');
    if (pendingEditId && dinvisheshList.length > 0) {
      const found = dinvisheshList.find(d => d.id === pendingEditId);
      if (found) {
        setActiveTab('dinvishesh');
        setEditingDinId(found.id);
        setDinForm({
          day: found.day,
          month: found.month,
          year: found.year || '',
          personality: found.personality || found.figure || 'छत्रपती शिवाजी महाराज',
          eventType: found.event_type || found.eventType || 'राज्याभिषेक',
          titleMarathi: found.title_marathi || found.title || '',
          titleEnglish: found.title_english || found.title_en || found.titleEn || '',
          descriptionMarathi: found.description_marathi || found.description || '',
          descriptionEnglish: found.description_english || found.description_en || found.descriptionEn || '',
          location: found.location || '',
          image: found.image_url || found.image || '',
          historicalSignificance: found.historical_significance || found.historicalSignificance || '',
          sourceName: found.source_name || found.sourceName || (found.sources || ''),
          sourceUrl: found.source_url || found.sourceUrl || '',
          sourceType: found.source_type || found.sourceType || 'Published historical book',
          sourceDescription: found.source_description || found.sourceDescription || '',
          verificationStatus: found.verification_status || found.verificationStatus || 'verified',
          isDisputed: Boolean(found.is_disputed ?? found.isDisputed),
          disputeNote: found.dispute_note || found.disputeNote || '',
          keyFiguresStr: (found.key_figures || []).join(', '),
          sources: found.sources || '',
          isPublished: found.is_published ?? true,
        });
        localStorage.removeItem('gsp_edit_din_id');
        setTimeout(() => {
          const el = document.getElementById('dinvishesh-editor-form');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }, 300);
      }
    }
  }, [dinvisheshList]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginErr(null);
    setLoginLoading(true);
    try {
      const res = await api.adminLogin(username.trim(), password);
      localStorage.setItem('gsp_admin_token', res.token);
      setToken(res.token);
    } catch (err: any) {
      setLoginErr(err.message || 'चुकीचे वापरकर्ता नाव किंवा पासवर्ड!');
    } finally {
      setLoginLoading(false);
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
      setMapsUrlInput('');
      setCoordDetectionStatus(null);
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
            <div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-gradient-to-tr from-[#A84A20]/30 to-[#D4A955]/20 border border-[#D4A955]/30 flex items-center justify-center">
              <Lock className="w-8 h-8 text-[#D4A955]" />
            </div>
            <h1 className="font-serif text-xl font-bold text-white">प्रशासन नियंत्रण कक्ष</h1>
            <p className="text-xs text-[rgba(255,255,255,0.5)] mt-1">
              प्रशासकीय लॉगिन (Admin Dashboard Access)
            </p>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 mt-2.5 rounded-full bg-[#A84A20]/15 border border-[#A84A20]/30 text-[11px] text-[#F4956A]">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>सुरक्षित प्रशासकीय प्रवेश</span>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="admin-username" className="block text-xs font-medium text-[rgba(255,255,255,0.6)] mb-1.5">
                वापरकर्ता नाव (Username)
              </label>
              <div className="relative">
                <input
                  id="admin-username"
                  type="text"
                  required
                  autoComplete="username"
                  placeholder="उदा. admin"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  disabled={loginLoading}
                  className="w-full px-4 py-2.5 rounded-xl bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.12)] text-white text-sm focus:border-[#D4A955] focus:outline-none focus:ring-1 focus:ring-[#D4A955]/50 transition-all disabled:opacity-50"
                />
              </div>
            </div>

            <div>
              <label htmlFor="admin-password" className="block text-xs font-medium text-[rgba(255,255,255,0.6)] mb-1.5">
                पासवर्ड (Password)
              </label>
              <div className="relative">
                <input
                  id="admin-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  disabled={loginLoading}
                  className="w-full px-4 py-2.5 pr-11 rounded-xl bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.12)] text-white text-sm focus:border-[#D4A955] focus:outline-none focus:ring-1 focus:ring-[#D4A955]/50 transition-all disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/80 p-1 transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {loginErr && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <p className="text-xs text-red-300">{loginErr}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loginLoading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-[#A84A20] to-[#c15a2a] hover:from-[#c15a2a] hover:to-[#A84A20] text-white font-bold text-sm shadow-lg shadow-[#A84A20]/20 hover:shadow-[#A84A20]/40 transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
            >
              {loginLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>पडताळणी सुरू आहे...</span>
                </>
              ) : (
                <>
                  <span>लॉगिन करा (Login)</span>
                  <Lock className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-[rgba(255,255,255,0.06)] text-center">
            <Link
              to="/"
              className="text-xs text-[rgba(255,255,255,0.4)] hover:text-[#D4A955] transition-colors inline-flex items-center gap-1.5"
            >
              <ArrowLeft size={12} />
              <span>मुख्य पानावर परत जा (Back to Home)</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const navItems: { id: TabId; label: string; icon: any; count?: number }[] = [
    { id: 'overview', label: 'डॅशबोर्ड आढावा', icon: LayoutDashboard },
    { id: 'dinvishesh', label: 'दिनविशेष (ऐतिहासिक कॅलेंडर)', icon: CalendarDays, count: dinvisheshList.length },
    { id: 'manogat', label: 'सदस्यांचे मनोगत (Manogat)', icon: MessageSquareQuote, count: manogatList.length },
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
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
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
                  label: 'दिनविशेष घटना',
                  val: dinvisheshList.length,
                  sub: `${dinvisheshList.filter(d => d.is_published).length} प्रकाशित`,
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

            {/* Overview Dinvishesh Quick Management Widget */}
            <div className="bg-[#1a1f2e] rounded-2xl p-5 border border-white/10 space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
                <div>
                  <h3 className="font-bold text-sm text-[#D4A955] flex items-center gap-2">
                    <CalendarDays size={18} />
                    <span>🚩 दिनविशेष ऐतिहासिक प्रसंग ({dinvisheshList.length})</span>
                  </h3>
                  <p className="text-[11px] text-white/40 mt-0.5">
                    वेबसाइटवरील शिवसाम्राज्याचे दिनविशेष, ऐतिहासिक कॅलेंडर व प्रसंग व्यवस्थापित करा.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setEditingDinId(null);
                      setDinForm({
                        day: new Date().getDate(),
                        month: new Date().getMonth() + 1,
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
                      setActiveTab('dinvishesh');
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#A84A20] hover:bg-[#c15a2a] text-white text-xs font-bold transition-colors shadow-sm"
                  >
                    <Plus size={14} /> नवीन दिनविशेष जोडा
                  </button>
                  <button
                    onClick={() => setActiveTab('dinvishesh')}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold transition-colors"
                  >
                    सर्व दिनविशेष पहा →
                  </button>
                </div>
              </div>

              {dinvisheshList.length === 0 ? (
                <div className="text-center py-6 text-xs text-white/40">
                  अद्याप कोणत्याही दिनविशेष ऐतिहासिक प्रसंगांची नोंद झालेली नाही.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {dinvisheshList.slice(0, 6).map(item => (
                    <div
                      key={item.id}
                      className="p-3.5 rounded-xl bg-white/5 border border-white/10 flex flex-col justify-between gap-3 hover:bg-white/[0.07] transition-all"
                    >
                      <div className="flex items-start gap-3">
                        {item.image_url || item.image ? (
                          <img
                            src={item.image_url || item.image}
                            alt={item.title_marathi || item.title}
                            className="w-12 h-12 rounded-xl object-cover shrink-0 border border-white/10"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-xl bg-[#A84A20]/20 border border-[#A84A20]/30 flex items-center justify-center text-xs text-[#D4A955] font-bold shrink-0">
                            🚩
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-1">
                            <span className="text-[10px] text-[#F4956A] font-bold truncate">
                              {item.personality || item.figure}
                            </span>
                            <span
                              className={`text-[9px] px-1.5 py-0.2 rounded font-bold ${
                                item.is_published ? 'text-emerald-300 bg-emerald-500/20' : 'text-amber-300 bg-amber-500/20'
                              }`}
                            >
                              {item.is_published ? 'प्रकाशित' : 'अप्रकाशित'}
                            </span>
                          </div>
                          <h4 className="font-bold text-xs text-white truncate mt-0.5">
                            {item.title_marathi || item.title}
                          </h4>
                          <div className="text-[10px] text-[#D4A955] mt-0.5">
                            📅 {item.day}/{item.month} {item.year && `(${item.year})`} · {item.event_type || 'प्रसंग'}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-white/5 text-[10px]">
                        <span className="text-white/40 truncate max-w-[140px]">
                          {item.location ? `📍 ${item.location}` : 'प्रमाणित नोंद'}
                        </span>
                        <div className="flex items-center gap-1.5">
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
                              setActiveTab('dinvishesh');
                            }}
                            className="px-2 py-1 rounded bg-white/10 hover:bg-white/20 text-[#D4A955] font-semibold flex items-center gap-1"
                            title="संपादित करा"
                          >
                            <Edit3 size={11} /> संपादन
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Overview Manogat Quick Management */}
            <div className="bg-[#1a1f2e] rounded-2xl p-5 border border-white/10 space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
                <div>
                  <h3 className="font-bold text-sm text-[#D4A955] flex items-center gap-2">
                    <MessageSquareQuote size={18} />
                    <span>💬 सदस्यांचे मनोगत ({manogatList.length})</span>
                  </h3>
                  <p className="text-[11px] text-white/40 mt-0.5">
                    About Us पृष्ठावर दिसणारे सदस्यांचे अनुभव व संदेश व्यवस्थापित करा.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setEditingManogatId(null);
                      setManogatForm(EMPTY_MANOGAT);
                      setActiveTab('manogat');
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#A84A20] hover:bg-[#c15a2a] text-white text-xs font-bold transition-colors shadow-sm"
                  >
                    <Plus size={14} /> नवीन मनोगत जोडा
                  </button>
                  <button
                    onClick={() => setActiveTab('manogat')}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold transition-colors"
                  >
                    सर्व पहा →
                  </button>
                </div>
              </div>

              {manogatList.length === 0 ? (
                <div className="text-center py-6 text-xs text-white/40">
                  अद्याप कोणत्याही सदस्याचे मनोगत जोडलेले नाही.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {manogatList.slice(0, 6).map(m => {
                    const isPub = m.isPublished !== undefined ? m.isPublished : m.is_published !== false;
                    return (
                      <div
                        key={m.id}
                        className="p-3.5 rounded-xl bg-white/5 border border-white/10 flex flex-col justify-between gap-3 hover:bg-white/[0.07] transition-all"
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-full p-[1.5px] bg-gradient-to-tr from-[#A84A20] to-[#D4A955] shrink-0">
                            {m.photo ? (
                              <img
                                src={m.photo}
                                alt={m.name}
                                className="w-full h-full rounded-full object-cover bg-[#F9F2E3]"
                              />
                            ) : (
                              <div className="w-full h-full rounded-full bg-[#A84A20] flex items-center justify-center text-white font-bold text-sm">
                                {m.name.charAt(0)}
                              </div>
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-1">
                              <h4 className="font-bold text-xs text-white truncate">{m.name}</h4>
                              <span
                                className={`text-[9px] px-1.5 py-0.2 rounded font-bold ${
                                  isPub ? 'text-emerald-300 bg-emerald-500/20' : 'text-amber-300 bg-amber-500/20'
                                }`}
                              >
                                {isPub ? 'प्रकाशित' : 'अप्रकाशित'}
                              </span>
                            </div>
                            <div className="text-[10px] text-[#D4A955] truncate">{m.designation}</div>
                            <p className="text-[11px] text-white/60 italic line-clamp-2 mt-1 leading-snug">
                              "{m.shortManogat || m.short_manogat}"
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-white/5 text-[10px]">
                          <span className="text-white/40 font-mono">क्रम: #{m.displayOrder || m.display_order || 0}</span>
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => {
                                handleEditManogat(m);
                                setActiveTab('manogat');
                              }}
                              className="px-2 py-1 rounded bg-white/10 hover:bg-white/20 text-[#D4A955] font-semibold flex items-center gap-1"
                              title="संपादित करा"
                            >
                              <Edit3 size={11} /> संपादन
                            </button>
                            <button
                              onClick={() => handleDeleteManogat(m.id, m.name)}
                              className="p-1 rounded bg-red-500/20 hover:bg-red-500/30 text-red-400"
                              title="हटवा"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* MEMBER MANOGAT (मनोगत) MANAGEMENT TAB */}
        {activeTab === 'manogat' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="font-serif text-xl font-bold text-white flex items-center gap-2">
                  <MessageSquareQuote className="text-[#D4A955]" size={22} />
                  <span>संस्थेत कार्यरत सदस्यांचे मनोगत व्यवस्थापन</span>
                </h2>
                <p className="text-xs text-white/50 mt-0.5">
                  About Us पृष्ठावरील 'आमचे मनोगत' विभागातील सदस्यांचे विचार, फोटो व संदेश येथून नियंत्रित करा.
                </p>
              </div>

              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowManogatPreview(!showManogatPreview)}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all ${
                    showManogatPreview
                      ? 'bg-[#D4A955]/20 text-[#D4A955] border-[#D4A955]/40'
                      : 'bg-white/5 text-white/70 border-white/10 hover:bg-white/10'
                  }`}
                >
                  {showManogatPreview ? <EyeOff size={14} /> : <Eye size={14} />}
                  <span>{showManogatPreview ? 'पूर्वदृश्य लपवा' : 'थेट कार्ड पूर्वदृश्य पहा'}</span>
                </button>
              </div>
            </div>

            {/* Live Card Preview if toggled */}
            {showManogatPreview && (
              <div className="p-6 bg-[#16120b] rounded-3xl border-2 border-[#D4A955]/40 shadow-2xl space-y-4">
                <div className="text-xs font-bold text-[#D4A955] uppercase tracking-wider flex items-center gap-2">
                  <Sparkles size={14} /> थेट कार्ड पूर्वदृश्य (Live Card Preview on About Us)
                </div>
                <div className="max-w-md mx-auto">
                  <div className="group relative bg-[#FFFDF9] rounded-2xl p-6 sm:p-7 border border-[#E8D5A3] shadow-[0_8px_24px_-8px_rgba(168,74,32,0.12)] flex flex-col justify-between">
                    <Quote
                      size={40}
                      className="absolute top-4 right-4 text-[#B58A45]/15 pointer-events-none"
                    />

                    <div>
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-16 h-16 rounded-full p-[2px] bg-gradient-to-tr from-[#A84A20] via-[#D4A955] to-[#E8D5A3] shadow-md shrink-0">
                          {manogatForm.photo ? (
                            <img
                              src={manogatForm.photo}
                              alt="Preview"
                              className="w-full h-full rounded-full object-cover bg-[#F9F2E3]"
                            />
                          ) : (
                            <div className="w-full h-full rounded-full bg-gradient-to-br from-[#A84A20] to-[#B58A45] flex items-center justify-center text-white font-serif font-bold text-xl">
                              {manogatForm.name ? manogatForm.name.charAt(0) : '?'}
                            </div>
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <h4 className="font-serif font-bold text-[#1A1008] text-base truncate">
                            {manogatForm.name || 'सदस्याचे नाव'}
                          </h4>
                          <p className="text-xs font-semibold text-[#A84A20] mt-0.5 truncate">
                            {manogatForm.designation || 'पद / जबाबदारी'}
                          </p>
                        </div>
                      </div>

                      <p className="text-[#5A4634] text-xs sm:text-sm leading-relaxed italic mb-4 font-sans line-clamp-4">
                        "{manogatForm.shortManogat || 'संस्थेच्या कार्यातून समाजासाठी काहीतरी सकारात्मक योगदान देण्याची संधी मिळते...'}"
                      </p>
                    </div>

                    <div className="pt-3 border-t border-[#F2E5C8] flex items-center justify-between text-xs font-bold text-[#A84A20]">
                      <span>{manogatForm.detailedManogat ? 'सविस्तर वाचा →' : 'सक्रिय सदस्य'}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#A84A20]/10 font-mono">
                        क्रम: #{manogatForm.displayOrder}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Manogat Form */}
            <form
              onSubmit={handleSaveManogat}
              className="bg-[#1a1f2e] rounded-3xl p-6 sm:p-8 border border-white/10 space-y-6 shadow-xl"
            >
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <h3 className="font-serif text-base sm:text-lg font-bold text-[#D4A955] flex items-center gap-2">
                  <Plus size={18} />
                  <span>{editingManogatId ? '✏️ मनोगत संपादित करा' : '➕ नवीन सदस्याचे मनोगत जोडा'}</span>
                </h3>
                {editingManogatId && (
                  <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-semibold">
                    संपादन मोड (Edit Mode)
                  </span>
                )}
              </div>

              {/* Photo Upload */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="sm:col-span-1">
                  <ImageUploadField
                    label="सदस्याचा फोटो (Member Photo)"
                    folder="manogat"
                    value={manogatForm.photo}
                    onChange={url => setManogatForm({ ...manogatForm, photo: url })}
                  />
                  <p className="text-[11px] text-white/40 mt-1">
                    चौकोनी किंवा वर्तुळाकार फोटो योग्य दिसेल.
                  </p>
                </div>

                <div className="sm:col-span-2 space-y-4">
                  {/* Name fields */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-white/60 mb-1 font-semibold">
                        सदस्याचे नाव (मराठी) <span className="text-[#F4956A]">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="उदा. श्री. योगेश सोनवणे"
                        value={manogatForm.name}
                        onChange={e => setManogatForm({ ...manogatForm, name: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/15 text-white text-xs focus:border-[#D4A955] focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs text-white/60 mb-1 font-semibold">
                        Member Name (English)
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Mr. Yogesh Sonawane"
                        value={manogatForm.nameEn}
                        onChange={e => setManogatForm({ ...manogatForm, nameEn: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/15 text-white text-xs focus:border-[#D4A955] focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Designation fields */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-white/60 mb-1 font-semibold">
                        पद / जबाबदारी (Designation in Marathi) <span className="text-[#F4956A]">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="उदा. संस्थापक अध्यक्ष / ट्रेक समन्वयक"
                        value={manogatForm.designation}
                        onChange={e => setManogatForm({ ...manogatForm, designation: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/15 text-white text-xs focus:border-[#D4A955] focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs text-white/60 mb-1 font-semibold">
                        Designation / Role (English)
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Founder President / Trek Coordinator"
                        value={manogatForm.designationEn}
                        onChange={e => setManogatForm({ ...manogatForm, designationEn: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/15 text-white text-xs focus:border-[#D4A955] focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Short Manogat */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs text-white/60 font-semibold">
                      संक्षिप्त मनोगत (Short Manogat 2-4 ओळी) <span className="text-[#F4956A]">*</span>
                    </label>
                    <span className="text-[10px] text-white/40">
                      {manogatForm.shortManogat.length} अक्षरे
                    </span>
                  </div>
                  <textarea
                    rows={3}
                    required
                    placeholder="उदा. किल्ल्यांच्या पायथ्याशी उभे राहिल्यावर पूर्वजांच्या त्यागाची जाणीव होते. ही केवळ संवर्धन मोहीम नसून आपल्या अस्मितेचा सन्मान आहे..."
                    value={manogatForm.shortManogat}
                    onChange={e => setManogatForm({ ...manogatForm, shortManogat: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/15 text-white text-xs focus:border-[#D4A955] focus:outline-none leading-relaxed"
                  />
                  <p className="text-[10px] text-white/40 mt-0.5">
                    हे संक्षिप्त मनोगत थेट कार्डवर दिसते. (२ ते ४ ओळी, साधे व मनापासून लिहिलेले असावे)
                  </p>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs text-white/60 font-semibold">
                      Short Reflection (English)
                    </label>
                    <span className="text-[10px] text-white/40">
                      {manogatForm.shortManogatEn.length} chars
                    </span>
                  </div>
                  <textarea
                    rows={3}
                    placeholder="e.g. Standing at the foot of historic forts reminds us of our ancestors' sacrifices..."
                    value={manogatForm.shortManogatEn}
                    onChange={e => setManogatForm({ ...manogatForm, shortManogatEn: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/15 text-white text-xs focus:border-[#D4A955] focus:outline-none leading-relaxed"
                  />
                </div>
              </div>

              {/* Detailed Manogat */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-white/60 mb-1 font-semibold">
                    सविस्तर मनोगत व अनुभव (Detailed Manogat for Read More)
                  </label>
                  <textarea
                    rows={4}
                    placeholder="सदस्याचा संपूर्ण अनुभव, सह्याद्रीतील आठवणी, संवर्धन कार्याचा प्रवास (वाचकांनी Read More वर क्लिक केल्यावर हे सविस्तर दिसेल)..."
                    value={manogatForm.detailedManogat}
                    onChange={e => setManogatForm({ ...manogatForm, detailedManogat: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/15 text-white text-xs focus:border-[#D4A955] focus:outline-none leading-relaxed"
                  />
                </div>

                <div>
                  <label className="block text-xs text-white/60 mb-1 font-semibold">
                    Detailed Reflection (English)
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Full journey and personal experience in English..."
                    value={manogatForm.detailedManogatEn}
                    onChange={e => setManogatForm({ ...manogatForm, detailedManogatEn: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/15 text-white text-xs focus:border-[#D4A955] focus:outline-none leading-relaxed"
                  />
                </div>
              </div>

              {/* Order and Status */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-white/10 items-center">
                <div>
                  <label className="block text-xs text-white/60 mb-1 font-semibold">
                    प्रदर्शन क्रम (Display Order)
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={manogatForm.displayOrder}
                    onChange={e => setManogatForm({ ...manogatForm, displayOrder: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/15 text-white text-xs focus:border-[#D4A955] focus:outline-none"
                  />
                  <p className="text-[10px] text-white/40 mt-0.5">लहान क्रमांक आधी दिसेल (उदा. 1, 2, 3...)</p>
                </div>

                <div className="sm:col-span-2 flex items-center gap-3 pt-4 sm:pt-0">
                  <label className="flex items-center gap-2.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={manogatForm.isPublished}
                      onChange={e => setManogatForm({ ...manogatForm, isPublished: e.target.checked })}
                      className="w-4 h-4 rounded bg-white/10 border-white/20 text-[#A84A20] focus:ring-0"
                    />
                    <span className="text-xs text-white font-semibold">
                      वेबसाइटवर प्रकाशित करा (Publish on Website)
                    </span>
                  </label>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-4 border-t border-white/10">
                <button
                  type="submit"
                  className="px-6 py-3 rounded-xl bg-[#A84A20] hover:bg-[#c15a2a] text-white font-bold text-xs flex items-center gap-2 shadow-lg transition-all"
                >
                  <Save size={15} />
                  <span>{editingManogatId ? 'बदल सेव्ह करा' : 'सदस्याचे मनोगत जोडा'}</span>
                </button>

                {editingManogatId && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingManogatId(null);
                      setManogatForm(EMPTY_MANOGAT);
                    }}
                    className="px-4 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-white/80 transition-colors"
                  >
                    रद्द करा
                  </button>
                )}
              </div>
            </form>

            {/* Search & List of existing Manogats */}
            <div className="bg-[#1a1f2e] rounded-3xl border border-white/10 overflow-hidden shadow-xl">
              <div className="p-5 border-b border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <h3 className="font-serif font-bold text-sm text-[#D4A955]">
                    नोंदवलेली सदस्यांची मनोगते ({manogatList.length})
                  </h3>
                </div>

                <input
                  type="text"
                  placeholder="नावाने किंवा पदाने शोधा..."
                  value={manogatSearch}
                  onChange={e => setManogatSearch(e.target.value)}
                  className="px-3.5 py-2 rounded-xl bg-white/5 border border-white/15 text-xs text-white w-full sm:w-64 focus:outline-none focus:border-[#D4A955]"
                />
              </div>

              <div className="divide-y divide-white/5">
                {manogatList
                  .filter(m => {
                    if (!manogatSearch.trim()) return true;
                    const q = manogatSearch.toLowerCase();
                    return (
                      (m.name || '').toLowerCase().includes(q) ||
                      (m.nameEn || m.name_en || '').toLowerCase().includes(q) ||
                      (m.designation || '').toLowerCase().includes(q) ||
                      (m.shortManogat || m.short_manogat || '').toLowerCase().includes(q)
                    );
                  })
                  .map(item => {
                    const isPub = item.isPublished !== undefined ? item.isPublished : item.is_published !== false;
                    const orderNum = item.displayOrder !== undefined ? item.displayOrder : item.display_order || 0;
                    const shortText = item.shortManogat || item.short_manogat || '';

                    return (
                      <div
                        key={item.id}
                        className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-white/[0.02] transition-colors"
                      >
                        <div className="flex items-start gap-4 min-w-0 flex-1">
                          <div className="w-14 h-14 rounded-full p-[2px] bg-gradient-to-tr from-[#A84A20] via-[#D4A955] to-[#E8D5A3] shrink-0 shadow-sm">
                            {item.photo ? (
                              <img
                                src={item.photo}
                                alt={item.name}
                                className="w-full h-full rounded-full object-cover bg-[#F9F2E3]"
                              />
                            ) : (
                              <div className="w-full h-full rounded-full bg-gradient-to-br from-[#A84A20] to-[#B58A45] flex items-center justify-center text-white font-serif font-bold text-lg">
                                {item.name.charAt(0)}
                              </div>
                            )}
                          </div>

                          <div className="min-w-0 flex-1 space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="font-serif font-bold text-white text-sm">
                                {item.name}
                              </h4>
                              {(item.nameEn || item.name_en) && (
                                <span className="text-xs text-white/40">
                                  ({item.nameEn || item.name_en})
                                </span>
                              )}
                              <span className="px-2 py-0.5 rounded-full bg-[#A84A20]/20 text-[#F4956A] text-[10px] font-semibold">
                                {item.designation}
                              </span>
                              <span className="px-2 py-0.5 rounded-full bg-white/10 text-white/60 text-[10px] font-mono">
                                क्रम: #{orderNum}
                              </span>
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                  isPub
                                    ? 'bg-emerald-500/20 text-emerald-300'
                                    : 'bg-amber-500/20 text-amber-300'
                                }`}
                              >
                                {isPub ? '✅ प्रकाशित' : '⏸️ अप्रकाशित'}
                              </span>
                            </div>

                            <p className="text-xs text-white/65 italic line-clamp-2 leading-relaxed">
                              "{shortText}"
                            </p>
                          </div>
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                          <button
                            type="button"
                            onClick={() => handleTogglePublishManogat(item)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                              isPub
                                ? 'bg-amber-500/15 hover:bg-amber-500/25 text-amber-300'
                                : 'bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300'
                            }`}
                            title={isPub ? 'अप्रकाशित करा' : 'प्रकाशित करा'}
                          >
                            {isPub ? 'अप्रकाशित करा' : 'प्रकाशित करा'}
                          </button>

                          <button
                            type="button"
                            onClick={() => handleEditManogat(item)}
                            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-[#D4A955] transition-colors"
                            title="संपादित करा"
                          >
                            <Edit3 size={15} />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteManogat(item.id, item.name)}
                            className="p-2 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-400 transition-colors"
                            title="हटवा"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>
                    );
                  })}

                {manogatList.length === 0 && (
                  <div className="p-8 text-center text-xs text-white/40">
                    अद्याप कोणत्याही सदस्याचे मनोगत नोंदवलेले नाही. वरील फॉर्म वापरून मनोगत जोडा.
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
              {/* Google Maps Auto Coordinate Detector */}
              <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[#D4A955] flex items-center gap-1.5">
                    <MapPin size={14} className="text-[#F4956A]" /> Google Maps लिंक (Auto Detect)
                  </label>
                  {fortForm.latitude && fortForm.longitude ? (
                    <a
                      href={`https://www.google.com/maps?q=${fortForm.latitude},${fortForm.longitude}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[11px] text-[#D4A955] hover:underline flex items-center gap-1"
                    >
                      <span>मॅपवर तपासा</span>
                      <ExternalLink size={11} />
                    </a>
                  ) : null}
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Google Maps लिंक / Share Link पेस्ट करा..."
                    value={mapsUrlInput}
                    onChange={e => {
                      const val = e.target.value;
                      setMapsUrlInput(val);
                      const fastParsed = parseGoogleMapsCoordinates(val);
                      if (fastParsed) {
                        setFortForm(prev => ({ ...prev, latitude: fastParsed.lat, longitude: fastParsed.lng }));
                        setCoordDetectionStatus({
                          success: true,
                          message: `📍 अक्षांश: ${fastParsed.lat}, रेखांश: ${fastParsed.lng}`,
                        });
                      }
                    }}
                    onPaste={e => {
                      const pasted = e.clipboardData.getData('text');
                      if (pasted) {
                        setTimeout(() => handleDetectCoordinates(pasted), 50);
                      }
                    }}
                    className="flex-1 px-3 py-2 rounded-lg bg-white/5 border border-white/15 text-xs text-white placeholder:text-white/30 focus:border-[#D4A955] focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => handleDetectCoordinates()}
                    disabled={detectingCoords}
                    className="px-3 py-2 rounded-lg bg-[#D4A955] hover:bg-[#b88c3a] text-black font-bold text-xs flex items-center gap-1 disabled:opacity-50 shrink-0 cursor-pointer"
                  >
                    {detectingCoords ? <Loader2 size={13} className="animate-spin" /> : <MapPin size={13} />}
                    <span>डिटेक्ट करा</span>
                  </button>
                </div>

                {coordDetectionStatus && (
                  <div
                    className={`text-[11px] p-2 rounded-lg flex items-center gap-1.5 ${
                      coordDetectionStatus.success
                        ? 'bg-emerald-900/30 border border-emerald-500/40 text-emerald-300'
                        : 'bg-red-900/30 border border-red-500/40 text-red-300'
                    }`}
                  >
                    {coordDetectionStatus.success ? <CheckCircle2 size={13} /> : <AlertCircle size={13} />}
                    <span>{coordDetectionStatus.message}</span>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2.5 pt-1">
                  <div>
                    <label className="text-[10px] text-white/50 block mb-0.5">Latitude (अक्षांश)</label>
                    <input
                      type="number"
                      step="any"
                      placeholder="18.2335"
                      value={fortForm.latitude}
                      onChange={e => setFortForm({ ...fortForm, latitude: Number(e.target.value) })}
                      className="w-full px-3 py-1.5 rounded-lg bg-white/5 border border-white/15 text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-white/50 block mb-0.5">Longitude (रेखांश)</label>
                    <input
                      type="number"
                      step="any"
                      placeholder="73.4442"
                      value={fortForm.longitude}
                      onChange={e => setFortForm({ ...fortForm, longitude: Number(e.target.value) })}
                      className="w-full px-3 py-1.5 rounded-lg bg-white/5 border border-white/15 text-xs font-mono"
                    />
                  </div>
                </div>
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
                          setMapsUrlInput(`https://www.google.com/maps?q=${f.latitude},${f.longitude}`);
                          setCoordDetectionStatus({
                            success: true,
                            message: `📍 अक्षांश: ${f.latitude}, रेखांश: ${f.longitude}`,
                          });
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

        {/* 8. DONATIONS & DONOR VERIFICATION TAB */}
        {activeTab === 'donations' && (
          <div className="space-y-6">
            {/* Header & Main Actions */}
            <div className="flex items-center justify-between flex-wrap gap-4 bg-[#1a1f2e] p-6 rounded-2xl border border-white/10">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2.5 py-0.5 rounded-full bg-[#D4A955]/15 border border-[#D4A955]/30 text-[#D4A955] text-[11px] font-bold">
                    पडताळणी व गोपनीयता नियंत्रण
                  </span>
                </div>
                <h3 className="font-bold text-lg text-white flex items-center gap-2">
                  <HandCoins className="text-[#D4A955]" size={22} />
                  💰 देणगीदार पडताळणी व व्यवस्थापन (Donations & Verification)
                </h3>
                <p className="text-xs text-white/50 mt-1">
                  वेबसाइटवर देणगीदारांची नावे प्रकाशित करण्यापूर्वी पडताळणी करा, नावे संपादित करा आणि गोपनीयता नियंत्रणे ठरवा.
                </p>
              </div>

              <div className="flex items-center gap-2.5 flex-wrap">
                <button
                  type="button"
                  onClick={() => {
                    setAddDonationForm(EMPTY_DONATION_FORM);
                    setShowAddDonationModal(true);
                  }}
                  className="px-4 py-2.5 rounded-xl bg-[#A84A20] hover:bg-[#c15a2a] text-white font-bold text-xs transition-all shadow-md flex items-center gap-2"
                >
                  <Plus size={15} />
                  <span>+ नवीन देणगी जोडा (Manual Entry)</span>
                </button>
              </div>
            </div>

            {/* Metrics & Statistics Cards */}
            {(() => {
              const all = donationsList || [];
              const pendingCount = all.filter(d => (d.verification_status || 'pending') === 'pending').length;
              const approvedCount = all.filter(d => d.verification_status === 'approved' && d.is_published).length;
              const unpubCount = all.filter(d => d.verification_status === 'approved' && !d.is_published).length;
              const rejectedCount = all.filter(d => d.verification_status === 'rejected').length;
              const totalAmount = all.reduce((sum, d) => sum + Number(d.donation_amount || d.amount || 0), 0);

              return (
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  <div className="bg-[#1a1f2e] p-4 rounded-2xl border border-amber-500/30">
                    <span className="text-[11px] text-amber-400 font-bold block mb-1">
                      🟡 प्रलंबित पडताळणी
                    </span>
                    <div className="font-serif text-2xl font-black text-amber-300">
                      {pendingCount}
                    </div>
                    <span className="text-[10px] text-white/40">पडताळणी बाकी नोंदी</span>
                  </div>

                  <div className="bg-[#1a1f2e] p-4 rounded-2xl border border-emerald-500/30">
                    <span className="text-[11px] text-emerald-400 font-bold block mb-1">
                      🟢 मंजूर व प्रकाशित
                    </span>
                    <div className="font-serif text-2xl font-black text-emerald-300">
                      {approvedCount}
                    </div>
                    <span className="text-[10px] text-white/40">संकेतस्थळावर थेट दृश्यमान</span>
                  </div>

                  <div className="bg-[#1a1f2e] p-4 rounded-2xl border border-white/10">
                    <span className="text-[11px] text-white/60 font-bold block mb-1">
                      ⚪ अप्रकाशित (Hidden)
                    </span>
                    <div className="font-serif text-2xl font-black text-white/80">
                      {unpubCount}
                    </div>
                    <span className="text-[10px] text-white/40">संकेतस्थळावर लपवलेले</span>
                  </div>

                  <div className="bg-[#1a1f2e] p-4 rounded-2xl border border-red-500/30">
                    <span className="text-[11px] text-red-400 font-bold block mb-1">
                      🔴 नाकारलेले
                    </span>
                    <div className="font-serif text-2xl font-black text-red-300">
                      {rejectedCount}
                    </div>
                    <span className="text-[10px] text-white/40">अवैध / नाकारलेली देणगी</span>
                  </div>

                  <div className="bg-[#1a1f2e] p-4 rounded-2xl border border-[#D4A955]/30 col-span-2 sm:col-span-1">
                    <span className="text-[11px] text-[#D4A955] font-bold block mb-1">
                      💰 एकूण देणगी निधी
                    </span>
                    <div className="font-serif text-xl sm:text-2xl font-black text-[#D4A955]">
                      ₹{totalAmount.toLocaleString('en-IN')}
                    </div>
                    <span className="text-[10px] text-white/40">एकूण {all.length} व्यवहारांतून</span>
                  </div>
                </div>
              );
            })()}

            {/* Filter Tabs & Search Bar */}
            <div className="bg-[#1a1f2e] rounded-2xl p-4 border border-white/10 space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-3">
                {/* Filter Pills */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
                  {[
                    { id: 'all', label: 'सर्व देणग्या', count: donationsList.length },
                    {
                      id: 'pending',
                      label: '🟡 प्रलंबित पडताळणी',
                      count: donationsList.filter(d => (d.verification_status || 'pending') === 'pending').length,
                    },
                    {
                      id: 'approved',
                      label: '🟢 मंजूर व प्रकाशित',
                      count: donationsList.filter(d => d.verification_status === 'approved' && d.is_published).length,
                    },
                    {
                      id: 'unpublished',
                      label: '⚪ अप्रकाशित',
                      count: donationsList.filter(d => d.verification_status === 'approved' && !d.is_published).length,
                    },
                    {
                      id: 'rejected',
                      label: '🔴 नाकारलेले',
                      count: donationsList.filter(d => d.verification_status === 'rejected').length,
                    },
                  ].map(f => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => setDonationFilterStatus(f.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                        donationFilterStatus === f.id
                          ? 'bg-[#A84A20] text-white shadow-sm'
                          : 'bg-white/5 hover:bg-white/10 text-white/60'
                      }`}
                    >
                      <span>{f.label}</span>
                      <span className="px-1.5 py-0.2 rounded-full bg-black/30 text-[10px]">
                        {f.count}
                      </span>
                    </button>
                  ))}
                </div>

                {/* Search Box */}
                <div className="relative min-w-[240px] flex-1 sm:flex-initial">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                  <input
                    type="text"
                    value={donationSearch}
                    onChange={e => setDonationSearch(e.target.value)}
                    placeholder="शोध: नाव, उद्देश, फोन, UTR..."
                    className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-white/5 border border-white/15 text-xs text-white placeholder-white/40 focus:border-[#D4A955] focus:outline-none"
                  />
                  {donationSearch && (
                    <button
                      type="button"
                      onClick={() => setDonationSearch('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-white/40 hover:text-white"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Donations Table */}
            <div className="bg-[#1a1f2e] rounded-2xl border border-white/10 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-white/10 text-white/40 uppercase bg-white/[0.02]">
                    <tr>
                      <th className="py-3.5 px-4">देणगीदार</th>
                      <th className="py-3.5 px-4">रक्कम व माध्यम</th>
                      <th className="py-3.5 px-4">दिनांक व उद्देश</th>
                      <th className="py-3.5 px-4">पडताळणी स्थिती</th>
                      <th className="py-3.5 px-4">वेबसाइट प्रकाशन</th>
                      <th className="py-3.5 px-4">गोपनीयता</th>
                      <th className="py-3.5 px-4 text-right">प्रशासकीय कृती</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {(() => {
                      const filtered = (donationsList || []).filter(d => {
                        const status = (d.verification_status || 'pending').toLowerCase();
                        if (donationFilterStatus === 'pending' && status !== 'pending') return false;
                        if (donationFilterStatus === 'approved' && (status !== 'approved' || !d.is_published)) return false;
                        if (donationFilterStatus === 'unpublished' && (status !== 'approved' || d.is_published)) return false;
                        if (donationFilterStatus === 'rejected' && status !== 'rejected') return false;

                        if (!donationSearch.trim()) return true;
                        const term = donationSearch.toLowerCase();
                        return (
                          (d.donor_name || '').toLowerCase().includes(term) ||
                          (d.purpose || d.project_name || '').toLowerCase().includes(term) ||
                          (d.phone_private || d.phone || '').toLowerCase().includes(term) ||
                          (d.transaction_reference || d.transaction_ref || '').toLowerCase().includes(term) ||
                          (d.admin_remarks || '').toLowerCase().includes(term)
                        );
                      });

                      if (filtered.length === 0) {
                        return (
                          <tr>
                            <td colSpan={7} className="py-12 text-center text-white/40">
                              <HandCoins size={36} className="mx-auto mb-2 opacity-30" />
                              <p className="font-semibold text-sm">कोणतीही देणगी नोंद सापडली नाही.</p>
                              <p className="text-[11px] mt-1 text-white/30">
                                {donationSearch
                                  ? 'शोध निकष बदलून पुन्हा प्रयत्न करा.'
                                  : 'नवीन देणगी नोंदवण्यासाठी वरील "+ नवीन देणगी जोडा" बटण वापरा.'}
                              </p>
                            </td>
                          </tr>
                        );
                      }

                      return filtered.map(d => {
                        const isPending = (d.verification_status || 'pending') === 'pending';
                        const isApproved = d.verification_status === 'approved';
                        const isRejected = d.verification_status === 'rejected';

                        return (
                          <tr
                            key={d.id}
                            className={`hover:bg-white/[0.03] transition-colors ${
                              isPending ? 'bg-amber-500/[0.04]' : ''
                            }`}
                          >
                            {/* Donor Name & Contact */}
                            <td className="py-3.5 px-4">
                              <div className="font-bold text-white text-sm flex items-center gap-1.5">
                                <span>{d.donor_name}</span>
                              </div>
                              <div className="text-[11px] text-white/40 mt-0.5 space-x-1.5 font-mono">
                                {(d.phone_private || d.phone) && (
                                  <span>📞 {d.phone_private || d.phone}</span>
                                )}
                                {(d.email_private || d.email) && (
                                  <span>✉️ {d.email_private || d.email}</span>
                                )}
                              </div>
                              {d.admin_remarks && (
                                <div className="text-[10px] text-amber-300/80 mt-1 italic line-clamp-1">
                                  📝 {d.admin_remarks}
                                </div>
                              )}
                            </td>

                            {/* Amount & Mode */}
                            <td className="py-3.5 px-4">
                              <div className="font-serif font-black text-base text-[#D4A955]">
                                ₹{Number(d.donation_amount || d.amount || 0).toLocaleString('en-IN')}
                              </div>
                              <div className="text-[10px] text-white/40">
                                {d.payment_method || 'UPI'}
                                {(d.transaction_reference || d.transaction_ref) && (
                                  <span className="block font-mono text-[9px] text-white/30 truncate max-w-[120px]">
                                    Ref: {d.transaction_reference || d.transaction_ref}
                                  </span>
                                )}
                              </div>
                            </td>

                            {/* Date & Purpose */}
                            <td className="py-3.5 px-4">
                              <div className="text-white/80 font-medium">
                                {d.purpose || d.project_name || 'सामान्य संवर्धन निधी'}
                              </div>
                              <div className="text-[10px] text-white/40 mt-0.5">
                                📅 {d.donation_date || (d.created_at ? d.created_at.slice(0, 10) : '')}
                              </div>
                            </td>

                            {/* Verification Status */}
                            <td className="py-3.5 px-4">
                              {isPending && (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[10px] font-bold">
                                  🟡 प्रलंबित (Pending)
                                </span>
                              )}
                              {isApproved && (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[10px] font-bold">
                                  🟢 मंजूर (Approved)
                                </span>
                              )}
                              {isRejected && (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-500/15 border border-red-500/30 text-red-300 text-[10px] font-bold">
                                  🔴 नाकारलेले (Rejected)
                                </span>
                              )}
                            </td>

                            {/* Publish Status */}
                            <td className="py-3.5 px-4">
                              {d.is_published ? (
                                <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 font-semibold">
                                  <Eye size={13} />
                                  <span>प्रकाशित (Live)</span>
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-[11px] text-white/40 font-semibold">
                                  <EyeOff size={13} />
                                  <span>अप्रकाशित (Hidden)</span>
                                </span>
                              )}
                            </td>

                            {/* Privacy Flags */}
                            <td className="py-3.5 px-4 text-[10px] space-y-0.5">
                              <div className={d.display_name_public ? 'text-emerald-400' : 'text-amber-400'}>
                                {d.display_name_public ? '✓ नाव सार्वजनिक' : '✕ नाव खाजगी'}
                              </div>
                              <div className={d.display_amount_public ? 'text-emerald-400' : 'text-white/40'}>
                                {d.display_amount_public ? '✓ रक्कम सार्वजनिक' : '✕ रक्कम खाजगी'}
                              </div>
                            </td>

                            {/* Actions */}
                            <td className="py-3.5 px-4 text-right">
                              <div className="flex items-center justify-end gap-1.5 flex-wrap">
                                {isPending && (
                                  <>
                                    <button
                                      type="button"
                                      onClick={() => handleQuickApproveDonation(d.id, d.donor_name)}
                                      className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] flex items-center gap-1 transition-colors"
                                      title="मंजूर व प्रकाशित करा"
                                    >
                                      <Check size={12} /> मंजूर
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleQuickRejectDonation(d.id, d.donor_name)}
                                      className="px-2.5 py-1 rounded-lg bg-red-600/30 hover:bg-red-600/50 text-red-300 font-bold text-[10px] flex items-center gap-1 transition-colors"
                                      title="नाकारा"
                                    >
                                      <Ban size={12} /> नाकारा
                                    </button>
                                  </>
                                )}

                                {isApproved && (
                                  <button
                                    type="button"
                                    onClick={() => handleQuickTogglePublishDonation(d)}
                                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-colors ${
                                      d.is_published
                                        ? 'bg-white/10 hover:bg-white/20 text-white/70'
                                        : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                                    }`}
                                    title={d.is_published ? 'वेबसाइटवरून अप्रकाशित करा' : 'वेबसाइटवर प्रकाशित करा'}
                                  >
                                    {d.is_published ? <EyeOff size={12} /> : <Eye size={12} />}
                                    <span>{d.is_published ? 'लपवा' : 'प्रकाशित करा'}</span>
                                  </button>
                                )}

                                <button
                                  type="button"
                                  onClick={() => handleOpenVerifyModal(d)}
                                  className="px-2.5 py-1 rounded-lg bg-[#D4A955]/20 hover:bg-[#D4A955]/30 text-[#D4A955] font-bold text-[10px] flex items-center gap-1 transition-colors"
                                  title="पडताळणी व तपशील संपादित करा"
                                >
                                  <Edit3 size={12} /> पडताळणी / संपादन
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleDeleteDonationRecord(d.id, d.donor_name)}
                                  className="p-1 rounded-lg bg-red-500/10 hover:bg-red-500/25 text-red-400"
                                  title="नोंद हटवा"
                                >
                                  <Trash2 size={13} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      });
                    })()}
                  </tbody>
                </table>
              </div>
            </div>

            {/* ========================================================================= */}
            {/* VERIFY & EDIT DONATION MODAL                                              */}
            {/* ========================================================================= */}
            {showVerifyModal && selectedDonation && (
              <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
                <div className="bg-[#1a1f2e] border border-white/20 rounded-3xl p-6 sm:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl space-y-6">
                  {/* Modal Header */}
                  <div className="flex items-center justify-between border-b border-white/10 pb-4">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-[#D4A955] font-cinzel tracking-wider">
                        प्रशासकीय पडताळणी
                      </span>
                      <h3 className="font-serif text-xl font-bold text-white mt-0.5">
                        ✏️ देणगीदार पडताळणी व तपशील संपादन
                      </h3>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setShowVerifyModal(false);
                        setSelectedDonation(null);
                      }}
                      className="text-white/50 hover:text-white p-2 rounded-xl hover:bg-white/10 text-sm"
                    >
                      ✕
                    </button>
                  </div>

                  <form onSubmit={handleSaveVerifyDonation} className="space-y-5">
                    {/* Donor Name (Editable) */}
                    <div>
                      <label className="block text-xs font-semibold text-white/70 mb-1">
                        देणगीदाराचे नाव (Donor Full Name) *
                      </label>
                      <input
                        type="text"
                        required
                        value={editDonationForm.donorName}
                        onChange={e => setEditDonationForm({ ...editDonationForm, donorName: e.target.value })}
                        placeholder="उदा. श्री. अमोल पाटील"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/15 text-white text-sm focus:border-[#D4A955] focus:outline-none font-semibold"
                      />
                      <span className="text-[10px] text-white/40 mt-1 block">
                        टीप: आवश्यकतेनुसार प्रशासक दात्याच्या नावाची दुरुस्ती करू शकतात.
                      </span>
                    </div>

                    {/* Amount, Date, Purpose */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-white/70 mb-1">
                          देणगी रक्कम (₹) *
                        </label>
                        <input
                          type="number"
                          required
                          min={1}
                          value={editDonationForm.amount}
                          onChange={e => setEditDonationForm({ ...editDonationForm, amount: Number(e.target.value) })}
                          className="w-full px-3.5 py-2 rounded-xl bg-white/5 border border-white/15 text-[#D4A955] font-bold text-sm focus:border-[#D4A955] focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-white/70 mb-1">
                          देणगी दिनांक
                        </label>
                        <input
                          type="date"
                          value={editDonationForm.donationDate}
                          onChange={e => setEditDonationForm({ ...editDonationForm, donationDate: e.target.value })}
                          className="w-full px-3.5 py-2 rounded-xl bg-white/5 border border-white/15 text-white text-xs focus:border-[#D4A955] focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-white/70 mb-1">
                          पेमेंट पद्धत
                        </label>
                        <input
                          type="text"
                          value={editDonationForm.paymentMethod}
                          onChange={e => setEditDonationForm({ ...editDonationForm, paymentMethod: e.target.value })}
                          placeholder="PhonePe UPI / NEFT"
                          className="w-full px-3.5 py-2 rounded-xl bg-white/5 border border-white/15 text-white text-xs focus:border-[#D4A955] focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* Purpose / Project */}
                    <div>
                      <label className="block text-xs font-semibold text-white/70 mb-1">
                        देणगी उद्देश / प्रकल्प
                      </label>
                      <input
                        type="text"
                        value={editDonationForm.purpose}
                        onChange={e => setEditDonationForm({ ...editDonationForm, purpose: e.target.value })}
                        placeholder="उदा. सामान्य संवर्धन निधी / रायगड स्वच्छता"
                        className="w-full px-3.5 py-2 rounded-xl bg-white/5 border border-white/15 text-white text-xs focus:border-[#D4A955] focus:outline-none"
                      />
                    </div>

                    {/* 🔒 PRIVATE INFORMATION BOX */}
                    <div className="bg-black/30 rounded-2xl p-4 border border-amber-500/30 space-y-3">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300">
                        <Lock size={14} />
                        <span>🔒 खाजगी संपर्क व व्यवहार माहिती (वेबसाइटवर कधीही दाखवली जाणार नाही)</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        <div>
                          <label className="block text-[11px] text-white/60 mb-1">
                            मोबाईल क्रमांक (Private Phone)
                          </label>
                          <input
                            type="tel"
                            value={editDonationForm.phonePrivate}
                            onChange={e => setEditDonationForm({ ...editDonationForm, phonePrivate: e.target.value })}
                            placeholder="९८७६५४३२१०"
                            className="w-full px-3 py-1.5 rounded-xl bg-white/5 border border-white/15 text-white font-mono text-xs"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] text-white/60 mb-1">
                            ईमेल आयडी (Private Email)
                          </label>
                          <input
                            type="email"
                            value={editDonationForm.emailPrivate}
                            onChange={e => setEditDonationForm({ ...editDonationForm, emailPrivate: e.target.value })}
                            placeholder="donor@example.com"
                            className="w-full px-3 py-1.5 rounded-xl bg-white/5 border border-white/15 text-white text-xs"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] text-white/60 mb-1">
                          पेमेंट ट्रान्झॅक्शन / UTR संदर्भ क्रमांक (Private Reference)
                        </label>
                        <input
                          type="text"
                          value={editDonationForm.transactionRef}
                          onChange={e => setEditDonationForm({ ...editDonationForm, transactionRef: e.target.value })}
                          placeholder="उदा. UPI123456789 किंवा बँक UTR"
                          className="w-full px-3 py-1.5 rounded-xl bg-white/5 border border-white/15 text-white font-mono text-xs"
                        />
                      </div>
                    </div>

                    {/* 🛡️ PRIVACY & PUBLIC DISPLAY CONTROLS */}
                    <div className="bg-white/5 rounded-2xl p-4 border border-white/10 space-y-3">
                      <span className="text-xs font-bold text-[#D4A955] block">
                        🛡️ गोपनीयता व सार्वजनिक प्रदर्शन पर्याय (Privacy Settings)
                      </span>

                      {/* Toggle 1: Display Name Publicly */}
                      <label className="flex items-start gap-3 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={editDonationForm.displayNamePublic}
                          onChange={e => setEditDonationForm({ ...editDonationForm, displayNamePublic: e.target.checked })}
                          className="mt-1 w-4 h-4 rounded text-[#A84A20] focus:ring-0"
                        />
                        <div>
                          <div className="text-xs font-bold text-white">
                            ☑ देणगीदाराचे नाव सार्वजनिक संकेतस्थळावर दाखवा (Display Donor Name Publicly)
                          </div>
                          <div className="text-[11px] text-white/50">
                            अनचेक केल्यास देणगीची नोंद सिस्टीममध्ये राहील, पण दात्याचे नाव वेबसाइटवर कधीही दिसणार नाही.
                          </div>
                        </div>
                      </label>

                      {/* Toggle 2: Display Amount Publicly (Default OFF) */}
                      <label className="flex items-start gap-3 cursor-pointer select-none pt-2 border-t border-white/10">
                        <input
                          type="checkbox"
                          checked={editDonationForm.displayAmountPublic}
                          onChange={e => setEditDonationForm({ ...editDonationForm, displayAmountPublic: e.target.checked })}
                          className="mt-1 w-4 h-4 rounded text-[#A84A20] focus:ring-0"
                        />
                        <div>
                          <div className="text-xs font-bold text-white">
                            ☐ देणगी रक्कम सार्वजनिक दाखवा (Display Donation Amount Publicly)
                          </div>
                          <div className="text-[11px] text-white/50">
                            डीफॉल्टपणे बंद (OFF). चेक केल्यास देणगीदाराच्या कार्डावर योगदान रक्कम दिसेल.
                          </div>
                        </div>
                      </label>
                    </div>

                    {/* Verification Status & Publish Options */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-white/70 mb-1">
                          पडताळणी स्थिती (Verification Status)
                        </label>
                        <select
                          value={editDonationForm.verificationStatus}
                          onChange={e => setEditDonationForm({ ...editDonationForm, verificationStatus: e.target.value })}
                          className="w-full px-3.5 py-2 rounded-xl bg-[#0f1117] border border-white/15 text-white text-xs font-bold"
                        >
                          <option value="pending">🟡 प्रलंबित पडताळणी (Pending)</option>
                          <option value="approved">🟢 मंजूर (Approved)</option>
                          <option value="rejected">🔴 नाकारलेले (Rejected)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-white/70 mb-1">
                          संकेतस्थळावर प्रकाशन (Publish Status)
                        </label>
                        <select
                          value={editDonationForm.isPublished ? 'true' : 'false'}
                          onChange={e => setEditDonationForm({ ...editDonationForm, isPublished: e.target.value === 'true' })}
                          className="w-full px-3.5 py-2 rounded-xl bg-[#0f1117] border border-white/15 text-white text-xs font-bold"
                        >
                          <option value="true">🟢 प्रकाशित (Published)</option>
                          <option value="false">⚪ अप्रकाशित (Hidden)</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
                      <button
                        type="button"
                        onClick={() => setShowEditModal(false)}
                        className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-white/80"
                      >
                        रद्द करा
                      </button>
                      <button
                        type="submit"
                        className="px-5 py-2 rounded-xl bg-[#A84A20] hover:bg-[#c15a2a] text-xs font-bold text-white flex items-center gap-1.5 shadow-lg"
                      >
                        <Save size={14} /> बदल जतन करा
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* DINVISHESH MANAGEMENT TAB */}
        {activeTab === 'dinvishesh' && (
          <div className="space-y-6">
            {/* Header & Quick Action */}
            <div className="flex items-center justify-between flex-wrap gap-4 bg-[#1a1f2e] p-6 rounded-3xl border border-white/10 shadow-xl">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#D4A955] bg-[#D4A955]/10 px-2.5 py-1 rounded-full border border-[#D4A955]/20">
                    ऐतिहासिक कॅलेंडर व प्रसंग नियंत्रण
                  </span>
                </div>
                <h3 className="font-serif text-2xl font-bold text-white mt-1.5 flex items-center gap-2.5">
                  <CalendarDays className="text-[#D4A955]" size={26} />
                  <span>शिवसाम्राज्याचे दिनविशेष व्यवस्थापन</span>
                </h3>
                <p className="text-xs text-white/60 mt-1 max-w-2xl leading-relaxed">
                  छत्रपती शिवाजी महाराज व छत्रपती संभाजी महाराज यांच्या ३६५ दिवसांतील पराक्रम, लढाया, राज्याभिषेक व ऐतिहासिक प्रसंगांची नोंद, संपादन व प्रकाशन नियंत्रण येथून करा.
                </p>
              </div>

              <div className="flex items-center gap-2.5 flex-wrap">
                <button
                  type="button"
                  onClick={() => {
                    setEditingDinId(null);
                    setDinForm({
                      day: new Date().getDate(),
                      month: new Date().getMonth() + 1,
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
                    const el = document.getElementById('dinvishesh-editor-form');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="px-4 py-2.5 rounded-xl bg-[#A84A20] hover:bg-[#c15a2a] text-xs font-bold text-white transition-all flex items-center gap-1.5 shadow-lg shadow-[#A84A20]/20"
                >
                  <Plus size={15} /> नवीन ऐतिहासिक प्रसंग जोडा
                </button>

                <button
                  type="button"
                  onClick={() => setShowDinPreview(!showDinPreview)}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 border ${
                    showDinPreview
                      ? 'bg-[#D4A955]/20 text-[#D4A955] border-[#D4A955]/40'
                      : 'bg-white/5 hover:bg-white/10 text-white/80 border-white/15'
                  }`}
                >
                  {showDinPreview ? <EyeOff size={15} /> : <Eye size={15} />}
                  <span>{showDinPreview ? 'फॉर्म पहा' : 'कार्डाचे थेट पूर्वदृश्य'}</span>
                </button>
              </div>
            </div>

            {/* Statistics Counters Banner */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {[
                {
                  label: 'एकूण ऐतिहासिक घटना',
                  val: dinvisheshList.length,
                  icon: '🚩',
                  color: 'text-[#D4A955]',
                  bg: 'bg-[#1a1f2e]',
                },
                {
                  label: 'वेबसाइटवर प्रकाशित',
                  val: dinvisheshList.filter(d => d.is_published).length,
                  icon: '🟢',
                  color: 'text-emerald-400',
                  bg: 'bg-[#1a1f2e]',
                },
                {
                  label: 'अप्रकाशित / राखीव',
                  val: dinvisheshList.filter(d => !d.is_published).length,
                  icon: '⚪',
                  color: 'text-amber-400',
                  bg: 'bg-[#1a1f2e]',
                },
                {
                  label: 'शिवछत्रपती प्रसंग',
                  val: dinvisheshList.filter(d => (d.personality || d.figure || '').includes('शिवाजी')).length,
                  icon: '👑',
                  color: 'text-[#F4956A]',
                  bg: 'bg-[#1a1f2e]',
                },
                {
                  label: 'संभाजी महाराज प्रसंग',
                  val: dinvisheshList.filter(d => (d.personality || d.figure || '').includes('संभाजी')).length,
                  icon: '🗡️',
                  color: 'text-[#E8D5A3]',
                  bg: 'bg-[#1a1f2e]',
                },
                {
                  label: 'चालू महिना प्रसंग',
                  val: dinvisheshList.filter(d => d.month === (new Date().getMonth() + 1)).length,
                  icon: '📅',
                  color: 'text-[#6DC87A]',
                  bg: 'bg-[#1a1f2e]',
                },
              ].map(k => (
                <div
                  key={k.label}
                  className={`${k.bg} rounded-2xl p-4 border border-white/10 flex flex-col justify-between`}
                >
                  <div className="flex items-center justify-between text-xs text-white/50 mb-1">
                    <span>{k.label}</span>
                    <span className="text-sm">{k.icon}</span>
                  </div>
                  <div className={`text-2xl font-black ${k.color}`}>{k.val}</div>
                </div>
              ))}
            </div>

            {/* Live Card Preview */}
            {showDinPreview && (
              <div className="p-6 bg-[#16120b] text-[#f4ecd8] rounded-3xl border-2 border-[#D4A955]/40 space-y-4 shadow-2xl">
                <div className="text-xs font-bold text-[#D4A955] uppercase tracking-wider flex items-center gap-2">
                  <Sparkles size={16} /> थेट कार्ड पूर्वदृश्य (Live Website Card Preview)
                </div>
                <div className="bg-[#20180f] p-6 rounded-2xl border border-[#D4A955]/20 shadow-xl space-y-3 max-w-2xl mx-auto">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 bg-[#A84A20] text-white text-xs font-bold rounded-full shadow-sm">
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
                    <div className="text-xs text-amber-200/80 flex items-center gap-1">
                      <MapPin size={13} /> स्थान: {dinForm.location}
                    </div>
                  )}

                  {dinForm.image && (
                    <img
                      src={dinForm.image}
                      alt="Preview"
                      className="w-full h-56 object-cover rounded-xl border border-white/10 shadow-md"
                    />
                  )}

                  <p className="text-xs sm:text-sm text-stone-300 leading-relaxed font-sans">
                    {dinForm.descriptionMarathi || 'सविस्तर ऐतिहासिक वर्णन येथे दिसेल...'}
                  </p>

                  {dinForm.historicalSignificance && (
                    <div className="p-3.5 rounded-xl bg-amber-950/40 border border-amber-500/20 text-xs text-amber-200">
                      <strong>🚩 ऐतिहासिक महत्त्व:</strong> {dinForm.historicalSignificance}
                    </div>
                  )}

                  {dinForm.isDisputed && (
                    <div className="p-3.5 rounded-xl bg-red-950/30 border border-red-500/30 text-xs text-red-200">
                      ⚠️ <strong>ऐतिहासिक नोंद:</strong> या घटनेच्या तारखेबाबत विविध ऐतिहासिक स्रोतांमध्ये मतभेद आढळतात.
                      {dinForm.disputeNote && ` (${dinForm.disputeNote})`}
                    </div>
                  )}

                  <div className="text-xs text-stone-400 bg-black/40 p-3 rounded-xl border border-white/10 flex items-center justify-between flex-wrap gap-2">
                    <div>
                      📚 <strong>मुख्य स्रोत:</strong> {dinForm.sourceName || 'नोंदवलेला नाही'} ({dinForm.sourceType})
                      {dinForm.sources && ` | संदर्भ: ${dinForm.sources}`}
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        dinForm.verificationStatus === 'verified'
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : 'bg-amber-500/20 text-amber-300'
                      }`}
                    >
                      {dinForm.verificationStatus === 'verified' ? '✅ प्रमाणित' : '⏳ तपासणी बाकी'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Event Form (Add & Edit) */}
            <form
              id="dinvishesh-editor-form"
              onSubmit={handleSaveDinvishesh}
              className="bg-[#1a1f2e] rounded-3xl p-6 sm:p-8 border border-white/10 space-y-6 shadow-xl"
            >
              <div className="flex items-center justify-between pb-4 border-b border-white/10 flex-wrap gap-3">
                <div className="flex items-center gap-2.5">
                  <span className="p-2 rounded-xl bg-[#A84A20]/20 text-[#D4A955]">
                    {editingDinId ? <Edit3 size={18} /> : <Plus size={18} />}
                  </span>
                  <div>
                    <h4 className="font-serif text-lg font-bold text-white">
                      {editingDinId ? 'ऐतिहासिक प्रसंग संपादन (Edit Event)' : 'नवीन ऐतिहासिक प्रसंग जोडा (Add Event)'}
                    </h4>
                    <p className="text-[11px] text-white/50">
                      {editingDinId
                        ? `आयडी: #${editingDinId} मधील तपशील दुरुस्त करत आहात`
                        : 'कॅलेंडरमधील विशिष्ट तारखेसाठी नवीन ऐतिहासिक नोंद जोडा'}
                    </p>
                  </div>
                </div>

                {editingDinId && (
                  <span className="px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-semibold">
                    ✏️ संपादन मोड सक्रिय
                  </span>
                )}
              </div>

              {/* Date & Core Metadata */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs text-white/70 mb-1.5 font-semibold">
                    दिवस (Day 1-31) <span className="text-[#F4956A]">*</span>
                  </label>
                  <select
                    value={dinForm.day}
                    onChange={e => setDinForm({ ...dinForm, day: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/15 text-white text-xs font-semibold focus:border-[#D4A955] focus:outline-none"
                  >
                    {Array.from({ length: 31 }, (_, i) => i + 1).map(d => (
                      <option key={d} value={d} className="bg-[#1a1f2e]">
                        तारीख {d}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-white/70 mb-1.5 font-semibold">
                    महिना (Month 1-12) <span className="text-[#F4956A]">*</span>
                  </label>
                  <select
                    value={dinForm.month}
                    onChange={e => setDinForm({ ...dinForm, month: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/15 text-white text-xs font-semibold focus:border-[#D4A955] focus:outline-none"
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
                  <label className="block text-xs text-white/70 mb-1.5 font-semibold">
                    ऐतिहासिक वर्ष (ई.स.)
                  </label>
                  <input
                    type="number"
                    placeholder="उदा. 1674 किंवा 1680"
                    value={dinForm.year}
                    onChange={e =>
                      setDinForm({
                        ...dinForm,
                        year: e.target.value === '' ? '' : Number(e.target.value),
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/15 text-white text-xs font-semibold focus:border-[#D4A955] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs text-white/70 mb-1.5 font-semibold">
                    संबंधित महापुरुष <span className="text-[#F4956A]">*</span>
                  </label>
                  <select
                    value={dinForm.personality}
                    onChange={e => setDinForm({ ...dinForm, personality: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/15 text-white text-xs font-semibold focus:border-[#D4A955] focus:outline-none"
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

              {/* Category, Location, Key Figures */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs text-white/70 mb-1.5 font-semibold">
                    घटनेचा प्रकार (Event Category) <span className="text-[#F4956A]">*</span>
                  </label>
                  <select
                    value={dinForm.eventType}
                    onChange={e => setDinForm({ ...dinForm, eventType: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/15 text-white text-xs focus:border-[#D4A955] focus:outline-none"
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
                  <label className="block text-xs text-white/70 mb-1.5 font-semibold">
                    स्थान / किल्ला (Location)
                  </label>
                  <input
                    type="text"
                    placeholder="उदा. किल्ले रायगड, आग्रा, सुरत, सिंहगड..."
                    value={dinForm.location}
                    onChange={e => setDinForm({ ...dinForm, location: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/15 text-white text-xs focus:border-[#D4A955] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs text-white/70 mb-1.5 font-semibold">
                    महत्त्वाच्या व्यक्ती (Key Figures - स्वल्पविरामाने वेगळे करा)
                  </label>
                  <input
                    type="text"
                    placeholder="उदा. तानाजी मालुसरे, येसाजी कंक, मोरोपंत पिंगळे..."
                    value={dinForm.keyFiguresStr}
                    onChange={e => setDinForm({ ...dinForm, keyFiguresStr: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/15 text-white text-xs focus:border-[#D4A955] focus:outline-none"
                  />
                </div>
              </div>

              {/* Titles in Marathi & English */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-white/70 mb-1.5 font-semibold">
                    घटनेचे शीर्षक (मराठी) <span className="text-[#F4956A]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="उदा. छत्रपती शिवाजी महाराज यांचा शिवराज्याभिषेक सोहळा"
                    value={dinForm.titleMarathi}
                    onChange={e => setDinForm({ ...dinForm, titleMarathi: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/15 text-white text-xs font-semibold focus:border-[#D4A955] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs text-white/70 mb-1.5 font-semibold">
                    Event Title (English)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Grand Coronation of Chhatrapati Shivaji Maharaj at Raigad"
                    value={dinForm.titleEnglish}
                    onChange={e => setDinForm({ ...dinForm, titleEnglish: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/15 text-white text-xs focus:border-[#D4A955] focus:outline-none"
                  />
                </div>
              </div>

              {/* Descriptions in Marathi & English */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-white/70 mb-1.5 font-semibold">
                    सविस्तर ऐतिहासिक वर्णन (मराठी) <span className="text-[#F4956A]">*</span>
                  </label>
                  <textarea
                    rows={4}
                    required
                    placeholder="घटनेचा सविस्तर इतिहास, प्रसंग व पार्श्वभूमी सविस्तर लिहा..."
                    value={dinForm.descriptionMarathi}
                    onChange={e => setDinForm({ ...dinForm, descriptionMarathi: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/15 text-white text-xs leading-relaxed focus:border-[#D4A955] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs text-white/70 mb-1.5 font-semibold">
                    Detailed Description (English)
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Detailed historical context and summary in English..."
                    value={dinForm.descriptionEnglish}
                    onChange={e => setDinForm({ ...dinForm, descriptionEnglish: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/15 text-white text-xs leading-relaxed focus:border-[#D4A955] focus:outline-none"
                  />
                </div>
              </div>

              {/* Historical Significance */}
              <div>
                <label className="block text-xs text-white/70 mb-1.5 font-semibold">
                  ऐतिहासिक महत्त्व व परिणाम (Historical Significance & Legacy)
                </label>
                <textarea
                  rows={2}
                  placeholder="उदा. स्वतंत्र सार्वभौम मराठा स्वराज्य निर्मितीस जागतिक मान्यता मिळाली..."
                  value={dinForm.historicalSignificance}
                  onChange={e => setDinForm({ ...dinForm, historicalSignificance: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-white/5 border border-white/15 text-white text-xs leading-relaxed focus:border-[#D4A955] focus:outline-none"
                />
              </div>

              {/* Image Upload */}
              <ImageUploadField
                label="ऐतिहासिक चित्र / छायाचित्र (Historical Image Upload)"
                folder="dinvishesh"
                value={dinForm.image}
                onChange={url => setDinForm({ ...dinForm, image: url })}
              />

              {/* Historical Source & Verification System */}
              <div className="p-5 rounded-2xl bg-white/[0.03] border border-[#D4A955]/30 space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-2 pb-2 border-b border-white/10">
                  <h5 className="text-xs font-bold text-[#D4A955] uppercase tracking-wider flex items-center gap-2">
                    📜 ऐतिहासिक संदर्भ व प्रमाण प्रणाली (Historical Sources & Verification)
                  </h5>
                  <span className="text-[10px] text-white/40">प्रमाणित माहिती स्रोत नोंदवणे आवश्यक</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs text-white/70 mb-1.5 font-semibold">
                      मुख्य ऐतिहासिक स्रोत नाव (Source Name) <span className="text-[#F4956A]">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="उदा. सभासद बखर / जेधे शकावली / आज्ञापत्र"
                      value={dinForm.sourceName}
                      onChange={e => setDinForm({ ...dinForm, sourceName: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl bg-white/5 border border-white/15 text-white text-xs focus:border-[#D4A955] focus:outline-none font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-white/70 mb-1.5 font-semibold">
                      स्रोत प्रकार (Source Type)
                    </label>
                    <select
                      value={dinForm.sourceType}
                      onChange={e => setDinForm({ ...dinForm, sourceType: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/15 text-white text-xs focus:border-[#D4A955] focus:outline-none"
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
                    <label className="block text-xs text-white/70 mb-1.5 font-semibold">
                      पडताळणी स्थिती (Verification Status)
                    </label>
                    <select
                      value={dinForm.verificationStatus}
                      onChange={e => setDinForm({ ...dinForm, verificationStatus: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/15 text-white text-xs font-semibold focus:border-[#D4A955] focus:outline-none"
                    >
                      <option value="verified" className="bg-[#1a1f2e]">✅ प्रमाणित (Verified by Sources)</option>
                      <option value="under_review" className="bg-[#1a1f2e]">⏳ पुनरावलोकनाधीन (Under Review)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-white/70 mb-1.5 font-semibold">
                      स्रोत संदर्भ लिंक / URL (Source URL)
                    </label>
                    <input
                      type="url"
                      placeholder="https://archive.org/details/..."
                      value={dinForm.sourceUrl}
                      onChange={e => setDinForm({ ...dinForm, sourceUrl: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl bg-white/5 border border-white/15 text-white text-xs font-mono focus:border-[#D4A955] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-white/70 mb-1.5 font-semibold">
                      स्रोत संदर्भ तपशील (खंड, पृष्ठ क्र., संपादन)
                    </label>
                    <input
                      type="text"
                      placeholder="उदा. खंड १, पृष्ठ ४४-४८, संपादन: प्रा. सेतुमाधवराव पगडी"
                      value={dinForm.sourceDescription}
                      onChange={e => setDinForm({ ...dinForm, sourceDescription: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl bg-white/5 border border-white/15 text-white text-xs focus:border-[#D4A955] focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-white/70 mb-1.5 font-semibold">
                    अतिरिक्त संदर्भ यादी (Multiple References)
                  </label>
                  <input
                    type="text"
                    placeholder="उदा. ९१ कलमी बखर, इंग्रजी फॅक्टरी रेकॉर्ड्स, शिवभारत"
                    value={dinForm.sources}
                    onChange={e => setDinForm({ ...dinForm, sources: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-white/5 border border-white/15 text-white text-xs focus:border-[#D4A955] focus:outline-none"
                  />
                </div>

                {/* Disputed Date Toggle */}
                <div className="pt-3 border-t border-white/10 space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      id="din-disputed"
                      checked={dinForm.isDisputed}
                      onChange={e => setDinForm({ ...dinForm, isDisputed: e.target.checked })}
                      className="rounded bg-white/10 border-white/20 text-[#A84A20] focus:ring-0 w-4 h-4"
                    />
                    <span className="text-xs text-amber-300 font-semibold">
                      ⚠️ या घटनेच्या तारखेबाबत विविध ऐतिहासिक कागदपत्रांमध्ये मतभेद आहेत का? (Disputed Date)
                    </span>
                  </label>
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

              {/* Publish Toggle */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
                <label className="flex items-center gap-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    id="din-published"
                    checked={dinForm.isPublished}
                    onChange={e => setDinForm({ ...dinForm, isPublished: e.target.checked })}
                    className="rounded bg-white/10 border-white/20 text-[#A84A20] focus:ring-0 w-4 h-4"
                  />
                  <div>
                    <span className="text-xs text-white font-bold block">
                      वेबसाइटवर तात्काळ प्रकाशित करा (Publish Event Live on Website)
                    </span>
                    <span className="text-[10px] text-white/40">
                      ही खूण चालू ठेवल्यास ही ऐतिहासिक घटना दिनविशेष व होमपेज कॅलेंडरवर तत्काळ दिसेल.
                    </span>
                  </div>
                </label>
              </div>

              {/* Form Action Buttons */}
              <div className="flex items-center justify-between gap-3 pt-4 border-t border-white/10 flex-wrap">
                <div className="flex items-center gap-2">
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-[#A84A20] hover:bg-[#c15a2a] text-white font-bold text-xs flex items-center gap-2 shadow-lg transition-all"
                  >
                    <Save size={15} />
                    <span>{editingDinId ? 'बदल जतन करा (Save Changes)' : 'ऐतिहासिक घटना जोडा (Add Event)'}</span>
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
                      className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-white/80 transition-all"
                    >
                      रद्द करा
                    </button>
                  )}
                </div>
              </div>
            </form>

            {/* Comprehensive Search & Multi-Filter Control Panel */}
            <div className="bg-[#1a1f2e] p-5 rounded-3xl border border-white/10 space-y-4 shadow-lg">
              <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
                {/* Search Input */}
                <div className="relative flex-1">
                  <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
                  <input
                    type="text"
                    placeholder="शोध: शीर्षक, तारीख (उदा. 6/6), वर्ष, स्थान, स्रोत किंवा व्यक्ती..."
                    value={dinSearch}
                    onChange={e => setDinSearch(e.target.value)}
                    className="w-full pl-10 pr-8 py-2.5 rounded-xl bg-white/5 border border-white/15 text-xs text-white placeholder-white/40 focus:border-[#D4A955] focus:outline-none"
                  />
                  {dinSearch && (
                    <button
                      type="button"
                      onClick={() => setDinSearch('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-white/40 hover:text-white"
                    >
                      ✕
                    </button>
                  )}
                </div>

                {/* Quick Clear Filter Button */}
                {(dinSearch || dinFilterMonth !== 'all' || dinFilterFigure !== 'all' || dinFilterCategory !== 'all' || dinFilterStatus !== 'all' || dinFilterPublish !== 'all') && (
                  <button
                    type="button"
                    onClick={() => {
                      setDinSearch('');
                      setDinFilterMonth('all');
                      setDinFilterFigure('all');
                      setDinFilterCategory('all');
                      setDinFilterStatus('all');
                      setDinFilterPublish('all');
                    }}
                    className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-xs text-white/70 font-semibold flex items-center gap-1.5 shrink-0"
                  >
                    <X size={13} /> सर्व फिल्टर्स पूर्ववत करा
                  </button>
                )}
              </div>

              {/* Filter Dropdowns Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 pt-1 text-xs">
                {/* 1. Month Filter */}
                <div>
                  <label className="block text-[10px] text-white/50 mb-1 font-semibold">महिना निवडा:</label>
                  <select
                    value={dinFilterMonth}
                    onChange={e => setDinFilterMonth(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/15 text-xs text-white font-semibold focus:border-[#D4A955] focus:outline-none"
                  >
                    <option value="all" className="bg-[#1a1f2e]">सर्व महिने (All 12 Months)</option>
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

                {/* 2. Personality Filter */}
                <div>
                  <label className="block text-[10px] text-white/50 mb-1 font-semibold">महापुरुष:</label>
                  <select
                    value={dinFilterFigure}
                    onChange={e => setDinFilterFigure(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/15 text-xs text-white font-semibold focus:border-[#D4A955] focus:outline-none"
                  >
                    <option value="all" className="bg-[#1a1f2e]">सर्व महापुरुष</option>
                    <option value="छत्रपती शिवाजी महाराज" className="bg-[#1a1f2e]">छत्रपती शिवाजी महाराज</option>
                    <option value="छत्रपती संभाजी महाराज" className="bg-[#1a1f2e]">छत्रपती संभाजी महाराज</option>
                  </select>
                </div>

                {/* 3. Category Filter */}
                <div>
                  <label className="block text-[10px] text-white/50 mb-1 font-semibold">प्रकार (Category):</label>
                  <select
                    value={dinFilterCategory}
                    onChange={e => setDinFilterCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/15 text-xs text-white font-semibold focus:border-[#D4A955] focus:outline-none"
                  >
                    <option value="all" className="bg-[#1a1f2e]">सर्व प्रकार</option>
                    <option value="राज्याभिषेक" className="bg-[#1a1f2e]">राज्याभिषेक</option>
                    <option value="लढाई" className="bg-[#1a1f2e]">लढाई / पराक्रम</option>
                    <option value="तह" className="bg-[#1a1f2e]">मुत्सद्देगिरी / तह</option>
                    <option value="दुर्ग" className="bg-[#1a1f2e]">दुर्ग स्थापना / विजय</option>
                    <option value="जयंती" className="bg-[#1a1f2e]">जन्म / जयंती</option>
                    <option value="बलिदान" className="bg-[#1a1f2e]">बलिदान / पुण्यतिथी</option>
                    <option value="प्रशासन" className="bg-[#1a1f2e]">प्रशासन व न्याय</option>
                    <option value="आरमार" className="bg-[#1a1f2e]">आरमार व सागरी मोहीम</option>
                    <option value="इतर" className="bg-[#1a1f2e]">इतर</option>
                  </select>
                </div>

                {/* 4. Verification Status */}
                <div>
                  <label className="block text-[10px] text-white/50 mb-1 font-semibold">प्रमाण स्थिती:</label>
                  <select
                    value={dinFilterStatus}
                    onChange={e => setDinFilterStatus(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/15 text-xs text-white font-semibold focus:border-[#D4A955] focus:outline-none"
                  >
                    <option value="all" className="bg-[#1a1f2e]">सर्व स्थिती</option>
                    <option value="verified" className="bg-[#1a1f2e]">✅ प्रमाणित (Verified)</option>
                    <option value="under_review" className="bg-[#1a1f2e]">⏳ पुनरावलोकन (Under Review)</option>
                  </select>
                </div>

                {/* 5. Publication Status */}
                <div>
                  <label className="block text-[10px] text-white/50 mb-1 font-semibold">वेबसाइट प्रकाशन:</label>
                  <select
                    value={dinFilterPublish}
                    onChange={e => setDinFilterPublish(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/15 text-xs text-white font-semibold focus:border-[#D4A955] focus:outline-none"
                  >
                    <option value="all" className="bg-[#1a1f2e]">सर्व नोंदी (All)</option>
                    <option value="published" className="bg-[#1a1f2e]">🟢 प्रकाशित (Published)</option>
                    <option value="unpublished" className="bg-[#1a1f2e]">⚪ अप्रकाशित (Hidden)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Dinvishesh Events List */}
            <div className="bg-[#1a1f2e] rounded-3xl border border-white/10 overflow-hidden shadow-xl">
              {/* List Header with dynamic counts */}
              {(() => {
                const filtered = dinvisheshList.filter(item => {
                  // Month filter
                  if (dinFilterMonth !== 'all' && item.month !== dinFilterMonth) return false;

                  // Personality filter
                  const figure = item.personality || item.figure || '';
                  if (dinFilterFigure !== 'all' && !figure.includes(dinFilterFigure) && !figure.includes('दोन्ही')) return false;

                  // Category filter
                  const cat = item.event_type || item.eventType || '';
                  if (dinFilterCategory !== 'all' && !cat.includes(dinFilterCategory)) return false;

                  // Verification status filter
                  const status = item.verification_status || item.verificationStatus || 'verified';
                  if (dinFilterStatus !== 'all' && status !== dinFilterStatus) return false;

                  // Publication status filter
                  if (dinFilterPublish === 'published' && !item.is_published) return false;
                  if (dinFilterPublish === 'unpublished' && item.is_published) return false;

                  // Text search filter
                  if (dinSearch.trim()) {
                    const q = dinSearch.toLowerCase();
                    const matchTitle =
                      (item.title_marathi || item.title || '').toLowerCase().includes(q) ||
                      (item.title_english || item.title_en || '').toLowerCase().includes(q);
                    const matchDate =
                      (item.event_date || '').includes(q) ||
                      `${item.day}/${item.month}`.includes(q) ||
                      `${item.day}-${item.month}`.includes(q);
                    const matchLoc = (item.location || '').toLowerCase().includes(q);
                    const matchYear = String(item.year || '').includes(q);
                    const matchDesc =
                      (item.description_marathi || item.description || '').toLowerCase().includes(q) ||
                      (item.description_english || item.description_en || '').toLowerCase().includes(q);
                    const matchSrc = (item.source_name || item.sources || '').toLowerCase().includes(q);
                    const matchKey = (item.key_figures || []).some(k => k.toLowerCase().includes(q));

                    if (!matchTitle && !matchDate && !matchLoc && !matchYear && !matchDesc && !matchSrc && !matchKey) {
                      return false;
                    }
                  }
                  return true;
                });

                return (
                  <>
                    <div className="p-4 sm:p-5 bg-white/[0.02] border-b border-white/10 flex items-center justify-between flex-wrap gap-2">
                      <div className="font-bold text-sm text-[#D4A955] flex items-center gap-2">
                        <span>नोंदवलेल्या ऐतिहासिक घटनांची यादी</span>
                        <span className="px-2.5 py-0.5 rounded-full bg-white/10 text-white text-xs font-mono">
                          {filtered.length} / {dinvisheshList.length} उपलब्ध
                        </span>
                      </div>
                      <div className="text-xs text-white/40">
                        {filtered.length === dinvisheshList.length
                          ? 'सर्व ऐतिहासिक घटना प्रदर्शित आहेत'
                          : 'फिल्टर केलेले प्रसंग प्रदर्शित आहेत'}
                      </div>
                    </div>

                    {filtered.length === 0 ? (
                      <div className="p-12 text-center text-white/40 space-y-3">
                        <CalendarDays size={40} className="mx-auto opacity-30 text-[#D4A955]" />
                        <p className="font-semibold text-sm text-white/80">
                          दिलेल्या शोध किंवा फिल्टर निकषांनुसार कोणताही ऐतिहासिक प्रसंग सापडला नाही.
                        </p>
                        <p className="text-xs text-white/40">
                          कृपया शोध शब्द बदला किंवा वरील "सर्व फिल्टर्स पूर्ववत करा" बटण दाबा.
                        </p>
                      </div>
                    ) : (
                      <div className="divide-y divide-white/5">
                        {filtered.map(item => (
                          <div
                            key={item.id}
                            className="p-5 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5 hover:bg-white/[0.02] transition-colors"
                          >
                            <div className="flex items-start gap-4 min-w-0 flex-1">
                              {/* Event Image */}
                              {item.image_url || item.image ? (
                                <img
                                  src={item.image_url || item.image}
                                  alt={item.title_marathi || item.title}
                                  className="w-18 h-18 sm:w-20 sm:h-20 rounded-2xl object-cover shrink-0 border border-white/15 shadow-md"
                                />
                              ) : (
                                <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-2xl bg-[#A84A20]/15 border border-[#A84A20]/30 flex flex-col items-center justify-center text-center p-2 shrink-0">
                                  <span className="text-xl">🚩</span>
                                  <span className="text-[9px] text-[#D4A955] font-bold mt-0.5">
                                    {item.day}/{item.month}
                                  </span>
                                </div>
                              )}

                              <div className="min-w-0 flex-1">
                                {/* Badges */}
                                <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                                  <span className="px-2.5 py-0.5 rounded-full bg-[#A84A20]/25 border border-[#A84A20]/40 text-[#F4956A] text-[10px] font-bold">
                                    {item.personality || item.figure}
                                  </span>
                                  {(item.event_type || item.eventType) && (
                                    <span className="px-2.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/25 text-amber-300 text-[10px] font-semibold">
                                      {item.event_type || item.eventType}
                                    </span>
                                  )}
                                  <span className="text-xs font-black text-[#D4A955] bg-black/30 px-2 py-0.5 rounded-md font-mono">
                                    📅 {item.day}/{item.month} {item.year ? `(${item.year} ई.स.)` : ''}
                                  </span>
                                  <span
                                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                      item.is_published
                                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                    }`}
                                  >
                                    {item.is_published ? '🟢 प्रकाशित' : '⚪ अप्रकाशित'}
                                  </span>
                                  <span
                                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                      (item.verification_status || item.verificationStatus) === 'verified'
                                        ? 'bg-blue-500/20 text-blue-300'
                                        : 'bg-amber-500/10 text-amber-300'
                                    }`}
                                  >
                                    {(item.verification_status || item.verificationStatus) === 'verified'
                                      ? '✅ प्रमाणित'
                                      : '⏳ तपासणी बाकी'}
                                  </span>
                                  {(item.is_disputed || item.isDisputed) && (
                                    <span className="px-2 py-0.5 rounded bg-red-500/20 text-red-300 border border-red-500/30 text-[10px] font-semibold">
                                      ⚠️ मतभेद नोंद
                                    </span>
                                  )}
                                </div>

                                {/* Title */}
                                <h4 className="font-serif font-bold text-base text-white mb-1">
                                  {item.title_marathi || item.title}
                                </h4>

                                {(item.title_english || item.title_en) && (
                                  <p className="text-xs text-white/50 italic mb-1">
                                    {item.title_english || item.title_en}
                                  </p>
                                )}

                                {/* Location */}
                                {item.location && (
                                  <div className="text-xs text-amber-200/80 mb-1 flex items-center gap-1 font-medium">
                                    <MapPin size={12} className="text-[#F4956A]" /> {item.location}
                                  </div>
                                )}

                                {/* Description */}
                                <p className="text-xs text-white/70 line-clamp-2 leading-relaxed">
                                  {item.description_marathi || item.description}
                                </p>

                                {/* Historical Significance */}
                                {(item.historical_significance || item.historicalSignificance) && (
                                  <div className="text-[11px] text-amber-200/90 mt-1 line-clamp-1">
                                    🚩 <strong>महत्त्व:</strong> {item.historical_significance || item.historicalSignificance}
                                  </div>
                                )}

                                {/* Sources */}
                                {(item.source_name || item.sources) && (
                                  <div className="text-[11px] text-[#D4A955]/90 mt-1 flex items-center gap-2 flex-wrap">
                                    <span>
                                      📚 <strong>स्रोत:</strong> {item.source_name || item.sources}{' '}
                                      {item.source_type && `(${item.source_type})`}
                                    </span>
                                    {(item.source_url || item.sourceUrl) && (
                                      <a
                                        href={item.source_url || item.sourceUrl}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="text-[#D4A955] underline hover:text-white inline-flex items-center gap-0.5"
                                      >
                                        <span>संदर्भ लिंक</span>
                                        <ExternalLink size={10} />
                                      </a>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-center gap-2 shrink-0 self-end lg:self-center">
                              <button
                                type="button"
                                onClick={() => handleTogglePublishDinvishesh(item)}
                                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                                  item.is_published
                                    ? 'bg-white/10 hover:bg-white/20 text-white/80'
                                    : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md'
                                }`}
                                title={item.is_published ? 'वेबसाइटवरून अप्रकाशित करा' : 'वेबसाइटवर प्रकाशित करा'}
                              >
                                {item.is_published ? <EyeOff size={13} /> : <Eye size={13} />}
                                <span>{item.is_published ? 'अप्रकाशित करा' : 'प्रकाशित करा'}</span>
                              </button>

                              <button
                                type="button"
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
                                  const el = document.getElementById('dinvishesh-editor-form');
                                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                                }}
                                className="px-3 py-1.5 rounded-xl bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 text-xs font-bold flex items-center gap-1.5 transition-all"
                                title="प्रसंग संपादित करा"
                              >
                                <Edit3 size={13} />
                                <span>संपादन</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => handleDeleteDinvishesh(item.id)}
                                className="p-2 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-400 transition-all"
                                title="कायमचा हटवा"
                              >
                                <Trash2 size={15} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                );
              })()}
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
