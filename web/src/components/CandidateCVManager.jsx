// Module: components/CandidateCVManager.jsx - Quản lý logic hệ thống
import React, { useState, useEffect } from 'react';
import { Upload, FileText, Sparkles, Loader2, CheckCircle, Briefcase, Zap, Star, Save, Plus, Trash2, User, Mail, Phone, MapPin, Github, GraduationCap } from 'lucide-react';
import { useProfile, useUpdateProfile, useUploadCV, useSuggestions } from '../hooks/useProfile';
import toast from 'react-hot-toast';

// Safely parse JSON fields that may come as strings from DB
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

const CandidateCVManager = () => {
  const [file, setFile] = useState(null);
  const [activeTab, setActiveTab] = useState('edit');
  const { data: profile, isLoading } = useProfile();
  const uploadMutation = useUploadCV();
  const updateProfileMutation = useUpdateProfile();
  const suggestionsMutation = useSuggestions();

  // Form states for Profile fields
  const [formData, setFormData] = useState({
    fullName: '', jobTitle: '', email: '', phone: '', location: '', github: '', aboutMe: '',
    experience: [],
    education: [],
    projects: [],
    skills: {},
  });
  const [skillInput, setSkillInput] = useState({ category: '', value: '' });

  useEffect(() => {
    if (profile) {
      setFormData({
        fullName: profile.fullName || '',
        jobTitle: profile.jobTitle || '',
        email: profile.email || '',
        phone: profile.phone || '',
        location: profile.location || '',
        github: profile.github || '',
        aboutMe: profile.aboutMe || '',
        experience: safeArray(profile.experience),
        education: safeArray(profile.education),
        projects: safeArray(profile.projects),
        skills: safeObj(profile.skills),
      });
    }
  }, [profile]);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return;
    try {
      await uploadMutation.mutateAsync(file);
      toast.success('CV đã được phân tích thành công!', {
        icon: '🎯', style: { borderRadius: '1.5rem', background: '#0F172A', color: '#fff', padding: '1.5rem', fontWeight: 'bold' },
      });
      setFile(null);
    } catch (err) {
      toast.error('Tải lên thất bại');
    }
  };

  const handleSaveProfile = async () => {
    try {
      await updateProfileMutation.mutateAsync(formData);
      toast.success('Lưu hồ sơ CV thành công!', {
        icon: '✅', style: { borderRadius: '1.5rem', background: '#0F172A', color: '#fff', padding: '1.5rem', fontWeight: 'bold' },
      });
    } catch (err) {
      toast.error('Không thể lưu hồ sơ');
    }
  };

  // Dynamic array helpers
  const addExperience = () => {
    setFormData(prev => ({ ...prev, experience: [...(prev.experience || []), { position: '', company: '', time: '', description: '', technical: '' }] }));
  };
  const removeExperience = (index) => {
    setFormData(prev => ({ ...prev, experience: (prev.experience || []).filter((_, i) => i !== index) }));
  };
  const updateExperience = (index, field, value) => {
    setFormData(prev => {
      const updated = [...(prev.experience || [])];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, experience: updated };
    });
  };

  const addEducation = () => {
    setFormData(prev => ({ ...prev, education: [...(prev.education || []), { school: '', degree: '', time: '' }] }));
  };
  const removeEducation = (index) => {
    setFormData(prev => ({ ...prev, education: (prev.education || []).filter((_, i) => i !== index) }));
  };
  const updateEducation = (index, field, value) => {
    setFormData(prev => {
      const updated = [...(prev.education || [])];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, education: updated };
    });
  };

  const addProject = () => {
    setFormData(prev => ({ ...prev, projects: [...(prev.projects || []), { name: '', description: '', tech_stack: [] }] }));
  };
  const removeProject = (index) => {
    setFormData(prev => ({ ...prev, projects: (prev.projects || []).filter((_, i) => i !== index) }));
  };
  const updateProject = (index, field, value) => {
    setFormData(prev => {
      const updated = [...(prev.projects || [])];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, projects: updated };
    });
  };

  const addSkill = () => {
    if (!skillInput.category || !skillInput.value) return;
    setFormData(prev => {
      const skills = { ...prev.skills };
      const existing = skills[skillInput.category];
      if (Array.isArray(existing)) {
        skills[skillInput.category] = [...existing, skillInput.value];
      } else {
        skills[skillInput.category] = [skillInput.value];
      }
      return { ...prev, skills };
    });
    setSkillInput(prev => ({ ...prev, value: '' }));
  };

  const removeSkill = (category, index) => {
    setFormData(prev => {
      const skills = { ...prev.skills };
      if (Array.isArray(skills[category])) {
        skills[category] = skills[category].filter((_, i) => i !== index);
        if (skills[category].length === 0) delete skills[category];
      }
      return { ...prev, skills };
    });
  };

  if (isLoading) return (
    <div className="flex justify-center p-20">
      <Loader2 className="animate-spin w-12 h-12 text-primary" />
    </div>
  );

  const inputClass = "w-full px-6 py-4 rounded-[1.5rem] bg-slate-50 border-2 border-transparent transition-all outline-none font-bold text-base focus:ring-primary/10 focus:bg-white focus:border-primary/20";

  return (
    <div className="w-full space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h2 className="text-5xl font-black text-primary-dark tracking-tighter">Quản lý CV</h2>
          <p className="text-slate-500 font-bold mt-2 text-lg">Tạo và chỉnh sửa CV chuyên nghiệp</p>
        </div>
        <button
          onClick={() => suggestionsMutation.mutateAsync().catch(() => toast.error('Hãy tạo CV trước'))}
          disabled={suggestionsMutation.isPending}
          className="bg-gradient-to-r from-primary to-primary-light text-white px-10 py-5 rounded-[2rem] font-black shadow-2xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-3 text-lg disabled:opacity-50"
        >
          {suggestionsMutation.isPending ? <Loader2 className="animate-spin w-5 h-5" /> : <Sparkles className="w-5 h-5" />}
          Gợi ý từ AI
        </button>
      </div>

      {/* Tab Switch */}
      <div className="flex bg-slate-100 rounded-[2rem] p-2">
        <button onClick={() => setActiveTab('edit')} className={`flex-1 py-4 rounded-[1.5rem] font-black text-sm uppercase tracking-widest transition-all ${activeTab === 'edit' ? 'bg-white text-primary shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}>
          ✏️ Tự Tạo / Chỉnh sửa
        </button>
        <button onClick={() => setActiveTab('upload')} className={`flex-1 py-4 rounded-[1.5rem] font-black text-sm uppercase tracking-widest transition-all ${activeTab === 'upload' ? 'bg-white text-primary shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}>
          📄 Tải lên PDF
        </button>
      </div>

      {/* Upload Tab */}
      {activeTab === 'upload' && (
        <div className="bg-primary p-12 rounded-[3.5rem] text-white relative overflow-hidden animate-in fade-in duration-300">
          <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-white/5 rounded-full"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-white/10 rounded-[1.5rem] flex items-center justify-center"><Upload className="w-8 h-8" /></div>
              <div>
                <h3 className="text-3xl font-black tracking-tighter">Tải lên CV (PDF)</h3>
                <p className="text-white/60 font-bold text-sm">AI sẽ tự động trích xuất dữ liệu từ file PDF</p>
              </div>
            </div>
            <form onSubmit={handleUpload} className="space-y-4">
              <input type="file" className="hidden" id="cv-upload" onChange={(e) => setFile(e.target.files[0])} accept=".pdf" />
              <label htmlFor="cv-upload" className="block w-full text-center py-6 rounded-[2rem] border-2 border-dashed border-white/20 hover:border-white/50 cursor-pointer transition-all font-black text-lg hover:bg-white/5">
                {file ? <span className="flex items-center justify-center gap-3"><FileText className="w-5 h-5" /> {file.name}</span> : <span className="flex items-center justify-center gap-3"><Upload className="w-5 h-5" /> Nhấn để chọn file PDF</span>}
              </label>
              {file && (
                <button disabled={uploadMutation.isPending} type="submit" className="w-full bg-white text-primary py-5 rounded-[2rem] font-black text-lg hover:scale-[1.02] transition-all disabled:opacity-50 flex items-center justify-center gap-3">
                  {uploadMutation.isPending ? <Loader2 className="animate-spin" /> : <Sparkles className="w-5 h-5" />}
                  {uploadMutation.isPending ? 'Đang phân tích...' : 'Tải lên & Phân tích'}
                </button>
              )}
            </form>
          </div>
        </div>
      )}

      {/* Edit Tab */}
      {activeTab === 'edit' && (
        <div className="space-y-10 animate-in fade-in duration-300">
          {/* Basic Info */}
          <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-slate-100 space-y-6">
            <h3 className="text-2xl font-black text-primary-dark flex items-center gap-3">
              <span className="p-3 bg-primary/10 rounded-2xl"><User className="text-primary w-6 h-6" /></span>
              Thông tin Cơ bản
            </h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-2 mb-2 block">Họ tên</label>
                <input value={formData.fullName} onChange={e => setFormData(p => ({ ...p, fullName: e.target.value }))} className={inputClass} placeholder="Nguyễn Văn A" />
              </div>
              <div>
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-2 mb-2 block">Vị trí Ứng tuyển</label>
                <input value={formData.jobTitle} onChange={e => setFormData(p => ({ ...p, jobTitle: e.target.value }))} className={inputClass} placeholder="Frontend Developer" />
              </div>
              <div>
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-2 mb-2 block">Email liên hệ</label>
                <input value={formData.email} onChange={e => setFormData(p => ({ ...p, email: e.target.value }))} className={inputClass} placeholder="email@example.com" />
              </div>
              <div>
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-2 mb-2 block">Số điện thoại</label>
                <input value={formData.phone} onChange={e => setFormData(p => ({ ...p, phone: e.target.value }))} className={inputClass} placeholder="0901 234 567" />
              </div>
              <div>
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-2 mb-2 block">Địa điểm</label>
                <input value={formData.location} onChange={e => setFormData(p => ({ ...p, location: e.target.value }))} className={inputClass} placeholder="Hà Nội" />
              </div>
              <div>
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-2 mb-2 block">GitHub</label>
                <input value={formData.github} onChange={e => setFormData(p => ({ ...p, github: e.target.value }))} className={inputClass} placeholder="https://github.com/user" />
              </div>
            </div>
            <div>
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-2 mb-2 block">Giới thiệu Bản thân</label>
              <textarea value={formData.aboutMe} onChange={e => setFormData(p => ({ ...p, aboutMe: e.target.value }))} className={`${inputClass} h-32 resize-none`} placeholder="Chia sẻ về bạn..." />
            </div>
          </div>

          {/* Experience */}
          <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-slate-100 space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-2xl font-black text-primary-dark flex items-center gap-3">
                <span className="p-3 bg-primary/10 rounded-2xl"><Briefcase className="text-primary w-6 h-6" /></span>
                Kinh nghiệm Làm việc
              </h3>
              <button type="button" onClick={addExperience} className="bg-primary/10 text-primary px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-primary hover:text-white transition-all flex items-center gap-2">
                <Plus className="w-4 h-4" /> Thêm
              </button>
            </div>
            {formData?.experience?.map((exp, i) => (
              <div key={i} className="bg-slate-50 p-8 rounded-[2rem] space-y-4 relative group">
                <button type="button" onClick={() => removeExperience(i)} className="absolute top-4 right-4 p-2 bg-red-50 text-red-400 rounded-xl hover:bg-red-100 hover:text-red-600 transition-all opacity-0 group-hover:opacity-100">
                  <Trash2 className="w-4 h-4" />
                </button>
                <div className="grid md:grid-cols-2 gap-4">
                  <input value={exp.position} onChange={e => updateExperience(i, 'position', e.target.value)} className={inputClass} placeholder="Vị trí (VD: Frontend Developer)" />
                  <input value={exp.company} onChange={e => updateExperience(i, 'company', e.target.value)} className={inputClass} placeholder="Công ty" />
                  <input value={exp.time} onChange={e => updateExperience(i, 'time', e.target.value)} className={inputClass} placeholder="Thời gian (VD: 2022-2024)" />
                  <input value={exp.technical || ''} onChange={e => updateExperience(i, 'technical', e.target.value)} className={inputClass} placeholder="Công nghệ sử dụng" />
                </div>
                <textarea value={exp.description} onChange={e => updateExperience(i, 'description', e.target.value)} className={`${inputClass} h-24 resize-none`} placeholder="Mô tả công việc..." />
              </div>
            ))}
            {formData?.experience?.length === 0 && <p className="text-slate-400 italic font-medium text-center py-6">Nhấn "Thêm" để bắt đầu thêm kinh nghiệm</p>}
          </div>

          {/* Education */}
          <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-slate-100 space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-2xl font-black text-primary-dark flex items-center gap-3">
                <span className="p-3 bg-blue-100 rounded-2xl"><GraduationCap className="text-blue-600 w-6 h-6" /></span>
                Học vấn
              </h3>
              <button type="button" onClick={addEducation} className="bg-blue-50 text-blue-600 px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all flex items-center gap-2">
                <Plus className="w-4 h-4" /> Thêm
              </button>
            </div>
            {(formData?.education || []).map((edu, i) => (
              <div key={i} className="bg-slate-50 p-8 rounded-[2rem] space-y-4 relative group">
                <button type="button" onClick={() => removeEducation(i)} className="absolute top-4 right-4 p-2 bg-red-50 text-red-400 rounded-xl hover:bg-red-100 hover:text-red-600 transition-all opacity-0 group-hover:opacity-100">
                  <Trash2 className="w-4 h-4" />
                </button>
                <div className="grid md:grid-cols-3 gap-4">
                  <input value={edu.school || ''} onChange={e => updateEducation(i, 'school', e.target.value)} className={inputClass} placeholder="Trường học" />
                  <input value={edu.degree || ''} onChange={e => updateEducation(i, 'degree', e.target.value)} className={inputClass} placeholder="Bằng cấp / Chuyên ngành" />
                  <input value={edu.time || ''} onChange={e => updateEducation(i, 'time', e.target.value)} className={inputClass} placeholder="Thời gian (VD: 2018-2022)" />
                </div>
              </div>
            ))}
            {(!formData?.education || formData.education.length === 0) && <p className="text-slate-400 italic font-medium text-center py-6">Nhấn "Thêm" để bắt đầu thêm học vấn</p>}
          </div>

          {/* Projects */}
          <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-slate-100 space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-2xl font-black text-primary-dark flex items-center gap-3">
                <span className="p-3 bg-accent/10 rounded-2xl"><Zap className="text-accent w-6 h-6" /></span>
                Dự án
              </h3>
              <button type="button" onClick={addProject} className="bg-accent/10 text-accent px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-accent hover:text-white transition-all flex items-center gap-2">
                <Plus className="w-4 h-4" /> Thêm
              </button>
            </div>
            {(formData?.projects || []).map((proj, i) => (
              <div key={i} className="bg-slate-50 p-8 rounded-[2rem] space-y-4 relative group">
                <button type="button" onClick={() => removeProject(i)} className="absolute top-4 right-4 p-2 bg-red-50 text-red-400 rounded-xl hover:bg-red-100 hover:text-red-600 transition-all opacity-0 group-hover:opacity-100">
                  <Trash2 className="w-4 h-4" />
                </button>
                <div className="grid md:grid-cols-2 gap-4">
                  <input value={proj.name} onChange={e => updateProject(i, 'name', e.target.value)} className={inputClass} placeholder="Tên dự án" />
                  <input value={Array.isArray(proj.tech_stack) ? proj.tech_stack.join(', ') : ''} onChange={e => updateProject(i, 'tech_stack', e.target.value.split(',').map(s => s.trim()).filter(Boolean))} className={inputClass} placeholder="Công nghệ (phân tách bằng dấu phẩy)" />
                </div>
                <textarea value={proj.description} onChange={e => updateProject(i, 'description', e.target.value)} className={`${inputClass} h-24 resize-none`} placeholder="Mô tả dự án..." />
              </div>
            ))}
            {(!formData?.projects || formData.projects.length === 0) && <p className="text-slate-400 italic font-medium text-center py-6">Nhấn "Thêm" để bắt đầu thêm dự án</p>}
          </div>

          {/* Skills */}
          <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-slate-100 space-y-6">
            <h3 className="text-2xl font-black text-primary-dark flex items-center gap-3">
              <span className="p-3 bg-primary/10 rounded-2xl"><Star className="text-primary w-6 h-6" /></span>
              Kỹ năng
            </h3>

            <div className="flex gap-3">
              <input value={skillInput.category} onChange={e => setSkillInput(p => ({ ...p, category: e.target.value }))} className={`${inputClass} flex-1`} placeholder="Danh mục (VD: Frontend, Backend)" />
              <input value={skillInput.value} onChange={e => setSkillInput(p => ({ ...p, value: e.target.value }))} className={`${inputClass} flex-1`} placeholder="Kỹ năng (VD: React, Node.js)"
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addSkill(); } }}
              />
              <button type="button" onClick={addSkill} className="bg-primary text-white px-6 rounded-[1.5rem] font-black text-xs hover:scale-105 transition-all shrink-0">
                <Plus className="w-5 h-5" />
              </button>
            </div>

            {Object.keys(formData?.skills || {}).length > 0 && (
              <div className="space-y-4">
                {Object.entries(formData?.skills || {}).map(([category, items]) => (
                  <div key={category}>
                    <h5 className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2">{category}</h5>
                    <div className="flex flex-wrap gap-2">
                      {Array.isArray(items) ? items.map((item, j) => (
                        <span key={j} className="bg-primary/5 text-primary px-4 py-2 rounded-xl text-sm font-bold border border-primary/10 flex items-center gap-2 group">
                          {item}
                          <button type="button" onClick={() => removeSkill(category, j)} className="text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-all">
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </span>
                      )) : <span className="text-slate-500 text-sm">{items}</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Save Button */}
          <button
            type="button"
            onClick={handleSaveProfile}
            disabled={updateProfileMutation.isPending}
            className="w-full bg-accent text-white py-6 rounded-[2rem] font-black text-xl shadow-2xl shadow-accent/30 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-3"
          >
            {updateProfileMutation.isPending ? <Loader2 className="animate-spin" /> : <Save className="w-6 h-6" />}
            Lưu Hồ sơ CV
          </button>
        </div>
      )}

      {/* AI Suggestions */}
      {suggestionsMutation.data && (
        <div className="bg-white p-12 rounded-[3.5rem] shadow-2xl border border-primary/5 animate-in slide-in-from-bottom-8 duration-700">
          <div className="flex gap-4 items-center mb-10">
            <Sparkles className="w-10 h-10 text-primary animate-pulse" />
            <h3 className="text-3xl font-black text-primary-dark tracking-tighter">Chiến lược Nghề nghiệp từ AI</h3>
          </div>
          <div className="grid md:grid-cols-2 gap-12">
            <div className="space-y-4">
              <h4 className="font-black text-slate-400 text-sm uppercase tracking-widest pl-4">Điểm cần Tối ưu</h4>
              <div className="space-y-3">
                {suggestionsMutation.data.suggestions?.map((s, i) => (
                  <div key={i} className="flex gap-4 items-start bg-slate-50/50 p-6 rounded-[2rem] hover:bg-white hover:shadow-xl transition-all border border-transparent hover:border-primary/10">
                    <CheckCircle className="text-accent w-6 h-6 shrink-0 mt-1" />
                    <p className="text-slate-600 font-medium leading-relaxed">{s}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-4">
              <h4 className="font-black text-slate-400 text-sm uppercase tracking-widest pl-4">Kỹ năng cần Chinh phục</h4>
              <div className="grid grid-cols-2 gap-3">
                {suggestionsMutation.data.recommended_skills?.map((s, i) => (
                  <div key={i} className="bg-primary/5 text-primary text-center py-4 rounded-[1.5rem] font-black text-xs border border-primary/10 uppercase tracking-tight">{s}</div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CandidateCVManager;

// Git update: Triggering change for push
