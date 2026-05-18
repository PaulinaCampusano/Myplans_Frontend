import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login/Login';
import Dashboard from './pages/Dashboard/Dashboard';
import Profile from './pages/Profile/Profile';
import Layout from './components/Layout';
import GestionUsuarios from './pages/GestionUsuarios/GestionUsuarios';
import ProtectedRoute from './components/ProtectedRoute';
import ResetPassword from './pages/ResetPassword/ResetPassword';
import Precarga from './pages/Precarga/Precarga';
import Exportacion from './pages/Exportacion/Exportacion';
import Auditoria from './pages/Auditoria/Auditoria';
import Precomisionamiento from './pages/Precomisionamiento/Precomisionamiento';

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Layout><Dashboard /></Layout>
          </ProtectedRoute>
        } />

        <Route path="/gestion-usuarios" element={
          <ProtectedRoute rolesPermitidos={['ROLE_ADMIN']}>
            <Layout><GestionUsuarios /></Layout>
          </ProtectedRoute>
        } />

        <Route path="/perfil" element={
          <ProtectedRoute>
            <Layout><Profile /></Layout>
          </ProtectedRoute>
        } />

        <Route path="/precarga" element={
          <ProtectedRoute rolesPermitidos={['ROLE_ADMIN']}>
            <Layout><Precarga /></Layout>
          </ProtectedRoute>
        } />

        <Route path="/exportacion" element={
          <ProtectedRoute rolesPermitidos={['ROLE_AUDITOR']}>
            <Layout><Exportacion /></Layout>
          </ProtectedRoute>
        } />

        <Route path="/auditoria" element={
          <ProtectedRoute rolesPermitidos={['ROLE_AUDITOR']}>
            <Layout><Auditoria /></Layout>
          </ProtectedRoute>
        } />

        <Route path="/precomisionamiento" element={
          <ProtectedRoute rolesPermitidos={['ROLE_USER', 'ROLE_AUDITOR']}>
            <Layout><Precomisionamiento /></Layout>
          </ProtectedRoute>
        } />

      </Routes>
    </BrowserRouter>
  );
};

export default App;