const divisionRepository = require('../repositories/division.repository');

class DivisionService {
  async getAllDivisions() {
    return await divisionRepository.findAll();
  }

  async getDivisionById(id) {
    return await divisionRepository.findById(id);
  }

  async createDivision(data) {
    return await divisionRepository.create(data);
  }

  async updateDivision(id, data) {
    return await divisionRepository.update(id, data);
  }

  async deleteDivision(id) {
    return await divisionRepository.delete(id);
  }
}

module.exports = new DivisionService();
