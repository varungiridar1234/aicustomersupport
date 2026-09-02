import React, { useState, useEffect } from 'react';
import { Shield, Users, Layers, Clock, Plus, Trash2, CheckCircle2, RefreshCw, Cpu } from 'lucide-react';
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
    <div className="space-y-6 font-sans">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-3 border-b border-industrial-shadow/40">
        <div>
          <h1 className="text-xl font-bold text-industrial-dark tracking-tight font-mono uppercase flex items-center gap-2">
            <Shield className="w-5 h-5 text-industrial-orange" />
            SUPPORT<span className="text-industrial-orange">IQ</span> OPERATIONS COMMAND
          </h1>
          <p className="text-xs font-mono text-industrial-label mt-0.5">
            SUPPORT TEAMS &bull; WORKLOAD MATRIX &bull; ROUTING RULES &bull; SLA TARGETS
          </p>
        </div>

        <button
          onClick={fetchData}
          className="industrial-btn-secondary px-3.5 py-2 text-xs font-mono flex items-center gap-2 shrink-0"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-industrial-orange ${loading ? 'animate-spin' : ''}`} />
          <span>RELOAD MATRIX</span>
        </button>
      </div>

      {/* Industrial Tab Switches */}
      <div className="flex items-center gap-2 pb-2 overflow-x-auto font-mono text-xs">
        <button
          onClick={() => setActiveTab('teams')}
          className={`px-4 py-2 flex items-center gap-2 rounded ${
            activeTab === 'teams'
              ? 'industrial-btn-primary'
              : 'industrial-btn-secondary'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>DEPARTMENT TEAMS ({teams.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('agents')}
          className={`px-4 py-2 flex items-center gap-2 rounded ${
            activeTab === 'agents'
              ? 'industrial-btn-primary'
              : 'industrial-btn-secondary'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>SUPPORT AGENTS ({agents.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('routing')}
          className={`px-4 py-2 flex items-center gap-2 rounded ${
            activeTab === 'routing'
              ? 'industrial-btn-primary'
              : 'industrial-btn-secondary'
          }`}
        >
          <Cpu className="w-3.5 h-3.5" />
          <span>ROUTING RULES ({routingRules.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('sla')}
          className={`px-4 py-2 flex items-center gap-2 rounded ${
            activeTab === 'sla'
              ? 'industrial-btn-primary'
              : 'industrial-btn-secondary'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>SLA MATRIX ({slaRules.length})</span>
        </button>
      </div>

      {/* TAB 1: TEAMS MANAGEMENT */}
      {activeTab === 'teams' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 industrial-card corner-screws overflow-hidden p-5 space-y-4">
            <div className="pb-3 border-b border-industrial-shadow/40 font-mono font-bold text-xs text-industrial-dark uppercase tracking-wider pl-4">
              ACTIVE SUPPORT TEAMS
            </div>
            <div className="space-y-3">
              {teams.map((team) => (
                <div key={team._id} className="industrial-well p-4 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2 font-mono">
                      <span className="font-bold text-industrial-dark text-sm">{team.name}</span>
                      <span className="px-2 py-0.5 rounded bg-industrial-orange text-white font-bold text-xs">
                        {team.code}
                      </span>
                    </div>
                    <p className="text-xs text-industrial-label mt-1 font-sans">{team.description}</p>
                  </div>
                  <span className="text-xs font-mono font-bold text-[#166534] bg-[#dcfce7] border border-[#bbf7d0] px-2.5 py-1 rounded">
                    ACTIVE
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-4 industrial-card corner-screws p-5 space-y-4">
            <h3 className="text-xs font-mono font-bold text-industrial-dark uppercase tracking-wider pl-4">
              CREATE SUPPORT TEAM
            </h3>
            <form onSubmit={handleCreateTeam} className="space-y-3 text-xs font-mono">
              <div>
                <label className="text-industrial-label block mb-1 font-bold">TEAM NAME</label>
                <input
                  type="text"
                  required
                  value={newTeamName}
                  onChange={(e) => setNewTeamName(e.target.value)}
                  placeholder="e.g. Account Security"
                  className="w-full industrial-well px-3 py-2 text-industrial-dark focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="text-industrial-label block mb-1 font-bold">TEAM CODE</label>
                <input
                  type="text"
                  required
                  value={newTeamCode}
                  onChange={(e) => setNewTeamCode(e.target.value)}
                  placeholder="e.g. SECURITY"
                  className="w-full industrial-well px-3 py-2 text-industrial-dark font-mono focus:outline-none"
                />
              </div>

              <div>
                <label className="text-industrial-label block mb-1 font-bold">DESCRIPTION</label>
                <textarea
                  rows={3}
                  value={newTeamDesc}
                  onChange={(e) => setNewTeamDesc(e.target.value)}
                  placeholder="Handles security inquiries and auth escalations"
                  className="w-full industrial-well px-3 py-2 text-industrial-dark focus:outline-none font-sans"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 industrial-btn-primary text-xs font-mono flex items-center justify-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>REGISTER TEAM</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* TAB 2: AGENTS DIRECTORY */}
      {activeTab === 'agents' && (
        <div className="industrial-card corner-screws overflow-hidden p-5 space-y-4">
          <div className="pb-3 border-b border-industrial-shadow/40 font-mono font-bold text-xs text-industrial-dark uppercase tracking-wider pl-4">
            AGENT DIRECTORY & WORKLOAD SCORES
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse font-mono">
              <thead>
                <tr className="border-b border-industrial-shadow/40 bg-industrial-recessed text-xs font-bold text-industrial-dark uppercase tracking-wider">
                  <th className="py-3 px-4">AGENT NAME</th>
                  <th className="py-3 px-4">EMAIL / ID</th>
                  <th className="py-3 px-4">ASSIGNED TEAM</th>
                  <th className="py-3 px-4">ROLE</th>
                  <th className="py-3 px-4">AVAILABILITY</th>
                  <th className="py-3 px-4 text-right">WORKLOAD SCORE</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-industrial-shadow/30 text-xs text-industrial-dark">
                {agents.map((agent) => (
                  <tr key={agent._id} className="hover:bg-industrial-panel transition-colors">
                    <td className="py-3.5 px-4 font-bold flex items-center gap-2.5">
                      <img
                        src={agent.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                        alt={agent.name}
                        className="w-7 h-7 rounded-full object-cover border border-industrial-shadow"
                      />
                      <span>{agent.name}</span>
                    </td>
                    <td className="py-3.5 px-4 text-industrial-label">{agent.email}</td>
                    <td className="py-3.5 px-4 font-bold">{agent.teamId?.name || 'UNASSIGNED'}</td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded bg-industrial-recessed text-industrial-dark font-bold text-[10px]">
                        {agent.role}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1 text-[#166534] font-bold text-[11px]">
                        <span className="w-2 h-2 rounded-full led-indicator-green" /> AVAILABLE
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right font-extrabold text-industrial-orange">
                      SCORE: {agent.workloadScore || 0}
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
          <div className="lg:col-span-8 industrial-card corner-screws p-5 space-y-4">
            <div className="pb-3 border-b border-industrial-shadow/40 font-mono font-bold text-xs text-industrial-dark uppercase tracking-wider pl-4">
              ROUTING MATRIX RULES
            </div>
            <div className="space-y-3 font-mono text-xs">
              {routingRules.map((rule) => (
                <div key={rule._id} className="industrial-well p-4 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-industrial-dark text-sm block">{rule.name}</span>
                    <div className="flex items-center gap-2 text-industrial-label mt-1">
                      <span>CATEGORY: <strong className="text-industrial-orange">{rule.category}</strong></span>
                      <span>&rarr;</span>
                      <span>TARGET: <strong className="text-industrial-dark">{rule.teamId?.name}</strong></span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteRule(rule._id)}
                    className="industrial-btn-secondary p-2 text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-4 industrial-card corner-screws p-5 space-y-4">
            <h3 className="text-xs font-mono font-bold text-industrial-dark uppercase tracking-wider pl-4">
              ADD ROUTING RULE
            </h3>
            <form onSubmit={handleCreateRule} className="space-y-3 text-xs font-mono">
              <div>
                <label className="text-industrial-label block mb-1 font-bold">CATEGORY</label>
                <select
                  value={ruleCategory}
                  onChange={(e) => setRuleCategory(e.target.value)}
                  className="w-full industrial-well px-3 py-2 text-industrial-dark font-bold focus:outline-none"
                >
                  <option value="Payment">Payment</option>
                  <option value="Technical">Technical</option>
                  <option value="Delivery">Delivery</option>
                  <option value="Account">Account</option>
                  <option value="Security">Security</option>
                </select>
              </div>

              <div>
                <label className="text-industrial-label block mb-1 font-bold">TARGET SUPPORT TEAM</label>
                <select
                  value={ruleTeamId}
                  onChange={(e) => setRuleTeamId(e.target.value)}
                  className="w-full industrial-well px-3 py-2 text-industrial-dark font-bold focus:outline-none"
                >
                  <option value="">Select Team...</option>
                  {teams.map((t) => (
                    <option key={t._id} value={t._id}>{t.name} ({t.code})</option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 industrial-btn-primary text-xs font-mono flex items-center justify-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>SAVE ROUTING RULE</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* TAB 4: SLA MATRIX */}
      {activeTab === 'sla' && (
        <div className="industrial-card corner-screws p-5 space-y-4">
          <div className="pb-3 border-b border-industrial-shadow/40 font-mono font-bold text-xs text-industrial-dark uppercase tracking-wider pl-4">
            SLA RESOLUTION MATRIX
          </div>
          <div className="space-y-3 font-mono text-xs">
            {slaRules.map((sla) => (
              <div key={sla._id || sla.priority} className="industrial-well p-4 flex items-center justify-between">
                <div>
                  <span className="font-bold text-industrial-dark text-sm block">{sla.priority} PRIORITY SLA</span>
                  <span className="text-industrial-label mt-0.5 block font-sans">{sla.description}</span>
                </div>
                <span className="font-mono font-bold text-white bg-industrial-orange px-3 py-1 rounded text-xs shadow-xs">
                  {sla.targetMinutes} MIN TARGET
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
