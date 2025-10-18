// Configuração centralizada da API
export const API_CONFIG = {
  baseURL: 'https://4set-arena-production.up.railway.app/api',
  
  // Headers padrão
  getHeaders: (token?: string) => {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    return headers;
  },
  
  // Método auxiliar para fazer fetch com a URL correta
  fetch: async (endpoint: string, options?: RequestInit) => {
    const url = `${API_CONFIG.baseURL}${endpoint}`;
    return fetch(url, options);
  }
};

export default API_CONFIG;

