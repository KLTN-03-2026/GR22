import React from 'react';
import { Routes, Route, NavLink, useNavigate, Navigate, useLocation } from 'react-router-dom';
import { Briefcase, Building2, Settings, LogOut, ChevronRight, Plus } from 'lucide-react';
import CompanyProfile from '../components/CompanyProfile';
import RecruiterJobs from '../components/RecruiterJobs';
import PostJob from '../components/PostJob';
import EditJob from '../components/EditJob';
import JobApplications from '../components/JobApplications';

import RecruiterSettings from '../pages/recruiter/Settings';

const RecruiterDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
    window.location.reload();
  };

  const menuItems = [
    { id: 'jobs', label: 'Quản lý Tin tuyển dụng', icon: Briefcase, path: '/recruiter/jobs' },
    { id: 'post-job', label: 'Đăng Tin mới', icon: Plus, path: '/recruiter/post-job' },
    { id: 'company', label: 'Hồ sơ Công ty', icon: Building2, path: '/recruiter/company' },
    { id: 'settings', label: 'Cài đặt', icon: Settings, path: '/recruiter/settings' },
  ];

  return (
    <div className="flex min-h-[calc(100vh-160px)] bg-white rounded-[3rem] shadow-2xl shadow-slate-200/40 border border-slate-100 overflow-hidden w-full">
      {/* Sidebar */}
      <aside className="w-80 bg-slate-50/50 border-r border-slate-100 p-8 flex flex-col shrink-0">
        <div className="space-y-3 flex-1">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path || (item.id === 'jobs' && location.pathname === '/recruiter');
            return (
              <NavLink
                key={item.id}
                to={item.path}
                className={`
                  flex items-center justify-between p-5 rounded-[1.5rem] transition-all duration-300 group
                  ${isActive
                    ? 'bg-primary text-white shadow-xl shadow-primary/20 scale-[1.02]'
                    : 'text-slate-400 hover:bg-white hover:text-primary hover:shadow-sm'}
                `}
              >
                <div className="flex items-center gap-4">
                  <item.icon className={`w-6 h-6 transition-colors ${isActive ? 'text-white' : 'group-hover:text-primary'}`} />
                  <span className="font-black text-xs uppercase tracking-widest">{item.label}</span>
                </div>
                <ChevronRight className={`w-4 h-4 transition-transform ${isActive ? 'rotate-90' : 'group-hover:translate-x-1'}`} />
              </NavLink>
            );
          })}
        </div>

        <div className="pt-8 border-t border-slate-200/50">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-4 p-5 text-red-500 font-black text-xs uppercase tracking-widest hover:bg-red-50 rounded-[1.5rem] transition-all"
          >
            <LogOut className="w-6 h-6" />
            Đăng xuất
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-12 overflow-y-auto bg-white">
        <div className="w-full">
          <Routes>
            <Route path="/" element={<Navigate to="jobs" replace />} />
            <Route path="jobs" element={<RecruiterJobs />} />
            <Route path="post-job" element={<PostJob />} />
            <Route path="edit-job/:id" element={<EditJob />} />
            <Route path="applications/:id" element={<JobApplications />} />
            <Route path="company" element={<CompanyProfile />} />
            <Route path="settings" element={<RecruiterSettings />} />
          </Routes>
        </div>
      </main>
    </div>
  );
};

export default RecruiterDashboard;
