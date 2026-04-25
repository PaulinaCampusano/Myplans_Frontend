import { useState } from 'react';

const Profile = () => {
    const email = localStorage.getItem('email') || '';

    const [nombres, setNombres] = useState('Paulina Esperanza');
    const [apellidos, setApellidos] = useState('Campusano Morales');
    const [rut] = useState('18.165.530-5');
    const [telefono, setTelefono] = useState('+56 9 8765 4321');
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');

    const handleSave = (e) => {
        e.preventDefault();
        setSuccess('Cambios guardados correctamente.');
        setError('');
        setTimeout(() => setSuccess(''), 3000);
    };

    const initials = `${nombres.charAt(0)}${apellidos.charAt(0)}`;

    return (
        <div style={styles.container}>
            <div style={styles.content}>

                {/* HEADER */}
                <div style={styles.header}>
                    <div style={styles.avatarRow}>
                        <div style={styles.avatar}>{initials}</div>
                        <div>
                            <div style={styles.userName}>{nombres} {apellidos}</div>
                            <span style={styles.roleBadge}>Operador</span>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSave}>
                    {/* INFORMACIÓN PERSONAL */}
                    <div style={styles.section}>
                        <div style={styles.sectionTitle}>Información personal</div>
                        <div style={styles.formGrid}>
                            <div style={styles.formGroup}>
                                <label style={styles.label}>Nombres</label>
                                <input style={styles.input} type="text" value={nombres}
                                    onChange={(e) => setNombres(e.target.value)} />
                            </div>
                            <div style={styles.formGroup}>
                                <label style={styles.label}>Apellidos</label>
                                <input style={styles.input} type="text" value={apellidos}
                                    onChange={(e) => setApellidos(e.target.value)} />
                            </div>
                            <div style={styles.formGroup}>
                                <label style={styles.label}>RUT <span style={styles.locked}>· no editable</span></label>
                                <input style={{ ...styles.input, ...styles.inputLocked }} type="text" value={rut} readOnly />
                            </div>
                            <div style={styles.formGroup}>
                                <label style={styles.label}>Correo <span style={styles.locked}>· no editable</span></label>
                                <input style={{ ...styles.input, ...styles.inputLocked }} type="email" value={email} readOnly />
                            </div>
                            <div style={styles.formGroup}>
                                <label style={styles.label}>Teléfono</label>
                                <input style={styles.input} type="text" value={telefono}
                                    onChange={(e) => setTelefono(e.target.value)} />
                            </div>
                        </div>
                    </div>

                    {/* CAMBIAR CONTRASEÑA */}
                    <div style={styles.section}>
                        <div style={styles.sectionTitle}>Cambiar contraseña</div>
                        <div style={styles.formGrid}>
                            <div style={styles.formGroup}>
                                <label style={styles.label}>Contraseña actual</label>
                                <input style={styles.input} type="password" value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                    placeholder="••••••••" />
                            </div>
                            <div style={styles.formGroup}>
                                <label style={styles.label}>Nueva contraseña</label>
                                <input style={styles.input} type="password" value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    placeholder="Mín. 8 caracteres" />
                            </div>
                        </div>
                    </div>

                    {error && <div style={styles.error}>{error}</div>}
                    {success && <div style={styles.successMsg}>{success}</div>}

                    {/* ACCIONES */}
                    <div style={styles.actions}>
                        <button type="submit" style={styles.btnSave}>
                            Guardar cambios
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const styles = {
    container: {
        minHeight: '100vh',
        background: '#141f2e',
        display: 'flex',
        justifyContent: 'center',
        padding: '32px 20px',
    },
    content: {
        width: '100%',
        maxWidth: '600px',
    },
    header: {
        marginBottom: '28px',
        paddingBottom: '20px',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
    },
    avatarRow: {
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
    },
    avatar: {
        width: '56px',
        height: '56px',
        borderRadius: '50%',
        background: '#2d3d54',
        border: '1.5px solid #2ecc71',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '18px',
        fontWeight: '600',
        color: '#2ecc71',
        flexShrink: 0,
    },
    userName: {
        fontSize: '18px',
        fontWeight: '600',
        color: '#f0f4f8',
        marginBottom: '5px',
    },
    roleBadge: {
        display: 'block',
        width: 'fit-content',
        fontSize: '10px',
        fontWeight: '600',
        padding: '3px 9px',
        borderRadius: '20px',
        background: 'rgba(243,156,18,0.15)',
        color: '#f39c12',
        border: '1px solid rgba(243,156,18,0.3)',
        marginTop: '5px',
    },
    section: {
        background: '#1a2332',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '10px',
        padding: '18px 20px',
        marginBottom: '14px',
    },
    sectionTitle: {
        fontSize: '11px',
        fontWeight: '600',
        color: '#8899aa',
        textTransform: 'uppercase',
        letterSpacing: '0.08em',
        marginBottom: '14px',
        paddingBottom: '10px',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
    },
    formGrid: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '12px',
    },
    formGroup: {
        display: 'flex',
        flexDirection: 'column',
        gap: '5px',
    },
    label: {
        fontSize: '11px',
        fontWeight: '500',
        color: '#8899aa',
        textTransform: 'uppercase',
        letterSpacing: '0.04em',
        textAlign: 'left',
        width: '100%',
    },
    locked: {
        fontSize: '10px',
        color: '#8899aa',
        textTransform: 'none',
        letterSpacing: 0,
        fontWeight: '400',
    },
    input: {
        background: '#0f1922',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '8px',
        padding: '9px 13px',
        color: '#f0f4f8',
        fontSize: '13px',
        outline: 'none',
        width: '100%',
        boxSizing: 'border-box',
    },
    inputLocked: {
        opacity: 0.5,
        cursor: 'not-allowed',
    },
    error: {
        background: 'rgba(231,76,60,0.1)',
        border: '1px solid rgba(231,76,60,0.25)',
        borderRadius: '8px',
        padding: '10px 14px',
        color: '#e74c3c',
        fontSize: '12px',
        marginBottom: '14px',
    },
    successMsg: {
        background: 'rgba(46,204,113,0.1)',
        border: '1px solid rgba(46,204,113,0.25)',
        borderRadius: '8px',
        padding: '10px 14px',
        color: '#2ecc71',
        fontSize: '12px',
        marginBottom: '14px',
    },
    actions: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: '14px',
        borderTop: '1px solid rgba(255,255,255,0.08)',
    },
    btnLogout: {
        background: 'rgba(231,76,60,0.1)',
        color: '#e74c3c',
        border: '1px solid rgba(231,76,60,0.2)',
        borderRadius: '7px',
        padding: '8px 16px',
        fontSize: '12px',
        fontWeight: '500',
        cursor: 'pointer',
    },
    btnSave: {
        background: '#2ecc71',
        color: '#1a2332',
        border: 'none',
        borderRadius: '7px',
        padding: '8px 20px',
        fontSize: '12px',
        fontWeight: '600',
        cursor: 'pointer',
    },
};

export default Profile;