const express = require('express');
const router = express.Router();
const I18nController = require('../controllers/i18n.controller');
const { authenticateToken } = require('../middleware/auth');
const { requireAdmin } = require('../middleware/role');

// Get supported languages (must be before /:page routes)
router.get('/languages', (req, res) => {
  const config = require('../config/i18n');
  res.json({
    success: true,
    data: {
      supportedLanguages: config.supportedLanguages,
      defaultLanguage: config.defaultLanguage,
      languageNames: config.languageNames
    }
  });
});

// Public routes
router.get('/export/all', authenticateToken, requireAdmin, I18nController.exportAll);
router.get('/export/:lang', authenticateToken, requireAdmin, I18nController.exportLang);
router.get('/:page', I18nController.getPage);
router.get('/:page/:lang', I18nController.getPageLang);

// Protected routes (admin only)
router.put('/:page/:key', authenticateToken, requireAdmin, I18nController.updateKey);
router.post('/bulk', authenticateToken, requireAdmin, I18nController.bulkUpdate);

module.exports = router;