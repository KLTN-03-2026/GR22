const express = require('express');
const multer = require('multer');
const path = require('path');
const bannerController = require('../controllers/bannerController');
const { authenticate, isAdmin } = require('../middleware/authMiddleware');

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});

const upload = multer({ storage });

// Public route for users to see banners
router.get('/', bannerController.getBanners);

// Admin routes
router.get('/admin', authenticate, isAdmin, bannerController.adminGetBanners);
router.post('/admin', authenticate, isAdmin, upload.single('image'), bannerController.createBanner);
router.put('/admin/:id', authenticate, isAdmin, upload.single('image'), bannerController.updateBanner);
router.delete('/admin/:id', authenticate, isAdmin, bannerController.deleteBanner);

module.exports = router;
