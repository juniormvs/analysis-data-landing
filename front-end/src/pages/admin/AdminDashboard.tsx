// src/pages/admin/AdminDashboard.tsx
import React, { useState, useEffect } from 'react';
import { Card } from '../../components/Card';
import { Package, Users, MessageSquare, DollarSign } from 'lucide-react';
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
} from 'chart.js';

// Registra os componentes do ChartJS
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

interface AdminStats {
  totalServicos: number;
  totalUsuarios: number;
  totalContatos: number;
  faturamentoMensal: number;
  servicosPorStatus: Record<string, number>;
  contatosPorStatus: Record<string, number>;
}

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<AdminStats>({
    totalServicos: 0,
    totalUsuarios: 0,
    totalContatos: 0,
    faturamentoMensal: 0,
    servicosPorStatus: {},
    contatosPorStatus: {},
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Busca as estatísticas do admin
  useEffect(() => {
    const fetchAdminStats = async () => {
      try {
        // Aqui você vai chamar os endpoints do FastAPI para buscar:
        // - Total de serviços
        // - Total de usuários
        // - Total de contatos
        // - Faturamento mensal
        // - Serviços por status (ativo/inativo)
        // - Contatos por status (pendente/respondido)

        // Exemplo mockado (substitua por chamadas reais)
        const mockStats: AdminStats = {
          totalServicos: 12,
          totalUsuarios: 45,
          totalContatos: 20,
          faturamentoMensal: 12345,
          servicosPorStatus: { Ativo: 8, Inativo: 4 },
          contatosPorStatus: { Pendente: 5, Respondido: 10, Arquivado: 5 },
        };
        setStats(mockStats);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao buscar estatísticas');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAdminStats();
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

  // Dados para o gráfico de pizza (status dos serviços)
  const servicosPieData = {
    labels: Object.keys(stats.servicosPorStatus),
    datasets: [
      {
        data: Object.values(stats.servicosPorStatus),
        backgroundColor: ['#10B981', '#EF4444'], // Verde para ativo, vermelho para inativo
        borderWidth: 1,
      },
    ],
  };

  // Dados para o gráfico de pizza (status dos contatos)
  const contatosPieData = {
    labels: Object.keys(stats.contatosPorStatus),
    datasets: [
      {
        data: Object.values(stats.contatosPorStatus),
        backgroundColor: ['#FBBF24', '#10B981', '#6B7280'], // Amarelo, verde, cinza
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="container mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-gray-800">Dashboard Administrativo</h1>

        {/* Cards de estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card
            title="Serviços Ativos"
            description={stats.totalServicos.toString()}
            icon={<Package className="text-blue-600" />}
          />
          <Card
            title="Usuários Cadastrados"
            description={stats.totalUsuarios.toString()}
            icon={<Users className="text-green-600" />}
          />
          <Card
            title="Contatos Pendentes"
            description={stats.contatosPorStatus.Pendente?.toString() || "0"}
            icon={<MessageSquare className="text-yellow-600" />}
          />
          <Card
            title="Faturamento (Mês)"
            description={`R$ ${stats.faturamentoMensal.toLocaleString('pt-BR')}`}
            icon={<DollarSign className="text-red-600" />}
          />
        </div>

        {/* Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-bold mb-4 text-gray-800">Status dos Serviços</h2>
            <div className="h-64">
              <Pie
                data={servicosPieData}
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
            <h2 className="text-xl font-bold mb-4 text-gray-800">Status dos Contatos</h2>
            <div className="h-64">
              <Pie
                data={contatosPieData}
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
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;