const fs = require('fs');

let content = fs.readFileSync('src/pages/HomePage.tsx', 'utf-8');

content = content.replace(
  "import { useSiteData } from '@/context/SiteContext';",
  "import { Helmet } from 'react-helmet-async';\nimport { useSiteData } from '@/context/SiteContext';"
);

content = content.replace(
  "const { settings, forts, projects, events, t } = useSiteData();",
  "const { settings, forts, projects, events, loading, t } = useSiteData();"
);

content = content.replace(
  "return (\n    <div>",
  "return (\n    <div>\n      <Helmet>\n        <title>{t('मुखपृष्ठ', 'Home')} | गडकिल्ले संवर्धन</title>\n        <meta name=\"description\" content={t('गडकिल्ले संवर्धन प्रतिष्ठान', 'Gadkille Sanvardhan Pratishthan')} />\n      </Helmet>"
);

// Spotlight
content = content.replace(
  "या महिन्याचा किल्ला",
  "{t('या महिन्याचा किल्ला', 'Fort of the Month')}"
);
content = content.replace(
  "प्रमुख वैशिष्ट्ये",
  "{t('प्रमुख वैशिष्ट्ये', 'Key Features')}"
);
content = content.replace(
  "गडाची संपूर्ण माहिती पहा",
  "{t('गडाची संपूर्ण माहिती पहा', 'View Full Fort Details')}"
);

// Featured forts
content = content.replace(
  "महाराष्ट्राचे गौरवशाली किल्ले",
  "{t('महाराष्ट्राचे गौरवशाली किल्ले', 'Glorious Forts of Maharashtra')}"
);
content = content.replace(
  "सर्व किल्ले पहा",
  "{t('सर्व किल्ले पहा', 'View All Forts')}"
);
content = content.replace(
  "अधिक माहिती",
  "{t('अधिक माहिती', 'More Info')}"
);

// Projects
content = content.replace(
  "चालू संवर्धन प्रकल्प",
  "{t('चालू संवर्धन प्रकल्प', 'Ongoing Conservation Projects')}"
);
content = content.replace(
  "आमचे चालू संवर्धन कार्य",
  "{t('आमचे चालू संवर्धन कार्य', 'Our Ongoing Conservation Work')}"
);
content = content.replace(
  "सर्व प्रकल्प",
  "{t('सर्व प्रकल्प', 'All Projects')}"
);
content = content.replace(
  '<span className="text-white/40 text-[12px]">प्रगती</span>',
  '<span className="text-white/40 text-[12px]">{t(\'प्रगती\', \'Progress\')}</span>'
);

// Events
content = content.replace(
  "आगामी कार्यक्रम",
  "{t('आगामी कार्यक्रम', 'Upcoming Events')}"
);
content = content.replace(
  "येत्या मोहिमा व कार्यक्रम",
  "{t('येत्या मोहिमा व कार्यक्रम', 'Upcoming Drives & Events')}"
);
content = content.replace(
  "सर्व कार्यक्रम",
  "{t('सर्व कार्यक्रम', 'All Events')}"
);
content = content.replace(
  "नोंदणी",
  "{t('नोंदणी', 'Registered')}"
);
content = content.replace(
  "'📋 तपशील पहा' : '✅ नोंदणी करा'",
  "full ? t('📋 तपशील पहा', '📋 View Details') : t('✅ नोंदणी करा', '✅ Register Now')"
);

// Volunteering
content = content.replace(
  "आमच्यासोबत या",
  "{t('आमच्यासोबत या', 'Join Us')}"
);
content = content.replace(
  "महाराष्ट्राच्या वारशाचे <span className=\"text-[#D4A955]\">रक्षणकर्ते</span> व्हा",
  "{t('महाराष्ट्राच्या वारशाचे', 'Become a')} <span className=\"text-[#D4A955]\">{t('रक्षणकर्ते', 'Protector')}</span> {t('व्हा', 'of Maharashtra\\'s Heritage')}"
);
content = content.replace(
  "दर महिन्याला किल्ला संवर्धन मोहिमांमध्ये सहभागी व्हा किंवा देणगी देऊन या पवित्र कार्याला बळ द्या.",
  "{t('दर महिन्याला किल्ला संवर्धन मोहिमांमध्ये सहभागी व्हा किंवा देणगी देऊन या पवित्र कार्याला बळ द्या.', 'Participate in monthly fort conservation drives or empower this noble cause by donating.')}"
);
content = content.replace(
  "स्वयंसेवक नोंदणी करा",
  "{t('स्वयंसेवक नोंदणी करा', 'Register as Volunteer')}"
);
content = content.replace(
  "❤️ आता देणगी द्या",
  "❤️ {t('आता देणगी द्या', 'Donate Now')}"
);

// Loading states before map
content = content.replace(
  "{displayForts.length === 0 ?",
  "loading ? (\n            <div className=\"grid grid-cols-1 md:grid-cols-3 gap-6\">\n              {[1, 2, 3].map(i => (\n                <div key={i} className=\"bg-white rounded-2xl h-96 animate-pulse border border-[#E8D5A3]/60\" />\n              ))}\n            </div>\n          ) : displayForts.length === 0 ?"
);

content = content.replace(
  "{projects.length === 0 ?",
  "loading ? (\n            <div className=\"grid grid-cols-1 sm:grid-cols-2 gap-5\">\n              {[1, 2].map(i => (\n                <div key={i} className=\"bg-white/10 rounded-2xl h-52 animate-pulse\" />\n              ))}\n            </div>\n          ) : projects.length === 0 ?"
);

content = content.replace(
  "{upcomingEvents.length === 0 ?",
  "loading ? (\n            <div className=\"grid grid-cols-1 md:grid-cols-3 gap-6\">\n              {[1, 2, 3].map(i => (\n                <div key={i} className=\"bg-white rounded-2xl h-80 animate-pulse border border-[#E8D5A3]/60\" />\n              ))}\n            </div>\n          ) : upcomingEvents.length === 0 ?"
);

fs.writeFileSync('src/pages/HomePage.tsx', content);
