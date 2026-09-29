import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  ArrowRight,
  ChevronDown,
  MapPin,
  Mountain,
  Calendar,
  Users,
  Clock,
  ShieldCheck,
  Landmark,
  Leaf,
} from 'lucide-react';
import { useSiteData } from '@/context/SiteContext';
import { EmptyDatabaseState } from '@/components/ui';

export function HomePage() {
  const { settings, forts, projects, events, loading, t } = useSiteData();

  const spotlight = forts.find(f => f.isSpotlight) || forts[0];
  const featuredForts = forts.filter(f => f.isFeatured).slice(0, 3);
  const displayForts = featuredForts.length > 0 ? featuredForts : forts.slice(0, 3);
  const upcomingEvents = events.slice(0, 3);

  const statsList = [
    { num: `${settings.statForts || forts.length}`, label: t('नोंदणीकृत गडकिल्ले', 'Registered Forts'), icon: '🏰' },
    { num: `${settings.statCampaigns || projects.length}`, label: t('संवर्धन मोहिमा', 'Conservation Drives'), icon: '🔧' },
    { num: `${settings.statVolunteers}`, label: t('स्वयंसेवक', 'Volunteers'), icon: '👥' },
    { num: `${settings.statEvents || events.length}`, label: t('कार्यक्रम', 'Events'), icon: '📅' },
    { num: `${settings.statTrees}`, label: t('वृक्षारोपण', 'Trees Planted'), icon: '🌳' },
  ];

  const statusStyle: Record<string, { bg: string; text: string; dot: string }> = {
    conserved: { bg: '#2C4A32', text: 'white', dot: '#6EE7A0' },
    progress: { bg: '#7A5500', text: 'white', dot: '#FBD44E' },
    needed: { bg: '#7A1A1A', text: 'white', dot: '#FCA5A5' },
  };
  const diffStyle: Record<string, { color: string }> = {
    easy: { color: '#166534' },
    moderate: { color: '#92400E' },
    hard: { color: '#991B1B' },
  };
  const statusConf: Record<string, { color: string; bg: string }> = {
    'सुरू आहे': { color: '#D4A955', bg: 'rgba(212,169,85,0.15)' },
    'पूर्ण': { color: '#6EE7A0', bg: 'rgba(110,231,160,0.12)' },
    'नियोजित': { color: '#93C5FD', bg: 'rgba(147,197,253,0.12)' },
  };

  return (
    <div>
      <Helmet>
        <title>
          {t(
            'गड-किल्ले संवर्धन प्रतिष्ठान | महाराष्ट्राचा गौरवशाली वारसा',
            'Gadkille Sanvardhan Pratishthan | Preserving Historic Forts of Maharashtra'
          )}
        </title>
        <meta
          name="description"
          content={t(
            'महाराष्ट्रातील ऐतिहासिक गड-किल्ल्यांचे संवर्धन, स्वच्छता मोहिमा, संशोधन व जनजागृती.',
            'Conservation, cleanliness drives, research and heritage awareness for historic forts across Maharashtra.'
          )}
        />
      </Helmet>

      {/* 1. HERO SECTION */}
      <section className="relative h-screen min-h-[640px] overflow-hidden" data-no-translate>
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat ken-burns"
          style={{ backgroundImage: "url('/images/hero-fort.jpg')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/92 via-black/75 to-black/40" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/50" />

        <div className="relative z-10 h-full max-w-[1200px] mx-auto px-6 sm:px-10 flex flex-col justify-center">
          <div className="flex items-center gap-2 mb-7 w-fit">
            <span className="flex items-center gap-2 px-4 py-2 rounded-full border border-[rgba(181,138,69,0.5)] bg-[rgba(181,138,69,0.15)] text-[#D4A955] font-cinzel text-xs uppercase tracking-[0.2em]">
              <span className="w-2 h-2 rounded-full bg-[#D4A955] animate-pulse" />
              {t(
                `महाराष्ट्र वारसा संवर्धन · स्थापना ${settings.founded}`,
                'Maharashtra Heritage Conservation · Est. 2011'
              )}
            </span>
          </div>

          <h1 className="mb-6 font-serif">
            <span
              className="block leading-[1.15] text-white"
              style={{ fontSize: 'clamp(1.9rem, 4vw, 3.6rem)', fontWeight: 700 }}
            >
              {t('महाराष्ट्राच्या गौरवशाली', 'Protecting the Glorious')}
            </span>
            <span
              className="block leading-[1.15] text-[#D4A955]"
              style={{ fontSize: 'clamp(2.8rem, 6.5vw, 5.5rem)', fontWeight: 900 }}
            >
              {t('गड-किल्ल्यांचे', 'Forts of Maharashtra')}
            </span>
            <span
              className="block leading-[1.15] text-white"
              style={{ fontSize: 'clamp(1.9rem, 4vw, 3.6rem)', fontWeight: 700 }}
            >
              {t('रक्षण करणारे हात', '& Our Maratha Heritage')}
            </span>
          </h1>

          <p className="text-white/75 text-sm sm:text-base mb-10 max-w-md font-cinzel tracking-wide">
            {t(
              settings.motto,
              'Preserve Forts • Preserve History • Pass the Heritage to the Next Generation'
            )}
          </p>

          <div className="flex flex-wrap gap-3">
            <Link
              to="/forts"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-lg font-bold text-white btn-shimmer text-sm shadow-xl shadow-[rgba(193,82,31,0.4)] hover:scale-[1.03] transition-transform"
            >
              {t('गडकिल्ले पहा', 'Explore Forts')} <ArrowRight size={15} />
            </Link>
            <Link
              to="/conservation"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-lg font-semibold text-white/90 text-sm border border-white/25 hover:border-[rgba(181,138,69,0.6)] hover:text-[#D4A955] transition-all backdrop-blur-sm"
            >
              {t('संवर्धन', 'Conservation')}
            </Link>
            <Link
              to="/volunteer"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-lg font-semibold text-white/90 text-sm border border-white/25 hover:border-[rgba(181,138,69,0.6)] hover:text-[#D4A955] transition-all backdrop-blur-sm"
            >
              {t('स्वयंसेवक बना', 'Become a Volunteer')}
            </Link>
          </div>

          <div className="mt-14 flex flex-wrap gap-8">
            {[
              [`${settings.statForts || forts.length}`, t('गडकिल्ले', 'Forts')],
              [`${settings.statVolunteers}`, t('स्वयंसेवक', 'Volunteers')],
              [`${settings.statCampaigns || projects.length}`, t('मोहिमा', 'Campaigns')],
            ].map(([num, lbl]) => (
              <div key={lbl} className="text-center">
                <div className="text-[#D4A955] font-bold text-2xl font-serif">{num}</div>
                <div className="text-white/65 text-xs tracking-wide mt-0.5">{lbl}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-1.5 text-white/50 text-[11px] font-cinzel tracking-widest uppercase">
          <span>{t('खाली जा', 'Scroll Down')}</span>
          <ChevronDown size={16} className="float-up" />
        </div>
      </section>

      {/* 2. STATS BAR */}
      <section className="bg-[#0F0A04] border-b border-[rgba(181,138,69,0.2)]" data-no-translate>
        <div className="max-w-[1100px] mx-auto px-6 py-12">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6 lg:gap-4">
            {statsList.map((stat, i) => (
              <div
                key={i}
                className="flex flex-col items-center text-center gap-2 p-4 rounded-2xl border border-[rgba(181,138,69,0.1)] hover:border-[rgba(181,138,69,0.3)] transition-colors"
              >
                <span className="text-2xl">{stat.icon}</span>
                <div
                  className="text-[#D4A955] font-black leading-none font-serif"
                  style={{ fontSize: 'clamp(1.8rem, 3vw, 2.5rem)' }}
                >
                  {stat.num}
                </div>
                <div className="text-[rgba(255,255,255,0.65)] text-[12px] font-medium tracking-wide leading-tight">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. FORT SPOTLIGHT */}
      {spotlight && (
        <section className="bg-white py-24 sm:py-32">
          <div className="max-w-[1200px] mx-auto px-6">
            <div className="flex items-center gap-3 mb-16">
              <div className="w-12 h-[3px] bg-[#C1521F] rounded-full" />
              <span className="font-cinzel text-[11px] uppercase tracking-[0.25em] text-[#C1521F] font-semibold">
                {t('या महिन्याचा किल्ला', 'Fort of the Month')}
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              <div className="order-2 lg:order-1">
                <div className="relative rounded-2xl overflow-hidden shadow-[0_32px_80px_rgba(15,10,4,0.2)] aspect-[4/3] group">
                  <img
                    src={spotlight.image}
                    alt={spotlight.name}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <div className="absolute bottom-5 left-5 flex gap-2">
                    <span className="px-3 py-1.5 bg-[#2C4A32] text-white text-[11px] font-bold rounded-full tracking-wide">
                      ✓ {spotlight.statusLabel}
                    </span>
                    <span className="px-3 py-1.5 bg-[rgba(15,10,4,0.75)] text-[#D4A955] text-[11px] font-cinzel rounded-full backdrop-blur-sm border border-[rgba(181,138,69,0.3)]">
                      {spotlight.type}
                    </span>
                  </div>
                </div>
              </div>

              <div className="order-1 lg:order-2 space-y-6">
                <div>
                  <h2
                    className="text-[#0F0A04] font-black leading-none mb-2 font-serif"
                    style={{ fontSize: 'clamp(3rem, 6vw, 5rem)' }}
                  >
                    {spotlight.name}
                  </h2>
                  <p className="font-cinzel text-[#C1521F] text-sm uppercase tracking-[0.18em]">
                    {spotlight.nameEn}
                  </p>
                </div>

                <div className="w-16 h-[3px] bg-gradient-to-r from-[#C1521F] to-[#B58A45] rounded-full" />

                <div className="flex flex-wrap gap-3">
                  {[
                    { icon: MapPin, label: t(`${spotlight.district} जिल्हा`, `${spotlight.district} District`) },
                    { icon: Mountain, label: spotlight.height },
                    { icon: Calendar, label: spotlight.era },
                  ].map(({ icon: Icon, label }) => (
                    <span
                      key={label}
                      className="flex items-center gap-2 px-3.5 py-1.5 bg-[#F9F2E3] rounded-full text-[13px] text-[#3D2A18] font-medium"
                    >
                      <Icon size={13} className="text-[#C1521F]" />
                      {label}
                    </span>
                  ))}
                </div>

                <blockquote className="border-l-4 border-[#C1521F] pl-5 py-1">
                  <p className="text-[#3D2A18] leading-relaxed text-[15px]">
                    {spotlight.history || spotlight.desc}
                  </p>
                </blockquote>

                {spotlight.features.length > 0 && (
                  <div>
                    <p className="text-[11px] font-cinzel text-[#C1521F] uppercase tracking-[0.22em] mb-3 font-semibold">
                      {t('प्रमुख वैशिष्ट्ये', 'Key Features')}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {spotlight.features.slice(0, 5).map(f => (
                        <span
                          key={f}
                          className="px-3 py-1.5 bg-white border border-[#E8D5A3] rounded-full text-[12px] text-[#5C4A35] font-medium shadow-sm"
                        >
                          {f}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <Link
                  to={`/forts/${spotlight.id}`}
                  className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-xl font-bold text-[15px] text-white btn-shimmer shadow-xl shadow-[rgba(193,82,31,0.35)] hover:scale-[1.03] transition-transform"
                >
                  {t('गडाची संपूर्ण माहिती पहा', 'View Full Fort Details')} <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 4. QUOTE BANNER */}
      <section className="relative bg-[#0F0A04] py-24 overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-transparent via-[#B58A45] to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-gradient-to-r from-transparent via-[#B58A45] to-transparent" />
        <div className="relative z-10 max-w-3xl mx-auto px-6 text-center">
          <div className="text-[#B58A45] opacity-30 leading-none mb-[-20px] select-none text-[90px] font-serif">
            ❝
          </div>
          <blockquote
            className="font-black leading-[1.45] text-white mb-8 font-serif"
            style={{ fontSize: 'clamp(1.6rem, 3.5vw, 2.6rem)' }}
          >
            {t('गड जपूया,', 'Preserve Forts,')}{' '}
            <span className="text-[#D4A955]">{t('इतिहास जपूया,', 'Preserve History,')}</span>
            <br />
            {t('वारसा पुढील पिढीकडे नेऊया', 'Pass the Heritage to the Next Generation')}
          </blockquote>
          <cite className="font-cinzel text-[11px] uppercase tracking-[0.28em] text-[#B58A45]/75 not-italic">
            — {t(settings.nameMarathi, settings.nameEnglish)} · {t(`स्थापना ${settings.founded}`, 'Est. 2011')}
          </cite>
        </div>
      </section>

      {/* 5. FEATURED FORTS */}
      <section className="bg-[#F5EDD8] py-24">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="mb-14 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-5">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-[3px] bg-[#C1521F] rounded-full" />
                <span className="font-cinzel text-[11px] uppercase tracking-[0.22em] text-[#C1521F] font-semibold">
                  {t('गडकिल्ले', 'Forts')}
                </span>
              </div>
              <h2
                className="text-[#0F0A04] font-black leading-tight font-serif"
                style={{ fontSize: 'clamp(2rem, 4vw, 3rem)' }}
              >
                {t('महाराष्ट्राचे गौरवशाली किल्ले', 'Glorious Forts of Maharashtra')}
              </h2>
            </div>
            <Link
              to="/forts"
              className="shrink-0 inline-flex items-center gap-2 px-6 py-3 rounded-xl border-2 border-[#C1521F] text-[#C1521F] font-bold text-sm hover:bg-[#C1521F] hover:text-white transition-all"
            >
              {t('सर्व किल्ले पहा', 'View All Forts')} <ArrowRight size={14} />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-white/60 rounded-2xl h-80 animate-pulse border border-[#E8D5A3]" />
              ))}
            </div>
          ) : displayForts.length === 0 ? (
            <EmptyDatabaseState
              title={t(
                'डेटाबेसमध्ये अद्याप कोणतेही किल्ले जोडलेले नाहीत',
                'No forts have been added to the database yet'
              )}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {displayForts.map(fort => {
                const st = statusStyle[fort.status] || statusStyle.progress;
                const df = diffStyle[fort.difficultyEn] || diffStyle.moderate;
                return (
                  <Link
                    key={fort.id}
                    to={`/forts/${fort.id}`}
                    className="group block bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl hover:-translate-y-1.5 transition-all duration-200"
                  >
                    <div className="relative h-56 overflow-hidden">
                      <img
                        src={fort.image}
                        alt={fort.name}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      <div className="absolute top-4 left-4">
                        <span
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold"
                          style={{ background: st.bg, color: st.text }}
                        >
                          <span
                            className="w-1.5 h-1.5 rounded-full"
                            style={{ background: st.dot }}
                          />
                          {fort.statusLabel}
                        </span>
                      </div>
                      <div className="absolute bottom-4 left-4 right-4">
                        <h3 className="text-white font-black text-2xl leading-none font-serif">
                          {fort.name}
                        </h3>
                        <p className="text-white/75 font-cinzel text-[10px] uppercase tracking-wider mt-0.5">
                          {fort.nameEn}
                        </p>
                      </div>
                    </div>

                    <div className="p-5">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3 text-[12px] text-[#5C4A35]">
                          <span className="flex items-center gap-1">
                            <MapPin size={11} className="text-[#C1521F]" />
                            {fort.district}
                          </span>
                          <span className="flex items-center gap-1">
                            <Mountain size={11} className="text-[#C1521F]" />
                            {fort.height}
                          </span>
                        </div>
                        <span className="text-[11px] font-bold" style={{ color: df.color }}>
                          🥾 {fort.difficulty}
                        </span>
                      </div>
                      <p className="text-[#3D2A18] text-[13px] leading-relaxed line-clamp-2 mb-4">
                        {fort.desc}
                      </p>
                      <div className="flex items-center text-[#C1521F] text-[13px] font-bold gap-1">
                        {t('अधिक माहिती', 'View Details')} <ArrowRight size={13} />
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* 6. CONSERVATION PROJECTS */}
      <section className="bg-[#0F0A04] py-24">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="mb-14 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-[3px] bg-[#D4A955] rounded-full" />
                <span className="font-cinzel text-[11px] uppercase tracking-[0.22em] text-[#D4A955] font-semibold">
                  {t('चालू संवर्धन प्रकल्प', 'Ongoing Conservation Projects')}
                </span>
              </div>
              <h2
                className="text-white font-black leading-tight font-serif"
                style={{ fontSize: 'clamp(2rem, 4vw, 3rem)' }}
              >
                {t('आमचे चालू संवर्धन कार्य', 'Our Active Conservation Work')}
              </h2>
            </div>
            <Link
              to="/conservation"
              className="shrink-0 inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-[rgba(181,138,69,0.4)] text-[#D4A955] font-bold text-sm hover:bg-[rgba(181,138,69,0.12)] transition-all"
            >
              {t('सर्व प्रकल्प', 'All Projects')} <ArrowRight size={14} />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {[1, 2].map(i => (
                <div key={i} className="bg-white/5 rounded-2xl h-56 animate-pulse border border-white/10" />
              ))}
            </div>
          ) : projects.length === 0 ? (
            <EmptyDatabaseState
              title={t(
                'कोणताही संवर्धन प्रकल्प अद्याप नोंदवलेला नाही',
                'No conservation projects added yet'
              )}
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {projects.slice(0, 4).map(proj => {
                const conf = statusConf[proj.status] || statusConf['नियोजित'];
                return (
                  <div
                    key={proj.id}
                    className="bg-white/[0.04] border border-white/10 rounded-2xl p-6 hover:border-[rgba(181,138,69,0.3)] transition-all"
                  >
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <div>
                        <span className="font-cinzel text-[10px] text-[#B58A45] uppercase tracking-widest font-semibold">
                          {proj.fort}
                        </span>
                        <h4 className="text-white font-bold text-lg leading-snug mt-1 font-serif">
                          {proj.title}
                        </h4>
                      </div>
                      <span
                        className="shrink-0 px-3 py-1 rounded-full text-[11px] font-bold"
                        style={{ color: conf.color, background: conf.bg }}
                      >
                        {proj.status}
                      </span>
                    </div>

                    <p className="text-white/65 text-[13px] leading-relaxed mb-5 line-clamp-2">
                      {proj.desc}
                    </p>

                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-white/55 text-[12px]">{t('प्रगती', 'Progress')}</span>
                        <span className="font-bold text-sm" style={{ color: conf.color }}>
                          {proj.progress}%
                        </span>
                      </div>
                      <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{ width: `${proj.progress}%`, background: conf.color }}
                        />
                      </div>
                      <p className="text-white/50 text-[11px] mt-1.5">{proj.impact}</p>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-white/10 text-[12px]">
                      <span className="flex items-center gap-1.5 text-white/65">
                        <Users size={11} /> {proj.volunteers} {t('स्वयंसेवक', 'Volunteers')}
                      </span>
                      <span className="flex items-center gap-1.5 text-white/65">
                        <Clock size={11} /> {proj.end} {t('पर्यंत', 'Target')}
                      </span>
                      <span className="text-[#D4A955] font-bold">{proj.budget}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* 7. UPCOMING EVENTS */}
      <section className="bg-white py-24">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="mb-14 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-5">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-[3px] bg-[#C1521F] rounded-full" />
                <span className="font-cinzel text-[11px] uppercase tracking-[0.22em] text-[#C1521F] font-semibold">
                  {t('आगामी कार्यक्रम', 'Upcoming Events')}
                </span>
              </div>
              <h2
                className="text-[#0F0A04] font-black leading-tight font-serif"
                style={{ fontSize: 'clamp(2rem, 4vw, 3rem)' }}
              >
                {t('येत्या मोहिमा व कार्यक्रम', 'Upcoming Drives & Events')}
              </h2>
            </div>
            <Link
              to="/events"
              className="shrink-0 inline-flex items-center gap-2 px-6 py-3 rounded-xl border-2 border-[#C1521F] text-[#C1521F] font-bold text-sm hover:bg-[#C1521F] hover:text-white transition-all"
            >
              {t('सर्व कार्यक्रम', 'All Events')} <ArrowRight size={14} />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-[#F9F2E3] rounded-2xl h-72 animate-pulse border border-[#E8D5A3]" />
              ))}
            </div>
          ) : upcomingEvents.length === 0 ? (
            <EmptyDatabaseState
              title={t(
                'कोणताही आगामी कार्यक्रम अद्याप जोडलेला नाही',
                'No upcoming events found yet'
              )}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {upcomingEvents.map(event => {
                const pct = Math.min(100, Math.round((event.registered / Math.max(1, event.capacity)) * 100));
                const full = event.registered >= event.capacity;
                return (
                  <div
                    key={event.id}
                    className="group bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-200 border border-[#F0E8D5]"
                  >
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={event.image}
                        alt={event.title}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/65 to-transparent" />
                      <div className="absolute top-4 left-4 bg-[#C1521F] text-white rounded-xl px-3 py-2 text-center shadow-lg min-w-[52px]">
                        <div className="font-black text-2xl leading-none">{event.dateNum}</div>
                        <div className="font-cinzel text-[9px] uppercase tracking-widest mt-0.5 opacity-90">
                          {event.month}
                        </div>
                      </div>
                      <div className="absolute top-4 right-4 px-2.5 py-1 bg-black/65 text-[#D4A955] text-[11px] font-cinzel rounded-full backdrop-blur-sm">
                        {event.type}
                      </div>
                      <div className="absolute bottom-3 left-4 flex items-center gap-1.5 text-white/90 text-[12px]">
                        <MapPin size={11} /> {event.location}
                      </div>
                    </div>

                    <div className="p-5">
                      <h4 className="text-[#0F0A04] font-bold text-[16px] leading-snug mb-3 line-clamp-2 font-serif">
                        {event.title}
                      </h4>
                      <p className="text-[#5C4A35] text-[13px] leading-relaxed line-clamp-2 mb-4">
                        {event.desc}
                      </p>

                      <div className="mb-4">
                        <div className="flex items-center justify-between text-[12px] mb-1.5">
                          <span className="flex items-center gap-1 text-[#5C4A35]">
                            <Users size={11} /> {event.registered}/{event.capacity}{' '}
                            {t('नोंदणी', 'Registered')}
                          </span>
                          <span className={`font-bold ${full ? 'text-red-600' : 'text-green-700'}`}>
                            {event.status}
                          </span>
                        </div>
                        <div className="w-full bg-[#F0E8D5] rounded-full h-2 overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{ width: `${pct}%`, background: full ? '#DC2626' : '#2C4A32' }}
                          />
                        </div>
                      </div>

                      <Link
                        to="/events"
                        className="block w-full text-center py-3 rounded-xl text-[13px] font-bold bg-[#C1521F] text-white hover:bg-[#A84A20] transition-colors"
                      >
                        {full ? t('📋 तपशील पहा', '📋 View Details') : t('✅ नोंदणी करा', '✅ Register Now')}
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* 8. VOLUNTEER CTA + DONATION CTA */}
      <section className="bg-[#1E1208] py-24 relative overflow-hidden">
        <div className="max-w-[1100px] mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-[3px] bg-[#D4A955] rounded-full" />
              <span className="font-cinzel text-[11px] uppercase tracking-[0.22em] text-[#D4A955] font-semibold">
                {t('आमच्यासोबत या', 'Join Our Mission')}
              </span>
            </div>
            <h2
              className="text-white font-black leading-tight mb-6 font-serif"
              style={{ fontSize: 'clamp(2.2rem, 4vw, 3.2rem)' }}
            >
              {t('महाराष्ट्राच्या वारशाचे', 'Become a Guardian of')}{' '}
              <span className="text-[#D4A955]">{t('रक्षणकर्ते', "Maharashtra's Heritage")}</span>{' '}
              {t('व्हा', '')}
            </h2>
            <p className="text-white/70 text-base leading-relaxed mb-8 max-w-md">
              {t(
                'दर महिन्याला किल्ला संवर्धन मोहिमांमध्ये सहभागी व्हा किंवा देणगी देऊन या पवित्र कार्याला बळ द्या.',
                'Join monthly fort conservation drives or support our sacred mission with a contribution.'
              )}
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                to="/volunteer"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-white btn-shimmer text-[15px] shadow-xl"
              >
                {t('स्वयंसेवक नोंदणी करा', 'Register as Volunteer')} <ArrowRight size={16} />
              </Link>
              <Link
                to="/donate"
                className="inline-flex items-center px-8 py-4 rounded-xl border border-[#D4A955]/50 text-[#D4A955] font-semibold text-[15px] hover:bg-[#D4A955]/10 transition-all"
              >
                {t('❤️ आता देणगी द्या', '❤️ Donate Now')}
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {[
              {
                icon: ShieldCheck,
                title: t('80G कर सवलत', '80G Tax Exemption'),
                desc: t('सर्व देणग्यांवर अधिकृत पावती', 'Official receipts on all donations'),
              },
              {
                icon: Landmark,
                title: t('नोंदणीकृत संस्था', 'Registered NGO'),
                desc: t(`स्थापना ${settings.founded}`, 'Est. 2011'),
              },
              {
                icon: Users,
                title: t(`${settings.statVolunteers}+ स्वयंसेवक`, `${settings.statVolunteers}+ Volunteers`),
                desc: t('महाराष्ट्रभर सक्रिय जाळे', 'Active network across Maharashtra'),
              },
              {
                icon: Leaf,
                title: t('100% पारदर्शक', '100% Transparent'),
                desc: t('प्रत्येक रुपया संवर्धनात', 'Every rupee goes to conservation'),
              },
            ].map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="bg-white/[0.05] border border-white/10 rounded-2xl p-5 hover:border-[rgba(181,138,69,0.35)] transition-all"
              >
                <Icon size={24} className="text-[#D4A955] mb-3" />
                <h4 className="text-white font-bold text-[15px] mb-1 font-serif">{title}</h4>
                <p className="text-white/65 text-[12px]">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
