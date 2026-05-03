// Module: services/aiService.js - Quản lý logic hệ thống
const { GoogleGenerativeAI } = require('@google/generative-ai');
const dotenv = require('dotenv');

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Deep analyze a candidate profile against a job description.
 * @param {Object} job - Job object with title, description, skills
 * @param {Object} profile - Candidate profile object
 */
exports.analyzeMatch = async (job, profile) => {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    // Prepare job requirements text
    const jobSkills = job.Skills ? job.Skills.map(s => s.name).join(', ') : 'Không có';

    // Prepare candidate profile text
    const candidateSkills = profile.skills ? (typeof profile.skills === 'string' ? profile.skills : JSON.stringify(profile.skills)) : 'Không có';
    const experience = profile.experience ? (typeof profile.experience === 'string' ? profile.experience : JSON.stringify(profile.experience)) : 'Chưa cập nhật';

    const prompt = `
      Bạn là một chuyên gia tuyển dụng cao cấp. Hãy phân tích mức độ phù hợp giữa Ứng viên và Công việc dưới đây.

      THÔNG TIN CÔNG VIỆC:
      Tiêu đề: ${job.title}
      Mô tả: ${job.description}
      Yêu cầu kỹ năng: ${jobSkills}

      THÔNG TIN ỨNG VIÊN:
      Họ tên: ${profile.fullName}
      Vị trí hiện tại: ${profile.jobTitle}
      Kỹ năng: ${candidateSkills}
      Kinh nghiệm: ${experience}

      YÊU CẦU PHÂN TÍCH:
      1. Tính điểm phù hợp (score) từ 0 đến 100.
      2. Xếp loại ưu tiên (priority): "High", "Medium", hoặc "Low".
      3. Viết một bản tóm tắt ngắn gọn tại sao ứng viên này phù hợp (tối đa 2 câu).
      4. Đánh giá chi tiết theo 3 tiêu chí sau (điểm 0-10 và nhận xét ngắn):
         - Kỹ năng chuyên môn
         - Kinh nghiệm làm việc
         - Học vấn & Bằng cấp

      YÊU CẦU ĐỊNH DẠNG:
      Chỉ trả về DUY NHẤT một đối tượng JSON hợp lệ theo cấu trúc sau:
      {
        "score": 85,
        "priority": "High",
        "summary": "Tóm tắt của bạn ở đây...",
        "criteria": [
          { "name": "Kỹ năng chuyên môn", "score": 9, "comment": "..." },
          { "name": "Kinh nghiệm làm việc", "score": 8, "comment": "..." },
          { "name": "Học vấn & Bằng cấp", "score": 7, "comment": "..." }
        ]
      }
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Extract JSON from response (handling potential markdown blocks)
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('Could not parse JSON from Gemini response');

    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error('[AI SERVICE ERROR]', error.message);
    return {
      score: 0,
      priority: 'Low',
      summary: 'Lỗi khi phân tích bằng AI: ' + error.message,
      criteria: [
        { name: 'Kỹ năng chuyên môn', score: 0, comment: 'Lỗi' },
        { name: 'Kinh nghiệm làm việc', score: 0, comment: 'Lỗi' },
        { name: 'Học vấn & Bằng cấp', score: 0, comment: 'Lỗi' }
      ]
    };
  }
};

/**
 * Evaluate a CV and provide specific suggestions for improvement.
 * @param {Object} profile - Candidate profile object
 */
exports.evaluateCV = async (profile) => {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const prompt = `
      Bạn là một chuyên gia tư vấn nghề nghiệp. Hãy đánh giá CV sau và đưa ra các đề xuất chỉnh sửa cụ thể để hồ sơ trở nên chuyên nghiệp và thu hút nhà tuyển dụng hơn.

      HỌ TÊN: ${profile.fullName}
      VỊ TRÍ: ${profile.jobTitle}
      GIỚI THIỆU: ${profile.aboutMe}
      KỸ NĂNG: ${JSON.stringify(profile.skills)}
      KINH NGHIỆM: ${JSON.stringify(profile.experience)}
      HỌC VẤN: ${JSON.stringify(profile.education)}
      DỰ ÁN: ${JSON.stringify(profile.projects)}

      YÊU CẦU:
      1. Chấm điểm tổng quan (score) từ 0-100.
      2. Đưa ra nhận xét chung (summary) ngắn gọn (tối đa 3 câu).
      3. Liệt kê các đề xuất chỉnh sửa cụ thể (suggestions). Mỗi đề xuất bao gồm:
         - type: "fullName", "jobTitle", "aboutMe", "skills", "experience", "education", "projects"
         - current: đoạn văn bản hiện tại cần chú ý (hoặc để trống nếu là gợi ý thêm mới)
         - suggestion: văn bản gợi ý hoặc hành động cụ thể nên làm
         - reason: tại sao cần sửa như vậy (bằng tiếng Việt)

      YÊU CẦU ĐỊNH DẠNG:
      Chỉ trả về DUY NHẤT một đối tượng JSON hợp lệ theo cấu trúc sau:
      {
        "score": 75,
        "summary": "...",
        "suggestions": [
          { "type": "aboutMe", "current": "...", "suggestion": "...", "reason": "..." }
        ]
      }
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('Could not parse JSON from Gemini response');
    
    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error('[AI EVALUATE ERROR]', error.message);
    return {
      score: 0,
      summary: 'Không thể đánh giá CV vào lúc này: ' + error.message,
      suggestions: []
    };
  }
};

// Git update: Triggering change for push
