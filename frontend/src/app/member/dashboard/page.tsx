'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import MemberLayout from '@/components/MemberLayout';
import { 
  Calendar, 
  ShoppingCart, 
  Clock, 
  TrendingUp,
  Package,
  Star,
  Plus,
  Eye,
  Home,
  Award,
  Zap,
  Activity,
  Users,
  MapPin,
  CreditCard,
  Bell,
  Settings
} from 'lucide-react';

interface MemberStats {
  totalReservations: number;
  activeReservations: number;
  totalOrders: number;
  pendingOrders: number;
}

export default function MemberDashboardPage() {
  const [stats, setStats] = useState<MemberStats>({
    totalReservations: 0,
    activeReservations: 0,
    totalOrders: 0,
    pendingOrders: 0
  });
  const [loading, setLoading] = useState(true);
  const [recentReservations, setRecentReservations] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('memberToken');
      const apiUrl = 'https://4set-arena-production.up.railway.app/api';
      
      // Buscar reservas
      const reservationsResponse = await fetch(`${apiUrl}/member/reservations`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (reservationsResponse.ok) {
        const reservationsData = await reservationsResponse.json();
        setRecentReservations(reservationsData.data.slice(0, 3));
        
        setStats(prev => ({
          ...prev,
          totalReservations: reservationsData.data.length,
          activeReservations: reservationsData.data.filter((r: any) => r.status === 'confirmed').length
        }));
      }

      // Buscar pedidos
      const ordersResponse = await fetch(`${apiUrl}/member/orders`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (ordersResponse.ok) {
        const ordersData = await ordersResponse.json();
        setRecentOrders(ordersData.data.slice(0, 3));
        
        setStats(prev => ({
          ...prev,
          totalOrders: ordersData.total,
          pendingOrders: ordersData.data.filter((o: any) => o.status === 'pending').length
        }));
      }
    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error);
    } finally {
      setLoading(false);
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'Confirmada';
      case 'pending':
        return 'Pendente';
      case 'cancelled':
        return 'Cancelada';
      case 'completed':
        return 'Concluída';
      default:
        return status;
    }
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
          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative mb-12"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-pink-600/20 rounded-3xl blur-3xl"></div>
            <div className="relative glass p-8 rounded-3xl border border-white/20 overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full blur-2xl"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl flex items-center justify-center shadow-2xl">
                      <Home className="w-10 h-10 text-white" />
                    </div>
                    <div>
                      <h1 className="text-4xl font-bold text-white mb-2">Bem-vindo de volta!</h1>
                      <p className="text-white/70 text-lg">Gerencie suas reservas e pedidos de forma fácil</p>
                    </div>
                  </div>
                  <div className="hidden md:flex items-center gap-4">
                    <div className="flex items-center gap-2 px-4 py-2 bg-green-500/20 border border-green-500/30 rounded-2xl">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                      <span className="text-green-400 text-sm font-medium">Online</span>
                    </div>
                    <button className="p-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-2xl transition-all duration-300">
                      <Bell className="w-5 h-5 text-white" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ scale: 1.05, rotateY: 5 }}
              className="group relative"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
              <div className="relative glass p-6 rounded-3xl border border-green-500/30 hover:border-green-400/50 transition-all duration-300">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <Clock className="w-7 h-7 text-white" />
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold text-white">{stats.activeReservations}</p>
                    <p className="text-green-400 text-sm font-medium">Ativas</p>
                  </div>
                </div>
                <p className="text-white/70 text-sm font-medium">Reservas Confirmadas</p>
                <div className="mt-3 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-green-400" />
                  <span className="text-green-400 text-xs">Próxima em 2h</span>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              whileHover={{ scale: 1.05, rotateY: 5 }}
              className="group relative"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/20 to-orange-600/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
              <div className="relative glass p-6 rounded-3xl border border-orange-500/30 hover:border-orange-400/50 transition-all duration-300">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <Package className="w-7 h-7 text-white" />
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold text-white">{stats.pendingOrders}</p>
                    <p className="text-orange-400 text-sm font-medium">Pendentes</p>
                  </div>
                </div>
                <p className="text-white/70 text-sm font-medium">Pedidos em Andamento</p>
                <div className="mt-3 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-orange-400" />
                  <span className="text-orange-400 text-xs">Preparando</span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mb-12"
          >
            <div className="flex items-center gap-4 mb-8">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-white">Ações Rápidas</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <motion.button
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => window.location.href = '/member/reservations'}
                className="group relative p-8 bg-gradient-to-br from-blue-500/10 to-blue-600/10 hover:from-blue-500/20 hover:to-blue-600/20 border border-blue-500/30 hover:border-blue-400/50 rounded-3xl transition-all duration-500 text-left"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative z-10">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mb-6 shadow-xl">
                    <Calendar className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Nova Reserva</h3>
                  <p className="text-white/70 text-sm mb-4">Reserve uma quadra para jogar</p>
                  <div className="flex items-center gap-2 text-blue-400 text-sm font-medium">
                    <span>Reservar agora</span>
                    <Plus className="w-4 h-4" />
                  </div>
                </div>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => window.location.href = '/member/orders/new'}
                className="group relative p-8 bg-gradient-to-br from-green-500/10 to-green-600/10 hover:from-green-500/20 hover:to-green-600/20 border border-green-500/30 hover:border-green-400/50 rounded-3xl transition-all duration-500 text-left"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative z-10">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mb-6 shadow-xl">
                    <ShoppingCart className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Fazer Pedido</h3>
                  <p className="text-white/70 text-sm mb-4">Peça da nossa cozinha</p>
                  <div className="flex items-center gap-2 text-green-400 text-sm font-medium">
                    <span>Pedir agora</span>
                    <Plus className="w-4 h-4" />
                  </div>
                </div>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => window.location.href = '/member/orders'}
                className="group relative p-8 bg-gradient-to-br from-purple-500/10 to-purple-600/10 hover:from-purple-500/20 hover:to-purple-600/20 border border-purple-500/30 hover:border-purple-400/50 rounded-3xl transition-all duration-500 text-left"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative z-10">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6 shadow-xl">
                    <Eye className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Meus Pedidos</h3>
                  <p className="text-white/70 text-sm mb-4">Acompanhe seus pedidos</p>
                  <div className="flex items-center gap-2 text-purple-400 text-sm font-medium">
                    <span>Ver pedidos</span>
                    <Eye className="w-4 h-4" />
                  </div>
                </div>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => window.location.href = '/member/profile'}
                className="group relative p-8 bg-gradient-to-br from-pink-500/10 to-pink-600/10 hover:from-pink-500/20 hover:to-pink-600/20 border border-pink-500/30 hover:border-pink-400/50 rounded-3xl transition-all duration-500 text-left"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative z-10">
                  <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-pink-600 rounded-2xl flex items-center justify-center mb-6 shadow-xl">
                    <Settings className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Perfil</h3>
                  <p className="text-white/70 text-sm mb-4">Gerencie sua conta</p>
                  <div className="flex items-center gap-2 text-pink-400 text-sm font-medium">
                    <span>Configurar</span>
                    <Settings className="w-4 h-4" />
                  </div>
                </div>
              </motion.button>
            </div>
          </motion.div>

          {/* Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Recent Reservations */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="glass p-8 rounded-3xl border border-white/20"
            >
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white">Reservas Recentes</h3>
                    <p className="text-white/60 text-sm">Suas últimas reservas</p>
                  </div>
                </div>
                <button
                  onClick={() => window.location.href = '/member/reservations'}
                  className="px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 rounded-2xl text-blue-400 text-sm font-medium transition-all duration-300"
                >
                  Ver todas
                </button>
              </div>
              
              {recentReservations.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center mx-auto mb-6">
                    <Calendar className="w-10 h-10 text-white/40" />
                  </div>
                  <p className="text-white/60 text-lg">Nenhuma reserva encontrada</p>
                  <p className="text-white/40 text-sm mt-2">Faça sua primeira reserva!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentReservations.map((reservation: any, index) => (
                    <motion.div
                      key={reservation.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6 + index * 0.1 }}
                      className="flex items-center justify-between p-6 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl transition-all duration-300 group"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                          <MapPin className="w-6 h-6 text-blue-400" />
                        </div>
                        <div>
                          <p className="text-white font-semibold text-lg">{reservation.court?.name}</p>
                          <p className="text-white/60 text-sm">{formatDate(reservation.startTime)}</p>
                        </div>
                      </div>
                      <span className={`px-4 py-2 rounded-2xl text-sm font-medium ${getStatusColor(reservation.status)}`}>
                        {getStatusText(reservation.status)}
                      </span>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Recent Orders */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
              className="glass p-8 rounded-3xl border border-white/20"
            >
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center">
                    <Package className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white">Pedidos Recentes</h3>
                    <p className="text-white/60 text-sm">Seus últimos pedidos</p>
                  </div>
                </div>
                <button
                  onClick={() => window.location.href = '/member/orders'}
                  className="px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 rounded-2xl text-purple-400 text-sm font-medium transition-all duration-300"
                >
                  Ver todos
                </button>
              </div>
              
              {recentOrders.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center mx-auto mb-6">
                    <Package className="w-10 h-10 text-white/40" />
                  </div>
                  <p className="text-white/60 text-lg">Nenhum pedido encontrado</p>
                  <p className="text-white/40 text-sm mt-2">Faça seu primeiro pedido!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentOrders.map((order: any, index) => (
                    <motion.div
                      key={order.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.7 + index * 0.1 }}
                      className="flex items-center justify-between p-6 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl transition-all duration-300 group"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                          <CreditCard className="w-6 h-6 text-purple-400" />
                        </div>
                        <div>
                          <p className="text-white font-semibold text-lg">Pedido #{order.id}</p>
                          <p className="text-white/60 text-sm">{formatCurrency(order.total)}</p>
                        </div>
                      </div>
                      <span className={`px-4 py-2 rounded-2xl text-sm font-medium ${getStatusColor(order.status)}`}>
                        {getStatusText(order.status)}
                      </span>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          </div>
        </div>
    </MemberLayout>
  );
}
