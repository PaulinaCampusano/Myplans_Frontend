import api from './api';

// ─── PLANOS ───────────────────────────────────────────

export const getPlanos = (params = {}) =>
    api.get('/api/v1/planos', { params });

export const getPlanoById = (idPlano) =>
    api.get(`/api/v1/planos/${idPlano}`);

export const createPlano = (data) =>
    api.post('/api/v1/planos', data);

export const updatePlano = (idPlano, data) =>
    api.put(`/api/v1/planos/${idPlano}`, data);

export const uploadPlanoPdf = (idPlano, file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post(`/api/v1/planos/${idPlano}/pdf`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
};

export const validarPlano = (idPlano) =>
    api.put(`/api/v1/planos/${idPlano}/validar`);

export const cerrarPlano = (idPlano) =>
    api.put(`/api/v1/planos/${idPlano}/cerrar`);

export const exportarPlano = (idPlano, statusExport, observaciones = '') =>
    api.get(`/api/v1/reportes/plano/${idPlano}/excel`, {
        params: { statusExport, observaciones },
        responseType: 'blob',
    });

// ─── TAGS ─────────────────────────────────────────────

export const getTagsByPlano = (idPlano) =>
    api.get(`/api/v1/planos/${idPlano}/tags`);

export const getTagById = (idTag) =>
    api.get(`/api/v1/tags/${idTag}`);

export const uploadTagsExcel = (idPlano, file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post(`/api/v1/planos/${idPlano}/tags/excel`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
};

export const updateTagEstado = (idTag, estadoNuevo, comentario = null) =>
    api.patch(`/api/v1/tags/${idTag}/estado`, { estadoNuevo, comentario });