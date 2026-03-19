import React, { useState } from 'react';
import AffichageEleve from '../Académique/AffichageEleve';
import NouvelleInscription from '../modals/NouvelleInscription';
import ReinscriptionLycee from '../modals/ReinscriptionLycee';
import { FaGraduationCap, FaArrowLeft, FaUserPlus, FaRedoAlt } from 'react-icons/fa';
import { Plus, RefreshCw } from 'lucide-react';

const ListeEleve = ({ onViewDash }) => {
    const [showInscription,   setShowInscription]   = useState(false);
    const [showReinscription, setShowReinscription] = useState(false);
    const [selectedMat,       setSelectedMat]       = useState('');
    const [refreshTrigger,    setRefreshTrigger]     = useState(false);

    const openReinscription = (mat) => { setSelectedMat(mat); setShowReinscription(true); };
    const closeReinscription = () => { setShowReinscription(false); setSelectedMat(''); };
    const handleReinscriptionSuccess = (data) => { console.log('Réinscription réussie !', data); closeReinscription(); setRefreshTrigger(p => !p); };
    const handleRefresh = () => setRefreshTrigger(p => !p);

    return (
        <div className="min-h-screen bg-gray-50">

            {/* ── Header bar ── */}
            <div className="border-b border-gray-100 shadow-sm sticky top-0 z-30">
                <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-4">

                    {/* Back button */}
                    <button
                        onClick={onViewDash}
                        className="flex items-center justify-center w-9 h-9 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-600 transition flex-shrink-0"
                        title="Retour au dashboard"
                    >
                        <FaArrowLeft size={14} />
                    </button>

                    {/* Title */}
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center shadow flex-shrink-0">
                            <FaGraduationCap className="text-white" size={16} />
                        </div>
                        <div className="min-w-0">
                            <h1 className="text-base font-extrabold text-gray-800 leading-tight truncate">
                                Lycée Catholique FMA Laura Vicuña
                            </h1>
                            <p className="text-xs text-gray-400 truncate">
                                Anjarasoa Ankofafa — Fianarantsoa
                            </p>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                        {/* Refresh */}
                        <button
                            onClick={handleRefresh}
                            className="flex items-center justify-center w-9 h-9 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-500 transition"
                            title="Actualiser"
                        >
                            <RefreshCw size={14} />
                        </button>

                        {/* Réinscription */}
                        <button
                            onClick={() => openReinscription('26/LYC/87')}
                            className="hidden sm:flex items-center gap-2 px-4 py-2 bg-white border border-indigo-200 text-indigo-600 font-semibold rounded-xl hover:bg-indigo-50 transition text-sm shadow-sm"
                        >
                            <FaRedoAlt size={12} />
                            Réinscription
                        </button>

                        {/* Nouvelle inscription */}
                        <button
                            onClick={() => setShowInscription(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition text-sm shadow"
                        >
                            <Plus size={15} />
                            <span className="hidden sm:inline">Nouvelle Inscription</span>
                            <span className="sm:hidden">Inscrire</span>
                        </button>
                    </div>
                </div>

                {/* Indigo accent line */}
                <div className="h-0.5 bg-gradient-to-r from-indigo-600 via-indigo-400 to-transparent" />
            </div>

            {/* ── Bandeau info ── */}
            <div className="max-w-screen-xl mx-auto px-4 sm:px-6 pt-5 pb-2">
                <div className="bg-indigo-600 rounded-2xl px-5 py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow">
                    <div>
                        <p className="text-white font-bold text-sm">Liste des élèves inscrits</p>
                        <p className="text-indigo-200 text-xs mt-0.5">Gérez, filtrez et exportez les données des élèves</p>
                    </div>
                    {/* Mobile buttons */}
                    <div className="flex sm:hidden items-center gap-2">
                        <button
                            onClick={() => openReinscription('26/LYC/87')}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-white/15 border border-white/25 text-white text-xs font-semibold rounded-xl"
                        >
                            <FaRedoAlt size={10} /> Réinscription
                        </button>
                    </div>
                </div>
            </div>

            {/* ── Table section ── */}
            <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-4">
                <div className="rounded-2xl shadow border border-gray-100 overflow-hidden">
                    <AffichageEleve refreshTrigger={refreshTrigger} />
                </div>
            </div>

            {/* ── Modal Réinscription ── */}
            {showReinscription && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
                    <div className="p-4">
                        <ReinscriptionLycee
                            show={showReinscription}
                            handleclose={closeReinscription}
                            initialMatricule={selectedMat}
                            onReinscriptionSuccess={handleReinscriptionSuccess}
                        />
                    </div>
                </div>
            )}

            {/* ── Modal Nouvelle Inscription ── */}
            <NouvelleInscription
                show={showInscription}
                handleClose={() => setShowInscription(false)}
                refreshList={handleRefresh}
            />
        </div>
    );
};

export default ListeEleve;