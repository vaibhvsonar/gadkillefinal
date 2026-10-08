import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useParams, Link } from 'react-router-dom';
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  MessageCircle,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ShieldCheck,
  Landmark,
  Users,
  Leaf,
  Calendar,
  Search,
  Award,
  BookOpen,
  GraduationCap,
  Building2,
  UserCheck,
  FileText,
  ExternalLink,
  Filter,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  LogOut,
  User,
} from 'lucide-react';
import { useSiteData } from '@/context/SiteContext';
import {
  api,
  type DonationRecord,
  type DinvisheshRecord,
  type OrganizationRecord,
  type PartnerOrgRecord,
  type StudentRecord,
  type StudentParticipationRecord,
} from '@/lib/api';
import { SectionHeader, EmptyDatabaseState } from '@/components/ui';

// ============================================================================
// 1. News Page (Dynamic)
// ============================================================================
export function NewsPage() {
  const { news, loading, t } = useSiteData();

  return (
    <div className="bg-[#F9F2E3] min-h-screen pt-[68px]">
      <Helmet>
        <title>
          {t('संवर्धनाच्या बातम्या | गडकिल्ले संवर्धन', 'Conservation News | Gadkille Sanvardhan')}
        </title>
        <meta
          name="description"
          content={t(
            'किल्ले संवर्धन, मोहिमा आणि शैक्षणिक उपक्रमांच्या ताज्या बातम्या व लेख.',
            'Latest news and articles on fort conservation, cleanliness drives, and educational initiatives.'
          )}
        />
      </Helmet>

      <div className="bg-[#1A1008] py-20 text-center">
        <div className="max-w-2xl mx-auto px-6">
          <div className="inline-flex items-center gap-2 mb-4 font-cinzel text-xs uppercase tracking-widest text-[#D4A955]">
            <span className="w-6 h-px bg-[#B58A45]" /> {t('बातम्या व लेख', 'News & Articles')}{' '}
            <span className="w-6 h-px bg-[#B58A45]" />
          </div>
          <h1 className="font-serif text-4xl sm:text-5xl font-black text-[#F3E8D0] mb-4">
            {t('संवर्धनाच्या बातम्या', 'Conservation News')}
          </h1>
          <p className="text-[rgba(243,232,208,0.75)]">
            {t(
              'किल्ले संवर्धन, मोहिमा आणि शैक्षणिक उपक्रमांच्या ताज्या बातम्या.',
              'Latest news on fort conservation, campaigns, and educational initiatives.'
            )}
          </p>
        </div>
      </div>
      <div className="max-w-[1200px] mx-auto px-6 py-12">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[1, 2, 3].map(i => (
              <div
                key={i}
                className={`bg-white/60 rounded-2xl h-72 animate-pulse border border-[#E8D5A3] ${
                  i === 1 ? 'md:col-span-2' : ''
                }`}
              />
            ))}
          </div>
        ) : news.length === 0 ? (
          <EmptyDatabaseState
            title={t(
              'कोणतीही बातमी किंवा लेख अद्याप प्रकाशित केलेला नाही',
              'No news or articles published yet'
            )}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {news.map((article, i) => (
              <div
                key={article.id}
                className={`bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all border border-[#E8D5A3] ${
                  i === 0 ? 'md:col-span-2' : ''
                }`}
              >
                <div className={`relative overflow-hidden ${i === 0 ? 'h-72' : 'h-48'}`}>
                  <img
                    src={article.image}
                    alt={article.title}
                    loading="lazy"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  <span className="absolute top-3 left-3 px-3 py-1 bg-[#A84A20] text-white text-xs font-cinzel rounded-full">
                    {article.category}
                  </span>
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-3 text-xs text-[#8F7A66] mb-3">
                    <span>{article.date}</span>
                    <span>·</span>
                    <span>{article.author}</span>
                  </div>
                  <h3 className="font-serif text-xl font-bold text-[#1A1008] mb-3">
                    {article.title}
                  </h3>
                  <p className="text-sm text-[#6E5945] leading-relaxed">{article.body}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// 2. Transparency Page (Dynamic Live Donations & Breakdown)
// ============================================================================
export function TransparencyPage() {
  const { projects, t } = useSiteData();
  const [donations, setDonations] = useState<DonationRecord[]>([]);

  useEffect(() => {
    api.getDonations().then(setDonations).catch(() => {});
  }, []);

  const totalDonated = donations.reduce((acc, d) => acc + Number(d.amount || 0), 0);

  const breakdown = [
    { label: t('किल्ला संवर्धन', 'Fort Conservation'), pct: 65, color: '#A84A20' },
    { label: t('शैक्षणिक उपक्रम', 'Educational Initiatives'), pct: 15, color: '#B58A45' },
    { label: t('वृक्षारोपण', 'Tree Plantation'), pct: 12, color: '#36583C' },
    { label: t('प्रशासकीय खर्च', 'Administrative Expenses'), pct: 8, color: '#6E5945' },
  ];

  return (
    <div className="bg-[#F9F2E3] min-h-screen pt-[68px]">
      <Helmet>
        <title>
          {t('आर्थिक पारदर्शकता | गडकिल्ले संवर्धन', 'Financial Transparency | Gadkille Sanvardhan')}
        </title>
        <meta
          name="description"
          content={t(
            'आपल्या दात्यांप्रती आमची जबाबदारी — संकलित देणगी आणि खर्चाचा संपूर्ण पारदर्शक हिशोब.',
            'Complete financial accountability to our donors — live donation ledger and expense breakdown.'
          )}
        />
      </Helmet>

      <div className="bg-[#1A1008] py-20 text-center">
        <div className="max-w-2xl mx-auto px-6">
          <div className="inline-flex items-center gap-2 mb-4 font-cinzel text-xs uppercase tracking-widest text-[#D4A955]">
            <span className="w-6 h-px bg-[#B58A45]" /> {t('पारदर्शकता', 'Transparency')}{' '}
            <span className="w-6 h-px bg-[#B58A45]" />
          </div>
          <h1 className="font-serif text-4xl sm:text-5xl font-black text-[#F3E8D0] mb-4">
            {t('आर्थिक पारदर्शकता', 'Financial Transparency')}
          </h1>
          <p className="text-[rgba(243,232,208,0.75)]">
            {t(
              'आपल्या दात्यांप्रती आमची जबाबदारी — प्रत्येक रुपयाचा थेट हिशोब.',
              'Our accountability to our donors — complete transparency for every rupee.'
            )}
          </p>
        </div>
      </div>

      <div className="max-w-[1100px] mx-auto px-6 py-16 space-y-16">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl p-6 border border-[#E8D5A3] text-center shadow-sm">
            <div className="text-xs text-[#8F7A66] mb-1">
              {t('एकूण ऑनलाइन संकलित देणगी', 'Total Online Donations Collected')}
            </div>
            <div className="font-serif text-3xl font-black text-[#A84A20]">
              ₹{totalDonated.toLocaleString('en-IN')}
            </div>
          </div>
          <div className="bg-white rounded-2xl p-6 border border-[#E8D5A3] text-center shadow-sm">
            <div className="text-xs text-[#8F7A66] mb-1">
              {t('एकूण देणगी व्यवहार', 'Total Donation Transactions')}
            </div>
            <div className="font-serif text-3xl font-black text-[#1A1008]">
              {donations.length}
            </div>
          </div>
          <div className="bg-white rounded-2xl p-6 border border-[#E8D5A3] text-center shadow-sm">
            <div className="text-xs text-[#8F7A66] mb-1">
              {t('सक्रिय संवर्धन प्रकल्प', 'Active Conservation Projects')}
            </div>
            <div className="font-serif text-3xl font-black text-[#36583C]">
              {projects.length}
            </div>
          </div>
        </div>

        <div>
          <SectionHeader
            eyebrow={t('खर्चाचे विभाजन', 'Expense Breakdown')}
            title={t('देणगी कुठे जाते?', 'Where Does Your Donation Go?')}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {breakdown.map(b => (
              <div
                key={b.label}
                className="bg-white rounded-2xl p-5 border border-[#E8D5A3] shadow-sm"
              >
                <div className="flex justify-between items-center mb-3">
                  <span className="font-medium text-[#1A1008] text-sm">{b.label}</span>
                  <span className="font-bold text-lg" style={{ color: b.color }}>
                    {b.pct}%
                  </span>
                </div>
                <div className="w-full bg-[#F3E8D0] rounded-full h-2.5 overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${b.pct}%`, background: b.color }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {donations.length > 0 && (
          <div>
            <SectionHeader
              eyebrow={t('थेट यादी', 'Live Ledger')}
              title={t('अलीकडील सत्यापित देणग्या', 'Recent Verified Donations')}
            />
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-[#E8D5A3]">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-[#1A1008] text-[#D4A955] font-cinzel text-xs uppercase tracking-widest">
                    <tr>
                      <th className="px-6 py-4 text-left">{t('देणगीदार', 'Donor')}</th>
                      <th className="px-6 py-4 text-left">{t('प्रकल्प', 'Project')}</th>
                      <th className="px-6 py-4 text-left">{t('माध्यम', 'Mode')}</th>
                      <th className="px-6 py-4 text-right">{t('रक्कम', 'Amount')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {donations.slice(0, 15).map((d, i) => (
                      <tr
                        key={d.id}
                        className={`border-t border-[#F3E8D0] ${
                          i % 2 === 0 ? 'bg-white' : 'bg-[#F9F2E3]'
                        }`}
                      >
                        <td className="px-6 py-3.5 font-medium text-[#1A1008]">{d.donor_name}</td>
                        <td className="px-6 py-3.5 text-[#6E5945]">{d.project_name}</td>
                        <td className="px-6 py-3.5 text-xs text-[#8F7A66]">{d.payment_method}</td>
                        <td className="px-6 py-3.5 text-right text-[#A84A20] font-bold">
                          ₹{Number(d.amount).toLocaleString('en-IN')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// 3. Contact Page (Dynamic)
// ============================================================================
export function ContactPage() {
  const { settings, t } = useSiteData();
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('संवर्धन प्रकल्प');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const cleanPhone = (settings.phone1 || '9049687970').replace(/\s+/g, '');
  const waUrl = `https://wa.me/91${cleanPhone}?text=${encodeURIComponent(
    'नमस्कार! मला गडकिल्ले संवर्धन प्रतिष्ठानशी संपर्क करायचा आहे.'
  )}`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSuccessMsg(null);
    setErrorMsg(null);

    try {
      const res = await api.sendContactMessage({
        fullName: fullName.trim(),
        phone: phone.trim(),
        email: email.trim(),
        subject,
        message: message.trim(),
      });
      setSuccessMsg(res.message);
      setFullName('');
      setPhone('');
      setEmail('');
      setMessage('');
    } catch (err: any) {
      setErrorMsg(err.message || t('संदेश पाठवताना त्रुटी आली.', 'Error sending message.'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-[#F9F2E3] min-h-screen pt-[68px]">
      <Helmet>
        <title>{t('संपर्क साधा | गडकिल्ले संवर्धन', 'Contact Us | Gadkille Sanvardhan')}</title>
        <meta
          name="description"
          content={t(
            'प्रश्न, सूचना किंवा गडकिल्ले संवर्धन सहकार्यासाठी आमच्याशी संपर्क साधा.',
            'Reach out to Gadkille Sanvardhan Pratishthan for inquiries, suggestions, or collaborations.'
          )}
        />
      </Helmet>

      <div className="bg-[#1A1008] py-20 text-center">
        <div className="max-w-2xl mx-auto px-6">
          <div className="inline-flex items-center gap-2 mb-4 font-cinzel text-xs uppercase tracking-widest text-[#D4A955]">
            <span className="w-6 h-px bg-[#B58A45]" /> {t('संपर्क', 'Contact')}{' '}
            <span className="w-6 h-px bg-[#B58A45]" />
          </div>
          <h1 className="font-serif text-4xl sm:text-5xl font-black text-[#F3E8D0] mb-4">
            {t('आमच्याशी संपर्क करा', 'Contact Us')}
          </h1>
          <p className="text-[rgba(243,232,208,0.75)]">
            {t(
              'प्रश्न, सूचना किंवा सहकार्यासाठी आम्हाला संपर्क करा.',
              'Reach out to us for any questions, suggestions, or collaborations.'
            )}
          </p>
        </div>
      </div>

      <div className="max-w-[1100px] mx-auto px-6 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="space-y-6">
            <div>
              <h2 className="font-serif text-2xl font-bold text-[#1A1008] mb-6">
                {t('संपर्क माहिती', 'Contact Information')}
              </h2>
              <div className="space-y-4">
                {[
                  { icon: MapPin, label: t('पत्ता', 'Address'), value: settings.address },
                  {
                    icon: Phone,
                    label: t('दूरध्वनी', 'Phone'),
                    value: settings.phone2
                      ? `${settings.phone1} / ${settings.phone2}`
                      : settings.phone1,
                  },
                  { icon: Mail, label: t('ईमेल', 'Email'), value: settings.email },
                  {
                    icon: Clock,
                    label: t('कार्यालय वेळ', 'Office Hours'),
                    value: t(
                      'सोमवार – शनिवार: सकाळी १० ते संध्याकाळी ६',
                      'Monday – Saturday: 10:00 AM to 6:00 PM'
                    ),
                  },
                ].map(({ icon: Icon, label, value }) => (
                  <div
                    key={label}
                    className="flex items-start gap-4 p-4 bg-white rounded-xl border border-[#E8D5A3]"
                  >
                    <div className="w-10 h-10 bg-[rgba(168,74,32,0.08)] rounded-full flex items-center justify-center shrink-0">
                      <Icon size={18} className="text-[#A84A20]" />
                    </div>
                    <div>
                      <p className="text-xs text-[#8F7A66] mb-0.5">{label}</p>
                      <p className="text-sm text-[#1A1008] font-medium">{value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-3 w-full py-3.5 rounded-xl font-semibold text-white bg-[#25D366] text-sm"
            >
              <MessageCircle size={18} />{' '}
              {t('WhatsApp वर थेट चॅट करा', 'Chat Directly on WhatsApp')}
            </a>
          </div>

          <div className="bg-white rounded-3xl p-8 shadow-lg border border-[#E8D5A3]">
            <h3 className="font-serif text-xl font-bold text-[#1A1008] mb-6">
              {t('संदेश पाठवा', 'Send a Message')}
            </h3>

            {successMsg && (
              <div className="mb-5 p-4 rounded-xl bg-[#e8f5e9] border border-[#a5d6a7] text-[#1b5e20] text-xs flex items-center gap-2.5">
                <CheckCircle2 size={18} className="shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            {errorMsg && (
              <div className="mb-5 p-4 rounded-xl bg-[#ffebee] border border-[#ef9a9a] text-[#b71c1c] text-xs flex items-center gap-2.5">
                <AlertCircle size={18} className="shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="contact-name"
                    className="block text-xs font-medium text-[#6E5945] mb-1.5"
                  >
                    {t('नाव *', 'Name *')}
                  </label>
                  <input
                    id="contact-name"
                    type="text"
                    required
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    placeholder={t('आपले नाव', 'Your Name')}
                    className="w-full border-2 border-[#E8D5A3] rounded-xl px-4 py-2.5 text-sm text-[#1A1008] focus:border-[#A84A20] focus:outline-none"
                  />
                </div>
                <div>
                  <label
                    htmlFor="contact-phone"
                    className="block text-xs font-medium text-[#6E5945] mb-1.5"
                  >
                    {t('मोबाईल नंबर', 'Mobile Number')}
                  </label>
                  <input
                    id="contact-phone"
                    type="tel"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder={t('नंबर', 'Phone Number')}
                    className="w-full border-2 border-[#E8D5A3] rounded-xl px-4 py-2.5 text-sm text-[#1A1008] focus:border-[#A84A20] focus:outline-none"
                  />
                </div>
              </div>
              <div>
                <label
                  htmlFor="contact-email"
                  className="block text-xs font-medium text-[#6E5945] mb-1.5"
                >
                  {t('ईमेल *', 'Email *')}
                </label>
                <input
                  id="contact-email"
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full border-2 border-[#E8D5A3] rounded-xl px-4 py-2.5 text-sm text-[#1A1008] focus:border-[#A84A20] focus:outline-none"
                />
              </div>
              <div>
                <label
                  htmlFor="contact-subject"
                  className="block text-xs font-medium text-[#6E5945] mb-1.5"
                >
                  {t('विषय', 'Subject')}
                </label>
                <select
                  id="contact-subject"
                  value={subject}
                  onChange={e => setSubject(e.target.value)}
                  className="w-full border-2 border-[#E8D5A3] rounded-xl px-4 py-2.5 text-sm focus:border-[#A84A20] focus:outline-none bg-white text-[#1A1008]"
                >
                  <option value="संवर्धन प्रकल्प">{t('संवर्धन प्रकल्प', 'Conservation Project')}</option>
                  <option value="स्वयंसेवक नोंदणी">{t('स्वयंसेवक नोंदणी', 'Volunteer Registration')}</option>
                  <option value="देणगी">{t('देणगी', 'Donation')}</option>
                  <option value="शैक्षणिक भेट">{t('शैक्षणिक भेट', 'Educational Visit')}</option>
                  <option value="मीडिया / प्रेस">{t('मीडिया / प्रेस', 'Media / Press')}</option>
                  <option value="इतर">{t('इतर', 'Other')}</option>
                </select>
              </div>
              <div>
                <label
                  htmlFor="contact-message"
                  className="block text-xs font-medium text-[#6E5945] mb-1.5"
                >
                  {t('संदेश *', 'Message *')}
                </label>
                <textarea
                  id="contact-message"
                  rows={4}
                  required
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  placeholder={t('आपला संदेश...', 'Your message...')}
                  className="w-full border-2 border-[#E8D5A3] rounded-xl px-4 py-2.5 text-sm text-[#1A1008] focus:border-[#A84A20] focus:outline-none resize-none"
                />
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3.5 rounded-xl font-bold text-white btn-shimmer text-sm shadow-lg flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {submitting ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />{' '}
                    {t('पाठवत आहे...', 'Sending...')}
                  </>
                ) : (
                  t('📩 संदेश पाठवा', '📩 Send Message')
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// 4. Donate Page (Dynamic PhonePe Flow & 80G Receipt)
// ============================================================================
export { DonatePage } from './DonatePage';


// ============================================================================
// 11. Dinvishesh - Date-wise Historical Events Page (Featured Slider & Hover UI)
// ============================================================================
export { DinvisheshPage } from './DinvisheshPage';

// ============================================================================
// 6. Organizations & Institutions Page
// ============================================================================
export function OrganizationsPage() {
  const { t } = useSiteData();
  const [orgs, setOrgs] = useState<OrganizationRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    api.getOrganizations()
      .then(res => setOrgs(res))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="bg-[#F9F2E3] min-h-screen pt-[68px]">
      <Helmet>
        <title>{t('संलग्न संस्था व संघटना | गडकिल्ले संवर्धन', 'Associated Organizations | Gadkille')}</title>
      </Helmet>

      <div className="bg-[#1A1008] py-16 text-center">
        <div className="max-w-4xl mx-auto px-6">
          <div className="inline-flex items-center gap-2 mb-3 font-cinzel text-xs uppercase tracking-widest text-[#D4A955]">
            <Building2 size={14} /> {t('संस्था परिचय', 'Institutions & Organizations')}
          </div>
          <h1 className="font-serif text-4xl sm:text-5xl font-black text-[#F3E8D0] mb-3">
            {t('संलग्न संस्था व उपक्रम संघटना', 'Associated Organizations')}
          </h1>
          <p className="text-[rgba(243,232,208,0.8)] text-sm sm:text-base max-w-2xl mx-auto">
            {t(
              'प्रतिष्ठानशी संलग्न असणाऱ्या प्रमुख संस्था, मंडळे आणि संवर्धन गटांची सविस्तर माहिती.',
              'Profiles and initiatives of all institutions and working bodies connected with the foundation.'
            )}
          </p>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-6 py-12">
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin text-[#A84A20]" size={36} />
          </div>
        ) : orgs.length === 0 ? (
          <EmptyDatabaseState title={t('कोणतीही संस्था जोडलेली नाही', 'No organizations found')} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {orgs.map(org => (
              <div
                key={org.id}
                className="bg-white rounded-2xl overflow-hidden border border-[#E8D5A3] shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  {org.image && (
                    <div className="h-48 overflow-hidden bg-stone-100 relative">
                      <img src={org.image} alt={org.name} className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className="p-6">
                    <h3 className="font-serif text-2xl font-bold text-[#1A1008] mb-2">{org.name}</h3>
                    <p className="text-xs text-[#8F7A66] mb-4 line-clamp-3">{org.introduction}</p>

                    {org.activities && (
                      <div className="mb-3">
                        <span className="text-xs font-bold text-[#A84A20] block mb-1">
                          कार्य व उपक्रम:
                        </span>
                        <p className="text-xs text-[#4A3B2C] line-clamp-2">{org.activities}</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-6 pt-0">
                  <Link
                    to={`/organizations/${org.id}`}
                    className="w-full block text-center py-2.5 rounded-xl bg-[#F9F2E3] text-[#A84A20] font-bold text-xs hover:bg-[#A84A20] hover:text-white transition-all border border-[#E8D5A3]"
                  >
                    {t('संपूर्ण माहिती व उपक्रम पहा →', 'View Full Profile →')}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// 7. Organization Detail Page
// ============================================================================
export function OrganizationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { t } = useSiteData();
  const [org, setOrg] = useState<OrganizationRecord | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!id) return;
    api.getOrganizations()
      .then(res => {
        const found = res.find(o => o.id === id);
        setOrg(found || null);
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen pt-[68px] flex items-center justify-center bg-[#F9F2E3]">
        <Loader2 size={36} className="animate-spin text-[#A84A20]" />
      </div>
    );
  }

  if (!org) {
    return (
      <div className="min-h-screen pt-[68px] flex flex-col items-center justify-center bg-[#F9F2E3] p-6 text-center">
        <h2 className="font-serif text-2xl font-bold text-[#1A1008] mb-2">संस्था सापडली नाही</h2>
        <Link to="/organizations" className="text-sm font-bold text-[#A84A20]">
          ← संस्था यादीकडे परत जा
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-[#F9F2E3] min-h-screen pt-[68px]">
      <Helmet>
        <title>{org.name} | गडकिल्ले संवर्धन</title>
      </Helmet>

      <div className="bg-[#1A1008] py-16 text-center">
        <div className="max-w-4xl mx-auto px-6">
          <h1 className="font-serif text-4xl sm:text-5xl font-black text-[#F3E8D0] mb-3">{org.name}</h1>
          <p className="text-[rgba(243,232,208,0.8)] text-sm max-w-xl mx-auto">{org.introduction}</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-12 space-y-8">
        {org.image && (
          <div className="rounded-2xl overflow-hidden border border-[#E8D5A3] shadow-md max-h-96">
            <img src={org.image} alt={org.name} className="w-full h-full object-cover" />
          </div>
        )}

        <div className="bg-white rounded-2xl p-8 border border-[#E8D5A3] shadow-sm space-y-6">
          <div>
            <h2 className="font-serif text-xl font-bold text-[#1A1008] mb-2">संस्थेचा परिचय</h2>
            <p className="text-sm text-[#4A3B2C] leading-relaxed whitespace-pre-line">{org.introduction}</p>
          </div>

          {org.activities && (
            <div className="pt-4 border-t border-[#F0E6D2]">
              <h2 className="font-serif text-xl font-bold text-[#1A1008] mb-2">कार्ये व उपक्रम</h2>
              <p className="text-sm text-[#4A3B2C] leading-relaxed whitespace-pre-line">{org.activities}</p>
            </div>
          )}

          {org.initiatives && (
            <div className="pt-4 border-t border-[#F0E6D2]">
              <h2 className="font-serif text-xl font-bold text-[#1A1008] mb-2">चालू व भूतकाळातील मोहिमा</h2>
              <p className="text-sm text-[#4A3B2C] leading-relaxed whitespace-pre-line">{org.initiatives}</p>
            </div>
          )}

          {org.achievements && (
            <div className="pt-4 border-t border-[#F0E6D2]">
              <h2 className="font-serif text-xl font-bold text-[#1A1008] mb-2">महत्त्वाच्या घडामोडी व यश</h2>
              <p className="text-sm text-[#4A3B2C] leading-relaxed whitespace-pre-line">{org.achievements}</p>
            </div>
          )}

          {org.contactInfo && (
            <div className="p-4 rounded-xl bg-[#F9F2E3] border border-[#E8D5A3] text-xs text-[#6E5945]">
              <span className="font-bold text-[#1A1008] block mb-1">संपर्क माहिती:</span>
              {org.contactInfo}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// 8. Partners & School Collaborations Page
// ============================================================================
export function PartnersPage() {
  const { t } = useSiteData();
  const [partners, setPartners] = useState<PartnerOrgRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    api.getPartners()
      .then(res => setPartners(res))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="bg-[#F9F2E3] min-h-screen pt-[68px]">
      <Helmet>
        <title>{t('भागीदार व शाळा/महाविद्यालये | गडकिल्ले संवर्धन', 'Partners & Schools | Gadkille')}</title>
      </Helmet>

      <div className="bg-[#1A1008] py-16 text-center">
        <div className="max-w-4xl mx-auto px-6">
          <div className="inline-flex items-center gap-2 mb-3 font-cinzel text-xs uppercase tracking-widest text-[#D4A955]">
            <Users size={14} /> {t('सहभागी संस्था', 'Partner Institutions')}
          </div>
          <h1 className="font-serif text-4xl sm:text-5xl font-black text-[#F3E8D0] mb-3">
            {t('सहकारी संस्था, शाळा व महाविद्यालये', 'Partner Schools & Organizations')}
          </h1>
          <p className="text-[rgba(243,232,208,0.8)] text-sm max-w-xl mx-auto">
            {t('गडकिल्ले संवर्धन मोहिमेत खांद्याला खांदा लावून काम करणाऱ्या संस्था.', 'Schools, colleges and partner groups collaborating with us.')}
          </p>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-6 py-12">
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin text-[#A84A20]" size={36} />
          </div>
        ) : partners.length === 0 ? (
          <EmptyDatabaseState title={t('कोणतीही भागीदार संस्था जोडलेली नाही', 'No partners found')} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {partners.map(p => (
              <div key={p.id} className="bg-white rounded-2xl p-6 border border-[#E8D5A3] shadow-sm flex flex-col justify-between">
                <div>
                  {p.logo && (
                    <img src={p.logo} alt={p.name} className="h-16 w-auto object-contain mb-4" />
                  )}
                  <span className="px-2.5 py-0.5 bg-[#F9F2E3] text-[#A84A20] text-xs font-bold rounded mb-2 inline-block">
                    {p.partnerType === 'school' ? 'शाळा / शाळा मंडळ' : 'सहकारी संघटना'}
                  </span>
                  <h3 className="font-serif font-bold text-xl text-[#1A1008] mb-2">{p.name}</h3>
                  <p className="text-xs text-[#6E5945] mb-3">{p.description}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}


