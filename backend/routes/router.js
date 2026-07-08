const dashboardController = require('../controllers/dashboard.controller');
const categoryController = require('../controllers/category.controller');
const divisionController = require('../controllers/division.controller');
const itemController = require('../controllers/item.controller');
const transactionController = require('../controllers/transaction.controller');
const { sendJSON } = require('../config/response');

async function handleRoute(req, res) {
  const { method, url } = req;
  const baseUrl = url.split('?')[0];

  if (method === 'GET' && baseUrl === '/api/dashboard') {
    return dashboardController.getDashboard(req, res);
  }

  if (url.startsWith('/api/categories')) {
    if (method === 'GET' && url === '/api/categories') {
      return categoryController.getAll(req, res);
    }
    if (method === 'POST' && url === '/api/categories') {
      return categoryController.create(req, res);
    }
    if (method === 'PUT' && url.startsWith('/api/categories/')) {
      return categoryController.update(req, res);
    }
    if (method === 'DELETE' && url.startsWith('/api/categories/')) {
      return categoryController.delete(req, res);
    }
  }

  if (url.startsWith('/api/divisions')) {
    if (method === 'GET' && url === '/api/divisions') {
      return divisionController.getAll(req, res);
    }
    if (method === 'POST' && url === '/api/divisions') {
      return divisionController.create(req, res);
    }
    if (method === 'PUT' && url.startsWith('/api/divisions/')) {
      return divisionController.update(req, res);
    }
    if (method === 'DELETE' && url.startsWith('/api/divisions/')) {
      return divisionController.delete(req, res);
    }
  }

  if (url.startsWith('/api/items')) {
    if (method === 'GET' && url === '/api/items') {
      return itemController.getAll(req, res);
    }
    if (method === 'POST' && url === '/api/items') {
      return itemController.create(req, res);
    }
    if (method === 'PUT' && url.startsWith('/api/items/')) {
      return itemController.update(req, res);
    }
    if (method === 'DELETE' && url.startsWith('/api/items/')) {
      return itemController.delete(req, res);
    }
  }

  if (url.startsWith('/api/transactions')) {
    if (method === 'GET' && url === '/api/transactions') {
      return transactionController.getAll(req, res);
    }
    if (method === 'POST' && url === '/api/transactions') {
      return transactionController.create(req, res);
    }
    if (method === 'PUT' && url.startsWith('/api/transactions/')) {
      return transactionController.update(req, res);
    }
    if (method === 'DELETE' && url.startsWith('/api/transactions/')) {
      return transactionController.delete(req, res);
    }
  }

  sendJSON(res, 404, { error: 'Route not found' });
}

module.exports = handleRoute;
