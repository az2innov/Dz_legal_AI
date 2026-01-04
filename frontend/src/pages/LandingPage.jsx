import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { MessageSquare, FileText, Book, ArrowRight } from 'lucide-react';
import NewsCarousel from '../components/NewsCarousel';

const LandingPage = () => {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();

    return (
        // Padding top pt-20 pour ne pas être caché par le header fixe
        <div className="relative min-h-screen bg-[#0f172a] text-white font-sans overflow-x-hidden pt-20" dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}>

            {/* --- FOND ANIMÉ --- */}
            <div className="absolute inset-0 z-0 pointer-events-none"
                style={{
                    backgroundImage: 'linear-gradient(#1e293b 1px, transparent 1px), linear-gradient(90deg, #1e293b 1px, transparent 1px)',
                    backgroundSize: '50px 50px',
                    opacity: 0.2
                }}
            ></div>

            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-blue-900/10 rounded-full blur-[120px] pointer-events-none -z-10"></div>

            {/* --- SECTION 1 : HERO --- */}
            <section className="relative z-10 pt-4 pb-12 px-4 text-center">
                <div className="max-w-4xl mx-auto flex flex-col items-center">
                    <img
                        src="/logo_w.png"
                        alt="Logo Dz Legal AI"
                        className="w-24 h-24 object-contain mb-8 drop-shadow-2xl"
                    />
                    <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-white pb-6 leading-tight">
                        {t('landing.hero_title')}
                    </h1>
                    <p className="text-lg text-gray-400 max-w-xl mx-auto leading-relaxed mb-10">
                        {t('landing.hero_subtitle')}
                    </p>
                    <button
                        onClick={() => navigate('/register')}
                        className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-full font-bold text-sm transition-all shadow-lg shadow-blue-900/50 mb-6"
                    >
                        {t('landing.cta_start')}
                    </button>

                    {/* Texte déplacé ici */}
                    <p className="text-gray-500 text-xs">
                        {i18n.language === 'ar' ? 'ابدأ مجانًا، وتطور وفقًا لاحتياجاتك.' : 'Commencez gratuitement, évoluez selon vos besoins.'}
                    </p>
                </div>
            </section>

            {/* --- SECTION 2 : ACTUALITÉS (Sans Titre) --- */}
            <section className="relative z-10 px-4 mb-20">
                <div className="max-w-5xl mx-auto">
                    <NewsCarousel />
                </div>
            </section>

            {/* --- SECTION 3 : FONCTIONNALITÉS (Sans Titre, juste le trait) --- */}
            <section id="features" className="relative z-10 pb-20 pt-10">
                <div className="max-w-7xl mx-auto px-6 text-center">

                    {/* Petit trait de séparation discret */}
                    <div className="w-24 h-1 bg-gradient-to-r from-transparent via-blue-500/50 to-transparent mx-auto mb-8"></div>

                    <p className="text-gray-500 text-sm mb-12">
                        {i18n.language === 'ar' ? 'أدوات قوية مصممة للمحترفين القانونيين في الجزائر.' : 'Des outils puissants conçus pour les professionnels du droit en Algérie.'}
                    </p>

                    <div className="grid md:grid-cols-3 gap-6">
                        <FeatureCard
                            icon={MessageSquare}
                            title={i18n.language === 'ar' ? "المساعد القانوني الذكي" : "Chatbot Juridique RAG"}
                            desc={i18n.language === 'ar' ? 'اطرح أسئلة باللغة الطبيعية واحصل على إجابات موثقة.' : 'Posez des questions en langage naturel et obtenez des réponses sourcées.'}
                        />
                        <FeatureCard
                            icon={FileText}
                            title={i18n.language === 'ar' ? "تحليل الوثائق" : "Analyse de Documents"}
                            desc={i18n.language === 'ar' ? 'قم بتحميل ملفات PDF واحصل على ملخص فوري.' : 'Téléversez vos PDF et obtenez un résumé instantané grâce à l\'IA.'}
                        />
                        <FeatureCard
                            icon={Book}
                            title={i18n.language === 'ar' ? "قاعدة المعرفة" : "Base de Connaissances"}
                            desc={i18n.language === 'ar' ? 'الوصول إلى جميع النصوص القانونية المحدثة.' : 'Accédez à tous les textes de lois mis à jour et indexés.'}
                        />
                    </div>
                </div>
            </section>

            {/* SECTION TARIFS SUPPRIMÉE */}

            {/* --- FOOTER SUPPRIMÉ ICI (Car géré par PublicLayout) --- */}

        </div>
    );
};

const FeatureCard = ({ icon: Icon, title, desc }) => (
    <div className="bg-[#1e293b]/40 p-8 rounded-xl border border-white/5 text-left hover:bg-[#1e293b]/60 transition-colors">
        <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center text-blue-400 mb-4 border border-blue-500/20">
            <Icon size={20} />
        </div>
        <h3 className="text-md font-bold text-white mb-2">{title}</h3>
        <p className="text-gray-400 text-xs leading-relaxed">{desc}</p>
    </div>
);

export default LandingPage;