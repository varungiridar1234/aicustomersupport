import React, { useState, useEffect } from 'react';
import { Shield, Users, Layers, Clock, BookOpen, Plus, Trash2, CheckCircle2, RefreshCw, Sparkles } from 'lucide-react';
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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Shield className="w-5 h-5 text-purple-600" />
            Support<span className="text-purple-600">IQ</span> Operations Command
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure support teams, workload engine parameters, routing rules matrix, and SLA targets
          </p>
        </div>

        <button
          onClick={fetchData}
          className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-xs transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-purple-600 ${loading ? 'animate-spin' : ''}`} />
          Reload Admin Matrix
        </button>
      </div>

      {/* Tabs Toolbar */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3 overflow-x-auto">
        <button
          onClick={() => setActiveTab('teams')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
            activeTab === 'teams'
              ? 'bg-purple-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Department Teams ({teams.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('agents')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
            activeTab === 'agents'
              ? 'bg-purple-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Support Agents ({agents.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('routing')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
            activeTab === 'routing'
              ? 'bg-purple-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Deterministic Routing Rules ({routingRules.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('sla')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
            activeTab === 'sla'
              ? 'bg-purple-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>SLA Matrix ({slaRules.length})</span>
        </button>
      </div>

      {/* TAB 1: TEAMS MANAGEMENT */}
      {activeTab === 'teams' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 font-bold text-xs text-slate-900 uppercase tracking-wider">
              Active Department Support Teams
            </div>
            <div className="divide-y divide-slate-100">
              {teams.map((team) => (
                <div key={team._id} className="p-4 flex items-center justify-between hover:bg-purple-50/30 transition-colors">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm">{team.name}</span>
                      <span className="px-2 py-0.5 rounded bg-purple-50 text-purple-700 font-mono font-bold text-xs border border-purple-200">
                        {team.code}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">{team.description}</p>
                  </div>
                  <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                    Active
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-4 bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Create Support Team</h3>
            <form onSubmit={handleCreateTeam} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-600 block mb-1 font-semibold">Team Name</label>
                <input
                  type="text"
                  required
                  value={newTeamName}
                  onChange={(e) => setNewTeamName(e.target.value)}
                  placeholder="e.g. Account Security"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:border-purple-600 font-medium"
                />
              </div>

              <div>
                <label className="text-slate-600 block mb-1 font-semibold">Team Code</label>
                <input
                  type="text"
                  required
                  value={newTeamCode}
                  onChange={(e) => setNewTeamCode(e.target.value)}
                  placeholder="e.g. SECURITY"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 font-mono focus:outline-none focus:border-purple-600"
                />
              </div>

              <div>
                <label className="text-slate-600 block mb-1 font-semibold">Description</label>
                <textarea
                  rows={3}
                  value={newTeamDesc}
                  onChange={(e) => setNewTeamDesc(e.target.value)}
                  placeholder="Handles security inquiries and auth escalations"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:border-purple-600 font-medium"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg shadow-sm flex items-center justify-center gap-1.5 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Register Team</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* TAB 2: AGENTS MANAGEMENT */}
      {activeTab === 'agents' && (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 font-bold text-xs text-slate-900 uppercase tracking-wider">
            Agent Directory & Dynamic Workload Scores
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  <th className="py-3 px-4">Agent Name</th>
                  <th className="py-3 px-4">Email / ID</th>
                  <th className="py-3 px-4">Assigned Team</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Availability</th>
                  <th className="py-3 px-4 text-right">Workload Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {agents.map((agent) => (
                  <tr key={agent._id} className="hover:bg-purple-50/30 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-900 flex items-center gap-2.5">
                      <img
                        src={agent.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                        alt={agent.name}
                        className="w-7 h-7 rounded-full object-cover border border-purple-200"
                      />
                      <span>{agent.name}</span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-500">{agent.email}</td>
                    <td className="py-3.5 px-4 font-semibold text-slate-900">{agent.teamId?.name || 'Unassigned'}</td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded bg-purple-50 text-purple-700 font-semibold border border-purple-200 text-[10px]">
                        {agent.role}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold text-[11px]">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Available
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-purple-700">
                      Score: {agent.workloadScore || 0}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: ROUTING RULES */}
      {activeTab === 'routing' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 font-bold text-xs text-slate-900 uppercase tracking-wider">
              Active Deterministic Routing Matrix Rules
            </div>
            <div className="divide-y divide-slate-100 text-xs">
              {routingRules.map((rule) => (
                <div key={rule._id} className="p-4 flex items-center justify-between hover:bg-purple-50/30 transition-colors">
                  <div>
                    <span className="font-bold text-slate-900 text-sm block">{rule.name}</span>
                    <div className="flex items-center gap-2 text-slate-500 mt-1">
                      <span>Category: <strong className="text-purple-700">{rule.category}</strong></span>
                      <span>&rarr;</span>
                      <span>Target Team: <strong className="text-slate-900">{rule.teamId?.name}</strong></span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteRule(rule._id)}
                    className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-4 bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Add Routing Rule</h3>
            <form onSubmit={handleCreateRule} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-600 block mb-1 font-semibold">Category</label>
                <select
                  value={ruleCategory}
                  onChange={(e) => setRuleCategory(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 font-medium focus:outline-none focus:border-purple-600"
                >
                  <option value="Payment">Payment</option>
                  <option value="Technical">Technical</option>
                  <option value="Delivery">Delivery</option>
                  <option value="Account">Account</option>
                  <option value="Security">Security</option>
                </select>
              </div>

              <div>
                <label className="text-slate-600 block mb-1 font-semibold">Target Support Team</label>
                <select
                  value={ruleTeamId}
                  onChange={(e) => setRuleTeamId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 font-medium focus:outline-none focus:border-purple-600"
                >
                  <option value="">Select Team...</option>
                  {teams.map((t) => (
                    <option key={t._id} value={t._id}>{t.name} ({t.code})</option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg shadow-sm flex items-center justify-center gap-1.5 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Save Routing Rule</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* TAB 4: SLA MATRIX */}
      {activeTab === 'sla' && (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 font-bold text-xs text-slate-900 uppercase tracking-wider">
            SLA Resolution Deadlines Matrix
          </div>
          <div className="divide-y divide-slate-100 text-xs">
            {slaRules.map((sla) => (
              <div key={sla._id || sla.priority} className="p-4 flex items-center justify-between hover:bg-purple-50/30 transition-colors">
                <div>
                  <span className="font-bold text-slate-900 text-sm block">{sla.priority} Priority SLA</span>
                  <span className="text-slate-500 mt-0.5 block">{sla.description}</span>
                </div>
                <span className="font-mono font-bold text-purple-700 bg-purple-50 px-3 py-1 rounded-full border border-purple-200 text-xs">
                  {sla.targetMinutes} Minutes Target
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
