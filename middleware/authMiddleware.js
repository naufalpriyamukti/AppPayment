// File: middleware/authMiddleware.js

const requireAuth = (req, res, next) => {
    // Cek apakah session user ada
    if (!req.session || !req.session.user) {
        return res.redirect('/login');
    }
    next();
};

const requireAdmin = (req, res, next) => {
    // Cek apakah user ada DAN role-nya admin
    if (!req.session || !req.session.user || req.session.role !== 'admin') {
        return res.redirect('/login');
    }
    next();
};

module.exports = { requireAuth, requireAdmin };