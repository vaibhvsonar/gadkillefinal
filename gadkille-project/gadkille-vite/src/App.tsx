import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { SiteProvider } from '@/context/SiteContext';
import { Navbar, Footer, WhatsAppFloat } from '@/components/Layout';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { ScrollToTop } from '@/components/ScrollToTop';

const HomePage = lazy(() => import('@/pages/HomePage').then(m => ({ default: m.HomePage })));
const FortsPage = lazy(() => import('@/pages/FortsPage').then(m => ({ default: m.FortsPage })));
const FortDetailPage = lazy(() => import('@/pages/FortDetailPage').then(m => ({ default: m.FortDetailPage })));
const ConservationPage = lazy(() => import('@/pages/ConservationPage').then(m => ({ default: m.ConservationPage })));
const EventsPage = lazy(() => import('@/pages/EventsPage').then(m => ({ default: m.EventsPage })));
const EducationPage = lazy(() => import('@/pages/EducationPage').then(m => ({ default: m.EducationPage })));
const VolunteerPage = lazy(() => import('@/pages/VolunteerPage').then(m => ({ default: m.VolunteerPage })));
const CertificatePage = lazy(() => import('@/pages/CertificatePage').then(m => ({ default: m.CertificatePage })));
const GalleryPage = lazy(() => import('@/pages/GalleryPage').then(m => ({ default: m.GalleryPage })));
const MapPage = lazy(() => import('@/pages/MapPage').then(m => ({ default: m.MapPage })));
const AboutPage = lazy(() => import('@/pages/AboutPage').then(m => ({ default: m.AboutPage })));
const NewsPage = lazy(() => import('@/pages/PublicPages').then(m => ({ default: m.NewsPage })));
const TransparencyPage = lazy(() => import('@/pages/PublicPages').then(m => ({ default: m.TransparencyPage })));
const ContactPage = lazy(() => import('@/pages/PublicPages').then(m => ({ default: m.ContactPage })));
const DonatePage = lazy(() => import('@/pages/DonatePage').then(m => ({ default: m.DonatePage })));
const DinvisheshPage = lazy(() => import('@/pages/PublicPages').then(m => ({ default: m.DinvisheshPage })));
const OrganizationsPage = lazy(() => import('@/pages/PublicPages').then(m => ({ default: m.OrganizationsPage })));
const OrganizationDetailPage = lazy(() => import('@/pages/PublicPages').then(m => ({ default: m.OrganizationDetailPage })));
const PartnersPage = lazy(() => import('@/pages/PublicPages').then(m => ({ default: m.PartnersPage })));
const AdminPage = lazy(() => import('@/pages/AdminPage').then(m => ({ default: m.AdminPage })));
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage').then(m => ({ default: m.NotFoundPage })));

const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center p-4 bg-parchment">
    <div className="w-16 h-16 rounded-full border-4 border-saffron/20 border-t-saffron animate-spin"></div>
  </div>
);

export default function App() {
  return (
    <HelmetProvider>
      <SiteProvider>
        <BrowserRouter>
          <ScrollToTop />
          <Navbar />
          <main id="main-content" role="main">
            <ErrorBoundary>
              <Suspense fallback={<PageLoader />}>
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/forts" element={<FortsPage />} />
                  <Route path="/forts/:id" element={<FortDetailPage />} />
                  <Route path="/conservation" element={<ConservationPage />} />
                  <Route path="/events" element={<EventsPage />} />
                  <Route path="/education" element={<EducationPage />} />
                  <Route path="/quiz" element={<EducationPage />} />
                  <Route path="/volunteer" element={<VolunteerPage />} />
                  <Route path="/certificate" element={<CertificatePage />} />
                  <Route path="/gallery" element={<GalleryPage />} />
                  <Route path="/map" element={<MapPage />} />
                  <Route path="/about" element={<AboutPage />} />
                  <Route path="/news" element={<NewsPage />} />
                  <Route path="/transparency" element={<TransparencyPage />} />
                  <Route path="/contact" element={<ContactPage />} />
                  <Route path="/donate" element={<DonatePage />} />
                  <Route path="/dinvishesh" element={<DinvisheshPage />} />
                  <Route path="/organizations" element={<OrganizationsPage />} />
                  <Route path="/organizations/:id" element={<OrganizationDetailPage />} />
                  <Route path="/partners" element={<PartnersPage />} />
                  <Route path="/admin" element={<AdminPage />} />
                  <Route path="*" element={<NotFoundPage />} />
                </Routes>
              </Suspense>
            </ErrorBoundary>
          </main>
          <Footer />
          <WhatsAppFloat />
        </BrowserRouter>
      </SiteProvider>
    </HelmetProvider>
  );
}
