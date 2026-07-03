require('dotenv').config();
const jwt = require('jsonwebtoken');

const adminToken = jwt.sign({ id: '00000000-0000-0000-0000-000000000000', role: 'admin' }, process.env.JWT_SECRET || 'tomua_secret_key_2024', { expiresIn: '1h' });

(async () => {
  try {
    const res = await fetch('http://localhost:3000/api/destinations?limit=50', {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const data = await res.json();
    console.log('ADMIN DATA STATUSES:', data.data?.items?.map(i => i.status) || data);
  } catch(e) {
    console.error(e);
  }
  process.exit(0);
})();
