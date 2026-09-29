import React from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  MapPin,
  Mountain,
  Clock,
  Navigation,
  Wifi,
  Droplets,
  ArrowLeft,
} from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { useSiteData } from '@/context/SiteContext';
import { StatusBadge, DifficultyBadge, EmptyDatabaseState } from '@/components/ui';

export function FortDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { forts, events, loading, t } = useSiteData();

  if (loading) {
    return (
      <div className="bg-[#F9F2E3] min-h-screen pt-28 px-6">
        <div className="max-w-[1200px] mx-auto animate-pulse">
          <div className="h-96 bg-black/10 rounded-3xl mb-8" />
          <div className="h-10 bg-black/10 rounded-xl w-1/3 mb-4" />
          <div className="h-6 bg-black/10 rounded-xl w-1/4 mb-12" />
        </div>
      </div>
    );
  }

  const fort = forts.find(f => f.id === id);

  if (!fort) {
    return (
      <div className="bg-[#F9F2E3] min-h-screen pt-28 px-6">
        <EmptyDatabaseState
          title={t('किल्ला सापडला नाही', 'Fort Not Found')}
          subtitle={t('कृपया गडकिल्ले यादीतून योग्य किल्ला निवडा.', 'Please select a valid fort from the list.')}
        />
      </div>
    );
  }

  const related = forts.filter(f => f.id !== fort.id && f.district === fort.district).slice(0, 3);
  const relatedEvents = events
    .filter(e => e.location === fort.name || e.district === fort.district)
    .slice(0, 2);

  const trekMeta = [
    { icon: Navigation, label: t('अंतर', 'Distance'), value: fort.trek.distance },
    { icon: Clock, label: t('वेळ', 'Time'), value: fort.trek.time },
    { icon: Droplets, label: t('पाणी', 'Water'), value: fort.trek.water },
    { icon: Wifi, label: t('नेटवर्क', 'Network'), value: fort.trek.network },
  ];

  return (
    <div className="bg-[#F9F2E3] min-h-screen">
      <Helmet>
        <title>{fort.name} | गडकिल्ले संवर्धन</title>
        <meta name="description" content={fort.desc} />
      </Helmet>
      {/* Hero */}
      <div className="relative h-[68vh] min-h-[420px] overflow-hidden">
        <img src={fort.image} alt={fort.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-[rgba(26,16,8,0.88)] via-[rgba(26,16,8,0.3)] to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-10 max-w-[1200px] mx-auto">
          <div className="flex flex-wrap gap-2 mb-4">
            <StatusBadge status={fort.status} label={fort.statusLabel} />
            <DifficultyBadge difficulty={fort.difficulty} difficultyEn={fort.difficultyEn} />
            <span className="px-3 py-1 bg-[rgba(26,16,8,0.6)] text-[#D4A955] text-xs font-cinzel rounded-full backdrop-blur-sm border border-[rgba(181,138,69,0.3)]">
              {fort.type}
            </span>
          </div>
          <nav className="flex items-center gap-2 text-sm text-[rgba(243,232,208,0.7)] mb-4 font-medium">
            <Link to="/" className="hover:text-[#D4A955] transition-colors">{t('मुखपृष्ठ', 'Home')}</Link>
            <span>›</span>
            <Link to="/forts" className="hover:text-[#D4A955] transition-colors">{t('गडकिल्ले', 'Forts')}</Link>
            <span>›</span>
            <span className="text-white">{fort.name}</span>
          </nav>
          <h1 className="font-serif text-5xl sm:text-7xl font-black text-[#F3E8D0] mb-2">
            {fort.name}
          </h1>
          <p className="font-cinzel text-[#B58A45] text-sm uppercase tracking-widest mb-4">
            {fort.nameEn}
          </p>
          <div className="flex flex-wrap gap-4 text-[rgba(243,232,208,0.75)] text-sm">
            <span className="flex items-center gap-1.5">
              <MapPin size={14} />
              {fort.district} जिल्हा, {fort.taluka}
            </span>
            <span className="flex items-center gap-1.5">
              <Mountain size={14} />
              {fort.height}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock size={14} />
              {fort.era}
            </span>
          </div>
        </div>
        <Link
          to="/forts"
          className="absolute top-22 left-6 flex items-center gap-2 px-4 py-2 rounded-full bg-[rgba(26,16,8,0.65)] text-[#F3E8D0] text-sm backdrop-blur-sm border border-[rgba(181,138,69,0.3)] hover:border-[#D4A955] transition-colors"
        >
          <ArrowLeft size={14} /> सर्व गडकिल्ले
        </Link>
      </div>

      {/* Content */}
      <div className="max-w-[1200px] mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-10">
            <div>
              <h2 className="font-serif text-2xl font-bold text-[#1A1008] mb-4 flex items-center gap-3">
                <span className="w-8 h-0.5 bg-[#B58A45]" /> {t('ऐतिहासिक महत्त्व', 'Historical Significance')}
              </h2>
              <p className="text-[#6E5945] leading-relaxed text-[15px]">{fort.history}</p>
            </div>

            <div className="p-6 bg-white rounded-2xl border border-[#E8D5A3] shadow-sm">
              <p className="text-[#6E5945] leading-relaxed italic text-base border-l-2 border-[#B58A45] pl-4">
                "{fort.desc}"
              </p>
            </div>

            {fort.features.length > 0 && (
              <div>
                <h2 className="font-serif text-2xl font-bold text-[#1A1008] mb-5 flex items-center gap-3">
                  <span className="w-8 h-0.5 bg-[#B58A45]" /> {t('प्रमुख वैशिष्ट्ये', 'Key Features')}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {fort.features.map(f => (
                    <div
                      key={f}
                      className="flex items-center gap-3 p-4 bg-white rounded-xl border border-[#E8D5A3] shadow-sm"
                    >
                      <span className="text-[#B58A45] text-lg">🏛️</span>
                      <span className="text-[#6E5945] font-medium text-sm">{f}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {relatedEvents.length > 0 && (
              <div>
                <h2 className="font-serif text-2xl font-bold text-[#1A1008] mb-5 flex items-center gap-3">
                  <span className="w-8 h-0.5 bg-[#B58A45]" /> {t('संबंधित कार्यक्रम', 'Related Events')}
                </h2>
                <div className="space-y-3">
                  {relatedEvents.map(ev => (
                    <div
                      key={ev.id}
                      className="flex items-center gap-4 p-4 bg-white rounded-xl border border-[#E8D5A3] shadow-sm"
                    >
                      <div className="bg-[#A84A20] text-white rounded-xl px-3 py-2 text-center shrink-0">
                        <div className="font-bold text-lg leading-none">{ev.dateNum}</div>
                        <div className="font-cinzel text-[9px] uppercase">{ev.month}</div>
                      </div>
                      <div>
                        <p className="font-medium text-[#1A1008] text-sm">{ev.title}</p>
                        <p className="text-xs text-[#8F7A66]">{ev.location}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {related.length > 0 && (
              <div>
                <h2 className="font-serif text-2xl font-bold text-[#1A1008] mb-5 flex items-center gap-3">
                  <span className="w-8 h-0.5 bg-[#B58A45]" /> {t('जवळचे किल्ले', 'Nearby Forts')}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {related.map(r => (
                    <Link
                      key={r.id}
                      to={`/forts/${r.id}`}
                      className="group bg-white rounded-xl overflow-hidden border border-[#E8D5A3] shadow-sm hover:shadow-md transition-all"
                    >
                      <div className="relative h-32 overflow-hidden">
                        <img
                          src={r.image}
                          alt={r.name}
                          loading="lazy"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                      <div className="p-3">
                        <p className="font-serif font-bold text-[#1A1008] text-sm">{r.name}</p>
                        <p className="text-xs text-[#8F7A66]">{r.district}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sticky Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-4">
              <div className="bg-white rounded-2xl border border-[#E8D5A3] shadow-sm overflow-hidden">
                <div className="bg-[#1A1008] p-4">
                  <h3 className="font-serif font-bold text-[#D4A955] text-lg">{t('ट्रेक माहिती', 'Trek Information')}</h3>
                  <p className="text-[rgba(243,232,208,0.5)] text-xs mt-0.5">
                    {t('हंगाम', 'Season')}: {fort.trek.season}
                  </p>
                </div>
                <div className="p-4 space-y-3">
                  {trekMeta.map(({ icon: Icon, label, value }) => (
                    <div
                      key={label}
                      className="flex items-center justify-between py-2 border-b border-[#F3E8D0] last:border-0"
                    >
                      <span className="flex items-center gap-2 text-xs text-[#8F7A66]">
                        <Icon size={13} className="text-[#B58A45]" />
                        {label}
                      </span>
                      <span className="text-sm font-medium text-[#1A1008]">{value}</span>
                    </div>
                  ))}
                </div>
              </div>

              <Link
                to="/volunteer"
                className="block w-full text-center py-3.5 rounded-xl bg-[#A84A20] text-white font-semibold text-sm hover:bg-[#7A3215] transition-colors"
              >
                🤝 {t('मोहिमेत सामील व्हा', 'Join the Mission')}
              </Link>
              <Link
                to="/donate"
                className="block w-full text-center py-3.5 rounded-xl border-2 border-[#A84A20] text-[#A84A20] font-semibold text-sm hover:bg-[#A84A20] hover:text-white transition-all"
              >
                ❤️ {t('या किल्ल्यासाठी देणगी द्या', 'Donate for this Fort')}
              </Link>
              <Link
                to="/map"
                className="block w-full text-center py-3 rounded-xl border border-[#E8D5A3] text-[#6E5945] font-medium text-sm hover:border-[#B58A45] hover:text-[#A84A20] transition-all"
              >
                🗺️ {t('नकाशावर पहा', 'View on Map')}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
