const divisionController = require('./division.controller');
const { sendJSON } = require('../../config/response');

async function handleDivisionRoutes(req, res) {
  const { method, url } = req;

  if (!url.startsWith('/api/divisions')) {
    return false;
  }

  if (method === 'GET' && url === '/api/divisions') {
    await divisionController.getAll(req, res);
    return true;
  }

  if (method === 'POST' && url === '/api/divisions') {
    await divisionController.create(req, res);
    return true;
  }

  if (method === 'PUT' && url.startsWith('/api/divisions/')) {
    await divisionController.update(req, res);
    return true;
  }

  if (method === 'DELETE' && url.startsWith('/api/divisions/')) {
    await divisionController.delete(req, res);
    return true;
  }

  sendJSON(res, 404, { error: 'Division route not found' });
  return true;
}

module.exports = { handleDivisionRoutes };
