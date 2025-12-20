const supabase = require('../../config/supabase');
const coreApi = require('../../config/midtrans');

// 1. Halaman Home (Katalog)
exports.home = async (req, res) => {
    const { data: events } = await supabase.from('events').select('*').order('date', { ascending: true });
    res.render('user/index', { events });
};

// 2. Halaman Checkout
exports.showCheckout = async (req, res) => {
    const { data: event } = await supabase.from('events').select('*').eq('id', req.params.id).single();
    res.render('user/payment', { event });
};

// 3. Proses Buat Pesanan (Midtrans)
exports.processPayment = async (req, res) => {
    const { event_id, price, category, bank } = req.body;
    
    // ID Order Unik: TKT + Timestamp + Random
    const orderId = `TKT-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    try {
        // A. Request ke Midtrans
        const chargeResp = await coreApi.charge({
            payment_type: 'bank_transfer',
            transaction_details: {
                order_id: orderId,
                gross_amount: parseInt(price)
            },
            bank_transfer: { bank: bank }
        });

        // B. Simpan Transaksi ke Database
        const { error } = await supabase.from('transactions').insert([{
            user_id: req.session.user.id,
            event_id: event_id,
            order_id: orderId,
            total_amount: price,
            payment_type: bank,
            status: 'pending',
            selected_category: category,
            snap_token: JSON.stringify(chargeResp) // Simpan respon lengkap buat ambil VA nanti
        }]);

        if (error) throw error;

        res.redirect('/history');
    } catch (err) {
        console.error(err);
        res.send("Gagal memproses pembayaran: " + err.message);
    }
};

// 4. Riwayat Transaksi
exports.history = async (req, res) => {
    const { data: transactions } = await supabase
        .from('transactions')
        .select('*, events(name, image_url, date)')
        .eq('user_id', req.session.user.id)
        .order('created_at', { ascending: false });

    res.render('user/history', { transactions });
};

exports.showCheckout = async (req, res) => {
    try {
        const { data: event } = await supabase
            .from('events')
            .select('*, lineups(*)') // <--- AMBIL LINEUPS JUGA
            .eq('id', req.params.id)
            .single();
            
        if (!event) return res.redirect('/');
        res.render('user/payment', { event });
    } catch (err) {
        res.redirect('/');
    }
};

// 5. Cek Status Pembayaran (Manual Polling)
exports.checkStatus = async (req, res) => {
    const { orderId } = req.params;
    try {
        // Cek ke Midtrans Server
        const statusResp = await coreApi.transaction.status(orderId);
        
        let dbStatus = 'pending';
        if (['capture', 'settlement'].includes(statusResp.transaction_status)) {
            dbStatus = 'success';
        } else if (['deny', 'cancel', 'expire'].includes(statusResp.transaction_status)) {
            dbStatus = 'failed';
        }

        // Update Database
        await supabase.from('transactions')
            .update({ status: dbStatus })
            .eq('order_id', orderId);

        res.redirect('/history');
    } catch (err) {
        res.redirect('/history');
    }
};