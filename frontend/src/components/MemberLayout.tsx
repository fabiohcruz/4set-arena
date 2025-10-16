'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { 
  Calendar, 
  ShoppingCart, 
  User, 
  LogOut, 
  Menu,
  X,
  Home,
  Clock,
  Package,
  Star,
  Crown,
  Shield,
  Search,
  Plus,
  Bell,
  Grid3X3,
  Users,
  CreditCard,
  Settings,
  Box,
  Activity,
  Zap,
  TrendingUp,
  Award,
  MapPin,
  Eye,
  ChevronRight,
  Trophy,
  Target,
  BarChart3,
  FileText
} from 'lucide-react';

interface MemberLayoutProps {
  children: React.ReactNode;
}

// Mapear ícones por nome
const getIconComponent = (iconName: string) => {
  const iconMap: { [key: string]: any } = {
    'Home': Home,
    'Calendar': Calendar,
    'ShoppingCart': ShoppingCart,
    'User': User,
    'Users': Users,
    'Trophy': Trophy,
    'Target': Target,
    'BarChart3': BarChart3,
    'FileText': FileText,
    'Settings': Settings,
    'Menu': Menu,
    'LayoutDashboard': Grid3X3,
    'MapPin': MapPin,
    'Package': Package,
    'DollarSign': CreditCard,
    'TrendingUp': TrendingUp,
    'Upload': Plus
  };
  return iconMap[iconName] || Menu;
};

// Cores para os itens do menu
const getItemColor = (index: number) => {
  const colors = [
    'text-blue-400',
    'text-green-400', 
    'text-yellow-400',
    'text-purple-400',
    'text-orange-400',
    'text-red-400',
    'text-indigo-400',
    'text-gray-400'
  ];
  return colors[index % colors.length];
};

export default function MemberLayout({ children }: MemberLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [memberData, setMemberData] = useState<any>(null);
  const [activeItem, setActiveItem] = useState('Dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Verificar se o membro está logado
    const token = localStorage.getItem('memberToken');
    const data = localStorage.getItem('memberData');

    if (!token || !data) {
      router.push('/member/login');
      return;
    }

    try {
      setMemberData(JSON.parse(data));
    } catch (error) {
      console.error('Erro ao carregar dados do membro:', error);
      router.push('/member/login');
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('memberToken');
    localStorage.removeItem('memberData');
    router.push('/member/login');
  };

  const getMembershipIcon = (type: string) => {
    switch (type) {
      case 'vip':
        return Crown;
      case 'premium':
        return Star;
      default:
        return Shield;
    }
  };

  const getMembershipColor = (type: string) => {
    switch (type) {
      case 'vip':
        return 'from-yellow-400 to-orange-500';
      case 'premium':
        return 'from-purple-400 to-pink-500';
      default:
        return 'from-blue-400 to-cyan-500';
    }
  };

  const getMembershipText = (type: string) => {
    switch (type) {
      case 'vip':
        return 'Membro VIP';
      case 'premium':
        return 'Membro Premium';
      default:
        return 'Membro Regular';
    }
  };

  // Menu items para membros (similar ao administrativo)
  const menuItems = [
    {
      id: 1,
      key: 'dashboard',
      label: 'Dashboard',
      path: '/member/dashboard',
      icon: 'Home',
      order_index: 1,
      children: []
    },
    {
      id: 2,
      key: 'reservations',
      label: 'Reservas',
      path: '/member/reservations',
      icon: 'Calendar',
      order_index: 2,
      children: []
    },
    {
      id: 3,
      key: 'orders',
      label: 'Pedidos',
      path: '/member/orders',
      icon: 'ShoppingCart',
      order_index: 3,
      children: []
    },
    {
      id: 4,
      key: 'profile',
      label: 'Perfil',
      path: '/member/profile',
      icon: 'User',
      order_index: 4,
      children: []
    }
  ];

  const handleItemClick = (item: any) => {
    setActiveItem(item.label);
    if (item.path) {
      router.push(item.path);
    }
  };

  const toggleExpanded = (itemKey: string) => {
    setExpandedItems((prev: Set<string>) => {
      const newSet = new Set(prev);
      if (newSet.has(itemKey)) {
        newSet.delete(itemKey);
      } else {
        newSet.add(itemKey);
      }
      return newSet;
    });
  };

  // Organizar itens do menu
  const organizeMenuItems = () => {
    const filteredItems = menuItems.filter(item => {
      // Filtrar por busca
      if (searchQuery) {
        return item.label.toLowerCase().includes(searchQuery.toLowerCase());
      }
      return true;
    });

    // Separar itens pais e filhos
    const parentItems = filteredItems.filter(item => !(item as any).parent_key);
    const childItems = filteredItems.filter(item => (item as any).parent_key);

    // Organizar filhos por pai
    const itemsWithChildren = parentItems.map(parent => {
      const children = childItems
        .filter(child => (child as any).parent_key === parent.key)
        .sort((a, b) => a.order_index - b.order_index)
        .map((item, index) => ({
          ...item,
          icon: getIconComponent(item.icon || 'Menu'),
          color: getItemColor(index)
        }));

      return {
        ...parent,
        icon: getIconComponent(parent.icon || 'Menu'),
        color: getItemColor(parentItems.indexOf(parent)),
        children: children
      };
    });

    return itemsWithChildren.sort((a, b) => a.order_index - b.order_index);
  };

  const organizedMenuItems = organizeMenuItems();

  const isActive = (path: string) => {
    return pathname === path || pathname.startsWith(path + '/');
  };

  if (!memberData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-white/30 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Side Menu */}
      <aside
        className={`fixed left-0 top-0 h-full bg-gradient-to-b from-slate-900/95 to-slate-800/95 backdrop-blur-xl border-r border-white/10 z-[60] overflow-hidden transition-all duration-300 ${sidebarOpen ? 'w-72' : 'w-0'}`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-white/10">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 flex items-center justify-center">
                <img
                  src="/images/logo.svg"
                  alt="4SET ARENA"
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">4SET ARENA</h1>
                <p className="text-xs text-white/60">Sistema Esportivo</p>
              </div>
            </div>
            
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors lg:hidden"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>

          {/* User Info */}
          <div className="p-6 border-b border-white/10">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-white font-medium">{memberData.full_name}</p>
                <p className="text-xs text-white/60">{getMembershipText(memberData.membership_type)}</p>
              </div>
            </div>
          </div>

          {/* Search */}
          <div className="p-4 border-b border-white/10">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/60" />
              <input
                type="text"
                placeholder="Buscar..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 text-sm focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-transparent transition-all duration-300"
              />
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {organizedMenuItems.map((item, index) => (
              <div key={item.id}>
                {/* Item Principal */}
                <button
                  onClick={() => {
                    if (item.children && item.children.length > 0) {
                      toggleExpanded(item.key);
                    } else {
                      handleItemClick(item);
                    }
                  }}
                  className={`w-full flex items-center justify-between p-3 rounded-xl transition-all duration-300 group ${
                    isActive(item.path || '')
                      ? 'bg-white/20 text-white'
                      : 'text-white/70 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <item.icon className={`w-5 h-5 ${item.color}`} />
                    <span className="font-medium">{item.label}</span>
                  </div>
                  {item.children && item.children.length > 0 ? (
                    <ChevronRight 
                      className={`w-4 h-4 transition-transform duration-200 ${
                        expandedItems.has(item.key) ? 'rotate-90' : ''
                      }`} 
                    />
                  ) : (
                    <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                  )}
                </button>

                {/* Subitens */}
                {item.children && item.children.length > 0 && expandedItems.has(item.key) && (
                  <div className="ml-4 mt-1 space-y-1">
                    {item.children.map((child, childIndex) => (
                      <button
                        key={child.id}
                        onClick={() => handleItemClick(child)}
                        className={`w-full flex items-center space-x-3 p-2 rounded-lg transition-all duration-300 group ${
                          isActive(child.path || '')
                            ? 'bg-white/15 text-white'
                            : 'text-white/60 hover:bg-white/5 hover:text-white/80'
                        }`}
                      >
                        <child.icon className={`w-4 h-4 ${child.color}`} />
                        <span className="text-sm font-medium">{child.label}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>

          {/* Quick Actions */}
          <div className="p-4 border-t border-white/10">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => {
                  router.push('/member/reservations');
                  setSidebarOpen(false);
                }}
                className="flex-1 p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-300"
              >
                <Plus className="w-4 h-4 text-white mx-auto" />
              </button>
              <button
                className="relative p-2 rounded-lg hover:bg-white/10 transition-all duration-300"
              >
                <Bell className="w-4 h-4 text-white/80" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
              </button>
              <button
                onClick={handleLogout}
                className="p-2 rounded-lg hover:bg-red-500/20 transition-all duration-300"
              >
                <LogOut className="w-4 h-4 text-red-400" />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[50] lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className={`transition-all duration-300 ${sidebarOpen ? 'lg:ml-72' : 'lg:ml-0'}`}>
        {/* Top Bar */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/5 backdrop-blur-sm border-b border-white/10 p-4 relative z-[40]"
        >
          <div className="flex items-center justify-between">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors lg:hidden"
            >
              <Menu className="w-6 h-6 text-white" />
            </button>
            
            <div className="flex items-center space-x-4">
              <div className="hidden md:block text-white/60 text-sm">
                <div className="flex items-center space-x-2">
                  <span>Bem-vindo ao 4SET ARENA</span>
                  <span className="text-white/40">•</span>
                  <span>{new Date().toLocaleDateString('pt-BR')}</span>
                </div>
              </div>
            </div>
            
            {/* User Profile Button */}
            <div className="flex items-center space-x-3">
              <div className="text-right">
                <p className="text-white font-medium text-sm">{memberData.full_name}</p>
                <p className="text-white/60 text-xs">{getMembershipText(memberData.membership_type)}</p>
              </div>
              <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
            </div>
          </div>
        </motion.header>

        {/* Page Content */}
        <motion.main
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-6"
        >
          {children}
        </motion.main>
      </div>
    </div>
  );
}
