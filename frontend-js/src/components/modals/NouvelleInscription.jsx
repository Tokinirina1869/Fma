import React, { useEffect, useState, useRef } from "react";
import { Modal, Button, Form, Row, Col } from "react-bootstrap";
import axios from "axios";
import { FaGraduationCap, FaPlus, FaTrash, FaTimes, FaUserAlt, FaUserPlus, FaSearch, FaCheck } from "react-icons/fa";
import { User, UserPlus, Users } from "lucide-react";
import Swal from "sweetalert2";

const NouvelleInscription = ({ show, handleClose, refreshList, searchEleve }) => {
  const today = new Date().toISOString().split("T")[0];

  const initialFormState = {
    nom: "",
    prenom: "",
    naiss: "",
    lieunaiss: "",
    sexe: "",
    adresse: "",
    cin: "",
    datedel: "",
    lieucin: "",
    nompere: "",
    nommere: "",
    nomtuteur: "",
    adressparent: "",
    adresstuteur: "",
    phoneparent: "",
    phonetuteur: "",
    dateinscrit: today,
    anneesco: "",
    type_inscrit: "inscription",
    nomniveau: "",
    photo: null,
    code_niveau: "",
    profileImage: "https://placehold.co/128x128/FFFFFF/000000?text=Photo",
    uploading: false,
  };

  // --- Déclarations d'État ---
  const [form, setForm] = useState(initialFormState);
  const [niveauForm, setNiveauForm] = useState([{ code_niveau: "", datedebut: today }]);
  const [errors, setErrors] = useState({});
  const [niveauOption, setNiveauOption] = useState([]);
  
  // États pour l'auto-complétion
  const [personnesList, setPersonnesList] = useState([]);
  const [filteredPersonnes, setFilteredPersonnes] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedPersonne, setSelectedPersonne] = useState(null);

  // Références
  const dropdownRef = useRef(null);
  const nomRef = useRef(null);

  // Patterns de validation
  const validationPatterns = {
    cin: /^[0-9]*$/,
    phone: /^[0-9]*$/,
    name: /^[a-zA-ZÀ-ÿ\s'.-]*$/,
    location: /^[a-zA-ZÀ-ÿ0-9\s',.()-]*$/,
  };

  // --- Fonctions Utilitaires ---

  const isMajeur = (dateNaiss) => {
    if (!dateNaiss) return false;
    const today = new Date();
    const birthDate = new Date(dateNaiss);
    
    if (isNaN(birthDate)) return false;

    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();

    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age >= 18;
  };
  
  const estMajeur = isMajeur(form.naiss);

  // Gestion du clic en dehors du dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target) &&
          nomRef.current && !nomRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Charger les niveaux
  useEffect(() => {
    const fetchniveau = async () => {
      try {
        const response = await axios.get('http://localhost:8000/api/niveau');
        setNiveauOption(response.data.data);
      } catch (err) {
        console.error("Erreur lors du chargement des niveaux ", err);
      }
    }
    fetchniveau();
  }, []);

  // Charger la liste des personnes pour l'auto-complétion
  useEffect(() => {
    const fetchPersonnes = async () => {
      try {
        const response = await axios.get('http://localhost:8000/api/personnes');
        setPersonnesList(response.data.data || []);
      } catch (err) {
        console.error("Erreur lors du chargement des personnes ", err);
      }
    }
    fetchPersonnes();
  }, []);

  // Fonction pour filtrer les personnes selon la saisie dans le nom
  const filterPersonnes = (searchTerm) => {
    if (!searchTerm.trim()) {
      return [];
    }

    const term = searchTerm.toLowerCase().trim();
    
    return personnesList.filter(personne => {
      const nomComplet = `${personne.nom || ''} ${personne.prenom || ''}`.toLowerCase();
      const nom = personne.nom?.toLowerCase() || '';
      const prenom = personne.prenom?.toLowerCase() || '';
      const cin = personne.cin?.toLowerCase() || '';
      const matricule = personne.matricule?.toLowerCase() || '';

      return nomComplet.includes(term) || 
             nom.includes(term) || 
             prenom.includes(term) ||
             cin.includes(term) ||
             matricule.includes(term);
    }).slice(0, 8); // Limiter à 8 résultats
  };

  // Fonction pour sélectionner une personne
  const selectPersonne = (personne) => {
    const isExistingMajor = isMajeur(personne.naiss);

    setForm(prev => ({
      ...prev,
      nom: personne.nom || "",
      prenom: personne.prenom || "",
      naiss: personne.naiss || "",
      lieunaiss: personne.lieunaiss || "",
      sexe: personne.sexe || "",
      adresse: personne.adresse || "",
      cin: isExistingMajor ? personne.cin || "" : "",
      datedel: isExistingMajor ? personne.datedel || "" : "",
      lieucin: isExistingMajor ? personne.lieucin || "" : "",
      nompere: personne.nompere || "",
      nommere: personne.nommere || "",
      nomtuteur: personne.nomtuteur || "",
      adressparent: personne.adressparent || "",
      adresstuteur: personne.adresstuteur || "",
      phoneparent: personne.phoneparent || "",
      phonetuteur: personne.phonetuteur || "",
      photo: personne.photo || null,
      profileImage: personne.photo
        ? `http://localhost:8000/storage/${personne.photo}`
        : "https://placehold.co/128x128/FFFFFF/000000?text=Photo",
    }));

    setSelectedPersonne(personne);
    setShowDropdown(false);
    
    // Nettoyer les erreurs après sélection
    setErrors({});
  };

  // Réinitialiser la sélection
  const resetSelection = () => {
    setSelectedPersonne(null);
    setForm(initialFormState);
    setNiveauForm([{ code_niveau: "", datedebut: today }]);
    setShowDropdown(false);
  };

  // Gestion du changement dans le champ nom
  const handleNomChange = (e) => {
    const value = e.target.value;
    
    setForm(prev => ({ ...prev, nom: value }));
    
    // Filtrer les personnes en temps réel
    if (value.length > 1) {
      const filtered = filterPersonnes(value);
      setFilteredPersonnes(filtered);
      setShowDropdown(true);
    } else {
      setShowDropdown(false);
      setFilteredPersonnes([]);
    }

    // Si on efface le nom, réinitialiser la sélection
    if (value === "" && selectedPersonne) {
      resetSelection();
    }
    
    // Nettoyer les erreurs
    const tempErrors = { ...errors };
    delete tempErrors.nom;
    setErrors(tempErrors);
  };

  // Gestion du focus sur le champ nom
  const handleNomFocus = () => {
    if (form.nom.length > 1 && filteredPersonnes.length > 0) {
      setShowDropdown(true);
    }
  };

  // Pré-remplir l'élève existant (si applicable)
  useEffect(() => {
    if (searchEleve && searchEleve.personne) {
      const p = searchEleve.personne;
      const isExistingMajor = isMajeur(p.naiss);

      setForm(prev => ({
        ...prev,
        nom: p.nom || "",
        prenom: p.prenom || "",
        naiss: p.naiss || "",
        lieunaiss: p.lieunaiss || "",
        sexe: p.sexe || "",
        adresse: p.adresse || "",
        cin: isExistingMajor ? p.cin || "" : "",
        datedel: isExistingMajor ? p.datedel || "" : "",
        lieucin: isExistingMajor ? p.lieucin || "" : "",
        nompere: p.nompere || "",
        nommere: p.nommere || "",
        nomtuteur: p.nomtuteur || "",
        adressparent: p.adressparent || "",
        adresstuteur: p.adresstuteur || "",
        phoneparent: p.phoneparent || "",
        phonetuteur: p.phonetuteur || "",
        photo: p.photo || null,
        profileImage: p.photo
          ? `http://localhost:8000/storage/${p.photo}`
          : "https://placehold.co/128x128/FFFFFF/000000?text=Photo",
          
        dateinscrit: today,
        anneesco: "",
        type_inscrit: "inscription",
        code_niveau: "",
      }));
      
      setNiveauForm([{ code_niveau: "", datedebut: today }]);
      setSelectedPersonne(p);
    } else if (show) {
      resetSelection();
    }
  }, [searchEleve, show]);

  // Générer années scolaires
  const generateAnnee = () => {
    const currentAnnee = new Date().getFullYear();
    const years = [];
    for (let annee = currentAnnee + 1; annee >= 2020; annee--) { 
      years.push(`${annee-1}-${annee}`);
    }
    return years.reverse(); 
  };

  // Fonction pour obtenir l'âge à partir de la date de naissance
  const getAge = (dateNaiss) => {
    if (!dateNaiss) return null;
    const today = new Date();
    const birthDate = new Date(dateNaiss);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  // --- Fonction de Validation Complète ---
  const validateForm = (currentForm, currentNiveauForm) => {
    let newErrors = {};

    const isMajor = isMajeur(currentForm.naiss);

    // 1. Champs Personnels obligatoires (toujours vérifiés)
    if (!currentForm.nom) newErrors.nom = "Le nom est requis.";
    if (!currentForm.prenom) newErrors.prenom = "Le prénom est requis.";
    if (!currentForm.naiss) newErrors.naiss = "La date de naissance est requise.";
    if (!currentForm.sexe) newErrors.sexe = "Le sexe est requis.";
    
    // 2. Validation CIN et Dépendances (Conditionnelle à la Majorité)
    if (isMajor) {
        if (currentForm.cin && currentForm.cin.trim() !== "") {
            if (!validationPatterns.cin.test(currentForm.cin)) {
                newErrors.cin = "Le CIN ne doit contenir que des chiffres.";
            } else if (currentForm.cin.length !== 12) {
                newErrors.cin = "Le CIN doit contenir exactement 12 chiffres.";
            }
            if (!currentForm.datedel) newErrors.datedel = "La date de délivrance est obligatoire si le CIN est renseigné.";
            if (!currentForm.lieucin) newErrors.lieucin = "Le lieu de délivrance est obligatoire si le CIN est renseigné.";
        }
    }

    // 3. Validation Téléphones
    const validatePhone = (phone) => phone && !validationPatterns.phone.test(phone.replace(/\s/g, ''));
    if (validatePhone(currentForm.phoneparent)) {
      newErrors.phoneparent = "Le numéro ne doit contenir que des chiffres.";
    } else if (currentForm.phoneparent && currentForm.phoneparent.length !== 10) {
      newErrors.phoneparent = "Le numéro doit contenir exactement 10 chiffres.";
    }
    
    if (validatePhone(currentForm.phonetuteur)) {
      newErrors.phonetuteur = "Le numéro ne doit contenir que des chiffres.";
    } else if (currentForm.phonetuteur && currentForm.phonetuteur.length !== 10) {
      newErrors.phonetuteur = "Le numéro doit contenir exactement 10 chiffres.";
    }

    // 4. Validation des noms
    if (currentForm.nom && !validationPatterns.name.test(currentForm.nom)) {
      newErrors.nom = "Caractères non autorisés dans le nom.";
    }
    if (currentForm.prenom && !validationPatterns.name.test(currentForm.prenom)) {
      newErrors.prenom = "Caractères non autorisés dans le prénom.";
    }
    if (currentForm.nompere && !validationPatterns.name.test(currentForm.nompere)) {
      newErrors.nompere = "Caractères non autorisés.";
    }
    if (currentForm.nommere && !validationPatterns.name.test(currentForm.nommere)) {
      newErrors.nommere = "Caractères non autorisés.";
    }
    if (currentForm.nomtuteur && !validationPatterns.name.test(currentForm.nomtuteur)) {
      newErrors.nomtuteur = "Caractères non autorisés.";
    }

    // 5. Validation des lieux et adresses
    if (currentForm.lieunaiss && !validationPatterns.location.test(currentForm.lieunaiss)) {
      newErrors.lieunaiss = "Caractères non autorisés.";
    }
    if (currentForm.lieucin && !validationPatterns.location.test(currentForm.lieucin)) {
      newErrors.lieucin = "Caractères non autorisés.";
    }
    if (currentForm.adresse && !validationPatterns.location.test(currentForm.adresse)) {
      newErrors.adresse = "Caractères non autorisés.";
    }
    if (currentForm.adressparent && !validationPatterns.location.test(currentForm.adressparent)) {
      newErrors.adressparent = "Caractères non autorisés.";
    }
    if (currentForm.adresstuteur && !validationPatterns.location.test(currentForm.adresstuteur)) {
      newErrors.adresstuteur = "Caractères non autorisés.";
    }

    // 6. Champs Inscription obligatoires
    if (!currentForm.dateinscrit) newErrors.dateinscrit = "La date d'inscription est requise.";
    if (!currentForm.anneesco) newErrors.anneesco = "L'année scolaire est requise.";
    if (!currentForm.type_inscrit || currentForm.type_inscrit === "--Choisir le type d'inscription--") {
        newErrors.type_inscrit = "Le type d'inscription est requis.";
    }
    
    // 7. Validation Niveaux (au moins un niveau avec code et date de début)
    if (currentNiveauForm.length === 0) {
       newErrors.niveauForm = "Vous devez ajouter au moins un niveau d'inscription.";
    } else {
        currentNiveauForm.forEach((n, i) => {
             if (!n.code_niveau) newErrors[`code_niveau_${i}`] = "Le niveau est requis.";
             if (!n.datedebut) newErrors[`datedebut_${i}`] = "La date de début est requise.";
        });
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // --- Gestion des Changements & Validation Instantanée ---
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Pour le champ nom, utiliser la fonction spéciale
    if (name === 'nom') {
      handleNomChange(e);
      return;
    }
    
    setForm(prev => {
        const updatedForm = { ...prev, [name]: value };
        
        // Validation instantanée et nettoyage des erreurs
        const tempErrors = { ...errors };
        delete tempErrors[name]; 

        // Règle de Majorité : Si la date de naissance change, recalculer estMajeur.
        const isCurrentlyMajor = isMajeur(name === 'naiss' ? value : updatedForm.naiss);

        // Si l'utilisateur devient mineur, effacer les champs CIN
        if (name === 'naiss' && !isCurrentlyMajor) {
            updatedForm.cin = "";
            updatedForm.datedel = "";
            updatedForm.lieucin = "";
            delete tempErrors.cin;
            delete tempErrors.datedel;
            delete tempErrors.lieucin;
        }

        // Règle 1: Format CIN
        if (name === "cin" && isCurrentlyMajor) {
            if (value && value.trim() !== "" && !validationPatterns.cin.test(value)) {
                tempErrors.cin = "Le CIN ne doit contenir que des chiffres.";
            } else if (value && value.trim() !== "" && value.length !== 12) {
                tempErrors.cin = "Le CIN doit contenir exactement 12 chiffres.";
            } else if (value && value.trim() !== "") {
                delete tempErrors.cin;
            }
        }
        
        // Règle 2: Dépendance CIN (datedel et lieucin OBLIGATOIRES si cin est renseigné ET majeur)
        const cinValue = name === 'cin' ? value : updatedForm.cin;
        
        delete tempErrors.datedel;
        delete tempErrors.lieucin;

        if (cinValue && cinValue.trim() !== "" && isCurrentlyMajor) {
            if (!updatedForm.datedel) tempErrors.datedel = "Date de délivrance requise.";
            if (!updatedForm.lieucin) tempErrors.lieucin = "Lieu de délivrance requis.";
        }

        // Règle 3: Format Téléphone
        const validatePhone = (phone) => phone && !validationPatterns.phone.test(phone.replace(/\s/g, ''));
        
        if (name === "phoneparent") {
            if (validatePhone(value)) {
                tempErrors.phoneparent = "Le numéro ne doit contenir que des chiffres.";
            } else if (value && value.length !== 10) {
                tempErrors.phoneparent = "Le numéro doit contenir exactement 10 chiffres.";
            } else {
                delete tempErrors.phoneparent;
            }
        }
        
        if (name === "phonetuteur") {
            if (validatePhone(value)) {
                tempErrors.phonetuteur = "Le numéro ne doit contenir que des chiffres.";
            } else if (value && value.length !== 10) {
                tempErrors.phonetuteur = "Le numéro doit contenir exactement 10 chiffres.";
            } else {
                delete tempErrors.phonetuteur;
            }
        }

        // Règle 4: Validation des noms
        if (name === "nompere" || name === "nommere" || name === "nomtuteur") {
            if (value && !validationPatterns.name.test(value)) {
                tempErrors[name] = "Caractères non autorisés.";
            } else {
                delete tempErrors[name];
            }
        }

        // Règle 5: Validation des lieux et adresses
        if (name === "lieunaiss" || name === "lieucin" || name === "adresse" || name === "adressparent" || name === "adresstuteur") {
            if (value && !validationPatterns.location.test(value)) {
                tempErrors[name] = "Caractères non autorisés.";
            } else {
                delete tempErrors[name];
            }
        }

        setErrors(tempErrors);
        return updatedForm;
    });
  };

  // Niveaux
  const handleNiveauChange = (index, field, value) => {
    setNiveauForm(prev => {
      const updated = [...prev];
      updated[index][field] = value;
      // Valider ce champ instantanément
      let newErrors = { ...errors };
      
      const key = `${field}_${index}`;
      if (value) {
          delete newErrors[key];
      } else {
          newErrors[key] = (field === 'code_niveau' ? "Le niveau est requis." : "La date est requise.");
      }
      setErrors(newErrors);
      return updated;
    });
  };

  const addNewNiveau = () => {
    setNiveauForm(prev => [...prev, { code_niveau: "", datedebut: today }]);
  };

  const removeniveau = (index) => {
    setNiveauForm(prev => prev.filter((_, i) => i !== index));
    // Supprimer les erreurs associées si elles existent
    setErrors(prev => {
        const { [`code_niveau_${index}`]: _, [`datedebut_${index}`]: __, ...rest } = prev;
        return rest;
    });
  };

  // --- Soumission ---
  const handleSubmit = async (e) => {
      e.preventDefault();
      
      if (!validateForm(form, niveauForm)) {
        Swal.fire({
            icon: "error",
            title: "Erreur de validation",
            text: "Veuillez corriger les erreurs dans le formulaire pour continuer l'inscription!",
            background: '#1e1e2f',
            color: "white",
            showConfirmButton: true,
          });
        return;
      }

      try {
        const formData = new FormData();

        // 1. Ajout des champs du formulaire de base
        Object.entries(form).forEach(([key, value]) => {
          if (key !== 'profileImage' && value !== null && value !== "") {
              
              if (key === 'photo' && typeof value === 'object' && value instanceof File) {
                  formData.append(key, value, value.name);
              } 
              else if (key !== 'photo' && key !== 'code_niveau') { 
                  formData.append(key, value);
              }
          }
        });
        
        // 2. Ajout des niveaux (structure tableau)
        niveauForm.forEach((n, i) => {
          if (n.code_niveau && n.datedebut) {
              formData.append(`niveaux[${i}][code_niveau]`, n.code_niveau);
              formData.append(`niveaux[${i}][datedebut]`, n.datedebut);
          }
        });
        
        // 3. Ajouter le 'code_niveau' du premier élément comme champ simple à la racine
        if (niveauForm.length > 0 && niveauForm[0].code_niveau) {
            formData.append('code_niveau', niveauForm[0].code_niveau);
        }
        
        // 4. Envoi de la requête
        await axios.post("http://localhost:8000/api/addacademique", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        
        // 5. Succès
        Swal.fire({
            icon: "success",
            text: "Inscription réussie!",
            background: '#1e1e2f',
            color: "white",
            showConfirmButton: false,
            timer: 2000,
        });

        handleClose();
        if (refreshList) refreshList();
      } 
      // 6. Gestion des Erreurs (422)
      catch (err) {
        console.error("Erreur complète de l'API:", err.response);
        let errorMessage = "Erreur lors de l'inscription.";

        if (err.response && err.response.status === 422 && err.response.data && err.response.data.errors) {
          
          console.log("Erreurs de Validation Laravel (Détails):", err.response.data.errors);
          
          const backendErrors = err.response.data.errors;
          let mappedErrors = {};
          for (const key in backendErrors) {
              
              if (key.startsWith('niveaux.')) {
                  const parts = key.split('.');
                  if (parts.length >= 3) {
                      const reactKey = `${parts[2]}_${parts[1]}`; 
                      mappedErrors[reactKey] = backendErrors[key][0];
                  }
                  if (parts.length === 1) mappedErrors.niveauForm = backendErrors[key][0];
              } else {
                  mappedErrors[key] = backendErrors[key][0]; 
              }
          }
          setErrors(prev => ({...prev, ...mappedErrors}));

          errorMessage = "Veuillez vérifier les champs signalés en rouge ci-dessous (Validation Serveur).";
        } 
        
        Swal.fire({
            icon: "error",
            title: "Échec de l'inscription",
            text: errorMessage,
            background: '#1e1e2f',
            color: "white",
            showConfirmButton: true,
        });
      }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    const maxSize = 5 * 1024 * 1024;

    if (!validTypes.includes(file.type)) {
      Swal.fire({
        icon: 'error',
        title: 'Format non supporté',
        text: 'Veuillez sélectionner une image au format JPEG, PNG ou GIF',
        background: '#1e1e2f',
        color: 'white',
        confirmButtonColor: '#3085d6'
      });
      e.target.value = '';
      return;
    }

    if (file.size > maxSize) {
      Swal.fire({
        icon: 'error',
        title: 'Fichier trop volumineux',
        text: `La taille maximale autorisée est de 5MB. Votre fichier: ${(file.size / 1024 / 1024).toFixed(2)}MB`,
        background: '#1e1e2f',
        color: 'white',
        confirmButtonColor: '#3085d6'
      });
      e.target.value = '';
      return;
    }

    const img = new Image();
    img.onload = function() {
      const width = this.width;
      const height = this.height;
      
      if (width < 100 || height < 100) {
        Swal.fire({
          icon: 'warning',
          title: 'Image de faible qualité',
          text: 'Pour une meilleure qualité, nous recommandons une image d\'au moins 100x100 pixels',
          background: '#1e1e2f',
          color: 'white',
          confirmButtonColor: '#3085d6',
          showCancelButton: true,
          cancelButtonText: 'Changer',
          confirmButtonText: 'Utiliser quand même'
        }).then((result) => {
          if (!result.isConfirmed) {
            e.target.value = '';
            return;
          }
          finalizeImageUpload(file);
        });
      } else {
        finalizeImageUpload(file);
      }
    };

    img.onerror = function() {
      Swal.fire({
        icon: 'error',
        title: 'Image corrompue',
        text: 'Impossible de lire le fichier image. Veuillez en sélectionner une autre.',
        background: '#1e1e2f',
        color: 'white',
        confirmButtonColor: '#3085d6'
      });
      e.target.value = '';
    };

    img.src = URL.createObjectURL(file);
  };

  const finalizeImageUpload = (file) => {
    setForm(prev => ({ ...prev, photo: file }));
    
    const reader = new FileReader();
    reader.onloadend = () => {
      setForm(prev => ({ 
        ...prev, 
        profileImage: reader.result,
        uploading: false 
      }));
    };
    
    setForm(prev => ({ ...prev, uploading: true }));
    reader.readAsDataURL(file);
  };

  return (
    <Modal 
      show={show} 
      onHide={handleClose} 
      size="xl" 
      centered
      style={{ zIndex: 9999 }}
      backdrop="static"
    >
      <div className="flex justify-between items-center p-6 border-b border-gray-200/50 bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
        <div className="flex items-center gap-3">
          <FaUserPlus className="w-6 h-6" />
          <div>
            <h3 className="text-lg font-bold text-center">Nouvelle inscription Générale</h3>
          </div>
        </div>
        <button onClick={handleClose} className="text-white hover:text-gray-200 text-2xl transition">
          <FaTimes className="w-6 h-6" />
        </button>
      </div>

      <Modal.Body style={{ zIndex: 10000, position: 'relative' }}>
        <Form onSubmit={handleSubmit} className="space-y-8">

          {/* Section Photo */}
          <div className="flex flex-col items-center mb-6">
            <div className="relative">
              <img 
                src={form.profileImage} 
                alt="Profil" 
                className="rounded-full border-4 border-blue-500 w-32 h-32 object-cover shadow-lg"
              />
              <div className="absolute -bottom-2 -right-2">
                <Form.Label className="cursor-pointer bg-blue-500 hover:bg-blue-600 text-white rounded-full p-2 shadow-lg transition-all duration-200 transform hover:scale-105">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <Form.Control 
                    type="file" 
                    hidden 
                    accept="image/jpeg,image/jpg,image/png,image/gif" 
                    onChange={handleImageUpload} 
                  />
                </Form.Label>
              </div>
            </div>
            
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-600 mb-2">
                <strong>Formats acceptés :</strong> JPEG, JPG, PNG, GIF
              </p>
              <p className="text-xs text-gray-500">
                <strong>Taille max :</strong> 5MB • <strong>Recommandé :</strong> 128x128px
              </p>
            </div>

            {form.uploading && (
              <div className="mt-2 flex items-center text-blue-500">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-blue-500" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span className="text-sm">Téléchargement...</span>
              </div>
            )}

            {form.photo && (
              <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-700 flex items-center">
                  <FaCheck className="w-4 h-4 mr-1" />
                  Photo sélectionnée : {form.photo.name}
                </p>
              </div>
            )}
          </div>

          {/* --- 1. Informations Personnelles avec Auto-complétion sur le Nom --- */}
          <div className="p-6 sm:p-8 rounded-xl shadow-2xl ring-1 ring-gray-200 mb-4">
            <div className="flex items-center text-indigo-600 mb-6 border-b pb-4 border-indigo-100">
              <User className="w-6 h-6 mr-3" />
              <h5 className="text-center fw-bold">1. Informations Personnelles</h5>
            </div>

            <Row>
              <Col lg={4}>
                <Form.Group className="mb-2">
                  <Form.Label>Nom *</Form.Label>
                    <Form.Control 
                      name="nom" 
                      value={form.nom} 
                      onChange={handleNomChange}
                      onFocus={handleNomFocus}
                      isInvalid={!!errors.nom} 
                      required
                      placeholder="Commencez à taper un nom..."
                    />
                    <Form.Control.Feedback type="invalid">{errors.nom}</Form.Control.Feedback>
                </Form.Group>
              </Col>

              {/* Dropdown de recherche */}
              {showDropdown && filteredPersonnes.length > 0 && (
                <div 
                  ref={dropdownRef}
                  className="absolute z-50 w-96 bg-white border border-gray-300 rounded-lg shadow-xl max-h-80 overflow-y-auto mt-1"
                  style={{ top: '280px', left: '24px' }}
                >
                  <div className="p-3 border-b border-gray-200 bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-sm text-gray-600">
                        <FaSearch className="w-4 h-4 mr-2" />
                        <span>
                          {filteredPersonnes.length} personne(s) trouvée(s)
                        </span>
                      </div>
                      <button 
                        onClick={() => setShowDropdown(false)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <FaTimes className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  {filteredPersonnes.map((personne) => {
                    const age = getAge(personne.naiss);
                    return (
                      <div
                        key={personne.matricule || personne.id}
                        className="px-4 py-3 hover:bg-indigo-50 cursor-pointer border-b border-gray-100 transition-colors duration-150"
                        onClick={() => selectPersonne(personne)}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="font-semibold text-gray-800">
                              <span className="text-blue-600">{personne.nom}</span>
                              <span className="ml-2 text-green-600">{personne.prenom}</span>
                            </div>
                            <div className="flex flex-wrap gap-2 mt-2">
                              {personne.matricule && (
                                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                                  Matricule: {personne.matricule}
                                </span>
                              )}
                              {personne.cin && (
                                <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                                  CIN: {personne.cin}
                                </span>
                              )}
                              {personne.naiss && (
                                <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs">
                                  Né(e) le: {new Date(personne.naiss).toLocaleDateString('fr-FR')}
                                  {age && ` (${age} ans)`}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="bg-indigo-100 text-indigo-800 px-2 py-1 rounded text-xs">
                              Sélectionner
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              <Col lg={4}>
                <Form.Group className="mb-2">
                  <Form.Label>Prénom(s) *</Form.Label>
                  <Form.Control 
                    name="prenom" 
                    value={form.prenom} 
                    onChange={handleChange}
                    isInvalid={!!errors.prenom} 
                    disabled={!!selectedPersonne}
                  />
                  <Form.Control.Feedback type="invalid">{errors.prenom}</Form.Control.Feedback>
                </Form.Group>
              </Col>
              
              <Col lg={4}>
                <Form.Group className="mb-2">
                  <Form.Label>Date de naissance *</Form.Label>
                  <Form.Control 
                    type="date" 
                    name="naiss" 
                    value={form.naiss} 
                    onChange={handleChange} 
                    isInvalid={!!errors.naiss} 
                    max={today}
                    disabled={!!selectedPersonne}
                  />
                  <Form.Control.Feedback type="invalid">{errors.naiss}</Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col lg={4}>
                <Form.Group className="mb-2">
                  <Form.Label>Lieu de naissance</Form.Label>
                  <Form.Control 
                    type="text" 
                    name="lieunaiss" 
                    value={form.lieunaiss} 
                    onChange={handleChange} 
                    isInvalid={!!errors.lieunaiss}
                    disabled={!!selectedPersonne}
                  />
                  <Form.Control.Feedback type="invalid">{errors.lieunaiss}</Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col lg={4}>
                <Form.Group className="mb-2">
                  <Form.Label>Sexe *</Form.Label>
                  <Form.Select 
                    name="sexe" 
                    value={form.sexe} 
                    onChange={handleChange} 
                    isInvalid={!!errors.sexe}
                    disabled={!!selectedPersonne}
                  >
                    <option value="">-- Choisir --</option>
                    <option>Masculin</option>
                    <option>Feminin</option>
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">{errors.sexe}</Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col lg={4}>
                <Form.Group className="mb-2">
                  <Form.Label>Adresse Actuelle</Form.Label>
                  <Form.Control 
                    name="adresse" 
                    value={form.adresse} 
                    onChange={handleChange} 
                    isInvalid={!!errors.adresse}
                    disabled={!!selectedPersonne}
                  />
                  <Form.Control.Feedback type="invalid">{errors.adresse}</Form.Control.Feedback>
                </Form.Group>
              </Col>
              
              <Col lg={4}>
                <Form.Group className="mb-2">
                  <Form.Label><b>CIN</b> (12 Chiffres) {estMajeur ? "" : "(Mineur)"}</Form.Label>
                  <Form.Control 
                    name="cin" 
                    value={form.cin} 
                    onChange={handleChange} 
                    isInvalid={!!errors.cin}
                    disabled={!estMajeur || !!selectedPersonne}
                    placeholder="12 chiffres"
                    maxLength={12}
                  />
                  <Form.Control.Feedback type="invalid">{errors.cin}</Form.Control.Feedback>
                </Form.Group>
              </Col>

              <Col lg={4}>
                <Form.Group className="mb-2">
                  <Form.Label>Délivrée le {form.cin && <span className="text-danger">*</span>}</Form.Label>
                  <Form.Control 
                    type="date"  
                    name="datedel" 
                    value={form.datedel} 
                    onChange={handleChange} 
                    isInvalid={!!errors.datedel} 
                    max={today}
                    disabled={!estMajeur || !form.cin || !!selectedPersonne}
                  />
                  <Form.Control.Feedback type="invalid">{errors.datedel}</Form.Control.Feedback>
                </Form.Group>
              </Col>

              <Col lg={4}>
                <Form.Group className="mb-2">
                  <Form.Label>à {form.cin && <span className="text-danger">*</span>}</Form.Label>
                  <Form.Control 
                    type="text" 
                    name="lieucin" 
                    value={form.lieucin} 
                    onChange={handleChange} 
                    isInvalid={!!errors.lieucin}
                    disabled={!estMajeur || !form.cin || !!selectedPersonne}
                  />
                  <Form.Control.Feedback type="invalid">{errors.lieucin}</Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>

            {/* Indicateur de personne sélectionnée */}
            {selectedPersonne && (
              <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-green-700">
                    <FaCheck className="w-5 h-5 mr-2" />
                    <div>
                      <strong>Personne sélectionnée :</strong> {selectedPersonne.nom} {selectedPersonne.prenom}
                      {selectedPersonne.matricule && ` • Matricule: ${selectedPersonne.matricule}`}
                      {selectedPersonne.cin && ` • CIN: ${selectedPersonne.cin}`}
                    </div>
                  </div>
                  <Button 
                    variant="outline-secondary" 
                    size="sm" 
                    onClick={resetSelection}
                    className="flex items-center gap-1"
                  >
                    <FaTimes className="w-3 h-3" />
                    Nouvelle personne
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* --- 2. Informations Parentales --- */}
          <div className="p-6 sm:p-8 rounded-xl shadow-2xl ring-1 ring-gray-200 mb-4">
            <div className="flex items-center text-indigo-600 mb-6 border-b pb-4 border-indigo-100">
              <Users className="w-6 h-6 mr-3" />
              <h5 className="text-center fw-bold">2. Informations Parentales</h5>
            </div>
            <Row>
              <Col lg={6}>
                <Form.Group className="mb-2">
                  <Form.Label>Nom et Prénoms du Père</Form.Label>
                  <Form.Control 
                    name="nompere" 
                    value={form.nompere} 
                    onChange={handleChange} 
                    isInvalid={!!errors.nompere}
                    disabled={!!selectedPersonne}
                  />
                  <Form.Control.Feedback type="invalid">{errors.nompere}</Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col lg={6}>
                <Form.Group className="mb-2">
                  <Form.Label>Nom et Prénoms de la Mère</Form.Label>
                  <Form.Control 
                    name="nommere" 
                    value={form.nommere} 
                    onChange={handleChange} 
                    isInvalid={!!errors.nommere}
                    disabled={!!selectedPersonne}
                  />
                  <Form.Control.Feedback type="invalid">{errors.nommere}</Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col lg={6}>
                <Form.Group className="mb-2">
                  <Form.Label>Adresse actuelle du Parent</Form.Label>
                  <Form.Control 
                    name="adressparent" 
                    value={form.adressparent} 
                    onChange={handleChange} 
                    isInvalid={!!errors.adressparent}
                    disabled={!!selectedPersonne}
                  />
                  <Form.Control.Feedback type="invalid">{errors.adressparent}</Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col lg={6}>
                <Form.Group className="mb-2">
                  <Form.Label>Contact du Parent (10 Chiffres)</Form.Label>
                  <Form.Control 
                    name="phoneparent" 
                    placeholder="ex: 038 38 038 38" 
                    value={form.phoneparent} 
                    onChange={handleChange} 
                    isInvalid={!!errors.phoneparent} 
                    maxLength={10}
                    disabled={!!selectedPersonne}
                  />
                  <Form.Control.Feedback type="invalid">{errors.phoneparent}</Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>
          </div>

          {/* --- 3. Informations du Tuteur --- */}
          <div className="p-6 sm:p-8 rounded-xl shadow-2xl ring-1 ring-gray-200 mb-4">
            <div className="flex items-center text-indigo-600 mb-6 border-b pb-4 border-indigo-100">
              <FaUserAlt className="w-6 h-6 mr-3" />
              <h5 className="text-center fw-bold">3. Informations du Tuteur</h5>
            </div>
            <Row>
              <Col lg={6}>
                <Form.Group className="mb-2">
                  <Form.Label>Nom du Tuteur</Form.Label>
                  <Form.Control 
                    name="nomtuteur" 
                    value={form.nomtuteur} 
                    onChange={handleChange} 
                    isInvalid={!!errors.nomtuteur}
                    disabled={!!selectedPersonne}
                  />
                  <Form.Control.Feedback type="invalid">{errors.nomtuteur}</Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col lg={6}>
                <Form.Group className="mb-2">
                  <Form.Label>Téléphone du Tuteur (10 Chiffres)</Form.Label>
                  <Form.Control 
                    name="phonetuteur" 
                    value={form.phonetuteur} 
                    onChange={handleChange} 
                    isInvalid={!!errors.phonetuteur} 
                    maxLength={10}
                    disabled={!!selectedPersonne}
                  />
                  <Form.Control.Feedback type="invalid">{errors.phonetuteur}</Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col lg={12}>
                <Form.Group className="mb-2">
                  <Form.Label>Adresse du Tuteur</Form.Label>
                  <Form.Control 
                    name="adresstuteur" 
                    value={form.adresstuteur} 
                    onChange={handleChange} 
                    isInvalid={!!errors.adresstuteur}
                    disabled={!!selectedPersonne}
                  />
                  <Form.Control.Feedback type="invalid">{errors.adresstuteur}</Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>
          </div>

          {/* --- 4. Détails de l'Inscription --- */}
          <div className="p-6 sm:p-8 rounded-xl shadow-2xl ring-1 ring-gray-200 mb-4">
            <div className="flex items-center text-indigo-600 mb-6 border-b pb-4 border-indigo-100">
              <UserPlus className="w-6 h-6 mr-3" />
              <h5 className="items-center fw-bold">4. Détails de l'Inscription</h5>
            </div>
            <Row>
              <Col lg={4}>
                <Form.Group className="mb-2">
                  <Form.Label>Date d'inscription *</Form.Label>
                  <Form.Control 
                    type="date" 
                    name="dateinscrit" 
                    value={form.dateinscrit} 
                    onChange={handleChange} 
                    isInvalid={!!errors.dateinscrit} 
                    max={today}
                  />
                  <Form.Control.Feedback type="invalid">{errors.dateinscrit}</Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col lg={4}>
                <Form.Group className="mb-2">
                  <Form.Label>Année scolaire *</Form.Label>
                  <Form.Select 
                    name="anneesco" 
                    value={form.anneesco} 
                    onChange={handleChange} 
                    isInvalid={!!errors.anneesco}
                  >
                    <option value="">-- Choisir l'année scolaire --</option>
                    {generateAnnee().map(a => <option key={a}>{a}</option>)}
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">{errors.anneesco}</Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col lg={4}>
                <Form.Group className="mb-2">
                  <Form.Label>Type d'inscription *</Form.Label>
                  <Form.Select 
                    name="type_inscrit" 
                    value={form.type_inscrit} 
                    onChange={handleChange} 
                    isInvalid={!!errors.type_inscrit}
                  >
                    <option value="">--Choisir le type d'inscription--</option> 
                    <option value="inscription">Inscription</option>
                    <option value="reinscription">Réinscription</option>
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">{errors.type_inscrit}</Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>
          </div>

          {/* --- 5. Choix des niveaux --- */}
          <div className="p-6 sm:p-8 rounded-xl shadow-2xl ring-1 ring-gray-200 mb-4">
            <div className="flex items-center text-indigo-600 mb-6 border-b pb-4 border-indigo-100">
              <FaGraduationCap className="w-6 h-6 mr-3" />
              <h5 className="items-center fw-bold">5. Choix du/des niveau(x) *</h5>
            </div>

            {errors.niveauForm && (
              <p className="text-danger mb-3">{errors.niveauForm}</p>
            )}

            {niveauForm.map((p, i) => (
              <Row key={i} className="align-items-center mb-2">
                <Col lg={5}>
                  <Form.Group className="mb-2">
                    <Form.Select
                      value={p.code_niveau}
                      onChange={(e) =>
                        handleNiveauChange(i, "code_niveau", e.target.value)
                      }
                      isInvalid={!!errors[`code_niveau_${i}`]}
                    >
                      <option value="">-- Choisir niveau --</option>
                      {niveauOption.map((n) => (
                        <option key={n.code_niveau} value={n.code_niveau}>
                          {n.nomniveau}
                        </option>
                      ))}
                    </Form.Select>
                    <Form.Control.Feedback type="invalid">
                      {errors[`code_niveau_${i}`]}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>

                <Col lg={2} className="text-center">
                  <Button variant="outline-danger" onClick={() => removeniveau(i)}>
                    <FaTrash />
                  </Button>
                </Col>
              </Row>
            ))}

            <div className="mb-3">
              <Button
                variant="outline-primary"
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded"
                onClick={() => {
                  if (niveauForm.length >= 1) {
                    alert("⚠️ Vous ne pouvez ajouter qu'un seul niveau.");
                  } else {
                    addNewNiveau();
                  }
                }}
                disabled={niveauForm.length >= 1}
              >
                <FaPlus /> Ajouter niveau
              </Button>
            </div>
          </div>

          {/* BOUTONS */}
          <div className="d-flex justify-content-between mt-4">
            <Button variant="outline-danger" onClick={handleClose}>Annuler</Button>
            <Button type="submit" variant="primary" className="gap-2 px-4 py-2 text-white bg-indigo-600 p-1 rounded">
              {selectedPersonne ? "Mettre à jour l'inscription" : "S'inscrire"}
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default NouvelleInscription;