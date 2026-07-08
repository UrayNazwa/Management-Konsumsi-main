const itemRepository = require('../repositories/item.repository');

class ItemService {
  async getAllItems() {
    return await itemRepository.findAll();
  }

  async getItemById(id) {
    return await itemRepository.findById(id);
  }

  async createItem(data) {
    return await itemRepository.create(data);
  }

  async updateItem(id, data) {
    return await itemRepository.update(id, data);
  }

  async deleteItem(id) {
    return await itemRepository.delete(id);
  }
}

module.exports = new ItemService();
