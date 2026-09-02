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
  Cpu
} from 'lucide-react';
import NotificationPanel from '../ui/NotificationPanel';
import { initSocket } from '../../services/socket';

export default function AppLayout() {
  const navigate = useNavigate();
  const location = useLocation();

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
    { label: 'AGENT WORKSPACE', path: '/dashboard', icon: LayoutDashboard, role: 'ALL' },
    { label: 'KNOWLEDGE BASE', path: '/knowledge', icon: BookOpen, role: 'ALL' },
    { label: 'ADMIN COMMAND', path: '/admin', icon: Shield, role: 'ADMIN' },
  ];

  const deptName = currentUser.team ? currentUser.team.name : (currentUser.role === 'ADMIN' ? 'System Management' : 'General Support');

  return (
    <div className="min-h-screen bg-industrial-chassis text-industrial-dark flex flex-col font-sans">
      {/* Top Industrial Header Navbar */}
      <header className="h-16 bg-industrial-chassis border-b border-industrial-shadow/60 sticky top-0 z-40 px-6 flex items-center justify-between shadow-card">
        <div className="flex items-center gap-8">
          <Link to="/dashboard" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-industrial-orange text-white shadow-orange-btn flex items-center justify-center font-mono font-bold text-sm">
              <Cpu className="w-4 h-4" />
            </div>
            <span className="font-extrabold text-lg tracking-tight text-industrial-dark font-mono uppercase">
              SUPPORT<span className="text-industrial-orange">IQ</span>
            </span>
            <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-industrial-recessed shadow-recessed text-industrial-dark border-none">
              v2.0 INDUSTRIAL
            </span>
          </Link>

          {/* Ventilation slot detail */}
          <div className="hidden lg:flex vent-slots">
            <div className="vent-slot" />
            <div className="vent-slot" />
            <div className="vent-slot" />
          </div>

          {/* Navigation Physical Keys */}
          <nav className="hidden md:flex items-center gap-2">
            {navItems.map((item) => {
              if (item.role === 'ADMIN' && currentUser.role !== 'ADMIN') return null;
              const isActive = location.pathname === item.path;
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-mono font-bold transition-all ${
                    isActive 
                      ? 'bg-industrial-orange text-white shadow-orange-btn translate-y-[1px]' 
                      : 'industrial-btn-secondary text-industrial-dark'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-industrial-label'}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right Header Controls */}
        <div className="flex items-center gap-4">
          {/* Active Department Gauge */}
          <div className="hidden lg:flex items-center gap-2 px-3 py-1 rounded bg-industrial-recessed shadow-recessed text-xs font-mono font-bold text-industrial-dark">
            <Building2 className="w-3.5 h-3.5 text-industrial-orange" />
            <span>[{deptName.toUpperCase()}]</span>
          </div>

          {/* Socket LED Indicator */}
          <div className="hidden xl:flex items-center gap-2 px-2.5 py-1 rounded bg-industrial-recessed shadow-recessed text-xs font-mono font-bold text-industrial-dark">
            <span className="w-2 h-2 rounded-full led-indicator-green animate-pulse" />
            <span>LIVE SYNC</span>
          </div>

          {/* Notifications Bell */}
          <button
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            className="relative p-2 rounded-lg industrial-btn-secondary text-industrial-dark transition-colors"
          >
            <Bell className="w-4 h-4 text-industrial-dark" />
            {notifications.length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-industrial-orange text-white font-mono font-bold text-[10px] flex items-center justify-center led-indicator-active">
                {notifications.length}
              </span>
            )}
          </button>

          {/* User Badge & Sign Out Button */}
          <div className="flex items-center gap-3 pl-3 border-l border-industrial-shadow/60">
            <div className="text-right hidden sm:block">
              <div className="text-xs font-bold text-industrial-dark font-mono leading-none">{currentUser.name}</div>
              <div className="text-[10px] font-mono text-industrial-orange mt-0.5 font-bold">{currentUser.role}</div>
            </div>

            <button
              onClick={handleLogout}
              title="Sign Out"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg industrial-btn-secondary text-xs font-mono text-industrial-dark hover:text-industrial-orange"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">LOGOUT</span>
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
      <footer className="border-t border-industrial-shadow/60 py-4 px-6 text-center text-xs font-mono text-industrial-label bg-industrial-chassis">
        SUPPORTIQ &bull; INDUSTRIAL REALISM AI RESOLUTION PLATFORM &bull; MATTE CHASSIS #E0E5EC
      </footer>
    </div>
  );
}
