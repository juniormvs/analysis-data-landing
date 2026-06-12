import axios from 'axios';

// URLs base dos backends
const DJANGO_URL = 'http://localhost:8000/api';  // Django (autenticação e serviços)
const FASTAPI_URL = 'http://localhost:8001/api'; // FastAPI (contato)

// Instância para o backend Django (Autenticação e Serviços)
export const api = axios.create({
  baseURL: DJANGO_URL,
});

// Instância para o backend FastAPI (Contatos)
const fastapi = axios.create({
  baseURL: FASTAPI_URL,
});

// Recupera token do localStorage
export const getAuthToken = (): string | null => {
  return localStorage.getItem('token');
};

// Interceptor para adicionar o token JWT automaticamente nas requisições ao Django
api.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// API para autenticação (Django)
export const authApi = {
  register: async (firstName: string, lastName: string, email: string, password: string) => {
    const response = await api.post('/register/', {
      first_name: firstName,
      last_name: lastName,
      email,
      password,
      password2: password,
    });
    return response.data;
  },

  login: async (email: string, password: string) => {
    const response = await api.post('/login/', { email, password });
    return response.data;
  },

  logout: async () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
  },
};

// API para serviços (Django)
export const servicoApi = {
  listServicos: async () => {
    const response = await api.get('/servicos/');
    return response.data;
  },

  contratarServico: async (servicoId: number) => {
    const response = await api.post('/meus-servicos/', { servico_id: servicoId });
    return response.data;
  },

  listMeusServicos: async () => {
    const response = await api.get('/meus-servicos/');
    return response.data;
  },
};

// API para contatos (FastAPI)
export const contactApi = {
  sendMessage: (nome: string, email: string, telefone: string | undefined, mensagem: string) =>
    fastapi.post('/contato/', { nome, email, telefone: telefone || undefined, mensagem })
      .then(res => res.data),

  listContatos: () => fastapi.get('/contatos/').then(res => res.data),
  updateContato: (id: number, data: any) => fastapi.patch(`/contatos/${id}/`, data).then(res => res.data),
  deleteContato: (id: number) => fastapi.delete(`/contatos/${id}/`).then(res => res.data),
};

// Função para salvar tokens e dados do usuário
export const saveAuthTokens = (tokens: { access: string; refresh: string; user: any }) => {
  localStorage.setItem('token', tokens.access);
  localStorage.setItem('refresh_token', tokens.refresh);
  localStorage.setItem('user', JSON.stringify(tokens.user));
};
