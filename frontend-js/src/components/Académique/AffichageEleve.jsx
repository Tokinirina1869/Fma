import React, { useState, useEffect, useMemo, useContext } from "react";
import { FaBookOpen, FaEdit, FaListAlt, FaPen, FaSearch, FaTrash, FaEye, FaIdCard, FaUser, FaBirthdayCake, 
  FaMapMarkerAlt, FaVenusMars, FaHome, FaPhone, FaUserTie, FaUserFriends, FaCalendarAlt, FaGraduationCap, 
  FaClock, FaCamera, FaTimes,FaSchool,FaChalkboardTeacher,FaPrint,FaEnvelope,FaMapPin,FaTransgender,FaCertificate
} from "react-icons/fa";
import { Search, Calendar, RefreshCw, XCircle } from "lucide-react";
import ModificationAcademique from "../modals/ModificationAcademique";
import NouvelleInscription from "../modals/NouvelleInscription";
import Swal from "sweetalert2";
import axios from "axios";
import { ThemeContext } from "../ThemeContext";
import fma from '../../../public/laura.jpg';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import ListeEleves from "./ListeEleves";

const url = 'http://localhost:8000/api';

function AffichageEleve() {
    const [modelUpdate, setModalUpdate] = useState(false);
    const [niveaux, setNiveaux] = useState([]);
    const [selectedPersonne, setSelectedPersonne] = useState(null);
    const [showInscription, setShowInscription] = useState(false);
    const [loading, setLoading] = useState(true);
    const [searchPersonne, setSearchPersonne] = useState(null);
    const [modalDetails, setModalDetails] = useState(false);
    const [modalCarte, setModalCarte] = useState(false);
    const [classe, setClasse] = useState([]);
    const [selectedImage, setSelectedImage] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState("");
    const [activeCategory, setActiveCategory] = useState('Tous');
    const [dateDebut, setDateDebut] = useState("");
    const [dateFin, setDateFin] = useState("");

    const ITEMS_PER_PAGE = 14;
    const { theme } = useContext(ThemeContext);
    
    const isDark = theme === 'dark';

    const closeIncription = () => { 
        setShowInscription(false); 
        setSearchPersonne(null); 
    };

    const openModalUpdate = (p) => {
        setSelectedPersonne(p);
        setModalUpdate(true);
    }

    const closeModalUpdate = () => {
        setModalUpdate(false);
        setSelectedPersonne(null);
    }

    const openDetailsModal = (p) => { 
        setSelectedPersonne(p); 
        setModalDetails(true); 
    };
    const closeDetailsModal = () => { 
        setModalDetails(false); 
        setSelectedPersonne(null); 
    };

    const openCarteModal = (p) => { 
        setSelectedPersonne(p); 
        setModalCarte(true); 
    };
    const closeCarteModal = () => { 
        setModalCarte(false); 
        setSelectedPersonne(null); 
    };

    // MEILLEURE VERSION - Avec gestion d'erreur individuelle
    const fetchAllData = async () => {
        setLoading(true);
        try {
            const [niveauxResponse, classeResponse] = await Promise.allSettled([
                axios.get(`${url}/academique`),
                axios.get(`${url}/niveaux/list`)
            ]);
            
            let hasError = false;
            
            // Traitement niveaux
            if (niveauxResponse.status === 'fulfilled') {
                setNiveaux(niveauxResponse.value.data.data);
            } else {
                console.error("Erreur chargement élèves:", niveauxResponse.reason);
                hasError = true;
            }
            
            // Traitement classe
            if (classeResponse.status === 'fulfilled') {
                setClasse(classeResponse.value.data.data);
            } else {
                console.error("Erreur chargement classe:", classeResponse.reason);
                hasError = true;
            }
            
            // Notification si une des requêtes a échoué
            if (hasError) {
                Swal.fire({
                    icon: 'warning',
                    title: 'Chargement partiel',
                    text: 'Certaines données n\'ont pas pu être chargées.',
                    timer: 3000,
                    showConfirmButton: false,
                    customClass: { popup: isDark ? 'bg-gray-800 text-white' : 'bg-white text-gray-800' }
                });
            }
            
        } catch (err) {
            console.error("Erreur inattendue: ", err);
        } finally {
            setLoading(false);
        }
    };

    // Fonction pour récupérer uniquement les niveaux
    const fetchNiveauxOnly = async () => {
        try {
            const response = await axios.get(`${url}/academique`);
            setNiveaux(response.data.data);
        } catch(err) {
            console.error("Erreur lors de l'affichage: ", err);
            Swal.fire({
                title: 'Erreur',
                text: 'Impossible de charger les données des élèves.',
                icon: 'error',
                customClass: { popup: isDark ? 'bg-gray-800 text-white' : 'bg-white text-gray-800' }
            });
        }
    }

    useEffect(() => {
        fetchAllData();
    }, []);

    const ordreClasse = (nom) => {
        const n = nom.toLowerCase();
        if (n.includes("seconde"))   return 1;
        if (n.includes("première"))  return 2;
        if (n.includes("terminale")) return 3;
        return 4; // autres cas en dernier
    };
      
    // Générer les catégories depuis les classe
    const categories = useMemo(() => {
        const uniqueClasses = [...new Set(classe.map(p => p.nomniveau))];
        const sorted = uniqueClasses.sort((a, b) => {
          const diff = ordreClasse(a) - ordreClasse(b);
          if (diff !== 0) return diff;
          return a.localeCompare(b); // à même niveau (ex: Seconde A vs Seconde B), tri alphabétique
        });
        return ['Tous', ...sorted];
    }, [classe]);

    const handleSearchByDate = async () => {
        if (!dateDebut || !dateFin) {
            Swal.fire({
                icon: 'warning',
                title: 'Attention',
                text: 'Veuillez sélectionner les deux dates pour filtrer.',
                background: '#1e1e2f',
                color: 'white'
            });
            return;
        }

        setLoading(true);
        try {
            const response = await axios.get(`${url}/filterDate`, {
                params: { date_debut: dateDebut, date_fin: dateFin },
            });
            setNiveaux(response.data.data);
            setCurrentPage(1);
            setActiveCategory("Tous");
            
            Swal.fire({
                icon: 'success',
                title: 'Succès',
                text: `Filtrage effectué : ${response.data.data?.length || 0} résultats.`,
                background: '#1e1e2f',
                color: 'white',
                timer: 2000,
                showConfirmButton: false,
                position: "center",
            });
        } catch (error) {
            console.error("Erreur de recherche:", error);
            Swal.fire({
                title: 'Erreur',
                text: 'Impossible de filtrer les données.',
                icon: 'error',
                customClass: { popup: isDark ? 'bg-gray-800 text-white' : 'bg-white text-gray-800' }
            });
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = (inscrit) => {
        Swal.fire({
            title: 'Êtes-vous sûr ?',
            text: "Cette action est irréversible !",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Oui, supprimer !',
            cancelButtonText: 'Annuler',
            customClass: {
                popup: isDark ? 'bg-gray-800 text-white' : 'bg-white text-gray-800',
                confirmButton: 'bg-indigo-600',
                cancelButton: 'bg-red-600',
            }
        }).then((result) => {
            if (result.isConfirmed) {
                axios.delete(`${url}/deleteacademique/${inscrit.no_inscrit}`)
                    .then(() => {
                        Swal.fire({
                            title: 'Suppression réussite !',
                            text: `Une élève n°${inscrit.matricule} a été supprimée.`,
                            icon: 'success',
                            background: '#1e1e2f',
                            color: 'white'
                        });
                        setNiveaux(prev => prev.filter(n => n.no_inscrit !== inscrit.no_inscrit));
                    })
                    .catch(err => {
                        console.error(err);
                        Swal.fire({
                            title: 'Erreur !',
                            text: 'Impossible de supprimer cet élève.',
                            icon: 'error',
                            customClass: { popup: isDark ? 'bg-gray-800 text-white' : 'bg-white text-gray-800' }
                        });
                    });
            }
        });
    };

    const handleSearchClass = async (classe) => {
        setActiveCategory(classe);
        setCurrentPage(1);

        if (classe === "Tous") {
            fetchNiveauxOnly();
            return;
        }

        try {
            const res = await axios.get(`${url}/searchClasse/${classe}`);
            setNiveaux(res.data.data);
        } catch (err) {
            console.error("Erreur lors du filtrage par classe:", err);
            Swal.fire({
                title: 'Erreur',
                text: 'Impossible de filtrer par classe.',
                icon: 'error',
                customClass: { popup: isDark ? 'bg-gray-800 text-white' : 'bg-white text-gray-800' }
            });
        }
    }

    const filterEleves = (elevesList, query, category, annee) => {
        return elevesList.filter(eleve => {
            const q = query.toLowerCase().trim();
            
            const matchText = !q || 
                (String(eleve.inscription?.personne?.matricule || '').toLowerCase().includes(q)) ||
                (String(eleve.inscription?.personne?.nom || '').toLowerCase().includes(q)) ||
                (String(eleve.inscription?.personne?.prenom || '').toLowerCase().includes(q)) ||
                (String(eleve.inscription?.personne?.cin || '').toLowerCase().includes(q)) ||
                (String(eleve.no_inscrit || '').toLowerCase().includes(q));

            if (!matchText) return false;

            if (category && category !== "Tous") {
                const hasMatchingClasse = eleve.niveau?.nomniveau === category;
                if (!hasMatchingClasse) return false;
            }

            if(annee && eleve.inscription?.anneesco !== annee) return false;

            return true;
        });
    };

    const filteredEleves = useMemo(() => {
        return filterEleves(niveaux, searchQuery, activeCategory);
    }, [niveaux, searchQuery, activeCategory]);

    const totalPages = Math.ceil(filteredEleves.length / ITEMS_PER_PAGE);
    // const currentData = filteredEleves.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

    const goToPage = (page) => {
        if (page >= 1 && page <= totalPages) setCurrentPage(page);
    };

    const handleExportCarte = async () => {
        if (!selectedPersonne) return;
        
        // Créer un élément temporaire pour le rendu PDF
        const element = document.createElement('div');
        element.style.position = 'absolute';
        element.style.left = '-9999px';
        element.style.width = '400px'; // Largeur de la carte
        element.style.padding = '20px';
        element.style.backgroundColor = 'white';
        element.style.fontFamily = 'Arial, sans-serif';
        
        // Formater la date
        const formatDate = (dateStr) => {
          if (!dateStr) return "Non renseigné";
          try {
            const date = new Date(dateStr);
            return date.toLocaleDateString('fr-FR', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric'
            });
          } catch {
            return dateStr;
          }
        };
        
        // HTML de la carte étudiante
        element.innerHTML = `
          <div style="border: 2px solid #4f46e5; border-radius: 10px; overflow: hidden;">
            <!-- En-tête -->
            <div style="background: linear-gradient(to right, #4f46e5, #7c3aed); color: white; padding: 15px; text-align: center;">
              <div style="display: flex; align-items: center; justify-content: center; margin-bottom: 8px;">
                <div style="width: 40px; height: 40px; background: white; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                  <img src="${fma}" alt="FMA" style="width: 30px; height: 30px; border-radius: 50%;" />
                </div>
                <div style="margin: 0 10px;">
                  <h3 style="margin: 0; font-size: 14px; font-weight: bold;">CFP LAURA VICUNA</h3>
                  <p style="margin: 0; font-size: 10px; opacity: 0.9;">ANJARASOA Anjarasoa Ankofafa</p>
                </div>
                <div style="width: 40px; height: 40px; background: white; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                  <span style="color: #4f46e5; font-size: 18px;">🎓</span>
                </div>
              </div>
              <p style="margin: 0; font-size: 11px; font-weight: bold;">LYCEE CATHOLIQUE Laura Vicuna</p>
              <p style="margin: 0; font-size: 10px; opacity: 0.9;">FMA Anjarasoa Ankofafa Fianarantsoa</p>
            </div>
      
            <!-- Photo et infos principales -->
            <div style="padding: 15px;">
              <div style="display: flex; align-items: center; gap: 15px; margin-bottom: 15px;">
                <!-- Photo -->
                <div style="flex-shrink: 0;">
                  <div style="width: 80px; height: 80px; background: #f3f4f6; border-radius: 8px; border: 2px solid #4f46e5; overflow: hidden; display: flex; align-items: center; justify-content: center;">
                    ${selectedPersonne.inscription?.personne?.photo ? 
                      `<img src="http://localhost:8000/storage/${selectedPersonne.inscription.personne.photo}" 
                           alt="Photo" 
                           style="width: 100%; height: 100%; object-fit: cover;" />` : 
                      '<span style="color: #9ca3af; font-size: 24px;">👤</span>'}
                  </div>
                </div>
                
                <!-- Informations principales -->
                <div style="flex-grow: 1;">
                  <h2 style="margin: 0 0 5px 0; font-size: 16px; font-weight: bold; color: #1f2937;">
                    ${selectedPersonne.inscription?.personne?.nom} ${selectedPersonne.inscription?.personne?.prenom}
                  </h2>
                  <div style="display: flex; align-items: center; margin-bottom: 3px;">
                    <span style="color: #ec4899; margin-right: 5px;">⚤</span>
                    <span style="font-size: 12px; color: #4b5563;">
                      Sexe: <b>${selectedPersonne.inscription?.personne?.sexe || "Non spécifié"}</b>
                    </span>
                  </div>
                  ${selectedPersonne.parcours && selectedPersonne.parcours.length > 0 ? `
                    <div style="display: flex; align-items: center;">
                      <span style="color: #10b981; margin-right: 5px;">📚</span>
                      <span style="font-size: 12px; color: #4b5563;">
                        Classe : <b>${selectedPersonne.niveau?.nomniveau}</b>
                      </span>
                    </div>
                  ` : ''}
                </div>
              </div>
      
              <!-- Informations détaillées -->
              <div style="border-top: 1px solid #e5e7eb; padding-top: 10px;">
                <!-- Matricule -->
                <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                  <span style="font-size: 11px; font-weight: bold; color: #4b5563;">Numero Matricule:</span>
                  <span style="font-size: 11px; font-weight: bold; color: #1f2937;">
                    ${selectedPersonne.inscription?.personne?.matricule || 'N/A'}
                  </span>
                </div>
                
                <!-- Date de naissance -->
                <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                  <span style="font-size: 11px; font-weight: bold; color: #4b5563;">Date de Naissance:</span>
                  <span style="font-size: 11px; font-weight: bold; color: #1f2937;">
                    ${formatDate(selectedPersonne.inscription?.personne?.naiss)}
                  </span>
                </div>
                
                <!-- Lieu de naissance -->
                ${selectedPersonne.inscription?.personne?.lieunaiss ? `
                  <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                    <span style="font-size: 11px; font-weight: bold; color: #4b5563;">Lieu de Naissance:</span>
                    <span style="font-size: 11px; color: #1f2937; text-align: right;">
                      ${selectedPersonne.inscription.personne.lieunaiss}
                    </span>
                  </div>
                ` : ''}
                
                <!-- CIN -->
                ${selectedPersonne.inscription?.personne?.cin ? `
                  <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                    <span style="font-size: 11px; font-weight: bold; color: #4b5563;">CIN:</span>
                    <span style="font-size: 11px; font-weight: bold; color: #1f2937;">
                      ${selectedPersonne.inscription.personne.cin || "Mineur"}
                    </span>
                  </div>
                ` : ''}
                
                <!-- Formation -->
                <div style="display: flex; justify-content: space-between; margin-bottom: 8px; background: linear-gradient(to right, #e0e7ff, #ede9fe); padding: 8px; border-radius: 5px;">
                  <span style="font-size: 11px; font-weight: bold; color: #4f46e5;">Classe:</span>
                  <span style="font-size: 11px; font-weight: bold; color: #4f46e5;">
                    ${selectedPersonne.niveau?.nomniveau}
                  </span>
                </div>
                
                <!-- Date d'expiration -->
                <div style="display: flex; justify-content: space-between; margin-top: 10px; padding-top: 10px; border-top: 1px dashed #d1d5db;">
                  <span style="font-size: 11px; font-weight: bold; color: #4b5563;">Expire le:</span>
                  <span style="font-size: 11px; font-weight: bold; color: #dc2626;">
                    ${(() => {
                      if (selectedPersonne.inscription?.dateinscrit) {
                        const date = new Date(selectedPersonne.inscription.dateinscrit);
                        date.setFullYear(date.getFullYear() + 1);
                        return date.toLocaleDateString('fr-FR');
                      }
                      return "31/08/2024";
                    })()}
                  </span>
                </div>
              </div>
            </div>
      
            <!-- Pied de page -->
            <div style="background: #f9fafb; padding: 12px; border-top: 1px solid #e5e7eb; text-align: center;">
              <p style="margin: 0 0 5px 0; font-size: 10px; font-weight: bold; color: #4b5563;">
                Lycee Catholique Laura Vicuna Anjarasoa
              </p>
              <div style="display: flex; justify-content: space-between; font-size: 9px; color: #6b7280;">
                <span>Tél: +261 38 29 112 335</span>
                <span>Ankofafa Fianarantsoa</span>
              </div>
              <p style="margin: 10px 0 0 0; font-size: 9px; color: #6b7280; font-style: italic;">
                Carte valable pour l'année scolaire ${selectedPersonne.inscription?.anneesco || '2023-2024'}
              </p>
            </div>
          </div>
        `;
        
        // Ajouter au DOM
        document.body.appendChild(element);
        
        try {
          // Utiliser html2canvas pour capturer l'élément
          const canvas = await html2canvas(element, {
            scale: 2, // Haute résolution pour un PDF de qualité
            useCORS: true, // Autoriser les images cross-origin
            backgroundColor: '#ffffff'
          });
          
          // Créer le PDF
          const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a6' // Format carte (105mm × 148mm)
          });
          
          // Ajouter l'image au PDF
          const imgData = canvas.toDataURL('image/png');
          const imgWidth = 105; // Largeur A6 en mm
          const imgHeight = (canvas.height * imgWidth) / canvas.width;
          
          pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
          
          // Télécharger le PDF
          const fileName = `Carte-etudiant-${selectedPersonne.inscription?.personne?.matricule || 'sans-matricule'}.pdf`;
          pdf.save(fileName);
          
          // Afficher un message de succès
          Swal.fire({
            icon: 'success',
            title: 'PDF généré avec succès !',
            text: `La carte de ${selectedPersonne.inscription?.personne?.nom} a été exportée.`,
            background: isDark ? '#1e1e2f' : '#fff',
            color: isDark ? 'white' : 'black',
            timer: 2000,
            showConfirmButton: false,
            position: "center"
          });
          
        } catch (error) {
          console.error('Erreur lors de la génération du PDF:', error);
          Swal.fire({
            icon: 'error',
            title: 'Erreur',
            text: 'Impossible de générer le PDF. Veuillez réessayer.',
            customClass: { popup: isDark ? 'bg-gray-800 text-white' : 'bg-white text-gray-800' }
          });
        } finally {
          // Nettoyer: supprimer l'élément temporaire
          document.body.removeChild(element);
        }
      };

    // Fonction de rafraîchissement
    const refreshData = () => {
        fetchAllData();
    };

    return (
        <div className="p-4 sm:p-8 min-h-screen ">
            
            {/* --- EN-TÊTE ET STATISTIQUES --- */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 pb-4 border-b border-indigo-200/50">
                <div className="flex items-center">
                    <FaListAlt className="w-8 h-8 text-indigo-500 mr-3" />
                    <h2 className='text-3xl font-extrabold '>Liste des Élèves Inscrits</h2>
                </div>
                <div className="flex items-center gap-4">
                    <p className={`text-xl font-semibold mt-4 sm:mt-0 px-4 py-2 rounded-full ${isDark ? 'bg-indigo-700 text-white' : 'bg-indigo-100 text-indigo-700'}`}>
                        Total: <b className="text-lg">{filteredEleves.length}</b> élèves
                    </p>
                    <button
                        onClick={refreshData}
                        disabled={loading}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition ${
                            loading 
                                ? 'bg-gray-400 cursor-not-allowed' 
                                : 'bg-green-600 hover:bg-green-700 text-white'
                        }`}
                    >
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                        {loading ? 'Chargement...' : 'Rafraîchir'}
                    </button>
                </div>
            </div>

            <div className='shadow-xl rounded-xl p-6 mb-8 border transition duration-300'>
                
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 items-end mb-6">
                    
                    <div className="relative lg:col-span-1">
                        <Search className='absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5' />
                        <input 
                            type="text"  
                            placeholder="Nom, Matricule, CIN, N° Insc..." 
                            value={searchQuery} 
                            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                            className={`w-full pl-10 pr-4 py-3 rounded-lg focus:ring-indigo-500 focus:border-indigo-500`}
                        />
                    </div>

                    <div className="lg:col-span-2 flex flex-col sm:flex-row items-stretch gap-3">
                        <div className="flex items-center gap-2">
                            <Calendar className={`w-5 h-5`} />
                            <label className={`text-sm font-medium `}>Du:</label>
                            <input type="date" value={dateDebut}
                                onChange={(e) => setDateDebut(e.target.value)}
                                className={`w-full border rounded-lg p-2 focus:ring-indigo-500 focus:border-indigo-500 `}
                            />
                        </div>

                        <div className="flex items-center gap-2">
                            <label className={`text-sm font-medium`}>Au:</label>
                            <input type="date" value={dateFin}
                                onChange={(e) => setDateFin(e.target.value)}
                                className={`w-full border rounded-lg p-2 focus:ring-indigo-500 focus:border-indigo-500`}
                            />
                        </div>
                    </div>
                    
                    <div className="lg:col-span-1 flex gap-3">
                        <button onClick={handleSearchByDate} disabled={loading} 
                            className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 text-white rounded-lg shadow font-semibold transition duration-200 ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'}`}>
                            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <FaSearch className="w-4 h-4" />}
                            {loading ? 'Chargement...' : 'Recherche entre deux Date'}
                        </button>
                        
                    </div>
                </div>
                <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-gray-100 dark:border-gray-700/50">

                    {/* Label */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                        <FaSchool className="w-4 h-4 text-indigo-500" />
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400 hidden sm:inline">
                        Filtre par Classe
                        </span>
                    </div>

                    {/* Séparateur vertical */}
                    <div className="hidden sm:block w-px h-5 bg-gray-200 dark:bg-gray-700" />

                    {/* Boutons */}
                    <div className="flex flex-wrap gap-2">
                        {categories.map(key => (
                        <button
                            key={key}
                            onClick={() => handleSearchClass(key)}
                            className={`
                            px-3.5 py-1.5 rounded-full text-sm font-medium
                            border transition-all duration-150
                            ${activeCategory === key
                                ? 'bg-indigo-600 text-white border-transparent shadow-sm shadow-indigo-300 dark:shadow-indigo-900'
                                : isDark
                                ? 'bg-transparent text-gray-300 border-gray-600 hover:bg-gray-700 hover:border-gray-500'
                                : 'bg-transparent text-gray-600 border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                            }
                            `}
                        >
                            {key}
                        </button>
                        ))}
                    </div>
                </div>
            </div>

            <ListeEleves
                eleves={filteredEleves}
                onDetails={(e)      => openDetailsModal(e)}
                onCarte={(e)        => openCarteModal(e)}
                onEdit={(e)         => openModalUpdate(e)}
                onDelete={(e)       => handleDelete(e)}
                onPhotoClick={(url) => setSelectedImage(url)}
            />

            {/* --- PAGINATION --- */}
            {totalPages > 1 && (
                <div className={`flex justify-between items-center px-4 py-3 border-t mt-6 rounded-xl shadow-lg`}>
                    <button onClick={() => goToPage(currentPage - 1)} disabled={currentPage === 1}
                        className={`flex items-center gap-2 px-3 py-1 font-bold rounded-lg transition duration-200 disabled:opacity-50 ${isDark ? 'bg-indigo-700 text-white hover:bg-indigo-600' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}>
                        Précédent
                    </button>
                    <span className={`text-sm`}>Page {currentPage} sur {totalPages}</span>
                    <button onClick={() => goToPage(currentPage + 1)} disabled={currentPage === totalPages}
                        className={`flex items-center gap-2 px-3 py-1 font-bold rounded-lg transition duration-200 disabled:opacity-50 ${isDark ? 'bg-indigo-700 text-white hover:bg-indigo-600' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}>
                        Suivant
                    </button>
                </div>
            )}

            {/* MODALE PHOTO ZOOM */}
            {selectedImage && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100]"
                    onClick={() => setSelectedImage(null)}>
                    <div className="bg-white p-6 rounded-xl shadow-2xl max-w-lg mx-4" onClick={(e) => e.stopPropagation()}>
                        <img src={selectedImage} alt="Zoom Photo d'identité" className="rounded-lg w-full h-auto object-cover max-h-[80vh]" />
                        <p className="text-center text-gray-600 mt-3 font-medium">Photo d'identité (Cliquez en dehors pour fermer)</p>
                    </div>
                </div>
            )}

            {/* MODALE CARTE ÉTUDIANT AMÉLIORÉE */}
            {modalCarte && selectedPersonne && (
                <div className="fixed inset-0 z-[10000] flex items-center justify-center backdrop-blur-sm transition-all duration-300 bg-black/40 dark:bg-black/60"
                    onClick={closeCarteModal}>
                    <div className={`rounded-xl shadow-2xl max-w-xl lg:max-w-xl w-full mx-4 max-h-[90vh] overflow-y-auto print:shadow-none print:mx-0 print:max-w-none ${isDark ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'}`} onClick={(e) => e.stopPropagation()}>
                        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-6 text-center print:bg-blue-600">
                            <div className="mb-4">
                                <div className="w-16 h-16 bg-white rounded-full mx-auto flex items-center justify-center mb-2 print:bg-white">
                                    <FaSchool className="w-8 h-8 text-blue-600 print:text-blue-600" />
                                </div>
                                <h3 className="text-lg font-bold">LYCEE CATHOLIQUE LAURA VICUNA</h3>
                                <p className="text-sm opacity-90">Anjarasoa Ankofafa Fianarantsoa</p>
                            </div>
                        </div>

                        {/* Corps de la carte */}
                        <div className="p-6">
                            {/* Photo et informations principales */}
                            <div className="flex items-center gap-4 mb-6">
                                <div className="flex-shrink-0">
                                    <div className="w-20 h-20 rounded-full border-4 border-indigo-500 overflow-hidden bg-gray-200 flex items-center justify-center print:border-indigo-500">
                                        {selectedPersonne.inscription?.personne?.photo ? (
                                            <img
                                                src={`http://localhost:8000/storage/${selectedPersonne.inscription.personne.photo}`}
                                                alt="Photo étudiant"
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <FaUser className="w-10 h-10 text-gray-400" />
                                        )}
                                    </div>
                                </div>
                                <div className="flex-1">
                                    <h4 className="text-xl font-bold mb-1">
                                        {selectedPersonne.inscription?.personne?.nom} {selectedPersonne.inscription?.personne?.prenom}
                                    </h4>
                                    <p className="text-sm opacity-75 flex items-center gap-1">
                                        <FaGraduationCap className="w-3 h-3" />
                                        Élève - {selectedPersonne.niveau?.nomniveau || "2025-2026"}
                                    </p>
                                </div>
                            </div>

                            {/* Informations détaillées */}
                            <div className="space-y-3">
                                <InfoCardRow 
                                    icon={<FaIdCard className="text-blue-500" />}
                                    label="Matricule"
                                    value={selectedPersonne.inscription?.personne?.matricule}
                                    valueClass="text-indigo-600 font-bold"
                                />
                                
                                <InfoCardRow 
                                    icon={<FaUser className="text-green-500" />}
                                    label="Nom"
                                    value={selectedPersonne.inscription?.personne?.nom}
                                />
                                
                                <InfoCardRow 
                                    icon={<FaUser className="text-purple-500" />}
                                    label="Prénom(s)"
                                    value={selectedPersonne.inscription?.personne?.prenom}
                                />
                                
                                <InfoCardRow 
                                    icon={<FaBirthdayCake className="text-pink-500" />}
                                    label="Date de naissance"
                                    value={selectedPersonne.inscription?.personne?.naiss}
                                />
                                
                                <InfoCardRow 
                                    icon={<FaMapPin className="text-red-500" />}
                                    label="Lieu de naissance"
                                    value={selectedPersonne.inscription?.personne?.lieunaiss}
                                />
                                
                                <InfoCardRow 
                                    icon={<FaTransgender className="text-teal-500" />}
                                    label="Sexe"
                                    value={selectedPersonne.inscription?.personne?.sexe}
                                />
                                
                                <InfoCardRow 
                                    icon={<FaCertificate className="text-orange-500" />}
                                    label="N CIN"
                                    value={selectedPersonne.inscription?.personne?.cin}
                                />
                                
                                <div className="flex justify-between items-center py-2 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900 dark:to-purple-900 rounded-lg px-3 mt-4">
                                    <span className="font-semibold flex items-center gap-2 text-white">
                                        <FaChalkboardTeacher className="text-indigo-500" />
                                        Classe:
                                    </span>
                                    <span className="bg-indigo-500 text-white px-3 py-1 rounded font-bold">
                                        {selectedPersonne.niveau?.nomniveau || "---"}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Pied de la carte */}
                        <div className="bg-gray-100 dark:bg-gray-700 p-4 text-center border-t">
                            <p className="text-sm text-gray-600 dark:text-gray-300 flex items-center justify-center gap-2">
                                <FaCalendarAlt className="w-3 h-3" />
                                Carte valable pour l'année scolaire {selectedPersonne.inscription?.anneesco}
                            </p>
                        </div>

                        {/* Boutons d'action */}
                        <div className="p-4 flex justify-center gap-3 print:hidden">
                            <button 
                                onClick={handleExportCarte}
                                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold flex items-center gap-2"
                            >
                                <FaPrint className="w-4 h-4" />
                                Imprimer
                            </button>
                            <button 
                                onClick={closeCarteModal}
                                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition font-semibold flex items-center gap-2"
                            >
                                <FaTimes className="w-4 h-4" />
                                Fermer
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* MODALE DÉTAILS PROFESSIONNELLE */}
            {modalDetails && selectedPersonne && (
                <div
                    className="fixed inset-0 z-[10000] flex items-center justify-center transition-all duration-300 bg-black/40 dark:bg-black/60"
                    onClick={closeDetailsModal}
                >
                    <div
                        className="rounded-xl shadow-2xl max-w-6xl w-full max-h-[95vh] overflow-hidden flex flex-col
                                bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-200"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* En-tête */}
                        <div
                            className="flex justify-between items-center p-6 border-b
                                    border-gray-200/50 dark:border-gray-700/50
                                    bg-gradient-to-r from-blue-600 to-indigo-700
                                    dark:from-gray-800 dark:to-gray-700 text-white"
                        >
                            <div className="flex items-center gap-3">
                                <FaUser className="w-6 h-6" />
                                <h3 className="text-2xl font-bold">Fiche Personnelle</h3>
                            </div>
                            <button
                                onClick={closeDetailsModal}
                                className="text-white hover:text-gray-200 dark:hover:text-gray-300 text-2xl transition"
                            >
                                <FaTimes className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Corps */}
                        <div className="flex-1 overflow-y-auto dark:bg-gray-900">
                            <div className="p-6">
                                {/* En-tête avec photo et infos principales */}
                                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700 rounded-xl p-6 mb-6 border border-gray-200 dark:border-gray-600">
                                    <div className="flex flex-col md:flex-row items-center gap-6">
                                        {/* Photo */}
                                        <div className="relative group">
                                            <div
                                                className="w-28 h-28 rounded-full border-4 border-white shadow-lg
                                                        dark:bg-gray-600 flex items-center justify-center
                                                        bg-white dark:border-gray-500"
                                            >
                                                {selectedPersonne.inscription?.personne?.photo ? (
                                                    <img
                                                        src={`http://localhost:8000/storage/${selectedPersonne.inscription.personne.photo}`}
                                                        alt="Photo de profil"
                                                        className="w-full h-full object-cover cursor-pointer rounded-full"
                                                        onClick={() =>
                                                            setSelectedImage(
                                                                `http://localhost:8000/storage/${selectedPersonne.inscription.personne.photo}`
                                                            )
                                                        }
                                                    />
                                                ) : (
                                                    <FaUser className="w-12 h-12 text-gray-400 dark:text-gray-300" />
                                                )}
                                            </div>
                                            <div
                                                className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 rounded-full
                                                        transition-all duration-200 flex items-center justify-center opacity-0
                                                        group-hover:opacity-100 cursor-pointer"
                                            >
                                                <FaCamera className="text-white text-lg" />
                                            </div>
                                        </div>

                                        {/* Infos principales */}
                                        <div className="flex-1 text-center md:text-left">
                                            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
                                                {selectedPersonne.inscription?.personne?.nom} {selectedPersonne.inscription?.personne?.prenom}
                                            </h2>
                                            <div className="flex flex-wrap gap-4 mt-2 justify-center  md:justify-center text-sm text-gray-600 dark:text-gray-300">
                                                <div className="flex items-center gap-2">
                                                    <FaIdCard className="text-blue-600" />
                                                    <span>Matricule: {selectedPersonne.inscription?.personne?.matricule || 'N/A'}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <FaVenusMars className="text-pink-600" />
                                                    <span>{selectedPersonne.inscription?.personne?.sexe || 'Non spécifié'}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <FaGraduationCap className="text-green-600" />
                                                    <span>Inscription: {selectedPersonne.no_inscrit || 'N/A'}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Grille des sections */}
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                    
                                    {/* Section 1: Informations Personnelles */}
                                    <div className="dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                                        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-t-xl p-4">
                                            <div className="flex items-center gap-3 text-white">
                                                <FaUser className="w-5 h-5" />
                                                <h4 className="font-semibold text-lg">Informations Personnelles</h4>
                                            </div>
                                        </div>
                                        <div className="p-4 space-y-4">
                                            <InfoRow
                                                icon={<FaIdCard className="text-blue-500" />}
                                                label="CIN"
                                                value={selectedPersonne.inscription?.personne?.cin || "Mineur"}
                                            />
                                            <InfoRow
                                                icon={<FaCalendarAlt className="text-green-500" />}
                                                label="Délivré le"
                                                value={selectedPersonne.inscription?.personne?.datedel || "Pas de CIN"}
                                            />
                                            <InfoRow
                                                icon={<FaBirthdayCake className="text-purple-500" /> || "Pas de CIN"}
                                                label="Date de Naissance"
                                                value={selectedPersonne.inscription?.personne?.naiss}
                                            />
                                            <InfoRow
                                                icon={<FaMapMarkerAlt className="text-red-500" />}
                                                label="Lieu de Naissance"
                                                value={selectedPersonne.inscription?.personne?.lieunaiss}
                                            />
                                            <InfoRow
                                                icon={<FaHome className="text-orange-500" />}
                                                label="Adresse Actuelle"
                                                value={selectedPersonne.inscription?.personne?.adresse}
                                            />
                                        </div>
                                    </div>

                                    {/* Section 2: Informations Parentales */}
                                    <div className="dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                                        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-t-xl p-4">
                                            <div className="flex items-center gap-3 text-white">
                                                <FaUserFriends className="w-5 h-5" />
                                                <h4 className="font-semibold text-lg">Informations Parentales</h4>
                                            </div>
                                        </div>
                                        <div className="p-4 space-y-4">
                                            <InfoRow
                                                icon={<FaUserTie className="text-blue-500" />}
                                                label="Fils"
                                                value={selectedPersonne.inscription?.personne?.nompere}
                                            />
                                            <InfoRow
                                                icon={<FaUserFriends className="text-pink-500" />}
                                                label="Fille de"
                                                value={selectedPersonne.inscription?.personne?.nommere}
                                            />
                                            <InfoRow
                                                icon={<FaPhone className="text-green-500" />}
                                                label="Téléphone"
                                                value={selectedPersonne.inscription?.personne?.phoneparent}
                                            />
                                            <InfoRow
                                                icon={<FaUserTie className="text-orange-500" />}
                                                label="Nom du Tuteur"
                                                value={selectedPersonne.inscription?.personne?.nomtuteur}
                                            />
                                            <InfoRow
                                                icon={<FaPhone className="text-red-500" />}
                                                label="Téléphone Tuteur"
                                                value={selectedPersonne.inscription?.personne?.phonetuteur}
                                            />
                                            <InfoRow
                                                icon={<FaHome className="text-blue-500" />}
                                                label="Adresse Parent"
                                                value={selectedPersonne.inscription?.personne?.adressparent}
                                            />
                                            <InfoRow
                                                icon={<FaHome className="text-green-500" />}
                                                label="Adresse Tuteur"
                                                value={selectedPersonne.inscription?.personne?.adresstuteur}
                                            />
                                        </div>
                                    </div>

                                    {/* Section 3: Informations d'Inscription */}
                                    <div className="dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                                        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-t-xl p-4">
                                            <div className="flex items-center gap-3 text-white">
                                                <FaGraduationCap className="w-5 h-5" />
                                                <h4 className="font-semibold text-lg">Inscription & Classe</h4>
                                            </div>
                                        </div>
                                        <div className="p-4 space-y-4">
                                            <InfoRow
                                                icon={<FaIdCard className="text-purple-500" />}
                                                label="N° Inscription"
                                                value={selectedPersonne.no_inscrit}
                                            />
                                            <InfoRow
                                                icon={<FaCalendarAlt className="text-blue-500" />}
                                                label="Date d'Inscription"
                                                value={selectedPersonne.inscription?.dateinscrit}
                                            />
                                            <InfoRow
                                                icon={<FaGraduationCap className="text-green-500" />}
                                                label="Année Scolaire"
                                                value={selectedPersonne.inscription?.anneesco}
                                            />
                                            <InfoRow
                                                icon={<FaClock className="text-orange-500" />}
                                                label="Type d'inscription"
                                                value={selectedPersonne.type_inscrit || "Non spécifié"}
                                            />

                                            {/* Formation actuelle */}
                                            <div className="pt-2">
                                                <div className="flex items-center gap-2 mb-3">
                                                    <FaChalkboardTeacher className="text-indigo-500" />
                                                    <span className="font-semibold text-sm text-gray-700 dark:text-gray-300">Classe Actuelle</span>
                                                </div>
                                                <div className="bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900 dark:to-purple-900 border border-indigo-200 dark:border-indigo-700 text-gray-700 dark:text-gray-200 px-3 py-3 rounded-lg flex items-center gap-3">
                                                    <FaSchool className="w-4 h-4 text-indigo-500" />
                                                    <span className="text-sm font-medium">{selectedPersonne.niveau?.nomniveau || "Non assigné"}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Pied de page */}
                        <div
                            className="flex justify-end gap-3 p-6 border-t
                                    border-gray-200/50 dark:border-gray-700/50
                                    bg-gray-50 dark:bg-gray-800"
                        >
                            <button
                                onClick={() => {
                                    openModalUpdate(selectedPersonne);
                                    closeDetailsModal();
                                }}
                                className="px-6 py-2 bg-blue-600 dark:bg-blue-500 text-white
                                        rounded-lg hover:bg-blue-700 dark:hover:bg-blue-400
                                        transition font-semibold flex items-center gap-2 shadow-sm"
                            >
                                <FaEdit className="w-4 h-4" />
                                Modifier
                            </button>

                            <button
                                onClick={closeDetailsModal}
                                className="px-6 py-2 bg-gray-500 dark:bg-gray-600 text-white
                                        rounded-lg hover:bg-gray-600 dark:hover:bg-gray-500
                                        transition font-semibold flex items-center gap-2 shadow-sm"
                            >
                                <FaTimes className="w-4 h-4" />
                                Fermer
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <ModificationAcademique show={modelUpdate} handleClose={closeModalUpdate} selectedPersonne={selectedPersonne}/>
            <NouvelleInscription show={showInscription} handleClose={closeIncription} searchEleve={searchPersonne} refreshList={fetchNiveauxOnly} />
        </div>
    );
}

// Composant InfoRow pour la carte
const InfoCardRow = ({ icon, label, value, valueClass = "" }) => (
    <div className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-600">
        <div className="flex items-center gap-2">
            {icon}
            <span className="font-semibold text-sm">{label}:</span>
        </div>
        <span className={`text-sm ${valueClass}`}>{value || 'N/A'}</span>
    </div>
);

const DetailMobile = ({ label, value, isBold = false, className = '' }) => (
    <div className={className}>
        <span className="font-medium text-gray-500">{label}: </span>
        <span className={isBold ? 'font-bold text-gray-900' : 'text-gray-700'}>{value}</span>
    </div>
);

const SectionTitle = ({ icon, title }) => (
    <div className="flex items-center gap-3 mb-4 pb-2 border-b">
        <div className="p-2 bg-indigo-100 rounded-lg">
            {icon}
        </div>
        <h4 className="text-xl font-bold text-gray-800">{title}</h4>
    </div>
);

const InfoRow = ({ icon, label, value }) => (
    <div className="flex items-center justify-between py-3 border-b border-gray-200">
        <div className="flex items-center gap-3">
            <div className="flex-shrink-0 w-5 h-5 flex items-center justify-center text-gray-500">
                {icon}
            </div>
            <span className="text-sm font-medium">{label}</span>
        </div>
        <span className="text-sm font-semibold ml-4">
            {value || 'Non renseigné'}
        </span>
    </div>
);

export default AffichageEleve;