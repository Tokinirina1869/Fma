import React from 'react';
import { FaTimes, FaSignOutAlt } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const LogoutModal = ({ show, handleClose, handleConfirm }) => (
    <div
        className={`modal fade ${show ? 'show d-block' : ''}`}
        tabIndex="-1"
        role="dialog"
        style={{
            backgroundColor: show ? 'rgba(0, 0, 0, 0.55)' : 'transparent',
            backdropFilter: show ? 'blur(2px)' : 'none',
            transition: 'all 0.3s ease-in-out',
        }}
    >
        <div className="modal-dialog modal-dialog-centered" role="document">
            <div className="modal-content shadow-lg rounded-4 border-0">

                {/* Header */}
                <div className="modal-header border-0 pb-0">
                    <h5 className="modal-title fw-bold">Déconnexion</h5>

                    <button
                        type="button"
                        className="btn-close"
                        aria-label="Close"
                        onClick={handleClose}
                    ></button>
                </div>

                {/* Body */}
                <div className="modal-body text-center pt-2">
                    <p className="fs-5 mb-3">
                        Voulez-vous vraiment vous déconnecter ?
                    </p>
                </div>

                {/* Footer */}
                <div className="modal-footer border-0 justify-content-center mb-3">

                    {/* Annuler */}
                    <button
                        type="button"
                        className="btn btn-light border px-4 py-2 rounded-3 d-flex align-items-center shadow-sm"
                        onClick={handleClose}
                        style={{ minWidth: "150px" }}
                    >
                        <FaTimes size={18} className="me-2" />
                        Annuler
                    </button>

                    {/* Confirmer */}
                    <Link to="/" className="text-decoration-none">
                        <button
                            type="submit"
                            className="btn btn-danger px-4 py-2 rounded-3 d-flex align-items-center shadow-sm"
                            onClick={handleConfirm}
                            style={{ minWidth: "170px" }}
                        >
                            <FaSignOutAlt size={18} className="me-2" />
                            Se déconnecter
                        </button>
                    </Link>

                </div>
            </div>
        </div>
    </div>
);

export default LogoutModal;
