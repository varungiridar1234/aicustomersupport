import React from 'react';
import { Bell, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function NotificationPanel({ isOpen, onClose, notifications = [], onMarkRead }) {
  const navigate = useNavigate();

  if (!isOpen) return null;

  return (
    <div className="fixed top-16 right-4 z-50 w-96 industrial-card corner-screws p-4 animate-fadeIn shadow-floating">
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-industrial-shadow/40">
        <div className="flex items-center gap-2 pl-4">
          <span className="w-2 h-2 rounded-full led-indicator-active animate-pulse" />
          <Bell className="w-4 h-4 text-industrial-orange" />
          <h3 className="text-xs font-bold text-industrial-dark uppercase font-mono">REAL-TIME ALERTS</h3>
        </div>
        <button onClick={onClose} className="p-1 rounded text-industrial-label hover:text-industrial-dark pr-4">
          <X className="w-4 h-4" />
        </button>
      </div>

      {notifications.length === 0 ? (
        <div className="industrial-well p-6 text-center text-xs font-mono text-industrial-label">
          NO NEW ALERTS. LIVE UPDATES WILL APPEAR VIA SOCKET.IO.
        </div>
      ) : (
        <div className="space-y-2.5 max-h-96 overflow-y-auto">
          {notifications.map((n, idx) => (
            <div
              key={idx}
              onClick={() => {
                if (n.ticketId) navigate(`/tickets/${n.ticketId}`);
                onClose();
              }}
              className="industrial-well p-3 hover:brightness-105 cursor-pointer transition-all"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold font-mono text-industrial-dark">{n.title}</span>
                <span className="text-[10px] font-mono text-industrial-label">JUST NOW</span>
              </div>
              <p className="text-xs text-industrial-dark font-sans mb-1">{n.message}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
