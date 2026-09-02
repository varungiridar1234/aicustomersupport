import React from 'react';
import { AlertCircle, AlertTriangle, ArrowUpRight, ArrowDownRight } from 'lucide-react';

export default function PriorityBadge({ priority }) {
  let badgeStyle = 'bg-slate-100 text-slate-700 border-slate-200';
  let Icon = ArrowDownRight;

  if (priority === 'Critical') {
    badgeStyle = 'bg-red-50 text-red-700 border-red-200 font-semibold';
    Icon = AlertCircle;
  } else if (priority === 'High') {
    badgeStyle = 'bg-amber-50 text-amber-800 border-amber-200 font-medium';
    Icon = AlertTriangle;
  } else if (priority === 'Medium') {
    badgeStyle = 'bg-blue-50 text-blue-700 border-blue-200 font-medium';
    Icon = ArrowUpRight;
  } else if (priority === 'Low') {
    badgeStyle = 'bg-slate-100 text-slate-600 border-slate-200';
    Icon = ArrowDownRight;
  }

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs border ${badgeStyle}`}>
      <Icon className="w-3.5 h-3.5 shrink-0" />
      <span>{priority || 'Unassigned'}</span>
    </span>
  );
}
