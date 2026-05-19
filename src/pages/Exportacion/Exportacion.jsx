import { useState, useEffect } from 'react';
import { getPlanos, exportarPlano } from '../../services/planos';

const ESTADO_META = {
    ABIERTO:  { color: '#f39c12', bg: 'rgba(243,156,18,0.15)',  label: 'Abierto'  },
    VALIDADO: { color: '#3498db', bg: 'rgba(52,152,219,0.15)',  label: 'Validado' },
    CERRADO:  { color: '#7f8c8d', bg: 'rgba(127,140,141,0.15)', label: 'Cerrado'  },
};

function EstadoBadge({ status }) {
    const m = ESTADO_META[status] || {};
    return (
        <span style={{ display: 'inline-flex', padding: '3px 10px', borderRadius: 20, fontSize: 10, fontWeight: 600, fontFamily: 'monospace', background: m.bg, color: m.color }}>
            {m.label || status}
        </span>
    );
}

export default function Exportacion() {
    const [planos, setPlanos]         = useState([]);
    const [loadingList, setLoadingList] = useState(true);
    const [plano, setPlano]           = useState(null);
    const [step, setStep]             = useState('lista'); // lista | detalle | confirmar
    const [statusExport, setStatusExport] = useState('VIGENTE');
    const [observaciones, setObservaciones] = useState('');
    const [loadingExp, setLoadingExp] = useState(false);
    const [errorExp, setErrorExp]     = useState('');
    const [errorList, setErrorList]   = useState('');
    const [busqueda, setBusqueda]     = useState('');

    useEffect(() => {
        getPlanos({ page: 0, size: 100 })
            .then(res => setPlanos(res.data.content || []))
            .catch(() => setErrorList('No se pudieron cargar los planos.'))
            .finally(() => setLoadingList(false));
    }, []);

    const handleSeleccionar = (p) => {
        setPlano(p);
        setObservaciones(p.observaciones || '');
        setStatusExport('VIGENTE');
        setErrorExp('');
        setStep('detalle');
    };

    const handleExportar = async () => {
        if (!plano) return;
        setLoadingExp(true);
        setErrorExp('');
        try {
            const res = await exportarPlano(plano.idPlano, statusExport, observaciones);
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const a = document.createElement('a');
            a.href = url;
            a.download = `protocolo_${String(plano.idPlano).padStart(3, '0')}.xlsx`;
            a.click();
            window.URL.revokeObjectURL(url);
            setStep('lista');
            setPlano(null);
        } catch {
            setErrorExp('Error al generar el archivo. Intenta de nuevo.');
        } finally {
            setLoadingExp(false);
        }
    };

    const handleVolver = () => {
        if (step === 'confirmar') { setStep('detalle'); setErrorExp(''); }
        else { setPlano(null); setStep('lista'); setErrorExp(''); }
    };

    return (
        <div style={{ padding: '28px 32px', maxWidth: 780 }}>
            <div style={{ fontSize: 16, fontWeight: 600, color: '#f0f4f8', marginBottom: 4 }}>Exportación de Entregables</div>
            <div style={{ fontSize: 11, color: '#8899aa', marginBottom: 24 }}>Solo planos en estado Cerrado pueden exportarse.</div>

            <div style={{ background: 'rgba(52,152,219,0.08)', border: '1px solid rgba(52,152,219,0.2)', borderRadius: 8, padding: '10px 16px', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#3498db' }}>
                <span>ℹ</span>
                <span>La exportación solo está habilitada para planos con estado <strong>Cerrado</strong>.</span>
            </div>

            {/* ── PASO: lista ── */}
            {step === 'lista' && (
                <div style={{ background: '#1a2332', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, overflow: 'hidden' }}>
                    <div style={{ padding: '12px 18px', borderBottom: '1px solid rgba(255,255,255,0.08)', fontSize: 10, fontWeight: 600, color: '#8899aa', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                        Selecciona un plano
                    </div>

                    <div style={{ padding: '10px 14px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#0f1922', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: '8px 12px' }}>
                            <span style={{ fontSize: 12, color: '#8899aa' }}>🔍</span>
                            <input
                                type="text"
                                value={busqueda}
                                onChange={e => setBusqueda(e.target.value)}
                                placeholder="Buscar por nombre o código..."
                                style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', fontSize: 12, color: '#f0f4f8' }}
                            />
                            {busqueda && (
                                <button onClick={() => setBusqueda('')} style={{ background: 'none', border: 'none', color: '#8899aa', cursor: 'pointer', fontSize: 14, lineHeight: 1, padding: 0 }}>✕</button>
                            )}
                        </div>
                    </div>

                    {loadingList ? (
                        <div style={{ padding: '24px 18px', fontSize: 12, color: '#8899aa', textAlign: 'center' }}>Cargando planos...</div>
                    ) : errorList ? (
                        <div style={{ padding: '16px 18px', fontSize: 12, color: '#e74c3c' }}>{errorList}</div>
                    ) : planos.length === 0 ? (
                        <div style={{ padding: '24px 18px', fontSize: 12, color: '#8899aa', textAlign: 'center' }}>No hay planos disponibles.</div>
                    ) : (
                        <div style={{ maxHeight: 360, overflowY: 'auto' }}>
                            {(() => {
                                const q = busqueda.trim().toLowerCase();
                                const filtrados = q
                                    ? planos.filter(p =>
                                        p.nombre?.toLowerCase().includes(q) ||
                                        p.codigoPlano?.toLowerCase().includes(q))
                                    : planos;
                                if (filtrados.length === 0) return (
                                    <div style={{ padding: '20px 18px', fontSize: 12, color: '#8899aa', textAlign: 'center' }}>
                                        Sin resultados para "{busqueda}"
                                    </div>
                                );
                                return filtrados.map((p, i) => (
                                    <div
                                        key={p.idPlano}
                                        onClick={() => handleSeleccionar(p)}
                                        style={{
                                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                            padding: '13px 18px', cursor: 'pointer',
                                            borderBottom: i < filtrados.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                                            transition: 'background 0.15s',
                                        }}
                                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
                                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                    >
                                        <div>
                                            <div style={{ fontSize: 13, fontWeight: 500, color: '#f0f4f8' }}>{p.nombre}</div>
                                            <div style={{ fontSize: 10, color: '#8899aa', marginTop: 2, fontFamily: 'monospace' }}>
                                                #{String(p.idPlano).padStart(3, '0')}
                                                {p.codigoPlano ? ` · ${p.codigoPlano}` : ''}
                                                {` · ${p.cantidadTags || 0} TAGs`}
                                            </div>
                                        </div>
                                        <EstadoBadge status={p.status} />
                                    </div>
                                ));
                            })()}
                        </div>
                    )}
                </div>
            )}

            {/* ── PASO: detalle ── */}
            {step === 'detalle' && plano && (
                <>
                    <div style={{ background: '#1a2332', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, overflow: 'hidden', marginBottom: 20 }}>
                        <div style={{ padding: '12px 18px', borderBottom: '1px solid rgba(255,255,255,0.08)', fontSize: 12, fontWeight: 600, color: '#8899aa', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                            Resumen — Plano {String(plano.idPlano).padStart(3, '0')}
                        </div>
                        {[
                            { label: 'Nombre',         valor: plano.nombre },
                            { label: 'Estado',         valor: <EstadoBadge status={plano.status} /> },
                            { label: 'TAGs totales',   valor: plano.cantidadTags || 0 },
                            { label: 'Formulario',     valor: plano.formulario || '—' },
                            { label: 'Responsable',    valor: plano.responsable || '—' },
                            { label: 'Fecha creación', valor: plano.fechaCreacion ? new Date(plano.fechaCreacion).toLocaleDateString('es-CL') : '—' },
                        ].map(({ label, valor }) => (
                            <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '11px 18px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                                <span style={{ fontSize: 12, color: '#8899aa' }}>{label}</span>
                                <span style={{ fontSize: 13, color: '#f0f4f8', fontWeight: 500 }}>{valor}</span>
                            </div>
                        ))}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <button onClick={handleVolver} style={{ background: 'transparent', color: '#8899aa', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: '9px 18px', fontSize: 12, cursor: 'pointer' }}>
                            ← Volver
                        </button>
                        <button
                            onClick={() => { if (plano.status !== 'CERRADO') { setErrorExp('El plano debe estar en estado Cerrado para exportar.'); return; } setStep('confirmar'); setErrorExp(''); }}
                            style={{ background: plano.status === 'CERRADO' ? '#2ecc71' : 'rgba(255,255,255,0.06)', color: plano.status === 'CERRADO' ? '#1a2332' : '#8899aa', border: 'none', borderRadius: 8, padding: '9px 20px', fontSize: 12, fontWeight: 600, cursor: plano.status !== 'CERRADO' ? 'not-allowed' : 'pointer' }}
                        >
                            Continuar →
                        </button>
                    </div>
                    {errorExp && <div style={{ marginTop: 10, fontSize: 12, color: '#e74c3c' }}>{errorExp}</div>}
                </>
            )}

            {/* ── PASO: confirmar (status + observaciones) ── */}
            {step === 'confirmar' && plano && (
                <>
                    <div style={{ background: '#1a2332', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: 20, marginBottom: 20 }}>
                        <div style={{ fontSize: 10, fontWeight: 600, color: '#8899aa', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 16, paddingBottom: 8, borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                            Datos para el documento de entrega
                        </div>

                        {/* Status */}
                        <div style={{ marginBottom: 16 }}>
                            <label style={{ display: 'block', fontSize: 11, fontWeight: 500, color: '#8899aa', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 6 }}>
                                Status del plano <span style={{ color: '#e74c3c' }}>*</span>
                            </label>
                            <div style={{ display: 'flex', gap: 8 }}>
                                {['VIGENTE', 'PRELIMINAR', 'NULO'].map(op => (
                                    <button
                                        key={op}
                                        onClick={() => setStatusExport(op)}
                                        style={{
                                            flex: 1, padding: '9px 0', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer', border: '1px solid',
                                            borderColor: statusExport === op ? '#2ecc71' : 'rgba(255,255,255,0.08)',
                                            background: statusExport === op ? 'rgba(46,204,113,0.12)' : '#0f1922',
                                            color: statusExport === op ? '#2ecc71' : '#8899aa',
                                        }}
                                    >
                                        {op}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Observaciones */}
                        <div>
                            <label style={{ display: 'block', fontSize: 11, fontWeight: 500, color: '#8899aa', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 6 }}>
                                Observaciones del supervisor
                            </label>
                            <textarea
                                value={observaciones}
                                onChange={e => setObservaciones(e.target.value)}
                                placeholder="Comentarios generales sobre el plano para el entregable..."
                                rows={3}
                                style={{ width: '100%', background: '#0f1922', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: '9px 13px', color: '#f0f4f8', fontSize: 13, outline: 'none', resize: 'vertical', fontFamily: 'inherit' }}
                            />
                        </div>
                    </div>

                    <div style={{ background: '#1a2332', border: '2px solid rgba(46,204,113,0.3)', borderRadius: 10, padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                        <span style={{ fontSize: 20 }}>📊</span>
                        <div>
                            <div style={{ fontSize: 13, fontWeight: 600, color: '#f0f4f8' }}>Planilla de Amarillado (.xlsx)</div>
                            <div style={{ fontSize: 11, color: '#8899aa', marginTop: 2 }}>34 columnas · {plano.cantidadTags || 0} TAGs + hoja de historial</div>
                        </div>
                    </div>

                    {errorExp && (
                        <div style={{ background: 'rgba(231,76,60,0.1)', border: '1px solid rgba(231,76,60,0.25)', borderRadius: 8, padding: '10px 14px', marginBottom: 14, color: '#e74c3c', fontSize: 12 }}>
                            {errorExp}
                        </div>
                    )}

                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <button onClick={handleVolver} style={{ background: 'transparent', color: '#8899aa', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: '9px 18px', fontSize: 12, cursor: 'pointer' }}>
                            ← Volver
                        </button>
                        <button
                            onClick={handleExportar}
                            disabled={loadingExp}
                            style={{ background: '#2ecc71', color: '#1a2332', border: 'none', borderRadius: 8, padding: '9px 22px', fontSize: 12, fontWeight: 600, cursor: loadingExp ? 'not-allowed' : 'pointer', opacity: loadingExp ? 0.7 : 1 }}
                        >
                            {loadingExp ? 'Generando...' : `↓ Descargar protocolo_${String(plano.idPlano).padStart(3, '0')}.xlsx`}
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}
