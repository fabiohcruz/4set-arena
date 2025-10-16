import axios from 'axios';
import Cookies from 'js-cookie';

const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

// Configurar axios com interceptors para debug
const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 10000,
});

// Interceptor para requests
apiClient.interceptors.request.use(
  (config) => {
    console.log('API Request:', config.method?.toUpperCase(), config.url);
    
    // Adicionar token de autenticação se disponível
    const token = Cookies.get('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Interceptor para responses
apiClient.interceptors.response.use(
  (response) => {
    console.log('API Response:', response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error('API Response Error:', error.response?.status, error.response?.data);
    return Promise.reject(error);
  }
);

export interface Client {
  id: number;
  member_code: string;
  full_name: string;
  email?: string;
  phone?: string;
  birth_date?: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  emergency_contact?: string;
  emergency_phone?: string;
  membership_type: 'regular' | 'premium' | 'vip';
  status: 'active' | 'inactive' | 'suspended';
  join_date: string;
  created_at: string;
  updated_at: string;
}

export interface CreateClientData {
  full_name: string;
  email?: string;
  phone?: string;
  birth_date?: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  emergency_contact?: string;
  emergency_phone?: string;
  membership_type: 'regular' | 'premium' | 'vip';
  status?: 'active' | 'inactive' | 'suspended';
}

export interface UpdateClientData extends Partial<CreateClientData> {}

export const clientsAPI = {
  // Buscar todos os clientes (requer autenticação)
  async getAllClients(): Promise<{ success: boolean; data: Client[] }> {
    const response = await apiClient.get('/members');
    return response.data;
  },

  // Buscar clientes ativos
  async getActiveClients(): Promise<{ success: boolean; data: Client[] }> {
    const response = await apiClient.get('/members/active');
    return response.data;
  },

  // Buscar cliente por ID
  async getClientById(id: number): Promise<{ success: boolean; data: Client }> {
    const response = await apiClient.get(`/members/${id}`);
    return response.data;
  },

  // Criar novo cliente
  async createClient(clientData: CreateClientData): Promise<{ success: boolean; data: Client }> {
    const response = await apiClient.post('/members', clientData);
    return response.data;
  },

  // Atualizar cliente
  async updateClient(id: number, clientData: UpdateClientData): Promise<{ success: boolean; data: Client }> {
    const response = await apiClient.put(`/members/${id}`, clientData);
    return response.data;
  },

  // Deletar cliente
  async deleteClient(id: number): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.delete(`/members/${id}`);
    return response.data;
  },

  // Alternar status ativo/inativo
  async toggleClientStatus(id: number): Promise<{ success: boolean; data: Client }> {
    const response = await apiClient.patch(`/members/${id}/toggle`);
    return response.data;
  }
};
