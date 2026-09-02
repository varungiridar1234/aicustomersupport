import React, { useState, useEffect } from 'react';
import { Send, Edit3, ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react';

export default function DraftResponseCard({
  draftResponse,
  approvedResponse,
  isDraftApproved,
  onApprove,
  onReject,
  loading,
}) {
  const [editedText, setEditedText] = useState(draftResponse || '');
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    setEditedText(approvedResponse || draftResponse || '');
  }, [draftResponse, approvedResponse]);

  const handleApprove = () => {
    if (onApprove) {
      onApprove(editedText);
      setIsEditing(false);
    }
  };

  return (
    <div className="industrial-card corner-screws p-4 space-y-3">
      {/* Compact Header Bar */}
      <div className="flex items-center justify-between pb-2 border-b border-industrial-shadow/40">
        <div className="flex items-center space-x-2 pl-4">
          <div className="w-6 h-6 rounded bg-industrial-recessed shadow-recessed flex items-center justify-center text-industrial-orange">
            <ShieldCheck className="w-3.5 h-3.5" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-industrial-dark uppercase tracking-wider font-mono">
              AI RESPONSE COMPOSER & APPROVAL
            </h3>
          </div>
        </div>

        <div className="pr-4">
          {isDraftApproved ? (
            <span className="inline-flex items-center gap-1.5 text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-[#dcfce7] border border-[#bbf7d0] text-[#166534]">
              <span className="w-2 h-2 rounded-full led-indicator-green" />
              APPROVED FOR DISPATCH
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-[#fef3c7] border border-[#fde68a] text-[#92400e]">
              <span className="w-2 h-2 rounded-full led-indicator-active animate-pulse" />
              PENDING REVIEW
            </span>
          )}
        </div>
      </div>

      <div className="space-y-3">
        {isEditing ? (
          <textarea
            rows={4}
            value={editedText}
            onChange={(e) => setEditedText(e.target.value)}
            className="w-full industrial-well p-3 text-xs text-industrial-dark focus:outline-none font-sans leading-relaxed shadow-recessed"
          />
        ) : (
          <div className="industrial-well p-3 text-xs text-industrial-dark leading-relaxed font-sans max-h-40 overflow-y-auto whitespace-pre-wrap">
            {editedText || 'No draft generated yet.'}
          </div>
        )}

        <div className="flex items-center justify-between pt-1 border-t border-industrial-shadow/30">
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-industrial-orange hover:underline"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>EDIT DRAFT TEXT</span>
            </button>
          ) : (
            <button
              onClick={() => setIsEditing(false)}
              className="text-xs font-mono font-bold text-industrial-label hover:text-industrial-dark"
            >
              CANCEL EDIT
            </button>
          )}

          <div className="flex items-center space-x-2">
            {!isDraftApproved && onReject && (
              <button
                onClick={onReject}
                disabled={loading}
                className="industrial-btn-secondary px-3 py-1.5 text-xs font-mono text-red-600 hover:text-red-700"
              >
                REJECT
              </button>
            )}

            <button
              onClick={handleApprove}
              disabled={loading || !editedText.trim()}
              className="industrial-btn-primary px-3.5 py-1.5 text-xs font-mono flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isDraftApproved ? 'UPDATE DISPATCH' : 'APPROVE & DISPATCH TO PORTAL'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
