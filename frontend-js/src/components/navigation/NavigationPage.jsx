import React, { useState, useEffect, useContext } from "react";
import { FaHome, FaSignOutAlt, FaComments, FaUser, FaUserGraduate,
  FaUserPlus, FaMoneyCheckAlt, FaSun, FaMoon, FaBars, FaTimes } from "react-icons/fa";
import { Home, School, PersonAdd, MonetizationOn, Logout,
  Brightness4, Brightness7, AccountCircle } from "@mui/icons-material";
import fma from "../../assets/fma.png";
import { AuthContext } from "../Users/AuthContext";

const NavigationPage = ({ handleMenuChange, onLogout, onProfil }) => {
  const { user } = useContext(AuthContext);
  const role = user?.role;

  const [mobileOpen,  setMobileOpen]  = useState(false);
  const [theme,       setTheme]       = useState("light");
  const [anchorEl,    setAnchorEl]    = useState(false); // dropdown profil
  const [activeMenu,  setActiveMenu]  = useState("dashboard");
  const [elevate,     setElevate]     = useState(false);

  /* ── Menu definitions (inchangé) ── */
  const getAllMenus = () => [
    { key: "dashboard",  label: "Dashboard",     icon: <FaHome size={16} /> },
    { key: "eleve",      label: "Lycée",          icon: <FaUserPlus size={16} /> },
    { key: "formation",  label: "CFP",            icon: <FaUserGraduate size={16} /> },
    { key: "paiement",   label: "Paiement",       icon: <FaMoneyCheckAlt size={16} /> },
    { key: "chat",       label: "Conversation",   icon: <FaComments size={16} /> },
  ];

  const getMenusByRole = () => {
    const all = getAllMenus();
    if (role === 'directrice' || role === 'bde') return all;
    if (role === 'secretaire_lycee')  return all.filter(m => ['eleve','paiement','chat'].includes(m.key));
    if (role === 'secretaire_cfp')    return all.filter(m => ['formation','paiement','chat'].includes(m.key));
    return [];
  };

  const allowedMenus = getMenusByRole();

  /* ── Effects (inchangés) ── */
  useEffect(() => {
    if (allowedMenus.length > 0 && !allowedMenus.some(m => m.key === activeMenu)) {
      setActiveMenu(allowedMenus[0].key);
    }
  }, [role]);

  useEffect(() => {
    const handleScroll = () => setElevate(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  /* ── Handlers (inchangés) ── */
  const handleThemeToggle = () => {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    document.documentElement.setAttribute("data-bs-theme", next);
  };

  const handleMenuClick = (name) => {
    handleMenuChange(name);
    setActiveMenu(name);
    setMobileOpen(false);
    setAnchorEl(false);
    const section = document.getElementById(name);
    if (section) section.scrollIntoView({ behavior: "smooth" });
  };

  const isDark = theme === "dark";

  return (
    <>
      {/* ══════════════════════════════════════════
          NAVBAR
      ══════════════════════════════════════════ */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300
        ${isDark ? 'bg-gray-900 text-white' : 'bg-white text-gray-800'}
        ${elevate ? 'shadow-lg' : 'shadow-sm border-b border-gray-100'}`}
      >
        <div className="max-w-screen-xl mx-auto px-4 h-16 flex items-center justify-between gap-4">

          {/* ── Gauche : Hamburger (mobile) + Logo ── */}
          <div className="flex items-center gap-3">
            {/* Hamburger — mobile only */}
            <button
              onClick={() => setMobileOpen(true)}
              className="md:hidden flex items-center justify-center w-9 h-9 rounded-xl hover:bg-gray-100 transition flex-shrink-0"
            >
              <FaBars size={18} className="text-indigo-600" />
            </button>

            {/* Logo + nom */}
            <button
              onClick={() => allowedMenus.some(m => m.key === 'dashboard') && handleMenuClick('dashboard')}
              className="flex items-center gap-2.5 flex-shrink-0"
            >
              <img src={fma} alt="FMA" className="w-9 h-9 rounded-full object-cover ring-2 ring-indigo-200" />
              <span className="font-extrabold text-base leading-tight hidden sm:block">
                FMA Laura Vicuña
              </span>
            </button>
          </div>

          {/* ── Centre : Titre mobile centré ── */}
          <span className="sm:hidden font-extrabold text-sm text-center flex-1 truncate">
            FMA Laura Vicuña
          </span>

          {/* ── Centre : Nav links (desktop) ── */}
          <nav className="hidden md:flex items-center gap-1 flex-1 justify-center">
            {allowedMenus.map((menu) => {
              const active = activeMenu === menu.key;
              return (
                <button
                  key={menu.key}
                  onClick={() => handleMenuClick(menu.key)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200
                    ${active
                      ? 'bg-indigo-600 text-white shadow'
                      : isDark
                        ? 'text-gray-300 hover:bg-gray-800'
                        : 'text-gray-600 hover:bg-indigo-50 hover:text-indigo-700'
                    }`}
                >
                  <span className={active ? 'text-white' : 'text-indigo-500'}>{menu.icon}</span>
                  {menu.label}
                </button>
              );
            })}
          </nav>

          {/* ── Droite : Theme + Avatar ── */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Toggle theme */}
            <button
              onClick={handleThemeToggle}
              className={`w-9 h-9 flex items-center justify-center rounded-xl transition
                ${isDark ? 'bg-gray-800 text-yellow-300 hover:bg-gray-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
              {isDark ? <FaSun size={15} /> : <FaMoon size={15} />}
            </button>

            {/* Avatar + dropdown */}
            <div className="relative">
              <button
                onClick={() => setAnchorEl(p => !p)}
                className="flex items-center justify-center w-9 h-9 rounded-xl overflow-hidden ring-2 ring-indigo-200 hover:ring-indigo-400 transition"
              >
                {user?.photo
                  ? <img src={user.photo} alt={user?.name} className="w-full h-full object-cover" />
                  : <img src={fma} alt="avatar" className="w-full h-full object-cover" />
                }
              </button>

              {/* Dropdown */}
              {anchorEl && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setAnchorEl(false)} />
                  <div className={`absolute right-0 mt-2 w-52 rounded-2xl shadow-xl border z-50 overflow-hidden
                    ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}
                  >
                    {/* User info */}
                    <div className={`px-4 py-3 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
                      <p className="text-xs font-bold text-indigo-600 uppercase tracking-widest">{role}</p>
                      <p className={`text-sm font-semibold truncate ${isDark ? 'text-white' : 'text-gray-800'}`}>
                        {user?.name || 'Utilisateur'}
                      </p>
                      <p className={`text-xs truncate ${isDark ? 'text-gray-400' : 'text-gray-400'}`}>
                        {user?.email}
                      </p>
                    </div>
                    <button
                      onClick={() => { setAnchorEl(false); onProfil(); }}
                      className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition
                        ${isDark ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-50'}`}
                    >
                      <FaUser size={14} className="text-indigo-500" /> Voir le profil
                    </button>
                    <button
                      onClick={() => { setAnchorEl(false); onLogout(); }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-red-500 hover:bg-red-50 transition"
                    >
                      <FaSignOutAlt size={14} /> Se déconnecter
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Accent line */}
        <div className="h-0.5 bg-gradient-to-r from-indigo-600 via-indigo-400 to-transparent" />
      </header>

      {/* ══════════════════════════════════════════
          DRAWER MOBILE
      ══════════════════════════════════════════ */}
      {/* Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Drawer */}
      <aside className={`fixed top-0 left-0 h-full w-64 z-[60] flex flex-col transition-transform duration-300 md:hidden
        ${isDark ? 'bg-gray-900' : 'bg-white'}
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        {/* Drawer header */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <img src={fma} alt="FMA" className="w-10 h-10 rounded-full object-cover ring-2 ring-indigo-200" />
            <div>
              <p className={`font-extrabold text-sm ${isDark ? 'text-white' : 'text-gray-800'}`}>FMA Anjarasoa</p>
              <p className="text-xs text-indigo-500 font-medium capitalize">{role}</p>
            </div>
          </div>
          <button
            onClick={() => setMobileOpen(false)}
            className="w-8 h-8 flex items-center justify-center rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-500 transition"
          >
            <FaTimes size={13} />
          </button>
        </div>

        {/* Drawer nav */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {allowedMenus.map((menu) => {
            const active = activeMenu === menu.key;
            return (
              <button
                key={menu.key}
                onClick={() => handleMenuClick(menu.key)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all
                  ${active
                    ? 'bg-indigo-600 text-white shadow'
                    : isDark
                      ? 'text-gray-300 hover:bg-gray-800'
                      : 'text-gray-600 hover:bg-indigo-50 hover:text-indigo-700'
                  }`}
              >
                <span className={active ? 'text-white' : 'text-indigo-500'}>{menu.icon}</span>
                {menu.label}
              </button>
            );
          })}
        </nav>

        {/* Drawer footer */}
        <div className={`border-t px-3 py-3 space-y-1 ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
          <button
            onClick={handleThemeToggle}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition
              ${isDark ? 'text-gray-300 hover:bg-gray-800' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            {isDark ? <FaSun size={15} className="text-yellow-400" /> : <FaMoon size={15} className="text-indigo-500" />}
            {isDark ? 'Mode clair' : 'Mode sombre'}
          </button>
          <button
            onClick={() => { setMobileOpen(false); onProfil(); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition
              ${isDark ? 'text-gray-300 hover:bg-gray-800' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            <FaUser size={15} className="text-indigo-500" /> Profil
          </button>
          <button
            onClick={() => { setMobileOpen(false); onLogout(); }}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-red-500 hover:bg-red-50 transition"
          >
            <FaSignOutAlt size={15} /> Se déconnecter
          </button>
        </div>
      </aside>

      {/* Spacer (compense la hauteur du header fixe) */}
      <div className="h-16" />
    </>
  );
};

export default NavigationPage;