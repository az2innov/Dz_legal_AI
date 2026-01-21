import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import authService from '../services/authService';
import { useTranslation } from 'react-i18next';
import { Lock, Mail, Loader2, Languages, ShieldCheck } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';

const LoginPage = () => {
  const [step, setStep] = useState(1);
  const [userId, setUserId] = useState(null);
  const [whatsappUsed, setWhatsappUsed] = useState(null);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { theme } = useTheme();

  const toggleLanguage = () => {
    const newLang = i18n.language === 'fr' ? 'ar' : 'fr';
    i18n.changeLanguage(newLang);
    document.documentElement.dir = newLang === 'ar' ? 'rtl' : 'ltr';
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault(); setError(''); setIsLoading(true);
    try {
      const response = await authService.login(email, password);
      if (response.status === '2fa_required') {
        setUserId(response.userId);
        setWhatsappUsed(response.whatsappNumber);
        setStep(2);
      }
      else if (response.status === 'success') { window.location.href = '/'; }
      else { setError("Réponse inattendue"); }
    } catch (err) {
      if (err.response?.data?.error) setError(err.response.data.error);
      else setError(t('auth.error_login'));
    } finally { setIsLoading(false); }
  };

  const handleCodeSubmit = async (e) => {
    e.preventDefault(); setError(''); setIsLoading(true);
    try {
      const response = await authService.verify2FA(userId, code);
      if (response.status === 'success') window.location.href = '/';
    } catch (err) {
      setError(i18n.language === 'ar' ? 'الرمز غير صحيح' : 'Code incorrect');
    } finally { setIsLoading(false); }
  };

  // Classe CSS pour les inputs (Texte noir forcé en mode clair)
  const inputClass = "w-full pl-10 pr-4 rtl:pr-10 rtl:pl-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none transition-all placeholder-gray-400";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-dark-bg p-4 relative">

      <button onClick={toggleLanguage} className="absolute top-4 left-4 flex items-center gap-2 px-3 py-2 bg-white dark:bg-dark-card rounded-lg shadow-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-sm text-gray-600 dark:text-gray-300">
        <Languages size={18} />
        {i18n.language === 'fr' ? 'العربية' : 'Français'}
      </button>

      <div className="max-w-md w-full bg-white dark:bg-dark-card rounded-xl shadow-lg p-8 border border-gray-100 dark:border-gray-800 transition-all duration-300">

        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <img
              src={theme === 'dark' ? "/logo_d.png" : "/logo_w.png"}
              alt="Dz Legal AI"
              className="h-32 w-auto object-contain"
            />
          </div>
          <p className="text-gray-500 text-sm">
            {step === 1 ? t('auth.login_title') : (i18n.language === 'ar' ? 'التحقق الأمني' : 'Vérification de sécurité')}
          </p>
        </div>

        {error && <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg text-center animate-pulse">{error}</div>}

        {step === 1 && (
          <form onSubmit={handleLoginSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('auth.email')}</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400 rtl:right-3 rtl:left-auto" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={inputClass}
                  placeholder="email@exemple.com"
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t('auth.password')}
                </label>
                <Link to="/forgot-password" className="text-xs text-primary-600 hover:underline">
                  {t('auth.forgot_title')}
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400 rtl:right-3 rtl:left-auto" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={inputClass}
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary-600 hover:bg-primary-700 text-white font-medium py-2.5 rounded-lg transition-all flex justify-center items-center gap-2"
            >
              {isLoading ? <Loader2 className="animate-spin h-5 w-5" /> : t('auth.login_btn')}
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleCodeSubmit} className="space-y-6">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg text-sm text-blue-700 dark:text-blue-300 flex items-start gap-3">
              <ShieldCheck className="h-5 w-5 flex-shrink-0" />
              <p>
                {whatsappUsed
                  ? (i18n.language === 'ar'
                    ? <>تم إرسال رمز التحقق إلى واتساب الخاص بك (<span dir="ltr">{whatsappUsed}</span>).</>
                    : `Un code de vérification a été envoyé sur votre WhatsApp (${whatsappUsed}).`)
                  : (i18n.language === 'ar'
                    ? `تم إرسال رمز التحقق إلى ${email}.`
                    : `Un code de vérification a été envoyé à ${email}.`)
                }
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {i18n.language === 'ar' ? 'رمز التحقق (6 أرقام)' : 'Code de vérification (6 chiffres)'}
              </label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className={inputClass + " text-center text-2xl tracking-widest font-mono"}
                placeholder="000000"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoading || code.length < 6}
              className="w-full bg-primary-600 hover:bg-primary-700 text-white font-medium py-2.5 rounded-lg transition-all flex justify-center items-center gap-2"
            >
              {isLoading ? <Loader2 className="animate-spin h-5 w-5" /> : (i18n.language === 'ar' ? 'تأكيد' : 'Confirmer')}
            </button>

            <button type="button" onClick={() => setStep(1)} className="w-full text-gray-500 hover:text-gray-700 text-sm mt-2">
              {i18n.language === 'ar' ? 'الرجوع' : 'Retour'}
            </button>
          </form>
        )}

        {step === 1 && (
          <div className="mt-6 text-center text-sm text-gray-500">
            <p>
              {t('auth.no_account')} {' '}
              <Link to="/register" className="text-primary-600 hover:underline font-medium">
                {t('auth.link_register')}
              </Link>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoginPage;