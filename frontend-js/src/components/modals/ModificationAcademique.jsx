import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Modal, Button, Form, Row, Col, Alert, Spinner } from "react-bootstrap";
import axios from "axios";
import { FaGraduationCap,FaTimes,FaUser, FaPlus, FaTrash, FaUserAlt, FaCheck, FaExclamationTriangle } from "react-icons/fa";
import { GraduationCap, User, UserPlus, Users, Calendar, MapPin, Phone } from "lucide-react";
import Swal from "sweetalert2";

const url = "http://localhost:8000/api";

const ModificationAcademique = ({ show, handleClose, selectedPersonne: selectedPersonneProp, refreshList }) => {
  const today = new Date().toISOString().split("T")[0];
  const [selectedPersonne, setSelectedPersonne] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [touchedFields, setTouchedFields] = useState({});

  // Règles de validation CORRIGÉES - patterns simplifiés
  const validationRules = {
    nom: {
      required: "Ce champ est obligatoire",
      pattern: {
        value: /^[a-zA-ZÀ-ÿ\s'.-]*$/,
        message: "Caractères non autorisés"
      }
    },
    prenom: {
      required: "Ce champ est obligatoire",
      pattern: {
        value: /^[a-zA-ZÀ-ÿ\s'.-]*$/,
        message: "Caractères non autorisés"
      }
    },
    naiss: {},
    lieunaiss: {
      pattern: {
        value: /^[a-zA-ZÀ-ÿ0-9\s',.()-]*$/,
        message: "Caractères non autorisés"
      }
    },
    sexe: {},
    adresse: {
      pattern: {
        value: /^[a-zA-ZÀ-ÿ0-9\s',.()/&@+#-]*$/,
        message: "Caractères non autorisés"
      }
    },
    cin: {
      pattern: {
        value: /^[0-9]*$/,
        message: "Le CIN ne doit contenir que des chiffres"
      }
    },
    datedel: {},
    lieucin: {
      pattern: {
        value: /^[a-zA-ZÀ-ÿ0-9\s',.()-]*$/,
        message: "Caractères non autorisés"
      }
    },
    nompere: {
      pattern: {
        value: /^[a-zA-ZÀ-ÿ\s'.-]*$/,
        message: "Caractères non autorisés"
      }
    },
    nommere: {
      pattern: {
        value: /^[a-zA-ZÀ-ÿ\s'.-]*$/,
        message: "Caractères non autorisés"
      }
    },
    nomtuteur: {
      pattern: {
        value: /^[a-zA-ZÀ-ÿ\s'.-]*$/,
        message: "Caractères non autorisés"
      }
    },
    adressparent: {
      pattern: {
        value: /^[a-zA-ZÀ-ÿ0-9\s',.()/&@+#-]*$/,
        message: "Caractères non autorisés"
      }
    },
    adresstuteur: {
      pattern: {
        value: /^[a-zA-ZÀ-ÿ0-9\s',.()/&@+#-]*$/,
        message: "Caractères non autorisés"
      }
    },
    phoneparent: {
      pattern: {
        value: /^[0-9]*$/,
        message: "Le numéro ne doit contenir que des chiffres"
      }
    },
    phonetuteur: {
      pattern: {
        value: /^[0-9]*$/,
        message: "Le numéro ne doit contenir que des chiffres"
      }
    },
    dateinscrit: {},
    anneesco: {},
    type_inscrit: {},
  };

  const { register, handleSubmit, formState: { errors }, setValue, watch, trigger } = useForm({
    mode: "onChange",
    reValidateMode: "onChange"
  });

  const [form, setForm] = useState({
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
    type_inscrit: "",
    nomniveau: "",
    code_niveau: "",
    photo: null,
    profileImage: "https://placehold.co/128x128/FFFFFF/000000?text=Photo",
  });

  const [niveauForm, setNiveauForm] = useState([]);
  const [niveauOption, setNiveauOption] = useState([]);

  // Observables pour la validation en temps réel
  const watchCin = watch("cin");
  const watchPhoneParent = watch("phoneparent");
  const watchPhoneTuteur = watch("phonetuteur");
  const watchDateInscrit = watch("dateinscrit");

  useEffect(() => {
    const fetchNiveau = async () => {
      try {
        const response = await axios.get(`${url}/niveau`);
        setNiveauOption(response.data.data);
      } catch (err) {
        console.error("Erreur lors du chargement des niveaux ", err);
      }
    };
    fetchNiveau();
  }, []);

  useEffect(() => {
    if (selectedPersonneProp) {
      setSelectedPersonne(selectedPersonneProp);
    }
  }, [selectedPersonneProp]);

  useEffect(() => {
    if (selectedPersonne) {
      const formData = {
        nom: selectedPersonne.inscription?.personne?.nom || "",
        prenom: selectedPersonne.inscription?.personne?.prenom || "",
        naiss: selectedPersonne.inscription?.personne?.naiss || "",
        lieunaiss: selectedPersonne.inscription?.personne?.lieunaiss || "",
        sexe: selectedPersonne.inscription?.personne?.sexe || "",
        adresse: selectedPersonne.inscription?.personne?.adresse || "",
        cin: selectedPersonne.inscription?.personne?.cin || "",
        datedel: selectedPersonne.inscription?.personne?.datedel || "",
        lieucin: selectedPersonne.inscription?.personne?.lieucin || "",
        nompere: selectedPersonne.inscription?.personne?.nompere || "",
        nommere: selectedPersonne.inscription?.personne?.nommere || "",
        nomtuteur: selectedPersonne.inscription?.personne?.nomtuteur || "",
        adressparent: selectedPersonne.inscription?.personne?.adressparent || "",
        adresstuteur: selectedPersonne.inscription?.personne?.adresstuteur || "",
        phoneparent: selectedPersonne.inscription?.personne?.phoneparent || "",
        phonetuteur: selectedPersonne.inscription?.personne?.phonetuteur || "",
        dateinscrit: selectedPersonne.inscription?.dateinscrit || "",
        anneesco: selectedPersonne.inscription?.anneesco || "",
        type_inscrit: selectedPersonne.type_inscrit || "",
        nomniveau: selectedPersonne.niveau?.nomniveau || "",
        photo: null,
        profileImage: selectedPersonne.inscription?.personne?.photo
          ? `http://localhost:8000/storage/${selectedPersonne.inscription.personne.photo}`
          : "https://placehold.co/128x128/FFFFFF/000000?text=Photo",
      };

      setForm(formData);
      
      // Set values for react-hook-form
      Object.keys(formData).forEach(key => {
        if (key !== "photo" && key !== "profileImage") {
          setValue(key, formData[key]);
        }
      });

      // Préremplir le niveau académique
      if (selectedPersonne.niveau) {
        setNiveauForm([
          {
            nomniveau: selectedPersonne.niveau.nomniveau,
            datedebut: selectedPersonne.inscription?.dateinscrit || "",
            code_niveau: selectedPersonne.niveau.code_niveau || "",
          },
        ]);
      } else {
        setNiveauForm([]);
      }
    }
  }, [selectedPersonne, setValue]);

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

  useEffect(() => {
    if (watchDateInscrit) {
      validateDateField("dateinscrit", watchDateInscrit);
    }
  }, [watchDateInscrit]);

  // Validation CIN
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

  // Validation téléphone
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

  const validateDateField = (fieldName, value) => {
    if (value && new Date(value) > new Date()) {
      setFormErrors(prev => ({ ...prev, [fieldName]: "La date ne peut pas être dans le futur" }));
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

    // Validation des dates
    if (name.includes("date")) {
      validateDateField(name, value);
    }

    trigger(name);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
      const maxSize = 5 * 1024 * 1024;

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

  const handleNiveauChange = (index, field, value) => {
    setNiveauForm(prev => {
      const updated = [...prev];
      updated[index][field] = value;

      if (field === "nomniveau") {
        const niveau = niveauOption.find(n => n.nomniveau === value);
        updated[index].code_niveau = niveau?.code_niveau || "";
        
        if (!value) {
          setFormErrors(prev => ({ 
            ...prev, 
            [`niveau_${index}_formation`]: "La formation est obligatoire" 
          }));
        } else {
          setFormErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors[`niveau_${index}_formation`];
            return newErrors;
          });
        }
      }

      if (field === "datedebut") {
        if (value && new Date(value) > new Date()) {
          setFormErrors(prev => ({ 
            ...prev, 
            [`niveau_${index}_date`]: "La date ne peut pas être dans le futur" 
          }));
        } else {
          setFormErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors[`niveau_${index}_date`];
            return newErrors;
          });
        }
      }

      return updated;
    });
  };

  const addNewNiveau = () => {
    setNiveauForm(prev => [...prev, { 
      nomniveau: "", 
      datedebut: today,
      code_niveau: "" 
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

  const removeNiveau = (index) => {
    setNiveauForm(prev => prev.filter((_, i) => i !== index));
    setFormErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[`niveau_${index}_formation`];
      delete newErrors[`niveau_${index}_date`];
      return newErrors;
    });
  };

  const validateNiveau = () => {
    const niveauErrors = {};
    
    niveauForm.forEach((niveau, index) => {
      if (!niveau.nomniveau) {
        niveauErrors[`niveau_${index}_formation`] = "Le niveau est obligatoire";
      }
      if (!niveau.datedebut) {
        niveauErrors[`niveau_${index}_date`] = "La date de début est obligatoire";
      } else if (new Date(niveau.datedebut) > new Date()) {
        niveauErrors[`niveau_${index}_date`] = "La date ne peut pas être dans le futur";
      }
    });

    setFormErrors(prev => ({ ...prev, ...niveauErrors }));
    return Object.keys(niveauErrors).length === 0;
  };

  const generateAnnee = () => {
    const currentAnnee = new Date().getFullYear();
    const years = [];
    for (let annee = 2020; annee <= currentAnnee; annee++) {
      years.push(`${annee}-${annee + 1}`);
    }
    return years.reverse();
  };

  const onSubmit = async (data) => {
    // Validation finale seulement pour les champs critiques
    const hasFormErrors = Object.keys(formErrors).length > 0;
    const hasNiveauErrors = !validateNiveau();
    
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

    if (hasFormErrors || hasNiveauErrors) {
      Swal.fire({
        icon: 'error',
        title: 'Erreurs de validation',
        text: 'Veuillez corriger les erreurs avant de soumettre',
        background: '#1e1e2f',
        color: 'white'
      });
      return;
    }

    if (niveauForm.length === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Niveau manquant',
        text: 'Veuillez ajouter au moins un niveau',
        background: '#1e1e2f',
        color: 'white'
      });
      return;
    }

    setLoading(true);

    try {
      const niveauxAvecCode = niveauForm.map(n => {
        const niveau = niveauOption.find(opt => opt.nomniveau === n.nomniveau);
        return { ...n, code_niveau: niveau?.code_niveau };
      });

      const formData = new FormData();
      formData.append("_method", "PUT");

      for (const key in form) {
        if (form[key] !== null && form[key] !== undefined && key !== "profileImage") {
          formData.append(key, form[key]);
        }
      }

      if (niveauxAvecCode.length > 0 && niveauxAvecCode[0].code_niveau) {
        formData.append("code_niveau", niveauxAvecCode[0].code_niveau);
      } 

      if (form.photo) {
        formData.append("photo", form.photo);
      }

      await axios.post(
        `${url}/updateacademique/${selectedPersonne.no_inscrit}`,
        formData,
        { 
          headers: { 
            "Content-Type": "multipart/form-data" 
          } 
        }
      );

      Swal.fire({
        icon: "success",
        text: "Données académiques modifiées avec succès !",
        background: "#1e1e2f",
        color: "white",
        showConfirmButton: false,
        timer: 2000,
      });

      if (refreshList) refreshList();
      handleClose();
    } catch (error) {
      console.error(error.response?.data);
      Swal.fire({
        icon: "error",
        title: "Erreur de modification",
        text: error.response?.data?.message || JSON.stringify(error.response?.data?.errors) || "Une erreur inconnue s'est produite.",
        background: "#1e1e2f",
        color: "white",
        showConfirmButton: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const hasErrors = Object.keys(formErrors).length > 0 || Object.keys(errors).length > 0;

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
                  <h3 className="text-lg font-bold text-center">Modification de l'information de l'élève</h3>
              </div>
          </div>
          <button onClick={handleClose} className="text-white hover:text-gray-200 text-2xl transition">
              <FaTimes className="w-6 h-6" />
          </button>
        </div>
          <Modal.Body style={{ zIndex: 10000, position: 'relative' }}>
            {!selectedPersonne ? (
              <div className="text-center py-4">
                <Spinner animation="border" variant="primary" />
                <p className="mt-2 text-muted">Chargement des informations...</p>
              </div>
            ) : (
            <>
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
                        {...register("nom", validationRules.nom)}
                        value={form.nom}
                        onChange={handleChange}
                        onBlur={() => handleFieldBlur("nom")}
                        isInvalid={touchedFields.nom && (formErrors.nom || errors.nom)}
                      />
                      {errors.nom && (
                        <div className="d-flex align-items-center mt-1">
                          <FaExclamationTriangle className="text-danger me-1" size={12} />
                          <small className="text-danger">{errors.nom.message}</small>
                        </div>
                      )}
                      {touchedFields.nom && formErrors.nom && !errors.nom && (
                        <div className="d-flex align-items-center mt-1">
                          <FaExclamationTriangle className="text-danger me-1" size={12} />
                          <small className="text-danger">{formErrors.nom}</small>
                        </div>
                      )}
                      {touchedFields.nom && !formErrors.nom && !errors.nom && form.nom && (
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
                        {...register("prenom", validationRules.prenom)}
                        value={form.prenom}
                        onChange={handleChange}
                        onBlur={() => handleFieldBlur("prenom")}
                        isInvalid={touchedFields.prenom && (formErrors.prenom || errors.prenom)}
                      />
                      {errors.prenom && (
                        <div className="d-flex align-items-center mt-1">
                          <FaExclamationTriangle className="text-danger me-1" size={12} />
                          <small className="text-danger">{errors.prenom.message}</small>
                        </div>
                      )}
                      {touchedFields.prenom && formErrors.prenom && !errors.prenom && (
                        <div className="d-flex align-items-center mt-1">
                          <FaExclamationTriangle className="text-danger me-1" size={12} />
                          <small className="text-danger">{formErrors.prenom}</small>
                        </div>
                      )}
                      {touchedFields.prenom && !formErrors.prenom && !errors.prenom && form.prenom && (
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
                          {...register("lieunaiss", validationRules.lieunaiss)}
                          value={form.lieunaiss}
                          onChange={handleChange}
                          onBlur={() => handleFieldBlur("lieunaiss")}
                          className="ps-5"
                          isInvalid={touchedFields.lieunaiss && (formErrors.lieunaiss || errors.lieunaiss)}
                        />
                      </div>
                      {errors.lieunaiss && (
                        <div className="d-flex align-items-center mt-1">
                          <FaExclamationTriangle className="text-danger me-1" size={12} />
                          <small className="text-danger">{errors.lieunaiss.message}</small>
                        </div>
                      )}
                      {touchedFields.lieunaiss && formErrors.lieunaiss && !errors.lieunaiss && (
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
                        <option value="">-- Choisir le sexe --</option>
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
                          {...register("adresse", validationRules.adresse)}
                          value={form.adresse}
                          onChange={handleChange}
                          onBlur={() => handleFieldBlur("adresse")}
                          className="ps-5"
                          isInvalid={touchedFields.adresse && (formErrors.adresse || errors.adresse)}
                          placeholder="Ex: 123 Rue Principale, Apt 4B"
                        />
                      </div>
                      {errors.adresse && (
                        <div className="d-flex align-items-center mt-1">
                          <FaExclamationTriangle className="text-danger me-1" size={12} />
                          <small className="text-danger">{errors.adresse.message}</small>
                        </div>
                      )}
                      {touchedFields.adresse && formErrors.adresse && !errors.adresse && (
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
                        {...register("cin", validationRules.cin)}
                        value={form.cin}
                        onChange={handleChange}
                        onBlur={() => handleFieldBlur("cin")}
                        isInvalid={touchedFields.cin && (formErrors.cin || errors.cin)}
                        isValid={touchedFields.cin && !formErrors.cin && !errors.cin && form.cin && form.cin.length === 12}
                        placeholder="12 chiffres"
                        maxLength={12}
                      />
                      {errors.cin && (
                        <div className="d-flex align-items-center mt-1">
                          <FaExclamationTriangle className="text-danger me-1" size={12} />
                          <small className="text-danger">{errors.cin.message}</small>
                        </div>
                      )}
                      {touchedFields.cin && formErrors.cin && !errors.cin && (
                        <div className="d-flex align-items-center mt-1">
                          <FaExclamationTriangle className="text-danger me-1" size={12} />
                          <small className="text-danger">{formErrors.cin}</small>
                        </div>
                      )}
                      {touchedFields.cin && !formErrors.cin && !errors.cin && form.cin && form.cin.length === 12 && (
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
                        {...register("lieucin", validationRules.lieucin)}
                        value={form.lieucin}
                        onChange={handleChange}
                        onBlur={() => handleFieldBlur("lieucin")}
                        disabled={!form.cin}
                        isInvalid={touchedFields.lieucin && (formErrors.lieucin || errors.lieucin)}
                      />
                      {errors.lieucin && (
                        <div className="d-flex align-items-center mt-1">
                          <FaExclamationTriangle className="text-danger me-1" size={12} />
                          <small className="text-danger">{errors.lieucin.message}</small>
                        </div>
                      )}
                      {touchedFields.lieucin && formErrors.lieucin && !errors.lieucin && (
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
                        {...register("nompere", validationRules.nompere)}
                        value={form.nompere}
                        onChange={handleChange}
                        onBlur={() => handleFieldBlur("nompere")}
                        isInvalid={touchedFields.nompere && (formErrors.nompere || errors.nompere)}
                      />
                      {errors.nompere && (
                        <div className="d-flex align-items-center mt-1">
                          <FaExclamationTriangle className="text-danger me-1" size={12} />
                          <small className="text-danger">{errors.nompere.message}</small>
                        </div>
                      )}
                      {touchedFields.nompere && formErrors.nompere && !errors.nompere && (
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
                        {...register("nommere", validationRules.nommere)}
                        value={form.nommere}
                        onChange={handleChange}
                        onBlur={() => handleFieldBlur("nommere")}
                        isInvalid={touchedFields.nommere && (formErrors.nommere || errors.nommere)}
                      />
                      {errors.nommere && (
                        <div className="d-flex align-items-center mt-1">
                          <FaExclamationTriangle className="text-danger me-1" size={12} />
                          <small className="text-danger">{errors.nommere.message}</small>
                        </div>
                      )}
                      {touchedFields.nommere && formErrors.nommere && !errors.nommere && (
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
                        {...register("adressparent", validationRules.adressparent)}
                        value={form.adressparent}
                        onChange={handleChange}
                        onBlur={() => handleFieldBlur("adressparent")}
                        isInvalid={touchedFields.adressparent && (formErrors.adressparent || errors.adressparent)}
                        placeholder="Ex: 456 Avenue des Champs-Élysées"
                      />
                      {errors.adressparent && (
                        <div className="d-flex align-items-center mt-1">
                          <FaExclamationTriangle className="text-danger me-1" size={12} />
                          <small className="text-danger">{errors.adressparent.message}</small>
                        </div>
                      )}
                      {touchedFields.adressparent && formErrors.adressparent && !errors.adressparent && (
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
                          {...register("phoneparent", validationRules.phoneparent)}
                          value={form.phoneparent}
                          onChange={handleChange}
                          onBlur={() => handleFieldBlur("phoneparent")}
                          className="ps-5"
                          isInvalid={touchedFields.phoneparent && (formErrors.phoneparent || errors.phoneparent)}
                          isValid={touchedFields.phoneparent && !formErrors.phoneparent && !errors.phoneparent && form.phoneparent && form.phoneparent.length === 10}
                          placeholder="10 chiffres"
                          maxLength={10}
                        />
                      </div>
                      {errors.phoneparent && (
                        <div className="d-flex align-items-center mt-1">
                          <FaExclamationTriangle className="text-danger me-1" size={12} />
                          <small className="text-danger">{errors.phoneparent.message}</small>
                        </div>
                      )}
                      {touchedFields.phoneparent && formErrors.phoneparent && !errors.phoneparent && (
                        <div className="d-flex align-items-center mt-1">
                          <FaExclamationTriangle className="text-danger me-1" size={12} />
                          <small className="text-danger">{formErrors.phoneparent}</small>
                        </div>
                      )}
                      {touchedFields.phoneparent && !formErrors.phoneparent && !errors.phoneparent && form.phoneparent && form.phoneparent.length === 10 && (
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
                        {...register("nomtuteur", validationRules.nomtuteur)}
                        value={form.nomtuteur}
                        onChange={handleChange}
                        onBlur={() => handleFieldBlur("nomtuteur")}
                        isInvalid={touchedFields.nomtuteur && (formErrors.nomtuteur || errors.nomtuteur)}
                      />
                      {errors.nomtuteur && (
                        <div className="d-flex align-items-center mt-1">
                          <FaExclamationTriangle className="text-danger me-1" size={12} />
                          <small className="text-danger">{errors.nomtuteur.message}</small>
                        </div>
                      )}
                      {touchedFields.nomtuteur && formErrors.nomtuteur && !errors.nomtuteur && (
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
                          {...register("phonetuteur", validationRules.phonetuteur)}
                          value={form.phonetuteur}
                          onChange={handleChange}
                          onBlur={() => handleFieldBlur("phonetuteur")}
                          className="ps-5"
                          isInvalid={touchedFields.phonetuteur && (formErrors.phonetuteur || errors.phonetuteur)}
                          isValid={touchedFields.phonetuteur && !formErrors.phonetuteur && !errors.phonetuteur && form.phonetuteur && form.phonetuteur.length === 10}
                          placeholder="10 chiffres"
                          maxLength={10}
                        />
                      </div>
                      {errors.phonetuteur && (
                        <div className="d-flex align-items-center mt-1">
                          <FaExclamationTriangle className="text-danger me-1" size={12} />
                          <small className="text-danger">{errors.phonetuteur.message}</small>
                        </div>
                      )}
                      {touchedFields.phonetuteur && formErrors.phonetuteur && !errors.phonetuteur && (
                        <div className="d-flex align-items-center mt-1">
                          <FaExclamationTriangle className="text-danger me-1" size={12} />
                          <small className="text-danger">{formErrors.phonetuteur}</small>
                        </div>
                      )}
                      {touchedFields.phonetuteur && !formErrors.phonetuteur && !errors.phonetuteur && form.phonetuteur && form.phonetuteur.length === 10 && (
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
                        {...register("adresstuteur", validationRules.adresstuteur)}
                        value={form.adresstuteur}
                        onChange={handleChange}
                        onBlur={() => handleFieldBlur("adresstuteur")}
                        isInvalid={touchedFields.adresstuteur && (formErrors.adresstuteur || errors.adresstuteur)}
                        placeholder="Ex: 789 Boulevard Saint-Germain, 75006 Paris"
                      />
                      {errors.adresstuteur && (
                        <div className="d-flex align-items-center mt-1">
                          <FaExclamationTriangle className="text-danger me-1" size={12} />
                          <small className="text-danger">{errors.adresstuteur.message}</small>
                        </div>
                      )}
                      {touchedFields.adresstuteur && formErrors.adresstuteur && !errors.adresstuteur && (
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
                        <option value="">-- Choisir l'année scolaire --</option>
                        {generateAnnee().map(a => <option key={a}>{a}</option>)}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  
                  <Col lg={12}>
                    <Form.Group className="mb-3">
                      <Form.Label className="fw-semibold">Type d'Inscription</Form.Label>
                      <Form.Select
                        {...register("type_inscrit")}
                        value={form.type_inscrit}
                        onChange={handleChange}
                      >
                        <option value="">-- Choisir le type d'inscription --</option>
                        <option value="Inscription">Inscription</option>
                        <option value="Réinscription">Réinscription</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>
              </div>

              {/* NIVEAU */}
              <div className="p-6 sm:p-8 rounded-xl shadow-2xl ring-1 ring-gray-200 mb-4">
                <div className="flex items-center text-indigo-600 mb-6 border-b pb-4 border-indigo-100">
                  <FaGraduationCap className="w-6 h-6 mr-3" />
                  <h5 className="items-center fw-bold">5. Choix du/des niveau(x) *</h5>
                </div>

                {errors.niveauForm && (
                  <p className="text-danger mb-3">{errors.niveauForm}</p>
                )}

                {/* --- Affichage des niveaux (limité à 1) --- */}
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
                      <Button variant="outline-danger" onClick={() => removeNiveau(i)}>
                        <FaTrash />
                      </Button>
                    </Col>
                  </Row>
                ))}

                {/* --- Bouton Ajouter niveau --- */}
                <div className="mb-3">
                  <Button
                    variant="outline-primary"
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded"
                    onClick={() => {
                      if (niveauForm.length >= 1) {
                        alert("⚠️ Vous ne pouvez ajouter qu’un seul niveau.");
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
                      {Object.keys(formErrors).length + Object.keys(errors).length} erreur(s) à corriger
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
          </>
        )}
      </Modal.Body>
    </Modal>
  );
};

export default ModificationAcademique;