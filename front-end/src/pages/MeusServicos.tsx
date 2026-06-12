import React, { useEffect, useState } from "react";
import { servicoApi, api } from "../api/api";

interface Servico {
  id: number;
  nome: string;
  descricao: string;
  preco: string;
  ativo: boolean;
}

interface UsuarioServico {
  id: number;
  servico: Servico;
  data_contratacao: string;
  ativo: boolean;
}

export default function MeusServicos() {
  const [meusServicos, setMeusServicos] = useState<UsuarioServico[]>([]);
  const [servicosDisponiveis, setServicosDisponiveis] = useState<Servico[]>([]);

  useEffect(() => {
    servicoApi.listMeusServicos()
      .then((res) => setMeusServicos(res))
      .catch((err) => console.error("Erro ao buscar meus serviços:", err));

    servicoApi.listServicos()
      .then((res) => setServicosDisponiveis(res))
      .catch((err) => console.error("Erro ao buscar serviços:", err));
  }, []);

  const handleContratar = async (servicoId: number) => {
    try {
      const novo = await servicoApi.contratarServico(servicoId);
      alert("Serviço contratado com sucesso!");
      // adiciona o novo serviço à lista de "meus serviços"
      setMeusServicos((prev) => [novo, ...prev]);
      // remove dos disponíveis
      setServicosDisponiveis((prev) => prev.filter((s) => s.id !== servicoId));
    } catch (err) {
      alert("Erro ao contratar serviço.");
    }
  };

  const handleCancelar = async (id: number) => {
  try {
    // encontra o serviço cancelado para re-adicionar aos disponíveis
    const removido = meusServicos.find((s) => s.id === id);
    await api.delete(`/meus-servicos/${id}/`);
    alert("Serviço cancelado com sucesso!");
    setMeusServicos((prev) => prev.filter((s) => s.id !== id));
    if (removido) {
      // evita duplicatas: só adiciona se não existir
      setServicosDisponiveis((prev) => {
        if (prev.some((p) => p.id === removido.servico.id)) return prev;
        return [removido.servico, ...prev];
      });
    }
  } catch (err) {
    console.error("Erro ao cancelar serviço:", err);
    alert("Erro ao cancelar serviço.");
  }
};


  return (
    <div className="max-w-5xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">Meus Serviços</h2>
      {meusServicos.length === 0 ? (
        <p className="text-gray-600">Nenhum serviço contratado.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {meusServicos.map((us) => (
            <div key={us.id} className="border rounded-lg p-4 shadow-sm bg-white">
              <h3 className="text-lg font-semibold">{us.servico.nome}</h3>
              <p className="text-gray-600">
                Contratado em {new Date(us.data_contratacao).toLocaleDateString()}
              </p>
              <button
                onClick={() => handleCancelar(us.id)}
                className="mt-3 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Cancelar
              </button>
            </div>
          ))}
        </div>
      )}

      <h2 className="text-2xl font-bold mb-4">Serviços Disponíveis</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {servicosDisponiveis.map((s) => (
          <div key={s.id} className="border rounded-lg p-4 shadow-sm bg-white">
            <h3 className="text-lg font-semibold">{s.nome}</h3>
            <p className="text-gray-700">R$ {s.preco}</p>
            <p className="text-gray-600">{s.descricao}</p>
            <button
              onClick={() => handleContratar(s.id)}
              className="mt-3 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
              Contratar
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
