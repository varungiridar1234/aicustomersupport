import React from 'react';
import { Clock, Shield, User } from 'lucide-react';

export default function AuditTimeline({ logs }) {
  const auditLogs = logs || [];

  return (
    <div className="industrial-card corner-screws p-4 space-y-3">
      {/* Compact Header Bar */}
      <div className="flex items-center justify-between pb-2 border-b border-industrial-shadow/40">
        <div className="flex items-center space-x-2 pl-4">
          <div className="w-6 h-6 rounded bg-industrial-recessed shadow-recessed flex items-center justify-center text-industrial-orange">
            <Clock className="w-3.5 h-3.5" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-industrial-dark uppercase tracking-wider font-mono">
              AUDIT TRAIL LOGS
            </h3>
          </div>
        </div>

        <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-industrial-recessed shadow-recessed text-industrial-dark pr-4">
          {auditLogs.length} EVENTS
        </span>
      </div>

      {/* Compact Tabular Audit Table View */}
      {auditLogs.length === 0 ? (
        <div className="industrial-well p-4 text-center text-xs text-industrial-label italic">
          No audit logs recorded.
        </div>
      ) : (
        <div className="industrial-well p-1 overflow-hidden">
          <div className="max-h-64 overflow-y-auto">
            <table className="w-full text-left border-collapse font-mono text-[11px]">
              <thead>
                <tr className="border-b border-industrial-shadow/40 bg-industrial-recessed text-industrial-dark font-bold uppercase sticky top-0">
                  <th className="py-2 px-3">TIMESTAMP</th>
                  <th className="py-2 px-3">ACTION EVENT</th>
                  <th className="py-2 px-3">ACTOR</th>
                  <th className="py-2 px-3">DETAILS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-industrial-shadow/30 text-industrial-dark">
                {auditLogs.map((log, idx) => (
                  <tr key={log._id || idx} className="hover:bg-industrial-panel transition-colors">
                    <td className="py-2 px-3 font-semibold text-industrial-label whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </td>
                    <td className="py-2 px-3 font-bold text-industrial-orange uppercase whitespace-nowrap">
                      {log.event ? log.event.replace(/_/g, ' ') : 'EVENT'}
                    </td>
                    <td className="py-2 px-3 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 font-semibold">
                        <User className="w-3 h-3 text-industrial-label" />
                        {log.actor?.name || log.actor?.role || 'SYSTEM'}
                      </span>
                    </td>
                    <td className="py-2 px-3 font-sans text-xs text-industrial-dark">
                      {log.details}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
