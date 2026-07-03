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

/**
 * @swagger
 * /destinations:
 *   get:
 *     summary: Get all destinations
 *     tags: [Destinations]
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [draft, pending, published, archived]
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [waterfall, cave, historical, spiritual, other]
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of destinations
 */
router.get('/', optionalAuth, DestinationController.index);

/**
 * @swagger
 * /destinations/nearby:
 *   get:
 *     summary: Get nearby destinations
 *     tags: [Destinations]
 *     parameters:
 *       - in: query
 *         name: lat
 *         required: true
 *         schema:
 *           type: number
 *       - in: query
 *         name: lng
 *         required: true
 *         schema:
 *           type: number
 *       - in: query
 *         name: radius
 *         schema:
 *           type: integer
 *           default: 5000
 *     responses:
 *       200:
 *         description: Nearby destinations
 */
router.get('/nearby', DestinationController.nearby);

/**
 * @swagger
 * /destinations/{idOrSlug}:
 *   get:
 *     summary: Get destination by ID or slug
 *     tags: [Destinations]
 *     parameters:
 *       - in: path
 *         name: idOrSlug
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Destination details
 *       404:
 *         description: Not found
 */
router.get('/:idOrSlug', optionalAuth, DestinationController.show);

/**
 * @swagger
 * /destinations:
 *   post:
 *     summary: Create new destination
 *     tags: [Destinations]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Destination'
 *     responses:
 *       201:
 *         description: Created
 *       401:
 *         description: Not authenticated
 */
router.post('/', authenticateToken, requireAdminOrCollaborator, validate(storeValidation), DestinationController.store);

/**
 * @swagger
 * /destinations/{id}:
 *   put:
 *     summary: Update destination
 *     tags: [Destinations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Updated
 *       404:
 *         description: Not found
 */
router.put('/:id', authenticateToken, requireAdminOrCollaborator, validate(updateValidation), DestinationController.update);

/**
 * @swagger
 * /destinations/{id}:
 *   delete:
 *     summary: Delete destination (Admin only)
 *     tags: [Destinations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Deleted
 *       403:
 *         description: Forbidden
 */
router.delete('/:id', authenticateToken, requireAdmin, DestinationController.destroy);

// Approval workflow
router.post('/:id/submit-review', authenticateToken, requireAdminOrCollaborator, DestinationController.submitForReview);
router.post('/:id/approve', authenticateToken, requireAdmin, DestinationController.approve);
router.post('/:id/reject', authenticateToken, requireAdmin, DestinationController.reject);

// Comments
router.get('/:id/comments', authenticateToken, DestinationController.getComments);
router.post('/:id/comments', authenticateToken, requireAdminOrCollaborator, DestinationController.addComment);

module.exports = router;
