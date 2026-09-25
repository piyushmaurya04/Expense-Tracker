import React, { useState } from 'react';
import './ExpenseItems.css';
import { MdDeleteForever } from "react-icons/md";
import { CiEdit } from "react-icons/ci";
import { FaCheckCircle } from "react-icons/fa";
import { deleteExpense } from '../services/ExpenseService';
import DeleteConfirmModal from './DeleteConfirmModal';

function ExpenseItems({ expense, onDelete, onEdit }) {
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showSuccessMessage, setShowSuccessMessage] = useState(false);

    const OnDeleteHandler = async () => {
        try {
            await deleteExpense(expense.id);
            setShowDeleteModal(false);
            setShowSuccessMessage(true);

            // Hide success message and call parent callback after delay
            setTimeout(() => {
                setShowSuccessMessage(false);
                if (onDelete) {
                    onDelete(expense.id);
                }
            }, 2000);
        } catch (error) {
            console.error("Error deleting expense:", error);
            alert("Failed to delete expense");
        }
    };

    const OnEditHandler = () => {
        if (onEdit) {
            onEdit(expense);
        }
    };

    return (
        <>
            {showSuccessMessage && (
                <div className="delete-success-overlay">
                    <div className="delete-success-message">
                        <FaCheckCircle className="success-icon" />
                        <span>Expense deleted successfully!</span>
                    </div>
                </div>
            )}

            <div className="mainContainer">
                <div className="container1">
                    <div className="expenseTitleContainer">
                        <div>
                            <h5>{expense.title.toUpperCase()}</h5>
                        </div>
                        <div className="iconContainer">
                            <CiEdit className='editIcon' onClick={OnEditHandler} title="Edit expense" />
                            <MdDeleteForever className='deleteIcon' onClick={() => setShowDeleteModal(true)} title="Delete expense" />
                        </div>
                    </div>
                    <hr />
                    <div className="expenseInfo">
                        <p> <span>Category: </span>{expense.category}</p>
                        <p><span>Description: </span>{expense.note || 'No description'}</p>
                        <p><span>Amount: </span>₹ {parseFloat(expense.amount).toFixed(2)}</p>
                        <p><span>Date: </span>{expense.expenseDate ? new Date(expense.expenseDate).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' }) : 'N/A'}</p>
                    </div>
                </div>
            </div>

            <DeleteConfirmModal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={OnDeleteHandler}
                expenseTitle={expense.title}
            />
        </>
    );
}
export default ExpenseItems;