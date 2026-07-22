const categoryRepository = require('./category.repository');

class CategoryService {
  async getAllCategories() {
    return await categoryRepository.findAll();
  }

  async getCategoryById(id) {
    return await categoryRepository.findById(id);
  }

  async createCategory(data) {
    return await categoryRepository.create(data);
  }

  async updateCategory(id, data) {
    return await categoryRepository.update(id, data);
  }

  async deleteCategory(id) {
    return await categoryRepository.delete(id);
  }
}

module.exports = new CategoryService();
