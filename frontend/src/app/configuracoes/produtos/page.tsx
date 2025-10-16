'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Layout from '@/components/Layout';
import { getAuthToken } from '@/lib/auth';
import { Search, Plus, Edit, Trash2, Package, DollarSign, Tag } from 'lucide-react';

interface Product {
  id: number;
  code: string;
  description: string;
  unitValue: string; // Corrigido: API retorna como string
  costValue: string; // Corrigido: API retorna como string
  taxSituation: string;
  ncm: string;
  active: boolean;
  category: string;
  barcode?: string | null;
  stock?: number;
  minStock?: number;
  createdAt?: string;
  updatedAt?: string;
}

export default function ProdutosPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showInactive, setShowInactive] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [categories, setCategories] = useState<string[]>([]);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [search, showInactive, selectedCategory]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const token = getAuthToken();
      
      if (!token) {
        console.warn('Token não encontrado para buscar produtos');
        setProducts([]);
        return;
      }
      
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (selectedCategory) params.append('category', selectedCategory);
      if (showInactive) params.append('active', 'false');
      
      const response = await fetch(`/api/products?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        console.error('Erro na resposta da API products:', response.status, response.statusText);
        setProducts([]);
        return;
      }
      
      const data = await response.json();
      setProducts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Erro ao buscar produtos:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const token = getAuthToken();
      
      if (!token) {
        console.warn('Token não encontrado para buscar categorias');
        setCategories([]);
        return;
      }
      
      const response = await fetch('/api/products/categories', {
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

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setShowEditModal(true);
  };

  const handleCloseEditModal = () => {
    setEditingProduct(null);
    setShowEditModal(false);
  };

  const getTaxSituationColor = (situation: string) => {
    switch (situation) {
      case 'Tributado 17%':
        return 'text-red-600 bg-red-100';
      case 'Isento':
        return 'text-green-600 bg-green-100';
      case 'Substituido':
        return 'text-blue-600 bg-blue-100';
      case 'Aliquota de serviço':
        return 'text-purple-600 bg-purple-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

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
              <span className="text-white">Produtos e serviços</span>
            </div>
            <h1 className="text-3xl font-bold text-white flex items-center space-x-3">
              <Package className="w-8 h-8 text-yellow-400" />
              <span>Produtos e Serviços</span>
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
                    placeholder="Pesquisar produtos..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-yellow-400/50 focus:border-transparent"
                  />
                </div>
                
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
              </div>

              <div className="flex items-center space-x-4">
                <label className="flex items-center space-x-2 text-white/70">
                  <input
                    type="checkbox"
                    checked={showInactive}
                    onChange={(e) => setShowInactive(e.target.checked)}
                    className="w-4 h-4 text-yellow-400 bg-white/10 border-white/20 rounded focus:ring-yellow-400/50"
                  />
                  <span>Exibir produtos inativos</span>
                </label>
                
                <button className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg flex items-center space-x-2 transition-colors">
                  <Plus className="w-5 h-5" />
                  <span>Incluir</span>
                </button>
              </div>
            </div>
          </div>

          {/* Products Table */}
          <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-white/10">
                  <tr>
                    <th className="px-6 py-4 text-left text-white/70 font-medium">Código</th>
                    <th className="px-6 py-4 text-left text-white/70 font-medium">Descrição</th>
                    <th className="px-6 py-4 text-left text-white/70 font-medium">Valor.U</th>
                    <th className="px-6 py-4 text-left text-white/70 font-medium">Valor.C</th>
                    <th className="px-6 py-4 text-left text-white/70 font-medium">Sit.Tributaria</th>
                    <th className="px-6 py-4 text-left text-white/70 font-medium">NCM</th>
                    <th className="px-6 py-4 text-left text-white/70 font-medium">Ativo</th>
                    <th className="px-6 py-4 text-left text-white/70 font-medium">Editar</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={8} className="px-6 py-12 text-center text-white/60">
                        <div className="flex items-center justify-center space-x-2">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-yellow-400"></div>
                          <span>Carregando produtos...</span>
                        </div>
                      </td>
                    </tr>
                  ) : products.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-6 py-12 text-center text-white/60">
                        Nenhum produto encontrado
                      </td>
                    </tr>
                  ) : (
                    products.map((product) => (
                      <motion.tr
                        key={product.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="border-b border-white/10 hover:bg-white/5 transition-colors"
                      >
                        <td className="px-6 py-4 text-white font-mono">{product.code}</td>
                        <td className="px-6 py-4 text-white">{product.description}</td>
                        <td className="px-6 py-4 text-white font-mono">{formatCurrency(product.unitValue)}</td>
                        <td className="px-6 py-4 text-white font-mono">{formatCurrency(product.costValue)}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTaxSituationColor(product.taxSituation)}`}>
                            {product.taxSituation}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-white/70 font-mono">{product.ncm || '-'}</td>
                        <td className="px-6 py-4">
                          <input
                            type="checkbox"
                            checked={product.active}
                            readOnly
                            className="w-4 h-4 text-yellow-400 bg-white/10 border-white/20 rounded focus:ring-yellow-400/50"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <button 
                            onClick={() => handleEditProduct(product)}
                            className="p-2 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400 rounded-lg transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                        </td>
                      </motion.tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Modal de Edição */}
      {showEditModal && editingProduct && (
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
                <h2 className="text-xl font-bold">Editar Produto</h2>
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
                    Descrição
                  </label>
                  <input
                    type="text"
                    value={editingProduct.description}
                    readOnly
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100 text-gray-600"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Valor Unitário
                  </label>
                  <input
                    type="text"
                    value={editingProduct.unitValue}
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
                    value={editingProduct.category}
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
                    // TODO: Implementar atualização do produto
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
