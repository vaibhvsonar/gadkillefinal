import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import {
  Heart,
  ShieldCheck,
  Landmark,
  Users,
  Leaf,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowRight,
  ArrowLeft,
  Copy,
  Check,
  Download,
  Printer,
  Smartphone,
  QrCode,
  Sparkles,
  HelpCircle,
  FileCheck2,
  Search,
  Award,
  Lock,
} from 'lucide-react';
import { useSiteData } from '@/context/SiteContext';
import { api } from '@/lib/api';

export function DonatePage() {
  const { settings, projects, publicDonors, t } = useSiteData();
  const [donorSearch, setDonorSearch] = useState('');

  // Multi-step State: 1 = Donor Details, 2 = PhonePe QR & Payment, 3 = Receipt
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Step 1: Donor Information
  const [donorName, setDonorName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [panNumber, setPanNumber] = useState('');
  const [selectedAmount, setSelectedAmount] = useState<number>(1001);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [projectName, setProjectName] = useState('सामान्य संवर्धन निधी (General Fort Fund)');

  // Step 2: Payment & Verification
  const [transactionRef, setTransactionRef] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [copiedUpi, setCopiedUpi] = useState(false);

  // Step 3: Receipt Data
  const [receipt, setReceipt] = useState<{
    receiptNumber: string;
    message: string;
    amount: number;
    donorName: string;
    email: string;
    phone: string;
    projectName: string;
    date: string;
  } | null>(null);

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
      impact: t('किल्ल्यावर नामफलक व माहिती', 'Info board on a fort'),
      emoji: '🏛️',
      popular: true,
    },
    {
      value: 2001,
      label: '₹2,001',
      impact: t('स्वयंसेवक सुरक्षा व साहित्य किट', 'Volunteer safety & gear kit'),
      emoji: '🛡️',
    },
    {
      value: 5001,
      label: '₹5,001',
      impact: t('एक बुरूज / वास्तू दुरुस्ती', 'Adopt a fort bastion repair'),
      emoji: '🏰',
    },
    {
      value: 10001,
      label: '₹10,001',
      impact: t('दुर्ग संवर्धन संरक्षक सदस्य', 'Guardian of Forts sponsor'),
      emoji: '👑',
    },
  ];

  const finalAmount = customAmount ? Number(customAmount) : selectedAmount;
  const upiId = settings.upiId || 'gadkille@sbi';
  const payeeName = settings.nameMarathi || 'Gadkille Sanvardhan Pratishthan';

  // Construct standard UPI Payment URI
  const upiUri = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(
    settings.nameEnglish || 'Gadkille Sanvardhan Pratishthan'
  )}&am=${finalAmount}&cu=INR&tn=${encodeURIComponent(`Donation - ${donorName || 'Donor'}`)}`;

  // Generate QR Code URL
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&margin=10&data=${encodeURIComponent(
    upiUri
  )}`;

  // Validate Step 1 Form
  const handleProceedToQR = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!donorName.trim()) {
      setErrorMsg(t('कृपया आपले पूर्ण नाव प्रविष्ट करा.', 'Please enter your full name.'));
      return;
    }

    const cleanPhone = phone.trim().replace(/\D/g, '');
    if (!cleanPhone || cleanPhone.length < 10) {
      setErrorMsg(
        t('कृपया वैध १० अंकी मोबाईल क्रमांक टाका.', 'Please enter a valid 10-digit phone number.')
      );
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim() || !emailRegex.test(email.trim())) {
      setErrorMsg(t('कृपया वैध ईमेल आयडी प्रविष्ट करा.', 'Please enter a valid email address.'));
      return;
    }

    if (!finalAmount || finalAmount <= 0) {
      setErrorMsg(t('कृपया योग्य देणगी रक्कम निवडा.', 'Please select a valid donation amount.'));
      return;
    }

    setStep(2);
    window.scrollTo({ top: 150, behavior: 'smooth' });
  };

  // Handle final submission after PhonePe payment
  const handleConfirmDonation = async () => {
    setSubmitting(true);
    setErrorMsg(null);

    try {
      const res = await api.submitDonation({
        donorName: donorName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        amount: finalAmount,
        projectName,
        paymentMethod: 'PhonePe UPI',
        transactionRef: transactionRef.trim() || undefined,
        panNumber: panNumber.trim() || undefined,
      });

      setReceipt({
        receiptNumber: res.receiptNumber,
        message: res.message,
        amount: finalAmount,
        donorName: donorName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        projectName,
        date: new Date().toLocaleDateString('mr-IN', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        }),
      });

      setStep(3);
      window.scrollTo({ top: 100, behavior: 'smooth' });
    } catch (err: any) {
      setErrorMsg(
        err.message || t('देणगी नोंदवताना त्रुटी आली. कृपया पुन्हा प्रयत्न करा.', 'Error recording donation. Please try again.')
      );
    } finally {
      setSubmitting(false);
    }
  };

  const copyUpiId = () => {
    navigator.clipboard.writeText(upiId);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2500);
  };

  const handleReset = () => {
    setStep(1);
    setDonorName('');
    setPhone('');
    setEmail('');
    setPanNumber('');
    setTransactionRef('');
    setReceipt(null);
    setErrorMsg(null);
  };

  return (
    <div className="bg-[#F9F2E3] min-h-screen pt-[68px]">
      <Helmet>
        <title>{t('देणगी द्या | गडकिल्ले संवर्धन प्रतिष्ठान', 'Donate | Gadkille Sanvardhan Pratishthan')}</title>
        <meta
          name="description"
          content={t(
            'महाराष्ट्रातील ऐतिहासिक गड-किल्ल्यांच्या संवर्धनासाठी PhonePe किंवा UPI द्वारे देणगी द्या. 80G कर सवलत पावती उपलब्ध.',
            'Donate via PhonePe or UPI for Maharashtra fort conservation. 80G tax exemption receipt available.'
          )}
        />
      </Helmet>

      {/* Hero Header */}
      <div className="bg-[#1A1008] py-16 text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#D4A955_1px,transparent_1px)] [background-size:16px_16px]" />
        <div className="max-w-3xl mx-auto px-6 relative z-10">
          <div className="inline-flex items-center gap-2 mb-3 font-cinzel text-xs uppercase tracking-widest text-[#D4A955]">
            <span className="w-8 h-px bg-[#B58A45]" />
            <span>{t('वारसा संवर्धन निधी', 'Heritage Conservation Fund')}</span>
            <span className="w-8 h-px bg-[#B58A45]" />
          </div>
          <h1 className="font-serif text-3xl sm:text-5xl font-black text-[#F3E8D0] mb-3">
            {t('आपल्या देणगीने', 'With Your Support')}{' '}
            <span className="text-[#D4A955]">{t('गडकिल्ले उभे राहतील', 'Forts Remain Eternal')}</span>
          </h1>
          <p className="text-[rgba(243,232,208,0.8)] text-sm sm:text-base max-w-xl mx-auto">
            {t(
              'नाव, मोबाईल क्र. व ईमेल भरून थेट PhonePe QR कोड द्वारे सुरक्षित देणगी द्या आणि त्वरित 80G पावती मिळवा.',
              'Fill your details to get the instant PhonePe QR code and receive your 80G tax exemption receipt.'
            )}
          </p>

          {/* Stepper Wizard */}
          <div className="mt-8 flex items-center justify-center max-w-md mx-auto gap-2">
            <div
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
                step === 1
                  ? 'bg-[#A84A20] text-white shadow-md'
                  : 'bg-white/10 text-white/70'
              }`}
            >
              <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-[10px]">
                १
              </span>
              <span>{t('माहिती भरा', '1. Details')}</span>
            </div>

            <div className="w-6 h-0.5 bg-white/20" />

            <div
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
                step === 2
                  ? 'bg-[#5f259f] text-white shadow-md'
                  : step === 3
                  ? 'bg-emerald-700 text-white'
                  : 'bg-white/10 text-white/50'
              }`}
            >
              <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-[10px]">
                २
              </span>
              <span>{t('PhonePe QR कोड', '2. PhonePe QR')}</span>
            </div>

            <div className="w-6 h-0.5 bg-white/20" />

            <div
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
                step === 3
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'bg-white/10 text-white/50'
              }`}
            >
              <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-[10px]">
                ३
              </span>
              <span>{t('पावती', '3. Receipt')}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1140px] mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Trust & Organization Info (5 cols) */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white rounded-3xl p-6 border border-[#E8D5A3] shadow-sm">
              <h2 className="font-serif text-xl font-bold text-[#1A1008] mb-4 flex items-center gap-2">
                <ShieldCheck className="text-[#A84A20]" size={22} />
                {t('आपला विश्वास, आमची जबाबदारी', 'Your Trust, Our Mission')}
              </h2>
              
              <div className="space-y-3 mb-6">
                {[
                  {
                    icon: ShieldCheck,
                    title: t('80G कर सवलत', '80G Tax Exemption'),
                    desc: t('आयकर कायद्यानुसार देणगीवर 80G कर सवलत.', 'Tax exemption on donation under 80G.'),
                  },
                  {
                    icon: Landmark,
                    title: t(`नोंदणीकृत संस्था (${settings.founded})`, `Registered Trust (Est. ${settings.founded})`),
                    desc: settings.nameMarathi,
                  },
                  {
                    icon: Users,
                    title: t(`${settings.statVolunteers}+ स्वयंसेवक`, `${settings.statVolunteers}+ Volunteers`),
                    desc: t('महाराष्ट्रभरात सक्रिय दुर्ग संवर्धन नेटवर्क.', 'Active fort conservation network.'),
                  },
                  {
                    icon: Leaf,
                    title: t('१००% पारदर्शक विनियोग', '100% Transparent Utilization'),
                    desc: t('प्रत्येक रुपया थेट किल्ल्याच्या डागडुजी व संवर्धनासाठी.', 'Directly spent on fort conservation work.'),
                  },
                ].map(({ icon: Icon, title, desc }) => (
                  <div
                    key={title}
                    className="flex items-start gap-3 p-3 bg-[#FAF5E8] rounded-xl border border-[#E8D5A3]/60"
                  >
                    <Icon size={18} className="text-[#A84A20] shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-bold text-[#1A1008]">{title}</h4>
                      <p className="text-[11px] text-[#6E5945]">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Bank Details Accordion/Card */}
              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200">
                <div className="flex items-center gap-2 mb-2 text-xs font-bold text-[#1A1008]">
                  <Landmark size={15} className="text-[#A84A20]" />
                  <span>{t('थेट बँक ट्रान्सफर (NEFT / RTGS)', 'Direct Bank Transfer')}</span>
                </div>
                <div className="space-y-1 text-xs text-[#554332]">
                  <div className="flex justify-between py-1 border-b border-stone-200/60">
                    <span className="text-[#8F7A66]">{t('बँक:', 'Bank:')}</span>
                    <span className="font-semibold">{settings.bankName}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-stone-200/60">
                    <span className="text-[#8F7A66]">{t('खाते क्र.:', 'Account:')}</span>
                    <span className="font-mono font-semibold">{settings.bankAccount}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-stone-200/60">
                    <span className="text-[#8F7A66]">IFSC:</span>
                    <span className="font-mono font-semibold">{settings.bankIfsc}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-[#8F7A66]">UPI ID:</span>
                    <span className="font-mono font-semibold text-[#A84A20]">{upiId}</span>
                  </div>
                </div>
              </div>

              {/* Help & Contact */}
              <div className="mt-4 text-center">
                <p className="text-xs text-[#8F7A66]">
                  {t('काही अडचण आल्यास संपर्क करा:', 'Need assistance? Contact:')}{' '}
                  <a
                    href={`tel:${settings.phone1}`}
                    className="font-bold text-[#A84A20] hover:underline inline-flex items-center gap-1"
                  >
                    {settings.phone1}
                  </a>
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Dynamic Step Container (7 cols) */}
          <div className="lg:col-span-8">
            
            {/* STEP 1: Donor Information Form */}
            {step === 1 && (
              <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-[#E8D5A3]">
                <div className="border-b border-[#F0E6D2] pb-5 mb-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-[#A84A20] font-cinzel">
                        {t('पायरी १ / २', 'Step 1 of 2')}
                      </span>
                      <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#1A1008] mt-1">
                        {t('देणगीदाराची माहिती', 'Donor Information')}
                      </h2>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-[#A84A20]/10 text-[#A84A20] flex items-center justify-center font-bold">
                      <Heart size={24} className="fill-[#A84A20]" />
                    </div>
                  </div>
                  <p className="text-xs text-[#8F7A66] mt-2">
                    {t(
                      'कृपया आपले नाव, फोन नंबर आणि ईमेल प्रविष्ट करा. पुढील पानावर PhonePe QR कोड दाखवला जाईल.',
                      'Please enter your name, phone number, and email. The PhonePe QR code will appear on the next screen.'
                    )}
                  </p>
                </div>

                <form onSubmit={handleProceedToQR} className="space-y-6">
                  
                  {/* Amount Selection */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#6E5945] mb-2.5">
                      {t('१. देणगी रक्कम निवडा (Select Donation Amount)', '1. Select Donation Amount (₹)')}
                    </label>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 mb-3">
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
                            className={`border-2 rounded-2xl p-3.5 transition-all text-left relative overflow-hidden ${
                              isSelected
                                ? 'border-[#A84A20] bg-[rgba(168,74,32,0.06)] shadow-md ring-2 ring-[#A84A20]/20'
                                : 'border-[#E8D5A3] hover:border-[#A84A20]/60 bg-white'
                            }`}
                          >
                            {a.popular && (
                              <span className="absolute top-0 right-0 bg-[#A84A20] text-white text-[9px] font-bold px-2 py-0.5 rounded-bl-lg">
                                {t('लोकप्रिय', 'Popular')}
                              </span>
                            )}
                            <div className="text-xl mb-1">{a.emoji}</div>
                            <div className="font-serif text-lg font-black text-[#1A1008]">
                              {a.label}
                            </div>
                            <div className="text-[11px] text-[#8F7A66] mt-0.5 leading-tight line-clamp-1">
                              {a.impact}
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    {/* Custom Amount */}
                    <div className="relative">
                      <label
                        htmlFor="custom-donation-amount"
                        className="block text-[11px] font-semibold text-[#6E5945] mb-1"
                      >
                        {t('किंवा इतर रक्कम टाका (₹)', 'Or Enter Custom Amount (₹)')}
                      </label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-base text-[#1A1008]">
                          ₹
                        </span>
                        <input
                          id="custom-donation-amount"
                          type="number"
                          min={1}
                          value={customAmount}
                          onChange={e => setCustomAmount(e.target.value)}
                          placeholder={t('उदा. २५०१', 'e.g. 2501')}
                          className="w-full border-2 border-[#E8D5A3] rounded-xl pl-9 pr-4 py-2.5 text-sm font-bold text-[#1A1008] focus:border-[#A84A20] focus:outline-none bg-white transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Project / Fort Allocation */}
                  <div>
                    <label
                      htmlFor="donation-project"
                      className="block text-xs font-bold uppercase tracking-wider text-[#6E5945] mb-1.5"
                    >
                      {t('२. देणगीचा उद्देश / किल्ला (Select Cause / Fort)', '2. Select Cause / Fort')}
                    </label>
                    <select
                      id="donation-project"
                      value={projectName}
                      onChange={e => setProjectName(e.target.value)}
                      className="w-full border-2 border-[#E8D5A3] rounded-xl px-4 py-2.5 text-sm text-[#1A1008] focus:border-[#A84A20] focus:outline-none bg-white font-medium"
                    >
                      <option value="सामान्य संवर्धन निधी (General Fort Fund)">
                        {t('🏰 सर्वसाधारण गड-किल्ले संवर्धन निधी', '🏰 General Forts Conservation Fund')}
                      </option>
                      {projects && projects.map(p => (
                        <option key={p.id} value={`${p.fort} - ${p.title}`}>
                          🚩 {p.fort} — {p.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Donor Contact Details */}
                  <div className="space-y-4 pt-2 border-t border-[#F0E6D2]">
                    <span className="block text-xs font-bold uppercase tracking-wider text-[#6E5945]">
                      {t('३. दात्याचे संपर्क विवरण (Donor Details)', '3. Donor Contact Details')}
                    </span>

                    {/* Name */}
                    <div>
                      <label
                        htmlFor="donor-fullname"
                        className="block text-xs font-semibold text-[#1A1008] mb-1"
                      >
                        {t('पूर्ण नाव (Full Name)', 'Full Name')}{' '}
                        <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="donor-fullname"
                        type="text"
                        required
                        value={donorName}
                        onChange={e => setDonorName(e.target.value)}
                        placeholder={t('उदा. शिवभक्त राहुल पाटील', 'e.g. Rahul Patil')}
                        className="w-full border-2 border-[#E8D5A3] rounded-xl px-4 py-2.5 text-sm text-[#1A1008] focus:border-[#A84A20] focus:outline-none bg-white font-medium"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Phone */}
                      <div>
                        <label
                          htmlFor="donor-phone"
                          className="block text-xs font-semibold text-[#1A1008] mb-1"
                        >
                          {t('मोबाईल क्रमांक (Phone No)', 'Phone Number')}{' '}
                          <span className="text-red-500">*</span>
                        </label>
                        <input
                          id="donor-phone"
                          type="tel"
                          required
                          maxLength={15}
                          value={phone}
                          onChange={e => setPhone(e.target.value)}
                          placeholder="9876543210"
                          className="w-full border-2 border-[#E8D5A3] rounded-xl px-4 py-2.5 text-sm text-[#1A1008] focus:border-[#A84A20] focus:outline-none bg-white font-mono"
                        />
                      </div>

                      {/* Email */}
                      <div>
                        <label
                          htmlFor="donor-email"
                          className="block text-xs font-semibold text-[#1A1008] mb-1"
                        >
                          {t('ईमेल आयडी (Email ID)', 'Email Address')}{' '}
                          <span className="text-red-500">*</span>
                        </label>
                        <input
                          id="donor-email"
                          type="email"
                          required
                          value={email}
                          onChange={e => setEmail(e.target.value)}
                          placeholder="name@gmail.com"
                          className="w-full border-2 border-[#E8D5A3] rounded-xl px-4 py-2.5 text-sm text-[#1A1008] focus:border-[#A84A20] focus:outline-none bg-white"
                        />
                      </div>
                    </div>

                    {/* PAN Card (Optional) */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label
                          htmlFor="donor-pan"
                          className="text-xs font-semibold text-[#1A1008]"
                        >
                          {t('पॅन कार्ड क्र. (PAN Number)', 'PAN Card Number')}
                        </label>
                        <span className="text-[10px] text-[#8F7A66]">
                          {t('(80G कर सवलतीसाठी ऐच्छिक)', '(Optional for 80G Tax Benefit)')}
                        </span>
                      </div>
                      <input
                        id="donor-pan"
                        type="text"
                        maxLength={10}
                        value={panNumber}
                        onChange={e => setPanNumber(e.target.value.toUpperCase())}
                        placeholder="ABCDE1234F"
                        className="w-full border-2 border-[#E8D5A3] rounded-xl px-4 py-2 text-sm text-[#1A1008] focus:border-[#A84A20] focus:outline-none bg-white uppercase font-mono"
                      />
                    </div>
                  </div>

                  {errorMsg && (
                    <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                      <AlertCircle size={16} className="shrink-0" />
                      <span>{errorMsg}</span>
                    </div>
                  )}

                  {/* Proceed to QR Button */}
                  <button
                    type="submit"
                    className="w-full bg-[#A84A20] hover:bg-[#8F3E1B] text-white font-serif font-bold py-4 px-6 rounded-2xl transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2.5 text-base group cursor-pointer"
                  >
                    <span>
                      {t(
                        `पुढे जा — PhonePe QR कोड मिळवा (₹${finalAmount})`,
                        `Proceed — Get PhonePe QR Code (₹${finalAmount})`
                      )}
                    </span>
                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </button>
                </form>
              </div>
            )}

            {/* STEP 2: PhonePe QR Code Display & Payment Screen */}
            {step === 2 && (
              <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-[#E8D5A3] space-y-6">
                
                {/* Header with Back button */}
                <div className="flex items-center justify-between border-b border-[#F0E6D2] pb-4">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#A84A20] hover:text-[#8F3E1B] px-3 py-1.5 rounded-xl bg-[#FAF5E8] border border-[#E8D5A3] transition-all"
                  >
                    <ArrowLeft size={14} />
                    <span>{t('माहिती बदला (Back)', 'Edit Details')}</span>
                  </button>
                  <span className="text-xs font-bold uppercase tracking-wider text-[#5f259f] font-cinzel">
                    {t('पायरी २ / २: PhonePe QR देणगी', 'Step 2: PhonePe QR Payment')}
                  </span>
                </div>

                {/* Donor Summary Pill */}
                <div className="bg-[#FAF5E8] rounded-2xl p-4 border border-[#E8D5A3] flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div>
                    <span className="text-[#8F7A66] block text-[10px] uppercase font-bold">
                      {t('देणगीदार', 'Donor Name')}
                    </span>
                    <span className="font-bold text-[#1A1008] text-sm">{donorName}</span>
                    <span className="text-[#6E5945] block text-[11px]">{phone} • {email}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[#8F7A66] block text-[10px] uppercase font-bold">
                      {t('देणगी रक्कम', 'Donation Amount')}
                    </span>
                    <span className="font-serif text-2xl font-black text-[#A84A20]">
                      ₹{finalAmount.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                {/* PhonePe Branded QR Card */}
                <div className="bg-gradient-to-b from-[#5f259f] via-[#4d1d82] to-[#2d0f50] rounded-3xl p-6 text-white text-center shadow-xl relative overflow-hidden">
                  
                  {/* PhonePe Header Branding */}
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm">
                      <Smartphone size={20} className="text-[#5f259f]" />
                    </div>
                    <div className="text-left">
                      <div className="font-sans font-black text-lg tracking-tight leading-none text-white">
                        PhonePe <span className="text-amber-300 text-xs font-normal">/ UPI</span>
                      </div>
                      <span className="text-[10px] text-white/80 uppercase tracking-wider">
                        {t('अधिकृत संवर्धन QR कोड', 'Official Verified QR')}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-white/90 mb-4 max-w-sm mx-auto">
                    {t(
                      'खालील QR कोड कोणत्याही PhonePe, Google Pay, Paytm किंवा UPI ॲपने स्कॅन करा.',
                      'Scan this QR code using PhonePe, Google Pay, Paytm or any UPI App.'
                    )}
                  </p>

                  {/* QR Code Canvas / Box */}
                  <div className="inline-block p-4 bg-white rounded-3xl shadow-2xl border-4 border-amber-300/60 my-2">
                    <img
                      src={qrCodeUrl}
                      alt="PhonePe Donation QR Code"
                      className="w-56 h-56 sm:w-64 sm:h-64 object-contain rounded-xl mx-auto"
                    />
                    <div className="mt-2 text-center">
                      <div className="font-serif font-black text-xl text-[#1A1008]">
                        ₹{finalAmount.toLocaleString('en-IN')}
                      </div>
                      <div className="text-[10px] text-stone-500 font-sans">
                        {payeeName}
                      </div>
                    </div>
                  </div>

                  {/* UPI ID Copy Box */}
                  <div className="mt-4 max-w-sm mx-auto bg-black/30 backdrop-blur-sm rounded-2xl p-2.5 px-4 flex items-center justify-between border border-white/20">
                    <div className="text-left">
                      <span className="text-[9px] text-white/70 uppercase block">
                        {t('UPI आयडी (UPI ID):', 'UPI ID:')}
                      </span>
                      <span className="font-mono text-xs font-bold text-amber-300">{upiId}</span>
                    </div>
                    <button
                      type="button"
                      onClick={copyUpiId}
                      className="px-3 py-1.5 rounded-xl bg-white/20 hover:bg-white/30 text-white text-xs font-bold transition-all flex items-center gap-1.5"
                    >
                      {copiedUpi ? (
                        <>
                          <Check size={14} className="text-emerald-300" />
                          <span className="text-emerald-300">{t('कॉपी झाले!', 'Copied!')}</span>
                        </>
                      ) : (
                        <>
                          <Copy size={14} />
                          <span>{t('कॉपी', 'Copy')}</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Mobile Direct Pay Button */}
                  <div className="mt-5">
                    <a
                      href={upiUri}
                      className="inline-flex items-center justify-center gap-2 bg-white text-[#5f259f] hover:bg-amber-100 font-bold py-3 px-6 rounded-2xl transition-all shadow-md text-sm w-full sm:w-auto"
                    >
                      <Smartphone size={18} />
                      <span>{t('PhonePe / UPI ॲप थेट उघडा', 'Open PhonePe / UPI App Directly')}</span>
                    </a>
                  </div>
                </div>

                {/* Verification & Final Step */}
                <div className="bg-[#FAF5E8] rounded-2xl p-5 border border-[#E8D5A3] space-y-4">
                  <div>
                    <h3 className="font-serif text-lg font-bold text-[#1A1008] mb-1 flex items-center gap-2">
                      <FileCheck2 className="text-[#A84A20]" size={20} />
                      {t('पैसे भरल्यानंतर पावती मिळवा', 'Confirm Payment & Get 80G Receipt')}
                    </h3>
                    <p className="text-xs text-[#6E5945]">
                      {t(
                        'PhonePe वर पैसे यशस्वी भरल्यानंतर खालील बटणावर क्लिक करा. आपली 80G पावती लगेच तयार होईल.',
                        'After completing your payment on PhonePe, click below to generate your official 80G receipt.'
                      )}
                    </p>
                  </div>

                  {/* Transaction Ref (Optional) */}
                  <div>
                    <label
                      htmlFor="upi-ref"
                      className="block text-xs font-semibold text-[#6E5945] mb-1"
                    >
                      {t('PhonePe / UPI Transaction UTR किंवा संदर्भ क्र. (ऐच्छिक)', 'UPI Transaction UTR / Ref No (Optional)')}
                    </label>
                    <input
                      id="upi-ref"
                      type="text"
                      value={transactionRef}
                      onChange={e => setTransactionRef(e.target.value)}
                      placeholder={t('उदा. 412345678901 किंवा रिकामे ठेवा', 'e.g. 412345678901 or leave empty')}
                      className="w-full border-2 border-[#E8D5A3] rounded-xl px-4 py-2 text-xs text-[#1A1008] focus:border-[#A84A20] focus:outline-none bg-white font-mono"
                    />
                  </div>

                  {errorMsg && (
                    <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                      <AlertCircle size={16} className="shrink-0" />
                      <span>{errorMsg}</span>
                    </div>
                  )}

                  {/* Submit Confirmation */}
                  <button
                    type="button"
                    onClick={handleConfirmDonation}
                    disabled={submitting}
                    className="w-full bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white font-serif font-bold py-3.5 px-6 rounded-2xl transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 text-base cursor-pointer"
                  >
                    {submitting ? (
                      <>
                        <Loader2 size={20} className="animate-spin" />
                        <span>{t('पावती तयार करत आहे...', 'Generating Receipt...')}</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 size={20} />
                        <span>{t('मी पैसे भरले आहेत — पावती मिळवा', 'I Have Paid — Get Official Receipt')}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: Success & Official 80G Receipt */}
            {step === 3 && receipt && (
              <div className="space-y-6">
                
                {/* Celebration Card */}
                <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-emerald-300 text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-inner">
                    <CheckCircle2 size={40} />
                  </div>
                  <div>
                    <span className="text-xs font-bold uppercase tracking-widest text-emerald-800 font-cinzel">
                      {t('देणगी यशस्वी!', 'Donation Successful!')}
                    </span>
                    <h2 className="font-serif text-2xl sm:text-3xl font-black text-emerald-950 mt-1">
                      {receipt.message}
                    </h2>
                    <p className="text-xs text-stone-600 mt-2">
                      {t(
                        'महाराष्ट्राच्या इतिहासाचे आणि गड-किल्ल्यांचे संवर्धन करण्याच्या पवित्र कार्यात सहभागी झाल्याबद्दल मनःपूर्वक धन्यवाद!',
                        'Thank you wholeheartedly for contributing to the sacred conservation of Maharashtra’s historic forts!'
                      )}
                    </p>
                  </div>

                  {/* Official Printable 80G Receipt Card */}
                  <div
                    id="donation-receipt-card"
                    className="bg-[#FAF5E8] rounded-3xl p-6 sm:p-8 border-2 border-[#D4A955] text-left relative overflow-hidden shadow-md my-6"
                  >
                    {/* Watermark Logo */}
                    <div className="absolute right-4 bottom-4 opacity-5 pointer-events-none text-9xl">
                      🏰
                    </div>

                    <div className="flex flex-wrap items-center justify-between border-b-2 border-[#D4A955]/40 pb-4 mb-5 gap-3">
                      <div>
                        <h3 className="font-serif font-black text-xl text-[#1A1008]">
                          {settings.nameMarathi}
                        </h3>
                        <p className="text-[11px] text-[#6E5945]">{settings.nameEnglish}</p>
                        <p className="text-[10px] text-[#8F7A66]">{settings.address}</p>
                      </div>
                      <div className="text-right">
                        <span className="inline-block px-3 py-1 rounded-full bg-[#A84A20] text-white text-[10px] font-bold">
                          {t('80G कर सवलत पावती', '80G Tax Exemption Receipt')}
                        </span>
                        <div className="text-xs font-mono font-bold text-[#1A1008] mt-1.5">
                          {t('पावती क्र.:', 'Receipt No:')} {receipt.receiptNumber}
                        </div>
                        <div className="text-[10px] text-[#8F7A66]">{receipt.date}</div>
                      </div>
                    </div>

                    {/* Receipt Details Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                      <div>
                        <span className="text-[#8F7A66] block text-[10px]">{t('दात्याचे नाव (Donor Name):', 'Donor Name:')}</span>
                        <span className="font-bold text-sm text-[#1A1008]">{receipt.donorName}</span>
                      </div>

                      <div>
                        <span className="text-[#8F7A66] block text-[10px]">{t('देणगी रक्कम (Amount):', 'Donation Amount:')}</span>
                        <span className="font-serif font-black text-lg text-emerald-800">
                          ₹{receipt.amount.toLocaleString('en-IN')}
                        </span>
                      </div>

                      <div>
                        <span className="text-[#8F7A66] block text-[10px]">{t('मोबाईल व ईमेल (Phone & Email):', 'Contact Details:')}</span>
                        <span className="text-[#1A1008] font-medium">{receipt.phone} • {receipt.email}</span>
                      </div>

                      <div>
                        <span className="text-[#8F7A66] block text-[10px]">{t('उद्देश / प्रकल्प (Purpose / Fort):', 'Purpose / Project:')}</span>
                        <span className="text-[#1A1008] font-medium">{receipt.projectName}</span>
                      </div>

                      {panNumber && (
                        <div>
                          <span className="text-[#8F7A66] block text-[10px]">{t('पॅन क्रमांक (PAN Number):', 'PAN Number:')}</span>
                          <span className="text-[#1A1008] font-mono font-bold">{panNumber}</span>
                        </div>
                      )}

                      <div>
                        <span className="text-[#8F7A66] block text-[10px]">{t('पेमेंट पद्धत (Payment Mode):', 'Payment Mode:')}</span>
                        <span className="text-[#1A1008] font-medium">PhonePe / UPI ({transactionRef || 'Direct'})</span>
                      </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-[#D4A955]/40 flex flex-wrap items-center justify-between gap-3 text-[10px] text-[#6E5945]">
                      <div>
                        <p>✓ {t('आयकर अधिनियम 80G अन्वये ही पावती कर सवलतीस पात्र आहे.', 'Donations are exempt under Section 80G of the Income Tax Act.')}</p>
                        <p>✓ {t('नोंदणीकृत धर्मादाय संस्था (महाराष्ट्र राज्य)', 'Registered Public Charitable Trust (Govt of Maharashtra)')}</p>
                      </div>
                      <div className="text-right">
                        <span className="font-cinzel font-bold text-[#A84A20] text-xs block">
                          गड-किल्ले संवर्धन प्रतिष्ठान
                        </span>
                        <span className="text-[9px] text-[#8F7A66]">{t('अधिकृत डिजिटल स्वाक्षरी', 'Authorized Digital Seal')}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* PUBLIC DONORS SECTION (आमचे देणगीदार / देणगीदारांचे योगदान)                 */}
        {/* ========================================================================= */}
        <div id="verified-donors-section" className="mt-16 pt-12 border-t-2 border-[#E8D5A3]">
          
          {/* Section Header */}
          <div className="text-center max-w-2xl mx-auto mb-10">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#A84A20]/10 border border-[#A84A20]/20 text-[#A84A20] text-xs font-bold font-cinzel uppercase tracking-wider mb-3">
              <Award size={15} />
              <span>{t('🙏 देणगीदारांचे योगदान', '🙏 Our Honored Donors')}</span>
            </div>
            
            <h2 className="font-serif text-3xl sm:text-4xl font-black text-[#1A1008] mb-3">
              {t('आमचे सन्माननीय देणगीदार', 'Our Esteemed Donors')}
            </h2>
            
            <p className="text-xs sm:text-sm text-[#6E5945]">
              {t(
                'महाराष्ट्रातील गड-किल्ले संवर्धन, स्वच्छता आणि ऐतिहासिक वारसा जतन कार्यासाठी दिलेल्या मोलाच्या योगदानाबद्दल सर्व देणगीदारांचे मनःपूर्वक आभार.',
                'Heartfelt gratitude to all noble contributors supporting fort conservation, heritage restoration, and cleanliness drives across Maharashtra.'
              )}
            </p>
          </div>

          {/* Search & Filter Bar */}
          <div className="max-w-xl mx-auto mb-8">
            <div className="relative">
              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8F7A66] pointer-events-none"
              />
              <input
                type="text"
                value={donorSearch}
                onChange={e => setDonorSearch(e.target.value)}
                placeholder={t(
                  '🔍 देणगीदाराचे नाव किंवा प्रकल्पाचे नाव शोधा...',
                  '🔍 Search donor name or cause...'
                )}
                className="w-full pl-11 pr-4 py-3 bg-white rounded-2xl border-2 border-[#E8D5A3] text-sm text-[#1A1008] focus:border-[#A84A20] focus:outline-none shadow-sm transition-all font-medium placeholder-[#8F7A66]"
              />
              {donorSearch && (
                <button
                  type="button"
                  onClick={() => setDonorSearch('')}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-[#8F7A66] hover:text-[#1A1008] px-2 py-1 rounded-lg bg-stone-100"
                >
                  ✕
                </button>
              )}
            </div>
            
            <div className="flex items-center justify-between text-[11px] text-[#8F7A66] mt-2 px-2">
              <span>
                {t('सत्यापित देणगीदार नोंदणी', 'Verified Donor Count')}:{' '}
                <strong className="text-[#A84A20]">
                  {publicDonors ? publicDonors.length : 0}
                </strong>
              </span>
              <span className="flex items-center gap-1">
                <ShieldCheck size={13} className="text-emerald-700" />
                {t('प्रशासकीय पडताळणी पूर्ण', 'Admin Verified')}
              </span>
            </div>
          </div>

          {/* Donors Grid */}
          {(() => {
            const filtered = (publicDonors || []).filter(d => {
              if (!donorSearch.trim()) return true;
              const term = donorSearch.toLowerCase();
              return (
                (d.donor_name || '').toLowerCase().includes(term) ||
                (d.purpose || '').toLowerCase().includes(term)
              );
            });

            if (filtered.length === 0) {
              return (
                <div className="bg-white rounded-3xl p-10 text-center border border-[#E8D5A3] shadow-sm max-w-md mx-auto">
                  <Heart className="mx-auto text-[#A84A20]/40 mb-3" size={40} />
                  <h4 className="font-serif font-bold text-base text-[#1A1008] mb-1">
                    {donorSearch
                      ? t('कोणतेही देणगीदार सापडले नाहीत', 'No donors matching your search')
                      : t('अद्याप देणगीदार यादी अद्ययावत होत आहे', 'Donor list updating soon')}
                  </h4>
                  <p className="text-xs text-[#8F7A66]">
                    {donorSearch
                      ? t('कृपया वेगळा शब्द शोधून पहा.', 'Try searching with a different name or keyword.')
                      : t(
                          'प्रशासकीय पडताळणी पूर्ण झाल्यानंतर नवीन देणगीदारांची नावे येथे सन्मानाने प्रकाशित केली जातील.',
                          'Approved donor names will be published here upon admin verification.'
                        )}
                  </p>
                </div>
              );
            }

            return (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filtered.map(d => (
                  <div
                    key={d.id}
                    className="bg-white rounded-3xl p-6 border-2 border-[#E8D5A3] shadow-sm hover:shadow-md hover:border-[#D4A955] transition-all relative overflow-hidden flex flex-col justify-between group"
                  >
                    {/* Top Corner Ribbon / Badge */}
                    <div className="flex items-center justify-between gap-2 mb-3 pb-3 border-b border-[#F0E6D2]">
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-[#FAF5E8] text-[#A84A20] border border-[#E8D5A3]">
                        <Award size={12} />
                        {t('सन्माननीय देणगीदार', 'Honored Donor')}
                      </span>
                      <span className="text-[10px] text-[#8F7A66] font-medium truncate max-w-[140px]" title={d.purpose}>
                        🚩 {d.purpose || t('सामान्य संवर्धन निधी', 'General Fund')}
                      </span>
                    </div>

                    {/* Donor Name & Gratitude */}
                    <div className="my-2">
                      <div className="w-10 h-10 rounded-full bg-[#FAF5E8] border border-[#E8D5A3] flex items-center justify-center text-[#A84A20] font-serif font-bold text-sm mb-3 group-hover:scale-105 transition-transform">
                        🙏
                      </div>
                      
                      <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#1A1008] leading-tight">
                        {d.donor_name}
                      </h3>

                      <p className="text-xs text-[#6E5945] mt-3 leading-relaxed italic bg-[#FAF5E8] p-3 rounded-2xl border border-[#E8D5A3]/60">
                        {t(
                          'संस्थेच्या दुर्ग संवर्धन व ऐतिहासिक वारसा जतन कार्यासाठी दिलेल्या मोलाच्या योगदानाबद्दल मनःपूर्वक धन्यवाद! 🙏',
                          'Heartfelt thanks for contributing to Maharashtra fort conservation and heritage restoration! 🙏'
                        )}
                      </p>
                    </div>

                    {/* Bottom Metadata (Amount if public + Date) */}
                    <div className="mt-4 pt-3 border-t border-[#F0E6D2] flex items-center justify-between gap-2 text-xs">
                      {d.display_amount_public && d.donation_amount ? (
                        <div className="font-serif font-bold text-[#A84A20] text-sm">
                          {t('योगदान:', 'Contributed:')} ₹{d.donation_amount.toLocaleString('en-IN')}
                        </div>
                      ) : (
                        <div className="text-[11px] text-[#8F7A66] font-medium flex items-center gap-1">
                          <Heart size={12} className="text-[#A84A20] fill-[#A84A20]" />
                          {t('अमूल्य योगदान', 'Invaluable Support')}
                        </div>
                      )}

                      {d.donation_date && (
                        <div className="text-[10px] text-[#8F7A66]">
                          {d.donation_date}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            );
          })()}

          {/* Privacy & Verification Guarantee Note */}
          <div className="mt-12 bg-white rounded-3xl p-6 border border-[#E8D5A3] max-w-3xl mx-auto shadow-sm flex items-start gap-4">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 mt-0.5">
              <Lock size={18} />
            </div>
            <div className="text-xs text-[#554332] space-y-1">
              <h4 className="font-bold text-[#1A1008] text-sm flex items-center gap-1.5">
                <span>{t('सुरक्षितता व गोपनीयतेची हमी (Privacy Guarantee)', 'Privacy & Verification Assurance')}</span>
              </h4>
              <p className="leading-relaxed">
                {t(
                  'सुरक्षिततेच्या आणि गोपनीयतेच्या नियमांनुसार केवळ प्रशासनाने पडताळणी केलेले आणि संमती असलेले देणगीदारच येथे सन्मानाने प्रदर्शित केले जातात. दात्यांचा मोबाईल क्रमांक, ईमेल आयडी किंवा बँक ट्रान्झॅक्शन तपशील कधीही सार्वजनिक केले जात नाहीत.',
                  'In strict compliance with privacy standards, only admin-verified donor names with consent appear publicly. Donor phone numbers, email addresses, and transaction references are kept strictly private and never displayed.'
                )}
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
