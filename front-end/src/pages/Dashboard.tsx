// src/pages/Dashboard.tsx
import React, { useState, useEffect } from 'react';
import { contactApi, authApi } from '../api/api';
import { Bar, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
} from 'chart.js';

// Registra os componentes do ChartJS
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

interface Contato {
  id: number;
  nome: string;
  email: string;
  telefone: string | null;
  mensagem: string;
  status: string;
  criado_em: string;
}

interface DashboardStats {
  totalContatos: number;
  contatosPorStatus: Record<string, number>;
  contatosPorDia: Record<string, number>;
  contatosRecentes: Contato[];
  totalUsuarios: number;
}

export const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalContatos: 0,
    contatosPorStatus: {},
    contatosPorDia: {},
    contatosRecentes: [],
    totalUsuarios: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Busca as estatísticas
  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Busca contatos
        const contatosResponse = await contactApi.listContatos();
        const contatos = contatosResponse.contatos;

        // Calcula estatísticas
        const contatosPorStatus: Record<string, number> = {
          Pendente: 0,
          Respondido: 0,
          Arquivado: 0,
          'Em Andamento': 0,
        };

        const contatosPorDia: Record<string, number> = {};

        contatos.forEach((contato: Contato) => {
          // Contagem por status
          if (contatosPorStatus[contato.status] !== undefined) {
            contatosPorStatus[contato.status]++;
          }

          // Contagem por dia (formato: DD/MM)
          const data = new Date(contato.criado_em);
          const diaMes = data.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
          contatosPorDia[diaMes] = (contatosPorDia[diaMes] || 0) + 1;
        });

        // Busca usuários (opcional, se quiser exibir no dashboard)
        // const usuariosResponse = await authApi.getUsuarios(); // Se você tiver um endpoint para listar usuários
        // const totalUsuarios = usuariosResponse.length;

        setStats({
          totalContatos: contatos.length,
          contatosPorStatus,
          contatosPorDia,
          contatosRecentes: contatos.slice(0, 5), // Últimos 5 contatos
          totalUsuarios: 0, // Substitua por totalUsuarios se tiver o endpoint
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao buscar estatísticas');
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (isLoading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-gray-600">Carregando estatísticas...</div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
        {error}
      </div>
    </div>
  );

  // Dados para o gráfico de pizza (status)
  const pieData = {
    labels: Object.keys(stats.contatosPorStatus),
    datasets: [
      {
        data: Object.values(stats.contatosPorStatus),
        backgroundColor: ['#FBBF24', '#10B981', '#6B7280', '#3B82F6'],
        borderWidth: 1,
      },
    ],
  };

  // Dados para o gráfico de barras (contatos por dia)
  const barData = {
    labels: Object.keys(stats.contatosPorDia),
    datasets: [
      {
        label: 'Contatos por dia',
        data: Object.values(stats.contatosPorDia),
        backgroundColor: '#3B82F6',
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="container mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-gray-800">Dashboard</h1>

        {/* Estatísticas gerais */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-bold mb-2 text-gray-600">Total de Contatos</h2>
            <p className="text-3xl font-bold text-blue-600">{stats.totalContatos}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-bold mb-2 text-gray-600">Usuários Cadastrados</h2>
            <p className="text-3xl font-bold text-blue-600">{stats.totalUsuarios}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-bold mb-2 text-gray-600">Pendentes</h2>
            <p className="text-3xl font-bold text-yellow-600">{stats.contatosPorStatus.Pendente || 0}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-bold mb-2 text-gray-600">Respondidos</h2>
            <p className="text-3xl font-bold text-green-600">{stats.contatosPorStatus.Respondido || 0}</p>
          </div>
        </div>

        {/* Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-bold mb-4 text-gray-800">Status dos Contatos</h2>
            <div className="h-64">
              <Pie
                data={pieData}
                options={{
                  responsive: true,
                  plugins: {
                    legend: {
                      position: 'right',
                    },
                  },
                }}
              />
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-bold mb-4 text-gray-800">Contatos por Dia</h2>
            <div className="h-64">
              <Bar
                data={barData}
                options={{
                  responsive: true,
                  plugins: {
                    legend: {
                      position: 'top',
                    },
                  },
                }}
              />
            </div>
          </div>
        </div>

        {/* Contatos recentes */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4 text-gray-800">Contatos Recentes</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {stats.contatosRecentes.length > 0 ? (
                  stats.contatosRecentes.map((contato) => (
                    <tr key={contato.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {contato.nome}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {contato.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          contato.status === 'Pendente' ? 'bg-yellow-100 text-yellow-800' :
                          contato.status === 'Respondido' ? 'bg-green-100 text-green-800' :
                          contato.status === 'Arquivado' ? 'bg-gray-100 text-gray-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {contato.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(contato.criado_em).toLocaleString('pt-BR')}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500">
                      Nenhum contato recente.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;