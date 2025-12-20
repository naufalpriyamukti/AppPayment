const express = require('express');
const router = express.Router();

// Import Controller
const adminController = require('../controllers/web/adminController');

// Import Middleware (Cek Login & Role Admin)
const { requireAdmin } = require('../middleware/authMiddleware');

// 1. Pasang Satpam (Semua route di file ini WAJIB Admin)
router.use(requireAdmin);

// 2. Definisi Route (Tanpa awalan /admin, karena sudah di-set di index.js)
router.get('/dashboard', adminController.dashboard);       // -> /admin/dashboard

// CRUD Routes
router.get('/events/add', adminController.showAddForm);    // -> /admin/events/add
router.post('/events', adminController.createEvent);
router.get('/events/:id/edit', adminController.showEditForm);
router.put('/events/:id', adminController.updateEvent);
router.delete('/events/:id', adminController.deleteEvent);

module.exports = router;