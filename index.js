require('dotenv').config();
const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// --- 1. MIDDLEWARE ---
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));

// --- 2. SESSION SETUP ---
app.use(session({
    secret: process.env.SESSION_SECRET || 'rahasia_tiketons_123',
    resave: false,
    saveUninitialized: false,
    cookie: { 
        maxAge: 24 * 60 * 60 * 1000 // 1 Hari
    }
}));

// --- 3. GLOBAL VARIABLES (Agar user bisa diakses di semua EJS) ---
app.use((req, res, next) => {
    res.locals.user = req.session.user || null;
    res.locals.role = req.session.role || null;
    next();
});

// --- 4. VIEW ENGINE ---
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// =========================================
// 5. ROUTING SYSTEM (Modular)
// =========================================

// A. Routes Website (User & Auth)
// Pastikan Anda masih punya file `routes/webRoutes.js` untuk Auth & User
const webRoutes = require('./routes/webRoutes'); 
app.use('/', webRoutes); 

// B. Routes Admin (Baru Saja Kita Buat)
// Ini rahasianya: Kita pasang prefix '/admin' di sini!
const adminRoutes = require('./routes/adminRoutes');
app.use('/admin', adminRoutes);

// C. Routes API Android (Opsional, jika sudah ada)
// const apiRoutes = require('./routes/apiRoutes');
// app.use('/api', apiRoutes);

// =========================================

// Error Handling Terakhir
app.use((req, res) => {
    res.status(404).send("<h1>404 - Halaman Tidak Ditemukan</h1><a href='/'>Kembali ke Home</a>");
});

app.listen(PORT, () => {
    console.log(`✅ Server Tiketons Berjalan di Port ${PORT}`);
    console.log(`- Admin Panel: http://localhost:${PORT}/admin/dashboard`);
});