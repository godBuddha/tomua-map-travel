const Settings = require('../models/settings.model');
const { success, badRequest } = require('../utils/response');

const SettingsController = {
  async getAll(req, res, next) {
    try {
      const settings = await Settings.getAll();
      return success(res, settings);
    } catch (error) {
      next(error);
    }
  },

  async update(req, res, next) {
    try {
      const { key } = req.params;
      const { value, description } = req.body;

      if (value === undefined) {
        return badRequest(res, 'Value is required');
      }

      const updated = await Settings.update(key, value, description, req.user.id);
      return success(res, updated);
    } catch (error) {
      next(error);
    }
  }
};

module.exports = SettingsController;
