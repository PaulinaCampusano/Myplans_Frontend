import { useNavigate, useLocation } from 'react-router-dom';

const Layout = ({ children, sidebarItems }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const nombreCompleto = localStorage.getItem('nombreCompleto') || '';
    const rol = localStorage.getItem('rol') || '';
    const initials = nombreCompleto.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

    const rolLabel = rol === 'ROLE_ADMIN' ? 'Administrador' : rol === 'ROLE_AUDITOR' ? 'Supervisor' : 'Operador';

    const topNavItems = [
        { path: '/gestion-usuarios', label: 'Gestión Usuarios' },
        { path: '/dashboard', label: 'Dashboard' },
        { path: '/perfil', label: 'Perfil' },
    ];

    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
    };

    return (
        <div style={styles.wrapper}>
            {/* TOPBAR */}
            <div style={styles.topbar}>
                <div style={styles.topbarLeft}>
                    <div style={styles.logoMark}>
                        <div style={styles.logoIcon}>
                            <svg viewBox="0 0 24 24" width="14" height="14" fill="#1a2332">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                            </svg>
                        </div>
                        <span style={styles.logoText}>MyPlans</span>
                    </div>
                </div>
                <div style={styles.topbarNav}>
                    {topNavItems.map((item) => (
                        <button
                            key={item.path}
                            onClick={() => navigate(item.path)}
                            style={{
                                ...styles.topNavBtn,
                                ...(location.pathname === item.path ? styles.topNavBtnActive : {}),
                            }}
                        >
                            {item.label}
                        </button>
                    ))}
                </div>
                <button style={styles.btnLogout} onClick={handleLogout}>
                    Cerrar sesión
                </button>
            </div>

            <div style={styles.body}>
                {/* SIDEBAR */}
                <div style={styles.sidebar}>
                    <div style={styles.sidebarLogo}>
                        <div style={styles.logoIcon}>
                            <svg viewBox="0 0 24 24" width="14" height="14" fill="#1a2332">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                            </svg>
                        </div>
                        <div>
                            <div style={styles.sidebarLogoText}>MyPlans</div>
                            <div style={styles.sidebarLogoSub}>{rolLabel}</div>
                        </div>
                    </div>

                    <div style={styles.sidebarNav}>
                        {sidebarItems && sidebarItems.map((item) => (
                            <div
                                key={item.path}
                                onClick={() => navigate(item.path)}
                                style={{
                                    ...styles.navItem,
                                    ...(location.pathname === item.path ? styles.navItemActive : {}),
                                }}
                            >
                                <span>{item.icon}</span>
                                <span>{item.label}</span>
                            </div>
                        ))}
                    </div>

                    <div style={styles.sidebarFooter}>
                        <div style={styles.userCard}>
                            <div style={styles.avatar}>{initials}</div>
                            <div>
                                <div style={styles.userName}>{nombreCompleto}</div>
                                <div style={styles.userRole}>{rolLabel}</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* CONTENIDO */}
                <div style={styles.main}>
                    {children}
                </div>
            </div>
        </div>
    );
};

const styles = {
    wrapper: {
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        background: '#141f2e',
        overflow: 'hidden',
    },
    topbar: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 16px',
        height: '46px',
        minHeight: '46px',
        background: '#0f1922',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        zIndex: 100,
        gap: '8px',
    },
    topbarLeft: {
        flexShrink: 0,
    },
    logoMark: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
    },
    logoIcon: {
        width: '26px',
        height: '26px',
        background: '#2ecc71',
        borderRadius: '6px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
    },
    logoText: {
        fontSize: '13px',
        fontWeight: '600',
        color: '#f0f4f8',
    },
    topbarNav: {
        display: 'flex',
        gap: '2px',
        flex: 1,
        justifyContent: 'center',
        flexWrap: 'wrap',
    },
    topNavBtn: {
        background: 'transparent',
        border: 'none',
        color: '#8899aa',
        fontSize: '11px',
        fontWeight: '500',
        padding: '6px 10px',
        borderRadius: '6px',
        cursor: 'pointer',
        borderBottom: '2px solid transparent',
    },
    topNavBtnActive: {
        color: '#2ecc71',
        borderBottom: '2px solid #2ecc71',
        background: 'rgba(46,204,113,0.06)',
    },
    btnLogout: {
        background: 'rgba(231,76,60,0.1)',
        color: '#e74c3c',
        border: '1px solid rgba(231,76,60,0.2)',
        borderRadius: '6px',
        padding: '5px 12px',
        fontSize: '11px',
        cursor: 'pointer',
        flexShrink: 0,
    },
    body: {
        display: 'flex',
        flex: 1,
        overflow: 'hidden',
    },
    sidebar: {
        width: '210px',
        minWidth: '210px',
        background: '#1a2332',
        borderRight: '1px solid rgba(255,255,255,0.08)',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
    },
    sidebarLogo: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: '16px 18px 13px',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
    },
    sidebarLogoText: {
        fontSize: '14px',
        fontWeight: '600',
        color: '#f0f4f8',
    },
    sidebarLogoSub: {
        fontSize: '10px',
        color: '#8899aa',
    },
    sidebarNav: {
        padding: '12px 10px',
        flex: 1,
    },
    navItem: {
        display: 'flex',
        alignItems: 'center',
        gap: '9px',
        padding: '8px 10px',
        borderRadius: '7px',
        color: '#8899aa',
        fontSize: '12px',
        cursor: 'pointer',
        marginBottom: '2px',
    },
    navItemActive: {
        background: 'rgba(46,204,113,0.12)',
        color: '#2ecc71',
        fontWeight: '500',
    },
    sidebarFooter: {
        padding: '12px 10px',
        borderTop: '1px solid rgba(255,255,255,0.08)',
    },
    userCard: {
        display: 'flex',
        alignItems: 'center',
        gap: '9px',
        padding: '7px 8px',
        borderRadius: '8px',
    },
    avatar: {
        width: '28px',
        height: '28px',
        borderRadius: '50%',
        background: '#2d3d54',
        border: '1.5px solid #2ecc71',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '10px',
        fontWeight: '600',
        color: '#2ecc71',
        flexShrink: 0,
    },
    userName: {
        fontSize: '12px',
        fontWeight: '500',
        color: '#f0f4f8',
    },
    userRole: {
        fontSize: '10px',
        color: '#8899aa',
    },
    main: {
        flex: 1,
        overflow: 'auto',
        background: '#141f2e',
    },
};

export default Layout;