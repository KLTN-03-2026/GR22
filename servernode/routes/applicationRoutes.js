const express = require('express');
const router = express.Router();
const applicationController = require('../controllers/applicationController');
const { authenticate, isRecruiter } = require('../middleware/authMiddleware');

// All application routes for recruiters should be protected
router.get('/job/:jobId', authenticate, isRecruiter, applicationController.getApplicationsByJob);
router.get('/my', authenticate, applicationController.getMyApplications);
router.put('/:id/status', authenticate, isRecruiter, applicationController.updateApplicationStatus);
router.post('/:id/send-acceptance-email', authenticate, isRecruiter, applicationController.sendAcceptanceEmail);
router.post('/analyze/:jobId', authenticate, isRecruiter, applicationController.analyzeApplications);
router.post('/', authenticate, applicationController.applyToJob);

module.exports = router;
