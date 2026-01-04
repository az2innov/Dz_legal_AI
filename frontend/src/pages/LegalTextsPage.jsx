import React, { useState } from 'react';
import { Book, FileText, Search, Download, Globe } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const textsData = [
    // Textes en Arabe (Titres en Arabe)
    { title: "القانون التجاري", category: "commerce", lang: "ar", file: "code_com_ar.pdf" },
    { title: "القانون العضوي للانتخابات", category: "electoral", lang: "ar", file: "code_electoral_ar.pdf" },
    { title: "قانون الأسرة", category: "family", lang: "ar", file: "code_famille_ar.pdf" },
    { title: "قانون القضاء العسكري", category: "military", lang: "ar", file: "code_justice_militaire_ar.pdf" },
    { title: "قانون العقوبات", category: "penal", lang: "ar", file: "Code_penal_ar.pdf" },
    { title: "قانون الإجراءات الجزائية", category: "procedure_penal", lang: "ar", file: "code_procedure_panale_ar.pdf" },
    { title: "الدستور", category: "constitution", lang: "ar", file: "constitution_ar.pdf" },

    // Textes en Français (Titres nettoyés)
    { title: "Code de procédure civile et administrative", category: "procedure_civil", lang: "fr", file: "code_civil_Admin_fr.pdf" },
    { title: "Code des collectivités territoriales", category: "admin", lang: "fr", file: "code_collectivites_territoriales_fr.pdf" },
    { title: "Code du commerce", category: "commerce", lang: "fr", file: "code_com_fr.pdf" },
    { title: "Code électoral", category: "electoral", lang: "fr", file: "code_electoral_fr.pdf" },
    { title: "Code de la famille", category: "family", lang: "fr", file: "code_famille_fr.pdf" },
    { title: "Code de l'information", category: "info", lang: "fr", file: "code_information_fr.pdf" },
    { title: "Code de la justice militaire", category: "military", lang: "fr", file: "code_justice_militaire_fr.pdf" },
    { title: "Code des marchés publics", category: "public_market", lang: "fr", file: "code_marche_publics_fr.pdf" },
    { title: "Code de la nationalité", category: "civil", lang: "fr", file: "code_nationalite_fr.pdf" },
    { title: "Code pénal", category: "penal", lang: "fr", file: "Code_penal_fr.pdf" },
    { title: "Code des pensions militaires", category: "military", lang: "fr", file: "code_pensions_militaire_fr.pdf" },
    { title: "Code de procédure pénale", category: "procedure_penal", lang: "fr", file: "code_procedure_panale_fr.pdf" },
    { title: "Constitution", category: "constitution", lang: "fr", file: "constitution_fr.pdf" },
];

const categoryTranslations = {
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
    civil: { fr: "Civil", ar: "مدني" }
};

const LegalTextsPage = () => {
    const { t, i18n } = useTranslation();
    const [searchTerm, setSearchTerm] = useState('');
    const isAr = i18n.language === 'ar';

    const getCategoryLabel = (catKey) => {
        return categoryTranslations[catKey]?.[i18n.language] || catKey;
    };

    const filteredTexts = textsData.filter(text => {
        const catLabel = getCategoryLabel(text.category).toLowerCase();
        return text.title.toLowerCase().includes(searchTerm.toLowerCase()) || catLabel.includes(searchTerm.toLowerCase());
    });

    // 1. Grouper par catégorie
    const groupedTexts = filteredTexts.reduce((acc, text) => {
        const catKey = text.category;
        if (!acc[catKey]) acc[catKey] = [];
        acc[catKey].push(text);
        return acc;
    }, {});

    // 2. Trier les catégories par ordre alphabétique du label affiché
    const sortedCategories = Object.keys(groupedTexts).sort((a, b) =>
        getCategoryLabel(a).localeCompare(getCategoryLabel(b), i18n.language)
    );

    return (
        <div className="bg-[#0f172a] min-h-screen text-white pt-20 pb-20" dir={isAr ? 'rtl' : 'ltr'}>

            {/* HERO SECTION */}
            <div className="text-center max-w-4xl mx-auto px-6 mb-16 relative">
                {/* Effet de fond */}
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

            {/* TABLEAU GROUPÉ PAR CATÉGORIE */}
            <div className="max-w-5xl mx-auto px-6">

                {sortedCategories.length > 0 ? (
                    <div className="border border-gray-700 rounded-xl overflow-hidden bg-[#1e293b]/30 backdrop-blur-sm">

                        {sortedCategories.map((category) => (
                            <div key={category} className="flex flex-col md:flex-row border-b border-gray-700 last:border-0">

                                {/* COLONNE GAUCHE : CATÉGORIE */}
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

                                {/* COLONNE DROITE : LISTE DES TEXTES */}
                                <div className="md:w-3/4 flex flex-col">
                                    {groupedTexts[category].map((text, idx) => (
                                        <a
                                            key={idx}
                                            href={`/${text.file}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="group flex justify-between items-center p-4 border-b border-gray-700/50 last:border-0 hover:bg-blue-500/5 transition-colors"
                                        >
                                            <div className="flex items-center gap-3">
                                                <FileText size={18} className="text-gray-500 group-hover:text-blue-400 transition-colors" />
                                                <span className="font-medium text-gray-300 group-hover:text-blue-300 transition-colors text-lg" dir={text.lang === 'ar' ? 'rtl' : 'ltr'}>
                                                    {text.title}
                                                </span>
                                            </div>

                                            {/* Badge Langue discret */}
                                            <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border opacity-50 ${text.lang === 'ar' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'}`}>
                                                {text.lang === 'ar' ? 'AR' : 'FR'}
                                            </span>
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