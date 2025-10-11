'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import SideMenu from './SideMenu';
import TopMenu from './TopMenu';
import MenuConfig from './MenuConfig';
import UserProfileButton from './UserProfileButton';
import { useMenuPosition } from '@/hooks/useMenuPosition';
import { Menu } from 'lucide-react';
import Logo from './Logo';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const { position, changePosition, isTop, isLeft, isRight } = useMenuPosition();

  // Auto-abrir menu lateral em desktop quando não for top
  useEffect(() => {
    if (!isTop) {
      setSidebarOpen(true);
    } else {
      setSidebarOpen(false);
    }
  }, [isTop]);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass p-8 rounded-3xl text-center"
        >
          <div className="mb-6">
            <Logo size="lg" variant="full" />
          </div>
          <div className="w-16 h-16 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white text-lg">Carregando...</p>
        </motion.div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Side Menu (Left or Right) */}
      {(isLeft || isRight) && (
        <SideMenu 
          isOpen={sidebarOpen} 
          onToggle={() => setSidebarOpen(!sidebarOpen)} 
          position={position}
        />
      )}
      
      {/* Main Content */}
      <div className={`transition-all duration-300 ${
        isTop ? '' : 
        isLeft ? 'lg:ml-72' : 
        'lg:mr-72'
      }`}>
        {/* Top Bar */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/5 backdrop-blur-sm border-b border-white/10 p-4 relative z-10"
        >
          <div className="flex items-center justify-between">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-white/10 transition-colors"
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
              <MenuConfig position={position} onPositionChange={changePosition} />
            </div>
            
            {/* User Profile Button - Only when menu is NOT top */}
            {!isTop && <UserProfileButton />}
          </div>
          {/* Menu Horizontal - Only when position is top */}
          {isTop && <TopMenu />}
        </motion.header>

        {/* Page Content */}
        <motion.main
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-6"
        >
          {children}
        </motion.main>
      </div>
    </div>
  );
}
