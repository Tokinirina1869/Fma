import React, { useState, useEffect } from "react";
import { ArrowLeft, Plus } from "lucide-react";
import AffichageFormation from "../Formation/AffichageFormation";
import NouvellePersonne from "../modals/NouvellePersonne";
import ModificationInscription from "../modals/ModificationInscription";
import axios from "axios";
import { FaGraduationCap } from "react-icons/fa";
import ReinscriptionCfp from "../modals/ReinscriptionCfp";

const url = "https://fma-inscription.onrender.com/api";

const ListeFormation = ({ onViewDashPro }) => {
  const [showPersonne, setShowPersonne] = useState(false);
  const [showModification, setShowModification] = useState(false);
  const [selectedPersonne, setSelectedPersonne] = useState(null);
  const [formationsData, setFormationsData] = useState([]);
  
  const [showReinscription, setShowReinscription] = useState(false);
  const [selectedMat, setSelectedMat] = useState('');
  const [refreshTrigger, setRefreshTrigger] = useState(false);

  const openReinscription = (mat) => {
    setSelectedMat(mat);
    setShowReinscription(true);
  }

  const closeReinscription = () => {
    setShowReinscription(false);
    setSelectedMat('');
  }

  const handleReinscriptionSuccess = (data) => {
      console.log('Réinscription réussie !', data);
      closeReinscription();
      // Optionnel : rafraîchir la liste des élèves
      setRefreshTrigger(prev => !prev);
  };
  
  const handleRefresh = () => {
      setRefreshTrigger(prev => !prev);
  };

  const openNewPersonne = () => setShowPersonne(true);
  const closeNewPersonne = () => setShowPersonne(false); 

  const openModification = (personne) => {
    setSelectedPersonne(personne);
    setShowModification(true);
  };
  const closeModification = () => {
    setShowModification(false);
    setSelectedPersonne(null);
  };

  const fetchFormations = async () => {
    try {
      const response = await axios.get(`${url}/inscriptionComplete`); 
      
      if (response.data && response.data.data) {
        setFormationsData(response.data.data); 
      } else {
        setFormationsData([]);
      }
    } catch (err) {
      console.error("Erreur chargement formations :", err);
    }
  };

  // Charger toutes les données au démarrage
  useEffect(() => {
    fetchFormations();
  }, []);

  return (
    <div className="mt-5 flex flex-col min-h-screen">

      <div className="shadow p-4 md:p-6 flex items-center justify-between">
        <button onClick={onViewDashPro} className="p-2 rounded-full hover:bg-gray-100">
          <ArrowLeft className="w-8 h-8 text-indigo-600" />
        </button>

        <div className="flex items-center text-xl md:text-2xl font-bold space-x-3 mb-6">
          <FaGraduationCap className="w-8 h-8 text-indigo-600" />
          <h5 className="font-bold">Centre de la Formation Professionnelle FMA Laura Vicuna Anjarasoa Ankofafa</h5>
        </div>

        <button onClick={openNewPersonne} className="flex items-center gap-1 px-2 py-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700">
          <Plus className="w-4 h-4" />
          Nouvelle Inscription
        </button>
        <button onClick={() => openReinscription('N* matricule')} className="flex items-center gap-1 px-2 py-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700">
          <Plus className="w-4 h-4" />
          Réinscription
        </button>
      </div>

      {showReinscription && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
            <div className="bg-white rounded-lg p-4 max-w-3xl w-full overflow-y-auto">
                <ReinscriptionCfp
                    show={showReinscription}
                    handleclose={closeReinscription}
                    initialMatricule={selectedMat}
                    onReinscriptionSuccess={handleReinscriptionSuccess}
                />
            </div>
        </div>
      )}

      <div className="p-4 md:p-6 flex-1">
        {/* Passer les données mises à jour et la fonction d'édition */}
        <AffichageFormation formations={formationsData} onEdit={openModification} refreshTrigger={refreshTrigger}/>
      </div>

      <ModificationInscription 
        show={showModification} 
        handleClose={closeModification} 
        personneData={selectedPersonne} 
        refreshList={fetchFormations}
      />

      <NouvellePersonne 
        show={showPersonne}  
        handleClose={closeNewPersonne}
        refreshList={handleRefresh} 
      />
    </div>
  );
};

export default ListeFormation;
