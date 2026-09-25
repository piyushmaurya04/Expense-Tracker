import { createContext, useContext, useState, useEffect } from "react";
import api from "../services/APISevice";


const AuthContext = createContext();

export { AuthContext };

export const useAuth = () => {
    return useContext(AuthContext);
}

export const AuthProvider = ({ children }) => {

    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState("");

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
        setLoading(false);
    }, []);


    //register

    const register = async (userData) => {
        try {
            const response = await api.post('/register', userData);
            return response.data;
        } catch (error) {
            throw error;
        }
    };

    //login
    const login = async (credentials) => {
        try {
            const response = await api.post('/login', credentials);
            setUser(response.data);
            localStorage.setItem('accessToken', response.data.accessToken);
            localStorage.setItem('refreshToken', response.data.refreshToken);
            localStorage.setItem('user', JSON.stringify(response.data));
        } catch (error) {
            throw error;
        }
    };

    const logout = async () => {
        try {
            await api.post('/auth/logout');
        } catch (error) {
            console.log('Logout error:', error);
        } finally {
            // Clear storage and state
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('user');
            setUser(null);
        }
    };

    // Check if user is authenticated
    const isAuthenticated = () => {
        return !!user;
    };

    const value = {
        user,
        setUser,
        register,
        login,
        logout,
        isAuthenticated
    };
    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
