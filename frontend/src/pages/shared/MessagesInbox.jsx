import { useEffect, useRef, useState } from 'react';
import { FiSend, FiEdit2, FiTrash2, FiCheck, FiX } from 'react-icons/fi';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import Loader from '../../components/common/Loader';
import MessageTicks from '../../components/common/MessageTicks';

const MessagesInbox = () => {
  const [messages, setMessages] = useState(null);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');
  const endRef = useRef(null);

  const load = async () => {
    const { data } = await api.get('/messages/me');
    setMessages(data.messages);
  };

  useEffect(() => { load(); }, []);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const send = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    setSending(true);
    try {
      await api.post('/messages/me', { text });
      setText('');
      load();
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
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to edit message');
    }
  };

  const removeMessage = async (id) => {
    try {
      await api.delete(`/messages/${id}`);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete message');
    }
  };

  return (
    <div className="mx-auto h-[calc(100vh-8rem)] max-w-2xl">
      <div className="mb-4">
        <h1 className="font-display text-2xl font-semibold text-ink">Messages</h1>
        <p className="text-sm text-muted">Direct line to the ResolveHub admin team — separate from ticket conversations.</p>
      </div>

      <div className="flex h-[calc(100%-3.5rem)] flex-col overflow-hidden rounded-2xl border border-line bg-white shadow-soft">
        <div className="flex-1 space-y-3 overflow-y-auto p-5">
          {!messages ? (
            <Loader />
          ) : messages.length === 0 ? (
            <p className="py-12 text-center text-sm text-muted">No messages yet. Send the admin team a note if you need anything.</p>
          ) : (
            messages.map((m) => {
              const mine = m.senderRole !== 'admin';
              const isEditing = editingId === m._id;
              return (
                <div key={m._id} className={`group flex items-end gap-1.5 ${mine ? 'justify-end' : 'justify-start'}`}>
                  {mine && !isEditing && (
                    <div className="mb-1 flex gap-1 opacity-0 transition group-hover:opacity-100">
                      <button onClick={() => startEdit(m)} className="rounded p-1 text-muted hover:bg-black/5 hover:text-ink"><FiEdit2 size={12} /></button>
                      <button onClick={() => removeMessage(m._id)} className="rounded p-1 text-muted hover:bg-rose-50 hover:text-rose-500"><FiTrash2 size={12} /></button>
                    </div>
                  )}
                  <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm ${mine ? 'bg-brand-500 text-white rounded-br-sm' : 'bg-paper text-ink rounded-bl-sm'}`}>
                    <p className="mb-1 text-[11px] font-medium opacity-70">{m.senderRole === 'admin' ? 'Admin Team' : 'You'}</p>
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
          <input className="input flex-1" placeholder="Message the admin team..." value={text} onChange={(e) => setText(e.target.value)} />
          <button type="submit" disabled={sending} className="btn-primary !px-4">
            <FiSend size={15} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default MessagesInbox;
