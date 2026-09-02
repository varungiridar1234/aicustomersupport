import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Cpu, Shield, User, Lock, ArrowRight, Building2 } from 'lucide-react';
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
      setError(err.response?.data?.message || 'AUTHENTICATION FAILED. CHECK SYSTEM CREDENTIALS.');
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
    <div className="min-h-screen bg-industrial-chassis flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full industrial-card corner-screws p-8 space-y-6 shadow-floating">
        
        {/* Top Header & Machine Label */}
        <div className="text-center space-y-3">
          <div className="inline-flex w-12 h-12 rounded-xl bg-industrial-orange text-white shadow-orange-btn items-center justify-center mb-1">
            <Cpu className="w-6 h-6 text-white" />
          </div>
          
          <h1 className="text-2xl font-black text-industrial-dark tracking-tight font-mono uppercase">
            SUPPORT<span className="text-industrial-orange">IQ</span>
          </h1>
          
          <p className="text-xs font-mono font-bold text-industrial-label tracking-wider uppercase">
            INDUSTRIAL AI RESOLUTION CONSOLE
          </p>

          <div className="flex justify-center vent-slots pt-1">
            <div className="vent-slot" />
            <div className="vent-slot" />
            <div className="vent-slot" />
            <div className="vent-slot" />
          </div>
        </div>

        {error && (
          <div className="industrial-well p-3 text-xs font-mono font-bold text-industrial-orange text-center border border-industrial-orange/40">
            {error}
          </div>
        )}

        {/* Recessed Login Form */}
        <form onSubmit={handleLogin} className="space-y-4 text-xs font-mono">
          <div>
            <label className="text-industrial-dark font-bold block mb-1.5 uppercase">
              DEPARTMENT USER ID / EMAIL
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-industrial-label absolute left-3.5 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. billing.agent@support.com"
                className="w-full industrial-well pl-10 pr-4 py-2.5 text-industrial-dark placeholder-industrial-label focus:outline-none font-mono text-xs"
              />
            </div>
          </div>

          <div>
            <label className="text-industrial-dark font-bold block mb-1.5 uppercase">
              SECURITY KEY CODE
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-industrial-label absolute left-3.5 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full industrial-well pl-10 pr-4 py-2.5 text-industrial-dark placeholder-industrial-label focus:outline-none font-mono text-xs"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 industrial-btn-primary text-xs font-mono flex items-center justify-center gap-2"
          >
            <span>{loading ? 'AUTHENTICATING...' : 'INITIALIZE SYSTEM SESSION'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Tactile Demo Persona Switches */}
        <div className="pt-4 border-t border-industrial-shadow/40 space-y-3">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-industrial-label font-bold uppercase tracking-wider text-[10px]">
              DEMO PERSONA QUICK SWITCH
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 font-mono">
            <button
              type="button"
              onClick={() => loginAsDepartment('admin@support.com', 'admin123')}
              className="industrial-btn-secondary p-2.5 text-left"
            >
              <div className="flex items-center gap-1.5 text-industrial-orange font-bold text-[11px]">
                <Shield className="w-3.5 h-3.5" />
                <span>SYSTEM ADMIN</span>
              </div>
              <div className="text-[10px] text-industrial-label truncate mt-0.5 font-sans">Sarah Connor</div>
            </button>

            <button
              type="button"
              onClick={() => loginAsDepartment('billing.agent@support.com', 'billing123')}
              className="industrial-btn-secondary p-2.5 text-left"
            >
              <div className="flex items-center gap-1.5 text-industrial-dark font-bold text-[11px]">
                <Building2 className="w-3.5 h-3.5" />
                <span>BILLING LEAD</span>
              </div>
              <div className="text-[10px] text-industrial-label truncate mt-0.5 font-sans">Alex Rivera</div>
            </button>

            <button
              type="button"
              onClick={() => loginAsDepartment('tech.agent@support.com', 'tech123')}
              className="industrial-btn-secondary p-2.5 text-left"
            >
              <div className="flex items-center gap-1.5 text-industrial-dark font-bold text-[11px]">
                <Building2 className="w-3.5 h-3.5" />
                <span>TECH LEAD</span>
              </div>
              <div className="text-[10px] text-industrial-label truncate mt-0.5 font-sans">Elena Rostova</div>
            </button>

            <button
              type="button"
              onClick={() => loginAsDepartment('logistics.agent@support.com', 'logistics123')}
              className="industrial-btn-secondary p-2.5 text-left"
            >
              <div className="flex items-center gap-1.5 text-industrial-dark font-bold text-[11px]">
                <Building2 className="w-3.5 h-3.5" />
                <span>LOGISTICS LEAD</span>
              </div>
              <div className="text-[10px] text-industrial-label truncate mt-0.5 font-sans">Carlos Ruiz</div>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
