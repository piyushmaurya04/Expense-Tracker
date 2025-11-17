import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import { updateIncome } from '../services/IncomeService';
import { FaCheckCircle } from 'react-icons/fa';
import './EditExpenseModal.css';

function EditIncomeModal({ isOpen, onClose, income, onSuccess }) {
    const [formData, setFormData] = useState({
        title: '',
        amount: '',
        category: '',
        note: '',
        incomeDate: ''
    });
    const [loading, setLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    // Populate form when income changes
    useEffect(() => {
        if (income) {
            setFormData({
                title: income.title || '',
                amount: income.amount || '',
                category: income.category || '',
                note: income.note || '',
                incomeDate: income.incomeDate || ''
            });
        }
    }, [income]);

    const handleChange = (e) => {
        const { name, value } = e.target;

        // Prevent negative values for amount field
        if (name === 'amount' && value < 0) {
            return;
        }

        setFormData((prevData) => ({
            ...prevData,
            [name]: value
        }));
    };

    const handleKeyDown = (e) => {
        // Prevent minus, plus, and 'e' characters in number input
        if (e.key === '-' || e.key === '+' || e.key === 'e' || e.key === 'E') {
            e.preventDefault();
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setSuccessMessage('');

        try {
            await updateIncome(income.id, formData);

            // Show success message
            setSuccessMessage('Income updated successfully!');

            // Scroll to top of modal to show success message
            const modalBody = document.querySelector('.modal-body');
            if (modalBody) {
                modalBody.scrollTop = 0;
            }

            // Call onSuccess callback after a brief delay to show success message
            setTimeout(() => {
                setSuccessMessage('');
                if (onSuccess) {
                    onSuccess();
                }
                onClose();
            }, 2000);
        } catch (error) {
            console.error('Failed to update income:', error);
            const errorMessage = error.response?.data?.message || 'Failed to update income';
            alert(`Error: ${errorMessage}`);
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setSuccessMessage('');
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title="Edit Income" size="medium">
            <div className="edit-expense-form">
                {successMessage && (
                    <div className="success-alert">
                        <FaCheckCircle />
                        <span>{successMessage}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label htmlFor="editIncomeTitle" className="form-label">Income Title</label>
                        <input
                            type="text"
                            className="form-control"
                            id="editIncomeTitle"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            placeholder="e.g., Monthly Salary"
                            required
                            disabled={loading}
                        />
                    </div>
                    <div className="mb-3">
                        <label htmlFor="editIncomeAmount" className="form-label">Amount</label>
                        <input
                            type="number"
                            step="0.01"
                            className="form-control"
                            id="editIncomeAmount"
                            name="amount"
                            value={formData.amount}
                            onChange={handleChange}
                            onKeyDown={handleKeyDown}
                            placeholder="0.00"
                            required
                            min="0.01"
                            disabled={loading}
                        />
                    </div>
                    <div className="mb-3">
                        <label htmlFor="editIncomeCategory" className="form-label">Category</label>
                        <select
                            className="form-control"
                            id="editIncomeCategory"
                            name="category"
                            value={formData.category}
                            onChange={handleChange}
                            required
                            disabled={loading}
                        >
                            <option value="">Select Category</option>
                            <option value="Salary">💼 Salary</option>
                            <option value="Freelance">💻 Freelance</option>
                            <option value="Business">🏢 Business</option>
                            <option value="Investment">📈 Investment</option>
                            <option value="Rental">🏠 Rental Income</option>
                            <option value="Bonus">🎁 Bonus</option>
                            <option value="Commission">💰 Commission</option>
                            <option value="Dividend">💵 Dividend</option>
                            <option value="Interest">🏦 Interest</option>
                            <option value="Pension">👴 Pension</option>
                            <option value="Gift">🎀 Gift</option>
                            <option value="Refund">↩️ Refund</option>
                            <option value="Side Hustle">🚀 Side Hustle</option>
                            <option value="Royalty">👑 Royalty</option>
                            <option value="Grant">🏆 Grant</option>
                            <option value="Other">📦 Other</option>
                        </select>
                    </div>
                    <div className="mb-3">
                        <label htmlFor="editIncomeNote" className="form-label">Description</label>
                        <textarea
                            className="form-control"
                            id="editIncomeNote"
                            name="note"
                            value={formData.note}
                            onChange={handleChange}
                            placeholder="Add any additional details..."
                            rows="3"
                            disabled={loading}
                        ></textarea>
                    </div>
                    <div className="mb-3">
                        <label htmlFor="editIncomeDate" className="form-label">Date</label>
                        <input
                            type="date"
                            className="form-control"
                            id="editIncomeDate"
                            name="incomeDate"
                            value={formData.incomeDate}
                            onChange={handleChange}
                            max={new Date().toISOString().split('T')[0]}
                            required
                            disabled={loading}
                        />
                    </div>

                    <div className="button-group">
                        <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={handleClose}
                            disabled={loading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn btn-success"
                            disabled={loading}
                        >
                            {loading ? 'Updating...' : 'Update Income'}
                        </button>
                    </div>
                </form>
            </div>
        </Modal>
    );
}

export default EditIncomeModal;
