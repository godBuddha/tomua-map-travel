const db = require('../config/database');

class Settings {
  static async get(key) {
    const row = await db('system_settings').where({ key }).first();
    return row ? row.value : null;
  }

  static async getAll() {
    const rows = await db('system_settings').select('*');
    const settings = {};
    rows.forEach(r => settings[r.key] = r.value);
    return settings;
  }

  static async update(key, value, description, userId) {
    const exists = await db('system_settings').where({ key }).first();
    if (exists) {
      const updateData = {
        value: JSON.stringify(value),
        updated_by: userId
      };
      if (description !== undefined) updateData.description = description;
      
      const [updated] = await db('system_settings')
        .where({ key })
        .update(updateData)
        .returning('*');
      return updated;
    } else {
      const [inserted] = await db('system_settings')
        .insert({
          key,
          value: JSON.stringify(value),
          description,
          updated_by: userId
        })
        .returning('*');
      return inserted;
    }
  }
}

module.exports = Settings;
