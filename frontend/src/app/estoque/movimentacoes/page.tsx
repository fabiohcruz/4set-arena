'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Layout from '@/components/Layout';
import { getAuthToken } from '@/lib/auth';
import { 
  Search, 
  Plus, 
  Minus, 
  Package, 
  TrendingUp, 
  TrendingDown,
  Calendar,
  User,
  FileText,
  Filter,
  Download,
  Eye,
  ArrowLeft
} from 'lucide-react';

interface Product {
  id: number;
  code: string;
  description: string;
  category: string;
  currentStock: number;
  cost: number;
  barcode?: string;
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
  product?: {
    id: number;
    code: string;
    description: string;
  };
}

export default function MovimentacoesPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showMovementModal, setShowMovementModal] = useState(false);
  const [movementType, setMovementType] = useState<'entrada' | 'saida'>('entrada');
  
  // Estados do formulário de movimentação
  const [quantity, setQuantity] = useState('1');
  const [cost, setCost] = useState('0');
  const [reason, setReason] = useState('');

  useEffect(() => {
    fetchProducts();
    fetchMovements();
  }, [search, selectedType]);

  const fetchProducts = async () => {
    try {
      const token = getAuthToken();
      
      if (!token) {
        setProducts([]);
        return;
      }
      
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      
      const response = await fetch(`/api/products?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        const productsWithStock = data.map((product: any) => ({
          ...product,
          currentStock: product.stock || 0,
          cost: parseFloat(product.costValue || product.unitValue) || 0
        }));
        setProducts(Array.isArray(productsWithStock) ? productsWithStock : []);
      }
    } catch (error) {
      console.error('Erro ao buscar produtos:', error);
      setProducts([]);
    }
  };

  const fetchMovements = async () => {
    try {
      setLoading(true);
      const token = getAuthToken();
      
      if (!token) {
        setMovements([]);
        return;
      }
      
      const params = new URLSearchParams();
      if (selectedType !== 'all') params.append('type', selectedType);
      if (selectedProduct) params.append('productId', selectedProduct.id.toString());
      
      const response = await fetch(`/api/stock/movements?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setMovements(data.movements || []);
      }
    } catch (error) {
      console.error('Erro ao buscar movimentações:', error);
      setMovements([]);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number | string) => {
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(numValue);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleProductSelect = (product: Product) => {
    setSelectedProduct(product);
    setCost(product.cost.toString());
    setQuantity('1');
    setReason('');
  };

  const handleMovementSubmit = async () => {
    if (!selectedProduct) return;

    try {
      const token = getAuthToken();
      const endpoint = movementType === 'entrada' ? '/api/stock/add' : '/api/stock/remove';
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          productId: selectedProduct.id,
          quantity: parseInt(quantity) || 1,
          cost: movementType === 'entrada' ? (parseFloat(cost) || 0) : undefined,
          reason: reason || `${movementType === 'entrada' ? 'Entrada' : 'Saída'} de estoque`
        }),
      });

      if (response.ok) {
        const data = await response.json();
        alert(`${movementType === 'entrada' ? 'Entrada' : 'Saída'} registrada com sucesso!`);
        setShowMovementModal(false);
        setSelectedProduct(null);
        setQuantity('1');
        setCost('0');
        setReason('');
        fetchProducts();
        fetchMovements();
      } else {
        const errorData = await response.json();
        alert(`Erro: ${errorData.error}`);
      }
    } catch (error) {
      console.error('Erro ao registrar movimentação:', error);
      alert('Erro ao registrar movimentação. Tente novamente.');
    }
  };

  const getMovementIcon = (type: string) => {
    switch (type) {
      case 'entrada':
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'saida':
        return <TrendingDown className="w-4 h-4 text-red-500" />;
      case 'ajuste':
        return <Package className="w-4 h-4 text-blue-500" />;
      default:
        return <FileText className="w-4 h-4 text-gray-500" />;
    }
  };

  const getMovementColor = (type: string) => {
    switch (type) {
      case 'entrada':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'saida':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'ajuste':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.description.toLowerCase().includes(search.toLowerCase()) ||
                         product.code.toLowerCase().includes(search.toLowerCase());
    return matchesSearch;
  });

  const filteredMovements = movements.filter(movement => {
    if (selectedType === 'all') return true;
    return movement.type === selectedType;
  });

  const totalEntradas = movements.filter(m => m.type === 'entrada').reduce((sum, m) => sum + m.quantity, 0);
  const totalSaidas = movements.filter(m => m.type === 'saida').reduce((sum, m) => sum + m.quantity, 0);
  const totalAjustes = movements.filter(m => m.type === 'ajuste').length;

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
            <div className="flex items-center gap-4 mb-4">
              <button
                onClick={() => window.location.href = '/estoque'}
                className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Voltar</span>
              </button>
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Movimentações de Estoque</h1>
            <p className="text-white/70">Controle de entradas, saídas e ajustes de estoque</p>
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
                  <p className="text-white/70 text-sm">Total Entradas</p>
                  <p className="text-2xl font-bold text-green-400">{totalEntradas}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-400" />
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
                  <p className="text-white/70 text-sm">Total Saídas</p>
                  <p className="text-2xl font-bold text-red-400">{totalSaidas}</p>
                </div>
                <TrendingDown className="w-8 h-8 text-red-400" />
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
                  <p className="text-white/70 text-sm">Ajustes</p>
                  <p className="text-2xl font-bold text-blue-400">{totalAjustes}</p>
                </div>
                <Package className="w-8 h-8 text-blue-400" />
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
                  <p className="text-white/70 text-sm">Total Movimentações</p>
                  <p className="text-2xl font-bold text-white">{movements.length}</p>
                </div>
                <FileText className="w-8 h-8 text-white" />
              </div>
            </motion.div>
          </div>

          {/* Filtros e Ações */}
          <div className="glass p-6 rounded-xl mb-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-white/70 text-sm mb-2">Tipo de Movimentação</label>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-400/50"
                >
                  <option value="all" className="bg-slate-800">Todas</option>
                  <option value="entrada" className="bg-slate-800">Entradas</option>
                  <option value="saida" className="bg-slate-800">Saídas</option>
                  <option value="ajuste" className="bg-slate-800">Ajustes</option>
                </select>
              </div>

              <div>
                <label className="block text-white/70 text-sm mb-2">Buscar Produto</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Buscar produtos..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-400/50"
                  />
                </div>
              </div>

              <div className="flex items-end space-x-2">
                <button
                  onClick={() => {
                    setMovementType('entrada');
                    setShowMovementModal(true);
                  }}
                  className="flex-1 bg-green-500 hover:bg-green-600 text-white py-3 rounded-lg flex items-center justify-center space-x-2 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Entrada</span>
                </button>
                <button
                  onClick={() => {
                    setMovementType('saida');
                    setShowMovementModal(true);
                  }}
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white py-3 rounded-lg flex items-center justify-center space-x-2 transition-colors"
                >
                  <Minus className="w-4 h-4" />
                  <span>Saída</span>
                </button>
              </div>

              <div className="flex items-end">
                <button
                  onClick={fetchMovements}
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-lg flex items-center justify-center space-x-2 transition-colors"
                >
                  <Eye className="w-4 h-4" />
                  <span>Atualizar</span>
                </button>
              </div>
            </div>
          </div>

          {/* Lista de Produtos para Seleção */}
          {search && (
            <div className="glass rounded-xl mb-6 overflow-hidden">
              <div className="p-4 border-b border-white/10">
                <h3 className="text-lg font-semibold text-white">Produtos Encontrados</h3>
              </div>
              <div className="max-h-64 overflow-y-auto">
                {filteredProducts.length === 0 ? (
                  <div className="p-4 text-center text-white/60">
                    Nenhum produto encontrado
                  </div>
                ) : (
                  filteredProducts.map((product) => (
                    <div
                      key={product.id}
                      className="p-4 border-b border-white/10 hover:bg-white/5 cursor-pointer transition-colors"
                      onClick={() => handleProductSelect(product)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-white">{product.description}</p>
                          <p className="text-sm text-white/60">
                            {product.code} • Estoque: {product.currentStock} • {formatCurrency(product.cost)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-white/60">{product.category}</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Tabela de Movimentações */}
          <div className="glass rounded-xl overflow-hidden">
            <div className="p-4 border-b border-white/10">
              <h3 className="text-lg font-semibold text-white">Histórico de Movimentações</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-white/5">
                  <tr>
                    <th className="px-6 py-4 text-left text-white/70 font-medium">Tipo</th>
                    <th className="px-6 py-4 text-left text-white/70 font-medium">Produto</th>
                    <th className="px-6 py-4 text-left text-white/70 font-medium">Quantidade</th>
                    <th className="px-6 py-4 text-left text-white/70 font-medium">Custo</th>
                    <th className="px-6 py-4 text-left text-white/70 font-medium">Motivo</th>
                    <th className="px-6 py-4 text-left text-white/70 font-medium">Data</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-white/60">
                        Carregando movimentações...
                      </td>
                    </tr>
                  ) : filteredMovements.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-white/60">
                        Nenhuma movimentação encontrada
                      </td>
                    </tr>
                  ) : (
                    filteredMovements.map((movement, index) => (
                      <motion.tr
                        key={movement.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="border-b border-white/10 hover:bg-white/5"
                      >
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getMovementColor(movement.type)}`}>
                            {getMovementIcon(movement.type)}
                            <span className="ml-1 capitalize">{movement.type}</span>
                          </span>
                        </td>
                        <td className="px-6 py-4 text-white">
                          {movement.product ? (
                            <div>
                              <p className="font-medium">{movement.product.description}</p>
                              <p className="text-sm text-white/60">{movement.product.code}</p>
                            </div>
                          ) : (
                            `ID: ${movement.productId}`
                          )}
                        </td>
                        <td className="px-6 py-4 text-white font-mono">
                          {movement.type === 'saida' ? '-' : '+'}{movement.quantity}
                        </td>
                        <td className="px-6 py-4 text-white font-mono">
                          {formatCurrency(movement.cost)}
                        </td>
                        <td className="px-6 py-4 text-white/80">
                          {movement.reason}
                        </td>
                        <td className="px-6 py-4 text-white/60">
                          {formatDate(movement.date)}
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

      {/* Modal de Movimentação */}
      {showMovementModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl shadow-2xl w-full max-w-md"
          >
            <div className="p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                {movementType === 'entrada' ? 'Entrada de Estoque' : 'Saída de Estoque'}
              </h3>
              
              {!selectedProduct ? (
                <div className="space-y-4">
                  <p className="text-gray-600 mb-4">Selecione um produto primeiro usando a busca acima.</p>
                  <div className="flex justify-end">
                    <button
                      onClick={() => setShowMovementModal(false)}
                      className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg transition-colors"
                    >
                      Fechar
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">Produto Selecionado</h4>
                    <p className="text-gray-700">{selectedProduct.description}</p>
                    <p className="text-sm text-gray-500">
                      {selectedProduct.code} • Estoque atual: {selectedProduct.currentStock}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Quantidade
                    </label>
                    <input
                      type="text"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      placeholder="Digite a quantidade"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {movementType === 'entrada' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Custo Unitário
                      </label>
                      <input
                        type="text"
                        value={cost}
                        onChange={(e) => setCost(e.target.value)}
                        placeholder="Digite o custo unitário"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Motivo
                    </label>
                    <input
                      type="text"
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      placeholder={`Ex: ${movementType === 'entrada' ? 'Compra de produtos' : 'Venda de produtos'}`}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {movementType === 'saida' && selectedProduct.currentStock < (parseInt(quantity) || 0) && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                      <p className="text-red-800 text-sm">
                        ⚠️ Estoque insuficiente! Disponível: {selectedProduct.currentStock}
                      </p>
                    </div>
                  )}

                  <div className="flex space-x-3">
                    <button
                      onClick={() => setShowMovementModal(false)}
                      className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-3 rounded-lg transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleMovementSubmit}
                      disabled={movementType === 'saida' && selectedProduct.currentStock < (parseInt(quantity) || 0)}
                      className="flex-1 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white py-3 rounded-lg transition-colors"
                    >
                      {movementType === 'entrada' ? 'Registrar Entrada' : 'Registrar Saída'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </Layout>
  );
}
