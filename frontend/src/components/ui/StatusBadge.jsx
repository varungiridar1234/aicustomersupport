import React from 'react';

const statusConfig = {
  NEW: { label: 'New', bg: 'bg-cyan-500/15 border-cyan-500/30 text-cyan-400' },
  UNCLASSIFIED: { label: 'Unclassified', bg: 'bg-purple-500/15 border-purple-500/30 text-purple-400' },
  ASSIGNED: { label: 'Assigned', bg: 'bg-blue-500/15 border-blue-500/30 text-blue-400' },
  IN_PROGRESS: { label: 'In Progress', bg: 'bg-amber-500/15 border-amber-500/30 text-amber-400' },
  WAITING_FOR_CUSTOMER: { label: 'Waiting on Customer', bg: 'bg-slate-500/15 border-slate-500/30 text-slate-400' },
  RESOLVED: { label: 'Resolved', bg: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400' },
  CLOSED: { label: 'Closed', bg: 'bg-slate-700/30 border-slate-600/40 text-slate-400' },
};

export default function StatusBadge({ status }) {
  const config = statusConfig[status] || statusConfig.NEW;

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${config.bg}`}>
      {config.label}
    </span>
  );
}
