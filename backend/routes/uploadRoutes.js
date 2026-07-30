const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { protect } = require('../middleware/auth');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '..', 'uploads', 'tickets')),
  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${unique}${path.extname(file.originalname)}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|pdf|doc|docx|txt|zip/;
    const ok = allowed.test(path.extname(file.originalname).toLowerCase());
    cb(ok ? null : new Error('Unsupported file type'), ok);
  },
});

router.post('/', protect, upload.array('files', 5), (req, res) => {
  const urls = (req.files || []).map((f) => `/uploads/tickets/${f.filename}`);
  res.json({ success: true, files: urls });
});

module.exports = router;
