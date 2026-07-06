const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { translateField } = require('../services/translate.service');

router.post('/', authenticateToken, async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name && !description) {
      return res.status(400).json({ success: false, message: 'Name or description is required' });
    }

    const result = {};

    if (name) {
      result.name = await translateField(name, 'vi');
    }

    if (description) {
      result.description = await translateField(description, 'vi');
    }

    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
