import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { 
  Activity, 
  Lock, 
  Mail, 
  ArrowRight, 
  AlertCircle,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronUp,
  KeyRound,
  Check
} from 'lucide-react';

const SEEDED_DOCTORS = [
  { name: 'Dr. Sarah Jenkins', dept: 'Cardiology', email: 'doctor.sarah@hospital.com', pass: 'doctor123' },
  { name: 'Dr. Marcus Vance', dept: 'Neurology', email: 'doctor.marcus@hospital.com', pass: 'doctor123' },
  { name: 'Dr. Emily Chen', dept: 'Pediatrics', email: 'doctor.emily@hospital.com', pass: 'doctor123' },
  { name: 'Dr. David Miller', dept: 'Orthopedics', email: 'doctor.david@hospital.com', pass: 'doctor123' },
  { name: 'Dr. James Wilson', dept: 'General Medicine', email: 'doctor.james@hospital.com', pass: 'doctor123' },
];

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showDemoCredentials, setShowDemoCredentials] = useState(false);
  const [filledNotice, setFilledNotice] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLoginSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!email || !password) {
      setError('Please provide both email address and password.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const response = await api.post('/auth/login', { email, password });
      login(response.data);

      const role = response.data.role;
      if (role === 'ADMIN') {
        navigate('/admin');
      } else if (role === 'DOCTOR') {
        navigate('/doctor/dashboard');
      } else {
        navigate('/patient/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleFillCredential = (demoEmail, demoPassword, label) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setError('');
    setFilledNotice(label);
    setTimeout(() => setFilledNotice(''), 2500);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-10 sm:px-6 lg:px-8 selection:bg-brand-500 selection:text-white">
      
      {/* Brand Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center mb-6">
        <div className="mx-auto w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-700 to-brand-500 flex items-center justify-center text-white shadow-lg shadow-brand-500/20 mb-3">
          <Activity className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
          Care<span className="text-brand-600">Sync</span> Portal
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Hospital Appointment & Patient Management System
        </p>
      </div>

      {/* Main Focus: Login Form Card */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white py-8 px-6 sm:px-9 rounded-3xl shadow-lg border border-slate-200">
          
          <h2 className="text-lg font-bold text-slate-900 tracking-tight mb-1">
            Sign In
          </h2>
          <p className="text-xs text-slate-500 mb-6">
            Enter your credentials to access your account dashboard.
          </p>

          {error && (
            <div className="mb-5 p-3 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-rose-700 text-xs">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {filledNotice && (
            <div className="mb-5 p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-2 text-emerald-800 text-xs font-medium animate-fadeIn">
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              <span>Loaded {filledNotice} credentials. Click Sign In to continue.</span>
            </div>
          )}

          <form onSubmit={handleLoginSubmit} className="space-y-4">
            {/* Email Field */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@hospital.com"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 text-sm text-slate-900 outline-none transition-all"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 text-sm text-slate-900 outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 px-4 rounded-xl text-sm font-bold text-white bg-brand-600 hover:bg-brand-700 shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Registration Prompt */}
          <div className="mt-5 text-center text-xs text-slate-600">
            New patient?{' '}
            <Link to="/register" className="font-bold text-brand-600 hover:text-brand-700">
              Register here
            </Link>
          </div>
        </div>

        {/* Small, Subtle Collapsible Demo Credentials Panel */}
        <div className="mt-4 bg-white/70 backdrop-blur-sm rounded-2xl border border-slate-200/80 p-3 text-xs shadow-sm">
          <button
            type="button"
            onClick={() => setShowDemoCredentials(!showDemoCredentials)}
            className="w-full flex items-center justify-between text-slate-500 hover:text-slate-800 transition-colors font-medium py-1"
          >
            <span className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500">
              <KeyRound className="w-3.5 h-3.5 text-slate-400" />
              Demo Access Credentials
            </span>
            <span className="flex items-center gap-1 text-[11px] text-brand-600 hover:underline">
              {showDemoCredentials ? 'Hide credentials' : 'View credentials'}
              {showDemoCredentials ? (
                <ChevronUp className="w-3.5 h-3.5" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5" />
              )}
            </span>
          </button>

          {showDemoCredentials && (
            <div className="mt-3 pt-3 border-t border-slate-100 space-y-2.5 text-[11px] text-slate-600 font-normal animate-fadeIn">
              
              {/* Admin Credential */}
              <div 
                onClick={() => handleFillCredential('admin@hospital.com', 'admin123', 'Admin')}
                className="p-2 rounded-lg bg-slate-50 hover:bg-purple-50 hover:border-purple-200 border border-slate-100 flex items-center justify-between cursor-pointer transition-colors"
                title="Click to fill Admin credentials"
              >
                <div>
                  <span className="font-bold text-slate-800">Admin: </span>
                  <span className="font-mono text-slate-600">admin@hospital.com / admin123</span>
                </div>
                <span className="text-[10px] text-purple-600 font-semibold px-1.5 py-0.5 rounded bg-purple-100/60">
                  Fill
                </span>
              </div>

              {/* Seeded Doctors List (1 per Department) */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block px-1">
                  Doctors (1 per department)
                </span>
                
                {SEEDED_DOCTORS.map((doc, idx) => (
                  <div
                    key={idx}
                    onClick={() => handleFillCredential(doc.email, doc.pass, doc.name)}
                    className="p-2 rounded-lg bg-slate-50 hover:bg-emerald-50 hover:border-emerald-200 border border-slate-100 flex items-center justify-between cursor-pointer transition-colors"
                    title={`Click to fill ${doc.name} credentials`}
                  >
                    <div className="truncate mr-2">
                      <span className="font-bold text-slate-800">{doc.name}</span>{' '}
                      <span className="text-slate-500">({doc.dept}):</span>{' '}
                      <span className="font-mono text-slate-600">{doc.email} / {doc.pass}</span>
                    </div>
                    <span className="text-[10px] text-emerald-700 font-semibold px-1.5 py-0.5 rounded bg-emerald-100/60 flex-shrink-0">
                      Fill
                    </span>
                  </div>
                ))}
              </div>

              {/* Patient Note */}
              <div className="pt-1.5 text-center text-[10px] text-slate-400 border-t border-slate-100">
                New patient? Click <Link to="/register" className="text-brand-600 font-semibold hover:underline">Register</Link> to create your own account.
              </div>
            </div>
          )}
        </div>

      </div>

      {/* Footer */}
      <footer className="mt-8 text-center text-[11px] text-slate-400">
        CareSync Clinical Management System
      </footer>
    </div>
  );
};

export default LoginPage;
