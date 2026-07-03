const express = require('express');
const router = express.Router();
const UploadController = require('../controllers/upload.controller');
const { authenticateToken } = require('../middleware/auth');
const { requireAdminOrCollaborator } = require('../middleware/role');
const { upload } = require('../config/upload');

// All routes require authentication
router.use(authenticateToken, requireAdminOrCollaborator);

router.post('/image', upload.single('image'), UploadController.uploadImage);
router.post('/images', upload.array('images', 10), UploadController.uploadMultiple);
router.delete('/:filename', UploadController.deleteFile);

module.exports = router;
