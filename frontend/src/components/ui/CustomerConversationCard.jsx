import React, { useState } from 'react';
import { Terminal, Send, User, Bot, Shield, CheckCheck, Clock } from 'lucide-react';

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
    <div className="industrial-card corner-screws p-4 space-y-3">
      {/* Compact Header Bar */}
      <div className="flex items-center justify-between pb-2 border-b border-industrial-shadow/40">
        <div className="flex items-center space-x-2 pl-4">
          <div className="w-6 h-6 rounded bg-industrial-recessed shadow-recessed flex items-center justify-center text-industrial-orange">
            <Terminal className="w-3.5 h-3.5" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-industrial-dark uppercase tracking-wider font-mono">
              CUSTOMER CONVERSATION THREAD
            </h3>
          </div>
        </div>

        <div className="flex items-center space-x-3 pr-4 font-mono text-xs text-industrial-label">
          <span className="px-2 py-0.5 rounded bg-industrial-recessed text-industrial-dark font-bold">
            {messages.length} MESSAGES
          </span>
        </div>
      </div>

      {/* Recessed Compact Scrollable Message Viewport */}
      <div className="industrial-well p-3 space-y-3 max-h-72 overflow-y-auto">
        {messages.map((msg, idx) => {
          const isCustomer = msg.sender === 'CUSTOMER';
          const isAI = msg.sender === 'AI';

          return (
            <div
              key={msg.messageId || idx}
              className={`flex flex-col ${isCustomer ? 'items-start' : 'items-end'}`}
            >
              <div className="flex items-center space-x-1.5 mb-1">
                {isCustomer ? (
                  <>
                    <div className="w-4 h-4 rounded bg-blue-100 border border-blue-300 flex items-center justify-center">
                      <User className="w-2.5 h-2.5 text-blue-700" />
                    </div>
                    <span className="text-[11px] font-mono font-bold text-blue-900">
                      {msg.senderName || ticket?.customer?.name || 'CUSTOMER'}
                    </span>
                  </>
                ) : isAI ? (
                  <>
                    <span className="text-[11px] font-mono font-bold text-industrial-orange">SUPPORTIQ AI</span>
                    <div className="w-4 h-4 rounded bg-industrial-orange text-white flex items-center justify-center">
                      <Bot className="w-2.5 h-2.5" />
                    </div>
                  </>
                ) : (
                  <>
                    <span className="text-[11px] font-mono font-bold text-industrial-dark">
                      {msg.senderName || 'SUPPORT AGENT'}
                    </span>
                    <div className="w-4 h-4 rounded bg-industrial-recessed border border-industrial-shadow flex items-center justify-center">
                      <Shield className="w-2.5 h-2.5 text-industrial-dark" />
                    </div>
                  </>
                )}
                <span className="text-[10px] font-mono text-industrial-label flex items-center space-x-0.5">
                  <Clock className="w-2 h-2" />
                  <span>{new Date(msg.timestamp || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </span>
              </div>

              <div
                className={`max-w-lg rounded-lg p-2.5 text-xs leading-relaxed shadow-xs font-sans ${
                  isCustomer
                    ? 'bg-white text-industrial-dark border border-industrial-shadow rounded-tl-none'
                    : isAI
                    ? 'bg-industrial-chassis text-industrial-dark border border-industrial-orange/40 rounded-tr-none'
                    : 'bg-industrial-orange text-white font-medium rounded-tr-none'
                }`}
              >
                <p className="whitespace-pre-wrap">{msg.content}</p>
                
                <div className={`mt-1.5 pt-1 border-t flex items-center justify-between text-[9px] font-mono ${
                  isCustomer ? 'border-industrial-shadow/30 text-industrial-label' : isAI ? 'border-industrial-shadow/30 text-industrial-dark' : 'border-white/30 text-white/90'
                }`}>
                  <span className="uppercase tracking-wider font-bold">
                    {msg.eventType ? msg.eventType.replace(/_/g, ' ') : 'MESSAGE'}
                  </span>
                  <span className="flex items-center space-x-0.5 font-bold">
                    <CheckCheck className="w-2.5 h-2.5" />
                    <span>DISPATCHED</span>
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recessed Reply Input Box */}
      <form onSubmit={handleSubmit} className="flex items-center space-x-2 pt-1">
        <input
          type="text"
          value={replyText}
          onChange={(e) => setReplyText(e.target.value)}
          placeholder="Type outgoing reply to Customer Portal..."
          className="flex-1 industrial-well px-3 py-2 text-xs text-industrial-dark placeholder-industrial-label focus:outline-none font-sans"
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading || !replyText.trim()}
          className="industrial-btn-primary px-3 py-2 text-xs font-mono flex items-center shrink-0"
        >
          <Send className="w-3.5 h-3.5 mr-1" />
          SEND
        </button>
      </form>
    </div>
  );
}
