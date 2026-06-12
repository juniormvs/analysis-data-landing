import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi, saveAuthTokens } from '../api/api';
import { useAuth } from './AuthContext';
import axios from 'axios';

const Login: React.FC = () => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await authApi.login(email, password);
      // Salva tokens e dados do usuário
      saveAuthTokens(response);
      login(response.user);
      navigate('/servicos');
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const serverError = err.response?.data;
        let message = "E-mail ou senha incorretos.";
        if (serverError) {
          if (typeof serverError === 'string') message = serverError;
          else if (serverError.detail) message = serverError.detail;
          else if (serverError.non_field_errors) message = serverError.non_field_errors;
          else if (typeof serverError === 'object') message = JSON.stringify(serverError);
        }
        setError(message);
      } else {
        setError("Erro ao fazer login. Tente novamente.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px', border: '1px solid #ddd', borderRadius: '8px' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '20px' }}>Login</h1>
      {error && <div style={{ color: 'red', marginBottom: '15px' }}>{error}</div>}
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '15px' }}>
          <label>Email:</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div style={{ marginBottom: '20px' }}>
          <label>Senha:</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        <button type="submit" disabled={loading}>
          {loading ? 'Carregando...' : 'Entrar'}
        </button>
      </form>
    </div>
  );
};

export default Login;
