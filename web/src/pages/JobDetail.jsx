// Module: pages/JobDetail.jsx - Quản lý logic hệ thống
import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useJobById, useRelatedJobs } from '../hooks/useJobs';
import { useUserCVs } from '../hooks/useProfile';
import { useApplyToJob } from '../hooks/useApplications';
import { 
  Building2, MapPin, DollarSign, Briefcase, Clock, 
  ChevronLeft, Share2, Star, CheckCircle2, AlertCircle,
  Loader2, Send, FileText, Check, Globe, LayoutGrid
} from 'lucide-react';
import toast from 'react-hot-toast';
import { formatSalary } from '../utils/salaryUtils';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const JobDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: job, isLoading: jobLoading } = useJobById(id);
  const { data: cvs, isLoading: cvsLoading } = useUserCVs();
  const { data: relatedJobs, isLoading: relatedLoading } = useRelatedJobs(id);
  const applyMutation = useApplyToJob();
  
  const [selectedCvId, setSelectedCvId] = useState('');
  const [isApplying, setIsApplying] = useState(false);

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isCandidate = user.role === 'candidate';

  const handleApply = async () => {
    if (!selectedCvId) {
      toast.error('Vui lòng chọn một CV để ứng tuyển');
      return;
    }

    try {
      await applyMutation.mutateAsync({ jobId: id, profileId: selectedCvId });
      toast.success('Ứng tuyển thành công! Nhà tuyển dụng sẽ xem xét hồ sơ của bạn.');
      setIsApplying(false);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Có lỗi xảy ra khi ứng tuyển');
    }
  };

  if (jobLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-40 gap-4">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
        <p className="text-slate-400 font-black uppercase text-xs tracking-widest">Đang tải thông tin công việc...</p>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="text-center py-40">
        <h2 className="text-2xl font-black text-slate-400">Không tìm thấy công việc này</h2>
        <Link to="/jobs" className="mt-4 text-primary font-bold hover:underline inline-block">Quay lại danh sách</Link>
      </div>
    );
  }

  const isClosed = job.status === 'closed';

  return (
    <div className="w-full mx-auto pb-20 px-6 animate-in fade-in duration-500">
      <div className="mb-8">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-400 hover:text-primary transition-colors font-bold group">
          <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" /> 
          Quay lại
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-12">
        {/* Left: Job Info */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white p-12 rounded-[3.5rem] shadow-sm border border-slate-100">
            <div className="flex flex-col md:flex-row gap-10 items-start md:items-center mb-10">
              <div className="w-24 h-24 bg-primary/5 rounded-[2.2rem] flex items-center justify-center overflow-hidden border border-slate-100 shadow-inner group transition-all">
                {job.recruiter?.company?.logo ? (
                  <img src={`${API_URL}${job.recruiter.company.logo}`} alt={job.recruiter.company.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                ) : (
                  <Building2 className="w-12 h-12 text-primary/20" />
                )}
              </div>
              <div className="flex-1">
                <div className="flex flex-wrap gap-3 mb-4">
                  <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${isClosed ? 'bg-red-50 text-red-500 border-red-100' : 'bg-green-50 text-green-600 border-green-100'}`}>
                    {isClosed ? 'Đã hết hạn' : 'Đang tuyển'}
                  </span>
                  <span className="px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-primary/5 text-primary border border-primary/10">
                    {job.type}
                  </span>
                </div>
                <h1 className="text-5xl font-black text-primary-dark tracking-tighter leading-tight mb-2">{job.title}</h1>
                <Link to={`/company/${job.recruiter?.company?.id}`} className="text-xl text-slate-500 font-bold flex items-center gap-2 hover:text-primary transition-colors">
                  <Building2 className="w-5 h-5 text-primary" /> {job.recruiter?.company?.name || job.recruiter?.email}
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-6 py-10 border-y border-slate-50">
              <div className="space-y-1">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Mức lương</p>
                <p className="text-xl font-black text-primary flex items-center gap-2">
                  <DollarSign className="w-5 h-5" /> {formatSalary(job.salary)}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Địa điểm</p>
                <p className="text-xl font-black text-slate-700 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-red-500" /> {job.location}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Loại hình</p>
                <p className="text-xl font-black text-slate-700 flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-orange-500" /> {job.type}
                </p>
              </div>
            </div>

            <div className="py-10 space-y-12">
              <section>
                <h2 className="text-2xl font-black text-primary-dark tracking-tighter mb-6 flex items-center gap-3">
                  Mô tả công việc
                </h2>
                <div className="prose prose-slate max-w-none text-slate-600 font-medium leading-loose text-lg" dangerouslySetInnerHTML={{ __html: job.description }} />
              </section>

              <section>
                <h2 className="text-2xl font-black text-primary-dark tracking-tighter mb-6 flex items-center gap-3">
                  Yêu cầu ứng viên
                </h2>
                <div className="prose prose-slate max-w-none text-slate-600 font-medium leading-loose text-lg" dangerouslySetInnerHTML={{ __html: job.requirements }} />
              </section>

              <section>
                <h2 className="text-2xl font-black text-primary-dark tracking-tighter mb-6">Kỹ năng yêu cầu</h2>
                <div className="flex flex-wrap gap-4">
                  {job.Skills?.map(skill => (
                    <span key={skill.id} className="px-6 py-3 bg-slate-50 text-slate-600 rounded-[1.2rem] font-black text-sm border border-slate-100 flex items-center gap-2">
                      <Star className="w-4 h-4 text-amber-500" /> {skill.name}
                    </span>
                  ))}
                </div>
              </section>
            </div>
          </div>
        </div>

        {/* Right: Apply Sidebar */}
        <div className="space-y-8">
          <div className="bg-white p-10 rounded-[3rem] shadow-2xl shadow-slate-200/50 border border-slate-100 sticky top-8">
            {isClosed ? (
              <div className="text-center py-6 space-y-4">
                <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto">
                  <AlertCircle className="w-10 h-10" />
                </div>
                <h3 className="text-2xl font-black text-red-500">Tuyển dụng đã đóng</h3>
                <p className="text-slate-500 font-bold">Hãy tham khảo các vị trí khác tương tự nhé.</p>
                <Link to="/jobs" className="block w-full py-5 rounded-[1.5rem] bg-slate-900 text-white font-black text-center uppercase tracking-widest text-xs hover:bg-slate-800 transition-all">Xem các job khác</Link>
              </div>
            ) : !isCandidate ? (
              <div className="text-center py-6 space-y-6">
                <div className="w-20 h-20 bg-primary/5 text-primary rounded-full flex items-center justify-center mx-auto">
                  <Briefcase className="w-10 h-10" />
                </div>
                <h3 className="text-2xl font-black text-primary-dark">Sẵn sàng ứng tuyển?</h3>
                <p className="text-slate-500 font-bold">Vui lòng đăng nhập với tài khoản ứng viên để gửi CV trực tiếp cho nhà tuyển dụng.</p>
                <Link to="/login" className="block w-full py-6 rounded-[2rem] bg-primary text-white font-black text-center uppercase tracking-widest text-sm shadow-xl shadow-primary/30 hover:scale-105 active:scale-95 transition-all">Đăng nhập để ứng tuyển</Link>
              </div>
            ) : (
              <div className="space-y-8">
                <h3 className="text-3xl font-black text-primary-dark tracking-tighter">Ứng tuyển ngay</h3>
                
                <div className="space-y-6">
                  <div>
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-2 mb-3 block">Chọn CV của bạn</label>
                    {cvsLoading ? (
                      <div className="flex items-center gap-3 py-4 text-slate-400 italic">
                        <Loader2 className="w-4 h-4 animate-spin" /> Đang tải danh sách CV...
                      </div>
                    ) : Array.isArray(cvs) && cvs.length > 0 ? (
                      <div className="space-y-3">
                        {cvs.map(cv => (
                          <button
                            key={cv.id}
                            onClick={() => setSelectedCvId(cv.id)}
                            className={`w-full p-6 rounded-[1.5rem] border-2 text-left transition-all group flex items-start gap-4 ${selectedCvId === cv.id ? 'border-primary bg-primary/5' : 'border-slate-50 bg-slate-50 hover:border-slate-200'}`}
                          >
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${selectedCvId === cv.id ? 'bg-primary text-white' : 'bg-white text-slate-400'}`}>
                              <FileText className="w-5 h-5" />
                            </div>
                            <div className="flex-1">
                              <p className={`font-black text-sm ${selectedCvId === cv.id ? 'text-primary' : 'text-slate-700'}`}>{cv.title}</p>
                              <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Cập nhật: {new Date(cv.updatedAt).toLocaleDateString('vi-VN')}</p>
                            </div>
                            {selectedCvId === cv.id && <CheckCircle2 className="w-5 h-5 text-primary shrink-0 transition-all scale-110" />}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="p-8 rounded-[1.5rem] bg-amber-50 border-2 border-amber-100 text-center space-y-4">
                        <AlertCircle className="w-10 h-10 text-amber-500 mx-auto" />
                        <p className="text-amber-700 font-bold text-sm">Bạn chưa có CV nào trong hệ thống.</p>
                        <Link to="/candidate/cv-manager" className="text-primary font-black text-xs uppercase tracking-widest hover:underline block">Tạo CV ngay</Link>
                      </div>
                    )}
                  </div>

                  <button
                    disabled={!selectedCvId || applyMutation.isPending || isApplying}
                    onClick={handleApply}
                    className="w-full bg-accent text-white py-6 rounded-[2.2rem] font-black text-xl shadow-2xl shadow-accent/30 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-3"
                  >
                    {applyMutation.isPending ? <Loader2 className="w-6 h-6 animate-spin" /> : <Send className="w-6 h-6" />}
                    Gửi Hồ sơ Ứng tuyển
                  </button>

                  <p className="text-[10px] text-slate-400 font-bold text-center leading-relaxed">
                    Bằng việc nhấn "Gửi Hồ sơ Ứng tuyển", bạn đồng ý chia sẻ thông tin CV với nhà tuyển dụng của công việc này.
                  </p>
                </div>
              </div>
            )}
          </div>
          
          <div className="bg-slate-900 p-10 rounded-[3rem] text-white space-y-6">
            <h4 className="text-xl font-black tracking-tight">Mẹo ứng tuyển</h4>
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                  <Check className="w-4 h-4 text-accent" />
                </div>
                <p className="text-sm font-medium text-slate-300">Cập nhật kỹ năng phù hợp với yêu cầu công việc để tăng điểm match.</p>
              </div>
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                  <Check className="w-4 h-4 text-accent" />
                </div>
                <p className="text-sm font-medium text-slate-300">Nhà tuyển dụng thường xem xét các ứng viên nộp hồ sơ sớm.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Related Jobs Section */}
      {relatedJobs?.length > 0 && (
        <div className="mt-20 space-y-10 animate-in fade-in slide-in-from-bottom-10 duration-1000">
          <div className="flex justify-between items-end">
            <div>
              <h2 className="text-4xl font-black text-primary-dark tracking-tighter uppercase">Có thể bạn quan tâm</h2>
              <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest mt-2">Dựa trên kỹ năng và vị trí tương tự</p>
            </div>
            <Link to="/jobs" className="text-primary font-black uppercase text-xs tracking-widest hover:underline flex items-center gap-2">
              Xem tất cả <LayoutGrid className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {relatedJobs.map(relJob => (
              <div key={relJob.id} className="bg-white p-10 rounded-[3rem] shadow-sm border border-slate-100 hover:shadow-2xl hover:border-primary/20 transition-all group flex flex-col justify-between relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700"></div>

                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-8">
                    <div className="w-16 h-16 bg-slate-50 rounded-[1.5rem] flex items-center justify-center overflow-hidden border border-slate-100 shadow-inner group-hover:bg-primary transition-all duration-300">
                      {relJob.recruiter?.company?.logo ? (
                        <img src={`${API_URL}${relJob.recruiter.company.logo}`} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                      ) : (
                        <span className="font-black text-primary-dark text-2xl group-hover:text-white">{relJob.title[0]}</span>
                      )}
                    </div>
                    <span className="bg-primary/10 text-primary px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border border-primary/20">{relJob.type}</span>
                  </div>

                  <h3 className="text-2xl font-black text-primary-dark mb-4 group-hover:text-primary transition-colors tracking-tight leading-tight">{relJob.title}</h3>
                  <p className="text-primary font-bold text-sm mb-4">{relJob.recruiter?.company?.name || 'Công ty ẩn danh'}</p>

                  <div className="flex flex-wrap gap-4 text-slate-400 text-xs font-black uppercase tracking-widest mb-8">
                    <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> {relJob.location}</span>
                    <span className="flex items-center gap-1.5 text-accent"><DollarSign className="w-3.5 h-3.5" /> {formatSalary(relJob.salary)}</span>
                  </div>
                </div>

                <Link to={`/jobs/${relJob.id}`} className="w-full py-5 rounded-[1.5rem] bg-slate-900 text-white font-black text-center group-hover:bg-primary transition-all shadow-xl shadow-slate-900/10 uppercase text-xs tracking-widest relative z-10 block">
                  Xem chi tiết
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default JobDetail;

// Git update: Triggering change for push
