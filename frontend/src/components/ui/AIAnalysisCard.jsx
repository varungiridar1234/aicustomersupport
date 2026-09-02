import React from 'react';
import { Cpu, Tag, ShieldAlert, CheckCircle2 } from 'lucide-react';
import PriorityBadge from './PriorityBadge';

export default function AIAnalysisCard({ category, priority, confidence, reason }) {
  const confidencePercent = Math.round((confidence || 0) * 100);

  return (
    <div className="industrial-card corner-screws p-5 space-y-4 relative overflow-hidden">
      {/* Header Bar */}
      <div className="flex items-center justify-between pb-3 border-b border-industrial-shadow/40">
        <div className="flex items-center space-x-2 pl-4">
          <div className="w-7 h-7 rounded-lg bg-industrial-recessed shadow-recessed flex items-center justify-center text-industrial-orange">
            <Cpu className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-industrial-dark uppercase tracking-wider font-mono">
              AI INTELLIGENT CLASSIFICATION
            </h3>
            <span className="text-[10px] text-industrial-label font-mono">MODULE #AI-CLASSIFY</span>
          </div>
        </div>

        <div className="flex items-center space-x-2 pr-4">
          <span className="w-2 h-2 rounded-full led-indicator-active" />
          <span className="text-xs font-mono font-bold px-2.5 py-1 rounded bg-industrial-recessed shadow-recessed text-industrial-dark">
            {confidencePercent}% CONFIDENCE
          </span>
        </div>
      </div>

      {/* Recessed Gauge Grid */}
      <div className="grid grid-cols-2 gap-4">
        <div className="industrial-well p-3.5 space-y-1">
          <span className="industrial-label text-[10px] block">PREDICTED CATEGORY</span>
          <div className="font-bold text-industrial-dark text-sm flex items-center gap-1.5 font-mono">
            <Tag className="w-3.5 h-3.5 text-industrial-orange" />
            <span>{category || 'UNASSIGNED'}</span>
          </div>
        </div>

        <div className="industrial-well p-3.5 space-y-1">
          <span className="industrial-label text-[10px] block font-mono">PREDICTED PRIORITY</span>
          <div className="pt-0.5">
            <PriorityBadge priority={priority} />
          </div>
        </div>
      </div>

      {reason && (
        <div className="space-y-1.5">
          <span className="industrial-label text-[10px] block">CLASSIFICATION RATIONALE</span>
          <div className="industrial-well p-3.5 text-xs text-industrial-dark font-sans leading-relaxed">
            {reason}
          </div>
        </div>
      )}
    </div>
  );
}
