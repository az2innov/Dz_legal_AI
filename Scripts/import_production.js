# 🚀 Guide de Déploiement - Page "Textes de lois"

## 📋 Résumé des changements

    - ✅ Nouvelle interface avec statistiques
        - ✅ 159 documents juridiques(FR + AR)
            - ✅ Alignement cohérent pour tous les documents
                - ✅ Fichiers PDF stockés en base de données(111 MB)

---

## 🎯 Étape 1 : Déployer le Frontend

### 1.1 Vérifier les modifications locales

    ```bash
cd frontend
git status
```

Fichiers modifiés:
- `src/pages/LegalTextsPage.jsx`(interface améliorée avec stats)

### 1.2 Commit et push

    ```bash
git add src/pages/LegalTextsPage.jsx
git commit -m "feat: amélioration page Textes de lois avec statistiques et 159 documents"
git push origin main
```

### 1.3 Déployer sur le serveur

    ** Option A - Si vous utilisez PM2 / Node.js direct:**
        ```bash
# Se connecter au serveur
ssh votre-serveur

# Aller dans le dossier frontend
cd /chemin/vers/dz_legal_ai/frontend

# Récupérer les changements
git pull origin main

# Rebuilder le frontend
npm run build

# Redémarrer (si nécessaire)
pm2 restart frontend
```

        ** Option B - Si vous utilisez un service comme Vercel / Netlify :**
            Le déploiement se fera automatiquement après le`git push`.

---

## 🗄️ Étape 2 : Mettre à jour la Base de Données en Production

### 2.1 Préparer le script d'importation

Le script `reset_and_import_documents.js` va:
- Supprimer les anciens documents
    - Importer les 159 nouveaux documents(sans les communiqués)

        ** Créer une version sans les communiqués:**

            ```bash
# Dans votre dossier backend local
node create_production_import.js
```

            < function_calls >
            <invoke name="write_to_file">
                <parameter name="CodeContent">require('dotenv').config();
                    const mysql = require('mysql2/promise');

                    // IMPORTANT: Configurez vos identifiants de production ici
                    const dbConfig = {
                        host: process.env.PROD_MYSQL_HOST || 'votre-serveur-mysql',
                    user: process.env.PROD_MYSQL_USER || 'votre-user',
                    password: process.env.PROD_MYSQL_PASSWORD || 'votre-password',
                    database: process.env.PROD_MYSQL_DATABASE || 'dz_legal_ai',
                    port: process.env.PROD_MYSQL_PORT || 3306,
                    charset: 'utf8mb4'
};

// Mapping des titres vers les catégories
const categorizeDocument = (title) => {
    const titleLower = title.toLowerCase();

                    if (titleLower.includes('constitution') || titleLower.includes('دستور') ||
                    titleLower.includes('révision constitutionnelle') || titleLower.includes('التعديل الدستوري')) {
        return 'constitution';
    }
                    if (titleLower.includes('commerce') || titleLower.includes('تجار')) return 'commerce';
                    if (titleLower.includes('famille') || titleLower.includes('أسرة')) return 'family';
                    if (titleLower.includes('militaire') || titleLower.includes('عسكري')) return 'military';
                    if (titleLower.includes('pénal') || titleLower.includes('جزائ') || titleLower.includes('عقوبات')) return 'penal';
                    if (titleLower.includes('procédure') && titleLower.includes('pénal')) return 'procedure_penal';
                    if (titleLower.includes('procédure') && (titleLower.includes('civil') || titleLower.includes('إجراءات مدنية'))) return 'procedure_civil';
                    if (titleLower.includes('électoral') || titleLower.includes('انتخاب') || titleLower.includes('نظام الانتخابات')) return 'electoral';
                    if (titleLower.includes('information') || titleLower.includes('إعلام') || titleLower.includes('audiovisuel') || titleLower.includes('سمعي')) return 'info';
                    if (titleLower.includes('marchés publics') || titleLower.includes('صفقات عمومية') || titleLower.includes('délégation')) return 'public_market';
                    if (titleLower.includes('finance') || titleLower.includes('المالية')) return 'finance';
                    if (titleLower.includes('investissement') || titleLower.includes('استثمار')) return 'investment';
                    if (titleLower.includes('urbanisme') || titleLower.includes('تعمير') || titleLower.includes('construction') || titleLower.includes('بناي')) return 'urbanisme';
                    if (titleLower.includes('civil') && !titleLower.includes('procédure')) return 'civil';

                    return 'admin';
};

const detectLanguage = (title) => {
    const arabicPattern = /[\u0600-\u06FF]/;
                    return arabicPattern.test(title) ? 'ar' : 'fr';
};

                    // 159 documents (sans les 8 communiqués)
                    const documents = [
                    {"id": "0000001", "title": "l'Organisation et le Fonctionnement de l'Agence Algérienne de Promotion de l'investissement"},
                    {"id": "0000002", "title": "Textes d'application de la loi relative à l'investissement 22-18"},
                    {"id": "0000003", "title": "La loi 22-18 relative à l'Investissement"},
                    {"id": "0000004", "title": "Décret de promulgation de la révision constitutionnelle 2020"},
                    {"id": "0000005", "title": "Projet de Révision de la Constitution-mai 2020"},
                    {"id": "0000006", "title": "Nouvelle Constitution 2016"},
                    {"id": "0000007", "title": "Révision constitutionnelle de 2008"},
                    {"id": "0000008", "title": "Révision constitutionnelle de 2002"},
                    {"id": "0000009", "title": "Révision constitutionnelle de 1996"},
                    {"id": "0000010", "title": "Constitution de 1989"},
                    {"id": "0000011", "title": "Révision constitutionnelle de 1980"},
                    {"id": "0000012", "title": "Révision constitutionnelle de 1979"},
                    {"id": "0000017", "title": "Constitution de 1976"},
                    {"id": "0000018", "title": "Constitution de 1963"},
                    {"id": "0000019", "title": "Plateforme de la Soummam 20 Août 1956"},
                    {"id": "0000020", "title": "Déclaration du 1 Novembre 1954"},
                    {"id": "0000021", "title": "Projet de révision de la constitution"},
                    {"id": "0000022", "title": "Loi organique n°18-17 relative à l'académie algérienne de la Langue Amazighe"},
                    {"id": "0000023", "title": "Loi n° 14-08 modifiant et complétant l'ordonnance n° 70-20 relative à l'état civil"},
                    {"id": "0000024", "title": "Loi n° 05-07 relative aux hydrocarbures"},
                    {"id": "0000025", "title": "Loi n° 01-20 relative au développement et à l'aménagement durable du territoire"},
                    {"id": "0000026", "title": "Loi n° 08-09 portant code de procédure civile et administrative"},
                    {"id": "0000027", "title": "Loi n° 04-20 relative à la prévention des risques majeurs et à la gestion des catastrophes dans le cadre du développement durable"},
                    {"id": "0000028", "title": "Loi n° 89-28 relative aux réunions et manifestations publiques"},
                    {"id": "0000029", "title": "Loi n° 12-07 relative à la wilaya"},
                    {"id": "0000030", "title": "Loi n° 09-03 la protection du consommateur et à la répression des fraudes"},
                    {"id": "0000031", "title": "Loi n° 14-06 relative au service national"},
                    {"id": "0000032", "title": "Loi n° 03-01 relative au développement durable du tourisme"},
                    {"id": "0000033", "title": "Loi n° 13-01 modifiant et complétant la loi n° 05-07 relative aux hydrocarbures"},
                    {"id": "0000034", "title": "Loi n° 11-10 relative à la commune"},
                    {"id": "0000035", "title": "Loi n° 84-09 relative à l'organisation territoriale du pays"},
                    {"id": "0000036", "title": "Décret présidentiel n° 15-140 portant création de circonscriptions administratives dans certaines wilyas"},
                    {"id": "0000037", "title": "Loi organique N 12-01 relative au régime électoral"},
                    {"id": "0000038", "title": "Loi organique N°12-04 relative aux partis politiques"},
                    {"id": "0000039", "title": "Ordonnance n° 70-20 portant code de l'état civil"},
                    {"id": "0000040", "title": "Ordonnance n° 75-59 portant code de commerce modifiée et complétée"},
                    {"id": "0000041", "title": "Ordonnance n° 75-58 portant code civil modifiée et complétée"},
                    {"id": "0000042", "title": "Ordonnance n° 66-155 portant code de procédure pénale modifiée et complétée"},
                    {"id": "0000043", "title": "Ordonnance n° 01-03 relative au développement de l'investissement"},
                    {"id": "0000044", "title": "Loi n° 84-11 portant code de la famille modifiée et complétée"},
                    {"id": "0000045", "title": "Ordonnance n° 71-28 portant code de justice militaire modifié et complété"},
                    {"id": "0000046", "title": "Loi n° 08-04 portant loi d'orientation sur l'éducation nationale"},
                    {"id": "0000047", "title": "Ordonnance n°06-03 portant statut général de la fonction publique"},
                    {"id": "0000048", "title": "Ordonnance n° 06-01 portant mise en oeuvre de la charte pour la paix et la réconciliation nationale"},
                    {"id": "0000049", "title": "Loi n° 01-18 portant loi d'orientation sur la promotion de la petite et moyenne entreprise (PME)"},
                    {"id": "0000050", "title": "Loi n° 88-01 portant loi d'orientation sur les entreprises économiques publiques"},
                    {"id": "0000051", "title": "Ordonnance n° 10-04 modifiant la l'ordonnance n° 03-11 relative à la monnaie et au crédit"},
                    {"id": "0000052", "title": "Ordonnance n° 03-11 relative à la monnaie et au crédit"},
                    {"id": "0000053", "title": "Décret présidentiel N° 10-236 portant réglementation des marchés publics"},
                    {"id": "0000054", "title": "Décret présidentiel n° 12-23 modifiant et complétant le décret présidentiel n° 10-236 portant réglementation des marchés publics"},
                    {"id": "0000055", "title": "Décret présidentiel n° 13-03 modifiant et complétant le décret présidentiel n° 10-236 portant réglementation des marchés publics"},
                    {"id": "0000056", "title": "Ordonnance n° 12-02 modifiant et complétant la loi n° 05-01 relative à la prévention et à la lutte contre le blanchiment d'argent et le financement du terrorisme"},
                    {"id": "0000057", "title": "Loi N° 85-05 relative à la protection et à la promotion de la santé"},
                    {"id": "0000058", "title": "Loi N° 90-17 modifiant et complétant la loi N°85-05 relative à la protection et à la promotion de la santé"},
                    {"id": "0000059", "title": "Loi N° 90-21 relative à la comptabilité publique"},
                    {"id": "0000060", "title": "Loi N° 90-11 fixant les règles relatives à l'expropriation pour utilité publique"},
                    {"id": "0000061", "title": "Loi N° 99-05 portant orientation de l'enseignement supérieur"},
                    {"id": "0000062", "title": "Loi N° 05-12 relative à l'eau"},
                    {"id": "0000063", "title": "Loi N° 90-11 relative aux relations de travail"},
                    {"id": "0000064", "title": "Loi n° 83-11 relative aux assurances sociales"},
                    {"id": "0000065", "title": "Loi organique n° 12-05 relative à l'information"},
                    {"id": "0000066", "title": "Loi n° 14-04 relative à l'activité audiovisuelle"},
                    {"id": "0000067", "title": "Loi n° 90-29 relative à l'aménagement et l'urbanisme"},
                    {"id": "0000068", "title": "Loi n° 08-15 du fixant les règles de mise en conformité des constructions et leur achèvement"},
                    {"id": "0000069", "title": "Décret exécutif n° 15-19 fixant les modalités d'instruction et de délivrance des actes d'urbanisme"},
                    {"id": "0000070", "title": "Décret présidentiel n° 15-247 portant réglementation des marchés publics et des délégations de service public"},
                    {"id": "0000071", "title": "تنظيم الوكالة الجزائرية لترقية الاستثمار وسيرها"},
                    {"id": "0000072", "title": "النصوص التطبيقية لقانون الاسثتمار 22-18"},
                    {"id": "0000073", "title": "قانون رقم 22-18 يتعلق بالاستثمار"},
                    {"id": "0000074", "title": "قانون رقم 08-04 يتضمن القانون التوجيهي للتربية الوطنية"},
                    {"id": "0000075", "title": "أمر رقم 06-01 يتضمن تنفيذ ميثاق السلم و المصالحة الوطنية"},
                    {"id": "0000076", "title": "قانون رقم 01-18 يتضمن القانون التوجيهي لترقية المؤسسات الصغيرة و المتوسطة"},
                    {"id": "0000077", "title": "أمر رقم 06-03 يتضمن القانون الأساسي للوظيفة العمومية"},
                    {"id": "0000078", "title": "قانون رقم 88-01 يتضمن القانون التوجيهي للمؤسسات الاقتصادية العمومية"},
                    {"id": "0000079", "title": "قانون رقم 84-17 يتعلق بقوانين المالية"},
                    {"id": "0000080", "title": "أمر رقم 03-11 يتعلق بالنقد و القرض"},
                    {"id": "0000081", "title": "أمر رقم 10-04 يعدل و يتمم الأمر رقم 03-11 و المتعلق بالنقد و القرض"},
                    {"id": "0000082", "title": "مرسوم رئاسي رقم 12-23 يعدل و يتمم للمرسوم الرئاسي رقم 10-236 والمتعلق بتنظيم الصفقات العمومية"},
                    {"id": "0000087", "title": "مرسوم رئاسي رقم 13-03 يعدل ويتمم المرسوم الرئاسي رقم 10-236 و المتضن تنظيم الصفقات العمومية"},
                    {"id": "0000088", "title": "أمر رقم 12-02 يعدل و يتمم للقانون رقم 05-01 و المتعلق بالوقاية و مكافحة تبييض الأموال و تمويل الإرهاب"},
                    {"id": "0000089", "title": "قانون رقم 90-17 يعدل و يتمم للقانون رقم 85-05 و المتعلق بحماية و ترقية الصحة"},
                    {"id": "0000090", "title": "قانون رقم 90-21 يتعلق بالمحاسبة العمومية"},
                    {"id": "0000091", "title": "قانون رقم 99-05 يتضمن القانون التوجيهي للتعليم العالي"},
                    {"id": "0000092", "title": "قانون رقم 05-12 يتعلق بالمياه"},
                    {"id": "0000093", "title": "قانون رقم 90-11 يتعلق بعلاقات العمل"},
                    {"id": "0000094", "title": "قانون رقم 83-11 يتعلق بالتأمينات الاجتماعية"},
                    {"id": "0000095", "title": "مرسوم إصدار التعديل الدستوري-2020"},
                    {"id": "0000096", "title": "بيان أول نوفمبر 1954"},
                    {"id": "0000097", "title": "القانون العضوي رقم 18-17  المتعلق بالمجمع الجزائري للغة الأمازيغية"},
                    {"id": "0000098", "title": "مرسوم رئاسي رقم 15-247 يتضمن تنظيم الصفقات العمومية و تفويضات المرفق العام"},
                    {"id": "0000099", "title": "أمر رقم 70-20 يتعلق بقانون الحالة المدنية"},
                    {"id": "0000100", "title": "قانون رقم 14-08 يعدل و يتمم الأمر رقم 70-20 و المتعلق الحالة المدنية"},
                    {"id": "0000101", "title": "قانون رقم 04-20 يتعلق بالوقاية من الأخطار الكبرى و تسيير الكوارث في إطار التنمية المستدامة"},
                    {"id": "0000102", "title": "قانون رقم 89-28 يتعلق بالاجتماعات و المظاهرات العمومية"},
                    {"id": "0000103", "title": "قانون رقم 12-07 يتعلق بالولاية"},
                    {"id": "0000104", "title": "قانون رقم 90-25 يتضمن التوجيه العقاري"},
                    {"id": "0000105", "title": "مرسوم رئاسي رقم 10-236 يتضمن تنظيم الصفقات العمومية"},
                    {"id": "0000106", "title": "قانون رقم 90-11 يحدد القواعد المتعلقة بنزع الملكية من أجل المنفعة العمومية"},
                    {"id": "0000107", "title": "قانون رقم 14-04 يتعلق بالنشاط السمعي البصري"},
                    {"id": "0000108", "title": "قانون رقم 90-29 يتعلق بالتهيئة و التعمير"},
                    {"id": "0000109", "title": "قانون رقم 08-15 يحدد قواعد مطابقة البنايات و إتمام انجازها"},
                    {"id": "0000110", "title": "مرسوم تنفيذي رقم 15-19 يحدد كيفيات تحضير عقود التعمير و تسليمها"},
                    {"id": "0000111", "title": "قانون 09-03 يتعلق بحماية المستهلك و قمع الغش"},
                    {"id": "0000112", "title": "قانون رقم 14-06 يتعلق بالخدمة الوطنية"},
                    {"id": "0000113", "title": "قانون رقم 11-10 يتعلق بالبلدية"},
                    {"id": "0000114", "title": "قانون رقم 84-09 يتعلق بالتنظيم الإقليمي للبلاد"},
                    {"id": "0000115", "title": "مرسوم رئاسي رقم 15-140 يتضمن إحداث مقاطعات إدارية داخل بعض الولايات و تحديد القواعد الخاصة المرتبطة بها"},
                    {"id": "0000116", "title": "قانون عضوي رقم 12-01 يتعلق بنظام الانتخابات"},
                    {"id": "0000117", "title": "قانون رقم 13-01 يعدل و يتمم القانون رقم 05-07 و المتعلق بالمحروقات"},
                    {"id": "0000118", "title": "قانون رقم 05-07 يتعلق بالمحروقات"},
                    {"id": "0000119", "title": "قانون رقم 03-01 يتعلق بالتنمية المستدامة للسياحة"},
                    {"id": "0000120", "title": "قانون رقم 01-20 يتعلق بتهيئة الإقليم وتنميته المستدامة"},
                    {"id": "0000121", "title": "قانون عضوي رقم 12-04 يتعلق بالاحزاب السياسية"},
                    {"id": "0000122", "title": "أمر رقم 75-59 يتضمن القانون التجاري معدل و متمم"},
                    {"id": "0000123", "title": "قانون رقم 08-09 يتضمن قانون الاجراءات المدنية و الإدارية"},
                    {"id": "0000124", "title": "أمر رقم 66-156 يتضمن قانون الاجراءات الجزائية معدل و متمم"},
                    {"id": "0000125", "title": "أمر رقم 97-07 معدل و متمم يتضمن القانون العضوي المتعلق بالنظام الانتخابي"},
                    {"id": "0000126", "title": "قانون رقم 84-11 يتضمن قانون الاسرة معدل و متمم"},
                    {"id": "0000127", "title": "أمر رقم 71-28 يتضمن قانون القضاء العسكري معدل و متمم"},
                    {"id": "0000128", "title": "قانون عضوي رقم 12-05 يتعلق بالاعلام"},
                    {"id": "0000129", "title": "مشروع تمهيدي لتعديل الدستور - ماي 2020"},
                    {"id": "0000130", "title": "التعديل الدستوري لسنة 2016"},
                    {"id": "0000131", "title": "التعديل الدستوري لسنة 2008"},
                    {"id": "0000132", "title": "التعديل الدستوري لسنة 2002"},
                    {"id": "0000133", "title": "أمر رقم 01-03 يتعلق بتطوير الاستثمار"},
                    {"id": "0000134", "title": "مشروع تعديل الدستور"},
                    {"id": "0000135", "title": "التعديل الدستوري لسنة 1996"},
                    {"id": "0000136", "title": "التعديل الدستوري لسنة 1988"},
                    {"id": "0000137", "title": "التعديل الدستوري لسنة 1979"},
                    {"id": "0000138", "title": "Loi de Finances pour 2024"},
                    {"id": "0000139", "title": "Loi de finance rectificative pour 2023"},
                    {"id": "0000140", "title": "Loi de finance 2023"},
                    {"id": "0000141", "title": "Ordonnance 22-01 portant loi de finances complémentaire 2022"},
                    {"id": "0000142", "title": "Loi de finance 2022"},
                    {"id": "0000143", "title": "Loi de finance complémentaire 2021"},
                    {"id": "0000144", "title": "Loi de finance 2021"},
                    {"id": "0000145", "title": "Loi de finances 2020"},
                    {"id": "0000146", "title": "Loi de finances 2019"},
                    {"id": "0000147", "title": "Loi de finances 2018"},
                    {"id": "0000148", "title": "Loi de finances 2017"},
                    {"id": "0000149", "title": "Loi de finances 2016"},
                    {"id": "0000150", "title": "Loi de finances complémentaire pour 2015"},
                    {"id": "0000151", "title": "Loi de finances pour 2015"},
                    {"id": "0000152", "title": "قانون المالية 2024"},
                    {"id": "0000153", "title": "قانون المالية التصحيحي لسنة 2023"},
                    {"id": "0000154", "title": "قانون المالية لسنة 2023"},
                    {"id": "0000155", "title": "أمر 22-01 يتضمن قانون المالية التكميلي لسنة 2022"},
                    {"id": "0000156", "title": "قانون المالية 2022"},
                    {"id": "0000157", "title": "قانون المالية التكميلي لسنة 2021"},
                    {"id": "0000158", "title": "قانون المالية لسنة 2021"},
                    {"id": "0000159", "title": "قانون المالية لسنة 2020"},
                    {"id": "0000160", "title": "قانون المالية التكميلي لسنة 2020"},
                    {"id": "0000161", "title": "قانون المالية لسنة 2019"},
                    {"id": "0000162", "title": "قانون المالية التكميلي لسنة 2018"},
                    {"id": "0000163", "title": "قانون المالية لسنة 2018"},
                    {"id": "0000164", "title": "قانون المالية لسنة 2017"},
                    {"id": "0000165", "title": "قانون المالية لسنة 2016"},
                    {"id": "0000166", "title": "قانون المالية التكميلي لسنة 2015"},
                    {"id": "0000167", "title": "قانون المالية لسنة 2015"}
                    ];

                    async function importToProduction() {
                        let connection;

                    try {
                        console.log('🔌 Connexion à la base de données de PRODUCTION...');
                    console.log(`   Host: ${dbConfig.host}`);
                    console.log(`   Database: ${dbConfig.database}\n`);

                    connection = await mysql.createConnection(dbConfig);

                    // Supprimer tous les anciens documents
                    console.log('🗑️  Suppression de tous les anciens documents...');
                    const [deleteResult] = await connection.execute('DELETE FROM legal_library');
                    console.log(`✅ ${deleteResult.affectedRows} documents supprimés\n`);

                    // Importer les 159 nouveaux documents
                    console.log('📑 Importation des 159 documents...\n');

                    let imported = 0;
                    let errors = 0;

                    for (const doc of documents) {
            try {
                const category = categorizeDocument(doc.title);
                    const lang = detectLanguage(doc.title);
                    const fileName = `${doc.id}.pdf`;
                    const gcs_uri = `gs://legaldz/${doc.id}.pdf`;

                    await connection.execute(`
                    INSERT INTO legal_library (id, title, category, lang, file_name, gcs_uri)
                    VALUES (?, ?, ?, ?, ?, ?)
                    `, [doc.id, doc.title, category, lang, fileName, gcs_uri]);

                    imported++;
                    if (imported % 20 === 0) {
                        console.log(`   ${imported}/159 documents importés...`);
                }
            } catch (err) {
                        errors++;
                    console.error(`❌ Erreur pour ${doc.id}:`, err.message);
            }
        }

                    console.log('\n' + '='.repeat(60));
                    console.log('📊 RÉSUMÉ');
                    console.log('='.repeat(60));
                    console.log(`✅ Documents importés: ${imported}/159`);
                    console.log(`❌ Erreurs: ${errors}`);
                    console.log('='.repeat(60));
        
    } catch (error) {
                        console.error('❌ Erreur fatale:', error);
                    process.exit(1);
    } finally {
        if (connection) {
                        await connection.end();
                    console.log('\n🔚 Connexion fermée.');
        }
    }
}

importToProduction().then(() => {
                        console.log('\n✨ Importation en production terminée!');
                    process.exit(0);
}).catch((error) => {
                        console.error('💥 Erreur:', error);
                    process.exit(1);
});
