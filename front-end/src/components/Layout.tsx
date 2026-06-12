// src/components/Layout.tsx
import React from 'react';
import { Link, Outlet } from 'react-router-dom';
import { useAuth } from '../pages/AuthContext';

interface LayoutProps {
  children?: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <nav style={{
        backgroundColor: '#1a2332',
        padding: '15px 20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Link to="/" style={{
            color: 'white',
            fontSize: '1.5rem',
            fontWeight: 'bold',
            textDecoration: 'none',
            marginRight: '30px'
          }}>
            Analysis Data
          </Link>
          <Link to="/servicos" style={{
            color: 'white',
            marginRight: '20px',
            textDecoration: 'none',
            padding: '5px 10px',
            borderRadius: '4px',
            transition: 'background-color 0.3s'
          }}
          onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#2a3441')}
          onMouseOut={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
          >
            Serviços
          </Link>
          {isAuthenticated && (
            <Link to="/meus-servicos" style={{
              color: 'white',
              marginRight: '20px',
              textDecoration: 'none',
              padding: '5px 10px',
              borderRadius: '4px',
              transition: 'background-color 0.3s'
            }}
            onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#2a3441')}
            onMouseOut={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
            >
              Meus Serviços
            </Link>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          {!isAuthenticated ? (
            <>
              <Link to="/login" style={{
                color: 'white',
                textDecoration: 'none',
                padding: '8px 16px',
                borderRadius: '4px',
                transition: 'background-color 0.3s'
              }}
              onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#2a3441')}
              onMouseOut={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                Login
              </Link>
              <Link to="/register" style={{
                color: 'white',
                textDecoration: 'none',
                padding: '8px 16px',
                borderRadius: '4px',
                backgroundColor: '#4CAF50',
                transition: 'background-color 0.3s'
              }}
              onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#45a049')}
              onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#4CAF50')}
              >
                Cadastrar
              </Link>
            </>
          ) : (
            <>
              {user?.nome && (
                <span style={{ color: 'white', fontWeight: '500', marginRight: '10px' }}>
                  Olá, {user.nome}
                </span>
              )}
              <button
                onClick={logout}
                style={{
                  color: 'white',
                  backgroundColor: '#f44336',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  transition: 'background-color 0.3s'
                }}
                onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#d32f2f')}
                onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#f44336')}
              >
                Sair
              </button>
            </>
          )}
        </div>
      </nav>

      <main style={{ flex: 1, padding: '20px' }}>
        {children || <Outlet />}
      </main>
    </div>
  );
};

export default Layout;