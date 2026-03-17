// src/main.jsx (votre fichier actuel)
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import "bootstrap/dist/css/bootstrap.min.css";
import "./index.css";
import Register from './components/auth/Register';

import Inscription from './components/Inscription';
import { Login } from './components/Users/Login';
import Page from './components/Page';
import ReinscriptionLycee from './components/modals/ReinscriptionLycee';
import ProfileComponent from './components/modals/ProfileComponent';
import ListeFormation from './components/liste/ListeFormation';
import ListeEleve from './components/liste/ListeEleve';
import NouvelleInscription from './components/modals/NouvelleInscription';
import { ThemeProvider } from './components/ThemeContext';
import ProtectedRoute from './components/Users/ProtectedRoute';
import { AuthProvider } from './components/Users/AuthContext';
import './components/Users/axiosConfig';

createRoot(document.getElementById('root')).render(
  <StrictMode> 
    <AuthProvider>
      <ThemeProvider>
        <BrowserRouter>
          <Routes>
            {/* <Route path='/' element={<ReinscriptionLycee />} /> */}
            <Route path='/' element={<Inscription />} />
            <Route path='/login' element={<Login />} />
            <Route path='/register' element={<Register />} />

            {/* Routes protégées avec la syntaxe children */}
            <Route path='/profil' element={
              <ProtectedRoute>
                <ProfileComponent />
              </ProtectedRoute>
            } />

            <Route path='/page' element={
              <ProtectedRoute>
                <Page />
              </ProtectedRoute>
            } />
            <Route path='/listeFormation' element={
              <ProtectedRoute>
                <ListeFormation />
              </ProtectedRoute>
            } />
            <Route path='/listeEleve' element={
              <ProtectedRoute>
                <ListeEleve />
              </ProtectedRoute>
            } />
            <Route path='/nouvelleInscription' element={
              <ProtectedRoute>
                <NouvelleInscription />
              </ProtectedRoute>
            } />
          </Routes>
        </BrowserRouter>
      </ThemeProvider>
    </AuthProvider>
  </StrictMode>
);