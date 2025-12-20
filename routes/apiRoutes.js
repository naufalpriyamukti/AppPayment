const express = require('express');
const router = express.Router();
const androidController = require('../controllers/api/androidController');

// Endpoint ini yang akan ditembak oleh Retrofit/Ktor di Android
router.post('/login', androidController.loginApi);
router.post('/register', androidController.registerApi);
router.get('/events', androidController.getEvents);
router.post('/transaction', androidController.createTransaction); // Checkout
router.get('/status/:order_id', androidController.checkStatus);   // Polling Status

module.exports = router;