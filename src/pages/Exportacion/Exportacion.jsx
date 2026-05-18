import { useState } from 'react';
import { getPlanoById, exportarPlano } from '../../services/planos';

export default function Exportacion() {
    const [codigo, setCodigo] = useState('');
    const [plano, setPlano] = useState(null);
    const [loading, setLoading] = useState(false);
    const [loadingExp, setLoadingExp] = useState(false);
    const [error, setError] = useState('');
    const [errorExp, setErrorExp] = useState('');

    const handleBuscar = async () => {
        if (!codigo.trim()) { setError('Ingresa un ID de plano.'); return; }
        setLoading(true);
        setError('');
        setPlano(null);
        try {
            const res = await getPlanoById(codigo.trim());
            setPlano(res.data);
        } catch (e) {
            const status = e?.response?.status;
            setError(status === 404 ? 'No se encontró un plano con ese ID.' : 'Error al buscar el plano.');
        } finally {
            setLoading(false);
        }
    };

    const handleExportar = async () => {
        if (!plano) return;
        if (plano.status !== 'CERRADO') {
            setErrorExp('Debe cerrar el plano para exportar.'); return;
        }
        setLoadingExp(true);
        setErrorExp('');
        try {
            const res = await exportarPlano(plano.idPlano);
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const a = document.createElement('a');
            a.href = url;
            a.download = `protocolo_${String(plano.idPlano).padStart(3, '0')}.xlsx`;
            a.click();
            window.URL.revokeObjectURL(url);
        } catch {
            setErrorExp('Error al generar el archivo. Intenta de nuevo.');
        } finally {
            setLoadingExp(false);
        }
    };

    const estadoEstilos = {
        ABIERTO: { background: 'rgba(243,156,18,0.15)', color: '#f39c12', label: 'Abierto' },
        VALIDADO: { background: 'rgba(52,152,219,0.15)', color: '#3498db', label: 'Validado' },
        CERRADO: { background: 'rgba(127,140,141,0.15)', color: '#7f8c8d', label: 'Cerrado' },
    };

    return (
        <div style={{ padding: '28px 32px', maxWidth: 780 }}>
            <div style={{ fontSize: 16, fontWeight: 600, color: '#f0f4f8', marginBottom: 4 }}>Exportación de Entregables</div>
            <div style={{ fontSize: 11, color: '#8899aa', marginBottom: 24 }}>Solo planos en estado Cerrado pueden exportarse.</div>

            {/* Aviso */}
            <div style={{ background: 'rgba(52,152,219,0.08)', border: '1px solid rgba(52,152,219,0.2)', borderRadius: 8, padding: '10px 16px', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#3498db' }}>
                <span>ℹ</span>
                <span>La exportación solo está habilitada para planos con estado <strong>Cerrado</strong>.</span>
            </div>

            {/* Buscador */}
            <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 10, fontWeight: 600, color: '#8899aa', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
                    Código de plano
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                    <input
                        type="text"
                        value={codigo}
                        onChange={e => { setCodigo(e.target.value); setError(''); }}
                        onKeyDown={e => e.key === 'Enter' && handleBuscar()}
                        placeholder="Ej: 001-004"
                        style={{ flex: 1, background: '#1a2332', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: '10px 14px', color: '#f0f4f8', fontSize: 13, outline: 'none' }}
                    />
                    <button
                        onClick={handleBuscar}
                        disabled={loading}
                        style={{ background: '#2ecc71', color: '#1a2332', border: 'none', borderRadius: 8, padding: '10px 20px', fontSize: 12, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}
                    >
                        {loading ? 'Buscando...' : 'Buscar plano'}
                    </button>
                </div>
                {error && <div style={{ marginTop: 8, fontSize: 12, color: '#e74c3c' }}>{error}</div>}
            </div>

            {/* Resultado */}
            {plano && (
                <>
                    <div style={{ background: '#1a2332', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, overflow: 'hidden', marginBottom: 20 }}>
                        <div style={{ padding: '12px 18px', borderBottom: '1px solid rgba(255,255,255,0.08)', fontSize: 12, fontWeight: 600, color: '#8899aa', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                            Resumen — Plano {String(plano.idPlano).padStart(3, '0')}
                        </div>
                        {[
                            { label: 'Nombre', valor: plano.nombre },
                            {
                                label: 'Estado', valor: (
                                    <span style={{ display: 'inline-flex', padding: '3px 10px', borderRadius: 20, fontSize: 10, fontWeight: 600, fontFamily: 'monospace', ...(estadoEstilos[plano.status] || {}) }}>
                                        {estadoEstilos[plano.status]?.label || plano.status}
                                    </span>
                                )
                            },
                            { label: 'TAGs totales', valor: plano.cantidadTags || 0 },
                            { label: 'Formulario', valor: plano.formulario || '—' },
                            { label: 'Responsable', valor: plano.responsable || '—' },
                            { label: 'Fecha creación', valor: plano.fechaCreacion ? new Date(plano.fechaCreacion).toLocaleDateString('es-CL') : '—' },
                        ].map(({ label, valor }) => (
                            <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '11px 18px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                                <span style={{ fontSize: 12, color: '#8899aa' }}>{label}</span>
                                <span style={{ fontSize: 13, color: '#f0f4f8', fontWeight: 500 }}>{valor}</span>
                            </div>
                        ))}
                    </div>

                    {/* Formato */}
                    <div style={{ marginBottom: 20 }}>
                        <div style={{ fontSize: 10, fontWeight: 600, color: '#8899aa', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>
                            Formato de exportación
                        </div>
                        <div style={{ background: '#1a2332', border: '2px solid rgba(46,204,113,0.3)', borderRadius: 10, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14 }}>
                            <div style={{ width: 36, height: 36, background: 'rgba(46,204,113,0.1)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>📊</div>
                            <div>
                                <div style={{ fontSize: 13, fontWeight: 600, color: '#f0f4f8' }}>Protocolo Excel (.xlsx) ✓</div>
                                <div style={{ fontSize: 11, color: '#8899aa', marginTop: 2 }}>Genera el dossier oficial con todos los TAGs, estados e historial.</div>
                            </div>
                        </div>
                    </div>

                    {errorExp && (
                        <div style={{ background: 'rgba(231,76,60,0.1)', border: '1px solid rgba(231,76,60,0.25)', borderRadius: 8, padding: '10px 14px', marginBottom: 16, color: '#e74c3c', fontSize: 12 }}>
                            {errorExp}
                        </div>
                    )}

                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <button
                            onClick={() => { setPlano(null); setCodigo(''); setErrorExp(''); }}
                            style={{ background: 'transparent', color: '#8899aa', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: '9px 18px', fontSize: 12, cursor: 'pointer' }}
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={handleExportar}
                            disabled={loadingExp || plano.status !== 'CERRADO'}
                            style={{ background: plano.status === 'CERRADO' ? '#2ecc71' : 'rgba(255,255,255,0.06)', color: plano.status === 'CERRADO' ? '#1a2332' : '#8899aa', border: 'none', borderRadius: 8, padding: '9px 20px', fontSize: 12, fontWeight: 600, cursor: plano.status !== 'CERRADO' ? 'not-allowed' : 'pointer', opacity: loadingExp ? 0.7 : 1 }}
                        >
                            {loadingExp ? 'Generando...' : `↓ Descargar protocolo_${String(plano.idPlano).padStart(3, '0')}.xlsx`}
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}