const MFAService = require('../services/mfa.service');
const { success, badRequest, unauthorized } = require('../utils/response');

const MFAController = {
  // Setup MFA - generate secret and QR code
  async setup(req, res, next) {
    try {
      const userId = req.user.id;
      const user = req.user;
      
      const { secret, otpauthUrl, backupCodes } = await MFAService.generateSecret(userId, user.email || user.username);
      
      return success(res, {
        secret,
        otpauthUrl,
        backupCodes
      });
    } catch (error) {
      next(error);
    }
  },

  // Enable MFA - verify token and enable
  async enable(req, res, next) {
    try {
      const { token } = req.body;
      
      if (!token) {
        return badRequest(res, 'MFA token is required');
      }

      const result = await MFAService.enable(req.user.id, token);
      return success(res, result);
    } catch (error) {
      if (error.message === 'Invalid MFA token') {
        return badRequest(res, error.message);
      }
      next(error);
    }
  },

  // Disable MFA
  async disable(req, res, next) {
    try {
      const { token } = req.body;
      
      if (!token) {
        return badRequest(res, 'MFA token is required');
      }

      const result = await MFAService.disable(req.user.id, token);
      return success(res, result);
    } catch (error) {
      if (error.message === 'Invalid MFA token') {
        return badRequest(res, error.message);
      }
      next(error);
    }
  },

  // Verify MFA token during login
  async verify(req, res, next) {
    try {
      const { userId, token, backupCode } = req.body;
      
      if (!userId) {
        return badRequest(res, 'User ID is required');
      }

      const user = await require('../models/user.model').findById(userId);
      if (!user || !user.mfa_enabled) {
        return badRequest(res, 'MFA not enabled for this user');
      }

      let verified = false;

      if (backupCode) {
        verified = await MFAService.verifyBackupCode(userId, backupCode);
      } else if (token) {
        verified = MFAService.verifyToken(user.mfa_secret, token);
      } else {
        return badRequest(res, 'MFA token or backup code is required');
      }

      if (!verified) {
        return unauthorized(res, 'Invalid MFA token or backup code');
      }

      // Generate tokens after successful MFA verification
      const AuthService = require('../services/auth.service');
      const tokens = AuthService.generateTokens(user);
      await AuthService.storeRefreshToken(user.id, tokens.refreshToken);
      await require('../models/user.model').updateLastLogin(user.id);
      await require('../models/user.model').setOnline(user.id, true);

      return success(res, {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          username: user.username,
          role: user.role,
          avatar_url: user.avatar_url
        },
        ...tokens
      });
    } catch (error) {
      next(error);
    }
  },

  // Get MFA status
  async status(req, res, next) {
    try {
      const user = await require('../models/user.model').findById(req.user.id);
      if (!user) {
        return success(res, { mfa_enabled: false, has_backup_codes: false });
      }
      return success(res, {
        mfa_enabled: user.mfa_enabled || false,
        has_backup_codes: !!user.mfa_backup_codes
      });
    } catch (error) {
      next(error);
    }
  },

  // Regenerate backup codes
  async regenerateBackupCodes(req, res, next) {
    try {
      const { token } = req.body;
      
      if (!token) {
        return badRequest(res, 'MFA token is required');
      }

      const backupCodes = await MFAService.regenerateBackupCodes(req.user.id, token);
      return success(res, { backupCodes });
    } catch (error) {
      if (error.message === 'Invalid MFA token') {
        return badRequest(res, error.message);
      }
      next(error);
    }
  }
};

module.exports = MFAController;
