import React, { useState, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import { useSiteData } from '@/context/SiteContext';
import { SectionHeader } from '@/components/ui';
import { Quote, ChevronLeft, ChevronRight, X, Sparkles, MessageSquareQuote } from 'lucide-react';
import type { ManogatRecord } from '@/lib/api';

export function AboutPage() {
  const { settings, lang, t, manogats } = useSiteData();
  const [selectedManogat, setSelectedManogat] = useState<ManogatRecord | null>(null);
  const [activeSlide, setActiveSlide] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);

  // Filter published manogats or fallback
  const publishedManogats = manogats.filter(m => m.isPublished !== false);

  const milestones = [
    {
      year: t('२०११', '2011'),
      event: t(
        'गडकिल्ले संवर्धन प्रतिष्ठानची स्थापना, पुणे',
        'Foundation of Gadkille Sanvardhan Pratishthan, Pune'
      ),
    },
    {
      year: t('२०१३', '2013'),
      event: t(
        'पहिली किल्ला स्वच्छता मोहीम — सिंहगड',
        'First Fort Cleanliness Campaign — Sinhagad'
      ),
    },
    {
      year: t('२०१५', '2015'),
      event: t('स्वयंसेवकांचा राज्यव्यापी विस्तार', 'Statewide Expansion of Volunteers'),
    },
    {
      year: t('२०१७', '2017'),
      event: t(
        'महाराष्ट्र पुरातत्त्व विभागाशी सामंजस्य करार',
        'MoU with Directorate of Archaeology, Maharashtra'
      ),
    },
    {
      year: t('२०२०', '2020'),
      event: t('हरित किल्ले वृक्षारोपण उपक्रम', 'Green Forts Tree Plantation Initiative'),
    },
    {
      year: t('२०२६', '2026'),
      event: t(
        'राज्यभर विस्तार व डिजिटल संवर्धन पोर्टल',
        'Statewide Expansion & Digital Conservation Portal'
      ),
    },
  ];

  const values = [
    {
      icon: '🏛️',
      title: t('संवर्धन', 'Conservation'),
      desc: t(
        'ऐतिहासिक अखंडता राखून जीर्णोद्धार करणे.',
        'Restoring forts while maintaining historical integrity.'
      ),
    },
    {
      icon: '📚',
      title: t('शिक्षण', 'Education'),
      desc: t(
        'शाळांमध्ये किल्ल्यांचा इतिहास पोहोचवणे.',
        'Bringing the history of forts to schools and youth.'
      ),
    },
    {
      icon: '🌿',
      title: t('पर्यावरण', 'Environment'),
      desc: t(
        'किल्ल्यांच्या परिसरात हरित आवरण राखणे.',
        'Maintaining green cover around fort ecosystems.'
      ),
    },
    {
      icon: '🤝',
      title: t('समुदाय', 'Community'),
      desc: t(
        'स्थानिक लोकांना संवर्धन कार्यात सामील करणे.',
        'Involving local communities in conservation work.'
      ),
    },
  ];

  const team = [
    {
      name: t('श्री. योगेश सोनवणे', 'Mr. Yogesh Sonawane'),
      role: t('संस्थापक अध्यक्ष', 'Founder President'),
      icon: '🏆',
    },
    {
      name: t('श्री. अभिषेक नवले', 'Mr. Abhishek Navale'),
      role: t('प्रदेशाध्यक्ष', 'State President'),
      icon: '👑',
    },
    {
      name: t('कु. स्वरा देशमुख', 'Ms. Swara Deshmukh'),
      role: t('लेखा व वित्त विभाग', 'Accounts & Finance Department'),
      icon: '📋',
    },
    {
      name: t('कु. नम्रता मोटे', 'Ms. Namrata Mote'),
      role: t('सामाजिक माध्यमे व्यवस्थापक', 'Social Media Manager'),
      icon: '📱',
    },
    {
      name: t('कु. पालवी रसाळ', 'Ms. Palavi Rasal'),
      role: t('संपर्क प्रमुख', 'Head of Communications'),
      icon: '📞',
    },
    {
      name: t('कु. दीपेश वारंग', 'Mr. Deepesh Warang'),
      role: t('कोकण विभाग प्रमुख', 'Konkan Division Head'),
      icon: '🚩',
    },
  ];

  const handleScrollCarousel = (direction: 'left' | 'right') => {
    if (!carouselRef.current) return;
    const cardWidth = 320; // approximate card width + gap
    const scrollAmount = direction === 'left' ? -cardWidth : cardWidth;
    carouselRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
  };

  const handleCarouselScroll = () => {
    if (!carouselRef.current) return;
    const scrollLeft = carouselRef.current.scrollLeft;
    const cardWidth = 320;
    const newIndex = Math.round(scrollLeft / cardWidth);
    if (newIndex !== activeSlide && newIndex >= 0 && newIndex < publishedManogats.length) {
      setActiveSlide(newIndex);
    }
  };

  return (
    <div className="bg-[#F9F2E3] min-h-screen pt-[68px]" data-no-translate>
      <Helmet>
        <title>{t('आमच्याविषयी', 'About Us')} | गडकिल्ले संवर्धन</title>
        <meta
          name="description"
          content={t(
            'गडकिल्ले संवर्धन प्रतिष्ठान बद्दल माहिती व कार्यरत सदस्यांचे मनोगत',
            'Information about Gadkille Sanvardhan Pratishthan & Member Reflections'
          )}
        />
      </Helmet>

      {/* Hero Header */}
      <div className="relative bg-[#1A1008] py-24 overflow-hidden">
        <img
          src="/images/team.jpg"
          alt="Team"
          className="absolute inset-0 w-full h-full object-cover opacity-15"
        />
        <div className="relative z-10 max-w-3xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 mb-4 font-cinzel text-xs uppercase tracking-widest text-[#D4A955]">
            <span className="w-6 h-px bg-[#B58A45]" /> {t('आमच्याविषयी', 'About Us')}{' '}
            <span className="w-6 h-px bg-[#B58A45]" />
          </div>
          <h1 className="font-serif text-4xl sm:text-5xl font-black text-[#F3E8D0] mb-4">
            {lang === 'en' ? settings.nameEnglish : settings.nameMarathi}
          </h1>
          <p className="text-[rgba(243,232,208,0.6)] max-w-xl mx-auto">
            {t(
              settings.mission,
              'Conservation, Research & Awareness of Historic Forts in Maharashtra'
            )}
          </p>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-16 space-y-24">
        {/* Mission, Vision, Core Values */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {[
            {
              title: t('ध्येय', 'Mission'),
              icon: '🎯',
              text: t(
                'महाराष्ट्रातील गड-किल्ल्यांचे वैज्ञानिक पद्धतीने संवर्धन करणे आणि येणाऱ्या पिढ्यांसाठी हा वारसा जपणे.',
                'Scientifically conserving the forts of Maharashtra and preserving this heritage for future generations.'
              ),
            },
            {
              title: t('दृष्टी', 'Vision'),
              icon: '👁️',
              text: t(
                'एक असे महाराष्ट्र जेथे प्रत्येक किल्ला संरक्षित असेल आणि प्रत्येक नागरिकाला आपल्या इतिहासाचा अभिमान वाटेल.',
                'A Maharashtra where every fort is protected and every citizen takes pride in their history.'
              ),
            },
            {
              title: t('मूल्ये', 'Core Values'),
              icon: '💎',
              text: t(
                'पारदर्शकता, समर्पण, सामुदायिक सहभाग आणि ऐतिहासिक अचूकता हे आमच्या कार्याचे आधारस्तंभ आहेत.',
                'Transparency, dedication, community participation, and historical accuracy are the pillars of our work.'
              ),
            },
          ].map(card => (
            <div
              key={card.title}
              className="bg-white rounded-2xl p-7 border border-[#E8D5A3] shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="text-4xl mb-4">{card.icon}</div>
              <h3 className="font-serif text-xl font-bold text-[#1A1008] mb-3">{card.title}</h3>
              <p className="text-[#6E5945] leading-relaxed text-sm">{card.text}</p>
            </div>
          ))}
        </div>

        {/* ================================================================= */}
        {/* DEDICATED MANOGAT SECTION (संस्थेत कार्यरत सदस्यांचे मनोगत) */}
        {/* ================================================================= */}
        <section className="relative pt-4">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#A84A20]/10 border border-[#A84A20]/20 text-[#A84A20] text-xs font-semibold mb-3">
              <span>🌿</span>
              <span>{t('आमचे मनोगत', 'Our Thoughts & Reflections')}</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#1A1008] mb-3">
              {t('संस्थेत कार्यरत सदस्यांचे मनोगत', 'Voices & Reflections of Our Team')}
            </h2>
            <p className="text-[#6E5945] max-w-2xl mx-auto text-sm sm:text-base leading-relaxed">
              {t(
                'सह्याद्रीच्या कुशीत निस्वार्थ भावनेने श्रमदान करणाऱ्या आमच्या सहकाऱ्यांचे मनोगत आणि वैयक्तिक अनुभव.',
                'Genuine personal thoughts and lived experiences of the dedicated individuals working on fort conservation.'
              )}
            </p>
          </div>

          {/* Desktop Grid & Mobile Carousel */}
          {publishedManogats.length > 0 ? (
            <div>
              {/* Mobile Carousel Controls */}
              <div className="flex md:hidden items-center justify-between mb-4 px-2">
                <div className="text-xs font-semibold text-[#A84A20] flex items-center gap-1.5">
                  <MessageSquareQuote size={15} />
                  <span>{t('सदस्यांचे अनुभव', 'Member Reflections')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleScrollCarousel('left')}
                    aria-label="Previous card"
                    className="w-8 h-8 rounded-full bg-white border border-[#E8D5A3] flex items-center justify-center text-[#1A1008] hover:bg-[#A84A20] hover:text-white transition-colors shadow-sm"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    onClick={() => handleScrollCarousel('right')}
                    aria-label="Next card"
                    className="w-8 h-8 rounded-full bg-white border border-[#E8D5A3] flex items-center justify-center text-[#1A1008] hover:bg-[#A84A20] hover:text-white transition-colors shadow-sm"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>

              {/* Cards Container: Mobile horizontal snap scroll, Desktop 3-column grid */}
              <div
                ref={carouselRef}
                onScroll={handleCarouselScroll}
                className="flex md:grid md:grid-cols-2 lg:grid-cols-3 gap-6 overflow-x-auto md:overflow-x-visible snap-x snap-mandatory scrollbar-none pb-4 px-1"
                style={{ scrollBehavior: 'smooth' }}
              >
                {publishedManogats.map(item => {
                  const displayName = lang === 'en' && item.nameEn ? item.nameEn : item.name;
                  const displayRole =
                    lang === 'en' && item.designationEn ? item.designationEn : item.designation;
                  const displayShort =
                    lang === 'en' && item.shortManogatEn ? item.shortManogatEn : item.shortManogat;
                  const displayDetailed =
                    lang === 'en' && item.detailedManogatEn
                      ? item.detailedManogatEn
                      : item.detailedManogat;
                  const hasDetailed = Boolean(displayDetailed && displayDetailed.trim().length > 0);

                  return (
                    <div
                      key={item.id}
                      className="group relative flex-shrink-0 w-[85vw] sm:w-[320px] md:w-auto snap-center bg-white rounded-2xl p-6 sm:p-7 border border-[#E8D5A3] shadow-[0_8px_24px_-8px_rgba(168,74,32,0.12)] hover:shadow-[0_16px_32px_-8px_rgba(168,74,32,0.22)] hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between"
                    >
                      {/* Decorative Background Accent */}
                      <Quote
                        size={48}
                        className="absolute top-4 right-4 text-[#B58A45]/10 group-hover:text-[#A84A20]/20 group-hover:scale-110 transition-all duration-300 pointer-events-none"
                      />

                      <div>
                        {/* Member Profile Frame & Identity */}
                        <div className="flex items-center gap-4 mb-5">
                          <div className="relative shrink-0">
                            <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-full p-[2.5px] bg-gradient-to-tr from-[#A84A20] via-[#D4A955] to-[#E8D5A3] shadow-md">
                              {item.photo ? (
                                <img
                                  src={item.photo}
                                  alt={displayName}
                                  className="w-full h-full rounded-full object-cover bg-[#F9F2E3]"
                                  onError={e => {
                                    // Fallback to initials if image fails
                                    (e.target as HTMLElement).style.display = 'none';
                                  }}
                                />
                              ) : (
                                <div className="w-full h-full rounded-full bg-gradient-to-br from-[#A84A20] to-[#B58A45] flex items-center justify-center text-white font-serif font-bold text-xl">
                                  {displayName.charAt(0)}
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="min-w-0 flex-1">
                            <h3 className="font-serif font-bold text-[#1A1008] text-base sm:text-lg leading-snug truncate">
                              {displayName}
                            </h3>
                            <p className="text-xs font-semibold text-[#A84A20] tracking-wide mt-0.5 line-clamp-1">
                              {displayRole}
                            </p>
                          </div>
                        </div>

                        {/* Short Manogat Quote */}
                        <div className="relative mb-6">
                          <p className="text-[#5A4634] text-sm leading-relaxed font-sans italic line-clamp-4 relative z-10">
                            "{displayShort}"
                          </p>
                        </div>
                      </div>

                      {/* Read More Button */}
                      <div className="pt-3 border-t border-[#F2E5C8] flex items-center justify-between">
                        {hasDetailed ? (
                          <button
                            onClick={() => setSelectedManogat(item)}
                            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#A84A20] hover:text-[#7A3414] group-hover:translate-x-0.5 transition-all"
                          >
                            <span>{t('सविस्तर वाचा', 'Read More')}</span>
                            <span className="text-sm">→</span>
                          </button>
                        ) : (
                          <span className="text-[11px] text-[#A84A20]/60 font-medium italic">
                            {t('संस्थेचे सक्रिय सदस्य', 'Active Member')}
                          </span>
                        )}
                        <span className="w-1.5 h-1.5 rounded-full bg-[#D4A955]/70" />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Mobile Carousel Indicators (Dots) */}
              <div className="flex md:hidden items-center justify-center gap-1.5 mt-4">
                {publishedManogats.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      if (!carouselRef.current) return;
                      const cardWidth = 320;
                      carouselRef.current.scrollTo({ left: idx * cardWidth, behavior: 'smooth' });
                      setActiveSlide(idx);
                    }}
                    aria-label={`Go to slide ${idx + 1}`}
                    className={`h-1.5 rounded-full transition-all ${
                      activeSlide === idx ? 'w-6 bg-[#A84A20]' : 'w-1.5 bg-[#D4A955]/40'
                    }`}
                  />
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-8 text-center border border-[#E8D5A3]">
              <p className="text-sm text-[#6E5945]">
                {t('सध्या कोणतेही मनोगत उपलब्ध नाही.', 'No reflections available at the moment.')}
              </p>
            </div>
          )}
        </section>

        {/* 4 Pillars of Values */}
        <div>
          <SectionHeader
            eyebrow={t('आमची मूल्ये', 'Our Core Values')}
            title={t('चार स्तंभ ज्यावर आमचे कार्य उभे आहे', 'Four Pillars Supporting Our Mission')}
          />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
            {values.map(v => (
              <div
                key={v.title}
                className="text-center p-6 bg-white rounded-2xl border border-[#E8D5A3] shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="text-5xl mb-4">{v.icon}</div>
                <h4 className="font-serif font-bold text-[#1A1008] mb-2">{v.title}</h4>
                <p className="text-xs text-[#6E5945] leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Journey Milestones */}
        <div>
          <SectionHeader
            eyebrow={t('आमचा प्रवास', 'Our Journey')}
            title={t('स्थापनेपासून आजपर्यंत', 'From Inception to Today')}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {milestones.map(m => (
              <div
                key={m.year}
                className="bg-white rounded-2xl p-5 border border-[#E8D5A3] shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="font-cinzel text-[#A84A20] text-sm font-bold mb-1">{m.year}</div>
                <p className="text-[#6E5945] text-sm">{m.event}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Leadership Team */}
        <div>
          <SectionHeader
            eyebrow={t('आमची टीम', 'Our Leadership Team')}
            title={t('नेतृत्व करणारे हात', 'Hands Leading the Mission')}
          />
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {team.map(member => (
              <div
                key={member.name}
                className="bg-white rounded-2xl p-5 text-center border border-[#E8D5A3] shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#C1521F] to-[#B58A45] flex items-center justify-center text-white font-serif text-2xl font-bold mx-auto mb-3 shadow-sm">
                  {member.name.charAt(0)}
                </div>
                <h4 className="font-serif font-bold text-[#1A1008] text-sm mb-1">{member.name}</h4>
                <p className="text-xs text-[#A84A20] font-cinzel uppercase tracking-wider">
                  {member.role}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ================================================================= */}
      {/* DETAILED MANOGAT MODAL (सविस्तर मनोगत पॉपअप) */}
      {/* ================================================================= */}
      {selectedManogat && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setSelectedManogat(null)}
        >
          <div
            className="relative w-full max-w-lg bg-[#FFFDF9] rounded-3xl p-6 sm:p-8 border border-[#E8D5A3] shadow-2xl max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setSelectedManogat(null)}
              aria-label="Close modal"
              className="absolute top-5 right-5 w-9 h-9 rounded-full bg-[#1A1008]/5 hover:bg-[#A84A20] hover:text-white flex items-center justify-center text-[#1A1008] transition-colors"
            >
              <X size={18} />
            </button>

            {/* Member Info in Modal */}
            <div className="flex items-center gap-4 pb-6 border-b border-[#E8D5A3]">
              <div className="w-20 h-20 rounded-full p-[2.5px] bg-gradient-to-tr from-[#A84A20] via-[#D4A955] to-[#E8D5A3] shadow-md shrink-0">
                {selectedManogat.photo ? (
                  <img
                    src={selectedManogat.photo}
                    alt={selectedManogat.name}
                    className="w-full h-full rounded-full object-cover bg-[#F9F2E3]"
                  />
                ) : (
                  <div className="w-full h-full rounded-full bg-gradient-to-br from-[#A84A20] to-[#B58A45] flex items-center justify-center text-white font-serif font-bold text-2xl">
                    {selectedManogat.name.charAt(0)}
                  </div>
                )}
              </div>
              <div>
                <div className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#A84A20] uppercase tracking-wider mb-1">
                  <Sparkles size={12} /> {t('सदस्य मनोगत', 'Member Reflection')}
                </div>
                <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#1A1008]">
                  {lang === 'en' && selectedManogat.nameEn
                    ? selectedManogat.nameEn
                    : selectedManogat.name}
                </h3>
                <p className="text-xs font-semibold text-[#A84A20] mt-0.5">
                  {lang === 'en' && selectedManogat.designationEn
                    ? selectedManogat.designationEn
                    : selectedManogat.designation}
                </p>
              </div>
            </div>

            {/* Modal Body */}
            <div className="py-6 space-y-4">
              {/* Short Highlight */}
              <div className="p-4 rounded-xl bg-[#A84A20]/5 border-l-4 border-[#A84A20]">
                <p className="text-sm font-serif italic text-[#1A1008] leading-relaxed">
                  "
                  {lang === 'en' && selectedManogat.shortManogatEn
                    ? selectedManogat.shortManogatEn
                    : selectedManogat.shortManogat}
                  "
                </p>
              </div>

              {/* Detailed Reflection */}
              {selectedManogat.detailedManogat && (
                <div className="space-y-3">
                  <h4 className="font-serif font-bold text-[#1A1008] text-sm">
                    {t('सविस्तर अनुभव व विचार', 'Full Reflection & Journey')}
                  </h4>
                  <p className="text-[#5A4634] text-sm sm:text-base leading-relaxed whitespace-pre-line">
                    {lang === 'en' && selectedManogat.detailedManogatEn
                      ? selectedManogat.detailedManogatEn
                      : selectedManogat.detailedManogat}
                  </p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="pt-4 border-t border-[#E8D5A3] flex items-center justify-between text-xs text-[#6E5945]">
              <span>गडकिल्ले संवर्धन प्रतिष्ठान, महाराष्ट्र राज्य</span>
              <button
                onClick={() => setSelectedManogat(null)}
                className="px-4 py-2 rounded-xl bg-[#A84A20] text-white font-bold text-xs hover:bg-[#8D3B16] transition-colors"
              >
                {t('बंद करा', 'Close')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
