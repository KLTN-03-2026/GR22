const express = require('express');
const multer = require('multer');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticate } = require('../middleware/authMiddleware');

const upload = multer({ dest: 'uploads/' });

router.get('/me', authenticate, userController.getUserInfo);
router.put('/me', authenticate, userController.updateUserInfo);
router.post('/avatar', authenticate, upload.single('file'), userController.updateAvatar);

module.exports = router;
