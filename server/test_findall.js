const Destination = require('./src/models/destination.model');
(async () => {
  try {
    const filters = { status: undefined };
    const res = await Destination.findAll(filters);
    console.log('FIND ALL ITEMS:', res.items.map(i => i.status));
  } catch(e) { console.error(e); }
  process.exit(0);
})();
