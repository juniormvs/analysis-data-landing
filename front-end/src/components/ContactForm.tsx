// src/components/ContactForm.tsx
import React, { useState } from 'react';
import { contactApi } from '../api/api';

const ContactForm: React.FC = () => {
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: '',  // Deixe vazio se o usuário não preencher
    mensagem: '',
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Validação local (para evitar erro 422)
    if (formData.mensagem.length < 10) {
      setError("A mensagem deve ter pelo menos 10 caracteres.");
      setLoading(false);
      return;
    }

    if (formData.telefone && !/^\(\d{2}\) \d{5}-\d{4}$|^\d{10,11}$/.test(formData.telefone)) {
      setError("Telefone deve estar no formato (XX) XXXXX-XXXX ou XXXXXXXXXXX.");
      setLoading(false);
      return;
    }

    try {
      // Envia os dados para o FastAPI
      await contactApi.sendMessage(
        formData.nome,
        formData.email,
        formData.telefone || undefined,  // Se vazio, envia undefined (nulo)
        formData.mensagem
      );
      setSuccess(true);
      setFormData({ nome: '', email: '', telefone: '', mensagem: '' });
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Erro ao enviar mensagem. Tente novamente.";
      setError(errorMessage);
      console.error("Erro detalhado:", err);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div style={{
        textAlign: 'center',
        padding: '20px',
        backgroundColor: '#f0f8ff',
        borderRadius: '8px',
        marginBottom: '20px'
      }}>
        <h3 style={{ color: '#4CAF50', marginBottom: '10px' }}>Mensagem enviada com sucesso!</h3>
        <p>Entraremos em contato em breve.</p>
        <button
          onClick={() => setSuccess(false)}
          style={{
            marginTop: '15px',
            padding: '8px 16px',
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Enviar Outra Mensagem
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} style={{
      maxWidth: '600px',
      margin: '0 auto',
      padding: '20px',
      backgroundColor: 'white',
      borderRadius: '8px',
      boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
    }}>
      <h2 style={{ textAlign: 'center', marginBottom: '20px', color: '#1a2332' }}>Entre em Contato</h2>
      {error && <div style={{ color: 'red', marginBottom: '15px', textAlign: 'center' }}>{error}</div>}
      <div style={{ marginBottom: '15px' }}>
        <label style={{ display: 'block', marginBottom: '5px', color: '#555' }}>Nome:</label>
        <input
          type="text"
          name="nome"
          value={formData.nome}
          onChange={handleChange}
          required
          style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
        />
      </div>
      <div style={{ marginBottom: '15px' }}>
        <label style={{ display: 'block', marginBottom: '5px', color: '#555' }}>Email:</label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
          style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
        />
      </div>
      <div style={{ marginBottom: '15px' }}>
        <label style={{ display: 'block', marginBottom: '5px', color: '#555' }}>
          Telefone (opcional - formato: (XX) XXXXX-XXXX ou XXXXXXXXXXX):
        </label>
        <input
          type="tel"
          name="telefone"
          value={formData.telefone}
          onChange={handleChange}
          placeholder="(11) 99999-9999 ou 11999999999"
          style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
        />
      </div>
      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', marginBottom: '5px', color: '#555' }}>
          Mensagem (mínimo 10 caracteres):
        </label>
        <textarea
          name="mensagem"
          value={formData.mensagem}
          onChange={handleChange}
          required
          rows={5}
          style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        style={{
          width: '100%',
          padding: '10px',
          backgroundColor: '#4CAF50',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '16px'
        }}
      >
        {loading ? 'Enviando...' : 'Enviar Mensagem'}
      </button>
    </form>
  );
};

export default ContactForm;