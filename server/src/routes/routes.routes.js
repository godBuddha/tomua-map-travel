const express = require('express');
const router = express.Router();
const RouteController = require('../controllers/routes.controller');
const { authenticateToken, optionalAuth } = require('../middleware/auth');
const { requireAdmin, requireAdminOrCollaborator } = require('../middleware/role');
const { validate } = require('../middleware/validate');
const { body } = require('express-validator');

const storeValidation = [
  body('name').isObject().withMessage('Name must be an object with language keys'),
  body('name.vi').optional().notEmpty().withMessage('Vietnamese name is required'),
  body('transport').isIn(['walk', 'bike', 'car', 'bus']).withMessage('Invalid transport mode'),
  body('duration').isIn(['half_day', 'full_day', 'two_day', 'custom']).withMessage('Invalid duration'),
  body('difficulty').isIn(['easy', 'medium', 'hard']).withMessage('Invalid difficulty level')
];

const stopValidation = [
  body('destination_id').isUUID().withMessage('Valid destination ID is required'),
  body('stop_order').optional().isInt({ min: 1 }).withMessage('Stop order must be a positive integer')
];

// Public routes
router.get('/', optionalAuth, RouteController.index);
router.get('/:idOrSlug', optionalAuth, RouteController.show);

// Protected routes
router.post('/', authenticateToken, requireAdminOrCollaborator, validate(storeValidation), RouteController.store);
router.put('/:id', authenticateToken, requireAdminOrCollaborator, RouteController.update);
router.delete('/:id', authenticateToken, requireAdmin, RouteController.destroy);

// Stop management
router.post('/:id/stops', authenticateToken, requireAdminOrCollaborator, validate(stopValidation), RouteController.addStop);
router.put('/:id/stops/:stopId', authenticateToken, requireAdminOrCollaborator, RouteController.updateStop);
router.delete('/:id/stops/:stopId', authenticateToken, requireAdminOrCollaborator, RouteController.deleteStop);

// Approval workflow
router.post('/:id/submit-review', authenticateToken, requireAdminOrCollaborator, RouteController.submitForReview);
router.post('/:id/request-delete', authenticateToken, requireAdminOrCollaborator, RouteController.requestDelete);
router.post('/:id/approve', authenticateToken, requireAdmin, RouteController.approve);
router.post('/:id/reject', authenticateToken, requireAdmin, RouteController.reject);

// Comments
router.get('/:id/comments', authenticateToken, RouteController.getComments);
router.post('/:id/comments', authenticateToken, requireAdminOrCollaborator, RouteController.addComment);

module.exports = router;
