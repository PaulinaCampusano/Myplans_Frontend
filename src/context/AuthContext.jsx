import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [usuario, setUsuario] = useState({
        token: localStorage.getItem('token') || null,
        rol: localStorage.getItem('rol') || null,
        nombreCompleto: localStorage.getItem('nombreCompleto') || null,
        email: localStorage.getItem('email') || null,
    });

    const login = (data) => {
        localStorage.setItem('token', data.token);
        localStorage.setItem('rol', data.rol);
        localStorage.setItem('nombreCompleto', data.nombreCompleto);
        localStorage.setItem('email', data.email);
        localStorage.setItem('permisos', JSON.stringify(data.permisos || []));
        setUsuario({
            token: data.token,
            rol: data.rol,
            nombreCompleto: data.nombreCompleto,
            email: data.email,
        });
    };

    const logout = () => {
        localStorage.clear();
        setUsuario({ token: null, rol: null, nombreCompleto: null, email: null });
    };

    const actualizarNombre = (nombre) => {
        localStorage.setItem('nombreCompleto', nombre);
        setUsuario(prev => ({ ...prev, nombreCompleto: nombre }));
        window.dispatchEvent(new Event('nombreActualizado'));
    };

    const actualizarRol = (rol) => {
        localStorage.setItem('rol', rol);
        setUsuario(prev => ({ ...prev, rol }));
    };

    return (
        <AuthContext.Provider value={{ usuario, login, logout, actualizarNombre, actualizarRol }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);