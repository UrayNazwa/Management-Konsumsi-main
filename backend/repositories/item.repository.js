const { getPool } = require('../config/database');

class ItemRepository {
  async findAll() {
    const [rows] = await getPool().query('SELECT * FROM items');
    return rows;
  }

  async findById(id) {
    const [rows] = await getPool().query('SELECT * FROM items WHERE id = ?', [id]);
    return rows[0] || null;
  }

  async create(data) {
    const { name, category, unit, price, stock } = data;
    const [result] = await getPool().query('INSERT INTO items (name, category, unit, price, stock) VALUES (?, ?, ?, ?, ?)', [name, category, unit, price, stock]);
    return { id: result.insertId, name, category, unit, price, stock };
  }

  async update(id, data) {
    const { name, category, unit, price, stock } = data;
    const [result] = await getPool().query('UPDATE items SET name = ?, category = ?, unit = ?, price = ?, stock = ? WHERE id = ?', [name, category, unit, price, stock, id]);
    return result.affectedRows > 0 ? { id, name, category, unit, price, stock } : null;
  }

  async delete(id) {
    const [result] = await getPool().query('DELETE FROM items WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }
}

module.exports = new ItemRepository();
