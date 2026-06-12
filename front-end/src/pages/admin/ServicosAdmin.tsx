// src/pages/ServicosAdmin.tsx
import React, { useEffect, useState } from "react";
import api from "../../services/api";

interface Servico {
  id: number;
  nome: string;
  descricao: string;
  preco: string;
  ativo: boolean;
}

export default function ServicosAdmin() {
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [form, setForm] = useState<Partial<Servico>>({
    nome: "",
    descricao: "",
    preco: "",
    ativo: true,
  });
  const [editingId, setEditingId] = useState<number | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("access");
    api
      .get("/servicos/", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res: any) => setServicos(res.data))
      .catch((err: any) => console.error(err));
  }, []);

  const handleSubmit = async () => {
    const token = localStorage.getItem("access");
    try {
      if (editingId) {
        await api.put(`/servicos/${editingId}/`, form, {
          headers: { Authorization: `Bearer ${token}` },
        });
        alert("Serviço atualizado com sucesso!");
      } else {
        await api.post("/servicos/", form, {
          headers: { Authorization: `Bearer ${token}` },
        });
        alert("Serviço criado com sucesso!");
      }
      window.location.reload();
    } catch (err) {
      alert("Erro ao salvar serviço.");
    }
  };

  const handleEdit = (servico: Servico) => {
    setForm(servico);
    setEditingId(servico.id);
  };

  const handleDelete = async (id: number) => {
    const token = localStorage.getItem("access");
    try {
      await api.delete(`/servicos/${id}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("Serviço deletado com sucesso!");
      window.location.reload();
    } catch (err) {
      alert("Erro ao deletar serviço.");
    }
  };

  return (
    <div>
      <h2>Gerenciar Serviços</h2>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit();
        }}
      >
        <input
          placeholder="Nome"
          value={form.nome || ""}
          onChange={(e) => setForm({ ...form, nome: e.target.value })}
        />
        <input
          placeholder="Descrição"
          value={form.descricao || ""}
          onChange={(e) => setForm({ ...form, descricao: e.target.value })}
        />
        <input
          type="number"
          placeholder="Preço"
          value={form.preco || ""}
          onChange={(e) => setForm({ ...form, preco: e.target.value })}
        />
        <label>
          Ativo:
          <input
            type="checkbox"
            checked={form.ativo || false}
            onChange={(e) => setForm({ ...form, ativo: e.target.checked })}
          />
        </label>
        <button type="submit">
          {editingId ? "Atualizar Serviço" : "Criar Serviço"}
        </button>
      </form>

      <h3>Lista de Serviços</h3>
      <ul>
        {servicos.map((s) => (
          <li key={s.id}>
            <strong>{s.nome}</strong> - R$ {s.preco} -{" "}
            {s.ativo ? "Ativo" : "Inativo"}
            <button onClick={() => handleEdit(s)}>Editar</button>
            <button onClick={() => handleDelete(s.id)}>Deletar</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
