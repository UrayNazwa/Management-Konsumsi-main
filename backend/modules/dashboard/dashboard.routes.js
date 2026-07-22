const dashboardController = require('./dashboard.controller');
const { sendJSON } = require('../../config/response');

async function handleDashboardRoutes(req, res) {
  const { method, url } = req;

  if (method === 'GET' && url.startsWith('/api/dashboard')) {
    await dashboardController.getDashboard(req, res);
    return true;
  }

  return false;
}

module.exports = { handleDashboardRoutes };
