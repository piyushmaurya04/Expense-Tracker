import React from 'react';
import './LogoutConfirmModal.css';
import { MdLogout, MdClose } from 'react-icons/md';
import { FaExclamationTriangle } from 'react-icons/fa';

function LogoutConfirmModal({ isOpen, onClose, onConfirm }) {
    if (!isOpen) return null;

    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <div className="logout-modal-overlay" onClick={handleBackdropClick}>
            <div className="logout-modal-container">
                <button className="logout-modal-close" onClick={onClose}>
                    <MdClose />
                </button>
                <div className="logout-modal-icon">
                    <FaExclamationTriangle />
                </div>
                <h2>Logout Confirmation</h2>
                <p>Are you sure you want to logout?</p>
                <p className="logout-warning">You will need to login again to access your account.</p>
                <div className="logout-modal-actions">
                    <button className="btn-cancel" onClick={onClose}>
                        Cancel
                    </button>
                    <button className="btn-logout" onClick={onConfirm}>
                        <MdLogout /> Logout
                    </button>
                </div>
            </div>
        </div>
    );
}

export default LogoutConfirmModal;
