'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import { useAuth } from '@/context/AuthContext';
import { 
  Settings, 
  MapPin, 
  Users, 
  Calendar,
  Shield,
  Bell,
  Database,
  Menu,
  ArrowRight,
  Package,
  DollarSign
} from 'lucide-react';

interface ConfigSection {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  href: string;
  color: string;
  requiresAdmin?: boolean;
}

const configSections: ConfigSection[] = [
  {
    id: 'courts',
    title: 'Gestão de Quadras',
    description: 'Criar, editar e gerenciar quadras e espaços esportivos',
    icon: MapPin,
    href: '/configuracoes/quadras',
    color: 'text-blue-400',
    requiresAdmin: true
  },
  {
    id: 'menu',
    title: 'Gestão de Menu',
    description: 'Configurar itens do menu principal e navegação',
    icon: Menu,
    href: '/configuracoes/menu',
    color: 'text-orange-400',
    requiresAdmin: true
  },
  {
    id: 'produtos',
    title: 'Produtos e Serviços',
    description: 'Gerenciar produtos, serviços e estoque do PDV',
    icon: Package,
    href: '/configuracoes/produtos',
    color: 'text-cyan-400',
    requiresAdmin: true
  },
  {
    id: 'tarifarios',
    title: 'Tarifários',
    description: 'Configurar preços e tarifas por esporte e horário',
    icon: DollarSign,
    href: '/configuracoes/tarifarios',
    color: 'text-emerald-400',
    requiresAdmin: true
  },
  {
    id: 'users',
    title: 'Gestão de Usuários',
    description: 'Gerenciar usuários, permissões e acessos',
    icon: Users,
    href: '/configuracoes/usuarios',
    color: 'text-green-400',
    requiresAdmin: true
  },
  {
    id: 'reservations',
    title: 'Configurações de Reservas',
    description: 'Definir regras, horários e políticas de reservas',
    icon: Calendar,
    href: '/configuracoes/reservas',
    color: 'text-purple-400',
    requiresAdmin: true
  },
  {
    id: 'security',
    title: 'Segurança',
    description: 'Configurações de segurança e autenticação',
    icon: Shield,
    href: '/configuracoes/seguranca',
    color: 'text-red-400',
    requiresAdmin: true
  },
  {
    id: 'notifications',
    title: 'Notificações',
    description: 'Configurar alertas e notificações do sistema',
    icon: Bell,
    href: '/configuracoes/notificacoes',
    color: 'text-yellow-400',
    requiresAdmin: true
  },
  {
    id: 'backup',
    title: 'Backup e Dados',
    description: 'Gerenciar backups e exportação de dados',
    icon: Database,
    href: '/configuracoes/backup',
    color: 'text-indigo-400',
    requiresAdmin: true
  }
];

export default function ConfiguracoesPage() {
  const router = useRouter();
  const { user } = useAuth();

  const handleSectionClick = (href: string) => {
    router.push(href);
  };

  // Filtrar seções baseado nas permissões do usuário
  const filteredSections = configSections.filter(section => {
    if (section.requiresAdmin && user?.role !== 'admin') {
      return false;
    }
    return true;
  });

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">
              Configurações do Sistema
            </h1>
            <p className="text-gray-300">
              Gerencie todas as configurações e funcionalidades do sistema
            </p>
          </div>

          {/* Grid de Configurações */}
          {filteredSections.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredSections.map((section) => (
                <motion.div
                  key={section.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleSectionClick(section.href)}
                  className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-6 cursor-pointer hover:bg-white/10 transition-all duration-300 group"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-3 rounded-lg bg-white/10 group-hover:bg-white/20 transition-colors`}>
                      <section.icon className={`w-6 h-6 ${section.color}`} />
                    </div>
                    <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
                  </div>
                  
                  <h3 className="text-xl font-semibold text-white mb-2">
                    {section.title}
                  </h3>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    {section.description}
                  </p>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Acesso Restrito</h3>
              <p className="text-gray-400 mb-6">
                Apenas administradores podem acessar as configurações do sistema.
              </p>
              <button
                onClick={() => router.push('/dashboard')}
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all text-white font-medium"
              >
                Voltar ao Dashboard
              </button>
            </div>
          )}

          {/* Informações do Sistema */}
          <div className="mt-12 bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-6">
            <div className="flex items-center space-x-3 mb-4">
              <Settings className="w-6 h-6 text-blue-400" />
              <h2 className="text-xl font-semibold text-white">
                Informações do Sistema
              </h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white/5 rounded-lg p-4">
                <h3 className="text-white font-medium mb-2">Versão</h3>
                <p className="text-gray-400">v1.0.0</p>
              </div>
              
              <div className="bg-white/5 rounded-lg p-4">
                <h3 className="text-white font-medium mb-2">Última Atualização</h3>
                <p className="text-gray-400">
                  {new Date().toLocaleDateString('pt-BR')}
                </p>
              </div>
              
              <div className="bg-white/5 rounded-lg p-4">
                <h3 className="text-white font-medium mb-2">Status</h3>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-green-400 text-sm">Online</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

