// src/pages/Register.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi, saveAuthTokens } from '../api/api';
import { useAuth } from './AuthContext';
import axios from 'axios';

const Register: React.FC = () => {
  const [firstName, setFirstName] = useState<string>('');
  const [lastName, setLastName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [password2, setPassword2] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (password !== password2) {
      setError("As senhas não coincidem.");
      setLoading(false);
      return;
    }

    try {
      const response = await authApi.register(firstName, lastName, email, password);
      if (response.access && response.refresh) {
        saveAuthTokens(response);
      }
      login(response.user); // Atualiza o estado global
      navigate('/servicos'); // Redireciona para a página de serviços após cadastro
    } catch (err) {
      if (axios.isAxiosError(err)) {
        // Tenta pegar a mensagem detalhada do Django (ex: erro em campo específico)
        const serverError = err.response?.data;
        const message = typeof serverError === 'object' 
          ? Object.values(serverError).flat().join(' ') 
          : "Erro ao fazer cadastro.";
        setError(message || err.message);
      } else {
        setError("Erro ao fazer cadastro. Tente novamente.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      maxWidth: '400px',
      margin: '50px auto',
      padding: '20px',
      border: '1px solid #ddd',
      borderRadius: '8px',
      boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
    }}>
      <h1 style={{ textAlign: 'center', marginBottom: '20px' }}>Cadastro</h1>
      {error && <div style={{ color: 'red', marginBottom: '15px' }}>{error}</div>}
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Primeiro Nome:</label>
          <input
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
          />
        </div>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Sobrenome:</label>
          <input
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
          />
        </div>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
          />
        </div>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Senha:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
          />
        </div>
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Confirme a Senha:</label>
          <input
            type="password"
            value={password2}
            onChange={(e) => setPassword2(e.target.value)}
            required
            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
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
            cursor: 'pointer'
          }}
        >
          {loading ? 'Carregando...' : 'Cadastrar'}
        </button>
      </form>
      <p style={{ textAlign: 'center', marginTop: '15px' }}>
        Já tem uma conta? <a href="/login" style={{ color: '#4CAF50' }}>Faça login</a>
      </p>
    </div>
  );
};

export default Register;