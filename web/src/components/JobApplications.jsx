// Module: components/JobApplications.jsx - Quản lý logic hệ thống
import React from 'react';
import { createPortal } from 'react-dom';
import { useParams, useNavigate } from 'react-router-dom';
import { useJobApplications, useUpdateApplicationStatus, useSendAcceptanceEmail, useAnalyzeApplications } from '../hooks/useApplications';
import { useJobById } from '../hooks/useJobs';
import { ArrowLeft, Loader2, User, Mail, Star, ExternalLink, Calendar, XCircle, Sparkles, Briefcase, GraduationCap, History, Phone, Search, Github, MapPin, Globe, FolderGit2, Trophy, Target, Award, AlertCircle } from 'lucide-react';
import CustomSelect from './ui/CustomSelect';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const parseJson = (data) => {
  if (typeof data === 'string') {
    try { return JSON.parse(data); } catch (e) { return []; }
  }
  return Array.isArray(data) ? data : [];
};

const CandidateModal = ({ isOpen, onClose, app }) => {
  if (!isOpen || !app) return null;

  const experience = parseJson(app.Profile?.experience);
  const education = parseJson(app.Profile?.education);
  const projects = parseJson(app.Profile?.projects);

  // Flatten skills object if it's a category map: { Frontend: ['React'], Backend: ['Node'] } -> ['React', 'Node']
  const rawSkills = app.Profile?.skills;
  let skills = [];
  if (rawSkills) {
    const parsed = typeof rawSkills === 'string' ? parseJson(rawSkills) : rawSkills;
    if (Array.isArray(parsed)) {
      skills = parsed;
    } else if (typeof parsed === 'object' && parsed !== null) {
      skills = Object.values(parsed).flat();
    }
  }

  const avatarUrl = app.candidate?.avatar ? `${API_URL}${app.candidate.avatar}` : null;

  const sendEmailMutation = useSendAcceptanceEmail();

  const handleSendEmail = async () => {
    try {
      await sendEmailMutation.mutateAsync(app.id);
      toast.success('Đã gửi email trúng tuyển cho ứng viên');
    } catch (err) {
      toast.error('Không thể gửi email: ' + (err.response?.data?.error || err.message));
    }
  };

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 lg:p-12 animate-in fade-in duration-300">
      <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm" onClick={onClose}></div>

      <div className="bg-white w-full max-w-6xl max-h-[90vh] rounded-[3.5rem] shadow-2xl relative z-10 overflow-hidden flex flex-col animate-in zoom-in-95 slide-in-from-bottom-8 duration-500">
        {/* Header */}
        <div className="p-8 lg:p-10 border-b border-slate-100 flex items-center justify-between shrink-0 bg-slate-50/50">
          <div className="flex items-center gap-6 lg:gap-8">
            <div className="w-20 h-20 lg:w-28 lg:h-28 bg-primary/10 rounded-[2rem] lg:rounded-[3rem] flex items-center justify-center text-primary text-3xl lg:text-5xl font-black shadow-inner overflow-hidden shrink-0">
              {avatarUrl ? (
                <img src={avatarUrl} alt={app.Profile?.fullName} className="w-full h-full object-cover" />
              ) : (
                app.Profile?.fullName?.[0] || 'U'
              )}
            </div>
            <div>
              <h3 className="text-3xl lg:text-5xl font-black text-primary-dark tracking-tighter truncate max-w-[300px] lg:max-w-none">
                {app.Profile?.fullName || 'Chưa cập nhật tên'}
              </h3>
              <p className="text-slate-500 font-bold mt-1 text-sm lg:text-xl flex items-center gap-2">
                <Briefcase className="w-4 h-4 lg:w-6 lg:h-6 text-primary" /> {app.Profile?.jobTitle || 'Chưa xác định vị trí'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-slate-100 rounded-full transition-colors group">
            <XCircle className="w-10 h-10 text-slate-300 group-hover:text-red-500 transition-colors" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 lg:p-16 custom-scrollbar">
          <div className="grid lg:grid-cols-3 gap-16">
            {/* Left Column: Contact & Info */}
            <div className="space-y-12 lg:col-span-1">
              <div className="p-10 bg-slate-50 rounded-[3.5rem] border border-slate-100 space-y-8">
                <h5 className="text-xs font-black text-slate-400 uppercase tracking-widest pl-2">Thông tin liên hệ</h5>
                <div className="space-y-6">
                  <div className="flex items-center gap-5 text-slate-700 font-bold text-sm lg:text-base group">
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm group-hover:bg-primary group-hover:text-white transition-all"><Mail className="w-5 h-5" /></div>
                    <span className="truncate">{app.candidate?.email}</span>
                  </div>
                  {app.Profile?.phone && (
                    <div className="flex items-center gap-5 text-slate-700 font-bold text-sm lg:text-base group">
                      <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm group-hover:bg-primary group-hover:text-white transition-all"><Phone className="w-5 h-5" /></div>
                      {app.Profile.phone}
                    </div>
                  )}
                  {app.Profile?.location && (
                    <div className="flex items-center gap-5 text-slate-700 font-bold text-sm lg:text-base group">
                      <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm group-hover:bg-primary group-hover:text-white transition-all"><MapPin className="w-5 h-5" /></div>
                      {app.Profile.location}
                    </div>
                  )}
                  {app.Profile?.github && (
                    <div className="flex items-center gap-5 text-slate-700 font-bold text-sm lg:text-base group">
                      <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm group-hover:bg-primary group-hover:text-white transition-all"><Github className="w-5 h-5" /></div>
                      <a href={app.Profile.github} target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors truncate">{app.Profile.github}</a>
                    </div>
                  )}
                </div>
              </div>

              {app.aiFeedback && (
                <div className="p-10 bg-primary/5 rounded-[3.5rem] border border-primary/10 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -mr-12 -mt-12"></div>
                  <Sparkles className="w-8 h-8 text-primary mb-4" />
                  <h5 className="text-xs font-black text-primary uppercase tracking-widest mb-4">AI Insight</h5>
                  <p className="text-slate-700 text-sm font-bold italic leading-relaxed relative z-10">"{app.aiFeedback}"</p>
                </div>
              )}
            </div>

            {/* Right Column: Full Details */}
            <div className="lg:col-span-2 space-y-16">
              {/* About */}
              {app.Profile?.aboutMe && (
                <section>
                  <h5 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">Giới thiệu bản thân</h5>
                  <p className="text-slate-600 font-semibold leading-relaxed text-lg italic pl-6 border-l-4 border-slate-100">{app.Profile.aboutMe}</p>
                </section>
              )}

              {/* Experience */}
              <section className="space-y-8">
                <h5 className="flex items-center gap-4 text-2xl font-black text-primary-dark uppercase tracking-tighter">
                  <History className="w-8 h-8 text-primary" /> Kinh nghiệm làm việc
                </h5>
                {experience.length > 0 ? (
                  <div className="space-y-12 pl-4">
                    {experience.map((exp, idx) => (
                      <div key={idx} className="relative pl-12 border-l-2 border-slate-100 pb-2 last:pb-0">
                        <div className="absolute left-[-13px] top-0 w-6 h-6 rounded-full bg-white border-4 border-primary shadow-sm hover:scale-125 transition-transform duration-300"></div>
                        <h6 className="font-black text-slate-800 text-xl leading-none">{exp.title || exp.position}</h6>
                        <div className="flex items-center gap-4 mt-3">
                          <span className="text-primary font-black text-base">{exp.company}</span>
                          <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                          <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest bg-slate-50 px-3 py-1 rounded-full border border-slate-100">{exp.time || exp.duration || (exp.startDate + ' - ' + exp.endDate)}</span>
                        </div>
                        <p className="text-slate-500 mt-5 font-semibold leading-relaxed text-sm whitespace-pre-line">{exp.description}</p>
                      </div>
                    ))}
                  </div>
                ) : <p className="text-slate-400 font-bold italic ml-4">Ứng viên chưa cập nhật kinh nghiệm.</p>}
              </section>

              {/* Projects */}
              {projects.length > 0 && (
                <section className="space-y-8">
                  <h5 className="flex items-center gap-4 text-2xl font-black text-primary-dark uppercase tracking-tighter">
                    <FolderGit2 className="w-8 h-8 text-slate-800" /> Dự án nổi bật
                  </h5>
                  <div className="grid md:grid-cols-2 gap-6 pl-4">
                    {projects.map((proj, idx) => (
                      <div key={idx} className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100 hover:border-primary/20 transition-all group">
                        <h6 className="font-black text-slate-800 text-lg group-hover:text-primary transition-colors">{proj.name || proj.title}</h6>
                        {proj.tech_stack && (
                          <div className="flex flex-wrap gap-2 mt-3 mb-4">
                            {Array.isArray(proj.tech_stack) ? proj.tech_stack.map((t, i) => (
                              <span key={i} className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">{t}</span>
                            )) : <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">{proj.tech_stack}</span>}
                          </div>
                        )}
                        <p className="text-slate-500 text-xs font-bold leading-relaxed line-clamp-4">{proj.description}</p>
                        {proj.link && (
                          <a href={proj.link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-primary text-[10px] font-black uppercase tracking-widest mt-6 hover:gap-4 transition-all">
                            Xem dự án <ArrowLeft className="w-3 h-3 rotate-180" />
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Education */}
              <section className="space-y-8">
                <h5 className="flex items-center gap-4 text-2xl font-black text-primary-dark uppercase tracking-tighter">
                  <GraduationCap className="w-8 h-8 text-accent" /> Học vấn
                </h5>
                {education.length > 0 ? (
                  <div className="space-y-12 pl-4">
                    {education.map((edu, idx) => (
                      <div key={idx} className="relative pl-12 border-l-2 border-slate-100 pb-2 last:pb-0">
                        <div className="absolute left-[-13px] top-0 w-6 h-6 rounded-full bg-white border-4 border-accent shadow-sm hover:scale-125 transition-transform duration-300"></div>
                        <h6 className="font-black text-slate-800 text-xl leading-none">{edu.degree || edu.major}</h6>
                        <div className="flex items-center gap-4 mt-3">
                          <span className="text-accent font-black text-base">{edu.school || edu.institution}</span>
                          <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                          <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest bg-slate-50 px-3 py-1 rounded-full border border-slate-100">{edu.time || edu.duration || (edu.startDate + ' - ' + edu.endDate)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : <p className="text-slate-400 font-bold italic ml-4">Ứng viên chưa cập nhật học vấn.</p>}
              </section>

              {/* Skills */}
              <section className="space-y-8">
                <h5 className="text-2xl font-black text-primary-dark uppercase tracking-tighter">Kỹ năng kỹ thuật</h5>
                <div className="flex flex-wrap gap-4 pl-4">
                  {skills.length > 0 ? skills.map((skill, idx) => (
                    <span key={idx} className="bg-white text-slate-800 px-8 py-4 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest border border-slate-100 shadow-sm hover:border-primary/20 hover:text-primary transition-all">
                      {skill}
                    </span>
                  )) : <p className="text-slate-400 font-bold italic">Chưa có thông tin kỹ năng.</p>}
                </div>
              </section>
            </div>
          </div>

          {/* AI Analysis Details */}
          {app.analysisDetails && (
            <section className="mt-16 pt-16 border-t border-slate-100 animate-in slide-in-from-bottom-4 duration-700">
              <div className="flex items-center gap-4 mb-10">
                <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-2xl font-black text-primary-dark uppercase tracking-tighter">Phân tích chi tiết từ AI</h4>
                  <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mt-1">Dựa trên tiêu chí công việc và CV ứng viên</p>
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-8 mb-12">
                {app.analysisDetails.criteria?.map((item, idx) => (
                  <div key={idx} className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100 hover:border-primary/20 transition-all group">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{item.name}</span>
                      <span className="text-xl font-black text-primary">{item.score}/10</span>
                    </div>
                    <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden mb-6">
                      <div 
                        className="h-full bg-primary rounded-full transition-all duration-1000"
                        style={{ width: `${item.score * 10}%` }}
                      ></div>
                    </div>
                    <p className="text-slate-500 text-xs font-bold leading-relaxed italic">"{item.comment}"</p>
                  </div>
                ))}
              </div>

              <div className="p-10 bg-primary/5 rounded-[3rem] border border-primary/10 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16"></div>
                <div className="flex items-start gap-6 relative z-10">
                  <Award className="w-10 h-10 text-primary shrink-0" />
                  <div>
                    <h5 className="text-lg font-black text-primary-dark uppercase tracking-tighter mb-2">Kết luận đánh giá</h5>
                    <p className="text-slate-700 font-bold leading-relaxed">{app.analysisDetails.summary || app.aiFeedback}</p>
                  </div>
                </div>
              </div>
            </section>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-10 bg-slate-50 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between shrink-0 gap-6">
          <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
            {app.Profile?.cvUrl && (
              <a
                href={`${API_URL}${app.Profile.cvUrl}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full md:w-auto flex items-center justify-center gap-4 bg-slate-900 text-white px-12 py-6 rounded-[2.5rem] font-black text-sm uppercase tracking-widest hover:bg-primary transition-all shadow-2xl shadow-slate-900/20 active:scale-95"
              >
                <ExternalLink className="w-6 h-6" /> Mở CV gốc (PDF)
              </a>
            )}
            
            {app.status === 'accepted' && (
              <button
                onClick={handleSendEmail}
                disabled={sendEmailMutation.isPending}
                className="w-full md:w-auto flex items-center justify-center gap-4 bg-primary text-white px-12 py-6 rounded-[2.5rem] font-black text-sm uppercase tracking-widest hover:bg-primary-dark transition-all shadow-2xl shadow-primary/20 active:scale-95 disabled:opacity-50"
              >
                {sendEmailMutation.isPending ? (
                  <Loader2 className="animate-spin w-6 h-6" />
                ) : (
                  <Mail className="w-6 h-6" />
                )}
                Gửi Mail Trúng Tuyển
              </button>
            )}
          </div>
          
          <button onClick={onClose} className="text-slate-400 hover:text-primary font-black text-sm uppercase tracking-widest transition-all hover:scale-105 active:scale-95">
            Đóng cửa sổ và tiếp tục
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

const JobApplications = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: job, isLoading: jobLoading } = useJobById(id);
  const { data: applications, isLoading: appsLoading } = useJobApplications(id);
  const updateStatusMutation = useUpdateApplicationStatus(id);
  const analyzeMutation = useAnalyzeApplications(id);

  const [selectedApp, setSelectedApp] = React.useState(null);
  const [selectedSkills, setSelectedSkills] = React.useState([]);
  const [aiFilterEnabled, setAiFilterEnabled] = React.useState(false);

  const allSkills = React.useMemo(() => {
    if (!job?.Skills) return [];
    return job.Skills.map(s => s.name).sort();
  }, [job]);

  const handleStatusChange = async (appId, newStatus) => {
    try {
      await updateStatusMutation.mutateAsync({ id: appId, status: newStatus });
      toast.success('Đã cập nhật trạng thái ứng viên');
    } catch (err) {
      toast.error('Không thể cập nhật trạng thái');
    }
  };

  const handleDeepAIAnalysis = async () => {
    if (analyzeMutation.isPending) return;
    try {
      const res = await analyzeMutation.mutateAsync();
      toast.success(res.message);
      setAiFilterEnabled(true);
    } catch (err) {
      toast.error('Lỗi khi phân tích AI: ' + (err.response?.data?.error || err.message));
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'accepted': return 'bg-green-100 text-green-700 border-green-200';
      case 'rejected': return 'bg-red-100 text-red-700 border-red-200';
      case 'reviewed': return 'bg-blue-100 text-blue-700 border-blue-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  if (jobLoading || appsLoading) {
    return (
      <div className="flex justify-center p-20">
        <Loader2 className="animate-spin w-12 h-12 text-primary" />
      </div>
    );
  }

  const filteredApplications = (applications || []).filter(app => {
    // Skill Filtering (OR logic - contains ANY of selected skills)
    if (selectedSkills.length > 0) {
      const rawSkills = app.Profile?.skills;
      let appSkills = [];
      if (rawSkills) {
        const parsed = typeof rawSkills === 'string' ? parseJson(rawSkills) : rawSkills;
        if (Array.isArray(parsed)) {
          appSkills = parsed.map(s => typeof s === 'string' ? s : s.name);
        } else if (typeof parsed === 'object' && parsed !== null) {
          appSkills = Object.values(parsed).flat().map(s => typeof s === 'string' ? s : s.name);
        }
      }
      
      const hasAnySkill = selectedSkills.some(skill => appSkills.includes(skill));
      if (!hasAnySkill) return false;
    }

    // AI Recommendation (Match Score >= 70)
    if (aiFilterEnabled) {
      if ((app.matchScore || 0) < 70) return false;
    }

    return true;
  });

  return (
    <div className="w-full space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-40">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-6">
          <button
            onClick={() => navigate('/recruiter/jobs')}
            className="p-4 bg-white border border-slate-100 rounded-[1.5rem] hover:bg-slate-50 transition-all text-slate-400 hover:text-primary shadow-sm"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h2 className="text-4xl font-black text-primary-dark tracking-tighter capitalize">{job?.title}</h2>
            <p className="text-slate-500 font-bold mt-1 uppercase text-[10px] tracking-widest flex items-center gap-2">
              <User className="w-3 h-3" /> Danh sách ứng viên đã nộp ({applications?.length || 0})
            </p>
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white/60 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/40 shadow-xl shadow-slate-200/50 space-y-8 animate-in fade-in zoom-in duration-500">
        <div className="flex flex-col lg:flex-row items-center gap-6">
          <div className="flex-1 w-full space-y-4">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1 block">Lọc theo kỹ năng ứng viên</label>
            <div className="flex flex-wrap gap-2">
              {allSkills.length > 0 ? allSkills.map(skill => (
                <button
                  key={skill}
                  onClick={() => {
                    setSelectedSkills(prev => 
                      prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]
                    );
                  }}
                  className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-tighter border-2 transition-all ${
                    selectedSkills.includes(skill)
                      ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20 scale-105'
                      : 'bg-white text-slate-400 border-slate-100 hover:border-primary/20 hover:text-primary'
                  }`}
                >
                  {skill}
                </button>
              )) : (
                <p className="text-slate-300 font-bold italic text-sm">Chưa có kỹ năng nào để lọc</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4 shrink-0">
            <button
              onClick={handleDeepAIAnalysis}
              disabled={analyzeMutation.isPending}
              className={`shrink-0 flex items-center gap-3 px-8 py-5 rounded-2xl font-black text-sm uppercase tracking-widest transition-all ${
                analyzeMutation.isPending 
                  ? 'bg-primary/50 text-white cursor-not-allowed'
                  : 'bg-primary text-white shadow-lg shadow-primary/30 hover:scale-105 active:scale-95'
              }`}
            >
              {analyzeMutation.isPending ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Sparkles className="w-5 h-5" />
              )}
              {analyzeMutation.isPending ? 'Đang phân tích...' : 'Lọc & Phân tích AI'}
            </button>

            <button
              onClick={() => setAiFilterEnabled(!aiFilterEnabled)}
              className={`shrink-0 flex items-center gap-3 px-8 py-5 rounded-2xl font-black text-sm uppercase tracking-widest transition-all ${
                aiFilterEnabled 
                  ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/30 scale-105' 
                  : 'bg-white text-slate-500 border border-slate-100 hover:border-slate-900/10 hover:text-slate-900 shadow-sm'
              }`}
              title="Bật/Tắt hiển thị ứng viên phù hợp"
            >
              {aiFilterEnabled ? 'Đã bật lọc' : 'Chỉ hiện Match'}
            </button>

            <div className="shrink-0 px-8 py-4 bg-slate-900 rounded-2xl text-white flex flex-col items-center justify-center min-w-[120px]">
              <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Kết quả</span>
              <span className="text-2xl font-black tracking-tighter leading-none mt-1">{filteredApplications.length}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-8">
        {filteredApplications.length > 0 ? filteredApplications.map((app) => {
          const rowAvatarUrl = app.candidate?.avatar ? `${API_URL}${app.candidate.avatar}` : null;

          return (
            <div key={app.id} className="bg-white p-10 rounded-[3rem] shadow-sm border border-slate-100 hover:shadow-2xl hover:border-primary/20 transition-all group relative">
              {/* Background Decoration */}
              <div className="absolute inset-0 rounded-[3rem] overflow-hidden pointer-events-none">
                <div className="absolute top-0 right-0 w-40 h-40 bg-slate-50 rounded-full -mr-20 -mt-20 group-hover:scale-110 transition-transform duration-700"></div>
              </div>

              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 relative z-10">
                <div className="flex items-start gap-8 flex-1">
                  <div className="w-20 h-20 bg-primary/10 rounded-[2.2rem] flex items-center justify-center text-primary font-black text-3xl shrink-0 shadow-inner group-hover:bg-primary group-hover:text-white transition-all duration-500 overflow-hidden">
                    {rowAvatarUrl ? (
                      <img src={rowAvatarUrl} alt={app.Profile?.fullName} className="w-full h-full object-cover" />
                    ) : (
                      app.Profile?.fullName?.[0] || 'U'
                    )}
                  </div>
                  <div className="space-y-3 shrink-0">
                    <h4 className="text-3xl font-black text-primary-dark group-hover:text-primary transition-colors tracking-tighter">
                      {app.Profile?.fullName || 'Chưa cập nhật tên'}
                    </h4>
                    <div className="flex flex-wrap gap-6 text-slate-400 font-bold text-sm">
                      <span className="flex items-center gap-2 text-slate-600">
                        <Mail className="w-4 h-4 text-primary" /> {app.candidate?.email}
                      </span>
                      <span className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" /> Nộp ngày {new Date(app.createdAt).toLocaleDateString('vi-VN')}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2 pt-2">
                      <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${getStatusStyle(app.status)}`}>
                        {app.status === 'pending' ? 'Chờ duyệt' :
                          app.status === 'reviewed' ? 'Đã xem' :
                            app.status === 'accepted' ? 'Chấp nhận' : 'Từ chối'}
                      </span>
                      {app.priority && (
                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border flex items-center gap-2 ${
                          app.priority === 'High' ? 'bg-green-50 text-green-600 border-green-100' :
                          app.priority === 'Medium' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                          'bg-slate-50 text-slate-400 border-slate-100'
                        }`}>
                          {app.priority === 'High' ? <Trophy className="w-3 h-3" /> : <Target className="w-3 h-3" />}
                          Ưu tiên {app.priority === 'High' ? 'Cao' : app.priority === 'Medium' ? 'Trung bình' : 'Thấp'}
                        </span>
                      )}
                      {app.Profile?.location && (
                        <span className="bg-slate-50 text-slate-400 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-slate-100">
                          📍 {app.Profile.location}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex lg:flex-col items-center lg:items-end justify-between lg:justify-center gap-6 lg:border-l lg:border-slate-100 lg:pl-12">
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest mb-1 text-nowrap">AI Match Score</p>
                      <div className="text-4xl font-black text-primary tracking-tighter text-right">
                        {Math.round(app.matchScore || 0)}%
                      </div>
                    </div>
                    <div className="w-16 h-16 rounded-[1.8rem] bg-primary/5 flex items-center justify-center">
                      <Star className="w-8 h-8 text-primary fill-primary/20" />
                    </div>
                  </div>

                  <div className="flex items-center gap-3 w-full lg:w-auto">
                    <div className="flex-1 lg:w-48">
                      <CustomSelect
                        className="w-full"
                        options={[
                          { value: 'pending', label: 'Chờ duyệt' },
                          { value: 'reviewed', label: 'Đã xem' },
                          { value: 'accepted', label: 'Chấp nhận' },
                          { value: 'rejected', label: 'Từ chối' },
                        ]}
                        value={app.status}
                        onChange={(val) => handleStatusChange(app.id, val)}
                      />
                    </div>
                    <button
                      onClick={() => setSelectedApp(app)}
                      className="w-16 h-16 bg-slate-900 text-white rounded-[1.8rem] flex items-center justify-center hover:bg-primary transition-all shadow-xl shadow-slate-900/10 shrink-0 group/view"
                      title="Xem chi tiết"
                    >
                      <Search className="w-6 h-6 group-hover/view:scale-110 transition-transform" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        }) : (
          <div className="text-center py-24 bg-white rounded-[4rem] border-2 border-dashed border-slate-100 shadow-sm animate-in zoom-in duration-500">
            <div className="w-24 h-24 bg-slate-50 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 text-slate-200 shadow-inner">
              <User className="w-12 h-12" />
            </div>
            <h3 className="text-2xl font-black text-slate-400 uppercase tracking-widest mb-2">
              {selectedSkills.length > 0 || aiFilterEnabled ? 'Không tìm thấy ứng viên phù hợp' : 'Chưa có ứng viên nào'}
            </h3>
            <p className="text-slate-300 font-bold italic">
              {selectedSkills.length > 0 || aiFilterEnabled 
                ? 'Hãy thử thay đổi bộ lọc hoặc từ khóa tìm kiếm để tìm thấy nhân tài!' 
                : 'Hãy thử chia sẻ tin tuyển dụng này để thu hút thêm nhân tài!'}
            </p>
          </div>
        )}
      </div>

      <CandidateModal
        isOpen={!!selectedApp}
        onClose={() => setSelectedApp(null)}
        app={selectedApp}
      />
    </div>
  );
};

export default JobApplications;

// Git update: Triggering change for push
