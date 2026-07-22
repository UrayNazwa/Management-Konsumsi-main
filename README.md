# Management Konsumsi & Pokok

## Stack
- Backend: Node.js 24 (vanilla, tanpa framework) + MySQL
- Frontend: Angular 21 + PrimeNG 21
- Database: MySQL
- Containerization: Docker + Docker Compose

## Features
- Dashboard with monthly expense and consumption trends
- Filter dashboard by month and year
- Master data management for items, categories, divisions
- Transaction management (create, edit, delete)
- Reports (monthly, per division, per item)
- Real-time synchronization across all components
- Remaining stock calculation in both master data and reports

---
## Cara Menjalankan Aplikasi (Local Development)

### 📋 Prasyarat
1. Node.js 24 harus terinstal di komputer kamu
2. npm sudah terinstal
3. MySQL harus terinstal dan dapat dijalankan
4. Docker/Docker Compose hanya diperlukan jika ingin menggunakan container

### 🚀 Langkah 1: Jalankan MySQL
Sebelum menjalankan backend, pastikan MySQL sudah aktif.

Di macOS dengan Homebrew:
```bash
brew services start mysql
```

Atau jika menggunakan instalasi MySQL lain:
```bash
mysql.server start
```

Cek koneksi:
```bash
mysql -u root -p
```

> Jika MySQL berjalan dengan user dan password berbeda, sesuaikan environment variable pada backend.

### 🚀 Langkah 2: Jalankan Backend
1. Buka terminal baru
2. Masuk ke direktori backend:
   ```bash
   cd /Users/macintosh/Downloads/Management-Konsumsi-main/backend
   ```
3. Install dependency backend:
   ```bash
   npm install
   ```
4. Jalankan backend:
   ```bash
   npm start
   ```

Backend akan berjalan di: **http://localhost:3000**

#### Konfigurasi Database Backend
Backend membaca konfigurasi dari environment variables:
- `DB_HOST` (default: `localhost`)
- `DB_PORT` (default: `3306`)
- `DB_USER` (default: `root`)
- `DB_PASSWORD` (default: `passwordbaru`)
- `DB_NAME` (default: `management_konsumsi`)

Jika ingin menjalankan dengan konfigurasi custom, jalankan:
```bash
DB_HOST=localhost DB_PORT=3306 DB_USER=root DB_PASSWORD=your_password DB_NAME=management_konsumsi npm start
```

### 🚀 Langkah 3: Jalankan Frontend (Angular)
1. Buka terminal baru
2. Masuk ke direktori frontend:
   ```bash
   cd /Users/macintosh/Downloads/Management-Konsumsi-main/frontend
   ```
3. Install dependency frontend:
   ```bash
   npm install --legacy-peer-deps
   ```
4. Jalankan frontend:
   ```bash
   npm start
   ```

Frontend akan berjalan di: **http://localhost:4200**

### 🎉 Selesai!
Buka browser dan akses **http://localhost:4200**

---
## 🐳 Cara Menjalankan dengan Docker Compose

### 📋 Prasyarat
1. Docker Desktop terinstal dan berjalan
2. Docker Compose tersedia

### 🚀 Langkah-langkah
1. Buka terminal
2. Masuk ke direktori proyek:
   ```bash
   cd /Users/macintosh/Downloads/Management-Konsumsi-main
   ```
3. Build dan jalankan semua service:
   ```bash
   docker-compose up -d --build
   ```

Service akan dijalankan sebagai:
- MySQL: `management-konsumsi-mysql`
- Backend: `management-konsumsi-backend`
- Frontend: `management-konsumsi-frontend`

Setelah container ready, akses:
- Frontend: **http://localhost:4200**
- Backend API: **http://localhost:3001**

> Catatan: Docker Compose memetakan port backend container ke host `3001`, sementara aplikasi di container tetap berjalan di `3000`.

### 🛑 Menghentikan Container
```bash
docker-compose down
```

---
## 📡 API Endpoints
- `GET /api/dashboard` - Ambil data dashboard
- `GET /api/items` - Daftar barang
- `POST /api/items` - Tambah barang
- `PUT /api/items/:id` - Update barang
- `DELETE /api/items/:id` - Hapus barang
- `GET /api/categories` - Daftar kategori
- `POST /api/categories` - Tambah kategori
- `PUT /api/categories/:id` - Update kategori
- `DELETE /api/categories/:id` - Hapus kategori
- `GET /api/divisions` - Daftar divisi
- `POST /api/divisions` - Tambah divisi
- `PUT /api/divisions/:id` - Update divisi
- `DELETE /api/divisions/:id` - Hapus divisi
- `GET /api/transactions` - Daftar transaksi
- `POST /api/transactions` - Tambah transaksi
- `PUT /api/transactions/:id` - Update transaksi
- `DELETE /api/transactions/:id` - Hapus transaksi

---
## 💡 Catatan Penting
- Backend akan membuat database dan tabel secara otomatis jika belum ada.
- Untuk mode local, pastikan MySQL berjalan sebelum menjalankan backend.
- Jika menggunakan Docker Compose, MySQL akan dijalankan di container dan tidak perlu MySQL lokal.
- Jika Anda menggunakan password MySQL berbeda, sesuaikan environment variable `DB_PASSWORD` pada Docker Compose atau local backend.
