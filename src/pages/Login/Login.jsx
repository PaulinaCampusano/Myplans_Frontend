import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login, register, requestPasswordReset } from '../../services/auth';

const Login = () => {
    const [activeTab, setActiveTab] = useState('signin');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [nombres, setNombres] = useState('');
    const [apellidos, setApellidos] = useState('');
    const [rut, setRut] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const resetFields = () => {
        setEmail(''); setPassword(''); setConfirmPassword('');
        setNombres(''); setApellidos(''); setRut('');
        setError(''); setSuccess('');
    };

    const handleTabChange = (tab) => {
        setActiveTab(tab);
        resetFields();
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await login(email, password);
            navigate('/dashboard');
        } catch {
            setError('Correo o contraseña incorrectos');
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setError('');
        if (password !== confirmPassword) {
            setError('Las contraseñas no coinciden');
            return;
        }
        setLoading(true);
        try {
            await register({
                email,
                password,
                nombreCompleto: `${nombres} ${apellidos}`,
                rut,
            });
            setSuccess('Solicitud enviada. Un administrador aprobará tu acceso.');
        } catch {
            setError('El correo ya está registrado');
        } finally {
            setLoading(false);
        }
    };

    const handleRecover = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await requestPasswordReset(email);
            setSuccess('Si el correo existe, recibirás un enlace de recuperación.');
        } catch {
            setSuccess('Si el correo existe, recibirás un enlace de recuperación.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.container}>
            <svg style={styles.bgSvg} viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice">
                <defs>
                    <radialGradient id="g1" cx="15%" cy="85%">
                        <stop offset="0%" stopColor="#2ecc71" stopOpacity="0.12" />
                        <stop offset="60%" stopColor="#0f1922" stopOpacity="0" />
                    </radialGradient>
                    <radialGradient id="g2" cx="85%" cy="15%">
                        <stop offset="0%" stopColor="#2ecc71" stopOpacity="0.05" />
                        <stop offset="60%" stopColor="#0f1922" stopOpacity="0" />
                    </radialGradient>
                </defs>
                <rect width="1440" height="900" fill="#0f1922" />
                <rect width="1440" height="900" fill="url(#g1)" />
                <rect width="1440" height="900" fill="url(#g2)" />
                {Array.from({ length: 10 }).map((_, i) => (
                    <line key={`h${i}`} x1="0" y1={i * 100} x2="1440" y2={i * 100}
                        stroke="white" strokeOpacity="0.025" strokeWidth="1" />
                ))}
                {Array.from({ length: 15 }).map((_, i) => (
                    <line key={`v${i}`} x1={i * 100} y1="0" x2={i * 100} y2="900"
                        stroke="white" strokeOpacity="0.025" strokeWidth="1" />
                ))}
            </svg>

            <div style={styles.wrapper}>
                <div style={styles.card}>
                    <div style={styles.tabRow}>
                        {['signin', 'register', 'recover'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => handleTabChange(tab)}
                                style={{
                                    ...styles.tab,
                                    ...(activeTab === tab ? styles.tabActive : {}),
                                }}
                            >
                                {tab === 'signin' && 'Iniciar sesión'}
                                {tab === 'register' && 'Registro'}
                                {tab === 'recover' && 'Recuperar clave'}
                            </button>
                        ))}
                    </div>

                    <div style={styles.cardBody}>

                        {activeTab === 'signin' && (
                            <>
                                <div style={styles.logoRow}>
                                    <div style={styles.logoIcon}>
                                        <svg viewBox="0 0 24 24" width="20" height="20" fill="#1a2332">
                                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                            <polyline points="14 2 14 8 20 8" stroke="#1a2332" strokeWidth="2" fill="none" />
                                            <line x1="8" y1="13" x2="16" y2="13" stroke="#1a2332" strokeWidth="1.5" />
                                            <line x1="8" y1="17" x2="13" y2="17" stroke="#1a2332" strokeWidth="1.5" />
                                        </svg>
                                    </div>
                                    <div>
                                        <div style={styles.logoText}>MyPlans</div>
                                        <div style={styles.logoSub}>Plataforma de Precomisionamiento Eléctrico</div>
                                    </div>
                                </div>
                                <form onSubmit={handleLogin}>
                                    <div style={styles.formGroup}>
                                        <label style={styles.label}>Correo electrónico</label>
                                        <input style={styles.input} type="email" value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="usuario@myplans.cl" required />
                                    </div>
                                    <div style={styles.formGroup}>
                                        <label style={styles.label}>Contraseña</label>
                                        <input style={styles.input} type="password" value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder="••••••••" required />
                                    </div>
                                    {error && <div style={styles.error}>{error}</div>}
                                    <button style={styles.button} type="submit" disabled={loading}>
                                        {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
                                    </button>
                                </form>
                            </>
                        )}

                        {activeTab === 'register' && (
                            <form onSubmit={handleRegister}>
                                <div style={styles.sectionTitle}>Solicitud de acceso</div>
                                <div style={styles.formGrid}>
                                    <div style={styles.formGroup}>
                                        <label style={styles.label}>Nombres <span style={styles.req}>*</span></label>
                                        <input style={styles.input} type="text" value={nombres}
                                            onChange={(e) => setNombres(e.target.value)}
                                            placeholder="Ej: Paulina" required />
                                    </div>
                                    <div style={styles.formGroup}>
                                        <label style={styles.label}>Apellidos <span style={styles.req}>*</span></label>
                                        <input style={styles.input} type="text" value={apellidos}
                                            onChange={(e) => setApellidos(e.target.value)}
                                            placeholder="Ej: Campusano" required />
                                    </div>
                                    <div style={styles.formGroup}>
                                        <label style={styles.label}>RUT <span style={styles.req}>*</span></label>
                                        <input style={styles.input} type="text" value={rut}
                                            onChange={(e) => setRut(e.target.value)}
                                            placeholder="18.165.530-5" required />
                                    </div>
                                    <div style={styles.formGroup}>
                                        <label style={styles.label}>Correo <span style={styles.req}>*</span></label>
                                        <input style={styles.input} type="email" value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="usuario@empresa.cl" required />
                                    </div>
                                    <div style={styles.formGroup}>
                                        <label style={styles.label}>Contraseña <span style={styles.req}>*</span></label>
                                        <input style={styles.input} type="password" value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder="Mín. 8 caracteres" required />
                                    </div>
                                    <div style={styles.formGroup}>
                                        <label style={styles.label}>Confirmar contraseña <span style={styles.req}>*</span></label>
                                        <input style={styles.input} type="password" value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            placeholder="Repite la contraseña" required />
                                    </div>
                                </div>
                                {error && <div style={styles.error}>{error}</div>}
                                {success && <div style={styles.successMsg}>{success}</div>}
                                <button style={styles.button} type="submit" disabled={loading}>
                                    {loading ? 'Enviando...' : 'Enviar solicitud'}
                                </button>
                                <div style={styles.hint}>Un administrador aprobará tu acceso.</div>
                            </form>
                        )}

                        {activeTab === 'recover' && (
                            <form onSubmit={handleRecover}>
                                <div style={styles.recoverTitle}>Recuperar contraseña</div>
                                <div style={styles.recoverDesc}>
                                    Ingresa tu correo y te enviaremos un enlace de recuperación.
                                </div>
                                <div style={styles.formGroup}>
                                    <label style={styles.label}>Correo electrónico <span style={styles.req}>*</span></label>
                                    <input style={styles.input} type="email" value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="usuario@empresa.cl" required />
                                </div>
                                {error && <div style={styles.error}>{error}</div>}
                                {success && <div style={styles.successMsg}>{success}</div>}
                                <button style={styles.button} type="submit" disabled={loading}>
                                    {loading ? 'Enviando...' : 'Enviar enlace'}
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

const styles = {
    container: {
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
    },
    bgSvg: {
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none',
        zIndex: 0,
    },
    wrapper: {
        width: '460px',
        position: 'relative',
        zIndex: 1,
    },
    card: {
        background: '#1a2332',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '14px',
        overflow: 'hidden',
    },
    tabRow: {
        display: 'flex',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        padding: '8px 8px 0',
        gap: '2px',
    },
    tab: {
        flex: 1,
        padding: '9px 8px',
        borderRadius: '6px 6px 0 0',
        border: 'none',
        background: 'transparent',
        color: '#8899aa',
        fontSize: '12px',
        fontWeight: '500',
        cursor: 'pointer',
        borderBottom: '2px solid transparent',
    },
    tabActive: {
        background: 'rgba(46,204,113,0.08)',
        color: '#2ecc71',
        borderBottom: '2px solid #2ecc71',
    },
    cardBody: {
        padding: '28px 32px',
    },
    logoRow: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        marginBottom: '24px',
    },
    logoIcon: {
        width: '36px',
        height: '36px',
        background: '#2ecc71',
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
    },
    logoText: {
        fontSize: '20px',
        fontWeight: '600',
        color: '#f0f4f8',
        letterSpacing: '-0.02em',
        textAlign: 'left',
    },
    logoSub: {
        fontSize: '11px',
        color: '#8899aa',
        textAlign: 'left',
    },
    sectionTitle: {
        fontSize: '14px',
        fontWeight: '500',
        color: '#f0f4f8',
        marginBottom: '16px',
        textAlign: 'left',
    },
    recoverTitle: {
        fontSize: '14px',
        fontWeight: '500',
        color: '#f0f4f8',
        marginBottom: '2px',
        textAlign: 'left',
    },
    recoverDesc: {
        fontSize: '12px',
        color: '#8899aa',
        marginBottom: '18px',
        textAlign: 'left',
    },
    formGrid: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '8px',
        marginBottom: '4px',
    },
    formGroup: {
        marginBottom: '6px',
    },
    label: {
        display: 'block',
        fontSize: '11px',
        fontWeight: '500',
        color: '#8899aa',
        textTransform: 'uppercase',
        letterSpacing: '0.04em',
        marginBottom: '6px',
        textAlign: 'left',
    },
    req: {
        color: '#e74c3c',
    },
    input: {
        width: '100%',
        background: '#0f1922',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '8px',
        padding: '9px 13px',
        color: '#f0f4f8',
        fontSize: '13px',
        outline: 'none',
        boxSizing: 'border-box',
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
    button: {
        width: '100%',
        background: '#2ecc71',
        color: '#1a2332',
        border: 'none',
        borderRadius: '7px',
        padding: '11px',
        fontSize: '13px',
        fontWeight: '600',
        cursor: 'pointer',
        marginTop: '4px',
    },
    hint: {
        fontSize: '11px',
        color: '#8899aa',
        textAlign: 'center',
        marginTop: '10px',
    },
};

export default Login;