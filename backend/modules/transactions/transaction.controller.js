const transactionService = require('./transaction.service');
const { parseBody, sendJSON } = require('../../config/response');

class TransactionController {
  async getAll(req, res) {
    const transactions = await transactionService.getAllTransactions();
    sendJSON(res, 200, transactions);
  }

  async create(req, res) {
    const body = await parseBody(req);
    const transaction = await transactionService.createTransaction(body);
    sendJSON(res, 201, transaction);
  }

  async update(req, res) {
    const id = parseInt(req.url.split('/')[3]);
    const body = await parseBody(req);
    const transaction = await transactionService.updateTransaction(id, body);
    if (!transaction) {
      sendJSON(res, 404, { error: 'Transaction not found' });
      return;
    }
    sendJSON(res, 200, transaction);
  }

  async delete(req, res) {
    const id = parseInt(req.url.split('/')[3]);
    const success = await transactionService.deleteTransaction(id);
    if (!success) {
      sendJSON(res, 404, { error: 'Transaction not found' });
      return;
    }
    sendJSON(res, 200, { message: 'Transaction deleted successfully' });
  }
}

module.exports = new TransactionController();
