const express = require('express');
const multer = require('multer');
const admin = require('firebase-admin');

const router = express.Router();

// Initialize Firebase Admin
const serviceAccount = {
    type: "service_account",
    project_id: process.env.FIREBASE_PROJECT_ID,
    private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
    private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    client_email: process.env.FIREBASE_CLIENT_EMAIL,
    client_id: process.env.FIREBASE_CLIENT_ID,
    auth_uri: "https://accounts.google.com/o/oauth2/auth",
    token_uri: "https://oauth2.googleapis.com/token",
};

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET
});

const bucket = admin.storage().bucket();

// Configure multer for memory storage
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
    }
});

// Upload endpoint
router.post('/upload', upload.array('images', 10), async (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ error: 'No files uploaded' });
        }

        const uploadPromises = req.files.map(file => {
            const timestamp = Date.now();
            const filename = `uploads/${timestamp}_${file.originalname}`;

            const blob = bucket.file(filename);
            const blobStream = blob.createWriteStream({
                metadata: {
                    contentType: file.mimetype,
                },
            });

            return new Promise((resolve, reject) => {
                blobStream.on('error', reject);
                blobStream.on('finish', () => {
                    resolve({
                        filename: filename,
                        originalName: file.originalname,
                        size: file.size,
                        timestamp: timestamp
                    });
                });
                blobStream.end(file.buffer);
            });
        });

        const results = await Promise.all(uploadPromises);
        res.json({
            message: 'Files uploaded successfully',
            uploadedFiles: results
        });

    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ error: 'Upload failed' });
    }
});

// Get uploaded files list (optional - for admin view)
router.get('/files', async (req, res) => {
    try {
        const [files] = await bucket.getFiles({ prefix: 'uploads/' });
        const fileList = files.map(file => ({
            name: file.name,
            url: `https://storage.googleapis.com/${bucket.name}/${file.name}`,
            created: file.metadata.timeCreated
        }));
        res.json(fileList);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch files' });
    }
});

module.exports = router;