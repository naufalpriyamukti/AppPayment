// test_android_request.js
const https = require('https');

// Domain Railway kamu
const BASE_URL = 'web-production-52f63.up.railway.app';

/**
 * Simulasi Request Token Pembayaran (POST)
 * Sesuai alur REQ-F-031 integrasi payment gateway [cite: 199]
 */
function testGetPaymentToken() {
    const orderId = "TRX-" + Math.floor(Math.random() * 1000000); // ID unik setiap tes [cite: 169]
    
    const postData = JSON.stringify({
        orderId: orderId,
        totalAmount: 150000, // Contoh harga tiket [cite: 169]
        customerDetails: {
            name: "Mahasiswa Tester",
            email: "tester@tiketons.com"
        }
    });

    const options = {
        hostname: BASE_URL,
        port: 443,
        path: '/api/payment',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': postData.length
        }
    };

    console.log(`--- Mengirim Request untuk Order ID: ${orderId} ---`);

    const req = https.request(options, (res) => {
        let responseBody = '';
        res.on('data', (d) => { responseBody += d; });
        
        res.on('end', () => {
            console.log(`Status Code: ${res.statusCode}`);
            try {
                const json = JSON.parse(responseBody);
                console.log("Respon dari Backend:", json);
                
                if (json.token) {
                    console.log("\n✅ BERHASIL! Token Midtrans didapatkan.");
                    console.log("URL Pembayaran:", json.redirect_url);
                }
            } catch (e) {
                console.log("Respon bukan JSON:", responseBody);
            }
        });
    });

    req.on('error', (e) => {
        console.error("❌ ERROR KONEKSI:", e.message);
    });

    req.write(postData);
    req.end();
}

// Jalankan Tes
testGetPaymentToken();