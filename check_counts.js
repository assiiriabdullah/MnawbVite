const Database = require('better-sqlite3');
const db = new Database('./data/database.sqlite');
console.log('موظفون:', db.prepare('SELECT COUNT(*) as c FROM employees').get().c);
console.log('إجازات:', db.prepare('SELECT COUNT(*) as c FROM leaves').get().c);
console.log('دورات:', db.prepare('SELECT COUNT(*) as c FROM courses').get().c);
console.log('انتدابات:', db.prepare('SELECT COUNT(*) as c FROM mandates').get().c);
const leaves = db.prepare('SELECT status, COUNT(*) as c FROM leaves GROUP BY status').all();
leaves.forEach(l => console.log(' -', l.status, ':', l.c));
db.close();
