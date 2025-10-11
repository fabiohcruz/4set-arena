'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Layout from '@/components/Layout';
import ReservationsReport from '@/components/ReservationsReport';
import { 
  Users, 
  Trophy, 
  Target, 
  BarChart3, 
  TrendingUp, 
  Calendar,
  Award,
  Activity
} from 'lucide-react';

const stats = [
  { 
    title: 'Total de Clientes', 
    value: '1,247', 
    change: '+12%', 
    icon: Users, 
    color: 'from-blue-500 to-blue-600',
    bgColor: 'bg-blue-500/10'
  },
  { 
    title: 'Competições Ativas', 
    value: '23', 
    change: '+5%', 
    icon: Trophy, 
    color: 'from-yellow-500 to-yellow-600',
    bgColor: 'bg-yellow-500/10'
  },
  { 
    title: 'Treinos Realizados', 
    value: '456', 
    change: '+18%', 
    icon: Target, 
    color: 'from-green-500 to-green-600',
    bgColor: 'bg-green-500/10'
  },
  { 
    title: 'Performance Média', 
    value: '87%', 
    change: '+3%', 
    icon: BarChart3, 
    color: 'from-purple-500 to-purple-600',
    bgColor: 'bg-purple-500/10'
  }
];

const recentActivities = [
  { id: 1, title: 'Novo atleta cadastrado', time: '2 min atrás', type: 'success' },
  { id: 2, title: 'Competição "Copa de Verão" iniciada', time: '1 hora atrás', type: 'info' },
  { id: 3, title: 'Treino de futebol concluído', time: '3 horas atrás', type: 'success' },
  { id: 4, title: 'Relatório mensal gerado', time: '1 dia atrás', type: 'warning' },
];

export default function DashboardPage() {
  return (
    <Layout>
      <div className="space-y-8">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass p-8 rounded-3xl"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">
                Bem-vindo ao 4Set Sports! 🏆
              </h1>
              <p className="text-white/70 text-lg">
                Gerencie seu sistema esportivo com facilidade e eficiência
              </p>
            </div>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center"
            >
              <Trophy className="w-10 h-10 text-white" />
            </motion.div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="glass p-6 rounded-2xl hover:bg-white/20 transition-all duration-300"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl bg-gradient-to-r ${stat.color}`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
                <div className={`px-3 py-1 rounded-full ${stat.bgColor} text-green-400 text-sm font-medium`}>
                  {stat.change}
                </div>
              </div>
              <h3 className="text-2xl font-bold text-white mb-1">{stat.value}</h3>
              <p className="text-white/60 text-sm">{stat.title}</p>
            </motion.div>
          ))}
        </div>

        {/* Reservations Report */}
        <ReservationsReport />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Activities */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="glass p-6 rounded-2xl"
          >
            <div className="flex items-center space-x-3 mb-6">
              <Activity className="w-6 h-6 text-blue-400" />
              <h2 className="text-xl font-bold text-white">Atividades Recentes</h2>
            </div>
            <div className="space-y-4">
              {recentActivities.map((activity, index) => (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  className="flex items-center space-x-4 p-3 rounded-xl hover:bg-white/10 transition-colors"
                >
                  <div className={`w-3 h-3 rounded-full ${
                    activity.type === 'success' ? 'bg-green-400' :
                    activity.type === 'warning' ? 'bg-yellow-400' : 'bg-blue-400'
                  }`} />
                  <div className="flex-1">
                    <p className="text-white font-medium">{activity.title}</p>
                    <p className="text-white/60 text-sm">{activity.time}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="glass p-6 rounded-2xl"
          >
            <div className="flex items-center space-x-3 mb-6">
              <TrendingUp className="w-6 h-6 text-green-400" />
              <h2 className="text-xl font-bold text-white">Ações Rápidas</h2>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: Users, label: 'Novo Cliente', color: 'from-blue-500 to-blue-600' },
                { icon: Trophy, label: 'Nova Competição', color: 'from-yellow-500 to-yellow-600' },
                { icon: Target, label: 'Agendar Treino', color: 'from-green-500 to-green-600' },
                { icon: BarChart3, label: 'Ver Relatórios', color: 'from-purple-500 to-purple-600' }
              ].map((action, index) => (
                <motion.button
                  key={action.label}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-4 rounded-xl bg-white/10 hover:bg-white/20 transition-all duration-300 text-center group"
                >
                  <div className={`w-12 h-12 bg-gradient-to-r ${action.color} rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform`}>
                    <action.icon className="w-6 h-6 text-white" />
                  </div>
                  <p className="text-white font-medium text-sm">{action.label}</p>
                </motion.button>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Upcoming Events */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="glass p-6 rounded-2xl"
        >
          <div className="flex items-center space-x-3 mb-6">
            <Calendar className="w-6 h-6 text-purple-400" />
            <h2 className="text-xl font-bold text-white">Próximos Eventos</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { title: 'Copa de Verão 2024', date: '15 Jan 2024', type: 'competition' },
              { title: 'Treino de Futebol', date: '16 Jan 2024', type: 'training' },
              { title: 'Reunião Técnica', date: '18 Jan 2024', type: 'meeting' }
            ].map((event, index) => (
              <motion.div
                key={event.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 + index * 0.1 }}
                className="p-4 rounded-xl bg-white/10 hover:bg-white/20 transition-all duration-300"
              >
                <div className="flex items-center space-x-3 mb-2">
                  <Award className="w-5 h-5 text-yellow-400" />
                  <h3 className="text-white font-medium">{event.title}</h3>
                </div>
                <p className="text-white/60 text-sm">{event.date}</p>
                <div className={`mt-2 px-2 py-1 rounded-full text-xs font-medium w-fit ${
                  event.type === 'competition' ? 'bg-yellow-500/20 text-yellow-400' :
                  event.type === 'training' ? 'bg-green-500/20 text-green-400' :
                  'bg-blue-500/20 text-blue-400'
                }`}>
                  {event.type === 'competition' ? 'Competição' :
                   event.type === 'training' ? 'Treino' : 'Reunião'}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </Layout>
  );
}
