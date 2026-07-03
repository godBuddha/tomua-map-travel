const express = require('express');
const router = express.Router();
const UsersController = require('../controllers/users.controller');
const { authenticateToken } = require('../middleware/auth');
const { requireAdmin } = require('../middleware/role');
const { validate } = require('../middleware/validate');
const { body } = require('express-validator');

const storeValidation = [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('username').isLength({ min: 3 }).withMessage('Username must be at least 3 characters'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
];

const updateValidation = [
  body('name').optional().notEmpty().withMessage('Name cannot be empty'),
  body('email').optional().isEmail().withMessage('Valid email is required'),
  body('username').optional().isLength({ min: 3 }).withMessage('Username must be at least 3 characters')
];

// All routes require admin role
router.use(authenticateToken, requireAdmin);

router.get('/', UsersController.index);
router.get('/:id', UsersController.show);
router.post('/', validate(storeValidation), UsersController.store);
router.put('/:id', validate(updateValidation), UsersController.update);
router.delete('/:id', UsersController.destroy);
router.put('/:id/status', UsersController.updateStatus);
router.put('/:id/role', UsersController.updateRole);

module.exports = router;
