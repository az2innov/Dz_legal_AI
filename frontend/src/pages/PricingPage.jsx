import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Check, X, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import ContactSalesModal from '../components/ContactSalesModal';
import PlanChangeRequestModal from '../components/PlanChangeRequestModal';
import MyPlanRequests from '../components/MyPlanRequests';
import billingService from '../services/billingService';

const PricingPage = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [isPlanChangeModalOpen, setIsPlanChangeModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [currentUserPlan, setCurrentUserPlan] = useState('free');
  const [userBelongsToOrg, setUserBelongsToOrg] = useState(false);

  // Récupérer le plan actuel de l'utilisateur
  useEffect(() => {
    if (user) {
      const fetchUserPlan = async () => {
        try {
          const stats = await billingService.getUsage();
          if (stats && stats.plan) {
            setCurrentUserPlan(stats.plan);
          }
        } catch (error) {
          console.error('Erreur récupération plan:', error);
        }
      };
      fetchUserPlan();

      // Vérifier si l'utilisateur appartient à une organisation
      if (user.organization_id) {
        setUserBelongsToOrg(true);
      }
    }
  }, [user]);

  // Fonction pour formater le prix selon la langue
  const formatPrice = (amount) => {
    if (i18n.language === 'ar') {
      const cleanAmount = amount.replace(/\s/g, '');
      return `${cleanAmount} د.ج`;
    }
    return `${amount} DZD`;
  };

  // Formater un nombre selon la langue
  const formatNumber = (num) => {
    if (i18n.language === 'ar') {
      return num.toString().replace(/\s/g, '');
    }
    return num.toString();
  };

  // Gérér le clic sur un bouton de plan
  const handlePlanAction = (planId) => {
    // Si plan Pro (Groupe), ouvrir modal contact sales directement (même si pas connecté)
    if (planId === 'pro') {
      setIsContactModalOpen(true);
      return;
    }

    // Si membre d'une organisation, bloquer pour les autres actions
    if (userBelongsToOrg) {
      alert(t('pricing.orgMemberBlocked') || 'Votre plan est géré par votre organisation. Contactez votre gestionnaire pour tout changement.');
      return;
    }

    if (!user) {
      // Si pas connecté, aller vers registration pour les autres plans
      navigate('/register');
      return;
    }

    // Si même plan, ne rien faire
    const planMap = { 'free_trial': 'free', 'basic': 'basic', 'premium': 'premium' };
    const actualPlanId = planMap[planId] || planId;

    if (currentUserPlan === actualPlanId) {
      return;
    }

    // Ouvrir modal de changement de plan
    setSelectedPlan(actualPlanId);
    setIsPlanChangeModalOpen(true);
  };

  // Mapper les IDs pour l'affichage
  const getPlanIdForAPI = (planId) => {
    const planMap = { 'free_trial': 'free', 'basic': 'basic', 'premium': 'premium', 'pro': 'pro' };
    return planMap[planId] || planId;
  };

  const plans = [
    {
      id: 'free_trial',
      name: t('plans.free_trial'),
      price: formatPrice('0'),
      description: t('plans.plan_free_desc'),
      features: [
        { name: `${formatNumber(10)} ${t('plans.questions_month')}`, included: true },
        { name: `${formatNumber(1)} ${t('plans.docs_month')} (${t('plans.max_pages')} ${formatNumber(5)} pages)`, included: true },
        { name: t('plans.support_community'), included: true },
        { name: t('plans.basic_features'), included: true },
      ],
      cta: userBelongsToOrg ? t('pricing.orgManaged') || 'Plan Groupe' : (user ? (currentUserPlan === 'free' ? t('status.active') : t('plans.btn_subscribe')) : t('auth.register_btn')),
      popular: false
    },
    {
      id: 'basic',
      name: t('plans.basic'),
      price: formatPrice('900'),
      period: t('plans.per_month'),
      description: t('plans.plan_basic_desc'),
      features: [
        { name: `${formatNumber(600)} ${t('plans.questions_month')}`, included: true },
        { name: `${formatNumber(10)} ${t('plans.docs_month')} (${t('plans.max_pages')} ${formatNumber(20)} pages)`, included: true },
        { name: t('plans.support_email'), included: true },
      ],
      cta: userBelongsToOrg ? t('pricing.orgManaged') || 'Plan Groupe' : (user ? (currentUserPlan === 'basic' ? t('status.active') : 'Changer de plan') : t('plans.btn_subscribe')),
      popular: false
    },
    {
      id: 'premium',
      name: t('plans.premium'),
      price: formatPrice('2 900'),
      period: t('plans.per_month'),
      description: t('plans.plan_premium_desc'),
      features: [
        { name: `${formatNumber('6 000')} ${t('plans.questions_month')}`, included: true },
        { name: `${formatNumber(50)} ${t('plans.docs_month')} (${t('plans.unlimited_pages')})`, included: true },
        { name: t('plans.support_priority'), included: true },
      ],
      cta: userBelongsToOrg ? t('pricing.orgManaged') || 'Plan Groupe' : (user ? (currentUserPlan === 'premium' ? t('status.active') : 'Changer de plan') : t('plans.btn_subscribe')),
      popular: true
    },
    {
      id: 'pro',
      name: t('plans.organization'),
      price: formatPrice('12 000'),
      period: t('plans.per_month'),
      description: t('plans.plan_pro_desc'),
      features: [
        { name: `${formatNumber('30 000')} ${t('plans.questions_month')} (${t('plans.shared')})`, included: true },
        { name: `${formatNumber(200)} ${t('plans.docs_month')} (${t('plans.shared')})`, included: true },
        { name: t('plans.support_dedicated'), included: true },
        { name: t('plans.multi_accounts'), included: true },
        { name: t('plans.account_manager'), included: true },
      ],
      cta: t('plans.contact_sales'),
      popular: false
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

      <div className={`mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 justify-items-center ${user ? 'max-w-6xl lg:grid-cols-3' : 'max-w-7xl lg:grid-cols-4'
        }`}>
        {plans
          .filter(plan => !user || plan.id !== 'pro') // Masquer le plan Groupe pour les utilisateurs connectés
          .map((plan) => {
            const actualPlanId = getPlanIdForAPI(plan.id);
            const isCurrentPlan = user && currentUserPlan === actualPlanId;
            const isDisabled = isCurrentPlan;

            return (
              <div
                key={plan.id}
                className={`relative rounded-2xl p-8 border flex flex-col transition-all duration-300 ${plan.popular
                  ? 'bg-blue-50 border-blue-200 dark:bg-blue-900/10 dark:border-blue-500 shadow-xl shadow-blue-100 dark:shadow-blue-900/20'
                  : 'bg-white border-gray-200 hover:border-gray-300 dark:bg-gray-800/50 dark:border-gray-700 dark:hover:border-gray-600 shadow-sm hover:shadow-md'
                  } ${isCurrentPlan ? 'ring-2 ring-green-500' : ''}`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-bold uppercase tracking-wider shadow-lg">
                    Populaire
                  </div>
                )}

                {isCurrentPlan && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-4 py-1 rounded-full text-sm font-bold uppercase tracking-wider shadow-lg">
                    ✓ Plan Actif
                  </div>
                )}

                <div className="mb-6">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">{plan.name}</h3>
                  <div className="mt-4 flex items-baseline gap-1">
                    <span className="text-4xl font-extrabold text-gray-900 dark:text-white">{plan.price}</span>
                    {plan.period && <span className="text-gray-500 dark:text-gray-400">{plan.period}</span>}
                  </div>
                  <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{plan.description}</p>
                </div>

                <ul className="flex-1 space-y-4 mb-8">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-3 text-sm">
                      {feature.included ? (
                        <div className="flex-shrink-0 p-1 rounded-full bg-green-100 text-green-600 dark:bg-green-500/20 dark:text-green-400">
                          <Check size={14} />
                        </div>
                      ) : (
                        <div className="flex-shrink-0 p-1 rounded-full bg-gray-100 text-gray-400 dark:bg-gray-700 dark:text-gray-500">
                          <X size={14} />
                        </div>
                      )}
                      <span className={feature.included ? 'text-gray-700 dark:text-gray-200' : 'text-gray-400 dark:text-gray-500'}>
                        {feature.name}
                      </span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handlePlanAction(plan.id)}
                  disabled={isDisabled}
                  className={`w-full py-3 rounded-lg font-bold transition-all ${isDisabled
                    ? 'bg-green-50 dark:bg-green-500/20 text-green-600 dark:text-green-400 cursor-not-allowed border border-green-200 dark:border-green-500/30'
                    : plan.popular
                      ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-blue-600/30'
                      : 'bg-gray-900 text-white hover:bg-gray-800 dark:bg-white/10 dark:hover:bg-white/20 dark:text-white'
                    }`}
                >
                  {plan.cta}
                </button>
              </div>
            );
          })}
      </div>

      {/* Section Mes Demandes pour les utilisateurs connectés (sauf membres d'organisation) */}
      {user && !userBelongsToOrg && (
        <div className="max-w-7xl mx-auto mt-16">
          <MyPlanRequests />
        </div>
      )}

      {/* Contact Sales Modal */}
      <ContactSalesModal
        isOpen={isContactModalOpen}
        onClose={() => setIsContactModalOpen(false)}
      />

      {/* Plan Change Modal */}
      {isPlanChangeModalOpen && selectedPlan && (
        <PlanChangeRequestModal
          isOpen={isPlanChangeModalOpen}
          onClose={() => {
            setIsPlanChangeModalOpen(false);
            setSelectedPlan(null);
          }}
          currentPlan={currentUserPlan}
          requestedPlan={selectedPlan}
          onSuccess={() => {
            setIsPlanChangeModalOpen(false);
            setSelectedPlan(null);
            // Recharger après un court délai pour voir la demande
            setTimeout(() => window.location.reload(), 1000);
          }}
        />
      )}
    </div>
  );
};

export default PricingPage;