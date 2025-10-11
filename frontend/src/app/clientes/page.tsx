'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import { useClients } from '@/context/ClientsContext';
import { Client, CreateClientData } from '@/lib/clients';
import { 
  ArrowLeft,
  Plus,
  Edit,
  Trash2,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Save,
  X,
  Eye,
  EyeOff,
  Search,
  Filter,
  Grid3X3,
  List
} from 'lucide-react';

const membershipTypes = [
  { value: 'regular', label: 'Regular', color: 'bg-blue-500' },
  { value: 'premium', label: 'Premium', color: 'bg-purple-500' },
  { value: 'vip', label: 'VIP', color: 'bg-yellow-500' }
];

const statusTypes = [
  { value: 'active', label: 'Ativo', color: 'bg-green-500' },
  { value: 'inactive', label: 'Inativo', color: 'bg-gray-500' },
  { value: 'suspended', label: 'Suspenso', color: 'bg-red-500' }
];

export default function GestaoClientesPage() {
  const router = useRouter();
  const { clients, addClient, updateClient, deleteClient, toggleClientStatus } = useClients();
  
  const [showModal, setShowModal] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [membershipFilter, setMembershipFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [formData, setFormData] = useState<CreateClientData>({
    full_name: '',
    email: '',
    phone: '',
    birth_date: '',
    address: '',
    city: '',
    state: '',
    zip_code: '',
    emergency_contact: '',
    emergency_phone: '',
    membership_type: 'regular',
    status: 'active'
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Simular delay de API
    await new Promise(resolve => setTimeout(resolve, 1000));

    if (editingClient) {
      // Editar cliente existente
      updateClient(editingClient.id, formData);
    } else {
      // Criar novo cliente
      addClient(formData);
    }

    setLoading(false);
    setShowModal(false);
    setEditingClient(null);
    resetForm();
  };

  const handleEdit = (client: Client) => {
    setEditingClient(client);
    setFormData({
      full_name: client.full_name,
      email: client.email,
      phone: client.phone,
      birth_date: client.birth_date,
      address: client.address,
      city: client.city,
      state: client.state,
      zip_code: client.zip_code,
      emergency_contact: client.emergency_contact,
      emergency_phone: client.emergency_phone,
      membership_type: client.membership_type,
      status: client.status
    });
    setShowModal(true);
  };

  const handleDelete = (clientId: number) => {
    if (confirm('Tem certeza que deseja excluir este cliente?')) {
      deleteClient(clientId);
    }
  };

  const toggleStatus = (clientId: number) => {
    toggleClientStatus(clientId);
  };

  const resetForm = () => {
    setFormData({
      full_name: '',
      email: '',
      phone: '',
      birth_date: '',
      address: '',
      city: '',
      state: '',
      zip_code: '',
      emergency_contact: '',
      emergency_phone: '',
      membership_type: 'regular',
      status: 'active'
    });
  };

  const openNewClientModal = () => {
    setEditingClient(null);
    resetForm();
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingClient(null);
    resetForm();
  };

  const getMembershipColor = (type: Client['membership_type']) => {
    const typeConfig = membershipTypes.find(t => t.value === type);
    return typeConfig?.color || 'bg-gray-500';
  };

  const getStatusColor = (status: Client['status']) => {
    const statusConfig = statusTypes.find(s => s.value === status);
    return statusConfig?.color || 'bg-gray-500';
  };

  // Filtrar clientes
  const filteredClients = clients.filter(client => {
    const matchesSearch = client.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (client.email && client.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         (client.phone && client.phone.includes(searchTerm));
    const matchesStatus = statusFilter === 'all' || client.status === statusFilter;
    const matchesMembership = membershipFilter === 'all' || client.membership_type === membershipFilter;
    
    return matchesSearch && matchesStatus && matchesMembership;
  });

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
                  Gestão de Clientes
                </h1>
                <p className="text-gray-300">
                  Gerencie informações e dados dos clientes do clube
                </p>
              </div>
              <button
                onClick={openNewClientModal}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center space-x-2 transition-colors"
              >
                <Plus className="w-5 h-5" />
                <span>Novo Cliente</span>
              </button>
            </div>
          </div>

          {/* Filtros */}
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-4 mb-6">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center space-x-2">
                <Search className="w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar por nome, email ou telefone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[300px]"
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Filter className="w-5 h-5 text-gray-400" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">Todos os Status</option>
                  <option value="active">Ativo</option>
                  <option value="inactive">Inativo</option>
                  <option value="suspended">Suspenso</option>
                </select>
              </div>

              <div className="flex items-center space-x-2">
                <select
                  value={membershipFilter}
                  onChange={(e) => setMembershipFilter(e.target.value)}
                  className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">Todos os Planos</option>
                  <option value="regular">Regular</option>
                  <option value="premium">Premium</option>
                  <option value="vip">VIP</option>
                </select>
              </div>

              {/* Botões de Visualização */}
              <div className="flex space-x-2 ml-auto">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`flex items-center justify-center px-3 py-2 rounded-lg transition-colors ${
                    viewMode === 'grid' 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-white/10 text-white/60 hover:bg-white/20'
                  }`}
                  title="Visualização em grade"
                >
                  <Grid3X3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`flex items-center justify-center px-3 py-2 rounded-lg transition-colors ${
                    viewMode === 'list' 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-white/10 text-white/60 hover:bg-white/20'
                  }`}
                  title="Visualização em lista"
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Lista de Clientes */}
          <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-3'}>
            <AnimatePresence>
              {filteredClients.map((client) => (
                <motion.div
                  key={client.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className={`bg-white/5 backdrop-blur-sm border rounded-lg transition-all ${
                    client.status === 'active' ? 'border-white/10' : 'border-red-500/50'
                  } ${viewMode === 'grid' ? 'p-6' : 'p-4'}`}
                >
                  {viewMode === 'grid' ? (
                    // Visualização em Grade
                    <>
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className={`p-2 rounded-lg ${getMembershipColor(client.membership_type)}`}>
                            <User className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <h3 className="text-white font-medium">{client.full_name}</h3>
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              client.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                            }`}>
                              {statusTypes.find(s => s.value === client.status)?.label}
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => toggleStatus(client.id)}
                            className={`p-2 rounded-lg transition-colors ${
                              client.status === 'active' 
                                ? 'hover:bg-red-500/20 text-red-400' 
                                : 'hover:bg-green-500/20 text-green-400'
                            }`}
                            title={client.status === 'active' ? 'Desativar' : 'Ativar'}
                          >
                            {client.status === 'active' ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                          <button
                            onClick={() => handleEdit(client)}
                            className="p-2 rounded-lg hover:bg-blue-500/20 text-blue-400 transition-colors"
                            title="Editar"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(client.id)}
                            className="p-2 rounded-lg hover:bg-red-500/20 text-red-400 transition-colors"
                            title="Excluir"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center space-x-2 text-sm">
                          <Mail className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-300 truncate">{client.email}</span>
                        </div>
                        
                        <div className="flex items-center space-x-2 text-sm">
                          <Phone className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-300">{client.phone}</span>
                        </div>
                        
                        <div className="flex items-center space-x-2 text-sm">
                          <MapPin className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-300">{client.city}, {client.state}</span>
                        </div>
                        
                        <div className="flex items-center space-x-2 text-sm">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-300">
                            {client.birth_date ? new Date(client.birth_date).toLocaleDateString('pt-BR') : 'Não informado'}
                          </span>
                        </div>
                        
                        <div className="pt-2 border-t border-white/10">
                          <div className="flex items-center justify-between">
                            <span className="text-gray-400 text-sm">Plano:</span>
                            <span className={`text-xs px-2 py-1 rounded-full ${getMembershipColor(client.membership_type)}/20 text-white`}>
                              {membershipTypes.find(m => m.value === client.membership_type)?.label}
                            </span>
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    // Visualização em Lista
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 flex-1">
                        <div className={`p-2 rounded-lg ${getMembershipColor(client.membership_type)}`}>
                          <User className="w-5 h-5 text-white" />
                        </div>
                        
                        <div className="flex-1 grid grid-cols-1 md:grid-cols-5 gap-4">
                          <div>
                            <h3 className="text-white font-semibold">{client.full_name}</h3>
                            <p className="text-sm text-gray-300">{client.email}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-300">{client.phone}</p>
                            <p className="text-sm text-gray-300">{client.city}, {client.state}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-300">
                              {client.birth_date ? new Date(client.birth_date).toLocaleDateString('pt-BR') : 'Não informado'}
                            </p>
                          </div>
                          <div>
                            <span className={`px-2 py-1 rounded-full text-xs ${getMembershipColor(client.membership_type)}/20 text-white`}>
                              {membershipTypes.find(m => m.value === client.membership_type)?.label}
                            </span>
                          </div>
                          <div>
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              client.status === 'active' ? 'bg-green-500/20 text-green-400' : 
                              client.status === 'inactive' ? 'bg-gray-500/20 text-gray-400' : 
                              'bg-red-500/20 text-red-400'
                            }`}>
                              {statusTypes.find(s => s.value === client.status)?.label}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => toggleStatus(client.id)}
                          className={`p-2 rounded-lg transition-colors ${
                            client.status === 'active' 
                              ? 'hover:bg-red-500/20 text-red-400' 
                              : 'hover:bg-green-500/20 text-green-400'
                          }`}
                          title={client.status === 'active' ? 'Desativar' : 'Ativar'}
                        >
                          {client.status === 'active' ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => handleEdit(client)}
                          className="p-2 rounded-lg hover:bg-blue-500/20 text-blue-400 transition-colors"
                          title="Editar"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(client.id)}
                          className="p-2 rounded-lg hover:bg-red-500/20 text-red-400 transition-colors"
                          title="Excluir"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {filteredClients.length === 0 && (
            <div className="text-center py-12">
              <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">
                Nenhum cliente encontrado
              </h3>
              <p className="text-gray-400">
                {searchTerm || statusFilter !== 'all' || membershipFilter !== 'all'
                  ? 'Tente ajustar os filtros de busca'
                  : 'Comece adicionando seu primeiro cliente'
                }
              </p>
            </div>
          )}

          {/* Modal de Criação/Edição */}
          <AnimatePresence>
            {showModal && (
              <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="bg-slate-800 border border-white/20 rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                >
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-white">
                      {editingClient ? 'Editar Cliente' : 'Novo Cliente'}
                    </h2>
                    <button
                      onClick={closeModal}
                      className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                    >
                      <X className="w-5 h-5 text-white" />
                    </button>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-white font-medium mb-2">Nome Completo</label>
                        <input
                          type="text"
                          value={formData.full_name}
                          onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Ex: João Silva"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-white font-medium mb-2">Email</label>
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Ex: joao@email.com"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-white font-medium mb-2">Telefone</label>
                        <input
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Ex: (11) 99999-9999"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-white font-medium mb-2">Data de Nascimento</label>
                        <input
                          type="date"
                          value={formData.birth_date}
                          onChange={(e) => setFormData({ ...formData, birth_date: e.target.value })}
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-white font-medium mb-2">Plano</label>
                        <select
                          value={formData.membership_type}
                          onChange={(e) => setFormData({ ...formData, membership_type: e.target.value as 'regular' | 'premium' | 'vip' })}
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        >
                          {membershipTypes.map(type => (
                            <option key={type.value} value={type.value}>
                              {type.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-white font-medium mb-2">Status</label>
                        <select
                          value={formData.status}
                          onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' | 'suspended' })}
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        >
                          {statusTypes.map(status => (
                            <option key={status.value} value={status.value}>
                              {status.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-white font-medium mb-2">Endereço</label>
                      <input
                        type="text"
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Ex: Rua das Flores, 123"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-white font-medium mb-2">Cidade</label>
                        <input
                          type="text"
                          value={formData.city}
                          onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Ex: São Paulo"
                        />
                      </div>

                      <div>
                        <label className="block text-white font-medium mb-2">Estado</label>
                        <input
                          type="text"
                          value={formData.state}
                          onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Ex: SP"
                          maxLength={2}
                        />
                      </div>

                      <div>
                        <label className="block text-white font-medium mb-2">CEP</label>
                        <input
                          type="text"
                          value={formData.zip_code}
                          onChange={(e) => setFormData({ ...formData, zip_code: e.target.value })}
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Ex: 01234-567"
                        />
                      </div>
                    </div>


                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-white font-medium mb-2">Contato de Emergência</label>
                        <input
                          type="text"
                          value={formData.emergency_contact}
                          onChange={(e) => setFormData({ ...formData, emergency_contact: e.target.value })}
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Ex: Maria Silva"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-white font-medium mb-2">Telefone de Emergência</label>
                        <input
                          type="tel"
                          value={formData.emergency_phone}
                          onChange={(e) => setFormData({ ...formData, emergency_phone: e.target.value })}
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Ex: (11) 88888-8888"
                          required
                        />
                      </div>
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
                            {editingClient ? 'Salvar' : 'Criar'}
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
