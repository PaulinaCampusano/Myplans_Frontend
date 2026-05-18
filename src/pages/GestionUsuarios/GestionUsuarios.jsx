import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
    getUsuarios, crearUsuario, toggleEstado, asignarRol, updateUser,
} from '../../services/usuarios';
import {
    validarFormUsuario, formatearRut, formatearTelefono,
} from '../../utils/validaciones';

/* ─── helpers ─── */
const getRolInfo = (user) => {
    const rol = user.role?.nombre || '';
    if (rol === 'ROLE_ADMIN') return { label: 'Administrador', class: 'bg-white/8 text-white/80' };
    if (rol === 'ROLE_AUDITOR') return { label: 'Supervisor', class: 'bg-validated/15 text-validated' };
    return { label: 'Operador', class: 'bg-pending/15 text-pending' };
};

const ROLES = [
    { key: 'ROLE_USER', label: 'Operador', desc: 'Actualiza TAGs. Sin validar planos.', badgeClass: 'bg-pending/15 text-pending' },
    { key: 'ROLE_AUDITOR', label: 'Supervisor', desc: 'Valida y cierra planos.', badgeClass: 'bg-validated/15 text-validated' },
    { key: 'ROLE_ADMIN', label: 'Administrador', desc: 'Acceso completo al sistema.', badgeClass: 'bg-white/8 text-white/80' },
];

const INPUT = 'w-full bg-bg border border-white/8 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-green/45 transition-colors select-text cursor-text';
const INPUTE = 'w-full bg-bg border border-observed/50 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-observed/80 transition-colors select-text cursor-text';
const LABEL = 'block text-[11px] font-medium text-muted uppercase tracking-wide mb-1.5';

const ErrMsg = ({ campo, errores }) => errores[campo]
    ? <span className="text-[10px] text-observed mt-0.5 block">{errores[campo]}</span>
    : null;

/* ─── ActionMenu ─── */
const ActionMenu = ({ usuario, onEditDatos, onEditRol, onToggle }) => {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);
    useEffect(() => {
        const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
        document.addEventListener('mousedown', h);
        return () => document.removeEventListener('mousedown', h);
    }, []);
    return (
        <div ref={ref} className="relative inline-block">
            <button onClick={() => setOpen(v => !v)} className="bg-transparent text-muted border border-white/8 rounded-md px-2.5 py-1 text-[11px] hover:bg-white/5 hover:text-white cursor-pointer transition-colors">
                Editar ▾
            </button>
            {open && (
                <div className="absolute right-0 top-full mt-1 bg-navy-mid border border-white/8 rounded-lg min-w-[150px] z-50 overflow-hidden shadow-xl">
                    <button className="w-full text-left px-3.5 py-2.5 text-[12px] text-white/80 hover:bg-white/6 hover:text-white transition-colors cursor-pointer" onClick={() => { setOpen(false); onEditDatos(usuario); }}>✎ Editar datos</button>
                    <button className="w-full text-left px-3.5 py-2.5 text-[12px] text-white/80 hover:bg-white/6 hover:text-white transition-colors cursor-pointer" onClick={() => { setOpen(false); onEditRol(usuario); }}>🔑 Cambiar rol</button>
                    <div className="border-t border-white/8" />
                    <button className={`w-full text-left px-3.5 py-2.5 text-[12px] transition-colors cursor-pointer ${usuario.isActive ? 'text-observed hover:bg-observed/10' : 'text-green hover:bg-green/10'}`} onClick={() => { setOpen(false); onToggle(usuario); }}>
                        {usuario.isActive ? '⊗ Desactivar' : '✓ Activar'}
                    </button>
                </div>
            )}
        </div>
    );
};

/* ─── Primitivas modales ─── */
const Overlay = ({ children, onClose }) => (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center" onClick={(e) => e.target === e.currentTarget && onClose()}>
        <div className="bg-navy border border-white/8 rounded-2xl p-7 w-[540px] max-h-[85vh] overflow-y-auto">{children}</div>
    </div>
);
const ModalHeader = ({ title, onClose }) => (
    <div className="flex justify-between items-center mb-5">
        <span className="text-[15px] font-medium text-white">{title}</span>
        <button onClick={onClose} className="text-muted text-xl leading-none cursor-pointer hover:text-white">×</button>
    </div>
);
const SectionTitle = ({ children }) => (
    <div className="text-[10px] font-semibold text-muted uppercase tracking-widest mb-3 pb-2 border-b border-white/6">{children}</div>
);
const ModalFooter = ({ onCancel, label, loading }) => (
    <div className="flex justify-end gap-2.5 pt-3.5 border-t border-white/8">
        <button type="button" onClick={onCancel} className="bg-transparent text-muted border border-white/8 rounded-lg px-3.5 py-2 text-xs hover:bg-white/5 cursor-pointer transition-colors">Cancelar</button>
        <button type="submit" disabled={loading} className="bg-green text-navy font-semibold text-xs px-4 py-2 rounded-lg hover:bg-green-dim cursor-pointer transition-colors disabled:opacity-60">
            {loading ? 'Guardando...' : label}
        </button>
    </div>
);
const RoleCard = ({ rol, selected, onClick }) => (
    <div onClick={onClick} className={`border rounded-lg p-3 cursor-pointer transition-all select-none ${selected ? 'border-green bg-green/10' : 'border-white/8 hover:border-white/20'}`}>
        <span className={`text-[9px] font-semibold font-mono px-2 py-0.5 rounded-full mb-2 inline-block ${rol.badgeClass}`}>{rol.label}</span>
        <div className="text-[13px] font-medium text-white mb-1">{rol.label}{selected && ' ✓'}</div>
        <div className="text-[11px] text-muted leading-snug">{rol.desc}</div>
    </div>
);

/* ════════════════════════════════════════════════════════════ */
const GestionUsuarios = () => {
    const navigate = useNavigate();
    const { actualizarRol } = useAuth();
    const [usuarios, setUsuarios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [busqueda, setBusqueda] = useState('');
    const [modalConfirmAdmin, setModalConfirmAdmin] = useState(false);

    const [modalCrear, setModalCrear] = useState(false);
    const [modalEditDatos, setModalEditDatos] = useState(false);
    const [modalEditRol, setModalEditRol] = useState(false);
    const [modalConfirmToggle, setModalConfirmToggle] = useState(false);
    const [usuarioTarget, setUsuarioTarget] = useState(null);

    const [formCrear, setFormCrear] = useState({
        nombres: '', apellidos: '', rut: '', telefono: '+569',
        email: '', password: '', confirmPassword: '', roles: ['ROLE_USER'],
    });
    const [formDatos, setFormDatos] = useState({
        nombres: '', apellidos: '', rut: '', telefono: '', email: '', password: '',
    });
    const [erroresCrear, setErroresCrear] = useState({});
    const [erroresEditar, setErroresEditar] = useState({});
    const [rolSeleccionado, setRolSeleccionado] = useState('ROLE_USER');
    const [errorModal, setErrorModal] = useState('');

    const flash = (type, msg) => {
        if (type === 'ok') { setSuccess(msg); setTimeout(() => setSuccess(''), 3500); }
        else { setError(msg); setTimeout(() => setError(''), 3500); }
    };

    const cargarUsuarios = async () => {
        try { setLoading(true); setUsuarios(await getUsuarios()); }
        catch { flash('err', 'Error al cargar usuarios'); }
        finally { setLoading(false); }
    };

    useEffect(() => { cargarUsuarios(); }, []);

    const abrirEditDatos = (u) => {
        const partes = (u.nombreCompleto || '').split(' ');
        setFormDatos({
            nombres: partes[0] || '',
            apellidos: partes.slice(1).join(' ') || '',
            rut: u.rut || '',
            telefono: u.telefono || '+569',
            email: u.email || '',
            password: '',
        });
        setErroresEditar({});
        setUsuarioTarget(u);
        setModalEditDatos(true);
    };

    const abrirEditRol = (u) => {
        setRolSeleccionado(u.role?.nombre || 'ROLE_USER');
        setUsuarioTarget(u);
        setModalEditRol(true);
    };

    const abrirConfirmToggle = (u) => { setUsuarioTarget(u); setModalConfirmToggle(true); };

    const handleConfirmToggle = async () => {
        setSubmitting(true);
        try {
            await toggleEstado(usuarioTarget.id);
            setModalConfirmToggle(false);
            flash('ok', `Usuario ${usuarioTarget.isActive ? 'desactivado' : 'activado'} correctamente`);
            cargarUsuarios();
        } catch (err) {
            flash('err', err?.response?.data?.message || 'Error al cambiar estado del usuario');
        } finally {
            setSubmitting(false);
        }
    };

    const handleCrear = async (e) => {
        e.preventDefault();
        const errs = validarFormUsuario(formCrear, 'crear');
        if (Object.keys(errs).length > 0) { setErroresCrear(errs); return; }
        setErroresCrear({});
        setSubmitting(true);
        try {
            await crearUsuario({
                email: formCrear.email,
                password: formCrear.password,
                nombreCompleto: `${formCrear.nombres.trim()} ${formCrear.apellidos.trim()}`,
                rut: formCrear.rut || undefined,
                telefono: formCrear.telefono !== '+569' ? formCrear.telefono : undefined,
                roles: formCrear.roles,
            });
            setModalCrear(false);
            flash('ok', 'Usuario creado correctamente');
            cargarUsuarios();
        } catch (err) {
            setErrorModal(err?.response?.data?.message || 'Error al crear usuario.');
        } finally { setSubmitting(false); }
    };

    const handleGuardarDatos = async (e) => {
        e.preventDefault();
        const errs = validarFormUsuario(formDatos, 'editar');
        if (Object.keys(errs).length > 0) { setErroresEditar(errs); return; }
        setErroresEditar({});
        setSubmitting(true);
        try {
            const nombreCompleto = [formDatos.nombres, formDatos.apellidos].filter(Boolean).join(' ');
            const emailLogueado = localStorage.getItem('email');
            const cambioEmail = formDatos.email !== usuarioTarget.email;

            await updateUser(usuarioTarget.id, {
                email: formDatos.email,
                nombreCompleto: nombreCompleto || undefined,
                rut: formDatos.rut || undefined,
                telefono: formDatos.telefono !== '+569' ? formDatos.telefono : undefined,
                password: formDatos.password || undefined,
            });

            setModalEditDatos(false);
            flash('ok', 'Datos actualizados correctamente');

            if (usuarioTarget.email === emailLogueado) {
                localStorage.setItem('nombreCompleto', nombreCompleto);
                window.dispatchEvent(new Event('nombreActualizado'));
            }

            cargarUsuarios();

        } catch (err) {
            const status = err?.response?.status;
            const emailLogueado = localStorage.getItem('email');

            if (status === 403 && formDatos.email !== usuarioTarget.email && usuarioTarget.email === emailLogueado) {
                localStorage.clear();
                alert('Tu correo fue actualizado correctamente. Debes iniciar sesión nuevamente con tu nuevo correo.');
                navigate('/login');
                return;
            }

            flash('err', err?.response?.data?.message || 'Error al actualizar datos');
        } finally { setSubmitting(false); }
    };

    const handleGuardarRol = async () => {
        if (rolSeleccionado === 'ROLE_ADMIN') {
            setModalEditRol(false);
            setModalConfirmAdmin(true);
            return;
        }
        await ejecutarCambioRol();
    };

    const ejecutarCambioRol = async () => {
        setSubmitting(true);
        try {
            await asignarRol(usuarioTarget.id, rolSeleccionado);
            setModalConfirmAdmin(false);
            setModalEditRol(false);
            flash('ok', 'Rol actualizado correctamente');

            const emailLogueado = localStorage.getItem('email');
            if (usuarioTarget.email === emailLogueado && rolSeleccionado !== 'ROLE_ADMIN') {
                actualizarRol(rolSeleccionado);
                setTimeout(() => navigate('/dashboard'), 1500);
            }

            cargarUsuarios();
        } catch (err) { flash('err', err?.response?.data?.message || 'Error al cambiar rol'); }
        finally { setSubmitting(false); }
    };

    const emailLogueado = localStorage.getItem('email');

    const usuariosFiltrados = usuarios
        .filter((u) => u.role?.nombre !== 'ROLE_ADMIN')
        .filter((u) => u.email !== emailLogueado)
        .filter((u) =>
            u.email?.toLowerCase().includes(busqueda.toLowerCase()) ||
            u.nombreCompleto?.toLowerCase().includes(busqueda.toLowerCase())
        );

    const campo = (form, setForm, errores, key, label, opts = {}) => (
        <div className={opts.full ? 'col-span-2' : ''}>
            <label className={LABEL}>{label}{opts.required && <span className="text-observed ml-0.5">*</span>}</label>
            <input
                className={errores[key] ? INPUTE : INPUT}
                type={opts.type || 'text'}
                value={form[key]}
                onChange={(e) => {
                    let v = e.target.value;
                    if (opts.formatear === 'rut') v = formatearRut(v);
                    if (opts.formatear === 'telefono') v = formatearTelefono(v);
                    if (opts.soloLetras) v = v.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]/g, '');
                    setForm({ ...form, [key]: v });
                }}
                placeholder={opts.placeholder}
                maxLength={opts.maxLength}
                required={opts.required}
            />
            <ErrMsg campo={key} errores={errores} />
        </div>
    );

    return (
        <div className="p-5 text-white select-none">

            <div className="flex justify-between items-center mb-4 flex-wrap gap-2.5">
                <div className="text-[15px] font-medium text-white">Gestión de Usuarios</div>
                <div className="flex gap-2.5 items-center">
                    <div className="flex items-center gap-2 bg-navy-mid border border-white/8 rounded-lg px-3 py-1.5">
                        <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="#8899aa" strokeWidth="2"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
                        <input className="bg-transparent border-none outline-none text-white text-xs w-[200px] placeholder:text-muted" placeholder="Buscar por nombre o correo..." value={busqueda} onChange={(e) => setBusqueda(e.target.value)} />
                    </div>
                    <button
                        onClick={() => {
                            setFormCrear({ nombres: '', apellidos: '', rut: '', telefono: '+569', email: '', password: '', confirmPassword: '', roles: ['ROLE_USER'] });
                            setErroresCrear({});
                            setErrorModal('');
                            setModalCrear(true);
                        }}
                        className="bg-green text-navy font-semibold text-xs px-3.5 py-2 rounded-lg hover:bg-green-dim transition-colors cursor-pointer"
                    >
                        + Nuevo usuario
                    </button>
                </div>
            </div>

            {error && <div className="bg-observed/10 border border-observed/25 rounded-lg px-3 py-2.5 text-observed text-xs mb-3">{error}</div>}
            {success && <div className="bg-green/10 border border-green/25 rounded-lg px-3 py-2.5 text-green text-xs mb-3">{success}</div>}

            <div className="bg-navy border border-white/8 rounded-xl overflow-visible">
                <table className="w-full border-collapse">
                    <thead>
                        <tr>{['Nombre', 'Correo', 'RUT', 'Rol', 'Estado', 'Creado', 'Acciones'].map(h => (
                            <th key={h} className="px-4 py-2.5 text-[10px] font-semibold text-muted text-left uppercase tracking-wide border-b border-white/8 font-mono">{h}</th>
                        ))}</tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={7} className="px-4 py-5 text-center text-muted text-xs">Cargando...</td></tr>
                        ) : usuariosFiltrados.length === 0 ? (
                            <tr><td colSpan={7} className="px-4 py-5 text-center text-muted text-xs">No se encontraron usuarios</td></tr>
                        ) : usuariosFiltrados.map((u) => {
                            const rolInfo = getRolInfo(u);
                            return (
                                <tr key={u.id} className="border-b border-white/4 hover:bg-white/3 transition-colors">
                                    <td className="px-4 py-2.5">
                                        <div className="flex items-center gap-2">
                                            <div className="w-[26px] h-[26px] rounded-full bg-navy-mid border-[1.5px] border-green flex items-center justify-center text-[10px] font-semibold text-green shrink-0">
                                                {(u.nombreCompleto || u.email).substring(0, 2).toUpperCase()}
                                            </div>
                                            <span className="text-[13px] font-medium text-white">{u.nombreCompleto || '—'}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-2.5 font-mono text-[11px] text-muted">{u.email}</td>
                                    <td className="px-4 py-2.5 font-mono text-[11px] text-muted">{u.rut || '—'}</td>
                                    <td className="px-4 py-2.5"><span className={`text-[10px] font-semibold font-mono px-2.5 py-1 rounded-full ${rolInfo.class}`}>{rolInfo.label}</span></td>
                                    <td className="px-4 py-2.5"><span className={`text-[10px] font-semibold font-mono px-2.5 py-1 rounded-full ${u.isActive ? 'bg-green/12 text-green' : 'bg-white/8 text-muted'}`}>{u.isActive ? 'Activo' : 'Inactivo'}</span></td>
                                    <td className="px-4 py-2.5 font-mono text-[11px] text-muted">{u.createdAt ? new Date(u.createdAt).toLocaleDateString('es-CL') : '—'}</td>
                                    <td className="px-4 py-2.5"><ActionMenu usuario={u} onEditDatos={abrirEditDatos} onEditRol={abrirEditRol} onToggle={abrirConfirmToggle} /></td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* ════ MODAL: CREAR ════ */}
            {modalCrear && (
                <Overlay onClose={() => { setModalCrear(false); setErrorModal(''); }}>
                    <ModalHeader title="Crear nuevo usuario" onClose={() => { setModalCrear(false); setErrorModal(''); }} />
                    <form onSubmit={handleCrear}>
                        <SectionTitle>Información personal</SectionTitle>
                        <div className="grid grid-cols-2 gap-3 mb-4">
                            {campo(formCrear, setFormCrear, erroresCrear, 'nombres', 'Nombres', { required: true, soloLetras: true, placeholder: 'Ej: Alan' })}
                            {campo(formCrear, setFormCrear, erroresCrear, 'apellidos', 'Apellidos', { required: true, soloLetras: true, placeholder: 'Ej: Brito' })}
                            {campo(formCrear, setFormCrear, erroresCrear, 'rut', 'RUT', { required: true, formatear: 'rut', placeholder: '12345678-9', maxLength: 10 })}
                            {campo(formCrear, setFormCrear, erroresCrear, 'telefono', 'Teléfono', { required: true, formatear: 'telefono', placeholder: '+56912345678', maxLength: 12 })}
                            {campo(formCrear, setFormCrear, erroresCrear, 'email', 'Correo', { required: true, type: 'email', placeholder: 'usuario@empresa.cl', full: true })}
                            {campo(formCrear, setFormCrear, erroresCrear, 'password', 'Contraseña', { required: true, type: 'password', placeholder: 'Ej: Admin1234' })}
                            <span className="text-[10px] text-muted mt-1 block">Mínimo 8 caracteres, mayúscula, minúscula, número y carácter especial (!@#$%^&*).</span>
                            {campo(formCrear, setFormCrear, erroresCrear, 'confirmPassword', 'Confirmar contraseña', { required: true, type: 'password', placeholder: 'Repite la contraseña' })}
                        </div>
                        <SectionTitle>Rol</SectionTitle>
                        <div className="grid grid-cols-3 gap-2.5 mb-5">
                            {ROLES.map(r => <RoleCard key={r.key} rol={r} selected={formCrear.roles[0] === r.key} onClick={() => setFormCrear({ ...formCrear, roles: [r.key] })} />)}
                        </div>
                        {errorModal && (
                            <div className="bg-observed/10 border border-observed/25 rounded-lg px-3 py-2.5 text-observed text-xs mb-3">
                                {errorModal}
                            </div>
                        )}
                        <ModalFooter onCancel={() => { setModalCrear(false); setErrorModal(''); }} label="Crear usuario" loading={submitting} />
                    </form>
                </Overlay>
            )}

            {/* ════ MODAL: EDITAR DATOS ════ */}
            {modalEditDatos && usuarioTarget && (
                <Overlay onClose={() => setModalEditDatos(false)}>
                    <ModalHeader title={`Editar datos — ${usuarioTarget.nombreCompleto || usuarioTarget.email}`} onClose={() => setModalEditDatos(false)} />
                    <form onSubmit={handleGuardarDatos}>
                        <SectionTitle>Información personal</SectionTitle>
                        <div className="grid grid-cols-2 gap-3 mb-4">
                            {campo(formDatos, setFormDatos, erroresEditar, 'nombres', 'Nombres', { soloLetras: true, placeholder: 'Ej: Alan' })}
                            {campo(formDatos, setFormDatos, erroresEditar, 'apellidos', 'Apellidos', { soloLetras: true, placeholder: 'Ej: Brito' })}
                            {campo(formDatos, setFormDatos, erroresEditar, 'rut', 'RUT', { formatear: 'rut', placeholder: '12345678-9', maxLength: 10 })}
                            {campo(formDatos, setFormDatos, erroresEditar, 'telefono', 'Teléfono', { required: true, formatear: 'telefono', placeholder: '+56912345678', maxLength: 12 })}
                            {campo(formDatos, setFormDatos, erroresEditar, 'email', 'Correo', { required: true, type: 'email', placeholder: 'usuario@empresa.cl', full: true })}
                        </div>
                        <SectionTitle>Cambiar contraseña <span className="normal-case tracking-normal font-normal text-muted">· dejar vacío para no cambiar</span></SectionTitle>
                        <div className="mb-5">
                            {campo(formDatos, setFormDatos, erroresEditar, 'password', '', { type: 'password', placeholder: 'Ej: Admin1234*' })}
                            <span className="text-[10px] text-muted mt-1 block">Mínimo 8 caracteres, mayúscula, minúscula, número y carácter especial (!@#$%^&*).</span>
                        </div>
                        <ModalFooter onCancel={() => setModalEditDatos(false)} label="Guardar cambios" loading={submitting} />
                    </form>
                </Overlay>
            )}

            {/* ════ MODAL: CAMBIAR ROL ════ */}
            {modalEditRol && usuarioTarget && (
                <Overlay onClose={() => setModalEditRol(false)}>
                    <ModalHeader title={`Cambiar rol — ${usuarioTarget.nombreCompleto || usuarioTarget.email}`} onClose={() => setModalEditRol(false)} />
                    <SectionTitle>Seleccionar rol</SectionTitle>
                    <div className="grid grid-cols-3 gap-2.5 mb-5">
                        {ROLES.map(r => <RoleCard key={r.key} rol={r} selected={rolSeleccionado === r.key} onClick={() => setRolSeleccionado(r.key)} />)}
                    </div>
                    <div className="flex justify-end gap-2.5 pt-3.5 border-t border-white/8">
                        <button type="button" onClick={() => setModalEditRol(false)} className="bg-transparent text-muted border border-white/8 rounded-lg px-3.5 py-2 text-xs hover:bg-white/5 cursor-pointer transition-colors">Cancelar</button>
                        <button type="button" onClick={handleGuardarRol} disabled={submitting} className="bg-green text-navy font-semibold text-xs px-4 py-2 rounded-lg hover:bg-green-dim cursor-pointer transition-colors disabled:opacity-60">
                            {submitting ? 'Guardando...' : 'Guardar rol'}
                        </button>
                    </div>
                </Overlay>
            )}

            {/* ════ MODAL: CONFIRMAR TOGGLE ════ */}
            {modalConfirmToggle && usuarioTarget && (
                <Overlay onClose={() => setModalConfirmToggle(false)}>
                    <div className="text-center py-2">
                        <div className={`w-12 h-12 rounded-full mx-auto mb-4 flex items-center justify-center text-xl ${usuarioTarget.isActive ? 'bg-observed/15' : 'bg-green/12'}`}>
                            {usuarioTarget.isActive ? '⊗' : '✓'}
                        </div>
                        <div className="text-[15px] font-medium text-white mb-2">{usuarioTarget.isActive ? 'Desactivar usuario' : 'Activar usuario'}</div>
                        <p className="text-xs text-muted mb-6 leading-relaxed">
                            {usuarioTarget.isActive
                                ? `¿Confirmas que deseas desactivar a ${usuarioTarget.nombreCompleto || usuarioTarget.email}? El usuario no podrá iniciar sesión.`
                                : `¿Confirmas que deseas activar a ${usuarioTarget.nombreCompleto || usuarioTarget.email}? El usuario podrá iniciar sesión nuevamente.`}
                        </p>
                        <div className="flex justify-center gap-2.5">
                            <button onClick={() => setModalConfirmToggle(false)} className="bg-transparent text-muted border border-white/8 rounded-lg px-4 py-2 text-xs hover:bg-white/5 cursor-pointer transition-colors">Cancelar</button>
                            <button onClick={handleConfirmToggle} disabled={submitting}
                                className={`font-semibold text-xs px-5 py-2 rounded-lg cursor-pointer transition-colors disabled:opacity-60 ${usuarioTarget.isActive ? 'bg-observed/15 text-observed border border-observed/25 hover:bg-observed/25' : 'bg-green text-navy hover:bg-green-dim'}`}>
                                {submitting ? 'Procesando...' : usuarioTarget.isActive ? 'Sí, desactivar' : 'Sí, activar'}
                            </button>
                        </div>
                    </div>
                </Overlay>
            )}
            {modalConfirmAdmin && usuarioTarget && (
                <Overlay onClose={() => setModalConfirmAdmin(false)}>
                    <div className="text-center py-2">
                        <div className="w-12 h-12 rounded-full mx-auto mb-4 flex items-center justify-center text-xl bg-observed/15">
                            ⚠
                        </div>
                        <div className="text-[15px] font-medium text-white mb-2">
                            Asignar rol Administrador
                        </div>
                        <p className="text-xs text-muted mb-6 leading-relaxed">
                            Estás a punto de asignar el rol de <span className="text-white font-medium">Administrador</span> a <span className="text-white font-medium">{usuarioTarget.nombreCompleto || usuarioTarget.email}</span>.
                            <br /><br />
                            Una vez asignado, <span className="text-observed">no podrás cambiar su rol ni desactivar esta cuenta</span> desde el panel de administración.
                            <br /><br />
                            ¿Confirmas el cambio?
                        </p>
                        <div className="flex justify-center gap-2.5">
                            <button onClick={() => setModalConfirmAdmin(false)} className="bg-transparent text-muted border border-white/8 rounded-lg px-4 py-2 text-xs hover:bg-white/5 cursor-pointer transition-colors">
                                Cancelar
                            </button>
                            <button onClick={ejecutarCambioRol} disabled={submitting}
                                className="bg-observed/15 text-observed border border-observed/25 rounded-lg px-5 py-2 text-xs font-semibold hover:bg-observed/25 cursor-pointer transition-colors disabled:opacity-60">
                                {submitting ? 'Procesando...' : 'Sí, asignar Administrador'}
                            </button>
                        </div>
                    </div>
                </Overlay>
            )}
        </div>
    );
};

export default GestionUsuarios;