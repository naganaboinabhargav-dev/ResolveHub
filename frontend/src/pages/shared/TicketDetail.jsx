import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiSend, FiLock, FiClock, FiBox, FiTag, FiAlertTriangle, FiRotateCcw, FiClipboard, FiChevronDown } from 'react-icons/fi';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import StatusBadge from '../../components/common/StatusBadge';
import PriorityBadge from '../../components/common/PriorityBadge';
import Loader from '../../components/common/Loader';
import TicketTimeline from '../../components/common/TicketTimeline';
import StarRating from '../../components/common/StarRating';

const STATUSES = ['Open', 'Assigned', 'In Progress', 'Pending', 'Resolved', 'Closed'];
const PRIORITIES = ['Low', 'Medium', 'High', 'Critical'];
const REOPEN_WINDOW_DAYS = 7;

const TicketDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState(null);
  const [agents, setAgents] = useState([]);
  const [replyText, setReplyText] = useState('');
  const [isInternal, setIsInternal] = useState(false);
  const [sending, setSending] = useState(false);
  const [showTimeline, setShowTimeline] = useState(false);
  const [savedResponses, setSavedResponses] = useState([]);
  const [showSaved, setShowSaved] = useState(false);
  const [ratingDraft, setRatingDraft] = useState(0);
  const [ratingComment, setRatingComment] = useState('');
  const endRef = useRef(null);

  const isStaff = user.role === 'admin' || user.role === 'agent';

  const load = async () => {
    const { data } = await api.get(`/tickets/${id}`);
    setTicket(data.ticket);
  };

  useEffect(() => { load(); }, [id]);
  useEffect(() => {
    if (user.role === 'admin') {
      api.get('/users', { params: { role: 'agent' } }).then(({ data }) => setAgents(data.users));
    }
    if (isStaff) {
      api.get('/saved-responses').then(({ data }) => setSavedResponses(data.responses));
    }
  }, [user.role]);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [ticket?.messages?.length]);

  const sendReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    setSending(true);
    try {
      await api.post(`/tickets/${id}/messages`, { text: replyText, isInternal });
      setReplyText('');
      setIsInternal(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send reply');
    } finally {
      setSending(false);
    }
  };

  const updateStatus = async (status) => {
    await api.put(`/tickets/${id}/status`, { status });
    toast.success(`Status updated to ${status}`);
    load();
  };

  const updatePriority = async (priority) => {
    await api.put(`/tickets/${id}/status`, { priority });
    toast.success(`Priority updated to ${priority}`);
    load();
  };

  const reassign = async (agentId) => {
    if (!agentId) return;
    try {
      await api.put(`/tickets/${id}/assign`, { agentId });
      toast.success('Ticket reassigned');
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reassign ticket');
    }
  };

  const reopenTicket = async () => {
    try {
      await api.put(`/tickets/${id}/reopen`);
      toast.success('Ticket reopened');
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reopen ticket');
    }
  };

  const submitRating = async () => {
    if (!ratingDraft) return;
    try {
      await api.post(`/tickets/${id}/rating`, { stars: ratingDraft, comment: ratingComment });
      toast.success('Thanks for the feedback!');
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit rating');
    }
  };

  const insertSavedResponse = (body) => {
    setReplyText((t) => (t ? `${t}\n\n${body}` : body));
    setShowSaved(false);
  };

  if (!ticket) return <Loader label="Loading ticket..." />;

  const backPath = `/${user.role}/tickets`;
  const canReopen = user.role === 'client' && ['Resolved', 'Closed'].includes(ticket.status) &&
    (Date.now() - new Date(ticket.resolvedAt || ticket.closedAt || ticket.updatedAt).getTime()) < REOPEN_WINDOW_DAYS * 24 * 60 * 60 * 1000;
  const canRate = user.role === 'client' && ['Resolved', 'Closed'].includes(ticket.status) && !ticket.rating?.stars;

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <button onClick={() => navigate(backPath)} className="flex items-center gap-1.5 text-sm font-medium text-muted hover:text-ink">
        <FiArrowLeft /> Back to tickets
      </button>

      <div className="card p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <p className="font-mono text-xs text-brand-600">{ticket.ticketNumber}</p>
              {ticket.isEscalated && (
                <span className="badge bg-rose-500/10 text-rose-500">
                  <FiAlertTriangle size={11} /> Escalated — SLA breached
                </span>
              )}
              {ticket.reopenCount > 0 && (
                <span className="badge bg-amber-400/10 text-amber-600">
                  <FiRotateCcw size={11} /> Reopened {ticket.reopenCount}x
                </span>
              )}
            </div>
            <h1 className="mt-1 font-display text-xl font-semibold text-ink">{ticket.subject}</h1>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted">
              <span className="flex items-center gap-1"><FiBox size={12} /> {ticket.resource?.name}</span>
              <span>·</span>
              <span className="flex items-center gap-1"><FiTag size={12} /> {ticket.category?.icon} {ticket.category?.name} / {ticket.subcategory}</span>
              <span>·</span>
              <span className="flex items-center gap-1"><FiClock size={12} /> {format(new Date(ticket.createdAt), 'MMM d, yyyy · h:mm a')}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <PriorityBadge priority={ticket.priority} />
            <StatusBadge status={ticket.status} />
          </div>
        </div>

        {isStaff && (
          <div className="mt-5 flex flex-wrap gap-4 border-t border-line pt-5">
            <div>
              <label className="label">Status</label>
              <select className="input w-44" value={ticket.status} onChange={(e) => updateStatus(e.target.value)}>
                {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Priority</label>
              <select className="input w-40" value={ticket.priority} onChange={(e) => updatePriority(e.target.value)}>
                {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            {user.role === 'admin' && (
              <div>
                <label className="label">Assigned agent</label>
                <select className="input w-48" value={ticket.assignedAgent?._id || ''} onChange={(e) => reassign(e.target.value)}>
                  <option value="">Unassigned</option>
                  {agents.map((a) => <option key={a._id} value={a._id}>{a.name}</option>)}
                </select>
              </div>
            )}
            {user.role === 'agent' && ticket.assignedAgent && (
              <div>
                <label className="label">Assigned to</label>
                <p className="input flex w-44 items-center bg-paper text-ink/70">{ticket.assignedAgent.name}</p>
              </div>
            )}
          </div>
        )}

        {canReopen && (
          <div className="mt-5 flex items-center justify-between rounded-xl border border-amber-400/30 bg-amber-400/10 p-4">
            <p className="text-sm text-ink/80">Still seeing this issue? You can reopen this ticket within {REOPEN_WINDOW_DAYS} days of resolution.</p>
            <button onClick={reopenTicket} className="btn-outline shrink-0"><FiRotateCcw size={14} /> Reopen ticket</button>
          </div>
        )}

        {ticket.rating?.stars ? (
          <div className="mt-5 rounded-xl border border-line bg-paper/50 p-4">
            <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted">Client satisfaction rating</p>
            <div className="flex items-center gap-3">
              <StarRating value={ticket.rating.stars} size={18} />
              {ticket.rating.comment && <p className="text-sm text-ink/70">"{ticket.rating.comment}"</p>}
            </div>
          </div>
        ) : canRate ? (
          <div className="mt-5 rounded-xl border border-brand-300/40 bg-brand-50 p-4">
            <p className="mb-2 text-sm font-medium text-ink">How did we do on this ticket?</p>
            <StarRating value={ratingDraft} onRate={setRatingDraft} />
            <textarea
              className="input mt-3"
              rows={2}
              placeholder="Optional feedback..."
              value={ratingComment}
              onChange={(e) => setRatingComment(e.target.value)}
            />
            <button onClick={submitRating} disabled={!ratingDraft} className="btn-primary mt-3">Submit rating</button>
          </div>
        ) : null}
      </div>

      <div className="card p-6">
        <h2 className="mb-4 font-display text-sm font-semibold text-ink">Description</h2>
        <p className="whitespace-pre-line text-sm leading-relaxed text-ink/80">{ticket.description}</p>
        {ticket.dynamicData && Object.keys(ticket.dynamicData).length > 0 && (
          <div className="mt-4 grid grid-cols-2 gap-3 border-t border-line pt-4 sm:grid-cols-3">
            {Object.entries(ticket.dynamicData).map(([k, v]) => v && (
              <div key={k}>
                <p className="text-[11px] uppercase tracking-wide text-muted">{k}</p>
                <p className="text-sm text-ink">{String(v)}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="card p-6">
        <button onClick={() => setShowTimeline((s) => !s)} className="flex w-full items-center justify-between">
          <h2 className="font-display text-sm font-semibold text-ink">Timeline</h2>
          <FiChevronDown className={`text-muted transition-transform ${showTimeline ? 'rotate-180' : ''}`} />
        </button>
        {showTimeline && (
          <div className="mt-5 border-t border-line pt-5">
            <TicketTimeline history={ticket.history} />
          </div>
        )}
      </div>

      <div className="card flex flex-col p-6">
        <h2 className="mb-4 font-display text-sm font-semibold text-ink">Conversation</h2>
        <div className="max-h-96 space-y-4 overflow-y-auto pr-1">
          {ticket.messages.map((m) => {
            const mine = m.sender?._id === user._id || m.sender === user._id;
            return (
              <div key={m._id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${
                  m.isInternal ? 'border border-amber-400/40 bg-amber-400/10 text-ink' : mine ? 'bg-brand-500 text-white rounded-br-sm' : 'bg-paper text-ink rounded-bl-sm'
                }`}>
                  <div className="mb-1 flex items-center gap-1.5 text-[11px] opacity-70">
                    {m.isInternal && <FiLock size={10} />}
                    <span className="font-medium">{m.sender?.name || 'User'}</span>
                    <span>· {format(new Date(m.createdAt), 'MMM d, h:mm a')}</span>
                  </div>
                  <p className="whitespace-pre-line">{m.text}</p>
                </div>
              </div>
            );
          })}
          <div ref={endRef} />
        </div>

        <form onSubmit={sendReply} className="mt-5 border-t border-line pt-4">
          {isStaff && savedResponses.length > 0 && (
            <div className="relative mb-2 inline-block">
              <button type="button" onClick={() => setShowSaved((s) => !s)} className="btn-outline !py-1.5 !px-3 text-xs">
                <FiClipboard size={13} /> Insert saved response
              </button>
              {showSaved && (
                <div className="absolute left-0 z-20 mt-1 w-72 rounded-xl border border-line bg-white p-1.5 shadow-card">
                  {savedResponses.map((r) => (
                    <button
                      key={r._id}
                      type="button"
                      onClick={() => insertSavedResponse(r.body)}
                      className="block w-full rounded-lg px-3 py-2 text-left text-xs hover:bg-paper"
                    >
                      <p className="font-medium text-ink">{r.title}</p>
                      <p className="truncate text-muted">{r.body}</p>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
          <textarea
            rows={3}
            className="input"
            placeholder={isStaff ? 'Write a reply to the client...' : 'Write a reply...'}
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
          />
          <div className="mt-3 flex items-center justify-between">
            {isStaff ? (
              <label className="flex items-center gap-2 text-sm text-muted">
                <input type="checkbox" checked={isInternal} onChange={(e) => setIsInternal(e.target.checked)} />
                Internal note — only visible to Admin &amp; the assigned agent (client won't see this)
              </label>
            ) : <span />}
            <button type="submit" disabled={sending} className="btn-primary">
              <FiSend size={14} /> {sending ? 'Sending...' : 'Send'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TicketDetail;
