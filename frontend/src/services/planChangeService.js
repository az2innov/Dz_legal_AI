/**
 * Service Frontend : Demandes de changement de plan
 * Communication avec l'API backend
 */

import axios from 'axios';
import authService from './authService';
import { API_ENDPOINTS } from '../utils/apiConfig';

// URL de base de l'API Billing
const API_URL = API_ENDPOINTS.billing;

/**
 * Obtenir les headers avec authentification et cache-busting
 */
const getHeaders = () => ({
    headers: {
        'Authorization': `Bearer ${authService.getToken()}`,
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
    }
});

const planChangeService = {
    /**
     * Créer une demande de changement de plan
     * @param {string} requestedPlan - Plan demandé (free, basic, premium, pro)
     * @param {string} paymentMethod - Méthode de paiement
     * @param {string} userNotes - Notes de l'utilisateur
     */
    requestPlanChange: async (requestedPlan, paymentMethod, userNotes) => {
        try {
            const response = await axios.post(
                `${API_URL}/request-plan-change`,
                {
                    requestedPlan,
                    paymentMethod,
                    userNotes
                },
                getHeaders()
            );
            return response.data;
        } catch (error) {
            console.error('Erreur demande changement plan:', error);
            throw error.response?.data || error;
        }
    },

    /**
     * Récupérer mes demandes de changement de plan
     */
    getMyRequests: async () => {
        try {
            // Ajouter timestamp pour forcer le rafraîchissement
            const timestamp = new Date().getTime();
            const response = await axios.get(
                `${API_URL}/my-plan-requests?_t=${timestamp}`,
                getHeaders()
            );
            return response.data.data || [];
        } catch (error) {
            console.error('Erreur récupération demandes:', error);
            throw error.response?.data || error;
        }
    },

    /**
     * Annuler une demande de changement de plan
     * @param {number} requestId - ID de la demande
     */
    cancelRequest: async (requestId) => {
        try {
            const response = await axios.delete(
                `${API_URL}/cancel-plan-request/${requestId}`,
                getHeaders()
            );
            return response.data;
        } catch (error) {
            console.error('Erreur annulation demande:', error);
            throw error.response?.data || error;
        }
    },

    /**
     * Obtenir les détails d'un plan
     */
    getPlanDetails: (planName) => {
        const plans = {
            free: {
                name: 'free',
                label: 'Gratuit',
                labelAr: 'مجاني',
                price: 0,
                features: [
                    '5 conversations/mois',
                    '2 documents/mois',
                    'Support communauté'
                ]
            },
            basic: {
                name: 'basic',
                label: 'Basic',
                labelAr: 'أساسي',
                price: 900,
                features: [
                    '50 conversations/mois',
                    '20 documents/mois',
                    'Support par email'
                ]
            },
            premium: {
                name: 'premium',
                label: 'Premium',
                labelAr: 'متميز',
                price: 2900,
                features: [
                    '200 conversations/mois',
                    '100 documents/mois',
                    'Support prioritaire',
                    'Historique illimité'
                ]
            },
            pro: {
                name: 'pro',
                label: 'Pro',
                labelAr: 'احترافي',
                price: 12000,
                features: [
                    'Conversations illimitées',
                    'Documents illimités',
                    'Support VIP 24/7',
                    'Accès API',
                    'Fonctionnalités avancées'
                ]
            }
        };

        return plans[planName] || null;
    },

    /**
     * Calculer le montant à payer
     */
    calculateAmount: (currentPlan, requestedPlan) => {
        const plans = {
            free: 0,
            basic: 900,
            premium: 2900,
            pro: 12000
        };

        const currentPrice = plans[currentPlan] || 0;
        const requestedPrice = plans[requestedPlan] || 0;

        return Math.max(0, requestedPrice - currentPrice);
    },

    /**
     * Déterminer le type de changement
     */
    getChangeType: (currentPlan, requestedPlan) => {
        const order = { free: 1, basic: 2, premium: 3, pro: 4 };
        const currentOrder = order[currentPlan] || 1;
        const requestedOrder = order[requestedPlan] || 1;

        if (currentOrder < requestedOrder) return 'upgrade';
        if (currentOrder > requestedOrder) return 'downgrade';
        return 'same';
    }
};

export default planChangeService;
