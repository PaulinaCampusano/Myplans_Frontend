import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { login as loginService, register, requestPasswordReset } from '../../services/auth';
import {
    validarFormUsuario,
    formatearRut,
    formatearTelefono,
} from '../../utils/validaciones';

const Login = () => {
    const { login } = useAuth();
    const [activeTab, setActiveTab] = useState('signin');

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const [rNombres, setRNombres] = useState('');
    const [rApellidos, setRApellidos] = useState('');
    const [rRut, setRRut] = useState('');
    const [rTelefono, setRTelefono] = useState('+569');
    const [rEmail, setREmail] = useState('');
    const [rPassword, setRPassword] = useState('');
    const [rConfirmPassword, setRConfirmPassword] = useState('');
    const [errores, setErrores] = useState({});

    const [recEmail, setRecEmail] = useState('');

    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const resetFields = () => {
        setEmail(''); setPassword('');
        setRNombres(''); setRApellidos(''); setRRut('');
        setRTelefono('+569'); setREmail(''); setRPassword('');
        setRConfirmPassword(''); setRecEmail('');
        setError(''); setSuccess(''); setErrores({});
    };

    const handleTabChange = (tab) => { setActiveTab(tab); resetFields(); };

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const data = await loginService(email, password);
            login(data);
            navigate('/dashboard');
        } catch (err) {
            if (err?.response?.status === 403) {
                setError('Tu cuenta está pendiente de activación. Contacta a un administrador.');
            } else {
                setError('Correo o contraseña incorrectos');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setError('');
        const errs = validarFormUsuario({
            nombres: rNombres, apellidos: rApellidos,
            rut: rRut, telefono: rTelefono,
            email: rEmail, password: rPassword,
            confirmPassword: rConfirmPassword,
        }, 'crear');
        if (Object.keys(errs).length > 0) { setErrores(errs); return; }
        setErrores({});
        setLoading(true);
        try {
            await register({
                email: rEmail,
                password: rPassword,
                nombreCompleto: `${rNombres.trim()} ${rApellidos.trim()}`,
                rut: rRut,
                telefono: rTelefono,
            });
            setSuccess('Solicitud enviada. Un administrador aprobará tu acceso.');
            setRNombres('');
            setRApellidos('');
            setRRut('');
            setRTelefono('+569');
            setREmail('');
            setRPassword('');
            setRConfirmPassword('');
        } catch (err) {
            const msg = err?.response?.data?.message || 'Error al registrar usuario';
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    const handleRecover = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try { await requestPasswordReset(recEmail); } catch { /* intencional */ }
        finally {
            setSuccess('Si el correo existe, recibirás un enlace de recuperación.');
            setLoading(false);
        }
    };

    const tabs = [
        { key: 'signin', label: 'Iniciar sesión' },
        { key: 'register', label: 'Registro' },
        { key: 'recover', label: 'Recuperar clave' },
    ];

    const inputClass = 'w-full bg-bg border border-white/8 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-green/45 transition-colors select-text cursor-text';
    const inputErr = 'w-full bg-bg border border-observed/50 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-observed/80 transition-colors select-text cursor-text';
    const labelClass = 'block text-xs font-medium text-muted uppercase tracking-wide mb-1';
    const errMsg = (campo) => errores[campo]
        ? <span className="text-[10px] text-observed mt-0.5 block">{errores[campo]}</span>
        : null;

    return (
        <div className="min-h-screen bg-bg flex items-center justify-center relative overflow-hidden select-none">
            <svg className="fixed inset-0 w-full h-full pointer-events-none z-0" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice">
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
                    <line key={`h${i}`} x1="0" y1={i * 100} x2="1440" y2={i * 100} stroke="white" strokeOpacity="0.025" strokeWidth="1" />
                ))}
                {Array.from({ length: 15 }).map((_, i) => (
                    <line key={`v${i}`} x1={i * 100} y1="0" x2={i * 100} y2="900" stroke="white" strokeOpacity="0.025" strokeWidth="1" />
                ))}
            </svg>

            <div className="relative z-10 w-[460px]">
                <div className="flex gap-0.5 bg-navy border border-white/8 border-b-0 rounded-t-2xl px-2 pt-2">
                    {tabs.map((tab) => (
                        <button key={tab.key} onClick={() => handleTabChange(tab.key)}
                            className={`flex-1 py-2 px-2 rounded-t-lg text-xs font-medium cursor-pointer border-b-2 transition-all
                                ${activeTab === tab.key ? 'bg-green/10 text-green border-green' : 'bg-transparent text-muted border-transparent hover:text-white/80'}`}>
                            {tab.label}
                        </button>
                    ))}
                </div>

                <div className="bg-navy border border-white/8 rounded-b-2xl px-8 py-7">

                    {/* SIGNIN */}
                    {activeTab === 'signin' && (
                        <>
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-9 h-9 bg-green rounded-lg flex items-center justify-center shrink-0">
                                    <svg viewBox="0 0 24 24" width="20" height="20" fill="#1a2332">
                                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                        <polyline points="14 2 14 8 20 8" stroke="#1a2332" strokeWidth="2" fill="none" />
                                        <line x1="8" y1="13" x2="16" y2="13" stroke="#1a2332" strokeWidth="1.5" />
                                        <line x1="8" y1="17" x2="13" y2="17" stroke="#1a2332" strokeWidth="1.5" />
                                    </svg>
                                </div>
                                <div>
                                    <div className="text-xl font-semibold text-white tracking-tight">MyPlans</div>
                                    <div className="text-xs text-muted">Plataforma de Precomisionamiento Eléctrico</div>
                                </div>
                            </div>
                            <form onSubmit={handleLogin}>
                                <div className="mb-3">
                                    <label className={labelClass}>Correo electrónico</label>
                                    <input className={inputClass} type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="usuario@myplans.cl" required />
                                </div>
                                <div className="mb-4">
                                    <label className={labelClass}>Contraseña</label>
                                    <input className={inputClass} type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required />
                                </div>
                                {error && <div className="bg-observed/10 border border-observed/25 rounded-lg px-3 py-2.5 text-observed text-xs mb-3">{error}</div>}
                                <button className="w-full bg-green text-navy font-semibold text-sm py-2.5 rounded-lg hover:bg-green-dim transition-colors cursor-pointer" type="submit" disabled={loading}>
                                    {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
                                </button>
                            </form>
                        </>
                    )}

                    {/* REGISTER */}
                    {activeTab === 'register' && (
                        <form onSubmit={handleRegister}>
                            <div className="text-sm font-medium text-white mb-4">Solicitud de acceso</div>
                            <div className="grid grid-cols-2 gap-x-3 gap-y-2 mb-2">
                                <div>
                                    <label className={labelClass}>Nombres <span className="text-observed">*</span></label>
                                    <input className={errores.nombres ? inputErr : inputClass} value={rNombres}
                                        onChange={(e) => setRNombres(e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]/g, ''))}
                                        placeholder="Ej: Paulina" required />
                                    {errMsg('nombres')}
                                </div>
                                <div>
                                    <label className={labelClass}>Apellidos <span className="text-observed">*</span></label>
                                    <input className={errores.apellidos ? inputErr : inputClass} value={rApellidos}
                                        onChange={(e) => setRApellidos(e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]/g, ''))}
                                        placeholder="Ej: Campusano" required />
                                    {errMsg('apellidos')}
                                </div>
                                <div>
                                    <label className={labelClass}>RUT <span className="text-observed">*</span></label>
                                    <input className={errores.rut ? inputErr : inputClass} value={rRut}
                                        onChange={(e) => setRRut(formatearRut(e.target.value))}
                                        placeholder="18165530-5" maxLength={10} required />
                                    {errMsg('rut')}
                                </div>
                                <div>
                                    <label className={labelClass}>Teléfono <span className="text-observed">*</span></label>
                                    <input className={errores.telefono ? inputErr : inputClass} value={rTelefono}
                                        onChange={(e) => setRTelefono(formatearTelefono(e.target.value))}
                                        placeholder="+569 1234 5678" maxLength={12} required />
                                    {errMsg('telefono')}
                                </div>
                                <div className="col-span-2">
                                    <label className={labelClass}>Correo <span className="text-observed">*</span></label>
                                    <input className={errores.email ? inputErr : inputClass} type="email" value={rEmail}
                                        onChange={(e) => setREmail(e.target.value)}
                                        placeholder="usuario@empresa.cl" required />
                                    {errMsg('email')}
                                </div>
                                <div>
                                    <label className={labelClass}>Contraseña <span className="text-observed">*</span></label>
                                    <input className={errores.password ? inputErr : inputClass} type="password" value={rPassword}
                                        onChange={(e) => setRPassword(e.target.value)}
                                        placeholder="Mín. 8 caracteres" required />
                                    {errMsg('password')}
                                </div>
                                <div>
                                    <label className={labelClass}>Confirmar contraseña <span className="text-observed">*</span></label>
                                    <input className={errores.confirmPassword ? inputErr : inputClass} type="password" value={rConfirmPassword}
                                        onChange={(e) => setRConfirmPassword(e.target.value)}
                                        placeholder="Repite la contraseña" required />
                                    {errMsg('confirmPassword')}
                                </div>
                            </div>
                            {error && <div className="bg-observed/10 border border-observed/25 rounded-lg px-3 py-2.5 text-observed text-xs mb-3">{error}</div>}
                            {success && <div className="bg-green/10 border border-green/25 rounded-lg px-3 py-2.5 text-green text-xs mb-3">{success}</div>}
                            <button className="w-full bg-green text-navy font-semibold text-sm py-2.5 rounded-lg hover:bg-green-dim transition-colors cursor-pointer mt-1" type="submit" disabled={loading}>
                                {loading ? 'Enviando...' : 'Enviar solicitud'}
                            </button>
                            <div className="text-xs text-muted text-center mt-2.5">Un administrador aprobará tu acceso.</div>
                        </form>
                    )}

                    {/* RECOVER */}
                    {activeTab === 'recover' && (
                        <form onSubmit={handleRecover}>
                            <div className="text-sm font-medium text-white mb-0.5">Recuperar contraseña</div>
                            <div className="text-xs text-muted mb-4">Ingresa tu correo y te enviaremos un enlace de recuperación.</div>
                            <div className="mb-4">
                                <label className={labelClass}>Correo electrónico <span className="text-observed">*</span></label>
                                <input className={inputClass} type="email" value={recEmail} onChange={(e) => setRecEmail(e.target.value)} placeholder="usuario@empresa.cl" required />
                            </div>
                            {error && <div className="bg-observed/10 border border-observed/25 rounded-lg px-3 py-2.5 text-observed text-xs mb-3">{error}</div>}
                            {success && <div className="bg-green/10 border border-green/25 rounded-lg px-3 py-2.5 text-green text-xs mb-3">{success}</div>}
                            <button className="w-full bg-green text-navy font-semibold text-sm py-2.5 rounded-lg hover:bg-green-dim transition-colors cursor-pointer" type="submit" disabled={loading}>
                                {loading ? 'Enviando...' : 'Enviar enlace'}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Login;