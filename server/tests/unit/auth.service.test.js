const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const authConfig = require('../../src/config/auth');

// Mock dependencies
jest.mock('../../src/models/user.model');
jest.mock('../../src/config/database');
jest.mock('../../src/services/mfa.service', () => ({
  generateSecret: jest.fn(),
  verifyToken: jest.fn(),
  enable: jest.fn(),
  disable: jest.fn(),
  verifyBackupCode: jest.fn()
}));

const AuthService = require('../../src/services/auth.service');
const User = require('../../src/models/user.model');
const db = require('../../src/config/database');

describe('AuthService', () => {
  let mockDbChain;

  beforeEach(() => {
    jest.clearAllMocks();
    mockDbChain = {
      where: jest.fn().mockReturnThis(),
      update: jest.fn().mockResolvedValue(1),
      insert: jest.fn().mockReturnThis(),
      returning: jest.fn().mockResolvedValue([{}]),
      del: jest.fn().mockResolvedValue(1),
      first: jest.fn().mockResolvedValue(null)
    };
    db.mockImplementation(() => mockDbChain);
  });

  describe('generateTokens', () => {
    it('should generate access and refresh tokens', () => {
      const user = {
        id: 'test-user-id',
        role: 'admin',
        username: 'testuser'
      };

      const tokens = AuthService.generateTokens(user);

      expect(tokens).toHaveProperty('accessToken');
      expect(tokens).toHaveProperty('refreshToken');
      expect(typeof tokens.accessToken).toBe('string');
      expect(typeof tokens.refreshToken).toBe('string');
    });

    it('should include user info in access token', () => {
      const user = {
        id: 'test-user-id',
        role: 'admin',
        username: 'testuser'
      };

      const tokens = AuthService.generateTokens(user);
      const decoded = jwt.verify(tokens.accessToken, authConfig.jwtSecret);

      expect(decoded.id).toBe(user.id);
      expect(decoded.role).toBe(user.role);
      expect(decoded.username).toBe(user.username);
    });
  });

  describe('login', () => {
    it('should login successfully with valid credentials', async () => {
      const mockUser = {
        id: 'test-user-id',
        username: 'admin',
        password_hash: await bcrypt.hash('password123', 10),
        status: 'active',
        mfa_enabled: false,
        failed_login_attempts: 0,
        locked_until: null
      };

      User.findByUsername.mockResolvedValue(mockUser);
      User.comparePassword.mockResolvedValue(true);
      User.updateLastLogin.mockResolvedValue(true);
      User.setOnline.mockResolvedValue(true);

      const result = await AuthService.login('admin', 'password123');

      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(result.user.username).toBe('admin');
    });

    it('should throw error for invalid credentials', async () => {
      User.findByUsername.mockResolvedValue(null);

      await expect(AuthService.login('invalid', 'password'))
        .rejects.toThrow('Invalid credentials');
    });

    it('should throw error for inactive account', async () => {
      const mockUser = {
        id: 'test-user-id',
        username: 'admin',
        status: 'inactive'
      };

      User.findByUsername.mockResolvedValue(mockUser);

      await expect(AuthService.login('admin', 'password'))
        .rejects.toThrow('Account is inactive');
    });

    it('should throw error for wrong password', async () => {
      const mockUser = {
        id: 'test-user-id',
        username: 'admin',
        password_hash: await bcrypt.hash('correct', 10),
        status: 'active',
        failed_login_attempts: 0
      };

      User.findByUsername.mockResolvedValue(mockUser);
      User.findById.mockResolvedValue(mockUser);
      User.comparePassword.mockResolvedValue(false);

      await expect(AuthService.login('admin', 'wrong'))
        .rejects.toThrow('Invalid credentials');
    });

    it('should return MFA required when MFA is enabled', async () => {
      const mockUser = {
        id: 'test-user-id',
        username: 'admin',
        password_hash: await bcrypt.hash('password123', 10),
        status: 'active',
        mfa_enabled: true,
        failed_login_attempts: 0
      };

      User.findByUsername.mockResolvedValue(mockUser);
      User.comparePassword.mockResolvedValue(true);

      const result = await AuthService.login('admin', 'password123');

      expect(result.mfa_required).toBe(true);
      expect(result.user_id).toBe('test-user-id');
    });

    it('should lock account after 5 failed attempts', async () => {
      const mockUser = {
        id: 'test-user-id',
        username: 'admin',
        password_hash: await bcrypt.hash('correct', 10),
        status: 'active',
        failed_login_attempts: 4
      };

      User.findByUsername.mockResolvedValue(mockUser);
      User.findById.mockResolvedValue(mockUser);
      User.comparePassword.mockResolvedValue(false);

      await expect(AuthService.login('admin', 'wrong'))
        .rejects.toThrow('Invalid credentials');

      // Verify update was called with locked_until
      expect(db().where().update).toHaveBeenCalledWith(
        expect.objectContaining({
          failed_login_attempts: 5,
          locked_until: expect.any(Date)
        })
      );
    });
  });

  describe('storeRefreshToken', () => {
    it('should store hashed refresh token', async () => {
      const mockInsert = jest.fn().mockResolvedValue([{}]);
      db.mockReturnValue({
        insert: mockInsert
      });

      await AuthService.storeRefreshToken('user-id', 'refresh-token');

      expect(mockInsert).toHaveBeenCalledWith(
        expect.objectContaining({
          user_id: 'user-id',
          token_hash: expect.any(String),
          expires_at: expect.any(Date)
        })
      );
    });
  });
});
