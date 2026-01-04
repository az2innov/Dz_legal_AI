import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Globe, ArrowRight } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';

const PublicNavbar = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const toggleLanguage = () => {
    const newLang = i18n.language === 'fr' ? 'ar' : 'fr';
    i18n.changeLanguage(newLang);
    document.documentElement.dir = newLang === 'ar' ? 'rtl' : 'ltr';
  };

  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

  return (
    <nav className="w-full z-50 border-b border-gray-800 bg-[#0f172a]/90 backdrop-blur-md sticky top-0">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">

        {/* LOGO (Sert d'Accueil) */}
        <div className="flex items-center gap-3 cursor-pointer group" onClick={() => navigate('/')}>
          <img
            src="/logo_w.png"
            alt="Dz Legal AI"
            className="h-10 w-auto object-contain transition-transform group-hover:scale-105"
          />
          <span className="text-xl font-bold text-white tracking-tight">Dz Legal AI</span>
        </div>

        {/* LIENS ET ACTIONS */}
        <div className="flex items-center gap-6">
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-300">

            {/* Liens de navigation complets */}
            <a href="/#features" className="hover:text-white transition-colors hover:underline underline-offset-4">
              {t('landing.features')}
            </a>

            <button onClick={() => navigate('/texts')} className="hover:text-white transition-colors hover:underline underline-offset-4 flex items-center gap-1">
              {/* Icône optionnelle si souhaitée, sinon juste texte */}
              {t('nav.texts') || "Lois"}
            </button>

            <button onClick={() => navigate('/pricing')} className="hover:text-white transition-colors hover:underline underline-offset-4">
              {t('landing.pricing')}
            </button>

            <button onClick={() => navigate('/faq')} className="hover:text-white transition-colors hover:underline underline-offset-4">
              {t('landing.faq')}
            </button>
          </div>

          <div className="h-6 w-px bg-gray-700 hidden md:block"></div>

          <button onClick={toggleLanguage} className="text-gray-400 hover:text-white transition-colors flex items-center gap-2 text-sm font-medium">
            <Globe size={18} />
            <span className="hidden sm:inline">{i18n.language === 'fr' ? 'العربية' : 'Français'}</span>
          </button>

          {!isAuthPage && (
            <button
              onClick={() => navigate('/login')}
              className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2 rounded-full text-sm font-medium transition-all shadow-lg shadow-blue-900/20 flex items-center gap-2"
            >
              {t('landing.cta_login')}
              <ArrowRight size={16} className={i18n.language === 'ar' ? 'rotate-180' : ''} />
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default PublicNavbar;