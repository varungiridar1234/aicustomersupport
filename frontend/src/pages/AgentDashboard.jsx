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
  ChevronRight,
  Cpu
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
        setRefreshing(true);
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
    fetchTickets(false);

    const socket = getSocket();
    const handleLiveEvent = () => {
      fetchTickets(true);
    };

    if (socket) {
      socket.on('ticket_updated', handleLiveEvent);
      socket.on('ticket_event', handleLiveEvent);
      socket.on('ticket:created', handleLiveEvent);
      socket.on('notification', handleLiveEvent);
    }

    const interval = setInterval(() => fetchTickets(true), 3000);

    return () => {
      if (socket) {
        socket.off('ticket_updated', handleLiveEvent);
        socket.off('ticket_event', handleLiveEvent);
        socket.off('ticket:created', handleLiveEvent);
        socket.off('notification', handleLiveEvent);
      }
      clearInterval(interval);
    };
  }, [search, priorityFilter, statusFilter, categoryFilter]);

  const openCount = tickets.filter(t => !['RESOLVED', 'CLOSED'].includes(t.status)).length;
  const criticalCount = tickets.filter(t => t.priority === 'Critical' && !['RESOLVED', 'CLOSED'].includes(t.status)).length;
  const atRiskCount = tickets.filter(t => ['AT_RISK', 'BREACHED'].includes(t.slaStatus) && !['RESOLVED', 'CLOSED'].includes(t.status)).length;
  const resolvedTodayCount = tickets.filter(t => t.status === 'RESOLVED').length;

  return (
    <div className="space-y-5 font-sans">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-3 border-b border-industrial-shadow/40">
        <div>
          <h1 className="text-xl font-bold text-industrial-dark tracking-tight font-mono uppercase flex items-center gap-2">
            <Cpu className="w-5 h-5 text-industrial-orange" />
            SUPPORT<span className="text-industrial-orange">IQ</span> AGENT WORKSPACE
          </h1>
          <p className="text-xs font-mono text-industrial-label mt-0.5">
            REAL-TIME TICKET QUEUE &bull; AUTOMATED ROUTING MATRIX &bull; SLA ENGINE
          </p>
        </div>

        <button
          onClick={() => fetchTickets(false)}
          className="industrial-btn-secondary px-3.5 py-2 text-xs font-mono flex items-center gap-2 shrink-0"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-industrial-orange ${refreshing ? 'animate-spin' : ''}`} />
          <span>REFRESH QUEUE</span>
        </button>
      </div>

      {/* KPI Gauges Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="industrial-card corner-screws p-4 border-l-4 border-l-industrial-orange">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold text-industrial-label uppercase tracking-wider">ACTIVE QUEUE</span>
            <div className="w-8 h-8 rounded-lg bg-industrial-recessed shadow-recessed flex items-center justify-center text-industrial-orange">
              <Inbox className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 font-mono">
            <span className="text-2xl font-extrabold text-industrial-dark">{openCount}</span>
            <span className="text-xs text-industrial-label ml-2">UNRESOLVED</span>
          </div>
        </div>

        <div className="industrial-card corner-screws p-4 border-l-4 border-l-red-500">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold text-industrial-label uppercase tracking-wider">CRITICAL P1</span>
            <div className="w-8 h-8 rounded-lg bg-industrial-recessed shadow-recessed flex items-center justify-center text-red-600">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 font-mono">
            <span className="text-2xl font-extrabold text-red-600">{criticalCount}</span>
            <span className="text-xs text-industrial-label ml-2">HIGH PRIORITY</span>
          </div>
        </div>

        <div className="industrial-card corner-screws p-4 border-l-4 border-l-amber-500">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold text-industrial-label uppercase tracking-wider">SLA AT RISK</span>
            <div className="w-8 h-8 rounded-lg bg-industrial-recessed shadow-recessed flex items-center justify-center text-amber-600">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 font-mono">
            <span className="text-2xl font-extrabold text-amber-700">{atRiskCount}</span>
            <span className="text-xs text-industrial-label ml-2 font-sans">near breach</span>
          </div>
        </div>

        <div className="industrial-card corner-screws p-4 border-l-4 border-l-emerald-500">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold text-industrial-label uppercase tracking-wider">RESOLVED</span>
            <div className="w-8 h-8 rounded-lg bg-industrial-recessed shadow-recessed flex items-center justify-center text-emerald-600">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 font-mono">
            <span className="text-2xl font-extrabold text-emerald-700">{resolvedTodayCount}</span>
            <span className="text-xs text-industrial-label ml-2">FULFILLED</span>
          </div>
        </div>
      </div>

      {/* Recessed Search & Filter Bar */}
      <div className="industrial-card corner-screws p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-industrial-label" />
          <input
            type="text"
            placeholder="Search ticket ID, subject, customer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full industrial-well pl-10 pr-4 py-2 text-xs text-industrial-dark placeholder-industrial-label focus:outline-none font-mono"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto pb-1 md:pb-0 font-mono text-xs">
          <div className="flex items-center gap-1.5 text-industrial-label font-bold shrink-0">
            <Filter className="w-3.5 h-3.5" />
            <span>FILTERS:</span>
          </div>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="industrial-well px-3 py-2 text-xs font-mono font-bold text-industrial-dark focus:outline-none"
          >
            <option value="">ALL PRIORITIES</option>
            <option value="Critical">CRITICAL</option>
            <option value="High">HIGH</option>
            <option value="Medium">MEDIUM</option>
            <option value="Low">LOW</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="industrial-well px-3 py-2 text-xs font-mono font-bold text-industrial-dark focus:outline-none"
          >
            <option value="">ALL STATUSES</option>
            <option value="NEW">NEW</option>
            <option value="ASSIGNED">ASSIGNED</option>
            <option value="IN_PROGRESS">IN PROGRESS</option>
            <option value="RESOLVED">RESOLVED</option>
            <option value="CLOSED">CLOSED</option>
          </select>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="industrial-well px-3 py-2 text-xs font-mono font-bold text-industrial-dark focus:outline-none"
          >
            <option value="">ALL CATEGORIES</option>
            <option value="Payment">PAYMENT</option>
            <option value="Technical">TECHNICAL</option>
            <option value="Delivery">DELIVERY</option>
            <option value="Account">ACCOUNT</option>
            <option value="Security">SECURITY</option>
          </select>
        </div>
      </div>

      {/* Ticket Table with Fixed Header & Internal Scroll Viewport */}
      <div className="industrial-card corner-screws overflow-hidden">
        {initialLoading ? (
          <div className="py-16 text-center text-xs font-mono text-industrial-label flex items-center justify-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin text-industrial-orange" />
            <span>LOADING TICKET QUEUE MATRIX...</span>
          </div>
        ) : tickets.length === 0 ? (
          <div className="py-16 text-center text-industrial-label font-mono">
            <p className="text-sm font-bold text-industrial-dark mb-1">NO MATCHING TICKETS FOUND</p>
            <p className="text-xs max-w-sm mx-auto font-sans">
              Customer support requests submitted through the Customer Support Request Portal will automatically populate here.
            </p>
          </div>
        ) : (
          <div className="max-h-[520px] overflow-y-auto">
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 z-10 bg-industrial-recessed shadow-xs">
                <tr className="border-b border-industrial-shadow/40 text-xs font-mono font-bold text-industrial-dark uppercase tracking-wider">
                  <th className="py-3.5 px-4">TICKET ID</th>
                  <th className="py-3.5 px-4">CUSTOMER & CHANNEL</th>
                  <th className="py-3.5 px-4">ISSUE SUBJECT</th>
                  <th className="py-3.5 px-4">CATEGORY</th>
                  <th className="py-3.5 px-4">PRIORITY</th>
                  <th className="py-3.5 px-4">STATUS</th>
                  <th className="py-3.5 px-4">SLA DEADLINE</th>
                  <th className="py-3.5 px-4 text-right">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-industrial-shadow/30 text-xs text-industrial-dark">
                {tickets.map((ticket) => (
                  <tr
                    key={ticket._id}
                    onClick={() => navigate(`/tickets/${ticket._id}`)}
                    className="hover:bg-industrial-panel transition-colors cursor-pointer group"
                  >
                    <td className="py-3 px-4 font-mono font-extrabold text-industrial-orange group-hover:underline">
                      {ticket.ticketId}
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-bold text-industrial-dark">{ticket.customer?.name}</div>
                      <div className="text-[11px] text-industrial-label font-mono flex items-center gap-1.5 mt-0.5">
                        <span>{ticket.customer?.email}</span>
                        <span className="px-1.5 py-0.2 rounded bg-industrial-recessed text-industrial-dark font-mono text-[10px] font-bold">
                          {ticket.channel}
                        </span>
                      </div>
                    </td>

                    <td className="py-3 px-4 max-w-xs">
                      <div className="font-bold text-industrial-dark truncate">
                        {ticket.subject}
                      </div>
                      <div className="text-[11px] text-industrial-label truncate mt-0.5 font-sans">
                        {ticket.description}
                      </div>
                    </td>

                    <td className="py-3 px-4 font-mono font-semibold text-industrial-dark">
                      {ticket.category || 'UNCLASSIFIED'}
                    </td>

                    <td className="py-3 px-4">
                      <PriorityBadge priority={ticket.priority} />
                    </td>

                    <td className="py-3 px-4">
                      <StatusBadge status={ticket.status} />
                    </td>

                    <td className="py-3 px-4">
                      <SLATimer slaDeadline={ticket.slaDeadline} priority={ticket.priority} status={ticket.status} />
                    </td>

                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/tickets/${ticket._id}`);
                        }}
                        className="industrial-btn-secondary px-3 py-1 text-xs font-mono inline-flex items-center gap-1 group-hover:text-industrial-orange"
                      >
                        <span>VIEW</span>
                        <ChevronRight className="w-3.5 h-3.5" />
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
