const { success, created, badRequest, notFound } = require('../utils/response');
const path = require('path');
const fs = require('fs');
const sharp = require('sharp');
const { v4: uuidv4 } = require('uuid');

const UPLOAD_DIR = process.env.UPLOAD_DIR || './uploads';
const MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024; // 5MB
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const OUTPUT_FORMAT = 'webp';
const OUTPUT_QUALITY = 80;

// Ensure upload directories exist
const ensureDirectoryExists = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

// Initialize upload directories
ensureDirectoryExists(path.join(UPLOAD_DIR, 'destinations'));
ensureDirectoryExists(path.join(UPLOAD_DIR, 'routes'));
ensureDirectoryExists(path.join(UPLOAD_DIR, 'events'));
ensureDirectoryExists(path.join(UPLOAD_DIR, 'temp'));

const UploadController = {
  async uploadImage(req, res, next) {
    try {
      if (!req.file) {
        return badRequest(res, 'No file uploaded');
      }

      // Validate file type
      if (!ALLOWED_MIME_TYPES.includes(req.file.mimetype)) {
        // Delete the uploaded file
        fs.unlinkSync(req.file.path);
        return badRequest(res, 'Invalid file type. Only JPEG, PNG, and WebP are allowed.');
      }

      // Validate file size
      if (req.file.size > MAX_FILE_SIZE) {
        fs.unlinkSync(req.file.path);
        return badRequest(res, `File too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB.`);
      }

      const category = req.body.category || 'destinations';
      const outputDir = path.join(UPLOAD_DIR, category);
      ensureDirectoryExists(outputDir);

      // Generate unique filename
      const uniqueId = uuidv4().substring(0, 8);
      const timestamp = Date.now();
      const outputFilename = `${timestamp}-${uniqueId}.${OUTPUT_FORMAT}`;
      const outputPath = path.join(outputDir, outputFilename);

      // Process image: compress and convert to webp
      await sharp(req.file.path)
        .resize(1200, 1200, { 
          fit: 'inside',
          withoutEnlargement: true 
        })
        .toFormat(OUTPUT_FORMAT, { quality: OUTPUT_QUALITY })
        .toFile(outputPath);

      // Delete original file
      fs.unlinkSync(req.file.path);

      const fileUrl = `/uploads/${category}/${outputFilename}`;

      return created(res, {
        filename: outputFilename,
        originalname: req.file.originalname,
        mimetype: `image/${OUTPUT_FORMAT}`,
        size: fs.statSync(outputPath).size,
        url: fileUrl
      });
    } catch (error) {
      // Clean up on error
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      next(error);
    }
  },

  async uploadMultiple(req, res, next) {
    try {
      if (!req.files || req.files.length === 0) {
        return badRequest(res, 'No files uploaded');
      }

      const category = req.body.category || 'destinations';
      const outputDir = path.join(UPLOAD_DIR, category);
      ensureDirectoryExists(outputDir);

      const results = [];

      for (const file of req.files) {
        // Validate file type
        if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
          fs.unlinkSync(file.path);
          continue; // Skip invalid files
        }

        // Validate file size
        if (file.size > MAX_FILE_SIZE) {
          fs.unlinkSync(file.path);
          continue; // Skip oversized files
        }

        // Generate unique filename
        const uniqueId = uuidv4().substring(0, 8);
        const timestamp = Date.now();
        const outputFilename = `${timestamp}-${uniqueId}.${OUTPUT_FORMAT}`;
        const outputPath = path.join(outputDir, outputFilename);

        // Process image: compress and convert to webp
        await sharp(file.path)
          .resize(1200, 1200, { 
            fit: 'inside',
            withoutEnlargement: true 
          })
          .toFormat(OUTPUT_FORMAT, { quality: OUTPUT_QUALITY })
          .toFile(outputPath);

        // Delete original file
        fs.unlinkSync(file.path);

        results.push({
          filename: outputFilename,
          originalname: file.originalname,
          mimetype: `image/${OUTPUT_FORMAT}`,
          size: fs.statSync(outputPath).size,
          url: `/uploads/${category}/${outputFilename}`
        });
      }

      if (results.length === 0) {
        return badRequest(res, 'No valid files were uploaded');
      }

      return created(res, results);
    } catch (error) {
      // Clean up on error
      if (req.files) {
        req.files.forEach(file => {
          if (fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
          }
        });
      }
      next(error);
    }
  },

  async deleteFile(req, res, next) {
    try {
      const { filename } = req.params;

      // BUG-09 FIX: Prevent path traversal attack
      // e.g. filename = '../../server/src/config/database.js' would delete config files
      const safeFilename = path.basename(filename);
      if (safeFilename !== filename || filename.includes('/') || filename.includes('\\')) {
        return badRequest(res, 'Invalid filename');
      }

      const category = req.query.category || 'destinations';
      // Validate category to prevent directory traversal via query param
      const allowedCategories = ['destinations', 'routes', 'events', 'temp'];
      if (!allowedCategories.includes(category)) {
        return badRequest(res, 'Invalid category');
      }

      const filePath = path.join(UPLOAD_DIR, category, safeFilename);

      if (!fs.existsSync(filePath)) {
        return notFound(res, 'File not found');
      }

      fs.unlinkSync(filePath);
      return success(res, { message: 'File deleted successfully' });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = UploadController;
