import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import background from '../../FMA/cfp.jpg';
import {
  FaEnvelope, FaEye, FaEyeSlash, FaLock, FaUser,
  FaCheck, FaTimes, FaInfoCircle, FaUserTag,
  FaCrown, FaUser as FaUserSimple
} from 'react-icons/fa';

function Register() {
  const navigate = useNavigate();

  const roles = {
    directrice: {
      label: 'Directrice',
      isAdmin: true,
      icon: <FaCrown />,
      iconColor: 'text-yellow-400',
      description: 'Administrateur principal',
      gradient: 'from-purple-600 to-pink-500',
      ring: 'ring-purple-300',
    },
    bde: {
      label: "Bureau d'emploi",
      isAdmin: true,
      icon: <FaCrown />,
      iconColor: 'text-sky-300',
      description: 'Administrateur',
      gradient: 'from-sky-500 to-cyan-400',
      ring: 'ring-sky-300',
    },
    secretaire_lycee: {
      label: 'Secrétaire Lycée',
      isAdmin: false,
      icon: <FaUserSimple />,
      iconColor: 'text-emerald-300',
      description: 'Utilisateur standard',
      gradient: 'from-emerald-500 to-teal-400',
      ring: 'ring-emerald-300',
    },
    secretaire_cfp: {
      label: 'Secrétaire CFP',
      isAdmin: false,
      icon: <FaUserSimple />,
      iconColor: 'text-orange-300',
      description: 'Utilisateur standard',
      gradient: 'from-orange-500 to-amber-400',
      ring: 'ring-orange-300',
    },
  };

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
    role: 'bde',
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  const passwordCriteria = {
    minLength:      { test: (p) => p.length >= 8,                          message: '8 caractères minimum' },
    hasUpperCase:   { test: (p) => /[A-Z]/.test(p),                        message: '1 majuscule' },
    hasLowerCase:   { test: (p) => /[a-z]/.test(p),                        message: '1 minuscule' },
    hasNumber:      { test: (p) => /[0-9]/.test(p),                        message: '1 chiffre' },
    hasSpecialChar: { test: (p) => /[!@#$%^&*(),.?":{}|<>]/.test(p),      message: '1 caractère spécial' },
  };

  const calculatePasswordStrength = (password) => {
    let strength = 0;
    Object.values(passwordCriteria).forEach((c) => { if (c.test(password)) strength++; });
    return strength;
  };

  const validateField = (name, value) => {
    const newErrors = { ...errors };
    switch (name) {
      case 'name':
        if (!value.trim())               newErrors.name = 'Le nom est requis';
        else if (value.length < 2)       newErrors.name = 'Le nom doit contenir au moins 2 caractères';
        else if (!/^[a-zA-ZÀ-ÿ\s]+$/.test(value)) newErrors.name = 'Le nom ne doit contenir que des lettres';
        else delete newErrors.name;
        break;
      case 'email':
        if (!value.trim())               newErrors.email = "L'email est requis";
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) newErrors.email = "Format d'email invalide";
        else delete newErrors.email;
        break;
      case 'password': {
        const strength = calculatePasswordStrength(value);
        setPasswordStrength(strength);
        if (!value)           newErrors.password = 'Le mot de passe est requis';
        else if (value.length < 8) newErrors.password = 'Le mot de passe doit contenir au moins 8 caractères';
        else if (strength < 3)    newErrors.password = 'Mot de passe trop faible';
        else delete newErrors.password;
        if (touched.password_confirmation) validateField('password_confirmation', formData.password_confirmation);
        break;
      }
      case 'password_confirmation':
        if (!value)                      newErrors.password_confirmation = 'La confirmation est requise';
        else if (value !== formData.password) newErrors.password_confirmation = 'Les mots de passe ne correspondent pas';
        else delete newErrors.password_confirmation;
        break;
      default: break;
    }
    setErrors(newErrors);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (touched[name]) validateField(name, value);
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    validateField(name, value);
  };

  const isFormValid = () =>
    Object.keys(errors).length === 0 &&
    formData.name && formData.email &&
    formData.password && formData.password_confirmation && formData.role;

  const strengthPercent = (passwordStrength / Object.keys(passwordCriteria).length) * 100;
  const strengthColor =
    passwordStrength <= 2 ? 'bg-red-500' :
    passwordStrength <= 3 ? 'bg-yellow-400' :
    passwordStrength <= 4 ? 'bg-blue-400' : 'bg-green-500';
  const strengthLabel =
    passwordStrength <= 2 ? 'Faible' :
    passwordStrength <= 3 ? 'Moyen' :
    passwordStrength <= 4 ? 'Bon' : 'Excellent';

  const getInputClass = (field) => {
    const base = 'w-full pl-9 pr-9 py-2.5 rounded-xl border text-sm bg-gray-50 text-gray-800 placeholder-gray-400 outline-none focus:ring-2 focus:bg-white transition-all duration-200';
    if (!touched[field]) return `${base} border-gray-300 focus:border-indigo-600 focus:ring-indigo-100`;
    if (errors[field])   return `${base} border-red-400 focus:border-red-400 focus:ring-red-100`;
    return `${base} border-green-400 focus:border-green-400 focus:ring-green-100`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    if (formData.role === 'directrice' || formData.role === 'bde') {
      const roleName = formData.role === 'directrice' ? 'Directrice' : 'BDE';
      if (!window.confirm(`Le rôle "${roleName}" ne peut être attribué qu'à une seule personne. Êtes-vous sûr ?`)) {
        setLoading(false);
        return;
      }
    }

    const allTouched = Object.keys(formData).reduce((a, k) => ({ ...a, [k]: true }), {});
    setTouched(allTouched);
    Object.keys(formData).forEach((k) => validateField(k, formData[k]));

    if (!isFormValid()) {
      setMessage('Veuillez corriger les erreurs avant de soumettre');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('https://fma-inscription.onrender.com/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          password_confirmation: formData.password_confirmation,
          role: formData.role,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.errors) {
          const formattedErrors = {};
          Object.keys(data.errors).forEach((key) => {
            formattedErrors[key] = Array.isArray(data.errors[key]) ? data.errors[key][0] : data.errors[key];
          });
          setErrors(formattedErrors);
          setMessage('Ce rôle est déjà attribué. Une seule personne peut avoir ce rôle.');
        } else {
          setMessage(data.message || "Erreur lors de l'inscription");
        }
        return;
      }

      setMessage('✅ Compte créé avec succès ! Redirection vers la connexion...');
      if (data.token) localStorage.setItem('token', data.token);
      if (data.user)  localStorage.setItem('user', JSON.stringify(data.user));
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      if (err.name === 'TypeError' && err.message.includes('Failed to fetch'))
        setMessage("❌ Impossible de se connecter au serveur. Vérifiez que le serveur Laravel est démarré.");
      else
        setMessage(err.message || '❌ Erreur lors de la création du compte');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center py-8 relative"
      style={{
        backgroundImage: `url(${background})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-indigo-950/75" />

      {/* Card */}
      <div className="relative z-10 w-full max-w-lg mx-4">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">

          {/* Top gradient bar */}
          <div className="h-1.5 bg-gradient-to-r from-indigo-400 via-indigo-600 to-indigo-800" />

          {/* Indigo header */}
          <div className="bg-indigo-600 px-8 pt-7 pb-10 text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-white/20 ring-4 ring-white/30 mb-4">
              <FaUserTag className="text-white text-2xl" />
            </div>
            <h1 className="text-2xl font-bold text-white tracking-wide">Créer un compte</h1>
            <p className="text-indigo-200 text-sm mt-1">Choisissez votre rôle dans la plateforme</p>
          </div>

          {/* Wave separator */}
          <div className="-mt-6">
            <svg viewBox="0 0 400 48" className="w-full block" preserveAspectRatio="none" height="48">
              <path d="M0,0 C100,48 300,48 400,0 L400,48 L0,48 Z" fill="white" />
            </svg>
          </div>

          <div className="px-8 pb-8 -mt-2">

            {/* ── Role selector ── */}
            <div className="mb-5">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest mb-3">
                Type de compte
              </label>

              <div className="grid grid-cols-2 gap-3 mb-3">
                {Object.entries(roles).map(([value, info]) => {
                  const selected = formData.role === value;
                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, role: value }))}
                      className={`relative rounded-xl p-3.5 text-left transition-all duration-200 bg-gradient-to-br ${info.gradient}
                        ${selected
                          ? `ring-4 ${info.ring} shadow-lg scale-[1.02]`
                          : 'opacity-70 hover:opacity-90 hover:scale-[1.01]'
                        }`}
                    >
                      {/* Check badge */}
                      {selected && (
                        <span className="absolute top-2 right-2 bg-white/30 rounded-full p-0.5">
                          <FaCheck className="text-white" size={9} />
                        </span>
                      )}
                      <span className={`text-xl ${info.iconColor} block mb-1.5`}>{info.icon}</span>
                      <p className="text-white font-bold text-sm leading-tight">{info.label}</p>
                      <p className="text-white/75 text-xs mt-0.5">{info.description}</p>
                      {info.isAdmin && (
                        <span className="mt-2 inline-block bg-white/25 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full">
                          Admin
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Legend */}
              <div className="flex items-center gap-6 px-1">
                <div className="flex items-center gap-1.5 text-xs text-gray-400">
                  <FaCrown className="text-yellow-400" size={11} /> Compte administrateur
                </div>
                <div className="flex items-center gap-1.5 text-xs text-gray-400">
                  <FaUserSimple className="text-gray-400" size={11} /> Compte utilisateur
                </div>
              </div>
            </div>

            {/* ── Alert message ── */}
            {message && (
              <div className={`flex items-start gap-2 rounded-xl px-4 py-3 text-sm font-medium mb-4 ${
                message.includes('✅')
                  ? 'bg-green-50 border border-green-200 text-green-700'
                  : 'bg-red-50 border border-red-200 text-red-700'
              }`}>
                {message.includes('✅') ? <FaCheck className="flex-shrink-0 mt-0.5" size={13} /> : <FaTimes className="flex-shrink-0 mt-0.5" size={13} />}
                <span>{message}</span>
              </div>
            )}

            {/* ── Form fields ── */}
            <form onSubmit={handleSubmit} noValidate className="space-y-4">

              {/* Name */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest mb-1.5">
                  Nom complet
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                    <FaUser size={13} />
                  </span>
                  <input
                    type="text" name="name" value={formData.name}
                    onChange={handleChange} onBlur={handleBlur}
                    placeholder="Votre nom complet" required
                    className={getInputClass('name')}
                  />
                  {touched.name && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2">
                      {errors.name ? <FaTimes className="text-red-400" size={11} /> : formData.name && <FaCheck className="text-green-500" size={11} />}
                    </span>
                  )}
                </div>
                {touched.name && errors.name && (
                  <p className="mt-1.5 flex items-center gap-1 text-xs text-red-500"><FaTimes size={9} />{errors.name}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest mb-1.5">
                  Adresse e-mail
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                    <FaEnvelope size={13} />
                  </span>
                  <input
                    type="email" name="email" value={formData.email}
                    onChange={handleChange} onBlur={handleBlur}
                    placeholder="votre@email.com" required
                    className={getInputClass('email')}
                  />
                  {touched.email && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2">
                      {errors.email ? <FaTimes className="text-red-400" size={11} /> : formData.email && <FaCheck className="text-green-500" size={11} />}
                    </span>
                  )}
                </div>
                {touched.email && errors.email && (
                  <p className="mt-1.5 flex items-center gap-1 text-xs text-red-500"><FaTimes size={9} />{errors.email}</p>
                )}
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest mb-1.5">
                  Mot de passe
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                    <FaLock size={13} />
                  </span>
                  <input
                    type={showPass ? 'text' : 'password'} name="password" value={formData.password}
                    onChange={handleChange} onBlur={handleBlur}
                    placeholder="Créez un mot de passe sécurisé" required
                    className={`${getInputClass('password')} pr-10`}
                  />
                  <button type="button" tabIndex="-1" onClick={() => setShowPass((p) => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-indigo-600 transition-colors">
                    {showPass ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
                  </button>
                </div>

                {/* Strength bar */}
                {formData.password && (
                  <div className="mt-2 space-y-1">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full transition-all duration-300 ${strengthColor}`} style={{ width: `${strengthPercent}%` }} />
                      </div>
                      <span className="text-xs font-medium text-gray-500 w-14 text-right">{strengthLabel}</span>
                    </div>
                  </div>
                )}

                {/* Criteria checklist */}
                {touched.password && (
                  <div className="mt-2 p-3 bg-gray-50 rounded-xl border border-gray-100 grid grid-cols-2 gap-1">
                    {Object.entries(passwordCriteria).map(([key, criterion]) => {
                      const ok = formData.password && criterion.test(formData.password);
                      return (
                        <div key={key} className={`flex items-center gap-1.5 text-xs ${ok ? 'text-green-600' : 'text-gray-400'}`}>
                          {ok ? <FaCheck size={9} /> : <FaTimes size={9} />}
                          {criterion.message}
                        </div>
                      );
                    })}
                  </div>
                )}

                {touched.password && errors.password && (
                  <p className="mt-1.5 flex items-center gap-1 text-xs text-red-500"><FaTimes size={9} />{errors.password}</p>
                )}
              </div>

              {/* Confirm password */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest mb-1.5">
                  Confirmation du mot de passe
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                    <FaLock size={13} />
                  </span>
                  <input
                    type={showConfirmPass ? 'text' : 'password'} name="password_confirmation"
                    value={formData.password_confirmation}
                    onChange={handleChange} onBlur={handleBlur}
                    placeholder="Confirmez votre mot de passe" required
                    className={`${getInputClass('password_confirmation')} pr-10`}
                  />
                  <button type="button" tabIndex="-1" onClick={() => setShowConfirmPass((p) => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-indigo-600 transition-colors">
                    {showConfirmPass ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
                  </button>
                </div>
                {touched.password_confirmation && errors.password_confirmation && (
                  <p className="mt-1.5 flex items-center gap-1 text-xs text-red-500"><FaTimes size={9} />{errors.password_confirmation}</p>
                )}
                {touched.password_confirmation && !errors.password_confirmation && formData.password_confirmation && (
                  <p className="mt-1.5 flex items-center gap-1 text-xs text-green-600"><FaCheck size={9} />Les mots de passe correspondent</p>
                )}
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading || !isFormValid()}
                className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] text-white font-semibold text-sm tracking-wide shadow-md hover:shadow-lg hover:shadow-indigo-200 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-1"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    Création en cours…
                  </>
                ) : 'Créer mon compte'}
              </button>

              {/* Back to login */}
              <p className="text-center text-sm text-gray-500 pt-1">
                Déjà inscrit ?{' '}
                <Link to="/login" className="text-indigo-600 font-semibold hover:underline">
                  Se connecter
                </Link>
              </p>

              {/* Footer */}
              <p className="text-center text-xs text-gray-400 pt-2">
                © {new Date().getFullYear()} Plateforme de Gestion Administrative
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;

