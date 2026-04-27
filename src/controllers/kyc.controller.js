import multer from 'multer';
import { uploadBuffer } from '../services/s3.js';
import { KycDocument } from '../models/KycDocument.js';

const ALLOWED = ['image/png', 'image/jpeg', 'image/jpg', 'application/pdf'];

const storage = multer.memoryStorage();
export const kycUploadMiddleware = multer({
  storage,
  limits: { fileSize: 8 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!ALLOWED.includes(file.mimetype)) return cb(new Error('Unsupported file type'));
    cb(null, true);
  },
});

export const uploadKyc = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'File missing' });
    const { type } = req.body;
    const url = await uploadBuffer({
      buffer: req.file.buffer,
      mimeType: req.file.mimetype,
      folder: `kyc/${req.user._id}`,
    });

    const doc = await KycDocument.findOneAndUpdate(
      { user: req.user._id, type },
      { url, status: 'pending', reason: null },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );

    res.status(201).json({ document: doc });
  } catch (err) {
    next(err);
  }
};

export const myKyc = async (req, res, next) => {
  try {
    const docs = await KycDocument.find({ user: req.user._id }).sort('-createdAt');
    res.json({ documents: docs });
  } catch (err) {
    next(err);
  }
};

export const listPendingKyc = async (req, res, next) => {
  try {
    const page = Number(req.query.page || 1);
    const limit = Math.min(Number(req.query.limit || 20), 100);
    const skip = (page - 1) * limit;
    const [docs, total] = await Promise.all([
      KycDocument.find({ status: 'pending' })
        .populate('user', 'name email role')
        .sort('-createdAt')
        .skip(skip)
        .limit(limit),
      KycDocument.countDocuments({ status: 'pending' }),
    ]);
    res.json({ documents: docs, page, total, pages: Math.ceil(total / limit) });
  } catch (err) {
    next(err);
  }
};

export const reviewKyc = async (req, res, next) => {
  try {
    const { status, reason } = req.body;
    const { docId } = req.params;
    const doc = await KycDocument.findByIdAndUpdate(
      docId,
      { status, reason: status === 'rejected' ? reason : null },
      { new: true },
    );
    if (!doc) return res.status(404).json({ message: 'Document not found' });
    res.json({ document: doc });
  } catch (err) {
    next(err);
  }
};


