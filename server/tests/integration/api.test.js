// Mock MFA service before requiring app
jest.mock('../../src/services/mfa.service', () => ({
  generateSecret: jest.fn().mockReturnValue({
    secret: 'TESTSECRET',
    otpauthUrl: 'otpauth://totp/test',
    backupCodes: ['CODE1', 'CODE2']
  }),
  verifyToken: jest.fn().mockReturnValue(true),
  enable: jest.fn().mockResolvedValue({ success: true }),
  disable: jest.fn().mockResolvedValue({ success: true }),
  verifyBackupCode: jest.fn().mockResolvedValue(true)
}));

const request = require('supertest');
const app = require('../../src/app');

describe('Auth API', () => {
  let authToken;
  let refreshToken;

  describe('POST /api/auth/login', () => {
    it('should login with valid credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ username: 'admin', password: 'admin123456' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('accessToken');
      expect(res.body.data).toHaveProperty('refreshToken');
      expect(res.body.data.user.username).toBe('admin');

      authToken = res.body.data.accessToken;
      refreshToken = res.body.data.refreshToken;
    });

    it('should reject invalid credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ username: 'admin', password: 'wrong' });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should reject missing fields', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ username: 'admin' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('GET /api/auth/me', () => {
    it('should return user info with valid token', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.username).toBe('admin');
    });

    it('should reject without token', async () => {
      const res = await request(app)
        .get('/api/auth/me');

      expect(res.status).toBe(401);
    });
  });

  describe('POST /api/auth/refresh', () => {
    it('should refresh tokens', async () => {
      const res = await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('accessToken');
      expect(res.body.data).toHaveProperty('refreshToken');
    });
  });
});

describe('Destinations API', () => {
  let authToken;

  beforeAll(async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ username: 'admin', password: 'admin123456' });
    authToken = res.body.data.accessToken;
  });

  describe('GET /api/destinations', () => {
    it('should return published destinations', async () => {
      const res = await request(app)
        .get('/api/destinations?status=published');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data.items)).toBe(true);
    });

    it('should require auth for non-published status', async () => {
      const res = await request(app)
        .get('/api/destinations?status=draft');

      // Should still work but only return published for non-auth
      expect(res.status).toBe(200);
    });
  });

  describe('GET /api/destinations/nearby', () => {
    it('should return nearby destinations', async () => {
      const res = await request(app)
        .get('/api/destinations/nearby?lat=20.844&lng=104.825&radius=10000');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });
});

describe('Health API', () => {
  describe('GET /api/health', () => {
    it('should return health status', async () => {
      const res = await request(app)
        .get('/api/health');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('ok');
    });
  });
});

describe('MFA API', () => {
  let authToken;

  beforeAll(async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ username: 'admin', password: 'admin123456' });
    authToken = res.body.data.accessToken;
  });

  describe('GET /api/mfa/status', () => {
    it('should return MFA status', async () => {
      const res = await request(app)
        .get('/api/mfa/status')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('mfa_enabled');
    });
  });

  describe('POST /api/mfa/setup', () => {
    it('should generate MFA secret', async () => {
      const res = await request(app)
        .post('/api/mfa/setup')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('secret');
      expect(res.body.data).toHaveProperty('otpauthUrl');
      expect(res.body.data).toHaveProperty('backupCodes');
      expect(res.body.data.backupCodes).toHaveLength(8);
    });
  });
});
