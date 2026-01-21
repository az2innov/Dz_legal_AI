const express = require('express');
const router = express.Router();
const usageController = require('./controllers/usageController');
const planChangeController = require('./controllers/planChangeController');
const { protect, requireAdmin } = require('../../middlewares/authMiddleware');

// ============================================================================
// Routes de facturation/usage
// ============================================================================
router.get('/usage', protect, usageController.getStats);

// ============================================================================
// Routes utilisateur - Demandes de changement de plan
// ============================================================================

// Créer une demande de changement de plan
router.post('/request-plan-change', protect, planChangeController.requestPlanChange);

// Récupérer mes demandes
router.get('/my-plan-requests', protect, planChangeController.getMyRequests);

// Annuler une demande
router.delete('/cancel-plan-request/:id', protect, planChangeController.cancelPlanRequest);

module.exports = router;
