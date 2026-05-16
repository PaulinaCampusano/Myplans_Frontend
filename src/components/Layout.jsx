import { useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';

const Layout = ({ children, sidebarItems }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [nombreCompleto, setNombreCompleto] = useState(localStorage.getItem('nombreCompleto') || '');
    const rol = localStorage.getItem('rol') || '';
    const initials = nombreCompleto.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    useEffect(() => {
        const handler = () => setNombreCompleto(localStorage.getItem('nombreCompleto') || '');
        window.addEventListener('nombreActualizado', handler);
        return () => window.removeEventListener('nombreActualizado', handler);
    }, []);
    const rolLabel = rol === 'ROLE_ADMIN' ? 'Administrador' : rol === 'ROLE_AUDITOR' ? 'Supervisor' : 'Operador';

    const topNavItems = [
        ...(rol === 'ROLE_ADMIN' ? [{ path: '/gestion-usuarios', label: 'Gestión Usuarios' }] : []),
        { path: '/dashboard', label: 'Dashboard' },
        ...(rol === 'ROLE_ADMIN' ? [{ path: '/precarga-planos', label: 'Precarga de Planos' }] : []),
        { path: '/precomisionamiento-operador', label: 'Precomisionamiento (Operador)' },
        ...(rol === 'ROLE_ADMIN' || rol === 'ROLE_AUDITOR' ? [{ path: '/precomisionamiento-supervisor', label: 'Precomisionamiento (Supervisor)' }] : []),
        ...(rol === 'ROLE_ADMIN' || rol === 'ROLE_AUDITOR' ? [{ path: '/exportacion', label: 'Exportación' }] : []),
        ...(rol === 'ROLE_ADMIN' || rol === 'ROLE_AUDITOR' ? [{ path: '/auditoria', label: 'Auditoría' }] : []),
        { path: '/perfil', label: 'Perfil' },
    ];

    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
    };

    return (
        <div className="flex flex-col h-screen bg-bg overflow-hidden select-none">
            {/* TOPBAR */}
            <div className="flex items-center justify-between px-4 h-[46px] min-h-[46px] bg-navy border-b border-white/8 z-50 gap-2">
                <div className="flex items-center gap-2 shrink-0">
                    <div className="w-[26px] h-[26px] bg-green rounded-md flex items-center justify-center shrink-0">
                        <svg viewBox="0 0 24 24" width="14" height="14" fill="#1a2332">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        </svg>
                    </div>
                    <span className="text-[13px] font-semibold text-white">MyPlans</span>
                </div>

                <div className="flex gap-0.5 flex-1 justify-center flex-wrap">
                    {topNavItems.map((item) => (
                        <button
                            key={item.path}
                            onClick={() => navigate(item.path)}
                            className={`text-[11px] font-medium px-2.5 py-1.5 rounded-md cursor-pointer border-b-2 transition-all
                ${location.pathname === item.path
                                    ? 'text-green border-green bg-green/6'
                                    : 'text-muted border-transparent hover:text-white/80 hover:bg-white/4'
                                }`}
                        >
                            {item.label}
                        </button>
                    ))}
                </div>

                <button
                    onClick={handleLogout}
                    className="bg-observed/10 text-observed border border-observed/20 rounded-md px-3 py-1 text-[11px] cursor-pointer hover:bg-observed/20 transition-colors shrink-0"
                >
                    Cerrar sesión
                </button>
            </div>

            <div className="flex flex-1 overflow-hidden">
                {/* SIDEBAR */}
                <div className="w-[210px] min-w-[210px] bg-navy border-r border-white/8 flex flex-col h-full">
                    <div className="flex items-center gap-2.5 px-[18px] py-4 border-b border-white/8">
                        <div className="w-[26px] h-[26px] bg-green rounded-md flex items-center justify-center shrink-0">
                            <svg viewBox="0 0 24 24" width="14" height="14" fill="#1a2332">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                            </svg>
                        </div>
                        <div>
                            <div className="text-sm font-semibold text-white">MyPlans</div>
                            <div className="text-[10px] text-muted">{rolLabel}</div>
                        </div>
                    </div>

                    <div className="p-2.5 flex-1">
                        {sidebarItems && sidebarItems.map((item) => (
                            <div
                                key={item.path}
                                onClick={() => navigate(item.path)}
                                className={`flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs cursor-pointer mb-0.5 transition-all
                  ${location.pathname === item.path
                                        ? 'bg-green/12 text-green font-medium'
                                        : 'text-muted hover:bg-white/5 hover:text-white/80'
                                    }`}
                            >
                                <span>{item.icon}</span>
                                <span>{item.label}</span>
                            </div>
                        ))}
                    </div>

                    <div className="p-2.5 border-t border-white/8">
                        <div className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg">
                            <div className="w-7 h-7 rounded-full bg-navy-mid border-[1.5px] border-green flex items-center justify-center text-[10px] font-semibold text-green shrink-0">
                                {initials}
                            </div>
                            <div>
                                <div className="text-xs font-medium text-white">{nombreCompleto}</div>
                                <div className="text-[10px] text-muted">{rolLabel}</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* MAIN */}
                <div className="flex-1 overflow-auto bg-[#141f2e]">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default Layout;