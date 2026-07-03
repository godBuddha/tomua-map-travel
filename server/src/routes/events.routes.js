const express = require('express');
const router = express.Router();
const EventController = require('../controllers/events.controller');
const { authenticateToken, optionalAuth } = require('../middleware/auth');
const { requireAdmin, requireAdminOrCollaborator } = require('../middleware/role');
const { validate } = require('../middleware/validate');
const { body } = require('express-validator');

const storeValidation = [
  body('name').isObject().withMessage('Name must be an object with language keys'),
  body('name.vi').optional().notEmpty().withMessage('Vietnamese name is required'),
  body('type').isIn(['festival', 'season', 'experience', 'cultural', 'sport', 'food', 'other']).withMessage('Invalid event type'),
  body('start_date').isDate().withMessage('Valid start date is required'),
  body('end_date').isDate().withMessage('Valid end date is required')
];

// Public routes
router.get('/', optionalAuth, EventController.index);
router.get('/upcoming', EventController.upcoming);
router.get('/:idOrSlug', optionalAuth, EventController.show);

// Protected routes
router.post('/', authenticateToken, requireAdminOrCollaborator, validate(storeValidation), EventController.store);
router.put('/:id', authenticateToken, requireAdminOrCollaborator, EventController.update);
router.delete('/:id', authenticateToken, requireAdmin, EventController.destroy);

// Approval workflow
router.post('/:id/submit-review', authenticateToken, requireAdminOrCollaborator, EventController.submitForReview);
router.post('/:id/approve', authenticateToken, requireAdmin, EventController.approve);
router.post('/:id/reject', authenticateToken, requireAdmin, EventController.reject);

// Comments
router.get('/:id/comments', authenticateToken, EventController.getComments);
router.post('/:id/comments', authenticateToken, requireAdminOrCollaborator, EventController.addComment);

module.exports = router;
