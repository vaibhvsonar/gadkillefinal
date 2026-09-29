import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
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
} from 'lucide-react';
import { useSiteData } from '@/context/SiteContext';
import { api, type DonationRecord } from '@/lib/api';
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
// 4. Donate Page (Dynamic Projects & Bank Info)
// ============================================================================
export function DonatePage() {
  const { settings, projects, t } = useSiteData();
  const [selectedAmount, setSelectedAmount] = useState<number>(1001);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [donorName, setDonorName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [projectName, setProjectName] = useState('सामान्य संवर्धन निधी');
  const [paymentMethod, setPaymentMethod] = useState('UPI');

  const [submitting, setSubmitting] = useState(false);
  const [receipt, setReceipt] = useState<{ receiptNumber: string; message: string } | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const amounts = [
    { value: 101, label: '₹101', impact: t('एक झाड लावा', 'Plant a tree on a fort'), emoji: '🌱' },
    {
      value: 501,
      label: '₹501',
      impact: t('एक दिवसाचा संवर्धन खर्च', 'One day of conservation work'),
      emoji: '🔧',
    },
    {
      value: 1001,
      label: '₹1,001',
      impact: t('किल्ल्यावर नामफलक', 'Information board on a fort'),
      emoji: '🏛️',
    },
    {
      value: 2001,
      label: '₹2,001',
      impact: t('स्वयंसेवक प्रशिक्षण शिबीर', 'Volunteer training camp'),
      emoji: '📚',
    },
    {
      value: 5001,
      label: '₹5,001',
      impact: t('एक बुरूज दत्तक घ्या', 'Adopt a fort bastion'),
      emoji: '🏰',
    },
    {
      value: 10001,
      label: '₹10,001',
      impact: t('किल्ल्याचा संरक्षक व्हा', 'Become a Guardian of a Fort'),
      emoji: '🛡️',
    },
  ];

  const finalAmount = customAmount ? Number(customAmount) : selectedAmount;

  const handleDonate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!finalAmount || finalAmount <= 0) {
      setErrorMsg(t('कृपया योग्य देणगी रक्कम निवडा.', 'Please select a valid donation amount.'));
      return;
    }

    setSubmitting(true);
    setErrorMsg(null);

    try {
      const res = await api.submitDonation({
        donorName: donorName.trim() || 'अनाम (Anonymous)',
        email: email.trim() || undefined,
        phone: phone.trim() || undefined,
        amount: finalAmount,
        projectName,
        paymentMethod,
      });
      setReceipt({
        receiptNumber: res.receiptNumber,
        message: res.message,
      });
    } catch (err: any) {
      setErrorMsg(err.message || t('देणगी नोंदवताना त्रुटी आली.', 'Error recording donation.'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-[#F9F2E3] min-h-screen pt-[68px]">
      <Helmet>
        <title>{t('देणगी द्या | गडकिल्ले संवर्धन', 'Donate | Gadkille Sanvardhan')}</title>
        <meta
          name="description"
          content={t(
            'महाराष्ट्रातील ऐतिहासिक गड-किल्ल्यांच्या संवर्धनासाठी देणगी द्या. 80G कर सवलत उपलब्ध.',
            'Support historic fort conservation across Maharashtra. 80G tax exemption available.'
          )}
        />
      </Helmet>

      <div className="bg-[#1A1008] py-20 text-center">
        <div className="max-w-2xl mx-auto px-6">
          <div className="inline-flex items-center gap-2 mb-4 font-cinzel text-xs uppercase tracking-widest text-[#D4A955]">
            <span className="w-6 h-px bg-[#B58A45]" /> {t('वारसा जपा', 'Preserve Heritage')}{' '}
            <span className="w-6 h-px bg-[#B58A45]" />
          </div>
          <h1 className="font-serif text-4xl sm:text-5xl font-black text-[#F3E8D0] mb-4">
            {t('आपल्या देणगीने', 'Your Donation Keeps')}{' '}
            <span className="text-[#D4A955]">{t('किल्ला उभा राहतो', 'The Forts Standing')}</span>
          </h1>
          <p className="text-[rgba(243,232,208,0.75)] max-w-lg mx-auto">
            {t(
              'प्रत्येक रुपया थेट किल्ल्याच्या संवर्धनात जातो. आपले योगदान इतिहासाचा भाग बनते.',
              'Every rupee goes directly toward fort conservation. Your contribution becomes part of history.'
            )}
          </p>
        </div>
      </div>

      <div className="max-w-[1100px] mx-auto px-6 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
          <div className="lg:col-span-2 space-y-6">
            <div>
              <h2 className="font-serif text-2xl font-bold text-[#1A1008] mb-4">
                {t('आपल्या विश्वासावर उभे आहोत', 'Built on Your Trust')}
              </h2>
              <div className="space-y-3">
                {[
                  { icon: ShieldCheck, text: t('80G कर सवलत उपलब्ध', '80G Tax Exemption Available') },
                  {
                    icon: Landmark,
                    text: t(`नोंदणीकृत संस्था (${settings.founded})`, 'Registered NGO (Est. 2011)'),
                  },
                  {
                    icon: Users,
                    text: t(
                      `${settings.statVolunteers}+ विश्वासू स्वयंसेवक व दाते`,
                      `${settings.statVolunteers}+ Trusted Volunteers & Donors`
                    ),
                  },
                  { icon: Leaf, text: t('100% पारदर्शक वापर', '100% Transparent Utilization') },
                ].map(({ icon: Icon, text }) => (
                  <div
                    key={text}
                    className="flex items-center gap-3 p-3 bg-white rounded-xl border border-[#E8D5A3]"
                  >
                    <Icon size={18} className="text-[#A84A20] shrink-0" />
                    <span className="text-sm text-[#6E5945]">{text}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white rounded-2xl p-5 border border-[#E8D5A3]">
              <h3 className="font-serif font-bold text-[#1A1008] mb-3 text-sm">
                {t('थेट बँक हस्तांतरण', 'Direct Bank Transfer')}
              </h3>
              <div className="space-y-1.5 text-xs text-[#6E5945]">
                <p>
                  <span className="text-[#8F7A66]">{t('बँक:', 'Bank:')}</span> {settings.bankName}
                </p>
                <p>
                  <span className="text-[#8F7A66]">{t('खाते क्र.:', 'Account No.:')}</span>{' '}
                  {settings.bankAccount}
                </p>
                <p>
                  <span className="text-[#8F7A66]">IFSC:</span> {settings.bankIfsc}
                </p>
                <p>
                  <span className="text-[#8F7A66]">UPI:</span> {settings.upiId}
                </p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-3">
            <div className="bg-white rounded-3xl p-8 shadow-lg border border-[#E8D5A3]">
              {receipt ? (
                <div className="text-center py-8 space-y-4">
                  <div className="w-16 h-16 rounded-full bg-[#e8f5e9] text-[#2e7d32] flex items-center justify-center mx-auto">
                    <CheckCircle2 size={38} />
                  </div>
                  <h3 className="font-serif text-2xl font-bold text-[#1b5e20]">{receipt.message}</h3>
                  <div className="inline-block px-4 py-2 rounded-xl bg-[#F9F2E3] border border-[#E8D5A3] text-xs font-mono text-[#A84A20] font-bold">
                    {t('80G पावती क्रमांक:', '80G Receipt No.:')} {receipt.receiptNumber}
                  </div>
                  <button
                    onClick={() => setReceipt(null)}
                    className="mt-4 px-6 py-2.5 rounded-xl border-2 border-[#E8D5A3] text-xs font-bold text-[#1A1008] hover:border-[#A84A20]"
                  >
                    {t('आणखी एक देणगी नोंदवा', 'Make Another Donation')}
                  </button>
                </div>
              ) : (
                <form onSubmit={handleDonate} className="space-y-5">
                  <div>
                    <h3 className="font-serif text-2xl font-bold text-[#1A1008] mb-1">
                      {t('देणगी रक्कम निवडा', 'Select Donation Amount')}
                    </h3>
                    <p className="text-sm text-[#8F7A66] mb-4">
                      {t('आपल्या देणगीचा प्रभाव:', 'Impact of your donation:')}
                    </p>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
                      {amounts.map(a => {
                        const isSelected = !customAmount && selectedAmount === a.value;
                        return (
                          <button
                            type="button"
                            key={a.value}
                            onClick={() => {
                              setSelectedAmount(a.value);
                              setCustomAmount('');
                            }}
                            className={`border-2 rounded-2xl p-4 transition-all text-center ${
                              isSelected
                                ? 'border-[#A84A20] bg-[rgba(168,74,32,0.08)] shadow-md'
                                : 'border-[#E8D5A3] hover:border-[#A84A20]'
                            }`}
                          >
                            <div className="text-2xl mb-1">{a.emoji}</div>
                            <div className="font-serif text-xl font-black text-[#1A1008]">
                              {a.label}
                            </div>
                            <div className="text-[10px] text-[#8F7A66] mt-1 leading-tight">
                              {a.impact}
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    <div>
                      <label
                        htmlFor="donate-custom-amount"
                        className="block text-xs font-medium text-[#6E5945] mb-1.5"
                      >
                        {t('किंवा इतर रक्कम टाका (₹)', 'Or Enter Custom Amount (₹)')}
                      </label>
                      <input
                        id="donate-custom-amount"
                        type="number"
                        min={1}
                        value={customAmount}
                        onChange={e => setCustomAmount(e.target.value)}
                        placeholder={t('₹ इतर रक्कम', '₹ Custom Amount')}
                        className="w-full border-2 border-[#E8D5A3] rounded-xl px-4 py-2.5 text-sm text-[#1A1008] focus:border-[#A84A20] focus:outline-none"
                      />
                    </div>
                  </div>

                  {errorMsg && (
                    <div className="p-3.5 rounded-xl bg-[#ffebee] text-[#b71c1c] text-xs flex items-center gap-2">
                      <AlertCircle size={16} /> <span>{errorMsg}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-[#F0E6D2]">
                    <div>
                      <label
                        htmlFor="donate-name"
                        className="block text-xs font-medium text-[#6E5945] mb-1"
                      >
                        {t('दात्याचे नाव (ऐच्छिक)', 'Donor Name (Optional)')}
                      </label>
                      <input
                        id="donate-name"
                        type="text"
                        value={donorName}
                        onChange={e => setDonorName(e.target.value)}
                        placeholder={t('आपले नाव (किंवा अनाम)', 'Your Name (or Anonymous)')}
                        className="w-full border-2 border-[#E8D5A3] rounded-xl px-3.5 py-2 text-sm text-[#1A1008] focus:border-[#A84A20] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="donate-email"
                        className="block text-xs font-medium text-[#6E5945] mb-1"
                      >
                        {t('ईमेल (पावतीसाठी)', 'Email (For Receipt)')}
                      </label>
                      <input
                        id="donate-email"
                        type="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        placeholder="your@email.com"
                        className="w-full border-2 border-[#E8D5A3] rounded-xl px-3.5 py-2 text-sm text-[#1A1008] focus:border-[#A84A20] focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="donate-project"
                        className="block text-xs font-medium text-[#6E5945] mb-1"
                      >
                        {t('प्रकल्प निवडा', 'Select Project')}
                      </label>
                      <select
                        id="donate-project"
                        value={projectName}
                        onChange={e => setProjectName(e.target.value)}
                        className="w-full border-2 border-[#E8D5A3] rounded-xl px-3.5 py-2 text-sm text-[#1A1008] bg-white focus:border-[#A84A20] focus:outline-none"
                      >
                        <option value="सामान्य संवर्धन निधी">
                          {t('सामान्य संवर्धन निधी', 'General Conservation Fund')}
                        </option>
                        {projects.map(p => (
                          <option key={p.id} value={p.title}>
                            {p.title} ({p.fort})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label
                        htmlFor="donate-method"
                        className="block text-xs font-medium text-[#6E5945] mb-1"
                      >
                        {t('पेमेंट माध्यम', 'Payment Method')}
                      </label>
                      <select
                        id="donate-method"
                        value={paymentMethod}
                        onChange={e => setPaymentMethod(e.target.value)}
                        className="w-full border-2 border-[#E8D5A3] rounded-xl px-3.5 py-2 text-sm text-[#1A1008] bg-white focus:border-[#A84A20] focus:outline-none"
                      >
                        <option value="UPI">UPI (GPay / PhonePe / Paytm)</option>
                        <option value="Card">Debit / Credit Card</option>
                        <option value="NetBanking">Net Banking / NEFT</option>
                      </select>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full text-center py-4 rounded-xl font-bold text-white btn-shimmer text-base shadow-lg flex items-center justify-center gap-2 disabled:opacity-60"
                  >
                    {submitting ? (
                      <>
                        <Loader2 size={18} className="animate-spin" />{' '}
                        {t('प्रक्रिया होत आहे...', 'Processing...')}
                      </>
                    ) : (
                      t(
                        `❤️ ₹${finalAmount.toLocaleString('en-IN')} देणगी द्या`,
                        `❤️ Donate ₹${finalAmount.toLocaleString('en-IN')}`
                      )
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
