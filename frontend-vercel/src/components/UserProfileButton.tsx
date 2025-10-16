'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { User as UserIcon, Settings, LogOut, ChevronDown } from 'lucide-react';

export default function UserProfileButton() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const handleProfileClick = () => {
    router.push('/profile');
    setIsOpen(false);
  };

  if (!user) return null;

  return (
    <div className="relative">
      {/* Botão do usuário */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-3 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 transition-all duration-200 border border-white/10 hover:border-white/20"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        {/* Avatar */}
        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-sm font-bold text-white">
          {user.full_name ? user.full_name.charAt(0).toUpperCase() : user.username.charAt(0).toUpperCase()}
        </div>
        
        {/* Nome do usuário */}
        <div className="text-left">
          <p className="text-sm font-medium text-white">
            {user.full_name || user.username}
          </p>
          <p className="text-xs text-gray-400 capitalize">
            {user.role}
          </p>
        </div>
        
        {/* Ícone de dropdown */}
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="w-4 h-4 text-gray-400" />
        </motion.div>
      </motion.button>

      {/* Dropdown menu */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />
            
            {/* Menu */}
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="absolute right-0 top-full mt-2 w-64 bg-slate-800/95 backdrop-blur-md border border-white/20 rounded-xl shadow-2xl z-50 overflow-hidden"
            >
              {/* Header do menu */}
              <div className="px-4 py-3 border-b border-white/10">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-lg font-bold text-white">
                    {user.full_name ? user.full_name.charAt(0).toUpperCase() : user.username.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium text-white">
                      {user.full_name || user.username}
                    </p>
                    <p className="text-sm text-gray-400">
                      {user.email || 'admin@4set.com'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Opções do menu */}
              <div className="py-2">
                {/* Perfil - Nome clicável */}
                <motion.button
                  onClick={handleProfileClick}
                  className="w-full px-4 py-3 text-left hover:bg-white/5 transition-colors flex items-center space-x-3 group"
                  whileHover={{ x: 4 }}
                >
                  <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center group-hover:bg-blue-500/30 transition-colors">
                    <UserIcon className="w-4 h-4 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-white font-medium">Meu Perfil</p>
                    <p className="text-xs text-gray-400">Editar informações pessoais</p>
                  </div>
                </motion.button>

                {/* Configurações */}
                <motion.button
                  onClick={() => {
                    router.push('/profile?tab=settings');
                    setIsOpen(false);
                  }}
                  className="w-full px-4 py-3 text-left hover:bg-white/5 transition-colors flex items-center space-x-3 group"
                  whileHover={{ x: 4 }}
                >
                  <div className="w-8 h-8 bg-gray-500/20 rounded-lg flex items-center justify-center group-hover:bg-gray-500/30 transition-colors">
                    <Settings className="w-4 h-4 text-gray-400" />
                  </div>
                  <div>
                    <p className="text-white font-medium">Configurações</p>
                    <p className="text-xs text-gray-400">Preferências e configurações</p>
                  </div>
                </motion.button>

                {/* Divisor */}
                <div className="border-t border-white/10 my-2" />

                {/* Logout */}
                <motion.button
                  onClick={handleLogout}
                  className="w-full px-4 py-3 text-left hover:bg-red-500/10 transition-colors flex items-center space-x-3 group"
                  whileHover={{ x: 4 }}
                >
                  <div className="w-8 h-8 bg-red-500/20 rounded-lg flex items-center justify-center group-hover:bg-red-500/30 transition-colors">
                    <LogOut className="w-4 h-4 text-red-400" />
                  </div>
                  <div>
                    <p className="text-red-400 font-medium">Sair</p>
                    <p className="text-xs text-gray-400">Fazer logout do sistema</p>
                  </div>
                </motion.button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
