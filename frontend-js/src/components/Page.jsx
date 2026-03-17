import React, { useState, useContext, useEffect } from 'react';
import DashboardPage from "./DashboadPage";
import ListeEleve from './liste/ListeEleve';
import ListeFormation from './liste/ListeFormation';
import PaymentPage from './Paiement/Payement';
import NavigationPage from './navigation/NavigationPage';
import LogoutModal from './modals/LogoutModal';
import ProfileComponent from './modals/ProfileComponent';
import DashboadEleve from './liste/Dash_Eleve';
import DashboadFormation from './liste/Dash_Formation';
import SchoolDashboard from './liste/AutreDash';
import Chat from './Message/Chat';
import Footer from './Footer';
import { AuthContext } from './Users/AuthContext';

function Page() {
  const { user, logout } = useContext(AuthContext); // Récupération de l'utilisateur et de la fonction logout
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showProfilModal, setShowProfilModal] = useState(false);

  // Fonction pour obtenir le premier menu autorisé selon le rôle
  const getFirstMenuByRole = (role) => {
    if (role === 'directrice' || role === 'bde') {
      return 'dashboard';
    }
    if (role === 'secretaire_lycee') {
      return 'eleve';
    }
    if (role === 'secretaire_cfp') {
      return 'formation';
    }
    return 'dashboard';
  };

  // Initialiser currentPage lorsque l'utilisateur est chargé
  useEffect(() => {
    if (user) {
      const firstMenu = getFirstMenuByRole(user.role);
      setCurrentPage((prev) => (prev === 'dashboard' ? firstMenu : prev));
    }
  }, [user]);

  // Handlers
  const handleMenuChange = (menu) => {
    setCurrentPage(menu);
  };

  const handleLogoutClick = () => {
    setShowLogoutModal(true);
  };

  const handleLogoutClose = () => {
    setShowLogoutModal(false);
  };

  const handleProfilClick = () => {
    setShowProfilModal(true);
  };

  const handleProfilClose = () => {
    setShowProfilModal(false);
  };

  const handleUpdateProfile = (newProfile) => {
    // La mise à jour du profil devrait être gérée via le contexte
    // Pour l'instant, on ferme simplement la modale
    setShowProfilModal(false);
  };

  const handleLogoutConfirm = () => {
    logout(); 
    setCurrentPage('dashboard');
    setShowLogoutModal(false);
  };

  // Pages disponibles
  const pages = {
    dashboard:      <DashboardPage autre={() => setCurrentPage('autre')} />,
    autre:          <SchoolDashboard retourDash={() => setCurrentPage('dashboard')} />,
    eleve:          <DashboadEleve onViewList={() => setCurrentPage('listeEleve')} />,
    formation:      <DashboadFormation onViewListPro={() => setCurrentPage('listeFormation')} />,
    listeEleve:     <ListeEleve onViewDash={() => setCurrentPage('eleve')} />,
    listeFormation: <ListeFormation onViewDashPro={() => setCurrentPage('formation')} />,
    paiement:       <PaymentPage />,
    chat:           <Chat/>,
  };

  return (
    <div>
      <NavigationPage
        currentPage={currentPage}
        handleMenuChange={handleMenuChange}
        onLogout={handleLogoutClick}
        onProfil={handleProfilClick}
        currentUser={user}
      />

      <main className="p-3">
        {pages[currentPage] || <DashboardPage />}
      </main>

      <ProfileComponent
        show={showProfilModal}
        currentUser={user}
        handleClose={handleProfilClose}
        onUpdateProfile={handleUpdateProfile}
        onBack={handleProfilClose}
      />

      <LogoutModal
        show={showLogoutModal}
        handleClose={handleLogoutClose}
        handleConfirm={handleLogoutConfirm}
      />

      <Footer />
    </div>
  );
}

export default Page;