const express = require('express');
const router = express.Router();
const CommentsController = require('../controllers/comments.controller');
const { authenticateToken } = require('../middleware/auth');
const { requireAdminOrCollaborator } = require('../middleware/role');

// All routes require authentication
router.use(authenticateToken);

router.get('/:entityType/:entityId', CommentsController.index);
router.post('/', requireAdminOrCollaborator, CommentsController.store);

module.exports = router;
