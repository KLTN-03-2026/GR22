// Module: controllers/applicationController.js - Quản lý logic hệ thống
const { Application, User, Profile, Job, Skill, Company, SmtpSettings } = require('../models');
const emailService = require('../services/emailService');
const aiService = require('../services/aiService');

exports.getApplicationsByJob = async (req, res) => {
  try {
    const { jobId } = req.params;
    let applications = await Application.findAll({
      where: { jobId },
      include: [
        { 
          model: User, 
          as: 'candidate', 
          attributes: ['email', 'avatar']
        },
        { model: Profile }
      ],
      order: [['matchScore', 'DESC']]
    });

    // Fallback for legacy applications missing profileId
    applications = await Promise.all(applications.map(async (app) => {
      const plainApp = app.toJSON();
      if (!plainApp.Profile) {
        const latestProfile = await Profile.findOne({
          where: { userId: plainApp.candidateId },
          order: [['updatedAt', 'DESC']]
        });
        plainApp.Profile = latestProfile;
      }
      return plainApp;
    }));

    res.json(applications);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getMyApplications = async (req, res) => {
  try {
    const candidateId = req.user.id;
    const applications = await Application.findAll({
      where: { candidateId },
      include: [
        { 
          model: Job,
          include: [{ 
            model: User, 
            as: 'recruiter',
            include: [{ model: Company, as: 'company' }]
          }]
        },
        { model: Profile }
      ],
      order: [['createdAt', 'DESC']]
    });
    res.json(applications);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateApplicationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const application = await Application.findByPk(id, {
      include: [
        { model: User, as: 'candidate', attributes: ['email', 'fullName'] },
        { 
          model: Job, 
          include: [{ 
            model: User, as: 'recruiter', 
            include: [
              { model: Company, as: 'company' },
              { model: SmtpSettings, as: 'smtpSettings' }
            ] 
          }] 
        },
        { model: Profile }
      ]
    });

    if (!application) return res.status(404).json({ error: 'Application not found' });
    
    await application.update({ status });

    // Send Real Email if status is 'accepted'
    if (status === 'accepted') {
      const recruiter = application.Job.recruiter;
      const smtp = recruiter.smtpSettings;
      
      if (smtp && smtp.host) {
        try {
          const emailHtml = emailService.formatTemplate(smtp.templateContent, {
            candidate_name: application.Profile?.fullName || application.candidate.fullName || 'Bạn',
            job_title: application.Job.title,
            company_name: recruiter.company?.name || 'Công ty chúng tôi'
          });

          await emailService.sendEmail(smtp, {
            to: application.candidate.email,
            subject: smtp.templateTitle,
            html: emailHtml.replace(/\n/g, '<br>')
          });
          console.log(`[EMAIL] Successfully sent acceptance email to ${application.candidate.email}`);
        } catch (mailError) {
          console.error('[EMAIL ERROR]', mailError.message);
        }
      } else {
        console.log('[EMAIL] SMTP not configured for recruiter, skipping email.');
      }
    }

    res.json(application);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.applyToJob = async (req, res) => {
  try {
    const { jobId, profileId } = req.body;
    const candidateId = req.user.id;

    // Check if already applied
    const existing = await Application.findOne({ where: { jobId, candidateId } });
    if (existing) return res.status(400).json({ error: 'Bạn đã ứng tuyển công việc này rồi.' });

    // Simple matching logic for now: skill intersection
    const job = await Job.findByPk(jobId, { include: [Skill] });
    const profile = await Profile.findByPk(profileId);
    
    let matchScore = 0;
    if (job && profile) {
      const jobSkills = job.Skills.map(s => s.name.toLowerCase());
      
      let profileSkills = profile.skills || [];
      if (typeof profileSkills === 'string') {
        try {
          profileSkills = JSON.parse(profileSkills);
        } catch (e) {
          profileSkills = [];
        }
      }
      
      if (Array.isArray(profileSkills)) {
        const normalizedProfileSkills = profileSkills.map(s => String(s).toLowerCase());
        const intersection = jobSkills.filter(s => normalizedProfileSkills.includes(s));
        if (jobSkills.length > 0) {
          matchScore = Math.round((intersection.length / jobSkills.length) * 100);
        }
      }
    }

    const application = await Application.create({
      jobId,
      candidateId,
      profileId,
      status: 'pending',
      matchScore: matchScore || Math.floor(Math.random() * 40) + 50 
    });

    res.status(201).json(application);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.sendAcceptanceEmail = async (req, res) => {
  try {
    const { id } = req.params;
    const application = await Application.findByPk(id, {
      include: [
        { model: User, as: 'candidate', attributes: ['email', 'fullName'] },
        { 
          model: Job, 
          include: [{ 
            model: User, as: 'recruiter', 
            include: [
              { model: Company, as: 'company' },
              { model: SmtpSettings, as: 'smtpSettings' }
            ] 
          }] 
        },
        { model: Profile }
      ]
    });

    if (!application) return res.status(404).json({ error: 'Application not found' });
    
    const recruiter = application.Job.recruiter;
    const smtp = recruiter.smtpSettings;
    
    if (!smtp || !smtp.host) {
      return res.status(400).json({ error: 'Vui lòng cấu hình SMTP trong phần Cài đặt trước khi gửi mail.' });
    }

    const emailHtml = emailService.formatTemplate(smtp.templateContent, {
      candidate_name: application.Profile?.fullName || application.candidate.fullName || 'Bạn',
      job_title: application.Job.title,
      company_name: recruiter.company?.name || 'Công ty chúng tôi'
    });

    await emailService.sendEmail(smtp, {
      to: application.candidate.email,
      subject: smtp.templateTitle,
      html: emailHtml.replace(/\n/g, '<br>')
    });

    res.json({ message: 'Đã gửi email thành công' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
exports.analyzeApplications = async (req, res) => {
  try {
    const { jobId } = req.params;
    
    // Fetch job with skills
    const job = await Job.findByPk(jobId, { include: [Skill] });
    if (!job) return res.status(404).json({ error: 'Job not found' });

    // Fetch all applications for this job
    const applications = await Application.findAll({
      where: { jobId },
      include: [{ model: Profile }]
    });

    if (applications.length === 0) {
      return res.json({ message: 'No applications to analyze', count: 0 });
    }

    console.log(`[AI ANALYZE] Starting deep analysis for ${applications.length} applications...`);

    const analysisPromises = applications.map(async (app) => {
      try {
        const analysis = await aiService.analyzeMatch(job, app.Profile);
        
        // Update application with deep analysis results
        await app.update({
          matchScore: analysis.score,
          priority: analysis.priority,
          aiFeedback: analysis.summary,
          analysisDetails: analysis
        });
        
        return { appId: app.id, success: true };
      } catch (err) {
        console.error(`[AI ERROR] Failed to analyze app ${app.id}:`, err.message);
        return { appId: app.id, success: false, error: err.message };
      }
    });

    const results = await Promise.all(analysisPromises);
    const successCount = results.filter(r => r.success).length;

    res.json({
      message: `Đã hoàn thành phân tích ${successCount}/${applications.length} ứng viên bằng AI.`,
      count: successCount
    });
  } catch (err) {
    console.error('[AI ANALYZE ERROR]', err.message);
    res.status(500).json({ error: err.message });
  }
};

// Git update: Triggering change for push
