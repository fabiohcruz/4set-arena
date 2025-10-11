'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import { useCourts } from '@/context/CourtsContext';
import { Court, CreateCourtData } from '@/lib/courts';
import { 
  ArrowLeft,
  Plus,
  Edit,
  Trash2,
  MapPin,
  Users,
  DollarSign,
  Save,
  X,
  Eye,
  EyeOff
} from 'lucide-react';

// Interface Court já importada de @/lib/courts

const courtTypes = [
  { value: 'Quadra', label: 'Quadra', color: 'bg-blue-500' },
  { value: 'Campo', label: 'Campo', color: 'bg-green-500' },
  { value: 'Piscina', label: 'Piscina', color: 'bg-cyan-500' },
  { value: 'Academia', label: 'Academia', color: 'bg-purple-500' }
];

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

export default function GestaoQuadrasPage() {
  const router = useRouter();
  const { courts, addCourt, updateCourt, deleteCourt, toggleCourtActive } = useCourts();
  
  console.log('GestaoQuadrasPage renderizada, courts:', courts);
  const [showModal, setShowModal] = useState(false);
  const [editingCourt, setEditingCourt] = useState<Court | null>(null);
  const [formData, setFormData] = useState<CreateCourtData>({
    name: '',
    type: 'Quadra',
    capacity: 1,
    price: 0,
    description: '',
    is_active: true
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Simular delay de API
    await new Promise(resolve => setTimeout(resolve, 1000));

    if (editingCourt) {
      // Editar quadra existente
      updateCourt(editingCourt.id, formData);
    } else {
      // Criar nova quadra
      addCourt(formData);
    }

    setLoading(false);
    setShowModal(false);
    setEditingCourt(null);
    resetForm();
  };

  const handleEdit = (court: Court) => {
    setEditingCourt(court);
    setFormData({
      name: court.name,
      type: court.type,
      capacity: court.capacity,
      price: court.price,
      description: court.description || '',
      is_active: court.is_active
    });
    setShowModal(true);
  };

  const handleDelete = (courtId: number) => {
    if (confirm('Tem certeza que deseja excluir esta quadra?')) {
      deleteCourt(courtId);
    }
  };

  const toggleActive = (courtId: number) => {
    toggleCourtActive(courtId);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      type: 'Quadra',
      capacity: 1,
      price: 0,
      description: '',
      is_active: true
    });
  };

  const openNewCourtModal = () => {
    setEditingCourt(null);
    resetForm();
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingCourt(null);
    resetForm();
  };

  const getTypeColor = (type: Court['type']) => {
    const typeConfig = courtTypes.find(t => t.value === type);
    return typeConfig?.color || 'bg-gray-500';
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={() => router.back()}
              className="flex items-center space-x-2 text-gray-300 hover:text-white mb-4 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Voltar</span>
            </button>
            
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">
                  Gestão de Quadras
                </h1>
                <p className="text-gray-300">
                  Crie, edite e gerencie as quadras e espaços esportivos
                </p>
              </div>
              <button
                onClick={openNewCourtModal}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center space-x-2 transition-colors"
              >
                <Plus className="w-5 h-5" />
                <span>Nova Quadra</span>
              </button>
            </div>
          </div>

          {/* Lista de Quadras */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {courts.map((court) => (
                <motion.div
                  key={court.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className={`bg-white/5 backdrop-blur-sm border rounded-lg p-6 transition-all ${
                    court.is_active ? 'border-white/10' : 'border-red-500/50'
                  }`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg ${getTypeColor(court.type)}`}>
                        <MapPin className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="text-white font-medium">{court.name}</h3>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          court.is_active ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                        }`}>
                          {court.is_active ? 'Ativa' : 'Inativa'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => toggleActive(court.id)}
                        className={`p-2 rounded-lg transition-colors ${
                          court.is_active 
                            ? 'hover:bg-red-500/20 text-red-400' 
                            : 'hover:bg-green-500/20 text-green-400'
                        }`}
                        title={court.is_active ? 'Desativar' : 'Ativar'}
                      >
                        {court.is_active ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => handleEdit(court)}
                        className="p-2 rounded-lg hover:bg-blue-500/20 text-blue-400 transition-colors"
                        title="Editar"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(court.id)}
                        className="p-2 rounded-lg hover:bg-red-500/20 text-red-400 transition-colors"
                        title="Excluir"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">Tipo:</span>
                      <span className="text-white">{court.type}</span>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400 flex items-center">
                        <Users className="w-4 h-4 mr-1" />
                        Capacidade:
                      </span>
                      <span className="text-white">{court.capacity} pessoas</span>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400 flex items-center">
                        <DollarSign className="w-4 h-4 mr-1" />
                        Preço/hora:
                      </span>
                      <span className="text-green-400 font-medium">R$ {court.price}</span>
                    </div>
                    
                    {court.description && (
                      <div className="pt-2 border-t border-white/10">
                        <p className="text-gray-400 text-sm">{court.description}</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Modal de Criação/Edição */}
          <AnimatePresence>
            {showModal && (
              <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="bg-slate-800 border border-white/20 rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto"
                >
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-white">
                      {editingCourt ? 'Editar Quadra' : 'Nova Quadra'}
                    </h2>
                    <button
                      onClick={closeModal}
                      className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                    >
                      <X className="w-5 h-5 text-white" />
                    </button>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="block text-white font-medium mb-2">Nome da Quadra</label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Ex: Quadra 1 - Tênis"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-white font-medium mb-2">Tipo</label>
                      <select
                        value={formData.type}
                        onChange={(e) => setFormData({ ...formData, type: e.target.value as 'Quadra' | 'Campo' | 'Piscina' | 'Academia' })}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      >
                        {courtTypes.map(type => (
                          <option key={type.value} value={type.value}>
                            {type.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-white font-medium mb-2">Capacidade</label>
                        <input
                          type="number"
                          min="1"
                          value={formData.capacity}
                          onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) })}
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-white font-medium mb-2">Preço/hora (R$)</label>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={formData.price}
                          onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-white font-medium mb-2">Descrição</label>
                      <textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        rows={3}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Descrição da quadra..."
                      />
                    </div>

                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        id="isActive"
                        checked={formData.is_active}
                        onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                        className="w-4 h-4 text-blue-600 bg-white/10 border-white/20 rounded focus:ring-blue-500"
                      />
                      <label htmlFor="isActive" className="text-white">
                        Quadra ativa
                      </label>
                    </div>

                    <div className="flex space-x-3 pt-4">
                      <button
                        type="button"
                        onClick={closeModal}
                        className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-3 rounded-lg transition-colors"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        disabled={loading}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white py-3 rounded-lg transition-colors flex items-center justify-center"
                      >
                        {loading ? (
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        ) : (
                          <>
                            <Save className="w-4 h-4 mr-2" />
                            {editingCourt ? 'Salvar' : 'Criar'}
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </motion.div>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </Layout>
  );
}
