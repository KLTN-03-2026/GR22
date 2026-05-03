// Module: routes/settingsRoutes.js - Quản lý logic hệ thống
const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settingsController');
const { authenticate, isRecruiter } = require('../middleware/authMiddleware');

router.get('/smtp', authenticate, isRecruiter, settingsController.getSmtpSettings);
router.post('/smtp', authenticate, isRecruiter, settingsController.updateSmtpSettings);

module.exports = router;

// Git update: Triggering change for push
