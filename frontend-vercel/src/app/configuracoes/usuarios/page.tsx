'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import { useAuth } from '@/context/AuthContext';
import { usersAPI, User, CreateUserData, UpdateUserData } from '@/lib/users';
import { validateCPF, formatCPF, formatCEP, formatPhone, fetchAddressByCEP } from '@/lib/utils';
import { 
  ArrowLeft,
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  Eye,
  EyeOff,
  Users,
  Search,
  Filter,
  Shield,
  User as UserIcon,
  Mail,
  Phone,
  Calendar,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Grid3X3,
  List
} from 'lucide-react';

// Interfaces já importadas do usersAPI

const roleOptions = [
  { value: 'user', label: 'Usuário', color: 'bg-blue-500', description: 'Acesso básico ao sistema' },
  { value: 'manager', label: 'Gerente', color: 'bg-purple-500', description: 'Acesso intermediário' },
  { value: 'admin', label: 'Administrador', color: 'bg-red-500', description: 'Acesso total ao sistema' }
];

const statusOptions = [
  { value: 'active', label: 'Ativo', color: 'bg-green-500' },
  { value: 'inactive', label: 'Inativo', color: 'bg-gray-500' },
  { value: 'suspended', label: 'Suspenso', color: 'bg-red-500' }
];

// Removido mock data - agora usando API real

export default function GestaoUsuariosPage() {
  const router = useRouter();
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [formData, setFormData] = useState<CreateUserData>({
    username: '',
    email: '',
    full_name: '',
    phone: '',
    password: '',
    role: 'user',
    status: 'active',
    cpf: '',
    birth_date: '',
    gender: '',
    address: '',
    city: '',
    state: '',
    zip_code: '',
    emergency_contact: '',
    emergency_phone: '',
    bio: ''
  });
  const [formLoading, setFormLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [loadingCEP, setLoadingCEP] = useState(false);

  // Função para validar CPF
  const validateCPFField = (cpf: string) => {
    if (cpf && !validateCPF(cpf)) {
      setErrors(prev => ({ ...prev, cpf: 'CPF inválido' }));
      return false;
    } else {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.cpf;
        return newErrors;
      });
      return true;
    }
  };

  // Função para preencher endereço automaticamente pelo CEP
  const handleCEPChange = async (cep: string) => {
    const formattedCEP = formatCEP(cep);
    setFormData(prev => ({ ...prev, zip_code: formattedCEP }));

    if (cep.replace(/\D/g, '').length === 8) {
      setLoadingCEP(true);
      try {
        const addressData = await fetchAddressByCEP(cep);
        if (addressData) {
          setFormData(prev => ({
            ...prev,
            address: addressData.logradouro,
            city: addressData.localidade,
            state: addressData.uf
          }));
        }
      } catch (error) {
        console.error('Erro ao buscar CEP:', error);
      } finally {
        setLoadingCEP(false);
      }
    }
  };

  // Verificar se o usuário é admin
  useEffect(() => {
    if (currentUser && currentUser.role !== 'admin') {
      router.push('/dashboard');
    }
  }, [currentUser, router]);

  // Carregar usuários da API
  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await usersAPI.getAllUsers();
      if (response.success) {
        setUsers(response.data);
      } else {
        setError('Erro ao carregar usuários');
      }
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
      setError('Erro ao carregar usuários');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setError(null);
    setErrors({});

    // Validar campos obrigatórios
    const newErrors: {[key: string]: string} = {};
    
    if (!formData.full_name?.trim()) {
      newErrors.full_name = 'Nome completo é obrigatório';
    }
    
    if (!formData.email?.trim()) {
      newErrors.email = 'Email é obrigatório';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }
    
    if (!formData.username?.trim()) {
      newErrors.username = 'Username é obrigatório';
    }
    
    if (!editingUser && !formData.password?.trim()) {
      newErrors.password = 'Senha é obrigatória';
    } else if (!editingUser && formData.password && formData.password.length < 6) {
      newErrors.password = 'Senha deve ter pelo menos 6 caracteres';
    }
    
    if (formData.cpf && !validateCPF(formData.cpf)) {
      newErrors.cpf = 'CPF inválido';
    }
    
    // Se há erros, não prosseguir
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setFormLoading(false);
      return;
    }

    try {
      if (editingUser) {
        // Editar usuário existente
        const updateData: UpdateUserData = {
          email: formData.email,
          full_name: formData.full_name,
          phone: formData.phone,
          role: formData.role,
          status: formData.status,
          cpf: formData.cpf,
          birth_date: formData.birth_date,
          gender: formData.gender,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          zip_code: formData.zip_code,
          emergency_contact: formData.emergency_contact,
          emergency_phone: formData.emergency_phone,
          bio: formData.bio
        };
        
        const response = await usersAPI.updateUser(editingUser.id, updateData);
        if (response.success) {
          setUsers(prev => prev.map(u => 
            u.id === editingUser.id ? response.data : u
          ));
        } else {
          setError('Erro ao atualizar usuário');
        }
      } else {
        // Criar novo usuário
        const createData: CreateUserData = {
          username: formData.username,
          email: formData.email,
          full_name: formData.full_name,
          phone: formData.phone,
          password: formData.password,
          role: formData.role,
          status: formData.status,
          cpf: formData.cpf,
          birth_date: formData.birth_date,
          gender: formData.gender,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          zip_code: formData.zip_code,
          emergency_contact: formData.emergency_contact,
          emergency_phone: formData.emergency_phone,
          bio: formData.bio
        };
        
        const response = await usersAPI.createUser(createData);
        if (response.success) {
          setUsers(prev => [...prev, response.data]);
        } else {
          setError('Erro ao criar usuário');
        }
      }

      setShowModal(false);
      setEditingUser(null);
      resetForm();
    } catch (error: any) {
      console.error('Erro ao salvar usuário:', error);
      setError(error.response?.data?.message || 'Erro ao salvar usuário');
    } finally {
      setFormLoading(false);
    }
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setFormData({
      username: user.username,
      email: user.email,
      full_name: user.full_name,
      phone: user.phone || '',
      password: '', // Não mostrar senha existente
      role: user.role,
      status: user.status,
      cpf: user.cpf || '',
      birth_date: user.birth_date || '',
      gender: user.gender || '',
      address: user.address || '',
      city: user.city || '',
      state: user.state || '',
      zip_code: user.zip_code || '',
      emergency_contact: user.emergency_contact || '',
      emergency_phone: user.emergency_phone || '',
      bio: user.bio || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (userId: number) => {
    if (confirm('Tem certeza que deseja excluir este usuário?')) {
      try {
        const response = await usersAPI.deleteUser(userId);
        if (response.success) {
          setUsers(prev => prev.filter(u => u.id !== userId));
        } else {
          setError('Erro ao deletar usuário');
        }
      } catch (error: any) {
        console.error('Erro ao deletar usuário:', error);
        setError(error.response?.data?.message || 'Erro ao deletar usuário');
      }
    }
  };

  const handleToggleStatus = async (userId: number) => {
    try {
      const response = await usersAPI.toggleUserStatus(userId);
      if (response.success) {
        setUsers(prev => prev.map(u => 
          u.id === userId ? response.data : u
        ));
      } else {
        setError('Erro ao alterar status do usuário');
      }
    } catch (error: any) {
      console.error('Erro ao alterar status:', error);
      setError(error.response?.data?.message || 'Erro ao alterar status do usuário');
    }
  };

  const resetForm = () => {
    setFormData({
      username: '',
      email: '',
      full_name: '',
      phone: '',
      password: '',
      role: 'user',
      status: 'active',
      cpf: '',
      birth_date: '',
      gender: '',
      address: '',
      city: '',
      state: '',
      zip_code: '',
      emergency_contact: '',
      emergency_phone: '',
      bio: ''
    });
    setEditingUser(null);
    setError(null);
  };

  const getRoleColor = (role: string) => {
    const roleConfig = roleOptions.find(r => r.value === role);
    return roleConfig?.color || 'bg-gray-500';
  };

  const getStatusColor = (status: string) => {
    const statusConfig = statusOptions.find(s => s.value === status);
    return statusConfig?.color || 'bg-gray-500';
  };

  // Filtrar usuários (agora usando API de busca)
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);

  const applyFilters = async () => {
    try {
      const response = await usersAPI.searchUsers({
        search: searchTerm || undefined,
        role: roleFilter !== 'all' ? roleFilter : undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined
      });
      
      if (response.success) {
        setFilteredUsers(response.data);
      }
    } catch (error) {
      console.error('Erro ao aplicar filtros:', error);
      // Fallback para filtro local se a API falhar
      const localFiltered = users.filter(user => {
        const matchesSearch = user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             user.email?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRole = roleFilter === 'all' || user.role === roleFilter;
        const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
        
        return matchesSearch && matchesRole && matchesStatus;
      });
      setFilteredUsers(localFiltered);
    }
  };

  useEffect(() => {
    applyFilters();
  }, [searchTerm, roleFilter, statusFilter, users]);

  // Verificar se o usuário é admin
  if (currentUser && currentUser.role !== 'admin') {
    return (
      <Layout>
        <div className="min-h-screen gradient-bg flex items-center justify-center">
          <div className="glass p-8 rounded-3xl text-center">
            <AlertTriangle className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Acesso Negado</h2>
            <p className="text-gray-300 mb-6">Apenas administradores podem acessar esta página.</p>
            <button
              onClick={() => router.push('/dashboard')}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all text-white font-medium"
            >
              Voltar ao Dashboard
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen gradient-bg flex items-center justify-center">
          <div className="glass p-8 rounded-3xl text-center">
            <div className="w-16 h-16 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-white text-lg">Carregando usuários...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen gradient-bg p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.back()}
                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
              >
                <ArrowLeft className="w-6 h-6 text-white" />
              </button>
              <div>
                <h1 className="text-3xl font-bold text-white">Gestão de Usuários</h1>
                <p className="text-gray-300">Gerencie usuários, permissões e acessos do sistema</p>
              </div>
            </div>
            <button
              onClick={() => {
                resetForm();
                setShowModal(true);
              }}
              className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all"
            >
              <Plus className="w-5 h-5 text-white" />
              <span className="text-white font-medium">Novo Usuário</span>
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-red-400" />
              <span className="text-red-400">{error}</span>
            </div>
          )}

          {/* Filtros */}
          <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/60" />
              <input
                type="text"
                placeholder="Buscar usuários..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Todos os cargos</option>
              {roleOptions.map(role => (
                <option key={role.value} value={role.value}>
                  {role.label}
                </option>
              ))}
            </select>
            
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Todos os status</option>
              {statusOptions.map(status => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>

            {/* Botões de Visualização */}
            <div className="flex space-x-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`flex items-center justify-center px-4 py-3 rounded-lg transition-colors ${
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
                className={`flex items-center justify-center px-4 py-3 rounded-lg transition-colors ${
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

          {/* Lista de Usuários */}
          <div className={viewMode === 'grid' ? 'grid gap-4' : 'space-y-3'}>
            {filteredUsers.map((user) => (
              <motion.div
                key={user.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg ${
                  viewMode === 'grid' ? 'p-6' : 'p-4'
                }`}
              >
                {viewMode === 'grid' ? (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`p-3 rounded-lg ${getRoleColor(user.role)}`}>
                        <UserIcon className="w-6 h-6 text-white" />
                      </div>
                      
                      <div>
                        <h3 className="text-white font-semibold text-lg">{user.full_name}</h3>
                        <div className="flex items-center space-x-4 text-sm text-gray-300">
                          <span>@{user.username}</span>
                          <span>{user.email}</span>
                          {user.phone && <span>{user.phone}</span>}
                        </div>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className={`px-2 py-1 rounded-full text-xs ${getRoleColor(user.role)} text-white`}>
                            {roleOptions.find(r => r.value === user.role)?.label}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            user.status === 'active' ? 'bg-green-500/20 text-green-400' : 
                            user.status === 'inactive' ? 'bg-gray-500/20 text-gray-400' : 
                            'bg-red-500/20 text-red-400'
                          }`}>
                            {statusOptions.find(s => s.value === user.status)?.label}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 flex-1">
                      <div className={`p-2 rounded-lg ${getRoleColor(user.role)}`}>
                        <UserIcon className="w-5 h-5 text-white" />
                      </div>
                      
                      <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                          <h3 className="text-white font-semibold">{user.full_name}</h3>
                          <p className="text-sm text-gray-300">@{user.username}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-300">{user.email}</p>
                          {user.phone && <p className="text-sm text-gray-300">{user.phone}</p>}
                        </div>
                        <div>
                          <span className={`px-2 py-1 rounded-full text-xs ${getRoleColor(user.role)} text-white`}>
                            {roleOptions.find(r => r.value === user.role)?.label}
                          </span>
                        </div>
                        <div>
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            user.status === 'active' ? 'bg-green-500/20 text-green-400' : 
                            user.status === 'inactive' ? 'bg-gray-500/20 text-gray-400' : 
                            'bg-red-500/20 text-red-400'
                          }`}>
                            {statusOptions.find(s => s.value === user.status)?.label}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                  
                <div className={`flex items-center space-x-2 ${viewMode === 'list' ? 'mt-3' : ''}`}>
                    <button
                      onClick={() => handleToggleStatus(user.id)}
                      className={`p-2 rounded-lg transition-colors ${
                        user.status === 'active' 
                          ? 'bg-red-500/20 hover:bg-red-500/30 text-red-400' 
                          : 'bg-green-500/20 hover:bg-green-500/30 text-green-400'
                      }`}
                      title={user.status === 'active' ? 'Desativar' : 'Ativar'}
                    >
                      {user.status === 'active' ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                    
                    <button
                      onClick={() => handleEdit(user)}
                      className="p-2 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 transition-colors"
                      title="Editar"
                    >
                      <Edit className="w-5 h-5" />
                    </button>
                    
                    {user.id !== currentUser?.id && (
                      <button
                        onClick={() => handleDelete(user.id)}
                        className="p-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400 transition-colors"
                        title="Excluir"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    )}
                  </div>
              </motion.div>
            ))}
          </div>

          {/* Empty State */}
          {filteredUsers.length === 0 && (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Nenhum usuário encontrado</h3>
              <p className="text-gray-400 mb-6">Comece criando um novo usuário</p>
            </div>
          )}
        </div>

        {/* Modal de Criação/Edição */}
        <AnimatePresence>
          {showModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-gray-900 rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-white">
                    {editingUser ? 'Editar Usuário' : 'Novo Usuário'}
                  </h2>
                  <button
                    onClick={() => {
                      setShowModal(false);
                      resetForm();
                    }}
                    className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                  >
                    <X className="w-6 h-6 text-white" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6 max-h-[70vh] overflow-y-auto">
                  {/* Informações Básicas */}
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4">Informações Básicas</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-white font-medium mb-2">Nome Completo *</label>
                      <input
                        type="text"
                        value={formData.full_name}
                          onChange={(e) => {
                            setFormData({ ...formData, full_name: e.target.value });
                            if (errors.full_name) {
                              setErrors(prev => {
                                const newErrors = { ...prev };
                                delete newErrors.full_name;
                                return newErrors;
                              });
                            }
                          }}
                          className={`w-full px-4 py-3 bg-white/10 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            errors.full_name ? 'border-red-500' : 'border-white/20'
                          }`}
                        placeholder="Ex: João Silva"
                        required
                      />
                        {errors.full_name && (
                          <p className="text-red-400 text-xs mt-1">{errors.full_name}</p>
                        )}
                    </div>
                    
                    <div>
                      <label className="block text-white font-medium mb-2">Username *</label>
                      <input
                        type="text"
                        value={formData.username}
                          onChange={(e) => {
                            setFormData({ ...formData, username: e.target.value });
                            if (errors.username) {
                              setErrors(prev => {
                                const newErrors = { ...prev };
                                delete newErrors.username;
                                return newErrors;
                              });
                            }
                          }}
                          className={`w-full px-4 py-3 bg-white/10 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            errors.username ? 'border-red-500' : 'border-white/20'
                          }`}
                        placeholder="Ex: joao.silva"
                        required
                      />
                        {errors.username && (
                          <p className="text-red-400 text-xs mt-1">{errors.username}</p>
                        )}
                  </div>

                    <div>
                      <label className="block text-white font-medium mb-2">Email *</label>
                      <input
                        type="email"
                        value={formData.email}
                          onChange={(e) => {
                            setFormData({ ...formData, email: e.target.value });
                            if (errors.email) {
                              setErrors(prev => {
                                const newErrors = { ...prev };
                                delete newErrors.email;
                                return newErrors;
                              });
                            }
                          }}
                          className={`w-full px-4 py-3 bg-white/10 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            errors.email ? 'border-red-500' : 'border-white/20'
                          }`}
                        placeholder="Ex: joao@email.com"
                        required
                      />
                        {errors.email && (
                          <p className="text-red-400 text-xs mt-1">{errors.email}</p>
                        )}
                    </div>
                    
                    <div>
                      <label className="block text-white font-medium mb-2">Telefone</label>
                      <input
                        type="tel"
                        value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: formatPhone(e.target.value) })}
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Ex: (11) 99999-9999"
                        />
                      </div>

                      <div>
                        <label className="block text-white font-medium mb-2">CPF</label>
                        <input
                          type="text"
                          value={formData.cpf}
                          onChange={(e) => {
                            const formattedCPF = formatCPF(e.target.value);
                            setFormData({ ...formData, cpf: formattedCPF });
                            validateCPFField(formattedCPF);
                          }}
                          onBlur={() => validateCPFField(formData.cpf || '')}
                          className={`w-full px-4 py-3 bg-white/10 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            errors.cpf ? 'border-red-500' : 'border-white/20'
                          }`}
                          placeholder="000.000.000-00"
                        />
                        {errors.cpf && (
                          <p className="text-red-400 text-xs mt-1">{errors.cpf}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-white font-medium mb-2">Data de Nascimento</label>
                        <input
                          type="date"
                          value={formData.birth_date}
                          onChange={(e) => setFormData({ ...formData, birth_date: e.target.value })}
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-white font-medium mb-2">Gênero</label>
                        <select
                          value={formData.gender}
                          onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">Selecione...</option>
                          <option value="masculino">Masculino</option>
                          <option value="feminino">Feminino</option>
                          <option value="outro">Outro</option>
                          <option value="prefiro_nao_informar">Prefiro não informar</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Endereço */}
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4">Endereço</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <label className="block text-white font-medium mb-2">Endereço</label>
                        <input
                          type="text"
                          value={formData.address}
                          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Rua, número, complemento"
                        />
                      </div>

                      <div>
                        <label className="block text-white font-medium mb-2">Cidade</label>
                        <input
                          type="text"
                          value={formData.city}
                          onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Sua cidade"
                        />
                      </div>

                      <div>
                        <label className="block text-white font-medium mb-2">Estado</label>
                        <input
                          type="text"
                          value={formData.state}
                          onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Seu estado"
                        />
                      </div>

                      <div>
                        <label className="block text-white font-medium mb-2">CEP</label>
                        <div className="relative">
                          <input
                            type="text"
                            value={formData.zip_code}
                            onChange={(e) => handleCEPChange(e.target.value)}
                            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="00000-000"
                          />
                          {loadingCEP && (
                            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Contato de Emergência */}
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4">Contato de Emergência</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-white font-medium mb-2">Nome do Contato</label>
                        <input
                          type="text"
                          value={formData.emergency_contact}
                          onChange={(e) => setFormData({ ...formData, emergency_contact: e.target.value })}
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Nome do contato de emergência"
                        />
                      </div>

                      <div>
                        <label className="block text-white font-medium mb-2">Telefone do Contato</label>
                        <input
                          type="tel"
                          value={formData.emergency_phone}
                          onChange={(e) => setFormData({ ...formData, emergency_phone: formatPhone(e.target.value) })}
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="(11) 99999-9999"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Bio */}
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4">Informações Adicionais</h3>
                    <div>
                      <label className="block text-white font-medium mb-2">Bio</label>
                      <textarea
                        value={formData.bio}
                        onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Informações adicionais sobre o usuário"
                        rows={3}
                      />
                    </div>
                  </div>

                  {/* Senha (apenas para novos usuários) */}
                  {!editingUser && (
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-4">Senha</h3>
                    <div>
                      <label className="block text-white font-medium mb-2">Senha *</label>
                      <input
                        type="password"
                        value={formData.password}
                          onChange={(e) => {
                            setFormData({ ...formData, password: e.target.value });
                            if (errors.password) {
                              setErrors(prev => {
                                const newErrors = { ...prev };
                                delete newErrors.password;
                                return newErrors;
                              });
                            }
                          }}
                          className={`w-full px-4 py-3 bg-white/10 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            errors.password ? 'border-red-500' : 'border-white/20'
                          }`}
                        placeholder="Mínimo 6 caracteres"
                        required={!editingUser}
                        minLength={6}
                      />
                        {errors.password && (
                          <p className="text-red-400 text-xs mt-1">{errors.password}</p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Cargo e Status */}
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4">Configurações do Sistema</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-white font-medium mb-2">Cargo</label>
                      <select
                        value={formData.role}
                        onChange={(e) => setFormData({ ...formData, role: e.target.value as 'admin' | 'user' | 'manager' })}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      >
                        {roleOptions.map(role => (
                          <option key={role.value} value={role.value}>
                            {role.label}
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
                        {statusOptions.map(status => (
                          <option key={status.value} value={status.value}>
                            {status.label}
                          </option>
                        ))}
                      </select>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-4">
                    <button
                      type="button"
                      onClick={() => {
                        setShowModal(false);
                        resetForm();
                      }}
                      className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={formLoading}
                      className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-lg transition-all disabled:opacity-50"
                    >
                      {formLoading ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <Save className="w-5 h-5" />
                      )}
                      <span>{editingUser ? 'Atualizar' : 'Criar'}</span>
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Layout>
  );
}
