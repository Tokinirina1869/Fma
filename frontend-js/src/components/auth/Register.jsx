import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import background from '../../FMA/cfp.jpg';
import { FaEnvelope, FaEye, FaEyeSlash, FaLock, FaUser, FaCheck, FaTimes, FaInfoCircle, FaUserTag, FaCrown, FaUser as FaUserSimple } from 'react-icons/fa';

function Register() {
  const navigate = useNavigate();
  
  // Rôles avec information admin
  const roles = {
    'directrice': {
      label: 'Directrice',
      isAdmin: true,
      icon: <FaCrown className="text-yellow-500" />,
      description: 'Administrateur principal',
      color: 'from-purple-500 to-pink-500'
    },
    'bde': {
      label: "Bureau d'emploi",
      isAdmin: true,
      icon: <FaCrown className="text-blue-500" />,
      description: 'Administrateur',
      color: 'from-blue-500 to-cyan-500'
    },
    'secretaire_lycee': {
      label: 'Secrétaire Lycée',
      isAdmin: false,
      icon: <FaUserSimple className="text-green-500" />,
      description: 'Utilisateur standard',
      color: 'from-green-500 to-emerald-500'
    },
    'secretaire_cfp': {
      label: 'Secrétaire CFP',
      isAdmin: false,
      icon: <FaUserSimple className="text-orange-500" />,
      description: 'Utilisateur standard',
      color: 'from-orange-500 to-amber-500'
    }
  };

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    password_confirmation: "",
    role: "bde"
  });
  
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
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
      case 'name':
        if (!value.trim()) {
          newErrors.name = "Le nom est requis";
        } else if (value.length < 2) {
          newErrors.name = "Le nom doit contenir au moins 2 caractères";
        } else if (!/^[a-zA-ZÀ-ÿ\s]+$/.test(value)) {
          newErrors.name = "Le nom ne doit contenir que des lettres";
        } else {
          delete newErrors.name;
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
        
        if (touched.password_confirmation) {
          validateField('password_confirmation', formData.password_confirmation);
        }
        break;
        
      case 'password_confirmation':
        if (!value) {
          newErrors.password_confirmation = "La confirmation est requise";
        } else if (value !== formData.password) {
          newErrors.password_confirmation = "Les mots de passe ne correspondent pas";
        } else {
          delete newErrors.password_confirmation;
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
    
    if (touched[name]) {
      validateField(name, value);
    }
  };

  // Gestion du blur
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
           formData.name && 
           formData.email && 
           formData.password && 
           formData.password_confirmation &&
           formData.role;
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

  // Fonction pour obtenir la couleur du badge rôle
  const getRoleBadgeClass = (role) => {
    const roleInfo = roles[role];
    if (roleInfo.isAdmin) {
      return 'bg-gradient-to-r from-yellow-100 to-yellow-50 text-yellow-800 border border-yellow-200';
    }
    return 'bg-gradient-to-r from-gray-100 to-gray-50 text-gray-700 border border-gray-200';
  };

  // Fonction pour obtenir l'icône du rôle
  const getRoleIcon = (role) => {
    return roles[role]?.icon || <FaUserTag />;
  };

  // Fonction pour obtenir la couleur de fond du rôle
  const getRoleCardClass = (role) => {
    const roleInfo = roles[role];
    return `bg-gradient-to-br ${roleInfo.color} border-2 ${formData.role === role ? 'border-white ring-4 ring-blue-300' : 'border-transparent'}`;
  };

  // Fonction pour obtenir la couleur du rôle (pour les badges)
  const getRoleColor = (role) => {
    switch(role) {
      case 'directrice': return 'bg-purple-100 text-purple-800';
      case 'bde': return 'bg-blue-100 text-blue-800';
      case 'secretaire_lycee': return 'bg-green-100 text-green-800';
      case 'secretaire_cfp': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Soumission du formulaire
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    if (formData.role === 'directrice' || formData.role === 'bde') {
      // Avertir l'utilisateur que ce rôle est unique
      const roleName = formData.role === 'directrice' ? 'Directrice' : 'BDE';
      const confirmMessage = `Le rôle "${roleName}" ne peut être attribué qu'à une seule personne. Êtes-vous sûr de vouloir créer ce compte ?`;
      
      if (!window.confirm(confirmMessage)) {
          setLoading(false);
          return;
      }
    }
    // Marquer tous les champs comme touchés
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
      console.log('🔄 Envoi des données à l\'API:', formData);
      
      const response = await fetch('http://localhost:8000/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          password_confirmation: formData.password_confirmation,
          role: formData.role
        }),
      });

      console.log('📥 Réponse reçue, status:', response.status);
      
      const data = await response.json();
      console.log('📄 Données de réponse:', data);

      if (!response.ok) {
        // Gestion des erreurs Laravel
        if (data.errors) {
          const formattedErrors = {};
          Object.keys(data.errors).forEach(key => {
            if (Array.isArray(data.errors[key])) {
              formattedErrors[key] = data.errors[key][0];
            } else {
              formattedErrors[key] = data.errors[key];
            }
          });
          setErrors(formattedErrors);
          setMessage("Ce role est déjà inseré à la base de données et une personne uniquement peut avoir ce role.");
        } else if (data.message) {
          setMessage(data.message);
        } else {
          setMessage('Erreur lors de l\'inscription');
        }
        return;
      }

      // Succès
      setMessage("✅ Compte créé avec succès ! Redirection vers la connexion...");
      
      // Stocker le token si présent
      if (data.token) {
        localStorage.setItem('token', data.token);
        console.log('🔑 Token stocké dans localStorage');
      }
      if (data.user) {
        localStorage.setItem('user', JSON.stringify(data.user));
        console.log('👤 Utilisateur stocké dans localStorage');
      }
      
      // Redirection après 2 secondes
      setTimeout(() => {
        navigate('/login');
      }, 2000);
      
    } catch (err) {
      console.error('❌ Erreur complète:', err);
      if (err.name === 'TypeError' && err.message.includes('Failed to fetch')) {
        setMessage("❌ Impossible de se connecter au serveur. Vérifiez que le serveur Laravel est démarré.");
      } else {
        setMessage(err.message || "❌ Erreur lors de la création du compte");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="d-flex align-items-center justify-content-center bg-light z-[999] py-4" 
      style={{ 
        backgroundImage: `url(${background})`,
        backgroundSize: 'cover', 
        backgroundPosition: 'center', 
        backgroundRepeat: 'no-repeat' 
      }}
    >
      <div 
        className="card shadow-lg p-4 bg-white" 
        style={{ 
          width: '100%', 
          maxWidth: "550px", 
          minWidth: '300px',
          backdropFilter: 'blur(10px)'
        }}
      >
        <div className="text-center mb-4">
          <h4 className="fw-bold bg-blue-700 py-4 text-white rounded mb-3">Créer un compte</h4>
          <p className="text-muted">Choisissez votre rôle dans la plateforme</p>
        </div>

        {/* Section Sélection de rôle améliorée */}
        <div className="mb-4">
          <label className="form-label text-blue-600 fw-bold d-flex align-items-center gap-2">
            <FaUserTag /> Type de compte
          </label>
          
          {/* Badge de rôle sélectionné */}
          {formData.role && (
            <div className={`mb-3 p-3 ${getRoleBadgeClass(formData.role)} rounded-lg d-flex align-items-center justify-content-between`}>
              <div className="d-flex align-items-center gap-3">
                <div className="fs-4">
                  {getRoleIcon(formData.role)}
                </div>
                <div>
                  <h6 className="mb-0 fw-bold">{roles[formData.role].label}</h6>
                  <small className="text-muted">{roles[formData.role].description}</small>
                  {roles[formData.role].isAdmin && (
                    <span className="badge bg-warning text-dark ms-2">Admin</span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Grid de sélection des rôles */}
          <div className="row g-3">
            {Object.entries(roles).map(([value, roleInfo]) => (
              <div key={value} className="col-6">
                <div 
                  className={`card h-100 cursor-pointer transition-all ${getRoleCardClass(value)} ${formData.role === value ? 'shadow-lg' : 'hover:shadow-md'}`}
                  onClick={() => setFormData(prev => ({ ...prev, role: value }))}
                  style={{ 
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                >
                  <div className="card-body text-center p-3">
                    <div className="mb-2 fs-3">
                      {roleInfo.icon}
                    </div>
                    <h6 className="mb-1 text-white fw-bold">{roleInfo.label}</h6>
                    <small className="text-white opacity-75 d-block">{roleInfo.description}</small>
                    {roleInfo.isAdmin && (
                      <span className="badge bg-white text-dark mt-2 small">
                        Administrateur
                      </span>
                    )}
                    {formData.role === value && (
                      <div className="mt-2">
                        <FaCheck className="text-white" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Légende */}
          <div className="mt-3 p-3 bg-light rounded">
            <div className="row">
              <div className="col-6">
                <div className="d-flex align-items-center gap-2">
                  <FaCrown className="text-yellow-500" />
                  <small className="text-muted">Compte administrateur</small>
                </div>
              </div>
              <div className="col-6">
                <div className="d-flex align-items-center gap-2">
                  <FaUserSimple className="text-gray-500" />
                  <small className="text-muted">Compte utilisateur</small>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Messages */}
        {message && !message.includes('✅') && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded">
            <div className="d-flex align-items-start">
              <FaTimes className="text-red-500 mt-1 me-2" />
              <div>
                <p className="text-red-800 mb-0">{message}</p>
              </div>
            </div>
          </div>
        )}

        {message && message.includes('✅') && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded">
            <div className="d-flex align-items-start">
              <FaCheck className="text-green-500 mt-1 me-2" />
              <div>
                <p className="text-green-800 mb-0">{message}</p>
              </div>
            </div>
          </div>
        )}

        {/* Formulaire */}
        <form onSubmit={handleSubmit} noValidate>
          {/* Champ Nom */}
          <div className="mb-3">
            <label htmlFor="name" className="form-label text-blue-600 fw-bold">
              Nom complet
            </label>
            <div className="input-group">
              <span className="input-group-text">
                <FaUser className="text-muted" />
              </span>
              <input 
                type="text" 
                name="name" 
                className={`form-control ${touched.name ? (errors.name ? 'is-invalid' : 'is-valid') : ''}`}
                value={formData.name}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Votre nom complet"
                required
              />
              {touched.name && !errors.name && formData.name && (
                <span className="input-group-text text-success">
                  <FaCheck />
                </span>
              )}
            </div>
            {touched.name && errors.name && (
              <div className="invalid-feedback d-block">
                <FaTimes className="me-1" size={12} />
                {errors.name}
              </div>
            )}
          </div>

          {/* Champ Email */}
          <div className="mb-3">
            <label className="form-label text-blue-600 fw-bold">
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
            <label className="form-label text-blue-600 fw-bold">
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

            {/* Indicateur de force */}
            {formData.password && (
              <div className="mt-2">
                <div className="progress mb-2" style={{ height: '5px' }}>
                  <div 
                    className={`progress-bar bg-${getPasswordStrengthColor()}`}
                    style={{ width: `${getPasswordStrengthPercent()}%` }}
                  ></div>
                </div>
                <small className={`text-${getPasswordStrengthColor()} fw-bold`}>
                  Force: {passwordStrength}/{Object.keys(passwordCriteria).length}
                </small>
              </div>
            )}

            {/* Critères */}
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

          {/* Confirmation */}
          <div className="mb-4">
            <label className="form-label text-blue-600 fw-bold">
              Confirmation du mot de passe
            </label>
            <div className="input-group">
              <span className="input-group-text">
                <FaLock className="text-muted" />
              </span>
              <input 
                type={showConfirmPass ? "text" : "password"} 
                name="password_confirmation"
                className={`form-control ${touched.password_confirmation ? (errors.password_confirmation ? 'is-invalid' : 'is-valid') : ''}`}
                value={formData.password_confirmation}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Confirmez votre mot de passe"
                required
              />
              <button 
                type="button"
                className="btn btn-outline-secondary"
                onClick={() => setShowConfirmPass(!showConfirmPass)}
              >
                {showConfirmPass ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            {touched.password_confirmation && errors.password_confirmation && (
              <div className="invalid-feedback d-block">
                <FaTimes className="me-1" size={12} />
                {errors.password_confirmation}
              </div>
            )}
          </div>

          {/* Bouton de soumission */}
          <div className="d-flex flex-column gap-3">
            <button 
              type="submit" 
              className="btn btn-primary w-100 rounded-pill py-2 fw-bold"
              disabled={loading || !isFormValid()}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2"></span>
                  Création...
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

        {/* Footer */}
        <div className="mt-4 pt-3 border-top text-center">
          <p className="text-xs text-muted mb-0">
            © {new Date().getFullYear()} Plateforme de Gestion Administrative
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register;