import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { MessageSquare, FileText, Book, ArrowRight, Users } from 'lucide-react';
import NewsCarousel from '../components/NewsCarousel';
import SEO from '../components/SEO';

const LandingPage = () => {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const [guestQuery, setGuestQuery] = React.useState(''); // State input
    const [activeTab, setActiveTab] = React.useState('chat'); // State for showcase tabs

    const handleGuestStart = (e) => {
        e.preventDefault();
        if (guestQuery.trim()) {
            // Sauvegarde pour le chat
            localStorage.setItem('guest_initial_question', guestQuery);
            navigate('/chat');
        }
    };

    return (
        <div className="relative min-h-screen bg-[#0f172a] text-white font-sans overflow-x-hidden pt-20" dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}>
            <SEO
                title={t('landing.hero_title')}
                description={t('landing.hero_subtitle')}
            />

            {/* --- FOND ANIMÉ ET GLOWS --- */}
            <div className="absolute inset-0 z-0 pointer-events-none"
                style={{
                    backgroundImage: 'linear-gradient(#1e293b 1px, transparent 1px), linear-gradient(90deg, #1e293b 1px, transparent 1px)',
                    backgroundSize: '50px 50px',
                    opacity: 0.15
                }}
            ></div>

            {/* Glows dynamiques pour l'effet premium */}
            <div className="absolute top-[-10%] left-[10%] w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[120px] pointer-events-none -z-10 animate-pulse"></div>
            <div className="absolute top-[20%] right-[5%] w-[400px] h-[400px] bg-purple-600/10 rounded-full blur-[100px] pointer-events-none -z-10"></div>

            {/* --- SECTION 1 : HERO --- */}
            <section className="relative z-10 pt-8 pb-16 px-4">
                <div className="max-w-6xl mx-auto flex flex-col items-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold mb-6 animate-in fade-in slide-in-from-top-2">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                        </span>
                        {i18n.language === 'ar' ? 'أذكى ذكاء اصطناعي قانوني في الجزائر' : 'L\'IA juridique la plus avancée en Algérie'}
                    </div>

                    <h1 className="text-4xl md:text-7xl font-extrabold tracking-tight text-white mb-6 leading-tight max-w-4xl text-center">
                        {t('landing.hero_title')}
                    </h1>
                    <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed mb-10 text-center">
                        {t('landing.hero_subtitle')}
                    </p>

                    {/* BARRE DE RECHERCHE + ACTIONS RAPIDES */}
                    <div className="w-full max-w-2xl mb-12 flex flex-col items-center">
                        <form onSubmit={handleGuestStart} className="w-full relative group mb-4">
                            <div className="absolute inset-0 bg-blue-600/20 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                            <input
                                type="text"
                                placeholder={i18n.language === 'ar' ? "مثال: كيف أفتح شركة في الجزائر؟" : "Ex: Comment créer une SARL en Algérie ?"}
                                className="w-full relative z-10 px-8 py-5 pr-16 rounded-2xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 focus:bg-white/10 backdrop-blur-xl transition-all shadow-2xl text-lg"
                                value={guestQuery}
                                onChange={e => setGuestQuery(e.target.value)}
                            />
                            <button
                                type="submit"
                                className={`absolute z-20 top-3 bottom-3 ${i18n.language === 'ar' ? 'left-3' : 'right-3'} bg-blue-600 hover:bg-blue-500 text-white px-6 flex items-center justify-center rounded-xl transition-all shadow-lg hover:scale-[1.02] active:scale-95 font-bold`}
                            >
                                {i18n.language === 'ar' ? 'اسأل' : 'Demander'}
                                <ArrowRight size={18} className={`ml-2 ${i18n.language === 'ar' ? 'rotate-180 mr-2 ml-0' : ''}`} />
                            </button>
                        </form>

                        {/* PILLULES D'ACTIONS RAPIDES (BOOST ENGAGEMENT) */}
                        <div className="flex flex-wrap justify-center gap-2 px-4 transition-all animate-in fade-in duration-700 delay-300">
                            {[
                                { fr: '📜 Statuts SARL', ar: '📜 قانون أساسي SARL' },
                                { fr: '⚖️ Droit du Travail', ar: '⚖️ قانون العمل' },
                                { fr: '🏠 Héritage', ar: '🏠 الميراث' },
                                { fr: '📝 Contrats Bail', ar: '📝 عقود الإيجار' }
                            ].map((topic, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => {
                                        setGuestQuery(i18n.language === 'ar' ? topic.ar : topic.fr);
                                        // Optionnel: soumission directe pour plus de vitesse
                                        setTimeout(() => document.querySelector('form')?.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true })), 100);
                                    }}
                                    className="px-4 py-2 rounded-full bg-white/5 border border-white/5 hover:border-blue-500/30 hover:bg-blue-500/10 text-xs md:text-sm text-gray-400 hover:text-blue-300 transition-all whitespace-nowrap"
                                >
                                    {i18n.language === 'ar' ? topic.ar : topic.fr}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* MOCKUP VISUEL (LA PREUVE) - SHOWCASE BILINGUE DYNAMIQUE - DIMENSIONS RÉDUITES */}
                    <div className="relative w-full max-w-4xl mt-4 animate-in zoom-in-95 duration-1000">
                        {/* Tabs Navigation */}
                        <div className="flex justify-center gap-1 mb-5 p-1 bg-white/5 backdrop-blur-md rounded-xl border border-white/10 w-fit mx-auto relative z-20 scale-90 md:scale-100">
                            <button
                                onClick={() => setActiveTab('chat')}
                                className={`px-5 py-2 rounded-lg text-xs md:text-sm font-bold transition-all ${activeTab === 'chat' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-gray-400 hover:text-white'}`}
                            >
                                {i18n.language === 'ar' ? 'المساعد الذكي' : 'Assistant Intelligent'}
                            </button>
                            <button
                                onClick={() => setActiveTab('docs')}
                                className={`px-5 py-2 rounded-lg text-xs md:text-sm font-bold transition-all ${activeTab === 'docs' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-gray-400 hover:text-white'}`}
                            >
                                {i18n.language === 'ar' ? 'تحليل المستندات' : 'Analyse de Documents'}
                            </button>
                        </div>

                        <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl blur opacity-15"></div>
                        <div className="relative bg-[#111827] rounded-2xl border border-white/10 overflow-hidden shadow-2xl mx-auto max-w-3xl md:max-w-4xl">
                            {/* Grille bilingue - Ordre dynamique basé sur la langue */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-white/5">
                                {/* Panneau 1 : Langue active */}
                                <div className="relative aspect-[16/10] overflow-hidden group">
                                    <img
                                        src={i18n.language === 'ar'
                                            ? (activeTab === 'chat' ? "/showcase_chat_ar.png" : "/showcase_docs_ar.png")
                                            : (activeTab === 'chat' ? "/showcase_chat_fr.png" : "/showcase_docs_fr.png")
                                        }
                                        alt={i18n.language === 'ar' ? "النسخة العربية" : "Version Française"}
                                        className="w-full h-full object-cover object-top opacity-95 group-hover:opacity-100 transition-all duration-700 group-hover:scale-[1.02]"
                                    />
                                    <div className={`absolute top-3 ${i18n.language === 'ar' ? 'right-3' : 'left-3'} px-2 py-1 bg-blue-600/90 backdrop-blur-md rounded-md text-[10px] font-black uppercase tracking-widest text-white shadow-lg border border-white/20 uppercase`}>
                                        {i18n.language === 'ar' ? 'العربية' : 'Français'}
                                    </div>
                                </div>

                                {/* Panneau 2 : Autre langue */}
                                <div className="relative aspect-[16/10] overflow-hidden group border-t md:border-t-0 md:border-l border-white/5">
                                    <img
                                        src={i18n.language === 'ar'
                                            ? (activeTab === 'chat' ? "/showcase_chat_fr.png" : "/showcase_docs_fr.png")
                                            : (activeTab === 'chat' ? "/showcase_chat_ar.png" : "/showcase_docs_ar.png")
                                        }
                                        alt={i18n.language === 'ar' ? "Version Française" : "النسخة العربية"}
                                        className="w-full h-full object-cover object-top opacity-50 group-hover:opacity-100 transition-all duration-700 grayscale-[40%] group-hover:grayscale-0 group-hover:scale-[1.02]"
                                    />
                                    <div className={`absolute top-3 ${i18n.language === 'ar' ? 'left-3' : 'right-3'} px-2 py-1 bg-white/10 backdrop-blur-md rounded-md text-[10px] font-black uppercase tracking-widest text-white/60 border border-white/10 uppercase`}>
                                        {i18n.language === 'ar' ? 'Français' : 'العربية'}
                                    </div>
                                </div>
                            </div>

                            {/* Overlay de protection style "glow" */}
                            <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[#0f172a]/60 to-transparent pointer-events-none"></div>
                        </div>

                        <p className="mt-4 text-center text-gray-500 text-[10px] font-medium tracking-wide">
                            {i18n.language === 'ar' ? 'لقطات شاشة حقيقية من منصة Dz Legal AI' : 'Captures d\'écran réelles du logiciel Dz Legal AI'}
                        </p>
                    </div>
                </div>
            </section>

            {/* --- SECTION 2 : ACTUALITÉS --- */}
            <section className="relative z-10 px-4 mb-20">
                <div className="max-w-5xl mx-auto">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="h-px flex-1 bg-gray-800"></div>
                        <h2 className="text-gray-500 text-sm font-medium uppercase tracking-widest">{i18n.language === 'ar' ? 'آخر الأخبار' : 'Actualités Juridiques'}</h2>
                        <div className="h-px flex-1 bg-gray-800"></div>
                    </div>
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

                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <FeatureCard
                            icon={MessageSquare}
                            title={i18n.language === 'ar' ? "المساعد القانوني الذكي" : "Assistant Intelligent"}
                            desc={i18n.language === 'ar' ? 'اطرح أسئلة باللغة الطبيعية واحصل على إجابات موثقة فوراً.' : 'Posez des questions en langage naturel et obtenez des réponses sourcées.'}
                        />
                        <FeatureCard
                            icon={FileText}
                            title={i18n.language === 'ar' ? "تحليل الوثائق" : "Analyse de Documents"}
                            desc={i18n.language === 'ar' ? 'قم بتحميل ملفات PDF واحصل على ملخص فوري بفضل الذكاء الاصطناعي.' : 'Téléversez vos PDF et obtenez un résumé instantané grâce à l\'IA.'}
                        />
                        <FeatureCard
                            icon={Users}
                            title={i18n.language === 'ar' ? "العمل الجماعي" : "Collaboration d'Équipe"}
                            desc={i18n.language === 'ar' ? 'أنشئ مجموعات لعملك (مكتب، مصلحة) وشارك أبحاثك مع زملائك.' : 'Créez des groupes pour votre structure et partagez vos analyses avec votre équipe.'}
                        />
                        <FeatureCard
                            icon={Book}
                            title={i18n.language === 'ar' ? "النصوص القانونية" : "Textes de Lois"}
                            desc={i18n.language === 'ar' ? 'الوصول إلى قاعدة بيانات ضخمة من النصوص القانونية المحدثة.' : 'Accédez à une base de données exhaustive de textes de lois indexés.'}
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