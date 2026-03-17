import React, { useState, useEffect, useRef, useContext, useCallback } from 'react';
import axios from 'axios';
import { AuthContext } from '../Users/AuthContext';

const API = 'http://localhost:8000/api';

const getInitials = (name = '') =>
  name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

const formatTime = (dateStr) => {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
};

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return "Aujourd'hui";
  if (d.toDateString() === yesterday.toDateString()) return 'Hier';
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
};

const AVATAR_COLORS = [
  'bg-indigo-500','bg-sky-500','bg-emerald-500','bg-amber-500',
  'bg-rose-500','bg-violet-500','bg-pink-500','bg-teal-500','bg-orange-500','bg-slate-500',
];
const avatarColorClass = (name = '') => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
};

const Avatar = ({ name = '', photo, size = 'md' }) => {
  const sz = { sm: 'w-7 h-7 text-xs', md: 'w-10 h-10 text-sm', lg: 'w-12 h-12 text-base' }[size] || 'w-10 h-10 text-sm';
  return (
    <div className={`relative flex-shrink-0 ${sz} rounded-full flex items-center justify-center font-bold text-white ${avatarColorClass(name)}`}>
      {photo ? <img src={photo} alt={name} className="w-full h-full object-cover rounded-full" /> : getInitials(name)}
    </div>
  );
};

const IconSearch = ({ className = '' }) => (
  <svg className={className} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
);
const IconSend = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <line x1="22" y1="2" x2="11" y2="13"/>
    <polygon points="22 2 15 22 11 13 2 9 22 2"/>
  </svg>
);
const Spinner = ({ className = 'border-white' }) => (
  <div className={`w-4 h-4 rounded-full border-2 border-t-transparent animate-spin flex-shrink-0 ${className}`} />
);

// ─── Menu contextuel modifier / supprimer ─────────────────────────────────────
const MessageMenu = ({ onEdit, onDelete, onClose }) => {
  const ref = useRef(null);
  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) onClose(); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [onClose]);

  return (
    <div ref={ref}
      className="absolute z-20 right-0 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden w-36"
      style={{ bottom: 'calc(100% + 6px)' }}
    >
      <button onClick={onEdit}
        className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-slate-700 hover:bg-indigo-50 transition-colors text-left">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
        </svg>
        Modifier
      </button>
      <div className="h-px bg-slate-100" />
      <button onClick={onDelete}
        className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors text-left">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/>
          <path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
        </svg>
        Supprimer
      </button>
    </div>
  );
};

// ─── Bulle de message avec actions ───────────────────────────────────────────
const MessageBubble = ({ msg, isMine, isLast, convId, onUpdated, onDeleted }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [editing,  setEditing]  = useState(false);
  const [editText, setEditText] = useState(msg.content || '');
  const [saving,   setSaving]   = useState(false);
  const editRef = useRef(null);

  useEffect(() => { if (editing) editRef.current?.focus(); }, [editing]);

  const handleEdit   = () => { setMenuOpen(false); setEditing(true); setEditText(msg.content || ''); };
  const handleDelete = async () => {
    setMenuOpen(false);
    if (!window.confirm('Supprimer ce message ?')) return;
    try {
      await axios.delete(`${API}/messages/${msg.id}`);
      onDeleted(msg.id);
    } catch(e) { console.error(e); }
  };
  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editText.trim() || editText === msg.content) { setEditing(false); return; }
    setSaving(true);
    try {
      const res = await axios.put(`${API}/messages/${msg.id}`, { content: editText });
      onUpdated(res.data);
      setEditing(false);
    } catch(e) { console.error(e); }
    finally { setSaving(false); }
  };

  // Message supprimé
  if (msg.is_deleted) {
    return (
      <div className={`flex items-end gap-2 mb-1 ${isMine ? 'flex-row-reverse' : ''}`}>
        {!isMine && <div className="w-7 h-7 flex-shrink-0" />}
        <p className={`px-4 py-2 rounded-2xl text-xs italic text-slate-400 border border-dashed border-slate-200 ${isMine ? 'rounded-br-md' : 'rounded-bl-md'}`}>
          🗑 Message supprimé
        </p>
      </div>
    );
  }

  return (
    <div className={`flex items-end gap-2 mb-1 ${isMine ? 'flex-row-reverse' : ''}`}>
      {!isMine && <Avatar name={msg.user?.name || ''} photo={msg.user?.photo} size="sm" />}

      <div className={`flex flex-col max-w-[68%] ${isMine ? 'items-end' : 'items-start'}`}>

        {/* Wrapper flex : bouton ··· + bulle dans le flux — évite tout problème d'overflow */}
        <div className="group flex items-center gap-1 flex-row-reverse">

          {/* Bouton ··· dans le flux, à gauche de la bulle */}
          {isMine && !editing && (
            <button
              onClick={() => setMenuOpen(p => !p)}
              className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-lg text-indigo-400 hover:text-indigo-600 hover:bg-indigo-100"
              title="Options"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                <circle cx="12" cy="5" r="1.8"/>
                <circle cx="12" cy="12" r="1.8"/>
                <circle cx="12" cy="19" r="1.8"/>
              </svg>
            </button>
          )}

          <div className="relative">
          {menuOpen && (
            <MessageMenu onEdit={handleEdit} onDelete={handleDelete} onClose={() => setMenuOpen(false)} />
          )}

          {/* Mode édition */}
          {editing ? (
            <form onSubmit={handleSaveEdit} className="flex items-center gap-2 min-w-[200px]">
              <input ref={editRef} value={editText} onChange={e => setEditText(e.target.value)}
                onKeyDown={e => { if (e.key === 'Escape') setEditing(false); }}
                className="flex-1 px-3 py-2 text-sm border-2 border-indigo-400 rounded-xl outline-none" />
              <button type="submit" disabled={saving}
                className="px-3 py-2 bg-indigo-600 text-white text-xs rounded-xl hover:bg-indigo-700 disabled:opacity-50">
                {saving ? '…' : 'OK'}
              </button>
              <button type="button" onClick={() => setEditing(false)}
                className="px-3 py-2 bg-slate-200 text-slate-600 text-xs rounded-xl hover:bg-slate-300">
                ✕
              </button>
            </form>
          ) : (
            <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed break-words ${
              isMine
                ? 'bg-indigo-600 text-white rounded-br-md'
                : 'dark:bg-slate-700 rounded-bl-md shadow-sm border border-slate-100 dark:border-slate-600 text-slate-800 dark:text-slate-100'
            }`}>
              {msg.content}
              <div className={`text-xs mt-1 flex items-center gap-1 justify-end ${isMine ? 'text-indigo-200' : 'text-slate-400'}`}>
                {msg.is_edited && <span className="italic">modifié ·</span>}
                {formatTime(msg.created_at)}
              </div>
            </div>
          )}
          </div>{/* fin .relative */}
        </div>{/* fin wrapper flex groupe */}

        {isMine && isLast && msg.seen && !editing && (
          <span className="text-xs text-indigo-400 mt-0.5 pr-1">✓✓ Lu</span>
        )}
      </div>
    </div>
  );
};

// ─── Composant principal ──────────────────────────────────────────────────────
export default function Chat() {
  const { user } = useContext(AuthContext);

  const [conversations, setConversations] = useState([]);
  const [activeConv,    setActiveConv]    = useState(null);
  const [messages,      setMessages]      = useState([]);
  const [users,         setUsers]         = useState([]);
  const [draft,         setDraft]         = useState('');
  const [search,        setSearch]        = useState('');
  const [newChatOpen,   setNewChatOpen]   = useState(false);
  const [newChatError,  setNewChatError]  = useState('');
  const [userSearch,    setUserSearch]    = useState('');
  const [sending,       setSending]       = useState(false);
  const [loadingMsgs,   setLoadingMsgs]   = useState(false);
  const [mobileSide,    setMobileSide]    = useState(true);
  const [totalUnread,   setTotalUnread]   = useState(0);

  const messagesEndRef = useRef(null);
  const inputRef       = useRef(null);
  const pollRef        = useRef(null);
  const restoredRef    = useRef(false);

  const loadConversations = useCallback(async () => {
    try {
      const res = await axios.get(`${API}/conversations`);
      setConversations(res.data);
      setTotalUnread(res.data.reduce((sum, c) => sum + (c.unread_count || 0), 0));
      return res.data;
    } catch (e) { console.error(e); return []; }
  }, []);

  const loadUsers = useCallback(async () => {
    try { const res = await axios.get(`${API}/users`); setUsers(res.data); } catch(e) {}
  }, []);

  useEffect(() => {
    const init = async () => {
      const [convList] = await Promise.all([loadConversations(), loadUsers()]);

      if (!restoredRef.current) {
        restoredRef.current = true;
        const savedId = localStorage.getItem('chat_active_conv_id');
        if (savedId) {
          const found = convList.find(c => String(c.id) === savedId);
          if (found) {
            setActiveConv(found);
            setMobileSide(false);
            try {
              const res = await axios.get(`${API}/conversations/${found.id}`);
              setMessages(res.data);
              axios.post(`${API}/conversations/${found.id}/read`).catch(() => {});
            } catch(e) {
              console.error('Impossible de charger les messages restaurés:', e);
            }
          }
        }
      }
    };
    init();
  }, []);

  useEffect(() => {
    if (!activeConv) return;
    const fetchMsgs = async () => {
      try { const res = await axios.get(`${API}/conversations/${activeConv.id}`); setMessages(res.data); }
      catch(e) {}
    };
    fetchMsgs();
    pollRef.current = setInterval(() => { fetchMsgs(); loadConversations(); }, 3000);
    return () => clearInterval(pollRef.current);
  }, [activeConv]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const openConversation = async (conv) => {
    setActiveConv(conv);
    setMobileSide(false);
    localStorage.setItem('chat_active_conv_id', String(conv.id));
    setLoadingMsgs(true);
    try {
      const res = await axios.get(`${API}/conversations/${conv.id}`);
      setMessages(res.data);
      await axios.post(`${API}/conversations/${conv.id}/read`);
      loadConversations();
    } catch(e) { console.error(e); }
    finally { setLoadingMsgs(false); }
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!draft.trim() || !activeConv || sending) return;
    const text = draft;
    setDraft('');
    setSending(true);
    try {
      const res = await axios.post(`${API}/conversations/${activeConv.id}/messages`, { content: text });
      setMessages(prev => [...prev, res.data]);
      loadConversations();
    } catch(e) { setDraft(text); }
    finally { setSending(false); }
  };

  const handleMsgUpdated = (updatedMsg) =>
    setMessages(prev => prev.map(m => m.id === updatedMsg.id ? { ...m, ...updatedMsg } : m));

  const handleMsgDeleted = (msgId) => {
    setMessages(prev => prev.map(m => m.id === msgId ? { ...m, is_deleted: true, content: null } : m));
    loadConversations();
  };

  const startConversation = async (targetUser) => {
    setNewChatError('');
    const myId = user?.id; const theirId = targetUser?.id;
    if (!myId)            { setNewChatError('Utilisateur connecté introuvable.'); return; }
    if (!theirId)         { setNewChatError('Cible invalide.'); return; }
    if (myId === theirId) { setNewChatError('Vous ne pouvez pas vous écrire à vous-même.'); return; }
    try {
      const res = await axios.post(`${API}/conversations`, { user_ids: [Number(myId), Number(theirId)] });
      setNewChatOpen(false); setUserSearch(''); setNewChatError('');
      await loadConversations();
      openConversation(res.data);
    } catch(e) {
      setNewChatError(e.response?.data?.message || e.message || 'Erreur');
    }
  };

  const otherUser = (conv) => conv.users?.find(u => u.id !== user?.id) || conv.users?.[0] || { name: 'Inconnu' };
  const filteredConvs = conversations.filter(c => otherUser(c).name?.toLowerCase().includes(search.toLowerCase()));
  const filteredUsers = users.filter(u => u.id !== user?.id && u.name?.toLowerCase().includes(userSearch.toLowerCase()));
  const groupedMessages = messages.reduce((groups, msg) => {
    const d = formatDate(msg.created_at);
    if (!groups[d]) groups[d] = [];
    groups[d].push(msg);
    return groups;
  }, {});
  const closeNewChat = () => { setNewChatOpen(false); setNewChatError(''); setUserSearch(''); };

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden">

      {/* ── Sidebar ── */}
      <div className={`flex flex-col w-80 flex-shrink-0 border-r border-slate-200
        md:relative md:translate-x-0 absolute z-10 h-full transition-transform duration-300
        ${mobileSide ? 'translate-x-0' : '-translate-x-full'} md:block`}>

        <div className="px-4 pt-4 pb-3 border-b border-slate-100">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold">Messages</h2>
              {totalUnread > 0 && (
                <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 bg-indigo-600 text-white text-xs font-bold rounded-full">
                  {totalUnread > 99 ? '99+' : totalUnread}
                </span>
              )}
            </div>
            <button onClick={() => setNewChatOpen(true)}
              className="w-8 h-8 flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-colors">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
            </button>
          </div>
          <div className="relative">
            <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2" />
            <input className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 placeholder-slate-400"
              placeholder="Rechercher…" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto py-1 scrollbar-thin scrollbar-thumb-slate-200">
          {filteredConvs.length === 0 ? (
            <div className="text-center px-4 py-10 text-slate-400">
              <div className="text-3xl mb-2">💬</div>
              <p className="text-sm font-medium">Aucune conversation</p>
              <p className="text-xs mt-1">Cliquez sur + pour commencer</p>
            </div>
          ) : filteredConvs.map(conv => {
            const other    = otherUser(conv);
            const unread   = conv.unread_count || 0;
            const isActive = activeConv?.id === conv.id;
            return (
              <div key={conv.id} onClick={() => openConversation(conv)}
                className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors border-l-4 ${
                  isActive ? 'bg-indigo-50 border-l-indigo-600' : 'border-l-transparent hover:bg-slate-50'
                }`}>
                <Avatar name={other.name} photo={other.photo} size="md" />
                <div className="flex-1 min-w-0">
                  <p className={`text-sm truncate ${unread > 0 ? 'font-bold' : 'font-semibold'}`}>
                    {other.name}
                  </p>
                  <p className={`text-xs truncate mt-0.5 ${unread > 0 ? 'text-slate-600 font-medium' : 'text-slate-400'}`}>
                    {conv.last_message
                      ? (conv.last_message.user_id === user?.id ? 'Vous : ' : '') + conv.last_message.content
                      : 'Démarrer la conversation'}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                  {conv.last_message && <span className="text-xs text-slate-400">{formatTime(conv.last_message.created_at)}</span>}
                  {unread > 0 && (
                    <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 bg-indigo-600 text-white text-xs font-bold rounded-full">
                      {unread > 9 ? '9+' : unread}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Panel messages ── */}
      <div className="flex flex-col flex-1 min-w-0">
        {!activeConv ? (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-slate-400">
            <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center text-3xl">💬</div>
            <p className="text-base font-bold text-slate-600">Vos messages</p>
            <p className="text-sm">Sélectionnez une conversation ou démarrez-en une nouvelle</p>
            <button onClick={() => setNewChatOpen(true)}
              className="mt-1 px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-sm font-semibold rounded-xl transition-colors">
              + Nouvelle conversation
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-3 px-5 py-3 border-b border-slate-200 shadow-sm">
              <button className="md:hidden p-1 hover:text-slate-800"
                onClick={() => { setMobileSide(true); localStorage.removeItem('chat_active_conv_id'); }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="15 18 9 12 15 6"/>
                </svg>
              </button>
              <Avatar name={otherUser(activeConv).name} photo={otherUser(activeConv).photo} size="md" />
              <div className="flex-1">
                <p className="text-sm font-bold">{otherUser(activeConv).name}</p>
                <p className="text-xs">
                  {loadingMsgs ? 'Chargement…' : `${messages.filter(m => !m.is_deleted).length} message${messages.filter(m => !m.is_deleted).length !== 1 ? 's' : ''}`}
                </p>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block italic">Passez sur un message pour le modifier ou supprimer</p>
            </div>

            <div
              className="flex-1 overflow-y-auto px-4 py-5 space-y-1 scrollbar-thin scrollbar-thumb-slate-200"
              style={{ overflowX: 'clip' }}
            >
              {loadingMsgs ? (
                <div className="flex justify-center items-center py-10">
                  <Spinner className="border-indigo-400" /><span className="ml-2 text-sm">Chargement…</span>
                </div>
              ) : messages.length === 0 ? (
                <div className="text-center py-10 text-slate-400">
                  <div className="text-4xl mb-2">👋</div>
                  <p className="font-semibold text-slate-600 text-sm">Démarrez la conversation !</p>
                </div>
              ) : (
                Object.entries(groupedMessages).map(([date, msgs]) => (
                  <React.Fragment key={date}>
                    <div className="flex items-center gap-2 my-3">
                      <div className="flex-1 h-px" />
                      <span className="text-xs font-semibold uppercase tracking-wide px-1">{date}</span>
                      <div className="flex-1 h-px" />
                    </div>
                    {msgs.map((msg, i) => {
                      const isMine = msg.user_id === user?.id || msg.user?.id === user?.id;
                      return (
                        <MessageBubble
                          key={msg.id}
                          msg={msg}
                          isMine={isMine}
                          isLast={i === msgs.length - 1}
                          convId={activeConv.id}
                          onUpdated={handleMsgUpdated}
                          onDeleted={handleMsgDeleted}
                        />
                      );
                    })}
                  </React.Fragment>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={sendMessage} className="flex items-center gap-3 px-4 py-3 border-t border-slate-200">
              <input ref={inputRef}
                className="flex-1 px-4 py-2.5 text-lg border border-slate-200 rounded-full outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 placeholder-slate-400 disabled:opacity-50"
                placeholder="Écrivez un message…" value={draft}
                onChange={e => setDraft(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) sendMessage(e); }}
                disabled={sending} />
              <button type="submit" disabled={!draft.trim() || sending}
                className="w-10 h-10 flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-full transition-all hover:scale-105 active:scale-95">
                {sending ? <Spinner /> : <IconSend />}
              </button>
            </form>
          </>
        )}
      </div>

      {/* ── Modal nouvelle conversation ── */}
      {newChatOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={e => e.target === e.currentTarget && closeNewChat()}>
          <div className="rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden animate-[slideUp_0.3s_ease]">
            <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-indigo-900 to-indigo-600">
              <span className="font-bold text-base">✉️ Nouvelle conversation</span>
              <button onClick={closeNewChat}
                className="w-7 h-7 flex items-center justify-center hover:bg-red-500/40 border border-white/20 rounded-lg text-white text-sm transition-colors">✕</button>
            </div>
            <div className="p-4">
              {newChatError && (
                <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2 mb-3">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                  </svg>
                  {newChatError}
                </div>
              )}
              <div className="relative mb-2">
                <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input autoFocus
                  className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 placeholder-slate-400"
                  placeholder="Rechercher un utilisateur…" value={userSearch} onChange={e => setUserSearch(e.target.value)} />
              </div>
              <div className="max-h-72 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200">
                {filteredUsers.length === 0 ? (
                  <div className="text-center py-6 text-sm text-slate-400">Aucun utilisateur trouvé</div>
                ) : filteredUsers.map(u => (
                  <div key={u.id} onClick={() => startConversation(u)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer hover:bg-slate-50 transition-colors">
                    <Avatar name={u.name} photo={u.photo} size="md" />
                    <div>
                      <p className="text-sm font-semibold text-slate-800">{u.name}</p>
                      <p className="text-xs text-slate-400">{u.role || u.email || ''}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideUp {
          from { opacity:0; transform:translateY(16px) scale(0.97) }
          to   { opacity:1; transform:translateY(0) scale(1) }
        }
      `}</style>
    </div>
  );
}