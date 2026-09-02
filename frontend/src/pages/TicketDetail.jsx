import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  Radio,
  Building,
  UserCheck,
  CheckCircle,
  XCircle,
  RefreshCw,
  Sparkles,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import api from '../services/api';
import PriorityBadge from '../components/ui/PriorityBadge';
import StatusBadge from '../components/ui/StatusBadge';
import SLATimer from '../components/ui/SLATimer';
import AIAnalysisCard from '../components/ui/AIAnalysisCard';
import KnowledgeCard from '../components/ui/KnowledgeCard';
import RecommendationCard from '../components/ui/RecommendationCard';
import DraftResponseCard from '../components/ui/DraftResponseCard';
import CustomerConversationCard from '../components/ui/CustomerConversationCard';
import AuditTimeline from '../components/ui/AuditTimeline';

export default function TicketDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [ticket, setTicket] = useState(null);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const fetchTicketDetails = async () => {
    try {
      setLoading(true);
      const [ticketRes, auditRes] = await Promise.all([
        api.get(`/tickets/${id}`),
        api.get(`/tickets/${id}/audit`),
      ]);

      if (ticketRes.data.success) {
        setTicket(ticketRes.data.ticket);
      }
      if (auditRes.data.success) {
        setAuditLogs(auditRes.data.logs);
      }
    } catch (err) {
      console.error('Error fetching ticket details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTicketDetails();
  }, [id]);

  const handleApproveDraft = async (editedResponse) => {
    try {
      setActionLoading(true);
      const res = await api.post(`/tickets/${id}/approve`, { editedResponse });
      if (res.data.success) {
        setMessage({ type: 'success', text: res.data.message });
        await fetchTicketDetails();
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Error approving response' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleSendPortalReply = async (replyText) => {
    try {
      setActionLoading(true);
      const res = await api.post(`/tickets/${id}/approve`, { editedResponse: replyText });
      if (res.data.success) {
        setMessage({ type: 'success', text: 'Outgoing message successfully dispatched to Customer Portal thread!' });
        await fetchTicketDetails();
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Error dispatching message to Portal' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectDraft = async () => {
    try {
      setActionLoading(true);
      const res = await api.post(`/tickets/${id}/reject`, { reason: 'Agent requested manual revision' });
      if (res.data.success) {
        setMessage({ type: 'info', text: res.data.message });
        await fetchTicketDetails();
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Error rejecting response' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleResolveTicket = async () => {
    if (!ticket.isDraftApproved && !ticket.approvedResponse) {
      setMessage({
        type: 'error',
        text: 'Linear Workflow Rule: You must review, edit, and approve the customer response draft before marking the ticket as RESOLVED.',
      });
      return;
    }

    try {
      setActionLoading(true);
      const res = await api.post(`/tickets/${id}/resolve`, {
        resolutionNotes: 'Ticket verified and resolved after human agent review.',
      });
      if (res.data.success) {
        setMessage({ type: 'success', text: res.data.message });
        await fetchTicketDetails();
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Error resolving ticket' });
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[600px]">
        <div className="text-center space-y-4">
          <RefreshCw className="w-8 h-8 text-brand-500 animate-spin mx-auto" />
          <p className="text-slate-400 text-sm">Loading Ticket Command Center...</p>
        </div>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="p-8 text-center glass-panel">
        <h2 className="text-xl font-bold text-white mb-2">Ticket Not Found</h2>
        <p className="text-slate-400 text-sm mb-4">The requested ticket ID does not exist or has been removed.</p>
        <button
          onClick={() => navigate('/dashboard')}
          className="px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-lg text-xs font-semibold"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Header & Actions Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="p-2 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <div>
            <div className="flex items-center gap-3 mb-1">
              <span className="font-mono font-extrabold text-lg text-brand-400">{ticket.ticketId}</span>
              <PriorityBadge priority={ticket.priority} />
              <StatusBadge status={ticket.status} />
            </div>
            <h1 className="text-xl font-bold text-white">{ticket.subject}</h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <SLATimer slaDeadline={ticket.slaDeadline} priority={ticket.priority} status={ticket.status} />

          {ticket.status !== 'RESOLVED' && ticket.status !== 'CLOSED' && (
            <div className="flex items-center gap-2">
              {!ticket.isDraftApproved && (
                <span className="text-[11px] font-bold text-amber-300 bg-amber-500/15 border border-amber-500/30 px-3 py-1.5 rounded-lg flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>Step 1: Approve Response Draft First</span>
                </span>
              )}

              <button
                onClick={handleResolveTicket}
                disabled={actionLoading || !ticket.isDraftApproved}
                className={`flex items-center gap-2 px-4 py-2 text-white font-bold text-xs rounded-lg shadow-lg transition-all ${
                  ticket.isDraftApproved
                    ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/20 hover:scale-[1.02]'
                    : 'bg-slate-800 text-slate-400 border border-slate-700 cursor-not-allowed opacity-60'
                }`}
              >
                <CheckCircle className="w-4 h-4" />
                <span>Mark Resolved</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Alert Messages */}
      {message && (
        <div className={`p-4 rounded-xl text-xs font-semibold flex items-center justify-between border ${
          message.type === 'success' ? 'bg-emerald-950/40 border-emerald-800 text-emerald-300' : 'bg-rose-950/40 border-rose-800 text-rose-300'
        }`}>
          <span>{message.text}</span>
          <button onClick={() => setMessage(null)} className="p-1 hover:text-white">✕</button>
        </div>
      )}

      {/* 3-Column Enterprise Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: Customer & Ticket Details (3 Cols) */}
        <div className="lg:col-span-3 space-y-5">
          {/* Customer Profile Card */}
          <div className="glass-panel p-5">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <User className="w-4 h-4 text-brand-400" />
              Customer Details
            </h3>

            <div className="space-y-3.5 text-xs">
              <div>
                <span className="text-slate-400 block text-[11px]">Customer Name</span>
                <span className="font-bold text-white text-sm">{ticket.customer?.name}</span>
              </div>

              <div className="flex items-center gap-2 text-slate-300">
                <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="truncate">{ticket.customer?.email}</span>
              </div>

              {ticket.customer?.phone && (
                <div className="flex items-center gap-2 text-slate-300">
                  <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{ticket.customer?.phone}</span>
                </div>
              )}

              <div className="pt-3 border-t border-slate-800">
                <span className="text-slate-400 block text-[11px] mb-1">Originating Channel</span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-800 border border-slate-700 text-brand-400 font-bold font-mono">
                  <Radio className="w-3.5 h-3.5 text-brand-400" />
                  {ticket.channel}
                </span>
              </div>
            </div>
          </div>

          {/* Ticket Metadata & Agent Assignment */}
          <div className="glass-panel p-5">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Building className="w-4 h-4 text-brand-400" />
              Assignment & Routing
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-slate-400 block text-[11px]">Assigned Team</span>
                <span className="font-semibold text-white">{ticket.teamId?.name || 'Unassigned'}</span>
              </div>

              <div>
                <span className="text-slate-400 block text-[11px] mb-1">Assigned Agent</span>
                {ticket.assignedAgentId ? (
                  <div className="flex items-center gap-2.5 bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                    <img
                      src={ticket.assignedAgentId.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                      alt="Agent Avatar"
                      className="w-7 h-7 rounded-full object-cover border border-brand-500"
                    />
                    <div>
                      <div className="font-bold text-white text-xs">{ticket.assignedAgentId.name}</div>
                      <div className="text-[10px] text-slate-400">{ticket.assignedAgentId.email}</div>
                    </div>
                  </div>
                ) : (
                  <span className="text-slate-500 italic">No agent assigned</span>
                )}
              </div>

              <div>
                <span className="text-slate-400 block text-[11px]">Created Timestamp</span>
                <span className="text-slate-300 font-mono text-[11px]">
                  {new Date(ticket.createdAt).toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Full Customer Issue Description Card */}
          <div className="glass-panel p-5">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Customer Description</h3>
            <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800 text-xs text-slate-300 leading-relaxed font-sans">
              "{ticket.description}"
            </div>
          </div>
        </div>

        {/* CENTER COLUMN: AI Intelligence & Approval Workflow (6 Cols) */}
        <div className="lg:col-span-6 space-y-6">
          {/* Two-Way Customer Conversation Card */}
          <CustomerConversationCard
            ticket={ticket}
            onSendReply={handleSendPortalReply}
            loading={actionLoading}
          />

          {/* AI Ticket Classification Card */}
          <AIAnalysisCard
            category={ticket.category}
            priority={ticket.priority}
            confidence={ticket.confidence}
            reason={ticket.classificationReason}
          />

          {/* AI Step-by-Step Resolution Recommendations */}
          <RecommendationCard recommendations={ticket.aiRecommendation} />

          {/* Human-in-the-Loop AI Response Draft Approval */}
          <DraftResponseCard
            draftResponse={ticket.draftResponse}
            approvedResponse={ticket.approvedResponse}
            isDraftApproved={ticket.isDraftApproved}
            onApprove={handleApproveDraft}
            onReject={handleRejectDraft}
            loading={actionLoading}
          />
        </div>

        {/* RIGHT COLUMN: RAG Knowledge Grounding & Audit Trail (3 Cols) */}
        <div className="lg:col-span-3 space-y-5">
          {/* Grounded Knowledge Documents Card */}
          <KnowledgeCard retrievedKnowledge={ticket.retrievedKnowledge} />

          {/* Audit & State Machine Event Logs */}
          <AuditTimeline logs={auditLogs} />
        </div>
      </div>
    </div>
  );
}
