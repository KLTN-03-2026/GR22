import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useRecommendations } from '../hooks/useCV';
import { Sparkles, Loader2, ArrowLeft, Target, Briefcase, MapPin, DollarSign, ChevronRight, AlertCircle } from 'lucide-react';

const JobRecommendations = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data, isLoading, error } = useRecommendations(id);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 gap-6">
        <div className="relative">
          <Loader2 className="w-16 h-16 text-primary animate-spin" />
          <Sparkles className="w-8 h-8 text-accent absolute -top-2 -right-2 animate-bounce" />
        </div>
        <div className="text-center space-y-2">
          <p className="text-2xl font-black text-primary-dark tracking-tighter">AI Đang phân tích công việc phù hợp...</p>
          <p className="text-slate-400 font-bold text-sm uppercase tracking-widest">Hệ thống đang so khớp CV của bạn với hàng ngàn cơ hội</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
        <div className="bg-white p-10 rounded-[3rem] shadow-xl max-w-md text-center space-y-6 border-2 border-red-50">
          <div className="w-20 h-20 bg-red-50 rounded-[2rem] flex items-center justify-center mx-auto text-red-400"><AlertCircle className="w-10 h-10" /></div>
          <h3 className="text-2xl font-black text-slate-800">Đã có lỗi xảy ra</h3>
          <p className="text-slate-500 font-bold">{error.message || 'Không thể lấy dữ liệu gợi ý.'}</p>
          <button onClick={() => navigate(-1)} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black transition-all hover:bg-slate-800 flex items-center justify-center gap-2"><ArrowLeft className="w-5 h-5" /> Quay lại</button>
        </div>
      </div>
    );
  }

  const recommendations = data?.recommendations || [];

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-8 md:p-12">
      <div className="max-w-[1400px] mx-auto space-y-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="space-y-4">
            <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-400 hover:text-primary font-black text-xs uppercase tracking-widest transition-all group">
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-all" /> Quay lại danh sách CV
            </button>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-primary rounded-[2rem] flex items-center justify-center text-white shadow-2xl shadow-primary/30">
                <Target className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-5xl font-black text-primary-dark tracking-tighter">Việc làm phù hợp</h1>
                <p className="text-slate-400 font-bold text-lg mt-1 italic">AI đã tìm thấy {recommendations.length} cơ hội tốt nhất cho bạn</p>
              </div>
            </div>
          </div>
        </div>

        {recommendations.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {recommendations.map((rec, idx) => (
              <div key={idx} className="bg-white rounded-[3.5rem] border border-slate-100 p-10 hover:shadow-2xl hover:shadow-primary/5 transition-all group relative overflow-hidden">
                {/* Match Score Badge */}
                <div className="absolute top-10 right-10">
                  <div className="flex flex-col items-center">
                    <div className="text-4xl font-black text-primary tracking-tighter">{Math.round(rec.match_score)}%</div>
                    <div className="text-[10px] font-black text-slate-300 uppercase tracking-widest mt-1">Phù hợp</div>
                  </div>
                </div>

                <div className="space-y-8">
                  {/* Job Header */}
                  <div className="flex gap-6 items-start">
                    <div className="w-20 h-20 rounded-[2rem] bg-slate-50 border border-slate-100 flex items-center justify-center overflow-hidden shrink-0">
                      {rec.job?.company?.logo ? (
                        <img src={`http://localhost:5000${rec.job.company.logo}`} alt={rec.job.company.name} className="w-full h-full object-cover" />
                      ) : (
                        <Briefcase className="w-8 h-8 text-slate-300" />
                      )}
                    </div>
                    <div className="flex-1 pr-16">
                      <h3 className="text-2xl font-black text-slate-800 line-clamp-1 mb-1">{rec.job?.title}</h3>
                      <p className="text-lg font-bold text-primary italic">{rec.job?.company?.name || 'Công ty ẩn danh'}</p>
                    </div>
                  </div>

                  {/* Info Grid */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-3 text-slate-500 font-bold text-sm bg-slate-50 p-4 rounded-2xl">
                      <MapPin className="w-4 h-4 text-primary" /> {rec.job?.location || 'Toàn quốc'}
                    </div>
                    <div className="flex items-center gap-3 text-slate-500 font-bold text-sm bg-slate-50 p-4 rounded-2xl">
                      <DollarSign className="w-4 h-4 text-green-500" /> {rec.job?.salary || 'Thỏa thuận'}
                    </div>
                  </div>

                  {/* AI Reason */}
                  <div className="bg-primary/5 p-6 rounded-[2.5rem] border border-primary/10 relative group-hover:bg-primary/10 transition-all">
                    <div className="flex items-center gap-2 mb-2">
                       <Sparkles className="w-4 h-4 text-primary" />
                       <span className="text-[10px] font-black text-primary uppercase tracking-widest">Phân tích AI</span>
                    </div>
                    <p className="text-slate-600 font-bold text-sm leading-relaxed italic pr-4">"{rec.reason}"</p>
                  </div>

                  {/* Action */}
                  <Link to={`/jobs/${rec.job?.id}`} className="w-full py-5 bg-slate-900 text-white rounded-[2rem] font-black text-lg flex items-center justify-center gap-2 hover:bg-primary hover:shadow-xl hover:shadow-primary/30 transition-all">
                    Xem chi tiết công việc <ChevronRight className="w-5 h-5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-[4rem] p-32 text-center space-y-8 border-2 border-dashed border-slate-100">
            <div className="w-32 h-32 bg-slate-50 rounded-[3rem] flex items-center justify-center mx-auto text-slate-200">
              <Target className="w-16 h-16" />
            </div>
            <div className="space-y-4">
              <h3 className="text-4xl font-black text-slate-800 tracking-tighter">Không tìm thấy công việc phù hợp</h3>
              <p className="text-slate-400 font-bold text-xl max-w-lg mx-auto italic">AI hiện chưa tìm thấy công việc nào khớp với các tiêu chí trong CV của bạn. Hãy thử cập nhật thêm kỹ năng hoặc kinh nghiệm!</p>
            </div>
            <Link to="/jobs" className="inline-flex items-center gap-3 px-12 py-5 bg-primary text-white rounded-[2rem] font-black text-lg hover:shadow-2xl hover:shadow-primary/30 transition-all">
              Tất cả công việc <Target className="w-6 h-6" />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default JobRecommendations;
