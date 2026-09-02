import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  Shield,
  BookOpen,
  Bell,
  LogOut,
  Radio,
  Building2,
  Sparkles
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
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Top Header Navbar */}
      <header className="h-16 border-b border-slate-200 bg-white sticky top-0 z-40 px-6 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-8">
          <Link to="/dashboard" className="flex items-center gap-2.5 group">
            <div className="px-2.5 py-1 rounded-lg bg-purple-600 shadow-sm text-white font-bold flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <span className="font-extrabold text-lg tracking-tight text-slate-900">
              Support<span className="text-purple-600">IQ</span>
            </span>
            <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200">
              AI Resolution Platform
            </span>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1.5">
            {navItems.map((item) => {
              if (item.role === 'ADMIN' && currentUser.role !== 'ADMIN') return null;
              const isActive = location.pathname === item.path;
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium transition-all ${
                    isActive 
                      ? 'bg-purple-50 text-purple-700 font-semibold border border-purple-200/80 shadow-xs' 
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-purple-600' : 'text-slate-500'}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right Header Actions */}
        <div className="flex items-center gap-4">
          {/* Active Department Badge */}
          <div className="hidden lg:flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-xs font-medium text-slate-700">
            <Building2 className="w-3.5 h-3.5 text-purple-600" />
            <span>[{deptName.toUpperCase()}]</span>
          </div>

          {/* Socket Indicator */}
          <div className="hidden xl:flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-medium text-emerald-700">
            <Radio className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
            <span>Live Sync</span>
          </div>

          {/* Notifications Bell */}
          <button
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            className="relative p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors"
          >
            <Bell className="w-4 h-4 text-slate-700" />
            {notifications.length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-purple-600 text-white font-bold text-[10px] flex items-center justify-center">
                {notifications.length}
              </span>
            )}
          </button>

          {/* Logged in User Badge & Logout Button */}
          <div className="flex items-center gap-3 pl-3 border-l border-slate-200">
            <div className="text-right hidden sm:block">
              <div className="text-xs font-bold text-slate-900 leading-none">{currentUser.name}</div>
              <div className="text-[10px] font-medium text-purple-600 mt-0.5">{currentUser.role}</div>
            </div>

            <button
              onClick={handleLogout}
              title="Sign Out"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-red-50 text-slate-700 hover:text-red-700 border border-slate-200 hover:border-red-200 text-xs font-medium transition-colors"
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
      <footer className="border-t border-slate-200 py-4 px-6 text-center text-xs text-slate-500 bg-white">
        SupportIQ &bull; Enterprise AI Customer Support Resolution Platform
      </footer>
    </div>
  );
}
