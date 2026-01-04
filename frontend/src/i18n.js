import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  fr: {
    translation: {
      "brand": "Dz Legal AI",

      // --- AUTHENTIFICATION ---
      "auth": {
        "login_title": "Bon retour parmi nous",
        "register_title": "Créer un nouveau compte",
        "full_name": "Nom complet",
        "email": "Email",
        "whatsapp": "Numéro WhatsApp",
        "password": "Mot de passe",

        "role": "Je suis...",
        "role_lawyer": "Avocat",
        "role_judge": "Magistrat",
        "role_notary": "Notaire",
        "role_bailiff": "Huissier",
        "role_corporate": "Juriste",
        "role_expert": "Expert",
        "role_student": "Étudiant",
        "role_other": "Autre",
        "role_admin": "Administrateur",

        "login_btn": "Se connecter",
        "register_btn": "S'inscrire",
        "have_account": "Déjà un compte ?",
        "no_account": "Pas encore de compte ?",
        "link_login": "Se connecter",
        "link_register": "Créer un compte",

        "forgot_title": "Mot de passe oublié ?",
        "forgot_desc": "Entrez votre email pour recevoir un lien.",
        "send_link": "Envoyer le lien",
        "reset_title": "Réinitialiser",
        "new_password": "Nouveau mot de passe",
        "confirm_btn": "Confirmer",
        "back_login": "Retour connexion",
        "email_sent": "Si le compte existe, email envoyé.",
        "password_updated": "Mot de passe mis à jour !"
      },

      // --- NAVIGATION ---
      "nav": {
        "home": "Tableau de bord",
        "chat": "Assistant Juridique",
        "docs": "Mes Documents",
        "texts": "Textes de lois",
        "my_group": "Mon Groupe",
        "create_group": "Créer Groupe",
        "admin": "Administration",
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
        "q6": "Comment créer un compte pour mon Groupe ?",
        "a6": "Contactez notre support pour activer le mode Organisation multi-utilisateurs.",
        "q7": "J'ai oublié mon mot de passe ?",
        "a7": "Utilisez le lien 'Mot de passe oublié' sur la page de connexion pour recevoir un lien de réinitialisation.",
        "q8": "Puis-je utiliser l'application sur mobile ?",
        "a8": "Oui, l'interface est entièrement responsive et adaptée aux mobiles."
      },

      // --- PLANS ---
      "plans": {
        "title": "Choisissez votre plan",
        "subtitle": "Des solutions adaptées aux étudiants, avocats et grands groupes.",
        "free_trial": "GRATUIT (Test)",
        "basic": "BASIQUE",
        "premium": "PREMIUM",
        "organization": "GROUPE (Cabinet/Entreprise)",
        "pro": "GROUPE (Cabinet/Entreprise)",
        "features_label": "Fonctionnalités :",
        "feat_chat": "Questions / Jour",
        "feat_doc": "Analyses Documents / Mois",
        "feat_history": "Historique des conversations",
        "feat_support": "Support prioritaire",
        "btn_subscribe": "Choisir ce plan",
        "contact_sales": "Contacter les ventes"
      },
      "status": { "active": "Actif", "expired": "Expiré" },

      // --- ADMINISTRATION ---
      "admin": {
        "title": "Administration Système",
        "subtitle": "Vue d'ensemble et gestion.",
        "tab_dashboard": "Tableau de bord",
        "tab_users": "Utilisateurs",
        "tab_groups": "Groupes",
        "kpi_users": "Utilisateurs Totaux",
        "kpi_groups": "Groupes",
        "kpi_new": "Nouveaux (7j)",
        "kpi_revenue": "Revenus (Est.)",
        "latest_users": "Derniers Inscrits",
        "expiring_subs": "Abonnements Expirants",
        "nothing_to_report": "Rien à signaler.",
        "col_user": "Utilisateur",
        "col_role": "Rôle",
        "col_status": "État",
        "col_plan": "Plan",
        "col_actions": "Actions",
        "col_group": "Groupe",
        "col_manager": "Responsable",
        "col_members": "Membres",
        "modal_edit_user": "Modifier Plan Utilisateur",
        "modal_edit_group": "Modifier Plan Groupe",
        "btn_save": "Enregistrer",
        "user_blocked": "Bloqué",
        "user_active": "Actif",
        "group_suspended": "Suspendu"
      }
    }
  },

  ar: {
    translation: {
      "brand": "Dz Legal AI",

      // --- AUTHENTIFICATION (AR) ---
      "auth": {
        "login_title": "مرحبًا بعودتك",
        "register_title": "إنشاء حساب جديد",
        "full_name": "الاسم الكامل",
        "email": "البريد الإلكتروني",
        "whatsapp": "رقم الواتساب",
        "password": "كلمة المرور",
        "role": "صفتي المهنية...",
        "role_lawyer": "محامي",
        "role_judge": "قاضي",
        "role_notary": "موثق",
        "role_bailiff": "محضر",
        "role_corporate": "مستشار قانوني",
        "role_expert": "خبير",
        "role_student": "طالب",
        "role_other": "آخر",
        "role_admin": "مسؤول النظام",

        "login_btn": "دخول",
        "register_btn": "تسجيل",
        "forgot_title": "نسيت كلمة المرور؟",
        "forgot_desc": "أدخل بريدك لاستعادة الحساب.",
        "send_link": "إرسال",
        "reset_title": "إعادة تعيين",
        "new_password": "كلمة المرور الجديدة",
        "confirm_btn": "تأكيد",
        "back_login": "عودة",
        "email_sent": "تم الإرسال.",
        "password_updated": "تم التحديث!"
      },

      // --- NAVIGATION (AR) ---
      "nav": {
        "home": "لوحة القيادة",
        "chat": "المساعد القانوني",
        "docs": "وثائقي",
        "texts": "النصوص القانونية",
        "my_group": "مجموعتي",
        "create_group": "إنشاء مجموعة",
        "admin": "الإدارة",
        "logout": "خروج"
      },

      // --- PAGES (AR) ---
      "pages": {
        "home": {
          "title": "لوحة القيادة",
          "welcome": "مرحبًا بكم في المساعد الذكي في القانون الجزائري",
          "stats_chat": "المحادثات",
          "stats_doc": "المستندات",
          "stats_sub": "الاشتراك",
          "ready_title": "جاهز للعمل؟",
          "ready_desc": "استخدم المساعد أو قم بتحليل ملف PDF."
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
        "q6": "كيف أنشئ حسابًا لمجموعتي (مؤسسة)؟",
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
        "free_trial": "مجاني (تجريبي)",
        "basic": "أساسي",
        "premium": "بريميوم",
        "organization": "مجموعة (مكتب/شركة)",
        "pro": "مجموعة (مكتب/شركة)",
        "features_label": "المميزات :",
        "feat_chat": "أسئلة / يوم",
        "feat_doc": "تحليل مستندات / شهر",
        "feat_history": "سجل المحادثات",
        "feat_support": "دعم ذو أولوية",
        "btn_subscribe": "اختر هذه الخطة",
        "contact_sales": "اتصل بالمبيعات"
      },
      "status": { "active": "نشط", "expired": "منتهي" },

      // --- ADMINISTRATION (AR) ---
      "admin": {
        "title": "إدارة النظام",
        "subtitle": "نظرة عامة.",
        "tab_dashboard": "لوحة القيادة",
        "tab_users": "المستخدمين",
        "tab_groups": "المجموعات",
        "kpi_users": "إجمالي المستخدمين",
        "kpi_groups": "المجموعات",
        "kpi_new": "جديد",
        "kpi_revenue": "الإيرادات",
        "latest_users": "آخر المسجلين",
        "expiring_subs": "اشتراكات تنتهي",
        "nothing_to_report": "لا توجد تنبيهات.",
        "col_user": "المستخدم",
        "col_role": "الدور",
        "col_status": "الحالة",
        "col_plan": "الخطة",
        "col_actions": "إجراءات",
        "col_group": "المجموعة",
        "col_manager": "المسؤول",
        "col_members": "الأعضاء",
        "modal_edit_user": "تعديل خطة المستخدم",
        "modal_edit_group": "تعديل خطة المجموعة",
        "btn_save": "حفظ",
        "user_blocked": "محظور",
        "user_active": "نشط",
        "group_suspended": "معلق"
      }
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
    if (i18n.language === 'ar') {
      document.documentElement.dir = 'rtl';
      document.documentElement.lang = 'ar';
    } else {
      document.documentElement.dir = 'ltr';
      document.documentElement.lang = 'fr';
    }
  });

export default i18n;