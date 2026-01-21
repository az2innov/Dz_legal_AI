/**
 * Service pour gérer les demandes de changement de plan
 * Logique métier + envoi d'emails
 */

const PlanChangeRequest = require('../models/planChangeRequest');
const pricing = require('../config/pricing');
const db = require('../../../config/db');

// Import des templates emails
const { sendPlanChangeRequestEmail } = require('../emails/planChangeRequest');
const { sendPlanChangeApprovedEmail } = require('../emails/planChangeApproved');
const { sendPlanChangeRejectedEmail } = require('../emails/planChangeRejected');

class PlanChangeService {
    /**
     * Créer une nouvelle demande de changement de plan
     */
    async createRequest(userId, requestedPlan, paymentMethod, userNotes) {
        try {
            // 1. Valider le plan demandé
            if (!pricing.isValidPlan(requestedPlan)) {
                throw new Error('Plan invalide. Choisissez parmi: free, basic, premium, pro');
            }

            // 2. Récupérer le plan actuel de l'utilisateur
            const userResult = await db.query(
                'SELECT plan, email, full_name FROM users WHERE id = ?',
                [userId]
            );

            if (userResult.rows.length === 0) {
                throw new Error('Utilisateur introuvable');
            }

            const user = userResult.rows[0];
            const currentPlan = user.plan || 'free';

            // 3. Vérifier que ce n'est pas le même plan
            if (currentPlan === requestedPlan) {
                throw new Error('Vous êtes déjà sur ce plan');
            }

            // 4. Vérifier qu'il n'y a pas déjà une demande pending
            const hasPending = await PlanChangeRequest.hasPendingRequest(userId);
            if (hasPending) {
                throw new Error('Vous avez déjà une demande en cours. Veuillez attendre qu\'elle soit traitée.');
            }

            // 5. Calculer le montant
            const amount = pricing.calculatePlanChangeAmount(currentPlan, requestedPlan);
            const changeType = pricing.getPlanChangeType(currentPlan, requestedPlan);

            // 6. Créer la demande
            const requestId = await PlanChangeRequest.create({
                userId,
                currentPlan,
                requestedPlan,
                amount,
                paymentMethod,
                userNotes
            });

            // 7. Envoyer l'email avec instructions de paiement
            try {
                await sendPlanChangeRequestEmail(user.email, {
                    fullName: user.full_name,
                    currentPlan,
                    requestedPlan,
                    amount,
                    paymentMethod,
                    changeType,
                    requestId
                });
            } catch (emailError) {
                console.error('⚠️  Erreur envoi email (demande créée):', emailError);
                // Ne pas bloquer la création de la demande si l'email échoue
            }

            console.log(`✅ Demande de changement de plan créée (ID: ${requestId}) pour user ${userId}`);
            console.log(`   ${currentPlan} → ${requestedPlan} (${amount} DZD)`);

            // 8. Retourner les détails de la demande
            return {
                id: requestId,
                currentPlan,
                requestedPlan,
                amount,
                changeType,
                status: 'pending',
                paymentMethod,
                userNotes
            };

        } catch (error) {
            console.error('Erreur création demande:', error);
            throw error;
        }
    }

    /**
     * Récupérer les demandes d'un utilisateur
     */
    async getUserRequests(userId) {
        try {
            const requests = await PlanChangeRequest.findByUserId(userId);

            // Enrichir avec les détails des plans
            return requests.map(req => ({
                ...req,
                currentPlanDetails: pricing.getPlanDetails(req.current_plan),
                requestedPlanDetails: pricing.getPlanDetails(req.requested_plan),
                changeType: pricing.getPlanChangeType(req.current_plan, req.requested_plan)
            }));

        } catch (error) {
            console.error('Erreur récupération demandes user:', error);
            throw error;
        }
    }

    /**
     * Récupérer toutes les demandes (pour admin)
     */
    async getAllRequests(status = 'pending') {
        try {
            const requests = await PlanChangeRequest.findAllWithUserInfo(status);

            // Enrichir avec les détails
            return requests.map(req => ({
                id: req.id,
                user_id: req.user_id,
                email: req.user_email,           // ✅ Au niveau racine
                full_name: req.user_full_name,   // ✅ Au niveau racine
                phone: req.user_phone,
                current_plan: req.current_plan,
                requested_plan: req.requested_plan,
                amount: parseFloat(req.amount),
                payment_method: req.payment_method,
                status: req.status,
                user_notes: req.user_notes,
                admin_notes: req.admin_notes,
                changeType: pricing.getPlanChangeType(req.current_plan, req.requested_plan),
                created_at: req.created_at,
                updated_at: req.updated_at,
                approved_at: req.approved_at,
                approved_by: req.approved_by,
                approver_email: req.approver_email,
                approver_name: req.approver_name
            }));

        } catch (error) {
            console.error('Erreur récupération toutes demandes:', error);
            throw error;
        }
    }

    /**
     * Approuver une demande
     */
    async approveRequest(requestId, adminId, adminNotes) {
        try {
            // 1. Récupérer la demande pour l'email
            const request = await PlanChangeRequest.findById(requestId);

            if (!request) {
                throw new Error('Demande introuvable');
            }

            // 2. Récupérer les infos utilisateur
            const userResult = await db.query(
                'SELECT email, full_name FROM users WHERE id = ?',
                [request.user_id]
            );

            if (userResult.rows.length === 0) {
                throw new Error('Utilisateur introuvable');
            }

            const user = userResult.rows[0];

            // 3. Approuver la demande (met à jour le statut ET le plan user)
            await PlanChangeRequest.approve(requestId, adminId, adminNotes);

            // 4. Envoyer l'email de confirmation
            try {
                await sendPlanChangeApprovedEmail(user.email, {
                    fullName: user.full_name,
                    requestedPlan: request.requested_plan,
                    adminNotes,
                    requestId
                });
            } catch (emailError) {
                console.error('⚠️  Erreur envoi email (approbation):', emailError);
                // Ne pas bloquer l'approbation si l'email échoue
            }

            console.log(`✅ Demande ${requestId} approuvée par admin ${adminId}`);
            console.log(`   User ${request.user_id} passe au plan: ${request.requested_plan}`);

            return {
                success: true,
                message: 'Demande approuvée et plan activé',
                requestId,
                newPlan: request.requested_plan
            };

        } catch (error) {
            console.error('Erreur approbation demande:', error);
            throw error;
        }
    }

    /**
     * Rejeter une demande
     */
    async rejectRequest(requestId, adminNotes) {
        try {
            if (!adminNotes || adminNotes.trim().length === 0) {
                throw new Error('La raison du rejet est obligatoire');
            }

            // 1. Récupérer la demande
            const request = await PlanChangeRequest.findById(requestId);

            if (!request) {
                throw new Error('Demande introuvable');
            }

            // 2. Récupérer les infos utilisateur
            const userResult = await db.query(
                'SELECT email, full_name FROM users WHERE id = ?',
                [request.user_id]
            );

            if (userResult.rows.length === 0) {
                throw new Error('Utilisateur introuvable');
            }

            const user = userResult.rows[0];

            // 3. Rejeter la demande
            await PlanChangeRequest.reject(requestId, adminNotes);

            // 4. Envoyer l'email de rejet
            try {
                await sendPlanChangeRejectedEmail(user.email, {
                    fullName: user.full_name,
                    adminNotes,
                    requestId
                });
            } catch (emailError) {
                console.error('⚠️  Erreur envoi email (rejet):', emailError);
                // Ne pas bloquer le rejet si l'email échoue
            }

            console.log(`❌ Demande ${requestId} rejetée`);
            console.log(`   Raison: ${adminNotes}`);

            return {
                success: true,
                message: 'Demande rejetée',
                requestId
            };

        } catch (error) {
            console.error('Erreur rejet demande:', error);
            throw error;
        }
    }

    /**
     * Annuler une demande (par l'utilisateur)
     */
    async cancelRequest(requestId, userId) {
        try {
            await PlanChangeRequest.cancel(requestId, userId);

            console.log(`🚫 Demande ${requestId} annulée par user ${userId}`);

            return {
                success: true,
                message: 'Demande annulée',
                requestId
            };

        } catch (error) {
            console.error('Erreur annulation demande:', error);
            throw error;
        }
    }

    /**
     * Obtenir les statistiques (pour admin dashboard)
     */
    async getStats() {
        try {
            const stats = await PlanChangeRequest.getStats();

            const result = {
                pending: 0,
                approved: 0,
                rejected: 0,
                cancelled: 0,
                totalRevenue: 0
            };

            stats.forEach(stat => {
                result[stat.status] = parseInt(stat.count);
                if (stat.status === 'approved') {
                    result.totalRevenue = parseFloat(stat.total_amount || 0);
                }
            });

            return result;

        } catch (error) {
            console.error('Erreur récupération stats:', error);
            throw error;
        }
    }
}

module.exports = new PlanChangeService();
