import React from 'react';
import { Cpu, RefreshCw, CheckCircle } from 'lucide-react';
import PriorityBadge from './PriorityBadge';

export default function AIAnalysisCard({ category, priority, confidence, reason, onReanalyze, isAnalyzing }) {
  const confidencePercent = confidence ? Math.round(confidence * 100) : 0;

  return (
    <div className="glass-panel p-5 border-l-4 border-l-indigo-500">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider">AI Classification</h3>
            <p className="text-xs text-slate-400">Structured Gemini Reasoning Model</p>
          </div>
        </div>
        
        {onReanalyze && (
          <button
            onClick={onReanalyze}
            disabled={isAnalyzing}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-md transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isAnalyzing ? 'animate-spin' : ''}`} />
            <span>Re-analyze</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800">
          <span className="text-xs text-slate-400 block mb-1">Detected Category</span>
          <span className="text-sm font-semibold text-white">{category || 'Pending'}</span>
        </div>

        <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800">
          <span className="text-xs text-slate-400 block mb-1">Assigned Priority</span>
          <div>
            <PriorityBadge priority={priority} size="small" />
          </div>
        </div>

        <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800">
          <span className="text-xs text-slate-400 block mb-1">Confidence Score</span>
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-slate-800 h-2 rounded-full overflow-hidden">
              <div
                className="bg-indigo-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${confidencePercent}%` }}
              />
            </div>
            <span className="text-xs font-bold text-indigo-400">{confidencePercent}%</span>
          </div>
        </div>
      </div>

      {reason && (
        <div className="bg-indigo-950/20 border border-indigo-900/40 rounded-lg p-3 text-xs text-indigo-200/90 leading-relaxed flex items-start gap-2">
          <CheckCircle className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-indigo-300">AI Rationale: </span>
            {reason}
          </div>
        </div>
      )}
    </div>
  );
}
