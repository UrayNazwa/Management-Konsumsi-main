const categoryController = require('./category.controller');
const { sendJSON } = require('../../config/response');

async function handleCategoryRoutes(req, res) {
  const { method, url } = req;

  if (!url.startsWith('/api/categories')) {
    return false;
  }

  if (method === 'GET' && url === '/api/categories') {
    await categoryController.getAll(req, res);
    return true;
  }

  if (method === 'POST' && url === '/api/categories') {
    await categoryController.create(req, res);
    return true;
  }

  if (method === 'PUT' && url.startsWith('/api/categories/')) {
    await categoryController.update(req, res);
    return true;
  }

  if (method === 'DELETE' && url.startsWith('/api/categories/')) {
    await categoryController.delete(req, res);
    return true;
  }

  sendJSON(res, 404, { error: 'Category route not found' });
  return true;
}

module.exports = { handleCategoryRoutes };
