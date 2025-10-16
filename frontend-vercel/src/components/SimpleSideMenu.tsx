'use client';

import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { 
  Home, 
  Users, 
  Trophy, 
  Target, 
  BarChart3, 
  FileText, 
  Settings, 
  User as UserIcon, 
  LogOut
} from 'lucide-react';

interface SimpleSideMenuProps {
  position: 'left' | 'right';
}

const menuItems = [
  { icon: Home, label: 'Dashboard', href: '/dashboard', color: 'text-blue-400' },
  { icon: Users, label: 'Clientes', href: '/clientes', color: 'text-green-400' },
  { icon: Trophy, label: 'Competições', href: '/competicoes', color: 'text-yellow-400' },
  { icon: Target, label: 'Treinos', href: '/treinos', color: 'text-purple-400' },
  { icon: BarChart3, label: 'Estatísticas', href: '/estatisticas', color: 'text-red-400' },
  { icon: FileText, label: 'Relatórios', href: '/relatorios', color: 'text-indigo-400' },
  { icon: Settings, label: 'Configurações', href: '/configuracoes', color: 'text-gray-400' },
];

export default function SimpleSideMenu({ position }: SimpleSideMenuProps) {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const isLeft = position === 'left';

  return (
    <aside className={`fixed ${isLeft ? 'left-0' : 'right-0'} top-0 h-full w-72 bg-gradient-to-b from-slate-900/95 to-slate-800/95 backdrop-blur-xl ${isLeft ? 'border-r' : 'border-l'} border-white/10 z-50`}>
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <Trophy className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">4Set Sports</h1>
              <p className="text-xs text-white/60">Sistema Esportivo</p>
            </div>
          </div>
        </div>

        {/* User Info */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center">
              <UserIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-white font-medium">{user?.username}</p>
              <p className="text-xs text-white/60 capitalize">{user?.role}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.label}
              onClick={() => router.push(item.href)}
              className="w-full flex items-center space-x-3 p-3 rounded-xl text-white/70 hover:bg-white/10 hover:text-white transition-all duration-300"
            >
              <item.icon className={`w-5 h-5 ${item.color}`} />
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-white/10">
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 p-3 rounded-xl text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all duration-300"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Sair</span>
          </button>
        </div>
      </div>
    </aside>
  );
}


