import api from './api';

// ─── AUDITORÍA ────────────────────────────────────────

export const getAllHistorial = () =>
    api.get('/api/v1/historial');

export const getHistorialByTag = (idTag) =>
    api.get(`/api/v1/historial/tag/${idTag}`);

export const getConteoByTag = (idTag) =>
    api.get(`/api/v1/historial/tag/${idTag}/count`);

export const getUserNombres = () =>
    api.get('/api/admin/users/nombres');