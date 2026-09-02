import React, { useState, useEffect } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import {
  Inbox,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Search,
  Filter,
  RefreshCw,
  PlusCircle,
  Sparkles,
  User,
  ChevronRight,
  Zap
} from 'lucide-react';
import api from '../services/api';
import PriorityBadge from '../components/ui/PriorityBadge';
import StatusBadge from '../components/ui/StatusBadge';
import SLATimer from '../components/ui/SLATimer';
import { getSocket } from '../services/socket';

export default function AgentDashboard() {
  const navigate = useNavigate();
  const { currentPersona } = useOutletContext() || {};
  const [tickets, setTickets] = useState([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  const fetchTickets = async (isBackground = false) => {
    try {
      if (isBackground) {
        setRefreshing(true); // subtle indicator, no spinner replacing the table
      } else {
        setInitialLoading(true);
      }
      const params = {};
      if (search) params.search = search;
      if (priorityFilter) params.priority = priorityFilter;
      if (statusFilter) params.status = statusFilter;
      if (categoryFilter) params.category = categoryFilter;

      const res = await api.get('/tickets', { params });
      if (res.data.success) {
        setTickets(res.data.tickets);
      }
    } catch (err) {
      console.error('Error fetching tickets:', err);
    } finally {
      setInitialLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTickets(false); // Initial load — show spinner

    // Subscribe to real-time socket events for instant update when external portal tickets arrive
    const socket = getSocket();
    const handleLiveEvent = () => {
      fetchTickets(true); // Silent background refresh
    };

    if (socket) {
      socket.on('ticket_updated', handleLiveEvent);
      socket.on('ticket_event', handleLiveEvent);
      socket.on('notification', handleLiveEvent);
    }

    const interval = setInterval(() => fetchTickets(true), 10000); // 10s fallback polling

    return () => {
      if (socket) {
        socket.off('ticket_updated', handleLiveEvent);
        socket.off('ticket_event', handleLiveEvent);
        socket.off('notification', handleLiveEvent);
      }
      clearInterval(interval);
    };
  }, [search, priorityFilter, statusFilter, categoryFilter]);

  // Compute metric stats
  const openCount = tickets.filter(t => !['RESOLVED', 'CLOSED'].includes(t.status)).length;
  const criticalCount = tickets.filter(t => t.priority === 'Critical' && !['RESOLVED', 'CLOSED'].includes(t.status)).length;
  const atRiskCount = tickets.filter(t => ['AT_RISK', 'BREACHED'].includes(t.slaStatus) && !['RESOLVED', 'CLOSED'].includes(t.status)).length;
  const resolvedTodayCount = tickets.filter(t => t.status === 'RESOLVED').length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            Agent Resolution Command
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time ticket queue, automated routing matrix, and SLA management
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchTickets(false)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-slate-900 border border-slate-700 hover:border-slate-600 text-slate-300 hover:text-white text-xs font-semibold transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh Queue
          </button>
        </div>
      </div>

      {/* KPI Metric Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-panel p-4 border-l-4 border-l-brand-500">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Open Queue</span>
            <div className="p-2 rounded-lg bg-brand-500/10 border border-brand-500/20 text-brand-400">
              <Inbox className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-extrabold text-white">{openCount}</span>
            <span className="text-xs text-slate-400 ml-2">tickets</span>
          </div>
        </div>

        <div className="glass-panel p-4 border-l-4 border-l-rose-500">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Critical Escalations</span>
            <div className="p-2 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-extrabold text-rose-400">{criticalCount}</span>
            <span className="text-xs text-slate-400 ml-2">p1 priority</span>
          </div>
        </div>

        <div className="glass-panel p-4 border-l-4 border-l-amber-500">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">SLA At Risk / Breached</span>
            <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-extrabold text-amber-400">{atRiskCount}</span>
            <span className="text-xs text-slate-400 ml-2">require prompt action</span>
          </div>
        </div>

        <div className="glass-panel p-4 border-l-4 border-l-emerald-500">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Resolved Tickets</span>
            <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-extrabold text-emerald-400">{resolvedTodayCount}</span>
            <span className="text-xs text-slate-400 ml-2">completed</span>
          </div>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="glass-panel p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search ticket ID, subject, customer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-brand-500"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-semibold shrink-0">
            <Filter className="w-3.5 h-3.5" />
            <span>Filters:</span>
          </div>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-xs font-semibold text-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:border-brand-500"
          >
            <option value="">All Priorities</option>
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-xs font-semibold text-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:border-brand-500"
          >
            <option value="">All Statuses</option>
            <option value="NEW">New</option>
            <option value="ASSIGNED">Assigned</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="RESOLVED">Resolved</option>
            <option value="CLOSED">Closed</option>
          </select>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-xs font-semibold text-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:border-brand-500"
          >
            <option value="">All Categories</option>
            <option value="Payment">Payment</option>
            <option value="Technical">Technical</option>
            <option value="Delivery">Delivery</option>
            <option value="Account">Account</option>
            <option value="Security">Security</option>
          </select>
        </div>
      </div>

      {/* Ticket List Table */}
      <div className="glass-panel overflow-hidden">
        {initialLoading ? (
          <div className="py-16 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin text-brand-500" />
            <span>Loading active ticket queue...</span>
          </div>
        ) : tickets.length === 0 ? (
          <div className="py-16 text-center text-slate-400">
            <p className="text-sm font-semibold mb-1">No tickets match criteria</p>
            <p className="text-xs text-slate-500">
              Customer support requests are submitted through the external Customer Service Request Portal and will appear here automatically.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/60 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  <th className="py-3.5 px-4">Ticket ID</th>
                  <th className="py-3.5 px-4">Customer & Channel</th>
                  <th className="py-3.5 px-4">Issue Subject</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Priority</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">SLA Deadline</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-xs text-slate-200">
                {tickets.map((ticket) => (
                  <tr
                    key={ticket._id}
                    onClick={() => navigate(`/tickets/${ticket._id}`)}
                    className="hover:bg-slate-850/80 transition-colors cursor-pointer group"
                  >
                    <td className="py-4 px-4 font-mono font-bold text-brand-400 group-hover:text-brand-300">
                      {ticket.ticketId}
                    </td>

                    <td className="py-4 px-4">
                      <div className="font-semibold text-white">{ticket.customer?.name}</div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                        <span>{ticket.customer?.email}</span>
                        <span className="px-1.5 py-0.2 rounded bg-slate-800 border border-slate-700 text-slate-300 font-mono text-[10px]">
                          {ticket.channel}
                        </span>
                      </div>
                    </td>

                    <td className="py-4 px-4 max-w-xs">
                      <div className="font-semibold text-slate-100 truncate group-hover:text-white transition-colors">
                        {ticket.subject}
                      </div>
                      <div className="text-[11px] text-slate-400 truncate mt-0.5">
                        {ticket.description}
                      </div>
                    </td>

                    <td className="py-4 px-4 font-medium text-slate-300">
                      {ticket.category || 'Unclassified'}
                    </td>

                    <td className="py-4 px-4">
                      <PriorityBadge priority={ticket.priority} size="small" />
                    </td>

                    <td className="py-4 px-4">
                      <StatusBadge status={ticket.status} />
                    </td>

                    <td className="py-4 px-4">
                      <SLATimer slaDeadline={ticket.slaDeadline} priority={ticket.priority} status={ticket.status} />
                    </td>

                    <td className="py-4 px-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/tickets/${ticket._id}`);
                        }}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 group-hover:bg-brand-600 text-slate-200 group-hover:text-white font-semibold text-xs transition-all"
                      >
                        <span>View</span>
                        <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
