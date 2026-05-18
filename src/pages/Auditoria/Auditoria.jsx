import { useState } from 'react';
import { getHistorialByTag, getConteoByTag } from '../../services/auditoria';

const estadoEstilos = {
    PENDIENTE: { background: 'rgba(243,156,18,0.15)', color: '#f39c12', border: '1px solid rgba(243,156,18,0.3)' },
    APROBADO: { background: 'rgba(46,204,113,0.12)', color: '#2ecc71', border: '1px solid rgba(46,204,113,0.25)' },
    OBSERVADO: { background: 'rgba(231,76,60,0.12)', color: '#e74c3c', border: '1px solid rgba(231,76,60,0.25)' },
};

function EstadoBadge({ estado }) {
    const s = estadoEstilos[estado] || {};
    return (
        <span style={{ display: 'inline-flex', padding: '3px 10px', borderRadius: 20, fontSize: 10, fontWeight: 600, fontFamily: 'monospace', ...s }}>
            {estado || '—'}
        </span>
    );
}

export default function Auditoria() {
    const [idTag, setIdTag] = useState('');
    const [historial, setHistorial] = useState([]);
    const [conteo, setConteo] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [buscado, setBuscado] = useState(false);

    const handleBuscar = async () => {
        if (!idTag.trim()) { setError('Ingresa un ID de TAG.'); return; }
        if (isNaN(idTag)) { setError('El ID debe ser un número.'); return; }
        setLoading(true);
        setError('');
        setHistorial([]);
        setConteo(null);
        setBuscado(false);
        try {
            const [resHistorial, resConteo] = await Promise.all([
                getHistorialByTag(idTag),
                getConteoByTag(idTag),
            ]);
            setHistorial(resHistorial.data || []);
            setConteo(resConteo.data);
            setBuscado(true);
        } catch (e) {
            const status = e?.response?.status;
            setError(status === 404 ? 'No se encontró un TAG con ese ID.' : 'Error al consultar el historial.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: '28px 32px' }}>

            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <div>
                    <div style={{ fontSize: 16, fontWeight: 600, color: '#f0f4f8' }}>Registro de Auditoría</div>
                    <div style={{ fontSize: 11, color: '#8899aa', marginTop: 2 }}>Solo lectura. Consulta el historial de cambios por TAG.</div>
                </div>
            </div>

            {/* Aviso solo lectura */}
            <div style={{ background: 'rgba(52,152,219,0.08)', border: '1px solid rgba(52,152,219,0.2)', borderRadius: 8, padding: '10px 16px', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#3498db' }}>
                <span>ℹ</span>
                <span>Este registro es de solo lectura. No se permite editar ni eliminar entradas.</span>
            </div>

            {/* Buscador */}
            <div style={{ marginBottom: 24 }}>
                <div style={{ fontSize: 10, fontWeight: 600, color: '#8899aa', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
                    ID de TAG
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                    <input
                        type="text"
                        value={idTag}
                        onChange={e => { setIdTag(e.target.value); setError(''); }}
                        onKeyDown={e => e.key === 'Enter' && handleBuscar()}
                        placeholder="Ej: 1"
                        style={{ flex: 1, maxWidth: 300, background: '#1a2332', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: '10px 14px', color: '#f0f4f8', fontSize: 13, outline: 'none' }}
                    />
                    <button
                        onClick={handleBuscar}
                        disabled={loading}
                        style={{ background: '#2ecc71', color: '#1a2332', border: 'none', borderRadius: 8, padding: '10px 20px', fontSize: 12, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}
                    >
                        {loading ? 'Buscando...' : 'Buscar'}
                    </button>
                </div>
                {error && <div style={{ marginTop: 8, fontSize: 12, color: '#e74c3c' }}>{error}</div>}
            </div>

            {/* Resultado */}
            {buscado && (
                <>
                    {/* Stats */}
                    <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
                        <div style={{ background: '#1a2332', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '14px 20px' }}>
                            <div style={{ fontSize: 10, color: '#8899aa', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>TAG consultado</div>
                            <div style={{ fontSize: 20, fontWeight: 600, fontFamily: 'monospace', color: '#f0f4f8' }}>#{idTag}</div>
                        </div>
                        <div style={{ background: '#1a2332', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '14px 20px' }}>
                            <div style={{ fontSize: 10, color: '#8899aa', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Total de eventos</div>
                            <div style={{ fontSize: 20, fontWeight: 600, fontFamily: 'monospace', color: '#2ecc71' }}>{conteo?.total ?? historial.length}</div>
                        </div>
                    </div>

                    {/* Tabla historial */}
                    <div style={{ background: '#1a2332', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, overflow: 'hidden' }}>
                        <div style={{ padding: '12px 18px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                            <span style={{ fontSize: 13, fontWeight: 500, color: '#f0f4f8' }}>Historial de cambios — TAG #{idTag}</span>
                        </div>

                        {historial.length === 0 ? (
                            <div style={{ padding: '32px 18px', textAlign: 'center', color: '#8899aa', fontSize: 12 }}>
                                No hay registros de auditoría para este TAG.
                            </div>
                        ) : (
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr>
                                        {['Timestamp', 'Estado anterior', 'Estado nuevo', 'Usuario', 'Observaciones'].map(h => (
                                            <th key={h} style={{ padding: '10px 18px', fontSize: 10, fontWeight: 600, color: '#8899aa', textAlign: 'left', letterSpacing: '0.06em', textTransform: 'uppercase', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                                                {h}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {historial.map((r) => (
                                        <tr key={r.idHistorial} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                                            <td style={{ padding: '11px 18px', fontSize: 11, color: '#8899aa', fontFamily: 'monospace', whiteSpace: 'nowrap' }}>
                                                {r.fechaActualizado ? new Date(r.fechaActualizado).toLocaleString('es-CL') : '—'}
                                            </td>
                                            <td style={{ padding: '11px 18px' }}>
                                                {r.estadoAnterior ? <EstadoBadge estado={r.estadoAnterior} /> : <span style={{ color: '#8899aa', fontSize: 11 }}>—</span>}
                                            </td>
                                            <td style={{ padding: '11px 18px' }}>
                                                <EstadoBadge estado={r.estadoNuevo} />
                                            </td>
                                            <td style={{ padding: '11px 18px', fontSize: 12, color: '#d0d8e4', fontFamily: 'monospace' }}>
                                                #{r.idUsuario}
                                            </td>
                                            <td style={{ padding: '11px 18px', fontSize: 11, color: '#8899aa', maxWidth: 250 }}>
                                                {r.observaciones || '—'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}