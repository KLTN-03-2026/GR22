const bcrypt = require('bcryptjs');
const { sequelize, User, Company, Job, Skill } = require('./models');

const recruiterData = [
  { name: 'FPT Software', industry: 'Công nghệ thông tin', email: 'hr@fpt-software.com' },
  { name: 'Viettel Group', industry: 'Viễn thông', email: 'hr@viettel.com.vn' },
  { name: 'VNG Corporation', industry: 'Internet & Gaming', email: 'jobs@vng.com.vn' },
  { name: 'Tiki.vn', industry: 'E-commerce', email: 'tiki-hr@tiki.vn' },
  { name: 'Momo (M-Service)', industry: 'Fintech', email: 'recruitment@momo.vn' },
  { name: 'Shopee Vietnam', industry: 'E-commerce', email: 'hr@shopee.vn' },
  { name: 'Grab Vietnam', industry: 'Tech & Transport', email: 'hr@grab.com' },
  { name: 'NashTech Vietnam', industry: 'Software Outsourcing', email: 'hr@nashtechglobal.com' },
  { name: 'KMS Technology', industry: 'Software Services', email: 'hr@kms-technology.com' },
  { name: 'Axon Active Vietnam', industry: 'Software Development', email: 'hr@axonactive.com' },
  { name: 'TMA Solutions', industry: 'Software Outsourcing', email: 'hr@tma.com.vn' },
  { name: 'CMC Technology', industry: 'System Integration', email: 'hr@cmc.com.vn' },
  { name: 'Techcombank Digital', industry: 'Banking', email: 'recruitment@techcombank.com.vn' },
  { name: 'VNPay', industry: 'Fintech', email: 'hr@vnpay.vn' },
  { name: 'ZaloPay', industry: 'Fintech', email: 'hr@zalopay.vn' },
  { name: 'NAB Innovation Centre', industry: 'Banking Tech', email: 'hr@nab.com.au' },
  { name: 'VinAI Research', industry: 'Artificial Intelligence', email: 'hr@vinai.io' },
  { name: 'Sun* Inc', industry: 'Startup Studio', email: 'hr@sun-asterisk.com' },
  { name: 'Bosch Global Software', industry: 'Automotive & Tech', email: 'hr@bosch.com' },
  { name: 'Renesas Design Vietnam', industry: 'Semiconductors', email: 'hr@renesas.com' },
];

const jobData = [
  { title: 'Fullstack Developer (React & Node.js)', salary: '20M - 45M', location: 'TP. HCM', type: 'Full-time' },
  { title: 'Senior Java Backend Engineer', salary: '30M - 60M', location: 'Hà Nội', type: 'Full-time' },
  { title: 'Python AI/ML Engineer', salary: '25M - 55M', location: 'Hà Nội', type: 'Full-time' },
  { title: 'Mobile App Developer (Flutter)', salary: '18M - 40M', location: 'Đà Nẵng', type: 'Full-time' },
  { title: 'DevOps Cloud Engineer (AWS)', salary: '35M - 70M', location: 'TP. HCM', type: 'Full-time' },
  { title: 'Automation QA Tester', salary: '15M - 35M', location: 'TP. HCM', type: 'Full-time' },
  { title: 'Cybersecurity Specialist', salary: '40M - 80M', location: 'Hà Nội', type: 'Full-time' },
  { title: 'Data Analyst (SQL/Python)', salary: '20M - 40M', location: 'TP. HCM', type: 'Full-time' },
  { title: 'Frontend Vue.js Developer', salary: '18M - 38M', location: 'Đà Nẵng', type: 'Full-time' },
  { title: 'UI/UX Product Designer', salary: '22M - 48M', location: 'TP. HCM', type: 'Full-time' },
];

const seed = async () => {
  try {
    const password = await bcrypt.hash('123456', 10);
    
    console.log('Seeding recruiters and companies...');
    for (const rec of recruiterData) {
      const [user] = await User.findOrCreate({
        where: { email: rec.email },
        defaults: {
          password,
          role: 'recruiter',
          fullName: `HR Manager at ${rec.name}`,
          phone: '0123456789',
          address: 'Vietnam'
        }
      });

      await Company.findOrCreate({
        where: { recruiterId: user.id },
        defaults: {
          name: rec.name,
          industry: rec.industry,
          location: 'Vietnam',
          description: `Leading company in ${rec.industry} sector.`,
          website: `https://www.${rec.name.toLowerCase().replace(/[^a-z]/g, '')}.com`
        }
      });
    }

    console.log('Seeding IT jobs...');
    // Fetch all recruiters to distribute jobs
    const recruiters = await User.findAll({ where: { role: 'recruiter' } });
    
    for (let i = 0; i < jobData.length; i++) {
        const recruiter = recruiters[i % recruiters.length];
        await Job.create({
            ...jobData[i],
            description: `We are looking for a talented ${jobData[i].title} to join our dynamic team at ${recruiter.fullName}.`,
            requirements: 'Bachelor degree in IT, 2+ years experience, good teamwork skills.',
            status: 'active',
            recruiterId: recruiter.id
        });
    }

    console.log('Seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seed();
