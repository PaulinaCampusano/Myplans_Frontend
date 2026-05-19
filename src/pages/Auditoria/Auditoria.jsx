import { useState, useEffect, useMemo } from 'react';
import { getAllHistorial, getUserNombres } from '../../services/auditoria';

const ESTADO_META = {
    PENDIENTE:  { bg: 'rgba(243,156,18,0.15)',  color: '#f39c12',  border: '1px solid rgba(243,156,18,0.3)'  },
    APROBADO:   { bg: 'rgba(46,204,113,0.12)',  color: '#2ecc71',  border: '1px solid rgba(46,204,113,0.25)' },
    OBSERVADO:  { bg: 'rgba(231,76,60,0.12)',   color: '#e74c3c',  border: '1px solid rgba(231,76,60,0.25)'  },
    RECHAZADO:  { bg: 'rgba(231,76,60,0.12)',   color: '#e74c3c',  border: '1px solid rgba(231,76,60,0.25)'  },
};

function EstadoBadge({ estado }) {
    const m = ESTADO_META[estado] || {};
    return (
        <span style={{ display: 'inline-flex', padding: '3px 10px', borderRadius: 20, fontSize: 10, fontWeight: 600, fontFamily: 'monospace', background: m.bg, color: m.color, border: m.border }}>
            {estado || '—'}
        </span>
    );
}

export default function Auditoria() {
    const [historial, setHistorial] = useState([]);
    const [userMap, setUserMap]     = useState({});
    const [loading, setLoading]     = useState(true);
    const [error, setError]         = useState('');
    const [busqueda, setBusqueda]   = useState('');

    useEffect(() => {
        Promise.all([getAllHistorial(), getUserNombres()])
            .then(([resH, resU]) => {
                setHistorial(resH.data || []);
                const map = {};
                (resU.data || []).forEach(u => { map[u.id] = u.nombre; });
                setUserMap(map);
            })
            .catch(() => setError('No se pudo cargar el registro de auditoría.'))
            .finally(() => setLoading(false));
    }, []);

    const filtrados = useMemo(() => {
        const q = busqueda.trim().toLowerCase();
        if (!q) return historial;
        return historial.filter(r =>
            String(r.idTag).includes(q) ||
            (userMap[r.idUsuario] || '').toLowerCase().includes(q) ||
            (r.estadoNuevo || '').toLowerCase().includes(q) ||
            (r.estadoAnterior || '').toLowerCase().includes(q) ||
            (r.observaciones || '').toLowerCase().includes(q)
        );
    }, [historial, userMap, busqueda]);

    return (
        <div style={{ padding: '28px 32px', maxWidth: 1000 }}>
            <div style={{ fontSize: 16, fontWeight: 600, color: '#f0f4f8', marginBottom: 4 }}>Registro de Auditoría</div>
            <div style={{ fontSize: 11, color: '#8899aa', marginBottom: 24 }}>Solo lectura. Historial completo de cambios de estado en TAGs.</div>

            <div style={{ background: 'rgba(52,152,219,0.08)', border: '1px solid rgba(52,152,219,0.2)', borderRadius: 8, padding: '10px 16px', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#3498db' }}>
                <span>ℹ</span>
                <span>Este registro es inmutable. No se pueden editar ni eliminar entradas.</span>
            </div>

            {/* Stats */}
            {!loading && !error && (
                <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
                    <div style={{ background: '#1a2332', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '14px 20px' }}>
                        <div style={{ fontSize: 10, color: '#8899aa', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Total eventos</div>
                        <div style={{ fontSize: 20, fontWeight: 600, fontFamily: 'monospace', color: '#2ecc71' }}>{historial.length}</div>
                    </div>
                    <div style={{ background: '#1a2332', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '14px 20px' }}>
                        <div style={{ fontSize: 10, color: '#8899aa', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>TAGs distintos</div>
                        <div style={{ fontSize: 20, fontWeight: 600, fontFamily: 'monospace', color: '#f0f4f8' }}>
                            {new Set(historial.map(r => r.idTag)).size}
                        </div>
                    </div>
                    {busqueda && (
                        <div style={{ background: '#1a2332', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '14px 20px' }}>
                            <div style={{ fontSize: 10, color: '#8899aa', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Resultados filtro</div>
                            <div style={{ fontSize: 20, fontWeight: 600, fontFamily: 'monospace', color: '#3498db' }}>{filtrados.length}</div>
                        </div>
                    )}
                </div>
            )}

            {/* Tabla con buscador */}
            <div style={{ background: '#1a2332', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, overflow: 'hidden' }}>

                {/* Header con buscador */}
                <div style={{ padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ fontSize: 10, fontWeight: 600, color: '#8899aa', textTransform: 'uppercase', letterSpacing: '0.08em', whiteSpace: 'nowrap' }}>
                        Todos los cambios
                    </span>
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8, background: '#0f1922', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: '7px 12px' }}>
                        <span style={{ fontSize: 12, color: '#8899aa' }}>🔍</span>
                        <input
                            type="text"
                            value={busqueda}
                            onChange={e => setBusqueda(e.target.value)}
                            placeholder="Buscar por TAG, usuario, estado u observación..."
                            style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', fontSize: 12, color: '#f0f4f8' }}
                        />
                        {busqueda && (
                            <button onClick={() => setBusqueda('')} style={{ background: 'none', border: 'none', color: '#8899aa', cursor: 'pointer', fontSize: 14, lineHeight: 1, padding: 0 }}>✕</button>
                        )}
                    </div>
                </div>

                {loading ? (
                    <div style={{ padding: '32px 18px', textAlign: 'center', color: '#8899aa', fontSize: 12 }}>Cargando registros...</div>
                ) : error ? (
                    <div style={{ padding: '20px 18px', fontSize: 12, color: '#e74c3c' }}>{error}</div>
                ) : filtrados.length === 0 ? (
                    <div style={{ padding: '32px 18px', textAlign: 'center', color: '#8899aa', fontSize: 12 }}>
                        {busqueda ? `Sin resultados para "${busqueda}"` : 'No hay registros de auditoría aún.'}
                    </div>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr>
                                    {['Fecha', 'TAG', 'Usuario', 'Estado anterior', 'Estado nuevo', 'Observaciones'].map(h => (
                                        <th key={h} style={{ padding: '10px 16px', fontSize: 10, fontWeight: 600, color: '#8899aa', textAlign: 'left', letterSpacing: '0.06em', textTransform: 'uppercase', borderBottom: '1px solid rgba(255,255,255,0.08)', whiteSpace: 'nowrap' }}>
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {filtrados.map((r, i) => (
                                    <tr key={r.idHistorial} style={{ borderBottom: i < filtrados.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                                        <td style={{ padding: '11px 16px', fontSize: 11, color: '#8899aa', fontFamily: 'monospace', whiteSpace: 'nowrap' }}>
                                            {r.fechaActualizado ? new Date(r.fechaActualizado).toLocaleString('es-CL') : '—'}
                                        </td>
                                        <td style={{ padding: '11px 16px', fontSize: 12, color: '#d0d8e4', fontFamily: 'monospace' }}>
                                            TAG #{r.idTag}
                                        </td>
                                        <td style={{ padding: '11px 16px', fontSize: 12, color: '#f0f4f8', whiteSpace: 'nowrap' }}>
                                            {userMap[r.idUsuario] || `#${r.idUsuario}`}
                                        </td>
                                        <td style={{ padding: '11px 16px' }}>
                                            {r.estadoAnterior ? <EstadoBadge estado={r.estadoAnterior} /> : <span style={{ color: '#8899aa', fontSize: 11 }}>—</span>}
                                        </td>
                                        <td style={{ padding: '11px 16px' }}>
                                            <EstadoBadge estado={r.estadoNuevo} />
                                        </td>
                                        <td style={{ padding: '11px 16px', fontSize: 11, color: '#8899aa', maxWidth: 260 }}>
                                            {r.observaciones || '—'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
