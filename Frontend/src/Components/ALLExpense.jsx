import React, { useEffect, useState } from "react";
import './ALLExpense.css'
import EditExpenseModal from "./EditExpenseModal";
import DeleteConfirmModal from "./DeleteConfirmModal";
import { getAllExpenses, deleteExpense } from "../services/ExpenseService";
import { useAuth } from "../Context/AuthContext";
import { useNavigate } from "react-router-dom";
import { FaSearch, FaFilter, FaDownload, FaPlus, FaChartBar, FaCheckCircle } from "react-icons/fa";
import { MdClear, MdDeleteForever } from "react-icons/md";
import { CiEdit } from "react-icons/ci";

function AllExpenses() {
    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { user } = useAuth();
    const navigate = useNavigate();
    const [sortOrder, setSortOrder] = useState("dateDesc");
    const [searchTerm, setSearchTerm] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("all");
    const [dateRange, setDateRange] = useState({ start: "", end: "" });
    const [showFilters, setShowFilters] = useState(false);
    const [showStats, setShowStats] = useState(true);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedExpense, setSelectedExpense] = useState(null);
    const [deleteSuccessMessage, setDeleteSuccessMessage] = useState("");
    const [pagination, setPagination] = useState({
        currentPage: 1,
        itemsPerPage: 5,
        totalItems: 0,
    });

    useEffect(() => {
        const fetchExpenses = async () => {
            if (!user) {
                setError("User not authenticated");
                setLoading(false);
                return;
            }

            const token = localStorage.getItem('accessToken');
            if (!token) {
                setError("Authentication token missing. Please login again.");
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                const data = await getAllExpenses();
                setExpenses(data);
                setError(null);
            } catch (err) {
                console.error("Error fetching expenses:", err);
                const errorMessage = err.response?.data?.message || err.message || "Failed to fetch expenses";
                setError(errorMessage);

                // If authentication error, suggest re-login
                if (err.response?.status === 401 || err.response?.status === 403) {
                    setError("Session expired. Please login again.");
                }
            } finally {
                setLoading(false);
            }
        };

        fetchExpenses();
    }, [user]);

    // Filter and search expenses
    const getFilteredExpenses = () => {
        let filtered = [...expenses];

        // Search filter
        if (searchTerm) {
            filtered = filtered.filter(expense =>
                expense.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                expense.note.toLowerCase().includes(searchTerm.toLowerCase()) ||
                expense.category.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Category filter
        if (categoryFilter !== "all") {
            filtered = filtered.filter(expense => expense.category === categoryFilter);
        }

        // Date range filter
        if (dateRange.start) {
            filtered = filtered.filter(expense =>
                new Date(expense.expenseDate) >= new Date(dateRange.start)
            );
        }
        if (dateRange.end) {
            filtered = filtered.filter(expense =>
                new Date(expense.expenseDate) <= new Date(dateRange.end)
            );
        }

        return filtered;
    };

    // Sort expenses based on selected order
    const getSortedExpenses = () => {
        const filtered = getFilteredExpenses();
        const sortedExpenses = [...filtered];

        switch (sortOrder) {
            case "dateDesc":
                return sortedExpenses.sort((a, b) =>
                    new Date(b.expenseDate) - new Date(a.expenseDate)
                );
            case "dateAsc":
                return sortedExpenses.sort((a, b) =>
                    new Date(a.expenseDate) - new Date(b.expenseDate)
                );
            case "amountDesc":
                return sortedExpenses.sort((a, b) => b.amount - a.amount);
            case "amountAsc":
                return sortedExpenses.sort((a, b) => a.amount - b.amount);
            case "titleAsc":
                return sortedExpenses.sort((a, b) => a.title.localeCompare(b.title));
            default:
                return sortedExpenses;
        }
    };

    // Calculate statistics
    const getStatistics = () => {
        const filtered = getFilteredExpenses();
        const total = filtered.reduce((sum, expense) => sum + parseFloat(expense.amount), 0);
        const average = filtered.length > 0 ? total / filtered.length : 0;
        const max = filtered.length > 0 ? Math.max(...filtered.map(e => parseFloat(e.amount))) : 0;
        const min = filtered.length > 0 ? Math.min(...filtered.map(e => parseFloat(e.amount))) : 0;

        const categoryTotals = filtered.reduce((acc, expense) => {
            acc[expense.category] = (acc[expense.category] || 0) + parseFloat(expense.amount);
            return acc;
        }, {});

        return { total, average, max, min, count: filtered.length, categoryTotals };
    };

    // Clear all filters
    const clearFilters = () => {
        setSearchTerm("");
        setCategoryFilter("all");
        setDateRange({ start: "", end: "" });
        setPagination(prev => ({ ...prev, currentPage: 1 }));
    };

    // Export data as CSV
    const exportToCSV = () => {
        const filtered = getSortedExpenses();
        const csvContent = [
            ['Title', 'Category', 'Amount', 'Date', 'Description'],
            ...filtered.map(expense => [
                expense.title,
                expense.category,
                expense.amount,
                expense.expenseDate,
                expense.note
            ])
        ].map(row => row.join(',')).join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `expenses_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
    };

    // Get paginated expenses
    const getPaginatedExpenses = () => {
        const sortedExpenses = getSortedExpenses();
        const startIndex = (pagination.currentPage - 1) * pagination.itemsPerPage;
        const endIndex = startIndex + pagination.itemsPerPage;
        return sortedExpenses.slice(startIndex, endIndex);
    };

    // Calculate total pages based on filtered results
    const filteredExpenses = getSortedExpenses();
    const totalPages = Math.ceil(filteredExpenses.length / pagination.itemsPerPage);
    const stats = getStatistics();

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setPagination((prev) => ({ ...prev, currentPage: newPage }));
        }
    };

    // Handle expense deletion
    const handleDeleteExpense = (deletedId) => {
        // Remove the deleted expense from state
        setExpenses((prevExpenses) =>
            prevExpenses.filter((expense) => expense.id !== deletedId)
        );

        // If current page becomes empty after deletion, go to previous page
        const remainingExpenses = expenses.length - 1;
        const newTotalPages = Math.ceil(remainingExpenses / pagination.itemsPerPage);

        if (pagination.currentPage > newTotalPages && newTotalPages > 0) {
            setPagination((prev) => ({ ...prev, currentPage: newTotalPages }));
        }
    };

    // Handle expense edit
    const handleEditExpense = (expense) => {
        setSelectedExpense(expense);
        setShowEditModal(true);
    };

    // Handle delete click
    const handleDeleteClick = (expense) => {
        setSelectedExpense(expense);
        setShowDeleteModal(true);
    };

    // Handle confirm delete
    const handleConfirmDelete = async () => {
        try {
            await deleteExpense(selectedExpense.id);
            setShowDeleteModal(false);

            // Remove the deleted expense from state
            setExpenses((prevExpenses) =>
                prevExpenses.filter((expense) => expense.id !== selectedExpense.id)
            );

            // Show success message
            setDeleteSuccessMessage("Expense deleted successfully!");

            // Hide success message after 3 seconds
            setTimeout(() => {
                setDeleteSuccessMessage("");
            }, 3000);

            // If current page becomes empty after deletion, go to previous page
            const remainingExpenses = expenses.length - 1;
            const newTotalPages = Math.ceil(remainingExpenses / pagination.itemsPerPage);

            if (pagination.currentPage > newTotalPages && newTotalPages > 0) {
                setPagination((prev) => ({ ...prev, currentPage: newTotalPages }));
            }
        } catch (error) {
            console.error("Error deleting expense:", error);
            alert("Failed to delete expense");
        }
    };

    // Handle successful expense update
    const handleEditSuccess = async () => {
        // Refresh expenses list
        try {
            const data = await getAllExpenses();
            setExpenses(data);
        } catch (err) {
            console.error("Error refreshing expenses:", err);
        }
    };

    if (loading) {
        return (
            <div className="mainCOntainer">
                <h1>All Expenses</h1>
                <p>Loading expenses...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="mainCOntainer">
                <h1>All Expenses</h1>
                <div className="alert alert-danger" role="alert">
                    <strong>Error:</strong> {error}
                </div>
                <button
                    className="btn btn-primary mt-3"
                    onClick={() => {
                        console.log('Checking auth state...');
                        console.log('User:', user);
                        console.log('AccessToken:', localStorage.getItem('accessToken'));
                        console.log('RefreshToken:', localStorage.getItem('refreshToken'));
                        window.location.reload();
                    }}
                >
                    Retry
                </button>
            </div>
        );
    }

    return (
        <>  <div className="headContainer">

            <div className="mainCOntainer">
                <div className="content-wrapper">
                    {/* Delete Success Message */}
                    {deleteSuccessMessage && (
                        <div className="delete-success-alert">
                            <FaCheckCircle />
                            <span>{deleteSuccessMessage}</span>
                        </div>
                    )}

                    {/* Left Sidebar - Statistics */}
                    {showStats && (
                        <div className="left-sidebar">
                            <div className="stats-panel">
                                <h3>Statistics</h3>
                                <div className="stats-grid">
                                    <div className="stat-card">
                                        <span className="stat-label">Total Expenses</span>
                                        <span className="stat-value">₹{stats.total.toFixed(2)}</span>
                                    </div>
                                    <div className="stat-card">
                                        <span className="stat-label">Average</span>
                                        <span className="stat-value">₹{stats.average.toFixed(2)}</span>
                                    </div>
                                    <div className="stat-card">
                                        <span className="stat-label">Highest</span>
                                        <span className="stat-value">₹{stats.max.toFixed(2)}</span>
                                    </div>
                                    <div className="stat-card">
                                        <span className="stat-label">Lowest</span>
                                        <span className="stat-value">₹{stats.min.toFixed(2)}</span>
                                    </div>
                                    <div className="stat-card">
                                        <span className="stat-label">Count</span>
                                        <span className="stat-value">{stats.count}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Right Content - Expenses List */}
                    <div className="right-content">
                        <div className="header">
                            <div className="head">
                                <h1>All Expenses</h1>
                                <span className="expense-count">{filteredExpenses.length} expense{filteredExpenses.length !== 1 ? 's' : ''}</span>
                            </div>
                            <div className="header-actions">
                                <button className="action-btn stats-btn" onClick={() => setShowStats(!showStats)} title={showStats ? "Hide Statistics" : "Show Statistics"}>
                                    <FaChartBar />
                                </button>
                                <button className="action-btn export-btn" onClick={exportToCSV} title="Export to CSV">
                                    <FaDownload />
                                </button>
                                <button className="action-btn filter-btn" onClick={() => setShowFilters(!showFilters)} title="Toggle Filters">
                                    <FaFilter />
                                </button>
                                <button className="action-btn add-btn" onClick={() => navigate('/add-expense')} title="Add New Expense">
                                    <FaPlus />
                                </button>
                            </div>
                        </div>

                        {/* Search Bar */}
                        <div className="search-container">
                            <div className="search-input-wrapper">
                                <FaSearch className="search-icon" />
                                <input
                                    type="text"
                                    className="search-input"
                                    placeholder="Search by title, description, or category..."
                                    value={searchTerm}
                                    onChange={(e) => {
                                        setSearchTerm(e.target.value);
                                        setPagination(prev => ({ ...prev, currentPage: 1 }));
                                    }}
                                />
                                {searchTerm && (
                                    <MdClear className="clear-icon" onClick={() => setSearchTerm("")} />
                                )}
                            </div>
                        </div>

                        {/* Filters Panel */}
                        {showFilters && (
                            <div className="filters-panel">
                                <div className="filters-header">
                                    <h3>Filters</h3>
                                    <button className="clear-filters-btn" onClick={clearFilters}>
                                        Clear All
                                    </button>
                                </div>
                                <div className="filters-grid">
                                    <div className="filter-group">
                                        <label>Category</label>
                                        <select
                                            value={categoryFilter}
                                            onChange={(e) => {
                                                setCategoryFilter(e.target.value);
                                                setPagination(prev => ({ ...prev, currentPage: 1 }));
                                            }}
                                            className="filter-select"
                                        >
                                            <option value="all">All Categories</option>
                                            <option value="Food">Food</option>
                                            <option value="Transport">Transport</option>
                                            <option value="Utilities">Utilities</option>
                                            <option value="Entertainment">Entertainment</option>
                                            <option value="Health">Health</option>
                                            <option value="Education">Education</option>
                                            <option value="Shopping">Shopping</option>
                                            <option value="Groceries">Groceries</option>
                                            <option value="Rent">Rent</option>
                                            <option value="Travel">Travel</option>
                                            <option value="Insurance">Insurance</option>
                                            <option value="Clothing">Clothing</option>
                                            <option value="Electronics">Electronics</option>
                                            <option value="Fitness">Fitness</option>
                                            <option value="Personal Care">Personal Care</option>
                                            <option value="Gifts">Gifts</option>
                                            <option value="Charity">Charity</option>
                                            <option value="Subscriptions">Subscriptions</option>
                                            <option value="Dining Out">Dining Out</option>
                                            <option value="Pets">Pets</option>
                                            <option value="Home Improvement">Home Improvement</option>
                                            <option value="Vehicle Maintenance">Vehicle Maintenance</option>
                                            <option value="Taxes">Taxes</option>
                                            <option value="Investments">Investments</option>
                                            <option value="Other">Other</option>
                                        </select>
                                    </div>
                                    <div className="filter-group">
                                        <label>From Date</label>
                                        <input
                                            type="date"
                                            value={dateRange.start}
                                            onChange={(e) => {
                                                setDateRange(prev => ({ ...prev, start: e.target.value }));
                                                setPagination(prev => ({ ...prev, currentPage: 1 }));
                                            }}
                                            className="filter-input"
                                        />
                                    </div>
                                    <div className="filter-group">
                                        <label>To Date</label>
                                        <input
                                            type="date"
                                            value={dateRange.end}
                                            onChange={(e) => {
                                                setDateRange(prev => ({ ...prev, end: e.target.value }));
                                                setPagination(prev => ({ ...prev, currentPage: 1 }));
                                            }}
                                            className="filter-input"
                                        />
                                    </div>
                                    <div className="filter-group">
                                        <label>Sort By</label>
                                        <select
                                            id="sortSelect"
                                            className="filter-select"
                                            value={sortOrder}
                                            onChange={(e) => setSortOrder(e.target.value)}
                                        >
                                            <option value="dateDesc">Date: Newest First</option>
                                            <option value="dateAsc">Date: Oldest First</option>
                                            <option value="amountDesc">Amount: High to Low</option>
                                            <option value="amountAsc">Amount: Low to High</option>
                                            <option value="titleAsc">Title: A to Z</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Active Filters Display */}
                        {(searchTerm || categoryFilter !== "all" || dateRange.start || dateRange.end) && (
                            <div className="active-filters">
                                <span className="active-filters-label">Active Filters:</span>
                                {searchTerm && <span className="filter-tag">Search: {searchTerm}</span>}
                                {categoryFilter !== "all" && <span className="filter-tag">Category: {categoryFilter}</span>}
                                {dateRange.start && <span className="filter-tag">From: {dateRange.start}</span>}
                                {dateRange.end && <span className="filter-tag">To: {dateRange.end}</span>}
                            </div>
                        )}

                        <div className="scrollContainer">
                            {expenses.length === 0 ? (
                                <div className="empty-state">
                                    <FaPlus className="empty-icon" />
                                    <p>No expenses found.</p>
                                    <p className="empty-subtitle">Start by adding your first expense!</p>
                                </div>
                            ) : filteredExpenses.length === 0 ? (
                                <div className="empty-state">
                                    <FaSearch className="empty-icon" />
                                    <p>No expenses match your filters.</p>
                                    <button className="btn-secondary" onClick={clearFilters}>Clear Filters</button>
                                </div>
                            ) : (
                                getPaginatedExpenses().map((expense) => (
                                    <div key={expense.id} className="expense-list-item">
                                        <div>
                                            <div className="item-title">{expense.title}</div>
                                            <div style={{ color: '#6b7280', fontSize: '0.7rem', marginTop: '0.25rem' }}>
                                                {expense.note || 'No description'}
                                            </div>
                                        </div>
                                        <div className="item-category">{expense.category}</div>
                                        <div className="item-amount">₹{parseFloat(expense.amount).toFixed(2)}</div>
                                        <div className="item-date">
                                            {expense.expenseDate ? new Date(expense.expenseDate).toLocaleDateString('en-IN', {
                                                year: 'numeric',
                                                month: 'short',
                                                day: 'numeric'
                                            }) : 'N/A'}
                                        </div>
                                        <div className="item-actions">
                                            <CiEdit
                                                className="action-icon edit-icon"
                                                onClick={() => handleEditExpense(expense)}
                                                title="Edit expense"
                                            />
                                            <MdDeleteForever
                                                className="action-icon delete-icon"
                                                onClick={() => handleDeleteClick(expense)}
                                                title="Delete expense"
                                            />
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Edit Expense Modal */}
            <EditExpenseModal
                isOpen={showEditModal}
                onClose={() => setShowEditModal(false)}
                expense={selectedExpense}
                onSuccess={handleEditSuccess}
            />

            {/* Delete Confirmation Modal */}
            <DeleteConfirmModal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={handleConfirmDelete}
                expenseTitle={selectedExpense?.title}
            />
        </div>
            <div className="pagination">
                <div>
                    <button
                        className="btn btn-secondary"
                        disabled={pagination.currentPage === 1}
                        onClick={() => handlePageChange(pagination.currentPage - 1)}
                    >
                        Previous
                    </button>
                    <span className="mx-3">
                        Page {pagination.currentPage} of {totalPages || 1}
                    </span>
                    <button
                        className="btn btn-secondary"
                        disabled={pagination.currentPage >= totalPages}
                        onClick={() => handlePageChange(pagination.currentPage + 1)}
                    >
                        Next
                    </button>
                </div>

                <div className="ExpenseperPage">
                    <label htmlFor="itemsPerPage" className="mx-3">Items per page:</label>
                    <select
                        id="itemsPerPage"
                        className="form-select formSelect"
                        value={pagination.itemsPerPage}
                        onChange={(e) => setPagination((prev) => ({ ...prev, itemsPerPage: Number(e.target.value), currentPage: 1 }))}
                    >
                        <option value={5}>5</option>
                        <option value={10}>10</option>
                        <option value={15}>15</option>
                        <option value={20}>20</option>
                        <option value={50}>50</option>
                    </select>
                </div>
            </div>
        </>
    );
}
export default AllExpenses;