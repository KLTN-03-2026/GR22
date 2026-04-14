const { SmtpSettings } = require('../models');

exports.getSmtpSettings = async (req, res) => {
  try {
    const userId = req.user.id;
    let settings = await SmtpSettings.findOne({ where: { userId } });
    
    if (!settings) {
      // Return empty settings if not found
      return res.status(200).json({
        host: '',
        port: 587,
        secure: false,
        user: '',
        pass: '',
        fromName: '',
        fromEmail: '',
        templateTitle: 'Thông báo kết quả ứng tuyển',
        templateContent: 'Chào {{candidate_name}},\n\nChúng tôi rất vui mừng thông báo rằng bạn đã vượt qua vòng sơ loại cho vị trí {{job_title}}. Chúng tôi muốn mời bạn tham gia buổi phỏng vấn tiếp theo.\n\nTrân trọng,\n{{company_name}}'
      });
    }

    res.status(200).json(settings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateSmtpSettings = async (req, res) => {
  try {
    const userId = req.user.id;
    const { host, port, secure, user, pass, fromName, fromEmail, templateTitle, templateContent } = req.body;

    let settings = await SmtpSettings.findOne({ where: { userId } });

    if (settings) {
      await settings.update({ host, port, secure, user, pass, fromName, fromEmail, templateTitle, templateContent });
    } else {
      settings = await SmtpSettings.create({
        userId,
        host,
        port,
        secure,
        user,
        pass,
        fromName,
        fromEmail,
        templateTitle,
        templateContent
      });
    }

    res.status(200).json(settings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
