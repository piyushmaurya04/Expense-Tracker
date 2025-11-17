import React, { useEffect, useState } from "react";
import './Analytics.css';
import { getAllExpenses } from "../services/ExpenseService";
import { getAllIncomes } from "../services/IncomeService";
import { useAuth } from "../Context/AuthContext";
import {
    PieChart, Pie, Cell, BarChart, Bar, LineChart, Line,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { FaDownload, FaChartPie, FaChartLine, FaChartBar, FaFileExport, FaMoneyBillWave, FaWallet } from "react-icons/fa";
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const COLORS = [
    '#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658',
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F', '#BB8FCE',
    '#85C1E2', '#F8B88B', '#AAB7B8', '#48C9B0', '#AF7AC5', '#EC7063', '#5DADE2',
    '#52BE80', '#F4D03F', '#EB984E', '#DC7633'
];

function Analytics() {
    const [expenses, setExpenses] = useState([]);
    const [incomes, setIncomes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { user } = useAuth();
    const [timeRange, setTimeRange] = useState("all"); // all, month, year
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
    const [viewMode, setViewMode] = useState("expense"); // expense or income

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

    // Filter data based on time range and view mode
    const getFilteredData = () => {
        let filtered = viewMode === "expense" ? [...expenses] : [...incomes];
        const dateField = viewMode === "expense" ? "expenseDate" : "incomeDate";

        switch (timeRange) {
            case "month":
                filtered = filtered.filter(item => {
                    const itemDate = new Date(item[dateField]);
                    return itemDate.getMonth() === selectedMonth &&
                        itemDate.getFullYear() === selectedYear;
                });
                break;
            case "year":
                filtered = filtered.filter(item => {
                    const itemDate = new Date(item[dateField]);
                    return itemDate.getFullYear() === selectedYear;
                });
                break;
            default:
                break;
        }

        return filtered;
    };

    // Calculate category-wise data for pie chart
    const getCategoryData = () => {
        const filtered = getFilteredData();
        const categoryTotals = filtered.reduce((acc, item) => {
            const category = item.category;
            acc[category] = (acc[category] || 0) + parseFloat(item.amount);
            return acc;
        }, {});

        return Object.entries(categoryTotals).map(([name, value]) => ({
            name,
            value: parseFloat(value.toFixed(2)),
            percentage: ((value / Object.values(categoryTotals).reduce((a, b) => a + b, 0)) * 100).toFixed(1)
        }));
    };

    // Calculate monthly trend data for line chart
    const getMonthlyTrendData = () => {
        const filtered = getFilteredData();
        const dateField = viewMode === "expense" ? "expenseDate" : "incomeDate";
        const monthlyData = {};

        filtered.forEach(item => {
            const date = new Date(item[dateField]);
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            monthlyData[monthKey] = (monthlyData[monthKey] || 0) + parseFloat(item.amount);
        });

        return Object.entries(monthlyData)
            .sort((a, b) => a[0].localeCompare(b[0]))
            .map(([month, amount]) => ({
                month,
                amount: parseFloat(amount.toFixed(2))
            }));
    };

    // Calculate weekly comparison for bar chart
    const getWeeklyComparisonData = () => {
        const filtered = getFilteredData();
        const dateField = viewMode === "expense" ? "expenseDate" : "incomeDate";
        const weeklyData = {};

        filtered.forEach(item => {
            const date = new Date(item[dateField]);
            const weekNumber = getWeekNumber(date);
            const weekKey = `Week ${weekNumber}`;
            weeklyData[weekKey] = (weeklyData[weekKey] || 0) + parseFloat(item.amount);
        });

        return Object.entries(weeklyData)
            .map(([week, amount]) => ({
                week,
                amount: parseFloat(amount.toFixed(2))
            }))
            .slice(-8); // Last 8 weeks
    };

    // Helper function to get week number
    const getWeekNumber = (date) => {
        const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
        const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
        return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
    };

    // Calculate statistics
    const getStatistics = () => {
        const filtered = getFilteredData();
        const total = filtered.reduce((sum, item) => sum + parseFloat(item.amount), 0);
        const average = filtered.length > 0 ? total / filtered.length : 0;
        const max = filtered.length > 0 ? Math.max(...filtered.map(e => parseFloat(e.amount))) : 0;
        const min = filtered.length > 0 ? Math.min(...filtered.map(e => parseFloat(e.amount))) : 0;

        return { total, average, max, min, count: filtered.length };
    };

    // Export to PDF
    const exportToPDF = () => {
        try {
            const doc = new jsPDF();
            const filtered = getFilteredData();
            const stats = getStatistics();
            const categoryData = getCategoryData();
            const reportType = viewMode === "expense" ? "Expense" : "Income";

            // Title
            doc.setFontSize(20);
            doc.setTextColor(16, 185, 129);
            doc.text(`${reportType} Report`, 14, 20);

            // Date and Time Range
            doc.setFontSize(10);
            doc.setTextColor(0, 0, 0);
            doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 30);
            doc.text(`Period: ${timeRange === 'all' ? 'All Time' : timeRange === 'month' ? `${getMonthName(selectedMonth)} ${selectedYear}` : `Year ${selectedYear}`}`, 14, 35);

            // Summary Statistics
            doc.setFontSize(14);
            doc.setTextColor(16, 185, 129);
            doc.text('Summary Statistics', 14, 45);
            doc.setFontSize(10);
            doc.setTextColor(0, 0, 0);
            doc.text(`Total ${reportType}s: Rs.${stats.total.toFixed(2)}`, 14, 52);
            doc.text(`Average ${reportType}: Rs.${stats.average.toFixed(2)}`, 14, 58);
            doc.text(`Highest ${reportType}: Rs.${stats.max.toFixed(2)}`, 14, 64);
            doc.text(`Lowest ${reportType}: Rs.${stats.min.toFixed(2)}`, 14, 70);
            doc.text(`Number of Transactions: ${stats.count}`, 14, 76);

            // Category Breakdown
            if (categoryData.length > 0) {
                doc.setFontSize(14);
                doc.setTextColor(16, 185, 129);
                doc.text(`${viewMode === "expense" ? "Category" : "Source"} Breakdown`, 14, 86);

                const categoryTableData = categoryData.map(cat => [
                    cat.name,
                    `Rs.${cat.value.toFixed(2)}`,
                    `${cat.percentage}%`
                ]);

                autoTable(doc, {
                    startY: 90,
                    head: [[viewMode === "expense" ? "Category" : "Source", 'Amount', 'Percentage']],
                    body: categoryTableData,
                    theme: 'grid',
                    headStyles: {
                        fillColor: [16, 185, 129],
                        textColor: [255, 255, 255],
                        fontStyle: 'bold'
                    },
                    styles: {
                        fontSize: 10
                    }
                });
            }

            // Detailed List
            if (filtered.length > 0) {
                const lastTableY = doc.lastAutoTable ? doc.lastAutoTable.finalY : 90;
                doc.setFontSize(14);
                doc.setTextColor(16, 185, 129);
                doc.text(`Detailed ${reportType} List`, 14, lastTableY + 10);

                const dateField = viewMode === "expense" ? "expenseDate" : "incomeDate";
                const categoryField = "category";

                const tableData = filtered.map(item => [
                    item.title,
                    item[categoryField],
                    `Rs.${parseFloat(item.amount).toFixed(2)}`,
                    new Date(item[dateField]).toLocaleDateString(),
                    item.note || '-'
                ]);

                autoTable(doc, {
                    startY: lastTableY + 15,
                    head: [['Title', viewMode === "expense" ? "Category" : "Source", 'Amount', 'Date', 'Description']],
                    body: tableData,
                    theme: 'striped',
                    headStyles: {
                        fillColor: [16, 185, 129],
                        textColor: [255, 255, 255],
                        fontStyle: 'bold'
                    },
                    styles: {
                        fontSize: 8,
                        cellPadding: 3
                    },
                    columnStyles: {
                        4: { cellWidth: 40 } // Description column
                    }
                });
            }

            // Save PDF
            const fileName = `${viewMode}_report_${timeRange}_${new Date().toISOString().split('T')[0]}.pdf`;
            doc.save(fileName);

            console.log('PDF generated successfully');
        } catch (error) {
            console.error('Error generating PDF:', error);
            alert('Failed to generate PDF. Please try again.');
        }
    };

    // Helper function to get month name
    const getMonthName = (monthIndex) => {
        const months = ['January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'];
        return months[monthIndex];
    };

    // Get available years from data
    const getAvailableYears = () => {
        const data = viewMode === "expense" ? expenses : incomes;
        const dateField = viewMode === "expense" ? "expenseDate" : "incomeDate";
        const years = data.map(item => new Date(item[dateField]).getFullYear());
        return [...new Set(years)].sort((a, b) => b - a);
    };

    if (loading) {
        return (
            <div className="analytics-container">
                <h1>Analytics & Reports</h1>
                <p>Loading data...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="analytics-container">
                <h1>Analytics & Reports</h1>
                <div className="alert alert-danger">
                    <strong>Error:</strong> {error}
                </div>
            </div>
        );
    }

    const categoryData = getCategoryData();
    const monthlyTrendData = getMonthlyTrendData();
    const weeklyComparisonData = getWeeklyComparisonData();
    const stats = getStatistics();
    const availableYears = getAvailableYears();

    return (
        <div className="analytics-container">
            <div className="analytics-header">
                <div>
                    <h1><FaChartBar /> Analytics & Reports</h1>
                    <p className="subtitle">Comprehensive insights into your {viewMode === "expense" ? "spending" : "income"} patterns</p>
                </div>
                <button className="export-pdf-btn" onClick={exportToPDF}>
                    <FaFileExport /> Export as PDF
                </button>
            </div>

            {/* View Mode Toggle */}
            <div className="view-mode-toggle">
                <button
                    className={`toggle-btn ${viewMode === "expense" ? "active" : ""}`}
                    onClick={() => setViewMode("expense")}
                >
                    <FaWallet /> Expense Analytics
                </button>
                <button
                    className={`toggle-btn ${viewMode === "income" ? "active" : ""}`}
                    onClick={() => setViewMode("income")}
                >
                    <FaMoneyBillWave /> Income Analytics
                </button>
            </div>

            {/* Time Range Selector */}
            <div className="time-range-selector">
                <div className="range-buttons">
                    <button
                        className={timeRange === "all" ? "active" : ""}
                        onClick={() => setTimeRange("all")}
                    >
                        All Time
                    </button>
                    <button
                        className={timeRange === "year" ? "active" : ""}
                        onClick={() => setTimeRange("year")}
                    >
                        Yearly
                    </button>
                    <button
                        className={timeRange === "month" ? "active" : ""}
                        onClick={() => setTimeRange("month")}
                    >
                        Monthly
                    </button>
                </div>

                {timeRange === "year" && (
                    <select
                        value={selectedYear}
                        onChange={(e) => setSelectedYear(Number(e.target.value))}
                        className="year-select"
                    >
                        {availableYears.map(year => (
                            <option key={year} value={year}>{year}</option>
                        ))}
                    </select>
                )}

                {timeRange === "month" && (
                    <>
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
                            {availableYears.map(year => (
                                <option key={year} value={year}>{year}</option>
                            ))}
                        </select>
                    </>
                )}
            </div>

            {/* Summary Cards */}
            <div className="summary-cards">
                <div className="summary-card">
                    <h3>Total {viewMode === "expense" ? "Spending" : "Income"}</h3>
                    <p className="amount">₹{stats.total.toFixed(2)}</p>
                    <span className="label">{stats.count} transactions</span>
                </div>
                <div className="summary-card">
                    <h3>Average {viewMode === "expense" ? "Expense" : "Income"}</h3>
                    <p className="amount">₹{stats.average.toFixed(2)}</p>
                    <span className="label">per transaction</span>
                </div>
                <div className="summary-card">
                    <h3>Highest {viewMode === "expense" ? "Expense" : "Income"}</h3>
                    <p className="amount">₹{stats.max.toFixed(2)}</p>
                    <span className="label">maximum</span>
                </div>
                <div className="summary-card">
                    <h3>Lowest {viewMode === "expense" ? "Expense" : "Income"}</h3>
                    <p className="amount">₹{stats.min.toFixed(2)}</p>
                    <span className="label">minimum</span>
                </div>
            </div>

            {(viewMode === "expense" ? expenses : incomes).length === 0 ? (
                <div className="empty-state">
                    <p>No {viewMode} data available for analysis.</p>
                    <p className="empty-subtitle">Start by adding your {viewMode === "expense" ? "expenses" : "incomes"}!</p>
                </div>
            ) : (
                <>
                    {/* Pie Chart - Category-wise Distribution */}
                    <div className="chart-section">
                        <h2><FaChartPie /> {viewMode === "expense" ? "Category-wise Spending" : "Source-wise Income"} Distribution</h2>
                        <div className="chart-container">
                            {categoryData.length > 0 ? (
                                <>
                                    <ResponsiveContainer width="100%" height={400}>
                                        <PieChart>
                                            <Pie
                                                data={categoryData}
                                                cx="50%"
                                                cy="50%"
                                                labelLine={true}
                                                label={({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
                                                    const RADIAN = Math.PI / 180;
                                                    const radius = outerRadius + 25;
                                                    const x = cx + radius * Math.cos(-midAngle * RADIAN);
                                                    const y = cy + radius * Math.sin(-midAngle * RADIAN);

                                                    return (
                                                        <text
                                                            x={x}
                                                            y={y}
                                                            fill="#10b981"
                                                            textAnchor={x > cx ? 'start' : 'end'}
                                                            dominantBaseline="central"
                                                            className="pie-chart-label"
                                                            style={{ fontSize: '12px', fontWeight: '600' }}
                                                        >
                                                            {`${(percent * 100).toFixed(1)}%`}
                                                        </text>
                                                    );
                                                }}
                                                outerRadius={120}
                                                fill="#8884d8"
                                                dataKey="value"
                                            >
                                                {categoryData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip formatter={(value) => `₹${value.toFixed(2)}`} />
                                            <Legend />
                                        </PieChart>
                                    </ResponsiveContainer>
                                    <div className="category-breakdown-table">
                                        <h3>Breakdown</h3>
                                        <table>
                                            <thead>
                                                <tr>
                                                    <th>{viewMode === "expense" ? "Category" : "Source"}</th>
                                                    <th>Amount</th>
                                                    <th>Percentage</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {categoryData.map((cat, index) => (
                                                    <tr key={index}>
                                                        <td>
                                                            <span
                                                                className="color-indicator"
                                                                style={{ backgroundColor: COLORS[index % COLORS.length] }}
                                                            ></span>
                                                            {cat.name}
                                                        </td>
                                                        <td>₹{cat.value.toFixed(2)}</td>
                                                        <td>{cat.percentage}%</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </>
                            ) : (
                                <p className="no-data">No data available for the selected period.</p>
                            )}
                        </div>
                    </div>

                    {/* Line Chart - Trends */}
                    <div className="chart-section">
                        <h2><FaChartLine /> {viewMode === "expense" ? "Spending" : "Income"} Trends Over Time</h2>
                        <div className="chart-container">
                            {monthlyTrendData.length > 0 ? (
                                <ResponsiveContainer width="100%" height={400}>
                                    <LineChart data={monthlyTrendData}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="month" />
                                        <YAxis />
                                        <Tooltip formatter={(value) => `₹${value.toFixed(2)}`} />
                                        <Legend />
                                        <Line
                                            type="monotone"
                                            dataKey="amount"
                                            stroke="#8884d8"
                                            strokeWidth={2}
                                            activeDot={{ r: 8 }}
                                            name={viewMode === "expense" ? "Monthly Spending" : "Monthly Income"}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            ) : (
                                <p className="no-data">No trend data available for the selected period.</p>
                            )}
                        </div>
                    </div>

                    {/* Bar Chart - Weekly Comparison */}
                    <div className="chart-section">
                        <h2><FaChartBar /> Weekly {viewMode === "expense" ? "Expense" : "Income"} Comparison</h2>
                        <div className="chart-container">
                            {weeklyComparisonData.length > 0 ? (
                                <ResponsiveContainer width="100%" height={400}>
                                    <BarChart data={weeklyComparisonData}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="week" />
                                        <YAxis />
                                        <Tooltip formatter={(value) => `₹${value.toFixed(2)}`} />
                                        <Legend />
                                        <Bar dataKey="amount" fill="#00C49F" name={viewMode === "expense" ? "Weekly Spending" : "Weekly Income"} />
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <p className="no-data">No weekly data available for the selected period.</p>
                            )}
                        </div>
                    </div>

                    {/* Insights Section */}
                    <div className="insights-section">
                        <h2>💡 {viewMode === "expense" ? "Spending" : "Income"} Insights</h2>
                        <div className="insights-grid">
                            {categoryData.length > 0 && (
                                <div className="insight-card">
                                    <h4>Top {viewMode === "expense" ? "Spending Category" : "Income Source"}</h4>
                                    <p className="insight-value">{categoryData[0].name}</p>
                                    <p className="insight-detail">
                                        ₹{categoryData[0].value.toFixed(2)} ({categoryData[0].percentage}% of total)
                                    </p>
                                </div>
                            )}
                            {monthlyTrendData.length > 1 && (
                                <div className="insight-card">
                                    <h4>{viewMode === "expense" ? "Spending" : "Income"} Trend</h4>
                                    <p className="insight-value">
                                        {monthlyTrendData[monthlyTrendData.length - 1].amount >
                                            monthlyTrendData[monthlyTrendData.length - 2].amount
                                            ? "📈 Increasing"
                                            : "📉 Decreasing"}
                                    </p>
                                    <p className="insight-detail">
                                        Compared to previous period
                                    </p>
                                </div>
                            )}
                            <div className="insight-card">
                                <h4>Transaction Frequency</h4>
                                <p className="insight-value">
                                    {(stats.count / (timeRange === 'month' ? 30 : timeRange === 'year' ? 365 : 365)).toFixed(1)}
                                </p>
                                <p className="insight-detail">transactions per day (avg)</p>
                            </div>
                            {categoryData.length > 0 && (
                                <div className="insight-card">
                                    <h4>{viewMode === "expense" ? "Category" : "Source"} Diversity</h4>
                                    <p className="insight-value">{categoryData.length} {viewMode === "expense" ? "Categories" : "Sources"}</p>
                                    <p className="insight-detail">actively used</p>
                                </div>
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

export default Analytics;
