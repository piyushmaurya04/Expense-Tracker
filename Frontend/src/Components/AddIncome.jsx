import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { addIncome } from '../services/IncomeService';
import './AddExpense.css';
import { FaCheckCircle } from 'react-icons/fa';

function AddIncome({ onSuccess }) {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        title: '',
        amount: '',
        category: '',
        note: '',
        incomeDate: ''
    });
    const [loading, setLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

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

    const onSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setSuccessMessage('');

        try {
            const response = await addIncome(formData);
            console.log("Income added:", response);

            // Show success message
            setSuccessMessage('Income added successfully!');

            // Scroll to top of modal to show success message
            const modalBody = document.querySelector('.modal-body');
            if (modalBody) {
                modalBody.scrollTop = 0;
            }

            // Clear form after successful submission
            setFormData({
                title: '',
                amount: '',
                category: '',
                note: '',
                incomeDate: ''
            });

            // Navigate to all incomes page after a brief delay to show success message
            setTimeout(() => {
                if (onSuccess) {
                    onSuccess();
                }
                navigate('/all-incomes');
            }, 1500);
        } catch (error) {
            console.error('Failed to add income:', error);
            const errorMessage = error.response?.data?.message || 'Failed to add income';
            alert(`Error: ${errorMessage}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="add-expense-form">
            {successMessage && (
                <div className="success-alert">
                    <FaCheckCircle />
                    <span>{successMessage}</span>
                </div>
            )}

            <form onSubmit={onSubmit}>
                <div className="mb-3">
                    <label htmlFor="incomeTitle" className="form-label">Income Title</label>
                    <input
                        type="text"
                        className="form-control"
                        id="incomeTitle"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        placeholder="e.g., Monthly Salary"
                        required
                        disabled={loading}
                    />
                </div>
                <div className="mb-3">
                    <label htmlFor="incomeAmount" className="form-label">Amount</label>
                    <input
                        type="number"
                        step="0.01"
                        className="form-control"
                        id="incomeAmount"
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
                    <label htmlFor="incomeCategory" className="form-label">Category</label>
                    <select
                        className="form-control"
                        id="incomeCategory"
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
                    <label htmlFor="incomeNote" className="form-label optional-field">Description</label>
                    <textarea
                        className="form-control"
                        id="incomeNote"
                        name="note"
                        value={formData.note}
                        onChange={handleChange}
                        placeholder="Add any additional details..."
                        rows="3"
                        disabled={loading}
                    ></textarea>
                </div>
                <div className="mb-3">
                    <label htmlFor="incomeDate" className="form-label">Date</label>
                    <input
                        type="date"
                        className="form-control"
                        id="incomeDate"
                        name="incomeDate"
                        value={formData.incomeDate}
                        onChange={handleChange}
                        max={new Date().toISOString().split('T')[0]}
                        required
                        disabled={loading}
                    />
                </div>

                <div className="button-group">
                    <button type="button" className="btn btn-cancel" onClick={() => navigate('/all-incomes')} disabled={loading}>
                        Cancel
                    </button>
                    <button type="submit" className="btn btn-success" disabled={loading}>
                        {loading ? 'Adding...' : 'Add Income'}
                    </button>
                </div>
            </form>
        </div>
    );
}
export default AddIncome;
