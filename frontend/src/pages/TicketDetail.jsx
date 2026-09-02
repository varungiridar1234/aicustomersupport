import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  Radio,
  Building,
  CheckCircle,
  RefreshCw,
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
        setMessage({ type: 'success', text: 'OUTGOING MESSAGE DISPATCHED TO CUSTOMER PORTAL!' });
        await fetchTicketDetails();
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Error dispatching message' });
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
        text: 'WORKFLOW RULE: MUST REVIEW & APPROVE CUSTOMER DRAFT BEFORE MARKING RESOLVED.',
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
      <div className="flex items-center justify-center min-h-[600px] font-mono">
        <div className="text-center space-y-4">
          <RefreshCw className="w-8 h-8 text-industrial-orange animate-spin mx-auto" />
          <p className="text-industrial-label text-xs">LOADING SUPPORTIQ CONSOLE MODULE...</p>
        </div>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="industrial-card corner-screws p-8 text-center font-mono">
        <h2 className="text-xl font-bold text-industrial-dark mb-2">TICKET NOT FOUND</h2>
        <p className="text-industrial-label text-xs mb-4">THE REQUESTED TICKET RECORD DOES NOT EXIST.</p>
        <button
          onClick={() => navigate('/dashboard')}
          className="industrial-btn-primary px-4 py-2 text-xs"
        >
          RETURN TO WORKSPACE
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-sans">
      {/* Top Header & Actions Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-3 border-b border-industrial-shadow/40">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="industrial-btn-secondary p-2.5 text-industrial-dark"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <div>
            <div className="flex items-center gap-3 mb-1 font-mono">
              <span className="font-extrabold text-lg text-industrial-orange">{ticket.ticketId}</span>
              <PriorityBadge priority={ticket.priority} />
              <StatusBadge status={ticket.status} />
            </div>
            <h1 className="text-xl font-bold text-industrial-dark">{ticket.subject}</h1>
          </div>
        </div>

        <div className="flex items-center gap-3 font-mono">
          <SLATimer slaDeadline={ticket.slaDeadline} priority={ticket.priority} status={ticket.status} />

          {ticket.status !== 'RESOLVED' && ticket.status !== 'CLOSED' && (
            <div className="flex items-center gap-2">
              {!ticket.isDraftApproved && (
                <span className="text-[11px] font-bold text-[#92400e] bg-[#fef3c7] border border-[#fde68a] px-3 py-1.5 rounded flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 text-[#d97706] shrink-0" />
                  <span>STEP 1: APPROVE DRAFT FIRST</span>
                </span>
              )}

              <button
                onClick={handleResolveTicket}
                disabled={actionLoading || !ticket.isDraftApproved}
                className={`flex items-center gap-2 px-4 py-2 font-bold text-xs rounded transition-all ${
                  ticket.isDraftApproved
                    ? 'bg-[#166534] text-white shadow-xs hover:brightness-110'
                    : 'industrial-btn-secondary opacity-50 cursor-not-allowed'
                }`}
              >
                <CheckCircle className="w-4 h-4" />
                <span>MARK RESOLVED</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Alert Messages */}
      {message && (
        <div className={`industrial-well p-4 text-xs font-mono font-bold flex items-center justify-between border ${
          message.type === 'success' ? 'bg-[#dcfce7] border-[#bbf7d0] text-[#166534]' : 'bg-industrial-orange/10 border-industrial-orange/30 text-industrial-orange'
        }`}>
          <span>{message.text}</span>
          <button onClick={() => setMessage(null)} className="p-1 hover:text-industrial-dark">✕</button>
        </div>
      )}

      {/* 3-Column Industrial Workspace Console */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: Customer & Assignment Info (3 Cols) */}
        <div className="lg:col-span-3 space-y-5">
          {/* Customer Profile Module */}
          <div className="industrial-card corner-screws p-5 space-y-4">
            <h3 className="text-xs font-mono font-bold text-industrial-dark uppercase tracking-wider pl-4 flex items-center gap-2">
              <User className="w-4 h-4 text-industrial-orange" />
              CUSTOMER PROFILE
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <span className="industrial-label block text-[10px]">CUSTOMER NAME</span>
                <span className="font-bold text-industrial-dark text-sm font-mono">{ticket.customer?.name}</span>
              </div>

              <div className="flex items-center gap-2 text-industrial-dark font-mono">
                <Mail className="w-3.5 h-3.5 text-industrial-label shrink-0" />
                <span className="truncate">{ticket.customer?.email}</span>
              </div>

              {ticket.customer?.phone && (
                <div className="flex items-center gap-2 text-industrial-dark font-mono">
                  <Phone className="w-3.5 h-3.5 text-industrial-label shrink-0" />
                  <span>{ticket.customer?.phone}</span>
                </div>
              )}

              <div className="pt-3 border-t border-industrial-shadow/30">
                <span className="industrial-label block text-[10px] mb-1">ORIGINATING CHANNEL</span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-industrial-recessed shadow-recessed text-industrial-dark font-bold font-mono text-xs">
                  <Radio className="w-3.5 h-3.5 text-industrial-orange" />
                  {ticket.channel}
                </span>
              </div>
            </div>
          </div>

          {/* Ticket Assignment Module */}
          <div className="industrial-card corner-screws p-5 space-y-4 font-mono">
            <h3 className="text-xs font-bold text-industrial-dark uppercase tracking-wider pl-4 flex items-center gap-2">
              <Building className="w-4 h-4 text-industrial-orange" />
              ROUTING & AGENT
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <span className="industrial-label block text-[10px]">ASSIGNED TEAM</span>
                <span className="font-bold text-industrial-dark">{ticket.teamId?.name || 'UNASSIGNED'}</span>
              </div>

              <div>
                <span className="industrial-label block text-[10px] mb-1">ASSIGNED AGENT</span>
                {ticket.assignedAgentId ? (
                  <div className="industrial-well p-2.5 flex items-center gap-2.5">
                    <img
                      src={ticket.assignedAgentId.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                      alt="Agent Avatar"
                      className="w-7 h-7 rounded-full object-cover border border-industrial-shadow"
                    />
                    <div>
                      <div className="font-bold text-industrial-dark text-xs">{ticket.assignedAgentId.name}</div>
                      <div className="text-[10px] text-industrial-label font-sans">{ticket.assignedAgentId.email}</div>
                    </div>
                  </div>
                ) : (
                  <span className="text-industrial-label italic">UNASSIGNED</span>
                )}
              </div>

              <div>
                <span className="industrial-label block text-[10px]">CREATED TIMESTAMP</span>
                <span className="text-industrial-dark font-mono text-[11px]">
                  {new Date(ticket.createdAt).toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Issue Description Well */}
          <div className="industrial-card corner-screws p-5 space-y-3">
            <h3 className="text-xs font-mono font-bold text-industrial-dark uppercase tracking-wider pl-4">CUSTOMER STATEMENT</h3>
            <div className="industrial-well p-3.5 text-xs text-industrial-dark leading-relaxed font-sans">
              "{ticket.description}"
            </div>
          </div>
        </div>

        {/* CENTER COLUMN: AI Intelligence & Response Approval (6 Cols) */}
        <div className="lg:col-span-6 space-y-6">
          {/* Two-Way Portal Conversation Terminal */}
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

          {/* Recommended SOP Steps Card */}
          <RecommendationCard recommendations={ticket.aiRecommendation} />

          {/* Human Response Draft Approval Control Panel */}
          <DraftResponseCard
            draftResponse={ticket.draftResponse}
            approvedResponse={ticket.approvedResponse}
            isDraftApproved={ticket.isDraftApproved}
            onApprove={handleApproveDraft}
            onReject={handleRejectDraft}
            loading={actionLoading}
          />
        </div>

        {/* RIGHT COLUMN: RAG Knowledge & Audit Stream (3 Cols) */}
        <div className="lg:col-span-3 space-y-5">
          {/* RAG Knowledge Document Grounding Card */}
          <KnowledgeCard retrievedKnowledge={ticket.retrievedKnowledge} />

          {/* Audit Event Trail */}
          <AuditTimeline logs={auditLogs} />
        </div>
      </div>
    </div>
  );
}
