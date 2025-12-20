const supabase = require('../../config/supabase');
const coreApi = require('../../config/midtrans');

// 1. Login API (Untuk Android)
exports.loginApi = async (req, res) => {
    const { email, password } = req.body;
    try {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;

        const { data: profile } = await supabase.from('profiles').select('*').eq('id', data.user.id).single();

        res.json({
            success: true,
            message: "Login Berhasil",
            user: {
                id: data.user.id,
                email: data.user.email,
                username: profile?.username,
                full_name: profile?.full_name,
                role: profile?.role
            },
            access_token: data.session.access_token // Token Supabase
        });
    } catch (err) {
        res.status(401).json({ success: false, message: err.message });
    }
};

// 2. Register API (Untuk Android)
exports.registerApi = async (req, res) => {
    const { email, password, full_name, username } = req.body;
    try {
        const { data: authData, error: authError } = await supabase.auth.signUp({ email, password });
        if (authError) throw authError;

        const { error: profileError } = await supabase.from('profiles').upsert({
            id: authData.user.id,
            username, full_name, role: 'user'
        });
        if (profileError) throw profileError;

        res.json({ success: true, message: "Registrasi Berhasil" });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// 3. Get Events API
exports.getEvents = async (req, res) => {
    const { data, error } = await supabase.from('events').select('*').order('date');
    if (error) return res.status(500).json({ success: false, error: error.message });
    res.json({ success: true, data: data });
};

exports.getEvents = async (req, res) => {
    // Ambil event beserta lineups-nya
    const { data, error } = await supabase
        .from('events')
        .select('*, lineups(artist_name)') 
        .order('date');

    if (error) return res.status(500).json({ success: false, error: error.message });
    res.json({ success: true, data: data });
};

// 4. Create Transaction API (Dipanggil saat Android klik "Bayar")
exports.createTransaction = async (req, res) => {
    const { user_id, event_id, price, category, bank } = req.body;
    
    // Validasi input
    if(!user_id || !event_id || !price) {
        return res.status(400).json({ success: false, message: "Data tidak lengkap" });
    }

    const orderId = `APP-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    try {
        // Request ke Midtrans
        const chargeResp = await coreApi.charge({
            payment_type: 'bank_transfer',
            transaction_details: { order_id: orderId, gross_amount: parseInt(price) },
            bank_transfer: { bank: bank || 'bca' }
        });

        // Simpan ke DB
        const { data, error } = await supabase.from('transactions').insert([{
            user_id, event_id, order_id: orderId, total_amount: price,
            payment_type: bank, status: 'pending', selected_category: category,
            snap_token: JSON.stringify(chargeResp)
        }]).select();

        if(error) throw error;

        // Return Data VA ke Android
        res.json({
            success: true,
            order_id: orderId,
            payment_type: bank,
            va_number: chargeResp.va_numbers[0].va_number, // Nomor VA
            expiry_time: chargeResp.expiry_time
        });

    } catch (err) {
        console.error("API Payment Error:", err.message);
        res.status(500).json({ success: false, message: err.message });
    }
};

// 5. Check Status API
exports.checkStatus = async (req, res) => {
    const { order_id } = req.params;
    try {
        const statusResp = await coreApi.transaction.status(order_id);
        let dbStatus = 'pending';
        
        if (['capture', 'settlement'].includes(statusResp.transaction_status)) dbStatus = 'success';
        else if (['deny', 'cancel', 'expire'].includes(statusResp.transaction_status)) dbStatus = 'failed';

        // Update DB
        await supabase.from('transactions').update({ status: dbStatus }).eq('order_id', order_id);

        res.json({ success: true, status: dbStatus, midtrans_status: statusResp.transaction_status });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};