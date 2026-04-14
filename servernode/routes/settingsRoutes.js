const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settingsController');
const { authenticate, isRecruiter } = require('../middleware/authMiddleware');

router.get('/smtp', authenticate, isRecruiter, settingsController.getSmtpSettings);
router.post('/smtp', authenticate, isRecruiter, settingsController.updateSmtpSettings);

module.exports = router;
