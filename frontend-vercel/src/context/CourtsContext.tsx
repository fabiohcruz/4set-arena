'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { courtsAPI, Court, CreateCourtData, UpdateCourtData } from '@/lib/courts';

// Interface Court agora vem de @/lib/courts

interface CourtsContextType {
  courts: Court[];
  loading: boolean;
  addCourt: (court: CreateCourtData) => Promise<void>;
  updateCourt: (id: number, court: UpdateCourtData) => Promise<void>;
  deleteCourt: (id: number) => Promise<void>;
  toggleCourtActive: (id: number) => Promise<void>;
  getActiveCourts: () => Court[];
  getCourtById: (id: number) => Court | undefined;
  refreshCourts: () => Promise<void>;
}

const CourtsContext = createContext<CourtsContextType | undefined>(undefined);

export const useCourts = () => {
  const context = useContext(CourtsContext);
  if (context === undefined) {
    throw new Error('useCourts deve ser usado dentro de um CourtsProvider');
  }
  return context;
};

interface CourtsProviderProps {
  children: ReactNode;
}

// Mock data - em produção viria do backend
const initialCourts: Court[] = [
  {
    id: 1,
    name: 'Quadra 1 - Tênis',
    type: 'Quadra',
    capacity: 4,
    price: 80,
    description: 'Quadra de tênis com piso sintético',
    is_active: true,
    created_at: '2025-01-01',
    updated_at: '2025-01-01'
  },
  {
    id: 2,
    name: 'Quadra 2 - Futebol',
    type: 'Campo',
    capacity: 22,
    price: 120,
    description: 'Campo de futebol society com grama sintética',
    is_active: true,
    created_at: '2025-01-01',
    updated_at: '2025-01-01'
  },
  {
    id: 3,
    name: 'Quadra 3 - Basquete',
    type: 'Quadra',
    capacity: 10,
    price: 100,
    description: 'Quadra de basquete coberta',
    is_active: true,
    created_at: '2025-01-01',
    updated_at: '2025-01-01'
  },
  {
    id: 4,
    name: 'Piscina - Natação',
    type: 'Piscina',
    capacity: 8,
    price: 60,
    description: 'Piscina semiolímpica para natação',
    is_active: true,
    created_at: '2025-01-01',
    updated_at: '2025-01-01'
  },
  {
    id: 5,
    name: 'Academia - Musculação',
    type: 'Academia',
    capacity: 20,
    price: 40,
    description: 'Academia com equipamentos de musculação',
    is_active: false,
    created_at: '2025-01-01',
    updated_at: '2025-01-01'
  }
];

export const CourtsProvider: React.FC<CourtsProviderProps> = ({ children }) => {
  const [courts, setCourts] = useState<Court[]>([]);
  const [loading, setLoading] = useState(false);

  // Carregar quadras da API
  const loadCourts = async () => {
    setLoading(true);
    try {
      const response = await courtsAPI.getAllCourts();
      if (response.success) {
        setCourts(response.data);
      } else {
        setCourts(initialCourts);
      }
    } catch (error) {
      console.error('Erro ao carregar quadras:', error);
      setCourts(initialCourts);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCourts();
  }, []);

  const addCourt = async (courtData: CreateCourtData) => {
    try {
      const response = await courtsAPI.createCourt(courtData);
      if (response.success) {
        await loadCourts(); // Recarregar lista
      }
    } catch (error) {
      console.error('Erro ao criar quadra:', error);
      throw error;
    }
  };

  const updateCourt = async (id: number, courtData: UpdateCourtData) => {
    try {
      const response = await courtsAPI.updateCourt(id, courtData);
      if (response.success) {
        await loadCourts(); // Recarregar lista
      }
    } catch (error) {
      console.error('Erro ao atualizar quadra:', error);
      throw error;
    }
  };

  const deleteCourt = async (id: number) => {
    try {
      const response = await courtsAPI.deleteCourt(id);
      if (response.success) {
        await loadCourts(); // Recarregar lista
      }
    } catch (error) {
      console.error('Erro ao deletar quadra:', error);
      throw error;
    }
  };

  const toggleCourtActive = async (id: number) => {
    try {
      const response = await courtsAPI.toggleCourtActive(id);
      if (response.success) {
        await loadCourts(); // Recarregar lista
      }
    } catch (error) {
      console.error('Erro ao alterar status da quadra:', error);
      throw error;
    }
  };

  const getActiveCourts = () => {
    const activeCourts = courts.filter(court => court.is_active);
    // Se não há quadras ativas, retornar todas as quadras
    if (activeCourts.length === 0 && courts.length > 0) {
      return courts;
    }
    // Se não há quadras, retornar dados mockados
    if (courts.length === 0) {
      return initialCourts;
    }
    return activeCourts;
  };

  const getCourtById = (id: number) => {
    return courts.find(court => court.id === id);
  };

  const refreshCourts = async () => {
    await loadCourts();
  };

  const value: CourtsContextType = {
    courts,
    loading,
    addCourt,
    updateCourt,
    deleteCourt,
    toggleCourtActive,
    getActiveCourts,
    getCourtById,
    refreshCourts
  };
  
  return (
    <CourtsContext.Provider value={value}>
      {children}
    </CourtsContext.Provider>
  );
};
