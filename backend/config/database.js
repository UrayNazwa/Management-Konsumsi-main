const mysql = require('mysql2/promise');

// Konfigurasi database MySQL TANPA DATABASE terlebih dahulu
const initialConfig = {
  host: 'localhost',
  user: 'root',
  password: '',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

const dbName = 'management_konsumsi';

// Pool koneksi akhir (dengan database)
let pool;

async function initializeDatabase() {
  try {
    // Buat koneksi sementara tanpa database untuk membuat DB
    const tempConn = await mysql.createConnection(initialConfig);
    
    // Buat database jika belum ada
    await tempConn.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``);
    await tempConn.end();
    
    // Sekarang buat pool dengan database yang sudah dibuat
    pool = mysql.createPool({
      ...initialConfig,
      database: dbName
    });
    
    // Buat tabel
    const connection = await pool.getConnection();
    try {
      // Buat tabel categories
      await connection.query(`
        CREATE TABLE IF NOT EXISTS categories (
          id INT AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          description TEXT NOT NULL
        )
      `);

      // Buat tabel divisions
      await connection.query(`
        CREATE TABLE IF NOT EXISTS divisions (
          id INT AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          description TEXT NOT NULL
        )
      `);

      // Buat tabel items
      await connection.query(`
        CREATE TABLE IF NOT EXISTS items (
          id INT AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          category VARCHAR(255) NOT NULL,
          unit VARCHAR(50) NOT NULL,
          price INT NOT NULL,
          stock INT NOT NULL
        )
      `);

      // Buat tabel transactions
      await connection.query(`
        CREATE TABLE IF NOT EXISTS transactions (
          id INT AUTO_INCREMENT PRIMARY KEY,
          itemId INT NOT NULL,
          itemName VARCHAR(255) NOT NULL,
          quantity INT NOT NULL,
          division VARCHAR(255) NOT NULL,
          date VARCHAR(50) NOT NULL,
          total INT NOT NULL
        )
      `);

      console.log('Database dan tabel berhasil diinisialisasi');
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Gagal menginisialisasi database:', error);
    throw error;
  }
}

// Export fungsi untuk menunggu inisialisasi selesai
module.exports = {
  init: initializeDatabase,
  getPool: () => pool
};
