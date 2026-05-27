import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User } from 'lucide-react';
import { sendAIChat as sendPublicChat } from '../../services/publicService';

export default function AIChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([{ role: 'bot', text: 'Hi! Ask me anything about HDM Vault.' }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const endRef = useRef(null);
  const visitorId = useRef('visitor_' + Date.now());
  const convId = useRef(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    const msg = input.trim();
    setMessages(prev => [...prev, { role: 'user', text: msg }]);
    setInput('');
    setLoading(true);

    try {
      const res = await sendPublicChat(msg, visitorId.current, convId.current);
      let reply = 'Sorry, I could not process that.';
      if (res.success && res.data) {
        let d = res.data;
        while (d) {
          if (d.reply) { reply = d.reply; if (d.conversation_id || d.conversationId) convId.current = d.conversation_id || d.conversationId; break; }
          d = d.data;
        }
      }
      setMessages(prev => [...prev, { role: 'bot', text: reply }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'bot', text: 'Sorry, something went wrong.' }]);
    } finally { setLoading(false); }
  };

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-4 right-4 z-50 bg-orange-500 hover:bg-orange-600 text-white p-3.5 rounded-full shadow-lg transition-all hover:scale-105"
        title="AI Assistant"
      >
        {open ? <X size={22} /> : <MessageCircle size={22} />}
      </button>

      {open && (
        <div className="fixed bottom-16 right-4 z-50 w-[350px] max-w-[calc(100vw-2rem)] bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 flex flex-col overflow-hidden" style={{ height: '450px' }}>
          <div className="px-4 py-3 bg-orange-500 text-white flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <MessageCircle size={16} />
              <h3 className="font-semibold text-sm">HDM AI Assistant</h3>
            </div>
            <button onClick={() => setOpen(false)} className="hover:bg-orange-600 rounded p-0.5"><X size={16} /></button>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {messages.map((msg, i) => (
              <div key={i} className={`flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-orange-500' : 'bg-gray-300 dark:bg-gray-600'}`}>
                  {msg.role === 'user' ? <User size={12} className="text-white" /> : <Bot size={12} className="text-white" />}
                </div>
                <div className={`px-3 py-2 rounded-xl text-xs leading-relaxed max-w-[80%] ${msg.role === 'user' ? 'bg-orange-500 text-white rounded-tr-sm' : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-tl-sm'}`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex gap-2">
                <div className="w-6 h-6 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center shrink-0"><Bot size={12} className="text-white" /></div>
                <div className="bg-gray-100 dark:bg-gray-700 px-3 py-2 rounded-xl rounded-tl-sm">
                  <div className="flex gap-1"><span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" /><span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{animationDelay:'0.15s'}} /><span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{animationDelay:'0.3s'}} /></div>
                </div>
              </div>
            )}
            <div ref={endRef} />
          </div>

          <div className="p-2 border-t border-gray-200 dark:border-gray-700 flex gap-1.5 shrink-0">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSend()}
              placeholder="Ask me anything..."
              className="flex-1 px-3 py-2 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
            <button onClick={handleSend} disabled={loading} className="p-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 shrink-0"><Send size={14} /></button>
          </div>
        </div>
      )}
    </>
  );
}