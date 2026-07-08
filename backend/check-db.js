const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'data', 'database.db');
const db = new Database(dbPath);

console.log('=== CATEGORIES ===');
console.table(db.prepare('SELECT * FROM categories').all());

console.log('\n=== DIVISIONS ===');
console.table(db.prepare('SELECT * FROM divisions').all());

console.log('\n=== ITEMS ===');
console.table(db.prepare('SELECT * FROM items').all());

console.log('\n=== TRANSACTIONS ===');
console.table(db.prepare('SELECT * FROM transactions').all());

db.close();
