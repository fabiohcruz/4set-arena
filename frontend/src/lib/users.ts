import { apiClient } from './utils';

export interface User {
  id: number;
  username: string;
  email?: string;
  full_name?: string;
  phone?: string;
  role: 'admin' | 'user' | 'manager';
  status: 'active' | 'inactive' | 'suspended';
  last_login?: string;
  created_at: string;
  updated_at: string;
  avatar_url?: string;
  preferences?: any;
  birth_date?: string;
  gender?: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  emergency_contact?: string;
  emergency_phone?: string;
  bio?: string;
  cpf?: string;
}

export interface CreateUserData {
  username: string;
  email?: string;
  full_name?: string;
  phone?: string;
  password: string;
  role?: 'admin' | 'user' | 'manager';
  status?: 'active' | 'inactive' | 'suspended';
  birth_date?: string;
  gender?: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  emergency_contact?: string;
  emergency_phone?: string;
  bio?: string;
  cpf?: string;
}

export interface UpdateUserData {
  email?: string;
  full_name?: string;
  phone?: string;
  role?: 'admin' | 'user' | 'manager';
  status?: 'active' | 'inactive' | 'suspended';
  birth_date?: string;
  gender?: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  emergency_contact?: string;
  emergency_phone?: string;
  bio?: string;
  cpf?: string;
}

export interface UserStats {
  total: number;
  active: number;
  inactive: number;
  suspended: number;
  byRole: {
    admin: number;
    manager: number;
    user: number;
  };
}

export interface SearchUsersParams {
  search?: string;
  role?: string;
  status?: string;
}

export const usersAPI = {
  // Buscar todos os usuários
  async getAllUsers(): Promise<{ success: boolean; data: User[] }> {
    const response = await apiClient.get('/users');
    return response.data;
  },

  // Buscar usuário por ID
  async getUserById(id: number): Promise<{ success: boolean; data: User }> {
    const response = await apiClient.get(`/users/${id}`);
    return response.data;
  },

  // Buscar usuários com filtros
  async searchUsers(params: SearchUsersParams): Promise<{ success: boolean; data: User[] }> {
    const queryParams = new URLSearchParams();
    
    if (params.search) queryParams.append('search', params.search);
    if (params.role) queryParams.append('role', params.role);
    if (params.status) queryParams.append('status', params.status);

    const response = await apiClient.get(`/users/search?${queryParams.toString()}`);
    return response.data;
  },

  // Criar novo usuário
  async createUser(userData: CreateUserData): Promise<{ success: boolean; data: User; message: string }> {
    const response = await apiClient.post('/users', userData);
    return response.data;
  },

  // Atualizar usuário
  async updateUser(id: number, userData: UpdateUserData): Promise<{ success: boolean; data: User; message: string }> {
    const response = await apiClient.put(`/users/${id}`, userData);
    return response.data;
  },

  // Atualizar senha do usuário
  async updateUserPassword(id: number, newPassword: string): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.put(`/users/${id}/password`, { newPassword });
    return response.data;
  },

  // Alternar status do usuário
  async toggleUserStatus(id: number): Promise<{ success: boolean; data: User; message: string }> {
    const response = await apiClient.patch(`/users/${id}/toggle-status`);
    return response.data;
  },

  // Deletar usuário
  async deleteUser(id: number): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.delete(`/users/${id}`);
    return response.data;
  },

  // Obter estatísticas dos usuários
  async getUserStats(): Promise<{ success: boolean; data: UserStats }> {
    const response = await apiClient.get('/users/stats');
    return response.data;
  }
};

