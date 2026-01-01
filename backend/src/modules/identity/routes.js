const express = require('express');
const router = express.Router();
const authController = require('./controllers/authController');
const { protect } = require('../../middlewares/authMiddleware');

// Auth Classique
router.post('/register', authController.register);
router.post('/login', authController.login);

// Auth 2FA & Verification
router.post('/verify-email', authController.verifyEmail);
router.post('/verify-2fa', authController.verify2FA);

// Mot de passe oublié
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);

// Profil
router.get('/me', protect, authController.getMe);

module.exports = router;