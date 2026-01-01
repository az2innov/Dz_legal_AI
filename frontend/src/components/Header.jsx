import React from 'react';
import { useTranslation } from 'react-i18next';
import { Sun, Moon, Languages, Menu } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';

const Header = () => {
  const { t, i18n } = useTranslation();
  const { theme, toggleTheme } = useTheme();

  const toggleLanguage = () => {
    const newLang = i18n.language === 'fr' ? 'ar' : 'fr';
    i18n.changeLanguage(newLang);
    document.documentElement.dir = newLang === 'ar' ? 'rtl' : 'ltr';
  };

  return (
    <header className="h-16 bg-white dark:bg-dark-card border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-4 sm:px-6 transition-colors duration-200">
      
      <button className="md:hidden p-2 text-gray-600 dark:text-gray-300">
        <Menu size={24} />
      </button>

      {/* --- MODIFICATION ICI : Alignement au début (Start) --- */}
      {/* 'justify-start' pousse le texte vers le début (Gauche en FR, Droite en AR) */}
      <div className="flex-1 px-4 flex items-center justify-start"> 
        <h1 className="text-sm sm:text-base font-bold text-primary-900 dark:text-primary-100 text-start truncate">
          {t('pages.home.welcome')}
        </h1>
      </div>
      {/* ----------------------------------------------------- */}

      <div className="flex items-center gap-2 sm:gap-4">
        <button 
          onClick={toggleLanguage}
          className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 transition-colors font-medium text-sm"
        >
          <Languages size={18} />
          <span className="hidden sm:inline">{i18n.language === 'fr' ? 'العربية' : 'Français'}</span>
        </button>

        <button 
          onClick={toggleTheme}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 transition-colors"
        >
          {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        <div className="h-9 w-9 rounded-full bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 flex items-center justify-center font-bold border border-primary-200 dark:border-primary-800">
          A
        </div>
      </div>
    </header>
  );
};

export default Header;