import React from 'react';
import { BookOpen, ExternalLink, FileText } from 'lucide-react';

export default function KnowledgeCard({ retrievedKnowledge }) {
  const docs = retrievedKnowledge || [];

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
      <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <BookOpen className="w-4 h-4 text-purple-600" />
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            RAG Grounded Knowledge
          </h3>
        </div>
        <span className="text-[11px] font-semibold text-slate-500">
          {docs.length} Sources
        </span>
      </div>

      <div className="p-4 space-y-3">
        {docs.length === 0 ? (
          <p className="text-slate-500 text-xs italic text-center py-2">
            No grounding documents required for this category.
          </p>
        ) : (
          docs.map((doc, idx) => (
            <div
              key={doc.docId || idx}
              className="p-3 bg-slate-50 hover:bg-purple-50/50 rounded-lg border border-slate-200/80 transition-colors"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-semibold text-slate-900 text-xs flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-purple-600" />
                  {doc.title}
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-100 text-purple-700 font-bold">
                  {Math.round((doc.score || 0.95) * 100)}% Match
                </span>
              </div>
              <p className="text-slate-600 text-[11px] leading-relaxed line-clamp-2">
                "{doc.excerpt}"
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
