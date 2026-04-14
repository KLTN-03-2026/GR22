const { Company, Job, User } = require('../models');

// Public: list all companies
exports.getAllCompanies = async (req, res) => {
  try {
    const companiesRaw = await Company.findAll({ order: [['createdAt', 'DESC']] });
    const result = [];
    for (const c of companiesRaw) {
      const jobCount = await Job.count({ where: { recruiterId: c.recruiterId, status: 'active' } });
      result.push({ ...c.toJSON(), jobCount });
    }
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Public: get company by ID with its active jobs
exports.getCompanyById = async (req, res) => {
  try {
    const company = await Company.findByPk(req.params.id);
    if (!company) return res.status(404).json({ error: 'Company not found' });
    const jobs = await Job.findAll({ where: { recruiterId: company.recruiterId, status: 'active' }, order: [['createdAt', 'DESC']] });
    res.json({ ...company.toJSON(), jobs });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getCompany = async (req, res) => {
  try {
    const company = await Company.findOne({ where: { recruiterId: req.user.id } });
    if (!company) {
      return res.status(404).json({ error: 'Company profile not found' });
    }
    res.json(company);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateCompany = async (req, res) => {
  try {
    const { name, description, website, location, industry } = req.body;
    let logo = req.file ? `/uploads/${req.file.filename}` : undefined;

    let company = await Company.findOne({ where: { recruiterId: req.user.id } });

    if (company) {
      await company.update({
        name,
        description,
        website,
        location,
        industry,
        ...(logo && { logo })
      });
    } else {
      company = await Company.create({
        name,
        description,
        website,
        location,
        industry,
        logo,
        recruiterId: req.user.id
      });
    }

    res.json(company);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
