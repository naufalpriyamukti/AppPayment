// Perbaikan:
const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController'); // ← INI YANG BENAR

// Routes
router.post('/create-transaction', paymentController.createTransaction);
router.post('/notification', paymentController.handleNotification);
router.get('/status/:order_id', paymentController.checkStatus);
router.post('/token', paymentController.createTransaction);

module.exports = router;