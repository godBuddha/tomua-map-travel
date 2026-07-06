const express = require('express');
const router = express.Router();
const MFAController = require('../controllers/mfa.controller');
const { authenticateToken } = require('../middleware/auth');

// Verify MFA token during login (NO auth required - called before login completes)
router.post('/verify', MFAController.verify);

// All other MFA routes require authentication
router.use(authenticateToken);

// Setup MFA - generate secret and QR code
router.post('/setup', MFAController.setup);

// Enable MFA - verify token and enable
router.post('/enable', MFAController.enable);

// Disable MFA
router.post('/disable', MFAController.disable);

// Get MFA status
router.get('/status', MFAController.status);

// Regenerate backup codes
router.post('/regenerate-backup-codes', MFAController.regenerateBackupCodes);

module.exports = router;
