import { useState, useEffect } from 'react';
import { getMe, updateMe, changeMyPassword } from '../../services/auth';
import { formatearTelefono, validarTelefono, validarPassword } from '../../utils/validaciones';

const Profile = () => {
    const rolFromStorage = localStorage.getItem('rol') || '';
    const rolLabel = rolFromStorage === 'ROLE_ADMIN' ? 'Administrador' : rolFromStorage === 'ROLE_AUDITOR' ? 'Supervisor' : 'Operador';

    const [nombreCompleto, setNombreCompleto] = useState('');
    const [nombres, setNombres] = useState('');
    const [apellidos, setApellidos] = useState('');
    const [rut, setRut] = useState('');
    const [telefono, setTelefono] = useState('');
    const [email, setEmail] = useState('');
    const [initials, setInitials] = useState('');

    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const [loadingDatos, setLoadingDatos] = useState(false);
    const [loadingPassword, setLoadingPassword] = useState(false);
    const [successDatos, setSuccessDatos] = useState('');
    const [errorDatos, setErrorDatos] = useState('');
    const [successPassword, setSuccessPassword] = useState('');
    const [errorPassword, setErrorPassword] = useState('');

    const flash = (type, msg, target) => {
        if (target === 'datos') {
            if (type === 'ok') { setSuccessDatos(msg); setTimeout(() => setSuccessDatos(''), 3500); }
            else { setErrorDatos(msg); setTimeout(() => setErrorDatos(''), 3500); }
        } else {
            if (type === 'ok') { setSuccessPassword(msg); setTimeout(() => setSuccessPassword(''), 3500); }
            else { setErrorPassword(msg); setTimeout(() => setErrorPassword(''), 3500); }
        }
    };

    useEffect(() => {
        const cargar = async () => {
            try {
                const data = await getMe();
                const partes = (data.nombreCompleto || '').split(' ');
                setNombreCompleto(data.nombreCompleto || '');
                setNombres(partes[0] || '');
                setApellidos(partes.slice(1).join(' ') || '');
                setRut(data.rut || '');
                setTelefono(data.telefono || '+569');
                setEmail(data.email || '');
                setInitials((data.nombreCompleto || data.email).substring(0, 2).toUpperCase());
            } catch {
                // fallback a localStorage si el endpoint falla
                const nc = localStorage.getItem('nombreCompleto') || '';
                const em = localStorage.getItem('email') || '';
                const partes = nc.split(' ');
                setNombreCompleto(nc);
                setNombres(partes[0] || '');
                setApellidos(partes.slice(1).join(' ') || '');
                setEmail(em);
                setInitials((nc || em).substring(0, 2).toUpperCase());
                setTelefono('+569');
            }
        };
        cargar();
    }, []);

    const handleGuardarDatos = async (e) => {
        e.preventDefault();

        const eTelefono = validarTelefono(telefono);
        if (eTelefono) { flash('err', eTelefono, 'datos'); return; }

        setLoadingDatos(true);
        try {
            const nc = [nombres, apellidos].filter(Boolean).join(' ');
            await updateMe({
                nombreCompleto: nc || undefined,
                telefono: telefono !== '+569' ? telefono : undefined,
            });
            setNombreCompleto(nc);
            setInitials(nc.substring(0, 2).toUpperCase());
            localStorage.setItem('nombreCompleto', nc);
            window.dispatchEvent(new Event('nombreActualizado'));
            flash('ok', 'Datos actualizados correctamente', 'datos');
        } catch (err) {
            flash('err', err?.response?.data?.message || 'Error al actualizar datos', 'datos');
        } finally {
            setLoadingDatos(false);
        }
    };

    const handleCambiarPassword = async (e) => {
        e.preventDefault();

        const ePassword = validarPassword(newPassword, true);
        if (ePassword) { flash('err', ePassword, 'password'); return; }
        if (newPassword !== confirmPassword) { flash('err', 'Las contraseñas no coinciden', 'password'); return; }
        if (!currentPassword) { flash('err', 'Ingresa tu contraseña actual', 'password'); return; }

        setLoadingPassword(true);
        try {
            await changeMyPassword(currentPassword, newPassword);
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
            flash('ok', 'Contraseña actualizada correctamente', 'password');
        } catch (err) {
            flash('err', err?.response?.data?.message || 'Error al cambiar contraseña', 'password');
        } finally {
            setLoadingPassword(false);
        }
    };

    const inputClass = 'w-full bg-bg border border-white/8 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-green/45 transition-colors';
    const lockedClass = 'w-full bg-bg border border-white/8 rounded-lg px-3 py-2 text-white/40 text-sm outline-none cursor-not-allowed';
    const labelClass = 'block text-[11px] font-medium text-muted uppercase tracking-wide mb-1.5';

    return (
        <div className="p-6 max-w-[600px] select-none">

            {/* HEADER */}
            <div className="flex items-center gap-4 mb-6 pb-5 border-b border-white/8">
                <div className="w-14 h-14 rounded-full bg-navy-mid border-[1.5px] border-green flex items-center justify-center text-lg font-semibold text-green shrink-0">
                    {initials}
                </div>
                <div>
                    <div className="text-lg font-semibold text-white mb-1">{nombreCompleto}</div>
                    <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full ${rolFromStorage === 'ROLE_ADMIN' ? 'bg-white/8 text-white/80' :
                        rolFromStorage === 'ROLE_AUDITOR' ? 'bg-validated/15 text-validated' :
                            'bg-pending/15 text-pending'
                        }`}>
                        {rolLabel}
                    </span>
                </div>
            </div>

            {/* INFORMACIÓN PERSONAL */}
            <form onSubmit={handleGuardarDatos}>
                <div className="bg-navy border border-white/8 rounded-xl p-5 mb-3.5">
                    <div className="text-[11px] font-semibold text-muted uppercase tracking-wide mb-3.5 pb-2.5 border-b border-white/6">
                        Información personal
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className={labelClass}>Nombres</label>
                            <input className={inputClass} value={nombres}
                                onChange={(e) => setNombres(e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]/g, ''))}
                                placeholder="Ej: Paulina" />
                        </div>
                        <div>
                            <label className={labelClass}>Apellidos</label>
                            <input className={inputClass} value={apellidos}
                                onChange={(e) => setApellidos(e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]/g, ''))}
                                placeholder="Ej: Campusano" />
                        </div>
                        <div>
                            <label className={labelClass}>RUT</label>
                            <input className={lockedClass} value={rut || '—'} readOnly />
                        </div>
                        <div>
                            <label className={labelClass}>Correo</label>
                            <input className={lockedClass} value={email} readOnly />
                        </div>
                        <div>
                            <label className={labelClass}>Teléfono</label>
                            <input className={inputClass} value={telefono}
                                onChange={(e) => setTelefono(formatearTelefono(e.target.value))}
                                placeholder="+569 1234 5678" maxLength={12} />
                        </div>
                    </div>
                </div>

                {errorDatos && <div className="bg-observed/10 border border-observed/25 rounded-lg px-3 py-2.5 text-observed text-xs mb-3">{errorDatos}</div>}
                {successDatos && <div className="bg-green/10 border border-green/25 rounded-lg px-3 py-2.5 text-green text-xs mb-3">{successDatos}</div>}

                <div className="flex justify-end mb-5">
                    <button type="submit" disabled={loadingDatos} className="bg-green text-navy font-semibold text-xs px-5 py-2 rounded-lg hover:bg-green-dim transition-colors cursor-pointer disabled:opacity-60">
                        {loadingDatos ? 'Guardando...' : 'Guardar datos'}
                    </button>
                </div>
            </form>

            {/* CAMBIAR CONTRASEÑA */}
            <form onSubmit={handleCambiarPassword}>
                <div className="bg-navy border border-white/8 rounded-xl p-5 mb-3.5">
                    <div className="text-[11px] font-semibold text-muted uppercase tracking-wide mb-3.5 pb-2.5 border-b border-white/6">
                        Cambiar contraseña
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="col-span-2">
                            <label className={labelClass}>Contraseña actual</label>
                            <input className={inputClass} type="password" value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                placeholder="••••••••" />
                        </div>
                        <div>
                            <label className={labelClass}>Nueva contraseña</label>
                            <input className={inputClass} type="password" value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder="Mín. 8 caracteres" />
                        </div>
                        <div>
                            <label className={labelClass}>Confirmar contraseña</label>
                            <input className={inputClass} type="password" value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Repite la contraseña" />
                        </div>
                    </div>
                </div>

                {errorPassword && <div className="bg-observed/10 border border-observed/25 rounded-lg px-3 py-2.5 text-observed text-xs mb-3">{errorPassword}</div>}
                {successPassword && <div className="bg-green/10 border border-green/25 rounded-lg px-3 py-2.5 text-green text-xs mb-3">{successPassword}</div>}

                <div className="flex justify-end pt-3.5 border-t border-white/8">
                    <button type="submit" disabled={loadingPassword} className="bg-green text-navy font-semibold text-xs px-5 py-2 rounded-lg hover:bg-green-dim transition-colors cursor-pointer disabled:opacity-60">
                        {loadingPassword ? 'Guardando...' : 'Cambiar contraseña'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default Profile;