import React, { useState, useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Search,
  Filter,
  Award,
  Sparkles,
  MapPin,
  FileText,
  ExternalLink,
  ShieldCheck,
  AlertCircle,
  Clock,
  BookOpen,
  X,
  Share2,
  CheckCircle2,
  TrendingUp,
  Layers,
  Flame,
  ArrowRight,
  Maximize2
} from 'lucide-react';
import { useSiteData } from '@/context/SiteContext';
import { api, type DinvisheshRecord, type DinvisheshStatsRecord } from '@/lib/api';
import { Dinvishesh3DCard } from '@/components/Dinvishesh3DCard';

export function DinvisheshPage() {
  const { t } = useSiteData();
  const today = new Date();

  // Calendar & selection states
  const [currentYear, setCurrentYear] = useState<number>(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState<number>(today.getMonth()); // 0-indexed (0 = Jan, 9 = Oct)
  const [selectedDay, setSelectedDay] = useState<number>(today.getDate());
  const [selectedFigure, setSelectedFigure] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeEventIndex, setActiveEventIndex] = useState<number>(0);

  // Data states
  const [allEvents, setAllEvents] = useState<DinvisheshRecord[]>([]);
  const [monthEvents, setMonthEvents] = useState<DinvisheshRecord[]>([]);
  const [stats, setStats] = useState<DinvisheshStatsRecord | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Active view tabs: 'calendar' | 'timeline' | 'visualizations'
  const [activeView, setActiveView] = useState<'calendar' | 'timeline' | 'visualizations'>('calendar');

  // Modal detail & image preview states
  const [selectedModalEvent, setSelectedModalEvent] = useState<DinvisheshRecord | null>(null);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  // Slider state for featured highlights (manual control by default to prevent unexpected auto-jumping)
  const [activeSlide, setActiveSlide] = useState<number>(0);
  const [isAutoPlay, setIsAutoPlay] = useState<boolean>(false);

  const monthsMr = [
    'जानेवारी', 'फेब्रुवारी', 'मार्च', 'एप्रिल', 'मे', 'जून',
    'जुलै', 'ऑगस्ट', 'सप्टेंबर', 'ऑक्टोबर', 'नोव्हेंबर', 'डिसेंबर'
  ];
  const monthsEn = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const weekDaysMr = ['रवि', 'सोम', 'मंगळ', 'बुध', 'गुरु', 'शुक्र', 'शनि'];
  const weekDaysEn = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  // Quick Select Milestone Dates
  const milestoneDates = [
    { month: 10, day: 4, year: 1673, title: '४ ऑक्टो - हुबळी विजय मोहीम (आजचा दिवस)', figure: 'छत्रपती शिवाजी महाराज' },
    { month: 6, day: 6, year: 1674, title: '६ जून - शिवराज्याभिषेक सोहळा (रायगड)', figure: 'छत्रपती शिवाजी महाराज' },
    { month: 2, day: 19, year: 1630, title: '१९ फेब्रु - शिवजयंती (शिवनेरी)', figure: 'छत्रपती शिवाजी महाराज' },
    { month: 5, day: 14, year: 1657, title: '१४ मे - संभाजी महाराज जयंती (पुरंदर)', figure: 'छत्रपती संभाजी महाराज' },
    { month: 1, day: 16, year: 1681, title: '१६ जाने - संभाजी महाराज राज्याभिषेक', figure: 'छत्रपती संभाजी महाराज' },
    { month: 11, day: 10, year: 1659, title: '१० नोव्हें - प्रतापगड युद्ध (अफझलखान वध)', figure: 'छत्रपती शिवाजी महाराज' },
    { month: 8, day: 17, year: 1666, title: '१७ ऑग - आग्रा येथून सुटका', figure: 'दोन्ही' },
    { month: 4, day: 3, year: 1680, title: '३ एप्रिल - शिवछत्रपती समाधी / पुण्यतिथी', figure: 'छत्रपती शिवाजी महाराज' },
    { month: 3, day: 11, year: 1689, title: '११ मार्च - संभाजी महाराज बलिदान दिवस', figure: 'छत्रपती संभाजी महाराज' },
    { month: 4, day: 5, year: 1663, title: '५ एप्रिल - लाल महाल धाडसी छापा', figure: 'छत्रपती शिवाजी महाराज' },
    { month: 4, day: 2, year: 1682, title: '२ एप्रिल - किल्ले रामशेज अभेद्य लढा', figure: 'छत्रपती संभाजी महाराज' },
    { month: 10, day: 24, year: 1657, title: '२४ ऑक्टो - मराठा आरमार स्थापना', figure: 'छत्रपती शिवाजी महाराज' },
  ];

  // Fetch all events and stats on load
  useEffect(() => {
    loadAllEvents();
    loadStats();
  }, []);

  // Fetch events for current month
  useEffect(() => {
    loadMonthEvents();
  }, [currentMonth]);

  const loadAllEvents = async () => {
    try {
      const data = await api.getDinvishesh({});
      setAllEvents(data);
    } catch (err) {
      console.error('Failed to load all dinvishesh:', err);
    }
  };

  const loadMonthEvents = async () => {
    setLoading(true);
    try {
      const data = await api.getDinvishesh({ month: currentMonth + 1 });
      setMonthEvents(data);
    } catch (err) {
      console.error('Failed to load month dinvishesh:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const statsData = await api.getDinvisheshStats();
      setStats(statsData);
    } catch (err) {
      console.error('Failed to load dinvishesh stats:', err);
    }
  };

  // Slider AutoPlay
  useEffect(() => {
    if (!isAutoPlay || allEvents.length === 0) return;
    const interval = setInterval(() => {
      setActiveSlide(prev => (prev + 1) % Math.min(allEvents.length, 6));
    }, 6000);
    return () => clearInterval(interval);
  }, [isAutoPlay, allEvents]);

  // Featured slider events (verified and published)
  const featuredEvents = useMemo(() => {
    return allEvents.filter(e => e.is_published).slice(0, 6);
  }, [allEvents]);

  // Calendar calculations
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(currentYear, currentMonth, 1).getDay(); // 0 = Sun

  const handlePrevMonth = () => {
    setActiveEventIndex(0);
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(prev => prev - 1);
    } else {
      setCurrentMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    setActiveEventIndex(0);
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(prev => prev + 1);
    } else {
      setCurrentMonth(prev => prev + 1);
    }
  };

  const handleGoToToday = () => {
    const now = new Date();
    setCurrentYear(now.getFullYear());
    setCurrentMonth(now.getMonth());
    setSelectedDay(now.getDate());
    setActiveEventIndex(0);
  };

  const handleSelectMilestone = (m: typeof milestoneDates[0]) => {
    setCurrentMonth(m.month - 1);
    setSelectedDay(m.day);
    setActiveEventIndex(0);
    setActiveView('calendar');
    const targetEl = document.getElementById('dinvishesh-interactive-workspace');
    if (targetEl) {
      targetEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Dates in current month that have published events matching selected personality
  const eventDaysInMonth = useMemo(() => {
    const dayMap = new Map<number, DinvisheshRecord[]>();
    monthEvents
      .filter(e => e.is_published)
      .forEach(e => {
        if (selectedFigure !== 'all') {
          const pers = (e.personality || e.figure || '');
          if (!pers.includes(selectedFigure) && !pers.includes('दोन्ही')) {
            return;
          }
        }
        const existing = dayMap.get(e.day) || [];
        existing.push(e);
        dayMap.set(e.day, existing);
      });
    return dayMap;
  }, [monthEvents, selectedFigure]);

  // Events for selected date with personality, category, and search query filters
  const selectedDateEvents = useMemo(() => {
    return monthEvents.filter(e => {
      if (!e.is_published) return false;
      if (e.day !== selectedDay) return false;

      // Personality filter
      if (selectedFigure !== 'all') {
        const pers = (e.personality || e.figure || '');
        if (!pers.includes(selectedFigure) && !pers.includes('दोन्ही')) {
          return false;
        }
      }

      // Category filter
      if (selectedCategory !== 'all') {
        const cat = e.event_type || 'ऐतिहासिक प्रसंग';
        if (!cat.includes(selectedCategory)) return false;
      }

      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const tMr = (e.title_marathi || e.title || '').toLowerCase();
        const tEn = (e.title_english || e.title_en || '').toLowerCase();
        const dMr = (e.description_marathi || e.description || '').toLowerCase();
        const loc = (e.location || '').toLowerCase();
        const src = (e.source_name || e.sources || '').toLowerCase();
        const yr = String(e.year || '');
        const pers = (e.personality || e.figure || '').toLowerCase();

        if (
          !tMr.includes(q) &&
          !tEn.includes(q) &&
          !dMr.includes(q) &&
          !loc.includes(q) &&
          !src.includes(q) &&
          !yr.includes(q) &&
          !pers.includes(q)
        ) {
          return false;
        }
      }
      return true;
    });
  }, [monthEvents, selectedDay, selectedFigure, selectedCategory, searchQuery]);

  // Global search results across all months if search query is active and user wants global results
  const globalSearchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase().trim();
    return allEvents.filter(e => {
      if (!e.is_published) return false;
      const tMr = (e.title_marathi || e.title || '').toLowerCase();
      const tEn = (e.title_english || e.title_en || '').toLowerCase();
      const dMr = (e.description_marathi || e.description || '').toLowerCase();
      const loc = (e.location || '').toLowerCase();
      const src = (e.source_name || e.sources || '').toLowerCase();
      const yr = String(e.year || '');
      const pers = (e.personality || e.figure || '').toLowerCase();

      return (
        tMr.includes(q) ||
        tEn.includes(q) ||
        dMr.includes(q) ||
        loc.includes(q) ||
        src.includes(q) ||
        yr.includes(q) ||
        pers.includes(q)
      );
    });
  }, [allEvents, searchQuery]);

  // Chronological timeline events
  const timelineMilestones = useMemo(() => {
    const list = allEvents.filter(e => e.is_published && e.year);
    if (selectedFigure !== 'all') {
      return list.filter(e => (e.personality || e.figure || '').includes(selectedFigure) || (e.personality || '').includes('दोन्ही'));
    }
    return list.sort((a, b) => (a.year || 0) - (b.year || 0));
  }, [allEvents, selectedFigure]);

  return (
    <div className="bg-[#FAF6EE] min-h-screen pt-[68px] text-[#1E1711]">
      <Helmet>
        <title>{t('दिनविशेष - तारीखनिहाय ऐतिहासिक कॅलेंडर | गडकिल्ले संवर्धन', 'Dinvishesh - Historical Events Calendar | Gadkille')}</title>
        <meta
          name="description"
          content="छत्रपती शिवाजी महाराज आणि छत्रपती संभाजी महाराज यांच्या जीवनातील प्रत्येक ऐतिहासिक दिवस, लढाया, राज्याभिषेक व पुराभिलेखांची तारीखनिहाय माहिती."
        />
      </Helmet>

      {/* 🌟 1. ROYAL HERO SECTION WITH HISTORICAL AMBIENCE */}
      <section className="relative bg-[#160E08] text-[#F3E8D0] pt-14 pb-12 border-b border-[#B58A45]/30 overflow-hidden">
        {/* Subtle royal background glow and pattern */}
        <div className="absolute top-0 left-1/4 w-[480px] h-[480px] bg-[#A84A20]/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-[480px] h-[480px] bg-[#D4A955]/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(#D4A955_1px,transparent_1px)] [background-size:24px_24px] opacity-10 pointer-events-none" />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center relative z-10">
          <div className="inline-flex items-center gap-2 mb-4 px-4 py-1.5 rounded-full bg-white/5 border border-[#D4A955]/40 text-[#D4A955] text-xs font-serif uppercase tracking-widest backdrop-blur-md shadow-sm">
            <Sparkles size={14} className="text-[#D4A955] animate-pulse" />
            <span>{t('शिवकालीन व संभाजीकालीन ऐतिहासिक दिनविशेष', 'Historical Chronicles of Shivaji & Sambhaji Era')}</span>
            <Sparkles size={14} className="text-[#D4A955] animate-pulse" />
          </div>

          <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-black mb-4 tracking-tight leading-tight bg-gradient-to-r from-[#F7EDD8] via-[#E6BA64] to-[#F7EDD8] bg-clip-text text-transparent">
            {t('दिनविशेष — गौरवशाली इतिहासातील आजचा दिवस', 'Dinvishesh — Today in Maratha History')}
          </h1>

          <p className="text-[rgba(243,232,208,0.88)] max-w-3xl mx-auto text-sm sm:text-base leading-relaxed font-normal mb-8">
            {t(
              'छत्रपती शिवाजी महाराज आणि छत्रपती संभाजी महाराज यांच्या अद्वितीय पराक्रमाचे, राज्याभिषेकांचे, युद्धांचे व ऐतिहासिक घटनांचे प्रामाणिक संदर्भयुक्त संकलन.',
              'Authentic, verified date-wise historical events and chronicles of Chhatrapati Shivaji Maharaj and Chhatrapati Sambhaji Maharaj with archival sources.'
            )}
          </p>

          {/* Quick Stats Banner */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl mx-auto pt-2">
            <div className="bg-white/5 border border-[#D4A955]/20 rounded-2xl p-3 backdrop-blur-sm">
              <div className="text-xl sm:text-2xl font-bold font-serif text-[#D4A955]">{stats?.total_events || allEvents.length}</div>
              <div className="text-[11px] text-white/70 font-medium">नोंदवलेले ऐतिहासिक प्रसंग</div>
            </div>
            <div className="bg-white/5 border border-[#D4A955]/20 rounded-2xl p-3 backdrop-blur-sm">
              <div className="text-xl sm:text-2xl font-bold font-serif text-[#F4956A]">
                {stats?.personality_distribution['छत्रपती शिवाजी महाराज'] || 12}
              </div>
              <div className="text-[11px] text-white/70 font-medium">छत्रपती शिवाजी महाराज</div>
            </div>
            <div className="bg-white/5 border border-[#D4A955]/20 rounded-2xl p-3 backdrop-blur-sm">
              <div className="text-xl sm:text-2xl font-bold font-serif text-[#F4956A]">
                {stats?.personality_distribution['छत्रपती संभाजी महाराज'] || 7}
              </div>
              <div className="text-[11px] text-white/70 font-medium">छत्रपती संभाजी महाराज</div>
            </div>
            <div className="bg-white/5 border border-[#D4A955]/20 rounded-2xl p-3 backdrop-blur-sm">
              <div className="text-xl sm:text-2xl font-bold font-serif text-emerald-400">१००%</div>
              <div className="text-[11px] text-white/70 font-medium">बखर व पुराभिलेखाधारित</div>
            </div>
          </div>
        </div>
      </section>

      {/* 🌟 2. FEATURED EVENTS CAROUSEL / SLIDER */}
      {featuredEvents.length > 0 && (
        <section className="bg-[#120B06] py-8 border-b border-[#B58A45]/20">
          <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
            <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-6 rounded-full bg-[#A84A20] inline-block" />
                <h2 className="font-serif text-lg sm:text-xl font-bold text-[#F3E8D0] flex items-center gap-2">
                  <Award className="text-[#D4A955]" size={20} />
                  {t('प्रमुख ऐतिहासिक दिवस (Featured Historical Milestones)', 'Key Historical Milestones')}
                </h2>
              </div>

              {/* Slider Controls */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsAutoPlay(!isAutoPlay)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all border ${
                    isAutoPlay
                      ? 'bg-[#A84A20]/20 text-[#F4956A] border-[#A84A20]/40'
                      : 'bg-white/5 text-white/50 border-white/10'
                  }`}
                >
                  {isAutoPlay ? '⏸ Pause' : '▶ Play'}
                </button>
                <button
                  onClick={() => setActiveSlide(prev => (prev === 0 ? featuredEvents.length - 1 : prev - 1))}
                  className="w-8 h-8 rounded-xl bg-white/10 hover:bg-[#A84A20] text-white flex items-center justify-center transition-all border border-white/15 shadow"
                  aria-label="Previous event"
                >
                  <ChevronLeft size={18} />
                </button>
                <button
                  onClick={() => setActiveSlide(prev => (prev + 1) % featuredEvents.length)}
                  className="w-8 h-8 rounded-xl bg-white/10 hover:bg-[#A84A20] text-white flex items-center justify-center transition-all border border-white/15 shadow"
                  aria-label="Next event"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>

            {/* Slider Container */}
            <div className="relative rounded-3xl overflow-hidden border border-[#D4A955]/30 shadow-2xl bg-[#1A1008] group">
              {featuredEvents.map((evt, idx) => {
                if (idx !== activeSlide) return null;
                const imgUrl = evt.image_url || evt.image || '/images/raigad.jpg';
                return (
                  <div key={evt.id} className="relative min-h-[340px] sm:min-h-[400px] flex flex-col justify-end p-6 sm:p-10 transition-all duration-700">
                    <div className="absolute inset-0 overflow-hidden">
                      <img
                        src={imgUrl}
                        alt={evt.title_marathi || evt.title}
                        className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-1000 opacity-35"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#120B06] via-[#120B06]/80 to-transparent" />
                    </div>

                    <div className="relative z-10 max-w-3xl space-y-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="px-3 py-1 bg-[#A84A20] text-white text-xs font-bold rounded-full shadow-lg flex items-center gap-1.5 border border-[#D4A955]/40">
                          <CrownIcon /> {evt.personality || evt.figure}
                        </span>
                        <span className="px-3 py-1 bg-black/60 text-[#D4A955] text-xs font-bold rounded-lg border border-[#D4A955]/30 backdrop-blur">
                          📅 {evt.day} {monthsMr[evt.month - 1]} {evt.year && `(${evt.year} ई.स.)`}
                        </span>
                        <span className="px-2.5 py-0.5 bg-black/60 text-white/80 text-xs font-semibold rounded-lg border border-white/10 backdrop-blur">
                          🏷️ {evt.event_type || 'ऐतिहासिक प्रसंग'}
                        </span>
                      </div>

                      <h3 className="font-serif text-2xl sm:text-3xl font-black text-[#F3E8D0] leading-snug">
                        {t(evt.title_marathi || evt.title, evt.title_english || evt.title_en || evt.title)}
                      </h3>

                      <p className="text-xs sm:text-sm text-[rgba(243,232,208,0.85)] line-clamp-3 leading-relaxed">
                        {t(evt.description_marathi || evt.description, evt.description_english || evt.description_en || evt.description)}
                      </p>

                      <div className="pt-2 flex flex-wrap items-center gap-3">
                        <button
                          onClick={() => {
                            setCurrentMonth(evt.month - 1);
                            setSelectedDay(evt.day);
                            setActiveView('calendar');
                            const el = document.getElementById('dinvishesh-interactive-workspace');
                            if (el) el.scrollIntoView({ behavior: 'smooth' });
                          }}
                          className="px-4 py-2 rounded-xl bg-[#A84A20] hover:bg-[#c15a2a] text-white font-bold text-xs shadow-lg flex items-center gap-2 border border-[#D4A955]/40 transition-all hover:scale-105"
                        >
                          <span>{t('कॅलेंडरमध्ये ही तारीख पहा →', 'View Date in Calendar →')}</span>
                        </button>
                        <button
                          onClick={() => setSelectedModalEvent(evt)}
                          className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-[#F3E8D0] font-bold text-xs border border-white/20 transition-all"
                        >
                          {t('सविस्तर वाचा (Read Full)', 'Read Full Record')}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Dots */}
              <div className="absolute bottom-4 right-6 z-20 flex items-center gap-1.5">
                {featuredEvents.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveSlide(idx)}
                    className={`h-2 rounded-full transition-all ${activeSlide === idx ? 'w-6 bg-[#A84A20]' : 'w-2 bg-white/30'}`}
                    aria-label={`Go to slide ${idx + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 🌟 3. MAIN INTERACTIVE WORKSPACE */}
      <div id="dinvishesh-interactive-workspace" className="max-w-[1240px] mx-auto px-4 sm:px-6 py-10">
        {/* Admin Quick Action Banner */}
        <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-[#1a1f2e] via-[#202738] to-[#1a1f2e] border border-amber-500/30 shadow-lg flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#A84A20]/30 border border-[#D4A955]/40 flex items-center justify-center text-lg">
              🚩
            </div>
            <div>
              <div className="text-xs font-bold text-white flex items-center gap-2">
                <span>शिवसाम्राज्याचे दिनविशेष व्यवस्थापन (Admin Control)</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono">
                  {allEvents.length} एकूण ऐतिहासिक नोंदी
                </span>
              </div>
              <div className="text-[11px] text-white/50">
                ॲडमिन डॅशबोर्डवरून सर्व प्रसंग जोडा, संपादित करा, प्रकाशित/अप्रकाशित करा किंवा हटवा.
              </div>
            </div>
          </div>

          <a
            href="/admin"
            className="px-4 py-2 rounded-xl bg-[#A84A20] hover:bg-[#c15a2a] text-white text-xs font-bold transition-all inline-flex items-center gap-1.5 shadow-md"
          >
            <ShieldCheck size={14} />
            <span>दिनविशेष ॲडमिन डॅशबोर्ड उघडा ↗</span>
          </a>
        </div>

        {/* Navigation Tabs (Calendar View / Historical Timeline / Data Visualizations) */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8 pb-4 border-b border-[#E8D5A3]">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveView('calendar')}
              className={`px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 shadow-sm ${
                activeView === 'calendar'
                  ? 'bg-[#A84A20] text-white ring-2 ring-[#A84A20]/30 shadow-md'
                  : 'bg-white text-[#5C4A35] border border-[#E8D5A3] hover:bg-[#FAF2DE]'
              }`}
            >
              <Calendar size={16} />
              <span>{t('तारीख कॅलेंडर (Calendar View)', 'Interactive Calendar')}</span>
            </button>

            <button
              onClick={() => setActiveView('timeline')}
              className={`px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 shadow-sm ${
                activeView === 'timeline'
                  ? 'bg-[#A84A20] text-white ring-2 ring-[#A84A20]/30 shadow-md'
                  : 'bg-white text-[#5C4A35] border border-[#E8D5A3] hover:bg-[#FAF2DE]'
              }`}
            >
              <Clock size={16} />
              <span>{t('ऐतिहासिक टाइमलाइन (Timeline)', 'Historical Timeline')}</span>
            </button>

            <button
              onClick={() => setActiveView('visualizations')}
              className={`px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 shadow-sm ${
                activeView === 'visualizations'
                  ? 'bg-[#A84A20] text-white ring-2 ring-[#A84A20]/30 shadow-md'
                  : 'bg-white text-[#5C4A35] border border-[#E8D5A3] hover:bg-[#FAF2DE]'
              }`}
            >
              <TrendingUp size={16} />
              <span>{t('इतिहास विश्लेषण (Visualizations)', 'Data Visualization')}</span>
            </button>
          </div>

          {/* Personality Filters */}
          <div className="flex items-center gap-1.5 bg-white p-1.5 rounded-2xl border border-[#E8D5A3] shadow-sm">
            <span className="text-[11px] font-bold text-[#8F7A66] px-2 hidden sm:inline">व्यक्तिमत्त्व:</span>
            {[
              { id: 'all', label: 'सर्व' },
              { id: 'छत्रपती शिवाजी महाराज', label: 'शिवछत्रपती' },
              { id: 'छत्रपती संभाजी महाराज', label: 'संभाजी महाराज' },
            ].map(fig => (
              <button
                key={fig.id}
                onClick={() => setSelectedFigure(fig.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  selectedFigure === fig.id
                    ? 'bg-[#A84A20] text-white shadow-sm'
                    : 'text-[#5C4A35] hover:bg-[#FAF2DE]'
                }`}
              >
                {fig.label}
              </button>
            ))}
          </div>
        </div>

        {/* Quick Select Milestone Bar */}
        <div className="mb-8 bg-white rounded-3xl p-5 border border-[#E8D5A3] shadow-sm">
          <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#A84A20] flex items-center gap-2">
              <Flame size={15} className="text-[#A84A20]" />
              <span>{t('महत्त्वाचे ऐतिहासिक प्रसंग (Quick Milestone Selection):', 'Major Historical Milestones:')}</span>
            </h2>
            <span className="text-[11px] text-[#8F7A66]">क्लिक करा व थेट त्या तारखेचा इतिहास पहा</span>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
            {milestoneDates.map((m, idx) => {
              const isSelected = currentMonth === m.month - 1 && selectedDay === m.day;
              return (
                <button
                  key={idx}
                  onClick={() => handleSelectMilestone(m)}
                  className={`shrink-0 px-3.5 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-[#A84A20] text-white shadow-md ring-2 ring-[#A84A20]/40 scale-[1.02]'
                      : 'bg-[#F9F2E3] text-[#3D2E21] border border-[#E8D5A3] hover:bg-[#A84A20] hover:text-white hover:border-[#A84A20]'
                  }`}
                >
                  <span>🚩</span>
                  <span>{m.title}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ============================================================== */}
        {/* VIEW 1: INTERACTIVE CALENDAR & BEAUTIFUL EVENT CARD           */}
        {/* ============================================================== */}
        {activeView === 'calendar' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Calendar Sidebar (5 cols) */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-white rounded-3xl p-6 border border-[#E8D5A3] shadow-md">
                {/* Month & Year Controller */}
                <div className="flex items-center justify-between mb-6">
                  <button
                    onClick={handlePrevMonth}
                    className="w-10 h-10 rounded-2xl bg-[#F9F2E3] text-[#1E1711] border border-[#E8D5A3] flex items-center justify-center hover:bg-[#A84A20] hover:text-white transition-all shadow-sm"
                    title="Previous Month"
                    aria-label="Previous Month"
                  >
                    <ChevronLeft size={20} />
                  </button>

                  <div className="text-center">
                    <div className="flex items-center justify-center gap-2">
                      <select
                        value={currentMonth}
                        onChange={e => setCurrentMonth(Number(e.target.value))}
                        className="font-serif font-black text-lg text-[#1E1711] bg-transparent border-b border-[#D4A955] pb-0.5 focus:outline-none cursor-pointer"
                      >
                        {monthsMr.map((m, idx) => (
                          <option key={idx} value={idx}>
                            {m} ({monthsEn[idx]})
                          </option>
                        ))}
                      </select>

                      <select
                        value={currentYear}
                        onChange={e => setCurrentYear(Number(e.target.value))}
                        className="font-serif font-black text-lg text-[#A84A20] bg-transparent border-b border-[#D4A955] pb-0.5 focus:outline-none cursor-pointer"
                      >
                        {[2024, 2025, 2026, 2027, 2028].map(y => (
                          <option key={y} value={y}>
                            {y}
                          </option>
                        ))}
                      </select>
                    </div>
                    <span className="text-[11px] text-[#8F7A66] font-semibold block mt-1">
                      {t('तारीख निवडा — ऐतिहासिक प्रसंग पाहण्यासाठी', 'Select Date to View Events')}
                    </span>
                  </div>

                  <button
                    onClick={handleNextMonth}
                    className="w-10 h-10 rounded-2xl bg-[#F9F2E3] text-[#1E1711] border border-[#E8D5A3] flex items-center justify-center hover:bg-[#A84A20] hover:text-white transition-all shadow-sm"
                    title="Next Month"
                    aria-label="Next Month"
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>

                {/* Weekday Header */}
                <div className="grid grid-cols-7 gap-1 text-center mb-2">
                  {weekDaysMr.map((d, i) => (
                    <div key={i} className="text-xs font-bold text-[#A84A20] py-1">
                      {d}
                    </div>
                  ))}
                </div>

                {/* Days Grid */}
                <div className="grid grid-cols-7 gap-1.5">
                  {Array.from({ length: firstDayOfWeek }).map((_, idx) => (
                    <div key={`empty-${idx}`} className="h-11" />
                  ))}

                  {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(dayNum => {
                    const eventsForDay = eventDaysInMonth.get(dayNum) || [];
                    const hasEvent = eventsForDay.length > 0;
                    const isSelected = selectedDay === dayNum;
                    const isToday =
                      today.getDate() === dayNum &&
                      today.getMonth() === currentMonth &&
                      today.getFullYear() === currentYear;

                    return (
                      <button
                        key={dayNum}
                        onClick={() => {
                          setSelectedDay(dayNum);
                          setActiveEventIndex(0);
                        }}
                        className={`relative h-11 rounded-2xl font-bold text-xs transition-all duration-300 flex flex-col items-center justify-center group ${
                          isSelected
                            ? 'bg-[#A84A20] text-white shadow-xl scale-105 z-10 ring-2 ring-[#A84A20]/40'
                            : isToday
                            ? 'bg-[#E8D5A3] text-[#1E1711] border-2 border-[#A84A20] hover:bg-[#A84A20] hover:text-white'
                            : hasEvent
                            ? 'bg-[#F9F2E3] text-[#1E1711] border border-[#D4A955]/60 hover:bg-[#E8D5A3] hover:scale-105 shadow-sm'
                            : 'bg-white text-[#735F4D] border border-gray-100 hover:bg-[#F9F2E3]'
                        }`}
                      >
                        <span className="text-[13px]">{dayNum}</span>

                        {/* Event Indicator badge */}
                        {hasEvent && (
                          <span className="absolute bottom-1 flex items-center justify-center">
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                isSelected ? 'bg-amber-300 ring-2 ring-amber-200' : 'bg-[#A84A20] animate-pulse'
                              }`}
                            />
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Today button & Legend */}
                <div className="mt-6 pt-4 border-t border-[#F0E6D2] flex items-center justify-between flex-wrap gap-2">
                  <button
                    onClick={handleGoToToday}
                    className="px-3.5 py-1.5 rounded-xl bg-[#F9F2E3] text-[#A84A20] text-xs font-bold hover:bg-[#A84A20] hover:text-white transition-all border border-[#E8D5A3] flex items-center gap-1.5"
                  >
                    <Calendar size={14} />
                    {t('आजची तारीख (Today)', 'Go to Today')}
                  </button>

                  <div className="flex items-center gap-3 text-[11px] text-[#8F7A66] font-semibold">
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-[#A84A20] animate-pulse" />
                      {t('घटना नोंद', 'Event')}
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full border border-[#A84A20] bg-[#E8D5A3]" />
                      {t('आज', 'Today')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Category Filter Box */}
              <div className="bg-white rounded-3xl p-5 border border-[#E8D5A3] shadow-sm">
                <h3 className="font-serif font-bold text-xs uppercase tracking-wider text-[#A84A20] mb-3 flex items-center gap-2">
                  <Layers size={14} />
                  <span>प्रसंग प्रकारानुसार फिल्टर करा (Filter by Type)</span>
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { id: 'all', label: 'सर्व प्रसंग' },
                    { id: 'राज्याभिषेक', label: '👑 राज्याभिषेक' },
                    { id: 'लढाई', label: '⚔️ लढाया / पराक्रम' },
                    { id: 'मुत्सद्देगिरी', label: '📜 मुत्सद्देगिरी / तह' },
                    { id: 'दुर्ग', label: '🏰 दुर्ग विजय / लढा' },
                    { id: 'जन्म', label: '🚩 जन्म / जयंती' },
                    { id: 'बलिदान', label: '🕯️ बलिदान / पुण्यतिथी' },
                    { id: 'आरमार', label: '⛵ आरमार' },
                  ].map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                        selectedCategory === cat.id
                          ? 'bg-[#A84A20] text-white font-bold shadow-sm'
                          : 'bg-[#F9F2E3] text-[#5C4A35] hover:bg-[#E8D5A3]'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Event Display Panel (7 cols) */}
            <div className="lg:col-span-7 space-y-6">
              {/* Search & Active Date Header */}
              <div className="bg-white rounded-3xl p-6 border border-[#E8D5A3] shadow-md">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <span className="text-[11px] uppercase font-bold tracking-widest text-[#A84A20] block mb-1">
                      {t('निवडलेली तारीख आणि इतिहास', 'Selected Historical Date')}
                    </span>
                    <h2 className="font-serif text-2xl sm:text-3xl font-black text-[#1E1711] flex items-center gap-2">
                      <span>{selectedDay} {monthsMr[currentMonth]} {currentYear}</span>
                    </h2>
                  </div>

                  {/* Search box */}
                  <div className="relative w-full sm:w-64">
                    <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8F7A66]" />
                    <input
                      type="text"
                      placeholder={t('इतिहास शोधा (उदा. आग्रा, रायगड)...', 'Search events, places...')}
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-8 py-2.5 rounded-2xl text-xs bg-[#F9F2E3] border border-[#E8D5A3] focus:outline-none focus:border-[#A84A20] transition-colors"
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery('')}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        title="Clear search"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>
                </div>

                {/* Active filter pills */}
                {(selectedFigure !== 'all' || selectedCategory !== 'all' || searchQuery) && (
                  <div className="flex items-center gap-2 mt-4 pt-3 border-t border-[#F0E6D2] text-xs flex-wrap">
                    <span className="text-[#8F7A66] font-semibold">सक्रिय फिल्टर्स:</span>
                    {selectedFigure !== 'all' && (
                      <span className="px-2.5 py-0.5 rounded-lg bg-[#A84A20]/15 text-[#A84A20] font-bold flex items-center gap-1">
                        {selectedFigure}
                        <button onClick={() => setSelectedFigure('all')}><X size={12} /></button>
                      </span>
                    )}
                    {selectedCategory !== 'all' && (
                      <span className="px-2.5 py-0.5 rounded-lg bg-[#A84A20]/15 text-[#A84A20] font-bold flex items-center gap-1">
                        प्रकार: {selectedCategory}
                        <button onClick={() => setSelectedCategory('all')}><X size={12} /></button>
                      </span>
                    )}
                    {searchQuery && (
                      <span className="px-2.5 py-0.5 rounded-lg bg-amber-100 text-amber-900 font-bold flex items-center gap-1">
                        शोध: "{searchQuery}"
                        <button onClick={() => setSearchQuery('')}><X size={12} /></button>
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Event Cards Loading / Empty / Content */}
              {loading ? (
                <div className="py-24 bg-white rounded-3xl border border-[#E8D5A3] flex flex-col items-center justify-center text-center p-6 shadow-sm">
                  <div className="w-12 h-12 rounded-full border-4 border-[#A84A20]/20 border-t-[#A84A20] animate-spin mb-4" />
                  <p className="font-serif font-bold text-sm text-[#5C4A35]">ऐतिहासिक माहिती लोड होत आहे...</p>
                </div>
              ) : selectedDateEvents.length === 0 ? (
                <div className="bg-white rounded-3xl p-10 text-center border border-[#E8D5A3] shadow-sm space-y-4">
                  <BookOpen size={48} className="mx-auto text-[#D4A955] opacity-60" />
                  <h3 className="font-serif font-bold text-xl text-[#1E1711]">
                    {t('या तारखेसाठी कोणताही ऐतिहासिक प्रसंग उपलब्ध नाही', 'No event recorded for this exact date')}
                  </h3>
                  <p className="text-xs text-[#8F7A66] max-w-md mx-auto leading-relaxed">
                    {t(
                      'कृपया कॅलेंडरमधील ठळक खूण असणाऱ्या इतर तारखा निवडा किंवा वर दिलेल्या प्रमुख ऐतिहासिक दिवसांवर क्लिक करा.',
                      'Please select another marked date on the calendar or click any of the featured milestone dates above.'
                    )}
                  </p>

                  {/* Suggest nearest milestone */}
                  <div className="pt-2">
                    <button
                      onClick={() => handleSelectMilestone(milestoneDates[0])}
                      className="px-4 py-2 rounded-xl bg-[#A84A20] text-white text-xs font-bold hover:bg-[#8D3B18] transition-all inline-flex items-center gap-2 shadow"
                    >
                      <span>🚩 ४ ऑक्टोबर - हुबळी विजय मोहीम पहा</span>
                      <ArrowRight size={14} />
                    </button>
                  </div>

                  {/* If search query gave global matches, show quick links */}
                  {searchQuery && globalSearchResults.length > 0 && (
                    <div className="mt-6 pt-6 border-t border-[#F0E6D2] text-left">
                      <h4 className="text-xs font-bold text-[#A84A20] uppercase tracking-wider mb-3">
                        इतर महिन्यांत सापडलेले संदर्भ ({globalSearchResults.length}):
                      </h4>
                      <div className="space-y-2">
                        {globalSearchResults.slice(0, 3).map(res => (
                          <div
                            key={res.id}
                            onClick={() => {
                              setCurrentMonth(res.month - 1);
                              setSelectedDay(res.day);
                            }}
                            className="p-3 rounded-2xl bg-[#F9F2E3] hover:bg-[#E8D5A3] cursor-pointer transition-colors flex items-center justify-between"
                          >
                            <div>
                              <div className="font-bold text-xs text-[#1E1711]">{res.title_marathi || res.title}</div>
                              <div className="text-[11px] text-[#8F7A66]">
                                📅 {res.day} {monthsMr[res.month - 1]} {res.year && `(${res.year} ई.स.)`} · {res.personality || res.figure}
                              </div>
                            </div>
                            <span className="text-xs text-[#A84A20] font-bold">पहा →</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Event Switcher if multiple records exist on selected day */}
                  {selectedDateEvents.length > 1 && (
                    <div className="bg-[#FAF2DE] p-3.5 rounded-2xl border border-[#E8D5A3] flex items-center gap-2 overflow-x-auto">
                      <span className="text-xs font-bold text-[#A84A20] uppercase tracking-wider shrink-0">
                        🚩 {t('या दिवसातील प्रसंग:', 'Events on this date:')}
                      </span>
                      {selectedDateEvents.map((eItem, idx) => (
                        <button
                          key={eItem.id}
                          onClick={() => setActiveEventIndex(idx)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                            activeEventIndex === idx
                              ? 'bg-[#A84A20] text-white shadow-md scale-105'
                              : 'bg-white text-[#5C4A35] border border-[#E8D5A3] hover:bg-[#E8D5A3]'
                          }`}
                        >
                          {idx + 1}. {eItem.title_marathi || eItem.title}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* 3D Master Historical Interactive Card */}
                  <Dinvishesh3DCard
                    event={selectedDateEvents[activeEventIndex] || selectedDateEvents[0]}
                    selectedDate={{
                      day: selectedDay,
                      month: currentMonth + 1,
                      year: currentYear,
                    }}
                    onDateChange={(newD, newM) => {
                      setSelectedDay(newD);
                      setCurrentMonth(newM - 1);
                      setActiveEventIndex(0);
                    }}
                    onOpenModal={setSelectedModalEvent}
                    theme="parchment"
                    showNavControls={true}
                  />

                  {/* Comprehensive Date-wise Historical Events List */}
                  {selectedDateEvents.length > 1 && (
                    <div className="bg-white rounded-3xl p-6 border border-[#E8D5A3] shadow-md space-y-4">
                      <div className="flex items-center justify-between border-b border-[#F0E6D2] pb-3 flex-wrap gap-2">
                        <h3 className="font-serif font-black text-lg text-[#1E1711] flex items-center gap-2">
                          <span className="w-2.5 h-6 rounded-full bg-[#A84A20] inline-block" />
                          <span>{selectedDay} {monthsMr[currentMonth]} रोजीच्या सर्व ऐतिहासिक नोंदी ({selectedDateEvents.length})</span>
                        </h3>
                        <span className="text-xs text-[#8F7A66] font-semibold">
                          क्लिक करून ३D कार्डवर पहा किंवा सविस्तर वाचा
                        </span>
                      </div>

                      <div className="grid grid-cols-1 gap-3">
                        {selectedDateEvents.map((ev, idx) => {
                          const isCur = activeEventIndex === idx;
                          return (
                            <div
                              key={ev.id}
                              onClick={() => setActiveEventIndex(idx)}
                              className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                                isCur
                                  ? 'bg-[#FAF2DE] border-[#A84A20] shadow-md ring-1 ring-[#A84A20]/30'
                                  : 'bg-[#FCF9F3] border-[#E8D5A3] hover:bg-[#FAF2DE] hover:border-[#D4A955]'
                              }`}
                            >
                              <div className="space-y-1.5 flex-1">
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className="px-2.5 py-0.5 rounded-md bg-[#A84A20] text-white text-[11px] font-bold">
                                    {ev.year ? `${ev.year} ई.स.` : 'ऐतिहासिक नोंद'}
                                  </span>
                                  <span className="text-xs font-bold text-[#A84A20]">
                                    {ev.personality || ev.figure}
                                  </span>
                                  {ev.location && (
                                    <span className="text-xs text-[#735F4D] flex items-center gap-1">
                                      <MapPin size={12} className="text-[#A84A20]" />
                                      {ev.location}
                                    </span>
                                  )}
                                </div>
                                <h4 className="font-serif font-bold text-sm sm:text-base text-[#1E1711]">
                                  {ev.title_marathi || ev.title}
                                </h4>
                                <p className="text-xs text-[#5C4A35] line-clamp-2 leading-relaxed">
                                  {ev.description_marathi || ev.description}
                                </p>
                              </div>

                              <div className="flex items-center gap-2 shrink-0">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setActiveEventIndex(idx);
                                  }}
                                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                                    isCur
                                      ? 'bg-[#A84A20] text-white shadow'
                                      : 'bg-white text-[#5C4A35] border border-[#E8D5A3] hover:bg-[#A84A20] hover:text-white'
                                  }`}
                                >
                                  {isCur ? '✓ ३D वर सक्रिय' : '३D मध्ये पहा'}
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedModalEvent(ev);
                                  }}
                                  className="px-3 py-1.5 rounded-xl bg-white hover:bg-white/80 text-[#1E1711] border border-[#E8D5A3] text-xs font-bold transition-all shadow-sm"
                                >
                                  सविस्तर वाचा ↗
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* VIEW 2: HISTORICAL CHRONOLOGICAL TIMELINE                     */}
        {/* ============================================================== */}
        {activeView === 'timeline' && (
          <div className="bg-white rounded-3xl p-6 sm:p-10 border border-[#E8D5A3] shadow-md space-y-8">
            <div className="max-w-3xl">
              <span className="text-xs font-bold uppercase tracking-widest text-[#A84A20]">
                कालक्रमानुसार इतिहास दर्शन
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl font-black text-[#1E1711] mt-1">
                छत्रपती शिवाजी महाराज व संभाजी महाराज ऐतिहासिक टाइमलाइन (Timeline)
              </h2>
              <p className="text-xs sm:text-sm text-[#735F4D] mt-2 leading-relaxed">
                १६३० पासून १६८९ पर्यंतच्या सर्व प्रमुख घटनांची कालक्रमानुसार मांडणी. कोणत्याही घटनेवर क्लिक करून तिची तारीख कॅलेंडरमध्ये उघडा.
              </p>
            </div>

            {/* Responsive Vertical / Horizontal Timeline Track */}
            <div className="relative border-l-2 border-[#D4A955]/40 ml-4 sm:ml-8 pl-6 sm:pl-10 space-y-10">
              {timelineMilestones.map((evt, idx) => {
                const img = evt.image_url || evt.image || '';
                return (
                  <div key={evt.id} className="relative group">
                    {/* Node Dot */}
                    <div className="absolute -left-[31px] sm:-left-[47px] top-1.5 w-6 h-6 rounded-full bg-[#FAF6EE] border-4 border-[#A84A20] shadow group-hover:scale-125 transition-transform" />

                    <div className="bg-[#FAF7F2] p-5 sm:p-6 rounded-2xl border border-[#E8D5A3] hover:border-[#A84A20] hover:shadow-lg transition-all">
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                        <span className="px-3 py-1 rounded-full bg-[#A84A20] text-white text-xs font-bold">
                          वर्ष {evt.year} ई.स. · {evt.day} {monthsMr[evt.month - 1]}
                        </span>
                        <span className="text-xs font-bold text-[#A84A20]">
                          {evt.personality || evt.figure}
                        </span>
                      </div>

                      <h3 className="font-serif text-lg sm:text-xl font-bold text-[#1E1711] mb-2">
                        {evt.title_marathi || evt.title}
                      </h3>

                      {evt.location && (
                        <div className="text-xs text-[#7A6451] flex items-center gap-1.5 mb-3">
                          <MapPin size={13} className="text-[#A84A20]" />
                          <span>{evt.location}</span>
                        </div>
                      )}

                      <p className="text-xs sm:text-sm text-[#4A3B2C] leading-relaxed line-clamp-3 mb-4">
                        {evt.description_marathi || evt.description}
                      </p>

                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => {
                            setCurrentMonth(evt.month - 1);
                            setSelectedDay(evt.day);
                            setActiveView('calendar');
                            const el = document.getElementById('dinvishesh-interactive-workspace');
                            if (el) el.scrollIntoView({ behavior: 'smooth' });
                          }}
                          className="px-4 py-2 rounded-xl bg-[#A84A20] text-white font-bold text-xs shadow hover:bg-[#8D3B18] transition-all"
                        >
                          कॅलेंडरमध्ये संपूर्ण माहिती पहा →
                        </button>
                        <button
                          onClick={() => setSelectedModalEvent(evt)}
                          className="px-4 py-2 rounded-xl bg-white text-[#5C4A35] border border-[#E8D5A3] font-bold text-xs hover:bg-[#FAF2DE] transition-all"
                        >
                          तपशील वाचा
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* VIEW 3: HISTORICAL DATA VISUALIZATION                         */}
        {/* ============================================================== */}
        {activeView === 'visualizations' && (
          <div className="space-y-8">
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E8D5A3] shadow-md">
              <span className="text-xs font-bold uppercase tracking-widest text-[#A84A20]">
                ऐतिहासिक डेटा विश्लेषण
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl font-black text-[#1E1711] mt-1">
                दिनविशेष ऐतिहासिक आलेख व सांख्यिकी (Data Insights)
              </h2>
              <p className="text-xs sm:text-sm text-[#735F4D] mt-1">
                नोंदवलेल्या ऐतिहासिक घटनांचे व्यक्तिमत्त्व, प्रकार, किल्ले आणि वर्षनिहाय वस्तुनिष्ठ वर्गीकरण.
              </p>

              {/* 3 Metric Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                {/* Personality Distribution */}
                <div className="bg-[#FAF7F2] p-5 rounded-2xl border border-[#E8D5A3]">
                  <h3 className="font-serif font-bold text-sm text-[#1E1711] mb-4 flex items-center gap-2">
                    <CrownIcon />
                    <span>व्यक्तिमत्त्वनिहाय घटना</span>
                  </h3>
                  <div className="space-y-3">
                    {stats?.personality_distribution &&
                      Object.entries(stats.personality_distribution).map(([pers, count]) => (
                        <div key={pers}>
                          <div className="flex justify-between text-xs font-bold mb-1">
                            <span className="text-[#3D2E21]">{pers}</span>
                            <span className="text-[#A84A20]">{count} घटना</span>
                          </div>
                          <div className="h-2 rounded-full bg-white overflow-hidden border border-[#E8D5A3]">
                            <div
                              className="h-full bg-[#A84A20] rounded-full transition-all duration-700"
                              style={{ width: `${Math.min(100, (count / (stats.total_events || 1)) * 100)}%` }}
                            />
                          </div>
                        </div>
                      ))}
                  </div>
                </div>

                {/* Event Category Distribution */}
                <div className="bg-[#FAF7F2] p-5 rounded-2xl border border-[#E8D5A3]">
                  <h3 className="font-serif font-bold text-sm text-[#1E1711] mb-4 flex items-center gap-2">
                    <Layers size={15} />
                    <span>प्रसंग प्रकारानुसार वर्गीकरण</span>
                  </h3>
                  <div className="space-y-3">
                    {stats?.category_distribution &&
                      Object.entries(stats.category_distribution).slice(0, 5).map(([cat, count]) => (
                        <div key={cat}>
                          <div className="flex justify-between text-xs font-bold mb-1">
                            <span className="text-[#3D2E21]">{cat}</span>
                            <span className="text-[#D4A955]">{count} घटना</span>
                          </div>
                          <div className="h-2 rounded-full bg-white overflow-hidden border border-[#E8D5A3]">
                            <div
                              className="h-full bg-[#D4A955] rounded-full transition-all duration-700"
                              style={{ width: `${Math.min(100, (count / (stats.total_events || 1)) * 100)}%` }}
                            />
                          </div>
                        </div>
                      ))}
                  </div>
                </div>

                {/* Top Historic Locations / Forts */}
                <div className="bg-[#FAF7F2] p-5 rounded-2xl border border-[#E8D5A3]">
                  <h3 className="font-serif font-bold text-sm text-[#1E1711] mb-4 flex items-center gap-2">
                    <MapPin size={15} />
                    <span>प्रमुख ऐतिहासिक किल्ले व स्थाने</span>
                  </h3>
                  <div className="space-y-3">
                    {stats?.location_distribution &&
                      Object.entries(stats.location_distribution).slice(0, 5).map(([loc, count]) => (
                        <div key={loc}>
                          <div className="flex justify-between text-xs font-bold mb-1">
                            <span className="text-[#3D2E21]">{loc}</span>
                            <span className="text-[#5C4A35]">{count} प्रसंग</span>
                          </div>
                          <div className="h-2 rounded-full bg-white overflow-hidden border border-[#E8D5A3]">
                            <div
                              className="h-full bg-[#5C4A35] rounded-full transition-all duration-700"
                              style={{ width: `${Math.min(100, (count / (stats.total_events || 1)) * 100)}%` }}
                            />
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ============================================================== */}
      {/* 4. MODAL: DETAILED HISTORICAL RECORD & SOURCES                 */}
      {/* ============================================================== */}
      {selectedModalEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border-2 border-[#D4A955] shadow-2xl relative">
            {/* Modal Header */}
            <div className="sticky top-0 bg-[#1A1008] text-[#F3E8D0] p-6 flex items-center justify-between border-b border-[#D4A955]/30 z-10">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-[#A84A20] text-white text-xs font-bold rounded-full">
                  {selectedModalEvent.personality || selectedModalEvent.figure}
                </span>
                <span className="text-xs font-bold text-[#D4A955]">
                  {selectedModalEvent.day} {monthsMr[selectedModalEvent.month - 1]} {selectedModalEvent.year && `(${selectedModalEvent.year} ई.स.)`}
                </span>
              </div>

              <button
                onClick={() => setSelectedModalEvent(null)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
                title="Close modal"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 sm:p-8 space-y-6">
              <h2 className="font-serif text-2xl sm:text-3xl font-black text-[#1E1711] leading-snug">
                {selectedModalEvent.title_marathi || selectedModalEvent.title}
              </h2>

              {selectedModalEvent.location && (
                <div className="flex items-center gap-2 text-xs font-bold text-[#A84A20] bg-[#FAF2DE] p-3 rounded-xl border border-[#E8D5A3]">
                  <MapPin size={16} />
                  <span>ऐतिहासिक स्थान: {selectedModalEvent.location}</span>
                </div>
              )}

              {(selectedModalEvent.image_url || selectedModalEvent.image) && (
                <div className="rounded-2xl overflow-hidden border border-[#E8D5A3] max-h-72">
                  <img
                    src={selectedModalEvent.image_url || selectedModalEvent.image}
                    alt={selectedModalEvent.title_marathi || selectedModalEvent.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <div className="text-sm text-[#3D2E21] leading-relaxed whitespace-pre-line bg-[#FAF7F2] p-5 rounded-2xl border border-[#F0E6D2]">
                {selectedModalEvent.description_marathi || selectedModalEvent.description}
              </div>

              {selectedModalEvent.historical_significance && (
                <div className="p-4 rounded-2xl bg-gradient-to-r from-[#FFFDF9] to-[#FAF2DE] border border-[#D4A955]/40 space-y-1">
                  <div className="text-xs font-bold text-[#A84A20] uppercase tracking-wide">
                    🚩 ऐतिहासिक महत्त्व:
                  </div>
                  <p className="text-xs sm:text-sm text-[#4A3B2C] leading-relaxed">
                    {selectedModalEvent.historical_significance}
                  </p>
                </div>
              )}

              {/* Dispute Note */}
              {selectedModalEvent.is_disputed && (
                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 text-amber-900 text-xs">
                  <strong>⚠️ ऐतिहासिक स्रोतांमध्ये मतभेद:</strong>
                  <p className="mt-1 leading-relaxed">
                    {selectedModalEvent.dispute_note || 'या घटनेच्या तारखेबाबत विविध ऐतिहासिक स्रोतांमध्ये मतभेद आढळतात.'}
                  </p>
                </div>
              )}

              {/* Key Figures */}
              {selectedModalEvent.key_figures && selectedModalEvent.key_figures.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-[#5C4A35] uppercase tracking-wider mb-2">
                    महत्त्वाच्या ऐतिहासिक व्यक्ती:
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedModalEvent.key_figures.map((kf, i) => (
                      <span key={i} className="px-3 py-1 bg-[#F9F2E3] text-[#1E1711] text-xs font-bold rounded-lg border border-[#E8D5A3]">
                        {kf}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Source & References */}
              <div className="p-5 rounded-2xl bg-[#F9F2E3] border border-[#E8D5A3] space-y-2">
                <div className="text-xs font-bold text-[#1E1711] flex items-center justify-between">
                  <span>📚 प्रमाण संदर्भ व ऐतिहासिक आधार:</span>
                  {selectedModalEvent.source_type && (
                    <span className="px-2.5 py-0.5 rounded text-[10px] bg-white text-[#A84A20] font-bold border border-[#D4A955]">
                      {selectedModalEvent.source_type}
                    </span>
                  )}
                </div>
                <p className="text-xs text-[#5C4A35] leading-relaxed">
                  {selectedModalEvent.source_name || selectedModalEvent.sources}
                </p>
                {selectedModalEvent.source_description && (
                  <p className="text-[11px] text-[#7A6451] italic">
                    {selectedModalEvent.source_description}
                  </p>
                )}
                {selectedModalEvent.source_url && (
                  <a
                    href={selectedModalEvent.source_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-[#A84A20] font-bold hover:underline pt-1"
                  >
                    <span>ऑनलाइन ऐतिहासिक संदर्भ पहा</span>
                    <ExternalLink size={13} />
                  </a>
                )}
              </div>

              {/* Admin Direct Edit Action */}
              <div className="pt-3 border-t border-[#E8D5A3] flex items-center justify-between flex-wrap gap-2">
                <span className="text-[11px] text-[#8F7A66] font-mono">
                  नोंद आयडी: {selectedModalEvent.id}
                </span>
                <a
                  href="/admin"
                  onClick={() => {
                    localStorage.setItem('gsp_edit_din_id', selectedModalEvent.id);
                  }}
                  className="px-4 py-2 rounded-xl bg-[#1a1f2e] hover:bg-[#252c40] text-amber-300 hover:text-white text-xs font-bold inline-flex items-center gap-2 border border-amber-500/30 shadow-md transition-all"
                >
                  <ShieldCheck size={14} className="text-[#D4A955]" />
                  <span>✏️ हा प्रसंग ॲडमिन पॅनेलमध्ये संपादित करा (Edit in Admin)</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Lightbox Image Preview */}
      {lightboxImage && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 cursor-pointer"
          onClick={() => setLightboxImage(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh]">
            <img src={lightboxImage} alt="Historical Preview" className="max-w-full max-h-[85vh] object-contain rounded-2xl" />
            <button
              onClick={() => setLightboxImage(null)}
              className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/20 text-white flex items-center justify-center hover:bg-white/40"
            >
              <X size={20} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function CrownIcon() {
  return (
    <svg className="w-3.5 h-3.5 fill-current inline-block" viewBox="0 0 24 24">
      <path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5zm14 3c0 .6-.4 1-1 1H6c-.6 0-1-.4-1-1v-1h14v1z" />
    </svg>
  );
}
