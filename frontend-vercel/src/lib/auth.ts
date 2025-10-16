import axios from 'axios';
import Cookies from 'js-cookie';

const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

export interface User {
  id: number;
  username: string;
  email?: string;
  full_name?: string;
  phone?: string;
  cpf?: string;
  avatar_url?: string;
  birth_date?: string;
  gender?: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  role: string;
  preferences: Record<string, any>;
  last_login?: string;
  created_at: string;
  updated_at: string;
}

export interface LoginResponse {
  message: string;
  token: string;
  user: User;
}

export const authAPI = {
  async login(username: string, password: string): Promise<LoginResponse> {
    const response = await axios.post(`${API_URL}/auth/login`, {
      username,
      password
    });
    return response.data;
  },

  async register(username: string, password: string, email?: string) {
    const response = await axios.post(`${API_URL}/auth/register`, {
      username,
      password,
      email
    });
    return response.data;
  },

  async getProfile(): Promise<{ data: User }> {
    const response = await axios.get(`${API_URL}/profile`);
    return response.data;
  },

  async updateProfile(data: Partial<User>): Promise<{ data: User }> {
    const response = await axios.put(`${API_URL}/profile`, data);
    return response.data;
  },

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    await axios.put(`${API_URL}/profile/password`, {
      currentPassword,
      newPassword
    });
  },

  async updatePreferences(preferences: Record<string, any>): Promise<void> {
    await axios.put(`${API_URL}/profile/preferences`, { preferences });
  }
};

export const setAuthToken = (token: string) => {
  Cookies.set('token', token, { expires: 7 }); // 7 dias
  axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
};

export const removeAuthToken = () => {
  Cookies.remove('token');
  delete axios.defaults.headers.common['Authorization'];
};

export const getAuthToken = () => {
  return Cookies.get('token');
};
