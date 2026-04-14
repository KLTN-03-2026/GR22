import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, MapPin, Globe, Briefcase, Building2, DollarSign, Loader2 } from 'lucide-react';
import { useCompany } from '../hooks/useCompany';
import { formatSalary } from '../utils/salaryUtils';

const stripHtml = (html) => {
  const tmp = document.createElement("DIV");
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || "";
};

const CompanyDetail = () => {
  const { id } = useParams();
  const { data: company, isLoading } = useCompany(id);

  if (isLoading) return (
    <div className="flex justify-center py-32"><Loader2 className="animate-spin w-12 h-12 text-primary" /></div>
  );

  if (!company) return (
    <div className="text-center py-32">
      <p className="text-slate-400 font-bold text-xl">Không tìm thấy công ty</p>
      <Link to="/" className="text-primary font-bold mt-4 inline-block hover:underline">← Về trang chủ</Link>
    </div>
  );

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  return (
    <div className="w-full mx-auto space-y-12 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Back */}
      <Link to="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-primary font-black text-xs uppercase tracking-widest transition-colors">
        <ArrowLeft className="w-4 h-4" /> Trang chủ
      </Link>

      {/* Company Header */}
      <div className="bg-white p-12 rounded-[3.5rem] shadow-2xl shadow-slate-200/40 border border-slate-100 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/3 rounded-full -mr-20 -mt-20"></div>
        <div className="relative z-10 flex flex-col md:flex-row gap-10 items-start">
          {/* Logo */}
          <div className="w-28 h-28 rounded-[2rem] bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0 shadow-inner overflow-hidden">
            {company.logo ? (
              <img src={`${API_URL}${company.logo}`} alt={company.name} className="w-full h-full object-cover" />
            ) : (
              <Building2 className="w-14 h-14 text-slate-200" />
            )}
          </div>

          {/* Info */}
          <div className="flex-1">
            <h1 className="text-4xl font-black text-primary-dark tracking-tighter">{company.name}</h1>
            {company.industry && (
              <span className="inline-block mt-3 bg-primary/10 text-primary px-5 py-2 rounded-full text-xs font-black uppercase tracking-widest border border-primary/20">{company.industry}</span>
            )}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-8">
              <div className="bg-slate-50 p-5 rounded-[1.5rem] border border-slate-100">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Trụ sở chính</p>
                <p className="text-primary-dark font-bold flex items-center gap-2"><MapPin className="w-4 h-4 text-primary shrink-0" /> {company.location || 'Chưa cập nhật'}</p>
              </div>
              <div className="bg-slate-50 p-5 rounded-[1.5rem] border border-slate-100">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Lĩnh vực</p>
                <p className="text-primary-dark font-bold flex items-center gap-2"><Briefcase className="w-4 h-4 text-primary shrink-0" /> {company.industry || 'Chưa cập nhật'}</p>
              </div>
              <div className="bg-slate-50 p-5 rounded-[1.5rem] border border-slate-100">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Website</p>
                {company.website ? (
                  <a href={company.website} target="_blank" rel="noopener noreferrer" className="text-primary font-bold flex items-center gap-2 hover:underline truncate"><Globe className="w-4 h-4 shrink-0" /> {company.website.replace(/^https?:\/\//, '')}</a>
                ) : (
                  <p className="text-slate-400 font-bold flex items-center gap-2"><Globe className="w-4 h-4 shrink-0" /> Chưa cập nhật</p>
                )}
              </div>
              <div className="bg-slate-50 p-5 rounded-[1.5rem] border border-slate-100">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Đang tuyển</p>
                <p className="text-accent font-black flex items-center gap-2"><Briefcase className="w-4 h-4 shrink-0" /> {company.jobs?.length || 0} vị trí</p>
              </div>
            </div>
          </div>
        </div>

        {/* Description */}
        {company.description && (
          <div className="mt-10 pt-10 border-t border-slate-100">
            <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4">Giới thiệu Công ty</h3>
            <p className="text-slate-600 font-medium leading-relaxed text-lg">{company.description}</p>
          </div>
        )}
      </div>

      {/* Company Jobs */}
      <div className="space-y-8">
        <h2 className="text-3xl font-black text-primary-dark tracking-tighter">Vị trí Đang tuyển</h2>
        {company.jobs?.length > 0 ? (
          <div className="grid md:grid-cols-2 gap-8">
            {company.jobs.map(job => (
              <div key={job.id} className="bg-white p-10 rounded-[3rem] shadow-sm border border-slate-100 hover:shadow-2xl hover:border-primary/20 transition-all group flex flex-col justify-between relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700"></div>
                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-6">
                    <div className="w-12 h-12 bg-slate-50 rounded-[1rem] flex items-center justify-center font-black text-primary-dark text-lg group-hover:bg-primary group-hover:text-white transition-all border border-slate-100">{job.title?.[0]}</div>
                    {job.type && <span className="bg-primary/10 text-primary px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-primary/20">{job.type}</span>}
                  </div>
                  <h3 className="text-xl font-black text-primary-dark mb-3 group-hover:text-primary transition-colors tracking-tight">{job.title}</h3>
                  <div className="flex flex-wrap gap-4 text-slate-400 text-xs font-black uppercase tracking-widest mb-6">
                    {job.location && <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> {job.location}</span>}
                    {job.salary && <span className="flex items-center gap-1.5 text-accent"><DollarSign className="w-3.5 h-3.5" /> {formatSalary(job.salary)}</span>}
                  </div>
                  <p className="text-slate-500 text-sm line-clamp-3 leading-relaxed font-medium">{stripHtml(job.description || '')}</p>
                </div>
                <Link to={`/jobs/${job.id}`} className="mt-8 w-full py-4 rounded-[1.5rem] bg-slate-900 text-white font-black text-center group-hover:bg-primary transition-all shadow-xl shadow-slate-900/10 uppercase text-xs tracking-widest relative z-10 block">
                  Xem chi tiết
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-16 text-center bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200">
            <p className="text-slate-400 font-bold">Hiện tại chưa có vị trí nào đang tuyển.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CompanyDetail;
