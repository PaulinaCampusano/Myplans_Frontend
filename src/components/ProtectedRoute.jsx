import { useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, rolesPermitidos }) => {
    const { usuario, logout } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        // Escuchar sesión expirada desde el interceptor de axios
        const handleSessionExpirada = () => {
            logout();
            navigate('/login');
        };
        window.addEventListener('sessionExpirada', handleSessionExpirada);
        return () => window.removeEventListener('sessionExpirada', handleSessionExpirada);
    }, []);

    if (!usuario.token) {
        return <Navigate to="/login" />;
    }

    if (rolesPermitidos && !rolesPermitidos.includes(usuario.rol)) {
        return <Navigate to="/dashboard" />;
    }

    return children;
};

export default ProtectedRoute;