import { useEffect, useRef, useState } from 'react';
import { FiMessageCircle, FiX, FiSend } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';

const QUICK_ACTIONS_BY_ROLE = {
  client: [
    { label: 'Raise a ticket', action: 'navigate-ticket' },
    { label: 'Track a ticket', action: 'prompt-track' },
    { label: 'View my resources', action: 'navigate-resources' },
    { label: 'Check a warranty', action: 'prompt-warranty' },
  ],
  agent: [
    { label: 'My open tickets', action: 'ask', text: 'how many open tickets are assigned to me' },
    { label: 'My critical tickets', action: 'ask', text: 'how many critical tickets are assigned to me' },
    { label: 'Track a ticket', action: 'prompt-track' },
  ],
  admin: [
    { label: 'Unassigned tickets', action: 'ask', text: 'how many unassigned tickets are there' },
    { label: 'Critical tickets', action: 'ask', text: 'how many critical tickets are there' },
    { label: 'Team size', action: 'ask', text: 'how many agents do we have' },
    { label: 'Track a ticket', action: 'prompt-track' },
  ],
};

const GREETING_BY_ROLE = {
  client: (name) => `Hi ${name}! I'm the ResolveHub assistant. Ask me about ticket status, plans, or resource warranties — or say "raise a ticket" to get started.`,
  agent: (name) => `Hi ${name}! I can check your assigned ticket workload, look up any ticket by number, or answer general FAQs.`,
  admin: (name) => `Hi ${name}! Ask me for a quick pulse on the organization — unassigned tickets, critical tickets, team size — or look up any ticket by number.`,
};

const Chatbot = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { from: 'bot', text: (GREETING_BY_ROLE[user.role] || GREETING_BY_ROLE.client)(user.name.split(' ')[0]) },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const endRef = useRef(null);

  const quickActions = QUICK_ACTIONS_BY_ROLE[user.role] || QUICK_ACTIONS_BY_ROLE.client;

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, open]);

  const pushBot = (text) => setMessages((m) => [...m, { from: 'bot', text }]);
  const pushUser = (text) => setMessages((m) => [...m, { from: 'user', text }]);

  const askBackend = async (message) => {
    setLoading(true);
    try {
      const { data } = await api.post('/chatbot/ask', { message });
      pushBot(data.reply);
    } catch {
      pushBot('Sorry, something went wrong on my end. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAction = (qa) => {
    if (qa.action === 'ask') {
      pushUser(qa.label);
      askBackend(qa.text);
      return;
    }
    if (qa.action === 'navigate-ticket') {
      pushUser('Raise a ticket');
      pushBot('Taking you to the new ticket form...');
      setTimeout(() => navigate('/client/tickets'), 500);
    } else if (qa.action === 'navigate-resources') {
      pushUser('View my resources');
      pushBot('Here you go!');
      setTimeout(() => navigate('/client/resources'), 400);
    } else if (qa.action === 'prompt-track') {
      pushUser('Track a ticket');
      pushBot('Sure — what is the ticket number? (e.g. TKT-2026-0001)');
    } else if (qa.action === 'prompt-warranty') {
      pushUser('Check a warranty');
      pushBot('Which resource? Just type its name, e.g. "warranty on Cloud Analytics Suite".');
    }
  };

  const send = async (e) => {
    e.preventDefault();
    const text = input.trim();
    if (!text) return;
    pushUser(text);
    setInput('');
    await askBackend(text);
  };

  return (
    <>
      <button
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-brand-500 text-white shadow-glow transition hover:scale-105"
      >
        {open ? <FiX size={22} /> : <FiMessageCircle size={22} />}
      </button>

      {open && (
        <div className="fixed bottom-24 right-6 z-40 flex h-[28rem] w-80 flex-col overflow-hidden rounded-2xl border border-line bg-white shadow-card animate-fadeUp sm:w-96">
          <div className="flex items-center gap-2 bg-void px-4 py-3.5 text-white">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-500 text-sm">🎯</span>
            <div>
              <p className="text-sm font-semibold">ResolveHub Assistant</p>
              <p className="text-[11px] text-white/50 capitalize">{user.role} mode · Usually replies instantly</p>
            </div>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.from === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-sm ${
                    m.from === 'user' ? 'bg-brand-500 text-white rounded-br-sm' : 'bg-paper text-ink rounded-bl-sm'
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}
            {loading && <div className="text-xs text-muted">Assistant is typing...</div>}
            <div ref={endRef} />
          </div>

          <div className="flex flex-wrap gap-1.5 border-t border-line px-3 py-2">
            {quickActions.map((qa) => (
              <button
                key={qa.label}
                onClick={() => handleQuickAction(qa)}
                className="rounded-full border border-line px-2.5 py-1 text-[11px] font-medium text-ink/70 hover:border-brand-500 hover:text-brand-600"
              >
                {qa.label}
              </button>
            ))}
          </div>

          <form onSubmit={send} className="flex items-center gap-2 border-t border-line p-3">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your question..."
              className="input flex-1 py-2"
            />
            <button type="submit" className="btn-primary !px-3 !py-2">
              <FiSend size={15} />
            </button>
          </form>
        </div>
      )}
    </>
  );
};

export default Chatbot;
