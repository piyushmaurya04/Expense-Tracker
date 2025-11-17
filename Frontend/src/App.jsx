import React from 'react'
import AddExpense from './Components/AddExpense'
import AddIncome from './Components/AddIncome'
import Navbar from './Components/Navbar'
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Register from './Components/Register';
import { AuthProvider, useAuth } from './Context/AuthContext';
import { ThemeProvider } from './Context/ThemeContext';
import Login from './Components/Login';
import Dashboard from './Components/Dashboard';
import ProtectedRoute from './Components/ProtectedRoute';
import PublicRoute from './Components/PublicRoute';
import AllExpenses from './Components/ALLExpense';
import AllIncomes from './Components/ALLIncome';
import Profile from './Components/Profile';
import Analytics from './Components/Analytics';
import Budget from './Components/Budget';
function AppContent() {
  const { user } = useAuth();
  const location = useLocation();

  // Hide navbar on login and register pages
  const hideNavbar = location.pathname === '/login' || location.pathname === '/register';

  return (
    <>
      {!hideNavbar && user && <Navbar />}
      <Routes>
        {/* Redirect root to dashboard */}
        <Route path="/" element={<Navigate to="/dashboard" />} />

        {/* Public Routes - Only for non-logged-in users */}
        <Route
          path="/register"
          element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          }
        />
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />

        {/* Protected Routes - Only for logged-in users */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/add-expense"
          element={
            <ProtectedRoute>
              <div className="container mt-4">
                <AddExpense />
              </div>
            </ProtectedRoute>
          }
        />
        <Route
          path="/all-expenses"
          element={
            <ProtectedRoute>
              <div className="container mt-4">
                <AllExpenses />
              </div>
            </ProtectedRoute>
          }
        />
        <Route
          path="/add-income"
          element={
            <ProtectedRoute>
              <div className="container mt-4">
                <AddIncome />
              </div>
            </ProtectedRoute>
          }
        />
        <Route
          path="/all-incomes"
          element={
            <ProtectedRoute>
              <div className="container mt-4">
                <AllIncomes />
              </div>
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <div className="container mt-4">
                <Profile />
              </div>
            </ProtectedRoute>
          }
        />
        <Route
          path="/analytics"
          element={
            <ProtectedRoute>
              <Analytics />
            </ProtectedRoute>
          }
        />
        <Route
          path="/budget"
          element={
            <ProtectedRoute>
              <Budget />
            </ProtectedRoute>
          }
        />
      </Routes>
    </>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <AppContent />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App
