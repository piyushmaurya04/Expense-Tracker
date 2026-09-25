import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import { updateExpense } from '../services/ExpenseService';
import { FaCheckCircle } from 'react-icons/fa';
import './EditExpenseModal.css';

function EditExpenseModal({ isOpen, onClose, expense, onSuccess }) {
    const [formData, setFormData] = useState({
        title: '',
        amount: '',
        category: '',
        note: '',
        expenseDate: ''
    });
    const [loading, setLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    // Populate form when expense changes
    useEffect(() => {
        if (expense) {
            setFormData({
                title: expense.title || '',
                amount: expense.amount || '',
                category: expense.category || '',
                note: expense.note || '',
                expenseDate: expense.expenseDate || ''
            });
        }
    }, [expense]);

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
            await updateExpense(expense.id, formData);

            // Show success message
            setSuccessMessage('Expense updated successfully!');

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
            console.error('Failed to update expense:', error);
            const errorMessage = error.response?.data?.message || 'Failed to update expense';
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
        <Modal isOpen={isOpen} onClose={handleClose} title="Edit Expense" size="medium">
            <div className="edit-expense-form">
                {successMessage && (
                    <div className="success-alert">
                        <FaCheckCircle />
                        <span>{successMessage}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label htmlFor="editExpenseTitle" className="form-label">Expense Title</label>
                        <input
                            type="text"
                            className="form-control"
                            id="editExpenseTitle"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            placeholder="e.g., Grocery shopping"
                            required
                            disabled={loading}
                        />
                    </div>
                    <div className="mb-3">
                        <label htmlFor="editExpenseAmount" className="form-label">Amount</label>
                        <input
                            type="number"
                            step="0.01"
                            className="form-control"
                            id="editExpenseAmount"
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
                        <label htmlFor="editExpenseCategory" className="form-label">Category</label>
                        <select
                            className="form-control"
                            id="editExpenseCategory"
                            name="category"
                            value={formData.category}
                            onChange={handleChange}
                            required
                            disabled={loading}
                        >
                            <option value="">Select Category</option>
                            <option value="Food">🍔 Food</option>
                            <option value="Transport">🚗 Transport</option>
                            <option value="Utilities">💡 Utilities</option>
                            <option value="Entertainment">🎬 Entertainment</option>
                            <option value="Health">🏥 Health</option>
                            <option value="Education">📚 Education</option>
                            <option value="Shopping">🛍️ Shopping</option>
                            <option value="Groceries">🛒 Groceries</option>
                            <option value="Rent">🏠 Rent</option>
                            <option value="Travel">✈️ Travel</option>
                            <option value="Insurance">🛡️ Insurance</option>
                            <option value="Clothing">👕 Clothing</option>
                            <option value="Electronics">💻 Electronics</option>
                            <option value="Fitness">💪 Fitness</option>
                            <option value="Personal Care">💄 Personal Care</option>
                            <option value="Gifts">🎁 Gifts</option>
                            <option value="Charity">❤️ Charity</option>
                            <option value="Subscriptions">📱 Subscriptions</option>
                            <option value="Dining Out">🍽️ Dining Out</option>
                            <option value="Pets">🐾 Pets</option>
                            <option value="Home Improvement">🔨 Home Improvement</option>
                            <option value="Vehicle Maintenance">🔧 Vehicle Maintenance</option>
                            <option value="Taxes">💰 Taxes</option>
                            <option value="Investments">📈 Investments</option>
                            <option value="Other">📦 Other</option>
                        </select>
                    </div>
                    <div className="mb-3">
                        <label htmlFor="editExpenseNote" className="form-label">Description</label>
                        <textarea
                            className="form-control"
                            id="editExpenseNote"
                            name="note"
                            value={formData.note}
                            onChange={handleChange}
                            placeholder="Add any additional details..."
                            rows="3"
                            disabled={loading}
                        ></textarea>
                    </div>
                    <div className="mb-3">
                        <label htmlFor="editExpenseDate" className="form-label">Date</label>
                        <input
                            type="date"
                            className="form-control"
                            id="editExpenseDate"
                            name="expenseDate"
                            value={formData.expenseDate}
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
                            {loading ? 'Updating...' : 'Update Expense'}
                        </button>
                    </div>
                </form>
            </div>
        </Modal>
    );
}

export default EditExpenseModal;
