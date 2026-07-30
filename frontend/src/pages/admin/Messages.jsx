import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiSend, FiSearch, FiEdit2, FiTrash2, FiCheck, FiX } from 'react-icons/fi';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import MessageTicks from '../../components/common/MessageTicks';

const Messages = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [conversations, setConversations] = useState(null);
  const [search, setSearch] = useState('');
  const [thread, setThread] = useState(null);
  const [activeUser, setActiveUser] = useState(null);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');
  const endRef = useRef(null);

  const loadConversations = async () => {
    const { data } = await api.get('/messages/conversations');
    setConversations(data.conversations);
  };

  const loadThread = async () => {
    const { data } = await api.get(`/messages/user/${userId}`);
    setThread(data.messages);
    setActiveUser(data.user);
  };

  useEffect(() => { loadConversations(); }, []);

  useEffect(() => {
    if (!userId) { setThread(null); setActiveUser(null); return; }
    loadThread().then(loadConversations);
  }, [userId]);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [thread]);

  const send = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    setSending(true);
    try {
      await api.post(`/messages/user/${userId}`, { text });
      setText('');
      loadThread();
      loadConversations();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const startEdit = (m) => { setEditingId(m._id); setEditText(m.text); };
  const cancelEdit = () => { setEditingId(null); setEditText(''); };

  const saveEdit = async (id) => {
    if (!editText.trim()) return;
    try {
      await api.put(`/messages/${id}`, { text: editText });
      setEditingId(null);
      loadThread();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to edit message');
    }
  };

  const removeMessage = async (id) => {
    try {
      await api.delete(`/messages/${id}`);
      loadThread();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete message');
    }
  };

  const filtered = (conversations || []).filter((c) =>
    c.user.name.toLowerCase().includes(search.toLowerCase()) || c.user.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="h-[calc(100vh-8rem)]">
      <div className="mb-4">
        <h1 className="font-display text-2xl font-semibold text-ink">Messages</h1>
        <p className="text-sm text-muted">Direct message any agent or client.</p>
      </div>

      <div className="flex h-[calc(100%-3.5rem)] overflow-hidden rounded-2xl border border-line bg-white shadow-soft">
        {/* Conversation list */}
        <div className="flex w-full max-w-xs shrink-0 flex-col border-r border-line">
          <div className="border-b border-line p-3">
            <div className="relative">
              <FiSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={15} />
              <input className="input pl-9 !py-2" placeholder="Search people..." value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {!conversations ? (
              <Loader />
            ) : filtered.length === 0 ? (
              <p className="p-4 text-center text-sm text-muted">No matches</p>
            ) : (
              filtered.map((c) => (
                <button
                  key={c.user._id}
                  onClick={() => navigate(`/admin/messages/${c.user._id}`)}
                  className={`flex w-full items-start gap-2.5 border-b border-line/60 px-4 py-3 text-left transition hover:bg-paper/60 ${userId === c.user._id ? 'bg-brand-50' : ''}`}
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-500 text-xs font-bold text-white">
                    {c.user.name.charAt(0)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-sm font-medium text-ink">{c.user.name}</p>
                      <span className="badge bg-paper text-[10px] capitalize text-muted">{c.user.role}</span>
                    </div>
                    <p className="truncate text-xs text-muted">{c.lastMessage ? c.lastMessage.text : 'No messages yet'}</p>
                  </div>
                  {c.unreadCount > 0 && (
                    <span className="mt-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white">
                      {c.unreadCount}
                    </span>
                  )}
                </button>
              ))
            )}
          </div>
        </div>

        {/* Thread */}
        <div className="flex flex-1 flex-col">
          {!activeUser ? (
            <div className="flex flex-1 items-center justify-center">
              <EmptyState icon="💬" title="Select a conversation" subtitle="Pick an agent or client from the list to start messaging." />
            </div>
          ) : (
            <>
              <div className="flex items-center gap-3 border-b border-line px-5 py-3.5">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-500 text-xs font-bold text-white">
                  {activeUser.name.charAt(0)}
                </span>
                <div>
                  <p className="text-sm font-semibold text-ink">{activeUser.name}</p>
                  <p className="text-xs capitalize text-muted">{activeUser.role} · {activeUser.email}</p>
                </div>
              </div>

              <div className="flex-1 space-y-3 overflow-y-auto p-5">
                {thread?.length === 0 ? (
                  <p className="py-8 text-center text-sm text-muted">No messages yet. Say hello!</p>
                ) : (
                  thread?.map((m) => {
                    const mine = m.senderRole === 'admin';
                    const isEditing = editingId === m._id;
                    return (
                      <div key={m._id} className={`group flex items-end gap-1.5 ${mine ? 'justify-end' : 'justify-start'}`}>
                        {mine && !isEditing && (
                          <div className="mb-1 flex gap-1 opacity-0 transition group-hover:opacity-100">
                            <button onClick={() => startEdit(m)} className="rounded p-1 text-muted hover:bg-black/5 hover:text-ink"><FiEdit2 size={12} /></button>
                            <button onClick={() => removeMessage(m._id)} className="rounded p-1 text-muted hover:bg-rose-50 hover:text-rose-500"><FiTrash2 size={12} /></button>
                          </div>
                        )}
                        <div className={`max-w-[70%] rounded-2xl px-4 py-2.5 text-sm ${mine ? 'bg-brand-500 text-white rounded-br-sm' : 'bg-paper text-ink rounded-bl-sm'}`}>
                          {isEditing ? (
                            <div className="flex items-center gap-2">
                              <input
                                autoFocus
                                className="rounded-lg bg-white/20 px-2 py-1 text-sm text-white placeholder:text-white/60 focus:outline-none"
                                value={editText}
                                onChange={(e) => setEditText(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && saveEdit(m._id)}
                              />
                              <button onClick={() => saveEdit(m._id)} className="rounded p-1 hover:bg-white/20"><FiCheck size={14} /></button>
                              <button onClick={cancelEdit} className="rounded p-1 hover:bg-white/20"><FiX size={14} /></button>
                            </div>
                          ) : (
                            <>
                              <p className="whitespace-pre-line">{m.text}</p>
                              <div className="mt-1 flex items-center justify-end gap-1 text-[10px] opacity-70">
                                {m.isEdited && <span>edited ·</span>}
                                <span>{format(new Date(m.createdAt), 'MMM d, h:mm a')}</span>
                                {mine && <MessageTicks isRead={m.isRead} />}
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={endRef} />
              </div>

              <form onSubmit={send} className="flex items-center gap-2 border-t border-line p-3">
                <input className="input flex-1" placeholder={`Message ${activeUser.name}...`} value={text} onChange={(e) => setText(e.target.value)} />
                <button type="submit" disabled={sending} className="btn-primary !px-4">
                  <FiSend size={15} />
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Messages;
