import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Search, CheckCircle, Clock, XCircle, Trash2, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';

const JobsTab = () => {
  const [jobs, setJobs] = useState([]);
  const [filter, setFilter] = useState('');
  const [search, setSearch] = useState('');

  const fetchJobs = () => {
    const params = {};
    if (filter) params.status = filter;
    if (search) params.search = search;
    api.get('/admin/jobs', { params }).then(r => setJobs(r.data)).catch(console.error);
  };

  useEffect(fetchJobs, [filter, search]);

  const handleStatusChange = async (id, status) => {
    try {
      await api.put(`/admin/jobs/${id}/status`, { status });
      fetchJobs();
    } catch (err) {
      alert(err.response?.data?.error || 'Lỗi');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Xác nhận xóa tin tuyển dụng này?')) return;
    try {
      await api.delete(`/admin/jobs/${id}`);
      fetchJobs();
    } catch (err) {
      alert(err.response?.data?.error || 'Lỗi');
    }
  };

  const statusConfig = {
    active: { label: 'Hoạt động', color: 'bg-green-100 text-green-700', icon: CheckCircle },
    pending: { label: 'Chờ duyệt', color: 'bg-amber-100 text-amber-700', icon: Clock },
    closed: { label: 'Đã đóng', color: 'bg-red-100 text-red-700', icon: XCircle },
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-black text-primary-dark tracking-tighter">Quản lý Tin tuyển dụng</h2>
        <span className="text-sm font-bold text-slate-400">{jobs.length} tin</span>
      </div>

      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[250px]">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Tìm theo tên công việc..."
            className="w-full pl-10 pr-4 py-3 bg-slate-50 border-none rounded-xl font-bold text-sm text-slate-700 placeholder:text-slate-300 focus:ring-2 focus:ring-primary/20" />
        </div>
        {['', 'pending', 'active', 'closed'].map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className={`px-4 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all
              ${filter === s ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>
            {s ? (statusConfig[s]?.label || s) : 'Tất cả'}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {jobs.map(job => {
          const sc = statusConfig[job.status] || statusConfig.active;
          return (
            <div key={job.id} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="text-lg font-bold text-slate-800">{job.title}</h4>
                    <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider flex items-center gap-1 ${sc.color}`}>
                      <sc.icon className="w-3 h-3" /> {sc.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-slate-400 font-semibold">
                    <span>🏢 {job.company?.name || 'N/A'}</span>
                    <span>👤 {job.recruiter?.email || 'N/A'}</span>
                    <span>📍 {job.location || 'N/A'}</span>
                    <span>💰 {job.salary || 'N/A'}</span>
                    <span>📅 {new Date(job.createdAt).toLocaleDateString('vi-VN')}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {job.status === 'pending' && (
                    <button onClick={() => handleStatusChange(job.id, 'active')}
                      className="flex items-center gap-1 px-4 py-2 bg-green-500 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-green-600 transition-all">
                      <CheckCircle className="w-3 h-3" /> Duyệt
                    </button>
                  )}
                  {job.status === 'active' && (
                    <button onClick={() => handleStatusChange(job.id, 'closed')}
                      className="flex items-center gap-1 px-4 py-2 bg-amber-500 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-amber-600 transition-all">
                      <XCircle className="w-3 h-3" /> Đóng
                    </button>
                  )}
                  {job.status === 'closed' && (
                    <button onClick={() => handleStatusChange(job.id, 'active')}
                      className="flex items-center gap-1 px-4 py-2 bg-blue-500 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-blue-600 transition-all">
                      <CheckCircle className="w-3 h-3" /> Mở lại
                    </button>
                  )}
                  <Link
                    to={`/jobs/${job.id}`}
                    target="_blank"
                    className="p-2 text-slate-300 hover:text-primary transition-colors"
                    title="Xem chi tiết"
                  >
                    <Eye className="w-5 h-5" />
                  </Link>
                  <button onClick={() => handleDelete(job.id)}
                    className="p-2 text-slate-300 hover:text-red-500 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
        {jobs.length === 0 && <p className="text-center py-10 text-slate-400 font-bold">Không tìm thấy tin tuyển dụng</p>}
      </div>
    </div>
  );
};

export default JobsTab;
