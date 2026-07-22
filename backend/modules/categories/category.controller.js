const categoryService = require('./category.service');
const { parseBody, sendJSON } = require('../../config/response');

class CategoryController {
  async getAll(req, res) {
    const categories = await categoryService.getAllCategories();
    sendJSON(res, 200, categories);
  }

  async create(req, res) {
    const body = await parseBody(req);
    const category = await categoryService.createCategory(body);
    sendJSON(res, 201, category);
  }

  async update(req, res) {
    const id = parseInt(req.url.split('/')[3]);
    const body = await parseBody(req);
    const category = await categoryService.updateCategory(id, body);
    if (!category) {
      sendJSON(res, 404, { error: 'Category not found' });
      return;
    }
    sendJSON(res, 200, category);
  }

  async delete(req, res) {
    const id = parseInt(req.url.split('/')[3]);
    const success = await categoryService.deleteCategory(id);
    if (!success) {
      sendJSON(res, 404, { error: 'Category not found' });
      return;
    }
    sendJSON(res, 200, { message: 'Category deleted successfully' });
  }
}

module.exports = new CategoryController();
