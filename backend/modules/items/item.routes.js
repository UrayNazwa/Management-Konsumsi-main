const itemController = require('./item.controller');
const { sendJSON } = require('../../config/response');

async function handleItemRoutes(req, res) {
  const { method, url } = req;

  if (!url.startsWith('/api/items')) {
    return false;
  }

  if (method === 'GET' && url === '/api/items') {
    await itemController.getAll(req, res);
    return true;
  }

  if (method === 'POST' && url === '/api/items') {
    await itemController.create(req, res);
    return true;
  }

  if (method === 'PUT' && url.startsWith('/api/items/')) {
    await itemController.update(req, res);
    return true;
  }

  if (method === 'DELETE' && url.startsWith('/api/items/')) {
    await itemController.delete(req, res);
    return true;
  }

  sendJSON(res, 404, { error: 'Item route not found' });
  return true;
}

module.exports = { handleItemRoutes };
