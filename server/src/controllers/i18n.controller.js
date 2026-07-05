const I18n = require('../models/i18n.model');
const CacheService = require('../services/cache.service');
const { success, created, badRequest, notFound } = require('../utils/response');
const { supportedLanguages } = require('../config/i18n');

const I18N_CACHE_TTL = 86400; // 24 hours

const I18nController = {
  async getPage(req, res, next) {
    try {
      const { page } = req.params;
      const { lang } = req.query;

      if (lang) {
        const cacheKey = `i18n:${page}:${lang}`;
        const cached = await CacheService.get(cacheKey);
        if (cached) return success(res, cached);

        const translations = await I18n.findByPageAndLang(page, lang);
        const result = { page, lang, translations };
        await CacheService.set(cacheKey, result, I18N_CACHE_TTL);
        return success(res, result);
      }

      const cacheKey = `i18n:${page}`;
      const cached = await CacheService.get(cacheKey);
      if (cached) return success(res, cached);

      const rows = await I18n.findByPage(page);
      const translations = {};
      rows.forEach(row => {
        if (!translations[row.key]) {
          translations[row.key] = {};
        }
        translations[row.key][row.lang] = row.value;
      });

      const result = { page, translations };
      await CacheService.set(cacheKey, result, I18N_CACHE_TTL);
      return success(res, result);
    } catch (error) {
      next(error);
    }
  },

  async getPageLang(req, res, next) {
    try {
      const { page, lang } = req.params;

      if (!supportedLanguages.includes(lang)) {
        return badRequest(res, 'Unsupported language');
      }

      const cacheKey = `i18n:${page}:${lang}`;
      const cached = await CacheService.get(cacheKey);
      if (cached) return success(res, cached);

      const translations = await I18n.findByPageAndLang(page, lang);
      const result = { page, lang, translations };
      await CacheService.set(cacheKey, result, I18N_CACHE_TTL);
      return success(res, result);
    } catch (error) {
      next(error);
    }
  },

  async updateKey(req, res, next) {
    try {
      const { page, key } = req.params;
      const { lang, value } = req.body;

      if (!lang || !value) {
        return badRequest(res, 'Language and value are required');
      }

      if (!supportedLanguages.includes(lang)) {
        return badRequest(res, 'Unsupported language');
      }

      const result = await I18n.upsert(page, key, lang, value, req.user.id);
      await CacheService.delPattern('i18n:*');
      return success(res, result);
    } catch (error) {
      next(error);
    }
  },

  async bulkUpdate(req, res, next) {
    try {
      const { page, lang, translations } = req.body;

      if (!page || !lang || !translations) {
        return badRequest(res, 'Page, language, and translations are required');
      }

      if (!supportedLanguages.includes(lang)) {
        return badRequest(res, 'Unsupported language');
      }

      if (typeof translations !== 'object') {
        return badRequest(res, 'Translations must be an object');
      }

      const results = await I18n.bulkUpsert(page, lang, translations, req.user.id);
      await CacheService.delPattern('i18n:*');
      return success(res, { page, lang, count: results.length });
    } catch (error) {
      next(error);
    }
  },

  async exportLang(req, res, next) {
    try {
      const { lang } = req.params;

      if (!supportedLanguages.includes(lang)) {
        return badRequest(res, 'Unsupported language');
      }

      const translations = await I18n.exportLang(lang);
      return success(res, translations);
    } catch (error) {
      next(error);
    }
  },

  async exportAll(req, res, next) {
    try {
      const translations = await I18n.exportAll();
      return success(res, translations);
    } catch (error) {
      next(error);
    }
  }
};

module.exports = I18nController;
