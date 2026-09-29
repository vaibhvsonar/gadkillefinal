import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import {
  api,
  type SiteSettings,
  type Fort,
  type EventItem,
  type ConservationProject,
  type NewsArticle,
  type GalleryItem,
} from '@/lib/api';
import { applyLanguageToDOM, type Language } from '@/lib/i18n';

const DEFAULT_SETTINGS: SiteSettings = {
  nameMarathi: 'गड-किल्ले संवर्धन प्रतिष्ठान',
  nameEnglish: 'Gadkille Sanvardhan Pratishthan',
  state: 'महाराष्ट्र राज्य',
  founded: '२०११',
  founder: 'श्री. योगेश सोनवणे',
  president: 'श्री. अभिषेक नवले',
  address: 'गडकिल्ले-५१३, अथर्व कॉम्प्लेक्स, कृष्णा चौक, पिंपळे गुरव, पुणे – ४११०६१',
  phone1: '90496 87970',
  phone2: '',
  email: 'gadkille.sanvardhan1630@gmail.com',
  facebook: 'https://www.facebook.com/gadkillesanvardhanpratishthan',
  motto: 'गड जपूया • इतिहास जपूया • वारसा पुढील पिढीकडे नेऊया',
  mission: 'महाराष्ट्रातील गड-किल्ल्यांचे संवर्धन, संशोधन व जनजागृती',
  bankName: 'State Bank of India',
  bankAccount: 'XXXX XXXX XXXX',
  bankIfsc: 'SBIN0XXXXXX',
  upiId: 'gadkille@sbi',
  statForts: 0,
  statCampaigns: 0,
  statVolunteers: 0,
  statEvents: 0,
  statTrees: 0,
};

interface SiteContextValue {
  settings: SiteSettings;
  forts: Fort[];
  events: EventItem[];
  projects: ConservationProject[];
  news: NewsArticle[];
  gallery: GalleryItem[];
  loading: boolean;
  backendConnected: boolean;
  refreshAll: () => Promise<void>;
  lang: Language;
  setLang: (lang: Language) => void;
  toggleLang: () => void;
  t: (mr: string, en: string) => string;
}

const SiteContext = createContext<SiteContextValue>({
  settings: DEFAULT_SETTINGS,
  forts: [],
  events: [],
  projects: [],
  news: [],
  gallery: [],
  loading: true,
  backendConnected: false,
  refreshAll: async () => {},
  lang: 'mr',
  setLang: () => {},
  toggleLang: () => {},
  t: (mr: string) => mr,
});

export function SiteProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SETTINGS);
  const [forts, setForts] = useState<Fort[]>([]);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [projects, setProjects] = useState<ConservationProject[]>([]);
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [backendConnected, setBackendConnected] = useState(false);

  const [lang, setLangState] = useState<Language>(() => {
    const saved = localStorage.getItem('gsp_lang');
    return saved === 'en' ? 'en' : 'mr';
  });

  const setLang = useCallback((nextLang: Language) => {
    localStorage.setItem('gsp_lang', nextLang);
    setLangState(nextLang);
  }, []);

  const toggleLang = useCallback(() => {
    setLang(lang === 'mr' ? 'en' : 'mr');
  }, [lang, setLang]);

  const t = useCallback(
    (mr: string, en: string) => (lang === 'en' ? en : mr),
    [lang]
  );

  const refreshAll = useCallback(async () => {
    setLoading(true);
    try {
      const [sRes, fRes, eRes, pRes, nRes, gRes] = await Promise.allSettled([
        api.getSettings(),
        api.getForts(),
        api.getEvents(),
        api.getProjects(),
        api.getNews(),
        api.getGallery(),
      ]);

      let anySuccess = false;
      if (sRes.status === 'fulfilled') {
        setSettings(sRes.value);
        anySuccess = true;
      }
      if (fRes.status === 'fulfilled') {
        setForts(fRes.value);
        anySuccess = true;
      }
      if (eRes.status === 'fulfilled') {
        setEvents(eRes.value);
        anySuccess = true;
      }
      if (pRes.status === 'fulfilled') {
        setProjects(pRes.value);
        anySuccess = true;
      }
      if (nRes.status === 'fulfilled') {
        setNews(nRes.value);
        anySuccess = true;
      }
      if (gRes.status === 'fulfilled') {
        setGallery(gRes.value);
        anySuccess = true;
      }
      setBackendConnected(anySuccess);
    } catch {
      setBackendConnected(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  useEffect(() => {
    document.documentElement.lang = lang;
    applyLanguageToDOM(lang);

    let rafId: number | null = null;
    const observer = new MutationObserver(() => {
      if (rafId !== null) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        applyLanguageToDOM(lang);
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    return () => {
      if (rafId !== null) cancelAnimationFrame(rafId);
      observer.disconnect();
    };
  }, [lang]);

  return (
    <SiteContext.Provider
      value={{
        settings,
        forts,
        events,
        projects,
        news,
        gallery,
        loading,
        backendConnected,
        refreshAll,
        lang,
        setLang,
        toggleLang,
        t,
      }}
    >
      {children}
    </SiteContext.Provider>
  );
}

export function useSiteData() {
  return useContext(SiteContext);
}
