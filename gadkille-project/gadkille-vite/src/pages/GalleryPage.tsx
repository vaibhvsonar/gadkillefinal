import React, { useState, useEffect } from 'react';
import { useSiteData } from '@/context/SiteContext';
import { EmptyDatabaseState } from '@/components/ui';
import { Helmet } from 'react-helmet-async';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

export function GalleryPage() {
  const { t, gallery } = useSiteData();
  const [selectedCat, setSelectedCat] = useState('सर्व');
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);
  const [imagesLoading, setImagesLoading] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const initialLoading: Record<string, boolean> = {};
    gallery.forEach(g => {
      initialLoading[g.id] = true;
    });
    setImagesLoading(initialLoading);
  }, [gallery]);

  const cats = ['सर्व', ...Array.from(new Set(gallery.map(g => g.category)))];
  const filtered =
    selectedCat === 'सर्व' ? gallery : gallery.filter(g => g.category === selectedCat);

  useEffect(() => {
    if (lightboxIdx === null) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightboxIdx(null);
      if (e.key === 'ArrowLeft' && lightboxIdx > 0) setLightboxIdx(i => i !== null ? i - 1 : null);
      if (e.key === 'ArrowRight' && lightboxIdx < filtered.length - 1) setLightboxIdx(i => i !== null ? i + 1 : null);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [lightboxIdx, filtered.length]);

  return (
    <div className="bg-[#1A1008] min-h-screen pt-[68px]">
      <Helmet>
        <title>{t('फोटो गॅलरी', 'Photo Gallery')} | Gadkille Savardhan</title>
      </Helmet>
      
      <div className="py-20 text-center">
        <div className="max-w-2xl mx-auto px-6">
          <div className="inline-flex items-center gap-2 mb-4 font-cinzel text-xs uppercase tracking-widest text-[#D4A955]">
            <span className="w-6 h-px bg-[#B58A45]" /> {t('फोटो गॅलरी', 'Photo Gallery')}{' '}
            <span className="w-6 h-px bg-[#B58A45]" />
          </div>
          <h1 className="font-serif text-4xl sm:text-5xl font-black text-[#F3E8D0] mb-4">
            {t('किल्ले दर्शन', 'Fort Sightings')}
          </h1>
          <p className="text-[rgba(243,232,208,0.6)]">
            {t('संवर्धन मोहिमा, कार्यक्रम आणि गडकिल्ल्यांचे छायाचित्र संग्रह.', 'A collection of photographs from conservation campaigns, events, and forts.')}
          </p>
        </div>
      </div>

      {/* Category filter */}
      <div className="border-y border-[rgba(181,138,69,0.15)] bg-[#2E1E0F] sticky top-[68px] z-30">
        <div className="max-w-[1200px] mx-auto px-6 py-3 flex gap-2 flex-wrap">
          {cats.map(c => (
            <button
              key={c}
              onClick={() => setSelectedCat(c)}
              className={`px-4 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                selectedCat === c
                  ? 'bg-[#B58A45] border-[#B58A45] text-[#0F0A04] font-bold'
                  : 'border-[rgba(181,138,69,0.3)] text-[rgba(243,232,208,0.7)] hover:border-[#B58A45] hover:text-[#D4A955]'
              }`}
            >
              {c === 'सर्व' ? t('सर्व', 'All') : c}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="max-w-[1200px] mx-auto px-6 py-10">
        {filtered.length === 0 ? (
          <EmptyDatabaseState title={t('गॅलरीमध्ये अद्याप कोणतीही छायाचित्रे जोडलेली नाहीत', 'No photos added to the gallery yet')} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filtered.map((item, idx) => (
              <button
                key={item.id}
                onClick={() => setLightboxIdx(idx)}
                className="group relative overflow-hidden rounded-2xl bg-[#2E1E0F] aspect-[4/3] text-left"
              >
                {imagesLoading[item.id] && (
                  <div className="absolute inset-0 bg-[#2E1E0F] animate-pulse" />
                )}
                <img
                  src={item.src}
                  alt={item.caption}
                  loading="lazy"
                  onLoad={() => setImagesLoading(prev => ({ ...prev, [item.id]: false }))}
                  className={`w-full h-full object-cover group-hover:scale-105 transition-all duration-500 ${imagesLoading[item.id] ? 'opacity-0' : 'opacity-100'}`}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[rgba(26,16,8,0.9)] via-transparent to-transparent flex items-end p-4">
                  <div>
                    <span className="block text-[10px] font-cinzel text-[#D4A955] uppercase tracking-wider mb-0.5">
                      {item.category}
                    </span>
                    <p className="text-[#F3E8D0] text-sm font-medium">{item.caption}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox Modal */}
      {lightboxIdx !== null && (
        <div 
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 backdrop-blur-sm" 
          onClick={() => setLightboxIdx(null)}
        >
          <button 
            className="absolute top-4 right-4 text-white/80 hover:text-white p-2" 
            onClick={() => setLightboxIdx(null)}
          >
            <X size={32} />
          </button>
          
          {lightboxIdx > 0 && (
            <button 
              className="absolute left-4 top-1/2 -translate-y-1/2 text-white/80 hover:text-white p-2" 
              onClick={e => { e.stopPropagation(); setLightboxIdx(lightboxIdx - 1); }}
            >
              <ChevronLeft size={36} />
            </button>
          )}
          
          {lightboxIdx < filtered.length - 1 && (
            <button 
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white/80 hover:text-white p-2" 
              onClick={e => { e.stopPropagation(); setLightboxIdx(lightboxIdx + 1); }}
            >
              <ChevronRight size={36} />
            </button>
          )}
          
          <div onClick={e => e.stopPropagation()} className="max-w-5xl max-h-[85vh] flex flex-col items-center">
            <img 
              src={filtered[lightboxIdx].src} 
              alt={filtered[lightboxIdx].caption} 
              className="max-w-full max-h-[75vh] object-contain rounded-lg shadow-2xl" 
            />
            <p className="text-white/90 text-center mt-4 text-lg font-medium">
              {filtered[lightboxIdx].caption}
            </p>
            <span className="text-[#D4A955] font-cinzel text-xs uppercase tracking-wider mt-1">
              {filtered[lightboxIdx].category}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
