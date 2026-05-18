import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

import { getPlanos, getTagsByPlano, updateTagEstado, validarPlano, cerrarPlano } from '../../services/planos';

const getRol = () => localStorage.getItem('rol') || '';

const estadoEstilos = {
    PENDIENTE: { background: 'rgba(243,156,18,0.15)', color: '#f39c12', border: '1px solid rgba(243,156,18,0.3)' },
    APROBADO: { background: 'rgba(46,204,113,0.12)', color: '#2ecc71', border: '1px solid rgba(46,204,113,0.25)' },
    OBSERVADO: { background: 'rgba(231,76,60,0.12)', color: '#e74c3c', border: '1px solid rgba(231,76,60,0.25)' },
};

function EstadoBadge({ estado }) {
    const s = estadoEstilos[estado] || {};
    return (
        <span style={{ display: 'inline-flex', padding: '3px 9px', borderRadius: 20, fontSize: 10, fontWeight: 600, fontFamily: 'monospace', ...s }}>
            {estado}
        </span>
    );
}

export default function Precomisionamiento() {
    const location = useLocation();
    const rol = getRol();
    const esSupervisor = rol === 'ROLE_AUDITOR';
    const esOperador = rol === 'ROLE_USER';

    const [planos, setPlanos] = useState([]);
    const [planoActivo, setPlanoActivo] = useState(null);
    const [tags, setTags] = useState([]);
    const [tagSeleccionado, setTagSeleccionado] = useState(null);
    const [loadingPlanos, setLoadingPlanos] = useState(true);
    const [loadingTags, setLoadingTags] = useState(false);
    const [loadingAccion, setLoadingAccion] = useState(false);
    const [error, setError] = useState('');
    const [exito, setExito] = useState('');
    const [nuevoEstado, setNuevoEstado] = useState('');
    const [comentario, setComentario] = useState('');
    const [errorPanel, setErrorPanel] = useState('');
    const [loadingValidar, setLoadingValidar] = useState(false);
    const [loadingCerrar, setLoadingCerrar] = useState(false);

    // ── Visor PDF ────────────────────────────────────────
    const [pdfUrl, setPdfUrl] = useState(null);

    useEffect(() => {
        const cargar = async () => {
            setLoadingPlanos(true);
            try {
                const res = await getPlanos({ page: 0, size: 50 });
                const lista = res.data.content || [];
                setPlanos(lista);
                const idDesde = location.state?.idPlano;
                if (idDesde) {
                    const encontrado = lista.find(p => p.idPlano === idDesde);
                    if (encontrado) seleccionarPlano(encontrado);
                }
            } catch {
                setError('No se pudieron cargar los planos.');
            } finally {
                setLoadingPlanos(false);
            }
        };
        cargar();
    }, []);

    const seleccionarPlano = async (plano) => {
        setPlanoActivo(plano);
        setTagSeleccionado(null);
        setNuevoEstado('');
        setComentario('');
        setErrorPanel('');
        setExito('');
        // Si el plano tiene URL del PDF, usarla a través del gateway
        if (plano.urlS3) {
            try {
                const token = localStorage.getItem('token');
                const res = await fetch(`http://localhost:8095/api/v1/planos/${plano.idPlano}/pdf`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const blob = await res.blob();
                const url = URL.createObjectURL(blob);
                setPdfUrl(url);
            } catch {
                setPdfUrl(null);
            }
        } else {
            setPdfUrl(null);
        }
        setLoadingTags(true);
        try {
            const res = await getTagsByPlano(plano.idPlano);
            setTags(res.data || []);
        } catch {
            setError('No se pudieron cargar los TAGs.');
        } finally {
            setLoadingTags(false);
        }
    };

    const seleccionarTag = (tag) => {
        setTagSeleccionado(tag);
        setNuevoEstado(tag.estadoActual);
        setComentario(tag.comentario || '');
        setErrorPanel('');
        setExito('');
    };

    const handleGuardarCambio = async () => {
        if (!nuevoEstado) { setErrorPanel('Selecciona un estado.'); return; }
        if (nuevoEstado === 'OBSERVADO' && !comentario.trim()) {
            setErrorPanel('El comentario es obligatorio cuando el estado es OBSERVADO.'); return;
        }
        if (planoActivo?.status === 'CERRADO') {
            setErrorPanel('El plano está cerrado. No se pueden modificar TAGs.'); return;
        }
        setLoadingAccion(true);
        setErrorPanel('');
        try {
            const res = await updateTagEstado(tagSeleccionado.idTag, nuevoEstado, comentario || null);
            const tagActualizado = res.data;
            setTags(prev => prev.map(t => t.idTag === tagActualizado.idTag ? tagActualizado : t));
            setTagSeleccionado(tagActualizado);
            setExito('Estado actualizado correctamente.');
            setTimeout(() => setExito(''), 3000);
        } catch (e) {
            setErrorPanel(e?.response?.data?.message || 'Error al actualizar el TAG.');
        } finally {
            setLoadingAccion(false);
        }
    };

    const handleValidar = async () => {
        setLoadingValidar(true);
        try {
            const res = await validarPlano(planoActivo.idPlano);
            setPlanoActivo(res.data);
            setExito('Plano validado correctamente.');
            setTimeout(() => setExito(''), 3000);
        } catch (e) {
            setError(e?.response?.data?.message || 'Error al validar el plano.');
        } finally {
            setLoadingValidar(false);
        }
    };

    const handleCerrar = async () => {
        setLoadingCerrar(true);
        try {
            const res = await cerrarPlano(planoActivo.idPlano);
            setPlanoActivo(res.data);
            setExito('Plano cerrado correctamente.');
            setTimeout(() => setExito(''), 3000);
        } catch (e) {
            setError(e?.response?.data?.message || 'Error al cerrar el plano.');
        } finally {
            setLoadingCerrar(false);
        }
    };

    const totalTags = tags.length;
    const aprobados = tags.filter(t => t.estadoActual === 'APROBADO').length;
    const observados = tags.filter(t => t.estadoActual === 'OBSERVADO').length;
    const pendientes = tags.filter(t => t.estadoActual === 'PENDIENTE').length;
    const pctProgreso = totalTags > 0 ? Math.round((aprobados / totalTags) * 100) : 0;
    const planoCerrado = planoActivo?.status === 'CERRADO';
    const planoValidado = planoActivo?.status === 'VALIDADO';

    // ── Lista de planos ──────────────────────────────────
    if (!planoActivo) {
        return (
            <div style={{ padding: '28px 32px' }}>
                <div style={{ fontSize: 16, fontWeight: 600, color: '#f0f4f8', marginBottom: 4 }}>Precomisionamiento</div>
                <div style={{ fontSize: 11, color: '#8899aa', marginBottom: 24 }}>Selecciona un plano para comenzar.</div>
                {error && <div style={{ background: 'rgba(231,76,60,0.1)', border: '1px solid rgba(231,76,60,0.25)', borderRadius: 8, padding: '10px 14px', marginBottom: 16, color: '#e74c3c', fontSize: 12 }}>{error}</div>}
                {loadingPlanos ? (
                    <div style={{ color: '#8899aa', fontSize: 12 }}>Cargando planos...</div>
                ) : planos.length === 0 ? (
                    <div style={{ color: '#8899aa', fontSize: 12 }}>No hay planos disponibles.</div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
                        {planos.map(plano => {
                            const s = { ABIERTO: { color: '#f39c12', label: 'Abierto' }, VALIDADO: { color: '#3498db', label: 'Validado' }, CERRADO: { color: '#7f8c8d', label: 'Cerrado' } }[plano.status] || {};
                            return (
                                <div key={plano.idPlano} onClick={() => seleccionarPlano(plano)}
                                    style={{ background: '#1a2332', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '16px 18px', cursor: 'pointer' }}
                                    onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(46,204,113,0.3)'}
                                    onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                                        <span style={{ fontFamily: 'monospace', fontSize: 11, color: '#8899aa' }}>#{String(plano.idPlano).padStart(3, '0')}</span>
                                        <span style={{ fontSize: 10, fontWeight: 600, color: s.color, fontFamily: 'monospace' }}>{s.label}</span>
                                    </div>
                                    <div style={{ fontSize: 13, fontWeight: 500, color: '#f0f4f8', marginBottom: 8 }}>{plano.nombre}</div>
                                    <div style={{ fontSize: 11, color: '#8899aa' }}>{plano.cantidadTags || 0} TAGs</div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        );
    }

    // ── Vista principal ──────────────────────────────────
    return (
        <div style={{ display: 'flex', height: '100%', overflow: 'hidden' }}>

            {/* Panel izquierdo: lista TAGs */}
            <div style={{ width: 280, minWidth: 280, borderRight: '1px solid rgba(255,255,255,0.08)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                <div style={{ padding: '14px 16px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                    <button onClick={() => setPlanoActivo(null)} style={{ background: 'transparent', border: 'none', color: '#8899aa', fontSize: 11, cursor: 'pointer', marginBottom: 8, padding: 0 }}>
                        ← Volver
                    </button>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#f0f4f8' }}>{planoActivo.nombre}</div>
                    <div style={{ fontSize: 10, color: '#8899aa', marginTop: 2, fontFamily: 'monospace' }}>#{String(planoActivo.idPlano).padStart(3, '0')} · {planoActivo.status}</div>
                    <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
                        {[{ label: `${aprobados} ✓`, color: '#2ecc71' }, { label: `${observados} !`, color: '#e74c3c' }, { label: `${pendientes} ○`, color: '#8899aa' }].map(({ label, color }) => (
                            <span key={label} style={{ fontSize: 11, color, fontFamily: 'monospace', fontWeight: 600 }}>{label}</span>
                        ))}
                    </div>
                    <div style={{ marginTop: 8, height: 3, background: 'rgba(255,255,255,0.08)', borderRadius: 4, overflow: 'hidden' }}>
                        <div style={{ width: `${pctProgreso}%`, height: '100%', background: '#2ecc71', borderRadius: 4 }} />
                    </div>
                    {esSupervisor && !planoCerrado && (
                        <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                            {!planoValidado && <button onClick={handleValidar} disabled={loadingValidar} style={{ flex: 1, background: 'rgba(52,152,219,0.15)', color: '#3498db', border: '1px solid rgba(52,152,219,0.3)', borderRadius: 6, padding: '6px 10px', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>{loadingValidar ? '...' : 'Validar'}</button>}
                            {planoValidado && <button onClick={handleCerrar} disabled={loadingCerrar} style={{ flex: 1, background: 'rgba(231,76,60,0.12)', color: '#e74c3c', border: '1px solid rgba(231,76,60,0.25)', borderRadius: 6, padding: '6px 10px', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>{loadingCerrar ? '...' : 'Cerrar plano'}</button>}
                        </div>
                    )}
                    {planoCerrado && <div style={{ marginTop: 10, fontSize: 10, color: '#7f8c8d', background: 'rgba(127,140,141,0.1)', border: '1px solid rgba(127,140,141,0.2)', borderRadius: 6, padding: '5px 10px', textAlign: 'center' }}>Plano cerrado — solo lectura</div>}
                </div>
                <div style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }}>
                    {loadingTags ? <div style={{ padding: '20px 16px', color: '#8899aa', fontSize: 12 }}>Cargando TAGs...</div>
                        : tags.length === 0 ? <div style={{ padding: '20px 16px', color: '#8899aa', fontSize: 12 }}>No hay TAGs en este plano.</div>
                            : tags.map(tag => (
                                <div key={tag.idTag} onClick={() => seleccionarTag(tag)}
                                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 16px', cursor: 'pointer', borderLeft: '3px solid transparent', borderLeftColor: tagSeleccionado?.idTag === tag.idTag ? '#2ecc71' : 'transparent', background: tagSeleccionado?.idTag === tag.idTag ? 'rgba(46,204,113,0.06)' : 'transparent' }}
                                    onMouseEnter={e => { if (tagSeleccionado?.idTag !== tag.idTag) e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; }}
                                    onMouseLeave={e => { if (tagSeleccionado?.idTag !== tag.idTag) e.currentTarget.style.background = 'transparent'; }}
                                >
                                    <div>
                                        <div style={{ fontSize: 12, fontWeight: 600, color: '#f0f4f8', fontFamily: 'monospace' }}>{tag.codigo}</div>
                                        <div style={{ fontSize: 11, color: '#8899aa', marginTop: 2 }}>{tag.descripcion || tag.tipo}</div>
                                    </div>
                                    <EstadoBadge estado={tag.estadoActual} />
                                </div>
                            ))}
                </div>
            </div>

            {/* Panel central: visor PDF */}
            <div style={{ flex: 1, background: '#0f1922', display: 'flex', flexDirection: 'column', overflow: 'hidden', borderRight: '1px solid rgba(255,255,255,0.08)' }}>
                {!pdfUrl ? (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#8899aa', fontSize: 12 }}>
                        Este plano no tiene PDF asociado.
                    </div>
                ) : (
                    <iframe
                        src={pdfUrl}
                        style={{ width: '100%', height: '100%', border: 'none' }}
                        title="Visor PDF"
                    />
                )}
            </div>

            {/* Panel derecho */}
            <div style={{ width: 300, minWidth: 300, overflowY: 'auto', padding: '20px 18px' }}>
                {esSupervisor ? (
                    /* ── Vista Supervisor: resumen del plano ── */
                    <>
                        <div style={{ fontSize: 13, fontWeight: 600, color: '#f0f4f8', marginBottom: 16 }}>Resumen del plano</div>
                        <div style={{ fontSize: 11, color: '#8899aa', marginBottom: 16 }}>{planoActivo.nombre} · {planoActivo.subsistema}</div>

                        {/* Stats */}
                        <div style={{ background: '#1a2332', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, overflow: 'hidden', marginBottom: 16 }}>
                            {[
                                { label: 'TAGs totales', valor: totalTags, color: '#f0f4f8' },
                                { label: 'Aprobados', valor: aprobados, color: '#2ecc71' },
                                { label: 'Observados', valor: observados, color: '#e74c3c' },
                                { label: 'Pendientes', valor: pendientes, color: '#f39c12' },
                            ].map(({ label, valor, color }) => (
                                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                                    <span style={{ fontSize: 12, color: '#8899aa' }}>{label}</span>
                                    <span style={{ fontSize: 13, fontWeight: 600, color }}>{valor}</span>
                                </div>
                            ))}
                        </div>

                        {/* Barra progreso */}
                        <div style={{ height: 4, background: 'rgba(255,255,255,0.08)', borderRadius: 4, overflow: 'hidden', marginBottom: 20 }}>
                            <div style={{ width: `${pctProgreso}%`, height: '100%', background: '#2ecc71', borderRadius: 4 }} />
                        </div>

                        {/* TAGs con observación */}
                        {observados > 0 && (
                            <>
                                <div style={{ fontSize: 10, fontWeight: 600, color: '#8899aa', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>
                                    TAGs con observación
                                </div>
                                {tags.filter(t => t.estadoActual === 'OBSERVADO').map(tag => (
                                    <div key={tag.idTag} style={{ background: '#1a2332', border: '1px solid rgba(231,76,60,0.2)', borderRadius: 8, padding: '10px 12px', marginBottom: 8 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                                            <span style={{ fontSize: 11, fontWeight: 600, color: '#e74c3c', fontFamily: 'monospace' }}>{tag.codigo}</span>
                                            <span style={{ fontSize: 9, background: 'rgba(231,76,60,0.15)', color: '#e74c3c', border: '1px solid rgba(231,76,60,0.3)', padding: '2px 6px', borderRadius: 10, fontWeight: 600 }}>OBS</span>
                                        </div>
                                        {tag.comentario && <div style={{ fontSize: 11, color: '#8899aa' }}>{tag.comentario}</div>}
                                    </div>
                                ))}
                            </>
                        )}
                    </>
                ) : (
                    /* ── Vista Operador: detalle TAG ── */
                    <>
                        {!tagSeleccionado ? (
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#8899aa', fontSize: 12, textAlign: 'center' }}>
                                Selecciona un TAG para ver su detalle.
                            </div>
                        ) : (
                            <>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                                    <div>
                                        <div style={{ fontSize: 15, fontWeight: 600, color: '#f0f4f8', fontFamily: 'monospace' }}>{tagSeleccionado.codigo}</div>
                                        <div style={{ fontSize: 11, color: '#8899aa', marginTop: 3 }}>{tagSeleccionado.descripcion || '—'}</div>
                                    </div>
                                    <EstadoBadge estado={tagSeleccionado.estadoActual} />
                                </div>

                                <div style={{ background: '#1a2332', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, overflow: 'hidden', marginBottom: 16 }}>
                                    {[
                                        { label: 'Tipo', valor: tagSeleccionado.tipo || '—' },
                                        { label: 'Área', valor: tagSeleccionado.area || '—' },
                                        { label: 'Último cambio', valor: tagSeleccionado.ultimaModificacion ? new Date(tagSeleccionado.ultimaModificacion).toLocaleString('es-CL') : '—' },
                                    ].map(({ label, valor }) => (
                                        <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '9px 14px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                                            <span style={{ fontSize: 11, color: '#8899aa' }}>{label}</span>
                                            <span style={{ fontSize: 11, color: '#f0f4f8' }}>{valor}</span>
                                        </div>
                                    ))}
                                    {tagSeleccionado.comentario && (
                                        <div style={{ padding: '9px 14px' }}>
                                            <div style={{ fontSize: 10, color: '#8899aa', marginBottom: 4 }}>Comentario</div>
                                            <div style={{ fontSize: 11, color: '#f0f4f8' }}>{tagSeleccionado.comentario}</div>
                                        </div>
                                    )}
                                </div>

                                {!planoCerrado && (
                                    <div style={{ background: '#1a2332', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: 16 }}>
                                        <div style={{ fontSize: 10, fontWeight: 600, color: '#8899aa', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>Cambiar estado</div>
                                        <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                                            {[
                                                { valor: 'APROBADO', label: '✓ OK', bg: 'rgba(46,204,113,0.15)', color: '#2ecc71', border: 'rgba(46,204,113,0.3)' },
                                                { valor: 'OBSERVADO', label: '! OBS', bg: 'rgba(231,76,60,0.15)', color: '#e74c3c', border: 'rgba(231,76,60,0.3)' },
                                                { valor: 'PENDIENTE', label: '○ Pend', bg: 'rgba(255,255,255,0.06)', color: '#8899aa', border: 'rgba(255,255,255,0.12)' },
                                            ].map(({ valor, label, bg, color, border }) => (
                                                <button key={valor} onClick={() => { setNuevoEstado(valor); setErrorPanel(''); }}
                                                    style={{ flex: 1, padding: '7px 0', borderRadius: 7, fontSize: 11, fontWeight: 600, cursor: 'pointer', background: nuevoEstado === valor ? bg : 'transparent', color: nuevoEstado === valor ? color : '#8899aa', border: `1px solid ${nuevoEstado === valor ? border : 'rgba(255,255,255,0.08)'}` }}>
                                                    {label}
                                                </button>
                                            ))}
                                        </div>
                                        <div style={{ marginBottom: 12 }}>
                                            <label style={{ fontSize: 10, color: '#8899aa', display: 'block', marginBottom: 5 }}>
                                                Comentario {nuevoEstado === 'OBSERVADO' && <span style={{ color: '#e74c3c' }}>*</span>}
                                            </label>
                                            <textarea value={comentario} onChange={e => { setComentario(e.target.value); setErrorPanel(''); }}
                                                placeholder={nuevoEstado === 'OBSERVADO' ? 'Describe la observación...' : 'Opcional'} rows={3}
                                                style={{ width: '100%', background: '#0f1922', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 7, padding: '8px 11px', color: '#f0f4f8', fontSize: 11, outline: 'none', resize: 'vertical', fontFamily: 'inherit' }} />
                                        </div>
                                        {errorPanel && <div style={{ fontSize: 11, color: '#e74c3c', marginBottom: 10 }}>{errorPanel}</div>}
                                        {exito && <div style={{ fontSize: 11, color: '#2ecc71', marginBottom: 10 }}>{exito}</div>}
                                        <button onClick={handleGuardarCambio} disabled={loadingAccion}
                                            style={{ width: '100%', background: '#2ecc71', color: '#1a2332', border: 'none', borderRadius: 7, padding: '9px 0', fontSize: 12, fontWeight: 600, cursor: loadingAccion ? 'not-allowed' : 'pointer', opacity: loadingAccion ? 0.7 : 1 }}>
                                            {loadingAccion ? 'Guardando...' : 'Guardar cambio'}
                                        </button>
                                    </div>
                                )}
                                {planoCerrado && <div style={{ fontSize: 11, color: '#7f8c8d', background: 'rgba(127,140,141,0.08)', border: '1px solid rgba(127,140,141,0.2)', borderRadius: 7, padding: '10px 14px', textAlign: 'center' }}>Plano cerrado — solo lectura.</div>}
                            </>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}