// Module: controllers/jobController.js - Quản lý logic hệ thống
const { Job, User, Skill, Company, sequelize } = require('../models');
const { Sequelize } = require('sequelize');

exports.createJob = async (req, res) => {
  try {
    const { title, description, requirements, location, salary, type, skillIds } = req.body;
    const job = await Job.create({
      title, description, requirements, location, salary, type,
      status: 'pending',
      recruiterId: req.user.id
    });
    
    if (skillIds && skillIds.length > 0) {
      await job.setSkills(skillIds);
    }

    res.status(201).json(job);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getAllJobs = async (req, res) => {
  try {
    const { page = 1, limit = 10, q, location, salaryRange, type, skills } = req.query;
    const p = parseInt(page);
    const l = parseInt(limit);
    const offset = (p - 1) * l;

    const where = { status: 'active' };

    if (q) {
      where[Sequelize.Op.or] = [
        { title: { [Sequelize.Op.like]: `%${q}%` } },
        { description: { [Sequelize.Op.like]: `%${q}%` } }
      ];
    }

    if (location) {
      where.location = { [Sequelize.Op.like]: `%${location}%` };
    }

    if (type) {
      where.type = type;
    }

    // Skill filtering (Multi-match)
    let skillInclude = { model: Skill, through: { attributes: [] } };
    if (skills) {
        const skillNames = skills.split(',');
        skillInclude = {
            model: Skill,
            through: { attributes: [] },
            where: { name: { [Sequelize.Op.in]: skillNames } }
        };
    }

    const { count, rows } = await Job.findAndCountAll({
      distinct: true,
      include: [
        { model: User, as: 'recruiter', attributes: ['email', 'fullName', 'avatar'] },
        skillInclude,
        { model: Company, as: 'company' }
      ],
      where,
      limit: l,
      offset,
      order: [['createdAt', 'DESC']]
    });

    res.json({
      jobs: rows,
      total: count,
      totalPages: Math.ceil(count / l),
      currentPage: p
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getRecruiterJobs = async (req, res) => {
  try {
    const jobs = await Job.findAll({
      where: { recruiterId: req.user.id },
      include: [
        { model: Skill, through: { attributes: [] } }
      ],
      order: [['createdAt', 'DESC']]
    });
    res.json(jobs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getJobById = async (req, res) => {
  try {
    const job = await Job.findByPk(req.params.id, {
      include: [
        { 
          model: User, 
          as: 'recruiter', 
          attributes: ['email', 'fullName', 'avatar'],
          include: [{ model: Company, as: 'company' }]
        },
        { model: Skill, through: { attributes: [] } }
      ]
    });
    if (!job) return res.status(404).json({ error: 'Job not found' });
    res.json(job);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getRelatedJobs = async (req, res) => {
  try {
    const { id } = req.params;
    const currentJob = await Job.findByPk(id, { include: [Skill] });
    if (!currentJob) return res.status(404).json({ error: 'Job not found' });

    const skillIds = currentJob.Skills.map(s => s.id);

    const related = await Job.findAll({
      where: {
        id: { [Sequelize.Op.ne]: id },
        status: 'active'
      },
      include: [
        { model: Skill, where: { id: { [Sequelize.Op.in]: skillIds } }, through: { attributes: [] } },
        { 
          model: User, 
          as: 'recruiter', 
          include: [{ model: Company, as: 'company' }] 
        }
      ],
      limit: 4
    });

    res.json(related);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateJob = async (req, res) => {
  try {
    const { skillIds, ...jobData } = req.body;
    const job = await Job.findByPk(req.params.id);
    if (!job || job.recruiterId !== req.user.id) return res.status(403).json({ error: 'Unauthorized' });
    
    await job.update(jobData);
    
    if (skillIds) {
      await job.setSkills(skillIds);
    }
    
    res.json(job);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteJob = async (req, res) => {
  try {
    const job = await Job.findByPk(req.params.id);
    if (!job || job.recruiterId !== req.user.id) return res.status(403).json({ error: 'Unauthorized' });
    await job.destroy();
    res.json({ message: 'Job deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Git update: Triggering change for push
