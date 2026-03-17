import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import logo from '../../assets/fma.png';
import background from '../../FMA/cfp.jpg';
import { FaEnvelope, FaLock, FaEye, FaEyeSlash, FaCheck, FaTimes, FaInfoCircle, FaSignInAlt } from 'react-icons/fa';
import { AuthContext } from './AuthContext';

function LoginForm({ roles }) {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState();
  const [showPass, setShowPass] = useState(false);
  const [rememberMe, setRememberMe] = useState(() => {
    return localStorage.getItem('rememberMe') === 'true';
  });

  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const getRedirectPathByRole = (role) => {
    switch (role) {
      case 'directrice':
      case 'bde':
        return '/dash_global';
      case 'secretaire_lycee':
        return '/dash_eleve';
      case 'secretaire_cfp':
        return '/dash_formation';
      default:
        return '/page';
    }
  }

  // Validation en temps réel
  const validateField = (name, value) => {
    const newErrors = { ...errors };
    
    switch (name) {
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
        if (!value) {
          newErrors.password = "Le mot de passe est requis";
        } else if (value.length < 6) {
          newErrors.password = "Le mot de passe doit contenir au moins 6 caractères";
        } else {
          delete newErrors.password;
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
           formData.email && 
           formData.password;
  };

  // Remplir automatiquement les champs si "Se souvenir de moi" était coché
  useEffect(() => {
    if (rememberMe) {
      const savedEmail = localStorage.getItem('savedEmail');
      if (savedEmail) {
        setFormData(prev => ({ ...prev, email: savedEmail }));
      }
    }
  }, [rememberMe]);

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
      setMessage("Veuillez corriger les erreurs avant de vous connecter");
      setLoading(false);
      return;
    }

    try {
      const res = await axios.post("/api/login", {
        email: formData.email,
        password: formData.password
      });

      // Sauvegarde de l'email si "Se souvenir de moi" est coché
      if (rememberMe) {
        localStorage.setItem('savedEmail', formData.email);
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("user", JSON.stringify(res.data.user));
      } 
      else {
        localStorage.removeItem('savedEmail');
        sessionStorage.setItem("token", res.data.token);
        sessionStorage.setItem("user", JSON.stringify(res.data.user));
      }


      // Configuration d'Axios pour inclure le token dans les futures requêtes
      axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;

      // Utilisation du contexte
      login(res.data.token, res.data.user);

      const userRole = res.data.user.role;
      console.log('User: ', userRole);
      setRole(userRole);

      setTimeout(() => {
        navigate('/page');
      }, 1500);

    } catch(err) {
      // Gestion unifiée des erreurs
      if (err.response?.status === 401) {
        setMessage('Email ou mot de passe incorrect ❌');
      } else if (err.response?.status === 422) {
        const validationErrors = err.response.data.errors;
        if (validationErrors.email) {
          setErrors(prev => ({ ...prev, email: validationErrors.email[0] }));
        }
        if (validationErrors.password) {
          setErrors(prev => ({ ...prev, password: validationErrors.password[0] }));
        }
        setMessage('Données de connexion invalides');
      } else if (err.response?.status === 429) {
        setMessage('Trop de tentatives de connexion. Veuillez réessayer plus tard.');
      } else if (err.code === 'NETWORK_ERROR' || !err.response) {
        setMessage('Erreur réseau. Vérifiez votre connexion internet.');
      } else {
        setMessage('Erreur de connexion. Veuillez réessayer.');
      }
      console.error('Erreur de connexion:', err);
    } finally {
      setLoading(false);
    }
  };


  return (
    <div 
      className="d-flex vh-100 align-items-center justify-content-center"
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
          maxWidth: 450,
          backdropFilter: 'blur(10px)'
        }}
      >
        <div className="flex flex-col items-center mb-4">
          <div className="relative">
            <img src={logo} alt="Logo" width={100} className="mb-3 w-32 h-32" />
          </div>
          <h2 className="text-success fw-bold">Laura Vicuna</h2>
          <p className="text-muted">Connectez-vous à votre compte</p>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          {/* Champ Email */}
          <div className="mb-3">
            <label className="form-label fw-bold">
              Votre Adresse e-mail
            </label>
            <div className="input-group">
              <span className="input-group-text">
                <FaEnvelope className="text-muted" />
              </span>
              <input type="email" name="email" className={`form-control ${touched.email ? (errors.email ? 'is-invalid' : 'is-valid') : ''}`} value={formData.email}
                onChange={handleChange} onBlur={handleBlur} placeholder="votre@email.com" required
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
            <label className="form-label fw-bold">
              Votre Mot de Passe
            </label>
            <div className="input-group">
              <span className="input-group-text">
                <FaLock className="text-muted" />
              </span>
              <input type={showPass ? 'text' : 'password'} name="password" className={`form-control ${touched.password ? (errors.password ? 'is-invalid' : 'is-valid') : ''}`} value={formData.password}
                onChange={handleChange} onBlur={handleBlur} placeholder="Votre mot de passe" required
              />
              <button 
                type="button"
                className="btn btn-outline-secondary"
                onClick={() => setShowPass(!showPass)}
                tabIndex="-1"
              >
                {showPass ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            {touched.password && errors.password && (
              <div className="invalid-feedback d-block">
                <FaTimes className="me-1" size={12} />
                {errors.password}
              </div>
            )}
          </div>

          {/* Message général */}
          {message && (
            <div className={`alert ${
              message.includes('réussie') || message.includes('succès') || message.includes('Redirection')
                ? 'alert-success' 
                : message.includes('incorrect') || message.includes('invalides') || message.includes('erreur') || message.includes('tentatives')
                ? 'alert-danger'
                : 'alert-info'
            } text-center`}>
              {message}
            </div>
          )}

          {/* Boutons */}
          <div className="d-flex flex-column gap-3">
            <button 
              type="submit" 
              className="btn btn-primary w-100 rounded-pill py-2 fw-bold"
              disabled={loading || !isFormValid()}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2"></span>
                  Connexion...
                </>
              ) : (
                'Se connecter'
              )}
            </button>
            
            <div className="text-center">
              <span className="text-muted">Nouveau sur la plateforme ? </span>
              <Link to="/register" className="text-decoration-none fw-bold text-primary">
                Créer un compte
              </Link>
            </div>
          </div>

          {/* Informations de démo (optionnel) */}
          <div className="mt-4 p-3 bg-light rounded">
            <small className="text-muted d-flex align-items-center">
              <FaInfoCircle className="me-2" />
              <span>Utilisez vos identifiants pour vous connecter</span>
            </small>
          </div>
        </form>
      </div>
    </div>
  );
}

export function Login() {
  return <LoginForm />;
}

export default Login;