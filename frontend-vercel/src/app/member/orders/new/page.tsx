'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import MemberLayout from '@/components/MemberLayout';
import { 
  ShoppingCart, 
  Plus, 
  Minus, 
  Search,
  MapPin,
  Phone,
  MessageSquare,
  CreditCard,
  ArrowLeft,
  CheckCircle,
  Package,
  Clock,
  Star,
  Filter,
  Store,
  Truck
} from 'lucide-react';

interface MenuItem {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  image?: string;
  available: boolean;
}

interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  total: number;
}

export default function NewOrderPage() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [deliveryType, setDeliveryType] = useState<'pickup' | 'delivery'>('pickup');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [deliveryPhone, setDeliveryPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadMenuItems();
  }, []);

  const loadMenuItems = async () => {
    try {
      // Simular dados do menu (substitua pela chamada real da API)
      const mockMenuItems: MenuItem[] = [
        {
          id: 1,
          name: 'Hambúrguer Clássico',
          description: 'Pão, carne, alface, tomate, cebola e molho especial',
          price: 18.00,
          category: 'Lanches',
          available: true
        },
        {
          id: 2,
          name: 'Hambúrguer Bacon',
          description: 'Pão, carne, bacon, queijo, alface, tomate e molho especial',
          price: 22.00,
          category: 'Lanches',
          available: true
        },
        {
          id: 3,
          name: 'Pizza Margherita',
          description: 'Molho de tomate, mussarela, manjericão e azeite',
          price: 28.00,
          category: 'Pizzas',
          available: true
        },
        {
          id: 4,
          name: 'Pizza Portuguesa',
          description: 'Molho de tomate, mussarela, presunto, ovos, cebola e azeitonas',
          price: 32.00,
          category: 'Pizzas',
          available: true
        },
        {
          id: 5,
          name: 'Salada Caesar',
          description: 'Alface, croutons, queijo parmesão e molho caesar',
          price: 22.00,
          category: 'Saladas',
          available: true
        },
        {
          id: 6,
          name: 'Batata Frita',
          description: 'Batata frita crocante com sal',
          price: 9.50,
          category: 'Acompanhamentos',
          available: true
        },
        {
          id: 7,
          name: 'Refrigerante',
          description: 'Coca-Cola, Pepsi, Fanta ou Sprite',
          price: 4.00,
          category: 'Bebidas',
          available: true
        },
        {
          id: 8,
          name: 'Suco Natural',
          description: 'Laranja, maracujá, abacaxi ou limão',
          price: 8.00,
          category: 'Bebidas',
          available: true
        }
      ];

      setMenuItems(mockMenuItems);
    } catch (error) {
      console.error('Erro ao carregar itens do menu:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredMenuItems = menuItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
    return matchesSearch && matchesCategory && item.available;
  });

  const categories = ['all', ...Array.from(new Set(menuItems.map(item => item.category)))];

  const addToCart = (item: MenuItem) => {
    setCart(prev => {
      const existingItem = prev.find(cartItem => cartItem.id === item.id);
      if (existingItem) {
        return prev.map(cartItem =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + 1, total: (cartItem.quantity + 1) * cartItem.price }
            : cartItem
        );
      } else {
        return [...prev, { id: item.id, name: item.name, price: item.price, quantity: 1, total: item.price }];
      }
    });
  };

  const removeFromCart = (itemId: number) => {
    setCart(prev => {
      const existingItem = prev.find(cartItem => cartItem.id === itemId);
      if (existingItem && existingItem.quantity > 1) {
        return prev.map(cartItem =>
          cartItem.id === itemId
            ? { ...cartItem, quantity: cartItem.quantity - 1, total: (cartItem.quantity - 1) * cartItem.price }
            : cartItem
        );
      } else {
        return prev.filter(cartItem => cartItem.id !== itemId);
      }
    });
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + item.total, 0);
  };

  const getCartItemCount = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const handleSubmitOrder = async () => {
    if (cart.length === 0) {
      alert('Adicione pelo menos um item ao carrinho');
      return;
    }

    if (deliveryType === 'delivery' && !deliveryAddress.trim()) {
      alert('Informe o endereço de entrega');
      return;
    }

    setSubmitting(true);
    try {
      // Aqui você faria a chamada para a API para criar o pedido
      const orderData = {
        items: cart,
        total: getCartTotal(),
        delivery_type: deliveryType,
        delivery_address: deliveryType === 'delivery' ? deliveryAddress : 'Balcão',
        delivery_phone: deliveryPhone,
        notes: notes
      };

      console.log('Dados do pedido:', orderData);
      
      // Simular delay da API
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      alert('Pedido realizado com sucesso!');
      
      // Redirecionar para a lista de pedidos
      window.location.href = '/member/orders';
    } catch (error) {
      console.error('Erro ao realizar pedido:', error);
      alert('Erro ao realizar pedido. Tente novamente.');
    } finally {
      setSubmitting(false);
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
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={() => window.history.back()}
              className="p-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-2xl transition-all duration-300"
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Novo Pedido</h1>
              <p className="text-white/70">Escolha seus itens e faça seu pedido</p>
            </div>
          </div>

          {/* Carrinho Flutuante */}
          {cart.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-r from-blue-500/20 to-purple-600/20 border border-blue-500/30 rounded-2xl p-4 mb-6"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                    <ShoppingCart className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-white font-semibold">{getCartItemCount()} item(s) no carrinho</p>
                    <p className="text-white/70 text-sm">Total: {formatCurrency(getCartTotal())}</p>
                  </div>
                </div>
                <button
                  onClick={handleSubmitOrder}
                  disabled={submitting}
                  className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 disabled:opacity-50 text-white font-semibold rounded-xl transition-all duration-300 flex items-center gap-2"
                >
                  {submitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Processando...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      Finalizar Pedido
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          )}
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Menu de Itens */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-2"
          >
            {/* Filtros */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-6 mb-6">
              <div className="flex flex-col md:flex-row gap-4">
                {/* Busca */}
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/60" />
                  <input
                    type="text"
                    placeholder="Buscar itens..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all duration-300"
                  />
                </div>

                {/* Filtro de Categoria */}
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/60" />
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="pl-12 pr-8 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all duration-300 appearance-none cursor-pointer"
                  >
                    <option value="all" className="bg-slate-800">Todas as Categorias</option>
                    {categories.slice(1).map(category => (
                      <option key={category} value={category} className="bg-slate-800">{category}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Lista de Itens */}
            <div className="space-y-4">
              {filteredMenuItems.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + index * 0.1 }}
                  className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-6 hover:bg-white/10 transition-all duration-300"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold text-white">{item.name}</h3>
                        <span className="px-3 py-1 bg-blue-500/20 border border-blue-500/30 rounded-full text-blue-400 text-sm font-medium">
                          {item.category}
                        </span>
                      </div>
                      <p className="text-white/70 text-sm mb-3">{item.description}</p>
                      <p className="text-2xl font-bold text-green-400">{formatCurrency(item.price)}</p>
                    </div>
                    <button
                      onClick={() => addToCart(item)}
                      className="p-4 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-2xl transition-all duration-300 flex items-center gap-2"
                    >
                      <Plus className="w-5 h-5" />
                      <span className="hidden sm:inline">Adicionar</span>
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Carrinho e Informações de Entrega */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-6"
          >
            {/* Carrinho */}
            {cart.length > 0 && (
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
                    <ShoppingCart className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-xl font-bold text-white">Carrinho</h2>
                </div>

                <div className="space-y-4 mb-6">
                  {cart.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-xl">
                      <div className="flex-1">
                        <p className="text-white font-medium">{item.name}</p>
                        <p className="text-white/60 text-sm">{formatCurrency(item.price)} cada</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="p-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded-lg transition-all duration-300"
                        >
                          <Minus className="w-4 h-4 text-red-400" />
                        </button>
                        <span className="text-white font-semibold min-w-[2rem] text-center">{item.quantity}</span>
                        <button
                          onClick={() => addToCart(menuItems.find(m => m.id === item.id)!)}
                          className="p-2 bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 rounded-lg transition-all duration-300"
                        >
                          <Plus className="w-4 h-4 text-green-400" />
                        </button>
                      </div>
                      <div className="text-right ml-4">
                        <p className="text-white font-semibold">{formatCurrency(item.total)}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t border-white/10 pt-4">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-white/70">Total:</span>
                    <span className="text-2xl font-bold text-white">{formatCurrency(getCartTotal())}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Informações de Entrega */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-blue-600 rounded-2xl flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-xl font-bold text-white">Entrega</h2>
              </div>

              <div className="space-y-6">
                {/* Tipo de Entrega */}
                <div>
                  <label className="block text-white/70 text-sm font-medium mb-3">
                    Como deseja receber seu pedido?
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setDeliveryType('pickup')}
                      className={`p-4 rounded-xl border transition-all duration-300 ${
                        deliveryType === 'pickup'
                          ? 'bg-blue-500/20 border-blue-500/50 text-blue-400'
                          : 'bg-white/5 border-white/20 text-white/70 hover:bg-white/10'
                      }`}
                    >
                      <div className="flex flex-col items-center gap-2">
                        <Store className="w-6 h-6" />
                        <span className="font-medium text-sm">Buscar no Balcão</span>
                      </div>
                    </button>
                    <button
                      onClick={() => setDeliveryType('delivery')}
                      className={`p-4 rounded-xl border transition-all duration-300 ${
                        deliveryType === 'delivery'
                          ? 'bg-green-500/20 border-green-500/50 text-green-400'
                          : 'bg-white/5 border-white/20 text-white/70 hover:bg-white/10'
                      }`}
                    >
                      <div className="flex flex-col items-center gap-2">
                        <Truck className="w-6 h-6" />
                        <span className="font-medium text-sm">Entregar</span>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Endereço de Entrega - Só aparece se for delivery */}
                {deliveryType === 'delivery' && (
                  <div>
                    <label className="block text-white/70 text-sm font-medium mb-2">
                      Endereço de Entrega *
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/60" />
                      <input
                        type="text"
                        placeholder="Ex: Quadra 1 - Mesa 5"
                        value={deliveryAddress}
                        onChange={(e) => setDeliveryAddress(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all duration-300"
                      />
                    </div>
                  </div>
                )}

                {/* Informação para pickup */}
                {deliveryType === 'pickup' && (
                  <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl">
                    <div className="flex items-center gap-3">
                      <Store className="w-5 h-5 text-blue-400" />
                      <div>
                        <p className="text-blue-400 font-medium text-sm">Buscar no Balcão</p>
                        <p className="text-blue-300/80 text-xs">Você receberá uma notificação quando seu pedido estiver pronto para retirada.</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Telefone */}
                <div>
                  <label className="block text-white/70 text-sm font-medium mb-2">
                    Telefone (opcional)
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/60" />
                    <input
                      type="tel"
                      placeholder="(11) 99999-9999"
                      value={deliveryPhone}
                      onChange={(e) => setDeliveryPhone(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all duration-300"
                    />
                  </div>
                </div>

                {/* Observações */}
                <div>
                  <label className="block text-white/70 text-sm font-medium mb-2">
                    Observações (opcional)
                  </label>
                  <div className="relative">
                    <MessageSquare className="absolute left-3 top-3 w-4 h-4 text-white/60" />
                    <textarea
                      placeholder="Ex: Sem cebola, bem temperado..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={3}
                      className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all duration-300 resize-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </MemberLayout>
  );
}
