import { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { resetPassword } from '../../services/auth';

const ResetPassword = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get('token');

    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const inputClass = "w-full bg-bg border border-white/8 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-green/45 transition-colors";
    const labelClass = "block text-xs font-medium text-muted uppercase tracking-wide mb-1.5";

    if (!token) {
        return (
            <div className="min-h-screen bg-bg flex items-center justify-center">
                <div className="bg-navy border border-white/8 rounded-2xl px-8 py-7 w-[420px] text-center">
                    <div className="text-observed text-3xl mb-3">⚠</div>
                    <div className="text-white font-semibold mb-2">Enlace inválido</div>
                    <div className="text-muted text-xs mb-5">Este enlace de recuperación no es válido o ya fue utilizado.</div>
                    <button onClick={() => navigate('/login')} className="bg-green text-navy font-semibold text-sm px-5 py-2 rounded-lg hover:bg-green-dim transition-colors cursor-pointer">
                        Volver al inicio
                    </button>
                </div>
            </div>
        );
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (newPassword.length < 8) { setError('La contraseña debe tener al menos 8 caracteres.'); return; }
        if (newPassword !== confirmPassword) { setError('Las contraseñas no coinciden.'); return; }
        setLoading(true);
        try {
            await resetPassword(token, newPassword);
            setSuccess(true);
        } catch (err) {
            const status = err.response?.status;
            const msg = err.response?.data?.error || err.response?.data?.message || '';
            const isTokenError = msg.toLowerCase().includes('expirado') || msg.toLowerCase().includes('inválido') || msg.toLowerCase().includes('no encontrado');
            if ((status === 400 || status === 410) && isTokenError) {
                setError('El enlace ha expirado o ya fue utilizado. Solicita uno nuevo.');
            } else {
                setError(msg || 'Error al cambiar la contraseña. Intenta nuevamente.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-bg flex items-center justify-center relative overflow-hidden">
            <svg className="fixed inset-0 w-full h-full pointer-events-none z-0" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice">
                <defs>
                    <radialGradient id="g1" cx="15%" cy="85%">
                        <stop offset="0%" stopColor="#2ecc71" stopOpacity="0.12" />
                        <stop offset="60%" stopColor="#0f1922" stopOpacity="0" />
                    </radialGradient>
                </defs>
                <rect width="1440" height="900" fill="#0f1922" />
                <rect width="1440" height="900" fill="url(#g1)" />
                {Array.from({ length: 10 }).map((_, i) => (
                    <line key={`h${i}`} x1="0" y1={i * 100} x2="1440" y2={i * 100} stroke="white" strokeOpacity="0.025" strokeWidth="1" />
                ))}
                {Array.from({ length: 15 }).map((_, i) => (
                    <line key={`v${i}`} x1={i * 100} y1="0" x2={i * 100} y2="900" stroke="white" strokeOpacity="0.025" strokeWidth="1" />
                ))}
            </svg>

            <div className="relative z-10 w-[420px]">
                <div className="bg-navy border border-white/8 rounded-2xl px-8 py-7">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-9 h-9 bg-green rounded-lg flex items-center justify-center shrink-0">
                            <svg viewBox="0 0 24 24" width="20" height="20" fill="#1a2332">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                            </svg>
                        </div>
                        <div>
                            <div className="text-xl font-semibold text-white tracking-tight">MyPlans</div>
                            <div className="text-xs text-muted">Establecer nueva contraseña</div>
                        </div>
                    </div>

                    {success ? (
                        <div className="text-center">
                            <div className="text-green text-3xl mb-3">✓</div>
                            <div className="text-white font-semibold mb-2">Contraseña actualizada</div>
                            <div className="text-muted text-xs mb-5">Tu contraseña fue cambiada correctamente. Ya puedes iniciar sesión.</div>
                            <button onClick={() => navigate('/login')} className="w-full bg-green text-navy font-semibold text-sm py-2.5 rounded-lg hover:bg-green-dim transition-colors cursor-pointer">
                                Ir al inicio de sesión
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit}>
                            <div className="mb-3">
                                <label className={labelClass}>Nueva contraseña</label>
                                <input className={inputClass} type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Mín. 8 caracteres" required />
                                <div className="mt-1.5 grid grid-cols-2 gap-x-3 gap-y-0.5">
                                    {[
                                        { ok: newPassword.length >= 8,        label: '8 caracteres mínimo' },
                                        { ok: /[A-Z]/.test(newPassword),       label: 'Una mayúscula' },
                                        { ok: /[a-z]/.test(newPassword),       label: 'Una minúscula' },
                                        { ok: /\d/.test(newPassword),          label: 'Un número' },
                                        { ok: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(newPassword), label: 'Un carácter especial' },
                                    ].map(({ ok, label }) => (
                                        <div key={label} className={`text-[10px] flex items-center gap-1 ${ok ? 'text-green' : 'text-muted'}`}>
                                            <span>{ok ? '✓' : '○'}</span>{label}
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="mb-4">
                                <label className={labelClass}>Confirmar contraseña</label>
                                <input className={inputClass} type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Repite la contraseña" required />
                            </div>
                            {error && (
                                <div className="bg-observed/10 border border-observed/25 rounded-lg px-3 py-2.5 text-observed text-xs mb-3">{error}</div>
                            )}
                            <button className="w-full bg-green text-navy font-semibold text-sm py-2.5 rounded-lg hover:bg-green-dim transition-colors cursor-pointer disabled:opacity-60" type="submit" disabled={loading}>
                                {loading ? 'Guardando...' : 'Guardar nueva contraseña'}
                            </button>
                            <button type="button" onClick={() => navigate('/login')} className="w-full mt-2 bg-transparent text-muted text-xs py-2 rounded-lg hover:text-white transition-colors cursor-pointer">
                                Volver al inicio
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;