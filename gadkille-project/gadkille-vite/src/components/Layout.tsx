import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, MapPin, Phone, Mail, Heart, Globe, ChevronDown } from 'lucide-react';
import { useSiteData } from '@/context/SiteContext';

interface NavGroup {
  id: string;
  labelMr: string;
  labelEn: string;
  href?: string;
  children?: { href: string; labelMr: string; labelEn: string }[];
}

const navGroups: NavGroup[] = [
  { id: 'home', href: '/', labelMr: 'मुखपृष्ठ', labelEn: 'Home' },
  { id: 'dinvishesh', href: '/dinvishesh', labelMr: 'दिनविशेष', labelEn: 'Dinvishesh' },
  {
    id: 'explore',
    labelMr: 'एक्सप्लोर',
    labelEn: 'Explore',
    children: [
      { href: '/forts', labelMr: 'गडकिल्ले', labelEn: 'Forts' },
      { href: '/dinvishesh', labelMr: 'दिनविशेष (इतिहास)', labelEn: 'Dinvishesh (History)' },
      { href: '/organizations', labelMr: 'संलग्न संस्था', labelEn: 'Associated Orgs' },
      { href: '/partners', labelMr: 'भागीदार शाळा व संस्था', labelEn: 'Partner Schools' },
      { href: '/map', labelMr: 'नकाशा', labelEn: 'Interactive Map' },
      { href: '/gallery', labelMr: 'गॅलरी', labelEn: 'Photo Gallery' },
    ],
  },
  {
    id: 'work',
    labelMr: 'आमचे कार्य',
    labelEn: 'Our Work',
    children: [
      { href: '/conservation', labelMr: 'संवर्धन प्रकल्प', labelEn: 'Conservation' },
      { href: '/events', labelMr: 'कार्यक्रम व मोहिमा', labelEn: 'Events & Drives' },
      { href: '/education', labelMr: 'प्रश्नमंजुषा', labelEn: 'Quiz' },
      { href: '/news', labelMr: 'बातम्या व लेख', labelEn: 'News & Articles' },
    ],
  },
  {
    id: 'involved',
    labelMr: 'सहभाग',
    labelEn: 'Get Involved',
    children: [
      { href: '/volunteer', labelMr: 'स्वयंसेवक बना', labelEn: 'Volunteer' },
      { href: '/certificate', labelMr: 'प्रमाणपत्र', labelEn: 'Certificate' },
      { href: '/transparency', labelMr: 'आर्थिक पारदर्शकता', labelEn: 'Transparency' },
    ],
  },
  { id: 'about', href: '/about', labelMr: 'आमच्याविषयी', labelEn: 'About Us' },
];

const footerColumns = [
  {
    headingMr: 'गडकिल्ले व इतिहास',
    headingEn: 'Forts & History',
    links: [
      { href: '/forts', labelMr: 'सर्व गडकिल्ले', labelEn: 'All Forts' },
      { href: '/dinvishesh', labelMr: 'दिनविशेष (ऐतिहासिक कॅलेंडर)', labelEn: 'Dinvishesh Calendar' },
      { href: '/map', labelMr: 'नकाशा', labelEn: 'Interactive Map' },
      { href: '/gallery', labelMr: 'गॅलरी', labelEn: 'Photo Gallery' },
    ],
  },
  {
    headingMr: 'संवर्धन व शिक्षण',
    headingEn: 'Conservation & Edu',
    links: [
      { href: '/conservation', labelMr: 'चालू प्रकल्प', labelEn: 'Active Projects' },
      { href: '/events', labelMr: 'कार्यक्रम', labelEn: 'Events & Drives' },
      { href: '/volunteer', labelMr: 'स्वयंसेवक बना', labelEn: 'Become a Volunteer' },
    ],
  },
  {
    headingMr: 'संस्था व पाठबळ',
    headingEn: 'Organizations',
    links: [
      { href: '/organizations', labelMr: 'संलग्न संस्था', labelEn: 'Associated Orgs' },
      { href: '/partners', labelMr: 'सहकारी शाळा', labelEn: 'Partner Schools' },
      { href: '/about', labelMr: 'आमच्याविषयी', labelEn: 'About Us' },
      { href: '/transparency', labelMr: 'पारदर्शकता', labelEn: 'Transparency' },
    ],
  },
  {
    headingMr: 'मदत व संपर्क',
    headingEn: 'Support & Contact',
    links: [
      { href: '/donate', labelMr: 'देणगी द्या', labelEn: 'Donate' },
      { href: '/certificate', labelMr: 'प्रमाणपत्र', labelEn: 'Certificate' },
      { href: '/contact', labelMr: 'संपर्क', labelEn: 'Contact Us' },
    ],
  },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [mobileAccordion, setMobileAccordion] = useState<string | null>('explore');
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const { pathname } = useLocation();
  const { settings, lang, setLang, t } = useSiteData();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setOpenDropdown(null);
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  }, [pathname]);

  useEffect(() => {
    if (!mobileOpen) return;
    closeBtnRef.current?.focus();
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [mobileOpen]);

  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[200] focus:px-4 focus:py-2 focus:bg-[#C1521F] focus:text-white focus:rounded-lg focus:font-bold focus:text-sm"
      >
        {t('मुख्य सामग्रीवर जा', 'Skip to main content')}
      </a>

      <header
        role="banner"
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200 print:hidden bg-[#FFFDF9] ${
          scrolled
            ? 'shadow-[0_6px_24px_rgba(26,16,8,0.14)] border-b border-[#E2CFA9]'
            : 'backdrop-blur-md border-b border-[#E8D5A3]'
        }`}
      >
        {/* Top Saffron-Gold Heritage Accent Bar */}
        <div
          className="h-[3px] w-full"
          style={{
            background:
              'linear-gradient(90deg, #8B3A14 0%, #C1521F 35%, #D4A955 50%, #C1521F 65%, #8B3A14 100%)',
          }}
        />

        <div className="w-full max-w-[1440px] mx-auto px-3 sm:px-5 h-[68px] flex items-center justify-between gap-2">
          {/* Brand Logo + High-Contrast Title */}
          <Link to="/" className="flex items-center gap-2.5 shrink-0 group">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center overflow-hidden shadow-md border border-[#B58A45] shrink-0 bg-[#1A1008]">
              <img
                src="/images/logo-white.png"
                alt="GSP Logo"
                className="w-8 h-8 object-contain"
              />
            </div>
            <div className="leading-tight" data-no-translate>
              <div className="font-bold text-[14px] sm:text-[15px] tracking-tight font-serif whitespace-nowrap text-[#1A1008]">
                {lang === 'en'
                  ? 'Gadkille Sanvardhan'
                  : settings.nameMarathi || 'गड-किल्ले संवर्धन प्रतिष्ठान'}
              </div>
              <div className="text-[10px] sm:text-[11px] font-bold tracking-[0.02em] whitespace-nowrap text-[#C1521F]">
                {lang === 'en'
                  ? '॥ Ayushyacha Ekach Pran, Gadkille Sanvardhan ॥'
                  : '॥ आयुष्याचा एकचं प्रण, गडकिल्ले संवर्धन ॥'}
              </div>
            </div>
          </Link>

          {/* Desktop Navigation Pills with Dropdowns */}
          <nav
            role="navigation"
            aria-label={t('मुख्य नेव्हिगेशन', 'Main Navigation')}
            className="hidden lg:flex items-center gap-1 bg-[#F6EFE0] px-2 py-1 rounded-xl border border-[#E5D5B5] shrink"
            data-no-translate
          >
            {navGroups.map(group => {
              if (group.href) {
                const active =
                  group.href === '/' ? pathname === '/' : pathname.startsWith(group.href);
                return (
                  <Link
                    key={group.id}
                    to={group.href}
                    className={`px-3 py-1.5 rounded-lg text-[13px] font-bold transition-all duration-150 whitespace-nowrap ${
                      active
                        ? 'bg-[#C1521F] text-white shadow-sm'
                        : 'text-[#1A1008] hover:bg-[#EADBC0] hover:text-[#C1521F]'
                    }`}
                  >
                    {lang === 'en' ? group.labelEn : group.labelMr}
                  </Link>
                );
              }

              const childActive = group.children?.some(c => pathname.startsWith(c.href));
              const isOpen = openDropdown === group.id;

              return (
                <div
                  key={group.id}
                  className="relative"
                  onMouseEnter={() => setOpenDropdown(group.id)}
                  onMouseLeave={() => setOpenDropdown(null)}
                >
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    onClick={() => setOpenDropdown(isOpen ? null : group.id)}
                    className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-[13px] font-bold transition-all duration-150 whitespace-nowrap ${
                      childActive
                        ? 'bg-[#C1521F] text-white shadow-sm'
                        : 'text-[#1A1008] hover:bg-[#EADBC0] hover:text-[#C1521F]'
                    }`}
                  >
                    <span>{lang === 'en' ? group.labelEn : group.labelMr}</span>
                    <ChevronDown
                      size={14}
                      className={`transition-transform duration-150 ${isOpen ? 'rotate-180' : ''}`}
                    />
                  </button>

                  {isOpen && group.children && (
                    <div className="absolute left-0 top-full pt-1.5 z-50 min-w-[200px]">
                      <div className="bg-white rounded-xl shadow-xl border border-[#E8D5A3] p-1.5 space-y-0.5">
                        {group.children.map(child => {
                          const isChildActive = pathname.startsWith(child.href);
                          return (
                            <Link
                              key={child.href}
                              to={child.href}
                              className={`block px-3.5 py-2 rounded-lg text-xs font-bold transition-colors ${
                                isChildActive
                                  ? 'bg-[#C1521F] text-white'
                                  : 'text-[#1A1008] hover:bg-[#F9F2E3] hover:text-[#C1521F]'
                              }`}
                            >
                              {lang === 'en' ? child.labelEn : child.labelMr}
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </nav>

          {/* Right Action Buttons + Language Toggle */}
          <div className="flex items-center gap-1.5 shrink-0" data-no-translate>
            {/* Marathi / English Language Switcher */}
            <div
              className="inline-flex items-center rounded-lg border border-[#D8C39E] bg-[#F6EFE0] p-0.5"
              title="Change Language / भाषा बदला"
            >
              <button
                type="button"
                onClick={() => setLang('mr')}
                className={`px-2 py-1 rounded-md text-[11.5px] font-bold transition-all ${
                  lang === 'mr' ? 'bg-[#C1521F] text-white' : 'text-[#1A1008]'
                }`}
              >
                मराठी
              </button>
              <button
                type="button"
                onClick={() => setLang('en')}
                className={`px-2 py-1 rounded-md text-[11.5px] font-bold transition-all ${
                  lang === 'en' ? 'bg-[#C1521F] text-white' : 'text-[#1A1008]'
                }`}
              >
                EN
              </button>
            </div>

            <Link
              to="/contact"
              className="hidden md:inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[12px] font-bold border border-[#D8C39E] bg-[#F9F2E3] hover:bg-[#EFE2C6] text-[#1A1008] transition-colors whitespace-nowrap"
            >
              <span>📞</span>
              <span>{t('संपर्क', 'Contact')}</span>
            </Link>

            <Link
              to="/donate"
              className="hidden sm:inline-flex items-center gap-1 px-3 py-1.5 rounded-lg font-bold text-[12px] bg-[#C1521F] text-white shadow-md hover:scale-[1.02] transition-transform whitespace-nowrap"
            >
              <Heart size={13} className="fill-white" />
              <span>{t('देणगी द्या', 'Donate')}</span>
            </Link>

            <button
              className="lg:hidden w-10 h-10 flex items-center justify-center rounded-lg border border-[#D8C39E] bg-[#F6EFE0] hover:bg-[#EADBC0] text-[#1A1008] transition-colors"
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
            >
              <Menu size={22} />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile / Tablet Navigation Drawer */}
      {mobileOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/60 z-[60] lg:hidden backdrop-blur-xs"
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />
          <aside
            role="dialog"
            aria-modal="true"
            aria-label={t('मोबाईल मेनू', 'Mobile Menu')}
            className="fixed top-0 right-0 bottom-0 w-[85%] max-w-[340px] z-[70] flex flex-col overflow-y-auto border-l-2 border-[#C1521F] shadow-2xl bg-[#FFFDF9]"
            data-no-translate
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#E5D5B5] bg-[#F6EFE0]">
              <div>
                <div className="font-bold text-base font-serif text-[#1A1008]">
                  {lang === 'en' ? settings.nameEnglish : settings.nameMarathi}
                </div>
                <div className="text-[11px] font-bold tracking-wider mt-0.5 text-[#C1521F]">
                  {lang === 'en' ? 'Maharashtra State' : settings.state}
                </div>
              </div>
              <button
                ref={closeBtnRef}
                onClick={() => setMobileOpen(false)}
                aria-label={t('मेनू बंद करा', 'Close menu')}
                className="w-9 h-9 flex items-center justify-center rounded-lg border border-[#D8C39E] bg-white text-[#1A1008]"
              >
                <X size={18} />
              </button>
            </div>

            {/* Mobile Language Switcher */}
            <div className="px-4 pt-3 flex items-center justify-between bg-[#FFFDF9]">
              <span className="text-xs font-bold text-[#6E5945] flex items-center gap-1.5">
                <Globe size={14} className="text-[#C1521F]" />
                {lang === 'en' ? 'Language / भाषा:' : 'भाषा निवडा / Language:'}
              </span>
              <div className="inline-flex rounded-lg border border-[#D8C39E] bg-[#F6EFE0] p-0.5">
                <button
                  type="button"
                  onClick={() => setLang('mr')}
                  className={`px-3 py-1 rounded-md text-xs font-bold ${
                    lang === 'mr' ? 'bg-[#C1521F] text-white' : 'text-[#1A1008]'
                  }`}
                >
                  मराठी
                </button>
                <button
                  type="button"
                  onClick={() => setLang('en')}
                  className={`px-3 py-1 rounded-md text-xs font-bold ${
                    lang === 'en' ? 'bg-[#C1521F] text-white' : 'text-[#1A1008]'
                  }`}
                >
                  English
                </button>
              </div>
            </div>

            <nav className="flex-1 px-4 py-4 space-y-2" aria-label={t('मोबाईल नेव्हिगेशन', 'Mobile Navigation')}>
              {navGroups.map(group => {
                if (group.href) {
                  const active = pathname === group.href;
                  return (
                    <Link
                      key={group.id}
                      to={group.href}
                      className={`flex items-center justify-between px-4 py-3 rounded-xl text-[15px] font-bold transition-colors ${
                        active ? 'bg-[#C1521F] text-white' : 'bg-[#F6EFE0] text-[#1A1008]'
                      }`}
                    >
                      <span>{lang === 'en' ? group.labelEn : group.labelMr}</span>
                      <span>→</span>
                    </Link>
                  );
                }

                const expanded = mobileAccordion === group.id;
                return (
                  <div key={group.id} className="rounded-xl bg-[#F6EFE0] overflow-hidden border border-[#E5D5B5]">
                    <button
                      type="button"
                      onClick={() => setMobileAccordion(expanded ? null : group.id)}
                      className="w-full flex items-center justify-between px-4 py-3 text-[15px] font-bold text-[#1A1008]"
                    >
                      <span>{lang === 'en' ? group.labelEn : group.labelMr}</span>
                      <ChevronDown
                        size={16}
                        className={`transition-transform ${expanded ? 'rotate-180 text-[#C1521F]' : ''}`}
                      />
                    </button>
                    {expanded && group.children && (
                      <div className="px-2 pb-2 space-y-1 bg-[#FFFDF9] pt-1 border-t border-[#E5D5B5]">
                        {group.children.map(child => {
                          const active = pathname === child.href;
                          return (
                            <Link
                              key={child.href}
                              to={child.href}
                              className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-semibold ${
                                active ? 'bg-[#C1521F] text-white' : 'text-[#1A1008] hover:bg-[#F6EFE0]'
                              }`}
                            >
                              <span>{lang === 'en' ? child.labelEn : child.labelMr}</span>
                              <span>→</span>
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}

              <Link
                to="/contact"
                className={`flex items-center justify-between px-4 py-3 rounded-xl text-[15px] font-bold transition-colors ${
                  pathname === '/contact' ? 'bg-[#C1521F] text-white' : 'bg-[#F6EFE0] text-[#1A1008]'
                }`}
              >
                <span>{t('संपर्क', 'Contact Us')}</span>
                <span>→</span>
              </Link>
            </nav>

            <div className="px-5 py-4 border-t border-[#E5D5B5] bg-[#F6EFE0] space-y-2.5">
              <Link
                to="/donate"
                className="flex items-center justify-center gap-2 w-full py-3 rounded-xl font-bold text-sm shadow-md bg-[#C1521F] text-white"
              >
                {t('❤️ आता देणगी द्या', '❤️ Donate Now')}
              </Link>
              <Link
                to="/volunteer"
                className="flex items-center justify-center w-full py-2.5 rounded-xl font-bold border-2 border-[#1A1008] text-xs text-[#1A1008] bg-white"
              >
                {t('🤝 स्वयंसेवक बना', '🤝 Become a Volunteer')}
              </Link>
            </div>
          </aside>
        </>
      )}
    </>
  );
}

export function Footer() {
  const { settings, lang, t } = useSiteData();

  return (
    <footer role="contentinfo" className="bg-[#1A1008] text-[#F3E8D0] print:hidden" data-no-translate>
      {/* Top CTA band */}
      <div className="border-b border-[rgba(181,138,69,0.2)]">
        <div className="max-w-[1200px] mx-auto px-6 py-12 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <div className="font-serif text-2xl font-bold text-[#F3E8D0] mb-1">
              {t('महाराष्ट्राचा वारसा जपूया', 'Let Us Preserve the Heritage of Maharashtra')}
            </div>
            <p className="text-sm text-[#E8D5A3]/85">
              {t(
                settings.motto,
                'Preserve Forts • Preserve History • Pass the Heritage to the Next Generation'
              )}
            </p>
          </div>
          <Link
            to="/donate"
            className="shrink-0 px-8 py-3 rounded-lg font-bold text-white btn-shimmer text-sm shadow-lg"
          >
            {t('❤️ आता देणगी द्या', '❤️ Donate Now')}
          </Link>
        </div>
      </div>

      {/* Main footer grid */}
      <div className="max-w-[1200px] mx-auto px-6 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-10">
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-3 mb-4">
              <img
                src="/images/logo-white.png"
                alt="Logo"
                className="w-12 h-12 object-contain"
              />
              <div>
                <div className="font-serif font-bold text-[#F3E8D0] text-base leading-tight">
                  {lang === 'en' ? settings.nameEnglish : settings.nameMarathi}
                </div>
                <div className="text-[#D4A955] text-[11px] font-medium tracking-wide">
                  {lang === 'en'
                    ? '॥ Ayushyacha Ekach Pran, Gadkille Sanvardhan ॥'
                    : '॥ आयुष्याचा एकचं प्रण, गडकिल्ले संवर्धन ॥'}
                </div>
              </div>
            </Link>
            <p className="text-sm leading-relaxed text-[#E8D5A3]/80 mb-6 max-w-xs">
              {t(
                settings.mission,
                'Conservation, Research & Awareness of Historic Forts in Maharashtra'
              )}
            </p>
          </div>

          {footerColumns.map(col => (
            <div key={col.headingEn}>
              <h4 className="text-[#D4A955] font-cinzel text-xs uppercase tracking-widest mb-4 font-bold">
                {lang === 'en' ? col.headingEn : col.headingMr}
              </h4>
              <ul className="space-y-2.5">
                {col.links.map(link => (
                  <li key={link.href + link.labelEn}>
                    <Link
                      to={link.href}
                      className="text-sm text-[#F3E8D0]/85 hover:text-[#D4A955] transition-colors"
                    >
                      {lang === 'en' ? link.labelEn : link.labelMr}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-8 border-t border-[rgba(181,138,69,0.15)] grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
          <div className="flex items-start gap-2">
            <MapPin size={14} className="text-[#D4A955] mt-0.5 shrink-0" />
            <span className="text-[#F3E8D0]/80 text-xs">
              {t(
                settings.address,
                'Gadkille-513, Atharva Complex, Krishna Chowk, Pimple Gurav, Pune – 411061'
              )}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Phone size={14} className="text-[#D4A955] shrink-0" />
            <a
              href={`tel:${settings.phone1.replace(/\s+/g, '')}`}
              className="text-xs text-[#F3E8D0]/85 hover:text-[#D4A955] transition-colors"
            >
              {settings.phone1}
              {settings.phone2 ? ` / ${settings.phone2}` : ''}
            </a>
          </div>
          <div className="flex items-center gap-2">
            <Mail size={14} className="text-[#D4A955] shrink-0" />
            <a
              href={`mailto:${settings.email}`}
              className="text-xs text-[#F3E8D0]/85 hover:text-[#D4A955] transition-colors"
            >
              {settings.email}
            </a>
          </div>
        </div>
      </div>

      <div className="border-t border-[rgba(181,138,69,0.15)]">
        <div className="max-w-[1200px] mx-auto px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-[#F3E8D0]/65">
          <span>
            {lang === 'en'
              ? `© 2026 ${settings.nameEnglish} · Preserving Maharashtra's Heritage`
              : `© 2026 ${settings.nameMarathi} · महाराष्ट्राचा इतिहास जपूया`}
          </span>
          <span>
            {lang === 'en'
              ? `Est.: 2011 · Founder: Mr. Yogesh Sonawane`
              : `स्थापना: ${settings.founded} · संस्थापक: ${settings.founder}`}
          </span>
        </div>
      </div>
    </footer>
  );
}

export function WhatsAppFloat() {
  const { settings } = useSiteData();
  const cleanPhone = (settings.phone1 || '9049687970').replace(/\s+/g, '');
  const url = `https://wa.me/91${cleanPhone}?text=${encodeURIComponent(
    'नमस्कार! मला गडकिल्ले संवर्धन प्रतिष्ठानच्या कार्याबद्दल माहिती हवी आहे.'
  )}`;
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="WhatsApp वर संपर्क करा"
      className="fixed bottom-6 right-6 z-40 w-13 h-13 rounded-full bg-[#25D366] text-white shadow-xl flex items-center justify-center hover:scale-110 transition-transform print:hidden"
    >
      <svg viewBox="0 0 24 24" fill="white" className="w-7 h-7" aria-hidden="true">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
      </svg>
    </a>
  );
}
