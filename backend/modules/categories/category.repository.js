const { getPool } = require('../../config/database');

class CategoryRepository {
  async findAll() {
    const [rows] = await getPool().query('SELECT * FROM categories');
    return rows;
  }

  async findById(id) {
    const [rows] = await getPool().query('SELECT * FROM categories WHERE id = ?', [id]);
    return rows[0] || null;
  }

  async create(data) {
    const { name, description } = data;
    const [result] = await getPool().query('INSERT INTO categories (name, description) VALUES (?, ?)', [name, description]);
    return { id: result.insertId, name, description };
  }

  async update(id, data) {
    const { name, description } = data;
    const [result] = await getPool().query('UPDATE categories SET name = ?, description = ? WHERE id = ?', [name, description, id]);
    return result.affectedRows > 0 ? { id, name, description } : null;
  }

  async delete(id) {
    const [result] = await getPool().query('DELETE FROM categories WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }
}

module.exports = new CategoryRepository();
