// src/pages/Servicos.tsx
import React, { useEffect, useState } from 'react';
import { getAuthToken, api } from '../api/api';
import { useNavigate } from 'react-router-dom';

// Interface para o serviço
interface Servico {
  id: number;
  nome: string;
  descricao: string;
  preco: string;
  ativo: boolean;
}

const Servicos: React.FC = () => {
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchServicos = async () => {
      try {
        setLoading(true);
        const token = getAuthToken();
        const response = await api.get('/servicos/', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setServicos(response.data);
      } catch (err) {
        setError("Erro ao buscar serviços. Tente novamente mais tarde.");
        console.error("Erro ao buscar serviços:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchServicos();
  }, []);

  const handleContratar = async (servicoId: number) => {
    try {
      const token = getAuthToken();
      await api.post('/meus-servicos/', { servico_id: servicoId }, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      alert("Serviço contratado com sucesso!");
      navigate('/meus-servicos');
    } catch (err) {
      alert("Erro ao contratar serviço. Tente novamente.");
      console.error("Erro ao contratar serviço:", err);
    }
  };

  if (loading) return <div>Carregando serviços...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div style={{ padding: '20px' }}>
      <h1>Nossos Serviços</h1>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
        {servicos.map((servico) => (
          <div
            key={servico.id}
            style={{
              border: '1px solid #ddd',
              padding: '15px',
              borderRadius: '8px',
              width: '300px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}
          >
            <h2>{servico.nome}</h2>
            <p>{servico.descricao}</p>
            <p><strong>Preço: R$ {servico.preco}</strong></p>
            <button
              onClick={() => handleContratar(servico.id)}
              style={{
                backgroundColor: '#4CAF50',
                color: 'white',
                padding: '8px 16px',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Contratar
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Servicos;