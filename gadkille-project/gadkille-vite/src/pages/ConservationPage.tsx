import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { useSiteData } from '@/context/SiteContext';
import { SectionHeader, EmptyDatabaseState } from '@/components/ui';

export function ConservationPage() {
  const { projects, t, loading: isLoading } = useSiteData();
  
  const statusColor: Record<string, string> = {
    [t('सुरू आहे', 'In Progress')]: '#B58A45',
    [t('पूर्ण', 'Completed')]: '#36583C',
    [t('नियोजित', 'Planned')]: '#6E5945',
  };

  return (
    <div className="bg-[#F9F2E3] min-h-screen pt-[68px]">
      <Helmet>
        <title>{t('संवर्धन प्रकल्प | गडकिल्ले', 'Conservation Projects | Gadkille')}</title>
      </Helmet>
      <div className="bg-[#1A1008] py-20 text-center">
        <div className="max-w-2xl mx-auto px-6">
          <div className="inline-flex items-center gap-2 mb-4 font-cinzel text-xs uppercase tracking-widest text-[#D4A955]">
            <span className="w-6 h-px bg-[#B58A45]" /> {t('आमचे कार्य', 'Our Work')}{' '}
            <span className="w-6 h-px bg-[#B58A45]" />
          </div>
          <h1 className="font-serif text-4xl sm:text-5xl font-black text-[#F3E8D0] mb-4">
            {t('संवर्धन प्रकल्प', 'Conservation Projects')}
          </h1>
          <p className="text-[rgba(243,232,208,0.6)]">
            {t('प्रत्येक किल्ला पुन्हा उभा करण्यासाठी आमचे तज्ज्ञ आणि स्वयंसेवक अहोरात्र झटत आहेत.', 'Our experts and volunteers are working tirelessly to rebuild and conserve every fort.')}
          </p>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-6 py-16">
        <SectionHeader eyebrow={t('चालू प्रकल्प', 'Ongoing Projects')} title={t('संवर्धन कार्याचा आढावा', 'Conservation Work Overview')} />

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[1, 2].map((n) => (
              <div key={n} className="bg-white rounded-2xl h-[320px] animate-pulse border border-[#E8D5A3] p-6">
                <div className="h-6 bg-[#E8D5A3]/50 rounded w-1/4 mb-4"></div>
                <div className="h-8 bg-[#E8D5A3]/50 rounded w-1/2 mb-6"></div>
                <div className="h-4 bg-[#E8D5A3]/50 rounded w-full mb-2"></div>
                <div className="h-4 bg-[#E8D5A3]/50 rounded w-3/4 mb-8"></div>
                <div className="h-20 bg-[#E8D5A3]/50 rounded-xl mb-4"></div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="h-16 bg-[#E8D5A3]/50 rounded-lg"></div>
                  <div className="h-16 bg-[#E8D5A3]/50 rounded-lg"></div>
                  <div className="h-16 bg-[#E8D5A3]/50 rounded-lg"></div>
                </div>
              </div>
            ))}
          </div>
        ) : projects.length === 0 ? (
          <EmptyDatabaseState title={t('डेटाबेसमध्ये अद्याप कोणताही संवर्धन प्रकल्प नाही', 'No conservation projects found in the database')} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {projects.map(proj => {
              const col = statusColor[proj.status] || '#B58A45';
              return (
                <div
                  key={proj.id}
                  className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-200 border border-[#E8D5A3]"
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <div>
                        <span className="font-cinzel text-xs text-[#B58A45] uppercase tracking-widest">
                          {proj.fort}
                        </span>
                        <h3 className="font-serif text-xl font-bold text-[#1A1008] mt-1">
                          {proj.title}
                        </h3>
                      </div>
                      <span
                        className="shrink-0 px-3 py-1 rounded-full text-xs font-semibold"
                        style={{ background: `${col}18`, color: col }}
                      >
                        {proj.status}
                      </span>
                    </div>
                    <p className="text-sm text-[#6E5945] mb-5">{proj.desc}</p>

                    <div className="bg-[#F9F2E3] rounded-xl p-4 mb-4">
                      <div className="flex justify-between text-xs text-[#8F7A66] mb-2">
                        <span>{t('प्रगती', 'Progress')}</span>
                        <span className="font-bold" style={{ color: col }}>
                          {proj.progress}%
                        </span>
                      </div>
                      <div className="w-full bg-[#E8D5A3] rounded-full h-2 overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{ width: `${proj.progress}%`, background: col }}
                        />
                      </div>
                      <p className="text-xs text-[#8F7A66] mt-2">{proj.impact}</p>
                    </div>

                    <div className="grid grid-cols-3 gap-3 text-center">
                      <div className="p-2 rounded-lg bg-[#F9F2E3]">
                        <div className="text-xs text-[#8F7A66]">{t('स्वयंसेवक', 'Volunteers')}</div>
                        <div className="font-bold text-[#1A1008] text-sm mt-0.5">
                          {proj.volunteers}
                        </div>
                      </div>
                      <div className="p-2 rounded-lg bg-[#F9F2E3]">
                        <div className="text-xs text-[#8F7A66]">{t('अंदाजपत्रक', 'Budget')}</div>
                        <div className="font-bold text-[#1A1008] text-xs mt-0.5">
                          {proj.budget}
                        </div>
                      </div>
                      <div className="p-2 rounded-lg bg-[#F9F2E3]">
                        <div className="text-xs text-[#8F7A66]">{t('खर्च', 'Spent')}</div>
                        <div className="font-bold text-[#1A1008] text-xs mt-0.5">
                          {proj.spent}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-4 text-xs text-[#8F7A66]">
                      <Calendar size={12} /> {proj.start} – {proj.end}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-16 text-center bg-[#1A1008] rounded-3xl p-12">
          <h3 className="font-serif text-3xl font-bold text-[#F3E8D0] mb-4">
            {t('या संवर्धन कार्यात सामील व्हा', 'Join This Conservation Effort')}
          </h3>
          <p className="text-[rgba(243,232,208,0.6)] mb-8 max-w-md mx-auto">
            {t('तुमची वेळ किंवा देणगी — दोन्हीही या किल्ल्यांच्या भवितव्यासाठी महत्त्वाचे आहे.', 'Your time or donation — both are crucial for the future of these forts.')}
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              to="/volunteer"
              className="px-8 py-3 rounded font-semibold text-white text-sm btn-shimmer"
            >
              {t('स्वयंसेवक बना', 'Become a Volunteer')}
            </Link>
            <Link
              to="/donate"
              className="px-8 py-3 rounded font-semibold text-[#D4A955] text-sm border border-[rgba(181,138,69,0.4)] hover:bg-[rgba(181,138,69,0.1)] transition-colors"
            >
              {t('देणगी द्या', 'Donate')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
