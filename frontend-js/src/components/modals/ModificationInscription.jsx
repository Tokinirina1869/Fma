import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Modal, Button, Form, Row, Col, Alert, Spinner } from "react-bootstrap";
import axios from "axios";
import { FaPlus, FaTrash, FaGraduationCap,FaTimes,FaUser, FaUserAlt, FaCheck, FaExclamationTriangle } from "react-icons/fa";
import { User, UserPlus, Users, Calendar, MapPin, Phone, Mail } from "lucide-react";
import Swal from "sweetalert2";

const ModificationInscription = ({ show, handleClose, personneData, refreshList }) => {
  const today = new Date().toISOString().split("T")[0];
  const [schoolYears, setSchoolYears] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [touchedFields, setTouchedFields] = useState({});

  const { register, handleSubmit, formState: { errors }, setValue, watch, trigger, clearErrors, setError } = useForm({
    mode: "onChange",
    reValidateMode: "onChange"
  });

  const [form, setForm] = useState({
    matricule: "",
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
    dateinscrit: "",
    anneesco: "",
    duree: "3 mois",
    type_formation: "Court Terme",
    photo: null,
    profileImage: "https://placehold.co/128x128/FFFFFF/000000?text=Photo",
  });

  const [parcoursForm, setParcoursForm] = useState([]);
  const [parcoursOption, setParcoursOption] = useState([]);

  // Observables pour la validation en temps réel
  const watchCin = watch("cin");
  const watchPhoneParent = watch("phoneparent");
  const watchPhoneTuteur = watch("phonetuteur");

  // Validation patterns CORRIGÉS - simplifiés
  const validationPatterns = {
    cin: /^[0-9]*$/,
    phone: /^[0-9]*$/, 
    name: /^[a-zA-ZÀ-ÿ\s'-]*$/,
    location: /^[a-zA-ZÀ-ÿ0-9\s',.()-]*$/,
  };

  // Messages d'erreur
  const errorMessages = {
    required: "Ce champ est obligatoire",
    cin: "Le CIN ne doit contenir que des chiffres",
    phone: "Le numéro ne doit contenir que des chiffres",
    name: "Caractères non autorisés",
    location: "Caractères non autorisés",
    date: "Date invalide",
    futureDate: "La date ne peut pas être dans le futur"
  };

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
  }, []);

  useEffect(() => {
    const currentAnnee = new Date().getFullYear();
    const years = [];
    for (let annee = 2020; annee <= currentAnnee; annee++) {
      years.push(`${annee}-${annee + 1}`);
    }
    setSchoolYears(years.reverse());
  }, []);

  useEffect(() => {
    if (personneData) {
      const personne = personneData.inscription?.personne || {};
      const inscription = personneData.inscription || {};

      const formData = {
        matricule: personne.matricule || "",
        nom: personne.nom || "",
        prenom: personne.prenom || "",
        naiss: personne.naiss || "",
        lieunaiss: personne.lieunaiss || "",
        sexe: personne.sexe || "",
        adresse: personne.adresse || "",
        cin: personne.cin || "",
        datedel: personne.datedel || "",
        lieucin: personne.lieucin || "",
        nompere: personne.nompere || "",
        nommere: personne.nommere || "",
        nomtuteur: personne.nomtuteur || "",
        adressparent: personne.adressparent || "",
        adresstuteur: personne.adresstuteur || "",
        phoneparent: personne.phoneparent || "",
        phonetuteur: personne.phonetuteur || "",
        dateinscrit: inscription.dateinscrit || "",
        anneesco: inscription.anneesco || "",
        duree: personneData.duree || "",
        type_formation: personneData.type_formation || "Court Terme",
        photo: null,
        profileImage: personne.photo
          ? `http://localhost:8000/storage/${personne.photo}`
          : "https://placehold.co/128x128/FFFFFF/000000?text=Photo",
      };

      setForm(formData);
      
      // Set values for react-hook-form
      Object.keys(formData).forEach(key => {
        if (key !== "photo" && key !== "profileImage") {
          setValue(key, formData[key]);
        }
      });

      setParcoursForm(
        personneData.parcours?.map(p => ({
          code_formation: p.code_formation,
          nomformation: p.nomformation,
          datedebut: p.datedebut,
        })) || []
      );
    }
  }, [personneData, setValue]);

  // Validation en temps réel
  useEffect(() => {
    if (watchCin !== undefined) {
      validateCinField("cin", watchCin);
    }
  }, [watchCin]);

  useEffect(() => {
    if (watchPhoneParent !== undefined) {
      validatePhoneField("phoneparent", watchPhoneParent);
    }
  }, [watchPhoneParent]);

  useEffect(() => {
    if (watchPhoneTuteur !== undefined) {
      validatePhoneField("phonetuteur", watchPhoneTuteur);
    }
  }, [watchPhoneTuteur]);

  // Validation CIN - seulement quand le champ est complet
  const validateCinField = (fieldName, value) => {
    if (value && value.length > 0) {
      if (!/^[0-9]+$/.test(value)) {
        setFormErrors(prev => ({ ...prev, [fieldName]: "Le CIN ne doit contenir que des chiffres" }));
      } else if (value.length !== 12) {
        setFormErrors(prev => ({ ...prev, [fieldName]: "Le CIN doit contenir exactement 12 chiffres" }));
      } else {
        setFormErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors[fieldName];
          return newErrors;
        });
      }
    } else {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[fieldName];
        return newErrors;
      });
    }
  };

  // Validation téléphone - seulement quand le champ est complet
  const validatePhoneField = (fieldName, value) => {
    if (value && value.length > 0) {
      if (!/^[0-9]+$/.test(value)) {
        setFormErrors(prev => ({ ...prev, [fieldName]: "Le numéro ne doit contenir que des chiffres" }));
      } else if (value.length !== 10) {
        setFormErrors(prev => ({ ...prev, [fieldName]: "Le numéro doit contenir exactement 10 chiffres" }));
      } else {
        setFormErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors[fieldName];
          return newErrors;
        });
      }
    } else {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[fieldName];
        return newErrors;
      });
    }
  };

  const validateField = (fieldName, value, pattern, errorMessage) => {
    if (value && !pattern.test(value)) {
      setFormErrors(prev => ({ ...prev, [fieldName]: errorMessage }));
    } else {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[fieldName];
        return newErrors;
      });
    }
  };

  const validateDateField = (fieldName, value) => {
    if (value && new Date(value) > new Date()) {
      setFormErrors(prev => ({ ...prev, [fieldName]: errorMessages.futureDate }));
    } else {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[fieldName];
        return newErrors;
      });
    }
  };

  const handleFieldBlur = (fieldName) => {
    setTouchedFields(prev => ({ ...prev, [fieldName]: true }));
    
    // Validation spécifique au blur pour les champs critiques
    if (fieldName === "cin" && form.cin) {
      validateCinField("cin", form.cin);
    } else if ((fieldName === "phoneparent" && form.phoneparent) || (fieldName === "phonetuteur" && form.phonetuteur)) {
      validatePhoneField(fieldName, form[fieldName]);
    }
    
    trigger(fieldName);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    setValue(name, value);

    // Validation pendant la saisie
    if (name === "cin") {
      // Permet la saisie de chiffres uniquement, validation complète au blur
      if (value && !/^[0-9]*$/.test(value)) {
        setFormErrors(prev => ({ ...prev, [name]: "Chiffres uniquement" }));
      } else {
        setFormErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors[name];
          return newErrors;
        });
      }
    }
    else if (name === "phoneparent" || name === "phonetuteur") {
      // Permet la saisie de chiffres uniquement, validation complète au blur
      if (value && !/^[0-9]*$/.test(value)) {
        setFormErrors(prev => ({ ...prev, [name]: "Chiffres uniquement" }));
      } else {
        setFormErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors[name];
          return newErrors;
        });
      }
    }
    else if (name === "nom" || name === "prenom" || name === "nompere" || name === "nommere" || name === "nomtuteur") {
      // Validation très permissive pour les noms
      if (value && !/^[a-zA-ZÀ-ÿ\s'.-]*$/.test(value)) {
        setFormErrors(prev => ({ ...prev, [name]: "Caractères non autorisés" }));
      } else {
        setFormErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors[name];
          return newErrors;
        });
      }
    }
    else if (name === "lieunaiss" || name === "lieucin" || name === "adresse" || name === "adressparent" || name === "adresstuteur") {
      // Validation très permissive pour les adresses
      if (value && !/^[a-zA-ZÀ-ÿ0-9\s',.()-]*$/.test(value)) {
        setFormErrors(prev => ({ ...prev, [name]: "Caractères non autorisés" }));
      } else {
        setFormErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors[name];
          return newErrors;
        });
      }
    }

    // Validation des dates
    if (name.includes("date")) {
      validateDateField(name, value);
    }

    trigger(name);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validation du fichier
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
      const maxSize = 5 * 1024 * 1024; // 5MB

      if (!validTypes.includes(file.type)) {
        Swal.fire({
          icon: 'error',
          title: 'Format invalide',
          text: 'Veuillez sélectionner une image JPEG, PNG ou GIF',
          background: '#1e1e2f',
          color: 'white'
        });
        return;
      }

      if (file.size > maxSize) {
        Swal.fire({
          icon: 'error',
          title: 'Fichier trop volumineux',
          text: 'La taille maximale autorisée est de 5MB',
          background: '#1e1e2f',
          color: 'white'
        });
        return;
      }

      setForm(prev => ({ ...prev, photo: file }));
      const reader = new FileReader();
      reader.onloadend = () => setForm(prev => ({ ...prev, profileImage: reader.result }));
      reader.readAsDataURL(file);
    }
  };

  const handleParcoursChange = (index, field, value) => {
    setParcoursForm(prev => {
      const updated = [...prev];
      updated[index][field] = value;
      
      // Validation de la date de début du parcours
      if (field === "datedebut" && value && new Date(value) > new Date()) {
        setFormErrors(prev => ({ 
          ...prev, 
          [`parcours_${index}_date`]: errorMessages.futureDate 
        }));
      } else {
        setFormErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors[`parcours_${index}_date`];
          return newErrors;
        });
      }
      
      return updated;
    });
  };

  const addNewParcours = () => {
    setParcoursForm(prev => [...prev, { 
      nomformation: "", 
      datedebut: today, 
      code_formation: "" 
    }]);
  };

  const removeImage = () => {
    setForm(prev => ({
      ...prev,
      photo: null,
      profileImage: "https://placehold.co/128x128/FFFFFF/000000?text=Photo",
      uploading: false
    }));
  };
  
  const removeParcours = (index) => {
    setParcoursForm(prev => prev.filter((_, i) => i !== index));
    // Nettoyer les erreurs associées à ce parcours
    setFormErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[`parcours_${index}_formation`];
      delete newErrors[`parcours_${index}_date`];
      return newErrors;
    });
  };

  const validateParcours = () => {
    const parcoursErrors = {};
    
    parcoursForm.forEach((parcours, index) => {
      if (!parcours.nomformation) {
        parcoursErrors[`parcours_${index}_formation`] = "La formation est obligatoire";
      }
      if (!parcours.datedebut) {
        parcoursErrors[`parcours_${index}_date`] = "La date de début est obligatoire";
      } else if (new Date(parcours.datedebut) > new Date()) {
        parcoursErrors[`parcours_${index}_date`] = errorMessages.futureDate;
      }
    });

    setFormErrors(prev => ({ ...prev, ...parcoursErrors }));
    return Object.keys(parcoursErrors).length === 0;
  };

  const onSubmit = async (data) => {
    // Validation finale seulement pour les champs critiques
    const hasFormErrors = Object.keys(formErrors).length > 0;
    const hasParcoursErrors = !validateParcours();
    
    // Validation CIN finale
    if (form.cin && form.cin.length !== 12) {
      setFormErrors(prev => ({ ...prev, cin: "Le CIN doit contenir exactement 12 chiffres" }));
      Swal.fire({
        icon: 'error',
        title: 'CIN incomplet',
        text: 'Le CIN doit contenir exactement 12 chiffres',
        background: '#1e1e2f',
        color: 'white'
      });
      return;
    }

    // Validation téléphone finale
    if (form.phoneparent && form.phoneparent.length !== 10) {
      setFormErrors(prev => ({ ...prev, phoneparent: "Le numéro doit contenir exactement 10 chiffres" }));
      Swal.fire({
        icon: 'error',
        title: 'Numéro incomplet',
        text: 'Le numéro de téléphone doit contenir exactement 10 chiffres',
        background: '#1e1e2f',
        color: 'white'
      });
      return;
    }

    if (form.phonetuteur && form.phonetuteur.length !== 10) {
      setFormErrors(prev => ({ ...prev, phonetuteur: "Le numéro doit contenir exactement 10 chiffres" }));
      Swal.fire({
        icon: 'error',
        title: 'Numéro incomplet',
        text: 'Le numéro de téléphone doit contenir exactement 10 chiffres',
        background: '#1e1e2f',
        color: 'white'
      });
      return;
    }

    if (hasFormErrors || hasParcoursErrors) {
      Swal.fire({
        icon: 'error',
        title: 'Erreurs de validation',
        text: 'Veuillez corriger les erreurs avant de soumettre',
        background: '#1e1e2f',
        color: 'white'
      });
      return;
    }

    if (parcoursForm.length === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Parcours manquant',
        text: 'Veuillez ajouter au moins une formation',
        background: '#1e1e2f',
        color: 'white'
      });
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      Object.keys(form).forEach(key => {
        if (key !== "profileImage" && form[key] !== null) {
          formData.append(key, form[key]);
        }
      });
      
      if (form.photo) formData.append("photo", form.photo);

      // Ajouter les parcours avec validation
      parcoursForm.forEach((p, i) => {
        const selectedParcours = parcoursOption.find(opt => opt.nomformation === p.nomformation);
        const code = selectedParcours ? selectedParcours.code_formation : p.code_formation || '';
        
        formData.append(`parcours[${i}][nomformation]`, p.nomformation);
        formData.append(`parcours[${i}][datedebut]`, p.datedebut);
        formData.append(`parcours[${i}][code_formation]`, code);
      });

      formData.append("_method", "PATCH");

      await axios.post(`http://localhost:8000/api/inscriptionComplete/${form.matricule}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      
      Swal.fire({
        icon: 'success',
        title: 'Modification réussie!',
        text: `Les informations de ${form.nom} ${form.prenom} ont été modifiées avec succès!`,
        background: '#1e1e2f',
        color: 'white',
        timer: 3000,
        showConfirmButton: false,
        position: "bottom",
        toast: true
      });
      
      if (refreshList) refreshList();
      handleClose();
    } catch (error) {
      console.error(error.response?.data || error.message);
      Swal.fire({
        icon: 'error',
        title: 'Erreur de modification',
        text: `Impossible de modifier: ${JSON.stringify(error.response?.data?.errors || error.message)}`,
        background: '#1e1e2f',
        color: 'white',
        showConfirmButton: true,
        position: "center",
      });
    } finally {
      setLoading(false);
    }
  };

  const hasErrors = Object.keys(formErrors).length > 0;

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
            <FaUser className="w-6 h-6" />
            <div>
                <h3 className="text-lg font-bold text-center">Modification de l'information de l'apprenant</h3>
            </div>
        </div>
        <button onClick={handleClose} className="text-white hover:text-gray-200 text-2xl transition">
            <FaTimes className="w-6 h-6" />
        </button>
      </div>
      <Modal.Body style={{ zIndex: 10000, position: 'relative' }}>
        {hasErrors && (
          <Alert variant="warning" className="d-flex align-items-center">
            <FaExclamationTriangle className="me-2" />
            Veuillez corriger les erreurs avant de soumettre le formulaire
          </Alert>
        )}

        <Form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* PHOTO */}
          <div className="text-center mb-4">
            <div className="position-relative d-inline-block">
              <img 
                src={form.profileImage} 
                alt="Profil" 
                className="rounded-circle border-4 border-primary shadow"
                style={{ width: '120px', height: '120px', objectFit: 'cover' }}
              />
              <div className="position-absolute bottom-0 end-0 d-flex flex-column gap-1">
                {/* Bouton pour ajouter / changer l'image */}
                <Form.Label className="btn btn-primary btn-sm rounded-circle cursor-pointer mb-1">
                  <FaPlus />
                  <Form.Control 
                    type="file" 
                    hidden 
                    accept="image/*" 
                    onChange={handleImageUpload} 
                  />
                </Form.Label>

                {/* Bouton pour supprimer l'image */}
                {form.photo && (
                  <Button 
                    variant="outline-danger" 
                    size="sm" 
                    className="rounded-circle p-1"
                    onClick={removeImage}
                    title="Supprimer l'image"
                  >
                    <FaTimes size={12} />
                  </Button>
                )}
              </div>
            </div>
            <div className="mt-2">
              <small className="text-muted">JPEG, PNG, GIF - Max 5MB</small>
            </div>
          </div>

          {/* INFORMATIONS PERSONNELLES */}
          <div className="p-4 rounded-3 shadow-sm border">
            <div className="d-flex align-items-center text-primary mb-3">
              <User size={20} className="me-2" />
              <h6 className="fw-bold mb-0">1. Informations Personnelles</h6>
            </div>
            <Row>
              <Col lg={4}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold">
                    Nom <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    {...register("nom", { required: errorMessages.required })}
                    value={form.nom}
                    onChange={handleChange}
                    onBlur={() => handleFieldBlur("nom")}
                    isInvalid={touchedFields.nom && formErrors.nom}
                    isValid={touchedFields.nom && !formErrors.nom && form.nom}
                  />
                  {touchedFields.nom && formErrors.nom && (
                    <div className="d-flex align-items-center mt-1">
                      <FaExclamationTriangle className="text-danger me-1" size={12} />
                      <small className="text-danger">{formErrors.nom}</small>
                    </div>
                  )}
                  {touchedFields.nom && !formErrors.nom && form.nom && (
                    <div className="d-flex align-items-center mt-1">
                      <FaCheck className="text-success me-1" size={12} />
                      <small className="text-success">Valide</small>
                    </div>
                  )}
                </Form.Group>
              </Col>
              
              <Col lg={4}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold">
                    Prénoms <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    {...register("prenom", { required: errorMessages.required })}
                    value={form.prenom}
                    onChange={handleChange}
                    onBlur={() => handleFieldBlur("prenom")}
                    isInvalid={touchedFields.prenom && formErrors.prenom}
                    isValid={touchedFields.prenom && !formErrors.prenom && form.prenom}
                  />
                  {touchedFields.prenom && formErrors.prenom && (
                    <div className="d-flex align-items-center mt-1">
                      <FaExclamationTriangle className="text-danger me-1" size={12} />
                      <small className="text-danger">{formErrors.prenom}</small>
                    </div>
                  )}
                  {touchedFields.prenom && !formErrors.prenom && form.prenom && (
                    <div className="d-flex align-items-center mt-1">
                      <FaCheck className="text-success me-1" size={12} />
                      <small className="text-success">Valide</small>
                    </div>
                  )}
                </Form.Group>
              </Col>
              
              <Col lg={4}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold">Date de naissance</Form.Label>
                  <div className="position-relative">
                    <Calendar size={16} className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" />
                    <Form.Control
                      type="date"
                      {...register("naiss")}
                      value={form.naiss}
                      onChange={handleChange}
                      onBlur={() => handleFieldBlur("naiss")}
                      max={today}
                      className="ps-5"
                      isInvalid={touchedFields.naiss && formErrors.naiss}
                    />
                  </div>
                  {touchedFields.naiss && formErrors.naiss && (
                    <div className="d-flex align-items-center mt-1">
                      <FaExclamationTriangle className="text-danger me-1" size={12} />
                      <small className="text-danger">{formErrors.naiss}</small>
                    </div>
                  )}
                </Form.Group>
              </Col>
              
              <Col lg={4}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold">Lieu de naissance</Form.Label>
                  <div className="position-relative">
                    <MapPin size={16} className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" />
                    <Form.Control
                      type="text"
                      {...register("lieunaiss")}
                      value={form.lieunaiss}
                      onChange={handleChange}
                      onBlur={() => handleFieldBlur("lieunaiss")}
                      className="ps-5"
                      isInvalid={touchedFields.lieunaiss && formErrors.lieunaiss}
                    />
                  </div>
                  {touchedFields.lieunaiss && formErrors.lieunaiss && (
                    <div className="d-flex align-items-center mt-1">
                      <FaExclamationTriangle className="text-danger me-1" size={12} />
                      <small className="text-danger">{formErrors.lieunaiss}</small>
                    </div>
                  )}
                </Form.Group>
              </Col>
              
              <Col lg={4}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold">Sexe</Form.Label>
                  <Form.Select
                    {...register("sexe")}
                    value={form.sexe}
                    onChange={handleChange}
                  >
                    <option value="">-- Choisir --</option>
                    <option>Masculin</option>
                    <option>Feminin</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              
              <Col lg={4}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold">Adresse Actuelle</Form.Label>
                  <div className="position-relative">
                    <MapPin size={16} className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" />
                    <Form.Control
                      {...register("adresse")}
                      value={form.adresse}
                      onChange={handleChange}
                      onBlur={() => handleFieldBlur("adresse")}
                      className="ps-5"
                      isInvalid={touchedFields.adresse && formErrors.adresse}
                    />
                  </div>
                  {touchedFields.adresse && formErrors.adresse && (
                    <div className="d-flex align-items-center mt-1">
                      <FaExclamationTriangle className="text-danger me-1" size={12} />
                      <small className="text-danger">{formErrors.adresse}</small>
                    </div>
                  )}
                </Form.Group>
              </Col>

              <Col lg={4}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold">CIN</Form.Label>
                  <Form.Control
                    {...register("cin")}
                    value={form.cin}
                    onChange={handleChange}
                    onBlur={() => handleFieldBlur("cin")}
                    isInvalid={touchedFields.cin && formErrors.cin}
                    isValid={touchedFields.cin && !formErrors.cin && form.cin && form.cin.length === 12}
                    placeholder="12 chiffres"
                    maxLength={12}
                  />
                  {touchedFields.cin && formErrors.cin && (
                    <div className="d-flex align-items-center mt-1">
                      <FaExclamationTriangle className="text-danger me-1" size={12} />
                      <small className="text-danger">{formErrors.cin}</small>
                    </div>
                  )}
                  {touchedFields.cin && !formErrors.cin && form.cin && form.cin.length === 12 && (
                    <div className="d-flex align-items-center mt-1">
                      <FaCheck className="text-success me-1" size={12} />
                      <small className="text-success">Valide</small>
                    </div>
                  )}
                </Form.Group>
              </Col>
              
              <Col lg={4}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold">Délivrée le</Form.Label>
                  <Form.Control
                    type="date"
                    {...register("datedel")}
                    value={form.datedel}
                    onChange={handleChange}
                    onBlur={() => handleFieldBlur("datedel")}
                    max={today}
                    disabled={!form.cin}
                    isInvalid={touchedFields.datedel && formErrors.datedel}
                  />
                  {touchedFields.datedel && formErrors.datedel && (
                    <div className="d-flex align-items-center mt-1">
                      <FaExclamationTriangle className="text-danger me-1" size={12} />
                      <small className="text-danger">{formErrors.datedel}</small>
                    </div>
                  )}
                </Form.Group>
              </Col>
              
              <Col lg={4}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold">Lieu de délivrance</Form.Label>
                  <Form.Control
                    type="text"
                    {...register("lieucin")}
                    value={form.lieucin}
                    onChange={handleChange}
                    onBlur={() => handleFieldBlur("lieucin")}
                    disabled={!form.cin}
                    isInvalid={touchedFields.lieucin && formErrors.lieucin}
                  />
                  {touchedFields.lieucin && formErrors.lieucin && (
                    <div className="d-flex align-items-center mt-1">
                      <FaExclamationTriangle className="text-danger me-1" size={12} />
                      <small className="text-danger">{formErrors.lieucin}</small>
                    </div>
                  )}
                </Form.Group>
              </Col>
            </Row>
          </div>

          {/* INFORMATIONS PARENTALES */}
          <div className="p-4 rounded-3 shadow-sm border">
            <div className="d-flex align-items-center text-primary mb-3">
              <Users size={20} className="me-2" />
              <h6 className="fw-bold mb-0">2. Informations Parentales</h6>
            </div>
            <Row>
              <Col lg={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold">Nom et Prénoms du père</Form.Label>
                  <Form.Control
                    {...register("nompere")}
                    value={form.nompere}
                    onChange={handleChange}
                    onBlur={() => handleFieldBlur("nompere")}
                    isInvalid={touchedFields.nompere && formErrors.nompere}
                  />
                  {touchedFields.nompere && formErrors.nompere && (
                    <div className="d-flex align-items-center mt-1">
                      <FaExclamationTriangle className="text-danger me-1" size={12} />
                      <small className="text-danger">{formErrors.nompere}</small>
                    </div>
                  )}
                </Form.Group>
              </Col>
              
              <Col lg={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold">Nom et Prénoms du mère</Form.Label>
                  <Form.Control
                    {...register("nommere")}
                    value={form.nommere}
                    onChange={handleChange}
                    onBlur={() => handleFieldBlur("nommere")}
                    isInvalid={touchedFields.nommere && formErrors.nommere}
                  />
                  {touchedFields.nommere && formErrors.nommere && (
                    <div className="d-flex align-items-center mt-1">
                      <FaExclamationTriangle className="text-danger me-1" size={12} />
                      <small className="text-danger">{formErrors.nommere}</small>
                    </div>
                  )}
                </Form.Group>
              </Col>
              
              <Col lg={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold">Adresse actuelle Parents</Form.Label>
                  <Form.Control
                    {...register("adressparent")}
                    value={form.adressparent}
                    onChange={handleChange}
                    onBlur={() => handleFieldBlur("adressparent")}
                    isInvalid={touchedFields.adressparent && formErrors.adressparent}
                  />
                  {touchedFields.adressparent && formErrors.adressparent && (
                    <div className="d-flex align-items-center mt-1">
                      <FaExclamationTriangle className="text-danger me-1" size={12} />
                      <small className="text-danger">{formErrors.adressparent}</small>
                    </div>
                  )}
                </Form.Group>
              </Col>
              
              <Col lg={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold">Numéro de téléphone du Parent</Form.Label>
                  <div className="position-relative">
                    <Phone size={16} className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" />
                    <Form.Control
                      {...register("phoneparent")}
                      value={form.phoneparent}
                      onChange={handleChange}
                      onBlur={() => handleFieldBlur("phoneparent")}
                      className="ps-5"
                      isInvalid={touchedFields.phoneparent && formErrors.phoneparent}
                      isValid={touchedFields.phoneparent && !formErrors.phoneparent && form.phoneparent && form.phoneparent.length === 10}
                      placeholder="10 chiffres"
                      maxLength={10}
                    />
                  </div>
                  {touchedFields.phoneparent && formErrors.phoneparent && (
                    <div className="d-flex align-items-center mt-1">
                      <FaExclamationTriangle className="text-danger me-1" size={12} />
                      <small className="text-danger">{formErrors.phoneparent}</small>
                    </div>
                  )}
                  {touchedFields.phoneparent && !formErrors.phoneparent && form.phoneparent && form.phoneparent.length === 10 && (
                    <div className="d-flex align-items-center mt-1">
                      <FaCheck className="text-success me-1" size={12} />
                      <small className="text-success">Valide</small>
                    </div>
                  )}
                </Form.Group>
              </Col>
            </Row>
          </div>

          {/* TUTEUR */}
          <div className="p-4 rounded-3 shadow-sm border">
            <div className="d-flex align-items-center text-primary mb-3">
              <FaUserAlt size={16} className="me-2" />
              <h6 className="fw-bold mb-0">3. Informations du Tuteur</h6>
            </div>
            <Row>
              <Col lg={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold">Nom Tuteur</Form.Label>
                  <Form.Control
                    {...register("nomtuteur")}
                    value={form.nomtuteur}
                    onChange={handleChange}
                    onBlur={() => handleFieldBlur("nomtuteur")}
                    isInvalid={touchedFields.nomtuteur && formErrors.nomtuteur}
                  />
                  {touchedFields.nomtuteur && formErrors.nomtuteur && (
                    <div className="d-flex align-items-center mt-1">
                      <FaExclamationTriangle className="text-danger me-1" size={12} />
                      <small className="text-danger">{formErrors.nomtuteur}</small>
                    </div>
                  )}
                </Form.Group>
              </Col>
              
              <Col lg={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold">Téléphone Tuteur</Form.Label>
                  <div className="position-relative">
                    <Phone size={16} className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" />
                    <Form.Control
                      {...register("phonetuteur")}
                      value={form.phonetuteur}
                      onChange={handleChange}
                      onBlur={() => handleFieldBlur("phonetuteur")}
                      className="ps-5"
                      isInvalid={touchedFields.phonetuteur && formErrors.phonetuteur}
                      isValid={touchedFields.phonetuteur && !formErrors.phonetuteur && form.phonetuteur && form.phonetuteur.length === 10}
                      placeholder="10 chiffres"
                      maxLength={10}
                    />
                  </div>
                  {touchedFields.phonetuteur && formErrors.phonetuteur && (
                    <div className="d-flex align-items-center mt-1">
                      <FaExclamationTriangle className="text-danger me-1" size={12} />
                      <small className="text-danger">{formErrors.phonetuteur}</small>
                    </div>
                  )}
                  {touchedFields.phonetuteur && !formErrors.phonetuteur && form.phonetuteur && form.phonetuteur.length === 10 && (
                    <div className="d-flex align-items-center mt-1">
                      <FaCheck className="text-success me-1" size={12} />
                      <small className="text-success">Valide</small>
                    </div>
                  )}
                </Form.Group>
              </Col>
              
              <Col lg={12}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold">Adresse Tuteur</Form.Label>
                  <Form.Control
                    {...register("adresstuteur")}
                    value={form.adresstuteur}
                    onChange={handleChange}
                    onBlur={() => handleFieldBlur("adresstuteur")}
                    isInvalid={touchedFields.adresstuteur && formErrors.adresstuteur}
                  />
                  {touchedFields.adresstuteur && formErrors.adresstuteur && (
                    <div className="d-flex align-items-center mt-1">
                      <FaExclamationTriangle className="text-danger me-1" size={12} />
                      <small className="text-danger">{formErrors.adresstuteur}</small>
                    </div>
                  )}
                </Form.Group>
              </Col>
            </Row>
          </div>

          {/* INSCRIPTION */}
          <div className="p-4 rounded-3 shadow-sm border">
            <div className="d-flex align-items-center text-primary mb-3">
              <UserPlus size={20} className="me-2" />
              <h6 className="fw-bold mb-0">4. Détails de l'Inscription</h6>
            </div>
            <Row>
              <Col lg={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold">Date d'inscription</Form.Label>
                  <Form.Control
                    type="date"
                    {...register("dateinscrit")}
                    value={form.dateinscrit}
                    onChange={handleChange}
                    onBlur={() => handleFieldBlur("dateinscrit")}
                    max={today}
                    isInvalid={touchedFields.dateinscrit && formErrors.dateinscrit}
                  />
                  {touchedFields.dateinscrit && formErrors.dateinscrit && (
                    <div className="d-flex align-items-center mt-1">
                      <FaExclamationTriangle className="text-danger me-1" size={12} />
                      <small className="text-danger">{formErrors.dateinscrit}</small>
                    </div>
                  )}
                </Form.Group>
              </Col>
              
              <Col lg={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold">Année Scolaire</Form.Label>
                  <Form.Select
                    {...register("anneesco")}
                    value={form.anneesco}
                    onChange={handleChange}
                  >
                    <option value="">-- Choisir --</option>
                    {schoolYears.map((y, i) => <option key={i}>{y}</option>)}
                  </Form.Select>
                </Form.Group>
              </Col>
              
              <Col lg={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold">Durée</Form.Label>
                  <Form.Select
                    {...register("duree")}
                    value={form.duree}
                    onChange={handleChange}
                  >
                    <option value="">-- Choisir la durée --</option>
                    <option>3 mois</option>
                    <option>2 ans</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              
              <Col lg={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold">Type de formation</Form.Label>
                  <Form.Select
                    {...register("type_formation")}
                    value={form.type_formation}
                    onChange={handleChange}
                  >
                    <option>Court Terme</option>
                    <option>Long Terme</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
          </div>

          {/* PARCOURS */}
          <div className="p-4 rounded-3 shadow-sm border">
            <div className="d-flex align-items-center text-primary mb-3">
              <FaGraduationCap size={16} className="me-2" />
              <h6 className="fw-bold mb-0">5. Détails de la Formation</h6>
            </div>
            
            {parcoursForm.map((p, i) => (
              <div key={i} className="border rounded p-3 mb-3">
                <Row className="align-items-center">
                  <Col lg={5}>
                    <Form.Group className="mb-2">
                      <Form.Label className="fw-semibold">Formation {i + 1}</Form.Label>
                      <Form.Select 
                        value={p.nomformation} 
                        onChange={e => handleParcoursChange(i, "nomformation", e.target.value)}
                        isInvalid={formErrors[`parcours_${i}_formation`]}
                      >
                        <option value="">-- Choisir formation --</option>
                        {parcoursOption.map((parcours) => (
                          <option key={parcours.code_formation} value={parcours.nomformation}>
                            {parcours.nomformation}
                          </option>
                        ))}
                      </Form.Select>
                      {formErrors[`parcours_${i}_formation`] && (
                        <small className="text-danger">{formErrors[`parcours_${i}_formation`]}</small>
                      )}
                    </Form.Group>
                  </Col>
                  <Col lg={5}>
                    <Form.Group className="mb-2">
                      <Form.Label className="fw-semibold">Date de début</Form.Label>
                      <Form.Control
                        type="date"
                        value={p.datedebut}
                        onChange={e => handleParcoursChange(i, "datedebut", e.target.value)}
                        max={today}
                        isInvalid={formErrors[`parcours_${i}_date`]}
                      />
                      {formErrors[`parcours_${i}_date`] && (
                        <small className="text-danger">{formErrors[`parcours_${i}_date`]}</small>
                      )}
                    </Form.Group>
                  </Col>
                  <Col lg={2} className="text-center">
                    <Button
                      variant="outline-danger"
                      onClick={() => removeParcours(i)}
                      disabled={parcoursForm.length === 1}
                      className="mt-4"
                    >
                      <FaTrash />
                    </Button>
                  </Col>
                </Row>
              </div>
            ))}
            
            <Button
              variant="outline-primary"
              className="d-flex align-items-center gap-2"
              onClick={addNewParcours}
            >
              <FaPlus /> Ajouter une Formation
            </Button>
          </div>

          {/* BOUTONS */}
          <div className="d-flex justify-content-between align-items-center mt-4 pt-3 border-top">
            <Button 
              variant="outline-secondary" 
              onClick={handleClose}
              disabled={loading}
            >
              Annuler
            </Button>
            
            <div className="d-flex align-items-center gap-3">
              {hasErrors && (
                <small className="text-warning">
                  <FaExclamationTriangle className="me-1" />
                  {Object.keys(formErrors).length} erreur(s) à corriger
                </small>
              )}
              
              <Button 
                type="submit" 
                variant="primary" 
                disabled={loading || hasErrors}
                className="d-flex align-items-center gap-2 px-4"
              >
                {loading ? (
                  <>
                    <Spinner animation="border" size="sm" className="me-2" />
                    Modification...
                  </>
                ) : (
                  <>
                    <FaCheck />
                    Modifier l'Inscription
                  </>
                )}
              </Button>
            </div>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default ModificationInscription;