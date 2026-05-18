import api from './api';

// ─── REPORTES ─────────────────────────────────────────
// Endpoints pendientes — MS de Reportes aún no implementado
// Se actualizará cuando Nicolás entregue el microservicio

export const getReportes = () =>
    api.get('/api/reportes');

export const exportarReporte = (data) =>
    api.post('/api/reportes/exportar', data, { responseType: 'blob' });