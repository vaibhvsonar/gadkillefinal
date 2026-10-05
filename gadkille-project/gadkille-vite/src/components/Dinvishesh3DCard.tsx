import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  MapPin,
  BookOpen,
  ShieldCheck,
  Award,
  Sparkles,
  RotateCw,
  ExternalLink,
  Share2,
  Check,
  Maximize2
} from 'lucide-react';
import { type DinvisheshRecord } from '@/lib/api';
import { useSiteData } from '@/context/SiteContext';

interface Dinvishesh3DCardProps {
  event: DinvisheshRecord | null;
  selectedDate?: { day: number; month: number; year?: number };
  onDateChange?: (day: number, month: number) => void;
  onOpenModal?: (event: DinvisheshRecord) => void;
  theme?: 'dark' | 'parchment';
  className?: string;
  showNavControls?: boolean;
}

export const Dinvishesh3DCard: React.FC<Dinvishesh3DCardProps> = ({
  event,
  selectedDate,
  onDateChange,
  onOpenModal,
  theme = 'parchment',
  className = '',
  showNavControls = true,
}) => {
  const { t } = useSiteData();
  const cardRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // 3D Motion & Interactive States
  const [rotateX, setRotateX] = useState<number>(0);
  const [rotateY, setRotateY] = useState<number>(0);
  const [shine, setShine] = useState<{ x: number; y: number; opacity: number }>({ x: 50, y: 50, opacity: 0 });
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const [isFlipped, setIsFlipped] = useState<boolean>(false);
  const [isTransitioning, setIsTransitioning] = useState<boolean>(false);
  const [inView, setInView] = useState<boolean>(false);
  const [isTouch, setIsTouch] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [displayEvent, setDisplayEvent] = useState<DinvisheshRecord | null>(event);

  const monthsMr = useMemo(() => [
    'जानेवारी', 'फेब्रुवारी', 'मार्च', 'एप्रिल', 'मे', 'जून',
    'जुलै', 'ऑगस्ट', 'सप्टेंबर', 'ऑक्टोबर', 'नोव्हेंबर', 'डिसेंबर'
  ], []);

  const monthsEn = useMemo(() => [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ], []);

  // Detect Touch screen & reduced motion
  useEffect(() => {
    const touchQuery = window.matchMedia('(hover: none) or (pointer: coarse)');
    setIsTouch(touchQuery.matches);

    const handleTouchChange = (e: MediaQueryListEvent) => setIsTouch(e.matches);
    touchQuery.addEventListener('change', handleTouchChange);
    return () => touchQuery.removeEventListener('change', handleTouchChange);
  }, []);

  // Intersection Observer for 3D Entrance Animation
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
        }
      },
      { threshold: 0.15 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Smooth Date/Event Transition Animation (Phase 1: fade-out/scale down -> swap -> Phase 2: fade-in)
  useEffect(() => {
    if (event?.id !== displayEvent?.id) {
      setIsTransitioning(true);
      const timer = setTimeout(() => {
        setDisplayEvent(event);
        setIsTransitioning(false);
        setIsFlipped(false); // reset flip on event change
      }, 240);
      return () => clearTimeout(timer);
    } else {
      setDisplayEvent(event);
    }
  }, [event]);

  // Mouse Move Handler for 3D Tilt and Specular Highlight
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isTouch || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    // Normalizing between -1 and 1
    const normX = (x - centerX) / centerX;
    const normY = (y - centerY) / centerY;

    // Maximum tilt clamped strictly to ±5 degrees
    const rotX = -normY * 5;
    const rotY = normX * 5;

    setRotateX(rotX);
    setRotateY(rotY);

    // Specular light position
    const shineX = (x / rect.width) * 100;
    const shineY = (y / rect.height) * 100;
    setShine({ x: shineX, y: shineY, opacity: 1 });
  };

  const handleMouseEnter = () => {
    if (!isTouch) setIsHovered(true);
  };

  const handleMouseLeave = () => {
    if (!isTouch) {
      setIsHovered(false);
      setRotateX(0);
      setRotateY(0);
      setShine(prev => ({ ...prev, opacity: 0 }));
    }
  };

  // Quick Share event
  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!displayEvent) return;
    const title = displayEvent.title_marathi || displayEvent.title;
    const text = `🚩 दिनविशेष: ${title}\n📅 तारीख: ${displayEvent.day} ${monthsMr[displayEvent.month - 1]} ${displayEvent.year ? `(${displayEvent.year} ई.स.)` : ''}\n📍 स्थान: ${displayEvent.location || 'महाराष्ट्र'}\n\nअधिक माहिती: ${window.location.origin}/dinvishesh`;

    if (navigator.share) {
      navigator.share({ title: 'दिनविशेष - गडकिल्ले', text, url: window.location.href }).catch(() => {});
    } else {
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Navigating days
  const handlePrevDay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!selectedDate || !onDateChange) return;
    let newDay = selectedDate.day - 1;
    let newMonth = selectedDate.month;
    if (newDay < 1) {
      newMonth = newMonth === 1 ? 12 : newMonth - 1;
      newDay = 30;
    }
    onDateChange(newDay, newMonth);
  };

  const handleNextDay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!selectedDate || !onDateChange) return;
    let newDay = selectedDate.day + 1;
    let newMonth = selectedDate.month;
    if (newDay > 31) {
      newMonth = newMonth === 12 ? 1 : newMonth + 1;
      newDay = 1;
    }
    onDateChange(newDay, newMonth);
  };

  // Color & Theme setup
  const isDark = theme === 'dark';

  // Fallback defaults if no event on date
  const eventTitle = displayEvent
    ? (displayEvent.title_marathi || displayEvent.title)
    : t('या तारखेसाठी विशेष नोंद शोधत आहोत...', 'Historical chronicle for this day');
  const eventDesc = displayEvent
    ? (displayEvent.description_marathi || displayEvent.description)
    : t('छत्रपती शिवाजी महाराज व छत्रपती संभाजी महाराजांच्या गौरवशाली इतिहासातील अनेक प्रसंग या भूमीत घडले आहेत.', 'Many momentous historic events took place across the Sahyadri.');
  const eventImg = displayEvent?.image_url || displayEvent?.image || '/images/raigad.jpg';
  const personality = displayEvent?.personality || displayEvent?.figure || 'छत्रपती शिवाजी महाराज';
  const eventYear = displayEvent?.year;
  const eventDay = displayEvent?.day || selectedDate?.day || new Date().getDate();
  const eventMonth = displayEvent?.month ? displayEvent.month - 1 : (selectedDate?.month ? selectedDate.month - 1 : new Date().getMonth());
  const location = displayEvent?.location || 'महाराष्ट्र';

  // Card Transform Calculation
  const transformCard = useMemo(() => {
    if (!inView) {
      return 'perspective(1200px) translateY(28px) rotateX(3deg) scale(0.96)';
    }
    if (isFlipped) {
      return `perspective(1200px) rotateY(180deg) scale(${isHovered ? 1.01 : 1})`;
    }
    return `perspective(1200px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(${isHovered ? 1.015 : 1})`;
  }, [inView, isFlipped, rotateX, rotateY, isHovered]);

  // Card Shadow Calculation based on tilt
  const dynamicShadow = useMemo(() => {
    if (isFlipped) {
      return '0 25px 60px -15px rgba(20, 10, 4, 0.45)';
    }
    if (isHovered && !isTouch) {
      const shadowX = -rotateY * 3.5;
      const shadowY = rotateX * 3.5 + 28;
      return `${shadowX}px ${shadowY}px 55px -10px rgba(18, 10, 4, 0.42), 0 0 25px rgba(212, 169, 85, 0.15)`;
    }
    return '0 20px 45px -12px rgba(18, 10, 4, 0.28)';
  }, [isFlipped, isHovered, isTouch, rotateX, rotateY]);

  return (
    <div
      ref={containerRef}
      className={`relative w-full py-4 select-none ${className}`}
      style={{ perspective: '1400px' }}
    >
      {/* ── 3D AMBIENT BACKGROUND PARTICLES & ATMOSPHERE ── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        {/* Warm saffron aura */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-radial from-[#C1521F]/10 via-[#B58A45]/5 to-transparent blur-3xl" />
        
        {/* Subtle floating gold embers */}
        <div className="absolute top-1/4 left-1/5 w-2 h-2 rounded-full bg-[#D4A955]/40 blur-[1px] animate-particle-1" />
        <div className="absolute top-3/4 left-1/4 w-1.5 h-1.5 rounded-full bg-[#C1521F]/50 blur-[1px] animate-particle-2" />
        <div className="absolute top-1/3 right-1/4 w-2.5 h-2.5 rounded-full bg-[#E8D5A3]/40 blur-[1px] animate-particle-3" />
        <div className="absolute bottom-1/4 right-1/6 w-2 h-2 rounded-full bg-[#D4A955]/30 blur-[1px] animate-particle-1" />
      </div>

      {/* ── MAIN 3D ROTATABLE CONTAINER ── */}
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={{
          transform: transformCard,
          transition: isHovered && !isFlipped
            ? 'transform 0.12s ease-out, box-shadow 0.2s ease-out'
            : 'transform 0.75s cubic-bezier(0.25, 1, 0.5, 1), opacity 0.6s ease-out, box-shadow 0.5s ease-out',
          boxShadow: dynamicShadow,
          willChange: 'transform',
        }}
        className={`relative w-full max-w-[820px] mx-auto rounded-3xl preserve-3d cursor-default z-10 transition-opacity duration-300 ${
          isTransitioning ? 'opacity-40 scale-[0.98]' : 'opacity-100'
        }`}
      >
        {/* ── SPECULAR LIGHT REFLECTION SHEEN (FOLLOWS CURSOR) ── */}
        {!isTouch && (
          <div
            className="absolute inset-0 rounded-3xl pointer-events-none z-30 transition-opacity duration-300"
            style={{
              opacity: shine.opacity * 0.45,
              background: `radial-gradient(550px circle at ${shine.x}% ${shine.y}%, rgba(255, 235, 185, 0.28) 0%, rgba(255, 255, 255, 0.04) 40%, transparent 70%)`,
            }}
          />
        )}

        {/* ========================================================================= */}
        {/* FRONT SIDE: THE 3D HISTORICAL CARD                                       */}
        {/* ========================================================================= */}
        <div
          className={`w-full rounded-3xl backface-hidden border-2 transition-colors duration-300 overflow-hidden relative ${
            isDark
              ? 'bg-[#181008] border-[#B58A45]/40 text-[#F3E8D0]'
              : 'bg-[#FCF8EE] border-[#B58A45]/50 text-[#1E140B]'
          }`}
          style={{
            transformStyle: 'preserve-3d',
            backgroundImage: `radial-gradient(circle at 50% 0%, ${isDark ? 'rgba(193,82,31,0.08)' : 'rgba(212,169,85,0.12)'} 0%, transparent 75%)`,
          }}
        >
          {/* Historical Parchment Watermark (Rajmudra) */}
          <div
            className="absolute right-[-20px] bottom-[-20px] w-80 h-80 opacity-[0.04] pointer-events-none select-none bg-contain bg-no-repeat bg-center"
            style={{
              backgroundImage: 'url(/images/logo-dark.png)',
              transform: 'translateZ(10px) rotate(-8deg)',
            }}
          />

          {/* Intricate Antique Brass Corner Motifs */}
          <div className="absolute top-2 left-2 w-6 h-6 border-t-2 border-l-2 border-[#B58A45]/60 rounded-tl-sm pointer-events-none" />
          <div className="absolute top-2 right-2 w-6 h-6 border-t-2 border-r-2 border-[#B58A45]/60 rounded-tr-sm pointer-events-none" />
          <div className="absolute bottom-2 left-2 w-6 h-6 border-b-2 border-l-2 border-[#B58A45]/60 rounded-bl-sm pointer-events-none" />
          <div className="absolute bottom-2 right-2 w-6 h-6 border-b-2 border-r-2 border-[#B58A45]/60 rounded-br-sm pointer-events-none" />

          {/* 1. TOP HISTORICAL BANNER */}
          <div
            className={`px-6 sm:px-10 pt-7 pb-4 text-center border-b ${
              isDark ? 'border-[#B58A45]/20 bg-[#120B05]/60' : 'border-[#E8D5A3] bg-[#F5ECDC]/50'
            }`}
            style={{ transform: 'translateZ(25px)' }}
          >
            {/* Header Title with Traditional Saffron Scroll Aesthetic */}
            <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-gradient-to-r from-[#A84A20]/20 via-[#D4A955]/25 to-[#A84A20]/20 border border-[#D4A955]/40 text-[#C1521F] font-bold text-xs uppercase tracking-widest shadow-sm">
              <Sparkles size={13} className="text-[#D4A955]" />
              <span>📜 {t('दिनविशेष', 'DINVISHESH')}</span>
              <Sparkles size={13} className="text-[#D4A955]" />
            </div>

            <p className={`font-serif text-xs sm:text-sm mt-1.5 tracking-wider font-semibold ${isDark ? 'text-[#D4A955]' : 'text-[#8B3A14]'}`}>
              {t('इतिहासातील आजचा दिवस', 'Today in Maratha History')}
            </p>

            {/* Date Display with Day hopping arrows */}
            <div className="mt-3 flex items-center justify-center gap-3">
              {showNavControls && onDateChange && (
                <button
                  onClick={handlePrevDay}
                  className={`p-2 rounded-full transition-all hover:scale-110 active:scale-95 ${
                    isDark ? 'hover:bg-white/10 text-white/70 hover:text-white' : 'hover:bg-[#E8D5A3] text-[#5C4A35]'
                  }`}
                  title={t('मागील दिवस', 'Previous day')}
                >
                  <ChevronLeft size={20} />
                </button>
              )}

              <div className="px-5 py-2 rounded-2xl bg-gradient-to-b from-white/10 to-transparent border border-[#B58A45]/30 shadow-inner">
                <span className="font-serif text-xl sm:text-2xl lg:text-3xl font-black tracking-tight text-[#C1521F]">
                  {eventDay} {monthsMr[eventMonth]}
                </span>
                {eventYear && (
                  <span className={`block text-xs font-serif font-bold tracking-wider ${isDark ? 'text-white/60' : 'text-[#5C4A35]'}`}>
                    वर्ष {eventYear} ई.स. (शके {Math.max(1, eventYear - 78)})
                  </span>
                )}
              </div>

              {showNavControls && onDateChange && (
                <button
                  onClick={handleNextDay}
                  className={`p-2 rounded-full transition-all hover:scale-110 active:scale-95 ${
                    isDark ? 'hover:bg-white/10 text-white/70 hover:text-white' : 'hover:bg-[#E8D5A3] text-[#5C4A35]'
                  }`}
                  title={t('पुढील दिवस', 'Next day')}
                >
                  <ChevronRight size={20} />
                </button>
              )}
            </div>
          </div>

          {/* 2. CARD BODY (PARALLAX IMAGE + ROYAL INFO + CALL TO ACTION) */}
          <div className="p-6 sm:p-9 space-y-6">
            {/* Parallax Historical Image Container */}
            <div
              className="relative rounded-2xl overflow-hidden aspect-[16/9] sm:aspect-[21/9] border-2 border-[#B58A45]/40 shadow-xl group/img"
              style={{
                transform: isHovered && !isTouch
                  ? `translateZ(34px) translateX(${-rotateY * 0.8}px) translateY(${-rotateX * 0.8}px)`
                  : 'translateZ(26px)',
                transition: 'transform 0.25s ease-out',
              }}
            >
              <img
                src={eventImg}
                alt={eventTitle}
                loading="lazy"
                className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover/img:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/20" />

              {/* Royal Seal & Personality Badge Overlay */}
              <div
                className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none"
                style={{ transform: 'translateZ(42px)' }}
              >
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#A84A20] text-white font-bold text-xs shadow-lg border border-[#D4A955]/40">
                  <span>👑</span>
                  <span>{personality}</span>
                </div>

                {displayEvent?.verification_status === 'verified' && (
                  <div className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-950/80 text-emerald-300 font-semibold text-[11px] border border-emerald-500/40 backdrop-blur-sm">
                    <ShieldCheck size={13} className="text-emerald-400" />
                    <span>प्रमाणित संदर्भ</span>
                  </div>
                )}
              </div>

              {/* Event Location Badge on Image */}
              <div
                className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-white/90"
                style={{ transform: 'translateZ(40px)' }}
              >
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-black/60 backdrop-blur-sm border border-white/20 font-medium">
                  <MapPin size={13} className="text-[#D4A955]" />
                  <span>{location}</span>
                </span>

                {displayEvent?.event_type && (
                  <span className="px-2.5 py-1 rounded-xl bg-white/10 backdrop-blur-sm text-[#D4A955] font-semibold text-[11px] border border-[#D4A955]/30">
                    {displayEvent.event_type}
                  </span>
                )}
              </div>
            </div>

            {/* Event Title & Description with Depth */}
            <div
              className="space-y-3"
              style={{ transform: 'translateZ(30px)' }}
            >
              <h3 className={`font-serif text-2xl sm:text-3xl font-black leading-snug tracking-tight ${
                isDark ? 'text-white' : 'text-[#1E140B]'
              }`}>
                {eventTitle}
              </h3>

              <p className={`text-sm sm:text-base leading-relaxed line-clamp-3 font-medium ${
                isDark ? 'text-white/80' : 'text-[#3D2C1D]'
              }`}>
                {eventDesc}
              </p>
            </div>

            {/* 3. CARD ACTION BAR (FLIP FOR FULL DETAILS + SHARE) */}
            <div
              className={`pt-5 border-t flex flex-wrap items-center justify-between gap-4 ${
                isDark ? 'border-[#B58A45]/20' : 'border-[#E8D5A3]'
              }`}
              style={{ transform: 'translateZ(36px)' }}
            >
              {/* Flip Button */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsFlipped(true);
                }}
                className="inline-flex items-center gap-2.5 px-6 py-3 rounded-2xl bg-gradient-to-r from-[#A84A20] via-[#C1521F] to-[#8B3A14] text-white font-bold text-xs sm:text-sm shadow-xl shadow-[rgba(168,74,32,0.35)] hover:brightness-110 active:scale-95 transition-all border border-[#D4A955]/40"
              >
                <BookOpen size={16} className="text-[#F3E8D0]" />
                <span>{t('📖 अधिक माहिती (3D Flip)', 'View Full Chronicle')}</span>
                <RotateCw size={14} className="opacity-80 group-hover:rotate-180 transition-transform" />
              </button>

              <div className="flex items-center gap-2">
                {/* Fullscreen Modal trigger if provided */}
                {onOpenModal && displayEvent && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenModal(displayEvent);
                    }}
                    className={`p-3 rounded-2xl border transition-all hover:scale-105 active:scale-95 ${
                      isDark
                        ? 'border-[#B58A45]/30 bg-white/5 text-[#D4A955] hover:bg-white/10'
                        : 'border-[#B58A45]/40 bg-[#F9F2E3] text-[#5C4A35] hover:bg-[#E8D5A3]'
                    }`}
                    title={t('मोठ्या पडद्यावर उघडा', 'Expand full view')}
                  >
                    <Maximize2 size={16} />
                  </button>
                )}

                {/* Share Button */}
                <button
                  type="button"
                  onClick={handleShare}
                  className={`inline-flex items-center gap-1.5 px-4 py-3 rounded-2xl border transition-all hover:scale-105 active:scale-95 text-xs font-bold ${
                    isDark
                      ? 'border-[#B58A45]/30 bg-white/5 text-white/80 hover:text-white hover:bg-white/10'
                      : 'border-[#B58A45]/40 bg-[#F9F2E3] text-[#5C4A35] hover:bg-[#E8D5A3]'
                  }`}
                  title="Share event"
                >
                  {copied ? <Check size={15} className="text-emerald-500" /> : <Share2 size={15} />}
                  <span>{copied ? t('कॉपी झाले!', 'Copied!') : t('शेअर करा', 'Share')}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* BACK SIDE: DETAILED HISTORICAL CHRONICLE (FLIPPED 180 DEG)               */}
        {/* ========================================================================= */}
        <div
          className={`absolute inset-0 w-full h-full rounded-3xl backface-hidden border-2 p-6 sm:p-9 flex flex-col justify-between overflow-y-auto ${
            isDark
              ? 'bg-[#181008] border-[#D4A955]/50 text-[#F3E8D0]'
              : 'bg-[#FCF8EE] border-[#B58A45]/60 text-[#1E140B]'
          }`}
          style={{
            transform: 'rotateY(180deg)',
            backgroundImage: `radial-gradient(circle at 50% 100%, ${isDark ? 'rgba(193,82,31,0.1)' : 'rgba(212,169,85,0.15)'} 0%, transparent 80%)`,
          }}
        >
          {/* Back side Top Header */}
          <div>
            <div className="flex items-center justify-between gap-3 pb-4 border-b border-[#B58A45]/30">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-[#A84A20] text-white">
                  <BookOpen size={18} />
                </span>
                <div>
                  <h4 className="font-serif font-black text-lg sm:text-xl text-[#C1521F]">
                    {t('📖 सविस्तर ऐतिहासिक दस्तऐवज', 'Detailed Historical Chronicle')}
                  </h4>
                  <span className={`text-[11px] font-semibold ${isDark ? 'text-white/60' : 'text-[#5C4A35]'}`}>
                    {eventDay} {monthsMr[eventMonth]} {eventYear ? `· ${eventYear} ई.स.` : ''}
                  </span>
                </div>
              </div>

              {/* Flip back button (top right) */}
              <button
                type="button"
                onClick={() => setIsFlipped(false)}
                className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all hover:scale-105 active:scale-95 flex items-center gap-1.5 ${
                  isDark
                    ? 'border-[#B58A45]/40 bg-white/10 text-white hover:bg-white/20'
                    : 'border-[#B58A45] bg-[#E8D5A3] text-[#1E140B] hover:bg-[#D4A955]'
                }`}
              >
                <span>← {t('मागे जा', 'Back')}</span>
              </button>
            </div>

            {/* Back side Content */}
            <div className="mt-5 space-y-4 text-xs sm:text-sm">
              {/* Event Title */}
              <h5 className="font-serif font-black text-xl text-[#B58A45]">
                {eventTitle}
              </h5>

              {/* Detailed Historical Description */}
              <div className={`p-4 rounded-2xl border leading-relaxed whitespace-pre-line ${
                isDark
                  ? 'bg-black/40 border-white/10 text-white/90'
                  : 'bg-[#F9F2E3] border-[#E8D5A3] text-[#3D2C1D]'
              }`}>
                {displayEvent?.description_marathi || displayEvent?.description || eventDesc}
              </div>

              {/* Historical Significance Quote */}
              {displayEvent?.historical_significance && (
                <div className="p-3.5 rounded-xl bg-gradient-to-r from-[#A84A20]/15 to-[#D4A955]/15 border border-[#D4A955]/40 space-y-1">
                  <div className="text-[11px] font-bold text-[#C1521F] flex items-center gap-1.5 uppercase">
                    <Award size={14} />
                    <span>{t('ऐतिहासिक महत्त्व', 'Historical Significance')}:</span>
                  </div>
                  <p className={`text-xs leading-relaxed font-medium italic ${isDark ? 'text-white/90' : 'text-[#3D2C1D]'}`}>
                    "{displayEvent.historical_significance}"
                  </p>
                </div>
              )}

              {/* Key Figures & Personalities */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className={`p-3 rounded-xl border ${isDark ? 'bg-white/5 border-white/10' : 'bg-[#FAF2DE] border-[#E8D5A3]'}`}>
                  <span className="text-[11px] font-bold text-[#A84A20] block mb-1">
                    👑 {t('संबंधित व्यक्तिमत्त्व', 'Key Figure')}
                  </span>
                  <span className="font-semibold text-xs">{personality}</span>
                </div>

                <div className={`p-3 rounded-xl border ${isDark ? 'bg-white/5 border-white/10' : 'bg-[#FAF2DE] border-[#E8D5A3]'}`}>
                  <span className="text-[11px] font-bold text-[#A84A20] block mb-1">
                    📍 {t('स्थान / किल्ला', 'Historical Location')}
                  </span>
                  <span className="font-semibold text-xs">{location}</span>
                </div>
              </div>

              {/* Historical Sources */}
              {(displayEvent?.source_name || displayEvent?.sources) && (
                <div className={`p-3 rounded-xl border text-[11px] ${
                  isDark ? 'bg-white/5 border-white/10 text-white/70' : 'bg-[#F5ECDC] border-[#E8D5A3] text-[#5C4A35]'
                }`}>
                  <span className="font-bold text-[#D4A955] block mb-0.5">📚 {t('प्रामाणिक संदर्भ ग्रंथ / बखर', 'Historical References')}:</span>
                  <span>{displayEvent.source_name || displayEvent.sources}</span>
                  {displayEvent.source_type && <span className="opacity-75"> ({displayEvent.source_type})</span>}
                </div>
              )}
            </div>
          </div>

          {/* Back side Bottom Actions */}
          <div className="pt-4 border-t border-[#B58A45]/30 flex items-center justify-between gap-3 mt-4">
            <button
              type="button"
              onClick={() => setIsFlipped(false)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#A84A20] text-white text-xs font-bold hover:bg-[#8D3B18] transition-all shadow"
            >
              <RotateCw size={13} />
              <span>{t('← समोरचे कार्ड पहा (Flip Front)', 'Back to Front')}</span>
            </button>

            <button
              type="button"
              onClick={handleShare}
              className={`p-2.5 rounded-xl border transition-all ${
                isDark ? 'border-white/20 text-white hover:bg-white/10' : 'border-[#B58A45]/40 text-[#5C4A35] hover:bg-[#E8D5A3]'
              }`}
              title="Share"
            >
              <Share2 size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
