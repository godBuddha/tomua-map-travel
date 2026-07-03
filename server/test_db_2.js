const db = require('./src/config/database');
(async () => {
  const result = await db('destinations').select('id', 'status', 'created_by'); // select * to see if there is deleted_at? Wait, I didn't select deleted_at before. Let's do select *
  const result2 = await db.raw('SELECT id, status, deleted_at FROM destinations');
  console.log('DESTINATIONS:', result2.rows);
  process.exit(0);
})();
