const express = require('express');
const router = express.Router();
const orgController = require('./controllers/orgController');
const { protect } = require('../../middlewares/authMiddleware');

router.post('/create', protect, orgController.create);
router.post('/invite', protect, orgController.invite);
router.get('/team', protect, orgController.getTeam);

// La route qui appelle le contrôleur
router.delete('/members/:id', protect, orgController.removeMember);

module.exports = router;