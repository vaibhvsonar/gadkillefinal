import React from 'react';

export function SectionHeader({
  eyebrow,
  title,
  subtitle,
  light = false,
  center = true,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  light?: boolean;
  center?: boolean;
}) {
  return (
    <div className={`mb-12 ${center ? 'text-center' : ''}`}>
      {eyebrow && (
        <div
          className={`inline-flex items-center gap-2 mb-3 font-cinzel text-xs uppercase tracking-[0.22em] ${
            light ? 'text-[#D4A955]' : 'text-[#A84A20]'
          }`}
        >
          <span className={`block w-6 h-px ${light ? 'bg-[#B58A45]' : 'bg-[#A84A20]'}`} />
          {eyebrow}
          <span className={`block w-6 h-px ${light ? 'bg-[#B58A45]' : 'bg-[#A84A20]'}`} />
        </div>
      )}
      <h2
        className={`font-serif text-3xl sm:text-4xl font-bold leading-snug mb-4 ${
          light ? 'text-[#F3E8D0]' : 'text-[#1A1008]'
        }`}
      >
        {title}
      </h2>
      <div className={`flex items-center gap-3 mb-4 ${center ? 'justify-center' : ''}`}>
        <div className="h-px w-12 bg-gradient-to-r from-transparent to-[#B58A45]" />
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="shrink-0">
          <path
            d="M12 2C12 2 7 7 7 12C7 17 12 22 12 22C12 22 17 17 17 12C17 7 12 2 12 2Z"
            fill="#B58A45"
            opacity="0.8"
          />
          <path
            d="M12 5C12 5 9 9 9 12C9 15 12 19 12 19C12 19 15 15 15 12C15 9 12 5 12 5Z"
            fill="#D4A955"
          />
        </svg>
        <div className="h-px w-12 bg-gradient-to-l from-transparent to-[#B58A45]" />
      </div>
      {subtitle && (
        <p
          className={`max-w-xl mx-auto text-base leading-relaxed ${
            light ? 'text-[rgba(243,232,208,0.65)]' : 'text-[#6E5945]'
          }`}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}

export function StatusBadge({ status, label }: { status: string; label: string }) {
  const colors: Record<string, string> = {
    conserved: 'bg-green-800 text-green-100 border-green-700',
    progress: 'bg-amber-800 text-amber-100 border-amber-700',
    needed: 'bg-red-900 text-red-100 border-red-800',
  };
  const dots: Record<string, string> = {
    conserved: 'bg-green-400',
    progress: 'bg-amber-400',
    needed: 'bg-red-400',
  };
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${
        colors[status] || 'bg-stone-800 text-stone-100 border-stone-700'
      }`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dots[status] || 'bg-stone-400'}`} />
      {label}
    </span>
  );
}

export function DifficultyBadge({
  difficulty,
  difficultyEn,
}: {
  difficulty: string;
  difficultyEn: string;
}) {
  const colors: Record<string, string> = {
    easy: 'text-green-700 bg-green-50 border-green-200',
    moderate: 'text-amber-700 bg-amber-50 border-amber-200',
    hard: 'text-red-700 bg-red-50 border-red-200',
  };
  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
        colors[difficultyEn] || 'text-stone-600 bg-stone-50 border-stone-200'
      }`}
    >
      🥾 {difficulty}
    </span>
  );
}

import { useSiteData } from '@/context/SiteContext';

export function EmptyDatabaseState({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  const { t } = useSiteData();
  const defaultSubtitle = t(
    'लवकरच नवीन माहिती जोडली जाईल. कृपया थोड्या वेळाने पुन्हा भेट द्या.',
    'New content is being updated and will be available soon. Please check back shortly.'
  );
  return (
    <div className="bg-white rounded-3xl p-10 text-center border border-[#E8D5A3] max-w-xl mx-auto my-8 shadow-sm">
      <div className="text-4xl mb-3">🏰</div>
      <h3 className="font-serif text-xl font-bold text-[#1A1008] mb-2">{title}</h3>
      <p className="text-xs text-[#6E5945] mb-2">{subtitle || defaultSubtitle}</p>
    </div>
  );
}

