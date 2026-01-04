import React from 'react';
import { useTranslation } from 'react-i18next';
import { Sun, Moon, Languages, Menu, Book, ArrowRight } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Header = () => {
  const { t, i18n } = useTranslation();
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const toggleLanguage = () => {
    const newLang = i18n.language === 'fr' ? 'ar' : 'fr';
    i18n.changeLanguage(newLang);
    document.documentElement.dir = newLang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = newLang;
  };

  // Styles de base (Toujours suivre le thème)
  const headerStyle = "bg-white dark:bg-dark-card border-b border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-200";

  const linkStyle = "text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-white";

  // Note: On utilise 'sticky' au lieu de 'fixed' pour éviter que le header ne cache le haut du contenu
  return (
    <header className={`h-20 px-4 sticky top-0 z-50 backdrop-blur-md flex items-center justify-between ${headerStyle}`}>

      {/* 1. GAUCHE : Logo (Ou Titre de la page en cours ?) */}
      {/* On masque le logo ici car il est déjà dans la Sidebar sur Desktop, mais utile sur mobile */}
      <div className="flex items-center gap-2 cursor-pointer flex-shrink-0 md:hidden" onClick={() => navigate('/')}>
        <img
          src={theme === 'dark' ? "/logo_d.png" : "/logo_w.png"}
          alt="Logo"
          className="w-8 h-8 object-contain"
        />
        <span className="font-bold text-lg">Dz Legal AI</span>
      </div>

      {/* Sur Desktop, on affiche le message de bienvenue */}
      <div className="hidden md:block font-bold text-lg text-primary-700 dark:text-primary-400">
        {i18n.language === 'ar' ? "مرحباً بكم في المساعد الذكي للقانون الجزائري." : "Bienvenue dans l'assistant intelligent pour le droit algérien."}
      </div>

      {/* 2. CENTRE : Navigation (Supprimée du Header Dashboard car doublon avec Sidebar) */}
      <div className="flex items-center gap-4 mx-4">
        {/* Vide pour l'instant, ou titre page courante */}
      </div>

      {/* 3. DROITE : Actions */}
      {/* 3. DROITE : Actions */}
      <div className="flex items-center gap-2 flex-shrink-0">

        <button
          onClick={toggleLanguage}
          className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-700 dark:text-gray-200"
        >
          <Languages size={18} />
          <span className="font-medium text-sm hidden sm:inline-block pb-1">
            {i18n.language === 'fr' ? 'العربية' : 'Français'}
          </span>
        </button>

        <button onClick={toggleTheme} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-700 dark:text-gray-200">
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {user ? (
          <div className="h-9 w-9 rounded-full bg-primary-100 text-primary-700 dark:bg-primary-900/50 dark:text-primary-300 flex items-center justify-center font-bold text-sm ml-2 border border-primary-200 dark:border-primary-800">
            {user.full_name?.charAt(0).toUpperCase() || 'U'}
          </div>
        ) : (
          <Link
            to="/login" // Pour le cas où on n'est pas loggé (ne devrait pas arriver ici)
            className="bg-primary-600 hover:bg-primary-500 text-white px-4 py-2 rounded-lg text-xs font-bold transition-all"
          >
            {t('landing.cta_login') || "Connexion"}
          </Link>
        )}

      </div>
    </header>
  );
};

export default Header;