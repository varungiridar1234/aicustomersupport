import React from 'react';
import { ListOrdered, CheckCircle2 } from 'lucide-react';

export default function RecommendationCard({ recommendations }) {
  const steps = recommendations || [];

  return (
    <div className="industrial-card corner-screws p-5 space-y-4">
      {/* Header Bar */}
      <div className="flex items-center justify-between pb-3 border-b border-industrial-shadow/40">
        <div className="flex items-center space-x-2 pl-4">
          <div className="w-7 h-7 rounded-lg bg-industrial-recessed shadow-recessed flex items-center justify-center text-industrial-orange">
            <ListOrdered className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-industrial-dark uppercase tracking-wider font-mono">
              RECOMMENDED ACTION PLAN
            </h3>
            <span className="text-[10px] text-industrial-label font-mono">SOP EXECUTION SEQUENCE</span>
          </div>
        </div>

        <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-industrial-recessed shadow-recessed text-industrial-dark pr-4">
          {steps.length} STEPS
        </span>
      </div>

      <div className="space-y-3">
        {steps.length === 0 ? (
          <div className="industrial-well p-4 text-center text-xs text-industrial-label italic">
            No recommendations generated.
          </div>
        ) : (
          steps.map((rec, idx) => (
            <div
              key={idx}
              className="industrial-well p-3.5 flex items-start space-x-3"
            >
              <div className="w-6 h-6 rounded bg-industrial-orange text-white font-mono text-xs font-bold flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                0{rec.step || idx + 1}
              </div>
              <div className="space-y-0.5">
                <h4 className="text-xs font-bold text-industrial-dark font-mono uppercase">{rec.action}</h4>
                <p className="text-xs text-industrial-label leading-relaxed font-sans">{rec.detail}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
