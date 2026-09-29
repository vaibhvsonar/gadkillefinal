import React, { useEffect, useRef, useState } from 'react';
import { Map as MapLibreMap, Marker, Popup, NavigationControl, setWorkerUrl } from 'maplibre-gl';
import workerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url';
import 'maplibre-gl/dist/maplibre-gl.css';
import { Helmet } from 'react-helmet-async';
import { useSiteData } from '@/context/SiteContext';

setWorkerUrl(workerUrl);

function escapeHtml(str: string): string {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

const OPENFREEMAP_STYLES = [
  { id: 'liberty', labelMr: 'लिबर्टी (Liberty)', labelEn: 'Liberty', url: 'https://tiles.openfreemap.org/styles/liberty' },
  { id: 'bright', labelMr: 'ब्राईट (Bright)', labelEn: 'Bright', url: 'https://tiles.openfreemap.org/styles/bright' },
  { id: 'positron', labelMr: 'पॉझिट्रॉन (Positron)', labelEn: 'Positron', url: 'https://tiles.openfreemap.org/styles/positron' },
  { id: 'dark', labelMr: 'डार्क (Dark)', labelEn: 'Dark', url: 'https://tiles.openfreemap.org/styles/dark' },
] as const;

export function MapPage() {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<MapLibreMap | null>(null);
  const markersRef = useRef<Marker[]>([]);
  const { forts, lang, t } = useSiteData();
  const [styleId, setStyleId] = useState<string>('liberty');

  const activeStyleUrl =
    OPENFREEMAP_STYLES.find(s => s.id === styleId)?.url ||
    'https://tiles.openfreemap.org/styles/liberty';

  // Initialize OpenFreeMap MapLibre instance
  useEffect(() => {
    if (!mapRef.current) return;

    const map = new MapLibreMap({
      container: mapRef.current,
      style: activeStyleUrl,
      center: [73.75, 18.5], // [lng, lat] — Maharashtra / Sahyadri center
      zoom: 7.2,
    });

    map.addControl(new NavigationControl({ visualizePitch: true }), 'top-right');
    mapInstanceRef.current = map;

    return () => {
      markersRef.current.forEach(m => m.remove());
      markersRef.current = [];
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Switch OpenFreeMap style dynamically when user selects a different style
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    mapInstanceRef.current.setStyle(activeStyleUrl);
  }, [activeStyleUrl]);

  // Render fort markers on OpenFreeMap
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear previous markers
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    const statusColor: Record<string, string> = {
      conserved: '#36583C',
      progress: '#B58A45',
      needed: '#A84A20',
    };

    forts.forEach(fort => {
      const lat = Number(fort.latitude) || 18.3;
      const lng = Number(fort.longitude) || 73.75;
      const color = statusColor[fort.status] || '#6E5945';

      const el = document.createElement('div');
      el.style.cssText = `
        width: 18px;
        height: 18px;
        background: ${color};
        border: 3px solid #FFFFFF;
        border-radius: 50%;
        box-shadow: 0 2px 8px rgba(0,0,0,0.45);
        cursor: pointer;
        transition: transform 0.15s ease;
      `;
      el.onmouseenter = () => {
        el.style.transform = 'scale(1.25)';
      };
      el.onmouseleave = () => {
        el.style.transform = 'scale(1)';
      };

      const safeName = escapeHtml(lang === 'en' && fort.nameEn ? fort.nameEn : fort.name);
      const safeDistrict = escapeHtml(fort.district);
      const safeHeight = escapeHtml(fort.height);
      const safeStatusLabel = escapeHtml(fort.statusLabel);

      const popupHtml = `
        <div style="font-family:'Noto Sans Devanagari',sans-serif;min-width:175px;padding:4px 2px">
          <strong style="font-size:15px;color:#1A1008;display:block;margin-bottom:2px">
            ${safeName}
          </strong>
          <span style="font-size:11.5px;color:#6E5945;display:block;margin-bottom:4px">
            ${safeDistrict} · ${safeHeight}
          </span>
          <span style="display:inline-block;padding:2px 8px;border-radius:999px;font-size:10.5px;color:#FFFFFF;background:${color};font-weight:700;margin-bottom:6px">
            ${safeStatusLabel}
          </span><br/>
          <a href="/forts/${escapeHtml(fort.id)}" style="font-size:12px;color:#C1521F;text-decoration:none;font-weight:700">
            ${lang === 'en' ? 'View Details →' : 'अधिक माहिती →'}
          </a>
        </div>
      `;

      const popup = new Popup({ offset: 14, closeButton: true }).setHTML(popupHtml);

      const marker = new Marker({ element: el })
        .setLngLat([lng, lat])
        .setPopup(popup)
        .addTo(map);

      markersRef.current.push(marker);
    });
  }, [forts, lang]);

  return (
    <div className="bg-[#F9F2E3] min-h-screen pt-[68px]" data-no-translate>
      <Helmet>
        <title>{t('नकाशा | गडकिल्ले', 'Map | Gadkille')}</title>
      </Helmet>

      <div className="bg-[#1A1008] py-10 text-center">
        <div className="max-w-2xl mx-auto px-6">
          <div className="inline-flex items-center gap-2 mb-3 font-cinzel text-xs uppercase tracking-widest text-[#D4A955]">
            <span className="w-6 h-px bg-[#B58A45]" />{' '}
            {t('इंटरॅक्टिव नकाशा · OpenFreeMap', 'Interactive Map · OpenFreeMap')}{' '}
            <span className="w-6 h-px bg-[#B58A45]" />
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-black text-[#F3E8D0] mb-2">
            {t(`महाराष्ट्रातील गडकिल्ले (${forts.length})`, `Forts of Maharashtra (${forts.length})`)}
          </h1>
          <p className="text-[rgba(243,232,208,0.65)] text-sm">
            {t('किल्ल्यावर क्लिक करा — माहिती पाहा', 'Click on any fort marker to view details')}
          </p>
        </div>
      </div>

      {/* Legend + OpenFreeMap Style Selector */}
      <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-3 bg-white border-b border-[#E8D5A3] text-xs max-w-[1440px] mx-auto">
        <div className="flex flex-wrap items-center gap-5">
          {[
            ['#36583C', t('संवर्धित', 'Conserved')],
            ['#B58A45', t('सुरू आहे', 'In Progress')],
            ['#A84A20', t('संवर्धन आवश्यक', 'Needs Conservation')],
          ].map(([c, l]) => (
            <span key={l} className="flex items-center gap-1.5 font-semibold text-[#1A1008]">
              <span
                className="w-3.5 h-3.5 rounded-full border-2 border-white shadow"
                style={{ background: c }}
              />
              {l}
            </span>
          ))}
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-[#6E5945] font-semibold mr-1">
            {t('नकाशा शैली:', 'Map Style:')}
          </span>
          {OPENFREEMAP_STYLES.map(s => (
            <button
              key={s.id}
              type="button"
              onClick={() => setStyleId(s.id)}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all border ${
                styleId === s.id
                  ? 'bg-[#C1521F] text-white border-[#C1521F] shadow-sm'
                  : 'bg-[#F6EFE0] text-[#1A1008] border-[#D8C39E] hover:bg-[#EADBC0]'
              }`}
            >
              {lang === 'en' ? s.labelEn : s.labelMr}
            </button>
          ))}
        </div>
      </div>

      <div
        ref={mapRef}
        className="w-full z-10"
        style={{ height: 'calc(100vh - 230px)', minHeight: '520px' }}
      />
    </div>
  );
}
