const express = require('express');
const router = express.Router();
const DestinationController = require('../controllers/destinations.controller');
const { authenticateToken, optionalAuth } = require('../middleware/auth');
const { requireAdmin, requireAdminOrCollaborator } = require('../middleware/role');
const { validate } = require('../middleware/validate');
const { body } = require('express-validator');

const storeValidation = [
  body('name').isObject().withMessage('Name must be an object with language keys'),
  body('name.vi').optional().notEmpty().withMessage('Vietnamese name is required'),
  body('type').isIn(['waterfall', 'cave', 'historical', 'spiritual', 'other']).withMessage('Invalid destination type'),
  body('lat').isFloat({ min: -90, max: 90 }).withMessage('Valid latitude is required'),
  body('lng').isFloat({ min: -180, max: 180 }).withMessage('Valid longitude is required'),
  body('visitor_notes').optional().isArray().withMessage('Visitor notes must be an array')
];

const updateValidation = [
  body('name').optional().isObject().withMessage('Name must be an object with language keys'),
  body('type').optional().isIn(['waterfall', 'cave', 'historical', 'spiritual', 'other']).withMessage('Invalid destination type'),
  body('lat').optional().isFloat({ min: -90, max: 90 }).withMessage('Valid latitude is required'),
  body('lng').optional().isFloat({ min: -180, max: 180 }).withMessage('Valid longitude is required'),
  body('visitor_notes').optional().isArray().withMessage('Visitor notes must be an array')
];

// Public routes
router.get('/', optionalAuth, DestinationController.index);
router.get('/nearby', DestinationController.nearby);
router.get('/:idOrSlug', optionalAuth, DestinationController.show);

// Protected routes
router.post('/', authenticateToken, requireAdminOrCollaborator, validate(storeValidation), DestinationController.store);
router.put('/:id', authenticateToken, requireAdminOrCollaborator, validate(updateValidation), DestinationController.update);
router.delete('/:id', authenticateToken, requireAdmin, DestinationController.destroy);

// Approval workflow
router.post('/:id/submit-review', authenticateToken, requireAdminOrCollaborator, DestinationController.submitForReview);
router.post('/:id/approve', authenticateToken, requireAdmin, DestinationController.approve);
router.post('/:id/reject', authenticateToken, requireAdmin, DestinationController.reject);

// Comments
router.get('/:id/comments', authenticateToken, DestinationController.getComments);
router.post('/:id/comments', authenticateToken, requireAdminOrCollaborator, DestinationController.addComment);

module.exports = router;
