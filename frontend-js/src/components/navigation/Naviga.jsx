import React, { useState } from 'react';
import fma from "../../assets/fma.png";

const NavigationPage = ({ handleMenuChange, onLogout, onProfil, currentUser }) => {
  const [menuState, setMenuState] = useState(false);
  const [theme, setTheme] = useState('light');

  const [showThemeDropdown, setShowThemeDropdown] = useState(false);

  const toggleMenu = () => setMenuState(!menuState);

  // applique le thème sur <html>
  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
    document.documentElement.setAttribute('data-bs-theme', newTheme);
  };

  const menus = [
    { type: 'link', name: 'dashboard', icon: <i className="fa-solid fa-home mx-1"></i> },
    {
      type: 'dropdown', name: 'inscription', icon: <i className="fa-solid fa-user-plus mx-1"></i>, items: [
        { name: "Académique", value: "eleve" },
        { name: "Professionnelle", value: "formation" },
      ]
    },
    { type: 'link', name: 'paiement', icon: <i className="fa-solid fa-money-check-alt mx-1"></i> }
  ];

  const getInitialName = (name) => {
    if(!name) return "?";
    return name.charAt(0).toUpperCase();
  }

  return (
    <header
      className={`navbar navbar-expand-md shadow py-3 px-4 bg-${theme === 'dark' ? 'dark' : 'light'} navbar-${theme === 'dark' ? 'dark' : 'light'}`}>
      <div className="container-fluid">
        <img src={fma} alt="FMA" width={50} className='me-2' />
        <h4 className="fw-bold text-primary text-center mb-2">FMA Anjarasoa Ankofafa</h4>
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse"
          data-bs-target="#navbarNav" aria-controls="navbarNav" aria-label="Toggle navigation" aria-expanded={menuState ? "true" : "false"} onClick={toggleMenu}>
          {menuState ? (
            <span style={{ fontSize: "2.2rem", color: "red" }}>&#x2715;</span>
          ) : (
            <span className="navbar-toggler-icon"></span>
          )}
        </button>

        <div className={`collapse navbar-collapse ${menuState ? "show" : ""}`} id="navbarNav">
          <ul className="navbar-nav ms-auto mb-2 mb-lg-0">
            {menus.map((menuObj) => (
              menuObj.type === 'link'
                ? (
                  <li key={menuObj.name} className="nav-item mx-2 text-center fw-bold">
                    <a href="#" className="nav-link fw-bold"
                      onClick={() => handleMenuChange(menuObj.name)}>
                      <span className="me-1">{menuObj.icon}</span>
                      {menuObj.name.charAt(0).toUpperCase() + menuObj.name.slice(1)}
                    </a>
                  </li>
                ) : (
                  <li key={menuObj.name} className="nav-item dropdown mx-2">
                    <a className="nav-link dropdown-toggle fw-bold mx-3"
                      href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                      <span className="me-1">{menuObj.icon}</span>
                      {menuObj.name.charAt(0).toUpperCase() + menuObj.name.slice(1)}
                    </a>
                    <ul className="dropdown-menu">
                      {menuObj.items.map(item => (
                        <li key={item.value}>
                          <button className="dropdown-item" onClick={() => handleMenuChange(item.value)}>
                            {item.name}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </li>
                )
            ))}
          </ul>

          <div className="nav-item dropdown ms-3">
            <a className="nav-link dropdown-toggle d-flex align-items-center gap-2 p-0"
              href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false" >
              <span className="fw-bold">{currentUser?.name || 'Invité'}</span>
              <img src={currentUser?.profilePicture || fma} alt="Profil" className="rounded-circle border" width="40" height="40" />
            </a>

            <ul className="dropdown-menu dropdown-menu-end shadow vh-auto">
              <li className="dropdown-header text-center p-3">
                {currentUser?.profilePicture ? (
                  <img src={currentUser.profilePicture} alt="Profil" className="rounded-circle border border-3 border-primary" width="80" height="80" />
                ): (
                  <h3 className="rounded-circle border border-3 border-primary text-danger text-center fw-bold m-5 d-flex justify-content-center align-items-center"
                    style={{width: "70px", height:"70px",fontSize: '28px', lineHeight: '70px' }}>
                    { getInitialName(currentUser?.name) }
                  </h3>
                )}
                <div className="fw-bold">{currentUser?.name || 'Invité'}</div>
                <small className="text-muted">{currentUser?.email || 'Aucun email'}</small>
              </li>
              <li><hr className="dropdown-divider" /></li>

              <li className={`dropdown p-3 ${showThemeDropdown ? 'show' : ''}`}
                onMouseEnter={() => setShowThemeDropdown(true)} onMouseLeave={() => setShowThemeDropdown(false)}>
                <a className="dropdown-toggle dropdown-item" href="#" role="button" onClick={() => setShowThemeDropdown(!showThemeDropdown)}>
                  <span className='me-1'>⚙️</span>Thème
                </a>
                <ul className={`dropdown-menu ${showThemeDropdown ? 'show' : ''}`}>
                  <li>
                    <button className={`dropdown-item ${theme === 'light' ? 'active' : ''}`} onClick={() => handleThemeChange('light')}>
                      <span className='me-1'>☀️</span> Mode Claire
                    </button>
                  </li>
                  <li>
                    <button className={`dropdown-item ${theme === 'dark' ? 'active' : ''}`} onClick={() => handleThemeChange('dark')}>
                      <span className='me-1'>🌙</span> Mode Sombre
                    </button>
                  </li>
                </ul>
              </li>

              {/* Profil / Logout */}
              <li className='p-3'>
                <button className="dropdown-item d-flex align-items-center" onClick={onProfil}>
                  <i className="fa-solid fa-user me-2 text-primary"></i>
                  Voir le profil
                </button>
              </li>
              <li className='p-3'>
                <button className="dropdown-item d-flex align-items-center text-danger mb-4" onClick={onLogout}>
                  <i className="fa-solid fa-sign-out-alt me-2"></i>
                  Se Déconnecter
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </header>
  );
};

export default NavigationPage;
