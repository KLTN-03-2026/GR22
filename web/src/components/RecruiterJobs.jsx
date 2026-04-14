import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Briefcase, Plus, TrendingUp, Sparkles, Loader2, MapPin, Clock, DollarSign, Edit, Users, XCircle, Trash2, CheckCircle } from 'lucide-react';
import { useRecruiterJobs, useDeleteJob, useUpdateJobStatus } from '../hooks/useJobs';
import { formatSalary } from '../utils/salaryUtils';

const stripHtml = (html) => {
  const tmp = document.createElement("DIV");
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || "";
};

const RecruiterJobs = () => {
  const navigate = useNavigate();
  const { data: jobs, isLoading: jobsLoading } = useRecruiterJobs();
  const updateStatusMutation = useUpdateJobStatus();
  const deleteMutation = useDeleteJob();
  const [filter, setFilter] = React.useState('all');

  const handleStatusToggle = async (job) => {
    const newStatus = job.status === 'active' ? 'closed' : 'active';
    const confirmMsg = newStatus === 'closed' 
      ? 'Bạn có chắc chắn muốn đóng tin tuyển dụng này? Người tìm việc sẽ không thể thấy tin này nữa.' 
      : 'Bạn muốn mở lại tin tuyển dụng này?';
    
    if (window.confirm(confirmMsg)) {
      try {
        await updateStatusMutation.mutateAsync({ id: job.id, status: newStatus });
      } catch (err) {
        alert('Lỗi khi cập nhật trạng thái');
      }
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('CẢNH BÁO: Bạn có chắc chắn muốn XÓA tin tuyển dụng này? Hành động này không thể hoàn tác.')) {
      try {
        await deleteMutation.mutateAsync(id);
      } catch (err) {
        alert('Lỗi khi xóa tin');
      }
    }
  };

  const filteredJobs = jobs?.filter(job => {
    if (filter === 'all') return true;
    return job.status === filter;
  });

  const statusConfig = {
    active: { label: 'Đang hoạt động', color: 'bg-green-100 text-green-700 border-green-200' },
    pending: { label: 'Chờ duyệt', color: 'bg-amber-100 text-amber-700 border-amber-200' },
    closed: { label: 'Đã đóng', color: 'bg-red-100 text-red-700 border-red-200' },
  };

  if (jobsLoading) {
    return (
      <div className="flex justify-center p-20">
        <Loader2 className="animate-spin w-12 h-12 text-primary" />
      </div>
    );
  }

  return (
    <div className="w-full space-y-12 animate-in fade-in slide-in-from-right-4 duration-500 pb-20">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-5xl font-black text-primary-dark tracking-tighter">Tuyển dụng</h2>
          <p className="text-slate-500 font-bold mt-2 text-lg">Phát triển đội ngũ của bạn với sức mạnh AI</p>
        </div>
        <button
          onClick={() => navigate('/recruiter/post-job')}
          className="bg-primary text-white px-10 py-5 rounded-[2rem] font-black shadow-2xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-3 text-lg"
        >
          <Plus className="w-6 h-6" /> Đăng Tin mới
        </button>
      </div>

      <div className="flex gap-3 flex-wrap">
        {['all', 'pending', 'active', 'closed'].map(s => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`
              px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all
              ${filter === s 
                ? 'bg-primary text-white shadow-xl shadow-primary/20 scale-105' 
                : 'bg-white text-slate-400 hover:bg-slate-50 border border-slate-100'}
            `}
          >
            {s === 'all' ? 'Tất cả' : statusConfig[s]?.label || s}
          </button>
        ))}
      </div>

      <div className="grid lg:grid-cols-1 gap-12">
        <div className="space-y-8">
          <h3 className="text-3xl font-black text-primary-dark flex items-center gap-4">
            <span className="p-3 bg-primary/10 rounded-2xl"><Briefcase className="text-primary w-8 h-8" /></span>
            {filter === 'all' ? 'Tất cả tin tuyển dụng' : `Tin ${statusConfig[filter]?.label}`}
          </h3>
          <div className="space-y-6">
            {filteredJobs?.length > 0 ? filteredJobs.map(job => (
              <div key={job.id} className="bg-white p-10 rounded-[3rem] shadow-sm border border-slate-100 hover:shadow-2xl hover:border-primary/20 transition-all group overflow-hidden relative">
                <div className="absolute top-0 right-0 w-40 h-40 bg-primary/5 rounded-full -mr-20 -mt-20 group-hover:scale-150 transition-transform duration-1000"></div>
                <div className="flex justify-between items-start mb-6 relative z-10">
                  <h4 className="text-2xl font-black text-primary-dark group-hover:text-primary transition-colors">{job.title}</h4>
                  <span className={`px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border ${statusConfig[job.status]?.color || 'bg-slate-100 text-slate-700 border-slate-200'}`}>
                    {statusConfig[job.status]?.label || job.status}
                  </span>
                </div>

                <div className="flex flex-wrap gap-4 mb-6 relative z-10 text-slate-400 font-bold text-sm">
                  <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {job.location}</span>
                  <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {job.type}</span>
                  <span className="flex items-center gap-1 font-black text-primary"><DollarSign className="w-4 h-4" /> {formatSalary(job.salary)}</span>
                </div>

                <div className="flex items-center gap-3 mb-8 relative z-10">
                  <button 
                    onClick={() => navigate(`/recruiter/edit-job/${job.id}`)}
                    className="flex-1 py-4 bg-slate-50 text-slate-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-primary/5 hover:text-primary border border-slate-100 transition-all flex items-center justify-center gap-2"
                  >
                    <Edit className="w-4 h-4" /> Chỉnh sửa
                  </button>
                  <button 
                    onClick={() => navigate(`/recruiter/applications/${job.id}`)}
                    className="flex-1 py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-primary transition-all shadow-xl shadow-slate-900/10 flex items-center justify-center gap-2"
                  >
                    <Users className="w-4 h-4" /> Ứng viên
                  </button>
                  
                  {job.status !== 'pending' && (
                    <button 
                      onClick={() => handleStatusToggle(job)}
                      disabled={updateStatusMutation.isPending}
                      className={`flex-1 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 border
                        ${job.status === 'active' 
                          ? 'bg-amber-50 text-amber-600 border-amber-100 hover:bg-amber-100' 
                          : 'bg-green-50 text-green-600 border-green-100 hover:bg-green-100'}`}
                    >
                      {job.status === 'active' ? (
                        <><XCircle className="w-4 h-4" /> Đóng tin</>
                      ) : (
                        <><CheckCircle className="w-4 h-4" /> Mở lại</>
                      )}
                    </button>
                  )}

                  <button 
                    onClick={() => handleDelete(job.id)}
                    disabled={deleteMutation.isPending}
                    className="p-4 bg-red-50 text-red-500 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-red-500 hover:text-white border border-red-100 transition-all flex items-center justify-center"
                    title="Xóa tin"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <p className="text-slate-500 text-base line-clamp-2 mb-8 relative z-10 leading-relaxed font-medium">
                  {stripHtml(job.description)}
                </p>
                <div className="flex flex-wrap gap-2 relative z-10">
                  {job.Skills?.map(skill => (
                    <span key={skill.id} className="bg-slate-50 text-slate-500 px-4 py-2 rounded-xl text-xs font-black border border-slate-100">
                      {skill.name}
                    </span>
                  ))}
                </div>
              </div>
            )) : (
              <div className="bg-slate-50 p-20 rounded-[3.5rem] border-2 border-dashed border-slate-200 text-center space-y-4">
                <div className="w-20 h-20 bg-white rounded-3xl shadow-sm flex items-center justify-center mx-auto text-slate-200">
                  <Briefcase className="w-10 h-10" />
                </div>
                <p className="text-slate-400 font-bold text-xl">Chưa có tin tuyển dụng nào được đăng.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecruiterJobs;
