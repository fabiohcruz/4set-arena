'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import { useCourts } from '@/context/CourtsContext';
import { useClients } from '@/context/ClientsContext';
import { Court } from '@/lib/courts';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  Plus, 
  Filter,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2
} from 'lucide-react';

interface TimeSlot {
  id: string;
  time: string;
  available: boolean;
  reservedBy?: string;
  reservedById?: number;
  court: string;
  price: number;
}

const timeSlots = [
  '06:00', '06:30', '07:00', '07:30', '08:00', '08:30',
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
  '15:00', '15:30', '16:00', '16:30', '17:00', '17:30',
  '18:00', '18:30', '19:00', '19:30', '20:00', '20:30',
  '21:00', '21:30', '22:00', '22:30', '23:00', '23:30'
];

export default function ReservasPage() {
  const router = useRouter();
  const { courts, loading: courtsLoading } = useCourts();
  const { clients, getActiveClients } = useClients();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedCourt, setSelectedCourt] = useState<string>('all');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null);
  const [showReservationModal, setShowReservationModal] = useState(false);
  const [reservations, setReservations] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(false);

  // Gerar reservas mockadas baseadas nas quadras do contexto
  useEffect(() => {
    if (courts.length > 0 && clients.length > 0) {
      const mockReservations: TimeSlot[] = [];
      const activeClients = getActiveClients();
      
      courts.forEach((court: Court) => {
        timeSlots.forEach((time, index) => {
          // Usar índice para determinar se está reservado (fixo, não aleatório)
          const isReserved = (court.id + index) % 3 === 0; // Padrão fixo baseado em ID e índice
          
          let reservedBy = undefined;
          let reservedById = undefined;
          
          if (isReserved && activeClients.length > 0) {
            // Selecionar cliente baseado no índice para manter consistência
            const clientIndex = (court.id + index) % activeClients.length;
            const selectedClient = activeClients[clientIndex];
            reservedBy = selectedClient.full_name;
            reservedById = selectedClient.id;
          }
          
          mockReservations.push({
            id: `${court.id}-${time}`,
            time,
            available: !isReserved,
            reservedBy,
            reservedById,
            court: court.name,
            price: court.price
          });
        });
      });
      
      setReservations(mockReservations);
    }
  }, [courts, clients]); // Executar quando as quadras ou clientes mudarem

  const handleTimeSlotClick = (courtId: string, time: string) => {
    const reservation = reservations.find((r: TimeSlot) => r.court === courtId && r.time === time);
    
    if (reservation?.available) {
      setSelectedTimeSlot(time);
      setShowReservationModal(true);
    } else {
      // Redirecionar para edição de reserva com dados pré-preenchidos
      const params = new URLSearchParams({
        court: courtId,
        date: selectedDate.toISOString().split('T')[0],
        time: time,
        clientId: reservation?.reservedById?.toString() || ''
      });
      router.push(`/reservas/editar?${params.toString()}`);
    }
  };

  // Filtrar apenas quadras ativas
  const activeCourts = courts.filter((court: Court) => court.is_active);
  
  const filteredCourts = selectedCourt === 'all' 
    ? activeCourts 
    : activeCourts.filter((court: Court) => court.type === selectedCourt);

  // Obter tipos únicos de quadras para o filtro
  const courtTypes = Array.from(new Set(activeCourts.map((court: Court) => court.type)));

  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1));
    setSelectedDate(newDate);
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">
                  Sistema de Reservas
                </h1>
                <p className="text-gray-400">
                  Gerencie e visualize todas as reservas do clube
                </p>
              </div>
              <button
                onClick={() => router.push('/reservas/nova')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors flex items-center space-x-2"
              >
                <Plus className="w-5 h-5" />
                <span>Nova Reserva</span>
              </button>
            </div>

            {/* Filtros e Navegação */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-6">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-5 h-5 text-blue-400" />
                    <span className="text-white font-medium">Data:</span>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => navigateDate('prev')}
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                      >
                        <ChevronLeft className="w-4 h-4 text-white" />
                      </button>
                      <span className="text-white px-3 py-1 bg-white/10 rounded-lg">
                        {selectedDate.toLocaleDateString('pt-BR')}
                      </span>
                      <button
                        onClick={() => navigateDate('next')}
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                      >
                        <ChevronRight className="w-4 h-4 text-white" />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Filter className="w-5 h-5 text-green-400" />
                    <span className="text-white font-medium">Filtrar:</span>
                    <select
                      value={selectedCourt}
                      onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedCourt(e.target.value)}
                      className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="all">Todos os Espaços</option>
                      {courtTypes.map(type => (
                        <option key={type} value={type}>{type}s</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Estado de carregamento */}
          {courtsLoading ? (
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-8 text-center">
              <Loader2 className="w-16 h-16 text-blue-400 mx-auto mb-4 animate-spin" />
              <h3 className="text-xl font-semibold text-white mb-2">
                Carregando quadras...
              </h3>
              <p className="text-gray-400">
                Buscando dados do banco de dados
              </p>
            </div>
          ) : activeCourts.length === 0 ? (
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-8 text-center">
              <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">
                Nenhuma quadra disponível
              </h3>
              <p className="text-gray-400 mb-6">
                Não há quadras ativas configuradas no sistema.
              </p>
              <button
                onClick={() => router.push('/configuracoes/quadras')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
              >
                Configurar Quadras
              </button>
            </div>
          ) : (
            /* Grid de Reservas - Layout Invertido */
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left p-4 text-white font-medium min-w-[120px]">
                        <div className="flex items-center space-x-2">
                          <Clock className="w-4 h-4" />
                          <span>Horário</span>
                        </div>
                      </th>
                      {filteredCourts.map((court: Court) => (
                        <th key={court.id} className="text-center p-3 text-white font-medium min-w-[150px]">
                          <div className="flex flex-col items-center">
                            <MapPin className="w-4 h-4 mb-1" />
                            <span className="text-sm font-medium">{court.name.split(' ')[0]}</span>
                            <span className="text-xs text-gray-400">{court.name.split(' - ')[1]}</span>
                            <div className="flex items-center space-x-2 text-xs text-gray-400 mt-1">
                              <Users className="w-3 h-3" />
                              <span>{court.capacity}</span>
                              <span>•</span>
                              <span>R$ {court.price}/h</span>
                            </div>
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {timeSlots.map(time => (
                      <tr key={time} className="border-b border-white/5">
                        <td className="p-3 text-center">
                          <div className="flex flex-col items-center">
                            <span className="text-white font-medium text-sm">{time}</span>
                          </div>
                        </td>
                        {filteredCourts.map((court: Court) => {
                          const reservation = reservations.find((r: TimeSlot) => r.court === court.name && r.time === time);
                          const isAvailable = reservation?.available ?? true;
                          
                          return (
                            <td key={`${court.id}-${time}`} className="p-2">
                              <button
                                onClick={() => handleTimeSlotClick(court.name, time)}
                                className={`w-full h-12 rounded-lg transition-all duration-200 flex flex-col items-center justify-center ${
                                  isAvailable
                                    ? 'bg-green-500/20 hover:bg-green-500/30 text-green-400 border border-green-500/30'
                                    : 'bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30'
                                }`}
                              >
                                {isAvailable ? (
                                  <CheckCircle className="w-5 h-5" />
                                ) : (
                                  <div className="flex flex-col items-center">
                                    <XCircle className="w-4 h-4 mb-1" />
                                    <span className="text-xs font-medium truncate max-w-[120px]">
                                      {reservation?.reservedBy || 'Reservado'}
                                    </span>
                                  </div>
                                )}
                              </button>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Modal de Reserva Rápida */}
          {showReservationModal && selectedTimeSlot && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-slate-800 rounded-lg p-6 w-full max-w-md mx-4"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold text-white">Reserva Rápida</h3>
                  <button
                    onClick={() => setShowReservationModal(false)}
                    className="text-gray-400 hover:text-white"
                  >
                    <XCircle className="w-6 h-6" />
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center space-x-2 text-gray-300">
                    <Clock className="w-4 h-4" />
                    <span>Horário: {selectedTimeSlot}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-gray-300">
                    <Calendar className="w-4 h-4" />
                    <span>Data: {selectedDate.toLocaleDateString('pt-BR')}</span>
                  </div>
                </div>

                <div className="flex space-x-3 mt-6">
                  <button
                    onClick={() => {
                      setShowReservationModal(false);
                      router.push('/reservas/nova');
                    }}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors"
                  >
                    Continuar
                  </button>
                  <button
                    onClick={() => setShowReservationModal(false)}
                    className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-lg transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}