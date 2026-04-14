import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useCV, useCreateCV, useUpdateCV, useExtractCV, useEvaluateCV, useEvaluationHistory } from '../hooks/useCV';
import { Upload, FileText, Sparkles, Loader2, Save, Plus, Trash2, ArrowLeft, User, Briefcase, GraduationCap, Zap, Star, AlertCircle, Clock, X, ChevronRight, Target } from 'lucide-react';
import * as z from 'zod';
import toast from 'react-hot-toast';

// ============ Zod Schema ============
const experienceSchema = z.object({
  position: z.string().min(1, 'Vị trí không được để trống'),
  company: z.string().min(1, 'Công ty không được để trống'),
  time: z.string().min(1, 'Thời gian không được để trống'),
  description: z.string().optional(),
  technical: z.string().optional(),
});

const educationSchema = z.object({
  school: z.string().min(1, 'Trường không được để trống'),
  degree: z.string().min(1, 'Bằng cấp không được để trống'),
  time: z.string().min(1, 'Thời gian không được để trống'),
});

const projectSchema = z.object({
  name: z.string().min(1, 'Tên dự án không được để trống'),
  description: z.string().optional(),
  tech_stack: z.any().optional(),
});

const cvSchema = z.object({
  title: z.string().min(1, 'Tên CV không được để trống'),
  fullName: z.string().min(2, 'Họ tên phải có ít nhất 2 ký tự'),
  jobTitle: z.string().min(1, 'Vị trí ứng tuyển không được để trống'),
  email: z.string().email('Email không hợp lệ'),
  phone: z.string()
    .min(1, 'Số điện thoại không được để trống')
    .regex(/^(0[3|5|7|8|9])+([0-9]{8})$/, 'SĐT phải theo định dạng Việt Nam (VD: 0912345678)'),
  location: z.string().optional(),
  github: z.string().optional(),
  aboutMe: z.string().optional(),
  experience: z.array(experienceSchema).optional(),
  education: z.array(educationSchema).optional(),
  projects: z.array(projectSchema).optional(),
  skills: z.any().optional(),
});

// ============ Helpers ============
const safeArray = (val) => {
  if (Array.isArray(val)) return val;
  if (typeof val === 'string') { try { const p = JSON.parse(val); return Array.isArray(p) ? p : []; } catch { return []; } }
  return [];
};
const safeObj = (val) => {
  if (val && typeof val === 'object' && !Array.isArray(val)) return val;
  if (typeof val === 'string') { try { const p = JSON.parse(val); return (p && typeof p === 'object' && !Array.isArray(p)) ? p : {}; } catch { return {}; } }
  return {};
};

const emptyForm = { title: '', fullName: '', jobTitle: '', email: '', phone: '', location: '', github: '', aboutMe: '', experience: [], education: [], projects: [], skills: {} };

// ============ Error Display ============
const FieldError = ({ message }) => {
  if (!message) return null;
  return <p className="text-red-500 text-xs font-bold mt-1.5 ml-2 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" /> {message}</p>;
};

// ============ Component ============
const CVEditor = () => {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();
  const { data: existingCV, isLoading: loadingCV } = useCV(id);
  const createMutation = useCreateCV();
  const updateMutation = useUpdateCV();
  const extractMutation = useExtractCV();
  const evaluateMutation = useEvaluateCV();
  const { data: history, refetch: refetchHistory } = useEvaluationHistory(id);

  const [formData, setFormData] = useState({ ...emptyForm });
  const [errors, setErrors] = useState({});
  const [file, setFile] = useState(null);
  const [skillInput, setSkillInput] = useState({ category: '', value: '' });
  const [evaluation, setEvaluation] = useState(null);
  const [showEvaluation, setShowEvaluation] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    if (existingCV && isEdit) {
      setFormData({
        title: existingCV.title || '',
        fullName: existingCV.fullName || '',
        jobTitle: existingCV.jobTitle || '',
        email: existingCV.email || '',
        phone: existingCV.phone || '',
        location: existingCV.location || '',
        github: existingCV.github || '',
        aboutMe: existingCV.aboutMe || '',
        experience: safeArray(existingCV.experience),
        education: safeArray(existingCV.education),
        projects: safeArray(existingCV.projects),
        skills: safeObj(existingCV.skills),
      });
    }
  }, [existingCV, isEdit]);

  // Clear specific field error on change
  const setField = (field, value) => {
    setFormData(p => ({ ...p, [field]: value }));
    if (errors[field]) setErrors(e => { const n = { ...e }; delete n[field]; return n; });
  };

  // PDF Upload & Auto-fill
  const handleExtract = async () => {
    if (!file) return;
    try {
      const data = await extractMutation.mutateAsync(file);
      setFormData(prev => ({
        ...prev,
        fullName: data.full_name || prev.fullName,
        jobTitle: data.job_title || prev.jobTitle,
        email: data.email || prev.email,
        phone: data.phone || prev.phone,
        location: data.location || prev.location,
        github: data.github || prev.github,
        aboutMe: data.about_me || prev.aboutMe,
        skills: data.skills && Object.keys(data.skills).length > 0 ? data.skills : prev.skills,
        experience: data.experience?.length > 0 ? data.experience : prev.experience,
        education: data.education?.length > 0 ? data.education.map(e => ({ school: e.university || e.school || '', degree: e.degree || '', time: e.time || '' })) : prev.education,
        projects: data.projects?.length > 0 ? data.projects : prev.projects,
      }));
      setErrors({});
      setFile(null);
      toast.success('Đã trích xuất dữ liệu từ CV!', { icon: '🎯', style: { borderRadius: '1.5rem', background: '#0F172A', color: '#fff', padding: '1.5rem', fontWeight: 'bold' } });
    } catch (err) {
      toast.error('Trích xuất thất bại. Đảm bảo api_cv đang chạy.');
    }
  };

  const handleEvaluate = async () => {
    try {
      const data = await evaluateMutation.mutateAsync({ profileId: id, ...formData });
      setEvaluation(data);
      setShowEvaluation(true);
      if (id) refetchHistory();
      toast.success('Đã hoàn thành đánh giá CV!', { icon: '🤖' });
    } catch (err) {
      toast.error('Đánh giá thất bại.');
    }
  };

  const scrollToSection = (type) => {
    const el = document.getElementById(`section-${type}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      el.classList.add('ring-4', 'ring-primary/20', 'duration-1000');
      setTimeout(() => el.classList.remove('ring-4', 'ring-primary/20'), 3000);
    }
  };

  // Validate & Save
  const handleSave = async () => {
    const result = cvSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors = {};
      result.error.issues.forEach(issue => {
        const path = issue.path.join('.');
        fieldErrors[path] = issue.message;
      });
      setErrors(fieldErrors);
      toast.error('Vui lòng kiểm tra lại các trường bắt buộc', { icon: '⚠️', style: { borderRadius: '1.5rem', background: '#0F172A', color: '#fff', fontWeight: 'bold' } });
      // Scroll to first error
      const firstErrorEl = document.querySelector('[data-error="true"]');
      if (firstErrorEl) firstErrorEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    try {
      if (isEdit) {
        await updateMutation.mutateAsync({ id, ...formData });
      } else {
        await createMutation.mutateAsync(formData);
      }
      toast.success(isEdit ? 'Cập nhật CV thành công!' : 'Tạo CV mới thành công!', { icon: '✅', style: { borderRadius: '1.5rem', background: '#0F172A', color: '#fff', padding: '1.5rem', fontWeight: 'bold' } });
      navigate('/candidate/cv');
    } catch (err) {
      toast.error('Không thể lưu CV');
    }
  };

  // Dynamic array helpers
  const addItem = (key, template) => setFormData(p => ({ ...p, [key]: [...(p[key] || []), template] }));
  const removeItem = (key, idx) => {
    setFormData(p => ({ ...p, [key]: (p[key] || []).filter((_, i) => i !== idx) }));
    // Clear related errors
    setErrors(prev => {
      const n = { ...prev };
      Object.keys(n).forEach(k => { if (k.startsWith(`${key}.`)) delete n[k]; });
      return n;
    });
  };
  const updateItem = (key, idx, field, value) => {
    setFormData(p => { const arr = [...(p[key] || [])]; arr[idx] = { ...arr[idx], [field]: value }; return { ...p, [key]: arr }; });
    const errorKey = `${key}.${idx}.${field}`;
    if (errors[errorKey]) setErrors(e => { const n = { ...e }; delete n[errorKey]; return n; });
  };

  const addSkill = () => {
    if (!skillInput.category || !skillInput.value) return;
    setFormData(prev => {
      const skills = { ...(prev.skills || {}) };
      const existing = skills[skillInput.category];
      skills[skillInput.category] = Array.isArray(existing) ? [...existing, skillInput.value] : [skillInput.value];
      return { ...prev, skills };
    });
    setSkillInput(p => ({ ...p, value: '' }));
  };

  const removeSkill = (cat, idx) => {
    setFormData(prev => {
      const skills = { ...(prev.skills || {}) };
      if (Array.isArray(skills[cat])) {
        skills[cat] = skills[cat].filter((_, i) => i !== idx);
        if (skills[cat].length === 0) delete skills[cat];
      }
      return { ...prev, skills };
    });
  };

  if (isEdit && loadingCV) return <div className="flex justify-center p-20"><Loader2 className="animate-spin w-12 h-12 text-primary" /></div>;

  const inputClass = (errorKey) => `w-full px-6 py-4 rounded-[1.5rem] bg-slate-50 border-2 transition-all outline-none font-bold text-base focus:bg-white ${errors[errorKey] ? 'border-red-300 bg-red-50/30 focus:border-red-400' : 'border-transparent focus:border-primary/20'}`;

  const hasErrors = Object.keys(errors).length > 0;

  return (
    <div className="w-full space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/candidate/cv')} className="p-3 bg-white border border-slate-100 rounded-2xl hover:bg-slate-50 transition-all text-slate-400 hover:text-primary">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div>
          <h2 className="text-4xl font-black text-primary-dark tracking-tighter">{isEdit ? 'Chỉnh sửa CV' : 'Tạo CV Mới'}</h2>
          <p className="text-slate-500 font-bold mt-1 uppercase text-[10px] tracking-widest">Điền thông tin hoặc upload PDF để AI tự điền</p>
        </div>
      </div>

      {/* Global Error Banner */}
      {hasErrors && (
        <div className="bg-red-50 border-2 border-red-200 rounded-[2rem] p-6 flex items-center gap-4 animate-in fade-in slide-in-from-top-4 duration-300">
          <AlertCircle className="w-6 h-6 text-red-500 shrink-0" />
          <p className="text-red-600 font-bold text-sm">Vui lòng kiểm tra và điền đầy đủ các trường bắt buộc được đánh dấu <span className="text-red-500">*</span></p>
        </div>
      )}

      {/* AI Evaluation Sidebar */}
      <div className={`fixed top-0 right-0 h-screen w-[450px] bg-white shadow-[-20px_0_50px_rgba(0,0,0,0.05)] border-l border-slate-100 z-50 transition-transform duration-500 ease-out overflow-y-auto ${showEvaluation ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="p-10 space-y-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-primary/10 rounded-2xl text-primary"><Sparkles className="w-6 h-6" /></div>
              <h3 className="text-2xl font-black text-primary-dark tracking-tighter">AI Phân tích</h3>
            </div>
            <button onClick={() => setShowEvaluation(false)} className="p-3 hover:bg-slate-100 rounded-2xl transition-all text-slate-400"><X className="w-6 h-6" /></button>
          </div>

          {evaluation && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="bg-slate-50 p-8 rounded-[2.5rem] relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16"></div>
                <div className="relative z-10 flex items-end justify-between">
                  <div>
                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Điểm đánh giá</p>
                    <div className="text-6xl font-black text-primary tracking-tighter">{evaluation.score}</div>
                  </div>
                  <div className="text-right">
                    <p className="text-slate-600 font-bold text-sm">Chất lượng {evaluation.score > 80 ? 'Rất tốt' : evaluation.score > 60 ? 'Khá' : 'Trung bình'}</p>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-white border-2 border-slate-100 rounded-[2rem] italic font-bold text-slate-500 text-sm leading-relaxed">
                "{evaluation.summary}"
              </div>

              <div className="space-y-4">
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest ml-4">Gợi ý chỉnh sửa ({safeArray(evaluation.suggestions).length})</h4>
                <div className="space-y-4">
                  {safeArray(evaluation.suggestions).map((item, idx) => (
                    <div key={idx} onClick={() => scrollToSection(item.type)} 
                      className="p-6 bg-white rounded-[2rem] border border-slate-100 hover:border-primary/20 hover:shadow-xl hover:shadow-primary/5 transition-all group cursor-pointer space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] font-black text-primary uppercase tracking-widest px-3 py-1 bg-primary/5 rounded-full">{item.type}</span>
                        <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                      </div>
                      <p className="text-slate-900 font-black text-base leading-tight">👉 {item.suggestion}</p>
                      <p className="text-slate-500 text-xs font-bold leading-relaxed">{item.reason}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* History Modal */}
      {showHistory && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[60] flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-2xl rounded-[3.5rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300">
            <div className="p-10 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-4 bg-slate-50 rounded-3xl text-slate-400"><Clock className="w-6 h-6" /></div>
                <div>
                  <h3 className="text-3xl font-black text-primary-dark tracking-tighter">Lịch sử đánh giá</h3>
                  <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mt-1">10 lần đánh giá gần nhất</p>
                </div>
              </div>
              <button onClick={() => setShowHistory(false)} className="p-4 hover:bg-slate-100 rounded-3xl transition-all text-slate-400"><X className="w-7 h-7" /></button>
            </div>
            <div className="p-10 max-h-[60vh] overflow-y-auto space-y-6">
              {history?.length > 0 ? history.map((h, i) => (
                <div key={i} className="flex gap-6 p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100 hover:bg-white hover:border-primary/20 transition-all group cursor-pointer"
                  onClick={() => { 
                    setEvaluation({ ...h, suggestions: safeArray(h.suggestions) }); 
                    setShowEvaluation(true); 
                    setShowHistory(false); 
                  }}>
                  <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center text-primary font-black text-2xl shadow-sm border border-slate-100 group-hover:border-primary/20 transition-all">{h.score}</div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-black text-slate-400 uppercase tracking-widest">{new Date(h.createdAt).toLocaleString('vi-VN')}</p>
                      <Sparkles className="w-4 h-4 text-primary opacity-0 group-hover:opacity-100 transition-all" />
                    </div>
                    <p className="text-slate-600 font-bold text-sm line-clamp-2 italic">"{h.summary}"</p>
                  </div>
                </div>
              )) : (
                <div className="py-20 text-center space-y-4">
                  <div className="w-20 h-20 bg-slate-50 rounded-[2rem] flex items-center justify-center mx-auto text-slate-200"><AlertCircle className="w-10 h-10" /></div>
                  <p className="text-slate-400 font-bold">Chưa có dữ liệu đánh giá lịch sử.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Upload PDF Section */}
      <div className="bg-primary p-10 rounded-[3rem] text-white relative overflow-hidden">
        <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-white/5 rounded-full"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-5">
            <div className="w-14 h-14 bg-white/10 rounded-[1.5rem] flex items-center justify-center"><Upload className="w-7 h-7" /></div>
            <div>
              <h3 className="text-2xl font-black tracking-tighter">Upload PDF để tự điền</h3>
              <p className="text-white/60 font-bold text-xs">AI sẽ trích xuất thông tin và tự động điền vào form bên dưới</p>
            </div>
          </div>
          <div className="flex gap-3">
            <input type="file" className="hidden" id="cv-pdf" onChange={(e) => setFile(e.target.files[0])} accept=".pdf" />
            <label htmlFor="cv-pdf" className="flex-1 text-center py-5 rounded-[1.5rem] border-2 border-dashed border-white/20 hover:border-white/50 cursor-pointer transition-all font-black hover:bg-white/5">
              {file ? <span className="flex items-center justify-center gap-2"><FileText className="w-5 h-5" /> {file.name}</span> : 'Chọn file PDF'}
            </label>
            {file && (
              <button onClick={handleExtract} disabled={extractMutation.isPending} className="bg-white text-primary px-8 rounded-[1.5rem] font-black hover:scale-105 transition-all disabled:opacity-50 flex items-center gap-2">
                {extractMutation.isPending ? <Loader2 className="animate-spin w-5 h-5" /> : <Sparkles className="w-5 h-5" />}
                {extractMutation.isPending ? 'Đang xử lý...' : 'Trích xuất'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="space-y-8">
        {/* Title */}
        <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-slate-100 space-y-6" id="section-title" data-error={!!errors.title}>
          <h3 className="text-2xl font-black text-primary-dark flex items-center gap-3">
            <span className="p-3 bg-primary/10 rounded-2xl"><FileText className="text-primary w-6 h-6" /></span>
            Tên CV <span className="text-red-400 text-lg">*</span>
          </h3>
          <div>
            <input value={formData.title} onChange={e => setField('title', e.target.value)} className={inputClass('title')} placeholder="VD: CV Frontend Developer 2024" />
            <FieldError message={errors.title} />
          </div>
        </div>

        {/* Basic Info */}
        <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-slate-100 space-y-6" data-error={!!(errors.fullName || errors.jobTitle || errors.email || errors.phone)}>
          <h3 className="text-2xl font-black text-primary-dark flex items-center gap-3">
            <span className="p-3 bg-primary/10 rounded-2xl"><User className="text-primary w-6 h-6" /></span>
            Thông tin Cơ bản
          </h3>
          <div className="grid md:grid-cols-2 gap-6" id="section-basicInfo">
            <div id="section-fullName">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-2 mb-2 block">Họ tên <span className="text-red-400">*</span></label>
              <input value={formData.fullName} onChange={e => setField('fullName', e.target.value)} className={inputClass('fullName')} placeholder="Nguyễn Văn A" />
              <FieldError message={errors.fullName} />
            </div>
            <div id="section-jobTitle">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-2 mb-2 block">Vị trí Ứng tuyển <span className="text-red-400">*</span></label>
              <input value={formData.jobTitle} onChange={e => setField('jobTitle', e.target.value)} className={inputClass('jobTitle')} placeholder="Frontend Developer" />
              <FieldError message={errors.jobTitle} />
            </div>
            <div>
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-2 mb-2 block">Email <span className="text-red-400">*</span></label>
              <input value={formData.email} onChange={e => setField('email', e.target.value)} className={inputClass('email')} placeholder="email@example.com" />
              <FieldError message={errors.email} />
            </div>
            <div>
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-2 mb-2 block">Số điện thoại <span className="text-red-400">*</span></label>
              <input value={formData.phone} onChange={e => setField('phone', e.target.value)} className={inputClass('phone')} placeholder="0901 234 567" />
              <FieldError message={errors.phone} />
            </div>
            <div>
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-2 mb-2 block">Địa điểm</label>
              <input value={formData.location} onChange={e => setField('location', e.target.value)} className={inputClass('location')} placeholder="Hà Nội" />
            </div>
            <div>
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-2 mb-2 block">GitHub</label>
              <input value={formData.github} onChange={e => setField('github', e.target.value)} className={inputClass('github')} placeholder="https://github.com/user" />
            </div>
          </div>
          <div id="section-aboutMe">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-2 mb-2 block">Giới thiệu</label>
            <textarea value={formData.aboutMe} onChange={e => setField('aboutMe', e.target.value)} className={`${inputClass('aboutMe')} h-32 resize-none`} placeholder="Chia sẻ về bạn..." />
          </div>
        </div>

        {/* Experience */}
        <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-slate-100 space-y-6" id="section-experience">
          <div className="flex justify-between items-center">
            <h3 className="text-2xl font-black text-primary-dark flex items-center gap-3"><span className="p-3 bg-primary/10 rounded-2xl"><Briefcase className="text-primary w-6 h-6" /></span>Kinh nghiệm</h3>
            <button type="button" onClick={() => addItem('experience', { position: '', company: '', time: '', description: '', technical: '' })} className="bg-primary/10 text-primary px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-primary hover:text-white transition-all flex items-center gap-2"><Plus className="w-4 h-4" /> Thêm</button>
          </div>
          {(formData?.experience || []).map((exp, i) => (
            <div key={i} className="bg-slate-50 p-8 rounded-[2rem] space-y-4 relative group">
              <button type="button" onClick={() => removeItem('experience', i)} className="absolute top-4 right-4 p-2 bg-red-50 text-red-400 rounded-xl hover:bg-red-100 hover:text-red-600 transition-all opacity-0 group-hover:opacity-100"><Trash2 className="w-4 h-4" /></button>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <input value={exp.position || ''} onChange={e => updateItem('experience', i, 'position', e.target.value)} className={inputClass(`experience.${i}.position`)} placeholder="Vị trí *" />
                  <FieldError message={errors[`experience.${i}.position`]} />
                </div>
                <div>
                  <input value={exp.company || ''} onChange={e => updateItem('experience', i, 'company', e.target.value)} className={inputClass(`experience.${i}.company`)} placeholder="Công ty *" />
                  <FieldError message={errors[`experience.${i}.company`]} />
                </div>
                <div>
                  <input value={exp.time || ''} onChange={e => updateItem('experience', i, 'time', e.target.value)} className={inputClass(`experience.${i}.time`)} placeholder="Thời gian *" />
                  <FieldError message={errors[`experience.${i}.time`]} />
                </div>
                <div>
                  <input value={exp.technical || ''} onChange={e => updateItem('experience', i, 'technical', e.target.value)} className={inputClass(`experience.${i}.technical`)} placeholder="Công nghệ" />
                </div>
              </div>
              <textarea value={exp.description || ''} onChange={e => updateItem('experience', i, 'description', e.target.value)} className={`${inputClass(`experience.${i}.description`)} h-24 resize-none`} placeholder="Mô tả công việc..." />
            </div>
          ))}
          {(!formData?.experience || formData.experience.length === 0) && <p className="text-slate-400 italic font-medium text-center py-6">Nhấn "Thêm" để thêm kinh nghiệm</p>}
        </div>

        {/* Education */}
        <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-slate-100 space-y-6" id="section-education">
          <div className="flex justify-between items-center">
            <h3 className="text-2xl font-black text-primary-dark flex items-center gap-3"><span className="p-3 bg-blue-100 rounded-2xl"><GraduationCap className="text-blue-600 w-6 h-6" /></span>Học vấn</h3>
            <button type="button" onClick={() => addItem('education', { school: '', degree: '', time: '' })} className="bg-blue-50 text-blue-600 px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all flex items-center gap-2"><Plus className="w-4 h-4" /> Thêm</button>
          </div>
          {(formData?.education || []).map((edu, i) => (
            <div key={i} className="bg-slate-50 p-8 rounded-[2rem] relative group">
              <button type="button" onClick={() => removeItem('education', i)} className="absolute top-4 right-4 p-2 bg-red-50 text-red-400 rounded-xl hover:bg-red-100 hover:text-red-600 transition-all opacity-0 group-hover:opacity-100"><Trash2 className="w-4 h-4" /></button>
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <input value={edu.school || ''} onChange={e => updateItem('education', i, 'school', e.target.value)} className={inputClass(`education.${i}.school`)} placeholder="Trường *" />
                  <FieldError message={errors[`education.${i}.school`]} />
                </div>
                <div>
                  <input value={edu.degree || ''} onChange={e => updateItem('education', i, 'degree', e.target.value)} className={inputClass(`education.${i}.degree`)} placeholder="Bằng cấp *" />
                  <FieldError message={errors[`education.${i}.degree`]} />
                </div>
                <div>
                  <input value={edu.time || ''} onChange={e => updateItem('education', i, 'time', e.target.value)} className={inputClass(`education.${i}.time`)} placeholder="Thời gian *" />
                  <FieldError message={errors[`education.${i}.time`]} />
                </div>
              </div>
            </div>
          ))}
          {(!formData?.education || formData.education.length === 0) && <p className="text-slate-400 italic font-medium text-center py-6">Nhấn "Thêm" để thêm học vấn</p>}
        </div>

        {/* Projects */}
        <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-slate-100 space-y-6" id="section-projects">
          <div className="flex justify-between items-center">
            <h3 className="text-2xl font-black text-primary-dark flex items-center gap-3"><span className="p-3 bg-accent/10 rounded-2xl"><Zap className="text-accent w-6 h-6" /></span>Dự án</h3>
            <button type="button" onClick={() => addItem('projects', { name: '', description: '', tech_stack: [] })} className="bg-accent/10 text-accent px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-accent hover:text-white transition-all flex items-center gap-2"><Plus className="w-4 h-4" /> Thêm</button>
          </div>
          {(formData?.projects || []).map((proj, i) => (
            <div key={i} className="bg-slate-50 p-8 rounded-[2rem] space-y-4 relative group">
              <button type="button" onClick={() => removeItem('projects', i)} className="absolute top-4 right-4 p-2 bg-red-50 text-red-400 rounded-xl hover:bg-red-100 hover:text-red-600 transition-all opacity-0 group-hover:opacity-100"><Trash2 className="w-4 h-4" /></button>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <input value={proj.name || ''} onChange={e => updateItem('projects', i, 'name', e.target.value)} className={inputClass(`projects.${i}.name`)} placeholder="Tên dự án *" />
                  <FieldError message={errors[`projects.${i}.name`]} />
                </div>
                <div>
                  <input value={Array.isArray(proj.tech_stack) ? proj.tech_stack.join(', ') : ''} onChange={e => updateItem('projects', i, 'tech_stack', e.target.value.split(',').map(s => s.trim()).filter(Boolean))} className={inputClass(`projects.${i}.tech_stack`)} placeholder="Công nghệ (dấu phẩy)" />
                </div>
              </div>
              <textarea value={proj.description || ''} onChange={e => updateItem('projects', i, 'description', e.target.value)} className={`${inputClass(`projects.${i}.description`)} h-24 resize-none`} placeholder="Mô tả dự án..." />
            </div>
          ))}
          {(!formData?.projects || formData.projects.length === 0) && <p className="text-slate-400 italic font-medium text-center py-6">Nhấn "Thêm" để thêm dự án</p>}
        </div>

        {/* Skills */}
        <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-slate-100 space-y-6" id="section-skills">
          <h3 className="text-2xl font-black text-primary-dark flex items-center gap-3"><span className="p-3 bg-primary/10 rounded-2xl"><Star className="text-primary w-6 h-6" /></span>Kỹ năng</h3>
          <div className="flex gap-3">
            <input value={skillInput.category} onChange={e => setSkillInput(p => ({ ...p, category: e.target.value }))} className={`${inputClass('_skill_cat')} flex-1`} placeholder="Danh mục (VD: Frontend)" />
            <input value={skillInput.value} onChange={e => setSkillInput(p => ({ ...p, value: e.target.value }))} className={`${inputClass('_skill_val')} flex-1`} placeholder="Kỹ năng (VD: React)"
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addSkill(); } }} />
            <button type="button" onClick={addSkill} className="bg-primary text-white px-6 rounded-[1.5rem] font-black hover:scale-105 transition-all shrink-0"><Plus className="w-5 h-5" /></button>
          </div>
          {Object.keys(formData?.skills || {}).length > 0 && (
            <div className="space-y-4">
              {Object.entries(formData.skills || {}).map(([cat, items]) => (
                <div key={cat}>
                  <h5 className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2">{cat}</h5>
                  <div className="flex flex-wrap gap-2">
                    {Array.isArray(items) ? items.map((item, j) => (
                      <span key={j} className="bg-primary/5 text-primary px-4 py-2 rounded-xl text-sm font-bold border border-primary/10 flex items-center gap-2 group">
                        {item}
                        <button type="button" onClick={() => removeSkill(cat, j)} className="text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-all"><Trash2 className="w-3 h-3" /></button>
                      </span>
                    )) : <span className="text-slate-500 text-sm">{items}</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Save Button */}
        <div className="flex gap-4">
          <button type="button" onClick={handleEvaluate} disabled={evaluateMutation.isPending}
            className="flex-1 bg-primary/10 text-primary py-6 rounded-[2rem] font-black text-xl hover:bg-primary hover:text-white transition-all disabled:opacity-50 flex items-center justify-center gap-3 border-2 border-primary/20">
            {evaluateMutation.isPending ? <Loader2 className="animate-spin" /> : <Sparkles className="w-6 h-6" />}
            AI Phân tích mới
          </button>

          {id && (
            <button type="button" onClick={() => setShowHistory(true)}
              className="px-8 bg-slate-50 text-slate-400 py-6 rounded-[2rem] font-black text-xl hover:bg-slate-100 hover:text-primary transition-all flex items-center justify-center gap-3 border-2 border-slate-100">
              <Clock className="w-6 h-6" />
            </button>
          )}
          
          <button type="button" onClick={handleSave} disabled={createMutation.isPending || updateMutation.isPending}
            className="flex-[2] bg-accent text-white py-6 rounded-[2rem] font-black text-xl shadow-2xl shadow-accent/30 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-3">
            {(createMutation.isPending || updateMutation.isPending) ? <Loader2 className="animate-spin" /> : <Save className="w-6 h-6" />}
            {isEdit ? 'Cập nhật CV' : 'Lưu CV Mới'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CVEditor;
