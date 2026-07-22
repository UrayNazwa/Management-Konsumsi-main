const itemService = require('./item.service');
const { parseBody, sendJSON } = require('../../config/response');

class ItemController {
  async getAll(req, res) {
    const items = await itemService.getAllItems();
    sendJSON(res, 200, items);
  }

  async create(req, res) {
    const body = await parseBody(req);
    const item = await itemService.createItem(body);
    sendJSON(res, 201, item);
  }

  async update(req, res) {
    const id = parseInt(req.url.split('/')[3]);
    const body = await parseBody(req);
    const item = await itemService.updateItem(id, body);
    if (!item) {
      sendJSON(res, 404, { error: 'Item not found' });
      return;
    }
    sendJSON(res, 200, item);
  }

  async delete(req, res) {
    const id = parseInt(req.url.split('/')[3]);
    const success = await itemService.deleteItem(id);
    if (!success) {
      sendJSON(res, 404, { error: 'Item not found' });
      return;
    }
    sendJSON(res, 200, { message: 'Item deleted successfully' });
  }
}

module.exports = new ItemController();
