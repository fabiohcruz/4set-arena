'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import { useAuth } from '@/context/AuthContext';
import { menuAPI, MenuItem, CreateMenuItemData } from '@/lib/menu';
import { 
  ArrowLeft,
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  Eye,
  EyeOff,
  Menu,
  Settings,
  Users,
  Calendar,
  LayoutDashboard,
  MapPin,
  ChevronUp,
  ChevronDown,
  AlertTriangle
} from 'lucide-react';

const iconOptions = [
  { value: 'LayoutDashboard', label: 'Dashboard', icon: LayoutDashboard },
  { value: 'Calendar', label: 'Reservas', icon: Calendar },
  { value: 'Users', label: 'Clientes', icon: Users },
  { value: 'Settings', label: 'Configurações', icon: Settings },
  { value: 'MapPin', label: 'Quadras', icon: MapPin },
  { value: 'Menu', label: 'Menu', icon: Menu }
];

export default function GestaoMenuPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [formData, setFormData] = useState<CreateMenuItemData>({
    key: '',
    label: '',
    icon: '',
    path: '',
    order_index: 0,
    is_enabled: true,
    requires_admin: false,
    parent_key: ''
  });
  const [formLoading, setFormLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Verificar se o usuário é admin
  useEffect(() => {
    if (user && user.role !== 'admin') {
      router.push('/dashboard');
    }
  }, [user, router]);

  // Carregar itens do menu
  const loadMenuItems = async () => {
    try {
      setLoading(true);
      const response = await menuAPI.getAllMenuItems();
      if (response.success) {
        setMenuItems(response.data);
      } else {
        setError('Erro ao carregar itens do menu');
      }
    } catch (error) {
      console.error('Erro ao carregar itens do menu:', error);
      setError('Erro ao carregar itens do menu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMenuItems();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setError(null);

    try {
      if (editingItem) {
        // Editar item existente
        const response = await menuAPI.updateMenuItem(editingItem.id, formData);
        if (response.success) {
          await loadMenuItems();
          setShowModal(false);
          setEditingItem(null);
          resetForm();
        } else {
          setError('Erro ao atualizar item do menu');
        }
      } else {
        // Criar novo item
        const response = await menuAPI.createMenuItem(formData);
        if (response.success) {
          await loadMenuItems();
          setShowModal(false);
          resetForm();
        } else {
          setError('Erro ao criar item do menu');
        }
      }
    } catch (error) {
      console.error('Erro ao salvar item:', error);
      setError('Erro ao salvar item do menu');
    } finally {
      setFormLoading(false);
    }
  };

  const handleEdit = (item: MenuItem) => {
    setEditingItem(item);
    setFormData({
      key: item.key,
      label: item.label,
      icon: item.icon || '',
      path: item.path || '',
      order_index: item.order_index,
      is_enabled: item.is_enabled,
      requires_admin: item.requires_admin,
      parent_key: item.parent_key || ''
    });
    setShowModal(true);
  };

  const handleToggleStatus = async (itemId: number) => {
    try {
      const response = await menuAPI.toggleMenuItemStatus(itemId);
      if (response.success) {
        await loadMenuItems();
      }
    } catch (error) {
      console.error('Erro ao alterar status:', error);
    }
  };

  const handleDelete = async (itemId: number) => {
    if (confirm('Tem certeza que deseja excluir este item do menu?')) {
      try {
        const response = await menuAPI.deleteMenuItem(itemId);
        if (response.success) {
          await loadMenuItems();
        }
      } catch (error) {
        console.error('Erro ao deletar item:', error);
      }
    }
  };

  const handleMoveUp = async (index: number) => {
    if (index > 0) {
      const newItems = [...menuItems];
      const item = newItems[index];
      newItems[index] = newItems[index - 1];
      newItems[index - 1] = item;
      
      // Atualizar order_index
      const orderItems = newItems.map((item, idx) => ({
        id: item.id,
        order_index: idx + 1
      }));
      
      try {
        await menuAPI.updateMenuOrder(orderItems);
        await loadMenuItems();
      } catch (error) {
        console.error('Erro ao atualizar ordem:', error);
      }
    }
  };

  const handleMoveDown = async (index: number) => {
    if (index < menuItems.length - 1) {
      const newItems = [...menuItems];
      const item = newItems[index];
      newItems[index] = newItems[index + 1];
      newItems[index + 1] = item;
      
      // Atualizar order_index
      const orderItems = newItems.map((item, idx) => ({
        id: item.id,
        order_index: idx + 1
      }));
      
      try {
        await menuAPI.updateMenuOrder(orderItems);
        await loadMenuItems();
      } catch (error) {
        console.error('Erro ao atualizar ordem:', error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      key: '',
      label: '',
      icon: '',
      path: '',
      order_index: 0,
      is_enabled: true,
      requires_admin: false,
      parent_key: ''
    });
    setEditingItem(null);
    setError(null);
  };

  const getIconComponent = (iconName: string) => {
    const iconOption = iconOptions.find(option => option.value === iconName);
    return iconOption ? iconOption.icon : Menu;
  };

  // Verificar se o usuário é admin
  if (user && user.role !== 'admin') {
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
            <p className="text-white text-lg">Carregando itens do menu...</p>
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
                <h1 className="text-3xl font-bold text-white">Gestão do Menu</h1>
                <p className="text-gray-300">Configure os itens do menu principal</p>
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
              <span className="text-white font-medium">Novo Item</span>
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-red-400" />
              <span className="text-red-400">{error}</span>
            </div>
          )}

          {/* Menu Items List */}
          <div className="grid gap-4">
            {menuItems.map((item, index) => {
              const IconComponent = getIconComponent(item.icon || 'Menu');
              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-6"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex flex-col space-y-1">
                        <button
                          onClick={() => handleMoveUp(index)}
                          disabled={index === 0}
                          className="p-1 rounded hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <ChevronUp className="w-4 h-4 text-white" />
                        </button>
                        <button
                          onClick={() => handleMoveDown(index)}
                          disabled={index === menuItems.length - 1}
                          className="p-1 rounded hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <ChevronDown className="w-4 h-4 text-white" />
                        </button>
                      </div>
                      
                      <div className={`p-3 rounded-lg ${item.is_enabled ? 'bg-green-500/20' : 'bg-gray-500/20'}`}>
                        <IconComponent className="w-6 h-6 text-white" />
                      </div>
                      
                      <div>
                        <h3 className="text-white font-semibold text-lg">{item.label}</h3>
                        <div className="flex items-center space-x-4 text-sm text-gray-300">
                          <span>Chave: {item.key}</span>
                          {item.path && <span>Rota: {item.path}</span>}
                          <span>Ordem: {item.order_index}</span>
                        </div>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            item.is_enabled ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                          }`}>
                            {item.is_enabled ? 'Habilitado' : 'Desabilitado'}
                          </span>
                          {item.requires_admin && (
                            <span className="px-2 py-1 rounded-full text-xs bg-yellow-500/20 text-yellow-400">
                              Admin
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleToggleStatus(item.id)}
                        className={`p-2 rounded-lg transition-colors ${
                          item.is_enabled 
                            ? 'bg-red-500/20 hover:bg-red-500/30 text-red-400' 
                            : 'bg-green-500/20 hover:bg-green-500/30 text-green-400'
                        }`}
                        title={item.is_enabled ? 'Desabilitar' : 'Habilitar'}
                      >
                        {item.is_enabled ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                      
                      <button
                        onClick={() => handleEdit(item)}
                        className="p-2 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 transition-colors"
                        title="Editar"
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                      
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="p-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400 transition-colors"
                        title="Excluir"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Empty State */}
          {menuItems.length === 0 && (
            <div className="text-center py-12">
              <Menu className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Nenhum item encontrado</h3>
              <p className="text-gray-400 mb-6">Comece criando um novo item do menu</p>
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
                    {editingItem ? 'Editar Item do Menu' : 'Novo Item do Menu'}
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

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-white font-medium mb-2">Chave *</label>
                      <input
                        type="text"
                        value={formData.key}
                        onChange={(e) => setFormData({ ...formData, key: e.target.value })}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Ex: dashboard"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-white font-medium mb-2">Label *</label>
                      <input
                        type="text"
                        value={formData.label}
                        onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Ex: Dashboard"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-white font-medium mb-2">Ícone</label>
                      <select
                        value={formData.icon}
                        onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Selecione um ícone</option>
                        {iconOptions.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-white font-medium mb-2">Rota</label>
                      <input
                        type="text"
                        value={formData.path}
                        onChange={(e) => setFormData({ ...formData, path: e.target.value })}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Ex: /dashboard"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-white font-medium mb-2">Ordem</label>
                    <input
                      type="number"
                      value={formData.order_index}
                      onChange={(e) => setFormData({ ...formData, order_index: parseInt(e.target.value) || 0 })}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min="0"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        id="is_enabled"
                        checked={formData.is_enabled}
                        onChange={(e) => setFormData({ ...formData, is_enabled: e.target.checked })}
                        className="w-5 h-5 text-blue-600 bg-white/10 border-white/20 rounded focus:ring-blue-500"
                      />
                      <label htmlFor="is_enabled" className="text-white font-medium">
                        Habilitado
                      </label>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        id="requires_admin"
                        checked={formData.requires_admin}
                        onChange={(e) => setFormData({ ...formData, requires_admin: e.target.checked })}
                        className="w-5 h-5 text-blue-600 bg-white/10 border-white/20 rounded focus:ring-blue-500"
                      />
                      <label htmlFor="requires_admin" className="text-white font-medium">
                        Requer Admin
                      </label>
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
                      <span>{editingItem ? 'Atualizar' : 'Criar'}</span>
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
