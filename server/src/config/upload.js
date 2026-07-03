const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const UPLOAD_DIR = process.env.UPLOAD_DIR || './uploads';
const MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024; // 5MB

const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp'
];

const ALLOWED_CATEGORIES = ['destinations', 'routes', 'events', 'temp'];

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const category = ALLOWED_CATEGORIES.includes(req.body.category) ? req.body.category : 'destinations';
    const uploadPath = path.join(UPLOAD_DIR, category);
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // Security: Use MIME type to determine extension, not originalname (prevents HTML/JS upload)
    const EXT_BY_MIME = { 'image/jpeg': '.jpg', 'image/png': '.png', 'image/webp': '.webp' };
    const ext = EXT_BY_MIME[file.mimetype] || '.bin';
    const filename = `${Date.now()}-${uuidv4().substring(0, 8)}${ext}`;
    cb(null, filename);
  }
});

const fileFilter = (req, file, cb) => {
  if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, and WebP are allowed.'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE
  }
});

module.exports = {
  upload,
  UPLOAD_DIR,
  MAX_FILE_SIZE,
  ALLOWED_MIME_TYPES,
  ALLOWED_CATEGORIES
};
