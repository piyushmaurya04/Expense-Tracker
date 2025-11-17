import React, { useEffect, useState } from "react";
import './Budget.css';
import { getAllExpenses } from "../services/ExpenseService";
import { getAllIncomes } from "../services/IncomeService";
import { useAuth } from "../Context/AuthContext";
import {
    PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend,
    BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';
import { FaMoneyBillWave, FaWallet, FaChartPie, FaBalanceScale, FaCalendarAlt, FaChevronLeft, FaChevronRight } from "react-icons/fa";

const COLORS = ['#10b981', '#ef4444'];

function Budget() {
    const [expenses, setExpenses] = useState([]);
    const [incomes, setIncomes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { user } = useAuth();
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

    useEffect(() => {
        const fetchData = async () => {
            if (!user) {
                setError("User not authenticated");
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                const [expenseData, incomeData] = await Promise.all([
                    getAllExpenses(),
                    getAllIncomes()
                ]);
                setExpenses(expenseData);
                setIncomes(incomeData);
                setError(null);
            } catch (err) {
                console.error("Error fetching data:", err);
                setError(err.message || "Failed to fetch data");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [user]);

    // Filter data for selected month and year
    const getMonthlyData = () => {
        const filteredExpenses = expenses.filter(expense => {
            const expenseDate = new Date(expense.expenseDate);
            return expenseDate.getMonth() === selectedMonth &&
                expenseDate.getFullYear() === selectedYear;
        });

        const filteredIncomes = incomes.filter(income => {
            const incomeDate = new Date(income.incomeDate);
            return incomeDate.getMonth() === selectedMonth &&
                incomeDate.getFullYear() === selectedYear;
        });

        return { filteredExpenses, filteredIncomes };
    };

    // Calculate monthly statistics
    const getMonthlyStats = () => {
        const { filteredExpenses, filteredIncomes } = getMonthlyData();

        const totalIncome = filteredIncomes.reduce((sum, income) =>
            sum + parseFloat(income.amount), 0);

        const totalExpense = filteredExpenses.reduce((sum, expense) =>
            sum + parseFloat(expense.amount), 0);

        const balance = totalIncome - totalExpense;

        return { totalIncome, totalExpense, balance };
    };

    // Get data for pie chart
    const getPieChartData = () => {
        const { totalIncome, totalExpense } = getMonthlyStats();

        if (totalIncome === 0 && totalExpense === 0) {
            return [];
        }

        return [
            { name: 'Income', value: parseFloat(totalIncome.toFixed(2)) },
            { name: 'Expense', value: parseFloat(totalExpense.toFixed(2)) }
        ];
    };

    // Helper function to get month name
    const getMonthName = (monthIndex) => {
        const months = ['January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'];
        return months[monthIndex];
    };

    // Calendar functions
    const getDaysInMonth = (month, year) => {
        return new Date(year, month + 1, 0).getDate();
    };

    const getFirstDayOfMonth = (month, year) => {
        return new Date(year, month, 1).getDay();
    };

    const getCalendarData = () => {
        const daysInMonth = getDaysInMonth(selectedMonth, selectedYear);
        const firstDay = getFirstDayOfMonth(selectedMonth, selectedYear);
        const calendarData = {};

        // Initialize all days with zero values
        for (let day = 1; day <= daysInMonth; day++) {
            calendarData[day] = { income: 0, expense: 0, total: 0 };
        }

        // Aggregate expenses
        expenses.forEach(expense => {
            const expenseDate = new Date(expense.expenseDate);
            if (expenseDate.getMonth() === selectedMonth &&
                expenseDate.getFullYear() === selectedYear) {
                const day = expenseDate.getDate();
                calendarData[day].expense += parseFloat(expense.amount);
                calendarData[day].total += parseFloat(expense.amount);
            }
        });

        // Aggregate incomes
        incomes.forEach(income => {
            const incomeDate = new Date(income.incomeDate);
            if (incomeDate.getMonth() === selectedMonth &&
                incomeDate.getFullYear() === selectedYear) {
                const day = incomeDate.getDate();
                calendarData[day].income += parseFloat(income.amount);
                calendarData[day].total += parseFloat(income.amount);
            }
        });

        return { daysInMonth, firstDay, calendarData };
    };

    const getHeatmapColor = (income, expense) => {
        const total = income + expense;

        if (total === 0) return 'rgba(107, 114, 128, 0.1)'; // No activity - gray

        // Determine intensity based on total amount
        const maxAmount = Math.max(
            ...Object.values(getCalendarData().calendarData).map(d => d.total)
        );

        if (maxAmount === 0) return 'rgba(107, 114, 128, 0.1)';

        const intensity = total / maxAmount;

        // Color based on whether income > expense (green) or expense > income (red)
        if (income > expense) {
            // Green shades for positive (more income)
            return `rgba(16, 185, 129, ${0.2 + intensity * 0.6})`;
        } else if (expense > income) {
            // Red shades for negative (more expense)
            return `rgba(239, 68, 68, ${0.2 + intensity * 0.6})`;
        } else {
            // Yellow for balanced
            return `rgba(251, 191, 36, ${0.2 + intensity * 0.6})`;
        }
    };

    const handlePreviousMonth = () => {
        if (selectedMonth === 0) {
            setSelectedMonth(11);
            setSelectedYear(selectedYear - 1);
        } else {
            setSelectedMonth(selectedMonth - 1);
        }
    };

    const handleNextMonth = () => {
        if (selectedMonth === 11) {
            setSelectedMonth(0);
            setSelectedYear(selectedYear + 1);
        } else {
            setSelectedMonth(selectedMonth + 1);
        }
    };

    // Get available years from data
    const getAvailableYears = () => {
        const expenseYears = expenses.map(e => new Date(e.expenseDate).getFullYear());
        const incomeYears = incomes.map(i => new Date(i.incomeDate).getFullYear());
        const years = [...new Set([...expenseYears, ...incomeYears])];
        return years.sort((a, b) => b - a);
    };

    if (loading) {
        return (
            <div className="budget-container">
                <h1>Budget Overview</h1>
                <p>Loading data...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="budget-container">
                <h1>Budget Overview</h1>
                <div className="alert alert-danger">
                    <strong>Error:</strong> {error}
                </div>
            </div>
        );
    }

    const stats = getMonthlyStats();
    const pieChartData = getPieChartData();
    const availableYears = getAvailableYears();
    const { daysInMonth, firstDay, calendarData } = getCalendarData();

    return (
        <div className="budget-container">
            <div className="budget-header">
                <div>
                    <h1><FaBalanceScale /> Monthly Budget Overview</h1>
                    <p className="subtitle">Track your income and expenses for {getMonthName(selectedMonth)} {selectedYear}</p>
                </div>
            </div>

            {/* Month and Year Selector */}
            <div className="period-selector">
                <div className="selector-group">
                    <FaCalendarAlt className="selector-icon" />
                    <select
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(Number(e.target.value))}
                        className="month-select"
                    >
                        {Array.from({ length: 12 }, (_, i) => (
                            <option key={i} value={i}>{getMonthName(i)}</option>
                        ))}
                    </select>
                    <select
                        value={selectedYear}
                        onChange={(e) => setSelectedYear(Number(e.target.value))}
                        className="year-select"
                    >
                        {availableYears.length > 0 ? (
                            availableYears.map(year => (
                                <option key={year} value={year}>{year}</option>
                            ))
                        ) : (
                            <option value={new Date().getFullYear()}>{new Date().getFullYear()}</option>
                        )}
                    </select>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="budget-summary-cards">
                <div className="budget-card income-card">
                    <div className="card-icon-wrapper income-icon">
                        <FaMoneyBillWave className="card-icon" />
                    </div>
                    <div className="card-content">
                        <h3>Total Income</h3>
                        <p className="amount">₹{stats.totalIncome.toFixed(2)}</p>
                        <span className="label">for this month</span>
                    </div>
                </div>

                <div className="budget-card expense-card">
                    <div className="card-icon-wrapper expense-icon">
                        <FaWallet className="card-icon" />
                    </div>
                    <div className="card-content">
                        <h3>Total Expenses</h3>
                        <p className="amount">₹{stats.totalExpense.toFixed(2)}</p>
                        <span className="label">for this month</span>
                    </div>
                </div>

                <div className={`budget-card balance-card ${stats.balance >= 0 ? 'positive' : 'negative'}`}>
                    <div className={`card-icon-wrapper ${stats.balance >= 0 ? 'balance-positive-icon' : 'balance-negative-icon'}`}>
                        <FaBalanceScale className="card-icon" />
                    </div>
                    <div className="card-content">
                        <h3>Balance</h3>
                        <p className="amount">₹{stats.balance.toFixed(2)}</p>
                        <span className="label">
                            {stats.balance >= 0 ? 'Surplus' : 'Deficit'}
                        </span>
                    </div>
                </div>
            </div>

            {/* Calendar and Comparison Section */}
            <div className="calendar-comparison-wrapper">
                {/* Calendar Heatmap Section */}
                <div className="calendar-heatmap-section">
                    <div className="calendar-header">
                        <button className="calendar-nav-btn" onClick={handlePreviousMonth}>
                            <FaChevronLeft />
                        </button>
                        <h2>
                            <FaCalendarAlt /> {getMonthName(selectedMonth)} {selectedYear}
                        </h2>
                        <button className="calendar-nav-btn" onClick={handleNextMonth}>
                            <FaChevronRight />
                        </button>
                    </div>

                    <div className="calendar-legend">
                        <div className="legend-item">
                            <span className="legend-color" style={{ background: 'rgba(16, 185, 129, 0.6)' }}></span>
                            <span>More Income</span>
                        </div>
                        <div className="legend-item">
                            <span className="legend-color" style={{ background: 'rgba(239, 68, 68, 0.6)' }}></span>
                            <span>More Expense</span>
                        </div>
                        <div className="legend-item">
                            <span className="legend-color" style={{ background: 'rgba(107, 114, 128, 0.1)' }}></span>
                            <span>No Activity</span>
                        </div>
                    </div>

                    <div className="calendar-grid">
                        <div className="calendar-weekdays">
                            <div className="weekday">Sun</div>
                            <div className="weekday">Mon</div>
                            <div className="weekday">Tue</div>
                            <div className="weekday">Wed</div>
                            <div className="weekday">Thu</div>
                            <div className="weekday">Fri</div>
                            <div className="weekday">Sat</div>
                        </div>

                        <div className="calendar-days">
                            {/* Empty cells for days before the first day of month */}
                            {Array.from({ length: firstDay }).map((_, index) => (
                                <div key={`empty-${index}`} className="calendar-day empty"></div>
                            ))}

                            {/* Calendar days */}
                            {Array.from({ length: daysInMonth }).map((_, index) => {
                                const day = index + 1;
                                const dayData = calendarData[day];
                                const heatmapColor = getHeatmapColor(dayData.income, dayData.expense);
                                const isToday =
                                    day === new Date().getDate() &&
                                    selectedMonth === new Date().getMonth() &&
                                    selectedYear === new Date().getFullYear();

                                return (
                                    <div
                                        key={day}
                                        className={`calendar-day ${isToday ? 'today' : ''}`}
                                        style={{ backgroundColor: heatmapColor }}
                                    >
                                        <div className="day-number">{day}</div>
                                        {dayData.total > 0 && (
                                            <div className="day-details">
                                                {dayData.income > 0 && (
                                                    <div className="day-income" title={`Income: ₹${dayData.income.toFixed(2)}`}>
                                                        <span className="amount-label">+₹{dayData.income.toFixed(0)}</span>
                                                    </div>
                                                )}
                                                {dayData.expense > 0 && (
                                                    <div className="day-expense" title={`Expense: ₹${dayData.expense.toFixed(2)}`}>
                                                        <span className="amount-label">-₹{dayData.expense.toFixed(0)}</span>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="calendar-summary">
                        <div className="summary-item">
                            <span className="summary-label">Total Income:</span>
                            <span className="summary-value income-value">
                                ₹{Object.values(calendarData).reduce((sum, d) => sum + d.income, 0).toFixed(2)}
                            </span>
                        </div>
                        <div className="summary-item">
                            <span className="summary-label">Total Expense:</span>
                            <span className="summary-value expense-value">
                                ₹{Object.values(calendarData).reduce((sum, d) => sum + d.expense, 0).toFixed(2)}
                            </span>
                        </div>
                        <div className="summary-item">
                            <span className="summary-label">Net Balance:</span>
                            <span className={`summary-value ${Object.values(calendarData).reduce((sum, d) => sum + d.income - d.expense, 0) >= 0
                                ? 'balance-positive'
                                : 'balance-negative'
                                }`}>
                                ₹{Object.values(calendarData).reduce((sum, d) => sum + d.income - d.expense, 0).toFixed(2)}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Monthly Comparison Chart */}
                <div className="monthly-comparison-section">
                    <div className="comparison-header">
                        <h2>
                            <FaChartPie /> {getMonthName(selectedMonth)} {selectedYear} Summary
                        </h2>
                    </div>

                    <div className="comparison-chart-container">
                        <ResponsiveContainer width="100%" height={350}>
                            <BarChart
                                data={[
                                    {
                                        name: 'Income',
                                        value: Object.values(calendarData).reduce((sum, d) => sum + d.income, 0),
                                        fill: '#10b981'
                                    },
                                    {
                                        name: 'Expense',
                                        value: Object.values(calendarData).reduce((sum, d) => sum + d.expense, 0),
                                        fill: '#ef4444'
                                    },
                                    {
                                        name: 'Left',
                                        value: Math.max(0, Object.values(calendarData).reduce((sum, d) => sum + d.income - d.expense, 0)),
                                        fill: '#3b82f6'
                                    }
                                ]}
                                margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(107, 114, 128, 0.3)" />
                                <XAxis
                                    dataKey="name"
                                    stroke="#9ca3af"
                                    style={{ fontSize: '0.9rem', fontWeight: 500 }}
                                />
                                <YAxis
                                    stroke="#9ca3af"
                                    style={{ fontSize: '0.85rem' }}
                                    tickFormatter={(value) => `₹${value.toFixed(0)}`}
                                />
                                <Tooltip
                                    formatter={(value) => `₹${value.toFixed(2)}`}
                                    contentStyle={{
                                        backgroundColor: 'rgba(17, 24, 39, 0.95)',
                                        border: '2px solid rgba(107, 114, 128, 0.3)',
                                        borderRadius: '8px',
                                        color: '#f9fafb'
                                    }}
                                    cursor={{ fill: 'rgba(107, 114, 128, 0.1)' }}
                                />
                                <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                                    {[
                                        { fill: '#10b981' },
                                        { fill: '#ef4444' },
                                        { fill: '#3b82f6' }
                                    ].map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.fill} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="comparison-stats">
                        <div className="stat-item">
                            <div className="stat-icon" style={{ background: 'rgba(16, 185, 129, 0.2)' }}>
                                <FaMoneyBillWave style={{ color: '#10b981' }} />
                            </div>
                            <div className="stat-content">
                                <span className="stat-label">Income</span>
                                <span className="stat-value" style={{ color: '#10b981' }}>
                                    ₹{Object.values(calendarData).reduce((sum, d) => sum + d.income, 0).toFixed(2)}
                                </span>
                            </div>
                        </div>
                        <div className="stat-item">
                            <div className="stat-icon" style={{ background: 'rgba(239, 68, 68, 0.2)' }}>
                                <FaWallet style={{ color: '#ef4444' }} />
                            </div>
                            <div className="stat-content">
                                <span className="stat-label">Expense</span>
                                <span className="stat-value" style={{ color: '#ef4444' }}>
                                    ₹{Object.values(calendarData).reduce((sum, d) => sum + d.expense, 0).toFixed(2)}
                                </span>
                            </div>
                        </div>
                        <div className="stat-item">
                            <div className="stat-icon" style={{ background: 'rgba(59, 130, 246, 0.2)' }}>
                                <FaBalanceScale style={{ color: '#3b82f6' }} />
                            </div>
                            <div className="stat-content">
                                <span className="stat-label">Left (Balance)</span>
                                <span className="stat-value" style={{ color: '#3b82f6' }}>
                                    ₹{Object.values(calendarData).reduce((sum, d) => sum + d.income - d.expense, 0).toFixed(2)}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Pie Chart Section */}
            <div className="chart-section">
                <h2><FaChartPie /> Income vs Expense Distribution</h2>
                <div className="chart-container">
                    {pieChartData.length > 0 ? (
                        <>
                            <ResponsiveContainer width="100%" height={400}>
                                <PieChart>
                                    <Pie
                                        data={pieChartData}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={({ name, value, percent }) =>
                                            `${name}: ₹${value.toFixed(2)} (${(percent * 100).toFixed(1)}%)`
                                        }
                                        outerRadius={120}
                                        fill="#8884d8"
                                        dataKey="value"
                                    >
                                        {pieChartData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={(value) => `₹${value.toFixed(2)}`} />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>

                            {/* Breakdown Table */}
                            <div className="breakdown-table">
                                <h3>Financial Breakdown</h3>
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Category</th>
                                            <th>Amount</th>
                                            <th>Percentage</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {pieChartData.map((item, index) => {
                                            const total = pieChartData.reduce((sum, d) => sum + d.value, 0);
                                            const percentage = ((item.value / total) * 100).toFixed(1);
                                            return (
                                                <tr key={index}>
                                                    <td>
                                                        <span
                                                            className="color-indicator"
                                                            style={{ backgroundColor: COLORS[index % COLORS.length] }}
                                                        ></span>
                                                        {item.name}
                                                    </td>
                                                    <td>₹{item.value.toFixed(2)}</td>
                                                    <td>{percentage}%</td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    ) : (
                        <div className="empty-state">
                            <p>No financial data available for {getMonthName(selectedMonth)} {selectedYear}</p>
                            <p className="empty-subtitle">Add income and expenses to see your budget overview!</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Budget Insights */}
            {pieChartData.length > 0 && (
                <div className="insights-section">
                    <h2>💡 Budget Insights</h2>
                    <div className="insights-grid">
                        <div className="insight-card">
                            <h4>Savings Rate</h4>
                            <p className="insight-value">
                                {stats.totalIncome > 0
                                    ? ((stats.balance / stats.totalIncome) * 100).toFixed(1)
                                    : '0.0'}%
                            </p>
                            <p className="insight-detail">
                                {stats.balance >= 0 ? 'Great job saving!' : 'Consider reducing expenses'}
                            </p>
                        </div>

                        <div className="insight-card">
                            <h4>Expense Ratio</h4>
                            <p className="insight-value">
                                {stats.totalIncome > 0
                                    ? ((stats.totalExpense / stats.totalIncome) * 100).toFixed(1)
                                    : '0.0'}%
                            </p>
                            <p className="insight-detail">
                                of income spent
                            </p>
                        </div>

                        <div className="insight-card">
                            <h4>Financial Status</h4>
                            <p className="insight-value">
                                {stats.balance >= 0 ? '✅ Healthy' : '⚠️ Review Needed'}
                            </p>
                            <p className="insight-detail">
                                {stats.balance >= 0
                                    ? 'Income exceeds expenses'
                                    : 'Expenses exceed income'}
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Budget;
