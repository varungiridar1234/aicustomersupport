import React from 'react';
import { ListChecks, ArrowRight } from 'lucide-react';

export default function RecommendationCard({ recommendations = [] }) {
  return (
    <div className="glass-panel p-5 border-l-4 border-l-cyan-500">
      <div className="flex items-center gap-2.5 mb-4">
        <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
          <ListChecks className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-white uppercase tracking-wider">AI Recommended Resolution Plan</h3>
          <p className="text-xs text-slate-400">Step-by-step action plan for human support agent</p>
        </div>
      </div>

      {recommendations.length === 0 ? (
        <p className="text-xs text-slate-400 italic">Recommendation plan generating...</p>
      ) : (
        <div className="space-y-3">
          {recommendations.map((rec, idx) => (
            <div key={idx} className="flex items-start gap-3 bg-slate-950/60 p-3 rounded-lg border border-slate-800">
              <div className="flex items-center justify-center w-6 h-6 rounded-full bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 font-bold text-xs shrink-0 mt-0.5">
                {rec.step || idx + 1}
              </div>
              <div className="flex-1">
                <h4 className="text-xs font-bold text-slate-200 mb-0.5">{rec.action}</h4>
                <p className="text-xs text-slate-400 leading-relaxed">{rec.detail}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
