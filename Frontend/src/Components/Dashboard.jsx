import React, { useState } from 'react';
import { useAuth } from '../Context/AuthContext';
import AddExpense from './AddExpense';
import AddIncome from './AddIncome';
import Modal from './Modal';
import './Dashboard.css';
import { FaArrowRight, FaMoneyBillWave, FaBalanceScale, FaReceipt } from 'react-icons/fa';
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
                    <div className="dashboard-heading">
                        <div><p className="page-kicker">Financial workspace</p><h1>Good to see you, {user.username}</h1><p className="welcome-subtitle">Review activity and keep your records current.</p></div>
                        <div className="dashboard-period">Current period <strong>{new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}</strong></div>
                    </div>
                )}

                <section className="dashboard-action-panel">
                    <div className="panel-heading"><div><h2>Quick actions</h2><p>Capture a transaction or open a financial view.</p></div></div>
                    <div className="quick-actions">
                    <button className="quick-action-card" onClick={openExpenseModal}>
                        <span className="quick-action-icon"><FaReceipt /></span><span><h3>Record expense</h3><p>Add a purchase, bill, or reimbursement.</p></span><FaArrowRight className="action-arrow" />
                    </button>
                    <button className="quick-action-card" onClick={openIncomeModal}>
                        <span className="quick-action-icon income"><FaMoneyBillWave /></span><span><h3>Record income</h3><p>Log earnings or another deposit.</p></span><FaArrowRight className="action-arrow" />
                    </button>
                    <Link to="/budget" className="quick-action-card">
                        <span className="quick-action-icon budget"><FaBalanceScale /></span><span><h3>Review budget</h3><p>Compare income against spending.</p></span><FaArrowRight className="action-arrow" />
                    </Link>
                </div>
                </section>
            </div>

            {/* Add Expense Modal - OUTSIDE dashboard container */}
            {showAddExpenseModal && (
                <Modal
                    isOpen={showAddExpenseModal}
                    onClose={() => setShowAddExpenseModal(false)}
                    title="Add New Expense"
                    size="medium"
                    variant="drawer"
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
                    variant="drawer"
                >
                    <AddIncome onSuccess={handleIncomeAdded} />
                </Modal>
            )}
        </>
    );
}
export default Dashboard;