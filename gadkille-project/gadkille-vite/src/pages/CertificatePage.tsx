import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Printer, CheckCircle2, Search, ShieldCheck, AlertCircle, Loader2 } from 'lucide-react';
import { api, type CertificateData } from '@/lib/api';
import { useSiteData } from '@/context/SiteContext';

export function CertificatePage() {
  const { settings, t } = useSiteData();
  const [searchParams] = useSearchParams();

  const [lookupQuery, setLookupQuery] = useState(searchParams.get('code') || '');
  const [cert, setCert] = useState<CertificateData | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const certTitles: Record<string, string> = {
    volunteer: t('स्वयंसेवक सन्मान प्रमाणपत्र', 'Volunteer Honor Certificate'),
    trek: t('दुर्गभ्रमण (ट्रेक) पूर्णता प्रमाणपत्र', 'Fort Trek Completion Certificate'),
    quiz: t('मराठा इतिहास ज्ञान गुणवत्ता प्रमाणपत्र', 'Maratha History Merit Certificate'),
    conservation: t('गडकिल्ले संवर्धन योगदान प्रमाणपत्र', 'Fort Conservation Contribution Certificate'),
  };

  const certBodies: Record<string, (event: string) => string> = {
    volunteer: evt =>
      t(
        `यांनी गडकिल्ले संवर्धन प्रतिष्ठानच्या "${evt}" उपक्रमात सक्रिय स्वयंसेवक म्हणून सहभाग नोंदवला असून महाराष्ट्राच्या ऐतिहासिक गडकिल्ल्यांच्या जतन व संवर्धन कार्यात अमूल्य योगदान दिले आहे.`,
        `has actively participated as a volunteer in Gadkille Sanvardhan Pratishthan's "${evt}" initiative and made an invaluable contribution toward conserving Maharashtra's historic forts.`
      ),
    trek: evt =>
      t(
        `यांनी गडकिल्ले संवर्धन प्रतिष्ठानच्या "${evt}" मोहिमेमध्ये यशस्वीरित्या सहभाग घेऊन उत्कृष्ट ट्रेकिंग शिस्त आणि ऐतिहासिक जागरूकतेचे दर्शन घडवले आहे.`,
        `has successfully participated in Gadkille Sanvardhan Pratishthan's "${evt}" expedition, demonstrating exemplary trekking discipline and historical awareness.`
      ),
    quiz: evt =>
      t(
        `यांनी गडकिल्ले संवर्धन प्रतिष्ठानच्या "${evt}" मध्ये विशेष प्राविण्य प्राप्त करून छत्रपती शिवाजी महाराजांच्या दुर्गनीतीचे व मराठा इतिहासाचे सखोल ज्ञान सिद्ध केले आहे.`,
        `has achieved distinction in Gadkille Sanvardhan Pratishthan's "${evt}", demonstrating deep knowledge of Chhatrapati Shivaji Maharaj's fort strategy and Maratha history.`
      ),
    conservation: evt =>
      t(
        `यांनी गडकिल्ले संवर्धन प्रतिष्ठानच्या "${evt}" श्रमदान मोहिमेत प्रत्यक्ष सहभाग घेऊन गडकिल्ले स्वच्छता व वास्तू संवर्धनात मोलाची कामगिरी बजावली आहे.`,
        `has actively participated in Gadkille Sanvardhan Pratishthan's "${evt}" conservation drive, playing a vital role in fort cleanliness and architectural preservation.`
      ),
  };

  const fetchCertificate = async (queryStr: string) => {
    const q = queryStr.trim();
    if (!q) return;
    setLoading(true);
    setErrorMsg(null);
    setCert(null);
    try {
      const data = await api.verifyCertificate(q);
      setCert(data);
    } catch (err: any) {
      setErrorMsg(
        err.message ||
          t(
            'प्रमाणपत्र सापडले नाही. कृपया प्रशासनाने (Admin) जारी केलेला प्रमाणपत्र क्रमांक किंवा आपले अचूक नाव टाका.',
            'Certificate not found. Please enter the exact Certificate ID or Full Name issued by the administration.'
          )
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const initialCode = searchParams.get('code');
    if (initialCode) {
      fetchCertificate(initialCode);
    }
  }, [searchParams]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchCertificate(lookupQuery);
  };

  return (
    <div className="bg-[#F9F2E3] min-h-screen pt-[68px] pb-20">
      <Helmet>
        <title>
          {t('डिजिटल प्रमाणपत्र | गडकिल्ले संवर्धन', 'Digital Certificate | Gadkille Sanvardhan')}
        </title>
        <meta
          name="description"
          content={t(
            'आपले अधिकृत स्वयंसेवक व संवर्धन डिजिटल प्रमाणपत्र शोधा आणि PDF डाउनलोड करा.',
            'Verify and download your official volunteer and fort conservation digital certificate.'
          )}
        />
      </Helmet>

      <div className="bg-[#1A1008] py-20 text-center print:hidden">
        <div className="max-w-2xl mx-auto px-6">
          <div className="inline-flex items-center gap-2 mb-4 font-cinzel text-xs uppercase tracking-widest text-[#D4A955]">
            <span className="w-6 h-px bg-[#B58A45]" />{' '}
            {t('📜 डिजिटल सन्मान', '📜 Digital Honor')}{' '}
            <span className="w-6 h-px bg-[#B58A45]" />
          </div>
          <h1 className="font-serif text-4xl sm:text-5xl font-black text-[#F3E8D0] mb-4">
            {t('डिजिटल प्रमाणपत्र मिळवा', 'Get Digital Certificate')}
          </h1>
          <p className="text-[#E8D5A3]/85">
            {t(
              'प्रशासनातर्फे जारी केलेले आपले अधिकृत प्रमाणपत्र क्रमांक किंवा नावाने शोधा आणि PDF म्हणून डाउनलोड करा.',
              'Search your official certificate by Certificate ID or Full Name and download as PDF.'
            )}
          </p>
        </div>
      </div>

      <div className="max-w-[960px] mx-auto px-6 py-12 space-y-10">
        {/* Certificate Lookup Box */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-[#E8D5A3] shadow-md print:hidden">
          <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
            <div>
              <h3 className="font-serif font-bold text-[#1A1008] text-xl flex items-center gap-2">
                <Search size={20} className="text-[#C1521F]" />{' '}
                {t('आपले प्रमाणपत्र शोधा व डाउनलोड करा', 'Search & Download Your Certificate')}
              </h3>
              <p className="text-xs text-[#6E5945] mt-1">
                {t(
                  'प्रशासनाने जारी केलेला प्रमाणपत्र क्रमांक (उदा. GSP-CERT-2026-XXXX) किंवा आपले पूर्ण नाव खाली टाका.',
                  'Enter your official Certificate ID (e.g. GSP-CERT-2026-XXXX) or Full Name below.'
                )}
              </p>
            </div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F6EFE0] border border-[#E2CFA9] text-[11px] font-bold text-[#6E5945]">
              <ShieldCheck size={13} className="text-[#C1521F]" />{' '}
              {t('अधिकृत प्रमाणित', 'Official Verified')}
            </span>
          </div>

          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
            <label htmlFor="cert-lookup-input" className="sr-only">
              {t('प्रमाणपत्र क्रमांक किंवा पूर्ण नाव', 'Certificate ID or Full Name')}
            </label>
            <input
              id="cert-lookup-input"
              type="text"
              required
              placeholder={t(
                'प्रमाणपत्र क्रमांक (GSP-CERT-...) किंवा आपले पूर्ण नाव टाका',
                'Enter Certificate Code (GSP-CERT-...) or Full Name'
              )}
              value={lookupQuery}
              onChange={e => setLookupQuery(e.target.value)}
              className="flex-1 border-2 border-[#E8D5A3] rounded-xl px-4 py-3 text-sm text-[#1A1008] focus:border-[#C1521F] focus:outline-none"
            />
            <button
              type="submit"
              disabled={loading}
              className="px-7 py-3 rounded-xl font-bold text-white bg-[#C1521F] text-sm shadow-md flex items-center justify-center gap-2 transition-transform hover:scale-[1.01] disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />{' '}
                  {t('शोधत आहे...', 'Searching...')}
                </>
              ) : (
                <>
                  <Search size={16} /> {t('प्रमाणपत्र मिळवा', 'Get Certificate')}
                </>
              )}
            </button>
          </form>

          {errorMsg && (
            <div className="mt-4 p-4 rounded-xl bg-[#ffebee] border border-[#ef9a9a] text-xs text-[#b71c1c] flex items-center gap-2.5">
              <AlertCircle size={18} className="shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {cert && (
            <div className="mt-5 pt-4 border-t border-[#F0E6D2] flex items-center justify-between flex-wrap gap-3">
              <div className="text-xs text-[#1b5e20] font-bold flex items-center gap-2">
                <CheckCircle2 size={16} /> {t('प्रमाणपत्र सापडले! क्रमांक:', 'Certificate Found! Code:')}{' '}
                <span className="font-mono">{cert.cert_code}</span>
              </div>
              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-white font-bold text-xs btn-shimmer shadow-md"
              >
                <Printer size={15} /> {t('PDF छापा / डाउनलोड करा', 'Print / Save PDF')}
              </button>
            </div>
          )}
        </div>

        {/* Render Official Certificate ONLY when found */}
        {cert ? (
          <div className="bg-[#FFFDF9] rounded-3xl p-8 sm:p-14 border-[6px] border-double border-[#B58A45] shadow-2xl relative overflow-hidden text-center">
            <div className="absolute top-3 left-3 w-12 h-12 border-t-2 border-l-2 border-[#B58A45] pointer-events-none" />
            <div className="absolute top-3 right-3 w-12 h-12 border-t-2 border-r-2 border-[#B58A45] pointer-events-none" />
            <div className="absolute bottom-3 left-3 w-12 h-12 border-b-2 border-l-2 border-[#B58A45] pointer-events-none" />
            <div className="absolute bottom-3 right-3 w-12 h-12 border-b-2 border-r-2 border-[#B58A45] pointer-events-none" />

            <img
              src="/images/logo-dark.png"
              alt="Gadkille Seal"
              className="w-24 h-24 mx-auto mb-4 object-contain"
            />

            <div className="font-cinzel text-xs tracking-[0.28em] text-[#8F7A66] uppercase">
              {settings.nameEnglish.toUpperCase()}, MAHARASHTRA
            </div>
            <div className="font-serif text-base font-bold text-[#6E5945] mt-1">
              {settings.nameMarathi}, {settings.state}
            </div>

            <h2 className="font-serif text-3xl sm:text-4xl font-black text-[#A84A20] mt-6 mb-3">
              {certTitles[cert.cert_type] || certTitles.volunteer}
            </h2>

            <p className="text-xs uppercase tracking-widest text-[#8F7A66] mb-3">
              {t('हे सन्मानपूर्वक प्रदान करण्यात येते', 'Proudly Presented To')}
            </p>

            <div className="font-serif text-3xl sm:text-5xl font-black text-[#1A1008] py-2 border-b-2 border-[#E8D5A3] max-w-lg mx-auto mb-6">
              {cert.recipient_name}
            </div>

            <p className="text-base sm:text-lg text-[#4A3B2C] max-w-2xl mx-auto leading-relaxed mb-8">
              {(certBodies[cert.cert_type] || certBodies.volunteer)(cert.event_name)}
            </p>

            <div className="flex items-center justify-center gap-3 flex-wrap mb-10">
              <span className="px-4 py-1.5 rounded-full bg-[rgba(168,74,32,0.1)] text-[#A84A20] text-xs font-bold">
                📅 {t('दिनांक:', 'Date:')} {cert.issued_date}
              </span>
              <span className="px-4 py-1.5 rounded-full bg-[rgba(54,88,60,0.12)] text-[#2e7d32] text-xs font-bold flex items-center gap-1">
                <CheckCircle2 size={14} /> {t('अधिकृत व सत्यापित', 'Official & Verified')}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 items-end gap-6 sm:gap-4 max-w-2xl mx-auto pt-6 border-t border-[#F0E6D2]">
              <div className="text-center">
                <div className="w-32 h-px bg-[#8F7A66] mx-auto mb-2" />
                <div className="font-serif font-bold text-sm text-[#1A1008]">
                  {settings.founder}
                </div>
                <div className="text-[11px] text-[#8F7A66]">
                  {t('संस्थापक अध्यक्ष', 'Founder President')}
                </div>
              </div>

              <div className="flex flex-col items-center">
                <img
                  src="/images/logo-dark.png"
                  alt="Official Seal"
                  className="w-16 h-16 object-contain opacity-85"
                />
                <span className="text-[10px] text-[#8F7A66] mt-1">
                  {t('अधिकृत मुद्रा', 'Official Seal')}
                </span>
              </div>

              <div className="text-center">
                <div className="w-32 h-px bg-[#8F7A66] mx-auto mb-2" />
                <div className="font-serif font-bold text-sm text-[#1A1008]">
                  {settings.president}
                </div>
                <div className="text-[11px] text-[#8F7A66]">
                  {t('राज्य अध्यक्ष', 'State President')}
                </div>
              </div>
            </div>

            <div className="mt-8 text-[11px] font-mono text-[#8F7A66]">
              {t('प्रमाणपत्र क्रमांक:', 'Certificate Code:')} <strong>{cert.cert_code}</strong>
            </div>
          </div>
        ) : (
          <div className="bg-white/80 rounded-3xl p-10 text-center border border-[#E8D5A3] max-w-xl mx-auto print:hidden">
            <div className="text-4xl mb-3">📜</div>
            <h4 className="font-serif text-lg font-bold text-[#1A1008] mb-1">
              {t(
                'आपला प्रमाणपत्र क्रमांक किंवा नाव वर टाका',
                'Enter your Certificate Code or Name above'
              )}
            </h4>
            <p className="text-xs text-[#6E5945]">
              {t(
                'प्रशासनाने जारी केलेले अधिकृत प्रमाणपत्र येथे त्वरित शोधून डाउनलोड करता येईल.',
                'Admin-issued official certificates can be searched and downloaded here.'
              )}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
