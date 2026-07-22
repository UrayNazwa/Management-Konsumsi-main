const transactionController = require('./transaction.controller');
const { sendJSON } = require('../../config/response');

async function handleTransactionRoutes(req, res) {
  const { method, url } = req;

  if (!url.startsWith('/api/transactions')) {
    return false;
  }

  if (method === 'GET' && url === '/api/transactions') {
    await transactionController.getAll(req, res);
    return true;
  }

  if (method === 'POST' && url === '/api/transactions') {
    await transactionController.create(req, res);
    return true;
  }

  if (method === 'PUT' && url.startsWith('/api/transactions/')) {
    await transactionController.update(req, res);
    return true;
  }

  if (method === 'DELETE' && url.startsWith('/api/transactions/')) {
    await transactionController.delete(req, res);
    return true;
  }

  sendJSON(res, 404, { error: 'Transaction route not found' });
  return true;
}

module.exports = { handleTransactionRoutes };
