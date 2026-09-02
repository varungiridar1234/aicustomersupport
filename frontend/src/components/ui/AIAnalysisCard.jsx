import React from 'react';
import { Sparkles, Tag, ShieldAlert, CheckCircle2 } from 'lucide-react';
import PriorityBadge from './PriorityBadge';

export default function AIAnalysisCard({ category, priority, confidence, reason }) {
  const confidencePercent = Math.round((confidence || 0) * 100);

  return (
    <div className="bg-white border border-purple-100 rounded-xl shadow-sm overflow-hidden">
      <div className="px-5 py-3.5 bg-gradient-to-r from-purple-50 to-indigo-50/50 border-b border-purple-100 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 rounded-md bg-purple-600 text-white shadow-sm">
            <Sparkles className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-bold text-slate-900">
            AI Intelligent Classification
          </h3>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-purple-100 text-purple-700 border border-purple-200">
          {confidencePercent}% Confidence
        </span>
      </div>

      <div className="p-5 space-y-4 text-xs">
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
            <span className="text-slate-500 block text-[11px] font-medium mb-1">Predicted Category</span>
            <span className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-purple-600" />
              {category || 'Unassigned'}
            </span>
          </div>

          <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
            <span className="text-slate-500 block text-[11px] font-medium mb-1 font-sans">Predicted Priority</span>
            <PriorityBadge priority={priority} />
          </div>
        </div>

        {reason && (
          <div className="pt-2">
            <span className="text-slate-500 block text-[11px] font-medium mb-1">Classification Rationale</span>
            <p className="text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-100 leading-relaxed">
              {reason}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
