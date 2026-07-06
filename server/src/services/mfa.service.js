const otplib = require('otplib');
const crypto = require('crypto');
const db = require('../config/database');

const MFAService = {
  // Generate MFA secret for user
  async generateSecret(userId, email) {
    const secret = otplib.generateSecret();
    const otpauthUrl = otplib.generateURI({
      strategy: 'totp',
      issuer: 'TomuaMapTravel',
      label: email || 'user',
      secret: secret
    });
    
    // Generate backup codes
    const backupCodes = Array.from({ length: 8 }, () => 
      crypto.randomBytes(4).toString('hex').toUpperCase()
    );
    
    // Store in database (not enabled yet)
    await db('users')
      .where('id', userId)
      .update({
        mfa_secret: secret,
        mfa_backup_codes: JSON.stringify(backupCodes.map(code => ({
          code: code,
          used: false
        })))
      });
    
    return { secret, otpauthUrl, backupCodes };
  },

  // Verify TOTP token (synchronous)
  verifyToken(secret, token) {
    try {
      const result = otplib.verifySync({ token, secret });
      return result && result.valid === true;
    } catch (error) {
      return false;
    }
  },

  // Enable MFA for user
  async enable(userId, token) {
    const user = await db('users').where('id', userId).first();
    if (!user || !user.mfa_secret) {
      throw new Error('MFA not set up');
    }

    if (!this.verifyToken(user.mfa_secret, token)) {
      throw new Error('Invalid MFA token');
    }

    await db('users')
      .where('id', userId)
      .update({ mfa_enabled: true });

    return { success: true };
  },

  // Disable MFA for user
  async disable(userId, token) {
    const user = await db('users').where('id', userId).first();
    if (!user || !user.mfa_enabled) {
      throw new Error('MFA not enabled');
    }

    if (!this.verifyToken(user.mfa_secret, token)) {
      throw new Error('Invalid MFA token');
    }

    await db('users')
      .where('id', userId)
      .update({
        mfa_enabled: false,
        mfa_secret: null,
        mfa_backup_codes: null
      });

    return { success: true };
  },

  // Verify backup code
  async verifyBackupCode(userId, code) {
    const user = await db('users').where('id', userId).first();
    if (!user || !user.mfa_backup_codes) {
      return false;
    }

    // Handle both JSONB (object) and TEXT (string) storage
    const backupCodes = typeof user.mfa_backup_codes === 'string' 
      ? JSON.parse(user.mfa_backup_codes) 
      : user.mfa_backup_codes;
    
    const codeEntry = backupCodes.find(bc => bc.code === code.toUpperCase() && !bc.used);

    if (!codeEntry) {
      return false;
    }

    // Mark code as used
    codeEntry.used = true;
    await db('users')
      .where('id', userId)
      .update({ mfa_backup_codes: JSON.stringify(backupCodes) });

    return true;
  },

  // Generate new backup codes
  async regenerateBackupCodes(userId, token) {
    const user = await db('users').where('id', userId).first();
    if (!user || !user.mfa_enabled) {
      throw new Error('MFA not enabled');
    }

    if (!this.verifyToken(user.mfa_secret, token)) {
      throw new Error('Invalid MFA token');
    }

    const backupCodes = Array.from({ length: 8 }, () => 
      crypto.randomBytes(4).toString('hex').toUpperCase()
    );

    await db('users')
      .where('id', userId)
      .update({
        mfa_backup_codes: JSON.stringify(backupCodes.map(code => ({
          code: code,
          used: false
        })))
      });

    return backupCodes;
  }
};

module.exports = MFAService;
