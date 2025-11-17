import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../Context/AuthContext';


function ProtectedRoute({ children }) {
    const { isAuthenticated, loading } = useAuth();

    // Show loading while checking authentication
    if (loading) {
        return (
            <div className="text-center mt-5">
                <div className="spinner-border" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    // If not authenticated, redirect to login
    if (!isAuthenticated()) {
        return <Navigate to="/login" />;
    }

    // If authenticated, show the protected component
    return children;
}

export default ProtectedRoute;