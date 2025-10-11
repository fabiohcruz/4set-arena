'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
// Removido useCourts para evitar problemas de navegação
import { 
  Calendar, 
  ChevronLeft,
  ChevronRight,
  MapPin,
  Clock,
  Users,
  Plus
} from 'lucide-react';

interface Reservation {
  id: string;
  court: string;
  time: string;
  duration: number; // Suporta valores decimais (1, 1.5, 2, 2.5, etc.) - mínimo 1 hora
  participants: number;
  name: string;
  phone: string;
  status: 'confirmed' | 'pending' | 'cancelled';
}

// Removido: courts agora vem do contexto

// Mock data para demonstração
const mockReservations: Reservation[] = [
  {
    id: '1',
    court: 'Quadra 1 - Tênis',
    time: '09:00',
    duration: 1.5,
    participants: 4,
    name: 'João Silva',
    phone: '(47) 99999-9999',
    status: 'confirmed'
  },
  {
    id: '2',
    court: 'Quadra 2 - Futebol',
    time: '14:30',
    duration: 2,
    participants: 22,
    name: 'Maria Santos',
    phone: '(47) 88888-8888',
    status: 'confirmed'
  },
  {
    id: '3',
    court: 'Piscina - Natação',
    time: '16:00',
    duration: 2,
    participants: 6,
    name: 'Pedro Costa',
    phone: '(47) 77777-7777',
    status: 'pending'
  }
];

export default function CalendarioReservasPage() {
  const router = useRouter();
  // Removido getActiveCourts para evitar problemas de navegação
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [view, setView] = useState<'month' | 'week' | 'day'>('month');

  // Usar dados mockados diretamente para evitar problemas com contexto
  const courts = [
    'Quadra 1 - Tênis',
    'Quadra 2 - Futebol', 
    'Quadra 3 - Basquete',
    'Piscina - Natação'
  ];

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Adicionar dias vazios do mês anterior
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Adicionar dias do mês atual
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  const getReservationsForDate = (date: Date) => {
    // Simular reservas para algumas datas
    const day = date.getDate();
    if (day % 3 === 0 || day % 5 === 0) {
      return mockReservations.slice(0, Math.floor(Math.random() * 3) + 1);
    }
    return [];
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
    setCurrentDate(newDate);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('pt-BR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-500';
      case 'pending': return 'bg-yellow-500';
      case 'cancelled': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'confirmed': return 'Confirmada';
      case 'pending': return 'Pendente';
      case 'cancelled': return 'Cancelada';
      default: return 'Desconhecido';
    }
  };

  const formatDuration = (duration: number) => {
    if (duration === 1) return '1h';
    if (duration === 1.5) return '1h30';
    if (duration === 2) return '2h';
    if (duration === 2.5) return '2h30';
    if (duration === 3) return '3h';
    if (duration === 3.5) return '3h30';
    if (duration === 4) return '4h';
    if (duration === 5) return '5h';
    if (duration === 6) return '6h';
    if (duration === 8) return '8h';
    return `${duration}h`;
  };

  const days = getDaysInMonth(currentDate);
  const monthName = currentDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">
                  Calendário de Reservas
                </h1>
                <p className="text-gray-300">
                  Visualize todas as reservas em formato de calendário
                </p>
              </div>
              <button 
                onClick={() => router.push('/reservas/nova')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center space-x-2 transition-colors"
              >
                <Plus className="w-5 h-5" />
                <span>Nova Reserva</span>
              </button>
            </div>

            {/* Controles */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-5 h-5 text-blue-400" />
                    <span className="text-white font-medium">{monthName}</span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => navigateMonth('prev')}
                      className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4 text-white" />
                    </button>
                    <button
                      onClick={() => setCurrentDate(new Date())}
                      className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors"
                    >
                      Hoje
                    </button>
                    <button
                      onClick={() => navigateMonth('next')}
                      className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                    >
                      <ChevronRight className="w-4 h-4 text-white" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {(['month', 'week', 'day'] as const).map((viewType) => (
                    <button
                      key={viewType}
                      onClick={() => setView(viewType)}
                      className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                        view === viewType
                          ? 'bg-blue-600 text-white'
                          : 'bg-white/10 text-gray-300 hover:bg-white/20'
                      }`}
                    >
                      {viewType === 'month' ? 'Mês' : viewType === 'week' ? 'Semana' : 'Dia'}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Calendário */}
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg overflow-hidden">
            {/* Cabeçalho dos dias da semana */}
            <div className="grid grid-cols-7 border-b border-white/10">
              {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
                <div key={day} className="p-4 text-center text-white font-medium bg-white/5">
                  {day}
                </div>
              ))}
            </div>

            {/* Grid do calendário */}
            <div className="grid grid-cols-7">
              {days.map((day, index) => {
                const reservations = day ? getReservationsForDate(day) : [];
                const isToday = day && day.toDateString() === new Date().toDateString();
                const isSelected = selectedDate && day && day.toDateString() === selectedDate.toDateString();

                return (
                  <div
                    key={index}
                    className={`min-h-[120px] border-r border-b border-white/10 p-2 ${
                      day ? 'bg-white/5' : 'bg-gray-800/20'
                    } ${isToday ? 'bg-blue-500/20' : ''} ${
                      isSelected ? 'bg-blue-600/30' : ''
                    } cursor-pointer hover:bg-white/10 transition-colors`}
                    onClick={() => day && setSelectedDate(day)}
                  >
                    {day && (
                      <>
                        <div className={`text-sm font-medium mb-2 ${
                          isToday ? 'text-blue-400' : 'text-white'
                        }`}>
                          {day.getDate()}
                        </div>
                        
                        <div className="space-y-1">
                          {reservations.slice(0, 3).map((reservation, idx) => (
                            <motion.div
                              key={idx}
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              className={`text-xs p-1 rounded text-white truncate ${getStatusColor(reservation.status)}`}
                              title={`${reservation.court} - ${reservation.time} - ${reservation.name}`}
                            >
                              {reservation.time} - {reservation.court.split(' ')[0]}
                            </motion.div>
                          ))}
                          {reservations.length > 3 && (
                            <div className="text-xs text-gray-400">
                              +{reservations.length - 3} mais
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Painel lateral com detalhes */}
          {selectedDate && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="mt-6 bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-6"
            >
              <h3 className="text-xl font-semibold text-white mb-4">
                Reservas para {formatDate(selectedDate)}
              </h3>
              
              {getReservationsForDate(selectedDate).length === 0 ? (
                <p className="text-gray-400">Nenhuma reserva para esta data.</p>
              ) : (
                <div className="space-y-4">
                  {getReservationsForDate(selectedDate).map((reservation) => (
                    <div key={reservation.id} className="bg-white/5 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          <MapPin className="w-4 h-4 text-blue-400" />
                          <span className="text-white font-medium">{reservation.court}</span>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs text-white ${getStatusColor(reservation.status)}`}>
                          {getStatusText(reservation.status)}
                        </span>
                      </div>
                      
                      <div className="space-y-2 text-sm text-gray-300">
                        <div className="flex items-center space-x-2">
                          <Clock className="w-4 h-4" />
                          <span>{reservation.time} - {formatDuration(reservation.duration)}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Users className="w-4 h-4" />
                          <span>{reservation.participants} participantes</span>
                        </div>
                        <div>
                          <span className="font-medium">Responsável:</span> {reservation.name}
                        </div>
                        <div>
                          <span className="font-medium">Telefone:</span> {reservation.phone}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* Legenda */}
          <div className="mt-6 bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-4">
            <h3 className="text-white font-medium mb-3">Legenda:</h3>
            <div className="flex flex-wrap gap-6">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-green-500 rounded"></div>
                <span className="text-gray-300">Confirmada</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                <span className="text-gray-300">Pendente</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-red-500 rounded"></div>
                <span className="text-gray-300">Cancelada</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
