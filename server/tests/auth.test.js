const request = require('supertest');
const app = require('../src/app');

describe('Auth API', () => {
  test('POST /api/auth/login - success', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ username: 'admin', password: 'admin123456' });
    
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.username).toBe('admin');
    expect(res.body.data.accessToken).toBeDefined();
  });

  test('POST /api/auth/login - invalid credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ username: 'admin', password: 'wrong' });
    
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });
});
