const express = require('express');
const router = express.Router();
const authController = require('../controllers/web/authController');
const userController = require('../controllers/web/userController');
const { requireAuth } = require('../middleware/authMiddleware');

// --- AUTH ---
router.get('/login', authController.showLogin);
router.post('/login', authController.login);
router.get('/register', authController.showRegister);
router.post('/register', authController.register);
router.get('/logout', authController.logout);

// --- USER (Perlu Login) ---
router.get('/', requireAuth, userController.home);
router.get('/history', requireAuth, userController.history);
router.get('/checkout/:id', requireAuth, userController.showCheckout);
router.post('/process-payment', requireAuth, userController.processPayment);
router.get('/check-status/:orderId', requireAuth, userController.checkStatus);

// BAGIAN ADMIN SUDAHDIPINDAH KE adminRoutes.js, JADI DI SINI KOSONG

module.exports = router;