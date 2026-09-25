import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../Context/AuthContext';

function PublicRoute({ children }) {
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

    // If already logged in, redirect to dashboard
    if (isAuthenticated()) {
        return <Navigate to="/dashboard" />;
    }

    // If not logged in, show the page (login/register)
    return children;
}

export default PublicRoute;