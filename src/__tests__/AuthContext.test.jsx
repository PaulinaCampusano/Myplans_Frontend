/**
 * Tests para src/context/AuthContext.jsx
 * Cubre: login, logout, actualizarNombre, estado inicial desde localStorage
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { AuthProvider, useAuth } from '../context/AuthContext';

const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>;

beforeEach(() => {
    localStorage.clear();
});

afterEach(() => {
    localStorage.clear();
});

// ─────────────────────────────────────────────────────────────
// Estado inicial
// ─────────────────────────────────────────────────────────────
describe('AuthContext — estado inicial', () => {
    it('arranca con token null si localStorage está vacío', () => {
        const { result } = renderHook(() => useAuth(), { wrapper });
        expect(result.current.usuario.token).toBeNull();
        expect(result.current.usuario.rol).toBeNull();
    });

    it('arranca con los datos de localStorage si ya existían', () => {
        localStorage.setItem('token', 'token_existente');
        localStorage.setItem('rol', 'ROLE_ADMIN');
        localStorage.setItem('nombreCompleto', 'Goura Rodriguez');
        localStorage.setItem('email', 'goura@myplans.cl');

        const { result } = renderHook(() => useAuth(), { wrapper });

        expect(result.current.usuario.token).toBe('token_existente');
        expect(result.current.usuario.rol).toBe('ROLE_ADMIN');
        expect(result.current.usuario.nombreCompleto).toBe('Goura Rodriguez');
        expect(result.current.usuario.email).toBe('goura@myplans.cl');
    });
});

// ─────────────────────────────────────────────────────────────
// login
// ─────────────────────────────────────────────────────────────
describe('AuthContext — login', () => {
    const datosLogin = {
        token: 'jwt_token_test',
        rol: 'ROLE_ADMIN',
        nombreCompleto: 'Goura Rodriguez',
        email: 'goura@myplans.cl',
        permisos: ['READ', 'WRITE'],
    };

    it('actualiza el estado con los datos del usuario', () => {
        const { result } = renderHook(() => useAuth(), { wrapper });

        act(() => {
            result.current.login(datosLogin);
        });

        expect(result.current.usuario.token).toBe('jwt_token_test');
        expect(result.current.usuario.rol).toBe('ROLE_ADMIN');
        expect(result.current.usuario.nombreCompleto).toBe('Goura Rodriguez');
        expect(result.current.usuario.email).toBe('goura@myplans.cl');
    });

    it('guarda el token en localStorage', () => {
        const { result } = renderHook(() => useAuth(), { wrapper });

        act(() => {
            result.current.login(datosLogin);
        });

        expect(localStorage.getItem('token')).toBe('jwt_token_test');
    });

    it('guarda el rol en localStorage', () => {
        const { result } = renderHook(() => useAuth(), { wrapper });

        act(() => {
            result.current.login(datosLogin);
        });

        expect(localStorage.getItem('rol')).toBe('ROLE_ADMIN');
    });

    it('guarda nombreCompleto y email en localStorage', () => {
        const { result } = renderHook(() => useAuth(), { wrapper });

        act(() => {
            result.current.login(datosLogin);
        });

        expect(localStorage.getItem('nombreCompleto')).toBe('Goura Rodriguez');
        expect(localStorage.getItem('email')).toBe('goura@myplans.cl');
    });

    it('guarda los permisos como JSON en localStorage', () => {
        const { result } = renderHook(() => useAuth(), { wrapper });

        act(() => {
            result.current.login(datosLogin);
        });

        expect(JSON.parse(localStorage.getItem('permisos'))).toEqual(['READ', 'WRITE']);
    });

    it('funciona sin permisos (campo opcional)', () => {
        const { result } = renderHook(() => useAuth(), { wrapper });

        act(() => {
            result.current.login({ ...datosLogin, permisos: undefined });
        });

        expect(result.current.usuario.token).toBe('jwt_token_test');
        expect(JSON.parse(localStorage.getItem('permisos'))).toEqual([]);
    });
});

// ─────────────────────────────────────────────────────────────
// logout
// ─────────────────────────────────────────────────────────────
describe('AuthContext — logout', () => {
    it('limpia el estado del usuario', () => {
        const { result } = renderHook(() => useAuth(), { wrapper });

        act(() => {
            result.current.login({
                token: 'jwt_test',
                rol: 'ROLE_USER',
                nombreCompleto: 'Test User',
                email: 'test@myplans.cl',
                permisos: [],
            });
        });

        act(() => {
            result.current.logout();
        });

        expect(result.current.usuario.token).toBeNull();
        expect(result.current.usuario.rol).toBeNull();
        expect(result.current.usuario.nombreCompleto).toBeNull();
        expect(result.current.usuario.email).toBeNull();
    });

    it('limpia todo el localStorage', () => {
        localStorage.setItem('token', 'jwt_test');
        localStorage.setItem('rol', 'ROLE_USER');
        localStorage.setItem('nombreCompleto', 'Test User');

        const { result } = renderHook(() => useAuth(), { wrapper });

        act(() => {
            result.current.logout();
        });

        expect(localStorage.getItem('token')).toBeNull();
        expect(localStorage.getItem('rol')).toBeNull();
        expect(localStorage.getItem('nombreCompleto')).toBeNull();
    });
});

// ─────────────────────────────────────────────────────────────
// actualizarNombre
// ─────────────────────────────────────────────────────────────
describe('AuthContext — actualizarNombre', () => {
    it('actualiza el nombre en el estado', () => {
        localStorage.setItem('token', 'jwt_test');
        localStorage.setItem('nombreCompleto', 'Nombre Viejo');

        const { result } = renderHook(() => useAuth(), { wrapper });

        act(() => {
            result.current.actualizarNombre('Nombre Nuevo');
        });

        expect(result.current.usuario.nombreCompleto).toBe('Nombre Nuevo');
    });

    it('persiste el nuevo nombre en localStorage', () => {
        const { result } = renderHook(() => useAuth(), { wrapper });

        act(() => {
            result.current.actualizarNombre('Nombre Nuevo');
        });

        expect(localStorage.getItem('nombreCompleto')).toBe('Nombre Nuevo');
    });

    it('dispara el evento nombreActualizado en window', () => {
        const { result } = renderHook(() => useAuth(), { wrapper });
        const dispatchSpy = vi.spyOn(window, 'dispatchEvent');

        act(() => {
            result.current.actualizarNombre('Nombre Nuevo');
        });

        expect(dispatchSpy).toHaveBeenCalledWith(
            expect.objectContaining({ type: 'nombreActualizado' })
        );

        dispatchSpy.mockRestore();
    });

    it('no modifica el token ni el rol al actualizar el nombre', () => {
        localStorage.setItem('token', 'jwt_test');
        localStorage.setItem('rol', 'ROLE_ADMIN');

        const { result } = renderHook(() => useAuth(), { wrapper });

        act(() => {
            result.current.actualizarNombre('Nuevo Nombre');
        });

        expect(result.current.usuario.token).toBe('jwt_test');
        expect(result.current.usuario.rol).toBe('ROLE_ADMIN');
    });
});
