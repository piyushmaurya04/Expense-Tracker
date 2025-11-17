import React, { useState } from 'react';
import { useAuth } from '../Context/AuthContext';
import AddExpense from './AddExpense';
import AddIncome from './AddIncome';
import Modal from './Modal';
import './Dashboard.css';
import { FaPlus, FaChartPie, FaListAlt, FaMoneyBillWave, FaBalanceScale } from 'react-icons/fa';
import { Link } from 'react-router-dom';

function Dashboard() {
    const { user } = useAuth();
    const [showAddExpenseModal, setShowAddExpenseModal] = useState(false);
    const [showAddIncomeModal, setShowAddIncomeModal] = useState(false);

    const handleExpenseAdded = () => {
        setShowAddExpenseModal(false);
        // You can add additional logic here like refreshing the expense list
    };

    const handleIncomeAdded = () => {
        setShowAddIncomeModal(false);
        // You can add additional logic here like refreshing the income list
    };

    const openExpenseModal = () => {
        setShowAddExpenseModal(true);
    };

    const openIncomeModal = () => {
        setShowAddIncomeModal(true);
    };

    return (
        <>
            <div className="container mt-4 dashboard-container">
                {user && (
                    <div className="welcome-message">
                        <h2>Welcome, {user.username}!</h2>
                        <p className="welcome-subtitle">Manage your expenses efficiently</p>
                    </div>
                )}

                {/* Quick Actions */}
                <div className="quick-actions">
                    <button className="quick-action-card" onClick={openExpenseModal}>
                        <FaPlus className="quick-action-icon" />
                        <h3>Add Expense</h3>
                        <p>Record a new expense quickly</p>
                    </button>
                    <button className="quick-action-card" onClick={openIncomeModal}>
                        <FaPlus className="quick-action-icon" />
                        <h3>Add Income</h3>
                        <p>Record a new income quickly</p>
                    </button>
                    <Link to="/budget" className="quick-action-card">
                        <FaBalanceScale className="quick-action-icon" />
                        <h3>Budget Overview</h3>
                        <p>Track monthly income vs expenses</p>
                    </Link>
                </div>

                {/* Floating Action Buttons */}
                <button
                    className="fab fab-expense"
                    onClick={openExpenseModal}
                    title="Add new expense"
                >
                    <FaPlus />
                </button>
                <button
                    className="fab fab-income"
                    onClick={openIncomeModal}
                    title="Add new income"
                    style={{ bottom: '120px' }}
                >
                    <FaMoneyBillWave />
                </button>
            </div>

            {/* Add Expense Modal - OUTSIDE dashboard container */}
            {showAddExpenseModal && (
                <Modal
                    isOpen={showAddExpenseModal}
                    onClose={() => setShowAddExpenseModal(false)}
                    title="Add New Expense"
                    size="medium"
                >
                    <AddExpense onSuccess={handleExpenseAdded} />
                </Modal>
            )}

            {/* Add Income Modal */}
            {showAddIncomeModal && (
                <Modal
                    isOpen={showAddIncomeModal}
                    onClose={() => setShowAddIncomeModal(false)}
                    title="Add New Income"
                    size="medium"
                >
                    <AddIncome onSuccess={handleIncomeAdded} />
                </Modal>
            )}
        </>
    );
}
export default Dashboard;