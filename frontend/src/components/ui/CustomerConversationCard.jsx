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
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden mb-6">
      <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <MessageSquare className="w-4 h-4 text-purple-600" />
          <h3 className="text-sm font-bold text-slate-900">
            Customer Portal Conversation Thread
          </h3>
          <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-purple-50 text-purple-700 border border-purple-200">
            {messages.length} Messages
          </span>
        </div>
        <div className="text-xs text-slate-500 flex items-center space-x-1">
          <Shield className="w-3.5 h-3.5 text-emerald-600" />
          <span>Channel: <strong className="text-slate-800 font-semibold">{ticket?.channel || 'customer_portal'}</strong></span>
        </div>
      </div>

      {/* Message Timeline */}
      <div className="p-5 space-y-4 max-h-96 overflow-y-auto bg-slate-50/50">
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
                    <div className="w-5 h-5 rounded-full bg-blue-100 border border-blue-200 flex items-center justify-center">
                      <User className="w-3 h-3 text-blue-600" />
                    </div>
                    <span className="text-xs font-semibold text-blue-900">
                      {msg.senderName || ticket?.customer?.name || 'Customer'}
                    </span>
                  </>
                ) : isAI ? (
                  <>
                    <span className="text-xs font-semibold text-purple-900">SupportIQ Assistant</span>
                    <div className="w-5 h-5 rounded-full bg-purple-100 border border-purple-200 flex items-center justify-center">
                      <Bot className="w-3 h-3 text-purple-600" />
                    </div>
                  </>
                ) : (
                  <>
                    <span className="text-xs font-semibold text-slate-900">
                      {msg.senderName || 'Support Agent'}
                    </span>
                    <div className="w-5 h-5 rounded-full bg-purple-100 border border-purple-200 flex items-center justify-center">
                      <Shield className="w-3 h-3 text-purple-600" />
                    </div>
                  </>
                )}
                <span className="text-[10px] text-slate-400 flex items-center space-x-1">
                  <Clock className="w-2.5 h-2.5" />
                  <span>{new Date(msg.timestamp || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </span>
              </div>

              <div
                className={`max-w-xl rounded-xl p-3.5 text-xs leading-relaxed shadow-sm ${
                  isCustomer
                    ? 'bg-white text-slate-900 border border-slate-200 rounded-tl-none'
                    : isAI
                    ? 'bg-purple-50 text-purple-950 border border-purple-200 rounded-tr-none'
                    : 'bg-purple-600 text-white font-medium rounded-tr-none'
                }`}
              >
                <p className="whitespace-pre-wrap">{msg.content}</p>
                
                <div className={`mt-2 pt-2 border-t flex items-center justify-between text-[10px] ${
                  isCustomer ? 'border-slate-100 text-slate-400' : isAI ? 'border-purple-200/60 text-purple-700' : 'border-purple-500/60 text-purple-100'
                }`}>
                  <span className="uppercase tracking-wider font-semibold">
                    {msg.eventType ? msg.eventType.replace(/_/g, ' ') : 'MESSAGE'}
                  </span>
                  <span className="flex items-center space-x-1 font-medium">
                    <CheckCheck className="w-3 h-3" />
                    <span>Dispatched</span>
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Reply Input Box */}
      <form onSubmit={handleSubmit} className="p-4 bg-white border-t border-slate-200 flex items-center space-x-3">
        <input
          type="text"
          value={replyText}
          onChange={(e) => setReplyText(e.target.value)}
          placeholder="Type an outgoing message to send back to the Customer Portal..."
          className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-purple-600 transition-colors"
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading || !replyText.trim()}
          className="inline-flex items-center px-4 py-2 rounded-lg text-xs font-semibold text-white bg-purple-600 hover:bg-purple-700 disabled:opacity-50 transition-colors shadow-sm"
        >
          <Send className="w-3.5 h-3.5 mr-1.5" />
          Send to Portal
        </button>
      </form>
    </div>
  );
}
