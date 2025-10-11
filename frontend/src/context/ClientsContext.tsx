'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { clientsAPI, Client, CreateClientData, UpdateClientData } from '@/lib/clients';

interface ClientsContextType {
  clients: Client[];
  loading: boolean;
  addClient: (clientData: CreateClientData) => Promise<void>;
  updateClient: (id: number, clientData: UpdateClientData) => Promise<void>;
  deleteClient: (id: number) => Promise<void>;
  toggleClientStatus: (id: number) => Promise<void>;
  getActiveClients: () => Client[];
  getClientById: (id: number) => Client | undefined;
  refreshClients: () => Promise<void>;
}

const ClientsContext = createContext<ClientsContextType | undefined>(undefined);

export const useClients = () => {
  const context = useContext(ClientsContext);
  if (!context) {
    throw new Error('useClients deve ser usado dentro de um ClientsProvider');
  }
  return context;
};

interface ClientsProviderProps {
  children: ReactNode;
}

// Mock data - em produção viria do backend
const initialClients: Client[] = [
  {
    id: 1,
    member_code: 'MEM0001',
    full_name: 'João Silva',
    email: 'joao@email.com',
    phone: '(11) 99999-9999',
    birth_date: '1990-05-15',
    address: 'Rua das Flores, 123',
    emergency_contact: 'Maria Silva',
    emergency_phone: '(11) 88888-8888',
    membership_type: 'premium',
    status: 'active',
    join_date: '2024-01-15',
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z'
  },
  {
    id: 2,
    member_code: 'MEM0002',
    full_name: 'Maria Santos',
    email: 'maria@email.com',
    phone: '(11) 88888-8888',
    birth_date: '1985-08-22',
    address: 'Av. Paulista, 456',
    emergency_contact: 'José Santos',
    emergency_phone: '(11) 77777-7777',
    membership_type: 'regular',
    status: 'active',
    join_date: '2024-02-01',
    created_at: '2024-02-01T14:30:00Z',
    updated_at: '2024-02-01T14:30:00Z'
  },
  {
    id: 3,
    member_code: 'MEM0003',
    full_name: 'Pedro Costa',
    email: 'pedro@email.com',
    phone: '(11) 77777-7777',
    birth_date: '1992-12-10',
    address: 'Rua Augusta, 789',
    emergency_contact: 'Ana Costa',
    emergency_phone: '(11) 66666-6666',
    membership_type: 'vip',
    status: 'inactive',
    join_date: '2024-01-10',
    created_at: '2024-01-10T09:15:00Z',
    updated_at: '2024-01-10T09:15:00Z'
  }
];

export const ClientsProvider: React.FC<ClientsProviderProps> = ({ children }) => {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(false);

  // Carregar clientes da API
  const loadClients = async () => {
    setLoading(true);
    try {
      const response = await clientsAPI.getAllClients();
      if (response.success) {
        setClients(response.data);
      } else {
        setClients(initialClients);
      }
    } catch (error) {
      console.error('Erro ao carregar clientes:', error);
      setClients(initialClients);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClients();
  }, []);

  const addClient = async (clientData: CreateClientData) => {
    try {
      const response = await clientsAPI.createClient(clientData);
      if (response.success) {
        await loadClients(); // Recarregar lista
      }
    } catch (error) {
      console.error('Erro ao criar cliente:', error);
      throw error;
    }
  };

  const updateClient = async (id: number, clientData: UpdateClientData) => {
    try {
      const response = await clientsAPI.updateClient(id, clientData);
      if (response.success) {
        await loadClients(); // Recarregar lista
      }
    } catch (error) {
      console.error('Erro ao atualizar cliente:', error);
      throw error;
    }
  };

  const deleteClient = async (id: number) => {
    try {
      const response = await clientsAPI.deleteClient(id);
      if (response.success) {
        await loadClients(); // Recarregar lista
      }
    } catch (error) {
      console.error('Erro ao deletar cliente:', error);
      throw error;
    }
  };

  const toggleClientStatus = async (id: number) => {
    try {
      const response = await clientsAPI.toggleClientStatus(id);
      if (response.success) {
        await loadClients(); // Recarregar lista
      }
    } catch (error) {
      console.error('Erro ao alterar status do cliente:', error);
      throw error;
    }
  };

  const getActiveClients = () => {
    const activeClients = clients.filter(client => client.status === 'active');
    // Se não há clientes ativos, retornar todos os clientes
    if (activeClients.length === 0 && clients.length > 0) {
      return clients;
    }
    // Se não há clientes, retornar dados mockados
    if (clients.length === 0) {
      return initialClients;
    }
    return activeClients;
  };

  const getClientById = (id: number) => {
    return clients.find(client => client.id === id);
  };

  const refreshClients = async () => {
    await loadClients();
  };

  const value: ClientsContextType = {
    clients,
    loading,
    addClient,
    updateClient,
    deleteClient,
    toggleClientStatus,
    getActiveClients,
    getClientById,
    refreshClients
  };
  
  return (
    <ClientsContext.Provider value={value}>
      {children}
    </ClientsContext.Provider>
  );
};
