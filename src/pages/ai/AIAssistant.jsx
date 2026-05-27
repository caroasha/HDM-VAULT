import { useState, useRef, useEffect } from 'react';
import { Sparkles, Send, User, Bot, Zap, Shield, AlertTriangle, Trash2, Copy, Check } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { sendAIChat, getAIStatus } from '../../services/aiService';
import { getLicenseUsage } from '../../services/licenseService';

const suggestions = [
  { icon: Shield, text: 'Show my security overview' },
  { icon: AlertTriangle, text: 'What are my active threats?' },
  { icon: Zap, text: 'How can I improve my security score?' },
  { icon: Shield, text: 'Check my weak passwords' },
];

export default function AIAssistant() {
  const [messages, setMessages] = useState([{ role: 'bot', text: 'Hello! I am your AI security assistant. Ask me anything about your security posture or HDM Vault features.' }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [aiEnabled, setAiEnabled] = useState(true);
  const [planTier, setPlanTier] = useState(null);
  const [copied, setCopied] = useState(null);
  const endRef = useRef(null);
  const convId = useRef(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  useEffect(() => {
    Promise.all([getAIStatus(), getLicenseUsage()]).then(([status, lic]) => {
      if (status.success) setAiEnabled(status.data?.enabled);
      if (lic.success) setPlanTier(lic.data?.planTier);
    }).catch(() => {});
  }, []);

  const extractReply = (data) => {
    if (!data) return null;
    if (data.reply) return { reply: data.reply, id: data.conversation_id || data.conversationId };
    if (data.data) return extractReply(data.data);
    return null;
  };

  const handleSend = async (text) => {
    const msg = text || input.trim();
    if (!msg || loading) return;
    setMessages(prev => [...prev, { role: 'user', text: msg }]);
    setInput('');
    setLoading(true);

    try {
      const res = await sendAIChat(msg, convId.current);
      const extracted = extractReply(res?.data);

      if (extracted?.reply) {
        setMessages(prev => [...prev, { role: 'bot', text: extracted.reply }]);
        if (extracted.id) convId.current = extracted.id;
      } else if (res?.message) {
        setMessages(prev => [...prev, { role: 'bot', text: `⚠️ ${res.message}` }]);
      } else {
        setMessages(prev => [...prev, { role: 'bot', text: '⚠️ Sorry, I could not process that.' }]);
      }
    } catch (err) {
      setMessages(prev => [...prev, { role: 'bot', text: '⚠️ AI service is currently unavailable.' }]);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setMessages([{ role: 'bot', text: 'Chat cleared. How can I help you?' }]);
    convId.current = null;
  };

  const handleCopy = (text, i) => {
    navigator.clipboard.writeText(text);
    setCopied(i);
    setTimeout(() => setCopied(null), 2000);
  };

  if (planTier && planTier !== 'pro') {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold flex items-center gap-2"><Sparkles className="text-orange-500" /> AI Assistant</h1>
        <Card><div className="text-center py-12 px-4">
          <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900/50 rounded-full flex items-center justify-center mx-auto mb-4"><Sparkles size={28} className="text-orange-500" /></div>
          <h2 className="text-lg font-bold mb-2">Pro+ Feature</h2>
          <p className="text-gray-500 mb-4">The AI Security Assistant is available on the <strong>Pro+ plan</strong>.</p>
          <Button onClick={() => window.location.href = '/dashboard/pricing'}>Upgrade to Pro+</Button>
        </div></Card>
      </div>
    );
  }

  if (!aiEnabled) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold flex items-center gap-2"><Sparkles className="text-orange-500" /> AI Assistant</h1>
        <Card><div className="text-center py-12"><p className="text-gray-500">AI service is not configured.</p></div></Card>
      </div>
    );
  }

  return (
    <div className="space-y-4 h-[calc(100vh-8rem)] flex flex-col">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2"><Sparkles className="text-orange-500" /> AI Assistant <Badge color="green">Pro+</Badge></h1>
        <Button variant="ghost" size="sm" onClick={handleClear}><Trash2 size={14} className="mr-1" /> Clear Chat</Button>
      </div>

      <Card className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((m, i) => (
          <div key={i} className={`flex gap-3 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${m.role === 'user' ? 'bg-orange-100 dark:bg-orange-900' : 'bg-gray-100 dark:bg-gray-700'}`}>
              {m.role === 'user' ? <User size={14} className="text-orange-500" /> : <Bot size={14} className="text-gray-500" />}
            </div>
            <div className={`group relative max-w-[75%] px-4 py-2.5 rounded-xl text-sm ${m.role === 'user' ? 'bg-orange-500 text-white rounded-tr-sm' : 'bg-gray-100 dark:bg-gray-800 rounded-tl-sm'}`}>
              <p className="whitespace-pre-wrap">{m.text}</p>
              {m.role === 'bot' && m.text.length > 20 && (
                <button onClick={() => handleCopy(m.text, i)} className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded">
                  {copied === i ? <Check size={12} className="text-green-500" /> : <Copy size={12} />}
                </button>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center shrink-0"><Bot size={14} className="text-gray-500" /></div>
            <div className="bg-gray-100 dark:bg-gray-800 px-4 py-2.5 rounded-xl rounded-tl-sm">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
        <div ref={endRef} />
      </Card>

      {messages.length <= 1 && (
        <div className="flex gap-2 flex-wrap">
          {suggestions.map((s, i) => (
            <button key={i} onClick={() => handleSend(s.text)} className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 dark:bg-gray-800 rounded-full text-xs text-gray-600 dark:text-gray-400 hover:bg-orange-50 dark:hover:bg-orange-950 hover:text-orange-500 transition-colors">
              <s.icon size={12} /> {s.text}
            </button>
          ))}
        </div>
      )}

      <div className="flex gap-2">
        <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSend()} placeholder="Ask about your security..." className="flex-1 px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" />
        <Button onClick={() => handleSend()} disabled={loading || !input.trim()}><Send size={16} /></Button>
      </div>
    </div>
  );
}