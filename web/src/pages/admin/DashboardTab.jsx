// Module: admin/DashboardTab.jsx - Quản lý logic hệ thống
import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { 
  Users, Clock, FileText, Sparkles, TrendingUp, PieChart as PieIcon 
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

const DashboardTab = () => {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.get('/admin/stats').then(r => setStats(r.data)).catch(console.error);
  }, []);

  if (!stats) return <div className="text-center py-20 text-slate-400 font-bold">Đang tải biểu đồ...</div>;

  const cards = [
    { label: 'Tổng người dùng', value: stats.totalUsers, icon: Users, color: 'bg-blue-500' },
    { label: 'Việc làm chờ duyệt', value: stats.pendingJobs, icon: Clock, color: 'bg-amber-500' },
    { label: 'Đơn ứng tuyển', value: stats.totalApplications, icon: FileText, color: 'bg-pink-500' },
    { label: 'Hồ sơ CV', value: stats.totalProfiles, icon: Sparkles, color: 'bg-cyan-500' },
  ];

  const pieData = stats.applicationsByStatus?.map(item => ({
    name: item.status === 'pending' ? 'Chờ duyệt' : 
          item.status === 'accepted' ? 'Chấp nhận' : 
          item.status === 'rejected' ? 'Từ chối' : item.status,
    value: parseInt(item.count)
  })) || [];

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black text-primary-dark tracking-tighter">Tổng quan Hệ thống</h2>
          <p className="text-slate-400 font-bold text-sm">Dữ liệu thống kê và biểu đồ hoạt động</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((c, i) => (
          <div key={i} className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group">
            <div className={`w-12 h-12 ${c.color} rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-${c.color.split('-')[1]}/20`}>
              <c.icon className="w-6 h-6 text-white" />
            </div>
            <p className="text-4xl font-black text-primary-dark tracking-tighter">{c.value}</p>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">{c.label}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Trend Chart */}
        <div className="lg:col-span-2 bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-black text-primary-dark flex items-center gap-3">
              <TrendingUp className="w-6 h-6 text-primary" /> Xu hướng 6 tháng
            </h3>
            <div className="flex gap-4">
               <div className="flex items-center gap-2">
                 <div className="w-3 h-3 rounded-full bg-primary" />
                 <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Người dùng</span>
               </div>
               <div className="flex items-center gap-2">
                 <div className="w-3 h-3 rounded-full bg-emerald-400" />
                 <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Việc làm</span>
               </div>
            </div>
          </div>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.monthlyTrends}>
                <defs>
                  <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorJobs" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fontSize: 12, fontWeight: 700, fill: '#94a3b8'}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fontWeight: 700, fill: '#94a3b8'}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '15px' }}
                  itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="users" stroke="#3b82f6" strokeWidth={4} fillOpacity={1} fill="url(#colorUsers)" />
                <Area type="monotone" dataKey="jobs" stroke="#10b981" strokeWidth={4} fillOpacity={1} fill="url(#colorJobs)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Application Status Chart */}
        <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm flex flex-col">
          <h3 className="text-xl font-black text-primary-dark flex items-center gap-3 mb-8">
            <PieIcon className="w-6 h-6 text-primary" /> Trạng thái ứng tuyển
          </h3>
          <div className="flex-1 h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  innerRadius={80}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '1px', paddingTop: '20px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 p-6 bg-slate-50 rounded-2xl">
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 text-center">Tỷ lệ chuyển đổi</p>
             <div className="flex justify-around items-center">
                <div className="text-center">
                   <p className="text-xl font-black text-primary-dark">{Math.round((stats.totalApplications > 0 ? (pieData.find(d => d.name === 'Chấp nhận')?.value || 0) / stats.totalApplications * 100 : 0))}%</p>
                   <p className="text-[8px] font-black text-emerald-500 uppercase tracking-widest">Thành công</p>
                </div>
                <div className="w-px h-8 bg-slate-200" />
                <div className="text-center">
                   <p className="text-xl font-black text-primary-dark">{Math.round((stats.totalApplications > 0 ? (pieData.find(d => d.name === 'Chờ duyệt')?.value || 0) / stats.totalApplications * 100 : 0))}%</p>
                   <p className="text-[8px] font-black text-amber-500 uppercase tracking-widest">Đang chờ</p>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardTab;

// Git update: Triggering change for push
