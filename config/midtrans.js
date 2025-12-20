const midtransClient = require('midtrans-client');
require('dotenv').config();

// Menggunakan Core API sesuai permintaan (bukan Snap)
const coreApi = new midtransClient.CoreApi({
    isProduction: false, // Ubah ke true jika live
    serverKey: process.env.MIDTRANS_SERVER_KEY,
    clientKey: process.env.MIDTRANS_CLIENT_KEY
});

module.exports = coreApi;