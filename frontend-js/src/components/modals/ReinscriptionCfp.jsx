import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';

const url = 'https://fma-inscription.onrender.com/api';

const ReinscriptionCfp = ({ show, handleclose, initialMatricule = '', onReinscriptionSuccess }) => {
  const [matricule, setMatricule] = useState(initialMatricule);
  const [student, setStudent] = useState(null);
  const [formationChoisie, setFormationChoisie] = useState('');
  const [anneeEtude, setAnneeEtude] = useState('');
  const [anneeScolaire, setAnneeScolaire] = useState('');
  const [dateInscription, setDateInscription] = useState(new Date().toISOString().split('T')[0]);
  const [formations, setFormations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchDone, setSearchDone] = useState(false);

  useEffect(() => {
    const fetchFormations = async () => {
      try {
        const response = await axios.get(`${url}/parcours`);
        const formationsDeuxAns = (response.data || []).filter(f => f.duree === '2 ans');
        setFormations(formationsDeuxAns);
      } catch (err) {
        console.error('Erreur chargement formations:', err);
        setError('Impossible de charger la liste des formations');
      }
    };
    fetchFormations();
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!matricule.trim()) { setError('Veuillez saisir un matricule'); return; }
    setLoading(true);
    setError('');
    setStudent(null);
    setSearchDone(false);
    setFormationChoisie('');
    setAnneeEtude('');
    setAnneeScolaire('');
    try {
      const response = await axios.get(`${url}/personne/matricule/${matricule.trim()}`);
      setStudent(response.data);
      setSearchDone(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Apprenant introuvable');
      setSearchDone(true);
    } finally {
      setLoading(false);
    }
  };

  const generateAnnee = () => {
    const currentAnnee = new Date().getFullYear();
    const years = [];
    for (let annee = 2024; annee <= currentAnnee; annee++) {
      years.push(`${annee}-${annee + 1}`);
    }
    return years.reverse();
  };

  const handleReinscription = async (e) => {
    e.preventDefault();
    if (!student) return;
    if (!formationChoisie) { setError('Veuillez choisir une formation'); return; }
    if (!anneeEtude) { setError("Veuillez préciser l'année d'étude"); return; }
    if (!anneeScolaire.trim()) { setError("Veuillez saisir l'année scolaire"); return; }

    setLoading(true);
    setError('');
    try {
      const response = await axios.post(`${url}/reinscrirecfp`, {
        matricule: student.matricule,
        annee_scolaire: anneeScolaire,
        nouveau_nom_formation: formationChoisie,
        nouvelle_annee_etude: anneeEtude,
        date_inscription: dateInscription,
      });
      Swal.fire({
        icon: 'success',
        title: 'Réinscription réussie',
        text: `${student.personne?.nom} ${student.personne?.prenom} — ${formationChoisie} (${anneeEtude}) — ${anneeScolaire}`,
        background: '#0f172a',
        color: '#f1f5f9',
        confirmButtonColor: '#6366f1',
        confirmButtonText: 'Parfait !',
      });
      if (onReinscriptionSuccess) onReinscriptionSuccess(response.data);
      setFormationChoisie('');
      setAnneeEtude('');
      setAnneeScolaire('');
      setDateInscription(new Date().toISOString().split('T')[0]);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = formationChoisie && anneeEtude && anneeScolaire;

  if (!show) return null;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600&display=swap');

        .rc-overlay {
          position: fixed; inset: 0;
          background: rgba(2, 6, 23, 0.7);
          backdrop-filter: blur(8px);
          display: flex; align-items: center; justify-content: center;
          z-index: 9999; padding: 1rem;
          animation: rcFadeIn 0.2s ease;
        }
        @keyframes rcFadeIn { from { opacity: 0 } to { opacity: 1 } }

        .rc-modal {
          font-family: 'DM Sans', sans-serif;
          background: #fff;
          border-radius: 22px;
          width: 100%; max-width: 540px;
          max-height: 93vh; overflow-y: auto;
          box-shadow: 0 40px 100px rgba(0,0,0,0.35), 0 0 0 1px rgba(255,255,255,0.06);
          animation: rcSlideUp 0.38s cubic-bezier(0.34,1.56,0.64,1);
          scrollbar-width: thin; scrollbar-color: #e2e8f0 transparent;
        }
        @keyframes rcSlideUp {
          from { opacity:0; transform: translateY(30px) scale(0.96) }
          to   { opacity:1; transform: translateY(0) scale(1) }
        }

        .rc-header {
          background: linear-gradient(140deg, #1e1b4b 0%, #3730a3 55%, #4f46e5 100%);
          padding: 26px 28px 22px; border-radius: 22px 22px 0 0;
          position: relative; overflow: hidden;
        }
        .rc-header-orb1 {
          position: absolute; top: -50px; right: -30px;
          width: 180px; height: 180px;
          background: radial-gradient(circle, rgba(129,140,248,0.25) 0%, transparent 70%);
          border-radius: 50%; pointer-events: none;
        }
        .rc-header-orb2 {
          position: absolute; bottom: -30px; left: 40px;
          width: 120px; height: 120px;
          background: radial-gradient(circle, rgba(99,102,241,0.2) 0%, transparent 70%);
          border-radius: 50%; pointer-events: none;
        }
        .rc-badge {
          display: inline-flex; align-items: center; gap: 5px;
          background: rgba(255,255,255,0.1);
          border: 1px solid rgba(255,255,255,0.18);
          border-radius: 100px; padding: 3px 11px;
          font-size: 10.5px; font-weight: 600;
          letter-spacing: 0.09em; text-transform: uppercase;
          color: #c7d2fe; margin-bottom: 10px;
          position: relative; z-index: 1;
        }
        .rc-title {
          font-family: 'Syne', sans-serif;
          font-size: 21px; font-weight: 800; color: #fff;
          margin: 0; line-height: 1.25; position: relative; z-index: 1;
        }
        .rc-subtitle {
          font-size: 12.5px; color: #a5b4fc;
          margin: 4px 0 0; position: relative; z-index: 1;
        }
        .rc-close-btn {
          position: absolute; top: 18px; right: 18px;
          width: 34px; height: 34px;
          background: rgba(255,255,255,0.1);
          border: 1px solid rgba(255,255,255,0.18);
          border-radius: 9px; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          color: rgba(255,255,255,0.8); font-size: 16px;
          transition: all 0.18s; z-index: 2; line-height:1;
        }
        .rc-close-btn:hover { background: rgba(239,68,68,0.35); border-color: rgba(239,68,68,0.45); color: #fff; transform: scale(1.06); }

        .rc-body { padding: 26px 28px 30px; }

        .rc-section-label {
          font-size: 11px; font-weight: 700; color: #94a3b8;
          letter-spacing: 0.08em; text-transform: uppercase;
          margin-bottom: 10px;
        }
        .rc-search-row { display: flex; gap: 9px; align-items: stretch; }
        .rc-search-row input { flex: 1; }

        .rc-input, .rc-select {
          width: 100%; padding: 10px 13px;
          border: 1.5px solid #e2e8f0; border-radius: 10px;
          font-size: 13.5px; font-family: 'DM Sans', sans-serif;
          color: #0f172a; outline: none;
          transition: border-color 0.18s, box-shadow 0.18s, background 0.18s;
          background: #f8fafc; box-sizing: border-box;
        }
        .rc-input:focus, .rc-select:focus {
          border-color: #6366f1; background: #fff;
          box-shadow: 0 0 0 3px rgba(99,102,241,0.1);
        }
        .rc-input::placeholder { color: #94a3b8; }
        .rc-input:disabled, .rc-select:disabled { opacity: 0.5; cursor: not-allowed; }
        .rc-select {
          appearance: none; cursor: pointer;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='11' height='11' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2.5'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E");
          background-repeat: no-repeat; background-position: right 13px center;
          background-color: #f8fafc; padding-right: 34px;
        }
        .rc-select:focus { background-color: #fff; }

        .rc-field { margin-bottom: 0; }
        .rc-field-label {
          display: block; font-size: 11.5px; font-weight: 600;
          color: #64748b; letter-spacing: 0.04em;
          text-transform: uppercase; margin-bottom: 5px;
        }

        .rc-btn-search {
          padding: 10px 18px; white-space: nowrap;
          background: #4f46e5; color: #fff;
          border: none; border-radius: 10px;
          font-size: 13px; font-weight: 600;
          font-family: 'DM Sans', sans-serif;
          cursor: pointer; transition: all 0.18s;
          display: flex; align-items: center; gap: 6px; flex-shrink: 0;
        }
        .rc-btn-search:hover:not(:disabled) { background: #4338ca; transform: translateY(-1px); box-shadow: 0 4px 14px rgba(79,70,229,0.3); }
        .rc-btn-search:disabled { opacity: 0.5; cursor: not-allowed; }

        .rc-divider {
          display: flex; align-items: center; gap: 10px;
          margin: 20px 0;
        }
        .rc-divider-line { flex: 1; height: 1px; background: #f1f5f9; }
        .rc-divider-text { font-size: 10.5px; font-weight: 700; color: #94a3b8; letter-spacing: 0.1em; text-transform: uppercase; }

        .rc-student-card {
          background: linear-gradient(135deg, #eff6ff 0%, #f5f3ff 100%);
          border: 1.5px solid #c7d2fe;
          border-radius: 14px; padding: 16px 18px 14px;
          margin-bottom: 20px;
          animation: rcFadeIn 0.3s ease;
        }
        .rc-student-top { display: flex; align-items: center; gap: 13px; margin-bottom: 12px; }
        .rc-avatar {
          width: 46px; height: 46px; flex-shrink: 0;
          background: linear-gradient(135deg, #4f46e5, #7c3aed);
          border-radius: 13px;
          display: flex; align-items: center; justify-content: center;
          font-family: 'Syne', sans-serif; font-size: 17px; font-weight: 800; color: #fff;
        }
        .rc-student-name {
          font-family: 'Syne', sans-serif; font-size: 15px; font-weight: 700; color: #1e1b4b; margin: 0;
        }
        .rc-student-mat {
          display: inline-block; margin-top: 3px;
          font-size: 11.5px; font-weight: 600; color: #6366f1;
          background: rgba(99,102,241,0.1); border-radius: 6px; padding: 1px 8px;
        }
        .rc-info-row {
          display: flex; align-items: flex-start; gap: 8px;
          font-size: 12.5px; padding: 8px 0 0;
          border-top: 1px dashed #c7d2fe; color: #475569;
        }
        .rc-info-key { font-weight: 600; color: #3730a3; min-width: 130px; flex-shrink: 0; }
        .rc-info-val { color: #334155; }

        .rc-form-grid {
          display: grid; grid-template-columns: 1fr 1fr; gap: 14px;
        }
        .rc-span2 { grid-column: 1 / -1; }

        .rc-progress-bar {
          display: flex; gap: 4px; margin-bottom: 18px;
        }
        .rc-progress-seg {
          flex: 1; height: 3px; border-radius: 99px;
          background: #e2e8f0; transition: background 0.3s;
        }
        .rc-progress-seg.active { background: #6366f1; }

        .rc-alert {
          border-radius: 10px; padding: 10px 14px;
          font-size: 12.5px; font-weight: 500;
          display: flex; align-items: center; gap: 8px;
          margin-top: 14px; animation: rcFadeIn 0.2s ease;
        }
        .rc-alert-error { background: #fef2f2; border: 1px solid #fecaca; color: #dc2626; }

        .rc-btn-submit {
          width: 100%; padding: 13px;
          background: linear-gradient(135deg, #4f46e5, #7c3aed);
          color: #fff; border: none; border-radius: 12px;
          font-size: 14.5px; font-weight: 700;
          font-family: 'Syne', sans-serif;
          cursor: pointer; transition: all 0.22s;
          display: flex; align-items: center; justify-content: center; gap: 8px;
          letter-spacing: 0.01em; margin-top: 18px;
        }
        .rc-btn-submit:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 10px 28px rgba(99,102,241,0.38); }
        .rc-btn-submit:active:not(:disabled) { transform: translateY(0); }
        .rc-btn-submit:disabled { opacity: 0.42; cursor: not-allowed; background: #94a3b8; transform: none; box-shadow: none; }

        .rc-spinner {
          width: 15px; height: 15px; flex-shrink: 0;
          border: 2px solid rgba(255,255,255,0.3); border-top-color: #fff;
          border-radius: 50%; animation: rcSpin 0.65s linear infinite;
        }
        @keyframes rcSpin { to { transform: rotate(360deg); } }

        .rc-empty {
          text-align: center; padding: 30px 0 10px;
          animation: rcFadeIn 0.3s ease;
        }
        .rc-empty-icon { font-size: 38px; margin-bottom: 8px; }
        .rc-empty-title { font-family:'Syne',sans-serif; font-size:15px; font-weight:700; color:#1e293b; margin-bottom:3px; }
        .rc-empty-sub { font-size:12.5px; color:#94a3b8; }
      `}</style>

      <div className="rc-overlay" onClick={(e) => e.target === e.currentTarget && handleclose()}>
        <div className="rc-modal">

          {/* Header */}
          <div className="rc-header">
            <div className="rc-header-orb1" />
            <div className="rc-header-orb2" />
            <div className="rc-badge">
              <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>
              CFP · Réinscription
            </div>
            <h2 className="rc-title">Réinscription Apprenant</h2>
            <p className="rc-subtitle">Formations de 2 ans &nbsp;·&nbsp; Année scolaire en cours</p>
            <button className="rc-close-btn" onClick={handleclose} title="Fermer">✕</button>
          </div>

          {/* Body */}
          <div className="rc-body">

            {/* Progress indicator */}
            <div className="rc-progress-bar">
              <div className={`rc-progress-seg ${!student ? 'active' : 'active'}`} />
              <div className={`rc-progress-seg ${student ? 'active' : ''}`} />
              <div className={`rc-progress-seg ${student && isFormValid ? 'active' : ''}`} />
            </div>

            {/* Search */}
            <p className="rc-section-label">Étape 1 — Rechercher l'apprenant</p>
            <form onSubmit={handleSearch}>
              <div className="rc-search-row">
                <input
                  type="text"
                  value={matricule}
                  onChange={(e) => { setMatricule(e.target.value); setStudent(null); setSearchDone(false); setError(''); }}
                  disabled={loading}
                  className="rc-input"
                  placeholder="Matricule — Ex : 26/INF/01"
                />
                <button type="submit" disabled={loading} className="rc-btn-search">
                  {loading
                    ? <><div className="rc-spinner" />Recherche…</>
                    : <><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>Chercher</>
                  }
                </button>
              </div>
            </form>

            {/* Error (search) */}
            {error && !student && (
              <div className="rc-alert rc-alert-error">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                {error}
              </div>
            )}

            {/* Not found */}
            {searchDone && !student && !error && (
              <div className="rc-empty">
                <div className="rc-empty-icon">🔍</div>
                <p className="rc-empty-title">Aucun apprenant trouvé</p>
                <p className="rc-empty-sub">Vérifiez le matricule et réessayez</p>
              </div>
            )}

            {/* Student found */}
            {student && (
              <>
                <div className="rc-divider">
                  <div className="rc-divider-line" />
                  <span className="rc-divider-text">Apprenant trouvé</span>
                  <div className="rc-divider-line" />
                </div>

                {/* Card */}
                <div className="rc-student-card">
                  <div className="rc-student-top">
                    <div className="rc-avatar">
                      {(student.personne?.nom?.[0] || '?').toUpperCase()}
                    </div>
                    <div>
                      <p className="rc-student-name">
                        {student.personne?.nom} {student.personne?.prenom}
                      </p>
                      <span className="rc-student-mat">{student.matricule}</span>
                    </div>
                  </div>
                  <div className="rc-info-row">
                    <span className="rc-info-key">Formation actuelle</span>
                    <span className="rc-info-val">
                      {student.parcours[0].nomformation
                        || <em style={{color:'#94a3b8'}}>Non inscrit en formation</em>
                      }
                    </span>
                  </div>
                </div>

                {/* Reinscription form */}
                <p className="rc-section-label">Étape 2 — Nouvelle inscription</p>
                <form onSubmit={handleReinscription}>
                  <div className="rc-form-grid">

                    {/* Formation */}
                    <div className="rc-span2 rc-field">
                      <label className="rc-field-label">Nouvelle formation</label>
                      <select
                        value={formationChoisie}
                        onChange={(e) => { setFormationChoisie(e.target.value); setAnneeEtude(''); }}
                        disabled={loading || formations.length === 0}
                        className="rc-select"
                      >
                        <option value="">— Choisir la formation —</option>
                        {formations.map((f) => (
                          <option key={f.code_formation} value={f.nomformation}>{f.nomformation}</option>
                        ))}
                      </select>
                      {formations.length === 0 && (
                        <p style={{fontSize:'11px',color:'#ef4444',marginTop:'4px'}}>Aucune formation de 2 ans disponible</p>
                      )}
                    </div>

                    {/* Année d'étude */}
                    <div className="rc-field">
                      <label className="rc-field-label">Année d'étude</label>
                      <select
                        value={anneeEtude}
                        onChange={(e) => setAnneeEtude(e.target.value)}
                        disabled={loading}
                        className="rc-select"
                      >
                        <option value="">— Choisir —</option>
                        <option value="1ere année">1ère année</option>
                        <option value="2eme année">2ème année</option>
                      </select>
                    </div>

                    {/* Année scolaire */}
                    <div className="rc-field">
                      <label className="rc-field-label">Année scolaire</label>
                      <select
                        value={anneeScolaire}
                        onChange={(e) => setAnneeScolaire(e.target.value)}
                        disabled={loading}
                        className="rc-select"
                        required
                      >
                        <option value="">— Choisir —</option>
                        {generateAnnee().map(a => <option key={a}>{a}</option>)}
                      </select>
                    </div>

                    {/* Date */}
                    <div className="rc-span2 rc-field">
                      <label className="rc-field-label">Date d'inscription</label>
                      <input
                        type="date"
                        value={dateInscription}
                        onChange={(e) => setDateInscription(e.target.value)}
                        disabled={loading}
                        max={new Date().toISOString().split('T')[0]}
                        className="rc-input"
                      />
                    </div>

                  </div>

                  {/* Error (form) */}
                  {error && student && (
                    <div className="rc-alert rc-alert-error">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                      {error}
                    </div>
                  )}

                  <button type="submit" disabled={loading || !isFormValid} className="rc-btn-submit">
                    {loading
                      ? <><div className="rc-spinner" />Traitement en cours…</>
                      : <>
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                          Confirmer la réinscription
                        </>
                    }
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default ReinscriptionCfp;
