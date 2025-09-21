import express from 'express';
import multer from 'multer';
import StudentFormController from '../controllers/studentFormController.js';
import checkUserAuth from '../middlewares/auth-middleware.js';
import AccessTokenAutoRefresh from '../middlewares/setAuthHeader.js';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 5 // Maximum 5 files
  },
  fileFilter: (req, file, cb) => {
    // Allow common file types
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
      'image/jpeg',
      'image/png',
      'image/gif'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'), false);
    }
  }
});

// Public routes (no authentication required)
router.post('/form/save', upload.array('attachments', 5), StudentFormController.saveStudentForm);
router.get('/form/:sessionId', StudentFormController.getStudentForm);
router.get('/session/generate', StudentFormController.generateSessionId);

// Protected routes (authentication required)
router.use(AccessTokenAutoRefresh);
router.use(checkUserAuth);
router.post('/form/convert', StudentFormController.convertFormToAssignment);

export default router;