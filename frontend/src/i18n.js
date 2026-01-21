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
        "password_updated": "Mot de passe mis à jour !",
        "error_register": "Erreur lors de l'inscription. Veuillez réessayer.",
        "error_login": "Identifiants incorrects ou compte non vérifié."
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
        "chat": {
          "title": "Assistant Juridique",
          "desc": "Posez vos questions juridiques ici.",
          "new_chat": "Nouvelle conversation",
          "welcome": "Bonjour. Je suis votre assistant juridique intelligent. Comment puis-je vous aider aujourd'hui ?"
        },
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

        // Questions existantes (1-8)
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
        "a6": "Contactez notre support pour activer le mode Groupe multi-utilisateurs.",

        "q7": "J'ai oublié mon mot de passe ?",
        "a7": "Utilisez le lien 'Mot de passe oublié' sur la page de connexion pour recevoir un lien de réinitialisation.",

        "q8": "Puis-je utiliser l'application sur mobile ?",
        "a8": "L'application est actuellement optimisée pour une utilisation sur ordinateur (desktop). Bien que certaines fonctionnalités soient accessibles sur mobile, nous recommandons d'utiliser un ordinateur pour une expérience optimale. Une version mobile complète est prévue prochainement.",

        // === NOUVELLES QUESTIONS GÉNÉRALES ===
        "q9": "Comment fonctionne l'intelligence artificielle juridique ?",
        "a9": "Notre IA analyse les textes juridiques algériens officiels (Journal Officiel, Codes) et utilise des modèles de langage avancés pour comprendre votre question, rechercher les articles pertinents, et générer une réponse précise en langage clair.",

        "q10": "Quelles sont vos sources de textes de loi ?",
        "a10": "Nous utilisons exclusivement des sources officielles : le Journal Officiel de la République Algérienne, les Codes en vigueur (Code civil, pénal, commerce, etc.) et les textes réglementaires publiés officiellement. Nos bases sont mises à jour régulièrement.",

        "q11": "L'assistant peut-il remplacer un avocat ?",
        "a11": "Non. Dz Legal AI est un outil d'aide à la décision et de recherche juridique. Il facilite l'accès à l'information légale mais ne remplace pas les conseils personnalisés d'un avocat professionnel, notamment pour des situations complexes ou litiges.",

        "q12": "Puis-je faire confiance aux réponses fournies ?",
        "a12": "Nos réponses sont basées sur des textes officiels et vérifiées par notre système. Cependant, nous recommandons toujours de vérifier les informations critiques avec un professionnel du droit, car le contexte spécifique de votre cas peut influencer l'application de la loi.",

        "q13": "Comment puis-je annuler mon abonnement ?",
        "a13": "Vous pouvez annuler votre abonnement à tout moment depuis votre tableau de bord. L'accès reste actif jusqu'à la fin de la période payée. Aucun remboursement n'est effectué pour les périodes déjà facturées.",

        // === QUESTIONS TECHNIQUES ===
        "q14": "Quels formats de documents acceptez-vous ?",
        "a14": "Nous acceptons les fichiers PDF (y compris scannés grâce à notre OCR), ainsi que les images (PNG, JPG) contenant du texte. La taille maximale par document varie selon votre plan d'abonnement.",

        "q15": "Quelle est la taille maximale d'un document ?",
        "a15": "Plan Gratuit : 5 pages max. Plan Basique : 20 pages. Plan Premium : 50 pages. Plan Groupe : pages illimitées. Les documents trop volumineux peuvent être divisés pour l'analyse.",

        "q16": "Comment mes données sont-elles sécurisées ?",
        "a16": "Vos données sont chiffrées en transit (HTTPS) et au repos. Les documents sont stockés dans des environnements sécurisés conformes aux normes internationales. Nous ne partageons jamais vos données avec des tiers sans votre consentement explicite.",

        "q17": "Êtes-vous conforme au RGPD ?",
        "a17": "Oui. Nous respectons les principes du RGPD : minimisation des données, droit d'accès, de rectification et de suppression. Vous pouvez à tout moment demander l'exportation ou la suppression de vos données personnelles via le support.",

        // === QUESTIONS ORGANISATIONS ===
        "q18": "Comment inviter des membres dans mon Groupe ?",
        "a18": "Dans la page 'Mon Groupe', entrez l'email du collaborateur et cliquez sur 'Inviter'. Il recevra un email avec un lien d'invitation. Une fois accepté, il aura accès aux fonctionnalités partagées du groupe.",

        "q19": "Comment gérer les rôles dans mon Groupe ?",
        "a19": "Actuellement, tous les membres d'un groupe ont les mêmes droits d'accès. La gestion avancée des rôles (admin, membre, lecture seule) sera ajoutée prochainement dans une future mise à jour.",

        "q20": "Comment fonctionne la facturation pour les Groupes ?",
        "a20": "Le plan Groupe (5 accès) est facturé mensuellement. Le responsable du groupe reçoit une facture unique couvrant tous les membres. Les quotas (questions, documents) sont partagés entre tous les membres du groupe.",

        // === QUESTIONS ABONNEMENTS & TARIFICATION ===
        "q21": "Puis-je changer de plan à tout moment ?",
        "a21": "Oui. Vous pouvez passer à un plan supérieur immédiatement (upgrade). Pour rétrograder vers un plan inférieur (downgrade), le changement prendra effet à la prochaine période de facturation pour éviter toute perte de service.",

        "q22": "Proposez-vous des réductions pour les étudiants ?",
        "a22": "Le plan Basique est déjà conçu pour être accessible aux étudiants et jeunes professionnels. Pour les groupes d'étudiants (universités, associations), contactez-nous pour discuter de tarifs préférentiels."
      },

      // --- PLANS ---
      "plans": {
        "title": "Choisissez votre plan",
        "subtitle": "Des solutions adaptées aux étudiants, avocats et grands groupes.",
        "free_trial": "GRATUIT (Test)",
        "basic": "BASIQUE",
        "premium": "PREMIUM",
        "organization": "PLAN GROUPE (5 Accès ou Selon devis)",
        "pro": "PLAN GROUPE (5 Accès ou Selon devis)",
        "features_label": "Fonctionnalités :",
        "feat_chat": "Questions / Jour",
        "feat_doc": "Analyses Documents / Mois",
        "feat_history": "Historique des conversations",
        "feat_support": "Support prioritaire",
        "support_community": "Support communautaire",
        "support_email": "Support par email (48h)",
        "support_priority": "Support prioritaire (24h)",
        "support_dedicated": "Support dédié & Facture Unique",
        "basic_features": "Fonctionnalités de base",
        "multi_accounts": "5 Comptes Inclus",
        "account_manager": "Quotas Partagés",
        "plan_free_desc": "Pour découvrir la puissance de l'IA.",
        "plan_basic_desc": "Pour les étudiants et jeunes avocats.",
        "plan_premium_desc": "Pour les professionnels exigeants.",
        "plan_pro_desc": "Pour les équipes (12 000 DZD/mois).",
        "per_month": "/mois",
        "questions_month": "questions / mois",
        "docs_month": "docs / mois",
        "shared": "partagés",
        "unlimited_pages": "Pages illim.",
        "max_pages": "Max",
        "btn_subscribe": "Choisir ce plan",
        "contact_sales": "Demander un devis",

        // Demandes de changement de plan
        "myRequests": "Mes demandes de changement de plan",
        "noRequests": "Aucune demande",
        "noRequestsDescription": "Vous n'avez pas encore fait de demande de changement de plan",
        "statusPending": "En attente",
        "statusApproved": "Approuvé",
        "statusRejected": "Rejeté",
        "statusCancelled": "Annulé",
        "amount": "Montant",
        "paymentMethod": "Méthode de paiement",
        "yourNotes": "Vos notes",
        "adminNotes": "Réponse admin",
        "confirmCancel": "Voulez-vous vraiment annuler cette demande ?",
        "requestCancelled": "Demande annulée avec succès",
        "pendingNotice": "En attente de validation. Si vous avez effectué le paiement, envoyez votre justificatif à"
      },
      "status": { "active": "Actif", "expired": "Expiré" },

      // --- PRICING / DEMANDES DE CHANGEMENT DE PLAN ---
      "pricing": {
        // Modal
        "upgradePlan": "Passer au plan supérieur",
        "changePlan": "Changer de plan",
        "summary": "Récapitulatif",
        "amountToPay": "Montant à régler",
        "noPaymentRequired": "Aucun paiement requis pour ce changement",
        "paymentMethod": "Méthode de paiement",
        "bankTransfer": "🏦 Virement bancaire",
        "cpaDeposit": "🏧 Versement CPA",
        "cash": "💵 Espèces",
        "check": "📝 Chèque bancaire",
        "other": "💳 Autre",
        "yourNotes": "Vos notes (optionnel)",
        "notesPlaceholder": "Des précisions sur votre demande ?",
        "paymentInstructions": "Instructions de paiement",
        "afterSubmit": "Après avoir soumis cette demande",
        "step1": "Vous recevrez un email avec les instructions détaillées",
        "step2": "Effectuez le paiement selon la méthode choisie",
        "step3": "Envoyez votre justificatif à admin@dz-legal-ai.com",
        "step4": "Votre plan sera activé sous 24-48h après vérification",
        "confirmRequest": "Confirmer la demande",
        "requestSuccess": "Demande créée avec succès ! Vous recevrez les instructions par email.",

        // Membres d'organisation
        "orgManaged": "Plan Groupe",
        "orgMemberBlocked": "Votre plan est géré par votre organisation. Contactez votre gestionnaire pour tout changement.",

        // Liste des demandes
        "myRequests": "Mes demandes de changement de plan",
        "noRequests": "Aucune demande",
        "noRequestsDescription": "Vous n'avez pas encore fait de demande de changement de plan",
        "statusPending": "En attente",
        "statusApproved": "Approuvé",
        "statusRejected": "Rejeté",
        "statusCancelled": "Annulé",
        "amount": "Montant",
        "adminNotes": "Réponse admin",
        "confirmCancel": "Voulez-vous vraiment annuler cette demande ?",
        "requestCancelled": "Demande annulée avec succès",
        "pendingNotice": "En attente de validation. Si vous avez effectué le paiement, envoyez votre justificatif à"
      },

      // --- COMMON ---
      "common": {
        "loading": "Chargement...",
        "cancel": "Annuler",
        "save": "Enregistrer",
        "close": "Fermer",
        "confirm": "Confirmer",
        "delete": "Supprimer",
        "edit": "Modifier",
        "search": "Rechercher",
        "filter": "Filtrer",
        "all": "Tout",
        "actions": "Actions"
      },

      // --- ADMINISTRATION ---
      "admin": {
        "title": "Administration Système",
        "subtitle": "Vue d'ensemble et gestion.",
        "tab_dashboard": "Tableau de bord",
        "tab_users": "Utilisateurs",
        "tab_groups": "Groupes",
        "tab_plan_requests": "Demandes Plans",
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
        "group_suspended": "Suspendu",

        // Demandes de plan
        "filter_pending": "En attente",
        "filter_approved": "Approuvées",
        "filter_rejected": "Rejetées",
        "filter_all": "Toutes",
        "col_id": "#",
        "col_change": "Changement",
        "col_amount": "Montant",
        "col_method": "Méthode",
        "col_status": "Statut",
        "col_date": "Date",
        "no_requests": "Aucune demande pour ce statut",
        "btn_approve": "Approuver",
        "btn_reject": "Rejeter",
        "status_processed": "Traitée",
        "modal_approve_title": "Approuver la demande",
        "modal_reject_title": "Rejeter la demande",
        "user_name": "Utilisateur",
        "plan_change": "Changement de plan",
        "amount": "Montant",
        "admin_notes_label": "Notes admin (optionnel)",
        "reject_reason_label": "Raison du rejet",
        "reject_reason_required": "Veuillez indiquer une raison de rejet",
        "approve_notice": "Le plan de l'utilisateur sera automatiquement mis à jour vers",
        "reject_notice": "L'utilisateur recevra un email avec la raison du rejet",
        "confirm_approve": "Confirmer l'approbation",
        "confirm_reject": "Confirmer le rejet",
        "approve_success": "Plan approuvé et activé !",
        "reject_success": "Demande rejetée"
      },

      // --- ORGANISATION ---
      "org": {
        "create_title": "Créer mon Groupe",
        "name_label": "Nom du Groupe",
        "create_btn": "Créer",
        "team_title": "Membres de l'équipe",
        "invite_title": "Inviter un collaborateur",
        "email_label": "Email du collaborateur",
        "invite_btn": "Inviter",
        "invite_desc": "Le collaborateur invité aura accès à tous les documents.",
        "success_create": "Groupe créé avec succès !",
        "success_invite": "Invitation envoyée à ",
        "confirm_remove": "Êtes-vous sûr de vouloir retirer ce membre du groupe ?"
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
        "password_updated": "تم التحديث!",
        "error_register": "خطأ أثناء التسجيل. يرجى المحاولة مرة أخرى.",
        "error_login": "بيانات الاعتماد غير صحيحة أو الحساب غير مفعل."
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
        "chat": {
          "title": "المساعد القانوني",
          "desc": "اطرح أسئلتك القانونية هنا.",
          "new_chat": "محادثة جديدة",
          "welcome": "مرحبًا بك. أنا مساعدك القانوني الذكي. كيف يمكنني مساعدتك اليوم؟"
        },
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

        // Questions existantes (1-8)
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
        "a6": "اتصل بفريق الدعم لتفعيل ميزة المجموعة متعددة المستخدمين.",

        "q7": "نسيت كلمة المرور؟",
        "a7": "استخدم رابط 'نسيت كلمة المرور' في صفحة الدخول لاستعادة حسابك.",

        "q8": "هل يمكنني استخدام التطبيق على الهاتف؟",
        "a8": "التطبيق محسّن حاليًا للاستخدام على الكمبيوتر. على الرغم من إمكانية الوصول إلى بعض الميزات على الهاتف المحمول، نوصي باستخدام جهاز كمبيوتر للحصول على أفضل تجربة. نسخة محمولة كاملة قادمة قريبًا.",

        // === أسئلة عامة جديدة ===
        "q9": "كيف يعمل الذكاء الاصطناعي القانوني؟",
        "a9": "يقوم ذكاؤنا الاصطناعي بتحليل النصوص القانونية الجزائرية الرسمية (الجريدة الرسمية، القوانين) ويستخدم نماذج لغوية متقدمة لفهم سؤالك، والبحث عن المواد ذات الصلة، وتوليد إجابة دقيقة بلغة واضحة.",

        "q10": "ما هي مصادر النصوص القانونية لديكم؟",
        "a10": "نستخدم حصريًا مصادر رسمية: الجريدة الرسمية للجمهورية الجزائرية، القوانين السارية (القانون المدني، الجنائي، التجاري، إلخ) والنصوص التنظيمية المنشورة رسميًا. يتم تحديث قواعد بياناتنا بانتظام.",

        "q11": "هل يمكن للمساعد أن يحل محل المحامي؟",
        "a11": "لا. Dz Legal AI هو أداة مساعدة للقرار والبحث القانوني. يسهل الوصول إلى المعلومات القانونية لكنه لا يحل محل المشورة الشخصية من محامٍ محترف، خاصة في الحالات المعقدة أو النزاعات.",

        "q12": "هل يمكنني الثقة في الإجابات المقدمة؟",
        "a12": "تستند إجاباتنا إلى نصوص رسمية ويتم التحقق منها بواسطة نظامنا. ومع ذلك، نوصي دائمًا بالتحقق من المعلومات الحرجة مع متخصص قانوني، حيث قد يؤثر السياق المحدد لحالتك على تطبيق القانون.",

        "q13": "كيف يمكنني إلغاء اشتراكي؟",
        "a13": "يمكنك إلغاء اشتراكك في أي وقت من لوحة التحكم الخاصة بك. يظل الوصول نشطًا حتى نهاية الفترة المدفوعة. لا يتم استرداد الأموال للفترات التي تم فوترتها بالفعل.",

        // === أسئلة فنية ===
        "q14": "ما هي تنسيقات المستندات التي تقبلونها؟",
        "a14": "نقبل ملفات PDF (بما في ذلك الممسوحة ضوئيًا بفضل تقنية OCR)، بالإضافة إلى الصور (PNG، JPG) التي تحتوي على نص. يختلف الحد الأقصى لحجم كل مستند حسب خطة اشتراكك.",

        "q15": "ما هو الحد الأقصى لحجم المستند؟",
        "a15": "الخطة المجانية: 5 صفحات كحد أقصى. الخطة الأساسية: 20 صفحة. الخطة المميزة: 50 صفحة. خطة المجموعة: صفحات غير محدودة. يمكن تقسيم المستندات الكبيرة جدًا للتحليل.",

        "q16": "كيف يتم تأمين بياناتي؟",
        "a16": "يتم تشفير بياناتك أثناء النقل (HTTPS) وأثناء التخزين. يتم تخزين المستندات في بيئات آمنة متوافقة مع المعايير الدولية. نحن لا نشارك بياناتك مطلقًا مع أطراف ثالثة دون موافقتك الصريحة.",

        "q17": "هل أنتم متوافقون مع اللائحة العامة لحماية البيانات (RGPD)؟",
        "a17": "نعم. نحترم مبادئ اللائحة العامة لحماية البيانات: تقليل البيانات، حق الوصول والتصحيح والحذف. يمكنك في أي وقت طلب تصدير أو حذف بياناتك الشخصية عبر الدعم.",

        // === أسئلة المجموعات ===
        "q18": "كيف أدعو أعضاء إلى مجموعتي؟",
        "a18": "في صفحة 'مجموعتي'، أدخل البريد الإلكتروني للزميل وانقر على 'دعوة'. سيتلقى بريدًا إلكترونيًا يحتوي على رابط الدعوة. بمجرد القبول، سيكون لديه حق الوصول إلى الميزات المشتركة للمجموعة.",

        "q19": "كيف أدير الأدوار في مجموعتي؟",
        "a19": "حاليًا، جميع أعضاء المجموعة لديهم نفس حقوق الوصول. ستتم إضافة إدارة الأدوار المتقدمة (مسؤول، عضو، قراءة فقط) قريبًا في تحديث مستقبلي.",

        "q20": "كيف تعمل الفوترة للمجموعات؟",
        "a20": "يتم إصدار فواتير خطة المجموعة (5 وصول) شهريًا. يتلقى مدير المجموعة فاتورة واحدة تغطي جميع الأعضاء. يتم مشاركة الحصص (الأسئلة، المستندات) بين جميع أعضاء المجموعة.",

        // === أسئلة الاشتراكات والأسعار ===
        "q21": "هل يمكنني تغيير الخطة في أي وقت؟",
        "a21": "نعم. يمكنك الترقية إلى خطة أعلى فورًا. للتخفيض إلى خطة أقل، سيسري التغيير في فترة الفوترة التالية لتجنب أي فقدان للخدمة.",

        "q22": "هل تقدمون تخفيضات للطلاب؟",
        "a22": "تم تصميم الخطة الأساسية لتكون في متناول الطلاب والمهنيين الشباب. لمجموعات الطلاب (الجامعات، الجمعيات)، اتصل بنا لمناقشة الأسعار التفضيلية."
      },

      // --- PLANS (AR) ---
      "plans": {
        "title": "اختر خطتك",
        "subtitle": "حلول تناسب الطلاب، المحامين والمكاتب الكبرى",
        "free_trial": "مجاني (تجريبي)",
        "basic": "أساسي",
        "premium": "بريميوم",
        "organization": "خطة المجموعة (5 وصول أو حسب الطلب)",
        "pro": "خطة المجموعة (5 وصول أو حسب الطلب)",
        "features_label": "المميزات:",
        "feat_chat": "أسئلة / يوم",
        "feat_doc": "تحليل مستندات / شهر",
        "feat_history": "سجل المحادثات",
        "feat_support": "دعم مخصص",
        "support_community": "دعم مجتمعي",
        "support_email": "دعم عبر البريد (48 ساعة)",
        "support_priority": "دعم ذو أولوية (24 ساعة)",
        "support_dedicated": "دعم مخصص وفاتورة موحدة",
        "basic_features": "الميزات الأساسية",
        "multi_accounts": "5 حسابات متضمنة (أو مخصص)",
        "account_manager": "حصص مشتركة",
        "plan_free_desc": "لاكتشاف قوة الذكاء الاصطناعي",
        "plan_basic_desc": "للطلاب والمحامين الشباب",
        "plan_premium_desc": "للمحترفين المتطلبين",
        "plan_pro_desc": "للفريق والمكاتب (12000 دينار/شهر)",
        "per_month": "/شهر",
        "questions_month": "سؤال / شهر",
        "docs_month": "مستند / شهر",
        "shared": "مشتركة",
        "unlimited_pages": "صفحات غير محدودة",
        "max_pages": "حد أقصى",
        "btn_subscribe": "اختر هذه الخطة",
        "contact_sales": "طلب عرض أسعار",

        // Demandes de changement de plan (AR)
        "myRequests": "طلبات تغيير الخطة",
        "noRequests": "لا توجد طلبات",
        "noRequestsDescription": "لم تقم بعد بطلب تغيير الخطة",
        "statusPending": "قيد الانتظار",
        "statusApproved": "موافق عليه",
        "statusRejected": "مرفوض",
        "statusCancelled": "ملغى",
        "amount": "المبلغ",
        "paymentMethod": "طريقة الدفع",
        "yourNotes": "ملاحظاتك",
        "adminNotes": "رد المسؤول",
        "confirmCancel": "هل تريد حقًا إلغاء هذا الطلب؟",
        "requestCancelled": "تم إلغاء الطلب بنجاح",
        "pendingNotice": "في انتظار التحقق. إذا قمت بالدفع، أرسل إثباتك إلى"
      },
      "status": { "active": "نشط", "expired": "منتهي" },

      // --- PRICING / DEMANDES DE CHANGEMENT DE PLAN (AR) ---
      "pricing": {
        // Modal
        "upgradePlan": "الترقية إلى خطة أعلى",
        "changePlan": "تغيير الخطة",
        "summary": "ملخص",
        "amountToPay": "المبلغ المطلوب",
        "noPaymentRequired": "لا يتطلب دفع لهذا التغيير",
        "paymentMethod": "طريقة الدفع",
        "bankTransfer": "🏦 تحويل بنكي",
        "cpaDeposit": "🏧 إيداع CPA",
        "cash": "💵 نقداً",
        "check": "📝 شيك بنكي",
        "other": "💳 أخرى",
        "yourNotes": "ملاحظاتك (اختياري)",
        "notesPlaceholder": "هل لديك توضيحات حول طلبك؟",
        "paymentInstructions": "تعليمات الدفع",
        "afterSubmit": "بعد إرسال هذا الطلب",
        "step1": "ستتلقى بريدًا إلكترونيًا يحتوي على التعليمات التفصيلية",
        "step2": "قم بالدفع وفقًا للطريقة المختارة",
        "step3": "أرسل إثبات الدفع إلى admin@dz-legal-ai.com",
        "step4": "سيتم تفعيل خطتك خلال 24-48 ساعة بعد التحقق",
        "confirmRequest": "تأكيد الطلب",
        "requestSuccess": "تم إنشاء الطلب بنجاح! ستتلقى التعليمات عبر البريد الإلكتروني.",

        // Membres d'organisation (AR)
        "orgManaged": "خطة المجموعة",
        "orgMemberBlocked": "خطتك تدار من قبل مؤسستك. اتصل بمديرك لأي تغيير.",

        // Liste des demandes
        "myRequests": "طلبات تغيير الخطة",
        "noRequests": "لا توجد طلبات",
        "noRequestsDescription": "لم تقم بعد بطلب تغيير الخطة",
        "statusPending": "قيد الانتظار",
        "statusApproved": "موافق عليه",
        "statusRejected": "مرفوض",
        "statusCancelled": "ملغى",
        "amount": "المبلغ",
        "adminNotes": "رد المسؤول",
        "confirmCancel": "هل تريد حقًا إلغاء هذا الطلب؟",
        "requestCancelled": "تم إلغاء الطلب بنجاح",
        "pendingNotice": "في انتظار التحقق. إذا قمت بالدفع، أرسل إثباتك إلى"
      },

      // --- COMMON (AR) ---
      "common": {
        "loading": "جاري التحميل...",
        "cancel": "إلغاء",
        "save": "حفظ",
        "close": "إغلاق",
        "confirm": "تأكيد",
        "delete": "حذف",
        "edit": "تعديل",
        "search": "بحث",
        "filter": "تصفية",
        "all": "الكل",
        "actions": "إجراءات"
      },

      // --- ADMINISTRATION (AR) ---
      "admin": {
        "title": "إدارة النظام",
        "subtitle": "نظرة عامة.",
        "tab_dashboard": "لوحة القيادة",
        "tab_users": "المستخدمين",
        "tab_groups": "المجموعات",
        "tab_plan_requests": "طلبات الخطط",
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
        "group_suspended": "معلق",

        // Demandes de plan (AR)
        "filter_pending": "قيد الانتظار",
        "filter_approved": "موافق عليها",
        "filter_rejected": "مرفوضة",
        "filter_all": "الكل",
        "col_id": "#",
        "col_change": "التغيير",
        "col_amount": "المبلغ",
        "col_method": "الطريقة",
        "col_status": "الحالة",
        "col_date": "التاريخ",
        "no_requests": "لا توجد طلبات لهذه الحالة",
        "btn_approve": "موافقة",
        "btn_reject": "رفض",
        "status_processed": "معالجة",
        "modal_approve_title": "الموافقة على الطلب",
        "modal_reject_title": "رفض الطلب",
        "user_name": "المستخدم",
        "plan_change": "تغيير الخطة",
        "amount": "المبلغ",
        "admin_notes_label": "ملاحظات المسؤول (اختياري)",
        "reject_reason_label": "سبب الرفض",
        "reject_reason_required": "يرجى تحديد سبب الرفض",
        "approve_notice": "سيتم تحديث خطة المستخدم تلقائيًا إلى",
        "reject_notice": "سيتلقى المستخدم بريدًا إلكترونيًا مع سبب الرفض",
        "confirm_approve": "تأكيد الموافقة",
        "confirm_reject": "تأكيد الرفض",
        "approve_success": "تمت الموافقة على الخطة وتفعيلها!",
        "reject_success": "تم رفض الطلب"
      },

      // --- ORGANISATION (AR) ---
      "org": {
        "create_title": "إنشاء مجموعتك",
        "name_label": "اسم المجموعة",
        "create_btn": "إنشاء",
        "team_title": "فريق العمل",
        "invite_title": "دعوة زميل",
        "email_label": "البريد الإلكتروني",
        "invite_btn": "دعوة",
        "invite_desc": "سيكون للزميل المدعو حق الوصول إلى جميع المستندات.",
        "success_create": "تم إنشاء المجموعة بنجاح!",
        "success_invite": "تم إرسال الدعوة إلى ",
        "confirm_remove": "هل أنت متأكد من رغبتك في إزالة هذا العضو من المجموعة؟"
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
    supportedLngs: ['fr', 'ar'],
    nonExplicitSupportedLngs: false,
    load: 'languageOnly',
    interpolation: { escapeValue: false },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage']
    }
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