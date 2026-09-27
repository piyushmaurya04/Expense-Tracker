import axios from "axios";

const incomeApi = axios.create({
    baseURL: import.meta.env.VITE_API_URL || '/api',
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
        if (error.response && error.response.status === 401) {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('user');
            window.dispatchEvent(new CustomEvent('session-expired'));
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
