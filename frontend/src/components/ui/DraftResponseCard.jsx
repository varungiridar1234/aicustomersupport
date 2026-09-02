import React, { useState } from 'react';
import { Send, Edit3, XCircle, CheckCircle2, ShieldCheck, MessageSquare, AlertCircle } from 'lucide-react';

export default function DraftResponseCard({ draftResponse, isApproved, approvedResponse, onApprove, onReject, onRegenerate, channel }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState(draftResponse || '');

  const displayResponse = isApproved ? (approvedResponse || draftResponse) : draftResponse;

  const handleApprove = () => {
    onApprove(editedText || draftResponse);
    setIsEditing(false);
  };

  return (
    <div className="glass-panel p-5 border-l-4 border-l-brand-500">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-brand-500/10 border border-brand-500/20 text-brand-500">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider">Customer Response Draft</h3>
            <p className="text-xs text-slate-400">Human Approval Required before dispatch via {channel || 'Channel'}</p>
          </div>
        </div>

        {isApproved ? (
          <span className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 rounded-full text-xs font-bold">
            <ShieldCheck className="w-4 h-4" />
            Approved & Dispatched
          </span>
        ) : (
          <span className="flex items-center gap-1.5 px-3 py-1 bg-amber-500/15 border border-amber-500/30 text-amber-400 rounded-full text-xs font-bold animate-pulse-subtle">
            <AlertCircle className="w-4 h-4" />
            Pending Human Approval
          </span>
        )}
      </div>

      <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs text-slate-200 leading-relaxed font-mono whitespace-pre-wrap mb-4 shadow-inner">
        {displayResponse || 'Draft generating...'}
      </div>

      {!isApproved && (
        <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setEditedText(draftResponse);
                setIsEditing(true);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-lg text-xs font-semibold border border-slate-700 transition-colors"
            >
              <Edit3 className="w-3.5 h-3.5" />
              Edit Response
            </button>

            {onReject && (
              <button
                onClick={onReject}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 hover:text-rose-200 rounded-lg text-xs font-semibold border border-rose-800/50 transition-colors"
              >
                <XCircle className="w-3.5 h-3.5" />
                Reject Draft
              </button>
            )}
          </div>

          <button
            onClick={() => handleApprove()}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg shadow-lg shadow-emerald-600/20 transition-all hover:scale-[1.02]"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>APPROVE & SEND</span>
          </button>
        </div>
      )}

      {/* Edit Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-xl w-full p-6 shadow-2xl">
            <h3 className="text-base font-bold text-white mb-2">Edit Customer Response</h3>
            <p className="text-xs text-slate-400 mb-4">Modify the AI-generated message before sending to customer via {channel}.</p>

            <textarea
              value={editedText}
              onChange={(e) => setEditedText(e.target.value)}
              rows={8}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-xs text-slate-100 font-mono focus:outline-none focus:border-brand-500 mb-4"
            />

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 bg-slate-800 text-slate-300 hover:bg-slate-700 rounded-lg text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleApprove}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg shadow-md"
              >
                <Send className="w-3.5 h-3.5" />
                Save & Approve
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
