import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Plus, Loader2, Trash2, Edit, MapPin, Briefcase, Calendar, Sparkles } from 'lucide-react';
import { useCVList, useDeleteCV } from '../hooks/useCV';
import toast from 'react-hot-toast';

const CVList = () => {
  const navigate = useNavigate();
  const { data: cvList, isLoading } = useCVList();
  const deleteMutation = useDeleteCV();

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Bạn có chắc muốn xóa CV này?')) return;
    try {
      await deleteMutation.mutateAsync(id);
      toast.success('Đã xóa CV', { style: { borderRadius: '1.5rem', background: '#0F172A', color: '#fff', fontWeight: 'bold' } });
    } catch { toast.error('Không thể xóa CV'); }
  };

  if (isLoading) return (
    <div className="flex justify-center p-20"><Loader2 className="animate-spin w-12 h-12 text-primary" /></div>
  );

  return (
    <div className="w-full space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-5xl font-black text-primary-dark tracking-tighter">Quản lý CV</h2>
          <p className="text-slate-500 font-bold mt-2 text-lg">Tạo và quản lý danh sách CV của bạn</p>
        </div>
        <button
          onClick={() => navigate('/candidate/cv/create')}
          className="bg-gradient-to-r from-primary to-primary-light text-white px-10 py-5 rounded-[2rem] font-black shadow-2xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-3 text-lg"
        >
          <Plus className="w-6 h-6" /> Tạo CV Mới
        </button>
      </div>

      {/* CV Grid */}
      {(!cvList || cvList.length === 0) ? (
        <div className="py-20 text-center space-y-6">
          <div className="w-32 h-32 bg-slate-50 rounded-[3rem] flex items-center justify-center mx-auto border border-slate-100 shadow-inner">
            <FileText className="w-16 h-16 text-slate-200" />
          </div>
          <div>
            <h3 className="text-3xl font-black text-primary-dark tracking-tighter">Chưa có CV nào</h3>
            <p className="text-slate-400 font-bold mt-2">Bắt đầu tạo CV đầu tiên của bạn ngay!</p>
          </div>
          <button
            onClick={() => navigate('/candidate/cv/create')}
            className="bg-primary text-white px-10 py-4 rounded-[2rem] font-black hover:scale-105 transition-all inline-flex items-center gap-2 shadow-xl shadow-primary/20"
          >
            <Plus className="w-5 h-5" /> Tạo CV Mới
          </button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {cvList.map(cv => (
            <div
              key={cv.id}
              onClick={() => navigate(`/candidate/cv/edit/${cv.id}`)}
              className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 hover:shadow-2xl hover:shadow-primary/5 hover:border-primary/20 transition-all cursor-pointer group relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/3 rounded-full -mr-10 -mt-10 group-hover:bg-primary/5 transition-all"></div>

              <div className="relative z-10 space-y-4">
                <div className="flex justify-between items-start">
                  <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center">
                    <FileText className="w-7 h-7 text-primary" />
                  </div>
                  <div className="flex gap-2">
                    <button onClick={(e) => { e.stopPropagation(); navigate(`/candidate/cv/edit/${cv.id}`); }}
                      className="p-2.5 bg-slate-50 rounded-xl text-slate-400 hover:bg-primary/10 hover:text-primary transition-all">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button onClick={(e) => handleDelete(cv.id, e)}
                      className="p-2.5 bg-slate-50 rounded-xl text-slate-400 hover:bg-red-50 hover:text-red-500 transition-all">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-black text-primary-dark tracking-tight">{cv.title || 'CV Mới'}</h3>
                  <p className="text-primary font-bold text-sm mt-1">{cv.fullName || 'Chưa đặt tên'}</p>
                </div>

                <div className="space-y-2 text-slate-400 text-xs font-bold">
                  {cv.jobTitle && (
                    <div className="flex items-center gap-2"><Briefcase className="w-3.5 h-3.5" /> {cv.jobTitle}</div>
                  )}
                  {cv.location && (
                    <div className="flex items-center gap-2"><MapPin className="w-3.5 h-3.5" /> {cv.location}</div>
                  )}
                  <div className="flex items-center gap-2"><Calendar className="w-3.5 h-3.5" /> {new Date(cv.updatedAt).toLocaleDateString('vi-VN')}</div>
                </div>

                <div className="pt-4 border-t border-slate-50 flex gap-2">
                  <button onClick={(e) => { e.stopPropagation(); navigate(`/candidate/cv/${cv.id}/recommendations`); }}
                    className="flex-1 bg-primary/10 text-primary py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-primary hover:text-white transition-all flex items-center justify-center gap-2 border border-primary/20">
                    <Sparkles className="w-4 h-4" /> Tìm việc
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); navigate(`/candidate/cv/edit/${cv.id}`); }}
                    className="flex-1 bg-slate-50 text-slate-400 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-100 hover:text-primary transition-all flex items-center justify-center gap-2">
                    <Edit className="w-4 h-4" /> Sửa
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CVList;
