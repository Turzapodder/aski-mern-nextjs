import express from 'express';
import ProfileController, { uploadProfileFiles } from '../controllers/profileController.js';
import checkUserAuth from '../middlewares/auth-middleware.js';
import AccessTokenAutoRefresh from '../middlewares/setAuthHeader.js';

const router = express.Router();

// Auth/refresh middleware
router.use(AccessTokenAutoRefresh);
router.use(checkUserAuth);

// Profile GET/PUT
router.get('/:userId', ProfileController.getProfile);
router.put('/:userId', ProfileController.updateProfile);

// Upload endpoints
router.post('/upload', uploadProfileFiles.fields([
  { name: 'profileImage', maxCount: 1 },
  { name: 'documents', maxCount: 5 }
]), (req, res) => {
  try {
    const files = req.files || {};
    const baseUrl = req.protocol + '://' + req.get('host');

    const response = {};
    if (files.profileImage && files.profileImage[0]) {
      const f = files.profileImage[0];
      response.profileImage = {
        filename: f.filename,
        originalName: f.originalname,
        mimetype: f.mimetype,
        size: f.size,
        url: `/uploads/user-documents/${f.filename}`,
        absoluteUrl: `${baseUrl}/uploads/user-documents/${f.filename}`
      };
    }
    if (files.documents) {
      response.documents = files.documents.map(f => ({
        filename: f.filename,
        originalName: f.originalname,
        mimetype: f.mimetype,
        size: f.size,
        url: `/uploads/user-documents/${f.filename}`,
        absoluteUrl: `${baseUrl}/uploads/user-documents/${f.filename}`
      }));
    }

    return res.status(200).json({ status: 'success', ...response });
  } catch (error) {
    console.error('Upload error:', error);
    return res.status(500).json({ status: 'failed', message: 'Upload failed' });
  }
});

export default router;