const { Sequelize, DataTypes } = require('sequelize');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const sequelize = process.env.DB_DIALECT === 'mysql' 
  ? new Sequelize(
      process.env.DB_NAME,
      process.env.DB_USER,
      process.env.DB_PASSWORD,
      {
        host: process.env.DB_HOST,
        dialect: 'mysql',
        logging: false,
      }
    )
  : new Sequelize({
      dialect: 'sqlite',
      storage: path.join(__dirname, '../database.sqlite'),
      logging: false,
    });

const User = sequelize.define('User', {
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  password: { type: DataTypes.STRING, allowNull: false },
  role: { type: DataTypes.ENUM('candidate', 'recruiter', 'admin'), defaultValue: 'candidate' },
  fullName: { type: DataTypes.STRING },
  phone: { type: DataTypes.STRING },
  address: { type: DataTypes.STRING },
  avatar: { type: DataTypes.STRING },
  dateOfBirth: { type: DataTypes.DATEONLY },
  gender: { type: DataTypes.STRING },
  resetPasswordToken: { type: DataTypes.STRING },
  resetPasswordExpires: { type: DataTypes.DATE },
});

const Profile = sequelize.define('Profile', {
  title: { type: DataTypes.STRING, defaultValue: 'CV Mới' },
  fullName: { type: DataTypes.STRING },
  jobTitle: { type: DataTypes.STRING },
  email: { type: DataTypes.STRING },
  phone: { type: DataTypes.STRING },
  location: { type: DataTypes.STRING },
  github: { type: DataTypes.STRING },
  aboutMe: { type: DataTypes.TEXT },
  skills: { type: DataTypes.JSON },
  experience: { type: DataTypes.JSON },
  education: { type: DataTypes.JSON },
  projects: { type: DataTypes.JSON },
  cvUrl: { type: DataTypes.STRING }
});

const Job = sequelize.define('Job', {
  title: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT },
  requirements: { type: DataTypes.TEXT },
  location: { type: DataTypes.STRING },
  salary: { type: DataTypes.STRING },
  type: { type: DataTypes.STRING }, // Full-time, Part-time, etc.
  status: { type: DataTypes.ENUM('active', 'closed', 'pending'), defaultValue: 'pending' },
  recruiterId: { type: DataTypes.INTEGER }
});

const Skill = sequelize.define('Skill', {
  name: { type: DataTypes.STRING, allowNull: false, unique: true }
});

const Company = sequelize.define('Company', {
  name: { type: DataTypes.STRING, allowNull: false },
  logo: { type: DataTypes.STRING },
  description: { type: DataTypes.TEXT },
  website: { type: DataTypes.STRING },
  location: { type: DataTypes.STRING },
  industry: { type: DataTypes.STRING }
});

const Application = sequelize.define('Application', {
  status: { type: DataTypes.ENUM('pending', 'reviewed', 'accepted', 'rejected'), defaultValue: 'pending' },
  matchScore: { type: DataTypes.FLOAT },
  aiFeedback: { type: DataTypes.TEXT },
  priority: { type: DataTypes.ENUM('High', 'Medium', 'Low'), defaultValue: 'Low' },
  analysisDetails: { type: DataTypes.JSON },
  profileId: { type: DataTypes.INTEGER, allowNull: false }
});

const SmtpSettings = sequelize.define('SmtpSettings', {
  host: { type: DataTypes.STRING },
  port: { type: DataTypes.INTEGER },
  secure: { type: DataTypes.BOOLEAN, defaultValue: false },
  user: { type: DataTypes.STRING },
  pass: { type: DataTypes.STRING },
  fromName: { type: DataTypes.STRING },
  fromEmail: { type: DataTypes.STRING },
  templateTitle: { type: DataTypes.STRING, defaultValue: 'Thông báo kết quả ứng tuyển' },
  templateContent: { type: DataTypes.TEXT }
});

const Banner = sequelize.define('Banner', {
  title: { type: DataTypes.STRING, allowNull: false },
  imageUrl: { type: DataTypes.STRING, allowNull: false },
  link: { type: DataTypes.STRING },
  status: { type: DataTypes.ENUM('active', 'inactive'), defaultValue: 'active' },
  order: { type: DataTypes.INTEGER, defaultValue: 0 }
});

const CVEvaluation = sequelize.define('CVEvaluation', {
  score: { type: DataTypes.INTEGER },
  summary: { type: DataTypes.TEXT },
  suggestions: { type: DataTypes.JSON },
  profileId: { type: DataTypes.INTEGER, allowNull: false },
  userId: { type: DataTypes.INTEGER, allowNull: false }
});

// Relationships
User.hasMany(Profile, { foreignKey: 'userId', as: 'cvs', onDelete: 'CASCADE' });
Profile.belongsTo(User, { foreignKey: 'userId' });

User.hasOne(Company, { foreignKey: 'recruiterId', as: 'company', onDelete: 'CASCADE' });
Company.belongsTo(User, { foreignKey: 'recruiterId' });

User.hasOne(SmtpSettings, { foreignKey: 'userId', as: 'smtpSettings', onDelete: 'CASCADE' });
SmtpSettings.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(Job, { foreignKey: 'recruiterId', as: 'postedJobs' });
Job.belongsTo(User, { foreignKey: 'recruiterId', as: 'recruiter' });

// Job & Skills Many-to-Many
Job.belongsToMany(Skill, { through: 'JobSkills' });
Skill.belongsToMany(Job, { through: 'JobSkills' });

Job.belongsTo(Company, { foreignKey: 'recruiterId', targetKey: 'recruiterId', as: 'company' });

Job.hasMany(Application, { foreignKey: 'jobId' });
Application.belongsTo(Job, { foreignKey: 'jobId' });

User.hasMany(Application, { foreignKey: 'candidateId', as: 'applications' });
Application.belongsTo(User, { foreignKey: 'candidateId', as: 'candidate' });

Profile.hasMany(Application, { foreignKey: 'profileId' });
Application.belongsTo(Profile, { foreignKey: 'profileId' });

User.hasMany(CVEvaluation, { foreignKey: 'userId', as: 'evaluations', onDelete: 'CASCADE' });
CVEvaluation.belongsTo(User, { foreignKey: 'userId' });

Profile.hasMany(CVEvaluation, { foreignKey: 'profileId', as: 'evaluations', onDelete: 'CASCADE' });
CVEvaluation.belongsTo(Profile, { foreignKey: 'profileId' });

module.exports = { sequelize, User, Profile, Job, Application, Skill, Company, SmtpSettings, CVEvaluation, Banner };
