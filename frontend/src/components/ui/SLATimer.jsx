import React, { useState, useEffect } from 'react';
import { Clock, AlertTriangle, AlertOctagon, CheckCircle2 } from 'lucide-react';

export default function SLATimer({ slaDeadline, priority, status }) {
  const [timeLeft, setTimeLeft] = useState('');
  const [slaState, setSlaState] = useState('ON_TRACK');

  useEffect(() => {
    if (!slaDeadline) {
      setTimeLeft('No SLA set');
      return;
    }

    const calculate = () => {
      const now = new Date().getTime();
      const deadline = new Date(slaDeadline).getTime();
      const diffMs = deadline - now;

      if (['RESOLVED', 'CLOSED'].includes(status)) {
        setSlaState('ON_TRACK');
        setTimeLeft('SLA Completed');
        return;
      }

      if (diffMs <= 0) {
        setSlaState('BREACHED');
        const overMs = Math.abs(diffMs);
        const overMins = Math.floor(overMs / 60000);
        setTimeLeft(`Breached by ${overMins}m`);
        return;
      }

      const totalMins = Math.floor(diffMs / 60000);
      if (totalMins <= 30) {
        setSlaState('AT_RISK');
      } else {
        setSlaState('ON_TRACK');
      }

      const hours = Math.floor(totalMins / 60);
      const mins = totalMins % 60;
      const secs = Math.floor((diffMs % 60000) / 1000);

      if (hours > 0) {
        setTimeLeft(`${hours}h ${mins}m ${secs}s remaining`);
      } else {
        setTimeLeft(`${mins}m ${secs}s remaining`);
      }
    };

    calculate();
    const interval = setInterval(calculate, 1000);
    return () => clearInterval(interval);
  }, [slaDeadline, status]);

  if (['RESOLVED', 'CLOSED'].includes(status)) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
        <CheckCircle2 className="w-4 h-4" />
        <span>SLA Fulfilled</span>
      </div>
    );
  }

  if (slaState === 'BREACHED') {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-400 text-xs font-semibold animate-pulse">
        <AlertOctagon className="w-4 h-4" />
        <span>SLA BREACHED ({timeLeft})</span>
      </div>
    );
  }

  if (slaState === 'AT_RISK') {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-400 text-xs font-semibold animate-pulse-subtle">
        <AlertTriangle className="w-4 h-4 text-amber-400" />
        <span>SLA AT RISK ({timeLeft})</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700 text-slate-300 text-xs font-medium">
      <Clock className="w-4 h-4 text-indigo-400" />
      <span>SLA {timeLeft}</span>
    </div>
  );
}
