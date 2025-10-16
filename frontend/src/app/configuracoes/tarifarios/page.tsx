'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Layout from '@/components/Layout';
import { getAuthToken } from '@/lib/auth';
import { Search, Plus, Edit, Trash2, Calendar, Clock, CheckCircle, XCircle } from 'lucide-react';

interface Tariff {
  id: number;
  sport: string;
  category: string;
  description: string;
  value: string; // Corrigido: API retorna como string
  period: string;
  monday: boolean;
  tuesday: boolean;
  wednesday: boolean;
  thursday: boolean;
  friday: boolean;
  saturday: boolean;
  sunday: boolean;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export default function TarifariosPage() {
  const [tariffs, setTariffs] = useState<Tariff[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedSport, setSelectedSport] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sports, setSports] = useState<string[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [editingTariff, setEditingTariff] = useState<Tariff | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    fetchTariffs();
    fetchSports();
  }, [search, selectedSport, selectedCategory]);

  useEffect(() => {
    if (selectedSport) {
      fetchCategoriesBySport(selectedSport);
    }
  }, [selectedSport]);

  const fetchTariffs = async () => {
    try {
      setLoading(true);
      const token = getAuthToken();
      
      if (!token) {
        console.warn('Token não encontrado para buscar tarifários');
        setTariffs([]);
        return;
      }
      
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (selectedSport) params.append('sport', selectedSport);
      if (selectedCategory) params.append('category', selectedCategory);
      
      const response = await fetch(`/api/tariffs?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        console.error('Erro na resposta da API tariffs:', response.status, response.statusText);
        setTariffs([]);
        return;
      }
      
      const data = await response.json();
      setTariffs(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Erro ao buscar tarifários:', error);
      setTariffs([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchSports = async () => {
    try {
      const token = getAuthToken();
      
      if (!token) {
        console.warn('Token não encontrado para buscar esportes');
        setSports([]);
        return;
      }
      
      const response = await fetch('/api/tariffs/sports', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        console.error('Erro na resposta da API sports:', response.status, response.statusText);
        setSports([]);
        return;
      }
      
      const data = await response.json();
      setSports(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Erro ao buscar esportes:', error);
      setSports([]);
    }
  };

  const fetchCategoriesBySport = async (sport: string) => {
    try {
      const token = getAuthToken();
      
      if (!token) {
        console.warn('Token não encontrado para buscar categorias');
        setCategories([]);
        return;
      }
      
      const response = await fetch(`/api/tariffs/sports/${sport}/categories`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        console.error('Erro na resposta da API categories:', response.status, response.statusText);
        setCategories([]);
        return;
      }
      
      const data = await response.json();
      setCategories(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Erro ao buscar categorias:', error);
      setCategories([]);
    }
  };

  const formatCurrency = (value: number | string) => {
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(numValue);
  };

  const handleEditTariff = (tariff: Tariff) => {
    setEditingTariff(tariff);
    setShowEditModal(true);
  };

  const handleCloseEditModal = () => {
    setEditingTariff(null);
    setShowEditModal(false);
  };

  const getDayAbbreviation = (day: string) => {
    const days = {
      sunday: 'Dom',
      monday: 'Seg',
      tuesday: 'Ter',
      wednesday: 'Qua',
      thursday: 'Qui',
      friday: 'Sex',
      saturday: 'Sab'
    };
    return days[day as keyof typeof days] || day;
  };

  const getDaysOfWeek = () => {
    return ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  };

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  const groupTariffsBySportAndCategory = () => {
    const grouped: { [key: string]: { [key: string]: Tariff[] } } = {};
    
    tariffs.forEach(tariff => {
      if (!grouped[tariff.sport]) {
        grouped[tariff.sport] = {};
      }
      if (!grouped[tariff.sport][tariff.category]) {
        grouped[tariff.sport][tariff.category] = [];
      }
      grouped[tariff.sport][tariff.category].push(tariff);
    });
    
    return grouped;
  };

  const groupedTariffs = groupTariffsBySportAndCategory();

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-7xl mx-auto"
        >
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center space-x-2 text-white/60 mb-2">
              <span>Configurações</span>
              <span>/</span>
              <span className="text-white">Tarifário</span>
            </div>
            <h1 className="text-3xl font-bold text-white flex items-center space-x-3">
              <Calendar className="w-8 h-8 text-yellow-400" />
              <span>Tarifário</span>
            </h1>
          </div>

          {/* Controls */}
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 mb-6 border border-white/10">
            <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
              <div className="flex flex-col sm:flex-row gap-4 flex-1">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Pesquisar tarifários..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-yellow-400/50 focus:border-transparent"
                  />
                </div>
                
                <select
                  value={selectedSport}
                  onChange={(e) => setSelectedSport(e.target.value)}
                  className="px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-400/50"
                >
                  <option value="">Todos os esportes</option>
                  {sports.map((sport) => (
                    <option key={sport} value={sport} className="bg-slate-800">
                      {sport}
                    </option>
                  ))}
                </select>

                {selectedSport && (
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-400/50"
                  >
                    <option value="">Todas as categorias</option>
                    {categories.map((category) => (
                      <option key={category} value={category} className="bg-slate-800">
                        {category}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <button className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg flex items-center space-x-2 transition-colors">
                <Plus className="w-5 h-5" />
                <span>Incluir</span>
              </button>
            </div>
          </div>

          {/* Tariffs List */}
          <div className="space-y-4">
            {loading ? (
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-12 text-center border border-white/10">
                <div className="flex items-center justify-center space-x-2 text-white/60">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-yellow-400"></div>
                  <span>Carregando tarifários...</span>
                </div>
              </div>
            ) : Object.keys(groupedTariffs).length === 0 ? (
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-12 text-center border border-white/10">
                <p className="text-white/60">Nenhum tarifário encontrado</p>
              </div>
            ) : (
              Object.entries(groupedTariffs).map(([sport, categories]) => (
                <div key={sport} className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 overflow-hidden">
                  {/* Sport Header */}
                  <button
                    onClick={() => toggleSection(sport)}
                    className="w-full px-6 py-4 bg-white/10 hover:bg-white/15 transition-colors flex items-center justify-between text-left"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-6 h-6 flex items-center justify-center">
                        {expandedSections.has(sport) ? (
                          <div className="w-4 h-4 border-l-2 border-b-2 border-white/60 transform rotate-45"></div>
                        ) : (
                          <div className="w-4 h-4 border-r-2 border-b-2 border-white/60 transform rotate-45"></div>
                        )}
                      </div>
                      <span className="text-white font-medium text-lg">{sport}</span>
                    </div>
                  </button>

                  {expandedSections.has(sport) && (
                    <div className="border-t border-white/10">
                      {Object.entries(categories).map(([category, categoryTariffs]) => (
                        <div key={category} className="border-b border-white/5 last:border-b-0">
                          {/* Category Header */}
                          <button
                            onClick={() => toggleSection(`${sport}-${category}`)}
                            className="w-full px-8 py-3 bg-white/5 hover:bg-white/10 transition-colors flex items-center justify-between text-left"
                          >
                            <div className="flex items-center space-x-3">
                              <div className="w-4 h-4 flex items-center justify-center">
                                {expandedSections.has(`${sport}-${category}`) ? (
                                  <div className="w-3 h-3 border-l-2 border-b-2 border-white/60 transform rotate-45"></div>
                                ) : (
                                  <div className="w-3 h-3 border-r-2 border-b-2 border-white/60 transform rotate-45"></div>
                                )}
                              </div>
                              <span className="text-white/80 font-medium">{category}</span>
                            </div>
                          </button>

                          {expandedSections.has(`${sport}-${category}`) && (
                            <div className="px-8 py-4 space-y-3">
                              {categoryTariffs.map((tariff) => (
                                <motion.div
                                  key={tariff.id}
                                  initial={{ opacity: 0, x: -20 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  className="bg-white/5 rounded-lg p-4 border border-white/10"
                                >
                                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
                                    {/* Description */}
                                    <div className="lg:col-span-3">
                                      <h4 className="text-white font-medium">{tariff.description}</h4>
                                    </div>

                                    {/* Value */}
                                    <div className="lg:col-span-1">
                                      <span className="text-yellow-400 font-bold text-lg">
                                        {formatCurrency(tariff.value)}
                                      </span>
                                    </div>

                                    {/* Period */}
                                    <div className="lg:col-span-2">
                                      <div className="flex items-center space-x-2 text-white/70">
                                        <Clock className="w-4 h-4" />
                                        <span className="text-sm">{tariff.period}</span>
                                      </div>
                                    </div>

                                    {/* Days of Week */}
                                    <div className="lg:col-span-5">
                                      <div className="flex items-center space-x-2">
                                        {getDaysOfWeek().map((day) => (
                                          <div key={day} className="flex flex-col items-center space-y-1">
                                            <span className="text-xs text-white/60">
                                              {getDayAbbreviation(day)}
                                            </span>
                                            {tariff[day as keyof Tariff] ? (
                                              <CheckCircle className="w-4 h-4 text-green-400" />
                                            ) : (
                                              <XCircle className="w-4 h-4 text-red-400" />
                                            )}
                                          </div>
                                        ))}
                                      </div>
                                    </div>

                                    {/* Edit Button */}
                                    <div className="lg:col-span-1">
                                      <button 
                                        onClick={() => handleEditTariff(tariff)}
                                        className="p-2 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400 rounded-lg transition-colors"
                                      >
                                        <Edit className="w-4 h-4" />
                                      </button>
                                    </div>
                                  </div>
                                </motion.div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </motion.div>
      </div>

      {/* Modal de Edição */}
      {showEditModal && editingTariff && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[80vh] overflow-hidden"
          >
            {/* Header do Modal */}
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 text-white">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">Editar Tarifário</h2>
                <button
                  onClick={handleCloseEditModal}
                  className="text-white/80 hover:text-white transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Conteúdo do Modal */}
            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Esporte
                  </label>
                  <input
                    type="text"
                    value={editingTariff.sport}
                    readOnly
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100 text-gray-600"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Categoria
                  </label>
                  <input
                    type="text"
                    value={editingTariff.category}
                    readOnly
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100 text-gray-600"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descrição
                  </label>
                  <input
                    type="text"
                    value={editingTariff.description}
                    readOnly
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100 text-gray-600"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Valor
                  </label>
                  <input
                    type="text"
                    value={formatCurrency(editingTariff.value)}
                    readOnly
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100 text-gray-600"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Período
                  </label>
                  <input
                    type="text"
                    value={editingTariff.period}
                    readOnly
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100 text-gray-600"
                  />
                </div>
              </div>

              {/* Botões de Ação */}
              <div className="flex space-x-3 mt-6">
                <button
                  onClick={handleCloseEditModal}
                  className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-3 rounded-lg transition-colors"
                >
                  Fechar
                </button>
                <button
                  onClick={() => {
                    // TODO: Implementar atualização do tarifário
                    alert('Funcionalidade de atualização será implementada em breve!');
                    handleCloseEditModal();
                  }}
                  className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-lg transition-colors"
                >
                  Salvar
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </Layout>
  );
}
