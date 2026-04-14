const { User, Profile, Job, Application, Company, Skill } = require('../models');
const { Op, fn, col, literal } = require('sequelize');

// ===== DASHBOARD STATS =====
exports.getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.count();
    const totalCandidates = await User.count({ where: { role: 'candidate' } });
    const totalRecruiters = await User.count({ where: { role: 'recruiter' } });
    const totalAdmins = await User.count({ where: { role: 'admin' } });
    const totalJobs = await Job.count();
    const pendingJobs = await Job.count({ where: { status: 'pending' } });
    const activeJobs = await Job.count({ where: { status: 'active' } });
    const closedJobs = await Job.count({ where: { status: 'closed' } });
    const totalApplications = await Application.count();
    const totalProfiles = await Profile.count();

    // Monthly trends (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyUsers = await User.findAll({
      attributes: [
        [fn('DATE_FORMAT', col('createdAt'), '%Y-%m'), 'month'],
        [fn('COUNT', col('id')), 'count']
      ],
      where: { createdAt: { [Op.gte]: sixMonthsAgo } },
      group: [literal("DATE_FORMAT(`createdAt`, '%Y-%m')")],
      order: [[literal("month"), 'ASC']],
      raw: true
    });

    const monthlyJobs = await Job.findAll({
      attributes: [
        [fn('DATE_FORMAT', col('createdAt'), '%Y-%m'), 'month'],
        [fn('COUNT', col('id')), 'count']
      ],
      where: { createdAt: { [Op.gte]: sixMonthsAgo } },
      group: [literal("DATE_FORMAT(`createdAt`, '%Y-%m')")],
      order: [[literal("month"), 'ASC']],
      raw: true
    });

    const monthlyApplications = await Application.findAll({
      attributes: [
        [fn('DATE_FORMAT', col('createdAt'), '%Y-%m'), 'month'],
        [fn('COUNT', col('id')), 'count']
      ],
      where: { createdAt: { [Op.gte]: sixMonthsAgo } },
      group: [literal("DATE_FORMAT(`createdAt`, '%Y-%m')")],
      order: [[literal("month"), 'ASC']],
      raw: true
    });

    // Build merged monthly data
    const months = new Set([...monthlyUsers, ...monthlyJobs, ...monthlyApplications].map(m => m.month));
    const monthlyTrends = [...months].sort().map(month => ({
      month,
      users: parseInt(monthlyUsers.find(m => m.month === month)?.count || 0),
      jobs: parseInt(monthlyJobs.find(m => m.month === month)?.count || 0),
      applications: parseInt(monthlyApplications.find(m => m.month === month)?.count || 0),
    }));

    // Application status breakdown
    const applicationsByStatus = await Application.findAll({
      attributes: ['status', [fn('COUNT', col('id')), 'count']],
      group: ['status'],
      raw: true
    });

    res.json({
      totalUsers, totalCandidates, totalRecruiters, totalAdmins,
      totalJobs, pendingJobs, activeJobs, closedJobs,
      totalApplications, totalProfiles,
      monthlyTrends, applicationsByStatus
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ===== USER MANAGEMENT =====
exports.getAllUsers = async (req, res) => {
  try {
    const { role, search } = req.query;
    const where = {};
    if (role) where.role = role;
    if (search) {
      where.email = { [Op.like]: `%${search}%` };
    }
    const users = await User.findAll({
      where,
      attributes: { exclude: ['password', 'resetPasswordToken', 'resetPasswordExpires'] },
      include: [
        { model: Company, as: 'company', attributes: ['id', 'name', 'logo', 'industry'] }
      ],
      order: [['createdAt', 'DESC']]
    });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ error: 'Không tìm thấy người dùng' });
    if (user.role === 'admin') return res.status(403).json({ error: 'Không thể xóa tài khoản admin' });
    await user.destroy();
    res.json({ message: 'Đã xóa người dùng thành công' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ error: 'Không tìm thấy người dùng' });
    user.role = role;
    await user.save();
    res.json({ message: `Đã cập nhật role thành "${role}"` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ===== JOB MANAGEMENT =====
exports.getAllJobs = async (req, res) => {
  try {
    const { status, search } = req.query;
    const where = {};
    if (status) where.status = status;
    if (search) {
      where.title = { [Op.like]: `%${search}%` };
    }
    const jobs = await Job.findAll({
      where,
      include: [
        { model: User, as: 'recruiter', attributes: ['id', 'email', 'fullName'] },
        { model: Company, as: 'company', attributes: ['id', 'name', 'logo'] }
      ],
      order: [['createdAt', 'DESC']]
    });
    res.json(jobs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateJobStatus = async (req, res) => {
  try {
    const { status } = req.body; // 'active', 'closed', 'pending'
    const job = await Job.findByPk(req.params.id);
    if (!job) return res.status(404).json({ error: 'Không tìm thấy tin tuyển dụng' });
    job.status = status;
    await job.save();
    res.json({ message: `Đã cập nhật trạng thái thành "${status}"` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteJob = async (req, res) => {
  try {
    const job = await Job.findByPk(req.params.id);
    if (!job) return res.status(404).json({ error: 'Không tìm thấy tin tuyển dụng' });
    await job.destroy();
    res.json({ message: 'Đã xóa tin tuyển dụng' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ===== SKILL MANAGEMENT (existing) =====
exports.createSkill = async (req, res) => {
  try {
    const { name } = req.body;
    const skill = await Skill.create({ name });
    res.status(201).json(skill);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getAllSkills = async (req, res) => {
  try {
    const skills = await Skill.findAll();
    res.json(skills);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteSkill = async (req, res) => {
  try {
    const skill = await Skill.findByPk(req.params.id);
    if (!skill) return res.status(404).json({ error: 'Skill not found' });
    await skill.destroy();
    res.json({ message: 'Skill deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
