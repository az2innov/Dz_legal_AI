import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import authService from '../services/authService';
import { useTranslation } from 'react-i18next';
import { Mail, ArrowLeft, Loader2, CheckCircle } from 'lucide-react';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle'); // idle, loading, success, error
  const { t } = useTranslation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');
    try {
      await authService.forgotPassword(email);
      // On affiche le succès même si l'email n'existe pas (sécurité)
      setStatus('success');
    } catch (err) {
      setStatus('error');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-dark-bg p-4">
      <div className="max-w-md w-full bg-white dark:bg-dark-card rounded-xl shadow-lg p-8 border border-gray-100 dark:border-gray-800 text-center">
        
        <h2 className="text-2xl font-bold text-primary-600 mb-2">{t('auth.forgot_title')}</h2>
        <p className="text-gray-500 text-sm mb-6">{t('auth.forgot_desc')}</p>

        {status === 'success' ? (
          <div className="bg-green-50 text-green-700 p-4 rounded-lg flex flex-col items-center">
            <CheckCircle className="h-10 w-10 mb-2" />
            <p>{t('auth.email_sent')}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400 rtl:right-3 rtl:left-auto" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 rtl:pr-10 rtl:pl-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-primary-500 outline-none transition-all dark:text-white"
                placeholder="email@exemple.com"
                required
              />
            </div>

            <button
              type="submit"
              disabled={status === 'loading'}
              className="w-full bg-primary-600 hover:bg-primary-700 text-white font-medium py-2.5 rounded-lg transition-all flex justify-center items-center gap-2"
            >
              {status === 'loading' ? <Loader2 className="animate-spin" /> : t('auth.send_link')}
            </button>
          </form>
        )}

        <div className="mt-6">
          <Link to="/login" className="text-gray-500 hover:text-primary-600 text-sm flex items-center justify-center gap-2">
            <ArrowLeft size={16} /> {t('auth.back_login')}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;