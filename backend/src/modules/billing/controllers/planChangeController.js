/**
 * Contrôleurs pour les demandes de changement de plan
 * Endpoints utilisateur + admin
 */

const planChangeService = require('../services/planChangeService');

/**
 * POST /api/billing/request-plan-change
 * Créer une demande de changement de plan (USER)
 */
exports.requestPlanChange = async (req, res) => {
    try {
        const userId = req.user.id;
        const { requestedPlan, paymentMethod, userNotes } = req.body;

        // Validation
        if (!requestedPlan) {
            return res.status(400).json({
                status: 'error',
                message: 'Le plan demandé est requis'
            });
        }

        // Créer la demande
        const request = await planChangeService.createRequest(
            userId,
            requestedPlan,
            paymentMethod,
            userNotes
        );

        return res.status(201).json({
            status: 'success',
            message: 'Demande créée avec succès. Vous recevrez les instructions de paiement par email.',
            data: request
        });

    } catch (error) {
        console.error('Erreur requestPlanChange:', error);

        return res.status(400).json({
            status: 'error',
            message: error.message || 'Erreur lors de la création de la demande'
        });
    }
};

/**
 * GET /api/billing/my-plan-requests
 * Récupérer les demandes de l'utilisateur connecté (USER)
 */
exports.getMyRequests = async (req, res) => {
    try {
        const userId = req.user.id;

        const requests = await planChangeService.getUserRequests(userId);

        return res.status(200).json({
            status: 'success',
            data: requests
        });

    } catch (error) {
        console.error('Erreur getMyRequests:', error);

        return res.status(500).json({
            status: 'error',
            message: 'Erreur lors de la récupération des demandes'
        });
    }
};

/**
 * GET /api/admin/plan-requests
 * Récupérer toutes les demandes (ADMIN)
 * Query params: ?status=pending|approved|rejected|cancelled|all
 */
exports.getAllRequests = async (req, res) => {
    try {
        const { status = 'pending' } = req.query;

        const requests = await planChangeService.getAllRequests(status);

        return res.status(200).json({
            status: 'success',
            data: requests,
            count: requests.length
        });

    } catch (error) {
        console.error('Erreur getAllRequests:', error);

        return res.status(500).json({
            status: 'error',
            message: 'Erreur lors de la récupération des demandes'
        });
    }
};

/**
 * POST /api/admin/approve-plan-request/:id
 * Approuver une demande (ADMIN)
 */
exports.approvePlanRequest = async (req, res) => {
    try {
        const requestId = parseInt(req.params.id);
        const adminId = req.user.id;
        const { adminNotes } = req.body;

        if (!requestId || isNaN(requestId)) {
            return res.status(400).json({
                status: 'error',
                message: 'ID de demande invalide'
            });
        }

        const result = await planChangeService.approveRequest(
            requestId,
            adminId,
            adminNotes
        );

        return res.status(200).json({
            status: 'success',
            message: 'Demande approuvée et plan activé',
            data: result
        });

    } catch (error) {
        console.error('Erreur approvePlanRequest:', error);

        return res.status(400).json({
            status: 'error',
            message: error.message || 'Erreur lors de l\'approbation'
        });
    }
};

/**
 * POST /api/admin/reject-plan-request/:id
 * Rejeter une demande (ADMIN)
 */
exports.rejectPlanRequest = async (req, res) => {
    try {
        const requestId = parseInt(req.params.id);
        const { adminNotes } = req.body;

        if (!requestId || isNaN(requestId)) {
            return res.status(400).json({
                status: 'error',
                message: 'ID de demande invalide'
            });
        }

        if (!adminNotes || adminNotes.trim().length === 0) {
            return res.status(400).json({
                status: 'error',
                message: 'La raison du rejet est obligatoire'
            });
        }

        const result = await planChangeService.rejectRequest(
            requestId,
            adminNotes
        );

        return res.status(200).json({
            status: 'success',
            message: 'Demande rejetée',
            data: result
        });

    } catch (error) {
        console.error('Erreur rejectPlanRequest:', error);

        return res.status(400).json({
            status: 'error',
            message: error.message || 'Erreur lors du rejet'
        });
    }
};

/**
 * DELETE /api/billing/cancel-plan-request/:id
 * Annuler sa propre demande (USER)
 */
exports.cancelPlanRequest = async (req, res) => {
    try {
        const requestId = parseInt(req.params.id);
        const userId = req.user.id;

        if (!requestId || isNaN(requestId)) {
            return res.status(400).json({
                status: 'error',
                message: 'ID de demande invalide'
            });
        }

        const result = await planChangeService.cancelRequest(requestId, userId);

        return res.status(200).json({
            status: 'success',
            message: 'Demande annulée',
            data: result
        });

    } catch (error) {
        console.error('Erreur cancelPlanRequest:', error);

        return res.status(400).json({
            status: 'error',
            message: error.message || 'Erreur lors de l\'annulation'
        });
    }
};

/**
 * GET /api/admin/plan-requests/stats
 * Obtenir les statistiques des demandes (ADMIN)
 */
exports.getPlanRequestStats = async (req, res) => {
    try {
        const stats = await planChangeService.getStats();

        return res.status(200).json({
            status: 'success',
            data: stats
        });

    } catch (error) {
        console.error('Erreur getPlanRequestStats:', error);

        return res.status(500).json({
            status: 'error',
            message: 'Erreur lors de la récupération des statistiques'
        });
    }
};
