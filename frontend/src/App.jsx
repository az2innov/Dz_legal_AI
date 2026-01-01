import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Loader2, ArrowRight } from 'lucide-react';

// Layout & Context
import MainLayout from './layouts/MainLayout';
import PublicLayout from './layouts/PublicLayout';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import billingService from './services/billingService';

// Components
import Footer from './components/Footer';

// Pages
import ChatPage from './pages/ChatPage'; 
import DocsPage from './pages/DocsPage'; 
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import VerifyEmailPage from './pages/VerifyEmailPage';
import LandingPage from './pages/LandingPage';
import FAQPage from './pages/FAQPage';
import PricingPage from './pages/PricingPage';
import AdminPage from './pages/AdminPage';
import OrganizationPage from './pages/OrganizationPage'; // <-- IMPORT NOUVELLE PAGE

// --- 1. COMPOSANT DE PROTECTION ---
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-dark-bg">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// --- 2. ROUTAGE INTELLIGENT (ACCUEIL) ---
const HomeRoute = () => {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#0f172a]">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            </div>
        );
    }

    if (user) {
        return (
            <MainLayout>
                <DashboardContent />
            </MainLayout>
        );
    }

    return (
        <PublicLayout>
            <LandingPage />
        </PublicLayout>
    );
};

// --- 3. CONTENU DU TABLEAU DE BORD ---
const DashboardContent = () => {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
        const data = await billingService.getUsage();
        if (data) setStats(data);
    };
    fetchStats();
  }, []);

  const getPlanLabel = (planCode) => {
      if (!planCode) return '...';
      return t(`plans.${planCode}`, { defaultValue: planCode }); 
  };

  return (
    <div className="max-w-6xl mx-auto flex flex-col min-h-[calc(100vh-100px)]">
      
      <div className="flex-1">
        {/* En-tête du Dashboard */}
        <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {t('pages.home.title')}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
            {user ? (i18n.language === 'ar' ? `مرحباً، ${user.full_name}` : `Bonjour, ${user.full_name}`) : ''}
            </p>
        </div>

        {/* Cartes de statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            
            {/* --- CARTE ADMIN (Si Admin) --- */}
            {user?.role === 'admin' && (
                <div className="bg-gradient-to-br from-red-600 to-red-800 p-6 rounded-xl shadow-lg text-white transform hover:scale-105 transition-transform cursor-pointer" onClick={() => navigate('/admin')}>
                    <div className="flex justify-between items-start">
                        <div>
                            <h3 className="text-sm font-medium text-red-100 mb-1">Super Admin</h3>
                            <p className="text-2xl font-bold">Gestion</p>
                        </div>
                        <div className="p-2 bg-white/20 rounded-lg">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                        </div>
                    </div>
                    <p className="mt-4 text-xs text-red-100">Gérer les utilisateurs et les abonnements</p>
                </div>
            )}

            {/* Carte 1 : Quota Chat */}
            <div className="bg-white dark:bg-dark-card p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 transition-all hover:shadow-md">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                {t('pages.home.stats_chat')}
            </h3>
            <div className="flex items-end gap-2">
                <p className="text-3xl font-bold text-primary-600">
                    {stats ? stats.chat.used : '-'}
                </p>
                <p className="text-sm text-gray-400 mb-1">
                    / {stats ? (stats.chat.limit > 1000 ? '∞' : stats.chat.limit) : '-'}
                </p>
            </div>
            {stats && stats.chat.limit < 1000 && (
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 mt-3" dir="ltr">
                    <div 
                        className={`h-1.5 rounded-full ${stats.chat.used >= stats.chat.limit ? 'bg-red-500' : 'bg-primary-600'}`} 
                        style={{ width: `${Math.min((stats.chat.used / stats.chat.limit) * 100, 100)}%` }}
                    ></div>
                </div>
            )}
            </div>
            
            {/* Carte 2 : Quota Documents */}
            <div className="bg-white dark:bg-dark-card p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 transition-all hover:shadow-md">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                {t('pages.home.stats_doc')}
            </h3>
            <div className="flex items-end gap-2">
                <p className="text-3xl font-bold text-primary-600">
                    {stats ? stats.docs.used : '-'}
                </p>
                <p className="text-sm text-gray-400 mb-1">
                    / {stats ? (stats.docs.limit > 1000 ? '∞' : stats.docs.limit) : '-'}
                </p>
            </div>
            {stats && stats.docs.limit < 1000 && (
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 mt-3" dir="ltr">
                    <div 
                        className={`h-1.5 rounded-full ${stats.docs.used >= stats.docs.limit ? 'bg-red-500' : 'bg-primary-600'}`} 
                        style={{ width: `${Math.min((stats.docs.used / stats.docs.limit) * 100, 100)}%` }}
                    ></div>
                </div>
            )}
            </div>
            
            {/* Carte 3 : Abonnement */}
            <div className="bg-white dark:bg-dark-card p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 transition-all hover:shadow-md flex flex-col justify-between">
            <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                    {t('pages.home.stats_sub')}
                </h3>
                <div className="flex items-center gap-2 mb-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium 
                        ${stats?.plan === 'premium' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300' : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'}`}>
                    {t('status.active')}
                    </span>
                    <p className="text-lg font-bold text-gray-900 dark:text-white capitalize">
                        {stats ? getPlanLabel(stats.plan) : '...'}
                    </p>
                </div>
            </div>
            {stats?.plan !== 'premium' && (
                <button 
                    onClick={() => navigate('/pricing')}
                    className="mt-2 text-xs flex items-center gap-1 text-primary-600 hover:text-primary-700 font-medium hover:underline"
                >
                    {i18n.language === 'ar' ? 'ترقية الخطة' : 'Mettre à niveau'}
                    <ArrowRight size={12} className={i18n.language === 'ar' ? 'rotate-180' : ''} />
                </button>
            )}
            </div>
        </div>

        {/* Zone d'action rapide */}
        <div className="bg-white dark:bg-dark-card p-12 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 text-center min-h-[300px] flex flex-col items-center justify-center transition-colors">
            <div className="p-4 bg-primary-50 dark:bg-primary-900/20 rounded-full mb-6">
            <svg className="w-10 h-10 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            </div>
            <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-3">
            {t('pages.home.ready_title')}
            </h3>
            <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto leading-relaxed">
            {t('pages.home.ready_desc')}
            </p>
        </div>
      </div>

      {/* PIED DE PAGE DANS LE DASHBOARD */}
      <div className="mt-12 opacity-80">
        <Footer />
      </div>

    </div>
  );
};

// --- 4. APPLICATION PRINCIPALE ---
function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* --- ROUTES PUBLIQUES --- */}
          <Route path="/faq" element={<PublicLayout><FAQPage /></PublicLayout>} />
          <Route path="/pricing" element={<PublicLayout><PricingPage /></PublicLayout>} />
          <Route path="/login" element={<PublicLayout><LoginPage /></PublicLayout>} />
          <Route path="/register" element={<PublicLayout><RegisterPage /></PublicLayout>} />
          <Route path="/forgot-password" element={<PublicLayout><ForgotPasswordPage /></PublicLayout>} />
          <Route path="/reset-password" element={<PublicLayout><ResetPasswordPage /></PublicLayout>} />
          <Route path="/verify-email" element={<PublicLayout><VerifyEmailPage /></PublicLayout>} />

          {/* --- ROUTE RACINE --- */}
          <Route path="/" element={<HomeRoute />} />

          {/* --- ROUTES PROTÉGÉES --- */}
          <Route path="/chat" element={<ProtectedRoute><MainLayout><ChatPage /></MainLayout></ProtectedRoute>} />
          <Route path="/documents" element={<ProtectedRoute><MainLayout><DocsPage /></MainLayout></ProtectedRoute>} />
          
          {/* Organisation */}
          <Route path="/organization" element={<ProtectedRoute><MainLayout><OrganizationPage /></MainLayout></ProtectedRoute>} />
          
          {/* Admin */}
          <Route path="/admin" element={<ProtectedRoute><MainLayout><AdminPage /></MainLayout></ProtectedRoute>} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;