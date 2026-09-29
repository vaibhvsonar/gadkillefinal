import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { CheckCircle2, AlertCircle, Loader2, Award, ArrowRight } from 'lucide-react';
import { SectionHeader } from '@/components/ui';
import { api } from '@/lib/api';
import { useSiteData } from '@/context/SiteContext';

export function VolunteerPage() {
  const { t } = useSiteData();

  const PERKS = [
    { icon: '🏰', title: t('किल्ले भेटी', 'Fort Visits'), desc: t('संघटित किल्ला भेटींमध्ये मोफत सहभाग.', 'Free participation in organized fort visits.') },
    { icon: '📜', title: t('डिजिटल प्रमाणपत्र', 'Digital Certificate'), desc: t('प्रत्येक मोहिमेनंतर अधिकृत डिजिटल प्रमाणपत्र मिळते.', 'Receive an official digital certificate after every campaign.') },
    { icon: '👕', title: t('GSP किट', 'GSP Volunteer Kit'), desc: t('स्वयंसेवक टी-शर्ट आणि सुरक्षा किट मिळते.', 'Get a volunteer t-shirt and safety kit.') },
    { icon: '🤝', title: t('समान विचारांचे मित्र', 'Like-minded Friends'), desc: t('महाराष्ट्रभरातील इतिहासप्रेमी स्वयंसेवकांशी ओळख.', 'Connect with history lovers from all over Maharashtra.') },
    { icon: '📚', title: t('प्रशिक्षण', 'Training'), desc: t('संवर्धन तंत्र, प्रथमोपचार आणि इतिहास प्रशिक्षण.', 'Training in conservation techniques, first aid, and history.') },
    { icon: '🏆', title: t('वारसा सन्मान', 'Heritage Recognition'), desc: t('प्रत्येक मोहिमेनंतर विशेष सन्मान व ओळख.', 'Special recognition and honors after each campaign.') },
  ];

  const INTERESTS = [
    { id: 'clean', label: t('🧹 स्वच्छता मोहीम', '🧹 Cleanliness Drive') },
    { id: 'trek', label: t('🥾 ट्रेकिंग व दुर्गभ्रमण', '🥾 Trekking & Exploration') },
    { id: 'conservation', label: t('🧱 वास्तू संवर्धन', '🧱 Architecture Conservation') },
    { id: 'education', label: t('🎓 शिक्षण व जनजागृती', '🎓 Education & Awareness') },
    { id: 'photo', label: t('📷 छायाचित्रण व दस्तऐवजीकरण', '📷 Photography & Documentation') },
    { id: 'history', label: t('📚 इतिहास संशोधन', '📚 History Research') },
  ];

  const [fullName, setFullName] = useState('');
  const [age, setAge] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [district, setDistrict] = useState(t('पुणे', 'Pune'));
  const [occupation, setOccupation] = useState('');
  const [availability, setAvailability] = useState(t('शनिवार-रविवार', 'Weekends'));
  const [trekkingExperience, setTrekkingExperience] = useState(t('नवशिके (पहिल्यांदाच)', 'Beginner'));
  const [selectedInterests, setSelectedInterests] = useState<string[]>(['clean', 'trek']);
  const [about, setAbout] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [registeredUser, setRegisteredUser] = useState<{
    name: string;
    id: string;
    certCode: string;
  } | null>(null);

  const toggleInterest = (id: string) => {
    setSelectedInterests(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const res = await api.registerVolunteer({
        fullName: fullName.trim(),
        age: age ? Number(age) : null,
        phone: phone.trim(),
        email: email.trim(),
        district,
        occupation: occupation.trim(),
        interests: selectedInterests,
        availability,
        trekkingExperience,
        about: about.trim(),
      });

      setRegisteredUser({
        name: fullName.trim(),
        id: res.id,
        certCode: res.certCode || '',
      });
    } catch (err: any) {
      setError(err.message || t('नोंदणी करताना अडचण आली. कृपया पुन्हा प्रयत्न करा.', 'Registration error. Please try again.'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-[#F9F2E3] min-h-screen pt-[68px]">
      <Helmet>
        <title>{t('स्वयंसेवक बना | गडकिल्ले', 'Become a Volunteer | Gadkille')}</title>
      </Helmet>
      
      <div className="bg-[#1A1008] py-20 text-center">
        <div className="max-w-2xl mx-auto px-6">
          <div className="inline-flex items-center gap-2 mb-4 font-cinzel text-xs uppercase tracking-widest text-[#D4A955]">
            <span className="w-6 h-px bg-[#B58A45]" /> {t('आमच्यासोबत या', 'Join Us')}{' '}
            <span className="w-6 h-px bg-[#B58A45]" />
          </div>
          <h1 className="font-serif text-4xl sm:text-5xl font-black text-[#F3E8D0] mb-4">
            {t('स्वयंसेवक बना', 'Become a Volunteer')}
          </h1>
          <p className="text-[rgba(243,232,208,0.65)] max-w-lg mx-auto">
            {t('आपल्या वेळाचे योगदान द्या. महाराष्ट्राच्या पराक्रमी इतिहासाचे रक्षण करण्यात आपला सहभाग नोंदवा.', 'Contribute your time. Register your participation in protecting the glorious history of Maharashtra.')}
          </p>
        </div>
      </div>

      <div className="max-w-[1100px] mx-auto px-6 py-16 space-y-16">
        <div>
          <SectionHeader eyebrow={t('स्वयंसेवक लाभ', 'Volunteer Benefits')} title={t('स्वयंसेवक म्हणून काय मिळते?', 'What do you get as a volunteer?')} />
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-5">
            {PERKS.map(p => (
              <div
                key={p.title}
                className="bg-white rounded-2xl p-6 border border-[#E8D5A3] shadow-sm hover:shadow-md transition-all text-center"
              >
                <div className="text-4xl mb-3">{p.icon}</div>
                <h4 className="font-serif font-bold text-[#1A1008] mb-2">{p.title}</h4>
                <p className="text-xs text-[#6E5945]">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-3xl p-8 sm:p-12 shadow-lg border border-[#E8D5A3] max-w-2xl mx-auto">
          {registeredUser ? (
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 rounded-full bg-[#e8f5e9] text-[#2e7d32] flex items-center justify-center mx-auto">
                <CheckCircle2 size={38} />
              </div>
              <h2 className="font-serif text-3xl font-black text-[#1b5e20]">
                {t('स्वागत आहे, वारसा रक्षक! 🎊', 'Welcome, Heritage Defender! 🎊')}
              </h2>
              <p className="text-sm text-[#4A3B2C] max-w-md mx-auto">
                {t('धन्यवाद', 'Thank you')} <strong>{registeredUser.name}</strong>! {t('आपली स्वयंसेवक नोंदणी डेटाबेसमध्ये यशस्वीरित्या जतन झाली आहे.', 'Your volunteer registration has been successfully saved in the database.')}
              </p>
              {registeredUser.certCode && (
                <div className="inline-block px-4 py-2 rounded-xl bg-[#F9F2E3] border border-[#E8D5A3] text-xs font-mono text-[#A84A20] font-bold">
                  {t('प्रमाणपत्र कोड:', 'Certificate Code:')} {registeredUser.certCode}
                </div>
              )}
              <div className="pt-4 flex items-center justify-center gap-4 flex-wrap">
                <Link
                  to="/certificate"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-white font-bold text-sm btn-shimmer shadow-md"
                >
                  <Award size={16} /> {t('डिजिटल प्रमाणपत्र पहा', 'View Digital Certificate')}
                </Link>
                <Link
                  to="/events"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border-2 border-[#E8D5A3] text-[#1A1008] font-bold text-sm hover:border-[#A84A20]"
                >
                  {t('आगामी मोहिमा पहा', 'View Upcoming Campaigns')} <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          ) : (
            <>
              <div className="text-center mb-8">
                <h2 className="font-serif text-3xl font-bold text-[#1A1008] mb-2">
                  🏰 {t('स्वयंसेवक नोंदणी अर्ज', 'Volunteer Registration Form')}
                </h2>
                <p className="text-sm text-[#8F7A66]">
                  {t('खालील माहिती भरा आणि आमच्या वारसा संरक्षण परिवाराचा भाग बना.', 'Fill out the information below and become part of our heritage protection family.')}
                </p>
              </div>

              {error && (
                <div className="mb-6 p-4 rounded-xl bg-[#ffebee] border border-[#ef9a9a] text-[#b71c1c] text-xs flex items-center gap-2.5">
                  <AlertCircle size={18} className="shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="vol-fullname" className="block text-xs font-medium text-[#6E5945] mb-1.5">
                      {t('पूर्ण नाव *', 'Full Name *')}
                    </label>
                    <input
                      id="vol-fullname"
                      type="text"
                      required
                      value={fullName}
                      onChange={e => setFullName(e.target.value)}
                      placeholder={t('आपले पूर्ण नाव', 'Your Full Name')}
                      className="w-full border-2 border-[#E8D5A3] rounded-xl px-4 py-3 text-sm text-[#1A1008] focus:border-[#A84A20] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label htmlFor="vol-age" className="block text-xs font-medium text-[#6E5945] mb-1.5">{t('वय', 'Age')}</label>
                    <input
                      id="vol-age"
                      type="number"
                      min={15}
                      max={75}
                      value={age}
                      onChange={e => setAge(e.target.value)}
                      placeholder={t('उदा. 24', 'e.g. 24')}
                      className="w-full border-2 border-[#E8D5A3] rounded-xl px-4 py-3 text-sm text-[#1A1008] focus:border-[#A84A20] focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="vol-phone" className="block text-xs font-medium text-[#6E5945] mb-1.5">
                      {t('मोबाइल नंबर *', 'Mobile Number *')}
                    </label>
                    <input
                      id="vol-phone"
                      type="tel"
                      required
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      placeholder="+91 9876543210"
                      className="w-full border-2 border-[#E8D5A3] rounded-xl px-4 py-3 text-sm text-[#1A1008] focus:border-[#A84A20] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label htmlFor="vol-email" className="block text-xs font-medium text-[#6E5945] mb-1.5">
                      {t('ईमेल *', 'Email *')}
                    </label>
                    <input
                      id="vol-email"
                      type="email"
                      required
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      className="w-full border-2 border-[#E8D5A3] rounded-xl px-4 py-3 text-sm text-[#1A1008] focus:border-[#A84A20] focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="vol-district" className="block text-xs font-medium text-[#6E5945] mb-1.5">
                      {t('जिल्हा', 'District')}
                    </label>
                    <select
                      id="vol-district"
                      value={district}
                      onChange={e => setDistrict(e.target.value)}
                      className="w-full border-2 border-[#E8D5A3] rounded-xl px-4 py-3 text-sm text-[#1A1008] bg-white focus:border-[#A84A20] focus:outline-none"
                    >
                      {[
                        t('पुणे', 'Pune'),
                        t('रायगड', 'Raigad'),
                        t('सातारा', 'Satara'),
                        t('कोल्हापूर', 'Kolhapur'),
                        t('सिंधुदुर्ग', 'Sindhudurg'),
                        t('नाशिक', 'Nashik'),
                        t('मुंबई', 'Mumbai'),
                        t('छत्रपती संभाजीनगर', 'Chhatrapati Sambhajinagar'),
                        t('इतर', 'Other'),
                      ].map(d => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="vol-occ" className="block text-xs font-medium text-[#6E5945] mb-1.5">
                      {t('व्यवसाय / शिक्षण', 'Occupation / Education')}
                    </label>
                    <input
                      id="vol-occ"
                      type="text"
                      value={occupation}
                      onChange={e => setOccupation(e.target.value)}
                      placeholder={t('नोकरी / व्यवसाय / विद्यार्थी', 'Job / Business / Student')}
                      className="w-full border-2 border-[#E8D5A3] rounded-xl px-4 py-3 text-sm text-[#1A1008] focus:border-[#A84A20] focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#6E5945] mb-2">
                    {t('आपल्या आवडीचे क्षेत्र निवडा', 'Select your areas of interest')}
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {INTERESTS.map(item => {
                      const active = selectedInterests.includes(item.id);
                      return (
                        <button
                          type="button"
                          key={item.id}
                          onClick={() => toggleInterest(item.id)}
                          className={`px-3.5 py-2 rounded-full text-xs font-semibold border-2 transition-all ${
                            active
                              ? 'border-[#A84A20] bg-[rgba(168,74,32,0.1)] text-[#A84A20]'
                              : 'border-[#E8D5A3] text-[#6E5945] hover:border-[#A84A20]'
                          }`}
                        >
                          {item.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="vol-avail" className="block text-xs font-medium text-[#6E5945] mb-1.5">
                      {t('उपलब्धता', 'Availability')}
                    </label>
                    <select
                      id="vol-avail"
                      value={availability}
                      onChange={e => setAvailability(e.target.value)}
                      className="w-full border-2 border-[#E8D5A3] rounded-xl px-4 py-3 text-sm text-[#1A1008] bg-white focus:border-[#A84A20] focus:outline-none"
                    >
                      <option>{t('शनिवार-रविवार', 'Weekends')}</option>
                      <option>{t('सुट्टीच्या दिवशी', 'On Holidays')}</option>
                      <option>{t('आठवड्यातून एकदा', 'Once a Week')}</option>
                      <option>{t('महिन्यातून एकदा', 'Once a Month')}</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="vol-exp" className="block text-xs font-medium text-[#6E5945] mb-1.5">
                      {t('ट्रेकिंग अनुभव', 'Trekking Experience')}
                    </label>
                    <select
                      id="vol-exp"
                      value={trekkingExperience}
                      onChange={e => setTrekkingExperience(e.target.value)}
                      className="w-full border-2 border-[#E8D5A3] rounded-xl px-4 py-3 text-sm text-[#1A1008] bg-white focus:border-[#A84A20] focus:outline-none"
                    >
                      <option>{t('नवशिके (पहिल्यांदाच)', 'Beginner')}</option>
                      <option>{t('साधारण (काही ट्रेक केले)', 'Intermediate')}</option>
                      <option>{t('अनुभवी (नियमित)', 'Experienced')}</option>
                      <option>{t('तज्ञ (कठीण ट्रेक)', 'Expert')}</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="vol-about" className="block text-xs font-medium text-[#6E5945] mb-1.5">
                    {t('थोडक्यात परिचय', 'Brief Introduction')}
                  </label>
                  <textarea
                    id="vol-about"
                    rows={3}
                    value={about}
                    onChange={e => setAbout(e.target.value)}
                    placeholder={t('आपण गडकिल्ले संवर्धनात का सामील होऊ इच्छिता?', 'Why do you want to join fort conservation?')}
                    className="w-full border-2 border-[#E8D5A3] rounded-xl px-4 py-3 text-sm text-[#1A1008] focus:border-[#A84A20] focus:outline-none resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-4 rounded-xl font-bold text-white btn-shimmer text-sm shadow-lg flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {submitting ? (
                    <>
                      <Loader2 size={18} className="animate-spin" /> {t('नोंदणी होत आहे...', 'Registering...')}
                    </>
                  ) : (
                    `🤝 ${t('स्वयंसेवक म्हणून नोंदणी करा', 'Register as a Volunteer')}`
                  )}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
