import React from 'react';
import { Bell, X, Check, Ticket, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function NotificationPanel({ isOpen, onClose, notifications = [], onMarkRead }) {
  const navigate = useNavigate();

  if (!isOpen) return null;

  return (
    <div className="fixed top-16 right-4 z-50 w-96 bg-white border border-slate-200 shadow-xl rounded-xl p-4 animate-fadeIn">
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-purple-600" />
          <h3 className="text-sm font-bold text-slate-900">Real-Time Alerts</h3>
        </div>
        <button onClick={onClose} className="p-1 rounded text-slate-400 hover:text-slate-600">
          <X className="w-4 h-4" />
        </button>
      </div>

      {notifications.length === 0 ? (
        <div className="py-8 text-center text-xs text-slate-500">
          No new alerts. Real-time updates will appear here automatically via Socket.IO.
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
              className="bg-slate-50 hover:bg-purple-50/50 p-3 rounded-lg border border-slate-200/80 hover:border-purple-300 cursor-pointer transition-all"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-slate-900">{n.title}</span>
                <span className="text-[10px] text-slate-400">Just now</span>
              </div>
              <p className="text-xs text-slate-600 mb-1">{n.message}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
