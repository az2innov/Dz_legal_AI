import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import authService from '../services/authService';
import { useTranslation } from 'react-i18next';
import { Mail, Loader2, ArrowLeft, CheckCircle } from 'lucide-react';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle'); // idle, loading, success, error
  const { t, i18n } = useTranslation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');
    try {
      await authService.forgotPassword(email);
      setStatus('success');
    } catch (err) {
      console.error(err);
      setStatus('error');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4 transition-colors duration-200">
      <div className="max-w-md w-full bg-white dark:bg-dark-card rounded-xl shadow-lg p-8 border border-gray-100 dark:border-gray-800">
        
        <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-primary-600 mb-2">
                {t('auth.forgot_title')}
            </h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
                {t('auth.forgot_desc')}
            </p>
        </div>

        {status === 'success' ? (
          <div className="bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 p-6 rounded-lg text-center border border-green-200 dark:border-green-800">
            <CheckCircle className="h-12 w-12 mx-auto mb-3" />
            <p className="font-medium">{t('auth.email_sent')}</p>
            <Link to="/login" className="mt-4 inline-block text-sm font-bold hover:underline">
                {t('auth.back_login')}
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('auth.email')}
              </label>
              <div className="relative">
                <Mail className={`absolute top-3 h-5 w-5 text-gray-400 ${i18n.language === 'ar' ? 'right-3' : 'left-3'}`} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  // CORRECTION : Ajout de text-gray-900 pour que le texte soit visible en mode clair
                  className={`w-full py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none transition-all ${i18n.language === 'ar' ? 'pr-10 pl-4' : 'pl-10 pr-4'}`}
                  placeholder="exemple@email.com"
                  required
                />
              </div>
            </div>

            {status === 'error' && (
                <p className="text-red-500 text-sm text-center">Une erreur est survenue. Réessayez.</p>
            )}

            <button
              type="submit"
              disabled={status === 'loading'}
              className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 rounded-lg transition-all flex justify-center items-center gap-2 shadow-lg shadow-primary-600/20"
            >
              {status === 'loading' ? <Loader2 className="animate-spin" /> : t('auth.send_link')}
            </button>

            <div className="text-center mt-4">
                <Link to="/login" className="text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 flex items-center justify-center gap-1 transition-colors">
                    <ArrowLeft size={14} className={i18n.language === 'ar' ? 'rotate-180' : ''}/>
                    {t('auth.back_login')}
                </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPasswordPage;