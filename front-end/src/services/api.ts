import axios from "axios";

// ==============================
// Configuração dos clientes Axios
// ==============================
const detectDefaultDjangoBase = () => {
  if (process.env.REACT_APP_DJANGO_API_URL) return process.env.REACT_APP_DJANGO_API_URL;
  if (typeof window !== 'undefined') {
    // Se estiver rodando o dev server (porta 3000) usamos o backend em 8000
    const port = window.location.port;
    if (port === '3000' || port === '') return 'http://localhost:8000/api';
    // Quando servido via Nginx em produção, usamos rotas relativas para proxy (/api/...)
    return '/api';
  }
  return 'http://localhost:8000/api';
};

const djangoApi = axios.create({
  baseURL: detectDefaultDjangoBase(),
});

// Log do baseURL para ajudar a depuração em runtime
if (typeof window !== 'undefined' && process.env.NODE_ENV !== 'production') {
  // eslint-disable-next-line no-console
  console.info('djangoApi baseURL:', djangoApi.defaults.baseURL);
}

const fastApi = axios.create({
  baseURL: process.env.REACT_APP_FASTAPI_API_URL || "http://localhost:8001",
});

// ==============================
// Interceptor de requisição (JWT)
// ==============================
const attachToken = (config: any) => {
  const token = localStorage.getItem("access") || localStorage.getItem("token");
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
};

djangoApi.interceptors.request.use(attachToken);
fastApi.interceptors.request.use(attachToken);

// ==============================
// Interceptor de resposta (erros)
// ==============================
const handleError = (error: any) => {
  if (error.response?.status === 401) {
    alert("Sessão expirada. Faça login novamente.");
    localStorage.clear();
    window.location.href = "/login";
  }
  if (error.response?.status === 403) {
    alert("Você não tem permissão para realizar esta ação.");
  }
  return Promise.reject(error);
};

djangoApi.interceptors.response.use((res) => res, handleError);
fastApi.interceptors.response.use((res) => res, handleError);

// ==============================
// Funções de API (exemplos)
// ==============================
// Retorna token atualmente armazenado
export const getAuthToken = (): string | null =>
  localStorage.getItem("access") || localStorage.getItem("token");

// Exporta instância padrão (usa Django por padrão para rotas REST principais)
export default djangoApi;

export const getClientes = async () => {
  const response = await djangoApi.get("/clientes/");
  return response.data;
};

export const createContato = async (data: any) => {
  const response = await fastApi.post("/contato/", data);
  return response.data;
};

// Serviços (Django)
export const getServicos = async () => {
  const response = await djangoApi.get("/servicos/");
  return response.data;
};

export const contratarServico = async (servicoId: number) => {
  const response = await djangoApi.post("/meus-servicos/", {
    servico_id: servicoId,
  });
  return response.data;
};

export const servicoApi = {
  listServicos: async () => {
    const response = await djangoApi.get("/servicos/");
    return response.data;
  },
  contratarServico: async (servicoId: number) => {
    const response = await djangoApi.post("/meus-servicos/", { servico_id: servicoId });
    return response.data;
  },
  listMeusServicos: async () => {
    const response = await djangoApi.get("/meus-servicos/");
    return response.data;
  },
};

export const contactApi = {
  sendMessage: (nome: string, email: string, telefone: string | undefined, mensagem: string) =>
    fastApi.post("/contato/", { nome, email, telefone: telefone || undefined, mensagem }).then((res) => res.data),

  listContatos: () => fastApi.get("/contatos/").then((res) => res.data),

  updateContato: (id: number, data: any) => fastApi.patch(`/contatos/${id}/`, data).then((res) => res.data),

  deleteContato: (id: number) => fastApi.delete(`/contatos/${id}/`).then((res) => res.data),
};

// Funções de autenticação compatíveis
export const saveAuthTokens = (tokens: { access: string; refresh: string }) => {
  // grava em chaves compatíveis com o código existente
  localStorage.setItem("access", tokens.access);
  localStorage.setItem("token", tokens.access);
  localStorage.setItem("refresh", tokens.refresh);
  localStorage.setItem("refresh_token", tokens.refresh);
};

export const authApi = {
  register: async (
    firstName: string,
    lastName: string,
    email: string,
    password: string
  ) => {
    const response = await djangoApi.post("/register/", {
      first_name: firstName,
      last_name: lastName,
      email,
      password,
      password2: password,
    });
    return response.data;
  },

  login: async (email: string, password: string) => {
    const response = await djangoApi.post("/login/", { email, password });
    return response.data;
  },

  logout: async () => {
    localStorage.removeItem("access");
    localStorage.removeItem("token");
    localStorage.removeItem("refresh");
    localStorage.removeItem("refresh_token");
  },
};

