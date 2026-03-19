import React, { useState, useEffect } from "react";
import { Plus, RefreshCw } from "lucide-react";
import AffichageFormation from "../Formation/AffichageFormation";
import NouvellePersonne from "../modals/NouvellePersonne";
import ModificationInscription from "../modals/ModificationInscription";
import ReinscriptionCfp from "../modals/ReinscriptionCfp";
import axios from "axios";
import { FaBriefcase, FaArrowLeft, FaRedoAlt } from "react-icons/fa";

const url = "https://fma-inscription.onrender.com/api";

const ListeFormation = ({ onViewDashPro }) => {
  const [showPersonne,      setShowPersonne]      = useState(false);
  const [showModification,  setShowModification]  = useState(false);
  const [selectedPersonne,  setSelectedPersonne]  = useState(null);
  const [formationsData,    setFormationsData]     = useState([]);
  const [showReinscription, setShowReinscription] = useState(false);
  const [selectedMat,       setSelectedMat]       = useState('');
  const [refreshTrigger,    setRefreshTrigger]     = useState(false);

  /* ── Handlers ── */
  const openReinscription  = (mat) => { setSelectedMat(mat); setShowReinscription(true); };
  const closeReinscription = ()    => { setShowReinscription(false); setSelectedMat(''); };
  const handleReinscriptionSuccess = (data) => {
    console.log('Réinscription réussie !', data);
    closeReinscription();
    setRefreshTrigger(p => !p);
  };
  const handleRefresh    = () => setRefreshTrigger(p => !p);
  const openModification = (p) => { setSelectedPersonne(p); setShowModification(true); };
  const closeModification = ()  => { setShowModification(false); setSelectedPersonne(null); };

  const fetchFormations = async () => {
    try {
      const res = await axios.get(`${url}/inscriptionComplete`);
      setFormationsData(res.data?.data || []);
    } catch (err) {
      console.error("Erreur chargement formations :", err);
    }
  };

  useEffect(() => { fetchFormations(); }, []);

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── Header sticky ── */}
      <div className="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-30">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-4">

          {/* Back */}
          <button
            onClick={onViewDashPro}
            className="flex items-center justify-center w-9 h-9 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-600 transition flex-shrink-0"
            title="Retour au dashboard"
          >
            <FaArrowLeft size={14} />
          </button>

          {/* Title */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center shadow flex-shrink-0">
              <FaBriefcase className="text-white" size={15} />
            </div>
            <div className="min-w-0">
              <h1 className="text-base font-extrabold text-gray-800 leading-tight truncate">
                CFP FMA Laura Vicuña
              </h1>
              <p className="text-xs text-gray-400 truncate">
                Anjarasoa Ankofafa — Fianarantsoa
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Actualiser */}
            <button
              onClick={handleRefresh}
              className="flex items-center justify-center w-9 h-9 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-500 transition"
              title="Actualiser"
            >
              <RefreshCw size={14} />
            </button>

            {/* Réinscription — desktop */}
            <button
              onClick={() => openReinscription('N° matricule')}
              className="hidden sm:flex items-center gap-2 px-4 py-2 bg-white border border-indigo-200 text-indigo-600 font-semibold rounded-xl hover:bg-indigo-50 transition text-sm shadow-sm"
            >
              <FaRedoAlt size={12} />
              Réinscription
            </button>

            {/* Nouvelle Inscription */}
            <button
              onClick={() => setShowPersonne(true)}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition text-sm shadow"
            >
              <Plus size={15} />
              <span className="hidden sm:inline">Nouvelle Inscription</span>
              <span className="sm:hidden">Inscrire</span>
            </button>
          </div>
        </div>

        {/* Accent line */}
        <div className="h-0.5 bg-gradient-to-r from-indigo-600 via-indigo-400 to-transparent" />
      </div>

      {/* ── Bandeau ── */}
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 pt-5 pb-2">
        <div className="bg-indigo-600 rounded-2xl px-5 py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow">
          <div>
            <p className="text-white font-bold text-sm">Liste des apprenants inscrits</p>
            <p className="text-indigo-200 text-xs mt-0.5">Gérez, filtrez et exportez les données des formations</p>
          </div>
          {/* Réinscription mobile */}
          <div className="flex sm:hidden">
            <button
              onClick={() => openReinscription('N° matricule')}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white/15 border border-white/25 text-white text-xs font-semibold rounded-xl"
            >
              <FaRedoAlt size={10} /> Réinscription
            </button>
          </div>
        </div>
      </div>

      {/* ── Table ── */}
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-4">
        <div className="bg-white rounded-2xl shadow border border-gray-100 overflow-hidden">
          <AffichageFormation
            formations={formationsData}
            onEdit={openModification}
            refreshTrigger={refreshTrigger}
          />
        </div>
      </div>

      {/* ── Modal Réinscription ── */}
      {showReinscription && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-indigo-600 rounded-xl flex items-center justify-center">
                  <FaRedoAlt className="text-white" size={13} />
                </div>
                <h2 className="font-bold text-gray-800">Réinscription CFP</h2>
              </div>
              <button
                onClick={closeReinscription}
                className="w-8 h-8 flex items-center justify-center rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-500 transition text-lg font-bold"
              >
                ×
              </button>
            </div>
            <div className="p-4">
              <ReinscriptionCfp
                show={showReinscription}
                handleclose={closeReinscription}
                initialMatricule={selectedMat}
                onReinscriptionSuccess={handleReinscriptionSuccess}
              />
            </div>
          </div>
        </div>
      )}

      {/* ── Modal Modification ── */}
      <ModificationInscription
        show={showModification}
        handleClose={closeModification}
        personneData={selectedPersonne}
        refreshList={fetchFormations}
      />

      {/* ── Modal Nouvelle Inscription ── */}
      <NouvellePersonne
        show={showPersonne}
        handleClose={() => setShowPersonne(false)}
        refreshList={handleRefresh}
      />
    </div>
  );
};

export default ListeFormation;