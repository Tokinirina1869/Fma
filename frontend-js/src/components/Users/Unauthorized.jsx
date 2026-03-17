import React from 'react';
import { Link } from 'react-router-dom';
import { FaLock } from 'react-icons/fa';

function Unauthorized() {
  return (
    <div className="d-flex vh-100 align-items-center justify-content-center">
      <div className="text-center">
        <FaLock size={64} className="text-danger mb-3" />
        <h1 className="mb-3">Accès non autorisé</h1>
        <p className="text-muted mb-4">
          Vous n'avez pas les permissions nécessaires pour accéder à cette page.
        </p>
        <Link to="/" className="btn btn-primary">
          Retour à l'accueil
        </Link>
      </div>
    </div>
  );
}

export default Unauthorized;