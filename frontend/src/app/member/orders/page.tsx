'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import MemberLayout from '@/components/MemberLayout';
import PaymentButton from '@/components/PaymentButton';
import { 
  ShoppingCart, 
  Package, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Eye,
  Plus,
  Filter,
  Search,
  Calendar,
  CreditCard,
  MapPin,
  Phone,
  User,
  Star,
  AlertCircle
} from 'lucide-react';

interface OrderItem {
  id: number;
  name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

interface Order {
  id: number;
  order_number: string;
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'cancelled';
  total: number;
  items: OrderItem[];
  created_at: string;
  updated_at: string;
  notes?: string;
  delivery_address?: string;
  delivery_phone?: string;
}

export default function MemberOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const token = localStorage.getItem('memberToken');
      
      // Simular dados de pedidos (substitua pela chamada real da API)
      const mockOrders: Order[] = [
        {
          id: 1,
          order_number: 'ORD-001',
          status: 'delivered',
          total: 45.50,
          items: [
            { id: 1, name: 'Hambúrguer Clássico', quantity: 2, unit_price: 18.00, total_price: 36.00 },
            { id: 2, name: 'Batata Frita', quantity: 1, unit_price: 9.50, total_price: 9.50 }
          ],
          created_at: '2024-01-15T10:30:00Z',
          updated_at: '2024-01-15T11:45:00Z',
          notes: 'Sem cebola no hambúrguer',
          delivery_address: 'Quadra 1 - Mesa 5',
          delivery_phone: '(11) 99999-9999'
        },
        {
          id: 2,
          order_number: 'ORD-002',
          status: 'preparing',
          total: 32.00,
          items: [
            { id: 3, name: 'Pizza Margherita', quantity: 1, unit_price: 28.00, total_price: 28.00 },
            { id: 4, name: 'Refrigerante', quantity: 2, unit_price: 4.00, total_price: 8.00 }
          ],
          created_at: '2024-01-15T14:20:00Z',
          updated_at: '2024-01-15T14:25:00Z',
          delivery_address: 'Quadra 2 - Mesa 3'
        },
        {
          id: 3,
          order_number: 'ORD-003',
          status: 'pending',
          total: 25.00,
          items: [
            { id: 5, name: 'Salada Caesar', quantity: 1, unit_price: 22.00, total_price: 22.00 },
            { id: 6, name: 'Suco Natural', quantity: 1, unit_price: 8.00, total_price: 8.00 }
          ],
          created_at: '2024-01-15T16:10:00Z',
          updated_at: '2024-01-15T16:10:00Z'
        }
      ];

      setOrders(mockOrders);
    } catch (error) {
      console.error('Erro ao carregar pedidos:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return Clock;
      case 'confirmed':
        return CheckCircle;
      case 'preparing':
        return Package;
      case 'ready':
        return AlertCircle;
      case 'delivered':
        return CheckCircle;
      case 'cancelled':
        return XCircle;
      default:
        return Clock;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'preparing':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'ready':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'delivered':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Pendente';
      case 'confirmed':
        return 'Confirmado';
      case 'preparing':
        return 'Preparando';
      case 'ready':
        return 'Pronto';
      case 'delivered':
        return 'Entregue';
      case 'cancelled':
        return 'Cancelado';
      default:
        return status;
    }
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

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.order_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         order.items.some(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  }).sort((a, b) => {
    // Definir prioridade dos status
    const statusPriority = {
      'pending': 1,
      'confirmed': 2,
      'preparing': 3,
      'ready': 4,
      'delivered': 5,
      'cancelled': 6
    };
    
    // Ordenar por prioridade do status primeiro
    const statusDiff = statusPriority[a.status] - statusPriority[b.status];
    if (statusDiff !== 0) {
      return statusDiff;
    }
    
    // Se o status for igual, ordenar por data (mais recente primeiro)
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  const openOrderModal = (order: Order) => {
    setSelectedOrder(order);
    setShowModal(true);
  };

  const closeOrderModal = () => {
    setSelectedOrder(null);
    setShowModal(false);
  };

  if (loading) {
    return (
      <MemberLayout>
        <div className="flex items-center justify-center h-64">
          <div className="w-16 h-16 border-4 border-white/30 border-t-white rounded-full animate-spin" />
        </div>
      </MemberLayout>
    );
  }

  return (
    <MemberLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Meus Pedidos</h1>
              <p className="text-white/70">
                Acompanhe seus pedidos e histórico
                {orders.filter(order => order.status === 'pending').length > 0 && (
                  <span className="ml-2 px-3 py-1 bg-yellow-500/20 border border-yellow-500/30 rounded-full text-yellow-400 text-sm font-medium">
                    {orders.filter(order => order.status === 'pending').length} pendente(s)
                  </span>
                )}
              </p>
            </div>
            <button
              onClick={() => window.location.href = '/member/orders/new'}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold rounded-2xl transition-all duration-300 flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Novo Pedido
            </button>
          </div>
        </motion.div>

        {/* Filtros e Busca */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-6">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Busca */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/60" />
                <input
                  type="text"
                  placeholder="Buscar por número do pedido ou item..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all duration-300"
                />
              </div>

              {/* Filtro de Status */}
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/60" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="pl-12 pr-8 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all duration-300 appearance-none cursor-pointer"
                >
                  <option value="all" className="bg-slate-800">Todos os Status</option>
                  <option value="pending" className="bg-slate-800">Pendente</option>
                  <option value="confirmed" className="bg-slate-800">Confirmado</option>
                  <option value="preparing" className="bg-slate-800">Preparando</option>
                  <option value="ready" className="bg-slate-800">Pronto</option>
                  <option value="delivered" className="bg-slate-800">Entregue</option>
                  <option value="cancelled" className="bg-slate-800">Cancelado</option>
                </select>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Lista de Pedidos */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-6"
        >
          {filteredOrders.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <ShoppingCart className="w-10 h-10 text-white/40" />
              </div>
              <p className="text-white/60 text-lg">Nenhum pedido encontrado</p>
              <p className="text-white/40 text-sm mt-2">
                {searchQuery || statusFilter !== 'all' 
                  ? 'Tente ajustar os filtros de busca' 
                  : 'Faça seu primeiro pedido!'
                }
              </p>
            </div>
          ) : (
            filteredOrders.map((order, index) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                className={`bg-white/5 backdrop-blur-sm border rounded-3xl p-6 hover:bg-white/10 transition-all duration-300 ${
                  order.status === 'pending' 
                    ? 'border-yellow-500/50 bg-yellow-500/5' 
                    : 'border-white/10'
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center relative ${
                      order.status === 'pending' 
                        ? 'bg-gradient-to-br from-yellow-500 to-orange-600' 
                        : 'bg-gradient-to-br from-blue-500 to-purple-600'
                    }`}>
                      <ShoppingCart className="w-6 h-6 text-white" />
                      {order.status === 'pending' && (
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full animate-pulse"></div>
                      )}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">{order.order_number}</h3>
                      <p className="text-white/60 text-sm">{formatDate(order.created_at)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`px-4 py-2 rounded-2xl text-sm font-medium border ${getStatusColor(order.status)}`}>
                      {getStatusText(order.status)}
                    </span>
                    <button
                      onClick={() => openOrderModal(order)}
                      className="p-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-2xl transition-all duration-300"
                    >
                      <Eye className="w-5 h-5 text-white" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <p className="text-white/70 text-sm">Total</p>
                    <p className="text-white font-semibold text-lg">{formatCurrency(order.total)}</p>
                  </div>
                  <div>
                    <p className="text-white/70 text-sm">Itens</p>
                    <p className="text-white font-semibold">{order.items.length} item(s)</p>
                  </div>
                  <div>
                    <p className="text-white/70 text-sm">Última Atualização</p>
                    <p className="text-white font-semibold">{formatDate(order.updated_at)}</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  {order.items.slice(0, 3).map((item) => (
                    <span
                      key={item.id}
                      className="px-3 py-1 bg-white/10 border border-white/20 rounded-xl text-white/80 text-sm"
                    >
                      {item.quantity}x {item.name}
                    </span>
                  ))}
                  {order.items.length > 3 && (
                    <span className="px-3 py-1 bg-white/10 border border-white/20 rounded-xl text-white/80 text-sm">
                      +{order.items.length - 3} mais
                    </span>
                  )}
                </div>

                {/* Botão de Pagamento para pedidos pendentes */}
                {order.status === 'pending' && (
                  <div className="mt-4">
                    <PaymentButton
                      type="order"
                      itemId={order.id}
                      amount={order.total}
                      description={`Pedido ${order.order_number}`}
                      onSuccess={() => {
                        loadOrders(); // Recarregar pedidos após pagamento
                      }}
                      onError={(error) => {
                        alert(`Erro ao processar pagamento: ${error}`);
                      }}
                    />
                  </div>
                )}
              </motion.div>
            ))
          )}
        </motion.div>

        {/* Modal de Detalhes do Pedido */}
        {showModal && selectedOrder && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-slate-800 border border-white/20 rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">Detalhes do Pedido</h2>
                <button
                  onClick={closeOrderModal}
                  className="p-2 hover:bg-white/10 rounded-xl transition-colors"
                >
                  <XCircle className="w-6 h-6 text-white/60" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Informações do Pedido */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-white/70 text-sm">Número do Pedido</p>
                    <p className="text-white font-semibold">{selectedOrder.order_number}</p>
                  </div>
                  <div>
                    <p className="text-white/70 text-sm">Status</p>
                    <span className={`px-3 py-1 rounded-xl text-sm font-medium border ${getStatusColor(selectedOrder.status)}`}>
                      {getStatusText(selectedOrder.status)}
                    </span>
                  </div>
                  <div>
                    <p className="text-white/70 text-sm">Data do Pedido</p>
                    <p className="text-white font-semibold">{formatDate(selectedOrder.created_at)}</p>
                  </div>
                  <div>
                    <p className="text-white/70 text-sm">Total</p>
                    <p className="text-white font-semibold text-lg">{formatCurrency(selectedOrder.total)}</p>
                  </div>
                </div>

                {/* Itens do Pedido */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">Itens do Pedido</h3>
                  <div className="space-y-3">
                    {selectedOrder.items.map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-xl">
                        <div>
                          <p className="text-white font-medium">{item.name}</p>
                          <p className="text-white/60 text-sm">Quantidade: {item.quantity}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-white font-semibold">{formatCurrency(item.unit_price)}</p>
                          <p className="text-white/60 text-sm">Total: {formatCurrency(item.total_price)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Informações de Entrega */}
                {selectedOrder.delivery_address && (
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4">Informações de Entrega</h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 p-4 bg-white/5 border border-white/10 rounded-xl">
                        <MapPin className="w-5 h-5 text-blue-400" />
                        <div>
                          <p className="text-white/70 text-sm">Endereço</p>
                          <p className="text-white font-medium">{selectedOrder.delivery_address}</p>
                        </div>
                      </div>
                      {selectedOrder.delivery_phone && (
                        <div className="flex items-center gap-3 p-4 bg-white/5 border border-white/10 rounded-xl">
                          <Phone className="w-5 h-5 text-green-400" />
                          <div>
                            <p className="text-white/70 text-sm">Telefone</p>
                            <p className="text-white font-medium">{selectedOrder.delivery_phone}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Observações */}
                {selectedOrder.notes && (
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4">Observações</h3>
                    <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
                      <p className="text-white">{selectedOrder.notes}</p>
                    </div>
                  </div>
                )}

                {/* Botão de Pagamento no Modal */}
                {selectedOrder.status === 'pending' && (
                  <div className="mt-6 p-6 bg-yellow-500/10 border border-yellow-500/30 rounded-2xl">
                    <div className="flex items-center gap-3 mb-4">
                      <AlertCircle className="w-6 h-6 text-yellow-400" />
                      <div>
                        <p className="text-white font-semibold">Pagamento Pendente</p>
                        <p className="text-white/60 text-sm">Complete o pagamento para confirmar seu pedido</p>
                      </div>
                    </div>
                    <PaymentButton
                      type="order"
                      itemId={selectedOrder.id}
                      amount={selectedOrder.total}
                      description={`Pedido ${selectedOrder.order_number}`}
                      onSuccess={() => {
                        closeOrderModal();
                        loadOrders();
                      }}
                      onError={(error) => {
                        alert(`Erro ao processar pagamento: ${error}`);
                      }}
                    />
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </MemberLayout>
  );
}
