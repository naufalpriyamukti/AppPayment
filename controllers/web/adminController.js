const supabase = require('../../config/supabase');

// ... (exports.dashboard TETAP SAMA) ...
exports.dashboard = async (req, res) => {
    try {
        const { data: events, error } = await supabase
            .from('events')
            .select('*')
            .order('created_at', { ascending: false });
        if (error) throw error;
        res.render('admin/dashboard', { events: events || [] });
    } catch (err) {
        res.send("Error Dashboard: " + err.message);
    }
};

exports.showAddForm = (req, res) => {
    res.render('admin/form_event', { event: null, title: 'Tambah Event Baru' });
};

// --- UPDATE BAGIAN CREATE EVENT ---
exports.createEvent = async (req, res) => {
    // Ambil lineups[] dari body (bisa array atau string tunggal)
    const { name, vendor, date, time, location, price_reg, price_vip, image_url, description, lineups } = req.body;
    
    try {
        // 1. Simpan Event Dulu
        const { data: eventData, error } = await supabase.from('events').insert([{
            name, vendor_name: vendor, date, time, location,
            price_regular: price_reg, price_vip: price_vip, 
            image_url, description
        }]).select().single();

        if (error) throw error;

        // 2. Simpan Lineups (Jika ada)
        if (lineups) {
            // Pastikan lineups jadi array (kalau cuma 1 input, dia jadi string, kita ubah ke array)
            const artistList = Array.isArray(lineups) ? lineups : [lineups];
            
            const lineupPayload = artistList.map(artist => ({
                event_id: eventData.id,
                artist_name: artist
            }));

            await supabase.from('lineups').insert(lineupPayload);
        }

        res.redirect('/admin/dashboard');
    } catch (err) {
        res.send("Gagal Simpan: " + err.message);
    }
};

// --- UPDATE BAGIAN SHOW EDIT FORM ---
exports.showEditForm = async (req, res) => {
    try {
        // Kita join tabel lineups biar muncul saat diedit
        const { data: event } = await supabase
            .from('events')
            .select('*, lineups(*)') // <--- JOIN DATA LINEUPS
            .eq('id', req.params.id)
            .single();
            
        res.render('admin/form_event', { event, title: 'Edit Event' });
    } catch (err) {
        res.redirect('/admin/dashboard');
    }
};

// --- UPDATE BAGIAN UPDATE EVENT ---
exports.updateEvent = async (req, res) => {
    const { name, vendor, date, time, location, price_reg, price_vip, image_url, description, lineups } = req.body;
    try {
        // 1. Update Data Event Utama
        await supabase.from('events').update({
            name, vendor_name: vendor, date, time, location,
            price_regular: price_reg, price_vip: price_vip, 
            image_url, description
        }).eq('id', req.params.id);

        // 2. Update Lineups (Cara paling aman: Hapus semua yg lama, insert yg baru)
        // Hapus lineup lama
        await supabase.from('lineups').delete().eq('event_id', req.params.id);

        // Insert lineup baru
        if (lineups) {
            const artistList = Array.isArray(lineups) ? lineups : [lineups];
            const lineupPayload = artistList.map(artist => ({
                event_id: req.params.id,
                artist_name: artist
            }));
            await supabase.from('lineups').insert(lineupPayload);
        }

        res.redirect('/admin/dashboard');
    } catch (err) {
        res.send("Gagal Update: " + err.message);
    }
};

exports.deleteEvent = async (req, res) => {
    try {
        // Karena kita pakai ON DELETE CASCADE di SQL, 
        // kita cukup hapus event, lineup otomatis hilang.
        await supabase.from('events').delete().eq('id', req.params.id);
        res.redirect('/admin/dashboard');
    } catch (err) {
        res.send("Gagal Hapus: " + err.message);
    }
};