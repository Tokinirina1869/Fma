import React, { useState, useEffect } from 'react';
import {
    FaSignInAlt,
    FaBars,
    FaTimes
} from 'react-icons/fa';
import fma from '../assets/fma.png';
import { Link } from 'react-router-dom';

function Headers() {

  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  /* =========================
     EFFET SCROLL
  ========================== */
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMenu = () => {
    setMenuOpen(prev => !prev);
  };

  return (
    <header
      className={`fixed w-full top-0 z-50 transition-all duration-300 py-2
        ${scrolled
          ? 'backdrop-blur-lg dark:bg-gray-900/70 shadow-lg'
          : 'bg-transparent'}
      `}
    >
      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-20">

          {/* ================= LOGO ================= */}
          <Link to="/" className="flex items-center space-x-3">
            <img
              src={fma}
              alt="FMA Anjarasoa"
              className="w-12 h-12 sm:w-14 sm:h-14 rounded-full 
                         shadow-md border-2 border-blue-500 
                         hover:scale-105 transition-transform duration-300"
            />

            <div className="hidden md:block">
              <h1 className="font-bold text-lg lg:text-xl 
                             text-blue-700 dark:text-blue-400 leading-tight">
                FMA Laura Vicuna
              </h1>
              <p className="text-sm text-white dark:text-gray-400">
                Centre de Formation & Lycée Catholique
              </p>
            </div>
          </Link>

          {/* Bouton Connexion */}
        <Link to="/login">
        <button
            className="flex items-center 
                    bg-gradient-to-r from-blue-600 to-blue-700
                    text-white font-semibold 
                    px-6 py-2.5 rounded-full
                    shadow-md hover:shadow-xl
                    hover:scale-105
                    transition-all duration-300"
        >
            <FaSignInAlt className="mr-2" />
            Se Connecter
        </button>
        </Link>

          {/* ================= MOBILE MENU BUTTON ================= */}
          <button
            onClick={toggleMenu}
            className="lg:hidden p-2 rounded-lg
                       text-gray-700 dark:text-gray-300
                       hover:bg-gray-100 dark:hover:bg-gray-800
                       transition-colors duration-300"
          >
            {menuOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
          </button>

        </div>
      </div>

      {/* ================= MOBILE MENU ================= */}
      {menuOpen && (
        <div
          className="lg:hidden backdrop-blur-lg 
                     bg-white/90 dark:bg-gray-900/90
                     shadow-lg border-t 
                     border-gray-200 dark:border-gray-700"
        >
          <div className="flex flex-col px-6 py-6 space-y-4 text-center">

            <Link
              to="/"
              onClick={() => setMenuOpen(false)}
              className="py-3 rounded-lg
                         text-gray-700 dark:text-gray-300
                         hover:bg-gray-100 dark:hover:bg-gray-800
                         transition-all duration-300"
            >
              Accueil
            </Link>

          </div>
        </div>
      )}
    </header>
  );
}

export default Headers;