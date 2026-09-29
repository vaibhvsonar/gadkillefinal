import React, { useState } from 'react';
import { MapPin, Users, X, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { useSiteData } from '@/context/SiteContext';
import { api, type EventItem } from '@/lib/api';
import { EmptyDatabaseState } from '@/components/ui';

export function EventsPage() {
  const { events, refreshAll, t, loading: isLoading } = useSiteData();
  const types = [t('सर्व', 'All'), ...Array.from(new Set(events.map(e => e.type)))];
  const [selectedType, setSelectedType] = useState(t('सर्व', 'All'));

  const [modalEvent, setModalEvent] = useState<EventItem | null>(null);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [participantsCount, setParticipantsCount] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const filteredEvents =
    selectedType === t('सर्व', 'All') ? events : events.filter(e => e.type === selectedType);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalEvent) return;
    setSubmitting(true);
    setErrorMsg(null);

    try {
      const res = await api.registerForEvent({
        eventId: String(modalEvent.id),
        eventTitle: modalEvent.title,
        fullName: fullName.trim(),
        phone: phone.trim(),
        email: email.trim(),
        participantsCount,
      });
      setSuccessMsg(res.message);
      setFullName('');
      setPhone('');
      setEmail('');
      setParticipantsCount(1);
      await refreshAll();
    } catch (err: any) {
      setErrorMsg(err.message || t('नोंदणी करताना अडचण आली.', 'Error during registration.'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-[#F9F2E3] min-h-screen pt-[68px]">
      <Helmet>
        <title>{t('मोहिमा व कार्यक्रम | गडकिल्ले', 'Events & Campaigns | Gadkille')}</title>
      </Helmet>
      
      <div className="bg-[#1A1008] py-20 text-center">
        <div className="max-w-2xl mx-auto px-6">
          <div className="inline-flex items-center gap-2 mb-4 font-cinzel text-xs uppercase tracking-widest text-[#D4A955]">
            <span className="w-6 h-px bg-[#B58A45]" /> {t('आगामी कार्यक्रम', 'Upcoming Events')}{' '}
            <span className="w-6 h-px bg-[#B58A45]" />
          </div>
          <h1 className="font-serif text-4xl sm:text-5xl font-black text-[#F3E8D0] mb-4">
            {t('मोहिमा व कार्यक्रम', 'Events & Campaigns')}
          </h1>
          <p className="text-[rgba(243,232,208,0.6)]">
            {t('स्वच्छता, संवर्धन, व्याख्याने आणि सांस्कृतिक कार्यक्रमांत सहभागी व्हा.', 'Join us in cleanliness drives, conservation efforts, lectures, and cultural events.')}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="border-b border-[#E8D5A3] bg-white sticky top-[68px] z-30">
        <div className="max-w-[1200px] mx-auto px-6 py-3 flex flex-wrap gap-2">
          {types.map(type => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
                selectedType === type
                  ? 'bg-[#A84A20] border-[#A84A20] text-white'
                  : 'border-[#E8D5A3] text-[#6E5945] hover:border-[#A84A20] hover:text-[#A84A20]'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-6 py-12">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div key={n} className="bg-white rounded-2xl h-[350px] animate-pulse border border-[#E8D5A3]">
                <div className="h-48 bg-[#E8D5A3]/50 rounded-t-2xl"></div>
                <div className="p-5 space-y-3">
                  <div className="h-6 bg-[#E8D5A3]/50 rounded w-3/4"></div>
                  <div className="h-4 bg-[#E8D5A3]/50 rounded w-1/2"></div>
                  <div className="h-4 bg-[#E8D5A3]/50 rounded w-full"></div>
                  <div className="h-10 bg-[#E8D5A3]/50 rounded-xl mt-4"></div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredEvents.length === 0 ? (
          <EmptyDatabaseState title={t('कोणताही आगामी कार्यक्रम सापडला नाही', 'No upcoming events found')} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map(event => {
              const pct = Math.min(
                100,
                Math.round((event.registered / Math.max(1, event.capacity)) * 100)
              );
              const full = event.registered >= event.capacity;
              return (
                <div
                  key={event.id}
                  className="bg-white rounded-2xl overflow-hidden border border-[#E8D5A3] shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-200"
                >
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={event.image}
                      alt={event.title}
                      loading="lazy"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute top-3 left-3 bg-[#A84A20] text-white rounded-xl px-3 py-2 text-center">
                      <div className="font-bold text-xl leading-none">{event.dateNum}</div>
                      <div className="font-cinzel text-[9px] uppercase tracking-widest opacity-80">
                        {event.month}
                      </div>
                    </div>
                    <div className="absolute top-3 right-3 px-2.5 py-1 bg-[rgba(26,16,8,0.75)] text-[#D4A955] text-xs font-cinzel rounded-full backdrop-blur-sm">
                      {event.type}
                    </div>
                  </div>
                  <div className="p-5">
                    <h3 className="font-serif font-bold text-[#1A1008] mb-2">{event.title}</h3>
                    <div className="flex items-center gap-2 text-xs text-[#8F7A66] mb-3">
                      <MapPin size={11} /> {event.location} ({event.date})
                    </div>
                    <p className="text-sm text-[#6E5945] mb-4 line-clamp-2">{event.desc}</p>
                    <div className="mb-3">
                      <div className="flex justify-between text-xs text-[#8F7A66] mb-1">
                        <span className="flex items-center gap-1">
                          <Users size={10} /> {event.registered}/{event.capacity}
                        </span>
                        <span
                          className={
                            full ? 'text-red-600 font-semibold' : 'text-green-700 font-semibold'
                          }
                        >
                          {event.status}
                        </span>
                      </div>
                      <div className="w-full bg-[#F3E8D0] rounded-full h-1.5 overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${pct}%`,
                            background: full ? '#dc2626' : '#36583C',
                          }}
                        />
                      </div>
                    </div>
                    <button
                      disabled={full}
                      onClick={() => {
                        setModalEvent(event);
                        setSuccessMsg(null);
                        setErrorMsg(null);
                      }}
                      className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all ${
                        full
                          ? 'bg-[#E8D5A3] text-[#8F7A66] cursor-not-allowed'
                          : 'bg-[#A84A20] text-white hover:bg-[#7A3215]'
                      }`}
                    >
                      {full ? t('नोंदणी पूर्ण', 'Registration Full') : t('नोंदणी करा →', 'Register Now →')}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Registration Modal */}
      {modalEvent && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-7 relative shadow-2xl border border-[#E8D5A3]">
            <button
              onClick={() => setModalEvent(null)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-[#F9F2E3] flex items-center justify-center text-[#1A1008] hover:bg-[#E8D5A3]"
            >
              <X size={16} />
            </button>

            <div className="mb-5">
              <span className="text-xs font-bold text-[#A84A20] uppercase">{modalEvent.type}</span>
              <h3 className="font-serif text-xl font-bold text-[#1A1008] mt-1">
                {modalEvent.title}
              </h3>
              <p className="text-xs text-[#8F7A66] mt-0.5">📍 {modalEvent.location}</p>
            </div>

            {successMsg ? (
              <div className="text-center py-6 space-y-4">
                <div className="w-14 h-14 rounded-full bg-[#e8f5e9] text-[#2e7d32] flex items-center justify-center mx-auto">
                  <CheckCircle2 size={32} />
                </div>
                <p className="font-serif font-bold text-base text-[#1b5e20]">{successMsg}</p>
                <button
                  onClick={() => setModalEvent(null)}
                  className="px-6 py-2.5 rounded-xl bg-[#1A1008] text-white text-xs font-bold"
                >
                  {t('बंद करा', 'Close')}
                </button>
              </div>
            ) : (
              <form onSubmit={handleRegister} className="space-y-3.5">
                {errorMsg && (
                  <div className="p-3 rounded-xl bg-[#ffebee] text-[#b71c1c] text-xs flex items-center gap-2">
                    <AlertCircle size={15} /> <span>{errorMsg}</span>
                  </div>
                )}

                <div>
                  <label htmlFor="reg-fullname" className="block text-xs font-medium text-[#6E5945] mb-1">
                    {t('पूर्ण नाव *', 'Full Name *')}
                  </label>
                  <input
                    id="reg-fullname"
                    type="text"
                    required
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    placeholder={t('आपले नाव', 'Your Name')}
                    className="w-full border-2 border-[#E8D5A3] rounded-xl px-3.5 py-2.5 text-sm text-[#1A1008] focus:border-[#A84A20] focus:outline-none"
                  />
                </div>

                <div>
                  <label htmlFor="reg-phone" className="block text-xs font-medium text-[#6E5945] mb-1">
                    {t('मोबाईल क्रमांक *', 'Mobile Number *')}
                  </label>
                  <input
                    id="reg-phone"
                    type="tel"
                    required
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="+91 9876543210"
                    className="w-full border-2 border-[#E8D5A3] rounded-xl px-3.5 py-2.5 text-sm text-[#1A1008] focus:border-[#A84A20] focus:outline-none"
                  />
                </div>

                <div>
                  <label htmlFor="reg-email" className="block text-xs font-medium text-[#6E5945] mb-1">
                    {t('ईमेल पत्ता *', 'Email Address *')}
                  </label>
                  <input
                    id="reg-email"
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full border-2 border-[#E8D5A3] rounded-xl px-3.5 py-2.5 text-sm text-[#1A1008] focus:border-[#A84A20] focus:outline-none"
                  />
                </div>

                <div>
                  <label htmlFor="reg-count" className="block text-xs font-medium text-[#6E5945] mb-1">
                    {t('सहभागी संख्या', 'Number of Participants')}
                  </label>
                  <input
                    id="reg-count"
                    type="number"
                    min={1}
                    max={10}
                    value={participantsCount}
                    onChange={e => setParticipantsCount(Number(e.target.value))}
                    className="w-full border-2 border-[#E8D5A3] rounded-xl px-3.5 py-2.5 text-sm text-[#1A1008] focus:border-[#A84A20] focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3.5 rounded-xl font-bold text-white btn-shimmer text-xs shadow-lg flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <Loader2 size={16} className="animate-spin" /> {t('नोंदणी होत आहे...', 'Registering...')}
                    </>
                  ) : (
                    `✅ ${t('सहभाग निश्चित करा', 'Confirm Participation')}`
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
