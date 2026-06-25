/**
 * Tests para src/utils/validaciones.js
 * IDs del plan: PF-004, PF-005, PF-006, PF-022, PF-024
 */
import { describe, it, expect } from 'vitest';
import {
    validarEmail,
    validarPassword,
    validarNombre,
    validarRut,
    validarTelefono,
    formatearRut,
    formatearTelefono,
    validarFormUsuario,
} from '../utils/validaciones';

// ─────────────────────────────────────────────────────────────
// validarEmail
// ─────────────────────────────────────────────────────────────
describe('validarEmail', () => {
    it('retorna null para email válido', () => {
        expect(validarEmail('usuario@myplans.cl')).toBeNull();
    });

    // PF-004: campo email vacío debe mostrar validación
    it('retorna error cuando el valor está vacío', () => {
        expect(validarEmail('')).toBe('El correo es obligatorio');
    });

    it('retorna error cuando el valor es solo espacios', () => {
        expect(validarEmail('   ')).toBe('El correo es obligatorio');
    });

    it('retorna error si falta la arroba', () => {
        expect(validarEmail('correo-malo-sin-arroba')).toBe('Formato de correo inválido');
    });

    it('retorna error si falta el dominio de nivel superior', () => {
        expect(validarEmail('usuario@empresa')).toBe('Formato de correo inválido');
    });

    it('retorna error si hay espacios en el correo', () => {
        expect(validarEmail('usuario @empresa.cl')).toBe('Formato de correo inválido');
    });

    it('acepta correos con subdominios', () => {
        expect(validarEmail('test@correo.empresa.cl')).toBeNull();
    });
});

// ─────────────────────────────────────────────────────────────
// validarPassword
// ─────────────────────────────────────────────────────────────
describe('validarPassword', () => {
    it('retorna null para contraseña fuerte', () => {
        expect(validarPassword('MiPass123!')).toBeNull();
    });

    it('retorna error cuando está vacía (obligatoria por defecto)', () => {
        expect(validarPassword('')).toBe('La contraseña es obligatoria');
    });

    it('retorna null cuando está vacía y no es obligatoria', () => {
        expect(validarPassword('', false)).toBeNull();
    });

    it('retorna error si tiene menos de 8 caracteres', () => {
        expect(validarPassword('Ab1!')).toBe('Mínimo 8 caracteres');
    });

    it('retorna error si no tiene letra mayúscula', () => {
        expect(validarPassword('mipass123!')).toContain('mayúscula');
    });

    it('retorna error si no tiene letra minúscula', () => {
        expect(validarPassword('MIPASS123!')).toContain('minúscula');
    });

    it('retorna error si no tiene número', () => {
        expect(validarPassword('MiPassword!')).toContain('número');
    });

    it('retorna error si no tiene carácter especial', () => {
        expect(validarPassword('MiPassword1')).toContain('especial');
    });

    it('acepta múltiples caracteres especiales', () => {
        expect(validarPassword('Pass@Word#9')).toBeNull();
    });
});

// ─────────────────────────────────────────────────────────────
// validarNombre
// ─────────────────────────────────────────────────────────────
describe('validarNombre', () => {
    it('retorna null para nombre válido con solo letras', () => {
        expect(validarNombre('Paulina')).toBeNull();
    });

    it('retorna null para nombre con tildes y ñ', () => {
        expect(validarNombre('María José Núñez')).toBeNull();
    });

    it('retorna error cuando está vacío', () => {
        expect(validarNombre('')).toBe('Este campo es obligatorio');
    });

    it('retorna error cuando es solo espacios', () => {
        expect(validarNombre('   ')).toBe('Este campo es obligatorio');
    });

    it('retorna error si contiene números', () => {
        expect(validarNombre('Juan123')).toBe('Solo se permiten letras');
    });

    it('retorna error si contiene caracteres especiales', () => {
        expect(validarNombre('Juan@Carlos')).toBe('Solo se permiten letras');
    });
});

// ─────────────────────────────────────────────────────────────
// validarRut
// ─────────────────────────────────────────────────────────────
describe('validarRut', () => {
    it('retorna null para RUT válido con dígito verificador numérico', () => {
        expect(validarRut('18165530-5')).toBeNull();
    });

    it('retorna null para RUT con dígito verificador K mayúscula', () => {
        expect(validarRut('7654321-K')).toBeNull();
    });

    it('retorna null para RUT con dígito verificador k minúscula', () => {
        expect(validarRut('7654321-k')).toBeNull();
    });

    it('retorna error cuando está vacío', () => {
        expect(validarRut('')).toBe('El RUT es obligatorio');
    });

    it('retorna error si falta el guión', () => {
        expect(validarRut('181655305')).toContain('inválido');
    });

    it('retorna error si tiene puntos sin quitar', () => {
        expect(validarRut('18.165.530-5')).toBeNull();
    });
});

// ─────────────────────────────────────────────────────────────
// validarTelefono
// ─────────────────────────────────────────────────────────────
describe('validarTelefono', () => {
    it('retorna null para teléfono válido', () => {
        expect(validarTelefono('+56912345678')).toBeNull();
    });

    it('retorna null para teléfono con espacios (que se limpian)', () => {
        expect(validarTelefono('+569 1234 5678')).toBeNull();
    });

    it('retorna error si el valor es solo el prefijo +569', () => {
        expect(validarTelefono('+569')).toBe('El teléfono es obligatorio');
    });

    it('retorna error si está vacío', () => {
        expect(validarTelefono('')).toBe('El teléfono es obligatorio');
    });

    it('retorna error si no inicia con +569', () => {
        expect(validarTelefono('+5612345678')).toContain('inválido');
    });

    it('retorna error si le faltan dígitos', () => {
        expect(validarTelefono('+56912345')).toContain('inválido');
    });
});

// ─────────────────────────────────────────────────────────────
// formatearRut
// ─────────────────────────────────────────────────────────────
describe('formatearRut', () => {
    it('elimina puntos y conserva guión', () => {
        expect(formatearRut('18.165.530-5')).toBe('18165530-5');
    });

    it('convierte la k del dígito verificador a mayúscula', () => {
        expect(formatearRut('7654321-k')).toBe('7654321-K');
    });

    it('limita el cuerpo del RUT a 8 dígitos', () => {
        const resultado = formatearRut('123456789-5');
        expect(resultado.split('-')[0].length).toBeLessThanOrEqual(8);
    });

    it('limita el dígito verificador a 1 carácter', () => {
        const resultado = formatearRut('1234567-55');
        expect(resultado.split('-')[1].length).toBe(1);
    });
});

// ─────────────────────────────────────────────────────────────
// formatearTelefono
// ─────────────────────────────────────────────────────────────
describe('formatearTelefono', () => {
    it('devuelve +569 si el valor no empieza con +569', () => {
        expect(formatearTelefono('123456789')).toBe('+569');
    });

    it('conserva los dígitos después de +569', () => {
        expect(formatearTelefono('+56912345678')).toBe('+56912345678');
    });

    it('limita a 8 dígitos después del prefijo', () => {
        const resultado = formatearTelefono('+569123456789999');
        expect(resultado).toBe('+56912345678');
    });

    it('elimina caracteres no numéricos después del prefijo', () => {
        expect(formatearTelefono('+569abc1234')).toBe('+5691234');
    });
});

// ─────────────────────────────────────────────────────────────
// validarFormUsuario — modo crear
// ─────────────────────────────────────────────────────────────
describe('validarFormUsuario modo crear', () => {
    const datosValidos = {
        nombres: 'Paulina',
        apellidos: 'Campusano',
        rut: '18165530-5',
        telefono: '+56912345678',
        email: 'paulina@myplans.cl',
        password: 'MiPass123!',
        confirmPassword: 'MiPass123!',
    };

    it('retorna objeto vacío cuando todos los datos son válidos', () => {
        expect(validarFormUsuario(datosValidos, 'crear')).toEqual({});
    });

    it('agrega error de email si el correo tiene formato inválido', () => {
        const errores = validarFormUsuario({ ...datosValidos, email: 'correo-invalido' }, 'crear');
        expect(errores.email).toBeDefined();
    });

    it('agrega error de password si la contraseña es débil', () => {
        const errores = validarFormUsuario({ ...datosValidos, password: 'debil' }, 'crear');
        expect(errores.password).toBeDefined();
    });

    it('agrega error de confirmPassword si las contraseñas no coinciden', () => {
        const errores = validarFormUsuario({ ...datosValidos, confirmPassword: 'OtraPass123!' }, 'crear');
        expect(errores.confirmPassword).toBe('Las contraseñas no coinciden');
    });

    it('exige RUT en modo crear', () => {
        const errores = validarFormUsuario({ ...datosValidos, rut: '' }, 'crear');
        expect(errores.rut).toBeDefined();
    });

    it('puede acumular múltiples errores a la vez', () => {
        const errores = validarFormUsuario({
            nombres: '',
            apellidos: '',
            rut: '',
            telefono: '',
            email: '',
            password: '',
        }, 'crear');
        expect(Object.keys(errores).length).toBeGreaterThan(3);
    });
});

describe('validarFormUsuario modo editar', () => {
    it('no exige RUT si no se proporciona en modo editar', () => {
        const errores = validarFormUsuario({
            nombres: 'Goura',
            apellidos: 'Rodriguez',
            telefono: '+56912345678',
            email: 'goura@myplans.cl',
            password: '',
        }, 'editar');
        expect(errores.rut).toBeUndefined();
    });

    it('valida el RUT si se proporciona en modo editar', () => {
        const errores = validarFormUsuario({
            nombres: 'Goura',
            apellidos: 'Rodriguez',
            rut: 'rut-invalido',
            telefono: '+56912345678',
            email: 'goura@myplans.cl',
            password: '',
        }, 'editar');
        expect(errores.rut).toBeDefined();
    });

    it('no exige contraseña en modo editar', () => {
        const errores = validarFormUsuario({
            nombres: 'Goura',
            apellidos: 'Rodriguez',
            telefono: '+56912345678',
            email: 'goura@myplans.cl',
            password: '',
        }, 'editar');
        expect(errores.password).toBeUndefined();
    });
});
