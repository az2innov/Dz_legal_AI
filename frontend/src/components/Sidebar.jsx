import React from 'react';
import { useTranslation } from 'react-i18next';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, MessageSquare, FileText, LogOut, Shield, Building2, Book } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../hooks/useTheme';

const Sidebar = ({ isOpen, onClose }) => {
  const { t } = useTranslation();
  const { logout, user } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getRoleLabel = (role) => {
    switch (role) {
      case 'admin': return t('auth.role_admin') || 'Administrateur';
      case 'lawyer': return t('auth.role_lawyer') || 'Avocat';
      case 'judge': return t('auth.role_judge') || 'Magistrat';
      case 'notary': return t('auth.role_notary') || 'Notaire';
      case 'bailiff': return t('auth.role_bailiff') || 'Huissier';
      case 'corporate': return t('auth.role_corporate') || 'Juriste';
      case 'expert': return t('auth.role_expert') || 'Expert';
      case 'student': return t('auth.role_student') || 'Étudiant';
      default: return t('auth.role_other') || 'Utilisateur';
    }
  };

  // --- LOGIQUE D'AFFICHAGE DU MENU ---
  let navItems = [];

  if (user?.role === 'admin') {
    // MENU ADMINISTRATEUR (Traduit)
    navItems = [
      { icon: Shield, label: t('nav.admin'), path: '/admin' },
    ];
  } else {
    // MENU UTILISATEUR
    navItems = [
      { icon: LayoutDashboard, label: t('nav.home'), path: '/' },
      { icon: MessageSquare, label: t('nav.chat'), path: '/chat' },
      { icon: FileText, label: t('nav.docs'), path: '/documents' },
      {
        icon: Building2,
        label: user?.organization_id ? t('nav.my_group') : t('nav.create_group'),
        path: '/organization'
      },
    ];
  }

  return (
    <>
      {/* Mobile Overlay Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm md:hidden transition-opacity duration-300"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside className={`
        fixed inset-y-0 ltr:left-0 rtl:right-0 z-40 w-64 bg-white dark:bg-dark-card 
        border-r border-gray-200 dark:border-gray-800 rtl:border-r-0 rtl:border-l
        transform transition-transform duration-300 ease-in-out
        md:static md:!translate-x-0 md:flex flex-col
        ${isOpen ? 'translate-x-0' : 'ltr:-translate-x-full rtl:translate-x-full'}
      `}>

        <div className="h-40 flex items-center justify-center border-b border-gray-100 dark:border-gray-800 p-4">
          <img
            src="/logo_w.png"
            alt="Dz Legal AI"
            className="h-full w-auto object-contain"
            onError={(e) => { e.target.src = "/logo_d.png" }}
          />
        </div>

        {/* NAVIGATION */}
        <nav className="flex-1 py-6 px-3 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-colors ${isActive
                  ? 'bg-primary-50 text-primary-600 dark:bg-primary-900/20 dark:text-primary-500'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                }`
              }
            >
              <item.icon size={20} />
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* FOOTER USER */}
        <div className="p-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/30">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-10 w-10 rounded-full bg-primary-600 text-white flex items-center justify-center font-bold flex-shrink-0">
              {user?.full_name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-bold text-gray-900 dark:text-white truncate">
                {user?.full_name}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 capitalize truncate">
                {getRoleLabel(user?.role)}
              </p>
            </div>
          </div>

          <button onClick={handleLogout} className="flex items-center gap-2 w-full text-sm text-red-600 hover:bg-red-50 p-2 rounded-lg transition-colors">
            <LogOut size={16} /> {t('nav.logout')}
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;