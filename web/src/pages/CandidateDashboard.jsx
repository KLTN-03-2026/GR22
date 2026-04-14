import React from 'react';
import { Routes, Route, NavLink, useNavigate, Navigate, useLocation } from 'react-router-dom';
import { User, FileText, Briefcase, Settings, LogOut, ChevronRight } from 'lucide-react';
import CandidateProfile from '../components/CandidateProfile';
import CVList from '../components/CVList';
import CVEditor from '../components/CVEditor';
import MyApplications from '../components/MyApplications';
import JobRecommendations from './JobRecommendations';
import CandidateSettings from '../components/CandidateSettings';

const CandidateDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
    window.location.reload();
  };

  const menuItems = [
    { id: 'profile', label: 'Thông tin Cá nhân', icon: User, path: '/candidate/profile' },
    { id: 'cv', label: 'Quản lý CV', icon: FileText, path: '/candidate/cv' },
    { id: 'jobs', label: 'Việc làm Phù hợp', icon: Briefcase, path: '/candidate/jobs' },
    { id: 'settings', label: 'Cài đặt', icon: Settings, path: '/candidate/settings' },
  ];

  return (
    <div className="flex min-h-[calc(100vh-160px)] bg-white rounded-[3rem] shadow-2xl shadow-slate-200/40 border border-slate-100 overflow-hidden w-full">
      {/* Sidebar */}
      <aside className="w-80 bg-slate-50/50 border-r border-slate-100 p-8 flex flex-col shrink-0">
        <div className="space-y-3 flex-1">
          {menuItems.map((item) => {
            const isActive = location.pathname.startsWith(item.path);
            return (
              <NavLink
                key={item.id}
                to={item.path}
                className={`flex items-center justify-between p-5 rounded-[1.5rem] transition-all duration-300 group
                  ${isActive ? 'bg-primary text-white shadow-xl shadow-primary/20 scale-[1.02]' : 'text-slate-400 hover:bg-white hover:text-primary hover:shadow-sm'}`}
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
          <button onClick={handleLogout} className="w-full flex items-center gap-4 p-5 text-red-500 font-black text-xs uppercase tracking-widest hover:bg-red-50 rounded-[1.5rem] transition-all">
            <LogOut className="w-6 h-6" /> Đăng xuất
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-12 overflow-y-auto bg-white">
        <div className="w-full">
          <Routes>
            <Route path="/" element={<Navigate to="profile" replace />} />
            <Route path="profile" element={<CandidateProfile />} />
            <Route path="cv" element={<CVList />} />
            <Route path="cv/create" element={<CVEditor />} />
            <Route path="cv/edit/:id" element={<CVEditor />} />
            <Route path="cv/:id/recommendations" element={<JobRecommendations />} />
            <Route path="jobs" element={<MyApplications />} />
            <Route path="settings" element={<CandidateSettings />} />
          </Routes>
        </div>
      </main>
    </div>
  );
};

export default CandidateDashboard;
