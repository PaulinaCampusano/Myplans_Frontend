import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login/Login';
import Dashboard from './pages/Dashboard/Dashboard';
import Profile from './pages/Profile/Profile';
import Layout from './components/Layout';
import GestionUsuarios from './pages/GestionUsuarios/GestionUsuarios';
import ProtectedRoute from './components/ProtectedRoute';
import ResetPassword from './pages/ResetPassword/ResetPassword';

const profileSidebar = [
  { path: '/perfil', label: 'Mi Perfil', icon: '👤' },
];

const dashboardSidebar = [
  { path: '/dashboard', label: 'Dashboard', icon: '⊞' },
];

const gestionSidebar = [
  { path: '/gestion-usuarios', label: 'Gestión Usuarios', icon: '👥' },
];

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Layout sidebarItems={dashboardSidebar}>
              <Dashboard />
            </Layout>
          </ProtectedRoute>
        } />

        <Route path="/gestion-usuarios" element={
          <ProtectedRoute rolesPermitidos={['ROLE_ADMIN']}>
            <Layout sidebarItems={gestionSidebar}>
              <GestionUsuarios />
            </Layout>
          </ProtectedRoute>
        } />

        <Route path="/perfil" element={
          <ProtectedRoute>
            <Layout sidebarItems={profileSidebar}>
              <Profile />
            </Layout>
          </ProtectedRoute>
        } />
      </Routes>
    </BrowserRouter>
  );
};

export default App;