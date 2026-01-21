/**
 * Configuration des prix et tarifs des plans d'abonnement
 * Mode: Paiement manuel (hors ligne)
 * Devise: DZD (Dinar Algérien)
 */

const PLAN_PRICING = {
    free: {
        price: 0,
        label: 'Gratuit',
        labelAr: 'مجاني',
        features: ['5 conversations/mois', '2 documents/mois'],
        order: 1
    },
    basic: {
        price: 900,
        label: 'Basic',
        labelAr: 'أساسي',
        features: ['50 conversations/mois', '20 documents/mois'],
        order: 2
    },
    premium: {
        price: 2900,
        label: 'Premium',
        labelAr: 'متميز',
        features: ['200 conversations/mois', '100 documents/mois'],
        order: 3
    },
    pro: {
        price: 12000,
        label: 'Pro',
        labelAr: 'احترافي',
        features: ['Conversations illimitées', 'Documents illimités'],
        order: 4
    }
};

/**
 * Liste des méthodes de paiement disponibles
 */
const PAYMENT_METHODS = {
    virement: {
        label: 'Virement bancaire',
        labelAr: 'تحويل بنكي',
        icon: '🏦',
        instructions: 'Effectuez le virement sur le compte bancaire CPA fourni par email'
    },
    especes: {
        label: 'Espèces',
        labelAr: 'نقدا',
        icon: '💵',
        instructions: 'Rendez-vous à nos bureaux avec le montant en espèces'
    },
    cheque: {
        label: 'Chèque bancaire',
        labelAr: 'شيك بنكي',
        icon: '📝',
        instructions: 'Envoyez un chèque à l\'ordre de Inno-Num'
    },
    cpa: {
        label: 'Versement CPA',
        labelAr: 'إيداع CPA',
        icon: '🏧',
        instructions: 'Effectuez un versement dans une agence CPA'
    },
    autre: {
        label: 'Autre',
        labelAr: 'أخرى',
        icon: '💳',
        instructions: 'Contactez-nous pour d\'autres options de paiement'
    }
};

/**
 * Informations de paiement
 */
const PAYMENT_INFO = {
    // Coordonnées bancaires
    bank: {
        name: 'CPA',
        rib: process.env.BANK_RIB || '[À DÉFINIR - Ajouter dans .env]',
        accountHolder: process.env.BANK_ACCOUNT_HOLDER || 'Inno-Num'
    },

    // Adresse des bureaux
    office: {
        address: process.env.OFFICE_ADDRESS || 'Cité Issad Abbas N°194, El Alia, Oued Smar 16059, Alger',
        hours: process.env.OFFICE_HOURS || 'Dimanche - Jeudi, 9h - 17h',
        phone: process.env.OFFICE_PHONE || '+213 560 383 640'
    },

    // Email pour envoyer les justificatifs
    adminEmail: process.env.ADMIN_EMAIL || 'admin@dz-legal-ai.com',

    // Délai d'activation
    activationDelay: '24-48 heures'
};

/**
 * Calculer le montant à payer pour un changement de plan
 * @param {string} currentPlan - Plan actuel de l'utilisateur
 * @param {string} requestedPlan - Plan demandé
 * @returns {number} Montant à payer en DZD (0 si downgrade)
 */
function calculatePlanChangeAmount(currentPlan, requestedPlan) {
    const current = PLAN_PRICING[currentPlan] || PLAN_PRICING.free;
    const requested = PLAN_PRICING[requestedPlan] || PLAN_PRICING.free;

    // Calculer la différence
    const difference = requested.price - current.price;

    // Si upgrade : différence positive
    // Si downgrade : retourner 0 (pas de remboursement)
    return Math.max(0, difference);
}

/**
 * Vérifier si un plan est valide
 * @param {string} planName - Nom du plan
 * @returns {boolean}
 */
function isValidPlan(planName) {
    return planName && PLAN_PRICING.hasOwnProperty(planName);
}

/**
 * Obtenir les détails d'un plan
 * @param {string} planName - Nom du plan
 * @returns {object|null}
 */
function getPlanDetails(planName) {
    if (!isValidPlan(planName)) {
        return null;
    }

    return {
        name: planName,
        ...PLAN_PRICING[planName]
    };
}

/**
 * Obtenir tous les plans triés par ordre
 * @returns {array}
 */
function getAllPlans() {
    return Object.entries(PLAN_PRICING)
        .map(([name, details]) => ({
            name,
            ...details
        }))
        .sort((a, b) => a.order - b.order);
}

/**
 * Déterminer si c'est un upgrade ou downgrade
 * @param {string} currentPlan
 * @param {string} requestedPlan
 * @returns {string} 'upgrade', 'downgrade', ou 'same'
 */
function getPlanChangeType(currentPlan, requestedPlan) {
    const current = PLAN_PRICING[currentPlan] || PLAN_PRICING.free;
    const requested = PLAN_PRICING[requestedPlan] || PLAN_PRICING.free;

    if (current.order < requested.order) return 'upgrade';
    if (current.order > requested.order) return 'downgrade';
    return 'same';
}

module.exports = {
    PLAN_PRICING,
    PAYMENT_METHODS,
    PAYMENT_INFO,
    calculatePlanChangeAmount,
    isValidPlan,
    getPlanDetails,
    getAllPlans,
    getPlanChangeType
};
