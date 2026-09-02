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
  AlertCircle,
  Cpu,
  ListOrdered,
  Database,
  Clock,
  MessageSquare
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
  const [activeTab, setActiveTab] = useState('ai'); // 'ai' | 'sop' | 'knowledge' | 'audit'

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
      <div className="flex items-center justify-center min-h-[500px] font-mono">
        <div className="text-center space-y-4">
          <RefreshCw className="w-8 h-8 text-industrial-orange animate-spin mx-auto" />
          <p className="text-industrial-label text-xs">LOADING SUPPORTIQ TICKET WORKSPACE...</p>
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
    <div className="space-y-5 font-sans">
      {/* Top Navigation & Breadcrumb Header */}
      <div className="flex items-center justify-between pb-3 border-b border-industrial-shadow/40 font-mono">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/dashboard')}
            className="industrial-btn-secondary p-2 text-industrial-dark"
            title="Back to Dashboard"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <div>
            <div className="flex items-center gap-2 text-xs font-bold">
              <span className="text-industrial-orange">{ticket.ticketId}</span>
              <span className="text-industrial-label">&bull;</span>
              <span className="text-industrial-dark uppercase">{ticket.category || 'UNCLASSIFIED'}</span>
            </div>
            <h1 className="text-lg font-bold text-industrial-dark font-sans line-clamp-1">{ticket.subject}</h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-industrial-recessed shadow-recessed text-industrial-dark font-bold text-xs">
            <Radio className="w-3.5 h-3.5 text-industrial-orange" />
            {ticket.channel}
          </span>
        </div>
      </div>

      {/* System Alert Notice */}
      {message && (
        <div className={`industrial-well p-3 text-xs font-mono font-bold flex items-center justify-between border ${
          message.type === 'success' ? 'bg-[#dcfce7] border-[#bbf7d0] text-[#166534]' : 'bg-industrial-orange/10 border-industrial-orange/30 text-industrial-orange'
        }`}>
          <span>{message.text}</span>
          <button onClick={() => setMessage(null)} className="p-1 hover:text-industrial-dark">✕</button>
        </div>
      )}

      {/* Desktop 2-Column Grid Layout (8 Cols Main Workspace / 4 Cols Sticky Side Panel) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* MAIN WORKSPACE (8 Columns) */}
        <div className="lg:col-span-8 space-y-5">
          {/* Customer Issue Description Banner */}
          <div className="industrial-card corner-screws p-4 space-y-2">
            <div className="flex items-center justify-between font-mono text-xs">
              <span className="font-bold text-industrial-dark uppercase tracking-wider pl-4">CUSTOMER STATEMENT</span>
              <span className="text-industrial-label text-[11px] pr-4">{new Date(ticket.createdAt).toLocaleString()}</span>
            </div>
            <div className="industrial-well p-3 text-xs text-industrial-dark leading-relaxed font-sans">
              "{ticket.description}"
            </div>
          </div>

          {/* Compact Support Chat Terminal */}
          <CustomerConversationCard
            ticket={ticket}
            onSendReply={handleSendPortalReply}
            loading={actionLoading}
          />

          {/* Compact AI Draft Response Composer */}
          <DraftResponseCard
            draftResponse={ticket.draftResponse}
            approvedResponse={ticket.approvedResponse}
            isDraftApproved={ticket.isDraftApproved}
            onApprove={handleApproveDraft}
            onReject={handleRejectDraft}
            loading={actionLoading}
          />

          {/* Secondary Information Tabs Section */}
          <div className="industrial-card corner-screws p-4 space-y-4">
            {/* Tab Navigation Switches */}
            <div className="flex items-center gap-2 border-b border-industrial-shadow/40 pb-3 overflow-x-auto font-mono text-xs">
              <button
                onClick={() => setActiveTab('ai')}
                className={`px-3 py-1.5 flex items-center gap-1.5 rounded transition-all ${
                  activeTab === 'ai'
                    ? 'industrial-btn-primary'
                    : 'industrial-btn-secondary'
                }`}
              >
                <Cpu className="w-3.5 h-3.5" />
                <span>AI CLASSIFICATION</span>
              </button>

              <button
                onClick={() => setActiveTab('sop')}
                className={`px-3 py-1.5 flex items-center gap-1.5 rounded transition-all ${
                  activeTab === 'sop'
                    ? 'industrial-btn-primary'
                    : 'industrial-btn-secondary'
                }`}
              >
                <ListOrdered className="w-3.5 h-3.5" />
                <span>SOP RECOMMENDATIONS</span>
              </button>

              <button
                onClick={() => setActiveTab('knowledge')}
                className={`px-3 py-1.5 flex items-center gap-1.5 rounded transition-all ${
                  activeTab === 'knowledge'
                    ? 'industrial-btn-primary'
                    : 'industrial-btn-secondary'
                }`}
              >
                <Database className="w-3.5 h-3.5" />
                <span>KNOWLEDGE BASE (RAG)</span>
              </button>

              <button
                onClick={() => setActiveTab('audit')}
                className={`px-3 py-1.5 flex items-center gap-1.5 rounded transition-all ${
                  activeTab === 'audit'
                    ? 'industrial-btn-primary'
                    : 'industrial-btn-secondary'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>AUDIT TRAIL ({auditLogs.length})</span>
              </button>
            </div>

            {/* Tab Panel Content */}
            <div>
              {activeTab === 'ai' && (
                <AIAnalysisCard
                  category={ticket.category}
                  priority={ticket.priority}
                  confidence={ticket.confidence}
                  reason={ticket.classificationReason}
                />
              )}

              {activeTab === 'sop' && (
                <RecommendationCard recommendations={ticket.aiRecommendation} />
              )}

              {activeTab === 'knowledge' && (
                <KnowledgeCard retrievedKnowledge={ticket.retrievedKnowledge} />
              )}

              {activeTab === 'audit' && (
                <AuditTimeline logs={auditLogs} />
              )}
            </div>
          </div>
        </div>

        {/* STICKY RIGHT SIDE PANEL (4 Columns) */}
        <div className="lg:col-span-4 space-y-5 lg:sticky lg:top-20">
          {/* Ticket Status & Resolution Control Panel */}
          <div className="industrial-card corner-screws p-5 space-y-4 shadow-floating">
            <div className="pb-3 border-b border-industrial-shadow/40 font-mono font-bold text-xs text-industrial-dark uppercase tracking-wider pl-4">
              TICKET CONTROL MATRIX
            </div>

            <div className="space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between">
                <span className="text-industrial-label">PRIORITY:</span>
                <PriorityBadge priority={ticket.priority} />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-industrial-label">STATUS:</span>
                <StatusBadge status={ticket.status} />
              </div>

              <div className="pt-1">
                <span className="text-industrial-label block text-[10px] mb-1">SLA COUNTDOWN:</span>
                <SLATimer slaDeadline={ticket.slaDeadline} priority={ticket.priority} status={ticket.status} />
              </div>
            </div>

            {ticket.status !== 'RESOLVED' && ticket.status !== 'CLOSED' && (
              <div className="pt-2 border-t border-industrial-shadow/40 space-y-2">
                {!ticket.isDraftApproved && (
                  <div className="p-2.5 rounded bg-[#fef3c7] border border-[#fde68a] text-[#92400e] text-[11px] font-mono font-bold flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 text-[#d97706] shrink-0" />
                    <span>Approve draft before resolving</span>
                  </div>
                )}

                <button
                  onClick={handleResolveTicket}
                  disabled={actionLoading || !ticket.isDraftApproved}
                  className={`w-full py-2.5 font-mono font-bold text-xs rounded transition-all flex items-center justify-center gap-2 ${
                    ticket.isDraftApproved
                      ? 'bg-[#166534] text-white shadow-xs hover:brightness-110'
                      : 'industrial-btn-secondary opacity-50 cursor-not-allowed'
                  }`}
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>MARK TICKET RESOLVED</span>
                </button>
              </div>
            )}
          </div>

          {/* Customer Metadata Card */}
          <div className="industrial-card corner-screws p-5 space-y-3 font-mono text-xs">
            <h3 className="font-bold text-industrial-dark uppercase tracking-wider pl-4 flex items-center gap-2 text-xs">
              <User className="w-3.5 h-3.5 text-industrial-orange" />
              CUSTOMER INFORMATION
            </h3>

            <div className="space-y-2.5">
              <div>
                <span className="text-industrial-label text-[10px] block">NAME</span>
                <span className="font-bold text-industrial-dark text-sm font-mono">{ticket.customer?.name}</span>
              </div>

              <div className="flex items-center gap-2 text-industrial-dark truncate">
                <Mail className="w-3.5 h-3.5 text-industrial-label shrink-0" />
                <span className="truncate">{ticket.customer?.email}</span>
              </div>

              {ticket.customer?.phone && (
                <div className="flex items-center gap-2 text-industrial-dark">
                  <Phone className="w-3.5 h-3.5 text-industrial-label shrink-0" />
                  <span>{ticket.customer?.phone}</span>
                </div>
              )}
            </div>
          </div>

          {/* Team Routing & Agent Module */}
          <div className="industrial-card corner-screws p-5 space-y-3 font-mono text-xs">
            <h3 className="font-bold text-industrial-dark uppercase tracking-wider pl-4 flex items-center gap-2 text-xs">
              <Building className="w-3.5 h-3.5 text-industrial-orange" />
              ASSIGNMENT DETAILS
            </h3>

            <div className="space-y-2.5">
              <div>
                <span className="text-industrial-label text-[10px] block">ASSIGNED TEAM</span>
                <span className="font-bold text-industrial-dark">{ticket.teamId?.name || 'UNASSIGNED'}</span>
              </div>

              <div>
                <span className="text-industrial-label text-[10px] block mb-1">ASSIGNED AGENT</span>
                {ticket.assignedAgentId ? (
                  <div className="industrial-well p-2 flex items-center gap-2">
                    <img
                      src={ticket.assignedAgentId.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                      alt="Agent Avatar"
                      className="w-6 h-6 rounded-full object-cover border border-industrial-shadow"
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
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
