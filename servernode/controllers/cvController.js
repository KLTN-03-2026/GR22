// Module: controllers/cvController.js - Quản lý logic hệ thống
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const { Profile, CVEvaluation } = require('../models');
const aiService = require('../services/aiService');

// Get all CVs for the current user
exports.getAllCVs = async (req, res) => {
  try {
    const cvs = await Profile.findAll({
      where: { userId: req.user.id },
      order: [['updatedAt', 'DESC']],
      attributes: ['id', 'title', 'fullName', 'jobTitle', 'location', 'updatedAt', 'createdAt']
    });
    res.json(cvs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get a single CV by ID
exports.getCVById = async (req, res) => {
  try {
    const cv = await Profile.findOne({
      where: { id: req.params.id, userId: req.user.id }
    });
    if (!cv) return res.status(404).json({ error: 'CV not found' });
    res.json(cv);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Create a new CV
exports.createCV = async (req, res) => {
  try {
    const { title, fullName, jobTitle, email, phone, location, github, aboutMe, skills, experience, education, projects } = req.body;
    const cv = await Profile.create({
      userId: req.user.id,
      title: title || 'CV Mới',
      fullName, jobTitle, email, phone, location, github, aboutMe,
      skills, experience, education, projects
    });
    res.status(201).json(cv);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update an existing CV
exports.updateCV = async (req, res) => {
  try {
    const cv = await Profile.findOne({ where: { id: req.params.id, userId: req.user.id } });
    if (!cv) return res.status(404).json({ error: 'CV not found' });

    const { title, fullName, jobTitle, email, phone, location, github, aboutMe, skills, experience, education, projects } = req.body;
    await cv.update({ title, fullName, jobTitle, email, phone, location, github, aboutMe, skills, experience, education, projects });
    res.json(cv);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete a CV
exports.deleteCV = async (req, res) => {
  try {
    const cv = await Profile.findOne({ where: { id: req.params.id, userId: req.user.id } });
    if (!cv) return res.status(404).json({ error: 'CV not found' });
    await cv.destroy();
    res.json({ message: 'CV deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Upload PDF and save to Profile
exports.uploadCV = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    const cvUrl = `/uploads/${req.file.filename}`;
    
    // Find or create profile for user
    let [profile, created] = await Profile.findOrCreate({
      where: { userId: req.user.id },
      defaults: {
        title: 'CV của tôi',
        cvUrl
      }
    });

    if (!created) {
      await profile.update({ cvUrl });
    }

    // Call Python API for extraction
    const form = new FormData();
    form.append('file', fs.createReadStream(req.file.path), { filename: req.file.originalname });

    const response = await axios.post(`${process.env.PYTHON_API_URL || 'http://localhost:8000'}/extract-cv`, form, {
      headers: { ...form.getHeaders() }
    });

    res.json({
      message: 'CV uploaded and analyzed',
      cvUrl,
      extractedData: response.data
    });
  } catch (err) {
    console.error('Upload error:', err.message);
    res.status(500).json({ error: 'Failed to upload and analyze CV' });
  }
};

// Upload PDF for extraction only
exports.extractFromPDF = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    const form = new FormData();
    form.append('file', fs.createReadStream(req.file.path), { filename: req.file.originalname });

    const response = await axios.post(`${process.env.PYTHON_API_URL || 'http://localhost:8000'}/extract-cv`, form, {
      headers: { ...form.getHeaders() }
    });

    // Cleanup temporary file
    fs.unlinkSync(req.file.path);

    res.json(response.data);
  } catch (err) {
    if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    console.error('Extract error:', err.message);
    res.status(500).json({ error: 'Failed to extract CV.' });
  }
};

// AI Evaluate CV
exports.evaluateCV = async (req, res) => {
  try {
    const profileData = req.body;
    const { profileId } = req.query; // If it's an existing profile

    const evaluation = await aiService.evaluateCV(profileData);
    
    // Save evaluation to database
    if (profileId || profileData.id) {
      await CVEvaluation.create({
        score: evaluation.score,
        summary: evaluation.summary,
        suggestions: evaluation.suggestions,
        profileId: profileId || profileData.id,
        userId: req.user.id
      });
    }

    res.json(evaluation);
  } catch (err) {
    console.error('Evaluate error:', err.message);
    res.status(500).json({ error: 'Failed to evaluate CV with AI.' });
  }
};

// Get Evaluation History
exports.getEvaluationHistory = async (req, res) => {
  try {
    const { profileId } = req.params;
    const history = await CVEvaluation.findAll({
      where: { profileId, userId: req.user.id },
      order: [['createdAt', 'DESC']],
      limit: 10
    });
    res.json(history);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Git update: Triggering change for push
