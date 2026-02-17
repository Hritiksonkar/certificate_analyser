const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const Certificate = require('../models/Certificate');
const mongoose = require('mongoose');

const router = express.Router();

const uploadDir = path.join(__dirname, '..', 'uploads');
// Ensure directory exists as soon as routes are loaded.
try {
    fs.mkdirSync(uploadDir, { recursive: true });
} catch (err) {
    // Route can still attempt to create it per-request; this just makes startup more reliable.
    console.error('Failed to create upload directory:', err);
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        try {
            if (!fs.existsSync(uploadDir)) {
                fs.mkdirSync(uploadDir, { recursive: true });
            }
            cb(null, uploadDir);
        } catch (err) {
            cb(err);
        }
    },
    filename: (req, file, cb) => {
        const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const ext = path.extname(file.originalname);
        cb(null, unique + ext);
    },
});

const upload = multer({ storage });

router.post('/upload', upload.single('certificate'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file provided' });
        }

        const studentIdRaw = req.body.studentId;
        const studentId =
            studentIdRaw && mongoose.Types.ObjectId.isValid(studentIdRaw)
                ? new mongoose.Types.ObjectId(studentIdRaw)
                : undefined;

        const certificate = new Certificate({
            studentId,
            fileUrl: `/uploads/${req.file.filename}`,
            status: 'pending',
        });

        await certificate.save();
        res.json({ message: 'Certificate uploaded', certificate });
    } catch (err) {
        console.error('Upload error:', err);
        res.status(500).json({ message: 'Upload failed' });
    }
});

module.exports = router;
