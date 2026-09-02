import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Send, CheckCircle2, AlertCircle, Sparkles, Mail, MessageSquare, Bot, FileText, ArrowRight } from 'lucide-react';
import api from '../services/api';

const CHANNELS = [
  { id: 'Email', name: 'Email Support', icon: Mail, desc: 'Simulates incoming email ticket' },
  { id: 'WhatsApp', name: 'WhatsApp Business', icon: MessageSquare, desc: 'Simulates mobile WhatsApp message' },
  { id: 'Chatbot', name: 'Live Web Chatbot', icon: Bot, desc: 'Simulates website chatbot widget' },
  { id: 'Web Form', name: 'Support Portal Form', icon: FileText, desc: 'Simulates web portal submission' },
];

export default function TicketIngestion() {
  const navigate = useNavigate();
  const [channel, setChannel] = useState('Email');
  const [customerName, setCustomerName] = useState('Robert Vance');
  const [customerEmail, setCustomerEmail] = useState('robert.vance@acme.com');
  const [customerPhone, setCustomerPhone] = useState('+1 (555) 234-5678');
  const [subject, setSubject] = useState('I was charged twice for my order #8841');
  const [description, setDescription] = useState('I was reviewing my credit card statement today and noticed two identical charges of $149.00 on September 2nd for order #8841. Please refund the extra charge immediately.');
  
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const res = await api.post('/tickets', {
        customerName,
        customerEmail,
        customerPhone,
        channel,
        subject,
        description,
      });

      if (res.data.success) {
        setResult(res.data.ticket);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error submitting support request');
    } finally {
      setSubmitting(false);
    }
  };

  const loadSample = (type) => {
    if (type === 'payment') {
      setSubject('I was charged twice for my order #8841');
      setDescription('I was reviewing my credit card statement today and noticed two identical charges of $149.00 on September 2nd for order #8841. Please refund the extra charge immediately.');
    } else if (type === 'technical') {
      setSubject('Production API returning 500 Internal Server Error');
      setDescription('Our server integrations started failing 15 minutes ago with HTTP 500 status code on the /v1/checkout endpoint. Affecting all active users.');
    } else if (type === 'delivery') {
      setSubject('Package tracking status stuck in transit');
      setDescription('My delivery #DEL-4410 was expected yesterday but tracking status has been frozen at distribution hub with no updates.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          Customer Support Request Simulator
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Simulates an incoming support request across integrated channels (Email, WhatsApp, Chatbot, Web Form).
        </p>
      </div>

      {/* Quick Sample Presets */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-slate-400 font-semibold">Demo Presets:</span>
        <button
          type="button"
          onClick={() => loadSample('payment')}
          className="px-3 py-1 bg-slate-900 border border-brand-500/40 hover:border-brand-500 text-brand-300 text-xs font-semibold rounded-lg transition-colors"
        >
          Duplicate Payment (Primary Scenario)
        </button>
        <button
          type="button"
          onClick={() => loadSample('technical')}
          className="px-3 py-1 bg-slate-900 border border-indigo-500/40 hover:border-indigo-500 text-indigo-300 text-xs font-semibold rounded-lg transition-colors"
        >
          Server 500 Outage
        </button>
        <button
          type="button"
          onClick={() => loadSample('delivery')}
          className="px-3 py-1 bg-slate-900 border border-amber-500/40 hover:border-amber-500 text-amber-300 text-xs font-semibold rounded-lg transition-colors"
        >
          Late Delivery
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left 2 Cols: Form */}
        <div className="md:col-span-2 glass-panel p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Channel Selector */}
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-2">Select Originating Channel</label>
              <div className="grid grid-cols-2 gap-2">
                {CHANNELS.map((ch) => {
                  const Icon = ch.icon;
                  const isSelected = channel === ch.id;
                  return (
                    <button
                      key={ch.id}
                      type="button"
                      onClick={() => setChannel(ch.id)}
                      className={`p-3 rounded-lg border text-left flex items-start gap-2.5 transition-all ${
                        isSelected 
                          ? 'bg-brand-600/20 border-brand-500 text-white' 
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <Icon className={`w-4 h-4 shrink-0 mt-0.5 ${isSelected ? 'text-brand-400' : 'text-slate-400'}`} />
                      <div>
                        <div className="text-xs font-bold">{ch.name}</div>
                        <div className="text-[10px] text-slate-400 leading-tight">{ch.desc}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Customer Full Name</label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Customer Contact Email</label>
                <input
                  type="email"
                  required
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-500"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">Subject</label>
              <input
                type="text"
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-500 font-semibold"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">Issue Description</label>
              <textarea
                required
                rows={5}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs text-white focus:outline-none focus:border-brand-500 leading-relaxed"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs uppercase tracking-wider rounded-lg shadow-lg shadow-brand-600/20 flex items-center justify-center gap-2 transition-all hover:scale-[1.01] disabled:opacity-50"
            >
              <Send className={`w-4 h-4 ${submitting ? 'animate-bounce' : ''}`} />
              <span>{submitting ? 'Processing AI Pipeline...' : 'Submit Support Request'}</span>
            </button>
          </form>
        </div>

        {/* Right 1 Col: Pipeline Preview or Result */}
        <div className="glass-panel p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-brand-400" />
              Automated Pipeline Workflow
            </h3>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-brand-500/20 text-brand-400 flex items-center justify-center font-bold">1</div>
                <div>
                  <div className="font-bold text-white">Ticket Ingestion</div>
                  <div className="text-[11px] text-slate-400">Stores customer & channel</div>
                </div>
              </div>

              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold">2</div>
                <div>
                  <div className="font-bold text-white">Gemini AI Classification</div>
                  <div className="text-[11px] text-slate-400">Category, Priority, Rationale</div>
                </div>
              </div>

              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold">3</div>
                <div>
                  <div className="font-bold text-white">Routing & SLA Calculation</div>
                  <div className="text-[11px] text-slate-400">Matches team & computes deadline</div>
                </div>
              </div>

              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">4</div>
                <div>
                  <div className="font-bold text-white">Auto Workload Assignment</div>
                  <div className="text-[11px] text-slate-400">Assigns lowest workload agent</div>
                </div>
              </div>
            </div>
          </div>

          {result && (
            <div className="mt-6 p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/50 space-y-3 animate-fadeIn">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
                <CheckCircle2 className="w-4 h-4" />
                <span>Ticket Ingested & Processed!</span>
              </div>
              <div className="text-xs text-slate-300">
                Created ID: <span className="font-bold text-brand-400">{result.ticketId}</span>
              </div>
              <button
                onClick={() => navigate(`/tickets/${result._id}`)}
                className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg flex items-center justify-center gap-1.5 transition-colors"
              >
                <span>Open Agent Ticket Detail</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
