const { Profile, Job, Company } = require('../models');
const axios = require('axios');

exports.getJobRecommendations = async (req, res) => {
  try {
    const { cvId } = req.params;
    
    // 1. Fetch CV
    const profile = await Profile.findOne({
      where: { id: cvId, userId: req.user.id }
    });
    
    if (!profile) {
      return res.status(404).json({ error: 'CV not found' });
    }

    // 2. Fetch all active jobs (include Company for display)
    const jobs = await Job.findAll({
      where: { status: 'active' },
      include: [{ model: Company, as: 'company', attributes: ['name', 'logo'] }]
    });

    if (jobs.length === 0) {
      return res.json({ recommendations: [], jobs: [] });
    }

    // 3. Prepare data for Python API
    const pythonPayload = {
      cv: {
        full_name: profile.fullName || 'N/A',
        job_title: profile.jobTitle || 'N/A',
        about_me: profile.aboutMe || '',
        skills: profile.skills || {},
        experience: profile.experience || [],
        education: profile.education || [],
        projects: profile.projects || []
      },
      jobs: jobs.map(j => ({
        id: j.id,
        title: j.title,
        description: j.description || '',
        requirements: j.requirements || '',
        location: j.location,
        salary: j.salary
      }))
    };

    // 4. Call Python Recommendation Service
    const pythonUrl = process.env.PYTHON_API_URL || 'http://localhost:8000';
    const response = await axios.post(`${pythonUrl}/recommend-jobs`, pythonPayload);
    
    const recommendations = response.data.recommendations; // [{ job_id, match_score, reason }, ...]

    // 5. Merge with Job details for the frontend
    const enrichedResults = recommendations.map(rec => {
      const job = jobs.find(j => j.id === rec.job_id);
      return {
        ...rec,
        job: job || null
      };
    }).filter(r => r.job !== null);

    res.json({
      recommendations: enrichedResults
    });

  } catch (err) {
    console.error('Recommendation Error:', err.message);
    res.status(500).json({ error: 'Failed to get recommendations from AI.' });
  }
};
