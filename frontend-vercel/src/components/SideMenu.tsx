'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useMenu } from '@/context/MenuContext';
import { 
  Home, 
  Users, 
  Trophy, 
  Target, 
  BarChart3, 
  FileText, 
  Settings, 
  Calendar,
  Menu,
  X,
  ChevronRight,
  Bell,
  Search,
  Plus,
  LayoutDashboard,
  MapPin,
  ShoppingCart,
  Package,
  DollarSign,
  TrendingUp,
  Upload
} from 'lucide-react';
import { MenuPosition } from './MenuConfig';

interface SideMenuProps {
  isOpen: boolean;
  onToggle: () => void;
  position: MenuPosition;
}

// Mapear ícones por nome
const getIconComponent = (iconName: string) => {
  const iconMap: { [key: string]: any } = {
    'Home': Home,
    'Users': Users,
    'Trophy': Trophy,
    'Target': Target,
    'BarChart3': BarChart3,
    'FileText': FileText,
    'Settings': Settings,
    'Calendar': Calendar,
    'Menu': Menu,
    'LayoutDashboard': LayoutDashboard,
    'MapPin': MapPin,
    'ShoppingCart': ShoppingCart,
    'Package': Package,
    'DollarSign': DollarSign,
    'TrendingUp': TrendingUp,
    'Upload': Upload
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

export default function SideMenu({ isOpen, onToggle, position }: SideMenuProps) {
  const { user } = useAuth();
  const { menuItems, loading } = useMenu();
  const router = useRouter();
  const pathname = usePathname();
  const [activeItem, setActiveItem] = useState('Dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

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

  // Organizar itens do menu em grupos (pais e filhos)
  const organizeMenuItems = () => {
    const filteredItems = menuItems.filter(item => {
      // Verificar se o item requer admin e se o usuário é admin
      if (item.requires_admin && user?.role !== 'admin') {
        return false;
      }
      
      // Filtrar por busca
      if (searchQuery) {
        return item.label.toLowerCase().includes(searchQuery.toLowerCase());
      }
      
      return true;
    });

    // Separar itens pais e filhos
    const parentItems = filteredItems.filter(item => !item.parent_key);
    const childItems = filteredItems.filter(item => item.parent_key);

    // Organizar filhos por pai
    const itemsWithChildren = parentItems.map(parent => {
      const children = childItems
        .filter(child => child.parent_key === parent.key)
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

  const isLeft = position === 'left';
  const isRight = position === 'right';

  return (
    <>
      {/* Mobile Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
            onClick={onToggle}
          />
        )}
      </AnimatePresence>

      {/* Side Menu */}
      <motion.aside
        initial={false}
        animate={{ 
          x: isOpen ? 0 : (isLeft ? '-100%' : '100%'),
          width: isOpen ? '280px' : '0px'
        }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className={`fixed ${isLeft ? 'left-0' : 'right-0'} top-0 h-full bg-gradient-to-b from-slate-900/95 to-slate-800/95 backdrop-blur-xl ${isLeft ? 'border-r' : 'border-l'} border-white/10 z-50 overflow-hidden`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-white/10">
            <motion.div
              initial={{ opacity: 0, x: isLeft ? -20 : 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="flex items-center space-x-3"
            >
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
            </motion.div>
            
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onToggle}
              className="lg:hidden p-2 rounded-lg hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5 text-white" />
            </motion.button>
          </div>

          {/* Search */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="p-4 border-b border-white/10"
          >
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
          </motion.div>


          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              </div>
            ) : (
              organizedMenuItems.map((item, index) => (
                <div key={item.id}>
                  {/* Item Principal */}
                  <motion.button
                    initial={{ opacity: 0, x: isLeft ? -20 : 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + index * 0.1 }}
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
                  </motion.button>

                  {/* Subitens */}
                  {item.children && item.children.length > 0 && (
                    <AnimatePresence>
                      {expandedItems.has(item.key) && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.2 }}
                          className="ml-4 mt-1 space-y-1"
                        >
                          {item.children.map((child, childIndex) => (
                            <motion.button
                              key={child.id}
                              initial={{ opacity: 0, x: isLeft ? -10 : 10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.1 * childIndex }}
                              onClick={() => handleItemClick(child)}
                              className={`w-full flex items-center space-x-3 p-2 rounded-lg transition-all duration-300 group ${
                                isActive(child.path || '')
                                  ? 'bg-white/15 text-white'
                                  : 'text-white/60 hover:bg-white/5 hover:text-white/80'
                              }`}
                            >
                              <child.icon className={`w-4 h-4 ${child.color}`} />
                              <span className="text-sm font-medium">{child.label}</span>
                            </motion.button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  )}
                </div>
              ))
            )}
          </nav>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="p-4 border-t border-white/10"
          >
            <div className="flex items-center space-x-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex-1 p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-300"
              >
                <Plus className="w-4 h-4 text-white mx-auto" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="relative p-2 rounded-lg hover:bg-white/10 transition-all duration-300"
              >
                <Bell className="w-4 h-4 text-white/80" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
              </motion.button>
            </div>
          </motion.div>
        </div>
      </motion.aside>
    </>
  );
}
