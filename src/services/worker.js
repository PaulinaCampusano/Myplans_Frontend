import api from './api';

const WORKER_BASE = 'http://localhost:8095';

export const analizarPlano = async (idPlano, pdfFile) => {
    const token = localStorage.getItem('token');
    const formData = new FormData();
    formData.append('file', pdfFile);
    const response = await fetch(`${WORKER_BASE}/api/v1/worker/planos/${idPlano}/analizar`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
    });
    if (!response.ok) {
        const err = await response.json().catch(() => ({ detail: 'Error desconocido' }));
        throw new Error(err.detail || `Error ${response.status}`);
    }
    return response.json();
};

export const aplicarCambios = async (idPlano, sugerencias) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${WORKER_BASE}/api/v1/worker/planos/${idPlano}/aplicar`, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sugerencias }),
    });
    if (!response.ok) {
        const err = await response.json().catch(() => ({ detail: 'Error desconocido' }));
        throw new Error(err.detail || `Error ${response.status}`);
    }
    return response.json();
};

export const getPlanos = async () => {
    const response = await api.get('/api/v1/planos?size=100');
    return response.data.content || [];
};
