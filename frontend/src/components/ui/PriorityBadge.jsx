import React from 'react';
import { AlertCircle, AlertTriangle, ArrowUpRight, ArrowDownRight } from 'lucide-react';

export default function PriorityBadge({ priority }) {
  let badgeStyle = 'bg-industrial-recessed text-industrial-dark border-industrial-shadow';
  let Icon = ArrowDownRight;

  if (priority === 'Critical') {
    badgeStyle = 'bg-industrial-orange text-white border-red-400 shadow-[0_0_8px_rgba(255,71,87,0.4)] font-bold';
    Icon = AlertCircle;
  } else if (priority === 'High') {
    badgeStyle = 'bg-[#fef3c7] text-[#92400e] border-[#fde68a] font-semibold';
    Icon = AlertTriangle;
  } else if (priority === 'Medium') {
    badgeStyle = 'bg-[#dbeafe] text-[#1e40af] border-[#bfdbfe] font-medium';
    Icon = ArrowUpRight;
  } else if (priority === 'Low') {
    badgeStyle = 'bg-industrial-recessed text-industrial-label border-industrial-shadow';
    Icon = ArrowDownRight;
  }

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[11px] font-mono uppercase tracking-wider border shadow-xs ${badgeStyle}`}>
      <Icon className="w-3.5 h-3.5 shrink-0" />
      <span>{priority || 'UNASSIGNED'}</span>
    </span>
  );
}
