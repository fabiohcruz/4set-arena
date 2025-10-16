'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Layout from '@/components/Layout';
import { getAuthToken } from '@/lib/auth';
import { 
  Search, 
  Edit, 
  Package, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle,
  Download,
  Upload,
  Plus,
  Minus,
  BarChart3,
  FileText,
  Settings
} from 'lucide-react';

interface Product {
  id: number;
  code: string;
  description: string;
  category: string;
  minStock: number;
  currentStock: number;
  cost: number;
  lastPurchaseDate?: string;
  lastCost?: number;
  barcode?: string;
  active: boolean;
}

interface StockMovement {
  id: number;
  productId: number;
  type: 'entrada' | 'saida' | 'ajuste';
  quantity: number;
  cost: number;
  reason: string;
  date: string;
  userId: number;
}

export default function EstoquePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [showAdjustmentModal, setShowAdjustmentModal] = useState(false);
  const [showMovementModal, setShowMovementModal] = useState(false);
  
  // Estados para ajuste de estoque
  const [newStock, setNewStock] = useState('0');
  const [newCost, setNewCost] = useState('0');
  const [adjustmentReason, setAdjustmentReason] = useState('');

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [search, selectedCategory]);

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
      if (selectedCategory !== 'Todos') params.append('category', selectedCategory);
      
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
      // Simular dados de estoque para demonstração
      const productsWithStock = data.map((product: any) => ({
        ...product,
        minStock: product.minStock || Math.floor(Math.random() * 50) + 10,
        currentStock: product.stock || Math.floor(Math.random() * 200) + 10,
        cost: parseFloat(product.costValue || product.unitValue) || 0,
        lastPurchaseDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toLocaleDateString('pt-BR'),
        lastCost: parseFloat(product.costValue || product.unitValue) || 0
      }));
      
      setProducts(Array.isArray(productsWithStock) ? productsWithStock : []);
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
        setCategories([]);
        return;
      }
      
      const response = await fetch('/api/products/categories', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setCategories(['Todos', ...(Array.isArray(data) ? data : [])]);
      }
    } catch (error) {
      console.error('Erro ao buscar categorias:', error);
      setCategories(['Todos']);
    }
  };

  const formatCurrency = (value: number | string) => {
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(numValue);
  };

  const getStockStatus = (current: number, minimum: number) => {
    if (current <= 0) return { status: 'out', color: 'text-red-600 bg-red-100', icon: AlertTriangle };
    if (current <= minimum) return { status: 'low', color: 'text-orange-600 bg-orange-100', icon: AlertTriangle };
    return { status: 'ok', color: 'text-green-600 bg-green-100', icon: Package };
  };

  const handleProductSelect = (product: Product) => {
    setSelectedProduct(product);
    setNewStock(product.currentStock.toString());
    setNewCost(product.cost.toString());
    setAdjustmentReason('');
  };

  const handleStockAdjustment = async () => {
    if (!selectedProduct) return;

    try {
      const token = getAuthToken();
      const response = await fetch(`/api/stock/adjust`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          productId: selectedProduct.id,
          newStock: parseInt(newStock) || 0,
          newCost: parseFloat(newCost) || 0,
          reason: adjustmentReason || 'Ajuste manual de estoque'
        }),
      });

      if (response.ok) {
        fetchProducts();
        setShowAdjustmentModal(false);
        alert('Estoque ajustado com sucesso!');
      }
    } catch (error) {
      console.error('Erro ao ajustar estoque:', error);
      alert('Erro ao ajustar estoque. Tente novamente.');
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.description.toLowerCase().includes(search.toLowerCase()) ||
                         product.code.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === 'Todos' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const lowStockProducts = products.filter(p => p.currentStock <= p.minStock && p.currentStock > 0);
  const outOfStockProducts = products.filter(p => p.currentStock <= 0);

  return (
    <Layout>
      <div className="min-h-screen gradient-bg p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-7xl mx-auto"
        >
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Estoque</h1>
            <p className="text-white/70">Controle completo de estoque e inventário</p>
          </div>

          {/* Cards de Resumo */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass p-6 rounded-xl"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/70 text-sm">Total de Produtos</p>
                  <p className="text-2xl font-bold text-white">{products.length}</p>
                </div>
                <Package className="w-8 h-8 text-blue-400" />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="glass p-6 rounded-xl"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/70 text-sm">Estoque Baixo</p>
                  <p className="text-2xl font-bold text-orange-400">{lowStockProducts.length}</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-orange-400" />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="glass p-6 rounded-xl"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/70 text-sm">Sem Estoque</p>
                  <p className="text-2xl font-bold text-red-400">{outOfStockProducts.length}</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-red-400" />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="glass p-6 rounded-xl"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/70 text-sm">Valor Total</p>
                  <p className="text-2xl font-bold text-green-400">
                    {formatCurrency(products.reduce((sum, p) => sum + (p.currentStock * p.cost), 0))}
                  </p>
                </div>
                <BarChart3 className="w-8 h-8 text-green-400" />
              </div>
            </motion.div>
          </div>

          {/* Filtros */}
          <div className="glass p-6 rounded-xl mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-white/70 text-sm mb-2">Grupo de Produto</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-400/50"
                >
                  {categories.map((category) => (
                    <option key={category} value={category} className="bg-slate-800">
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-white/70 text-sm mb-2">Pesquisar</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Pesquisar produtos..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-400/50"
                  />
                </div>
              </div>

              <div className="flex items-end space-x-2">
                <button
                  onClick={() => window.location.href = '/estoque/movimentacoes'}
                  className="flex-1 bg-green-500 hover:bg-green-600 text-white py-3 rounded-lg flex items-center justify-center space-x-2 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Entrada/Saída</span>
                </button>
                <button
                  onClick={() => window.location.href = '/estoque/importacao-xml'}
                  className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-lg flex items-center justify-center space-x-2 transition-colors"
                >
                  <Upload className="w-4 h-4" />
                  <span>Importar XML</span>
                </button>
              </div>
            </div>
          </div>

          {/* Seção de Ajuste de Produto Selecionado */}
          {selectedProduct && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass p-6 rounded-xl mb-6"
            >
              <h3 className="text-xl font-bold text-white mb-4">Ajustes - {selectedProduct.description}</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div>
                  <label className="block text-white/70 text-sm mb-2">Última Compra/Ajuste</label>
                  <input
                    type="text"
                    value={selectedProduct.lastPurchaseDate || 'N/A'}
                    readOnly
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white/70"
                  />
                </div>

                <div>
                  <label className="block text-white/70 text-sm mb-2">Último Custo</label>
                  <input
                    type="text"
                    value={formatCurrency(selectedProduct.lastCost || 0)}
                    readOnly
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white/70"
                  />
                </div>

                <div>
                  <label className="block text-white/70 text-sm mb-2">Saldo Atual</label>
                  <input
                    type="text"
                    value={selectedProduct.currentStock}
                    readOnly
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white/70"
                  />
                </div>

                <div>
                  <label className="block text-white/70 text-sm mb-2">Estoque Mínimo</label>
                  <input
                    type="number"
                    value={selectedProduct.minStock}
                    onChange={(e) => setSelectedProduct({...selectedProduct, minStock: parseInt(e.target.value) || 0})}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-400/50"
                  />
                </div>

                <div>
                  <label className="block text-white/70 text-sm mb-2">Novo Saldo</label>
                  <input
                    type="text"
                    value={newStock}
                    onChange={(e) => setNewStock(e.target.value)}
                    placeholder="Digite o novo saldo"
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-400/50"
                  />
                </div>

                <div>
                  <label className="block text-white/70 text-sm mb-2">Novo Custo</label>
                  <input
                    type="text"
                    value={newCost}
                    onChange={(e) => setNewCost(e.target.value)}
                    placeholder="Digite o novo custo"
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-400/50"
                  />
                </div>

                <div className="md:col-span-2 flex items-end">
                  <button
                    onClick={() => setShowAdjustmentModal(true)}
                    className="w-full bg-green-500 hover:bg-green-600 text-white py-3 rounded-lg flex items-center justify-center space-x-2 transition-colors"
                  >
                    <Settings className="w-4 h-4" />
                    <span>Ajustar</span>
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Tabela de Produtos */}
          <div className="glass rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-white/5">
                  <tr>
                    <th className="px-6 py-4 text-left text-white/70 font-medium">Código</th>
                    <th className="px-6 py-4 text-left text-white/70 font-medium">Descrição</th>
                    <th className="px-6 py-4 text-left text-white/70 font-medium">Grupo</th>
                    <th className="px-6 py-4 text-left text-white/70 font-medium">Estoque Mínimo</th>
                    <th className="px-6 py-4 text-left text-white/70 font-medium">Saldo em Estoque</th>
                    <th className="px-6 py-4 text-left text-white/70 font-medium">Custo</th>
                    <th className="px-6 py-4 text-left text-white/70 font-medium">Editar</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-8 text-center text-white/60">
                        Carregando produtos...
                      </td>
                    </tr>
                  ) : filteredProducts.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-8 text-center text-white/60">
                        Nenhum produto encontrado
                      </td>
                    </tr>
                  ) : (
                    filteredProducts.map((product, index) => {
                      const stockStatus = getStockStatus(product.currentStock, product.minStock);
                      const StatusIcon = stockStatus.icon;
                      
                      return (
                        <motion.tr
                          key={product.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className={`border-b border-white/10 hover:bg-white/5 cursor-pointer ${
                            selectedProduct?.id === product.id ? 'bg-blue-500/10' : ''
                          }`}
                          onClick={() => handleProductSelect(product)}
                        >
                          <td className="px-6 py-4 text-white font-mono">{product.code}</td>
                          <td className="px-6 py-4 text-white">{product.description}</td>
                          <td className="px-6 py-4 text-white/80">{product.category}</td>
                          <td className="px-6 py-4 text-white">{product.minStock}</td>
                          <td className="px-6 py-4">
                            <div className="flex items-center space-x-2">
                              <StatusIcon className={`w-4 h-4 ${stockStatus.color.includes('red') ? 'text-red-400' : stockStatus.color.includes('orange') ? 'text-orange-400' : 'text-green-400'}`} />
                              <span className={`${stockStatus.color.includes('red') ? 'text-red-400' : stockStatus.color.includes('orange') ? 'text-orange-400' : 'text-white'}`}>
                                {product.currentStock}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-white font-mono">{formatCurrency(product.cost)}</td>
                          <td className="px-6 py-4">
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                handleProductSelect(product);
                              }}
                              className="p-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg transition-colors"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                          </td>
                        </motion.tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Modal de Confirmação de Ajuste */}
      {showAdjustmentModal && selectedProduct && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl shadow-2xl w-full max-w-md"
          >
            <div className="p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Confirmar Ajuste de Estoque</h3>
              
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Motivo do Ajuste</label>
                  <input
                    type="text"
                    value={adjustmentReason}
                    onChange={(e) => setAdjustmentReason(e.target.value)}
                    placeholder="Ex: Inventário, perda, etc."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Saldo Atual:</span>
                      <span className="ml-2 font-medium">{selectedProduct.currentStock}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Novo Saldo:</span>
                      <span className="ml-2 font-medium">{newStock}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Custo Atual:</span>
                      <span className="ml-2 font-medium">{formatCurrency(selectedProduct.cost)}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Novo Custo:</span>
                      <span className="ml-2 font-medium">{formatCurrency(parseFloat(newCost) || 0)}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => setShowAdjustmentModal(false)}
                  className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-3 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleStockAdjustment}
                  className="flex-1 bg-green-500 hover:bg-green-600 text-white py-3 rounded-lg transition-colors"
                >
                  Confirmar Ajuste
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Modal de Entrada/Saída */}
      {showMovementModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl shadow-2xl w-full max-w-2xl"
          >
            <div className="p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Movimentação de Estoque</h3>
              <p className="text-gray-600 mb-6">Funcionalidade em desenvolvimento. Em breve você poderá registrar entradas e saídas de estoque.</p>
              
              <div className="flex justify-end">
                <button
                  onClick={() => setShowMovementModal(false)}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg transition-colors"
                >
                  Fechar
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

    </Layout>
  );
}
