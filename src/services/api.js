import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:8095',
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Interceptor de respuesta — captura 401/403 globalmente
api.interceptors.response.use(
    (response) => response,
    (error) => {
        const status = error?.response?.status;
        const url = error?.response?.config?.url || '';

        // Si es 401 (token expirado) redirigir al login
        if (status === 401) {
            localStorage.clear();
            window.dispatchEvent(new Event('sessionExpirada'));
        }

        return Promise.reject(error);
    }
);

export default api;