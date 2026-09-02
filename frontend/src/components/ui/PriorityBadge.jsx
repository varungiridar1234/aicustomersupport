import React from 'react';
import { AlertTriangle, AlertCircle, Info, ShieldAlert } from 'lucide-react';

const priorityConfig = {
  Critical: {
    bg: 'bg-rose-500/15 border-rose-500/30 text-rose-400',
    icon: ShieldAlert,
    dot: 'bg-rose-500 animate-pulse',
  },
  High: {
    bg: 'bg-amber-500/15 border-amber-500/30 text-amber-400',
    icon: AlertTriangle,
    dot: 'bg-amber-500',
  },
  Medium: {
    bg: 'bg-indigo-500/15 border-indigo-500/30 text-indigo-400',
    icon: AlertCircle,
    dot: 'bg-indigo-500',
  },
  Low: {
    bg: 'bg-slate-500/15 border-slate-500/30 text-slate-400',
    icon: Info,
    dot: 'bg-slate-400',
  },
};

export default function PriorityBadge({ priority, showIcon = true, size = 'normal' }) {
  const config = priorityConfig[priority] || priorityConfig.Low;
  const Icon = config.icon;

  const sizeClasses = size === 'small' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs';

  return (
    <span className={`inline-flex items-center gap-1.5 font-medium border rounded-md ${config.bg} ${sizeClasses}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {showIcon && <Icon className="w-3.5 h-3.5" />}
      <span>{priority || 'Low'}</span>
    </span>
  );
}
