// Module: admin/BannersTab.jsx - Quản lý logic hệ thống
import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Edit3, Plus, Upload, Clock, CheckCircle, Trash2 } from 'lucide-react';

const API_URL = 'http://localhost:5000';

const BannersTab = () => {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);
  const [formData, setFormData] = useState({ title: '', link: '', order: 0, image: null });

  const fetchBanners = () => {
    setLoading(true);
    api.get('/banners/admin')
      .then(r => setBanners(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(fetchBanners, []);

  const handleFileChange = (e) => {
    setFormData({ ...formData, image: e.target.files[0] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    data.append('title', formData.title);
    data.append('link', formData.link);
    data.append('order', formData.order);
    if (formData.image) data.append('image', formData.image);

    try {
      if (editingBanner) {
        await api.put(`/banners/admin/${editingBanner.id}`, data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        await api.post('/banners/admin', data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }
      setFormData({ title: '', link: '', order: 0, image: null });
      setEditingBanner(null);
      fetchBanners();
    } catch (err) {
      alert(err.response?.data?.error || 'Lỗi khi lưu banner');
    }
  };

  const handleEdit = (banner) => {
    setEditingBanner(banner);
    setFormData({ title: banner.title, link: banner.link || '', order: banner.order, image: null });
  };

  const handleDelete = async (id) => {
    if (!confirm('Xác nhận xóa banner này?')) return;
    try {
      await api.delete(`/banners/admin/${id}`);
      fetchBanners();
    } catch (err) {
      alert('Lỗi khi xóa banner');
    }
  };

  const toggleStatus = async (banner) => {
    try {
      await api.put(`/banners/admin/${banner.id}`, { 
        status: banner.status === 'active' ? 'inactive' : 'active' 
      });
      fetchBanners();
    } catch (err) {
      alert('Lỗi khi cập nhật trạng thái');
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-5 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black text-primary-dark tracking-tighter">Quản lý Banners</h2>
          <p className="text-slate-400 font-bold text-sm">Hình ảnh hiển thị trên trang chủ người dùng</p>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm">
        <h3 className="text-lg font-black text-primary-dark mb-6 flex items-center gap-2">
          {editingBanner ? <Edit3 className="w-5 h-5 text-primary" /> : <Plus className="w-5 h-5 text-primary" />}
          {editingBanner ? 'Sửa Banner' : 'Thêm Banner Mới'}
        </h3>
        <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Tiêu đề</label>
              <input type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required
                className="w-full px-5 py-3 bg-slate-50 border-none rounded-2xl font-bold text-slate-700 placeholder:text-slate-300 focus:ring-2 focus:ring-primary/20 transition-all" />
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Liên kết (Link)</label>
              <input type="text" value={formData.link} onChange={e => setFormData({...formData, link: e.target.value})}
                className="w-full px-5 py-3 bg-slate-50 border-none rounded-2xl font-bold text-slate-700 placeholder:text-slate-300 focus:ring-2 focus:ring-primary/20 transition-all" />
            </div>
          </div>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Thứ tự ưu tiên</label>
                <input type="number" value={formData.order} onChange={e => setFormData({...formData, order: e.target.value})}
                  className="w-full px-5 py-3 bg-slate-50 border-none rounded-2xl font-bold text-slate-700 focus:ring-2 focus:ring-primary/20 transition-all" />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Hình ảnh</label>
                <div className="relative">
                  <input type="file" onChange={handleFileChange} required={!editingBanner} accept="image/*"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                  <div className="w-full px-5 py-3 bg-slate-50 border-none rounded-2xl font-bold text-slate-400 flex items-center gap-2 transition-all">
                    <Upload className="w-4 h-4" />
                    <span className="truncate">{formData.image ? formData.image.name : 'Chọn File...'}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex gap-3 pt-4">
              <button type="submit" className="flex-1 bg-primary text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:shadow-xl hover:shadow-primary/20 transition-all active:scale-95">
                {editingBanner ? 'Lưu thay đổi' : 'Tạo Banner'}
              </button>
              {editingBanner && (
                <button type="button" onClick={() => {setEditingBanner(null); setFormData({title:'', link:'', order:0, image:null})}}
                  className="px-6 bg-slate-100 text-slate-500 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-200 transition-all">
                  Hủy
                </button>
              )}
            </div>
          </div>
        </form>
      </div>

      {/* List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full py-20 bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200 text-center">
            <p className="text-slate-400 font-bold animate-pulse uppercase tracking-widest text-xs">Đang tải danh sách...</p>
          </div>
        ) : banners.map(banner => (
          <div key={banner.id} className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all group overflow-hidden flex flex-col">
            <div className="h-48 relative overflow-hidden bg-slate-100 group-hover:scale-[1.02] transition-transform duration-700">
              <img src={`${API_URL}${banner.imageUrl}`} alt={banner.title} className="w-full h-full object-cover" />
              <div className="absolute top-4 right-4 flex gap-2">
                 <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest shadow-sm ${banner.status === 'active' ? 'bg-emerald-500 text-white' : 'bg-slate-500 text-white'}`}>
                    {banner.status === 'active' ? 'Hoạt động' : 'Tạm ẩn'}
                 </span>
              </div>
            </div>
            <div className="p-6 flex-1 flex flex-col justify-between">
              <div>
                <h4 className="font-black text-primary-dark tracking-tight line-clamp-1 group-hover:text-primary transition-colors">{banner.title}</h4>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1 mb-4 truncate italic">{banner.link || 'Không có liên kết'}</p>
              </div>
              <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                <div className="flex items-center gap-1">
                  <span className="text-[10px] font-black text-primary bg-primary/10 px-2 py-0.5 rounded-md">#{banner.order}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => toggleStatus(banner)} className="p-2 text-slate-300 hover:text-primary transition-colors" title="Bật/Tắt">
                    {banner.status === 'active' ? <Clock className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                  </button>
                  <button onClick={() => handleEdit(banner)} className="p-2 text-slate-300 hover:text-amber-500 transition-colors" title="Sửa">
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(banner.id)} className="p-2 text-slate-300 hover:text-red-500 transition-colors" title="Xóa">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
        {!loading && banners.length === 0 && (
          <div className="col-span-full py-20 bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200 text-center">
            <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Chưa có banner nào được tạo.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BannersTab;

// Git update: Triggering change for push
