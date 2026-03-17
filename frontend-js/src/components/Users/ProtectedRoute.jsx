// src/components/Users/ProtectedRoute.jsx
import { useContext } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { AuthContext } from './AuthContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, loading } = useContext(AuthContext);
  const location = useLocation();

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Chargement...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirige vers /login et sauvegarde la page demandée
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Si des rôles spécifiques sont requis, vérifiez-les
  if (allowedRoles && !allowedRoles.includes(isAuthenticated.role)) {
    return <Navigate to="/unauthorized" />;
  }

  return children;
};

export default ProtectedRoute;