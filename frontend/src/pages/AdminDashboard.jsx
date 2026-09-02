import React, { useState, useEffect } from 'react';
import { Shield, Users, Layers, Clock, BookOpen, Plus, Trash2, CheckCircle2, RefreshCw } from 'lucide-react';
import api from '../services/api';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('teams');
  const [teams, setTeams] = useState([]);
  const [agents, setAgents] = useState([]);
  const [routingRules, setRoutingRules] = useState([]);
  const [slaRules, setSlaRules] = useState([]);
  const [loading, setLoading] = useState(true);

  // New Team Form State
  const [newTeamName, setNewTeamName] = useState('');
  const [newTeamCode, setNewTeamCode] = useState('');
  const [newTeamDesc, setNewTeamDesc] = useState('');

  // New Rule Form State
  const [ruleCategory, setRuleCategory] = useState('Payment');
  const [ruleTeamId, setRuleTeamId] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      const [teamsRes, agentsRes, rulesRes, slaRes] = await Promise.all([
        api.get('/admin/teams'),
        api.get('/admin/agents'),
        api.get('/admin/routing-rules'),
        api.get('/admin/sla-rules'),
      ]);

      if (teamsRes.data.success) setTeams(teamsRes.data.teams);
      if (agentsRes.data.success) setAgents(agentsRes.data.agents);
      if (rulesRes.data.success) setRoutingRules(rulesRes.data.rules);
      if (slaRes.data.success) setSlaRules(slaRes.data.rules);
    } catch (err) {
      console.error('Error fetching admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateTeam = async (e) => {
    e.preventDefault();
    try {
      await api.post('/admin/teams', {
        name: newTeamName,
        code: newTeamCode.toUpperCase(),
        description: newTeamDesc,
      });
      setNewTeamName('');
      setNewTeamCode('');
      setNewTeamDesc('');
      await fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Error creating team');
    }
  };

  const handleCreateRule = async (e) => {
    e.preventDefault();
    if (!ruleTeamId) return alert('Select target team');
    try {
      await api.post('/admin/routing-rules', {
        name: `${ruleCategory} -> Team`,
        category: ruleCategory,
        teamId: ruleTeamId,
      });
      await fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Error creating rule');
    }
  };

  const handleDeleteRule = async (id) => {
    try {
      await api.delete(`/admin/routing-rules/${id}`);
      await fetchData();
    } catch (err) {
      alert('Error deleting rule');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Shield className="w-6 h-6 text-brand-500" />
            Admin System Control Center
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Configure support teams, workload engine parameters, routing rules matrix, and SLA targets
          </p>
        </div>

        <button
          onClick={fetchData}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs font-semibold text-slate-300 hover:text-white"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh Controls
        </button>
      </div>

      {/* Admin Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('teams')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
            activeTab === 'teams' ? 'bg-brand-600/20 text-white border border-brand-500/40' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Teams & Agents ({agents.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('routing')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
            activeTab === 'routing' ? 'bg-brand-600/20 text-white border border-brand-500/40' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Routing Rules Matrix ({routingRules.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('sla')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
            activeTab === 'sla' ? 'bg-brand-600/20 text-white border border-brand-500/40' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>SLA Target Duration Config</span>
        </button>
      </div>

      {/* Tab 1: Teams & Agent Workload Engine Monitor */}
      {activeTab === 'teams' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Create Team Form */}
          <div className="glass-panel p-5">
            <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
              <Plus className="w-4 h-4 text-brand-400" />
              Create Support Team
            </h3>

            <form onSubmit={handleCreateTeam} className="space-y-3">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Team Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. VIP Billing"
                  value={newTeamName}
                  onChange={(e) => setNewTeamName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Team Code</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. VIP_BILL"
                  value={newTeamCode}
                  onChange={(e) => setNewTeamCode(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white font-mono"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="Responsibilities..."
                  value={newTeamDesc}
                  onChange={(e) => setNewTeamDesc(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-white"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs rounded-lg shadow"
              >
                Save Team
              </button>
            </form>
          </div>

          {/* Agents & Workload Score Table */}
          <div className="lg:col-span-2 glass-panel p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
              <div>
                <h3 className="text-sm font-bold text-white">
                  Live Agent Workload Score Monitor (Deterministic Workload Engine)
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Workload Score = &Sigma; (Active Ticket Priority Weights)
                </p>
              </div>

              {/* Priority Weight Formula Legend */}
              <div className="flex items-center gap-1.5 text-[10px] font-mono bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
                <span className="text-slate-400 font-sans font-semibold">Weights:</span>
                <span className="text-slate-300">Low=1</span>
                <span className="text-slate-500">•</span>
                <span className="text-blue-400">Med=2</span>
                <span className="text-slate-500">•</span>
                <span className="text-amber-400">High=4</span>
                <span className="text-slate-500">•</span>
                <span className="text-rose-400 font-bold">Crit=8</span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 uppercase font-semibold">
                    <th className="py-2.5 px-3">Agent</th>
                    <th className="py-2.5 px-3">Team</th>
                    <th className="py-2.5 px-3">Active Tickets</th>
                    <th className="py-2.5 px-3">Workload Score</th>
                    <th className="py-2.5 px-3">Availability</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {agents.map((agent) => (
                    <tr key={agent._id} className="hover:bg-slate-950/60">
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2">
                          <img src={agent.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'} className="w-6 h-6 rounded-full object-cover" />
                          <div>
                            <div className="font-bold text-white">{agent.name}</div>
                            <div className="text-[10px] text-slate-400">{agent.email}</div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-3 text-slate-300 font-semibold">
                        {agent.teamId?.name || 'Unassigned'}
                      </td>

                      <td className="py-3 px-3 font-mono font-bold text-slate-200">
                        {agent.activeTicketCount || 0} active
                      </td>

                      <td className="py-3 px-3 font-mono">
                        <div className="flex items-center gap-2">
                          <span className={`px-2.5 py-1 rounded font-bold ${
                            (agent.workloadScore || 0) >= 8 
                              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' 
                              : (agent.workloadScore || 0) >= 4 
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' 
                              : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          }`}>
                            Score: {agent.workloadScore || 0}
                          </span>
                        </div>
                      </td>

                      <td className="py-3 px-3">
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                          Available
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Routing Rules Matrix */}
      {activeTab === 'routing' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="glass-panel p-5">
            <h3 className="text-sm font-bold text-white mb-4">Add Routing Rule</h3>
            <form onSubmit={handleCreateRule} className="space-y-3">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Issue Category</label>
                <select
                  value={ruleCategory}
                  onChange={(e) => setRuleCategory(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white"
                >
                  <option value="Payment">Payment</option>
                  <option value="Technical">Technical</option>
                  <option value="Delivery">Delivery</option>
                  <option value="Account">Account</option>
                  <option value="Security">Security</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Target Support Team</label>
                <select
                  value={ruleTeamId}
                  onChange={(e) => setRuleTeamId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white"
                >
                  <option value="">Select Team...</option>
                  {teams.map(t => (
                    <option key={t._id} value={t._id}>{t.name} ({t.code})</option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs rounded-lg shadow"
              >
                Add Rule
              </button>
            </form>
          </div>

          <div className="lg:col-span-2 glass-panel p-5">
            <h3 className="text-sm font-bold text-white mb-4">Configured Routing Rules</h3>
            <div className="space-y-2.5">
              {routingRules.map((rule) => (
                <div key={rule._id} className="flex items-center justify-between p-3 bg-slate-950 rounded-lg border border-slate-800 text-xs">
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-brand-400">{rule.category}</span>
                    <span className="text-slate-500">➔</span>
                    <span className="font-semibold text-white">{rule.teamId?.name}</span>
                  </div>
                  <button
                    onClick={() => handleDeleteRule(rule._id)}
                    className="p-1.5 rounded text-rose-400 hover:bg-rose-950/50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: SLA Configuration */}
      {activeTab === 'sla' && (
        <div className="glass-panel p-5 max-w-2xl">
          <h3 className="text-sm font-bold text-white mb-4">Service Level Agreement (SLA) Targets</h3>
          <div className="space-y-4">
            {slaRules.map((rule) => (
              <div key={rule._id} className="flex items-center justify-between p-4 bg-slate-950 rounded-xl border border-slate-800">
                <div>
                  <div className="font-bold text-white text-sm mb-1">{rule.priority} Priority SLA</div>
                  <div className="text-xs text-slate-400">{rule.description}</div>
                </div>
                <div className="text-right">
                  <span className="text-base font-extrabold text-brand-400 font-mono">
                    {rule.targetMinutes >= 60 ? `${rule.targetMinutes / 60}h` : `${rule.targetMinutes}m`}
                  </span>
                  <span className="text-xs text-slate-500 block">target limit</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
