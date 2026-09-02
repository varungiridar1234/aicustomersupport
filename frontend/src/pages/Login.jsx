import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Shield, User, Lock, ArrowRight, Building2, CheckCircle2, Play } from 'lucide-react';
import api from '../services/api';
import SplashIntro from '../components/ui/SplashIntro';

export default function Login() {
  const navigate = useNavigate();
  const [showSplash, setShowSplash] = useState(() => {
    // Show splash once per session or allow replay
    return !sessionStorage.getItem('shubya_splash_seen');
  });

  const [email, setEmail] = useState('billing.agent@support.com');
  const [password, setPassword] = useState('billing123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSplashComplete = () => {
    sessionStorage.setItem('shubya_splash_seen', 'true');
    setShowSplash(false);
  };

  const handleLogin = async (e) => {
    e?.preventDefault();
    try {
      setLoading(true);
      setError('');
      const res = await api.post('/auth/login', { email, password });
      if (res.data.success) {
        localStorage.setItem('resolvai_token', res.data.token);
        localStorage.setItem('resolvai_user', JSON.stringify(res.data.user));
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const loginAsDepartment = (deptEmail, deptPass) => {
    setEmail(deptEmail);
    setPassword(deptPass);
    setTimeout(() => {
      handleLogin();
    }, 100);
  };

  return (
    <>
      {showSplash && <SplashIntro onComplete={handleSplashComplete} />}

      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden">
        {/* Background Ambient Glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-brand-600/15 blur-3xl rounded-full pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-80 h-80 bg-indigo-600/10 blur-3xl rounded-full pointer-events-none" />

        <div className="max-w-xl w-full glass-panel p-8 space-y-6 border border-slate-800/80 shadow-2xl relative z-10">
          
          {/* Header & Logo */}
          <div className="text-center space-y-3">
            <div className="inline-flex p-3.5 rounded-2xl bg-gradient-to-tr from-brand-600 via-indigo-600 to-purple-600 shadow-xl shadow-brand-600/30 ring-1 ring-white/20 mb-1">
              <span className="text-2xl font-black text-white font-mono tracking-tighter">S</span>
            </div>
            
            <div className="flex items-center justify-center gap-2">
              <h1 className="text-3xl font-black text-white tracking-tight uppercase">
                SHUBYA
              </h1>
              <span className="px-2 py-0.5 rounded bg-brand-500/20 border border-brand-500/30 text-brand-300 font-mono text-[10px] font-bold">
                PRO MVP
              </span>
            </div>
            
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              AI Customer Support Resolution Platform for Enterprise Operations
            </p>

            <button
              onClick={() => setShowSplash(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-[11px] text-slate-400 hover:text-brand-400 hover:border-brand-500/40 transition-colors"
            >
              <Play className="w-3 h-3 text-brand-400" />
              <span>Replay Intro Animation</span>
            </button>
          </div>

          {/* Authentication Alert Notice */}
          <div className="p-3 rounded-lg bg-slate-900/90 border border-slate-800 text-[11px] text-slate-300 flex items-center gap-2">
            <Shield className="w-4 h-4 text-brand-400 shrink-0" />
            <span>Strict Database Authentication Enforced. Sign in with verified department credentials.</span>
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-rose-950/60 border border-rose-800 text-xs text-rose-300 font-semibold text-center">
              {error}
            </div>
          )}

          {/* Authentic Login Form */}
          <form onSubmit={handleLogin} className="space-y-4 text-xs">
            <div>
              <label className="text-slate-300 font-bold block mb-1.5">Department Email / User ID</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. billing.agent@support.com"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2.5 text-white placeholder-slate-600 focus:outline-none focus:border-brand-500 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="text-slate-300 font-bold block mb-1.5">Security Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2.5 text-white placeholder-slate-600 focus:outline-none focus:border-brand-500 font-mono"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-bold text-xs rounded-lg shadow-lg shadow-brand-600/25 flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
            >
              <span>{loading ? 'Authenticating with Database...' : 'Sign In to Shubya Console'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Department Quick Authenticated Logins */}
          <div className="pt-5 border-t border-slate-800/80 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                Department Authenticated Access
              </span>
              <span className="text-[10px] text-slate-500 font-mono">Database Pre-seeded</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => loginAsDepartment('admin@support.com', 'admin123')}
                className="p-2.5 bg-slate-950 hover:bg-slate-900 border border-slate-800 hover:border-indigo-500/60 rounded-lg text-left transition-all group"
              >
                <div className="flex items-center gap-1.5 text-indigo-400 font-bold text-[11px]">
                  <Shield className="w-3 h-3" />
                  <span>System Admin</span>
                </div>
                <div className="text-[10px] text-slate-400 truncate mt-0.5">Sarah Connor</div>
                <div className="text-[9px] text-slate-500 font-mono">admin123</div>
              </button>

              <button
                type="button"
                onClick={() => loginAsDepartment('billing.agent@support.com', 'billing123')}
                className="p-2.5 bg-slate-950 hover:bg-slate-900 border border-slate-800 hover:border-emerald-500/60 rounded-lg text-left transition-all group"
              >
                <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-[11px]">
                  <Building2 className="w-3 h-3" />
                  <span>Billing Dept</span>
                </div>
                <div className="text-[10px] text-slate-400 truncate mt-0.5">Alex Rivera</div>
                <div className="text-[9px] text-slate-500 font-mono">billing123</div>
              </button>

              <button
                type="button"
                onClick={() => loginAsDepartment('tech.agent@support.com', 'tech123')}
                className="p-2.5 bg-slate-950 hover:bg-slate-900 border border-slate-800 hover:border-blue-500/60 rounded-lg text-left transition-all group"
              >
                <div className="flex items-center gap-1.5 text-blue-400 font-bold text-[11px]">
                  <Building2 className="w-3 h-3" />
                  <span>Tech Dept</span>
                </div>
                <div className="text-[10px] text-slate-400 truncate mt-0.5">Elena Rostova</div>
                <div className="text-[9px] text-slate-500 font-mono">tech123</div>
              </button>

              <button
                type="button"
                onClick={() => loginAsDepartment('logistics.agent@support.com', 'logistics123')}
                className="p-2.5 bg-slate-950 hover:bg-slate-900 border border-slate-800 hover:border-amber-500/60 rounded-lg text-left transition-all group"
              >
                <div className="flex items-center gap-1.5 text-amber-400 font-bold text-[11px]">
                  <Building2 className="w-3 h-3" />
                  <span>Logistics Dept</span>
                </div>
                <div className="text-[10px] text-slate-400 truncate mt-0.5">Carlos Ruiz</div>
                <div className="text-[9px] text-slate-500 font-mono">logistics123</div>
              </button>

              <button
                type="button"
                onClick={() => loginAsDepartment('security.agent@support.com', 'security123')}
                className="p-2.5 bg-slate-950 hover:bg-slate-900 border border-slate-800 hover:border-rose-500/60 rounded-lg text-left transition-all group"
              >
                <div className="flex items-center gap-1.5 text-rose-400 font-bold text-[11px]">
                  <Building2 className="w-3 h-3" />
                  <span>Security Dept</span>
                </div>
                <div className="text-[10px] text-slate-400 truncate mt-0.5">David K.</div>
                <div className="text-[9px] text-slate-500 font-mono">security123</div>
              </button>

              <button
                type="button"
                onClick={() => loginAsDepartment('account.agent@support.com', 'account123')}
                className="p-2.5 bg-slate-950 hover:bg-slate-900 border border-slate-800 hover:border-purple-500/60 rounded-lg text-left transition-all group"
              >
                <div className="flex items-center gap-1.5 text-purple-400 font-bold text-[11px]">
                  <Building2 className="w-3 h-3" />
                  <span>Account Dept</span>
                </div>
                <div className="text-[10px] text-slate-400 truncate mt-0.5">Priya Sharma</div>
                <div className="text-[9px] text-slate-500 font-mono">account123</div>
              </button>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
