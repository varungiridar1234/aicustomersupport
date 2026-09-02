import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Shield, User, Lock, ArrowRight, Building2 } from 'lucide-react';
import api from '../services/api';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('billing.agent@support.com');
  const [password, setPassword] = useState('billing123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-white border border-slate-200 rounded-2xl shadow-xl p-8 space-y-6">
        
        {/* Header & Brand */}
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 rounded-xl bg-purple-600 shadow-sm text-white mb-1">
            <Sparkles className="w-6 h-6" />
          </div>
          
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Support<span className="text-purple-600">IQ</span>
          </h1>
          
          <p className="text-xs font-medium text-slate-500">
            Enterprise AI Customer Support Resolution Platform
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 font-medium text-center">
            {error}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4 text-xs">
          <div>
            <label className="text-slate-700 font-semibold block mb-1.5">Department Email / User ID</label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. billing.agent@support.com"
                className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-purple-600 font-medium"
              />
            </div>
          </div>

          <div>
            <label className="text-slate-700 font-semibold block mb-1.5">Security Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-purple-600 font-medium"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs rounded-lg shadow-sm flex items-center justify-center gap-2 transition-colors"
          >
            <span>{loading ? 'Authenticating...' : 'Sign In to SupportIQ Console'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Quick Demo Persona Switcher */}
        <div className="pt-4 border-t border-slate-100 space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
              Demo Persona Quick Switch
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => loginAsDepartment('admin@support.com', 'admin123')}
              className="p-2.5 bg-slate-50 hover:bg-purple-50 border border-slate-200 hover:border-purple-300 rounded-lg text-left transition-colors"
            >
              <div className="flex items-center gap-1.5 text-purple-700 font-bold text-[11px]">
                <Shield className="w-3.5 h-3.5" />
                <span>System Admin</span>
              </div>
              <div className="text-[10px] text-slate-600 truncate mt-0.5">Sarah Connor</div>
            </button>

            <button
              type="button"
              onClick={() => loginAsDepartment('billing.agent@support.com', 'billing123')}
              className="p-2.5 bg-slate-50 hover:bg-purple-50 border border-slate-200 hover:border-purple-300 rounded-lg text-left transition-colors"
            >
              <div className="flex items-center gap-1.5 text-purple-700 font-bold text-[11px]">
                <Building2 className="w-3.5 h-3.5" />
                <span>Billing Lead</span>
              </div>
              <div className="text-[10px] text-slate-600 truncate mt-0.5">Alex Rivera</div>
            </button>

            <button
              type="button"
              onClick={() => loginAsDepartment('tech.agent@support.com', 'tech123')}
              className="p-2.5 bg-slate-50 hover:bg-purple-50 border border-slate-200 hover:border-purple-300 rounded-lg text-left transition-colors"
            >
              <div className="flex items-center gap-1.5 text-purple-700 font-bold text-[11px]">
                <Building2 className="w-3.5 h-3.5" />
                <span>Tech Lead</span>
              </div>
              <div className="text-[10px] text-slate-600 truncate mt-0.5">Elena Rostova</div>
            </button>

            <button
              type="button"
              onClick={() => loginAsDepartment('logistics.agent@support.com', 'logistics123')}
              className="p-2.5 bg-slate-50 hover:bg-purple-50 border border-slate-200 hover:border-purple-300 rounded-lg text-left transition-colors"
            >
              <div className="flex items-center gap-1.5 text-purple-700 font-bold text-[11px]">
                <Building2 className="w-3.5 h-3.5" />
                <span>Logistics Lead</span>
              </div>
              <div className="text-[10px] text-slate-600 truncate mt-0.5">Carlos Ruiz</div>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
