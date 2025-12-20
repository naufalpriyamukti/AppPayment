// File: controllers/web/authController.js
const supabase = require('../../config/supabase');

// --- Halaman Form ---
exports.showRegister = (req, res) => {
    res.render('auth/register', { error: null });
};

exports.showLogin = (req, res) => {
    res.render('auth/login', { error: null });
};

// --- Proses Register ---
exports.register = async (req, res) => {
    const { email, password, full_name, username } = req.body;

    try {
        // 1. Daftar ke Supabase Auth
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email, password
        });

        if (authError) throw authError;

        // 2. Simpan Data Profil (Upsert agar aman dari duplikat)
        if (authData.user) {
            const { error: profileError } = await supabase.from('profiles').upsert({
                id: authData.user.id,
                username: username,
                full_name: full_name,
                role: 'user' // Default user biasa
            });
            
            if (profileError) console.error("Gagal simpan profil:", profileError.message);
        }

        // Sukses -> Redirect ke Login
        res.redirect('/login');

    } catch (err) {
        console.error("Register Error:", err.message);
        // Render ulang halaman daftar dengan pesan error
        res.render('auth/register', { error: err.message });
    }
};

// --- Proses Login ---
exports.login = async (req, res) => {
    const { email, password } = req.body;

    try {
        // 1. Cek Login ke Supabase
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw new Error("Email atau password salah.");

        // 2. Ambil Data Profil (untuk cek role Admin/User)
        const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.user.id)
            .single();

        // 3. Simpan ke Session
        req.session.user = data.user;
        req.session.role = profile ? profile.role : 'user';
        req.session.username = profile ? profile.username : 'User';

        // 4. Redirect sesuai Role
        if (req.session.role === 'admin') {
            return res.redirect('/admin/dashboard');
        }
        res.redirect('/');

    } catch (err) {
        // Render ulang login dengan pesan error
        res.render('auth/login', { error: err.message });
    }
};

// --- Proses Logout ---
exports.logout = (req, res) => {
    req.session.destroy((err) => {
        res.redirect('/login');
    });
};