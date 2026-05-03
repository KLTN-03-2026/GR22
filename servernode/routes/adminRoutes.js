// Module: routes/adminRoutes.js - Quản lý logic hệ thống
const express = require('express');
const {
  getDashboardStats,
  getAllUsers, deleteUser, updateUserRole,
  getAllJobs, updateJobStatus, deleteJob,
  createSkill, getAllSkills, deleteSkill
} = require('../controllers/adminController');
const { authenticate, isAdmin } = require('../middleware/authMiddleware');
const router = express.Router();

// Dashboard
router.get('/stats', authenticate, isAdmin, getDashboardStats);

// User Management
router.get('/users', authenticate, isAdmin, getAllUsers);
router.delete('/users/:id', authenticate, isAdmin, deleteUser);
router.put('/users/:id/role', authenticate, isAdmin, updateUserRole);

// Job Management
router.get('/jobs', authenticate, isAdmin, getAllJobs);
router.put('/jobs/:id/status', authenticate, isAdmin, updateJobStatus);
router.delete('/jobs/:id', authenticate, isAdmin, deleteJob);

// Skill Management
router.get('/skills', getAllSkills);
router.post('/skills', authenticate, isAdmin, createSkill);
router.delete('/skills/:id', authenticate, isAdmin, deleteSkill);

module.exports = router;

// Git update: Triggering change for push
