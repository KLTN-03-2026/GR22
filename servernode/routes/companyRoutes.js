const express = require('express');
const multer = require('multer');
const path = require('path');
const companyController = require('../controllers/companyController');
const { authenticate } = require('../middleware/authMiddleware');

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});

const upload = multer({ storage });

// Public routes
router.get('/', companyController.getAllCompanies);

// Authenticated routes (must come before /:id)
router.get('/my-company', authenticate, companyController.getCompany);
router.post('/my-company', authenticate, upload.single('logo'), companyController.updateCompany);

// Public: single company detail (must come after /my-company)
router.get('/:id', companyController.getCompanyById);

module.exports = router;
