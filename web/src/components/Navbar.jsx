<<<<<<< HEAD
=======
// Module: components/Navbar.jsx - Quản lý logic hệ thống
/**
 * Navbar Component
 * Provides navigation links and user authentication status.
 */
>>>>>>> eda2b13 (update code)
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { Briefcase, User, LogOut, LayoutDashboard } from 'lucide-react';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const navLinks = [
    { name: 'Trang chủ', path: '/' },
    { name: 'Tìm việc làm', path: '/jobs' },
  ];

  return (
    <nav className="glass sticky top-4 mx-4 z-50 px-8 py-5 rounded-[2rem] flex justify-between items-center shadow-2xl shadow-slate-200/50 border border-white/20">
      <Link to="/" className="flex items-center gap-3 text-primary font-black text-2xl tracking-tighter group">
        <div className="w-10 h-10 bg-primary text-white rounded-xl flex items-center justify-center shadow-lg shadow-primary/30 group-hover:scale-110 transition-transform">
          <Briefcase className="w-6 h-6" />
        </div>
        <span className="hidden md:block">CV Analyst <span className="text-primary-dark">Pro</span></span>
      </Link>
      
      <div className="flex items-center gap-10">
        {navLinks.map((link) => {
          const isActive = location.pathname === link.path;
          return (
            <Link 
              key={link.path} 
              to={link.path} 
              className={`
                relative font-black text-xs uppercase tracking-[0.2em] transition-all duration-300
                ${isActive ? 'text-primary scale-110' : 'text-slate-400 hover:text-primary-dark'}
              `}
            >
              {link.name}
              {isActive && (
                <span className="absolute -bottom-2 left-0 w-full h-1 bg-primary rounded-full animate-in fade-in slide-in-from-bottom-1 duration-500"></span>
              )}
            </Link>
          );
        })}
      </div>
      
      <div className="flex items-center gap-6">
        {token ? (
          <>
            <Link to={`/${user.role}`} className="flex items-center gap-2 text-primary-dark hover:text-primary transition-colors font-medium">
              <LayoutDashboard className="w-5 h-5" />
              <span>{user.role === 'candidate' ? 'Quản lý Hồ sơ' : 'Bảng điều khiển'}</span>
            </Link>
            <button onClick={logout} className="flex items-center gap-2 text-red-500 hover:text-red-600 transition-colors font-medium">
              <LogOut className="w-5 h-5" />
              <span>Đăng xuất</span>
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="text-primary-dark hover:text-primary transition-colors font-medium">Đăng nhập</Link>
            <Link to="/register" className="bg-primary text-white px-6 py-2 rounded-xl hover:bg-primary-light transition-all shadow-md shadow-primary/20 font-semibold cursor-pointer">
              Bắt đầu ngay
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;

// Git update: Triggering change for push
