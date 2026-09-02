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
    <div className="industrial-card corner-screws p-5 space-y-4">
      {/* Header Bar */}
      <div className="flex items-center justify-between pb-3 border-b border-industrial-shadow/40">
        <div className="flex items-center space-x-2 pl-4">
          <div className="w-7 h-7 rounded-lg bg-industrial-recessed shadow-recessed flex items-center justify-center text-industrial-orange">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-industrial-dark uppercase tracking-wider font-mono">
              HUMAN-IN-THE-LOOP RESPONSE APPROVAL
            </h3>
            <span className="text-[10px] text-industrial-label font-mono">GATEWAY CONTROL PANEL</span>
          </div>
        </div>

        <div className="pr-4">
          {isDraftApproved ? (
            <span className="inline-flex items-center gap-1.5 text-[11px] font-mono font-bold px-2.5 py-1 rounded bg-[#dcfce7] border border-[#bbf7d0] text-[#166534]">
              <span className="w-2 h-2 rounded-full led-indicator-green" />
              APPROVED FOR DISPATCH
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 text-[11px] font-mono font-bold px-2.5 py-1 rounded bg-[#fef3c7] border border-[#fde68a] text-[#92400e]">
              <span className="w-2 h-2 rounded-full led-indicator-active animate-pulse" />
              PENDING AGENT REVIEW
            </span>
          )}
        </div>
      </div>

      <div className="space-y-4">
        {isEditing ? (
          <textarea
            rows={5}
            value={editedText}
            onChange={(e) => setEditedText(e.target.value)}
            className="w-full industrial-well p-3.5 text-xs text-industrial-dark focus:outline-none font-sans leading-relaxed shadow-recessed"
          />
        ) : (
          <div className="industrial-well p-4 text-xs text-industrial-dark leading-relaxed font-sans whitespace-pre-wrap">
            {editedText || 'No draft generated yet.'}
          </div>
        )}

        <div className="flex items-center justify-between pt-2 border-t border-industrial-shadow/30">
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-industrial-orange hover:underline"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>EDIT RESPONSE DRAFT</span>
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
                className="industrial-btn-secondary px-3 py-2 text-xs font-mono text-red-600 hover:text-red-700"
              >
                REJECT DRAFT
              </button>
            )}

            <button
              onClick={handleApprove}
              disabled={loading || !editedText.trim()}
              className="industrial-btn-primary px-4 py-2 text-xs font-mono flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isDraftApproved ? 'UPDATE DISPATCHED RESPONSE' : 'APPROVE & DISPATCH TO PORTAL'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
