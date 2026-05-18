/**
 * validaciones.js
 * Lógica de validación centralizada para campos de usuario.
 * Usada en: Login (registro), GestionUsuarios (crear y editar).
 */

/* ─── Nombres / Apellidos ─── */
export const validarNombre = (valor) => {
    if (!valor || !valor.trim()) return 'Este campo es obligatorio';
    if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/.test(valor.trim()))
        return 'Solo se permiten letras';
    return null;
};

/* ─── RUT ─── */
export const validarRut = (valor) => {
    if (!valor || !valor.trim()) return 'El RUT es obligatorio';
    const limpio = valor.trim().replace(/\./g, '');
    if (!/^\d{7,8}-[\dKk]$/.test(limpio))
        return 'Formato inválido. Ej: 18165530-5 o 7654321-K';
    return null;
};

/* ─── Formatear RUT al escribir ─── */
export const formatearRut = (valor) => {
    let v = valor.replace(/[^0-9kK\-]/g, '');
    const partes = v.split('-');
    if (partes.length > 2) v = partes[0] + '-' + partes.slice(1).join('');
    if (partes.length === 2) {
        v = partes[0].substring(0, 8) + '-' + partes[1].substring(0, 1).toUpperCase();
    } else {
        v = partes[0].substring(0, 8);
    }
    return v;
};

/* ─── Teléfono ─── */
export const validarTelefono = (valor) => {
    if (!valor || valor === '+569') return 'El teléfono es obligatorio';
    const limpio = valor.replace(/\s/g, '');
    if (!/^\+569\d{8}$/.test(limpio))
        return 'Formato inválido. Ej: +569 1234 5678';
    return null;
};

/* ─── Formatear teléfono al escribir ─── */
export const formatearTelefono = (valor) => {
    if (!valor.startsWith('+569')) return '+569';
    const resto = valor.slice(4).replace(/[^\d]/g, '').substring(0, 8);
    return '+569' + resto;
};

/* ─── Contraseña ─── */
export const validarPassword = (valor, obligatoria = true) => {
    if (!valor || !valor.trim()) {
        if (obligatoria) return 'La contraseña es obligatoria';
        return null;
    }
    if (valor.length < 8) return 'Mínimo 8 caracteres';
    if (!/[a-z]/.test(valor)) return 'Debe contener al menos una letra minúscula';
    if (!/[A-Z]/.test(valor)) return 'Debe contener al menos una letra mayúscula';
    if (!/[0-9]/.test(valor)) return 'Debe contener al menos un número';
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(valor)) return 'Debe contener al menos un carácter especial (!@#$%^&* etc.)';
    return null;
};

/* ─── Correo ─── */
export const validarEmail = (valor) => {
    if (!valor || !valor.trim()) return 'El correo es obligatorio';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor.trim()))
        return 'Formato de correo inválido';
    return null;
};

/* ─── Validar formulario completo ─── */
export const validarFormUsuario = (datos, mode = 'crear') => {
    const errores = {};

    const eNombres = validarNombre(datos.nombres);
    if (eNombres) errores.nombres = eNombres;

    const eApellidos = validarNombre(datos.apellidos);
    if (eApellidos) errores.apellidos = eApellidos;

    // RUT obligatorio solo al crear
    if (mode === 'crear') {
        const eRut = validarRut(datos.rut);
        if (eRut) errores.rut = eRut;
    } else {
        // En editar solo valida formato si viene con valor
        if (datos.rut) {
            const eRut = validarRut(datos.rut);
            if (eRut) errores.rut = eRut;
        }
    }

    const eTelefono = validarTelefono(datos.telefono);
    if (eTelefono) errores.telefono = eTelefono;

    const eEmail = validarEmail(datos.email);
    if (eEmail) errores.email = eEmail;

    const ePassword = validarPassword(datos.password, mode === 'crear');
    if (ePassword) errores.password = ePassword;

    if (mode === 'crear' && datos.password && datos.confirmPassword !== undefined) {
        if (datos.password !== datos.confirmPassword)
            errores.confirmPassword = 'Las contraseñas no coinciden';
    }

    return errores;
};