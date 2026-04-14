const express = require('express');
const multer = require('multer');
const cvController = require('../controllers/cvController');
const { authenticate } = require('../middleware/authMiddleware');
const router = express.Router();

const upload = multer({ dest: 'uploads/' });

// CV CRUD
router.get('/', authenticate, cvController.getAllCVs);
router.get('/:id', authenticate, cvController.getCVById);
router.post('/', authenticate, cvController.createCV);
router.put('/:id', authenticate, cvController.updateCV);
router.delete('/:id', authenticate, cvController.deleteCV);

// Upload PDF and save to Profile
router.post('/upload', authenticate, upload.single('file'), cvController.uploadCV);

// Upload PDF for extraction only
router.post('/extract', authenticate, upload.single('file'), cvController.extractFromPDF);

module.exports = router;
