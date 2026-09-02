import React from 'react';
import { Clock, CheckCircle2, UserCheck, AlertCircle, HelpCircle, ShieldCheck } from 'lucide-react';

export default function StatusBadge({ status }) {
  let badgeStyle = 'bg-slate-100 text-slate-700 border-slate-200';
  let Icon = HelpCircle;
  let label = status ? status.replace(/_/g, ' ') : 'NEW';

  if (status === 'NEW') {
    badgeStyle = 'bg-purple-50 text-purple-700 border-purple-200 font-medium';
    Icon = AlertCircle;
  } else if (status === 'UNCLASSIFIED') {
    badgeStyle = 'bg-amber-50 text-amber-700 border-amber-200 font-medium';
    Icon = Clock;
  } else if (status === 'ASSIGNED') {
    badgeStyle = 'bg-blue-50 text-blue-700 border-blue-200 font-medium';
    Icon = UserCheck;
  } else if (status === 'IN_PROGRESS') {
    badgeStyle = 'bg-purple-100 text-purple-800 border-purple-300 font-semibold';
    Icon = Clock;
  } else if (status === 'WAITING_FOR_CUSTOMER') {
    badgeStyle = 'bg-sky-50 text-sky-700 border-sky-200 font-medium';
    Icon = Clock;
  } else if (status === 'RESOLVED') {
    badgeStyle = 'bg-emerald-50 text-emerald-700 border-emerald-200 font-semibold';
    Icon = CheckCircle2;
  } else if (status === 'CLOSED') {
    badgeStyle = 'bg-slate-100 text-slate-600 border-slate-200';
    Icon = ShieldCheck;
  }

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs uppercase tracking-wider border ${badgeStyle}`}>
      <Icon className="w-3.5 h-3.5 shrink-0" />
      <span>{label}</span>
    </span>
  );
}
