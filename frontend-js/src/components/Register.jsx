import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import logo from '../assets/fma.png';
import background from '../FMA/cfp.jpg';
import { FaEnvelope, FaEye, FaEyeSlash, FaLock, FaUser, FaCheck, FaTimes, FaInfoCircle } from 'react-icons/fa';

function Registers({ navigate }) {
  const [formData, setFormData] = useState({
    nom: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  // Critères de validation du mot de passe
  const passwordCriteria = {
    minLength: { test: (pwd) => pwd.length >= 8, message: "8 caractères minimum" },
    hasUpperCase: { test: (pwd) => /[A-Z]/.test(pwd), message: "1 majuscule" },
    hasLowerCase: { test: (pwd) => /[a-z]/.test(pwd), message: "1 minuscule" },
    hasNumber: { test: (pwd) => /[0-9]/.test(pwd), message: "1 chiffre" },
    hasSpecialChar: { test: (pwd) => /[!@#$%^&*(),.?":{}|<>]/.test(pwd), message: "1 caractère spécial" }
  };

  // Calcul de la force du mot de passe
  const calculatePasswordStrength = (password) => {
    let strength = 0;
    Object.values(passwordCriteria).forEach(criterion => {
      if (criterion.test(password)) strength++;
    });
    return strength;
  };

  // Validation en temps réel
  const validateField = (name, value) => {
    const newErrors = { ...errors };
    
    switch (name) {
      case 'nom':
        if (!value.trim()) {
          newErrors.nom = "Le nom est requis";
        } else if (value.length < 2) {
          newErrors.nom = "Le nom doit contenir au moins 2 caractères";
        } else if (!/^[a-zA-ZÀ-ÿ\s]+$/.test(value)) {
          newErrors.nom = "Le nom ne doit contenir que des lettres";
        } else {
          delete newErrors.nom;
        }
        break;
        
      case 'email':
        if (!value.trim()) {
          newErrors.email = "L'email est requis";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          newErrors.email = "Format d'email invalide";
        } else {
          delete newErrors.email;
        }
        break;
        
      case 'password':
        const strength = calculatePasswordStrength(value);
        setPasswordStrength(strength);
        
        if (!value) {
          newErrors.password = "Le mot de passe est requis";
        } else if (value.length < 8) {
          newErrors.password = "Le mot de passe doit contenir au moins 8 caractères";
        } else if (strength < 3) {
          newErrors.password = "Mot de passe trop faible";
        } else {
          delete newErrors.password;
        }
        
        // Valider aussi la confirmation si elle existe
        if (touched.confirmPassword) {
          validateField('confirmPassword', formData.confirmPassword);
        }
        break;
        
      case 'confirmPassword':
        if (!value) {
          newErrors.confirmPassword = "La confirmation est requise";
        } else if (value !== formData.password) {
          newErrors.confirmPassword = "Les mots de passe ne correspondent pas";
        } else {
          delete newErrors.confirmPassword;
        }
        break;
        
      default:
        break;
    }
    
    setErrors(newErrors);
  };

  // Gestion des changements de champs
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Validation en temps réel si le champ a déjà été touché
    if (touched[name]) {
      validateField(name, value);
    }
  };

  // Gestion du blur (quand l'utilisateur quitte un champ)
  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched(prev => ({
      ...prev,
      [name]: true
    }));
    validateField(name, value);
  };

  // Vérifier si le formulaire est valide
  const isFormValid = () => {
    return Object.keys(errors).length === 0 && 
           formData.nom && 
           formData.email && 
           formData.password && 
           formData.confirmPassword;
  };

  // Couleur de la force du mot de passe
  const getPasswordStrengthColor = () => {
    if (passwordStrength <= 2) return 'danger';
    if (passwordStrength <= 3) return 'warning';
    if (passwordStrength <= 4) return 'info';
    return 'success';
  };

  // Pourcentage de force du mot de passe
  const getPasswordStrengthPercent = () => {
    return (passwordStrength / Object.keys(passwordCriteria).length) * 100;
  };

  // Soumission du formulaire
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    // Marquer tous les champs comme touchés pour afficher toutes les erreurs
    const allTouched = Object.keys(formData).reduce((acc, key) => {
      acc[key] = true;
      return acc;
    }, {});
    setTouched(allTouched);

    // Valider tous les champs
    Object.keys(formData).forEach(key => {
      validateField(key, formData[key]);
    });

    if (!isFormValid()) {
      setMessage("Veuillez corriger les erreurs avant de soumettre");
      setLoading(false);
      return;
    }

    try {
      await axios.post("http://127.0.0.1:8000/api/register", {
        name: formData.nom,
        email: formData.email,
        password: formData.password,
        password_confirmation: formData.confirmPassword
      });

      setMessage("Compte créé avec succès ! Redirection...");
      
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      if (err.response?.data?.errors) {
        // Gestion des erreurs de l'API Laravel
        const apiErrors = err.response.data.errors;
        const formattedErrors = {};
        
        Object.keys(apiErrors).forEach(key => {
          formattedErrors[key] = apiErrors[key][0];
        });
        
        setErrors(formattedErrors);
        setMessage("Veuillez corriger les erreurs ci-dessous");
      } else {
        setMessage("Erreur lors de la création du compte !");
      }
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="d-flex vh-100 align-items-center justify-content-center bg-light" 
      style={{ 
        backgroundImage: `url(${background})`,
        backgroundSize: 'cover', 
        backgroundPosition: 'center', 
        backgroundRepeat: 'no-repeat' 
      }}
    >
      <div 
        className="card shadow p-4 bg-white" 
        style={{ 
          width: '100%', 
          maxWidth: "500px", 
          minWidth: '300px',
          backdropFilter: 'blur(10px)'
        }}
      >
        <div className="flex flex-col items-center mb-4">
            <div className="relative">
              <img src={logo} alt="Logo" width={100} className="mb-3 w-32 h-32" />
            </div>
          <h4 className="text-primary fw-bold">Créer un compte</h4>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          {/* Champ Nom */}
          <div className="mb-3">
            <label htmlFor="nom" className="form-label text-info fw-bold">
              Nom complet
            </label>
            <div className="input-group">
              <span className="input-group-text">
                <FaUser className="text-muted" />
              </span>
              <input 
                type="text" 
                name="nom" 
                className={`form-control ${touched.nom ? (errors.nom ? 'is-invalid' : 'is-valid') : ''}`}
                value={formData.nom}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Votre nom complet"
                required
              />
              {touched.nom && !errors.nom && formData.nom && (
                <span className="input-group-text text-success">
                  <FaCheck />
                </span>
              )}
            </div>
            {touched.nom && errors.nom && (
              <div className="invalid-feedback d-block">
                <FaTimes className="me-1" size={12} />
                {errors.nom}
              </div>
            )}
          </div>

          {/* Champ Email */}
          <div className="mb-3">
            <label className="form-label text-info fw-bold">
              Email
            </label>
            <div className="input-group">
              <span className="input-group-text">
                <FaEnvelope className="text-muted" />
              </span>
              <input 
                type="email" 
                name="email"
                className={`form-control ${touched.email ? (errors.email ? 'is-invalid' : 'is-valid') : ''}`}
                value={formData.email}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="votre@email.com"
                required
              />
              {touched.email && !errors.email && formData.email && (
                <span className="input-group-text text-success">
                  <FaCheck />
                </span>
              )}
            </div>
            {touched.email && errors.email && (
              <div className="invalid-feedback d-block">
                <FaTimes className="me-1" size={12} />
                {errors.email}
              </div>
            )}
          </div>

          {/* Champ Mot de passe */}
          <div className="mb-3">
            <label className="form-label text-info fw-bold">
              Mot de passe
            </label>
            <div className="input-group">
              <span className="input-group-text">
                <FaLock className="text-muted" />
              </span>
              <input 
                type={showPass ? "text" : "password"} 
                name="password"
                className={`form-control ${touched.password ? (errors.password ? 'is-invalid' : 'is-valid') : ''}`}
                value={formData.password}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Créez un mot de passe sécurisé"
                required
              />
              <button 
                type="button"
                className="btn btn-outline-secondary"
                onClick={() => setShowPass(!showPass)}
              >
                {showPass ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>

            {/* Indicateur de force du mot de passe */}
            {formData.password && (
              <div className="mt-2">
                <div className="progress mb-2" style={{ height: '5px' }}>
                  <div 
                    className={`progress-bar bg-${getPasswordStrengthColor()}`}
                    style={{ width: `${getPasswordStrengthPercent()}%` }}
                  ></div>
                </div>
                <small className={`text-${getPasswordStrengthColor()} fw-bold`}>
                  Force du mot de passe: {passwordStrength}/{Object.keys(passwordCriteria).length}
                </small>
              </div>
            )}

            {/* Critères du mot de passe */}
            {touched.password && (
              <div className="mt-2">
                <small className="text-muted d-block mb-1">
                  <FaInfoCircle className="me-1" />
                  Le mot de passe doit contenir:
                </small>
                {Object.entries(passwordCriteria).map(([key, criterion]) => (
                  <div 
                    key={key} 
                    className={`d-flex align-items-center ${formData.password ? (criterion.test(formData.password) ? 'text-success' : 'text-danger') : 'text-muted'}`}
                  >
                    {formData.password ? (
                      criterion.test(formData.password) ? <FaCheck size={12} /> : <FaTimes size={12} />
                    ) : (
                      <span className="text-muted">•</span>
                    )}
                    <small className="ms-1">{criterion.message}</small>
                  </div>
                ))}
              </div>
            )}

            {touched.password && errors.password && (
              <div className="invalid-feedback d-block">
                <FaTimes className="me-1" size={12} />
                {errors.password}
              </div>
            )}
          </div>

          {/* Confirmation du mot de passe */}
          <div className="mb-4">
            <label className="form-label text-info fw-bold">
              Confirmation du mot de passe
            </label>
            <div className="input-group">
              <span className="input-group-text">
                <FaLock className="text-muted" />
              </span>
              <input 
                type={showPass ? "text" : "password"} 
                name="confirmPassword"
                className={`form-control ${touched.confirmPassword ? (errors.confirmPassword ? 'is-invalid' : 'is-valid') : ''}`}
                value={formData.confirmPassword}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Confirmez votre mot de passe"
                required
              />
              {touched.confirmPassword && !errors.confirmPassword && formData.confirmPassword && (
                <span className="input-group-text text-success">
                  <FaCheck />
                </span>
              )}
            </div>
            {touched.confirmPassword && errors.confirmPassword && (
              <div className="invalid-feedback d-block">
                <FaTimes className="me-1" size={12} />
                {errors.confirmPassword}
              </div>
            )}
          </div>

          {/* Message général */}
          {message && (
            <div className={`alert ${message.includes('succès') ? 'alert-success' : 'alert-danger'} text-center`}>
              {message}
            </div>
          )}

          {/* Actions */}
          <div className="d-flex flex-column gap-3">
            <button 
              type="submit" 
              className="btn btn-primary w-100 rounded-pill py-2 fw-bold"
              disabled={loading || !isFormValid()}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2"></span>
                  Création du compte...
                </>
              ) : (
                "Créer mon compte"
              )}
            </button>
            
            <div className="text-center">
              <Link to="/login" className="text-decoration-none text-muted">
                ← Retour à la connexion
              </Link>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export function Register() {
  const navigate = useNavigate();
  return <Registers navigate={navigate} />;
}

export default Register;