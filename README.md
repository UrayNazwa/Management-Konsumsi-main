# Management Konsumsi & Pokok

## Stack
- **Backend**: Node.js 24 (vanilla, tanpa framework) + MySQL
- **Frontend**: Angular 21 + PrimeNG 21
- **Database**: MySQL
- **Containerization**: Docker + Docker Compose

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
1. **Node.js 24** harus terinstal di komputer kamu
2. **npm** (sudah termasuk dengan Node.js)

### 🚀 Langkah 1: Jalankan Backend
1. Buka **Terminal Baru**
2. Masuk ke direktori backend:
   ```bash
   cd ~/Desktop/iyutonge/management\ konsumsi/backend
   ```
3. Install dependencies (jika belum):
   ```bash
   npm install
   ```
4. Hentikan proses yang memakai port 3000 (jika ada):
   ```bash
   lsof -ti :3000 | xargs kill -9
   ```
5. Jalankan backend:
   ```bash
   npm start
   ```
   - Backend akan berjalan di **http://localhost:3000**
   - Pastikan MySQL sudah berjalan, karena backend menggunakan MySQL sebagai database.

### 🚀 Langkah 2: Jalankan Frontend (Angular 21)
1. Buka **Terminal Baru** (jangan tutup terminal backend!)
2. Masuk ke direktori frontend:
   ```bash
   cd ~/Desktop/iyutonge/management\ konsumsi/frontend
   ```
3. Install dependencies (jika belum):
   ```bash
   rm -rf node_modules package-lock.json  # Membersihkan file lama
   npm install --legacy-peer-deps
   ```
4. Jalankan frontend:
   ```bash
   npm start
   ```
   - Frontend akan berjalan di **http://localhost:4200**

> Pastikan MySQL sudah berjalan sebelum backend dijalankan.

### 🎉 Selesai!
Buka browser kamu dan akses **http://localhost:4200**

---
## 🐳 Cara Menjalankan dengan Docker Compose

### 📋 Prasyarat
1. **Docker Desktop** harus terinstal dan berjalan

### 🚀 Langkah-langkah
1. Buka Terminal
2. Masuk ke direktori proyek:
   ```bash
   cd ~/Desktop/iyutonge/management\ konsumsi
   ```
3. Build dan jalankan semua container:
   ```bash
   docker-compose up -d --build
   ```
4. Tunggu proses selesai, kemudian akses:
   - Frontend: **http://localhost:4200**
   - Backend API: **http://localhost:3000**

### 🛑 Menghentikan Container
```bash
docker-compose down
```

---
## 📡 API Endpoints
- `GET /api/dashboard` - Get dashboard data (opsional: `?year=2026&month=7`)
- `GET/POST/PUT/DELETE /api/items` - Manage items
- `GET/POST/PUT/DELETE /api/categories` - Manage categories
- `GET/POST/PUT/DELETE /api/divisions` - Manage divisions
- `GET/POST/PUT/DELETE /api/transactions` - Manage transactions

---
## 💡 Catatan Penting
- **MySQL**: Backend menggunakan MySQL. Pastikan service MySQL aktif dan koneksi database sudah dikonfigurasi sebelum menjalankan backend.
- **Angular 21**: Frontend menggunakan Angular 21 dengan PrimeNG 21. Pastikan kamu menjalankan `npm install --legacy-peer-deps` untuk menghindari konflik dependency.
