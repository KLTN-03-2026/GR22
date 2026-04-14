import React from 'react';
import { useMyApplications } from '../hooks/useApplications';
import {
  Briefcase,
  Building2,
  MapPin,
  Clock,
  Star,
  Loader2,
  ChevronRight,
  ExternalLink,
  AlertCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatSalary } from '../utils/salaryUtils';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const MyApplications = () => {
  const { data: applications, isLoading } = useMyApplications();

  const getStatusStyle = (status) => {
    switch (status) {
      case 'accepted': return 'bg-green-100 text-green-700 border-green-200';
      case 'rejected': return 'bg-red-100 text-red-700 border-red-200';
      case 'reviewed': return 'bg-blue-100 text-blue-700 border-blue-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'accepted': return 'Được chấp nhận';
      case 'rejected': return 'Đã từ chối';
      case 'reviewed': return 'Đã xem hồ sơ';
      default: return 'Đang chờ duyệt';
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center p-20">
        <Loader2 className="animate-spin w-12 h-12 text-primary" />
      </div>
    );
  }

  return (
    <div className="w-full space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div>
        <h2 className="text-5xl font-black text-primary-dark tracking-tighter">Việc làm đã ứng tuyển</h2>
        <p className="text-slate-500 font-bold mt-2 text-lg text-uppercase tracking-widest">Theo dõi trạng thái hồ sơ của bạn</p>
      </div>

      <div className="grid gap-8">
        {applications?.length > 0 ? (
          applications.map((app) => (
            <div key={app.id} className="bg-white p-10 rounded-[3rem] shadow-sm border border-slate-100 hover:shadow-2xl hover:border-primary/20 transition-all group relative overflow-hidden">
              <div className="absolute top-0 right-0 w-40 h-40 bg-slate-50 rounded-full -mr-20 -mt-20 group-hover:scale-110 transition-transform duration-700"></div>

              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 relative z-10">
                <div className="flex items-start gap-8 flex-1">
                  <div className="w-20 h-20 bg-slate-50 rounded-[2rem] border border-slate-100 flex items-center justify-center overflow-hidden shrink-0 shadow-inner group-hover:border-primary/20 transition-colors">
                    {app.Job?.recruiter?.company?.logo ? (
                      <img src={`${API_URL}${app.Job.recruiter.company.logo}`} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <Building2 className="w-10 h-10 text-slate-200" />
                    )}
                  </div>

                  <div className="space-y-3">
                    <div className="flex flex-wrap gap-2">
                      <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${getStatusStyle(app.status)}`}>
                        {getStatusLabel(app.status)}
                      </span>
                      <span className="bg-slate-50 text-slate-400 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-slate-100">
                        {app.Job?.type}
                      </span>
                    </div>

                    <h3 className="text-3xl font-black text-primary-dark group-hover:text-primary transition-colors tracking-tighter">
                      {app.Job?.title}
                    </h3>

                    <div className="flex flex-wrap gap-6 text-slate-400 font-bold text-sm">
                      <span className="flex items-center gap-2 text-primary-dark font-black">
                        <Building2 className="w-4 h-4 text-primary" /> {app.Job?.recruiter?.company?.name || 'Công ty ẩn danh'}
                      </span>
                      <span className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" /> {app.Job?.location}
                      </span>
                      <span className="flex items-center gap-2">
                        <Clock className="w-4 h-4" /> Nộp ngày {new Date(app.createdAt).toLocaleDateString('vi-VN')}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex lg:flex-col items-center lg:items-end justify-between lg:justify-center gap-6 lg:border-l lg:border-slate-100 lg:pl-12">
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest mb-1">AI Match Score</p>
                      <div className="text-4xl font-black text-primary tracking-tighter">
                        {Math.round(app.matchScore || 0)}%
                      </div>
                    </div>
                    <div className="w-16 h-16 rounded-[1.5rem] bg-primary/5 flex items-center justify-center">
                      <Star className="w-8 h-8 text-primary fill-primary/20" />
                    </div>
                  </div>

                  <Link
                    to={`/jobs/${app.jobId}`}
                    className="flex items-center gap-3 bg-slate-900 text-white px-8 py-4 rounded-[1.5rem] font-black text-xs uppercase tracking-widest hover:bg-primary transition-all shadow-xl shadow-slate-900/10"
                  >
                    Xem chi tiết <ExternalLink className="w-4 h-4" />
                  </Link>
                </div>
              </div>

              {app.status === 'accepted' && (
                <div className="mt-8 p-6 bg-green-50 rounded-[2rem] border border-green-100 flex gap-4 animate-in slide-in-from-top-4 duration-500">
                  <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center shrink-0">
                    <AlertCircle className="w-6 h-6 text-green-500" />
                  </div>
                  <div>
                    <h4 className="font-black text-green-800 text-sm">Tin vui! Hồ sơ của bạn đã được chấp nhận</h4>
                    <p className="text-green-700 text-sm font-medium mt-1">
                      Nhà tuyển dụng đã gửi thông tin phỏng vấn vào email của bạn. Vui lòng kiểm tra hộp thư đến (và thư rác) để không bỏ lỡ cơ hội nhé!
                    </p>
                  </div>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="text-center py-24 bg-white rounded-[4rem] border-2 border-dashed border-slate-100 shadow-sm">
            <div className="w-24 h-24 bg-slate-50 rounded-[2rem] flex items-center justify-center mx-auto mb-8 text-slate-200">
              <Briefcase className="w-12 h-12" />
            </div>
            <h3 className="text-2xl font-black text-primary-dark tracking-tighter uppercase mb-4">Bạn chưa ứng tuyển công việc nào</h3>
            <p className="text-slate-400 font-bold mb-8 italic">Bắt đầu tìm kiếm cơ hội ngay hôm nay!</p>
            <Link to="/jobs" className="bg-primary text-white px-10 py-5 rounded-[2rem] font-black shadow-2xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all text-sm uppercase tracking-widest">
              Khám phá việc làm
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyApplications;
