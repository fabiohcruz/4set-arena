'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter, usePathname } from 'next/navigation';
import UserProfileButton from './UserProfileButton';
// Removido imports para evitar dependência circular
import { 
  Home, 
  Users, 
  Trophy, 
  Target, 
  BarChart3, 
  FileText, 
  Settings, 
  Calendar,
  User as UserIcon,
  Bell,
  Search,
  Plus,
  ChevronDown
} from 'lucide-react';

interface MenuItem {
  label: string;
  href: string;
  icon: React.ComponentType<any>;
  color: string;
  submenu?: { label: string; href: string }[];
}

const menuItems: MenuItem[] = [
  { 
    label: 'Dashboard', 
    href: '/dashboard', 
    icon: Home, 
    color: 'text-blue-400',
    submenu: [
      { label: 'Visão Geral', href: '/dashboard' },
      { label: 'Resumo Executivo', href: '/dashboard/resumo' },
      { label: 'Atividades Recentes', href: '/dashboard/atividades' }
    ]
  },
  { 
    label: 'Clientes', 
    href: '/clientes', 
    icon: Users, 
    color: 'text-green-400',
    submenu: [
      { label: 'Lista de Clientes', href: '/clientes' },
      { label: 'Novo Cliente', href: '/clientes/novo' },
      { label: 'Categorias', href: '/clientes/categorias' },
      { label: 'Histórico Médico', href: '/clientes/medico' }
    ]
  },
  { 
    label: 'Competições', 
    href: '/competicoes', 
    icon: Trophy, 
    color: 'text-yellow-400',
    submenu: [
      { label: 'Torneios Ativos', href: '/competicoes' },
      { label: 'Nova Competição', href: '/competicoes/nova' },
      { label: 'Calendário', href: '/competicoes/calendario' },
      { label: 'Resultados', href: '/competicoes/resultados' }
    ]
  },
  { 
    label: 'Treinos', 
    href: '/treinos', 
    icon: Target, 
    color: 'text-purple-400',
    submenu: [
      { label: 'Agenda de Treinos', href: '/treinos' },
      { label: 'Novo Treino', href: '/treinos/novo' },
      { label: 'Exercícios', href: '/treinos/exercicios' },
      { label: 'Performance', href: '/treinos/performance' }
    ]
  },
  { 
    label: 'Reservas', 
    href: '/reservas', 
    icon: Calendar, 
    color: 'text-orange-400',
    submenu: [
      { label: 'Minhas Reservas', href: '/reservas' },
      { label: 'Nova Reserva', href: '/reservas/nova' },
      { label: 'Calendário', href: '/reservas/calendario' },
      { label: 'Histórico', href: '/reservas/historico' }
    ]
  },
  { 
    label: 'Estatísticas', 
    href: '/estatisticas', 
    icon: BarChart3, 
    color: 'text-red-400',
    submenu: [
      { label: 'Dashboard Analytics', href: '/estatisticas' },
      { label: 'Relatórios de Performance', href: '/estatisticas/performance' },
      { label: 'Comparativos', href: '/estatisticas/comparativos' }
    ]
  },
  { 
    label: 'Relatórios', 
    href: '/relatorios', 
    icon: FileText, 
    color: 'text-indigo-400',
    submenu: [
      { label: 'Relatórios Gerais', href: '/relatorios' },
      { label: 'Financeiro', href: '/relatorios/financeiro' },
      { label: 'Exportar Dados', href: '/relatorios/exportar' }
    ]
  },
  { 
    label: 'Configurações', 
    href: '/configuracoes', 
    icon: Settings, 
    color: 'text-gray-400',
    submenu: [
      { label: 'Gestão de Quadras', href: '/configuracoes/quadras' },
      { label: 'Usuários', href: '/configuracoes/usuarios' },
      { label: 'Reservas', href: '/configuracoes/reservas' },
      { label: 'Segurança', href: '/configuracoes/seguranca' }
    ]
  }
];

export default function TopMenu() {
  const router = useRouter();
  const pathname = usePathname();
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  // Removido useMenuPosition para evitar dependência circular

  // Fechar dropdown quando clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setActiveDropdown(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleItemClick = (item: MenuItem) => {
    router.push(item.href);
    setActiveDropdown(null);
  };

  const handleSubmenuClick = (href: string) => {
    router.push(href);
    setActiveDropdown(null);
  };

  const isActive = (href: string) => {
    return pathname === href || pathname.startsWith(href + '/');
  };

  return (
    <nav className="bg-white/5 backdrop-blur-sm border-t border-white/10" ref={dropdownRef}>
      <div className="px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Menu Items */}
          <div className="flex items-center space-x-1 overflow-x-auto">
            {menuItems.map((item, index) => (
              <div key={item.label} className="relative">
                <motion.button
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => item.submenu ? setActiveDropdown(
                    activeDropdown === item.label ? null : item.label
                  ) : handleItemClick(item)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-300 whitespace-nowrap ${
                    isActive(item.href)
                      ? 'bg-white/20 text-white'
                      : 'text-white/80 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <item.icon className={`w-4 h-4 ${item.color}`} />
                  <span className="text-sm font-medium">{item.label}</span>
                  {item.submenu && (
                    <ChevronDown className={`w-3 h-3 transition-transform ${
                      activeDropdown === item.label ? 'rotate-180' : ''
                    }`} />
                  )}
                </motion.button>

                {/* Dropdown Menu */}
                <AnimatePresence>
                  {activeDropdown === item.label && item.submenu && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="absolute top-full left-0 mt-2 w-64 bg-slate-800/95 backdrop-blur-md border border-white/20 rounded-xl shadow-2xl z-50"
                    >
                      <div className="p-2">
                        {item.submenu.map((subItem, subIndex) => (
                          <motion.button
                            key={subItem.label}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: subIndex * 0.05 }}
                            onClick={() => handleSubmenuClick(subItem.href)}
                            className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-all duration-200 ${
                              isActive(subItem.href)
                                ? 'bg-white/20 text-white'
                                : 'text-white/80 hover:bg-white/10 hover:text-white'
                            }`}
                          >
                            <span className="text-sm font-medium">{subItem.label}</span>
                          </motion.button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-2 ml-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/60" />
              <input
                type="text"
                placeholder="Buscar..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 text-sm focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-transparent transition-all duration-300 w-48"
              />
            </div>

            {/* Quick Add */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-300"
            >
              <Plus className="w-4 h-4 text-white" />
            </motion.button>

            {/* Notifications */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="relative p-2 rounded-lg hover:bg-white/10 transition-all duration-300"
            >
              <Bell className="w-4 h-4 text-white/80" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
            </motion.button>

            {/* Settings */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push('/configuracoes')}
              className="p-2 rounded-lg hover:bg-white/10 transition-all duration-300"
            >
              <Settings className="w-4 h-4 text-white/80" />
            </motion.button>

            {/* Menu Config */}
            {/* MenuConfig removido para evitar dependência circular */}

            {/* User Profile Button */}
            <UserProfileButton />
          </div>
        </div>
      </div>
    </nav>
  );
}
