// src/components/Footer.tsx
import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  return (
    <footer style={{
      backgroundColor: '#1a2332',
      color: 'white',
      padding: '30px 20px',
      textAlign: 'center',
      marginTop: '40px'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '20px',
          marginBottom: '20px'
        }}>
          <div style={{ flex: 1, minWidth: '200px' }}>
            <h3 style={{ marginBottom: '15px', color: '#4CAF50' }}>Analysis Data</h3>
            <p style={{ color: '#ccc', lineHeight: '1.6' }}>
              Soluções em análise de dados e automação para alavancar o seu negócio.
            </p>
          </div>
          <div style={{ flex: 1, minWidth: '200px' }}>
            <h3 style={{ marginBottom: '15px', color: '#4CAF50' }}>Links Rápidos</h3>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              <li style={{ marginBottom: '8px' }}>
                <Link to="/" style={{ color: '#ccc', textDecoration: 'none' }}>Home</Link>
              </li>
              <li style={{ marginBottom: '8px' }}>
                <Link to="/servicos" style={{ color: '#ccc', textDecoration: 'none' }}>Serviços</Link>
              </li>
              <li style={{ marginBottom: '8px' }}>
                <Link to="/contato" style={{ color: '#ccc', textDecoration: 'none' }}>Contato</Link>
              </li>
              <li style={{ marginBottom: '8px' }}>
                <Link to="/sobre" style={{ color: '#ccc', textDecoration: 'none' }}>Sobre</Link>
              </li>
            </ul>
          </div>
          <div style={{ flex: 1, minWidth: '200px' }}>
            <h3 style={{ marginBottom: '15px', color: '#4CAF50' }}>Contato</h3>
            <p style={{ color: '#ccc', marginBottom: '8px' }}>Email: contato@analysisdata.com</p>
            <p style={{ color: '#ccc', marginBottom: '8px' }}>Telefone: (11) 99999-9999</p>
            <a
              href="https://wa.me/5511999999999?text=Olá! Gostaria de saber mais sobre os serviços."
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                color: '#25D366',
                textDecoration: 'none',
                fontWeight: 'bold'
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 12a9 9 0 0 1-9 9 9 9 0 0 1-9-9 9 9 0 0 1 9-9c2.5 0 4.8.9 6.7 2.6L21 12z" />
              </svg>
              Fale Conosco pelo WhatsApp
            </a>
          </div>
        </div>
        <div style={{
          borderTop: '1px solid #2a3441',
          paddingTop: '20px',
          color: '#ccc',
          fontSize: '0.9rem'
        }}>
          <p>© {new Date().getFullYear()} Analysis Data. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;