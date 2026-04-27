import multer from 'multer';
import { uploadBuffer } from '../services/s3.js';

const ALLOWED_MIME = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
const storage = multer.memoryStorage();

export const uploadMiddleware = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!ALLOWED_MIME.includes(file.mimetype)) {
      return cb(new Error('Unsupported file type'));
    }
    cb(null, true);
  },
});

export const uploadImage = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'File missing' });
    const url = await uploadBuffer({ buffer: req.file.buffer, mimeType: req.file.mimetype, folder: 'images' });
    res.status(201).json({ url });
  } catch (err) {
    next(err);
  }
};

