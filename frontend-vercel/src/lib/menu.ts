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
    console.log('API Response:', response.status, response.data);
    return response;
  },
  (error) => {
    console.error('API Response Error:', error.response?.status, error.response?.data);
    return Promise.reject(error);
  }
);

export interface MenuItem {
  id: number;
  key: string;
  label: string;
  icon?: string;
  path?: string;
  order_index: number;
  is_enabled: boolean;
  requires_admin: boolean;
  parent_key?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateMenuItemData {
  key: string;
  label: string;
  icon?: string;
  path?: string;
  order_index?: number;
  is_enabled?: boolean;
  requires_admin?: boolean;
  parent_key?: string;
}

export interface UpdateMenuItemData extends Partial<CreateMenuItemData> {}

export interface MenuOrderItem {
  id: number;
  order_index: number;
}

export const menuAPI = {
  // Buscar todos os itens do menu (requer autenticação + admin)
  async getAllMenuItems(): Promise<{ success: boolean; data: MenuItem[] }> {
    const response = await apiClient.get('/menu');
    return response.data;
  },

  // Buscar itens habilitados (requer autenticação)
  async getEnabledMenuItems(): Promise<{ success: boolean; data: MenuItem[] }> {
    const response = await apiClient.get('/menu/enabled');
    return response.data;
  },

  // Buscar itens públicos (não requer autenticação)
  async getPublicMenuItems(): Promise<{ success: boolean; data: MenuItem[] }> {
    const response = await apiClient.get('/menu/public');
    return response.data;
  },

  // Buscar item por ID
  async getMenuItemById(id: number): Promise<{ success: boolean; data: MenuItem }> {
    const response = await apiClient.get(`/api/menu/${id}`);
    return response.data;
  },

  // Buscar item por chave
  async getMenuItemByKey(key: string): Promise<{ success: boolean; data: MenuItem }> {
    const response = await apiClient.get(`/api/menu/key/${key}`);
    return response.data;
  },

  // Criar novo item do menu
  async createMenuItem(itemData: CreateMenuItemData): Promise<{ success: boolean; data: MenuItem }> {
    const response = await apiClient.post('/menu', itemData);
    return response.data;
  },

  // Atualizar item do menu
  async updateMenuItem(id: number, itemData: UpdateMenuItemData): Promise<{ success: boolean; data: MenuItem }> {
    const response = await apiClient.put(`/api/menu/${id}`, itemData);
    return response.data;
  },

  // Alternar status habilitado/desabilitado
  async toggleMenuItemStatus(id: number): Promise<{ success: boolean; data: MenuItem }> {
    const response = await apiClient.patch(`/api/menu/${id}/toggle`);
    return response.data;
  },

  // Atualizar ordem dos itens
  async updateMenuOrder(items: MenuOrderItem[]): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.patch('/menu/order', { items });
    return response.data;
  },

  // Deletar item do menu
  async deleteMenuItem(id: number): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.delete(`/api/menu/${id}`);
    return response.data;
  },

  // Buscar estatísticas do menu
  async getMenuStats(): Promise<{ success: boolean; data: {
    total: number;
    enabled: number;
    disabled: number;
    admin_only: number;
    public: number;
  } }> {
    const response = await apiClient.get('/menu/stats');
    return response.data;
  }
};

