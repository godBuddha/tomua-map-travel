const express = require('express');
const router = express.Router();
const MFAController = require('../controllers/mfa.controller');
const { authenticateToken } = require('../middleware/auth');

// All MFA routes require authentication
router.use(authenticateToken);

// Setup MFA - generate secret and QR code
router.post('/setup', MFAController.setup);

// Enable MFA - verify token and enable
router.post('/enable', MFAController.enable);

// Disable MFA
router.post('/disable', MFAController.disable);

// Verify MFA token during login (used by frontend)
router.post('/verify', MFAController.verify);

// Get MFA status
router.get('/status', MFAController.status);

// Regenerate backup codes
router.post('/regenerate-backup-codes', MFAController.regenerateBackupCodes);

module.exports = router;
