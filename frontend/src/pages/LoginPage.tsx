import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import {
  Layers,
  Shield,
  Briefcase,
  Code,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Lock,
  Mail,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';

export const LoginPage: React.FC = () => {
  const { user, login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('admin@velozity.com');
  const [password, setPassword] = useState('Password123!');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // If already authenticated, redirect to dashboard
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsSubmitting(true);

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err: any) {
      const msg = err.response?.data?.error?.message || 'Authentication failed. Please check credentials.';
      setErrorMsg(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickLogin = async (userEmail: string) => {
    setEmail(userEmail);
    setPassword('Password123!');
    setErrorMsg('');
    setIsSubmitting(true);
    try {
      await login(userEmail, 'Password123!');
      navigate('/dashboard');
    } catch (err: any) {
      setErrorMsg(err.response?.data?.error?.message || 'Login failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[400px] h-[400px] bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center relative z-10">
        <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-xl shadow-blue-600/40 mb-4">
          <Layers className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-extrabold tracking-tight text-white">VELOZITY GLOBAL SOLUTIONS</h1>
        <p className="mt-1 text-sm text-slate-400">
          Real-Time Client Project Dashboard with Role-Based Access Control
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl relative z-10 px-4">
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
          {/* Quick Demo Login Personas */}
          <div className="mb-6 pb-6 border-b border-slate-800">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
              Quick Demo Accounts
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {/* Admin */}
              <button
                type="button"
                onClick={() => handleQuickLogin('admin@velozity.com')}
                disabled={isSubmitting}
                className="flex flex-col items-start p-3 rounded-xl border border-amber-500/30 bg-amber-950/20 hover:bg-amber-950/40 text-left transition group"
              >
                <div className="flex items-center gap-1.5 text-amber-400 text-xs font-bold mb-1">
                  <Shield className="w-3.5 h-3.5" />
                  Admin
                </div>
                <span className="text-xs font-medium text-white group-hover:text-amber-300">
                  Aman Sharma
                </span>
                <span className="text-[10px] text-slate-400">Global access & presence</span>
              </button>

              {/* PM 1 */}
              <button
                type="button"
                onClick={() => handleQuickLogin('sarah.pm@velozity.com')}
                disabled={isSubmitting}
                className="flex flex-col items-start p-3 rounded-xl border border-blue-500/30 bg-blue-950/20 hover:bg-blue-950/40 text-left transition group"
              >
                <div className="flex items-center gap-1.5 text-blue-400 text-xs font-bold mb-1">
                  <Briefcase className="w-3.5 h-3.5" />
                  Project Manager
                </div>
                <span className="text-xs font-medium text-white group-hover:text-blue-300">
                  Sarah Chen
                </span>
                <span className="text-[10px] text-slate-400">Owns Projects 1 & 3</span>
              </button>

              {/* Dev 1 */}
              <button
                type="button"
                onClick={() => handleQuickLogin('ravi.dev@velozity.com')}
                disabled={isSubmitting}
                className="flex flex-col items-start p-3 rounded-xl border border-emerald-500/30 bg-emerald-950/20 hover:bg-emerald-950/40 text-left transition group"
              >
                <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-bold mb-1">
                  <Code className="w-3.5 h-3.5" />
                  Developer
                </div>
                <span className="text-xs font-medium text-white group-hover:text-emerald-300">
                  Ravi Kumar
                </span>
                <span className="text-[10px] text-slate-400">Status update only</span>
              </button>
            </div>

            <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-400">
              <span>Alternative roles:</span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickLogin('marcus.pm@velozity.com')}
                  className="text-blue-400 hover:underline"
                >
                  PM 2 (Marcus)
                </button>
                <span>•</span>
                <button
                  type="button"
                  onClick={() => handleQuickLogin('elena.dev@velozity.com')}
                  className="text-emerald-400 hover:underline"
                >
                  Dev 2 (Elena)
                </button>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="mb-5 flex items-center gap-2.5 rounded-xl bg-rose-950/50 border border-rose-800/80 p-3.5 text-xs text-rose-300">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Standard Credentials Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Work Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="name@velozity.com"
                  className="w-full pl-9 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-9 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <p className="mt-1 text-[11px] text-slate-500">Default seed password: Password123!</p>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-2 flex items-center justify-center gap-2 py-2.5 px-4 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-lg shadow-lg shadow-blue-600/30 transition disabled:opacity-50"
            >
              {isSubmitting ? 'Authenticating...' : 'Sign In'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-slate-800 text-[11px] text-slate-400 space-y-1">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>JWT Bearer tokens + HttpOnly SameSite cookie refresh</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Row-level server authorization enforced on every API route</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
