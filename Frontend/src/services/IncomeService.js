import axios from "axios";

const incomeApi = axios.create({
    baseURL: `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'}/api`,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Request Interceptor - Automatically add JWT token to every request
incomeApi.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response Interceptor - Handle errors
incomeApi.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        // Only logout if token is actually invalid/expired
        // Don't logout on every 401 (could be wrong endpoint, etc.)
        if (error.response && error.response.status === 401) {
            const errorMessage = error.response.data?.message || '';
            // Only clear auth if it's specifically a token issue
            if (errorMessage.includes('token') || errorMessage.includes('Unauthorized')) {
                console.warn('Token expired or invalid, logging out...');
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                localStorage.removeItem('user');
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export const getAllIncomes = async () => {
    try {
        const response = await incomeApi.get('/incomes');
        return response.data;
    } catch (error) {
        console.error("Error fetching incomes:", error);
        throw error;
    }
};

export const addIncome = async (incomeData) => {
    try {
        const response = await incomeApi.post('/incomes', incomeData);
        console.log("Add income response:", response);
        return response.data;
    } catch (error) {
        console.error("Error adding income:", error);
        throw error;
    }
};


export const deleteIncome = async (id) => {
    try {
        const response = await incomeApi.delete(`/incomes/${id}`);
        return response.data;
    } catch (error) {
        console.error("Error deleting income:", error);
        throw error;
    }
};

export const updateIncome = async (id, incomeData) => {
    try {
        const response = await incomeApi.put(`/incomes/${id}`, incomeData);
        return response.data;
    } catch (error) {
        console.error("Error updating income:", error);
        throw error;
    }
};
