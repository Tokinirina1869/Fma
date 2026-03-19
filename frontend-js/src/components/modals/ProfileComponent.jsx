import React, { useState, useEffect, useRef, useContext } from 'react';
import { AuthContext } from "../Users/AuthContext";
import axios from 'axios';

// ══════════════════════════════════════════════════════════════
//  CONSTANTES
// ══════════════════════════════════════════════════════════════
const API_BASE = 'https://fma-inscription.onrender.com/api/';

const CRITERIA = [
  { key: 'len',     test: p => p.length >= 8,                     label: '8 caractères minimum' },
  { key: 'upper',   test: p => /[A-Z]/.test(p),                   label: '1 majuscule' },
  { key: 'lower',   test: p => /[a-z]/.test(p),                   label: '1 minuscule' },
  { key: 'digit',   test: p => /[0-9]/.test(p),                   label: '1 chiffre' },
  { key: 'special', test: p => /[!@#$%^&*(),.?":{}|<>]/.test(p), label: '1 caractère spécial' },
];

const scoreOf = pwd => CRITERIA.filter(c => c.test(pwd)).length;

const STRENGTH_META = [
  { label: '',           color: 'bg-slate-200',  text: '' },
  { label: 'Très faible', color: 'bg-red-500',   text: 'text-red-500' },
  { label: 'Faible',      color: 'bg-orange-500', text: 'text-orange-500' },
  { label: 'Moyen',       color: 'bg-yellow-500', text: 'text-yellow-600' },
  { label: 'Fort',        color: 'bg-blue-500',   text: 'text-blue-600' },
  { label: 'Excellent',   color: 'bg-green-500',  text: 'text-green-600' },
];

// ══════════════════════════════════════════════════════════════
//  SOUS-COMPOSANTS (hors composant principal)
// ══════════════════════════════════════════════════════════════

const FieldLabel = ({ children }) => (
  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
    {children}
  </label>
);

const TextInput = ({ type = 'text', value, onChange, placeholder }) => (
  <input
    type={type}
    value={value}
    onChange={onChange}
    placeholder={placeholder}
    autoComplete="off"
    className="block w-full px-4 py-3 text-sm text-slate-800 bg-white border-2 border-slate-200 rounded-xl outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all duration-150 placeholder-slate-400"
  />
);

const PwInput = ({ value, onChange, placeholder, show, onToggle }) => (
  <div className="relative">
    <input
      type={show ? 'text' : 'password'}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      autoComplete="new-password"
      className="block w-full px-4 py-3 pr-12 text-sm text-slate-800 bg-white border-2 border-slate-200 rounded-xl outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all duration-150 placeholder-slate-400"
    />
    <button
      type="button"
      tabIndex={-1}
      onClick={onToggle}
      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
    >
      {show
        ? <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
        : <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
      }
    </button>
  </div>
);

// ══════════════════════════════════════════════════════════════
//  COMPOSANT PRINCIPAL
// ══════════════════════════════════════════════════════════════
export default function ProfileModal({ show, handleClose, onUpdateProfile, onBack }) {
  const { user, token, login } = useContext(AuthContext);

  const [name,     setName]     = useState('');
  const [email,    setEmail]    = useState('');
  const [photo,    setPhoto]    = useState(null);
  const [curPwd,   setCurPwd]   = useState('');
  const [newPwd,   setNewPwd]   = useState('');
  const [confPwd,  setConfPwd]  = useState('');
  const [strength, setStrength] = useState(0);
  const [showCur,  setShowCur]  = useState(false);
  const [showNew,  setShowNew]  = useState(false);
  const [showConf, setShowConf] = useState(false);
  const [pwErr,    setPwErr]    = useState('');
  const [tab,      setTab]      = useState('profile');
  const [modified, setModified] = useState(false);
  const [saving,   setSaving]   = useState(false);
  const [uploading,setUploading]= useState(false);
  const [progress, setProgress] = useState(0);
  const [dragOver, setDragOver] = useState(false);
  const [imgErr,   setImgErr]   = useState('');

  const fileRef = useRef(null);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
      setPhoto(user.photo || user.profilePicture || null);
    }
  }, [user]);

  useEffect(() => {
    setModified(
      name  !== (user?.name  || '') ||
      email !== (user?.email || '') ||
      photo !== (user?.photo || user?.profilePicture || null) ||
      curPwd.length > 0 || newPwd.length > 0
    );
  }, [name, email, photo, curPwd, newPwd, user]);

  useEffect(() => {
    if (show) document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, [show]);

  const initials = (n = '') => n.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || '?';

  const reset = () => {
    setName(user?.name || ''); setEmail(user?.email || '');
    setPhoto(user?.photo || user?.profilePicture || null);
    setCurPwd(''); setNewPwd(''); setConfPwd('');
    setPwErr(''); setImgErr(''); setModified(false);
    setTab('profile'); setStrength(0);
    setShowCur(false); setShowNew(false); setShowConf(false);
  };

  const cancel = () => { reset(); handleClose(); };

  const uploadFile = file => {
    if (!['image/jpeg','image/jpg','image/png','image/gif','image/webp'].includes(file.type)) { setImgErr('Format non supporté'); return; }
    if (file.size > 5e6) { setImgErr('Max 5 Mo'); return; }
    setUploading(true); setProgress(0); setImgErr('');
    const iv = setInterval(() => setProgress(p => p >= 85 ? (clearInterval(iv), 85) : p + 15), 100);
    const r = new FileReader();
    r.onloadend = () => { clearInterval(iv); setProgress(100); setTimeout(() => { setPhoto(r.result); setUploading(false); setProgress(0); }, 300); };
    r.onerror   = () => { clearInterval(iv); setImgErr('Erreur de lecture'); setUploading(false); };
    r.readAsDataURL(file);
  };

  const validatePw = () => {
    if (!newPwd) return true;
    if (newPwd.length < 8)      { setPwErr('8 caractères minimum'); return false; }
    if (scoreOf(newPwd) < 3)    { setPwErr('Mot de passe trop faible'); return false; }
    if (newPwd !== confPwd)     { setPwErr('Les mots de passe ne correspondent pas'); return false; }
    if (!curPwd)                { setPwErr('Mot de passe actuel requis'); return false; }
    setPwErr(''); return true;
  };

  const save = async () => {
    if (!name.trim())  { alert('Nom requis'); return; }
    if (!email.trim()) { alert('Email requis'); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { alert('Email invalide'); return; }
    if (!validatePw()) return;
    setSaving(true);
    try {
      const data = { name: name.trim(), email: email.trim() };
      if (photo?.startsWith('data:image')) data.photo = photo;
      else if (!photo) data.photo = null;
      if (newPwd) { data.current_password = curPwd; data.new_password = newPwd; data.new_password_confirmation = confPwd; }
      const res = await axios.put(`${API_BASE}/users/${user.id}`, data, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
      });
      if (res.data.status === 'Succès') {
        const u2 = { ...user, name: data.name, email: data.email, photo: res.data.data?.photo || user.photo };
        login(token, u2);
        (localStorage.getItem('token') ? localStorage : sessionStorage).setItem('user', JSON.stringify(u2));
        onUpdateProfile?.(u2);
        reset(); handleClose(); alert('Profil mis à jour !');
      } else alert('Erreur : ' + res.data.message);
    } catch (e) {
      const errs = e.response?.data?.errors;
      alert(errs ? Object.entries(errs).map(([f,m]) => `${f}: ${m.join(', ')}`).join('\n') : 'Erreur : ' + (e.response?.data?.message || e.message));
    } finally { setSaving(false); }
  };

  if (!show) return null;

  const sm = STRENGTH_META[strength] || STRENGTH_META[0];
  const canSave = modified && !saving;

  return (
    <>
      <style>{`@keyframes pm-spin { to { transform: rotate(360deg); } }`}</style>

      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[9999] bg-slate-900/60 backdrop-blur-sm"
        onClick={cancel}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 pointer-events-none">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden pointer-events-auto">

          {/* ── Header ── */}
          <div className="bg-gradient-to-br from-indigo-700 via-indigo-500 to-violet-500 px-6 pt-6 pb-0 flex-shrink-0">
            <div className="flex justify-between items-start mb-5">
              <div>
                <h2 className="text-xl font-extrabold text-white tracking-tight">Mon profil</h2>
                <p className="text-indigo-200 text-xs mt-1">Gérez vos informations personnelles</p>
              </div>
              <button
                onClick={cancel}
                className="bg-white/20 hover:bg-white/30 text-white border-none rounded-lg w-8 h-8 flex items-center justify-center cursor-pointer transition-colors"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M18 6L6 18M6 6l12 12"/></svg>
              </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-1">
              {[['profile','Profil'],['password','Mot de passe']].map(([t, l]) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`flex-1 py-2.5 px-4 text-sm font-semibold border-none cursor-pointer rounded-t-xl transition-all ${
                    tab === t
                      ? 'bg-white text-indigo-600'
                      : 'bg-transparent text-white/80 hover:bg-white/10'
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>

          {/* ── Body ── */}
          <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-5">

            {/* ── TAB PROFIL ── */}
            {tab === 'profile' && (
              <>
                {/* Avatar */}
                <div className="flex flex-col items-center gap-3">
                  <div className="relative">
                    <div className={`w-20 h-20 rounded-full border-4 border-indigo-100 shadow-lg overflow-hidden flex items-center justify-center ${photo ? '' : 'bg-gradient-to-br from-indigo-500 to-violet-500'}`}>
                      {photo
                        ? <img src={photo} alt="avatar" className="w-full h-full object-cover" />
                        : <span className="text-2xl font-extrabold text-white">{initials(name)}</span>
                      }
                    </div>
                    {photo && !uploading && (
                      <button
                        onClick={() => { setPhoto(null); setImgErr(''); }}
                        className="absolute -top-1 -right-1 bg-red-500 border-2 border-white rounded-full w-5 h-5 flex items-center justify-center cursor-pointer text-white"
                      >
                        <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5"><path d="M18 6L6 18M6 6l12 12"/></svg>
                      </button>
                    )}
                  </div>

                  {uploading && (
                    <div className="w-64">
                      <div className="flex justify-between text-xs text-slate-500 mb-1">
                        <span>Téléversement…</span><span>{progress}%</span>
                      </div>
                      <div className="h-1 bg-slate-200 rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-500 rounded-full transition-all" style={{ width: `${progress}%` }} />
                      </div>
                    </div>
                  )}

                  {/* Drop zone */}
                  <div
                    onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={e => { e.preventDefault(); setDragOver(false); if (e.dataTransfer.files[0]) uploadFile(e.dataTransfer.files[0]); }}
                    onClick={() => !uploading && fileRef.current?.click()}
                    className={`w-full max-w-xs border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all ${dragOver ? 'border-indigo-500 bg-indigo-50' : 'border-slate-300 hover:border-indigo-400 bg-slate-50'} ${uploading ? 'opacity-50 pointer-events-none' : ''}`}
                  >
                    <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12"/></svg>
                    </div>
                    <p className="text-sm font-semibold text-slate-700">Glisser-déposer ou cliquer</p>
                    <p className="text-xs text-slate-400 mt-0.5">JPEG · PNG · WebP · max 5 Mo</p>
                  </div>
                  <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={e => { if (e.target.files[0]) uploadFile(e.target.files[0]); }} />

                  {imgErr && (
                    <div className="flex items-center gap-2 px-3 py-2 bg-red-50 border border-red-200 rounded-lg text-xs text-red-600 w-full max-w-xs">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></svg>
                      {imgErr}
                    </div>
                  )}
                </div>

                <div className="h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />

                <div className="flex flex-col gap-4">
                  <div>
                    <FieldLabel>Nom complet</FieldLabel>
                    <TextInput value={name} onChange={e => setName(e.target.value)} placeholder="Votre nom complet" />
                  </div>
                  <div>
                    <FieldLabel>Adresse email</FieldLabel>
                    <TextInput type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="exemple@email.com" />
                  </div>
                </div>
              </>
            )}

            {/* ── TAB MOT DE PASSE ── */}
            {tab === 'password' && (
              <>
                {/* Bannière */}
                <div className="flex gap-3 p-3.5 bg-amber-50 border border-amber-200 rounded-xl">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2" className="flex-shrink-0 mt-0.5">
                    <path d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
                  </svg>
                  <div>
                    <p className="text-sm font-bold text-amber-800">Changement de mot de passe</p>
                    <p className="text-xs text-amber-700 mt-0.5">Saisissez votre mot de passe actuel pour continuer.</p>
                  </div>
                </div>

                <div>
                  <FieldLabel>Mot de passe actuel</FieldLabel>
                  <PwInput value={curPwd} onChange={e => setCurPwd(e.target.value)} placeholder="Votre mot de passe actuel" show={showCur} onToggle={() => setShowCur(v => !v)} />
                </div>

                <div>
                  <FieldLabel>Nouveau mot de passe</FieldLabel>
                  <PwInput
                    value={newPwd}
                    onChange={e => { setNewPwd(e.target.value); setStrength(scoreOf(e.target.value)); }}
                    placeholder="Créez un nouveau mot de passe"
                    show={showNew} onToggle={() => setShowNew(v => !v)}
                  />
                  {newPwd && (
                    <div className="mt-3">
                      <div className="flex justify-between mb-1.5">
                        <span className="text-xs text-slate-500">Sécurité</span>
                        <span className={`text-xs font-bold ${sm.text}`}>{sm.label}</span>
                      </div>
                      <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full transition-all duration-300 ${sm.color}`} style={{ width: `${(strength / 5) * 100}%` }} />
                      </div>
                      <div className="grid grid-cols-2 gap-1.5 mt-3">
                        {CRITERIA.map(c => {
                          const ok = c.test(newPwd);
                          return (
                            <div key={c.key} className="flex items-center gap-1.5">
                              <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center flex-shrink-0 ${ok ? 'bg-green-100' : 'bg-slate-100'}`}>
                                {ok
                                  ? <svg width="8" height="8" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                                  : <div className="w-1 h-1 rounded-full bg-slate-400" />
                                }
                              </div>
                              <span className={`text-xs ${ok ? 'text-green-700' : 'text-slate-400'}`}>{c.label}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <FieldLabel>Confirmer le mot de passe</FieldLabel>
                  <PwInput value={confPwd} onChange={e => setConfPwd(e.target.value)} placeholder="Confirmez votre nouveau mot de passe" show={showConf} onToggle={() => setShowConf(v => !v)} />
                  {confPwd && newPwd !== confPwd && (
                    <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1">
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></svg>
                      Les mots de passe ne correspondent pas
                    </p>
                  )}
                </div>

                {pwErr && (
                  <div className="flex items-center gap-2 px-3.5 py-2.5 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600 font-medium">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></svg>
                    {pwErr}
                  </div>
                )}
              </>
            )}
          </div>

          {/* ── Footer ── */}
          <div className="flex justify-between items-center px-6 py-4 border-t border-slate-100 bg-slate-50 flex-shrink-0">
            <button
              type="button"
              onClick={onBack}
              className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-slate-600 bg-transparent border border-slate-200 rounded-xl hover:bg-slate-100 cursor-pointer transition-colors"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
              Retour
            </button>
            <div className="flex gap-2.5">
              <button
                type="button"
                onClick={cancel}
                className="px-4 py-2 text-sm font-semibold text-slate-600 bg-transparent border border-slate-200 rounded-xl hover:bg-slate-100 cursor-pointer transition-colors"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={save}
                disabled={!canSave}
                className={`flex items-center gap-2 px-5 py-2 text-sm font-bold rounded-xl border-none transition-all ${
                  canSave
                    ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white cursor-pointer shadow-lg shadow-indigo-200 hover:shadow-indigo-300 hover:from-indigo-700 hover:to-indigo-600'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                {saving
                  ? <><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ animation: 'pm-spin 1s linear infinite' }}><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>Sauvegarde…</>
                  : <><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 6L9 17l-5-5"/></svg>Sauvegarder</>
                }
              </button>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
