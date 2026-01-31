import React, { useState, useEffect } from 'react';
import { Book, FileText, Search, Download, Globe, Loader2, BarChart3 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { API_ENDPOINTS } from '../utils/apiConfig';

const categoryTranslations = {
    // Nouvelles catégories (Mapping 1-8)
    'Journaux officiels': { fr: "Journaux officiels", ar: "الجرائد الرسمية" },
    'Constitutions': { fr: "Constitutions", ar: "الدساتير" },
    'Lois fondamentales': { fr: "Lois fondamentales", ar: "القوانين الأساسية" },
    'Lois organiques': { fr: "Lois organiques", ar: "القوانين العضوية" },
    'Lois ordinaires': { fr: "Lois ordinaires", ar: "القوانين العادية" },
    'Ordonnances': { fr: "Ordonnances", ar: "الأوامر" },
    'Decrets': { fr: "Décrets", ar: "المراسيم" }, // Clé sans accent pour sécurité
    'Lois de finances': { fr: "Lois de finances", ar: "قوانين المالية" },

    // Anciennes catégories (au cas où il en reste)
    'Loi': { fr: "Loi", ar: "قانون" },
    'Journal officiel': { fr: "Journal officiel", ar: "الجريدة الرسمية" },
    commerce: { fr: "Commercial", ar: "تجاري" },
    electoral: { fr: "Électoral", ar: "انتخابي" },
    family: { fr: "Famille", ar: "شؤون الأسرة" },
    military: { fr: "Militaire", ar: "قضاء عسكري" },
    penal: { fr: "Pénal", ar: "جنائي/عقوبات" },
    procedure_penal: { fr: "Procédure Pénale", ar: "إجراءات جزائية" },
    constitution: { fr: "Constitutionnel", ar: "دستوري" },
    procedure_civil: { fr: "Procédure Civile", ar: "إجراءات مدنية" },
    admin: { fr: "Administratif", ar: "إداري" },
    info: { fr: "Information", ar: "إعلام" },
    public_market: { fr: "Marchés Publics", ar: "صفقات عمومية" },
    civil: { fr: "Civil", ar: "مدني" },
    investment: { fr: "Investissement", ar: "استثمار" },
    finance: { fr: "Finance", ar: "مالية" },
    urbanisme: { fr: "Urbanisme", ar: "تعمير" }
};

const LegalTextsPage = () => {
    const { t, i18n } = useTranslation();
    const [textsData, setTextsData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const isAr = i18n.language === 'ar';

    useEffect(() => {
        fetchLibrary();
    }, []);

    const fetchLibrary = async () => {
        try {
            const response = await axios.get(API_ENDPOINTS.library);
            setTextsData(response.data.data);
        } catch (error) {
            console.error("Erreur chargement bibliothèque:", error);
        } finally {
            setLoading(false);
        }
    };

    const getCategoryLabel = (catKey) => {
        return categoryTranslations[catKey]?.[i18n.language] || catKey;
    };

    // ✅ FILTRER par langue actuelle : FR affiche seulement FR, AR affiche seulement AR
    const textsByLanguage = textsData.filter(text => text.lang === i18n.language);

    // Ordre officiel des 8 catégories (tel que défini dans la demande)
    const ORDERED_CATEGORIES = [
        'Journaux officiels',
        'Constitutions',
        'Lois fondamentales',
        'Lois organiques',
        'Lois ordinaires',
        'Ordonnances',
        'Decrets',
        'Lois de finances'
    ];

    const filteredTexts = textsByLanguage.filter(text => {
        const catLabel = getCategoryLabel(text.category).toLowerCase();
        return text.title.toLowerCase().includes(searchTerm.toLowerCase()) || catLabel.includes(searchTerm.toLowerCase());
    });

    const groupedTexts = filteredTexts.reduce((acc, text) => {
        const catKey = text.category;
        if (!acc[catKey]) acc[catKey] = [];
        acc[catKey].push(text);
        return acc;
    }, {});

    // ✅ Trier les catégories selon l'ordre officiel
    const sortedCategories = Object.keys(groupedTexts).sort((a, b) => {
        const indexA = ORDERED_CATEGORIES.indexOf(a);
        const indexB = ORDERED_CATEGORIES.indexOf(b);
        // Si la catégorie n'est pas dans la liste officielle, on la met à la fin
        if (indexA === -1) return 1;
        if (indexB === -1) return -1;
        return indexA - indexB;
    });

    // ✅ Calculer statistiques pour les 8 catégories (Ordre fixe, pas de limite)
    const currentCounts = textsByLanguage.reduce((acc, text) => {
        acc[text.category] = (acc[text.category] || 0) + 1;
        return acc;
    }, {});

    const stats = {
        total: textsByLanguage.length,
        // On mappe sur ORDERED_CATEGORIES pour garantir l'ordre 1-8 et inclure même les 0
        byCategory: ORDERED_CATEGORIES.map(cat => [cat, currentCounts[cat] || 0])
    };

    return (
        <div className="bg-[#0f172a] min-h-screen text-white pt-20 pb-20 overflow-x-hidden" dir={isAr ? 'rtl' : 'ltr'}>

            {/* HERO SECTION */}
            <div className="text-center max-w-4xl mx-auto px-6 mb-16 relative">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-blue-900/20 rounded-full blur-[100px] pointer-events-none"></div>

                <div className="relative inline-block mb-4">
                    <span className="text-blue-500 font-bold tracking-widest text-xs uppercase bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">
                        {t('nav.texts') || (isAr ? "المكتبة القانونية" : "Bibliothèque Juridique")}
                    </span>
                </div>

                <h1 className="text-4xl md:text-5xl font-extrabold mb-6 leading-tight">
                    {isAr ? "الوصول إلى جميع" : "Accédez aux"} <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">{isAr ? "النصوص القانونية" : "textes de loi"}</span> {isAr ? "الرسمية" : "officiels"}
                </h1>

                <p className="text-gray-400 text-lg mb-10 max-w-2xl mx-auto">
                    {isAr ? "قاعدة بيانات شاملة، ومحدثة لتسهيل أبحاثك القانونية." : "Consultez et téléchargez les codes juridiques algériens en arabe et en français."}
                </p>

                {/* SEARCH BAR */}
                <div className="relative max-w-xl mx-auto group">
                    <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-md group-hover:bg-blue-500/30 transition-all"></div>
                    <div className="relative flex items-center bg-[#1e293b] border border-gray-700 rounded-full overflow-hidden shadow-2xl">
                        <div className={`text-gray-400 ${isAr ? 'pr-6' : 'pl-6'}`}>
                            <Search size={20} />
                        </div>
                        <input
                            type="text"
                            placeholder={isAr ? "البحث عن قانون، نص..." : "Rechercher par titre ou catégorie..."}
                            className="w-full bg-transparent text-white px-4 py-4 focus:outline-none placeholder-gray-500"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* STATISTIQUES */}
            {!loading && textsData.length > 0 && !searchTerm && (
                <div className="max-w-5xl mx-auto px-6 mb-12">
                    <div className="bg-gradient-to-br from-blue-900/20 to-purple-900/20 border border-blue-500/20 rounded-2xl p-8 backdrop-blur-sm">

                        {/* 1. Titre Centré */}
                        <div className="flex items-center justify-center gap-3 mb-8">
                            <BarChart3 size={28} className="text-blue-400" />
                            <h2 className="text-2xl font-bold text-white">
                                {isAr ? "إحصائيات المكتبة" : "Statistiques de la bibliothèque"}
                            </h2>
                        </div>

                        {/* 2. Bloc Total Centré */}
                        <div className="mb-10">
                            <div className="bg-blue-500/10 rounded-xl p-6 border border-blue-500/20 max-w-sm mx-auto text-center">
                                <div className="text-blue-400 text-sm font-semibold mb-2 uppercase tracking-wide">
                                    {isAr ? "إجمالي الوثائق" : "Total des documents"}
                                </div>
                                <div className="text-5xl font-extrabold text-white mb-2">{stats.total}</div>
                                <div className="text-gray-400 text-sm font-medium bg-blue-500/10 inline-block px-3 py-1 rounded-full">
                                    {isAr ? "وثيقة باللغة العربية" : "Documents en français"}
                                </div>
                            </div>
                        </div>

                        {/* 3. Catégories sur 2 lignes (4 colonnes) */}
                        <div>
                            <h3 className={`text-lg font-semibold text-gray-300 mb-6 ${isAr ? 'text-right' : 'text-left'}`}>
                                {isAr ? "توزيع الفئات" : "Répartition par catégories"}
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                {stats.byCategory.map(([category, count]) => (
                                    <div key={category} className="flex items-center justify-between bg-gray-800/40 hover:bg-gray-800/60 transition-colors rounded-lg p-4 border border-gray-700/50 group">
                                        <span className="text-gray-300 font-medium group-hover:text-blue-300 transition-colors">
                                            {getCategoryLabel(category)}
                                        </span>
                                        <span className={`px-2.5 py-1 rounded-md text-sm font-bold border ${count > 0 ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 'bg-gray-700/30 text-gray-600 border-gray-700/30'}`}>
                                            {count}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* TABLEAU GROUPÉ PAR CATÉGORIE */}
            <div className="max-w-5xl mx-auto px-6">

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-4">
                        <Loader2 size={48} className="animate-spin text-blue-500" />
                        <p className="text-gray-400">{isAr ? "جاري تحميل المكتبة..." : "Chargement de la bibliothèque..."}</p>
                    </div>
                ) : sortedCategories.length > 0 ? (
                    <div className="border border-gray-700 rounded-xl overflow-hidden bg-[#1e293b]/30 backdrop-blur-sm">

                        {sortedCategories.map((category) => (
                            <div key={category} className="flex flex-col md:flex-row border-b border-gray-700 last:border-0">

                                <div className={`md:w-1/4 p-6 bg-gray-800/40 flex items-center ${isAr ? 'md:border-l' : 'md:border-r'} border-b md:border-b-0 border-gray-700`}>
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
                                            <Book size={20} />
                                        </div>
                                        <span className="font-bold text-lg text-gray-200">
                                            {getCategoryLabel(category)}
                                        </span>
                                    </div>
                                </div>

                                <div className="md:w-3/4 flex flex-col">
                                    {groupedTexts[category].map((text) => (
                                        <a
                                            key={text.id}
                                            href={`${API_ENDPOINTS.library}/download/${text.id}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="group flex justify-between items-center p-4 border-b border-gray-700/50 last:border-0 hover:bg-blue-500/5 transition-colors"
                                            dir={text.lang === 'ar' ? 'rtl' : 'ltr'}
                                        >
                                            {/* Badge langue à gauche en LTR, à droite en RTL - mais en flex, l'ordre suit le dir, donc ça devrait être bon automatiquement si on ne force pas flex-row-reverse */}
                                            <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border opacity-50 flex-shrink-0 ${text.lang === 'ar' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'}`}>
                                                {text.lang === 'ar' ? 'AR' : 'FR'}
                                            </span>

                                            {/* Titre au centre */}
                                            <div className="flex items-center gap-3 flex-1 px-4">
                                                <FileText size={18} className="text-gray-500 group-hover:text-blue-400 transition-colors flex-shrink-0" />
                                                <span className="font-medium text-gray-300 group-hover:text-blue-300 transition-colors text-lg">
                                                    {text.title}
                                                </span>
                                            </div>
                                        </a>
                                    ))}
                                </div>
                            </div>
                        ))}

                    </div>
                ) : (
                    <div className="text-center py-20 text-gray-500">
                        <Search size={48} className="mx-auto mb-4 opacity-20" />
                        <p>{isAr ? `لا توجد نتائج لـ "${searchTerm}"` : `Aucun texte trouvé pour "${searchTerm}"`}</p>
                    </div>
                )}

            </div>
        </div>
    );
};

export default LegalTextsPage;
