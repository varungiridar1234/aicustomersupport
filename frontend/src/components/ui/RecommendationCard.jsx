import React from 'react';
import { ListChecks, CheckCircle2 } from 'lucide-react';

export default function RecommendationCard({ recommendations }) {
  const steps = recommendations || [];

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
      <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <ListChecks className="w-4 h-4 text-purple-600" />
          <h3 className="text-sm font-bold text-slate-900">
            Recommended Action Plan
          </h3>
        </div>
        <span className="text-xs font-semibold px-2 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200">
          {steps.length} Recommended Steps
        </span>
      </div>

      <div className="p-5 space-y-3">
        {steps.length === 0 ? (
          <p className="text-slate-500 text-xs italic text-center py-2">
            No recommendations generated.
          </p>
        ) : (
          steps.map((rec, idx) => (
            <div
              key={idx}
              className="flex items-start space-x-3 p-3 bg-slate-50 rounded-lg border border-slate-100"
            >
              <div className="w-6 h-6 rounded-full bg-purple-600 text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                {rec.step || idx + 1}
              </div>
              <div className="space-y-0.5">
                <h4 className="text-xs font-bold text-slate-900">{rec.action}</h4>
                <p className="text-xs text-slate-600 leading-relaxed">{rec.detail}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
