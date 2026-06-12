// front-end/src/components/WhatsAppButton.tsx
import React from 'react';

const WhatsAppButton: React.FC = () => {
  const phoneNumber = "5511999999999"; // Substitua pelo número da EvolutionAPI
  const message = "Olá! Gostaria de saber mais sobre os serviços da Analysis Data.";

  return (
    <a
      href={`https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        backgroundColor: '#25D366',
        color: 'white',
        padding: '12px',
        borderRadius: '50%',
        textDecoration: 'none',
        fontSize: '24px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
        zIndex: '1000',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '60px',
        height: '60px'
      }}
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 12a9 9 0 0 1-9 9 9 9 0 0 1-9-9 9 9 0 0 1 9-9c2.5 0 4.8.9 6.7 2.6L21 12z" />
        <path d="M16 8h-2a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h2v-4h-1" />
      </svg>
    </a>
  );
};

export default WhatsAppButton;