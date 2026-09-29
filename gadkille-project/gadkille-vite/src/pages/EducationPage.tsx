import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, BookOpen, Download, RotateCcw, ArrowRight } from 'lucide-react';
import { SectionHeader } from '@/components/ui';
import { Helmet } from 'react-helmet-async';
import { useSiteData } from '@/context/SiteContext';

const CHAPTERS_MR = [
  {
    icon: '🏰',
    title: 'मराठा किल्ल्यांचा इतिहास',
    bg: 'from-[#1A1008] to-[#2e1e0f]',
    lessons: [
      { title: 'किल्ल्यांचे प्रकार (गिरीदुर्ग, जलदुर्ग, भुईकोट)', done: true },
      { title: 'शिवकाळातील किल्ले व दुर्गनीती', done: true },
      { title: 'मराठा स्थापत्यशैली व बालेकिल्ला रचना', done: true },
      { title: 'किल्ल्यांचे रक्षण व पाण्याचे नियोजन', done: false },
      { title: 'सागरी सुरक्षा व नौदल किल्ले', done: false },
    ],
  },
  {
    icon: '⚔️',
    title: 'मराठा योद्धे आणि युद्धे',
    bg: 'from-[#1A1008] to-[#2e1e0f]',
    lessons: [
      { title: 'छत्रपती शिवाजी महाराज — हिंदवी स्वराज्य', done: true },
      { title: 'नरवीर तानाजी मालुसरे — सिंहगड मोहीम', done: true },
      { title: 'मावळे — गनिमी काव्याचे अद्वितीय तंत्र', done: false },
      { title: 'प्रतापगड, पावनखिंड व साल्हेरच्या लढाया', done: false },
      { title: 'मराठा आरमार — सरखेल कान्होजी आंग्रे', done: false },
    ],
  },
  {
    icon: '🛠️',
    title: 'किल्ले संवर्धन विज्ञान',
    bg: 'from-[#1e3020] to-[#2e4a30]',
    lessons: [
      { title: 'पुरातत्त्वीय संवर्धनाची मूलभूत तत्त्वे', done: true },
      { title: 'पारंपारिक चुन्याचे व दगडी बांधकाम तंत्र', done: false },
      { title: 'वनस्पती व ओलसरपणा नियंत्रण', done: false },
      { title: '3D स्कॅनिंग आणि डिजिटल दस्तऐवजीकरण', done: false },
      { title: 'UNESCO जागतिक वारसा मार्गदर्शक तत्त्वे', done: false },
    ],
  },
];

const CHAPTERS_EN = [
  {
    icon: '🏰',
    title: 'History of Maratha Forts',
    bg: 'from-[#1A1008] to-[#2e1e0f]',
    lessons: [
      { title: 'Types of Forts (Hill, Sea, Land)', done: true },
      { title: 'Forts in the Shivaji Era and Strategy', done: true },
      { title: 'Maratha Architecture and Citadel Layout', done: true },
      { title: 'Fort Defense and Water Management', done: false },
      { title: 'Coastal Security and Naval Forts', done: false },
    ],
  },
  {
    icon: '⚔️',
    title: 'Maratha Warriors and Battles',
    bg: 'from-[#1A1008] to-[#2e1e0f]',
    lessons: [
      { title: 'Chhatrapati Shivaji Maharaj — Hindavi Swarajya', done: true },
      { title: 'Tanaji Malusare — Sinhagad Campaign', done: true },
      { title: 'Mavlas — Unique Guerrilla Tactics', done: false },
      { title: 'Battles of Pratapgad, Pavankhind, and Salher', done: false },
      { title: 'Maratha Navy — Sarkhel Kanhoji Angre', done: false },
    ],
  },
  {
    icon: '🛠️',
    title: 'Fort Conservation Science',
    bg: 'from-[#1e3020] to-[#2e4a30]',
    lessons: [
      { title: 'Basic Principles of Archaeological Conservation', done: true },
      { title: 'Traditional Lime and Stone Masonry Techniques', done: false },
      { title: 'Vegetation and Moisture Control', done: false },
      { title: '3D Scanning and Digital Documentation', done: false },
      { title: 'UNESCO World Heritage Guidelines', done: false },
    ],
  },
];


const RESOURCES_MR = [
  {
    icon: '📄',
    title: 'महाराष्ट्राचे गडकिल्ले — संपूर्ण माहितीपुस्तिका',
    meta: 'PDF | 4.2 MB | मराठी + English',
  },
  {
    icon: '🗺️',
    title: 'महाराष्ट्र किल्ला नकाशा — High Resolution',
    meta: 'PNG | 12 MB | Print Quality',
  },
  {
    icon: '📖',
    title: 'शिवाजी महाराजांचे किल्ले — ऐतिहासिक अभ्यास व दुर्गनीती',
    meta: 'PDF | 8.1 MB | संशोधन ग्रंथ',
  },
];

const RESOURCES_EN = [
  {
    icon: '📄',
    title: 'Forts of Maharashtra — Complete Guide',
    meta: 'PDF | 4.2 MB | Marathi + English',
  },
  {
    icon: '🗺️',
    title: 'Maharashtra Fort Map — High Resolution',
    meta: 'PNG | 12 MB | Print Quality',
  },
  {
    icon: '📖',
    title: 'Forts of Shivaji Maharaj — Historical Study and Strategy',
    meta: 'PDF | 8.1 MB | Research Book',
  },
];

const QUIZ_QUESTIONS_MR = [
  {
    q: 'छत्रपती शिवाजी महाराजांचे जन्मस्थळ कोणते?',
    opts: ['रायगड', 'सिंहगड', 'शिवनेरी', 'तोरणा'],
    ans: 2,
    exp: 'शिवाजी महाराजांचा जन्म पुणे जिल्ह्यातील जुन्नरजवळील शिवनेरी किल्ल्यावर इ.स. १६३० मध्ये झाला.',
  },
  {
    q: 'तानाजी मालुसरे यांनी कोणत्या किल्ल्यावर रात्री चढाई करून विजय मिळवला?',
    opts: ['राजगड', 'रायगड', 'प्रतापगड', 'सिंहगड (कोंढाणा)'],
    ans: 3,
    exp: 'तानाजी मालुसरे यांनी इ.स. १६७० मध्ये कोंढाणा (सिंहगड) किल्ला जिंकला.',
  },
  {
    q: 'रायगड किल्ल्यावर छत्रपती शिवाजी महाराजांचा राज्याभिषेक कधी झाला?',
    opts: ['इ.स. १६७०', 'इ.स. १६७४', 'इ.स. १६८०', 'इ.स. १६५६'],
    ans: 1,
    exp: '६ जून १६७४ रोजी रायगड किल्ल्यावर छत्रपती शिवाजी महाराजांचा भव्य राज्याभिषेक सोहळा पार पडला.',
  },
  {
    q: 'प्रतापगड युद्धात छत्रपती शिवाजी महाराजांनी कोणाचा पराभव केला?',
    opts: ['शाहिस्तेखान', 'औरंगजेब', 'अफजलखान', 'सिद्दी जोहर'],
    ans: 2,
    exp: 'इ.स. १६५९ मध्ये प्रतापगडाच्या पायथ्याशी छत्रपती शिवाजी महाराजांनी अफजलखानाचा वध केला.',
  },
  {
    q: 'महाराष्ट्रातील कोणता किल्ला प्रसिद्ध जलदुर्ग आहे?',
    opts: ['तोरणा', 'राजगड', 'सिंधुदुर्ग', 'लोहगड'],
    ans: 2,
    exp: 'मालवणजवळील सिंधुदुर्ग किल्ला हा अरबी समुद्रात कुरटे बेटावर इ.स. १६६४ मध्ये बांधण्यात आला.',
  },
  {
    q: 'मराठा साम्राज्याची पहिली राजधानी कोणती होती?',
    opts: ['रायगड', 'राजगड', 'तोरणा', 'पन्हाळा'],
    ans: 1,
    exp: 'राजगड हा छत्रपती शिवाजी महाराजांच्या स्वराज्याची पहिली राजधानी होता (२६ वर्षे).',
  },
  {
    q: 'स्वराज्याचे तोरण बांधण्यासाठी शिवरायांनी सर्वप्रथम कोणता किल्ला घेतला?',
    opts: ['पुरंदर', 'तोरणा (प्रचंडगड)', 'रोहिडा', 'चाकण'],
    ans: 1,
    exp: 'वयाच्या १६ व्या वर्षी शिवरायांनी तोरणा किल्ला जिंकून स्वराज्याचे तोरण बांधले.',
  },
];

const QUIZ_QUESTIONS_EN = [
  {
    q: 'Where was Chhatrapati Shivaji Maharaj born?',
    opts: ['Raigad', 'Sinhagad', 'Shivneri', 'Torna'],
    ans: 2,
    exp: 'Shivaji Maharaj was born at Shivneri Fort near Junnar in Pune district in 1630 CE.',
  },
  {
    q: 'Which fort did Tanaji Malusare capture through a night assault?',
    opts: ['Rajgad', 'Raigad', 'Pratapgad', 'Sinhagad (Kondhana)'],
    ans: 3,
    exp: 'Tanaji Malusare conquered Kondhana (Sinhagad) fort in 1670 CE.',
  },
  {
    q: 'When did Chhatrapati Shivaji Maharaj get crowned at Raigad?',
    opts: ['1670 CE', '1674 CE', '1680 CE', '1656 CE'],
    ans: 1,
    exp: 'On June 6, 1674, Chhatrapati Shivaji Maharaj had a grand coronation ceremony at Raigad.',
  },
  {
    q: 'Who was defeated by Chhatrapati Shivaji Maharaj in the Battle of Pratapgad?',
    opts: ['Shaista Khan', 'Aurangzeb', 'Afzal Khan', 'Siddi Jauhar'],
    ans: 2,
    exp: 'In 1659, Chhatrapati Shivaji Maharaj killed Afzal Khan at the base of Pratapgad.',
  },
  {
    q: 'Which of these is a famous sea fort (Jaldurg) in Maharashtra?',
    opts: ['Torna', 'Rajgad', 'Sindhudurg', 'Lohagad'],
    ans: 2,
    exp: 'Sindhudurg fort near Malvan was built on Kurte island in the Arabian Sea in 1664 CE.',
  },
  {
    q: 'What was the first capital of the Maratha Empire?',
    opts: ['Raigad', 'Rajgad', 'Torna', 'Panhala'],
    ans: 1,
    exp: 'Rajgad was the first capital of Chhatrapati Shivaji Maharaj’s Swarajya (for 26 years).',
  },
  {
    q: 'Which fort did Shivaji Maharaj conquer first to lay the foundation of Swarajya?',
    opts: ['Purandar', 'Torna (Prachandgad)', 'Rohida', 'Chakan'],
    ans: 1,
    exp: 'At the age of 16, Shivaji Maharaj won Torna fort and laid the foundation of Swarajya.',
  },
];

export function EducationPage() {
  const { t } = useSiteData();
  const [qIdx, setQIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedOpt, setSelectedOpt] = useState<number | null>(null);
  const [quizDone, setQuizDone] = useState(false);

  // Use appropriate arrays based on current language
  // Since we don't have direct access to language state, we can use a trick:
  // t() returns different values based on language
  const isMarathi = t('होय', 'Yes') === 'होय';
  const QUIZ_QUESTIONS = isMarathi ? QUIZ_QUESTIONS_MR : QUIZ_QUESTIONS_EN;
  const CHAPTERS = isMarathi ? CHAPTERS_MR : CHAPTERS_EN;
  const RESOURCES = isMarathi ? RESOURCES_MR : RESOURCES_EN;

  const currentQ = QUIZ_QUESTIONS[qIdx];

  const handleSelectOption = (idx: number) => {
    if (selectedOpt !== null) return;
    setSelectedOpt(idx);
    if (idx === currentQ.ans) {
      setScore(s => s + 1);
    }
  };

  const handleNextQuestion = () => {
    if (qIdx + 1 >= QUIZ_QUESTIONS.length) {
      setQuizDone(true);
    } else {
      setQIdx(i => i + 1);
      setSelectedOpt(null);
    }
  };

  const handleRestartQuiz = () => {
    setQIdx(0);
    setScore(0);
    setSelectedOpt(null);
    setQuizDone(false);
  };

  return (
    <div className="bg-[#F9F2E3] min-h-screen pt-[68px]">
      <Helmet>
        <title>{t('शिक्षण केंद्र', 'Education Center')} | Gadkille Savardhan</title>
      </Helmet>
      
      <div className="bg-gradient-to-br from-[#1A1008] to-[#1e3020] py-20 text-center">
        <div className="max-w-2xl mx-auto px-6">
          <div className="inline-flex items-center gap-2 mb-4 font-cinzel text-xs uppercase tracking-widest text-[#D4A955]">
            <span className="w-6 h-px bg-[#B58A45]" /> 📚 {t('शिक्षण व अभ्यास', 'Education & Study')}{' '}
            <span className="w-6 h-px bg-[#B58A45]" />
          </div>
          <h1 className="font-serif text-4xl sm:text-5xl font-black text-[#F3E8D0] mb-4">
            {t('शिक्षण केंद्र', 'Education Center')}
          </h1>
          <p className="text-[rgba(243,232,208,0.7)] max-w-lg mx-auto">
            {t('मराठा इतिहास, किल्ले वास्तुकला आणि संवर्धन विज्ञान — सखोल शिक्षण आणि इतिहास प्रश्नमंजुषा.', 'Maratha history, fort architecture, and conservation science — in-depth education and history quiz.')}
          </p>
        </div>
      </div>

      <div className="max-w-[1150px] mx-auto px-6 py-16 space-y-20">
        {/* Learning Chapters */}
        <section>
          <SectionHeader
            eyebrow={t('शिकण्याचे मार्ग', 'Learning Paths')}
            title={t('अभ्यास अध्याय निवडा', 'Select Study Chapter')}
            subtitle={t('प्रत्येक अध्यायात ऐतिहासिक माहिती, स्थापत्य अभ्यास आणि प्रश्नमंजुषा समाविष्ट आहेत.', 'Each chapter includes historical information, architectural study, and quizzes.')}
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {CHAPTERS.map(ch => (
              <div
                key={ch.title}
                className="bg-white rounded-2xl overflow-hidden border border-[#E8D5A3] shadow-sm hover:shadow-md transition-all flex flex-col h-full"
              >
                <div className={`bg-gradient-to-br ${ch.bg} p-7 text-center`}>
                  <div className="text-5xl mb-3">{ch.icon}</div>
                  <h3 className="font-serif text-lg font-bold text-[#F3E8D0]">{ch.title}</h3>
                </div>
                <div className="p-6 flex-1 flex flex-col">
                  <ul className="divide-y divide-[#F0E6D2] mb-2 flex-1">
                    {ch.lessons.map(lesson => (
                      <li
                        key={lesson.title}
                        className="py-2.5 flex items-center gap-2.5 text-sm"
                      >
                        {lesson.done ? (
                          <CheckCircle2 size={16} className="text-[#36583C] shrink-0" />
                        ) : (
                          <BookOpen size={15} className="text-[#8F7A66] shrink-0" />
                        )}
                        <span
                          className={
                            lesson.done ? 'text-[#1A1008] font-medium' : 'text-[#5C4A35]'
                          }
                        >
                          {lesson.title}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Downloadable Resources */}
        <section>
          <SectionHeader eyebrow={t('संसाधने', 'Resources')} title={t('डाउनलोड करण्यायोग्य साहित्य', 'Downloadable Material')} />
          <div className="space-y-3 max-w-3xl mx-auto">
            {RESOURCES.map(res => (
              <div
                key={res.title}
                className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-5 bg-white rounded-2xl border border-[#E8D5A3] shadow-sm hover:border-[#A84A20] transition-all"
              >
                <div className="text-3xl shrink-0">{res.icon}</div>
                <div className="flex-1">
                  <h4 className="font-serif font-bold text-[#1A1008] text-base">{res.title}</h4>
                  <p className="text-xs text-[#8F7A66] mt-0.5">{res.meta}</p>
                </div>
                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-[#8F7A66] text-[#8F7A66] text-xs font-bold cursor-not-allowed opacity-60">
                  <Download size={14} /> {t('लवकरच उपलब्ध', 'Coming Soon')}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Interactive Quiz */}
        <section id="quiz">
          <SectionHeader
            eyebrow={t('इतिहास प्रश्नमंजुषा', 'History Quiz')}
            title={t('आपले दुर्ग-ज्ञान तपासा', 'Test Your Fort Knowledge')}
            subtitle={t('७ प्रश्नांची उत्तरे द्या आणि डिजिटल गुणवत्ता प्रमाणपत्र मिळवा!', 'Answer 7 questions and get a digital merit certificate!')}
          />

          <div className="bg-white rounded-3xl overflow-hidden border border-[#E8D5A3] shadow-lg max-w-2xl mx-auto">
            <div className="bg-gradient-to-r from-[#1e3020] to-[#2e4a30] p-6 text-white">
              <div className="flex items-center justify-between">
                <h3 className="font-serif text-xl font-bold">{t('मराठा इतिहास क्विझ', 'Maratha History Quiz')}</h3>
                {!quizDone && (
                  <span className="text-xs bg-[rgba(255,255,255,0.15)] px-3 py-1 rounded-full">
                    {t('प्रश्न', 'Question')} {qIdx + 1} / {QUIZ_QUESTIONS.length}
                  </span>
                )}
              </div>
              <div className="h-1.5 bg-[rgba(255,255,255,0.2)] rounded-full mt-4 overflow-hidden">
                <div
                  className="h-full bg-[#D4A955] transition-all duration-300"
                  style={{ width: `${((qIdx + 1) / QUIZ_QUESTIONS.length) * 100}%` }}
                />
              </div>
            </div>

            {quizDone ? (
              <div className="p-10 text-center">
                <div className="text-6xl mb-4">{score >= 5 ? '🏆' : '⭐'}</div>
                <div className="font-serif text-5xl font-black text-[#A84A20] mb-2">
                  {score} / {QUIZ_QUESTIONS.length}
                </div>
                <h4 className="font-serif text-2xl font-bold text-[#1A1008] mb-2">
                  {score >= 5 ? t('उत्कृष्ट! आपण दुर्ग-इतिहास तज्ञ आहात!', 'Excellent! You are a fort-history expert!') : t('चांगला प्रयत्न!', 'Good Effort!')}
                </h4>
                <p className="text-sm text-[#6E5945] max-w-md mx-auto mb-8">
                  {isMarathi 
                    ? `आपण ${QUIZ_QUESTIONS.length} पैकी ${score} योग्य उत्तरे दिलीत.`
                    : `You answered ${score} out of ${QUIZ_QUESTIONS.length} correctly.`}
                </p>
                <div className="flex items-center justify-center gap-4 flex-wrap">
                  <button
                    onClick={handleRestartQuiz}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border-2 border-[#E8D5A3] text-[#1A1008] font-bold text-sm hover:border-[#A84A20]"
                  >
                    <RotateCcw size={16} /> {t('पुन्हा सोडवा', 'Retake Quiz')}
                  </button>
                  <Link
                    to="/certificate"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-white font-bold text-sm btn-shimmer shadow-lg"
                  >
                    📜 {t('प्रमाणपत्र मिळवा', 'Get Certificate')} <ArrowRight size={16} />
                  </Link>
                </div>
              </div>
            ) : (
              <div className="p-8">
                <div className="text-xs font-bold uppercase tracking-wider text-[#A84A20] mb-2">
                  {t('प्रश्न', 'Question')} {qIdx + 1}
                </div>
                <h4 className="font-serif text-xl font-bold text-[#1A1008] mb-6 leading-snug">
                  {currentQ.q}
                </h4>

                <div className="space-y-3">
                  {currentQ.opts.map((opt, idx) => {
                    const isAnswered = selectedOpt !== null;
                    const isCorrect = idx === currentQ.ans;
                    const isChosen = idx === selectedOpt;

                    let btnClass =
                      'border-[#E8D5A3] bg-white text-[#1A1008] hover:border-[#A84A20]';
                    if (isAnswered) {
                      if (isCorrect) {
                        btnClass = 'border-[#36583C] bg-[#e8f5e9] text-[#1b5e20] font-bold';
                      } else if (isChosen) {
                        btnClass = 'border-[#b71c1c] bg-[#ffebee] text-[#b71c1c]';
                      } else {
                        btnClass = 'border-[#E8D5A3] opacity-60';
                      }
                    }

                    return (
                      <button
                        key={opt}
                        disabled={isAnswered}
                        onClick={() => handleSelectOption(idx)}
                        className={`w-full text-left px-5 py-3.5 rounded-xl border-2 text-sm transition-all flex items-center justify-between ${btnClass}`}
                      >
                        <span>{opt}</span>
                        {isAnswered && isCorrect && <span>✅</span>}
                        {isAnswered && isChosen && !isCorrect && <span>❌</span>}
                      </button>
                    );
                  })}
                </div>

                {selectedOpt !== null && (
                  <div
                    className={`mt-6 p-4 rounded-xl text-sm leading-relaxed border-l-4 ${
                      selectedOpt === currentQ.ans
                        ? 'bg-[#e8f5e9] text-[#1b5e20] border-[#2e7d32]'
                        : 'bg-[#fff3e0] text-[#A84A20] border-[#A84A20]'
                    }`}
                  >
                    <strong>{selectedOpt === currentQ.ans ? (isMarathi ? '✅ बरोबर! ' : '✅ Correct! ') : (isMarathi ? '❌ माहिती: ' : '❌ Info: ')}</strong>
                    {currentQ.exp}
                  </div>
                )}

                <div className="mt-6 flex justify-end">
                  {selectedOpt !== null && (
                    <button
                      onClick={handleNextQuestion}
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-white font-bold text-sm btn-shimmer shadow-md"
                    >
                      {qIdx + 1 >= QUIZ_QUESTIONS.length ? t('निकाल पहा 🏆', 'View Results 🏆') : t('पुढील प्रश्न →', 'Next Question →')}
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
