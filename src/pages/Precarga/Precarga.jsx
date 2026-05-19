import { useState } from 'react';
import { createPlano, uploadPlanoPdf, uploadTagsExcel } from '../../services/planos';

const FORMULARIO_FIJO = 'PRE-ELE-YL';

const CAMPOS = [
    { name: 'nombre',      label: 'Nombre del plano',   placeholder: 'Ej: Plano 001 — Bloque X' },
    { name: 'codigoPlano', label: 'Código de plano',     placeholder: 'Ej: 2110-DP-0102' },
    { name: 'rev',         label: 'Revisión',            placeholder: 'Ej: A' },
    { name: 'alcance',     label: 'Empresa a cargo del precomisionamiento', placeholder: 'Ej: Empresa Contratista S.A.' },
    { name: 'subsistema',  label: 'Subsistema',          placeholder: 'Ej: Sistema rectificador' },
    { name: 'responsable', label: 'Responsable',         placeholder: 'Nombre del responsable' },
];

const ESTADO_INICIAL = { nombre: '', codigoPlano: '', rev: '', alcance: '', subsistema: '', responsable: '' };

export default function Precarga() {
    const [datos, setDatos] = useState(ESTADO_INICIAL);
    const [archivoPdf, setArchivoPdf] = useState(null);
    const [archivoExcel, setArchivoExcel] = useState(null);
    const [loading, setLoading] = useState(false);
    const [progreso, setProgreso] = useState('');
    const [error, setError] = useState('');
    const [resultado, setResultado] = useState(null);

    const handleChange = (e) => {
        setDatos({ ...datos, [e.target.name]: e.target.value });
        setError('');
    };

    const handleSubmit = async () => {
        const campoVacio = CAMPOS.find(c => !datos[c.name].trim());
        if (campoVacio) {
            setError(`El campo "${campoVacio.label}" es obligatorio.`); return;
        }
        if (!archivoPdf) {
            setError('Debes adjuntar el PDF del plano.'); return;
        }
        if (archivoPdf.type !== 'application/pdf') {
            setError('El archivo debe ser un PDF válido.'); return;
        }
        if (!archivoExcel) {
            setError('Debes adjuntar el Excel con los TAGs.'); return;
        }
        const ext = archivoExcel.name.split('.').pop().toLowerCase();
        if (!['xlsx', 'xls'].includes(ext)) {
            setError('El Excel debe ser .xlsx o .xls.'); return;
        }

        setLoading(true);
        setError('');

        try {
            setProgreso('Creando plano...');
            const payload = { ...datos, formulario: FORMULARIO_FIJO };
            const res1 = await createPlano(payload);
            const idPlano = res1.data.idPlano;

            setProgreso('Subiendo PDF...');
            await uploadPlanoPdf(idPlano, archivoPdf);

            setProgreso('Procesando TAGs...');
            const res3 = await uploadTagsExcel(idPlano, archivoExcel);

            setResultado({ idPlano, tags: res3.data });
        } catch (e) {
            const msg = e?.response?.data?.message || 'Error al procesar la solicitud.';
            setError(msg);
        } finally {
            setLoading(false);
            setProgreso('');
        }
    };

    const handleNuevo = () => {
        setDatos(ESTADO_INICIAL);
        setArchivoPdf(null);
        setArchivoExcel(null);
        setResultado(null);
        setError('');
    };

    // ── Pantalla de éxito ────────────────────────────────
    if (resultado) {
        const pendientes = resultado.tags.filter(t => t.estadoActual === 'PENDIENTE').length;
        const observados = resultado.tags.filter(t => t.estadoActual === 'OBSERVADO').length;

        return (
            <div style={{ padding: '28px 32px', maxWidth: 900 }}>
                <div style={{ background: 'rgba(46,204,113,0.1)', border: '1px solid rgba(46,204,113,0.25)', borderRadius: 8, padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20, color: '#2ecc71', fontSize: 12 }}>
                    ✓ Plano y matriz cargados con éxito — ID {resultado.idPlano}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 20 }}>
                    {[
                        { label: 'TAGs importados', valor: resultado.tags.length, color: '#f0f4f8' },
                        { label: 'Pendientes',       valor: pendientes,           color: '#f39c12' },
                        { label: 'Observados',       valor: observados,           color: '#e74c3c' },
                    ].map(({ label, valor, color }) => (
                        <div key={label} style={{ background: '#1a2332', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '14px 16px' }}>
                            <div style={{ fontSize: 10, color: '#8899aa', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 5 }}>{label}</div>
                            <div style={{ fontSize: 24, fontWeight: 600, fontFamily: 'monospace', color }}>{valor}</div>
                        </div>
                    ))}
                </div>

                <div style={{ background: '#1a2332', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, overflow: 'hidden', marginBottom: 20 }}>
                    <div style={{ padding: '10px 16px', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: 13, fontWeight: 500, color: '#f0f4f8' }}>Vista previa de TAGs</span>
                        <span style={{ fontSize: 11, color: '#8899aa', fontFamily: 'monospace' }}>{resultado.tags.length} registros</span>
                    </div>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr>
                                {['Código', 'Tipo', 'Subsistema', 'Estado'].map(h => (
                                    <th key={h} style={{ padding: '9px 16px', fontSize: 10, fontWeight: 600, color: '#8899aa', textAlign: 'left', letterSpacing: '0.06em', textTransform: 'uppercase', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {resultado.tags.slice(0, 10).map((tag) => (
                                <tr key={tag.idTag} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                                    <td style={{ padding: '10px 16px', fontFamily: 'monospace', fontSize: 11, color: '#8899aa' }}>{tag.codigo}</td>
                                    <td style={{ padding: '10px 16px', fontSize: 12, color: '#d0d8e4' }}>{tag.tipo}</td>
                                    <td style={{ padding: '10px 16px', fontSize: 12, color: '#d0d8e4' }}>{tag.area || '—'}</td>
                                    <td style={{ padding: '10px 16px' }}><EstadoBadge estado={tag.estadoActual} /></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {resultado.tags.length > 10 && (
                        <div style={{ padding: '10px 16px', fontSize: 11, color: '#8899aa', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                            Mostrando 10 de {resultado.tags.length} TAGs.
                        </div>
                    )}
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <button onClick={handleNuevo} style={{ background: '#2ecc71', color: '#1a2332', border: 'none', borderRadius: 7, padding: '7px 16px', fontSize: 12, fontWeight: 500, cursor: 'pointer' }}>
                        + Nueva precarga
                    </button>
                </div>
            </div>
        );
    }

    // ── Formulario principal ─────────────────────────────
    return (
        <div style={{ padding: '28px 32px', maxWidth: 900 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <div>
                    <div style={{ fontSize: 16, fontWeight: 600, color: '#f0f4f8' }}>Precarga de Planos</div>
                    <div style={{ fontSize: 11, color: '#8899aa', marginTop: 2 }}>Todos los campos son obligatorios. Formulario: <span style={{ color: '#2ecc71', fontFamily: 'monospace' }}>{FORMULARIO_FIJO}</span></div>
                </div>
                <button
                    onClick={handleSubmit}
                    disabled={loading}
                    style={{ background: loading ? 'rgba(46,204,113,0.4)' : '#2ecc71', color: '#1a2332', border: 'none', borderRadius: 7, padding: '8px 20px', fontSize: 12, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}
                >
                    {loading ? (
                        <><span style={{ fontSize: 10 }}>⏳</span> {progreso}</>
                    ) : (
                        <><span>↑</span> Subir y Procesar</>
                    )}
                </button>
            </div>

            {error && (
                <div style={{ background: 'rgba(231,76,60,0.1)', border: '1px solid rgba(231,76,60,0.25)', borderRadius: 8, padding: '10px 14px', marginBottom: 16, color: '#e74c3c', fontSize: 12 }}>
                    {error}
                </div>
            )}

            {/* Datos del plano */}
            <div style={{ background: '#1a2332', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: 24, marginBottom: 16 }}>
                <div style={{ fontSize: 10, fontWeight: 600, color: '#8899aa', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 16, paddingBottom: 8, borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                    Información del plano
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                    {CAMPOS.map(({ name, label, placeholder }) => (
                        <div key={name} style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                            <label style={{ fontSize: 11, fontWeight: 500, color: '#8899aa', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                                {label} <span style={{ color: '#e74c3c' }}>*</span>
                            </label>
                            <input
                                name={name}
                                value={datos[name]}
                                onChange={handleChange}
                                placeholder={placeholder}
                                style={{ background: '#0f1922', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: '9px 13px', color: '#f0f4f8', fontSize: 13, outline: 'none', width: '100%' }}
                            />
                        </div>
                    ))}
                </div>
            </div>

            {/* Archivos */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                {/* PDF */}
                <div style={{ background: '#1a2332', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: 20 }}>
                    <div style={{ fontSize: 10, fontWeight: 600, color: '#8899aa', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 14, paddingBottom: 8, borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                        PDF del plano <span style={{ color: '#e74c3c' }}>*</span>
                    </div>
                    <div
                        onClick={() => document.getElementById('input-pdf').click()}
                        style={{ border: `1.5px dashed ${archivoPdf ? 'rgba(46,204,113,0.5)' : 'rgba(255,255,255,0.12)'}`, borderRadius: 10, padding: 20, textAlign: 'center', cursor: 'pointer', background: archivoPdf ? 'rgba(46,204,113,0.04)' : 'transparent' }}
                    >
                        <div style={{ fontSize: 24, marginBottom: 6 }}>📄</div>
                        <div style={{ fontSize: 12, color: archivoPdf ? '#2ecc71' : '#f0f4f8', marginBottom: 3 }}>
                            {archivoPdf ? archivoPdf.name : 'Haz clic para seleccionar'}
                        </div>
                        <div style={{ fontSize: 10, color: '#8899aa' }}>Solo archivos .pdf</div>
                        <input id="input-pdf" type="file" accept=".pdf" style={{ display: 'none' }}
                            onChange={e => { setArchivoPdf(e.target.files[0]); setError(''); }} />
                    </div>
                </div>

                {/* Excel */}
                <div style={{ background: '#1a2332', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: 20 }}>
                    <div style={{ fontSize: 10, fontWeight: 600, color: '#8899aa', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 14, paddingBottom: 8, borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                        Excel de TAGs <span style={{ color: '#e74c3c' }}>*</span>
                    </div>
                    <div
                        onClick={() => document.getElementById('input-excel').click()}
                        style={{ border: `1.5px dashed ${archivoExcel ? 'rgba(46,204,113,0.5)' : 'rgba(255,255,255,0.12)'}`, borderRadius: 10, padding: 20, textAlign: 'center', cursor: 'pointer', background: archivoExcel ? 'rgba(46,204,113,0.04)' : 'transparent' }}
                    >
                        <div style={{ fontSize: 24, marginBottom: 6 }}>📊</div>
                        <div style={{ fontSize: 12, color: archivoExcel ? '#2ecc71' : '#f0f4f8', marginBottom: 3 }}>
                            {archivoExcel ? archivoExcel.name : 'Haz clic para seleccionar'}
                        </div>
                        <div style={{ fontSize: 10, color: '#8899aa' }}>Archivos .xlsx o .xls</div>
                        <input id="input-excel" type="file" accept=".xlsx,.xls" style={{ display: 'none' }}
                            onChange={e => { setArchivoExcel(e.target.files[0]); setError(''); }} />
                    </div>
                </div>
            </div>
        </div>
    );
}

function EstadoBadge({ estado }) {
    const estilos = {
        PENDIENTE: { background: 'rgba(243,156,18,0.15)', color: '#f39c12', border: '1px solid rgba(243,156,18,0.3)' },
        APROBADO:  { background: 'rgba(46,204,113,0.12)', color: '#2ecc71', border: '1px solid rgba(46,204,113,0.25)' },
        OBSERVADO: { background: 'rgba(231,76,60,0.12)',  color: '#e74c3c', border: '1px solid rgba(231,76,60,0.25)' },
    };
    return (
        <span style={{ display: 'inline-flex', alignItems: 'center', padding: '3px 9px', borderRadius: 20, fontSize: 10, fontWeight: 600, fontFamily: 'monospace', ...(estilos[estado] || {}) }}>
            {estado}
        </span>
    );
}
