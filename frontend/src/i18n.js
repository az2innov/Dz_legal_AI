import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  fr: {
    translation: {
      "brand": "Lexya",
      
      // --- AUTHENTIFICATION ---
      "auth": {
        "login_title": "Bon retour parmi nous",
        "register_title": "Créer un nouveau compte",
        "full_name": "Nom complet",
        "email": "Email",
        "password": "Mot de passe",
        
        "role": "Je suis...",
        "role_lawyer": "Avocat",
        "role_judge": "Magistrat (Juge/Procureur)",
        "role_notary": "Notaire",
        "role_bailiff": "Huissier de Justice",
        "role_corporate": "Juriste d'Entreprise",
        "role_expert": "Expert Judiciaire",
        "role_student": "Étudiant en Droit",
        "role_other": "Autre / Particulier",

        "login_btn": "Se connecter",
        "register_btn": "S'inscrire",
        "have_account": "Déjà un compte ?",
        "no_account": "Pas encore de compte ?",
        "link_login": "Se connecter",
        "link_register": "Créer un compte",
        
        "error_login": "Email ou mot de passe incorrect",
        "error_register": "Erreur lors de l'inscription (Email déjà pris ?)",
        "success_register": "Compte créé ! Vous pouvez vous connecter.",
        
        "forgot_title": "Mot de passe oublié ?",
        "forgot_desc": "Entrez votre email pour recevoir un lien de réinitialisation.",
        "send_link": "Envoyer le lien",
        "reset_title": "Réinitialiser le mot de passe",
        "new_password": "Nouveau mot de passe",
        "confirm_btn": "Confirmer le changement",
        "back_login": "Retour à la connexion",
        "email_sent": "Si un compte existe avec cet email, vous recevrez un lien.",
        "password_updated": "Mot de passe mis à jour avec succès !"
      },

      // --- NAVIGATION ---
      "nav": { 
        "home": "Tableau de bord", 
        "chat": "Assistant Juridique", 
        "docs": "Mes Documents", 
        "logout": "Déconnexion" 
      },

      // --- PAGES ---
      "pages": {
        "home": { 
            "title": "Tableau de bord",
            "welcome": "Bienvenue dans l'assistant intelligent du droit algérien.",
            "stats_chat": "Recherches effectuées",
            "stats_doc": "Documents analysés",
            "stats_sub": "Abonnement",
            "ready_title": "Prêt à travailler ?",
            "ready_desc": "Accédez à l'onglet Assistant pour poser une question juridique ou à l'onglet Documents pour analyser un fichier PDF."
        },
        "chat": { "title": "Assistant Juridique", "desc": "Posez vos questions juridiques ici." },
        "docs": { "title": "Mes Documents", "desc": "Analysez vos documents juridiques ici." }
      },

      // --- LANDING PAGE ---
      "landing": {
        "hero_title": "L'Intelligence Artificielle au service du Droit Algérien",
        "hero_subtitle": "Analysez vos documents, posez des questions complexes et obtenez des réponses précises basées sur la législation officielle.",
        "cta_start": "Commencer maintenant",
        "cta_login": "Se connecter",
        "features": "Fonctionnalités",
        "pricing": "Tarifs",
        "faq": "FAQ"
      },

      // --- FOOTER ---
      "footer": {
        "copyright": "Créé par",
        "rights": "Tous droits réservés.",
        "contact_us": "Contactez-nous",
        "follow_us": "SUIVEZ-NOUS",
        "back_home": "Retour à l'accueil"
      },

      // --- FAQ ---
      "faq": {
        "title": "Questions Fréquentes",
        "q1": "Dz Legal AI est-il gratuit ?",
        "a1": "Nous proposons une version d'essai gratuite. Pour une utilisation illimitée, des plans professionnels sont disponibles.",
        "q2": "Les réponses sont-elles fiables ?",
        "a2": "Nos réponses sont basées exclusivement sur le Journal Officiel et les Codes algériens. Cependant, cela reste une aide à la décision et ne remplace pas un avocat.",
        "q3": "Mes documents sont-ils sécurisés ?",
        "a3": "Oui. Vos documents sont analysés dans un environnement sécurisé et ne sont pas partagés.",
        "q4": "Comment fonctionne le Chatbot ?",
        "a4": "Notre IA utilise la technologie RAG (Retrieval-Augmented Generation) pour chercher la réponse dans les textes de loi avant de répondre.",
        "q5": "Comment fonctionne l'analyse de documents ?",
        "a5": "Nous utilisons l'IA Gemini de Google pour lire et comprendre vos PDF, même scannés (OCR), et en extraire les informations clés.",
        "q6": "Comment créer un compte pour mon Cabinet ?",
        "a6": "Contactez notre support pour activer le mode Organisation multi-utilisateurs.",
        "q7": "J'ai oublié mon mot de passe ?",
        "a7": "Utilisez le lien 'Mot de passe oublié' sur la page de connexion pour recevoir un lien de réinitialisation.",
        "q8": "Puis-je utiliser l'application sur mobile ?",
        "a8": "Oui, l'interface est entièrement responsive et adaptée aux mobiles."
      },

      // --- PLANS ---
      "plans": {
          "title": "Choisissez votre plan",
          "subtitle": "Des solutions adaptées aux étudiants, avocats et grands cabinets.",
          "free_trial": "Essai Gratuit",
          "basic": "Basique",
          "premium": "Premium",
          "organization": "Organisation",
          "features_label": "Fonctionnalités :",
          "feat_chat": "Questions / Jour",
          "feat_doc": "Analyses Documents / Mois",
          "feat_history": "Historique des conversations",
          "feat_support": "Support prioritaire",
          "btn_subscribe": "Choisir ce plan",
          "contact_sales": "Contacter les ventes"
      },
      "status": { "active": "Actif", "expired": "Expiré" }
    }
  },
  
  ar: {
    translation: {
      "brand": "ليكسيا",
      
      // --- AUTHENTIFICATION (AR) ---
      "auth": {
        "login_title": "مرحبًا بعودتك",
        "register_title": "إنشاء حساب جديد",
        "full_name": "الاسم الكامل",
        "email": "البريد الإلكتروني",
        "password": "كلمة المرور",
        
        "role": "صفتي المهنية...",
        "role_lawyer": "محامي",
        "role_judge": "قاضي / وكيل جمهورية",
        "role_notary": "موثق",
        "role_bailiff": "محضر قضائي",
        "role_corporate": "مستشار قانوني للمؤسسة",
        "role_expert": "خبير قضائي",
        "role_student": "طالب حقوق",
        "role_other": "آخر / فرد",

        "login_btn": "تسجيل الدخول",
        "register_btn": "إنشاء حساب",
        "have_account": "لديك حساب بالفعل؟",
        "no_account": "ليس لديك حساب؟",
        "link_login": "تسجيل الدخول",
        "link_register": "إنشاء حساب",
        
        "error_login": "البريد الإلكتروني أو كلمة المرور غير صحيحة",
        "error_register": "خطأ في التسجيل",
        "success_register": "تم إنشاء الحساب! يمكنك تسجيل الدخول.",

        "forgot_title": "نسيت كلمة المرور؟",
        "forgot_desc": "أدخل بريدك الإلكتروني لتلقي رابط إعادة التعيين.",
        "send_link": "إرسال الرابط",
        "reset_title": "إعادة تعيين كلمة المرور",
        "new_password": "كلمة المرور الجديدة",
        "confirm_btn": "تأكيد التغيير",
        "back_login": "العودة لتسجيل الدخول",
        "email_sent": "إذا كان الحساب موجودًا، ستتلقى رابطًا.",
        "password_updated": "تم تحديث كلمة المرور بنجاح!"
      },

      // --- NAVIGATION (AR) ---
      "nav": { "home": "لوحة القيادة", "chat": "المساعد القانوني", "docs": "وثائقي", "logout": "تسجيل الخروج" },

      // --- PAGES (AR) ---
      "pages": {
        "home": { 
            "title": "لوحة القيادة", 
            "welcome": "مرحبًا بكم في المساعد الذكي في القانون الجزائري",
            "stats_chat": "المحادثات اليومية",
            "stats_doc": "تحليل المستندات (شهري)",
            "stats_sub": "الاشتراك الحالي",
            "ready_title": "جاهز للعمل؟",
            "ready_desc": "انتقل إلى تبويب المساعد لطرح سؤال قانوني أو تبويب وثائقي لتحليل ملف PDF."
        },
        "chat": { "title": "المساعد القانوني", "desc": "اطرح أسئلتك القانونية هنا." },
        "docs": { "title": "وثائقي", "desc": "قم بتحليل مستنداتك القانونية هنا." }
      },

      // --- LANDING PAGE (AR) ---
      "landing": {
        "hero_title": "الذكاء الاصطناعي في خدمة القانون الجزائري",
        "hero_subtitle": "قم بتحليل مستنداتك، اطرح أسئلة معقدة واحصل على إجابات دقيقة تستند إلى التشريعات الرسمية.",
        "cta_start": "ابدأ الآن",
        "cta_login": "تسجيل الدخول",
        "features": "المميزات",
        "pricing": "الأسعار",
        "faq": "الأسئلة الشائعة"
      },

      // --- FOOTER (AR) ---
      "footer": {
        "copyright": "تم التطوير بواسطة",
        "rights": "جميع الحقوق محفوظة.",
        "contact_us": "اتصل بنا",
        "follow_us": "تابعنا",
        "back_home": "العودة للرئيسية"
      },

      // --- FAQ (AR) ---
      "faq": {
        "title": "الأسئلة الشائعة",
        "q1": "هل Dz Legal AI مجاني؟",
        "a1": "نقدم نسخة تجريبية مجانية. للاستخدام غير المحدود، تتوفر خطط احترافية.",
        "q2": "هل الإجابات موثوقة؟",
        "a2": "تستند إجاباتنا حصريًا إلى الجريدة الرسمية والقوانين الجزائرية. ومع ذلك، تبقى أداة مساعدة.",
        "q3": "هل مستنداتي آمنة؟",
        "a3": "نعم. يتم تحليل مستنداتك في بيئة آمنة ولا يتم مشاركتها مع مستخدمين آخرين.",
        "q4": "كيف يعمل المساعد الآلي؟",
        "a4": "يستخدم ذكاؤنا الاصطناعي تقنية RAG للبحث في النصوص القانونية الرسمية قبل الإجابة.",
        "q5": "كيف يعمل تحليل المستندات؟",
        "a5": "نستخدم نماذج متطورة (Gemini) لقراءة وفهم ملفات PDF المصورة (OCR) واستخراج النقاط الرئيسية.",
        "q6": "كيف أنشئ حسابًا لمكتبي (مؤسسة)؟",
        "a6": "اتصل بفريق الدعم لتفعيل ميزة المؤسسة متعددة المستخدمين.",
        "q7": "نسيت كلمة المرور؟",
        "a7": "استخدم رابط 'نسيت كلمة المرور' في صفحة الدخول لاستعادة حسابك.",
        "q8": "هل يمكنني استخدام التطبيق على الهاتف؟",
        "a8": "نعم، المنصة تعمل بكفاءة تامة على الهواتف والأجهزة اللوحية."
      },

      // --- PLANS (AR) ---
      "plans": {
          "title": "اختر خطتك",
          "subtitle": "حلول تناسب الطلاب، المحامين، والشركات الكبرى.",
          "free_trial": "تجربة مجانية",
          "basic": "أساسي",
          "premium": "بريميوم",
          "organization": "مؤسسة",
          "features_label": "المميزات :",
          "feat_chat": "أسئلة / يوم",
          "feat_doc": "تحليل مستندات / شهر",
          "feat_history": "سجل المحادثات",
          "feat_support": "دعم ذو أولوية",
          "btn_subscribe": "اختر هذه الخطة",
          "contact_sales": "اتصل بالمبيعات"
      },
      "status": { "active": "نشط", "expired": "منتهي" }
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'fr',
    interpolation: { escapeValue: false }
  }, (err, t) => {
    // Gestion de la direction RTL/LTR
    if (i18n.language === 'ar') {
      document.documentElement.dir = 'rtl';
      document.documentElement.lang = 'ar';
    } else {
      document.documentElement.dir = 'ltr';
      document.documentElement.lang = 'fr';
    }
  });

export default i18n;