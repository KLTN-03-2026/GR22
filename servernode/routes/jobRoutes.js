// Module: routes/jobRoutes.js - Quản lý logic hệ thống
const express = require('express');
const { createJob, getAllJobs, getJobById, updateJob, deleteJob, getRelatedJobs, getRecruiterJobs } = require('../controllers/jobController');
const { authenticate, isRecruiter } = require('../middleware/authMiddleware');
const router = express.Router();

router.get('/', getAllJobs);
router.get('/recruiter', authenticate, isRecruiter, getRecruiterJobs);
router.get('/:id', getJobById);
router.get('/:id/related', getRelatedJobs);
router.post('/', authenticate, isRecruiter, createJob);
router.put('/:id', authenticate, isRecruiter, updateJob);
router.delete('/:id', authenticate, isRecruiter, deleteJob);

module.exports = router;

// Git update: Triggering change for push
