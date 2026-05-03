// Module: routes/recommendRoutes.js - Quản lý logic hệ thống
const express = require('express');
const router = express.Router();
const recommendController = require('../controllers/recommendController');
const { authenticate } = require('../middleware/authMiddleware');

router.get('/jobs/:cvId', authenticate, recommendController.getJobRecommendations);

module.exports = router;

// Git update: Triggering change for push
