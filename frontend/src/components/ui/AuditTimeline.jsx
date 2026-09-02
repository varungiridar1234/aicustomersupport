import React from 'react';
import { History, User, Bot, CheckCircle, ShieldAlert, Cpu, ArrowRight, FileText, RefreshCw } from 'lucide-react';

const eventIconMap = {
  TICKET_CREATED: User,
  AI_CLASSIFIED: Cpu,
  ROUTED_TO_TEAM: ArrowRight,
  AGENT_ASSIGNED: User,
  RAG_KNOWLEDGE_RETRIEVED: FileText,
  AI_RECOMMENDATION_GENERATED: Bot,
  RESPONSE_APPROVED: CheckCircle,
  RESPONSE_REJECTED: ShieldAlert,
  STATUS_CHANGED: RefreshCw,
  TICKET_RESOLVED: CheckCircle,
};

export default function AuditTimeline({ auditLogs = [] }) {
  return (
    <div className="glass-panel p-5">
      <div className="flex items-center gap-2.5 mb-5 pb-3 border-b border-slate-800">
        <div className="p-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-300">
          <History className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-white uppercase tracking-wider">Audit History Log</h3>
          <p className="text-xs text-slate-400">Immutable chronological event trail</p>
        </div>
      </div>

      {auditLogs.length === 0 ? (
        <p className="text-xs text-slate-400 italic">No audit records found.</p>
      ) : (
        <div className="relative border-l-2 border-slate-800 ml-3 space-y-6">
          {auditLogs.map((log, idx) => {
            const Icon = eventIconMap[log.event] || History;
            const isSystem = log.actor?.role === 'SYSTEM';

            return (
              <div key={idx} className="relative pl-6 group">
                {/* Timeline node icon */}
                <div className={`absolute -left-[13px] top-0.5 flex items-center justify-center w-6 h-6 rounded-full border ${
                  isSystem 
                    ? 'bg-indigo-950 border-indigo-500/60 text-indigo-400' 
                    : 'bg-emerald-950 border-emerald-500/60 text-emerald-400'
                }`}>
                  <Icon className="w-3.5 h-3.5" />
                </div>

                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="text-xs font-bold text-white tracking-wide">{log.event}</span>
                  <span className="text-[11px] text-slate-400">
                    {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed mb-1 bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80">
                  {log.details}
                </p>

                <div className="flex items-center gap-2 text-[11px]">
                  <span className="text-slate-400">Actor:</span>
                  <span className="font-semibold text-slate-200">{log.actor?.name || 'SYSTEM'}</span>
                  <span className={`px-1.5 py-0.2 rounded text-[10px] uppercase font-bold ${
                    isSystem ? 'bg-indigo-500/20 text-indigo-300' : 'bg-emerald-500/20 text-emerald-300'
                  }`}>
                    {log.actor?.role || 'SYSTEM'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
