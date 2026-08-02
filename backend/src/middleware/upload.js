import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import AppError from '../errors/AppError.js';
import HttpStatus from '../constants/httpStatus.js';
import ErrorCodes from '../errors/ErrorCodes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const avatarsDir = path.join(__dirname, '../../uploads/avatars');
export const bannersDir = path.join(__dirname, '../../uploads/banners');
export const submissionsDir = path.join(__dirname, '../../uploads/submissions');

for (const dir of [avatarsDir, bannersDir, submissionsDir]) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

const ALLOWED_MIME = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);

const imageFileFilter = (_req, file, cb) => {
  if (!ALLOWED_MIME.has(file.mimetype)) {
    return cb(
      new AppError(
        'Only JPEG, PNG, WebP, or GIF images are allowed',
        HttpStatus.BAD_REQUEST,
        ErrorCodes.VALIDATION_ERROR
      )
    );
  }
  cb(null, true);
};

const avatarStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, avatarsDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
    const userId = req.user?.id || 'anon';
    cb(null, `${userId}-${Date.now()}${ext}`);
  },
});

const bannerStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, bannersDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
    const ownerId = req.user?.id || 'anon';
    cb(null, `${ownerId}-${Date.now()}${ext}`);
  },
});

const bannerMemoryStorage = multer.memoryStorage();

export const uploadAvatar = multer({
  storage: avatarStorage,
  fileFilter: imageFileFilter,
  limits: { fileSize: 2 * 1024 * 1024 },
}).single('avatar');

export const uploadBanner = multer({
  storage: bannerMemoryStorage,
  fileFilter: imageFileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
}).single('banner');

const SUBMISSION_MIME = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'application/pdf',
]);

const submissionFileFilter = (_req, file, cb) => {
  if (!SUBMISSION_MIME.has(file.mimetype)) {
    return cb(
      new AppError(
        'Only JPEG, PNG, WebP, GIF images or PDF files are allowed',
        HttpStatus.BAD_REQUEST,
        ErrorCodes.VALIDATION_ERROR
      )
    );
  }
  cb(null, true);
};

const submissionStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, submissionsDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || '.bin';
    const userId = req.user?.id || 'anon';
    cb(null, `${userId}-${Date.now()}-${file.fieldname}${ext}`);
  },
});

export const uploadSubmissionFiles = multer({
  storage: submissionStorage,
  fileFilter: submissionFileFilter,
  limits: { fileSize: 10 * 1024 * 1024 },
}).fields([
  { name: 'screenshot', maxCount: 1 },
  { name: 'presentation', maxCount: 1 },
]);

export default uploadAvatar;
