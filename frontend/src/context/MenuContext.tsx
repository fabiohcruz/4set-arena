'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { menuAPI, MenuItem } from '@/lib/menu';

interface MenuContextType {
  menuItems: MenuItem[];
  loading: boolean;
  error: string | null;
  loadMenuItems: () => Promise<void>;
  refreshMenuItems: () => Promise<void>;
}

const MenuContext = createContext<MenuContextType | undefined>(undefined);

interface MenuProviderProps {
  children: ReactNode;
}

// Mock data - em produção viria do backend
const initialMenuItems: MenuItem[] = [
  {
    id: 1,
    key: 'dashboard',
    label: 'Dashboard',
    icon: 'LayoutDashboard',
    path: '/dashboard',
    order_index: 1,
    is_enabled: true,
    requires_admin: false,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 2,
    key: 'reservas',
    label: 'Reservas',
    icon: 'Calendar',
    path: '/reservas',
    order_index: 2,
    is_enabled: true,
    requires_admin: false,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 3,
    key: 'clientes',
    label: 'Clientes',
    icon: 'Users',
    path: '/clientes',
    order_index: 3,
    is_enabled: true,
    requires_admin: false,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 4,
    key: 'configuracoes',
    label: 'Configurações',
    icon: 'Settings',
    path: '/configuracoes',
    order_index: 4,
    is_enabled: true,
    requires_admin: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  }
];

export const MenuProvider: React.FC<MenuProviderProps> = ({ children }) => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Carregar itens do menu da API
  const loadMenuItems = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await menuAPI.getEnabledMenuItems();
      if (response.success) {
        setMenuItems(response.data);
      } else {
        setMenuItems(initialMenuItems);
      }
    } catch (error) {
      console.error('Erro ao carregar itens do menu:', error);
      setMenuItems(initialMenuItems);
      setError('Erro ao carregar itens do menu');
    } finally {
      setLoading(false);
    }
  };

  // Recarregar itens do menu
  const refreshMenuItems = async () => {
    await loadMenuItems();
  };

  useEffect(() => {
    loadMenuItems();
  }, []);

  const value: MenuContextType = {
    menuItems,
    loading,
    error,
    loadMenuItems,
    refreshMenuItems
  };

  return (
    <MenuContext.Provider value={value}>
      {children}
    </MenuContext.Provider>
  );
};

export const useMenu = (): MenuContextType => {
  const context = useContext(MenuContext);
  if (context === undefined) {
    throw new Error('useMenu deve ser usado dentro de um MenuProvider');
  }
  return context;
};

