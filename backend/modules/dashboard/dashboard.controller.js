const dashboardService = require('./dashboard.service');
const { sendJSON } = require('../../config/response');
const url = require('url');

class DashboardController {
  async getDashboard(req, res) {
    const queryObject = url.parse(req.url, true).query;
    const year = queryObject.year ? parseInt(queryObject.year) : null;
    const month = queryObject.month ? parseInt(queryObject.month) : null;
    const data = await dashboardService.getDashboardData(year, month);
    sendJSON(res, 200, data);
  }
}

module.exports = new DashboardController();
