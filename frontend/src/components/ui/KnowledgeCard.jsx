import React, { useState } from 'react';
import { Database, FileText, ChevronRight, ExternalLink, X } from 'lucide-react';

export default function KnowledgeCard({ retrievedKnowledge = [] }) {
  const [selectedDoc, setSelectedDoc] = useState(null);

  return (
    <div className="glass-panel p-5 border-l-4 border-l-emerald-500">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider">Policy Grounding (RAG)</h3>
            <p className="text-xs text-slate-400">Retrieved from Enterprise Vector Index</p>
          </div>
        </div>
        <span className="px-2 py-0.5 text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
          {retrievedKnowledge.length} Docs Grounded
        </span>
      </div>

      {retrievedKnowledge.length === 0 ? (
        <p className="text-xs text-slate-400 italic">No specific policy document matched. Defaulting to general support procedures.</p>
      ) : (
        <div className="space-y-3">
          {retrievedKnowledge.map((doc, idx) => {
            const scorePercent = Math.round((doc.score || 0.85) * 100);
            return (
              <div
                key={idx}
                onClick={() => setSelectedDoc(doc)}
                className="group bg-slate-950/60 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-lg p-3.5 transition-all cursor-pointer"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-semibold text-slate-200 group-hover:text-emerald-300 transition-colors">
                      {doc.title}
                    </span>
                  </div>
                  <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    {scorePercent}% Match
                  </span>
                </div>
                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                  {doc.excerpt}
                </p>
                <div className="flex items-center gap-1 mt-2 text-[11px] text-emerald-400/80 font-medium group-hover:text-emerald-300">
                  <span>View full document policy</span>
                  <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Policy View Modal */}
      {selectedDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-2xl w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setSelectedDoc(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2 mb-3">
              <FileText className="w-5 h-5 text-emerald-400" />
              <h3 className="text-lg font-bold text-white">{selectedDoc.title}</h3>
            </div>
            <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 text-xs text-slate-300 leading-relaxed max-h-96 overflow-y-auto whitespace-pre-wrap">
              {selectedDoc.fullContent || selectedDoc.excerpt}
            </div>
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setSelectedDoc(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-lg"
              >
                Close Policy View
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
