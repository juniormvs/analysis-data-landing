// src/pages/ContatosAdmin.tsx
import React, { useState, useEffect } from 'react';
import { contactApi } from '../api/api';

interface Contato {
  id: number;
  nome: string;
  email: string;
  telefone: string | null;
  mensagem: string;
  status: string;
  criado_em: string;
}

export const ContatosAdmin: React.FC = () => {
  const [contatos, setContatos] = useState<Contato[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('Todos');
  const [editingContato, setEditingContato] = useState<Contato | null>(null);
  const [editFormData, setEditFormData] = useState({
    status: '',
    mensagem: '',
  });

  // Busca os contatos
  useEffect(() => {
    const fetchContatos = async () => {
      try {
        const response = await contactApi.listContatos();
        setContatos(response.contatos);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao buscar contatos');
      } finally {
        setIsLoading(false);
      }
    };
    fetchContatos();
  }, []);

  // Filtra contatos por status
  const filteredContatos = contatos.filter(contato => {
    if (filterStatus === 'Todos') return true;
    return contato.status === filterStatus;
  });

  // Abre o modal de edição
  const handleEditClick = (contato: Contato) => {
    setEditingContato(contato);
    setEditFormData({
      status: contato.status,
      mensagem: contato.mensagem,
    });
  };

  // Atualiza o contato
  const handleUpdate = async () => {
    if (!editingContato) return;

    try {
      await contactApi.updateContato(editingContato.id, {
        status: editFormData.status,
        mensagem: editFormData.mensagem,
      });
      // Atualiza a lista de contatos
      const response = await contactApi.listContatos();
      setContatos(response.contatos);
      setEditingContato(null); // Fecha o modal
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar contato');
    }
  };

  // Deleta um contato
  const handleDelete = async (id: number) => {
    if (!window.confirm('Tem certeza que deseja deletar este contato?')) return;

    try {
      await contactApi.deleteContato(id);
      // Atualiza a lista de contatos
      const response = await contactApi.listContatos();
      setContatos(response.contatos);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao deletar contato');
    }
  };

  if (isLoading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-gray-600">Carregando contatos...</div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
        {error}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="container mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">Gerenciar Contatos</h1>

        {/* Filtro por status */}
        <div className="mb-6">
          <label htmlFor="filterStatus" className="block text-sm font-medium text-gray-700 mb-1">
            Filtrar por status:
          </label>
          <select
            id="filterStatus"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="p-2 border border-gray-300 rounded-md w-64"
          >
            <option value="Todos">Todos</option>
            <option value="Pendente">Pendente</option>
            <option value="Respondido">Respondido</option>
            <option value="Arquivado">Arquivado</option>
            <option value="Em Andamento">Em Andamento</option>
          </select>
        </div>

        {/* Tabela de contatos */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Telefone</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredContatos.length > 0 ? (
                filteredContatos.map((contato) => (
                  <tr key={contato.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{contato.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{contato.nome}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{contato.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{contato.telefone || 'N/A'}</td>
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
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => handleEditClick(contato)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(contato.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Deletar
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                    Nenhum contato encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Modal de edição */}
        {editingContato && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-lg p-6">
              <h2 className="text-xl font-bold mb-4 text-gray-800">Editar Contato</h2>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome: <span className="font-normal">{editingContato.nome}</span>
                </label>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email: <span className="font-normal">{editingContato.email}</span>
                </label>
              </div>

              <div className="mb-4">
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  id="status"
                  value={editFormData.status}
                  onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="Pendente">Pendente</option>
                  <option value="Respondido">Respondido</option>
                  <option value="Arquivado">Arquivado</option>
                  <option value="Em Andamento">Em Andamento</option>
                </select>
              </div>

              <div className="mb-4">
                <label htmlFor="mensagem" className="block text-sm font-medium text-gray-700 mb-1">
                  Mensagem
                </label>
                <textarea
                  id="mensagem"
                  value={editFormData.mensagem}
                  onChange={(e) => setEditFormData({ ...editFormData, mensagem: e.target.value })}
                  rows={4}
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>

              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => setEditingContato(null)}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleUpdate}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Salvar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContatosAdmin;