import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import authService from '../services/authService';
import { useTranslation } from 'react-i18next';
import { Lock, Loader2, CheckCircle } from 'lucide-react';

const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token'); // Récupère le token de l'URL
  
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState('idle'); // idle, loading, success, error
  const { t } = useTranslation();
  const navigate = useNavigate();

  // Validation mot de passe (même que register)
  const validatePassword = (pwd) => /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,}$/.test(pwd);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validatePassword(password)) {
      alert("Mot de passe trop faible (8 caractères, 1 chiffre, 1 symbole)");
      return;
    }

    setStatus('loading');
    try {
      await authService.resetPassword(token, password);
      setStatus('success');
      setTimeout(() => navigate('/login'), 3000); // Redirection après 3s
    } catch (err) {
      console.error(err);
      setStatus('error');
    }
  };

  if (!token) return <div className="text-center p-10 text-red-500">Lien invalide (Token manquant).</div>;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-dark-bg p-4">
      <div className="max-w-md w-full bg-white dark:bg-dark-card rounded-xl shadow-lg p-8 border border-gray-100 dark:border-gray-800">
        
        <h2 className="text-2xl font-bold text-center text-primary-600 mb-6">{t('auth.reset_title')}</h2>

        {status === 'success' ? (
          <div className="bg-green-50 text-green-700 p-4 rounded-lg flex flex-col items-center text-center">
            <CheckCircle className="h-10 w-10 mb-2" />
            <p>{t('auth.password_updated')}</p>
            <p className="text-sm mt-2">Redirection vers la connexion...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('auth.new_password')}</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400 rtl:right-3 rtl:left-auto" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 rtl:pr-10 rtl:pl-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-primary-500 outline-none transition-all dark:text-white"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            {status === 'error' && <p className="text-red-500 text-sm text-center">Le lien a expiré ou est invalide.</p>}

            <button
              type="submit"
              disabled={status === 'loading'}
              className="w-full bg-primary-600 hover:bg-primary-700 text-white font-medium py-2.5 rounded-lg transition-all flex justify-center items-center gap-2"
            >
              {status === 'loading' ? <Loader2 className="animate-spin" /> : t('auth.confirm_btn')}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ResetPasswordPage;