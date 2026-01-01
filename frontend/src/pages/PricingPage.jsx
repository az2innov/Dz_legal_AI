import React from 'react';
// --- LIGNE AJOUTÉE CI-DESSOUS ---
import { useTranslation } from 'react-i18next'; 
// --------------------------------
import { Check, X, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PricingPage = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  const plans = [
    {
      id: 'free_trial',
      name: t('plans.free_trial'),
      price: '0 DZD',
      description: 'Pour découvrir la puissance de l\'IA.',
      features: [
        { name: `5 ${t('plans.feat_chat')}`, included: true },
        { name: `2 ${t('plans.feat_doc')}`, included: true },
        { name: t('plans.feat_history'), included: false },
        { name: t('plans.feat_support'), included: false },
      ],
      cta: t('auth.register_btn'),
      popular: false,
      action: () => navigate('/register')
    },
    {
      id: 'basic',
      name: t('plans.basic'),
      price: '2500 DZD',
      period: '/mois',
      description: 'Pour les étudiants et jeunes avocats.',
      features: [
        { name: `50 ${t('plans.feat_chat')}`, included: true },
        { name: `10 ${t('plans.feat_doc')}`, included: true },
        { name: t('plans.feat_history'), included: true },
        { name: t('plans.feat_support'), included: true },
      ],
      cta: t('plans.btn_subscribe'),
      popular: true,
      action: () => navigate('/register')
    },
    {
      id: 'premium',
      name: t('plans.organization'),
      price: 'Sur Devis',
      description: 'Pour les cabinets et entreprises.',
      features: [
        { name: `Illimité`, included: true },
        { name: `Illimité`, included: true },
        { name: t('plans.feat_history'), included: true },
        { name: "Accès API & Multi-comptes", included: true },
      ],
      cta: t('plans.contact_sales'),
      popular: false,
      action: () => window.open('mailto:contact@innov-num.pro')
    }
  ];

  return (
    <div className="py-16 px-4">
      
      <div className="max-w-6xl mx-auto mb-8">
        <button 
            onClick={() => navigate('/')} 
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
        >
            <ArrowLeft size={20} className={i18n.language === 'ar' ? 'rotate-180' : ''} />
            {t('footer.back_home') || (i18n.language === 'ar' ? 'العودة' : 'Retour')}
        </button>
      </div>

      <div className="max-w-6xl mx-auto text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">{t('plans.title')}</h1>
        <p className="text-xl text-gray-400">{t('plans.subtitle')}</p>
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        {plans.map((plan) => (
          <div 
            key={plan.id} 
            className={`relative rounded-2xl p-8 border flex flex-col ${
                plan.popular 
                ? 'bg-blue-600/10 border-blue-500 shadow-2xl shadow-blue-900/20' 
                : 'bg-gray-800/50 border-gray-700 hover:border-gray-600'
            }`}
          >
            {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-bold uppercase tracking-wider">
                    Populaire
                </div>
            )}

            <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-100">{plan.name}</h3>
                <div className="mt-4 flex items-baseline gap-1">
                    <span className="text-4xl font-bold text-white">{plan.price}</span>
                    {plan.period && <span className="text-gray-400">{plan.period}</span>}
                </div>
                <p className="mt-2 text-sm text-gray-400">{plan.description}</p>
            </div>

            <ul className="flex-1 space-y-4 mb-8">
                {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-3 text-sm">
                        {feature.included ? (
                            <div className="p-1 rounded-full bg-green-500/20 text-green-400">
                                <Check size={14} />
                            </div>
                        ) : (
                            <div className="p-1 rounded-full bg-gray-700 text-gray-500">
                                <X size={14} />
                            </div>
                        )}
                        <span className={feature.included ? 'text-gray-200' : 'text-gray-500'}>
                            {feature.name}
                        </span>
                    </li>
                ))}
            </ul>

            <button 
                onClick={plan.action}
                className={`w-full py-3 rounded-lg font-semibold transition-all ${
                    plan.popular 
                    ? 'bg-blue-600 hover:bg-blue-500 text-white' 
                    : 'bg-white/10 hover:bg-white/20 text-white'
                }`}
            >
                {plan.cta}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PricingPage;