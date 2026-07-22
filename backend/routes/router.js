const { handleDashboardRoutes } = require('../modules/dashboard/dashboard.routes');
const { handleCategoryRoutes } = require('../modules/categories/category.routes');
const { handleDivisionRoutes } = require('../modules/divisions/division.routes');
const { handleItemRoutes } = require('../modules/items/item.routes');
const { handleTransactionRoutes } = require('../modules/transactions/transaction.routes');
const { sendJSON } = require('../config/response');

async function handleRoute(req, res) {
  if (await handleDashboardRoutes(req, res)) {
    return;
  }

  if (await handleCategoryRoutes(req, res)) {
    return;
  }

  if (await handleDivisionRoutes(req, res)) {
    return;
  }

  if (await handleItemRoutes(req, res)) {
    return;
  }

  if (await handleTransactionRoutes(req, res)) {
    return;
  }

  sendJSON(res, 404, { error: 'Route not found' });
}

module.exports = handleRoute;
