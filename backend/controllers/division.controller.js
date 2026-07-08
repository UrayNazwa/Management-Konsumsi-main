const divisionService = require('../services/division.service');
const { parseBody, sendJSON } = require('../config/response');

class DivisionController {
  async getAll(req, res) {
    const divisions = await divisionService.getAllDivisions();
    sendJSON(res, 200, divisions);
  }

  async create(req, res) {
    const body = await parseBody(req);
    const division = await divisionService.createDivision(body);
    sendJSON(res, 201, division);
  }

  async update(req, res) {
    const id = parseInt(req.url.split('/')[3]);
    const body = await parseBody(req);
    const division = await divisionService.updateDivision(id, body);
    if (!division) {
      sendJSON(res, 404, { error: 'Division not found' });
      return;
    }
    sendJSON(res, 200, division);
  }

  async delete(req, res) {
    const id = parseInt(req.url.split('/')[3]);
    const success = await divisionService.deleteDivision(id);
    if (!success) {
      sendJSON(res, 404, { error: 'Division not found' });
      return;
    }
    sendJSON(res, 200, { message: 'Division deleted successfully' });
  }
}

module.exports = new DivisionController();
