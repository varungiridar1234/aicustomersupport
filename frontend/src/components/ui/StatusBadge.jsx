import React from 'react';
import { Clock, CheckCircle2, UserCheck, AlertCircle, HelpCircle, ShieldCheck } from 'lucide-react';

export default function StatusBadge({ status }) {
  let badgeStyle = 'bg-industrial-recessed text-industrial-dark border-industrial-shadow';
  let ledClass = 'bg-slate-400';
  let label = status ? status.replace(/_/g, ' ') : 'NEW';

  if (status === 'NEW') {
    badgeStyle = 'bg-industrial-recessed text-industrial-dark border-industrial-shadow font-semibold';
    ledClass = 'led-indicator-active';
  } else if (status === 'UNCLASSIFIED') {
    badgeStyle = 'bg-[#fef3c7] text-[#92400e] border-[#fde68a] font-medium';
    ledClass = 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.6)]';
  } else if (status === 'ASSIGNED') {
    badgeStyle = 'bg-[#e0e7ff] text-[#3730a3] border-[#c7d2fe] font-medium';
    ledClass = 'bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.6)]';
  } else if (status === 'IN_PROGRESS') {
    badgeStyle = 'bg-[#ff4757]/10 text-[#ff4757] border-[#ff4757]/30 font-bold';
    ledClass = 'led-indicator-active animate-pulse';
  } else if (status === 'WAITING_FOR_CUSTOMER') {
    badgeStyle = 'bg-[#e0f2fe] text-[#075985] border-[#bae6fd] font-medium';
    ledClass = 'bg-sky-500 shadow-[0_0_8px_rgba(14,165,233,0.6)]';
  } else if (status === 'RESOLVED') {
    badgeStyle = 'bg-[#dcfce7] text-[#166534] border-[#bbf7d0] font-bold';
    ledClass = 'led-indicator-green';
  } else if (status === 'CLOSED') {
    badgeStyle = 'bg-industrial-recessed text-industrial-label border-industrial-shadow';
    ledClass = 'bg-slate-500';
  }

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[11px] font-mono uppercase tracking-wider border ${badgeStyle}`}>
      <span className={`w-2 h-2 rounded-full shrink-0 ${ledClass}`} />
      <span>{label}</span>
    </span>
  );
}
