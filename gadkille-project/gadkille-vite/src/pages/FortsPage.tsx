import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Mountain, ArrowRight, Filter, Search } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { useSiteData } from '@/context/SiteContext';
import { StatusBadge, DifficultyBadge, EmptyDatabaseState } from '@/components/ui';

export function FortsPage() {
  const { forts, settings, loading, t } = useSiteData();
  const [selectedDistrict, setSelectedDistrict] = useState('सर्व');
  const [selectedStatus, setSelectedStatus] = useState('सर्व');
  const [searchQuery, setSearchQuery] = useState('');

  const rawDistricts = Array.from(new Set(forts.map(f => f.district)));
  const districts = ['सर्व', ...rawDistricts];
  const statuses = [
    { key: 'सर्व', label: t('सर्व', 'All') },
    { key: 'conserved', label: t('संवर्धित', 'Conserved') },
    { key: 'progress', label: t('सुरू', 'In Progress') },
    { key: 'needed', label: t('आवश्यक', 'Needed') },
  ];

  const filtered = forts.filter(f => {
    const matchDist = selectedDistrict === 'सर्व' || f.district === selectedDistrict;
    const matchStat = selectedStatus === 'सर्व' || f.status === selectedStatus;
    const matchSearch =
      f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.nameEn.toLowerCase().includes(searchQuery.toLowerCase());
    return matchDist && matchStat && matchSearch;
  });

  return (
    <div className="bg-[#F9F2E3] min-h-screen pt-[68px]">
      <Helmet>
        <title>{t('महाराष्ट्राचे गडकिल्ले', 'Forts of Maharashtra')} | गडकिल्ले संवर्धन</title>
        <meta name="description" content={t('महाराष्ट्रातील सर्व गडकिल्ल्यांची माहिती.', 'Information about all forts in Maharashtra.')} />
      </Helmet>
      {/* Page hero */}
      <div className="relative bg-[#1A1008] py-20 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{ backgroundImage: "url('/images/hero-fort.jpg')" }}
        />
        <div className="relative z-10 max-w-[1200px] mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 mb-4 font-cinzel text-xs uppercase tracking-widest text-[#D4A955]">
            <span className="w-6 h-px bg-[#B58A45]" /> {t('गडकिल्ले एक्सप्लोरर', 'Fort Explorer')}{' '}
            <span className="w-6 h-px bg-[#B58A45]" />
          </div>
          <h1 className="font-serif text-4xl sm:text-5xl font-black text-[#F3E8D0] mb-4">
            {t('महाराष्ट्राचे गडकिल्ले', 'Forts of Maharashtra')}
          </h1>
          <p className="text-[rgba(243,232,208,0.6)] max-w-xl mx-auto">
            {t(`${settings.statForts}+ नोंदणीकृत गडकिल्ल्यांपैकी आमच्या संवर्धन यादीतील किल्ले शोधा`, `Explore forts from our conservation list of ${settings.statForts}+ registered forts`)}
          </p>
        </div>
      </div>

      {/* Filter bar */}
      <div className="border-b border-[#E8D5A3] bg-white shadow-sm sticky top-[68px] z-30">
        <div className="max-w-[1200px] mx-auto px-6 py-3 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <div className="flex flex-wrap gap-2 items-center flex-1">
            <Filter size={14} className="text-[#8F7A66]" />
            {districts.map(d => (
              <button
                key={d}
                onClick={() => setSelectedDistrict(d)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                  selectedDistrict === d
                    ? 'bg-[#A84A20] border-[#A84A20] text-white'
                    : 'border-[#E8D5A3] text-[#6E5945] hover:border-[#A84A20] hover:text-[#A84A20]'
                }`}
              >
                {d === 'सर्व' ? t('सर्व', 'All') : d}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-3 items-center w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8F7A66]" size={14} />
              <input
                type="text"
                placeholder={t('किल्ला शोधा...', 'Search forts...')}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full border border-[#E8D5A3] rounded-full pl-9 pr-4 py-1.5 text-sm outline-none focus:border-[#A84A20] transition-colors bg-[#F9F2E3]/50"
              />
            </div>
            <div className="flex gap-2">
              {statuses.map(s => (
                <button
                  key={s.key}
                  onClick={() => setSelectedStatus(s.key)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                    selectedStatus === s.key
                      ? 'bg-[#1A1008] border-[#1A1008] text-[#D4A955]'
                      : 'border-[#E8D5A3] text-[#6E5945] hover:border-[#A84A20] hover:text-[#A84A20]'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Fort grid */}
      <div className="max-w-[1200px] mx-auto px-6 py-12">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
              <div key={i} className="bg-white rounded-2xl h-72 animate-pulse border border-[#E8D5A3]/60" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyDatabaseState title={t('कोणताही किल्ला सापडला नाही', 'No forts found')} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filtered.map(fort => (
              <Link
                key={fort.id}
                to={`/forts/${fort.id}`}
                className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-200 border border-[#E8D5A3]/60"
              >
                <div className="relative h-44 overflow-hidden">
                  <img
                    src={fort.image}
                    alt={fort.name}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  <div className="absolute top-2 left-2">
                    <StatusBadge status={fort.status} label={fort.statusLabel} />
                  </div>
                  <div className="absolute bottom-2 right-2">
                    <DifficultyBadge
                      difficulty={fort.difficulty}
                      difficultyEn={fort.difficultyEn}
                    />
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 className="font-serif text-lg font-bold text-[#1A1008] group-hover:text-[#A84A20] transition-colors">
                      {fort.name}
                    </h3>
                    <span className="shrink-0 text-[10px] font-cinzel text-[#B58A45] uppercase">
                      {fort.type}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-[11px] text-[#8F7A66] mb-3">
                    <span className="flex items-center gap-1">
                      <MapPin size={10} />
                      {fort.district}
                    </span>
                    <span className="flex items-center gap-1">
                      <Mountain size={10} />
                      {fort.height}
                    </span>
                  </div>
                  <p className="text-xs text-[#6E5945] line-clamp-2 mb-3">{fort.desc}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-[#A84A20] text-xs font-semibold flex items-center gap-1">
                      {t('सविस्तर पहा', 'View Details')} <ArrowRight size={11} />
                    </span>
                    <span className="text-[10px] text-[#8F7A66] font-cinzel">{fort.era}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

