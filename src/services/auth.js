import api from './api';

export const login = async (email, password) => {
    const response = await api.post('/api/auth/login', { email, password });
    const data = response.data;
    localStorage.setItem('token', data.token);
    localStorage.setItem('email', data.email);
    localStorage.setItem('rol', data.rol);
    localStorage.setItem('nombreCompleto', data.nombreCompleto);
    localStorage.setItem('permisos', JSON.stringify(data.permisos));
    return data;
};

export const register = async (registerData) => {
    const response = await api.post('/api/auth/register', registerData);
    return response.data;
};

export const requestPasswordReset = async (email) => {
    const response = await api.post('/api/auth/reset-password', { email });
    return response.data;
};

export const resetPassword = async (token, newPassword) => {
    const response = await api.post('/api/auth/new-password', { token, newPassword });
    return response.data;
};

export const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('email');
    localStorage.removeItem('rol');
    localStorage.removeItem('nombreCompleto');
    localStorage.removeItem('permisos');
};
export const getMe = async () => {
    const response = await api.get('/api/auth/me');
    return response.data;
};

export const updateMe = async (datos) => {
    const response = await api.put('/api/auth/me', datos);
    return response.data;
};

export const changeMyPassword = async (currentPassword, newPassword) => {
    const response = await api.put('/api/auth/me/password', { currentPassword, newPassword });
    return response.data;
};