# Instagram Connection Analyzer

Aplikasi React untuk menganalisis data `followers` dan `following` dari export Instagram. UI ini membantu melihat akun mutual, akun yang tidak follow back, dan akun yang belum Anda follow balik tanpa perlu mengunggah data ke server lain.

Untuk versi publik/deploy, data JSON dipilih langsung oleh user melalui file picker dan diproses lokal di browser.

## Fitur

- **Upload interaktif** untuk `followers_1.json` dan `following.json`.
- **Ringkasan jumlah akun** untuk followers, following, mutual, dan tidak follow back.
- **Tab hasil** untuk berpindah kategori analisis.
- **Pencarian username** di setiap kategori.
- **Urutkan A-Z / Z-A**.
- **Copy hasil** ke clipboard.
- **Export CSV** untuk daftar yang sedang tampil.
- **Baca dari folder data saat local dev** melalui tombol **Muat dari data/**. Tombol ini tidak muncul di production build.
- **Mode CLI tetap tersedia** melalui `npm run cli` atau `node index.js`.

## Prasyarat

- Node.js 20.x atau lebih baru.
- File data Instagram:
  - `followers_1.json`
  - `following.json`

## Cara Mendapatkan Data Instagram

1. Buka Instagram.
2. Masuk ke **Settings and privacy**.
3. Pilih **Accounts Center**.
4. Pilih **Your information and permissions**.
5. Pilih **Download your information**.
6. Buat request download untuk akun Instagram Anda.
7. Pilih **Select types of information**.
8. Centang hanya **Followers and following**.
9. Pilih format **JSON**.
10. Submit request dan tunggu file dari Instagram tersedia.

Setelah file ZIP diunduh, ekstrak lalu cari folder `followers_and_following`. Di dalamnya biasanya ada `followers_1.json` dan `following.json`.

## Menyiapkan Folder Data

Simpan file Instagram di folder `data/`:

```text
Analyzer-Connection-Instagram
├── data
│   ├── followers_1.json
│   └── following.json
├── index.js
├── index.html
├── package.json
├── README.md
└── src
```

File `.json` di folder `data/` sudah di-ignore oleh Git agar data pribadi tidak ikut commit.

## Menjalankan UI React

Clone atau download project ini, lalu jalankan:

```bash
npm install
npm run dev
```

Buka URL yang muncul di terminal, biasanya:

```text
http://localhost:5173
```

Di halaman aplikasi saat local dev:

1. Klik **Muat dari data/** untuk membaca `data/followers_1.json` dan `data/following.json`.
2. Jika tidak memakai folder `data/`, pilih file manual pada panel **Followers** dan **Following**.
3. Lihat hasil pada tab **Tidak Follow Back**, **Belum Anda Follow**, dan **Mutual**.
4. Gunakan pencarian, tombol urutkan, copy, atau download CSV sesuai kebutuhan.

Saat aplikasi sudah dideploy, user cukup memilih file manual pada panel **Followers** dan **Following**. File diproses di browser user dan tidak diupload ke Vercel.

## Build Production

Untuk membuat build static:

```bash
npm run build
```

Untuk mengecek hasil build:

```bash
npm run preview
```

## SEO dan Sitemap

Project menyertakan `public/sitemap.xml` dan `public/robots.txt`.
Keduanya dibuat otomatis sebelum build melalui:

```bash
npm run seo
```

Default URL production:

```text
https://instalyze.ghaniyyirrahmans.me
```

Jika domain berubah, jalankan:

```bash
SITE_URL=https://domain-baru.example npm run seo
```

Sitemap memuat halaman utama dan halaman panduan SEO:

- `/`
- `/cara-download-data-instagram/`
- `/how-to-download-instagram-data/`

Section seperti `#upload`, `#summary`, dan `#results` tidak dimasukkan karena fragment URL tidak dianggap halaman terpisah oleh sitemap search engine.

SEO halaman utama memakai copy bilingual Indonesia-Inggris agar bisa menjangkau pencarian seperti "cek tidak follow back Instagram", "Instagram unfollowers", "who doesn't follow me back", dan "mutual followers".

## Deploy ke Vercel

Project ini bisa dideploy ke Vercel karena UI React dibuild sebagai static site.

Pengaturan Vercel:

```text
Framework Preset: Vite
Build Command: npm run build
Output Directory: dist
Install Command: npm install
```

Untuk deployment publik, jangan deploy file Instagram pribadi. Biarkan user memilih file lewat browser dengan upload manual.

Mode production tidak menampilkan tombol **Muat dari data/**, sehingga aplikasi tidak mencoba membaca file JSON dari server Vercel.

## Menjalankan Mode CLI

Mode CLI lama masih tersedia. Letakkan `followers_1.json` dan `following.json` di folder `data/`, lalu jalankan:

```bash
npm run cli
```

atau:

```bash
node index.js
```

Struktur file yang dibaca CLI:

```text
Analyzer-Connection-Instagram
├── data
│   ├── followers_1.json
│   └── following.json
├── index.js
├── index.html
├── package.json
├── README.md
├── src
│   ├── App.css
│   ├── App.jsx
│   └── main.jsx
```

## Contoh Output CLI

```text
[INFO] Successfully loaded 82 Followers from followers_1.json.
[INFO] Successfully loaded 76 Following from following.json.

--- Results ---

Mutual Followers (55):
- username_1
- username_2

Who is not following you back (21):
- username99
- username98

Who you don't follow back (27):
- username73
- username72
```

## Catatan Privasi

UI React memproses file JSON di browser menggunakan `FileReader`. File user tidak diupload ke Vercel, tidak dikirim ke backend, dan tidak disimpan oleh aplikasi.

Aplikasi ini tidak memiliki API upload. Selama tidak ditambahkan backend baru yang menerima file, data user tetap berada di device/browser mereka.

## Credit

Program ini dibuat dan dikembangkan oleh **ghanirahmans** untuk keperluan portofolio.

## License

This project is licensed under the MIT License.
