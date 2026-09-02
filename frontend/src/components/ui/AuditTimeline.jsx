import React from 'react';
import { Clock, Shield, User } from 'lucide-react';

export default function AuditTimeline({ logs }) {
  const auditLogs = logs || [];

  return (
    <div className="industrial-card corner-screws p-5 space-y-4">
      {/* Header Bar */}
      <div className="flex items-center justify-between pb-3 border-b border-industrial-shadow/40">
        <div className="flex items-center space-x-2 pl-4">
          <div className="w-7 h-7 rounded-lg bg-industrial-recessed shadow-recessed flex items-center justify-center text-industrial-orange">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-industrial-dark uppercase tracking-wider font-mono">
              AUDIT TRAIL & LOGS
            </h3>
            <span className="text-[10px] text-industrial-label font-mono">STATE MACHINE LOG STREAM</span>
          </div>
        </div>

        <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-industrial-recessed shadow-recessed text-industrial-dark pr-4">
          {auditLogs.length} EVENTS
        </span>
      </div>

      <div className="space-y-3 max-h-96 overflow-y-auto">
        {auditLogs.length === 0 ? (
          <div className="industrial-well p-4 text-center text-xs text-industrial-label italic">
            No audit logs recorded.
          </div>
        ) : (
          auditLogs.map((log, idx) => (
            <div key={log._id || idx} className="industrial-well p-3 flex items-start space-x-3 text-xs">
              <div className="w-2 h-2 rounded-full led-indicator-active shrink-0 mt-1.5" />
              <div className="space-y-0.5 flex-1 font-mono">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-industrial-dark text-[10px] tracking-wider uppercase">
                    {log.event ? log.event.replace(/_/g, ' ') : 'EVENT'}
                  </span>
                  <span className="text-[10px] text-industrial-label">
                    {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-industrial-dark text-xs font-sans leading-normal">{log.details}</p>
                {log.actor && (
                  <div className="text-[10px] text-industrial-label flex items-center gap-1 pt-0.5">
                    <User className="w-2.5 h-2.5" />
                    <span>{log.actor.name || log.actor.role || 'SYSTEM'}</span>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
