import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  PlusCircle,
  Shield,
  BookOpen,
  Bell,
  LogOut,
  UserCheck,
  Radio,
  Sparkles,
  Building2
} from 'lucide-react';
import NotificationPanel from '../ui/NotificationPanel';
import { initSocket } from '../../services/socket';

export default function AppLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  // Load authenticated user from localStorage or fallback
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const u = localStorage.getItem('resolvai_user');
      return u ? JSON.parse(u) : {
        name: 'Alex Rivera',
        role: 'AGENT',
        email: 'billing.agent@support.com',
        team: { name: 'Billing', code: 'BILLING' }
      };
    } catch (e) {
      return { name: 'Alex Rivera', role: 'AGENT', email: 'billing.agent@support.com', team: { name: 'Billing' } };
    }
  });

  const [notifications, setNotifications] = useState([]);
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  useEffect(() => {
    const socket = initSocket(currentUser.id || 'billing_agent');
    if (socket) {
      socket.on('notification', (notif) => {
        setNotifications(prev => [notif, ...prev]);
      });
    }
  }, [currentUser]);

  const handleLogout = () => {
    localStorage.removeItem('resolvai_token');
    localStorage.removeItem('resolvai_user');
    navigate('/login');
  };

  const navItems = [
    { label: 'Agent Dashboard', path: '/dashboard', icon: LayoutDashboard, role: 'ALL' },
    { label: 'Knowledge Base', path: '/knowledge', icon: BookOpen, role: 'ALL' },
    { label: 'Admin Command', path: '/admin', icon: Shield, role: 'ADMIN' },
  ];

  const deptName = currentUser.team ? currentUser.team.name : (currentUser.role === 'ADMIN' ? 'System Management' : 'General Support');

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Top Navbar */}
      <header className="h-16 border-b border-slate-800/80 bg-slate-900/90 backdrop-blur-md sticky top-0 z-40 px-6 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link to="/dashboard" className="flex items-center gap-2.5 text-white font-bold text-lg tracking-tight group">
            <div className="px-2.5 py-1 rounded-xl bg-gradient-to-tr from-brand-600 via-indigo-600 to-purple-600 shadow-md shadow-brand-500/30 ring-1 ring-white/20 group-hover:scale-105 transition-transform flex items-center gap-1.5">
              <span className="font-black text-white font-mono text-sm">S</span>
            </div>
            <span className="font-extrabold uppercase tracking-tight text-white">
              SHUBYA
            </span>
            <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-brand-500/20 text-brand-300 border border-brand-500/30">
              AI Support Platform
            </span>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              if (item.role === 'ADMIN' && currentUser.role !== 'ADMIN') return null;
              const isActive = location.pathname === item.path;
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                    isActive 
                      ? 'bg-brand-600/20 border border-brand-500/30 text-white' 
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right Header Actions */}
        <div className="flex items-center gap-4">
          {/* Active Department Badge */}
          <div className="hidden lg:flex items-center gap-2 px-3 py-1 rounded-full bg-slate-950 border border-slate-800 text-[11px] font-semibold text-brand-300">
            <Building2 className="w-3.5 h-3.5 text-brand-400" />
            <span>[{deptName.toUpperCase()}]</span>
          </div>

          {/* Socket Indicator */}
          <div className="hidden xl:flex items-center gap-2 px-2.5 py-1 rounded-full bg-slate-950 border border-slate-800 text-[11px] font-medium text-slate-400">
            <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span>Socket.IO Live</span>
          </div>

          {/* Notifications Bell */}
          <button
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            className="relative p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors"
          >
            <Bell className="w-4 h-4" />
            {notifications.length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-brand-500 text-white font-bold text-[10px] flex items-center justify-center animate-bounce">
                {notifications.length}
              </span>
            )}
          </button>

          {/* Logged in User Badge & Logout Button */}
          <div className="flex items-center gap-3 pl-3 border-l border-slate-800">
            <div className="text-right hidden sm:block">
              <div className="text-xs font-bold text-white leading-none">{currentUser.name}</div>
              <div className="text-[10px] text-slate-400 mt-0.5">{currentUser.role}</div>
            </div>

            <button
              onClick={handleLogout}
              title="Sign Out"
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/60 text-rose-300 text-xs font-semibold transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Notification Drawer */}
      <NotificationPanel
        isOpen={isNotifOpen}
        onClose={() => setIsNotifOpen(false)}
        notifications={notifications}
      />

      {/* Main Content View */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6">
        <Outlet context={{ currentPersona: currentUser }} />
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/60 py-4 px-6 text-center text-xs text-slate-400 bg-slate-950">
        SHUBYA AI Customer Support Resolution Platform &bull; Enterprise Operations Console &bull; Gemini 1.5 Flash + MongoDB + Socket.IO
      </footer>
    </div>
  );
}
