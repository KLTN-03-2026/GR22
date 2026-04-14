import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Search, Trash2, Briefcase } from 'lucide-react';

const API_URL = 'http://localhost:5000';

const UsersTab = () => {
  const [users, setUsers] = useState([]);
  const [filter, setFilter] = useState('');
  const [search, setSearch] = useState('');

  const fetchUsers = () => {
    const params = {};
    if (filter) params.role = filter;
    if (search) params.search = search;
    api.get('/admin/users', { params }).then(r => setUsers(r.data)).catch(console.error);
  };

  useEffect(fetchUsers, [filter, search]);

  const handleDelete = async (id) => {
    if (!confirm('Xác nhận xóa người dùng này?')) return;
    try {
      await api.delete(`/admin/users/${id}`);
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.error || 'Lỗi');
    }
  };

  const handleRoleChange = async (id, newRole) => {
    try {
      await api.put(`/admin/users/${id}/role`, { role: newRole });
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.error || 'Lỗi');
    }
  };

  const roleColors = {
    candidate: 'bg-blue-100 text-blue-700',
    recruiter: 'bg-violet-100 text-violet-700',
    admin: 'bg-red-100 text-red-700',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-black text-primary-dark tracking-tighter">Quản lý Người dùng</h2>
        <span className="text-sm font-bold text-slate-400">{users.length} người dùng</span>
      </div>

      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[250px]">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Tìm theo email..."
            className="w-full pl-10 pr-4 py-3 bg-slate-50 border-none rounded-xl font-bold text-sm text-slate-700 placeholder:text-slate-300 focus:ring-2 focus:ring-primary/20" />
        </div>
        {['', 'candidate', 'recruiter', 'admin'].map(r => (
          <button key={r} onClick={() => setFilter(r)}
            className={`px-4 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all
              ${filter === r ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>
            {r || 'Tất cả'}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
        <table className="w-full">
          <thead>
            <tr className="text-left text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
              <th className="p-4">ID</th>
              <th className="p-4">Email</th>
              <th className="p-4">Họ tên</th>
              <th className="p-4">Đối tác / Công ty</th>
              <th className="p-4">Vai trò</th>
              <th className="p-4 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {users.map(user => (
              <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="p-4 text-sm font-bold text-slate-400">#{user.id}</td>
                <td className="p-4 text-sm font-bold text-slate-700">{user.email}</td>
                <td className="p-4 text-sm font-semibold text-slate-500">{user.fullName || '—'}</td>
                <td className="p-4">
                  {user.role === 'recruiter' && user.company ? (
                    <div className="flex items-center gap-3">
                       <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center overflow-hidden shrink-0 shadow-sm">
                          {user.company.logo ? (
                            <img src={`${API_URL}${user.company.logo}`} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <Briefcase className="w-5 h-5 text-slate-300" />
                          )}
                       </div>
                       <div>
                          <p className="text-xs font-black text-slate-700 leading-tight">{user.company.name}</p>
                          <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest mt-0.5">{user.company.industry || 'Chưa cập nhật'}</p>
                       </div>
                    </div>
                  ) : (
                    <span className="text-xs text-slate-300 font-bold">—</span>
                  )}
                </td>
                <td className="p-4">
                  <select value={user.role} onChange={e => handleRoleChange(user.id, e.target.value)}
                    className={`px-3 py-1 rounded-lg text-xs font-black border-none cursor-pointer ${roleColors[user.role] || 'bg-slate-100 text-slate-600'}`}>
                    <option value="candidate">Ứng viên</option>
                    <option value="recruiter">NTD</option>
                    <option value="admin">Admin</option>
                  </select>
                </td>
                <td className="p-4 text-right">
                  {user.role !== 'admin' && (
                    <button onClick={() => handleDelete(user.id)} className="text-slate-300 hover:text-red-500 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {users.length === 0 && <p className="text-center py-10 text-slate-400 font-bold">Không tìm thấy người dùng</p>}
      </div>
    </div>
  );
};

export default UsersTab;
