const express = require('express');
const router = express.Router();
const SettingsController = require('../controllers/settings.controller');
const { authenticateToken } = require('../middleware/auth');
const { requireAdmin } = require('../middleware/role');

// Public route to get all settings (e.g. for frontend config)
router.get('/', SettingsController.getAll);

// Protected route to update setting
router.put('/:key', authenticateToken, requireAdmin, SettingsController.update);

module.exports = router;
