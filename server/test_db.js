const db = require('./src/config/database');
(async () => {
  const result = await db('destinations').select('id', 'status', 'created_by');
  console.log('DESTINATIONS:', result);
  process.exit(0);
})();
