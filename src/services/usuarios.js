import api from './api';

export const getUsuarios = async () => {
    const response = await api.get('/api/admin/users');
    return response.data;
};

export const crearUsuario = async (data) => {
    const response = await api.post('/api/admin/users', data);
    return response.data;
};

export const toggleEstado = async (id) => {
    const response = await api.put(`/api/admin/users/${id}/toggle-status`);
    return response.data;
};

export const asignarRol = async (userId, roleName) => {
    const response = await api.post(`/api/admin/users/${userId}/roles/${roleName}`);
    return response.data;
};

export const revocarRol = async (userId, roleName) => {
    const response = await api.delete(`/api/admin/users/${userId}/roles/${roleName}`);
    return response.data;
};

export const updateUser = async (id, datos) => {
    const payload = Object.fromEntries(
        Object.entries(datos).filter(([, v]) => v !== null && v !== undefined && v !== '')
    );
    const response = await api.put(`/api/admin/users/${id}`, payload);
    return response.data;
};