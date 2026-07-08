const http = require('http');
const handleRoute = require('./routes/router');
const { handleCors } = require('./config/response');
const { init } = require('./config/database');

const PORT = 3000;

async function startServer() {
  try {
    // Inisialisasi database terlebih dahulu
    await init();
    
    const server = http.createServer(async (req, res) => {
      if (handleCors(req, res)) {
        return;
      }

      await handleRoute(req, res);
    });

    server.listen(PORT, () => {
      console.log(`Server berjalan di http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Gagal memulai server:', error);
    process.exit(1);
  }
}

startServer();
