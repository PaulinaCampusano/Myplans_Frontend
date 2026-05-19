import { useState, useRef, useEffect } from 'react';
import { analizarPlano, aplicarCambios, getPlanos } from '../../services/worker';

/* ── helpers de UI ── */
const ESTADO_META = {
    APROBADO:  { label: 'Aprobado',  cls: 'bg-green/12 text-green border-green/20' },
    OBSERVADO: { label: 'Observado', cls: 'bg-observed/12 text-observed border-observed/20' },
    PENDIENTE: { label: 'Pendiente', cls: 'bg-white/6 text-muted border-white/10' },
};

const EstadoBadge = ({ estado }) => {
    const m = ESTADO_META[estado] || ESTADO_META.PENDIENTE;
    return (
        <span className={`text-[10px] font-semibold font-mono px-2 py-0.5 rounded-full border ${m.cls}`}>
            {m.label}
        </span>
    );
};

const ConfidenceBar = ({ value }) => {
    const pct = Math.round(value * 100);
    const color = pct >= 80 ? 'bg-green' : pct >= 50 ? 'bg-yellow-400' : 'bg-observed';
    return (
        <div className="flex items-center gap-1.5">
            <div className="w-16 h-1.5 bg-white/8 rounded-full overflow-hidden">
                <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
            </div>
            <span className="text-[10px] text-muted font-mono">{pct}%</span>
        </div>
    );
};

/* ── paso 1: Seleccionar plano ── */
const StepSeleccionar = ({ planos, loadingPlanos, onSelect }) => (
    <div>
        <div className="text-[11px] font-semibold text-muted uppercase tracking-wide mb-3">
            Selecciona el plano a analizar
        </div>
        {loadingPlanos ? (
            <div className="text-xs text-muted py-4 text-center">Cargando planos...</div>
        ) : planos.length === 0 ? (
            <div className="text-xs text-muted py-4 text-center">No hay planos disponibles.</div>
        ) : (
            <div className="space-y-1.5 max-h-[300px] overflow-y-auto pr-1">
                {planos.map((p) => (
                    <button
                        key={p.idPlano}
                        onClick={() => onSelect(p)}
                        className="w-full text-left bg-navy-mid border border-white/8 rounded-lg px-3.5 py-2.5 hover:border-green/40 hover:bg-green/5 transition-all cursor-pointer group"
                    >
                        <div className="flex justify-between items-center">
                            <span className="text-[13px] font-medium text-white group-hover:text-green transition-colors">
                                {p.nombre}
                            </span>
                            <EstadoBadge estado={p.status} />
                        </div>
                        {p.codigoPlano && (
                            <div className="text-[10px] text-muted font-mono mt-0.5">{p.codigoPlano}</div>
                        )}
                    </button>
                ))}
            </div>
        )}
    </div>
);

/* ── paso 2: Subir PDF ── */
const StepSubir = ({ plano, onAnalizar, loading }) => {
    const [file, setFile] = useState(null);
    const inputRef = useRef(null);
    const [drag, setDrag] = useState(false);

    const handleDrop = (e) => {
        e.preventDefault();
        setDrag(false);
        const f = e.dataTransfer.files[0];
        if (f && f.type === 'application/pdf') setFile(f);
    };

    return (
        <div>
            <div className="text-[11px] font-semibold text-muted uppercase tracking-wide mb-1">
                Plano seleccionado
            </div>
            <div className="bg-navy-mid border border-white/8 rounded-lg px-3 py-2 mb-4 flex justify-between items-center">
                <span className="text-sm font-medium text-white">{plano.nombre}</span>
                <EstadoBadge estado={plano.status} />
            </div>

            <div className="text-[11px] font-semibold text-muted uppercase tracking-wide mb-3">
                Sube el PDF amarillado
            </div>

            <div
                onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
                onDragLeave={() => setDrag(false)}
                onDrop={handleDrop}
                onClick={() => inputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                    drag ? 'border-green bg-green/5' : 'border-white/12 hover:border-white/25 hover:bg-white/3'
                }`}
            >
                <input
                    ref={inputRef}
                    type="file"
                    accept=".pdf,application/pdf"
                    className="hidden"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                />
                {file ? (
                    <div>
                        <div className="text-green text-2xl mb-1">📄</div>
                        <div className="text-sm font-medium text-white">{file.name}</div>
                        <div className="text-[11px] text-muted mt-0.5">
                            {(file.size / 1024 / 1024).toFixed(2)} MB · Click para cambiar
                        </div>
                    </div>
                ) : (
                    <div>
                        <div className="text-muted text-3xl mb-2">⬆</div>
                        <div className="text-sm text-white/70">Arrastra el PDF aquí o haz click para seleccionar</div>
                        <div className="text-[11px] text-muted mt-1">Solo archivos .pdf · Máx. 50 MB</div>
                    </div>
                )}
            </div>

            <button
                onClick={() => file && onAnalizar(file)}
                disabled={!file || loading}
                className="w-full mt-4 bg-green text-navy font-semibold text-sm py-2.5 rounded-lg hover:bg-green-dim transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {loading ? (
                    <span className="flex items-center justify-center gap-2">
                        <span className="inline-block w-3.5 h-3.5 border-2 border-navy/40 border-t-navy rounded-full animate-spin" />
                        Analizando con IA...
                    </span>
                ) : '✦ Analizar plano con IA'}
            </button>
            <div className="text-[10px] text-muted text-center mt-2">
                El análisis tarda ~15–40 segundos dependiendo del número de páginas.
            </div>
        </div>
    );
};

/* ── paso 3: Revisar resultados ── */
const StepRevisar = ({ resultado, onAplicar, onReset, applying }) => {
    const [seleccionados, setSeleccionados] = useState(
        () => new Set(resultado.sugerencias.map((s) => s.idTag))
    );

    const toggle = (idTag) => setSeleccionados((prev) => {
        const next = new Set(prev);
        next.has(idTag) ? next.delete(idTag) : next.add(idTag);
        return next;
    });

    const toggleAll = () => {
        setSeleccionados((prev) =>
            prev.size === resultado.sugerencias.length
                ? new Set()
                : new Set(resultado.sugerencias.map((s) => s.idTag))
        );
    };

    const sugsSeleccionadas = resultado.sugerencias.filter((s) => seleccionados.has(s.idTag));

    return (
        <div>
            {/* Resumen */}
            <div className="grid grid-cols-3 gap-2 mb-4">
                {[
                    { label: 'TAGs totales', value: resultado.totalTags },
                    { label: 'Con sugerencia', value: resultado.tagsAnalizados },
                    { label: 'Páginas analizadas', value: resultado.paginasAnalizadas },
                ].map(({ label, value }) => (
                    <div key={label} className="bg-navy-mid border border-white/8 rounded-lg p-3 text-center">
                        <div className="text-xl font-bold text-white">{value}</div>
                        <div className="text-[10px] text-muted mt-0.5">{label}</div>
                    </div>
                ))}
            </div>

            {/* Advertencias */}
            {resultado.advertencias.length > 0 && (
                <div className="bg-observed/8 border border-observed/20 rounded-lg px-3 py-2 mb-3">
                    {resultado.advertencias.map((a, i) => (
                        <div key={i} className="text-[11px] text-observed flex gap-1.5">
                            <span>⚠</span><span>{a}</span>
                        </div>
                    ))}
                </div>
            )}

            {resultado.sugerencias.length === 0 ? (
                <div className="text-center py-8">
                    <div className="text-3xl mb-2">🔍</div>
                    <div className="text-sm font-medium text-white mb-1">Sin cambios detectados</div>
                    <div className="text-[11px] text-muted">
                        La IA no detectó TAGs con marcas de aprobación u observación en el plano.
                    </div>
                </div>
            ) : (
                <>
                    {/* Tabla de sugerencias */}
                    <div className="flex justify-between items-center mb-2">
                        <div className="text-[11px] font-semibold text-muted uppercase tracking-wide">
                            Sugerencias de cambio ({resultado.sugerencias.length})
                        </div>
                        <button
                            onClick={toggleAll}
                            className="text-[11px] text-green hover:text-green-dim cursor-pointer transition-colors"
                        >
                            {seleccionados.size === resultado.sugerencias.length ? 'Deseleccionar todo' : 'Seleccionar todo'}
                        </button>
                    </div>

                    <div className="border border-white/8 rounded-xl overflow-hidden mb-4">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr>
                                    {['', 'TAG', 'Estado actual', '→', 'Sugerido', 'Confianza', 'Comentario IA'].map((h, i) => (
                                        <th key={i} className="px-3 py-2 text-[10px] font-semibold text-muted text-left uppercase tracking-wide border-b border-white/8">
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {resultado.sugerencias.map((s) => (
                                    <tr
                                        key={s.idTag}
                                        onClick={() => toggle(s.idTag)}
                                        className={`border-b border-white/4 cursor-pointer transition-colors ${
                                            seleccionados.has(s.idTag) ? 'bg-green/5' : 'hover:bg-white/2'
                                        }`}
                                    >
                                        <td className="px-3 py-2.5">
                                            <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${
                                                seleccionados.has(s.idTag)
                                                    ? 'bg-green border-green'
                                                    : 'border-white/20 bg-transparent'
                                            }`}>
                                                {seleccionados.has(s.idTag) && (
                                                    <svg viewBox="0 0 10 8" width="8" fill="none" stroke="#1a2332" strokeWidth="1.8">
                                                        <polyline points="1,4 4,7 9,1" />
                                                    </svg>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-3 py-2.5 font-mono text-[12px] font-medium text-white">{s.codigo}</td>
                                        <td className="px-3 py-2.5"><EstadoBadge estado={s.estadoActual} /></td>
                                        <td className="px-3 py-2.5 text-muted text-sm">→</td>
                                        <td className="px-3 py-2.5"><EstadoBadge estado={s.estadoSugerido} /></td>
                                        <td className="px-3 py-2.5"><ConfidenceBar value={s.confidence} /></td>
                                        <td className="px-3 py-2.5 text-[11px] text-muted max-w-[180px] truncate">
                                            {s.comentario || '—'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="flex gap-2.5 justify-end pt-2 border-t border-white/8">
                        <button
                            onClick={onReset}
                            className="bg-transparent text-muted border border-white/8 rounded-lg px-4 py-2 text-xs hover:bg-white/5 cursor-pointer transition-colors"
                        >
                            ← Volver
                        </button>
                        <button
                            onClick={() => onAplicar(sugsSeleccionadas)}
                            disabled={seleccionados.size === 0 || applying}
                            className="bg-green text-navy font-semibold text-xs px-5 py-2 rounded-lg hover:bg-green-dim transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {applying
                                ? 'Aplicando...'
                                : `Aplicar ${seleccionados.size} cambio${seleccionados.size !== 1 ? 's' : ''}`}
                        </button>
                    </div>
                </>
            )}
        </div>
    );
};

/* ── paso 4: Resultado final ── */
const StepFinalizado = ({ resultado, onReset }) => (
    <div className="text-center py-6">
        <div className={`w-14 h-14 rounded-full mx-auto mb-4 flex items-center justify-center text-2xl ${
            resultado.errores === 0 ? 'bg-green/12' : 'bg-observed/12'
        }`}>
            {resultado.errores === 0 ? '✓' : '⚠'}
        </div>
        <div className="text-[15px] font-medium text-white mb-1">
            {resultado.errores === 0 ? 'Cambios aplicados correctamente' : 'Aplicado con advertencias'}
        </div>
        <div className="text-xs text-muted mb-6">
            {resultado.aplicados} cambio{resultado.aplicados !== 1 ? 's' : ''} aplicados
            {resultado.errores > 0 && ` · ${resultado.errores} con error`}
        </div>
        {resultado.errores > 0 && (
            <div className="bg-observed/8 border border-observed/20 rounded-lg px-3 py-2 mb-4 text-left">
                {resultado.detalle.filter((d) => !d.ok).map((d) => (
                    <div key={d.idTag} className="text-[11px] text-observed">
                        TAG {d.codigo}: {d.error}
                    </div>
                ))}
            </div>
        )}
        <button
            onClick={onReset}
            className="bg-green text-navy font-semibold text-sm px-6 py-2.5 rounded-lg hover:bg-green-dim transition-colors cursor-pointer"
        >
            Analizar otro plano
        </button>
    </div>
);

/* ════ COMPONENTE PRINCIPAL ════ */
const AnalisisIA = () => {
    const [step, setStep] = useState('seleccionar'); // seleccionar | subir | revisar | finalizado
    const [planos, setPlanos] = useState([]);
    const [loadingPlanos, setLoadingPlanos] = useState(true);
    const [planoSeleccionado, setPlanoSeleccionado] = useState(null);
    const [analyzing, setAnalyzing] = useState(false);
    const [applying, setApplying] = useState(false);
    const [resultado, setResultado] = useState(null);
    const [resultadoFinal, setResultadoFinal] = useState(null);
    const [error, setError] = useState('');

    useEffect(() => {
        getPlanos()
            .then(setPlanos)
            .catch(() => setError('No se pudieron cargar los planos.'))
            .finally(() => setLoadingPlanos(false));
    }, []);

    const handleSelectPlano = (p) => {
        setPlanoSeleccionado(p);
        setStep('subir');
        setError('');
    };

    const handleAnalizar = async (file) => {
        setAnalyzing(true);
        setError('');
        try {
            const res = await analizarPlano(planoSeleccionado.idPlano, file);
            setResultado(res);
            setStep('revisar');
        } catch (err) {
            setError(err.message || 'Error durante el análisis. Verifica que el worker esté corriendo.');
        } finally {
            setAnalyzing(false);
        }
    };

    const handleAplicar = async (sugerencias) => {
        setApplying(true);
        setError('');
        try {
            const res = await aplicarCambios(planoSeleccionado.idPlano, sugerencias);
            setResultadoFinal(res);
            setStep('finalizado');
        } catch (err) {
            setError(err.message || 'Error aplicando los cambios.');
        } finally {
            setApplying(false);
        }
    };

    const handleReset = () => {
        setStep('seleccionar');
        setPlanoSeleccionado(null);
        setResultado(null);
        setResultadoFinal(null);
        setError('');
    };

    const STEPS = [
        { key: 'seleccionar', label: 'Seleccionar' },
        { key: 'subir',       label: 'Subir PDF' },
        { key: 'revisar',     label: 'Revisar' },
        { key: 'finalizado',  label: 'Listo' },
    ];
    const stepIdx = STEPS.findIndex((s) => s.key === step);

    return (
        <div className="p-5 text-white select-none max-w-[760px]">
            {/* Header */}
            <div className="mb-5">
                <div className="flex items-center gap-2 mb-1">
                    <div className="w-7 h-7 bg-green/15 border border-green/25 rounded-lg flex items-center justify-center text-sm">✦</div>
                    <h1 className="text-[15px] font-medium text-white">Análisis IA de Planos Amarillados</h1>
                </div>
                <p className="text-[11px] text-muted ml-9">
                    Sube el PDF anotado en terreno y la IA detecta automáticamente el estado de cada TAG.
                    Revisa las sugerencias antes de aplicarlas.
                </p>
            </div>

            {/* Stepper */}
            <div className="flex items-center gap-0 mb-5">
                {STEPS.map((s, i) => (
                    <div key={s.key} className="flex items-center">
                        <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-medium transition-all ${
                            i === stepIdx
                                ? 'bg-green/15 text-green border border-green/25'
                                : i < stepIdx
                                    ? 'text-green/60'
                                    : 'text-white/20'
                        }`}>
                            <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${
                                i < stepIdx ? 'bg-green/20 text-green' : i === stepIdx ? 'bg-green text-navy' : 'bg-white/8 text-muted'
                            }`}>
                                {i < stepIdx ? '✓' : i + 1}
                            </span>
                            {s.label}
                        </div>
                        {i < STEPS.length - 1 && (
                            <div className={`w-6 h-px mx-1 ${i < stepIdx ? 'bg-green/30' : 'bg-white/8'}`} />
                        )}
                    </div>
                ))}
            </div>

            {/* Card */}
            <div className="bg-navy border border-white/8 rounded-2xl p-5">
                {error && (
                    <div className="bg-observed/10 border border-observed/25 rounded-lg px-3 py-2.5 text-observed text-xs mb-4">
                        {error}
                    </div>
                )}

                {step === 'seleccionar' && (
                    <StepSeleccionar
                        planos={planos}
                        loadingPlanos={loadingPlanos}
                        onSelect={handleSelectPlano}
                    />
                )}
                {step === 'subir' && (
                    <StepSubir
                        plano={planoSeleccionado}
                        onAnalizar={handleAnalizar}
                        loading={analyzing}
                    />
                )}
                {step === 'revisar' && resultado && (
                    <StepRevisar
                        resultado={resultado}
                        onAplicar={handleAplicar}
                        onReset={handleReset}
                        applying={applying}
                    />
                )}
                {step === 'finalizado' && resultadoFinal && (
                    <StepFinalizado resultado={resultadoFinal} onReset={handleReset} />
                )}
            </div>
        </div>
    );
};

export default AnalisisIA;
