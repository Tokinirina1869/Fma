import React, { useState, useEffect, useMemo, useContext, useCallback } from "react";
import { FaEdit, FaListAlt,FaCalendarAlt, FaGraduationCap, FaClock, FaCamera,FaTimes,
  FaPen, FaSearch, FaIdCard, FaUser, FaBirthdayCake, FaMapMarkerAlt, FaVenusMars, FaHome, FaPhone, FaUserTie, FaUserFriends, 
  FaPrint,FaSchool,FaBook,FaUniversity,FaUserGraduate,FaAddressCard,FaUserPlus,FaChalkboardTeacher,FaMapPin,FaTransgender,FaCertificate,FaSync,
} from "react-icons/fa";
import { Search, Calendar, RefreshCw, XCircle } from "lucide-react";
import ModificationInscription from "../modals/ModificationInscription";
import NouvellePersonne from "../modals/NouvellePersonne";
import Swal from "sweetalert2";
import axios from "axios";
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { ThemeContext } from "../ThemeContext";
import fma from '../../../public/laura.jpg';
import ListeApprenants from "./ListeApprenants";

const url = "https://fma-inscription.onrender.com/api";

// Composant InfoRowCarte pour la carte étudiante
const InfoRowCarte = ({ label, value, className = "" }) => (
  <div className={`flex justify-between items-center py-1 ${className}`}>
    <span className="text-xs font-semibold text-gray-600">{label}:</span>
    <span className="text-xs font-medium text-gray-800 text-right">{value || "Non renseigné"}</span>
  </div>
);

// Composant InfoCardRow pour la modal carte étudiante
const InfoCardRow = ({ icon, label, value, valueClass = "" }) => (
  <div className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-600">
    <div className="flex items-center gap-2">
      {icon}
      <span className="font-semibold text-sm">{label}:</span>
    </div>
    <span className={`text-sm ${valueClass}`}>{value || 'N/A'}</span>
  </div>
);

// Composant Carte Étudiante
const CarteEtudiante = ({ student, isPrint = false }) => {
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

  const getDateExpiration = () => {
    if (student.inscription?.dateinscrit) {
      const dateInscription = new Date(student.inscription.dateinscrit);
      dateInscription.setFullYear(dateInscription.getFullYear() + 1);
      return dateInscription.toLocaleDateString('fr-FR');
    }
    return "31/08/2024";
  };

  if (isPrint) {
    return (
      <div className="student-card-print">
        {/* En-tête de la carte */}
        <div className="card-header-print">
          <div className="school-logo-print">
            <FaSchool className="icon" />
            <h2>CFP LAURA VICUNA Anjarasoa Ankofafa</h2>
            <img src={fma} alt="FMA" className="fma-logo-print" />
          </div>
          <h3>ANJARASOA - CARTE ÉTUDIANT</h3>
        </div>

        {/* Contenu principal */}
        <div className="card-content-print">
          {/* Photo */}
          <div className="photo-section-print">
            <div className="photo-container-print">
              {student.inscription?.personne?.photo ? (
                <img 
                  src={`https://fma-inscription.onrender.com/storage/${student.inscription.personne.photo}`}
                  alt={`${student.inscription.personne.nom} ${student.inscription.personne.prenom}`}
                />
              ) : (
                <FaUser className="photo-placeholder-print" />
              )}
            </div>
          </div>

          {/* Informations */}
          <div className="info-section-print">
            <div className="student-name-print">
              <FaUserGraduate className="icon" />
              {student.inscription?.personne?.nom} {student.inscription?.personne?.prenom}
            </div>
            
            <div className="info-row-print">
              <span className="info-label-print">
                <FaIdCard className="icon" />
                Matricule:
              </span>
              <span className="info-value-print">{student.inscription?.personne?.matricule}</span>
            </div>
            
            <div className="info-row-print">
              <span className="info-label-print">
                <FaCalendarAlt className="icon" />
                Naissance:
              </span>
              <span className="info-value-print">{formatDate(student.inscription?.personne?.naiss)}</span>
            </div>
            
            {student.inscription?.personne?.lieunaiss && (
              <div className="info-row-print">
                <span className="info-label-print">
                  <FaMapMarkerAlt className="icon" />
                  Lieu:
                </span>
                <span className="info-value-print">{student.inscription.personne.lieunaiss}</span>
              </div>
            )}
            
            {student.inscription?.personne?.cin && (
              <div className="info-row-print">
                <span className="info-label-print">
                  <FaAddressCard className="icon" />
                  CIN:
                </span>
                <span className="info-value-print">{student.inscription.personne.cin || "Mineur"}</span>
              </div>
            )}
            
            <div className="info-row-print">
              <span className="info-label-print">
                <FaClock className="icon" />
                Expire le:
              </span>
              <span className="info-value-print">{getDateExpiration()}</span>
            </div>
            
            {student.parcours && student.parcours.length > 0 && (
              <div className="info-row-print">
                <span className="info-label-print">
                  <FaBook className="icon" />
                  Formation:
                </span>
                <span className="info-value-print">{student.parcours[0].nomformation}</span>
              </div>
            )}

            {student.inscription?.personne?.sexe && (
              <div className="info-row-print">
                <span className="info-label-print">
                  <FaVenusMars className="icon" />
                  Sexe:
                </span>
                <span className="info-value-print">{student.inscription.personne.sexe}</span>
              </div>
            )}
          </div>
        </div>

        {/* Pied de page */}
        <div className="card-footer-print">
          <div>
            <FaUniversity className="icon bg-blue" />
            Centre de Formation Professionnelle Laura Vicuna Anjarasoa
          </div>
          <div>
            <FaPhone className="icon bg-green-600" />
            Tél: +261 38 29 112 335 - Ankofafa Fianarantsoa
          </div>
        </div>
      </div>
    );
  }

  // Version normale (affichage à l'écran)
  return (
    <div className="bg-white rounded-2xl shadow-2xl border-2 border-indigo-300 overflow-hidden w-full max-w-sm mx-auto">
      
      {/* En-tête avec logo et nom de l'école */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-700 p-4 text-white text-center">
        <div className="flex items-center justify-center mb-2">
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
            <FaSchool className="text-indigo-600 text-lg" />
          </div>
          <div className="mx-2">
            <h3 className="font-bold text-sm leading-tight">CFP LAURA VICUNA</h3>
            <p className="text-xs opacity-90">ANJARASOA Anjarasoa Ankofafa</p>
          </div> 
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
            <img src={fma} alt="FMA" width={60} />
          </div>
        </div>
      </div>

      {/* Photo et informations principales */}
      <div className="p-4">
        <div className="flex items-start space-x-4 mb-4">
          {/* Photo de l'étudiant */}
          <div className="flex-shrink-0">
            <div className="w-20 h-24 bg-gray-200 rounded-lg border-2 border-indigo-500 overflow-hidden flex items-center justify-center">
              {student.inscription?.personne?.photo ? (
                <img 
                  src={`https://fma-inscription.onrender.com/storage/${student.inscription.personne.photo}`}
                  alt={`${student.inscription.personne.nom} ${student.inscription.personne.prenom}`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <FaUser className="text-gray-400 text-2xl" />
              )}
            </div>
          </div>

          {/* Informations principales */}
          <div className="flex-grow">
            <h2 className="text-lg font-bold text-gray-800 mb-1 leading-tight">
              Nom: {student.inscription?.personne?.nom} {student.inscription?.personne?.prenom}
            </h2>
            <div className="flex items-center mb-1">
              <FaVenusMars className="text-pink-500 mr-2 text-sm" />
              Sexe: <span className=" mx-2 text-lg text-gray-600">{student.inscription?.personne?.sexe || "Non spécifié"}</span>
            </div>
            {student.parcours && student.parcours.length > 0 && (
              <div className="flex items-center">
                <FaBook className="text-green-500 mr-2 text-sm" />
                Formation:
                <span className="mx-2 text-lg font-medium text-gray-700">
                  {student.parcours[0].nomformation}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Informations détaillées */}
        <div className="space-y-2 border-t border-gray-100 pt-3">
          <InfoRowCarte 
            label="Matricule" 
            value={student.inscription?.personne?.matricule}
          />
          
          <div className="flex items-start">
            <FaCalendarAlt className="text-blue-500 mr-2 mt-1 flex-shrink-0 text-xs" />
            <div className="flex-grow">
              <InfoRowCarte 
                label="Naissance" 
                value={formatDate(student.inscription?.personne?.naiss)}
              />
              {student.inscription?.personne?.lieunaiss && (
                <p className="text-xs text-gray-600 text-right">à {student.inscription.personne.lieunaiss}</p>
              )}
            </div>
          </div>

          {student.inscription?.personne?.cin && (
            <InfoRowCarte 
              label="CIN" 
              value={student.inscription.personne.cin || 'Mineur'}
            />
          )}

          <InfoRowCarte 
            label="Expire le" 
            value={getDateExpiration()}
          />
        </div>
      </div>

      {/* Pied de carte */}
      <div className="bg-gray-50 px-4 py-3 border-t border-gray-200">
        <div className="text-center text-xs text-gray-600">
          <p className="font-semibold">Centre de Formation Professionnelle</p>
          <p>Laura Vicuna Anjarasoa</p>
          <div className="mt-1 flex justify-between">
            <span>Tél: +261 38 29 112 335</span>
            <span>Ankofafa Fianarantsoa</span>
          </div>
        </div>
      </div>
    </div>
  );
};

function AffichageFormation({ formations }) {
  const [originalPersonnes, setOriginalPersonnes] = useState(formations || []);
  const { theme } = useContext(ThemeContext);
  const isDark = theme === 'dark';

  const [allPersonnes, setAllPersonnes] = useState(formations || []); 
  const [modalModification, setModalModification] = useState(false);
  const [selectedPersonne, setSelectedPersonne] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [showPersonne, setShowPersonne] = useState(false);
  const [modalDetails, setModalDetails] = useState(false);
  const [modalCarte, setModalCarte] = useState(false);
  const [parcours, setParcours] = useState([]);
  const [categories, setCategories] = useState(["Tous"]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("Tous");
  const [dateDebut, setDateDebut] = useState("");
  const [dateFin, setDateFin] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const ITEMS_PER_PAGE = 14;

  const closeNewPersonne = () => {setSelectedPersonne(null); setShowPersonne(false) };

  const openModalCarte = useCallback((student) => {
    return () => {
      setSelectedPersonne(student);
      setModalCarte(true);
    };
  }, []);

  const closeModalCarte = () => {
    setModalCarte(false);
    setSelectedPersonne(null);
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
          <p style="margin: 0; font-size: 11px; font-weight: bold;">CENTRE DE FORMATION PROFESSIONNELLE</p>
          <p style="margin: 0; font-size: 10px; opacity: 0.9;">FMA Anjarasoa Ankofafa Fianarantsoa</p>
        </div>
  
        <!-- Photo et infos principales -->
        <div style="padding: 15px;">
          <div style="display: flex; align-items: center; gap: 15px; margin-bottom: 15px;">
            <!-- Photo -->
            <div style="flex-shrink: 0;">
              <div style="width: 80px; height: 80px; background: #f3f4f6; border-radius: 8px; border: 2px solid #4f46e5; overflow: hidden; display: flex; align-items: center; justify-content: center;">
                ${selectedPersonne.inscription?.personne?.photo ? 
                  `<img src="https://fma-inscription.onrender.com/storage/${selectedPersonne.inscription.personne.photo}" 
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
                    Formation: <b>${selectedPersonne.parcours[0].nomformation}</b>
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
              <span style="font-size: 11px; font-weight: bold; color: #4f46e5;">Formation:</span>
              <span style="font-size: 11px; font-weight: bold; color: #4f46e5;">
                ${selectedPersonne.parcours && selectedPersonne.parcours.length > 0 ? 
                  selectedPersonne.parcours[0].nomformation : '---'}
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
            Centre de Formation Professionnelle Laura Vicuna Anjarasoa
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
  
  // Fonction pour récupérer les parcours depuis l'API
  const fetchParcours = async () => {
    setLoadingCategories(true);
    try {
      const response = await axios.get(`${url}/parcours/list`);
      setParcours(response.data.data);
      
      if (response.data.data && response.data.data.length > 0) {
        const uniqueFormations = [...new Set(response.data.data.map(p => p.nomformation))];
        setCategories(["Tous", ...uniqueFormations]);
      }
      setLoadingCategories(false);
    } catch(err) {
      console.error("Erreur lors de l'affichage des parcours: ", err);
      setLoadingCategories(false);
    }
  }

  useEffect(() => {
    fetchParcours();
  }, []);

  const handlePrintCarte = () => {
    const printContent = document.querySelector('.rounded-xl.shadow-2xl');
    
    if (!printContent) {
      console.error('Élément de carte non trouvé');
      return;
    }

    const printWindow = window.open('', '_blank', 'width=600,height=800');
    
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Carte Étudiante</title>
          <style>
            @media print {
              @page {
                margin: 0;
                size: A5 landscape;
              }
              body {
                margin: 0;
                padding: 10px;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
                display: flex;
                justify-content: center;
                align-items: center;
                min-height: 100vh;
              }
              .print-container {
                transform: scale(0.9);
              }
            }
            body {
              font-family: Arial, sans-serif;
              background: white;
            }
            .print-container {
              width: 100%;
              max-width: 400px;
            }
            * {
              box-sizing: border-box;
            }
          </style>
        </head>
        <body>
          <div class="print-container">
            ${printContent.outerHTML}
          </div>
          <script>
            setTimeout(() => {
              window.print();
              setTimeout(() => window.close(), 1000);
            }, 500);
          </script>
        </body>
      </html>
    `);
    
    printWindow.document.close();
  };



  const openModal = useCallback((p) => {
    return () => {
      setSelectedPersonne(p);
      setModalModification(true);
    };
  }, []);

  const closeModal = () => { setModalModification(false); setSelectedPersonne(null); };

  const openDetailsModal = useCallback((p) => {
    return () => {
      setSelectedPersonne(p);
      setModalDetails(true);
    };
  }, []);

  const closeDetailsModal = () => { setModalDetails(false); setSelectedPersonne(null); };

  // Mise à jour des listes lorsque 'formations' change
  useEffect(() => { 
    setOriginalPersonnes(formations || []);
    setAllPersonnes(formations || []);
  }, [formations]);
  
  const handleDelete = async (matricule) => {
    Swal.fire({
      title: 'Êtes-vous sûr ?',
      text: "Vous ne pourrez pas annuler cette action !",
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
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.delete(`${url}/inscriptionComplete/${encodeURIComponent(matricule)}`);
          
          setOriginalPersonnes(prev => prev.filter(p => p.inscription?.personne?.matricule !== matricule));
          setAllPersonnes(prev => prev.filter(p => p.inscription?.personne?.matricule !== matricule));
          
          Swal.fire({
            icon: 'success',
            text: `Supprimé avec succès !`,
            background: '#1e1e2f',
            color: 'white',
            showConfirmButton: false,
            position: "center",
            timer: 2000,
          });
        } catch (err) {
          console.error(err);
          Swal.fire({
            title: 'Erreur',
            text: 'Erreur lors de la suppression ❌. Assurez-vous que le matricule est correct.',
            icon: 'error',
            customClass: { popup: isDark ? 'bg-gray-800 text-white' : 'bg-white text-gray-800' }
          });
        }
      }
    });
  };

  const handleSearchClass = (classe) => {
    setActiveCategory(classe);
    setCurrentPage(1); 
  };
  
  const resetFilters = () => {
    setAllPersonnes(originalPersonnes || []); 
    setSearchQuery("");
    setActiveCategory("Tous");
    setDateDebut("");
    setDateFin("");
    setCurrentPage(1);
    Swal.fire({
      icon:'info', 
      title:'Réinitialisation de la liste', 
      timer:1500, 
      showConfirmButton:false,
      background: '#1e1e2f',
      color: 'white',
      position: "center",
    });
  };

  const handleSearchByDate = async () => {
    if (!dateDebut || !dateFin) {
        Swal.fire({
        icon: 'warning',
        title: 'Attention',
        text: 'Veuillez sélectionner les deux dates pour filtrer.',
        customClass: { popup: isDark ? 'bg-gray-800 text-white' : 'bg-white text-gray-800' }
        });
        return;
    }
    setLoading(true);

    try {
        const response = await axios.get(`${url}/filterDatePro`, {
        params: { date_debut: dateDebut, date_fin: dateFin },
        });
        
        setCurrentPage(1);
        setActiveCategory("Tous");

        Swal.fire({
          icon: 'success', 
          title: 'Succès', 
          text: `Filtrage effectué : ${response.data.data?.length || 0} résultats.`, 
          background: '#1e1e2f',
          color: 'white' ,
          timer: 2000,
          showConfirmButton: false,
          position: "center",
        });

    } 
    catch (error) {
        console.error("Erreur de recherche:", error);
        Swal.fire({
          title: 'Erreur',
          text: 'Impossible de filtrer les données. Assurez-vous que l\'API est fonctionnelle.',
          icon: 'error',
          customClass: { popup: isDark ? 'bg-gray-800 text-white' : 'bg-white text-gray-800' }
        });
    } finally {
        setLoading(false);
    }
  };

  const filterPersonnes = (personnesList, query, category, annee) => {
    return personnesList.filter(p => {
      const q = query.toLowerCase().trim();
      
      const matchText = !q || 
        (String(p.inscription?.personne?.matricule || '').toLowerCase().includes(q)) ||
        (String(p.inscription?.personne?.nom || '').toLowerCase().includes(q)) ||
        (String(p.inscription?.personne?.prenom || '').toLowerCase().includes(q)) ||
        (String(p.inscription?.personne?.cin || '').toLowerCase().includes(q)) ||
        (String(p.no_inscrit || '').toLowerCase().includes(q));

      if (!matchText) return false;

      if (category && category !== "Tous") {
        const hasMatchingParcours = p.parcours?.some(parc => parc.nomformation === category);
        if (!hasMatchingParcours) return false;
      }

      if (annee && p.inscription?.anneesco !== annee) return false;

      return true;
    });
  };

  const filteredPersonnes = useMemo(() => {
    return filterPersonnes(allPersonnes, searchQuery, activeCategory);
  }, [allPersonnes, searchQuery, activeCategory]); 

  // Pagination
  const totalPages = Math.ceil(filteredPersonnes.length / ITEMS_PER_PAGE);
  // const currentData = filteredPersonnes.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  const renderParcours = (parcours) => {
    if (!parcours || parcours.length === 0) return "---";
    const limitedParcours = parcours.slice(0, 2).map(p => p.nomformation).join(', ');
    return parcours.length > 2 ? `${limitedParcours}, ...` : limitedParcours;
  };

  const generateAnnee = () => {
      const currentAnnee = new Date().getFullYear();
      const years = [];
      for (let annee = 2020; annee <= currentAnnee; annee++) {
          years.push(`${annee}-${annee + 1}`);
      }
      return years.reverse();
  };

  return (
    <div className="p-4 sm:p-8 min-h-screen">

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 pb-4 border-b border-indigo-200/50">
        <div className="flex items-center">
          <FaListAlt className="w-8 h-8 text-indigo-500 mr-3" />
          <h5 className="font-extrabold ">Liste des inscrits aux Formations Professionnelle</h5>
        </div>
        <p className={`text-xl font-semibold mt-4 sm:mt-0 px-4 py-2 rounded-full `}>
          Total: <b className="text-lg">{filteredPersonnes.length}</b> personnes
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow border border-gray-100 p-5 mb-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-3 items-end">
          <div className="relative lg:col-span-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Nom, Matricule, CIN, N° Insc..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              className="w-full pl-9 pr-4 py-2.5 border border-gray-200 bg-gray-50 rounded-xl text-sm text-gray-800 placeholder-gray-400 outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-600 focus:bg-white transition"
            />
          </div>

          {/* Dates */}
          <div className="lg:col-span-2 grid grid-cols-2 gap-3">
            <div className="relative">
              <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-1 ml-1">
                Du
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <input
                  type="date"
                  value={dateDebut}
                  onChange={(e) => setDateDebut(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 border border-gray-200 bg-gray-50 rounded-xl text-sm text-gray-700 outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-600 focus:bg-white transition"
                />
              </div>
            </div>
            <div className="relative">
              <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-1 ml-1">
                Au
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <input
                  type="date"
                  value={dateFin}
                  onChange={(e) => setDateFin(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 border border-gray-200 bg-gray-50 rounded-xl text-sm text-gray-700 outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-600 focus:bg-white transition"
                />
              </div>
            </div>
          </div>

          {/* Boutons actions */}
          <div className="lg:col-span-1 flex gap-2 mt-auto">
            <button
              onClick={handleSearchByDate}
              disabled={loading}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold shadow transition ${
                loading
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white'
              }`}
            >
              {loading
                ? <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                : <FaSearch size={12} />
              }
              {loading ? 'Chargement…' : 'Chercher'}
            </button>

            <button
              onClick={resetFilters}
              className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold shadow transition"
              title="Réinitialiser les filtres"
            >
              <FaSync size={12} />
              <span className="hidden sm:inline">Rafraîchir</span>
            </button>
          </div>
        </div>

      {/* ── Séparateur ── */}
      <div className="h-px bg-gradient-to-r from-indigo-100 via-gray-100 to-transparent my-4" />

      {/* ── Ligne 2 : Filtres par catégorie ── */}
      <div className="flex flex-wrap items-center gap-2">

        {/* Label */}
        <div className="flex items-center gap-1.5 mr-1 flex-shrink-0">
          <FaPen className="text-indigo-400" size={12} />
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest hidden sm:inline">
            Formation
          </span>
        </div>

        {/* Séparateur vertical */}
        <div className="hidden sm:block w-px h-4 bg-gray-200 mr-1" />

        {/* Badges catégories */}
        {loadingCategories ? (
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <RefreshCw className="w-3 h-3 animate-spin" />
            Chargement…
          </div>
        ) : (
          categories.map(key => (
            <button
              key={key}
              onClick={() => handleSearchClass(key)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all duration-150 ${
                activeCategory === key
                  ? 'bg-indigo-600 text-white border-transparent shadow shadow-indigo-200'
                  : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-indigo-50 hover:border-indigo-300 hover:text-indigo-700'
              }`}
            >
              {key}
            </button>
          ))
        )}
      </div>
      </div>
      
      <ListeApprenants
        formations={filteredPersonnes}
        onDetails={(p) => { setSelectedPersonne(p); setModalDetails(true); }}
        onCarte={(p)   => { setSelectedPersonne(p); setModalCarte(true); }}
        onEdit={(p)    => { setSelectedPersonne(p); setModalModification(true); }}
        onDelete={(matricule) => handleDelete(matricule)}
      />

      {/* --- PAGINATION --- */}
      {totalPages > 1 && (
        <div className={`flex justify-between items-center px-4 py-3 border-t mt-6 rounded-xl shadow-lg `}>
          <button onClick={() => goToPage(currentPage - 1)} disabled={currentPage === 1}
            className={`flex items-center gap-2 px-3 py-1 font-bold rounded-lg transition duration-200 disabled:opacity-50 ${isDark ? 'bg-indigo-700 text-white hover:bg-indigo-600' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}>
            Précédent
          </button>
          <span className={`text-sm `}>Page {currentPage} sur {totalPages}</span>
          <button  onClick={() => goToPage(currentPage + 1)} disabled={currentPage === totalPages}
            className={`flex items-center gap-2 px-3 py-1 font-bold rounded-lg transition duration-200 disabled:opacity-50 ${isDark ? 'bg-indigo-700 text-white hover:bg-indigo-600' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}>
            Suivant
          </button>
        </div>
      )}

      {/* MODALES */}
      {selectedImage && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100]"
          onClick={() => setSelectedImage(null)}>
          <div className="bg-white p-6 rounded-xl shadow-2xl max-w-lg mx-4" onClick={(e) => e.stopPropagation()}>
            <img src={selectedImage} alt="Zoom Photo d'identité" className="rounded-lg w-full h-auto object-cover max-h-[80vh]" />
            <p className="text-center text-gray-600 mt-3 font-medium">Photo d'identité (Cliquez en dehors pour fermer)</p>
          </div>
        </div>
      )}

      {/* Modal Détails Professionnel */}
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
                        dark:from-gray-800 dark:to-gray-700 text-white relative"
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
                            src={`https://fma-inscription.onrender.com/storage/${selectedPersonne.inscription.personne.photo}`}
                            alt="Photo de profil"
                            className="w-full h-full object-cover cursor-pointer rounded-full"
                            onClick={() =>
                              setSelectedImage(
                                `https://fma-inscription.onrender.com/storage/${selectedPersonne.inscription.personne.photo}`
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
                      <h2 className="text-2xl font-bold text-gray-800 mr-3 dark:text-white mb-2">
                        {selectedPersonne.inscription?.personne?.nom} {selectedPersonne.inscription?.personne?.prenom}
                      </h2>
                      <div className="flex flex-wrap gap-4 justify-center md:justify-center text-sm text-gray-600 dark:text-gray-300">
                        <div className="flex items-center gap-2">
                          <FaIdCard className="text-blue-600" />
                          <span><b className="m-2">Matricule:</b> {selectedPersonne.inscription?.personne?.matricule || 'N/A'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <FaVenusMars className="text-pink-600" />
                          <span><b className="m-2">Sexe:</b> {selectedPersonne.inscription?.personne?.sexe || 'Non spécifié'}</span>
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
                        icon={<FaUser className="text-green-500" />}
                        label="Nom"
                        value={selectedPersonne.inscription?.personne?.nom}
                      />
                      <InfoRow
                        icon={<FaUserPlus className="text-cyan-500" />}
                        label="Prenom(s)"
                        value={selectedPersonne.inscription?.personne?.prenom}
                      />
                      <InfoRow
                        icon={<FaIdCard className="text-indigo-500" />}
                        label="N Matricule"
                        value={selectedPersonne.inscription?.personne?.matricule}
                      />
                      <InfoRow
                        icon={<FaIdCard className="text-blue-500" />}
                        label="CIN"
                        value={selectedPersonne.inscription?.personne?.cin}
                      />
                      <InfoRow
                        icon={<FaCalendarAlt className="text-green-500" />}
                        label="Délivré le"
                        value={selectedPersonne.inscription?.personne?.datedel}
                      />
                      <InfoRow
                        icon={<FaBirthdayCake className="text-purple-500" />}
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
                        label="Fils de"
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
                        label="Tuteur(trice)"
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
                        <h4 className="font-semibold text-lg">Inscription & Formation</h4>
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
                        label="Durée de Formation"
                        value={selectedPersonne.duree || "Non spécifié"}
                      />
                      <InfoRow
                        icon={<FaClock className="text-orange-500" />}
                        label="Type de Formation"
                        value={selectedPersonne.type_formation || "Non spécifié"}
                      />
                      <InfoRow
                        icon={<FaClock className="text-orange-500" />}
                        label="Annee de la Formation"
                        value={selectedPersonne.annee_etude || "3 mois"}
                      />

                      {/* Formations */}
                      <div className="pt-2">
                        <div className="flex items-center gap-2 mb-3">
                          <FaListAlt className="text-indigo-500" />
                          <span className="font-semibold text-sm text-gray-700 dark:text-gray-300">Formations Inscrites</span>
                        </div>
                        {selectedPersonne.parcours && selectedPersonne.parcours.length > 0 ? (
                          <div className="space-y-2">
                            {selectedPersonne.parcours.map((parcours, index) => (
                              <div
                                key={index}
                                className="bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900 dark:to-purple-900
                                          border border-indigo-200 dark:border-indigo-700
                                          text-gray-700 dark:text-gray-200 px-3 py-2 rounded-lg flex items-center gap-3"
                              >
                                <FaGraduationCap className="w-4 h-4 text-indigo-500" />
                                <span className="text-sm font-medium">{parcours.nomformation}</span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <FaGraduationCap className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                            <p className="text-gray-500 dark:text-gray-300 text-sm">
                              Aucune formation assignée
                            </p>
                          </div>
                        )}
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
                  openModal(selectedPersonne)();
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

      {/* Modale pour la Carte Étudiante */}
      {modalCarte && selectedPersonne && (
        
        <div className="fixed inset-0 z-[10000] flex items-center justify-center transition-all duration-300 bg-black/40 dark:bg-black/60"
            onClick={closeModalCarte}>
            <div className={`rounded-xl shadow-2xl max-w-xl lg:max-w-xl w-full mx-4 max-h-[90vh] overflow-y-auto print:shadow-none print:mx-0 print:max-w-none ${isDark ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'}`} onClick={(e) => e.stopPropagation()}>
                {/* En-tête avec logo de l'école */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-6 text-center print:bg-blue-600">
                    <div className="mb-4">
                        <div className="w-16 h-16 bg-white rounded-full mx-auto flex items-center justify-center mb-2 print:bg-white">
                            <img src={fma} alt="FMA" className="fma-logo-print" />
                        </div>
                        <h3 className="text-lg font-bold">CENTRE DE FORMATION PROFESSINNELLE</h3>
                        <p className="text-sm opacity-90">FMA Anjarasoa Ankofafa Fianarantsoa</p>
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
                                        src={`https://fma-inscription.onrender.com/storage/${selectedPersonne.inscription.personne.photo}`}
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
                            <p className="text-sm opacity-75 flex items-center gap-2">
                              <FaGraduationCap className="w-3 h-3" />
                              <span>
                                  {selectedPersonne.parcours && selectedPersonne.parcours.length > 0 
                                      ? selectedPersonne.parcours[0].nomformation 
                                      : selectedPersonne.niveau?.nomniveau || "---"}
                              </span>
                              <FaCalendarAlt className="w-3 h-3 ml-2" />
                              <span>{selectedPersonne.inscription?.anneesco || '2025-2026'}</span>
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
                            <span className="font-semibold flex text-white items-center gap-2">
                                <FaChalkboardTeacher className="text-indigo-500" />
                                Formation:
                            </span>
                             <span className="bg-indigo-500 text-white px-3 py-1 rounded font-bold">
                                {/* Récupérer le nomformation depuis parcours */}
                                {selectedPersonne.parcours && selectedPersonne.parcours.length > 0 
                                ? selectedPersonne.parcours[0].nomformation 
                                : selectedPersonne.niveau?.nomniveau || "---"}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Pied de la carte */}
                <div className="bg-gray-100 dark:bg-gray-700 p-4 text-center border-t">
                    <p className="text-sm text-gray-600 dark:text-gray-300 flex items-center justify-center gap-2">
                        <FaCalendarAlt className="w-3 h-3" />
                        Carte valable pour l'année scolaire {selectedPersonne.inscription?.anneesco || '2024-2025'}
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
                        onClick={closeModalCarte}
                        className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition font-semibold flex items-center gap-2"
                    >
                        <FaTimes className="w-4 h-4" />
                        Fermer
                    </button>
                </div>
            </div>
        </div>
      )}

      <ModificationInscription show={modalModification} handleClose={closeModal} personneData={selectedPersonne}/>
      <NouvellePersonne show={showPersonne} handleClose={closeNewPersonne} personneData={selectedPersonne} /> 
    </div>
  );
}

// Composant utilitaire pour les détails mobiles
const DetailMobile = ({ label, value, className = ''}) => (
  <div className={className}>
    <span className={`font-medium`}>{label}: </span>
    <span className='fw-bold'>{value}</span>
  </div>
);

// Composants pour le modal professionnel
const SectionTitle = ({ icon, title }) => (
  <div className="flex items-center gap-3 mb-4 pb-2 border-b border-gray-200">
    <div className="p-2 rounded-lg">
      {icon}
    </div>
    <h4 className="text-xl font-bold text-center mb-2 text-blue-600">{title}</h4>
  </div>
);

const InfoRow = ({ icon, label, value }) => (
  <div className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-600">
    <div className="flex items-center gap-3">
      <div className="flex-shrink-0 w-5 h-5 flex items-center justify-center">
        {icon}
      </div>
      <span className="text-sm font-medium dark:text-gray-300">{label}</span>
    </div>
    <span className="text-sm font-semibold ml-4 dark:text-gray-200">
      {value || 'Non renseigné'}
    </span>
  </div>
);

export default AffichageFormation;
