import api from './api';

// ─── AUDITORÍA ────────────────────────────────────────
// MS Auditoría corre en puerto 8082, enrutado por gateway en /api/v1/historial

export const getHistorialByTag = (idTag) =>
    api.get(`/api/v1/historial/tag/${idTag}`);

export const getConteoByTag = (idTag) =>
    api.get(`/api/v1/historial/tag/${idTag}/count`);