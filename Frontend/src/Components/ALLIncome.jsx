import React, { useEffect, useState } from "react";
import './ALLExpense.css'
import EditIncomeModal from "./EditIncomeModal";
import DeleteConfirmModal from "./DeleteConfirmModal";
import { getAllIncomes, deleteIncome } from "../services/IncomeService";
import { useAuth } from "../Context/AuthContext";
import { useNavigate } from "react-router-dom";
import { FaSearch, FaFilter, FaDownload, FaPlus, FaChartBar, FaCheckCircle } from "react-icons/fa";
import { MdClear, MdDeleteForever } from "react-icons/md";
import { CiEdit } from "react-icons/ci";

function AllIncomes() {
    const [incomes, setIncomes] = useState([]);
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
    const [selectedIncome, setSelectedIncome] = useState(null);
    const [deleteSuccessMessage, setDeleteSuccessMessage] = useState("");
    const [pagination, setPagination] = useState({
        currentPage: 1,
        itemsPerPage: 5,
        totalItems: 0,
    });

    useEffect(() => {
        const fetchIncomes = async () => {
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
                const data = await getAllIncomes();
                setIncomes(data);
                setError(null);
            } catch (err) {
                console.error("Error fetching incomes:", err);
                const errorMessage = err.response?.data?.message || err.message || "Failed to fetch incomes";
                setError(errorMessage);

                // If authentication error, suggest re-login
                if (err.response?.status === 401 || err.response?.status === 403) {
                    setError("Session expired. Please login again.");
                }
            } finally {
                setLoading(false);
            }
        };

        fetchIncomes();
    }, [user]);

    // Filter and search incomes
    const getFilteredIncomes = () => {
        let filtered = [...incomes];

        // Search filter
        if (searchTerm) {
            filtered = filtered.filter(income =>
                income.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                income.note.toLowerCase().includes(searchTerm.toLowerCase()) ||
                income.category.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Category filter
        if (categoryFilter !== "all") {
            filtered = filtered.filter(income => income.category === categoryFilter);
        }

        // Date range filter
        if (dateRange.start) {
            filtered = filtered.filter(income =>
                new Date(income.incomeDate) >= new Date(dateRange.start)
            );
        }
        if (dateRange.end) {
            filtered = filtered.filter(income =>
                new Date(income.incomeDate) <= new Date(dateRange.end)
            );
        }

        return filtered;
    };

    // Sort incomes based on selected order
    const getSortedIncomes = () => {
        const filtered = getFilteredIncomes();
        const sortedIncomes = [...filtered];

        switch (sortOrder) {
            case "dateDesc":
                return sortedIncomes.sort((a, b) =>
                    new Date(b.incomeDate) - new Date(a.incomeDate)
                );
            case "dateAsc":
                return sortedIncomes.sort((a, b) =>
                    new Date(a.incomeDate) - new Date(b.incomeDate)
                );
            case "amountDesc":
                return sortedIncomes.sort((a, b) => b.amount - a.amount);
            case "amountAsc":
                return sortedIncomes.sort((a, b) => a.amount - b.amount);
            case "titleAsc":
                return sortedIncomes.sort((a, b) => a.title.localeCompare(b.title));
            default:
                return sortedIncomes;
        }
    };

    // Calculate statistics
    const getStatistics = () => {
        const filtered = getFilteredIncomes();
        const total = filtered.reduce((sum, income) => sum + parseFloat(income.amount), 0);
        const average = filtered.length > 0 ? total / filtered.length : 0;
        const max = filtered.length > 0 ? Math.max(...filtered.map(i => parseFloat(i.amount))) : 0;
        const min = filtered.length > 0 ? Math.min(...filtered.map(i => parseFloat(i.amount))) : 0;

        const categoryTotals = filtered.reduce((acc, income) => {
            acc[income.category] = (acc[income.category] || 0) + parseFloat(income.amount);
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
        const filtered = getSortedIncomes();
        const csvContent = [
            ['Title', 'Category', 'Amount', 'Date', 'Description'],
            ...filtered.map(income => [
                income.title,
                income.category,
                income.amount,
                income.incomeDate,
                income.note
            ])
        ].map(row => row.join(',')).join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `incomes_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
    };

    // Get paginated incomes
    const getPaginatedIncomes = () => {
        const sortedIncomes = getSortedIncomes();
        const startIndex = (pagination.currentPage - 1) * pagination.itemsPerPage;
        const endIndex = startIndex + pagination.itemsPerPage;
        return sortedIncomes.slice(startIndex, endIndex);
    };

    // Calculate total pages based on filtered results
    const filteredIncomes = getSortedIncomes();
    const totalPages = Math.ceil(filteredIncomes.length / pagination.itemsPerPage);
    const stats = getStatistics();

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setPagination((prev) => ({ ...prev, currentPage: newPage }));
        }
    };

    // Handle income deletion
    const handleDeleteIncome = (deletedId) => {
        // Remove the deleted income from state
        setIncomes((prevIncomes) =>
            prevIncomes.filter((income) => income.id !== deletedId)
        );

        // If current page becomes empty after deletion, go to previous page
        const remainingIncomes = incomes.length - 1;
        const newTotalPages = Math.ceil(remainingIncomes / pagination.itemsPerPage);

        if (pagination.currentPage > newTotalPages && newTotalPages > 0) {
            setPagination((prev) => ({ ...prev, currentPage: newTotalPages }));
        }
    };

    // Handle income edit
    const handleEditIncome = (income) => {
        setSelectedIncome(income);
        setShowEditModal(true);
    };

    // Handle delete click
    const handleDeleteClick = (income) => {
        setSelectedIncome(income);
        setShowDeleteModal(true);
    };

    // Handle confirm delete
    const handleConfirmDelete = async () => {
        try {
            await deleteIncome(selectedIncome.id);
            setShowDeleteModal(false);

            // Remove the deleted income from state
            setIncomes((prevIncomes) =>
                prevIncomes.filter((income) => income.id !== selectedIncome.id)
            );

            // Show success message
            setDeleteSuccessMessage("Income deleted successfully!");

            // Hide success message after 3 seconds
            setTimeout(() => {
                setDeleteSuccessMessage("");
            }, 3000);

            // If current page becomes empty after deletion, go to previous page
            const remainingIncomes = incomes.length - 1;
            const newTotalPages = Math.ceil(remainingIncomes / pagination.itemsPerPage);

            if (pagination.currentPage > newTotalPages && newTotalPages > 0) {
                setPagination((prev) => ({ ...prev, currentPage: newTotalPages }));
            }
        } catch (error) {
            console.error("Error deleting income:", error);
            alert("Failed to delete income");
        }
    };

    // Handle successful income update
    const handleEditSuccess = async () => {
        // Refresh incomes list
        try {
            const data = await getAllIncomes();
            setIncomes(data);
        } catch (err) {
            console.error("Error refreshing incomes:", err);
        }
    };

    if (loading) {
        return (
            <div className="mainCOntainer">
                <h1>All Incomes</h1>
                <p>Loading incomes...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="mainCOntainer">
                <h1>All Incomes</h1>
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
                                        <span className="stat-label">Total Income</span>
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

                    {/* Right Content - Incomes List */}
                    <div className="right-content">
                        <div className="header">
                            <div className="head">
                                <h1>All Incomes</h1>
                                <span className="expense-count">{filteredIncomes.length} income{filteredIncomes.length !== 1 ? 's' : ''}</span>
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
                                <button className="action-btn add-btn" onClick={() => navigate('/add-income')} title="Add New Income">
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
                                            <option value="Salary">Salary</option>
                                            <option value="Freelance">Freelance</option>
                                            <option value="Business">Business</option>
                                            <option value="Investment">Investment</option>
                                            <option value="Rental">Rental Income</option>
                                            <option value="Bonus">Bonus</option>
                                            <option value="Commission">Commission</option>
                                            <option value="Dividend">Dividend</option>
                                            <option value="Interest">Interest</option>
                                            <option value="Pension">Pension</option>
                                            <option value="Gift">Gift</option>
                                            <option value="Refund">Refund</option>
                                            <option value="Side Hustle">Side Hustle</option>
                                            <option value="Royalty">Royalty</option>
                                            <option value="Grant">Grant</option>
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
                            {incomes.length === 0 ? (
                                <div className="empty-state">
                                    <FaPlus className="empty-icon" />
                                    <p>No incomes found.</p>
                                    <p className="empty-subtitle">Start by adding your first income!</p>
                                </div>
                            ) : filteredIncomes.length === 0 ? (
                                <div className="empty-state">
                                    <FaSearch className="empty-icon" />
                                    <p>No incomes match your filters.</p>
                                    <button className="btn-secondary" onClick={clearFilters}>Clear Filters</button>
                                </div>
                            ) : (
                                getPaginatedIncomes().map((income) => (
                                    <div key={income.id} className="expense-list-item">
                                        <div>
                                            <div className="item-title">{income.title}</div>
                                            <div style={{ color: '#6b7280', fontSize: '0.7rem', marginTop: '0.25rem' }}>
                                                {income.note || 'No description'}
                                            </div>
                                        </div>
                                        <div className="item-category">{income.category}</div>
                                        <div className="item-amount">₹{parseFloat(income.amount).toFixed(2)}</div>
                                        <div className="item-date">
                                            {income.incomeDate ? new Date(income.incomeDate).toLocaleDateString('en-IN', {
                                                year: 'numeric',
                                                month: 'short',
                                                day: 'numeric'
                                            }) : 'N/A'}
                                        </div>
                                        <div className="item-actions">
                                            <CiEdit
                                                className="action-icon edit-icon"
                                                onClick={() => handleEditIncome(income)}
                                                title="Edit income"
                                            />
                                            <MdDeleteForever
                                                className="action-icon delete-icon"
                                                onClick={() => handleDeleteClick(income)}
                                                title="Delete income"
                                            />
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Edit Income Modal */}
            <EditIncomeModal
                isOpen={showEditModal}
                onClose={() => setShowEditModal(false)}
                income={selectedIncome}
                onSuccess={handleEditSuccess}
            />

            {/* Delete Confirmation Modal */}
            <DeleteConfirmModal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={handleConfirmDelete}
                expenseTitle={selectedIncome?.title}
                itemType="income"
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
export default AllIncomes;
