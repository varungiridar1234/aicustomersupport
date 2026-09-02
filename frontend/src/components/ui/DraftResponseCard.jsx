import React, { useState, useEffect } from 'react';
import { Send, Edit3, ShieldCheck, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';

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
    <div className="bg-white border border-purple-100 rounded-xl shadow-sm overflow-hidden">
      <div className="px-5 py-3.5 bg-gradient-to-r from-purple-50 to-indigo-50/50 border-b border-purple-100 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <ShieldCheck className="w-4 h-4 text-purple-600" />
          <h3 className="text-sm font-bold text-slate-900">
            Human-in-the-Loop Response Approval
          </h3>
        </div>
        {isDraftApproved ? (
          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" /> Approved for Dispatch
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
            <AlertCircle className="w-3.5 h-3.5" /> Pending Agent Review
          </span>
        )}
      </div>

      <div className="p-5 space-y-4">
        {isEditing ? (
          <textarea
            rows={5}
            value={editedText}
            onChange={(e) => setEditedText(e.target.value)}
            className="w-full bg-slate-50 border border-purple-300 rounded-lg p-3.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-600 font-sans leading-relaxed"
          />
        ) : (
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 text-xs text-slate-800 leading-relaxed font-sans whitespace-pre-wrap">
            {editedText || 'No draft generated yet.'}
          </div>
        )}

        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-purple-600 hover:text-purple-700"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit AI Response Draft</span>
            </button>
          ) : (
            <button
              onClick={() => setIsEditing(false)}
              className="text-xs font-semibold text-slate-500 hover:text-slate-700"
            >
              Cancel Edit
            </button>
          )}

          <div className="flex items-center space-x-2">
            {!isDraftApproved && onReject && (
              <button
                onClick={onReject}
                disabled={loading}
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 transition-colors"
              >
                Reject Draft
              </button>
            )}

            <button
              onClick={handleApprove}
              disabled={loading || !editedText.trim()}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold text-white bg-purple-600 hover:bg-purple-700 disabled:opacity-50 transition-colors shadow-sm"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isDraftApproved ? 'Update Approved Response' : 'Approve & Dispatch to Portal'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
