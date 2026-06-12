// src/pages/Contact.tsx
import React from 'react';
import ContactForm from '../components/ContactForm';
import Footer from '../components/Footer';

const Contact: React.FC = () => {
  return (
    <div>
      <section style={{
        padding: '40px 20px',
        backgroundColor: 'white'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h1 style={{ textAlign: 'center', marginBottom: '30px', color: '#1a2332' }}>Contato</h1>
          <ContactForm />
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default Contact;