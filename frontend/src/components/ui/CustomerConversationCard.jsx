import React, { useState } from 'react';
import { MessageSquare, Send, User, Bot, Shield, CheckCheck, Clock } from 'lucide-react';

export default function CustomerConversationCard({ ticket, onSendReply, loading }) {
  const [replyText, setReplyText] = useState('');

  const messages = ticket?.messages || [
    {
      sender: 'CUSTOMER',
      senderName: ticket?.customer?.name || 'Customer',
      content: ticket?.description || 'No initial message content',
      timestamp: ticket?.createdAt || new Date(),
      eventType: 'TICKET_CREATED',
    }
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    if (onSendReply) {
      onSendReply(replyText.trim());
      setReplyText('');
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg mb-6">
      <div className="px-6 py-4 bg-slate-800/60 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <MessageSquare className="w-5 h-5 text-indigo-400" />
          <h3 className="text-base font-semibold text-white">
            Customer Portal Conversation Thread
          </h3>
          <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            {messages.length} Messages
          </span>
        </div>
        <div className="text-xs text-slate-400 flex items-center space-x-1">
          <Shield className="w-3.5 h-3.5 text-emerald-400" />
          <span>Channel: <strong className="text-slate-200">{ticket?.channel || 'customer_portal'}</strong></span>
        </div>
      </div>

      {/* Message Timeline */}
      <div className="p-6 space-y-4 max-h-96 overflow-y-auto bg-slate-950/40">
        {messages.map((msg, idx) => {
          const isCustomer = msg.sender === 'CUSTOMER';
          const isAI = msg.sender === 'AI';

          return (
            <div
              key={msg.messageId || idx}
              className={`flex flex-col ${isCustomer ? 'items-start' : 'items-end'}`}
            >
              <div className="flex items-center space-x-2 mb-1">
                {isCustomer ? (
                  <>
                    <div className="w-5 h-5 rounded-full bg-blue-500/20 border border-blue-500/40 flex items-center justify-center">
                      <User className="w-3 h-3 text-blue-400" />
                    </div>
                    <span className="text-xs font-medium text-blue-300">
                      {msg.senderName || ticket?.customer?.name || 'Customer'}
                    </span>
                  </>
                ) : isAI ? (
                  <>
                    <span className="text-xs font-medium text-purple-300">ResolvAI Assistant</span>
                    <div className="w-5 h-5 rounded-full bg-purple-500/20 border border-purple-500/40 flex items-center justify-center">
                      <Bot className="w-3 h-3 text-purple-400" />
                    </div>
                  </>
                ) : (
                  <>
                    <span className="text-xs font-medium text-emerald-300">
                      {msg.senderName || 'Support Agent'}
                    </span>
                    <div className="w-5 h-5 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center">
                      <Shield className="w-3 h-3 text-emerald-400" />
                    </div>
                  </>
                )}
                <span className="text-[10px] text-slate-500 flex items-center space-x-1">
                  <Clock className="w-2.5 h-2.5" />
                  <span>{new Date(msg.timestamp || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </span>
              </div>

              <div
                className={`max-w-xl rounded-xl p-3.5 text-sm leading-relaxed shadow-sm ${
                  isCustomer
                    ? 'bg-slate-800 text-slate-100 border border-slate-700/80 rounded-tl-none'
                    : isAI
                    ? 'bg-purple-950/40 text-purple-100 border border-purple-800/60 rounded-tr-none'
                    : 'bg-indigo-950/40 text-indigo-100 border border-indigo-800/60 rounded-tr-none'
                }`}
              >
                <p className="whitespace-pre-wrap">{msg.content}</p>
                
                <div className="mt-2 pt-2 border-t border-slate-700/40 flex items-center justify-between text-[11px] text-slate-400">
                  <span className="uppercase tracking-wider text-[9px] font-semibold text-slate-400">
                    {msg.eventType ? msg.eventType.replace(/_/g, ' ') : 'MESSAGE'}
                  </span>
                  <span className="flex items-center space-x-1 text-emerald-400">
                    <CheckCheck className="w-3 h-3" />
                    <span>Dispatched to Portal</span>
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Reply Input Box */}
      <form onSubmit={handleSubmit} className="p-4 bg-slate-900 border-t border-slate-800 flex items-center space-x-3">
        <input
          type="text"
          value={replyText}
          onChange={(e) => setReplyText(e.target.value)}
          placeholder="Type an outgoing message to send back to the Customer Portal..."
          className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading || !replyText.trim()}
          className="inline-flex items-center px-4 py-2.5 rounded-lg text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
        >
          <Send className="w-4 h-4 mr-2" />
          Send to Portal
        </button>
      </form>
    </div>
  );
}
