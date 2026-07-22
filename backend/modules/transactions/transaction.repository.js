const { getPool } = require('../../config/database');

class TransactionRepository {
  async findAll() {
    const [rows] = await getPool().query('SELECT * FROM transactions ORDER BY date DESC');
    return rows;
  }

  async findById(id) {
    const [rows] = await getPool().query('SELECT * FROM transactions WHERE id = ?', [id]);
    return rows[0] || null;
  }

  async create(data) {
    const { itemId, itemName, quantity, division, date, total } = data;
    const [result] = await getPool().query('INSERT INTO transactions (itemId, itemName, quantity, division, date, total) VALUES (?, ?, ?, ?, ?, ?)', [itemId, itemName, quantity, division, date, total]);
    return { id: result.insertId, itemId, itemName, quantity, division, date, total };
  }

  async update(id, data) {
    const { itemId, itemName, quantity, division, date, total } = data;
    const [result] = await getPool().query('UPDATE transactions SET itemId = ?, itemName = ?, quantity = ?, division = ?, date = ?, total = ? WHERE id = ?', [itemId, itemName, quantity, division, date, total, id]);
    return result.affectedRows > 0 ? { id, itemId, itemName, quantity, division, date, total } : null;
  }

  async delete(id) {
    const [result] = await getPool().query('DELETE FROM transactions WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }
}

module.exports = new TransactionRepository();
