const axios = require('axios');
const logger = require('../utils/logger');

const LIBRETRANSLATE_URL = process.env.LIBRETRANSLATE_URL || 'http://libretranslate:5000';
const TARGET_LANGS = ['en', 'ko', 'ru', 'th', 'zh-Hans', 'id', 'ms', 'es', 'fr', 'de'];
const TRANSLATE_TIMEOUT = 30000;

async function translateText(text, sourceLang = 'vi', targetLang = 'en') {
  try {
    const response = await axios.post(`${LIBRETRANSLATE_URL}/translate`, {
      q: text,
      source: sourceLang,
      target: targetLang,
      format: 'text'
    }, { timeout: TRANSLATE_TIMEOUT });
    return response.data.translatedText;
  } catch (error) {
    logger.error(`Translation failed: ${sourceLang}→${targetLang}: ${error.message}`);
    return null;
  }
}

async function translateField(value, sourceLang = 'vi') {
  if (!value || typeof value !== 'string' || value.trim().length === 0) {
    return {};
  }

  const results = await Promise.allSettled(
    TARGET_LANGS.map(async (lang) => {
      const translated = await translateText(value, sourceLang, lang);
      return { lang, translated };
    })
  );

  const translated = { [sourceLang]: value };
  for (const result of results) {
    if (result.status === 'fulfilled' && result.value.translated) {
      translated[result.value.lang] = result.value.translated;
    }
  }
  return translated;
}

async function translateMultilingualFields(fields, sourceLang = 'vi') {
  const fieldNames = Object.keys(fields);
  const translated = {};

  await Promise.allSettled(
    fieldNames.map(async (fieldName) => {
      const value = fields[fieldName];
      if (typeof value === 'string') {
        translated[fieldName] = await translateField(value, sourceLang);
      } else if (value && typeof value === 'object' && value[sourceLang]) {
        translated[fieldName] = await translateField(value[sourceLang], sourceLang);
      }
    })
  );

  return translated;
}

module.exports = { translateText, translateField, translateMultilingualFields, TARGET_LANGS };
