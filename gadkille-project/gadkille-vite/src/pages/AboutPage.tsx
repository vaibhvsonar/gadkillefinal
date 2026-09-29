import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useSiteData } from '@/context/SiteContext';
import { SectionHeader } from '@/components/ui';

export function AboutPage() {
  const { settings, lang, t } = useSiteData();

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

  return (
    <div className="bg-[#F9F2E3] min-h-screen pt-[68px]" data-no-translate>
      <Helmet>
        <title>{t('आमच्याविषयी', 'About Us')} | गडकिल्ले संवर्धन</title>
        <meta name="description" content={t('गडकिल्ले संवर्धन प्रतिष्ठान बद्दल माहिती', 'Information about Gadkille Sanvardhan Pratishthan')} />
      </Helmet>
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

      <div className="max-w-[1200px] mx-auto px-6 py-16 space-y-20">
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
              className="bg-white rounded-2xl p-7 border border-[#E8D5A3] shadow-sm"
            >
              <div className="text-4xl mb-4">{card.icon}</div>
              <h3 className="font-serif text-xl font-bold text-[#1A1008] mb-3">{card.title}</h3>
              <p className="text-[#6E5945] leading-relaxed text-sm">{card.text}</p>
            </div>
          ))}
        </div>

        <div>
          <SectionHeader
            eyebrow={t('आमची मूल्ये', 'Our Core Values')}
            title={t('चार स्तंभ ज्यावर आमचे कार्य उभे आहे', 'Four Pillars Supporting Our Mission')}
          />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
            {values.map(v => (
              <div
                key={v.title}
                className="text-center p-6 bg-white rounded-2xl border border-[#E8D5A3] shadow-sm"
              >
                <div className="text-5xl mb-4">{v.icon}</div>
                <h4 className="font-serif font-bold text-[#1A1008] mb-2">{v.title}</h4>
                <p className="text-xs text-[#6E5945] leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div>
          <SectionHeader
            eyebrow={t('आमचा प्रवास', 'Our Journey')}
            title={t('स्थापनेपासून आजपर्यंत', 'From Inception to Today')}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {milestones.map(m => (
              <div
                key={m.year}
                className="bg-white rounded-2xl p-5 border border-[#E8D5A3] shadow-sm"
              >
                <div className="font-cinzel text-[#A84A20] text-sm font-bold mb-1">{m.year}</div>
                <p className="text-[#6E5945] text-sm">{m.event}</p>
              </div>
            ))}
          </div>
        </div>

        <div>
          <SectionHeader
            eyebrow={t('आमची टीम', 'Our Leadership Team')}
            title={t('नेतृत्व करणारे हात', 'Hands Leading the Mission')}
          />
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {team.map(member => (
              <div
                key={member.name}
                className="bg-white rounded-2xl p-5 text-center border border-[#E8D5A3] shadow-sm"
              >
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#C1521F] to-[#B58A45] flex items-center justify-center text-white font-serif text-2xl font-bold mx-auto mb-3">
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
    </div>
  );
}
