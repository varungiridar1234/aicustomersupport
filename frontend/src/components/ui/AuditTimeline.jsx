import React from 'react';
import { Clock, Shield, CheckCircle2, AlertCircle, ArrowRight, User } from 'lucide-react';

export default function AuditTimeline({ logs }) {
  const auditLogs = logs || [];

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
      <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Clock className="w-4 h-4 text-purple-600" />
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Audit Trail & State Transitions
          </h3>
        </div>
        <span className="text-[11px] font-semibold text-slate-500">
          {auditLogs.length} Events
        </span>
      </div>

      <div className="p-4 space-y-3.5 max-h-96 overflow-y-auto">
        {auditLogs.length === 0 ? (
          <p className="text-slate-500 text-xs italic text-center py-2">
            No audit logs recorded.
          </p>
        ) : (
          auditLogs.map((log, idx) => (
            <div key={log._id || idx} className="flex items-start space-x-3 text-xs">
              <div className="w-2 h-2 rounded-full bg-purple-600 shrink-0 mt-1.5 ring-4 ring-purple-50" />
              <div className="space-y-0.5 flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 uppercase text-[10px] tracking-wider">
                    {log.event ? log.event.replace(/_/g, ' ') : 'EVENT'}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-slate-600 text-xs leading-normal">{log.details}</p>
                {log.actor && (
                  <div className="text-[10px] text-slate-400 flex items-center gap-1 pt-0.5">
                    <User className="w-2.5 h-2.5" />
                    <span>{log.actor.name || log.actor.role || 'System'}</span>
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
