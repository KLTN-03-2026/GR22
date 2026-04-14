import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import CandidateDashboard from './pages/CandidateDashboard';
import RecruiterDashboard from './pages/RecruiterDashboard';
import AdminDashboard from './pages/AdminDashboard';

import CompanyDetail from './pages/CompanyDetail';
import JobSearch from './pages/JobSearch';
import JobDetail from './pages/JobDetail';

import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <Router>
      <Toaster position="top-center" reverseOrder={false} />
      <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-primary/10 selection:text-primary relative">
        {/* Subtle background pattern */}
        <div className="fixed inset-0 z-0 pointer-events-none" style={{ backgroundImage: 'url(/bg-pattern.png)', backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat', opacity: 0.7 }} />
        <div className="relative z-10">
        <Navbar />
        <main className="w-full max-w-[1600px] mx-auto px-4 md:px-8 py-8">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/company/:id" element={<CompanyDetail />} />
            <Route path="/candidate/*" element={<CandidateDashboard />} />
            <Route path="/recruiter/*" element={<RecruiterDashboard />} />
            <Route path="/admin/*" element={<AdminDashboard />} />
            <Route path="/jobs" element={<JobSearch />} />
            <Route path="/jobs/:id" element={<JobDetail />} />
          </Routes>
        </main>
        </div>
      </div>
    </Router>
  );
}

export default App;
