const db = require('../config/database');

const TABLE = 'i18n_content';

const I18n = {
  async findByPage(page, lang = null) {
    const query = db(TABLE).where('page', page);
    if (lang) {
      query.where('lang', lang);
    }
    return query.orderBy('key');
  },

  async findByPageAndLang(page, lang) {
    const rows = await this.findByPage(page, lang);
    const translations = {};
    rows.forEach(row => {
      translations[row.key] = row.value;
    });
    return translations;
  },

  async findByKey(page, key, lang) {
    return db(TABLE)
      .where({ page, key, lang })
      .first();
  },

  async upsert(page, key, lang, value, userId = null) {
    const existing = await this.findByKey(page, key, lang);

    if (existing) {
      const [updated] = await db(TABLE)
        .where({ page, key, lang })
        .update({ value, updated_by: userId })
        .returning('*');
      return updated;
    } else {
      const [created] = await db(TABLE)
        .insert({ page, key, lang, value, updated_by: userId })
        .returning('*');
      return created;
    }
  },

  async bulkUpsert(page, lang, translations, userId = null) {
    const results = [];
    for (const [key, value] of Object.entries(translations)) {
      const result = await this.upsert(page, key, lang, value, userId);
      results.push(result);
    }
    return results;
  },

  async exportAll() {
    const rows = await db(TABLE).orderBy(['page', 'key', 'lang']);
    const result = {};

    rows.forEach(row => {
      if (!result[row.page]) {
        result[row.page] = {};
      }
      if (!result[row.page][row.key]) {
        result[row.page][row.key] = {};
      }
      result[row.page][row.key][row.lang] = row.value;
    });

    return result;
  },

  async exportLang(lang) {
    const rows = await db(TABLE).where('lang', lang).orderBy(['page', 'key']);
    const result = {};

    rows.forEach(row => {
      if (!result[row.page]) {
        result[row.page] = {};
      }
      result[row.page][row.key] = row.value;
    });

    return result;
  },

  async delete(page, key, lang) {
    return db(TABLE).where({ page, key, lang }).del();
  },

  async count() {
    const result = await db(TABLE).count('id as count').first();
    return parseInt(result.count);
  }
};

module.exports = I18n;
