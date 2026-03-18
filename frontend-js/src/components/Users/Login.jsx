import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import logo from '../../assets/fma.png';
import background from '../../FMA/cfp.jpg';
import { FaEnvelope, FaLock, FaEye, FaEyeSlash, FaCheck, FaTimes, FaInfoCircle } from 'react-icons/fa';
import { AuthContext } from './AuthContext';

function LoginForm() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [rememberMe, setRememberMe] = useState(() => localStorage.getItem('rememberMe') === 'true');

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
  };

  const validateField = (name, value) => {
    const newErrors = { ...errors };
    switch (name) {
      case 'email':
        if (!value.trim()) newErrors.email = "L'email est requis";
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) newErrors.email = "Format d'email invalide";
        else delete newErrors.email;
        break;
      case 'password':
        if (!value) newErrors.password = "Le mot de passe est requis";
        else if (value.length < 6) newErrors.password = "Le mot de passe doit contenir au moins 6 caractères";
        else delete newErrors.password;
        break;
      default: break;
    }
    setErrors(newErrors);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (touched[name]) validateField(name, value);
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    validateField(name, value);
  };

  const isFormValid = () => Object.keys(errors).length === 0 && formData.email && formData.password;

  useEffect(() => {
    if (rememberMe) {
      const savedEmail = localStorage.getItem('savedEmail');
      if (savedEmail) setFormData(prev => ({ ...prev, email: savedEmail }));
    }
  }, [rememberMe]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    const allTouched = Object.keys(formData).reduce((a, k) => ({ ...a, [k]: true }), {});
    setTouched(allTouched);
    Object.keys(formData).forEach(k => validateField(k, formData[k]));
    if (!isFormValid()) {
      setMessage('Veuillez corriger les erreurs avant de vous connecter');
      setLoading(false);
      return;
    }

    try {
      const res = await axios.post('https://fma-inscription.onrender.com/api/login', {
        email: formData.email,
        password: formData.password,
      });

      if (rememberMe) {
        localStorage.setItem('savedEmail', formData.email);
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data.user));
      } else {
        localStorage.removeItem('savedEmail');
        sessionStorage.setItem('token', res.data.token);
        sessionStorage.setItem('user', JSON.stringify(res.data.user));
      }

      axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
      login(res.data.token, res.data.user);

      const userRole = res.data.user.role;
      console.log('User: ', userRole);

      setTimeout(() => navigate('/page'), 1500);
    } catch (err) {
      if (err.response?.status === 401) setMessage('Email ou mot de passe incorrect ❌');
      else if (err.response?.status === 422) {
        const v = err.response.data.errors;
        if (v.email) setErrors(p => ({ ...p, email: v.email[0] }));
        if (v.password) setErrors(p => ({ ...p, password: v.password[0] }));
        setMessage('Données de connexion invalides');
      } else if (err.response?.status === 429) setMessage('Trop de tentatives de connexion. Veuillez réessayer plus tard.');
      else if (err.code === 'NETWORK_ERROR' || !err.response) setMessage('Erreur réseau. Vérifiez votre connexion internet.');
      else setMessage('Erreur de connexion. Veuillez réessayer.');
      console.error('Erreur de connexion:', err);
    } finally {
      setLoading(false);
    }
  };

  const getAlertStyle = () => {
    if (message.includes('réussie') || message.includes('succès') || message.includes('Redirection'))
      return 'bg-green-50 border border-green-200 text-green-700';
    if (message.includes('incorrect') || message.includes('invalides') || message.includes('erreur') || message.includes('tentatives'))
      return 'bg-red-50 border border-red-200 text-red-700';
    return 'bg-blue-50 border border-blue-200 text-blue-700';
  };

  const getInputBorderClass = (field) => {
    if (!touched[field]) return 'border-gray-300 focus:border-indigo-600 focus:ring-indigo-100';
    if (errors[field]) return 'border-red-400 focus:border-red-400 focus:ring-red-100';
    return 'border-green-400 focus:border-green-400 focus:ring-green-100';
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center relative"
      style={{
        backgroundImage: `url(${background})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      {/* Dark indigo overlay */}
      <div className="absolute inset-0 bg-indigo-950/75" />

      {/* Card */}
      <div className="relative z-10 w-full max-w-md mx-4">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">

          {/* Top gradient bar */}
          <div className="h-1.5 bg-gradient-to-r from-indigo-400 via-indigo-600 to-indigo-800" />

          {/* Indigo header section */}
          <div className="bg-indigo-600 px-8 pt-8 pb-12 flex flex-col items-center">
            <div className="w-20 h-20 rounded-full ring-4 ring-white/30 ring-offset-4 ring-offset-indigo-600 overflow-hidden shadow-xl mb-4">
              <img src={logo} alt="Logo" className="w-full h-full object-cover" />
            </div>
            <h1 className="text-2xl font-bold text-white tracking-wide">Laura Vicuña</h1>
            <p className="text-indigo-200 text-sm mt-1">Connectez-vous à votre compte</p>
          </div>

          {/* Wave cutout */}
          <div className="-mt-6">
            <svg viewBox="0 0 400 48" className="w-full block" preserveAspectRatio="none" height="48">
              <path d="M0,0 C100,48 300,48 400,0 L400,48 L0,48 Z" fill="white" />
            </svg>
          </div>

          {/* Form body */}
          <div className="px-8 pb-8 -mt-2">
            <form onSubmit={handleSubmit} noValidate className="space-y-4">

              {/* Email field */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest mb-1.5">
                  Adresse e-mail
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                    <FaEnvelope size={13} />
                  </span>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="votre@email.com"
                    required
                    className={`w-full pl-9 pr-9 py-2.5 rounded-xl border text-sm bg-gray-50 text-gray-800 placeholder-gray-400 outline-none focus:ring-2 focus:bg-white transition-all duration-200 ${getInputBorderClass('email')}`}
                  />
                  {touched.email && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2">
                      {errors.email
                        ? <FaTimes className="text-red-400" size={11} />
                        : formData.email && <FaCheck className="text-green-500" size={11} />}
                    </span>
                  )}
                </div>
                {touched.email && errors.email && (
                  <p className="mt-1.5 flex items-center gap-1 text-xs text-red-500">
                    <FaTimes size={9} /> {errors.email}
                  </p>
                )}
              </div>

              {/* Password field */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest mb-1.5">
                  Mot de passe
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                    <FaLock size={13} />
                  </span>
                  <input
                    type={showPass ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Votre mot de passe"
                    required
                    className={`w-full pl-9 pr-10 py-2.5 rounded-xl border text-sm bg-gray-50 text-gray-800 placeholder-gray-400 outline-none focus:ring-2 focus:bg-white transition-all duration-200 ${getInputBorderClass('password')}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(p => !p)}
                    tabIndex="-1"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-indigo-600 transition-colors duration-200"
                  >
                    {showPass ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
                  </button>
                </div>
                {touched.password && errors.password && (
                  <p className="mt-1.5 flex items-center gap-1 text-xs text-red-500">
                    <FaTimes size={9} /> {errors.password}
                  </p>
                )}
              </div>

              {/* Alert message */}
              {message && (
                <div className={`rounded-xl px-4 py-2.5 text-sm text-center font-medium ${getAlertStyle()}`}>
                  {message}
                </div>
              )}

              {/* Submit button */}
              <button
                type="submit"
                disabled={loading || !isFormValid()}
                className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] text-white font-semibold text-sm tracking-wide shadow-md hover:shadow-lg hover:shadow-indigo-200 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    Connexion en cours…
                  </>
                ) : 'Se connecter'}
              </button>

              {/* Register link */}
              <p className="text-center text-sm text-gray-500 pt-1">
                Nouveau sur la plateforme ?{' '}
                <Link to="/register" className="text-indigo-600 font-semibold hover:underline">
                  Créer un compte
                </Link>
              </p>

              {/* Info hint */}
              <div className="flex items-center gap-2.5 bg-indigo-50 border border-indigo-100 rounded-xl px-4 py-3 mt-1">
                <FaInfoCircle className="text-indigo-400 flex-shrink-0" size={13} />
                <span className="text-xs text-indigo-500">
                  Utilisez vos identifiants pour vous connecter
                </span>
              </div>

            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export function Login() {
  return <LoginForm />;
}

export default Login;

