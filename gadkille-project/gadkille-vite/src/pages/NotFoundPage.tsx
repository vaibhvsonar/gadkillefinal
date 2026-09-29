import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { Map, Home } from 'lucide-react';
import { useSiteData } from '@/context/SiteContext';

export function NotFoundPage() {
  const { t } = useSiteData();

  return (
    <div className="min-h-[70vh] bg-parchment flex flex-col items-center justify-center p-4 text-center font-body">
      <Helmet>
        <title>404 - गडकिल्ले संवर्धन</title>
      </Helmet>

      <div className="max-w-2xl w-full">
        <h1 className="text-8xl md:text-9xl font-accent font-bold text-saffron mb-4 opacity-90 tracking-widest">
          404
        </h1>
        
        <h2 className="text-3xl md:text-4xl font-heading font-bold text-charcoal mb-4">
          {t('हे पृष्ठ सापडले नाही', 'Page Not Found')}
        </h2>
        
        <p className="text-xl text-stone mb-10 max-w-md mx-auto">
          {t('या किल्ल्यापर्यंतचा मार्ग सापडला नाही', 'The path to this fort could not be found')}
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="/"
            className="flex items-center justify-center gap-2 w-full sm:w-auto px-8 py-3 bg-saffron text-ivory rounded font-medium hover:bg-saffron-dark transition-colors duration-200"
          >
            <Home className="w-5 h-5" />
            <span>{t('मुखपृष्ठावर जा', 'Go to Home')}</span>
          </Link>
          
          <Link
            to="/forts"
            className="flex items-center justify-center gap-2 w-full sm:w-auto px-8 py-3 border-2 border-gold text-charcoal rounded font-medium hover:bg-gold/10 transition-colors duration-200"
          >
            <Map className="w-5 h-5" />
            <span>{t('गडकिल्ले पहा', 'Explore Forts')}</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
