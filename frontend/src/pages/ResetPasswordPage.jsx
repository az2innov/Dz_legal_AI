import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import authService from '../services/authService';
import { useTranslation } from 'react-i18next';
import { Lock, Loader2, CheckCircle, Eye, EyeOff, AlertCircle } from 'lucide-react';

const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token'); 
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState('idle'); 
  const { t } = useTranslation();
  const navigate = useNavigate();

  const validatePassword = (pwd) => /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,}$/.test(pwd);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
        alert("Les mots de passe ne correspondent pas.");
        return;
    }
    if (!validatePassword(password)) {
      alert("Mot de passe trop faible (8 caractères, 1 chiffre, 1 symbole)");
      return;
    }

    setStatus('loading');
    try {
      await authService.resetPassword(token, password);
      setStatus('success');
      setTimeout(() => navigate('/login'), 3000); 
    } catch (err) {
      console.error(err);
      setStatus('error');
    }
  };

  if (!token) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
        <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-2"/>
            <p className="text-gray-800 dark:text-white">Lien invalide ou manquant.</p>
        </div>
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4 transition-colors duration-200">
      <div className="max-w-md w-full bg-white dark:bg-dark-card rounded-xl shadow-lg p-8 border border-gray-100 dark:border-gray-800">
        
        <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-6">
            {t('auth.reset_title')}
        </h2>

        {status === 'success' ? (
          <div className="bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 p-4 rounded-lg flex flex-col items-center text-center border border-green-200 dark:border-green-800">
            <CheckCircle className="h-10 w-10 mb-2" />
            <p>{t('auth.password_updated')}</p>
            <p className="text-sm mt-2 opacity-80">Redirection vers la connexion...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* Nouveau mot de passe */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('auth.new_password')}
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  // CORRECTION : Ajout explicite de text-gray-900
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                  placeholder="••••••••"
                  required
                />
                <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                >
                    {showPassword ? <EyeOff size={20}/> : <Eye size={20}/>}
                </button>
              </div>
            </div>

            {/* Confirmation */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Confirmer le mot de passe
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  // CORRECTION : Ajout explicite de text-gray-900
                  className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            {status === 'error' && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-2 text-red-600 dark:text-red-400 text-sm">
                    <AlertCircle size={16} />
                    Le lien a expiré ou est invalide.
                </div>
            )}

            <button
              type="submit"
              disabled={status === 'loading'}
              className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 rounded-lg transition-all flex justify-center items-center gap-2 shadow-lg shadow-primary-600/20"
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