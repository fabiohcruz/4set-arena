import axios from 'axios';
import Cookies from 'js-cookie';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

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

export interface Court {
  id: number;
  name: string;
  type: 'Quadra' | 'Campo' | 'Piscina' | 'Academia';
  capacity: number;
  price: number;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateCourtData {
  name: string;
  type: 'Quadra' | 'Campo' | 'Piscina' | 'Academia';
  capacity: number;
  price: number;
  description?: string;
  is_active?: boolean;
}

export interface UpdateCourtData extends Partial<CreateCourtData> {}

export const courtsAPI = {
  // Buscar todas as quadras (requer autenticação)
  async getAllCourts(): Promise<{ success: boolean; data: Court[] }> {
    const response = await apiClient.get('/courts');
    return response.data;
  },

  // Buscar quadras ativas (público)
  async getActiveCourts(): Promise<{ success: boolean; data: Court[] }> {
    const response = await apiClient.get('/courts/active');
    return response.data;
  },

  // Buscar quadra por ID
  async getCourtById(id: number): Promise<{ success: boolean; data: Court }> {
    const response = await apiClient.get(`/courts/${id}`);
    return response.data;
  },

  // Criar nova quadra
  async createCourt(courtData: CreateCourtData): Promise<{ success: boolean; data: Court }> {
    const response = await apiClient.post('/courts', courtData);
    return response.data;
  },

  // Atualizar quadra
  async updateCourt(id: number, courtData: UpdateCourtData): Promise<{ success: boolean; data: Court }> {
    const response = await apiClient.put(`/courts/${id}`, courtData);
    return response.data;
  },

  // Deletar quadra
  async deleteCourt(id: number): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.delete(`/courts/${id}`);
    return response.data;
  },

  // Alternar status ativo/inativo
  async toggleCourtActive(id: number): Promise<{ success: boolean; data: Court }> {
    const response = await apiClient.patch(`/courts/${id}/toggle`);
    return response.data;
  }
};
