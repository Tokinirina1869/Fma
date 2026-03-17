import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';

const url = 'http://localhost:8000/api';

const ReinscriptionLycee = ({ show, handleclose, initialMatricule = '', onReinscriptionSuccess }) => {
  const [mat, setMat] = useState(initialMatricule);
  const [matricule, setMatricule] = useState('');
  const [student, setStudent] = useState(null);
  const [newLevelCode, setNewLevelCode] = useState('');
  const [anneeScolaire, setAnneeScolaire] = useState('');
  const [classe, setClasse] = useState('');
  const [niveaux, setNiveaux] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchDone, setSearchDone] = useState(false);

  useEffect(() => {
    const fetchNiveaux = async () => {
      try {
        const response = await axios.get(`${url}/niveau`);
        if (response.data?.data && Array.isArray(response.data.data)) {
          setNiveaux(response.data.data);
        } else {
          setError('Format de données invalide pour les niveaux');
        }
      } catch (err) {
        setError('Impossible de charger la liste des niveaux');
      }
    };
    setMat(initialMatricule);
    fetchNiveaux();
  }, [initialMatricule]);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!matricule.trim()) { setError('Veuillez saisir un matricule'); return; }
    setLoading(true);
    setError('');
    setStudent(null);
    setSearchDone(false);
    setNewLevelCode('');
    setAnneeScolaire('');
    setClasse('');
    try {
      const response = await axios.get(`${url}/personne/matricule/${matricule.trim()}`);
      const data = response.data;
      setStudent(data);
      setSearchDone(true);
      if (data.inscriptionacademique?.niveau?.code_niveau) {
        setNewLevelCode(data.inscriptionacademique.niveau.code_niveau);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Élève introuvable');
      setSearchDone(true);
    } finally {
      setLoading(false);
    }
  };

  const generateAnnee = () => {
    const currentAnnee = new Date().getFullYear();
    const years = [];
    for (let annee = 2020; annee <= currentAnnee; annee++) {
      years.push(`${annee}-${annee + 1}`);
    }
    return years.reverse();
  };

  const handleReinscription = async (e) => {
    e.preventDefault();
    if (!student) return;
    if (!newLevelCode) { setError('Veuillez sélectionner un niveau'); return; }
    if (!anneeScolaire.trim()) { setError("Veuillez saisir l'année scolaire"); return; }

    setLoading(true);
    setError('');
    try {
      const response = await axios.post(`${url}/reinscrire`, {
        matricule: student.matricule,
        nouveau_code_niveau: newLevelCode,
        annee_scolaire: anneeScolaire,
        classe: classe || null,
      });

      const nouvelleInscription = response.data.reinscription?.inscription || response.data.inscription;
      if (nouvelleInscription) {
        setStudent(nouvelleInscription);
        if (nouvelleInscription.inscriptionacademique?.niveau?.code_niveau) {
          setNewLevelCode(nouvelleInscription.inscriptionacademique.niveau.code_niveau);
        }
      }

      Swal.fire({
        icon: 'success',
        title: 'Réinscription réussie',
        text: `${student.personne?.prenom} ${student.personne?.nom} — ${response.data.reinscription?.nouveau_niveau?.nomniveau || newLevelCode} — ${anneeScolaire}`,
        background: '#0f172a',
        color: '#f1f5f9',
        confirmButtonColor: '#0ea5e9',
        confirmButtonText: 'Parfait !',
      });

      if (onReinscriptionSuccess) onReinscriptionSuccess(response.data);
      setAnneeScolaire('');
      setClasse('');
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = newLevelCode && anneeScolaire;

  if (!show) return null;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600&display=swap');

        .rl-overlay {
          position: fixed; inset: 0;
          background: rgba(2, 8, 20, 0.72);
          backdrop-filter: blur(8px);
          display: flex; align-items: center; justify-content: center;
          z-index: 9999; padding: 1rem;
          animation: rlFadeIn 0.22s ease;
        }
        @keyframes rlFadeIn { from { opacity: 0 } to { opacity: 1 } }

        .rl-modal {
          font-family: 'DM Sans', sans-serif;
          background: #fff;
          border-radius: 22px;
          width: 100%; max-width: 540px;
          max-height: 93vh; overflow-y: auto;
          box-shadow: 0 40px 100px rgba(0,0,0,0.32), 0 0 0 1px rgba(255,255,255,0.05);
          animation: rlSlideUp 0.38s cubic-bezier(0.34, 1.56, 0.64, 1);
          scrollbar-width: thin; scrollbar-color: #e2e8f0 transparent;
        }
        @keyframes rlSlideUp {
          from { opacity: 0; transform: translateY(30px) scale(0.96) }
          to   { opacity: 1; transform: translateY(0)    scale(1)    }
        }

        /* ── Header — couleur teal/cyan pour différencier du CFP ── */
        .rl-header {
          background: linear-gradient(140deg, #0c4a6e 0%, #075985 50%, #0284c7 100%);
          padding: 26px 28px 22px;
          border-radius: 22px 22px 0 0;
          position: relative; overflow: hidden;
        }
        .rl-orb1 {
          position: absolute; top: -50px; right: -30px;
          width: 180px; height: 180px;
          background: radial-gradient(circle, rgba(56,189,248,0.22) 0%, transparent 70%);
          border-radius: 50%; pointer-events: none;
        }
        .rl-orb2 {
          position: absolute; bottom: -30px; left: 40px;
          width: 120px; height: 120px;
          background: radial-gradient(circle, rgba(14,165,233,0.2) 0%, transparent 70%);
          border-radius: 50%; pointer-events: none;
        }
        .rl-badge {
          display: inline-flex; align-items: center; gap: 5px;
          background: rgba(255,255,255,0.1);
          border: 1px solid rgba(255,255,255,0.18);
          border-radius: 100px; padding: 3px 11px;
          font-size: 10.5px; font-weight: 600;
          letter-spacing: 0.09em; text-transform: uppercase;
          color: #bae6fd; margin-bottom: 10px;
          position: relative; z-index: 1;
        }
        .rl-title {
          font-family: 'Syne', sans-serif;
          font-size: 21px; font-weight: 800; color: #fff;
          margin: 0; line-height: 1.25; position: relative; z-index: 1;
        }
        .rl-subtitle {
          font-size: 12.5px; color: #7dd3fc;
          margin: 4px 0 0; position: relative; z-index: 1;
        }
        .rl-close-btn {
          position: absolute; top: 18px; right: 18px;
          width: 34px; height: 34px;
          background: rgba(255,255,255,0.1);
          border: 1px solid rgba(255,255,255,0.18);
          border-radius: 9px; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          color: rgba(255,255,255,0.8); font-size: 16px; line-height: 1;
          transition: all 0.18s; z-index: 2;
        }
        .rl-close-btn:hover { background: rgba(239,68,68,0.35); border-color: rgba(239,68,68,0.45); color: #fff; transform: scale(1.06); }

        /* ── Body ── */
        .rl-body { padding: 26px 28px 30px; }

        .rl-section-label {
          font-size: 11px; font-weight: 700; color: #94a3b8;
          letter-spacing: 0.08em; text-transform: uppercase;
          margin-bottom: 10px;
        }

        /* ── Progress bar ── */
        .rl-progress {
          display: flex; gap: 4px; margin-bottom: 20px;
        }
        .rl-progress-seg {
          flex: 1; height: 3px; border-radius: 99px;
          background: #e2e8f0; transition: background 0.3s;
        }
        .rl-progress-seg.active { background: #0ea5e9; }

        /* ── Search row ── */
        .rl-search-row { display: flex; gap: 9px; align-items: stretch; }
        .rl-search-row input { flex: 1; }

        /* ── Inputs & Selects ── */
        .rl-input, .rl-select {
          width: 100%; padding: 10px 13px;
          border: 1.5px solid #e2e8f0; border-radius: 10px;
          font-size: 13.5px; font-family: 'DM Sans', sans-serif;
          color: #0f172a; outline: none;
          transition: border-color 0.18s, box-shadow 0.18s, background 0.18s;
          background: #f8fafc; box-sizing: border-box;
        }
        .rl-input:focus, .rl-select:focus {
          border-color: #0ea5e9; background: #fff;
          box-shadow: 0 0 0 3px rgba(14,165,233,0.12);
        }
        .rl-input::placeholder { color: #94a3b8; }
        .rl-input:disabled, .rl-select:disabled { opacity: 0.5; cursor: not-allowed; }
        .rl-select {
          appearance: none; cursor: pointer;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='11' height='11' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2.5'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E");
          background-repeat: no-repeat; background-position: right 13px center;
          background-color: #f8fafc; padding-right: 34px;
        }
        .rl-select:focus { background-color: #fff; }

        .rl-field-label {
          display: block; font-size: 11.5px; font-weight: 600;
          color: #64748b; letter-spacing: 0.04em;
          text-transform: uppercase; margin-bottom: 5px;
        }

        /* ── Buttons ── */
        .rl-btn-search {
          padding: 10px 18px; white-space: nowrap; flex-shrink: 0;
          background: #0284c7; color: #fff;
          border: none; border-radius: 10px;
          font-size: 13px; font-weight: 600;
          font-family: 'DM Sans', sans-serif;
          cursor: pointer; transition: all 0.18s;
          display: flex; align-items: center; gap: 6px;
        }
        .rl-btn-search:hover:not(:disabled) { background: #0369a1; transform: translateY(-1px); box-shadow: 0 4px 14px rgba(2,132,199,0.3); }
        .rl-btn-search:disabled { opacity: 0.5; cursor: not-allowed; }

        .rl-btn-submit {
          width: 100%; padding: 13px;
          background: linear-gradient(135deg, #0284c7, #0369a1);
          color: #fff; border: none; border-radius: 12px;
          font-size: 14.5px; font-weight: 700;
          font-family: 'Syne', sans-serif;
          cursor: pointer; transition: all 0.22s;
          display: flex; align-items: center; justify-content: center; gap: 8px;
          letter-spacing: 0.01em; margin-top: 18px;
        }
        .rl-btn-submit:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 10px 28px rgba(2,132,199,0.36); }
        .rl-btn-submit:active:not(:disabled) { transform: translateY(0); }
        .rl-btn-submit:disabled { opacity: 0.42; cursor: not-allowed; background: #94a3b8; transform: none; box-shadow: none; }

        /* ── Divider ── */
        .rl-divider {
          display: flex; align-items: center; gap: 10px;
          margin: 20px 0;
        }
        .rl-divider-line { flex: 1; height: 1px; background: #f1f5f9; }
        .rl-divider-text { font-size: 10.5px; font-weight: 700; color: #94a3b8; letter-spacing: 0.1em; text-transform: uppercase; }

        /* ── Student card ── */
        .rl-student-card {
          background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
          border: 1.5px solid #7dd3fc;
          border-radius: 14px; padding: 16px 18px 14px;
          margin-bottom: 20px;
          animation: rlFadeIn 0.3s ease;
        }
        .rl-student-top { display: flex; align-items: center; gap: 13px; margin-bottom: 12px; }
        .rl-avatar {
          width: 46px; height: 46px; flex-shrink: 0;
          background: linear-gradient(135deg, #0284c7, #0369a1);
          border-radius: 13px;
          display: flex; align-items: center; justify-content: center;
          font-family: 'Syne', sans-serif; font-size: 17px; font-weight: 800; color: #fff;
        }
        .rl-student-name {
          font-family: 'Syne', sans-serif; font-size: 15px; font-weight: 700; color: #0c4a6e; margin: 0;
        }
        .rl-student-mat {
          display: inline-block; margin-top: 3px;
          font-size: 11.5px; font-weight: 600; color: #0284c7;
          background: rgba(2,132,199,0.1); border-radius: 6px; padding: 1px 8px;
        }
        .rl-info-row {
          display: flex; align-items: flex-start; gap: 8px;
          font-size: 12.5px; padding: 8px 0 0;
          border-top: 1px dashed #7dd3fc; color: #475569;
        }
        .rl-info-key { font-weight: 600; color: #0369a1; min-width: 120px; flex-shrink: 0; }
        .rl-info-val { color: #334155; }

        /* ── Niveau actuel tag ── */
        .rl-level-tag {
          display: inline-flex; align-items: center; gap: 5px;
          background: rgba(2,132,199,0.1); border: 1px solid rgba(2,132,199,0.2);
          border-radius: 7px; padding: 2px 9px;
          font-size: 12px; font-weight: 600; color: #0369a1;
        }

        /* ── Form grid ── */
        .rl-form-grid {
          display: grid; grid-template-columns: 1fr 1fr; gap: 14px;
        }
        .rl-span2 { grid-column: 1 / -1; }

        /* ── Alert ── */
        .rl-alert {
          border-radius: 10px; padding: 10px 14px;
          font-size: 12.5px; font-weight: 500;
          display: flex; align-items: center; gap: 8px;
          margin-top: 14px; animation: rlFadeIn 0.2s ease;
        }
        .rl-alert-error { background: #fef2f2; border: 1px solid #fecaca; color: #dc2626; }

        /* ── Spinner ── */
        .rl-spinner {
          width: 15px; height: 15px; flex-shrink: 0;
          border: 2px solid rgba(255,255,255,0.3); border-top-color: #fff;
          border-radius: 50%; animation: rlSpin 0.65s linear infinite;
        }
        @keyframes rlSpin { to { transform: rotate(360deg); } }

        /* ── Empty state ── */
        .rl-empty {
          text-align: center; padding: 30px 0 10px;
          animation: rlFadeIn 0.3s ease;
        }
        .rl-empty-icon { font-size: 38px; margin-bottom: 8px; }
        .rl-empty-title { font-family: 'Syne', sans-serif; font-size: 15px; font-weight: 700; color: #1e293b; margin-bottom: 3px; }
        .rl-empty-sub { font-size: 12.5px; color: #94a3b8; }
      `}</style>

      <div className="rl-overlay" onClick={(e) => e.target === e.currentTarget && handleclose()}>
        <div className="rl-modal">

          {/* ── Header ── */}
          <div className="rl-header">
            <div className="rl-orb1" />
            <div className="rl-orb2" />
            <div className="rl-badge">
              <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                <polyline points="9 22 9 12 15 12 15 22"/>
              </svg>
              Lycée · Réinscription
            </div>
            <h2 className="rl-title">Réinscription Élève</h2>
            <p className="rl-subtitle">Changement de niveau &nbsp;·&nbsp; Année scolaire en cours</p>
            <button className="rl-close-btn" onClick={handleclose} title="Fermer">✕</button>
          </div>

          {/* ── Body ── */}
          <div className="rl-body">

            {/* Progress */}
            <div className="rl-progress">
              <div className={`rl-progress-seg ${true ? 'active' : ''}`} />
              <div className={`rl-progress-seg ${student ? 'active' : ''}`} />
              <div className={`rl-progress-seg ${student && isFormValid ? 'active' : ''}`} />
            </div>

            {/* Étape 1 — Recherche */}
            <p className="rl-section-label">Étape 1 — Rechercher l'élève</p>
            <form onSubmit={handleSearch}>
              <div className="rl-search-row">
                <input
                  type="text"
                  value={matricule}
                  onChange={(e) => { setMatricule(e.target.value); setStudent(null); setSearchDone(false); setError(''); }}
                  disabled={loading}
                  className="rl-input"
                  placeholder="Matricule — Ex : 26/LYC/87"
                />
                <button type="submit" disabled={loading} className="rl-btn-search">
                  {loading
                    ? <><div className="rl-spinner" />Recherche…</>
                    : <>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                        </svg>
                        Chercher
                      </>
                  }
                </button>
              </div>
            </form>

            {/* Erreur recherche */}
            {error && !student && (
              <div className="rl-alert rl-alert-error">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                {error}
              </div>
            )}

            {/* Pas trouvé */}
            {searchDone && !student && !error && (
              <div className="rl-empty">
                <div className="rl-empty-icon">🔍</div>
                <p className="rl-empty-title">Aucun élève trouvé</p>
                <p className="rl-empty-sub">Vérifiez le matricule et réessayez</p>
              </div>
            )}

            {/* ── Élève trouvé ── */}
            {student && (
              <>
                <div className="rl-divider">
                  <div className="rl-divider-line" />
                  <span className="rl-divider-text">Élève trouvé</span>
                  <div className="rl-divider-line" />
                </div>

                {/* Card */}
                <div className="rl-student-card">
                  <div className="rl-student-top">
                    <div className="rl-avatar">
                      {(student.personne?.nom?.[0] || '?').toUpperCase()}
                    </div>
                    <div>
                      <p className="rl-student-name">
                        {student.personne?.nom} {student.personne?.prenom}
                      </p>
                      <span className="rl-student-mat">{student.matricule}</span>
                    </div>
                  </div>
                  <div className="rl-info-row">
                    <span className="rl-info-key">Niveau actuel</span>
                    <span className="rl-info-val">
                      {student.inscriptionacademique?.niveau?.nomniveau
                        ? <span className="rl-level-tag">
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
                            {student.inscriptionacademique.niveau.nomniveau}
                          </span>
                        : <em style={{color:'#94a3b8'}}>Non défini</em>
                      }
                    </span>
                  </div>
                </div>

                {/* Étape 2 — Formulaire */}
                <p className="rl-section-label">Étape 2 — Nouvelle inscription</p>
                <form onSubmit={handleReinscription}>
                  <div className="rl-form-grid">

                    {/* Nouveau niveau */}
                    <div className="rl-span2">
                      <label className="rl-field-label">Nouveau niveau</label>
                      <select
                        value={newLevelCode}
                        onChange={(e) => setNewLevelCode(e.target.value)}
                        disabled={loading || niveaux.length === 0}
                        className="rl-select"
                      >
                        <option value="">— Sélectionner un niveau —</option>
                        {niveaux.map((niveau) => (
                          <option key={niveau.code_niveau} value={niveau.code_niveau}>
                            {niveau.nomniveau}
                          </option>
                        ))}
                      </select>
                      {niveaux.length === 0 && (
                        <p style={{fontSize:'11px', color:'#ef4444', marginTop:'4px'}}>Aucun niveau disponible</p>
                      )}
                    </div>

                    {/* Année scolaire */}
                    <div>
                      <label className="rl-field-label">Année scolaire</label>
                      <select
                        value={anneeScolaire}
                        onChange={(e) => setAnneeScolaire(e.target.value)}
                        disabled={loading}
                        className="rl-select"
                        required
                      >
                        <option value="">— Choisir —</option>
                        {generateAnnee().map(a => <option key={a}>{a}</option>)}
                      </select>
                    </div>

                    {/* Classe (optionnel) */}
                    <div>
                      <label className="rl-field-label">
                        Classe&nbsp;
                        <span style={{fontSize:'10px', fontWeight:400, textTransform:'none', color:'#94a3b8', letterSpacing:0}}>
                          (optionnel)
                        </span>
                      </label>
                      <input
                        type="text"
                        value={classe}
                        onChange={(e) => setClasse(e.target.value)}
                        disabled={loading}
                        className="rl-input"
                        placeholder="Ex : 3e A"
                      />
                    </div>

                  </div>

                  {/* Erreur formulaire */}
                  {error && student && (
                    <div className="rl-alert rl-alert-error">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                      </svg>
                      {error}
                    </div>
                  )}

                  <button type="submit" disabled={loading || !isFormValid} className="rl-btn-submit">
                    {loading
                      ? <><div className="rl-spinner" />Traitement en cours…</>
                      : <>
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <polyline points="20 6 9 17 4 12"/>
                          </svg>
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

export default ReinscriptionLycee;