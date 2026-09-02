import React from 'react';
import { Database, FileText, CheckCircle2 } from 'lucide-react';

export default function KnowledgeCard({ retrievedKnowledge }) {
  const docs = retrievedKnowledge || [];

  return (
    <div className="industrial-card corner-screws p-5 space-y-4">
      {/* Header Bar */}
      <div className="flex items-center justify-between pb-3 border-b border-industrial-shadow/40">
        <div className="flex items-center space-x-2 pl-4">
          <div className="w-7 h-7 rounded-lg bg-industrial-recessed shadow-recessed flex items-center justify-center text-industrial-orange">
            <Database className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-industrial-dark uppercase tracking-wider font-mono">
              RAG GROUNDED KNOWLEDGE
            </h3>
            <span className="text-[10px] text-industrial-label font-mono">VECTOR INDEX MATCH</span>
          </div>
        </div>

        <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-industrial-recessed shadow-recessed text-industrial-dark pr-4">
          {docs.length} SOURCES
        </span>
      </div>

      <div className="space-y-3">
        {docs.length === 0 ? (
          <div className="industrial-well p-4 text-center text-xs text-industrial-label italic">
            No grounding documents required for this category.
          </div>
        ) : (
          docs.map((doc, idx) => (
            <div
              key={doc.docId || idx}
              className="industrial-well p-3.5 space-y-2 hover:brightness-105 transition-all"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-industrial-dark text-xs flex items-center gap-1.5 font-mono">
                  <FileText className="w-3.5 h-3.5 text-industrial-orange" />
                  {doc.title}
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-industrial-orange text-white font-bold">
                  {Math.round((doc.score || 0.95) * 100)}% MATCH
                </span>
              </div>
              <p className="text-industrial-label text-xs leading-relaxed font-sans line-clamp-2">
                "{doc.excerpt}"
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
