import React, { useState } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import { Lock, Mail, User, Briefcase, Loader2, Languages, Building2, MapPin, FileText, MessageCircle } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';
import PhoneInput from '../components/PhoneInput';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    whatsappNumber: '',
    password: '',
    role: 'lawyer', // Par défaut
    // Champs Organisation
    isOrg: false,
    orgName: '',
    orgTaxId: '',
    orgAddress: ''
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { theme } = useTheme();
  const [searchParams] = useSearchParams();
  const inviteToken = searchParams.get('invite');

  const toggleLanguage = () => {
    const newLang = i18n.language === 'fr' ? 'ar' : 'fr';
    i18n.changeLanguage(newLang);
    document.documentElement.dir = newLang === 'ar' ? 'rtl' : 'ltr';
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'role') {
      // Si l'utilisateur choisit "Organisation"
      if (value === 'organization_account') {
        setFormData({ ...formData, role: 'lawyer', isOrg: true });
      } else {
        setFormData({ ...formData, role: value, isOrg: false });
      }
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const validatePassword = (pwd) => /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,}$/.test(pwd);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!validatePassword(formData.password)) {
      setError(i18n.language === 'ar' ? "كلمة المرور ضعيفة..." : "Mot de passe faible (Min 8 chars, 1 chiffre, 1 symbole).");
      return;
    }

    setIsLoading(true);

    try {
      await register({ ...formData, inviteToken });
      setSuccess(t('auth.success_register'));
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.error || t('auth.error_register');
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  // Classe CSS pour les options du menu déroulant (Force la couleur)
  const optionClass = "text-gray-900 bg-white dark:text-white dark:bg-gray-800";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-dark-bg p-4 relative">

      <button onClick={toggleLanguage} className="absolute top-4 left-4 flex items-center gap-2 px-3 py-2 bg-white dark:bg-dark-card rounded-lg shadow-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-sm text-gray-600 dark:text-gray-300">
        <Languages size={18} />
        {i18n.language === 'fr' ? 'العربية' : 'Français'}
      </button>

      <div className="max-w-md w-full bg-white dark:bg-dark-card rounded-xl shadow-lg p-8 border border-gray-100 dark:border-gray-800 my-10">

        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <img src={theme === 'dark' ? "/logo_d.png" : "/logo_w.png"} alt="Dz Legal AI" className="h-24 w-auto object-contain" />
          </div>
          <p className="text-gray-500 text-sm">{t('auth.register_title')}</p>
        </div>

        {error && <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg text-center">{error}</div>}
        {success && <div className="mb-4 p-3 bg-green-50 text-green-600 text-sm rounded-lg text-center">{success}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* TYPE DE COMPTE (Role) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('auth.role')}</label>
            <div className="relative">
              <Briefcase className="absolute left-3 top-3 h-5 w-5 text-gray-400 rtl:right-3 rtl:left-auto" />
              <select
                name="role"
                value={formData.isOrg ? 'organization_account' : formData.role}
                onChange={handleChange}
                className="w-full pl-10 pr-4 rtl:pr-10 rtl:pl-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-primary-500 outline-none transition-all text-gray-900 dark:text-white appearance-none"
              >
                <optgroup label={i18n.language === 'ar' ? "أفراد" : "Individuels"} className={optionClass}>
                  <option value="lawyer" className={optionClass}>{t('auth.role_lawyer')}</option>
                  <option value="judge" className={optionClass}>{t('auth.role_judge')}</option>
                  <option value="notary" className={optionClass}>{t('auth.role_notary')}</option>
                  <option value="bailiff" className={optionClass}>{t('auth.role_bailiff')}</option>
                  <option value="student" className={optionClass}>{t('auth.role_student')}</option>
                </optgroup>
                <optgroup label={i18n.language === 'ar' ? "مؤسسات" : "Professionnels (Multi-utilisateurs)"} className={optionClass}>
                  <option value="organization_account" className={optionClass}>{i18n.language === 'ar' ? "مكتب محاماة / شركة (إنشاء مجموعة)" : "Cabinet d'Avocats / Entreprise (Créer mon Groupe)"}</option>
                </optgroup>
              </select>
            </div>
          </div>

          {/* --- SECTION ORGANISATION --- */}
          {formData.isOrg && (
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-100 dark:border-blue-800 space-y-4 animate-in fade-in slide-in-from-top-2">
              <h3 className="text-sm font-bold text-blue-800 dark:text-blue-300 flex items-center gap-2">
                <Building2 size={16} />
                {i18n.language === 'ar' ? 'معلومات المجموعة' : 'Informations du Groupe'}
              </h3>

              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                  {i18n.language === 'ar' ? 'اسم المجموعة' : 'Nom du Groupe'}
                </label>
                <input name="orgName" type="text" value={formData.orgName} onChange={handleChange} required={formData.isOrg}
                  className="w-full p-2 rounded border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white text-gray-900 text-sm" />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                    {i18n.language === 'ar' ? 'الرقم الجبائي (NIF)' : 'NIF'}
                  </label>
                  <div className="relative">
                    <FileText className="absolute left-2 top-2 h-4 w-4 text-gray-400 rtl:right-2 rtl:left-auto" />
                    <input name="orgTaxId" type="text" value={formData.orgTaxId} onChange={handleChange}
                      className="w-full pl-8 pr-2 rtl:pr-8 rtl:pl-2 py-2 rounded border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white text-gray-900 text-sm" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                    {i18n.language === 'ar' ? 'العنوان' : 'Adresse'}
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-2 top-2 h-4 w-4 text-gray-400 rtl:right-2 rtl:left-auto" />
                    <input name="orgAddress" type="text" value={formData.orgAddress} onChange={handleChange}
                      className="w-full pl-8 pr-2 rtl:pr-8 rtl:pl-2 py-2 rounded border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white text-gray-900 text-sm" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Nom de l'administrateur */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {formData.isOrg
                ? (i18n.language === 'ar' ? 'اسم المسؤول (أنت)' : 'Nom de l\'administrateur (Vous)')
                : t('auth.full_name')}
            </label>
            <div className="relative">
              <User className="absolute left-3 top-3 h-5 w-5 text-gray-400 rtl:right-3 rtl:left-auto" />
              <input name="fullName" type="text" value={formData.fullName} onChange={handleChange} className="w-full pl-10 pr-4 rtl:pr-10 rtl:pl-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-primary-500 outline-none transition-all text-gray-900 dark:text-white" required />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('auth.email')}</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400 rtl:right-3 rtl:left-auto" />
              <input name="email" type="email" value={formData.email} onChange={handleChange} className="w-full pl-10 pr-4 rtl:pr-10 rtl:pl-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-primary-500 outline-none transition-all text-gray-900 dark:text-white" required />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('auth.whatsapp')}</label>
            <PhoneInput
              value={formData.whatsappNumber}
              onChange={handleChange}
              placeholder="555 12 34 56"
              required={true}
            />
            <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
              <MessageCircle size={12} />
              {i18n.language === 'ar' ? 'يجب أن يكون الرقم مرتبطًا بـ WhatsApp لاستلام رمز التحقق.' : 'Le numéro doit être lié à WhatsApp pour recevoir le code.'}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('auth.password')}</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400 rtl:right-3 rtl:left-auto" />
              <input name="password" type="password" value={formData.password} onChange={handleChange} className="w-full pl-10 pr-4 rtl:pr-10 rtl:pl-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-primary-500 outline-none transition-all text-gray-900 dark:text-white" required />
            </div>
          </div>

          <button type="submit" disabled={isLoading} className="w-full bg-primary-600 hover:bg-primary-700 text-white font-medium py-2.5 rounded-lg transition-all flex justify-center items-center gap-2 mt-2">
            {isLoading ? <Loader2 className="animate-spin h-5 w-5" /> : (formData.isOrg ? (i18n.language === 'ar' ? "إنشاء المجموعة والحساب" : "Créer le Groupe & le Compte") : t('auth.register_btn'))}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-500">
          <p>
            {t('auth.have_account')} {' '}
            <Link to="/login" className="text-primary-600 hover:underline font-medium">
              {t('auth.link_login')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;