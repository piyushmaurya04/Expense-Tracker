import axios from "axios";

const expenseApi = axios.create({
    baseURL: 'http://localhost:8080/api',
    headers: {
        'Content-Type': 'application/json'
    }
});

// Request Interceptor - Automatically add JWT token to every request
expenseApi.interceptors.request.use(
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
expenseApi.interceptors.response.use(
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

export const getAllExpenses = async () => {
    try {
        const response = await expenseApi.get('/expenses');
        return response.data;
    } catch (error) {
        console.error("Error fetching expenses:", error);
        throw error;
    }
};

export const addExpense = async (expenseData) => {
    try {
        const response = await expenseApi.post('/expenses', expenseData);
        console.log("Add expense response:", response);
        return response.data;
    } catch (error) {
        console.error("Error adding expense:", error);
        throw error;
    }
};


export const deleteExpense = async (id) => {
    try {
        const response = await expenseApi.delete(`/expenses/${id}`);
        return response.data;
    } catch (error) {
        console.error("Error deleting expense:", error);
        throw error;
    }
};

export const updateExpense = async (id, expenseData) => {
    try {
        const response = await expenseApi.put(`/expenses/${id}`, expenseData);
        return response.data;
    } catch (error) {
        console.error("Error updating expense:", error);
        throw error;
    }
};

