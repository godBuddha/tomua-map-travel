const jwt = require('jsonwebtoken');
const authConfig = require('./src/config/auth');

const adminToken = jwt.sign({ id: '00000000-0000-0000-0000-000000000000', role: 'admin' }, authConfig.jwtSecret, { expiresIn: '1h' });
const collabToken = jwt.sign({ id: '00000000-0000-0000-0000-000000000000', role: 'collaborator' }, authConfig.jwtSecret, { expiresIn: '1h' });

(async () => {
  try {
    const res = await fetch('http://localhost:3000/api/destinations?limit=50', {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const data = await res.json();
    console.log('ADMIN DATA STATUSES:', data.data.items.map(i => i.status));
    
    const res2 = await fetch('http://localhost:3000/api/destinations?limit=50', {
      headers: { 'Authorization': `Bearer ${collabToken}` }
    });
    const data2 = await res2.json();
    console.log('COLLAB DATA STATUSES:', data2.data.items.map(i => i.status));
  } catch(e) {
    console.error(e);
  }
})();
