import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Globe, ArrowRight, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { useTheme } from '../hooks/useTheme';

const PublicNavbar = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const toggleLanguage = () => {
    const newLang = i18n.language === 'fr' ? 'ar' : 'fr';
    i18n.changeLanguage(newLang);
    document.documentElement.dir = newLang === 'ar' ? 'rtl' : 'ltr';
  };

  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

  return (
    <nav className="w-full z-50 border-b border-gray-800 bg-[#0f172a]/90 backdrop-blur-md sticky top-0">
      <div className="max-w-7xl mx-auto px-6 h-16 md:h-20 flex items-center justify-between">

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
        {/* ACTION BUTTONS & MOBILE TOGGLE */}
        <div className="flex items-center gap-4">

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-300">
            <a href="/#features" className="hover:text-white transition-colors hover:underline underline-offset-4">{t('landing.features')}</a>
            <button onClick={() => navigate('/texts')} className="hover:text-white transition-colors hover:underline underline-offset-4">{t('nav.texts') || "Lois"}</button>
            <button onClick={() => navigate('/pricing')} className="hover:text-white transition-colors hover:underline underline-offset-4">{t('landing.pricing')}</button>
            <button onClick={() => navigate('/faq')} className="hover:text-white transition-colors hover:underline underline-offset-4">{t('landing.faq')}</button>
          </div>

          <div className="h-6 w-px bg-gray-700 hidden md:block"></div>

          {/* Langue Toggle */}
          <button onClick={toggleLanguage} className="text-gray-400 hover:text-white transition-colors flex items-center gap-2 text-sm font-medium">
            <Globe size={18} />
            <span className="hidden sm:inline">{i18n.language === 'fr' ? 'العربية' : 'Français'}</span>
          </button>

          {/* Login Button (Desktop) */}
          {!isAuthPage && (
            <button
              onClick={() => navigate('/login')}
              className="hidden md:flex bg-blue-600 hover:bg-blue-500 text-white px-5 py-2 rounded-full text-sm font-medium transition-all shadow-lg shadow-blue-900/20 items-center gap-2"
            >
              {t('landing.cta_login')}
              <ArrowRight size={16} className={i18n.language === 'ar' ? 'rotate-180' : ''} />
            </button>
          )}

          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden text-gray-300 hover:text-white p-2"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* MOBILE MENU OVERLAY */}
      {isOpen && (
        <div className="md:hidden absolute top-20 left-0 w-full bg-[#0f172a] border-b border-gray-800 p-6 flex flex-col gap-6 shadow-2xl animate-in slide-in-from-top-5">
          <a href="/#features" onClick={() => setIsOpen(false)} className="text-gray-300 hover:text-white text-lg font-medium">{t('landing.features')}</a>
          <button onClick={() => { navigate('/texts'); setIsOpen(false); }} className={`hover:text-white text-lg font-medium text-gray-300 ${i18n.language === 'ar' ? 'text-right' : 'text-left'}`}>{t('nav.texts') || "Lois"}</button>
          <button onClick={() => { navigate('/pricing'); setIsOpen(false); }} className={`hover:text-white text-lg font-medium text-gray-300 ${i18n.language === 'ar' ? 'text-right' : 'text-left'}`}>{t('landing.pricing')}</button>
          <button onClick={() => { navigate('/faq'); setIsOpen(false); }} className={`hover:text-white text-lg font-medium text-gray-300 ${i18n.language === 'ar' ? 'text-right' : 'text-left'}`}>{t('landing.faq')}</button>

          <div className="h-px bg-gray-800 my-2"></div>

          {!isAuthPage && (
            <button
              onClick={() => { navigate('/login'); setIsOpen(false); }}
              className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-3 rounded-xl text-center font-medium w-full flex justify-center items-center gap-2"
            >
              {t('landing.cta_login')}
              <ArrowRight size={18} className={i18n.language === 'ar' ? 'rotate-180' : ''} />
            </button>
          )}
        </div>
      )}
    </nav>
  );
};

export default PublicNavbar;