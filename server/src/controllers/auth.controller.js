const AuthService = require('../services/auth.service');
const { success, created, badRequest, unauthorized } = require('../utils/response');

const AuthController = {
  async login(req, res, next) {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return badRequest(res, 'Username and password are required');
      }

      const result = await AuthService.login(username, password);
      
      // If MFA is required, return special response
      if (result.mfa_required) {
        return success(res, result);
      }
      
      return success(res, result);
    } catch (error) {
      if (error.message === 'Invalid credentials' || error.message === 'Account is inactive') {
        return unauthorized(res, error.message);
      }
      if (error.message.includes('Account is locked')) {
        return unauthorized(res, error.message);
      }
      next(error);
    }
  },

  async register(req, res, next) {
    try {
      const { name, email, username, password, phone } = req.body;

      if (!name || !email || !username || !password) {
        return badRequest(res, 'Name, email, username, and password are required');
      }

      const result = await AuthService.register({ name, email, username, password, phone });
      return created(res, result);
    } catch (error) {
      if (error.message.includes('already exists')) {
        return badRequest(res, error.message);
      }
      next(error);
    }
  },

  async refreshToken(req, res, next) {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return badRequest(res, 'Refresh token is required');
      }

      const tokens = await AuthService.refreshAccessToken(refreshToken);
      return success(res, tokens);
    } catch (error) {
      return unauthorized(res, 'Invalid refresh token');
    }
  },

  async getMe(req, res, next) {
    try {
      const user = req.user;
      return success(res, {
        id: user.id,
        role: user.role,
        username: user.username
      });
    } catch (error) {
      next(error);
    }
  },

  async logout(req, res, next) {
    try {
      await AuthService.logout(req.user.id);
      return success(res, { message: 'Logged out successfully' });
    } catch (error) {
      next(error);
    }
  },

  async changePassword(req, res, next) {
    try {
      const { currentPassword, newPassword } = req.body;

      if (!currentPassword || !newPassword) {
        return badRequest(res, 'Current password and new password are required');
      }

      if (newPassword.length < 6) {
        return badRequest(res, 'New password must be at least 6 characters');
      }

      await AuthService.changePassword(req.user.id, currentPassword, newPassword);
      return success(res, { message: 'Password changed successfully' });
    } catch (error) {
      if (error.message === 'Current password is incorrect') {
        return badRequest(res, error.message);
      }
      next(error);
    }
  }
};

module.exports = AuthController;
