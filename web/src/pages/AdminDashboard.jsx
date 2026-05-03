// Module: pages/AdminDashboard.jsx - Quản lý logic hệ thống
import { useNavigate, Routes, Route, NavLink, Navigate } from 'react-router-dom';
import DashboardTab from './admin/DashboardTab';
import UsersTab from './admin/UsersTab';
import JobsTab from './admin/JobsTab';
import SkillsTab from './admin/SkillsTab';
import BannersTab from './admin/BannersTab';
import { Shield, ChevronRight, LogOut, LayoutDashboard, UserCog, ClipboardCheck, Database, Image as ImageIcon } from 'lucide-react';

const MENU = [
  { id: 'dashboard', label: 'Tổng quan', icon: LayoutDashboard, path: '/admin/dashboard' },
  { id: 'users', label: 'Người dùng', icon: UserCog, path: '/admin/users' },
  { id: 'jobs', label: 'Tin tuyển dụng', icon: ClipboardCheck, path: '/admin/jobs' },
  { id: 'skills', label: 'Kỹ năng', icon: Database, path: '/admin/skills' },
  { id: 'banners', label: 'Banners', icon: ImageIcon, path: '/admin/banners' },
];

const AdminDashboard = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
    window.location.reload();
  };

  return (
    <div className="flex min-h-[calc(100vh-160px)] bg-white rounded-[3rem] shadow-2xl shadow-slate-200/40 border border-slate-100 overflow-hidden w-full">
      {/* Sidebar */}
      <aside className="w-72 bg-slate-50/50 border-r border-slate-100 p-6 flex flex-col shrink-0">
        <div className="mb-6">
          <h3 className="text-lg font-black text-primary-dark flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" /> Quản trị viên
          </h3>
        </div>
        <div className="space-y-2 flex-1">
          {MENU.map(item => (
            <NavLink 
              key={item.id} 
              to={item.path}
              className={({ isActive }) => `
                w-full flex items-center justify-between p-4 rounded-2xl transition-all group
                ${isActive 
                  ? 'bg-primary text-white shadow-xl shadow-primary/20 scale-[1.02]' 
                  : 'text-slate-400 hover:bg-white hover:text-primary hover:shadow-sm'}
              `}
            >
              {({ isActive }) => (
                <>
                  <div className="flex items-center gap-3">
                    <item.icon className={`w-5 h-5 transition-colors ${isActive ? 'text-white' : 'group-hover:text-primary'}`} />
                    <span className="font-black text-xs uppercase tracking-widest">{item.label}</span>
                  </div>
                  <ChevronRight className={`w-4 h-4 transition-transform ${isActive ? 'rotate-90' : 'group-hover:translate-x-1'}`} />
                </>
              )}
            </NavLink>
          ))}
        </div>
        <div className="pt-6 border-t border-slate-200/50">
          <button onClick={handleLogout} className="w-full flex items-center gap-3 p-4 text-red-500 font-black text-xs uppercase tracking-widest hover:bg-red-50 rounded-2xl transition-all">
            <LogOut className="w-5 h-5" /> Đăng xuất
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-10 overflow-y-auto">
        <Routes>
          <Route path="/" element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<DashboardTab />} />
          <Route path="users" element={<UsersTab />} />
          <Route path="jobs" element={<JobsTab />} />
          <Route path="skills" element={<SkillsTab />} />
          <Route path="banners" element={<BannersTab />} />
        </Routes>
      </main>
    </div>
  );
};

export default AdminDashboard;

// Git update: Triggering change for push
