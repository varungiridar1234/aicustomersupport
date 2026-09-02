import React, { useState, useEffect } from 'react';
import { Clock, AlertTriangle, AlertOctagon, CheckCircle2 } from 'lucide-react';

export default function SLATimer({ slaDeadline, priority, status }) {
  const [timeLeft, setTimeLeft] = useState('');
  const [slaState, setSlaState] = useState('ON_TRACK');

  useEffect(() => {
    if (!slaDeadline) {
      setTimeLeft('NO SLA SET');
      return;
    }

    const calculate = () => {
      const now = new Date().getTime();
      const deadline = new Date(slaDeadline).getTime();
      const diffMs = deadline - now;

      if (['RESOLVED', 'CLOSED'].includes(status)) {
        setSlaState('ON_TRACK');
        setTimeLeft('SLA COMPLETED');
        return;
      }

      if (diffMs <= 0) {
        setSlaState('BREACHED');
        const overMs = Math.abs(diffMs);
        const overMins = Math.floor(overMs / 60000);
        setTimeLeft(`BREACHED +${overMins}m`);
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
        setTimeLeft(`${hours}h ${mins}m ${secs}s REMAINING`);
      } else {
        setTimeLeft(`${mins}m ${secs}s REMAINING`);
      }
    };

    calculate();
    const interval = setInterval(calculate, 1000);
    return () => clearInterval(interval);
  }, [slaDeadline, status]);

  if (['RESOLVED', 'CLOSED'].includes(status)) {
    return (
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-[#dcfce7] border border-[#bbf7d0] text-[#166534] font-mono text-xs font-bold shadow-xs">
        <span className="w-2 h-2 rounded-full led-indicator-green" />
        <CheckCircle2 className="w-3.5 h-3.5" />
        <span>SLA FULFILLED</span>
      </div>
    );
  }

  if (slaState === 'BREACHED') {
    return (
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-industrial-orange text-white font-mono text-xs font-bold shadow-[0_0_10px_rgba(255,71,87,0.5)] animate-pulse">
        <AlertOctagon className="w-3.5 h-3.5" />
        <span>{timeLeft}</span>
      </div>
    );
  }

  if (slaState === 'AT_RISK') {
    return (
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-[#fef3c7] border border-[#fde68a] text-[#92400e] font-mono text-xs font-bold shadow-xs animate-pulse-subtle">
        <AlertTriangle className="w-3.5 h-3.5 text-[#d97706]" />
        <span>SLA AT RISK ({timeLeft})</span>
      </div>
    );
  }

  return (
    <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-industrial-recessed shadow-recessed text-industrial-dark font-mono text-xs font-bold border-none">
      <Clock className="w-3.5 h-3.5 text-industrial-orange" />
      <span>SLA {timeLeft}</span>
    </div>
  );
}
