import { useState, useEffect } from 'react';
import { getUsuarios, crearUsuario, toggleEstado, asignarRol } from '../../services/usuarios';

const GestionUsuarios = () => {
    const [usuarios, setUsuarios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [busqueda, setBusqueda] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState('crear');
    const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);
    const [form, setForm] = useState({
        email: '', password: '', nombreCompleto: '', rut: '', telefono: '', roles: ['ROLE_USER']
    });

    useEffect(() => { cargarUsuarios(); }, []);

    const cargarUsuarios = async () => {
        try {
            setLoading(true);
            const data = await getUsuarios();
            setUsuarios(data);
        } catch {
            setError('Error al cargar usuarios');
        } finally {
            setLoading(false);
        }
    };

    const handleToggle = async (id) => {
        try {
            await toggleEstado(id);
            setSuccess('Estado actualizado correctamente');
            cargarUsuarios();
            setTimeout(() => setSuccess(''), 3000);
        } catch {
            setError('Error al actualizar estado');
            setTimeout(() => setError(''), 3000);
        }
    };

    const handleCrear = () => {
        setModalMode('crear');
        setForm({ email: '', password: '', nombreCompleto: '', rut: '', telefono: '', roles: ['ROLE_USER'] });
        setShowModal(true);
    };

    const handleEditar = (usuario) => {
        setModalMode('editar');
        setUsuarioSeleccionado(usuario);
        setForm({
            email: usuario.email,
            password: '',
            nombreCompleto: usuario.nombreCompleto || '',
            rut: usuario.rut || '',
            telefono: usuario.telefono || '',
            roles: usuario.role ? [usuario.role.nombre] : ['ROLE_USER'],
        });
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (modalMode === 'crear') {
                await crearUsuario(form);
                setSuccess('Usuario creado correctamente');
            } else {
                await asignarRol(usuarioSeleccionado.id, form.roles[0]);
                setSuccess('Usuario actualizado correctamente');
            }
            setShowModal(false);
            cargarUsuarios();
            setTimeout(() => setSuccess(''), 3000);
        } catch {
            setError('Error al guardar usuario');
            setTimeout(() => setError(''), 3000);
        }
    };

    const usuariosFiltrados = usuarios.filter(u =>
        u.email?.toLowerCase().includes(busqueda.toLowerCase()) ||
        u.nombreCompleto?.toLowerCase().includes(busqueda.toLowerCase())
    );

    const getRolLabel = (user) => {
        const rol = user.role?.nombre || '';
        if (rol === 'ROLE_ADMIN') return { label: 'Administrador', color: '#d0d8e4', bg: 'rgba(255,255,255,0.08)' };
        if (rol === 'ROLE_AUDITOR') return { label: 'Supervisor', color: '#3498db', bg: 'rgba(52,152,219,0.15)' };
        return { label: 'Operador', color: '#f39c12', bg: 'rgba(243,156,18,0.15)' };
    };

    return (
        <div style={styles.container}>
            {/* HEADER */}
            <div style={styles.topRow}>
                <div style={styles.pageTitle}>Gestión de Usuarios</div>
                <div style={styles.topActions}>
                    <input
                        style={styles.searchInput}
                        placeholder="Buscar por nombre o correo..."
                        value={busqueda}
                        onChange={(e) => setBusqueda(e.target.value)}
                    />
                    <button style={styles.btnPrimary} onClick={handleCrear}>+ Nuevo usuario</button>
                </div>
            </div>

            {error && <div style={styles.alertError}>{error}</div>}
            {success && <div style={styles.alertSuccess}>{success}</div>}

            {/* TABLA */}
            <div style={styles.tableWrap}>
                <table style={styles.table}>
                    <thead>
                        <tr>
                            {['Nombre', 'Correo', 'RUT', 'Rol', 'Estado', 'Creado', 'Acciones'].map(h => (
                                <th key={h} style={styles.th}>{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={7} style={styles.tdCenter}>Cargando...</td></tr>
                        ) : usuariosFiltrados.length === 0 ? (
                            <tr><td colSpan={7} style={styles.tdCenter}>No se encontraron usuarios</td></tr>
                        ) : usuariosFiltrados.map((u) => {
                            const rol = getRolLabel(u);
                            return (
                                <tr key={u.id} style={styles.tr}>
                                    <td style={styles.td}>
                                        <div style={styles.userCell}>
                                            <div style={styles.avatar}>{(u.nombreCompleto || u.email).substring(0, 2).toUpperCase()}</div>
                                            <span style={styles.userName}>{u.nombreCompleto || '—'}</span>
                                        </div>
                                    </td>
                                    <td style={{ ...styles.td, ...styles.mono }}>{u.email}</td>
                                    <td style={{ ...styles.td, ...styles.mono }}>{u.rut || '—'}</td>
                                    <td style={styles.td}>
                                        <span style={{ ...styles.badge, background: rol.bg, color: rol.color }}>{rol.label}</span>
                                    </td>
                                    <td style={styles.td}>
                                        <span style={{
                                            ...styles.badge,
                                            background: u.isActive ? 'rgba(46,204,113,0.12)' : 'rgba(127,140,141,0.15)',
                                            color: u.isActive ? '#2ecc71' : '#7f8c8d',
                                        }}>
                                            {u.isActive ? 'Activo' : 'Inactivo'}
                                        </span>
                                    </td>
                                    <td style={{ ...styles.td, ...styles.mono, fontSize: '11px' }}>
                                        {u.createdAt ? new Date(u.createdAt).toLocaleDateString('es-CL') : '—'}
                                    </td>
                                    <td style={styles.td}>
                                        <div style={styles.actionsRow}>
                                            <button style={styles.btnGhost} onClick={() => handleEditar(u)}>Editar</button>
                                            <button
                                                style={{ ...styles.btnGhost, color: u.isActive ? '#e74c3c' : '#2ecc71' }}
                                                onClick={() => handleToggle(u.id)}
                                            >
                                                {u.isActive ? 'Desactivar' : 'Activar'}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* MODAL */}
            {showModal && (
                <div style={styles.overlay} onClick={(e) => e.target === e.currentTarget && setShowModal(false)}>
                    <div style={styles.modal}>
                        <div style={styles.modalHeader}>
                            <span style={styles.modalTitle}>{modalMode === 'crear' ? 'Crear usuario' : 'Editar usuario'}</span>
                            <button style={styles.modalClose} onClick={() => setShowModal(false)}>×</button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            {modalMode === 'crear' && (
                                <>
                                    <div style={styles.formGrid}>
                                        <div style={styles.formGroup}>
                                            <label style={styles.label}>Nombre completo <span style={styles.req}>*</span></label>
                                            <input style={styles.input} value={form.nombreCompleto}
                                                onChange={(e) => setForm({ ...form, nombreCompleto: e.target.value })} required />
                                        </div>
                                        <div style={styles.formGroup}>
                                            <label style={styles.label}>RUT</label>
                                            <input style={styles.input} value={form.rut} placeholder="18.165.530-5"
                                                onChange={(e) => setForm({ ...form, rut: e.target.value })} />
                                        </div>
                                        <div style={styles.formGroup}>
                                            <label style={styles.label}>Correo <span style={styles.req}>*</span></label>
                                            <input style={styles.input} type="email" value={form.email}
                                                onChange={(e) => setForm({ ...form, email: e.target.value })} required />
                                        </div>
                                        <div style={styles.formGroup}>
                                            <label style={styles.label}>Teléfono</label>
                                            <input style={styles.input} value={form.telefono}
                                                onChange={(e) => setForm({ ...form, telefono: e.target.value })} />
                                        </div>
                                        <div style={styles.formGroup}>
                                            <label style={styles.label}>Contraseña <span style={styles.req}>*</span></label>
                                            <input style={styles.input} type="password" value={form.password}
                                                onChange={(e) => setForm({ ...form, password: e.target.value })} required />
                                        </div>
                                    </div>
                                </>
                            )}

                            <div style={styles.formGroup}>
                                <label style={styles.label}>Rol</label>
                                <select style={styles.input} value={form.roles[0]}
                                    onChange={(e) => setForm({ ...form, roles: [e.target.value] })}>
                                    <option value="ROLE_USER">Operador</option>
                                    <option value="ROLE_AUDITOR">Supervisor</option>
                                    <option value="ROLE_ADMIN">Administrador</option>
                                </select>
                            </div>

                            <div style={styles.modalFooter}>
                                <button type="button" style={styles.btnGhost} onClick={() => setShowModal(false)}>Cancelar</button>
                                <button type="submit" style={styles.btnPrimary}>
                                    {modalMode === 'crear' ? 'Crear usuario' : 'Guardar cambios'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

const styles = {
    container: { padding: '20px 24px', color: '#f0f4f8', minHeight: '100%' },
    topRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', flexWrap: 'wrap', gap: '10px' },
    pageTitle: { fontSize: '15px', fontWeight: '500', color: '#f0f4f8' },
    topActions: { display: 'flex', gap: '10px', alignItems: 'center' },
    searchInput: { background: '#2d3d54', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '7px', padding: '7px 12px', color: '#f0f4f8', fontSize: '12px', outline: 'none', width: '220px' },
    btnPrimary: { background: '#2ecc71', color: '#1a2332', border: 'none', borderRadius: '7px', padding: '7px 14px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' },
    btnGhost: { background: 'transparent', color: '#8899aa', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '6px', padding: '5px 10px', fontSize: '11px', cursor: 'pointer' },
    alertError: { background: 'rgba(231,76,60,0.1)', border: '1px solid rgba(231,76,60,0.25)', borderRadius: '8px', padding: '10px 14px', color: '#e74c3c', fontSize: '12px', marginBottom: '14px' },
    alertSuccess: { background: 'rgba(46,204,113,0.1)', border: '1px solid rgba(46,204,113,0.25)', borderRadius: '8px', padding: '10px 14px', color: '#2ecc71', fontSize: '12px', marginBottom: '14px' },
    tableWrap: { background: '#1a2332', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', overflow: 'hidden' },
    table: { width: '100%', borderCollapse: 'collapse' },
    th: { padding: '9px 16px', fontSize: '10px', fontWeight: '600', color: '#8899aa', textAlign: 'left', letterSpacing: '0.06em', textTransform: 'uppercase', fontFamily: 'monospace', borderBottom: '1px solid rgba(255,255,255,0.08)' },
    tr: { borderBottom: '1px solid rgba(255,255,255,0.04)' },
    td: { padding: '10px 16px', fontSize: '12px', color: '#d0d8e4' },
    tdCenter: { padding: '20px', textAlign: 'center', color: '#8899aa', fontSize: '12px' },
    mono: { fontFamily: 'monospace', fontSize: '11px', color: '#8899aa' },
    userCell: { display: 'flex', alignItems: 'center', gap: '8px' },
    avatar: { width: '26px', height: '26px', borderRadius: '50%', background: '#2d3d54', border: '1.5px solid #2ecc71', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: '600', color: '#2ecc71', flexShrink: 0 },
    userName: { fontSize: '13px', fontWeight: '500', color: '#f0f4f8' },
    badge: { display: 'inline-flex', alignItems: 'center', padding: '3px 9px', borderRadius: '20px', fontSize: '10px', fontWeight: '600', fontFamily: 'monospace' },
    actionsRow: { display: 'flex', gap: '6px' },
    overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' },
    modal: { background: '#1a2332', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px', padding: '28px', width: '520px', maxHeight: '80vh', overflowY: 'auto' },
    modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
    modalTitle: { fontSize: '15px', fontWeight: '500', color: '#f0f4f8' },
    modalClose: { background: 'transparent', border: 'none', color: '#8899aa', fontSize: '20px', cursor: 'pointer' },
    modalFooter: { display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px', paddingTop: '14px', borderTop: '1px solid rgba(255,255,255,0.08)' },
    formGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' },
    formGroup: { marginBottom: '12px' },
    label: { display: 'block', fontSize: '11px', fontWeight: '500', color: '#8899aa', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '6px' },
    req: { color: '#e74c3c' },
    input: { width: '100%', background: '#0f1922', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', padding: '9px 13px', color: '#f0f4f8', fontSize: '13px', outline: 'none', boxSizing: 'border-box' },
};

export default GestionUsuarios;