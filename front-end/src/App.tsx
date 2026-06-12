// src/App.tsx
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AdminDashboard from './pages/admin/AdminDashboard';
import Layout from './components/Layout';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import Contact from './pages/Contact';
import ContatosAdmin from './pages/ContatosAdmin';
import Dashboard from './pages/Dashboard';
import MeusServicos from './pages/MeusServicos';
import Servicos from './pages/Servicos';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './pages/AuthContext';
import ServicosAdmin from "./pages/admin/ServicosAdmin";  

import './index.css';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Layout>
          <Routes>
            {/* Rotas públicas */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/contato" element={<Contact />} />

            {/* Rotas protegidas para admin */}
            <Route
              path="/admin/contatos"
              element={
                <ProtectedRoute>
                  <ContatosAdmin />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
          <Route
            path="/admin/servicos"
            element={
              <ProtectedRoute>
                <ServicosAdmin />
              </ProtectedRoute>
            }
          />

            {/* Rotas protegidas para usuário */}
            <Route
              path="/meus-servicos"
              element={
                <ProtectedRoute>
                  <MeusServicos />
                </ProtectedRoute>
              }
            />
            <Route
              path="/servicos"
              element={
                <ProtectedRoute>
                  <Servicos />
                </ProtectedRoute>
              }
            />
          </Routes>
        </Layout>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;