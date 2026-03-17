import React, { useEffect, useState, useMemo } from "react";
import { Modal, Button, Form, Row, Col } from "react-bootstrap";
import axios from "axios";
import { FaGraduationCap, FaPlus, FaTrash, FaUserAlt, FaTimes, FaUserPlus, FaCheck } from "react-icons/fa";
import { User, UserPlus, Users } from "lucide-react";
import Swal from "sweetalert2";

const getInitialFormState = (today) => ({
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
    duree: "",
    type_formation: "Court Terme",
    annee_etude: "", // Nouveau champ pour l'année d'étude (1ère/2ème)
    photo: null,
    profileImage: "https://placehold.co/128x128/FFFFFF/000000?text=Photo",
    uploading: false,
});

const NouvellePersonne = ({ show, handleClose, refreshList }) => {
  const today = new Date().toISOString().split("T")[0];

  const [form, setForm] = useState(getInitialFormState(today));
  const [parcoursForm, setParcoursForm] = useState([]);
  const [errors, setErrors] = useState({});
  const [parcoursOption, setParcoursOption] = useState([]);
  const [touchedFields, setTouchedFields] = useState({});
  const [formErrors, setFormErrors] = useState({});

  // Fonction pour vérifier si la personne est majeure (>= 18 ans)
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

  useEffect(() => {
    const fetchParcours = async () => {
      try {
        const response = await axios.get('http://localhost:8000/api/parcours');
        setParcoursOption(response.data);
      } catch (err) {
        console.error("Erreur lors du chargement des parcours ", err);
      }
    };
    fetchParcours();
    setParcoursForm([]);
  }, [form.duree]);

  // Gestion du blur pour les champs
  const handleFieldBlur = (fieldName) => {
    setTouchedFields(prev => ({
      ...prev,
      [fieldName]: true
    }));
  };

  // Générer années scolaires
  const generateAnnee = () => {
    const currentAnnee = new Date().getFullYear();
    const years = [];
    for (let annee = 2020; annee <= currentAnnee; annee++) {
      years.push(`${annee}-${annee + 1}`);
    }
    return years.reverse();
  };

  const parcoursMap = useMemo(() => {
      return parcoursOption.reduce((acc, p) => {
          acc[p.nomformation] = p.code_formation
            ? p.code_formation.substring(0, 3).toUpperCase()
            : null;
          return acc;
      }, {});
  }, [parcoursOption]);

  // Gestion champs
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));

    setErrors(prev => ({
      ...prev,
      [name] : value.trim() === "" ? "Ce champ est requis " : ""
    }));

    if (name === "cin" && !/^[0-9]{12}$/.test(value)) {
      setErrors(prev => ({ ...prev, cin: "CIN invalide : 12 chiffres" }));
    } else if (name === "cin") {
      setErrors(prev => ({ ...prev, cin: "" }));
    }

    if ((name === "phoneparent" || name === "phonetuteur") && !/^[0-9]{10}$/.test(value)) {
      setErrors(prev => ({ ...prev, [name]: "Numéro invalide : 10 chiffres" }));
    } else if (name === "phoneparent" || name === "phonetuteur") {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const parcoursFiltrés = useMemo(() => {
    return parcoursOption.filter(p => 
      p.duree === form.duree
    );
  }, [parcoursOption, form.duree]);

  const addNewParcours = () => {
    setParcoursForm(prev => [...prev, { nomformation: "", datedebut: today }]);
  };

  const removeParcours = (index) => {
    setParcoursForm(prev => prev.filter((_, i) => i !== index));
  };

  const removeImage = () => {
    setForm(prev => ({
      ...prev,
      photo: null,
      profileImage: "https://placehold.co/128x128/FFFFFF/000000?text=Photo",
      uploading: false
    }));
  };

  // Soumission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // 1️⃣ Validation principale des champs obligatoires
    const newErrors = {};
    const requiredFields = [
      "nom",
      "prenom",
      "naiss",
      "sexe",
      "adresse",
      "dateinscrit",
      "anneesco",
      "duree",
    ];

    requiredFields.forEach((key) => {
      if (!form[key] || form[key].toString().trim() === "") {
        newErrors[key] = "Ce champ est requis!";
      }
    });

    // 2️⃣ Validation du CIN si majeur
    const majeur = isMajeur(form.naiss);
    if (majeur) {
      if (form.cin && !/^[0-9]{12}$/.test(form.cin)) {
        newErrors.cin = "CIN invalide : doit contenir 12 chiffres.";
      }
      if (form.cin) {
        if (!form.datedel) newErrors.datedel = "Date de délivrance requise.";
        if (!form.lieucin) newErrors.lieucin = "Lieu de délivrance requis.";
      }
    }

    // 3️⃣ Validation conditionnelle : année d'étude si durée = 2 ans
    if (form.duree === "2 ans" && !form.annee_etude) {
      newErrors.annee_etude = "Veuillez sélectionner l'année d'étude (1ère ou 2ème)";
    }

    // 4️⃣ Validation des numéros de téléphone
    const checkPhone = (v) => v && !/^[0-9]{10}$/.test(v.replace(/\s/g, ""));
    if (checkPhone(form.phoneparent))
      newErrors.phoneparent = "Numéro invalide : 10 chiffres requis.";
    if (checkPhone(form.phonetuteur))
      newErrors.phonetuteur = "Numéro invalide : 10 chiffres requis.";

    // 5️⃣ Validation des parcours
    if (!parcoursForm.length) {
      newErrors.parcours = "Veuillez ajouter au moins un parcours.";
    } else {
      parcoursForm.forEach((p, i) => {
        if (!p.nomformation)
          newErrors[`parcours_nom_${i}`] = "Formation obligatoire.";
        if (!p.datedebut)
          newErrors[`parcours_date_${i}`] = "Date de début obligatoire.";
      });
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      Swal.fire({
        icon: "error",
        text: "Veuillez corriger les erreurs avant de soumettre.",
        background: "#1e1e2f",
        color: "white",
        timer: 2500,
        showConfirmButton: false,
      });
      return;
    }

    // 6️⃣ Construction du FormData
    try {
      const formData = new FormData();

      Object.entries(form).forEach(([key, value]) => {
        if (key === "photo" && value instanceof File) {
          formData.append(key, value);
        } else if (key !== "profileImage" && key !== "uploading" && value !== null && value !== "") {
          formData.append(key, value);
        }
      });

      // Ajouter code de formation
      const firstFormation = parcoursForm[0]?.nomformation;
      const codeFormation = firstFormation ? parcoursMap[firstFormation] : null;

      if (!codeFormation) {
        Swal.fire({
          icon: "error",
          text: "Le code de la première formation est manquant.",
          background: "#1e1e2f",
          color: "white",
        });
        return;
      }

      formData.append("matricule_code", codeFormation);

      // Ajouter parcours
      parcoursForm.forEach((p, i) => {
        formData.append(`parcours[${i}][nomformation]`, p.nomformation);
        formData.append(`parcours[${i}][datedebut]`, p.datedebut);
      });

      // Envoi
      await axios.post("http://localhost:8000/api/inscriptionComplete", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      Swal.fire({
        icon: "success",
        text: "Nouvelle inscription enregistrée avec succès 🎉",
        background: "#1e1e2f",
        color: "white",
      });

      setForm(getInitialFormState(today));
      setParcoursForm([]);
      setErrors({});
      setFormErrors({});
      setTouchedFields({});
      handleClose();
      refreshList && refreshList();
    } 
    catch (err) {
      console.error("Erreur API:", err);
      if (err.response?.status === 409) {
        Swal.fire({
          icon: "warning",
          title: "Inscription déjà existante",
          text: "Cet élève est déjà inscrit pour cette année scolaire.",
          background: "#1e1e2f",
          color: "white",
        });
      } else {
        Swal.fire({
          icon: "error",
          text: "Erreur lors de l'inscription: " + (err.response?.data?.message || err.message),
          background: "#1e1e2f",
          color: "white",
        });
      }
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    const maxSize = 5 * 1024 * 1024; // 5MB

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
            <h3 className="text-lg font-bold text-center">Nouvelle inscription Professionnelle</h3>
          </div>
        </div>
        <button onClick={handleClose} className="text-white hover:text-gray-200 text-2xl transition">
          <FaTimes className="w-6 h-6" />
        </button>
      </div>

      <Modal.Body style={{ zIndex: 10000, position: 'relative' }}>
        <Form onSubmit={handleSubmit} className="space-y-8">

          {/* Photo de profil */}
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
              <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-lg d-flex justify-content-between items-center">
                <p className="text-sm text-green-700 flex items-center">
                  <FaCheck className="mr-1" /> Photo sélectionnée : {form.photo.name}
                </p>
                <Button variant="outline-danger mx-4" size="sm" onClick={removeImage}>
                  Supprimer
                </Button>
              </div>
            )}
          </div>

          {/* INFORMATIONS PERSONNELLES */}
          <div className="p-6 sm:p-8 rounded-xl shadow-2xl ring-1 ring-gray-200">
            <div className="flex items-center text-indigo-600 mb-6 border-b pb-4 border-indigo-100">
              <User className="w-6 h-6 mr-3" />
              <h5 className="text-center fw-bold">1. Informations Personnel</h5>
            </div>
            <Row>
              <Col lg={4}><Form.Group className="mb-2"><Form.Label>Nom *</Form.Label><Form.Control name="nom" value={form.nom} onChange={handleChange} isInvalid={!!errors.nom} required/><Form.Control.Feedback type="invalid">{errors.nom}</Form.Control.Feedback></Form.Group></Col>
              <Col lg={4}><Form.Group className="mb-2"><Form.Label>Prénom(s) *</Form.Label><Form.Control name="prenom" value={form.prenom} onChange={handleChange} isInvalid={!!errors.prenom} required/><Form.Control.Feedback type="invalid">{errors.prenom}</Form.Control.Feedback></Form.Group></Col>
              <Col lg={4}><Form.Group className="mb-2"><Form.Label>Date de naissance *</Form.Label><Form.Control type="date" name="naiss" value={form.naiss} onChange={handleChange} isInvalid={!!errors.naiss} max={today}/><Form.Control.Feedback type="invalid">{errors.naiss}</Form.Control.Feedback></Form.Group></Col>
              <Col lg={4}><Form.Group className="mb-2" ><Form.Label>Lieu de naissance</Form.Label><Form.Control type="text" name="lieunaiss" value={form.lieunaiss} onChange={handleChange} /></Form.Group></Col>
              <Col lg={4}><Form.Group className="mb-2"><Form.Label>Sexe *</Form.Label><Form.Select name="sexe" value={form.sexe} onChange={handleChange} isInvalid={!!errors.sexe}><option value="">-- Choisir --</option><option>Masculin</option><option>Feminin</option></Form.Select><Form.Control.Feedback type="invalid">{errors.sexe}</Form.Control.Feedback></Form.Group></Col>
              <Col lg={4}><Form.Group className="mb-2"><Form.Label>Adresse Actuelle</Form.Label><Form.Control name="adresse" value={form.adresse} onChange={handleChange} /></Form.Group></Col>

              <Col lg={4}>
                  <Form.Group className="mb-2">
                      <Form.Label><b>CIN</b> (12 Chiffres) {estMajeur ? "" : "(Mineur)"}</Form.Label>
                      <Form.Control
                          name="cin"
                          value={form.cin}
                          onChange={handleChange}
                          isInvalid={!!errors.cin}
                          disabled={!estMajeur}
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
                          disabled={!estMajeur || !form.cin}
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
                          disabled={!estMajeur || !form.cin}
                      />
                      <Form.Control.Feedback type="invalid">{errors.lieucin}</Form.Control.Feedback>
                  </Form.Group>
              </Col>
            </Row>
          </div>

          {/* INFORMATIONS PARENTALES */}
          <div className="p-6 sm:p-8 rounded-xl shadow-2xl ring-1 ring-gray-200">
            <div className="flex items-center text-indigo-600 mb-6 border-b pb-4 border-indigo-100">
              <Users className="w-6 h-6 mr-3" />
              <h5 className="text-center fw-bold">2. Informations Parentales</h5>
            </div>
            <Row>
              <Col lg={6}><Form.Group className="mb-2"><Form.Label>Nom et Prénoms du père</Form.Label><Form.Control name="nompere" value={form.nompere} onChange={handleChange}/></Form.Group></Col>
              <Col lg={6}><Form.Group className="mb-2"><Form.Label>Nom et Prénoms du mère</Form.Label><Form.Control name="nommere" value={form.nommere} onChange={handleChange}/></Form.Group></Col>
              <Col lg={6}><Form.Group className="mb-2"><Form.Label>Adresse actuelle Parents</Form.Label><Form.Control name="adressparent" value={form.adressparent} onChange={handleChange}/></Form.Group></Col>
              <Col lg={6}><Form.Group className="mb-2"><Form.Label>Numéro de téléphone du Parent</Form.Label><Form.Control name="phoneparent" value={form.phoneparent} onChange={handleChange}/>{errors.phoneparent && <small className="text-danger">{errors.phoneparent}</small>}</Form.Group></Col>
            </Row>
          </div>

          {/* INFORMATIONS DU TUTEUR */}
          <div className="p-6 sm:p-8 rounded-xl shadow-2xl ring-1 ring-gray-200">
            <div className="flex items-center text-indigo-600 mb-6 border-b pb-4 border-indigo-100">
              <FaUserAlt className="w-6 h-6 mr-3" />
              <h5 className="text-center fw-bold">3. Informations du Tuteur</h5>
            </div>
            <Row>
              <Col lg={6}><Form.Group className="mb-2"><Form.Label>Nom Tuteur</Form.Label><Form.Control name="nomtuteur" value={form.nomtuteur} onChange={handleChange}/></Form.Group></Col>
              <Col lg={6}><Form.Group className="mb-2"><Form.Label>Téléphone Tuteur</Form.Label><Form.Control name="phonetuteur" value={form.phonetuteur} onChange={handleChange}/>{errors.phonetuteur && <small className="text-danger">{errors.phonetuteur}</small>}</Form.Group></Col>
              <Col lg={12}><Form.Group className="mb-2"><Form.Label>Adresse Tuteur</Form.Label><Form.Control name="adresstuteur" value={form.adresstuteur} onChange={handleChange}/></Form.Group></Col>
            </Row>
          </div>

          {/* DÉTAILS DE L'INSCRIPTION */}
          <div className="p-6 sm:p-8 rounded-xl shadow-2xl ring-1 ring-gray-200">
            <div className="flex items-center text-indigo-600 mb-6 border-b pb-4 border-indigo-100">
              <UserPlus className="w-6 h-6 mr-3" />
              <h5 className="items-center fw-bold">4. Détails de l'Inscription</h5>
            </div>
            <Row>
              <Col lg={6}><Form.Group className="mb-2"><Form.Label>Date d'inscription *</Form.Label><Form.Control type="date" name="dateinscrit" value={form.dateinscrit} onChange={handleChange} isInvalid={!!errors.dateinscrit} /><Form.Control.Feedback type="invalid">{errors.dateinscrit}</Form.Control.Feedback></Form.Group></Col>
              <Col lg={6}><Form.Group className="mb-2"><Form.Label>Année scolaire *</Form.Label><Form.Select name="anneesco" value={form.anneesco} onChange={handleChange} isInvalid={!!errors.anneesco}><option value="">-- Choisir l'année scolaire --</option>{generateAnnee().map(a => <option key={a}>{a}</option>)}</Form.Select><Form.Control.Feedback type="invalid">{errors.anneesco}</Form.Control.Feedback></Form.Group></Col>
              <Col lg={6}><Form.Group className="mb-2"><Form.Label>Durée *</Form.Label><Form.Select name="duree" value={form.duree} onChange={handleChange} isInvalid={!!errors.duree}><option value="">--choisir la durée--</option><option>3 mois</option><option>2 ans</option></Form.Select><Form.Control.Feedback type="invalid">{errors.duree}</Form.Control.Feedback></Form.Group></Col>
              <Col lg={6}><Form.Group className="mb-2"><Form.Label>Type de formation</Form.Label><Form.Select name="type_formation" value={form.type_formation} onChange={handleChange}><option>Court Terme</option><option>Long Terme</option></Form.Select></Form.Group></Col>

              {/* Année d'étude (visible seulement pour les formations de 2 ans) */}
              {form.duree === "2 ans" && (
                <Col lg={6}>
                  <Form.Group className="mb-2">
                    <Form.Label>Année d'étude *</Form.Label>
                    <Form.Select
                      name="annee_etude"
                      value={form.annee_etude}
                      onChange={handleChange}
                      isInvalid={!!errors.annee_etude}
                    >
                      <option value="">-- Choisir l'année --</option>
                      <option value="1ere année">1ère année</option>
                      <option value="2eme année">2ème année</option>
                    </Form.Select>
                    <Form.Control.Feedback type="invalid">{errors.annee_etude}</Form.Control.Feedback>
                  </Form.Group>
                </Col>
              )}
            </Row>
          </div>

          {/* PARCOURS */}
          <div className="p-6 sm:p-8 rounded-xl shadow-2xl ring-1 ring-gray-200">
            <div className="flex items-center text-indigo-600 mb-6 border-b pb-4 border-indigo-100">
              <FaGraduationCap className="w-6 h-6 mr-3" />
              <h5 className="items-center fw-bold">5. Détails de la Formation</h5>
            </div>

            {/* Affichage des checkbox selon la durée */}
            <Row className="mb-3">
              <Col lg={12}>
                <Form.Label>Formations disponibles ({form.duree})</Form.Label>
                <div className="grid grid-cols-2 gap-3">
                  {parcoursOption
                    .filter(p => p.duree === form.duree)
                    .map((p) => (
                      <Form.Check
                        key={p.code_formation}
                        type="checkbox"
                        label={p.nomformation}
                        checked={parcoursForm.some(parcours => parcours.nomformation === p.nomformation)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setParcoursForm(prev => [...prev, { nomformation: p.nomformation, datedebut: today }]);
                          } else {
                            setParcoursForm(prev => prev.filter(parcours => parcours.nomformation !== p.nomformation));
                          }
                        }}
                      />
                    ))}
                </div>
                {errors.parcours && <small className="text-danger">{errors.parcours}</small>}
              </Col>
            </Row>

            {/* Parcours déjà ajoutés avec option suppression */}
            {parcoursForm.map((p, i) => (
              <Row key={i} className="align-items-center mb-2">
                <Col lg={10}>
                  <Form.Control
                    type="text"
                    value={p.nomformation}
                    readOnly
                  />
                </Col>
                <Col lg={2} className="text-center">
                  <Button variant="outline-danger" onClick={() => removeParcours(i)}><FaTrash /></Button>
                </Col>
              </Row>
            ))}

            {parcoursForm.length === 0 && <p className="text-muted">Veuillez sélectionner au moins un parcours.</p>}
          </div>

          {/* Bouton Ajouter Parcours (manuel) - optionnel */}
          <div className="mb-3">
            <Button variant="outline-primary" className="flex items-center gap-2 px-4 py-2 text-white bg-indigo-600 p-1 rounded" onClick={addNewParcours}><FaPlus /> Ajouter Parcours</Button>
          </div>

          {/* BOUTONS DE SOUMISSION */}
          <div className="d-flex justify-content-between mt-4">
            <Button variant="outline-danger" onClick={handleClose}>Annuler</Button>
            <Button type="submit" variant="primary" className="gap-2 px-4 py-2 text-white bg-indigo-600 p-1 rounded">S'inscrire</Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default NouvellePersonne;