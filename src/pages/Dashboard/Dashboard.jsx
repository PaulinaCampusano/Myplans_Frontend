import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPlanos } from '../../services/planos';

const estadoEstilos = {
    ABIERTO: { background: 'rgba(243,156,18,0.15)', color: '#f39c12', border: '1px solid rgba(243,156,18,0.3)', label: 'Abierto' },
    VALIDADO: { background: 'rgba(52,152,219,0.15)', color: '#3498db', border: '1px solid rgba(52,152,219,0.3)', label: 'Validado' },
    CERRADO: { background: 'rgba(127,140,141,0.15)', color: '#7f8c8d', border: '1px solid rgba(127,140,141,0.3)', label: 'Cerrado' },
};

function EstadoBadge({ estado }) {
    const s = estadoEstilos[estado] || estadoEstilos.ABIERTO;
    return (
        <span style={{ display: 'inline-flex', alignItems: 'center', padding: '3px 10px', borderRadius: 20, fontSize: 10, fontWeight: 600, fontFamily: 'monospace', ...s }}>
            {s.label}
        </span>
    );
}

function BarraProgreso({ valor, total }) {
    const pct = total > 0 ? Math.round((valor / total) * 100) : 0;
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ flex: 1, height: 4, background: 'rgba(255,255,255,0.08)', borderRadius: 4, overflow: 'hidden' }}>
                <div style={{ width: `${pct}%`, height: '100%', background: pct === 100 ? '#2ecc71' : '#3498db', borderRadius: 4, transition: 'width 0.4s' }} />
            </div>
            <span style={{ fontSize: 10, color: '#8899aa', fontFamily: 'monospace', minWidth: 28 }}>{pct}%</span>
        </div>
    );
}

export default function Dashboard() {
    const rol = localStorage.getItem('rol') || '';
    const navigate = useNavigate();
    const [planos, setPlanos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [busqueda, setBusqueda] = useState('');
    const [pagina, setPagina] = useState(0);
    const totalPaginas = 10;

    const cargarPlanos = async (page = 0) => {
        setLoading(true);
        setError('');
        try {
            const res = await getPlanos({ page, size: 10 });
            setPlanos(res.data.content || []);
        } catch {
            setError('No se pudieron cargar los planos.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { cargarPlanos(pagina); }, [pagina]);

    const planosFiltrados = planos.filter(p =>
        p.nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
        String(p.idPlano).includes(busqueda)
    );

    // Stats derivadas
    const totalTags = planos.reduce((acc, p) => acc + (p.cantidadTags || 0), 0);
    const totalCerrados = planos.filter(p => p.status === 'CERRADO').length;
    const totalAbiertos = planos.filter(p => p.status === 'ABIERTO').length;

    return (
        <div style={{ padding: '28px 32px' }}>

            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <div style={{ fontSize: 16, fontWeight: 600, color: '#f0f4f8' }}>Dashboard de Planos</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#1a2332', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: '7px 12px', width: 240 }}>
                    <span style={{ color: '#8899aa', fontSize: 12 }}>🔍</span>
                    <input
                        type="text"
                        placeholder="Buscar por ID de plano..."
                        value={busqueda}
                        onChange={e => setBusqueda(e.target.value)}
                        style={{ background: 'transparent', border: 'none', outline: 'none', color: '#f0f4f8', fontSize: 12, width: '100%' }}
                    />
                </div>
            </div>

            {/* Cards stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 24 }}>
                {[
                    { label: 'Planos Totales', valor: planos.length, sub: 'registrados', color: '#f0f4f8' },
                    { label: 'TAGs Registrados', valor: totalTags, sub: 'en el sistema', color: '#f0f4f8' },
                    { label: 'Planos Abiertos', valor: totalAbiertos, sub: 'en progreso', color: '#f39c12' },
                    { label: 'Planos Cerrados', valor: totalCerrados, sub: 'finalizados', color: '#2ecc71' },
                ].map(({ label, valor, sub, color }) => (
                    <div key={label} style={{ background: '#1a2332', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '16px 18px' }}>
                        <div style={{ fontSize: 10, color: '#8899aa', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>{label}</div>
                        <div style={{ fontSize: 28, fontWeight: 600, fontFamily: 'monospace', color, marginBottom: 4 }}>
                            {loading ? '—' : valor.toLocaleString()}
                        </div>
                        <div style={{ fontSize: 10, color: '#8899aa' }}>{sub}</div>
                    </div>
                ))}
            </div>

            {/* Tabla */}
            <div style={{ background: '#1a2332', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, overflow: 'hidden' }}>
                <div style={{ padding: '12px 18px', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 13, fontWeight: 500, color: '#f0f4f8' }}>Planos del proyecto</span>
                    <span style={{ fontSize: 11, color: '#8899aa', fontFamily: 'monospace' }}>{planosFiltrados.length} resultados</span>
                </div>

                {error && (
                    <div style={{ padding: '12px 18px', color: '#e74c3c', fontSize: 12 }}>{error}</div>
                )}

                {loading ? (
                    <div style={{ padding: '32px 18px', textAlign: 'center', color: '#8899aa', fontSize: 12 }}>Cargando planos...</div>
                ) : planosFiltrados.length === 0 ? (
                    <div style={{ padding: '32px 18px', textAlign: 'center', color: '#8899aa', fontSize: 12 }}>
                        {busqueda ? 'No se encontraron planos con ese criterio.' : 'No hay planos cargados aún.'}
                    </div>
                ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr>
                                {['ID Plano', 'Nombre', 'TAGs', 'Progreso', 'Estado', 'Actualizado', ''].map(h => (
                                    <th key={h} style={{ padding: '10px 18px', fontSize: 10, fontWeight: 600, color: '#8899aa', textAlign: 'left', letterSpacing: '0.06em', textTransform: 'uppercase', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {planosFiltrados.map(plano => (
                                <tr key={plano.idPlano} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', cursor: 'pointer' }}
                                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                >
                                    <td style={{ padding: '12px 18px', fontFamily: 'monospace', fontSize: 11, color: '#8899aa' }}>
                                        {String(plano.idPlano).padStart(3, '0')}
                                    </td>
                                    <td style={{ padding: '12px 18px', fontSize: 13, color: '#f0f4f8', fontWeight: 500 }}>
                                        {plano.nombre}
                                    </td>
                                    <td style={{ padding: '12px 18px', fontSize: 12, color: '#d0d8e4', fontFamily: 'monospace' }}>
                                        {plano.cantidadTags || 0}
                                    </td>
                                    <td style={{ padding: '12px 18px', minWidth: 140 }}>
                                        <BarraProgreso valor={plano.cantidadTags || 0} total={plano.cantidadTags || 0} />
                                    </td>
                                    <td style={{ padding: '12px 18px' }}>
                                        <EstadoBadge estado={plano.status} />
                                    </td>
                                    <td style={{ padding: '12px 18px', fontSize: 11, color: '#8899aa', fontFamily: 'monospace' }}>
                                        {plano.fechaCreacion ? new Date(plano.fechaCreacion).toLocaleDateString('es-CL') : '—'}
                                    </td>
                                    <td style={{ padding: '12px 18px', textAlign: 'right' }}>
                                        {localStorage.getItem('rol') !== 'ROLE_ADMIN' && (
                                            <button
                                                onClick={() => navigate('/precomisionamiento', { state: { idPlano: plano.idPlano } })}
                                                style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, padding: '4px 10px', color: '#8899aa', fontSize: 11, cursor: 'pointer' }}
                                            >
                                                →
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}

                {/* Paginación */}
                {!loading && planos.length > 0 && (
                    <div style={{ padding: '12px 18px', borderTop: '1px solid rgba(255,255,255,0.08)', display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                        <button
                            onClick={() => setPagina(p => Math.max(0, p - 1))}
                            disabled={pagina === 0}
                            style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, padding: '4px 12px', color: pagina === 0 ? '#8899aa' : '#f0f4f8', fontSize: 11, cursor: pagina === 0 ? 'not-allowed' : 'pointer' }}
                        >
                            ← Anterior
                        </button>
                        <span style={{ fontSize: 11, color: '#8899aa', display: 'flex', alignItems: 'center', fontFamily: 'monospace' }}>
                            Página {pagina + 1}
                        </span>
                        <button
                            onClick={() => setPagina(p => p + 1)}
                            disabled={planos.length < 10}
                            style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, padding: '4px 12px', color: planos.length < 10 ? '#8899aa' : '#f0f4f8', fontSize: 11, cursor: planos.length < 10 ? 'not-allowed' : 'pointer' }}
                        >
                            Siguiente →
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}