import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Plus, Trash2 } from 'lucide-react';

const SkillsTab = () => {
  const [skills, setSkills] = useState([]);
  const [newSkill, setNewSkill] = useState('');

  const fetchSkills = () => {
    api.get('/admin/skills').then(r => setSkills(r.data)).catch(console.error);
  };

  useEffect(fetchSkills, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newSkill) return;
    try {
      await api.post('/admin/skills', { name: newSkill });
      setNewSkill('');
      fetchSkills();
    } catch (err) {
      alert('Không thể thêm kỹ năng');
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/admin/skills/${id}`);
      fetchSkills();
    } catch (err) {
      alert('Không thể xóa kỹ năng');
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-black text-primary-dark tracking-tighter">Quản lý Kỹ năng</h2>
      <form onSubmit={handleAdd} className="flex gap-3">
        <input type="text" value={newSkill} onChange={e => setNewSkill(e.target.value)} placeholder="Thêm kỹ năng mới (VD: Docker, Figma)..."
          className="flex-1 px-5 py-3 bg-slate-50 border-none rounded-xl font-bold text-sm text-slate-700 placeholder:text-slate-300 focus:ring-2 focus:ring-primary/20" />
        <button type="submit" className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-xl font-bold hover:bg-primary-light transition-all">
          <Plus className="w-4 h-4" /> Thêm
        </button>
      </form>
      <div className="flex flex-wrap gap-3">
        {skills.map(skill => (
          <div key={skill.id} className="group flex items-center gap-2 bg-white px-4 py-3 rounded-xl border border-slate-200 hover:border-primary/40 transition-all shadow-sm">
            <span className="font-bold text-slate-600 text-sm">{skill.name}</span>
            <button onClick={() => handleDelete(skill.id)} className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
      {skills.length === 0 && <p className="text-center py-10 text-slate-400 font-bold">Chưa có kỹ năng nào</p>}
    </div>
  );
};

export default SkillsTab;
