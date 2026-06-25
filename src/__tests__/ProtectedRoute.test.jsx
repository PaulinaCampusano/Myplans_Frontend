/**
 * Tests para src/components/ProtectedRoute.jsx
 * IDs del plan: PS-005, PS-006, PS-007, PS-010, PS-011, PS-012
 */
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import ProtectedRoute from '../components/ProtectedRoute';

const LoginPage = () => <div data-testid="login-page">Login</div>;
const DashboardPage = () => <div data-testid="dashboard-page">Dashboard</div>;
const ContenidoProtegido = () => <div data-testid="protected-content">Contenido Protegido</div>;

/**
 * Renderiza ProtectedRoute dentro de un Router + AuthProvider.
 * @param {object} opts
 * @param {string|null} opts.token - token JWT a poner en localStorage (null = sin token)
 * @param {string|null} opts.rol   - rol a poner en localStorage
 * @param {string[]}    opts.rolesPermitidos - roles permitidos en la ruta
 * @param {string}      opts.ruta  - ruta inicial del MemoryRouter
 */
function renderProtectedRoute({
    token = 'jwt_valido',
    rol = 'ROLE_ADMIN',
    rolesPermitidos = null,
    ruta = '/protegida',
} = {}) {
    if (token) {
        localStorage.setItem('token', token);
        localStorage.setItem('rol', rol);
    }

    return render(
        <AuthProvider>
            <MemoryRouter initialEntries={[ruta]}>
                <Routes>
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/dashboard" element={<DashboardPage />} />
                    <Route
                        path="/protegida"
                        element={
                            <ProtectedRoute rolesPermitidos={rolesPermitidos}>
                                <ContenidoProtegido />
                            </ProtectedRoute>
                        }
                    />
                </Routes>
            </MemoryRouter>
        </AuthProvider>
    );
}

beforeEach(() => {
    localStorage.clear();
});

afterEach(() => {
    localStorage.clear();
});

// ─────────────────────────────────────────────────────────────
// PS-006: Sin token → redirige a /login
// ─────────────────────────────────────────────────────────────
describe('ProtectedRoute — sin autenticación', () => {
    it('PS-006: redirige a /login cuando no hay token', () => {
        renderProtectedRoute({ token: null, rol: null });

        expect(screen.getByTestId('login-page')).toBeInTheDocument();
        expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
    });

    it('redirige a /login cuando el token es string vacío', () => {
        localStorage.setItem('token', '');
        render(
            <AuthProvider>
                <MemoryRouter initialEntries={['/protegida']}>
                    <Routes>
                        <Route path="/login" element={<LoginPage />} />
                        <Route
                            path="/protegida"
                            element={
                                <ProtectedRoute>
                                    <ContenidoProtegido />
                                </ProtectedRoute>
                            }
                        />
                    </Routes>
                </MemoryRouter>
            </AuthProvider>
        );

        expect(screen.getByTestId('login-page')).toBeInTheDocument();
    });
});

// ─────────────────────────────────────────────────────────────
// PS-007, PS-012: Rol incorrecto → redirige a /dashboard
// ─────────────────────────────────────────────────────────────
describe('ProtectedRoute — RBAC por rol incorrecto', () => {
    it('PS-007: ROLE_USER en ruta de solo ROLE_ADMIN redirige a /dashboard', () => {
        renderProtectedRoute({ rol: 'ROLE_USER', rolesPermitidos: ['ROLE_ADMIN'] });

        expect(screen.getByTestId('dashboard-page')).toBeInTheDocument();
        expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
    });

    it('PS-012: ROLE_USER en /gestion-usuarios (ROLE_ADMIN) redirige a /dashboard', () => {
        renderProtectedRoute({ rol: 'ROLE_USER', rolesPermitidos: ['ROLE_ADMIN'] });

        expect(screen.getByTestId('dashboard-page')).toBeInTheDocument();
    });

    it('ROLE_USER no puede acceder a ruta de ROLE_AUDITOR', () => {
        renderProtectedRoute({ rol: 'ROLE_USER', rolesPermitidos: ['ROLE_AUDITOR'] });

        expect(screen.getByTestId('dashboard-page')).toBeInTheDocument();
        expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
    });
});

// ─────────────────────────────────────────────────────────────
// PS-006, PS-009, PS-010, PS-011: Rol correcto → muestra children
// ─────────────────────────────────────────────────────────────
describe('ProtectedRoute — acceso concedido', () => {
    it('PS-009: ROLE_ADMIN accede a ruta de ROLE_ADMIN', () => {
        renderProtectedRoute({ rol: 'ROLE_ADMIN', rolesPermitidos: ['ROLE_ADMIN'] });

        expect(screen.getByTestId('protected-content')).toBeInTheDocument();
    });

    it('PS-011: ROLE_USER accede a ruta de ROLE_USER', () => {
        renderProtectedRoute({ rol: 'ROLE_USER', rolesPermitidos: ['ROLE_USER'] });

        expect(screen.getByTestId('protected-content')).toBeInTheDocument();
    });

    it('PS-010: ROLE_AUDITOR accede a ruta de ROLE_AUDITOR', () => {
        renderProtectedRoute({ rol: 'ROLE_AUDITOR', rolesPermitidos: ['ROLE_AUDITOR'] });

        expect(screen.getByTestId('protected-content')).toBeInTheDocument();
    });

    it('cuando rolesPermitidos es null cualquier usuario autenticado accede', () => {
        renderProtectedRoute({ rol: 'ROLE_USER', rolesPermitidos: null });

        expect(screen.getByTestId('protected-content')).toBeInTheDocument();
    });

    it('ROLE_ADMIN accede a ruta que permite múltiples roles', () => {
        renderProtectedRoute({
            rol: 'ROLE_ADMIN',
            rolesPermitidos: ['ROLE_ADMIN', 'ROLE_AUDITOR'],
        });

        expect(screen.getByTestId('protected-content')).toBeInTheDocument();
    });

    it('ROLE_AUDITOR accede a ruta que permite múltiples roles', () => {
        renderProtectedRoute({
            rol: 'ROLE_AUDITOR',
            rolesPermitidos: ['ROLE_ADMIN', 'ROLE_AUDITOR'],
        });

        expect(screen.getByTestId('protected-content')).toBeInTheDocument();
    });
});

// ─────────────────────────────────────────────────────────────
// PS-005: evento sessionExpirada → logout + redirige a /login
// ─────────────────────────────────────────────────────────────
describe('ProtectedRoute — evento sessionExpirada', () => {
    it('PS-005: evento sessionExpirada llama logout y redirige a /login', async () => {
        localStorage.setItem('token', 'jwt_valido');
        localStorage.setItem('rol', 'ROLE_USER');

        render(
            <AuthProvider>
                <MemoryRouter initialEntries={['/protegida']}>
                    <Routes>
                        <Route path="/login" element={<LoginPage />} />
                        <Route
                            path="/protegida"
                            element={
                                <ProtectedRoute>
                                    <ContenidoProtegido />
                                </ProtectedRoute>
                            }
                        />
                    </Routes>
                </MemoryRouter>
            </AuthProvider>
        );

        // Inicialmente muestra el contenido protegido
        expect(screen.getByTestId('protected-content')).toBeInTheDocument();

        // Simula que el interceptor axios detectó un 401
        await act(async () => {
            window.dispatchEvent(new Event('sessionExpirada'));
        });

        // Debe redirigir a /login y limpiar el token
        expect(screen.getByTestId('login-page')).toBeInTheDocument();
        expect(localStorage.getItem('token')).toBeNull();
    });

    it('PS-005: localStorage queda completamente limpio tras sessionExpirada', async () => {
        localStorage.setItem('token', 'jwt_valido');
        localStorage.setItem('rol', 'ROLE_ADMIN');
        localStorage.setItem('nombreCompleto', 'Goura Rodriguez');
        localStorage.setItem('permisos', JSON.stringify(['READ']));

        render(
            <AuthProvider>
                <MemoryRouter initialEntries={['/protegida']}>
                    <Routes>
                        <Route path="/login" element={<LoginPage />} />
                        <Route
                            path="/protegida"
                            element={
                                <ProtectedRoute>
                                    <ContenidoProtegido />
                                </ProtectedRoute>
                            }
                        />
                    </Routes>
                </MemoryRouter>
            </AuthProvider>
        );

        await act(async () => {
            window.dispatchEvent(new Event('sessionExpirada'));
        });

        expect(localStorage.getItem('token')).toBeNull();
        expect(localStorage.getItem('rol')).toBeNull();
        expect(localStorage.getItem('nombreCompleto')).toBeNull();
    });
});
