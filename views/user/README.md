# AppPayment - Sistem Pemesanan Tiket Konser

Aplikasi web untuk menjelajahi dan memesan tiket konser, dibangun menggunakan Node.js, Express, dan EJS templating engine.

## Struktur Folder & Fungsi

Berikut adalah gambaran struktur folder proyek beserta penjelasan fungsinya:

```text
AppPayment/
├── node_modules/          # Folder otomatis yang berisi library/dependensi (Express, EJS, dll)
├── public/                # (Asumsi) Menyimpan file statis yang dapat diakses publik
│   ├── css/               # File stylesheet untuk styling halaman
│   ├── js/                # Script JavaScript sisi klien
│   └── images/            # Gambar aset statis
├── routes/                # (Asumsi) Mengatur logika routing URL (misal: rute ke halaman home atau checkout)
├── views/                 # Folder untuk template tampilan (Frontend)
│   ├── partials/          # Komponen UI yang digunakan berulang kali
│   │   ├── header.ejs     # Bagian navigasi atas
│   │   └── footer.ejs     # Bagian kaki halaman
│   └── user/              # Halaman-halaman yang diakses oleh pengguna umum
│       └── index.ejs      # Halaman utama yang menampilkan daftar konser/event
├── app.js                 # (Asumsi) File utama (entry point) untuk menjalankan server aplikasi
├── package.json           # File konfigurasi proyek, skrip, dan daftar dependensi
└── README.md              # Dokumentasi proyek ini
```

## Penjelasan File Penting

*   **`views/user/index.ejs`**: Ini adalah halaman beranda untuk pengguna. File ini bertugas:
    *   Menampilkan daftar konser yang tersedia (`events`) dalam bentuk kartu (card).
    *   Menangani kondisi jika tidak ada event (menampilkan pesan kosong).
    *   Memformat harga tiket ke format mata uang Rupiah.
    *   Menyediakan tombol "Beli Tiket" yang mengarah ke halaman checkout.
*   **`views/partials/`**: Berisi potongan kode HTML seperti navbar dan footer agar tidak perlu ditulis ulang di setiap halaman.

## Cara Menjalankan

1.  Pastikan Node.js sudah terinstall.
2.  Install dependensi:
    ```bash
    npm install
    ```
3.  Jalankan aplikasi:
    ```bash
    npm start
    ```