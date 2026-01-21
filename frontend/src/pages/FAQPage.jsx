import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronDown, ArrowLeft, HelpCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ContactSupportModal from '../components/ContactSupportModal';

const FAQItem = ({ question, answer }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  return (
    <div className="border-b border-white/10 last:border-0">
      <button
        className="w-full flex justify-between items-center py-5 text-left focus:outline-none group"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className={`text-lg font-medium transition-colors ${isOpen ? 'text-blue-400' : 'text-gray-200 group-hover:text-white'}`}>
          {question}
        </span>
        <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${isOpen ? 'transform rotate-180 text-blue-400' : ''}`} />
      </button>

      {/* Animation d'ouverture simple */}
      <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="pb-5 text-gray-400 leading-relaxed text-sm md:text-base">
          {answer}
        </div>
      </div>
    </div>
  );
};

const FAQPage = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);

  // Organisation des questions par catégorie
  const faqCategories = [
    {
      title: i18n.language === 'ar' ? 'أسئلة عامة' : 'Questions Générales',
      icon: '💡',
      questions: ['q1', 'q2', 'q9', 'q10', 'q11', 'q12', 'q13']
    },
    {
      title: i18n.language === 'ar' ? 'أسئلة فنية' : 'Questions Techniques',
      icon: '🔧',
      questions: ['q3', 'q4', 'q5', 'q8', 'q14', 'q15', 'q16', 'q17']
    },
    {
      title: i18n.language === 'ar' ? 'المجموعات والمؤسسات' : 'Groupes & Organisations',
      icon: '👥',
      questions: ['q6', 'q18', 'q19', 'q20']
    },
    {
      title: i18n.language === 'ar' ? 'الاشتراكات والأسعار' : 'Abonnements & Tarifs',
      icon: '💳',
      questions: ['q7', 'q21', 'q22']
    }
  ];

  return (
    <div className="min-h-screen bg-[#0f172a] text-white flex flex-col font-sans relative overflow-hidden" dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}>

      {/* --- FOND IDENTIQUE À LA LANDING PAGE --- */}
      {/* Grille */}
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage: 'linear-gradient(#4f4f4f 1px, transparent 1px), linear-gradient(90deg, #4f4f4f 1px, transparent 1px)',
          backgroundSize: '40px 40px'
        }}
      ></div>
      {/* Lumière bleue (positionnée différemment pour varier un peu) */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none"></div>
      {/* ------------------------------------------ */}

      <div className="relative z-10 max-w-5xl mx-auto w-full px-6 py-12">

        {/* Bouton Retour */}
        <button
          onClick={() => navigate('/')}
          className="mb-8 flex items-center gap-2 text-gray-400 hover:text-white transition-colors group"
        >
          <ArrowLeft className={`transition-transform group-hover:-translate-x-1 ${i18n.language === 'ar' ? 'rotate-180 group-hover:translate-x-1' : ''}`} />
          {t('footer.back_home') || (i18n.language === 'ar' ? 'العودة' : 'Retour')}
        </button>

        {/* En-tête */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center p-3 bg-blue-500/10 rounded-full mb-4 ring-1 ring-blue-500/50">
            <HelpCircle className="w-8 h-8 text-blue-400" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">
            {t('faq.title')}
          </h1>
          <p className="text-gray-400 text-lg">
            {i18n.language === 'ar' ? 'كل ما تحتاج لمعرفته حول المنصة' : 'Tout ce que vous devez savoir sur la plateforme'}
          </p>
        </div>

        {/* Questions organisées par catégorie */}
        <div className="space-y-8">
          {faqCategories.map((category, catIndex) => (
            <div key={catIndex} className="bg-white/5 backdrop-blur-sm rounded-2xl shadow-xl border border-white/10 p-6 sm:p-8">
              {/* Titre de catégorie */}
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3 border-b border-white/10 pb-4">
                <span className="text-3xl">{category.icon}</span>
                {category.title}
              </h2>

              {/* Questions de cette catégorie */}
              <div>
                {category.questions.map((key, qIndex) => (
                  <FAQItem
                    key={qIndex}
                    question={t(`faq.${key}`)}
                    answer={t(`faq.a${key.substring(1)}`)} // Extrait le numéro de q1 → a1
                  />
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer de la FAQ */}
        <div className="text-center mt-12 text-gray-500 text-sm">
          <p>
            {i18n.language === 'ar' ? 'لم تجد إجابة لسؤالك؟' : 'Vous ne trouvez pas de réponse ?'}
            {' '}
            <button
              onClick={() => setIsContactModalOpen(true)}
              className="text-blue-400 hover:underline cursor-pointer font-medium"
            >
              {t('footer.contact_us')}
            </button>
          </p>
        </div>

        {/* Contact Support Modal */}
        <ContactSupportModal
          isOpen={isContactModalOpen}
          onClose={() => setIsContactModalOpen(false)}
        />

      </div>
    </div>
  );
};

export default FAQPage;