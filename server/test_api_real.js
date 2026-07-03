const jwt = require('jsonwebtoken');

const adminToken = jwt.sign({ id: '00000000-0000-0000-0000-000000000000', role: 'admin' }, 'tomua_jwt_secret_key_2024_min_32_chars', { expiresIn: '1h' });

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
