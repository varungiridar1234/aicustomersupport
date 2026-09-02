import React from 'react';
import { ListOrdered, CheckCircle2 } from 'lucide-react';

export default function RecommendationCard({ recommendations }) {
  const steps = recommendations || [];

  return (
    <div className="industrial-card corner-screws p-4 space-y-3">
      {/* Compact Header Bar */}
      <div className="flex items-center justify-between pb-2 border-b border-industrial-shadow/40">
        <div className="flex items-center space-x-2 pl-4">
          <div className="w-6 h-6 rounded bg-industrial-recessed shadow-recessed flex items-center justify-center text-industrial-orange">
            <ListOrdered className="w-3.5 h-3.5" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-industrial-dark uppercase tracking-wider font-mono">
              RECOMMENDED ACTION PLAN
            </h3>
          </div>
        </div>

        <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-industrial-recessed shadow-recessed text-industrial-dark pr-4">
          {steps.length} STEPS
        </span>
      </div>

      {/* Structured Compact SOP Table */}
      {steps.length === 0 ? (
        <div className="industrial-well p-4 text-center text-xs text-industrial-label italic">
          No recommendations generated.
        </div>
      ) : (
        <div className="industrial-well p-1 overflow-hidden">
          <table className="w-full text-left border-collapse font-mono text-xs">
            <thead>
              <tr className="border-b border-industrial-shadow/40 bg-industrial-recessed text-industrial-dark font-bold uppercase">
                <th className="py-2 px-3 w-16">STEP</th>
                <th className="py-2 px-3 w-48">ACTION REQUIRED</th>
                <th className="py-2 px-3">PROCEDURE DETAILS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-industrial-shadow/30 text-industrial-dark">
              {steps.map((rec, idx) => (
                <tr key={idx} className="hover:bg-industrial-panel transition-colors">
                  <td className="py-2 px-3 font-bold font-mono text-industrial-orange">
                    0{rec.step || idx + 1}
                  </td>
                  <td className="py-2 px-3 font-bold font-mono text-industrial-dark uppercase">
                    {rec.action}
                  </td>
                  <td className="py-2 px-3 font-sans text-xs text-industrial-label leading-normal">
                    {rec.detail}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
