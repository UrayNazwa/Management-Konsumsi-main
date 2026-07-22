const transactionRepository = require('./transaction.repository');

class TransactionService {
  async getAllTransactions() {
    return await transactionRepository.findAll();
  }

  async getTransactionById(id) {
    return await transactionRepository.findById(id);
  }

  async createTransaction(data) {
    return await transactionRepository.create(data);
  }

  async updateTransaction(id, data) {
    return await transactionRepository.update(id, data);
  }

  async deleteTransaction(id) {
    return await transactionRepository.delete(id);
  }
}

module.exports = new TransactionService();
