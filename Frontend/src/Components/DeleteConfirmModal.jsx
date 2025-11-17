import React from 'react';
import './DeleteConfirmModal.css';
import { MdWarning, MdClose } from 'react-icons/md';

function DeleteConfirmModal({ isOpen, onClose, onConfirm, expenseTitle, itemType = 'expense' }) {
    if (!isOpen) return null;

    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    const itemLabel = itemType === 'income' ? 'Income' : 'Expense';

    return (
        <div className="delete-modal-overlay" onClick={handleBackdropClick}>
            <div className="delete-modal-container">
                <button className="delete-modal-close" onClick={onClose}>
                    <MdClose />
                </button>
                <div className="delete-modal-icon">
                    <MdWarning />
                </div>
                <h2>Delete {itemLabel}?</h2>
                <p>Are you sure you want to delete <strong>"{expenseTitle}"</strong>?</p>
                <p className="delete-warning">This action cannot be undone.</p>
                <div className="delete-modal-actions">
                    <button className="btn-cancel" onClick={onClose}>
                        Cancel
                    </button>
                    <button className="btn-delete" onClick={onConfirm}>
                        Delete
                    </button>
                </div>
            </div>
        </div>
    );
}

export default DeleteConfirmModal;
