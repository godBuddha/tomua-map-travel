const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const authConfig = require('../config/auth');
const User = require('../models/user.model');
const db = require('../config/database');

const AuthService = {
  async login(username, password) {
    const user = await User.findByUsername(username);
    if (!user) {
      throw new Error('Invalid credentials');
    }

    if (user.status === 'inactive') {
      throw new Error('Account is inactive');
    }

    // Check if account is locked
    if (user.locked_until && new Date(user.locked_until) > new Date()) {
      const lockMinutes = Math.ceil((new Date(user.locked_until) - new Date()) / 60000);
      throw new Error(`Account is locked. Try again in ${lockMinutes} minutes.`);
    }

    const isValidPassword = await User.comparePassword(password, user.password_hash);
    if (!isValidPassword) {
      // Increment failed login attempts
      await this.handleFailedLogin(user.id);
      throw new Error('Invalid credentials');
    }

    // Reset failed login attempts on successful password verification
    await db('users').where('id', user.id).update({
      failed_login_attempts: 0,
      locked_until: null
    });

    // Check if MFA is enabled
    if (user.mfa_enabled) {
      return {
        mfa_required: true,
        user_id: user.id,
        message: 'MFA verification required'
      };
    }

    const tokens = this.generateTokens(user);
    await this.storeRefreshToken(user.id, tokens.refreshToken);
    await User.updateLastLogin(user.id);
    
    // Set user as online
    await User.setOnline(user.id, true);

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        username: user.username,
        role: user.role,
        avatar_url: user.avatar_url
      },
      ...tokens
    };
  },

  // Handle failed login attempts
  async handleFailedLogin(userId) {
    const user = await User.findById(userId);
    const attempts = (user.failed_login_attempts || 0) + 1;
    
    const updateData = { failed_login_attempts: attempts };
    
    // Lock account after 5 failed attempts for 15 minutes
    if (attempts >= 5) {
      updateData.locked_until = new Date(Date.now() + 15 * 60 * 1000);
    }
    
    await db('users').where('id', userId).update(updateData);
  },

  async register(userData) {
    const existingEmail = await User.findByEmail(userData.email);
    if (existingEmail) {
      throw new Error('Email already exists');
    }

    const existingUsername = await User.findByUsername(userData.username);
    if (existingUsername) {
      throw new Error('Username already exists');
    }

    const user = await User.create(userData);
    const tokens = this.generateTokens(user);
    await this.storeRefreshToken(user.id, tokens.refreshToken);

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        username: user.username,
        role: user.role
      },
      ...tokens
    };
  },

  generateTokens(user) {
    const accessToken = jwt.sign(
      { id: user.id, role: user.role, username: user.username },
      authConfig.jwtSecret,
      { expiresIn: authConfig.jwtExpiresIn }
    );

    const refreshToken = jwt.sign(
      { id: user.id },
      authConfig.jwtRefreshSecret,
      { expiresIn: authConfig.jwtRefreshExpiresIn }
    );

    return { accessToken, refreshToken };
  },

  async storeRefreshToken(userId, refreshToken) {
    const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    await db('refresh_tokens').insert({
      user_id: userId,
      token_hash: tokenHash,
      expires_at: expiresAt
    });
  },

  async refreshAccessToken(refreshToken) {
    // BUG-03 FIX: Distinguish token errors from system errors instead of swallowing all
    let decoded;
    try {
      decoded = jwt.verify(refreshToken, authConfig.jwtRefreshSecret);
    } catch (jwtError) {
      // JWT-specific errors are expected (expired, malformed) — throw auth error
      throw new Error('Invalid refresh token');
    }

    const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');

    const storedToken = await db('refresh_tokens')
      .where('token_hash', tokenHash)
      .where('expires_at', '>', new Date())
      .first();

    if (!storedToken) {
      throw new Error('Invalid refresh token');
    }

    const user = await User.findById(decoded.id);
    if (!user || user.status === 'inactive') {
      throw new Error('User not found or inactive');
    }

    // Remove old refresh token
    await db('refresh_tokens').where('token_hash', tokenHash).del();

    // Generate new tokens
    const tokens = this.generateTokens(user);
    await this.storeRefreshToken(user.id, tokens.refreshToken);

    return tokens;
  },

  async logout(userId) {
    await db('refresh_tokens').where('user_id', userId).del();
    // Set user as offline
    await User.setOnline(userId, false);
  },

  async changePassword(userId, currentPassword, newPassword) {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const isValid = await User.comparePassword(currentPassword, user.password_hash);
    if (!isValid) {
      throw new Error('Current password is incorrect');
    }

    await User.update(userId, { password: newPassword });
  }
};

module.exports = AuthService;
