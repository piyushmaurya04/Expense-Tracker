import axios from "axios";

const expenseApi = axios.create({
    baseURL: import.meta.env.VITE_API_URL || '/api',
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
        if (error.response && error.response.status === 401) {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('user');
            window.dispatchEvent(new CustomEvent('session-expired'));
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

