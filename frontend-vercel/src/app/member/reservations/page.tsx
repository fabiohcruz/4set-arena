'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import MemberLayout from '@/components/MemberLayout';
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
  Loader2,
  Star,
  Zap
} from 'lucide-react';

interface Court {
  id: number;
  name: string;
  type: string;
  capacity: number;
  price: number;
  is_active: boolean;
}

interface TimeSlot {
  id: string;
  time: string;
  available: boolean;
  reservedBy?: string;
  reservedById?: number;
  court: string;
  price: number;
  isMemberReservation?: boolean;
  discount?: number;
}

const timeSlots = [
  '06:00', '06:30', '07:00', '07:30', '08:00', '08:30',
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
  '15:00', '15:30', '16:00', '16:30', '17:00', '17:30',
  '18:00', '18:30', '19:00', '19:30', '20:00', '20:30',
  '21:00', '21:30', '22:00', '22:30', '23:00', '23:30'
];

export default function MemberReservationsPage() {
  const router = useRouter();
  const [courts, setCourts] = useState<Court[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedCourtFilter, setSelectedCourtFilter] = useState<string>('all');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null);
  const [selectedCourt, setSelectedCourt] = useState<Court | null>(null);
  const [showReservationModal, setShowReservationModal] = useState(false);
  const [reservations, setReservations] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [memberData, setMemberData] = useState<any>(null);

  useEffect(() => {
    fetchMemberData();
    fetchCourts();
  }, []);

  useEffect(() => {
    if (courts.length > 0) {
      generateReservations();
    }
  }, [courts, selectedDate]);

  const fetchMemberData = async () => {
    try {
      const token = localStorage.getItem('memberToken');
      const response = await fetch('/api/member/auth/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setMemberData(data.data);
      }
    } catch (error) {
      console.error('Erro ao carregar dados do membro:', error);
    }
  };

  const fetchCourts = async () => {
    try {
      const response = await fetch('/api/courts/active');
      if (response.ok) {
        const data = await response.json();
        setCourts(data.data || []);
      } else {
        console.error('Erro na resposta da API:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Erro ao carregar quadras:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateReservations = () => {
    const mockReservations: TimeSlot[] = [];
    
    courts.forEach((court: Court) => {
      timeSlots.forEach((time, index) => {
        // Simular reservas existentes
        const isReserved = (court.id + index) % 4 === 0;
        const isMemberReservation = isReserved && (court.id + index) % 8 === 0;
        
        let reservedBy = undefined;
        let reservedById = undefined;
        let discount = 0;
        
        if (isReserved) {
          if (isMemberReservation) {
            reservedBy = memberData?.full_name || 'Membro';
            reservedById = memberData?.id;
            discount = 0.15; // 15% de desconto para membros
          } else {
            reservedBy = 'Cliente Externo';
            reservedById = 999;
          }
        }
        
        mockReservations.push({
          id: `${court.id}-${time}`,
          time,
          available: !isReserved,
          reservedBy,
          reservedById,
          court: court.name,
          price: court.price,
          isMemberReservation,
          discount
        });
      });
    });
    
    setReservations(mockReservations);
  };

  const handleTimeSlotClick = (court: Court, time: string) => {
    const reservation = reservations.find((r: TimeSlot) => r.court === court.name && r.time === time);
    
    if (reservation?.available) {
      setSelectedTimeSlot(time);
      setSelectedCourt(court);
      setShowReservationModal(true);
    } else if (reservation?.isMemberReservation) {
      // Mostrar detalhes da reserva do membro
      alert(`Sua reserva: ${time} - ${court.name}\nDesconto aplicado: ${(reservation.discount || 0) * 100}%`);
    } else {
      alert('Este horário já está reservado.');
    }
  };

  const handleReservation = async (duration: number) => {
    if (!selectedCourt || !selectedTimeSlot) return;

    try {
      const token = localStorage.getItem('memberToken');
      const reservationData = {
        courtId: selectedCourt.id,
        startTime: `${selectedDate.toISOString().split('T')[0]}T${selectedTimeSlot}:00`,
        duration: duration,
        memberId: memberData?.id
      };

      const response = await fetch('/api/member/reservations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(reservationData)
      });

      if (response.ok) {
        alert(`Reserva confirmada!\n${selectedCourt.name}\n${selectedDate.toLocaleDateString('dd/MM/yyyy')} ${selectedTimeSlot}\nDuração: ${duration} minutos\nDesconto: 15% aplicado`);
        setShowReservationModal(false);
        // Recarregar as reservas
        generateReservations();
      } else {
        const error = await response.json();
        alert(`Erro ao fazer reserva: ${error.message || 'Erro desconhecido'}`);
      }
    } catch (error) {
      console.error('Erro ao fazer reserva:', error);
      alert('Erro ao conectar com o servidor. Tente novamente.');
    }
  };

  // Filtrar apenas quadras ativas
  const activeCourts = courts.filter((court: Court) => court.is_active);
  
  const filteredCourts = selectedCourtFilter === 'all' 
    ? activeCourts 
    : activeCourts.filter((court: Court) => court.type === selectedCourtFilter);

  // Obter tipos únicos de quadras para o filtro
  const courtTypes = Array.from(new Set(activeCourts.map((court: Court) => court.type)));

  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1));
    setSelectedDate(newDate);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('pt-BR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const getStatusColor = (reservation: TimeSlot) => {
    if (reservation.available) {
      return 'bg-green-500/20 hover:bg-green-500/30 text-green-400 border border-green-500/30';
    } else if (reservation.isMemberReservation) {
      return 'bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 border border-blue-500/30';
    } else {
      return 'bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30';
    }
  };

  const getStatusIcon = (reservation: TimeSlot) => {
    if (reservation.available) {
      return <CheckCircle className="w-5 h-5" />;
    } else if (reservation.isMemberReservation) {
      return <Star className="w-4 h-4" />;
    } else {
      return <XCircle className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <MemberLayout>
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
          <div className="glass p-8 rounded-3xl text-center">
            <Loader2 className="w-16 h-16 text-blue-400 mx-auto mb-4 animate-spin" />
            <h3 className="text-xl font-semibold text-white mb-2">
              Carregando quadras...
            </h3>
            <p className="text-white/60">
              Buscando dados do banco de dados
            </p>
          </div>
        </div>
      </MemberLayout>
    );
  }

  return (
    <MemberLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">
                  Sistema de Reservas
                </h1>
                <p className="text-white/70">
                  Reserve suas quadras com desconto especial para membros
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-4 py-2 bg-green-500/20 border border-green-500/30 rounded-2xl">
                  <Star className="w-4 h-4 text-green-400" />
                  <span className="text-green-400 text-sm font-medium">15% OFF</span>
                </div>
                <button
                  onClick={() => router.push('/member/reservations/new')}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl transition-all duration-300 flex items-center space-x-2 shadow-lg hover:shadow-blue-500/25"
                >
                  <Plus className="w-5 h-5" />
                  <span>Nova Reserva</span>
                </button>
              </div>
            </div>

            {/* Filtros e Navegação */}
            <div className="glass p-6 rounded-3xl border border-white/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-6">
                  <div className="flex items-center space-x-3">
                    <Calendar className="w-5 h-5 text-blue-400" />
                    <span className="text-white font-medium">Data:</span>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => navigateDate('prev')}
                        className="p-2 hover:bg-white/10 rounded-xl transition-colors"
                      >
                        <ChevronLeft className="w-4 h-4 text-white" />
                      </button>
                      <span className="text-white px-4 py-2 bg-white/10 rounded-xl font-medium">
                        {formatDate(selectedDate)}
                      </span>
                      <button
                        onClick={() => navigateDate('next')}
                        className="p-2 hover:bg-white/10 rounded-xl transition-colors"
                      >
                        <ChevronRight className="w-4 h-4 text-white" />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Filter className="w-5 h-5 text-green-400" />
                    <span className="text-white font-medium">Filtrar:</span>
                    <select
                      value={selectedCourtFilter}
                      onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedCourtFilter(e.target.value)}
                      className="bg-white/10 border border-white/20 rounded-xl px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="all">Todos os Espaços</option>
                      {courtTypes.map(type => (
                        <option key={type} value={type}>{type}s</option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <button
                  onClick={() => setSelectedDate(new Date())}
                  className="px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 rounded-xl text-blue-400 text-sm font-medium transition-all duration-300"
                >
                  Hoje
                </button>
              </div>
            </div>
          </motion.div>

          {/* Grid de Reservas */}
          {activeCourts.length === 0 ? (
            <div className="glass p-8 rounded-3xl border border-white/20 text-center">
              <MapPin className="w-16 h-16 text-white/40 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">
                Nenhuma quadra disponível
              </h3>
              <p className="text-white/60">
                Não há quadras ativas configuradas no sistema.
              </p>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="glass rounded-3xl border border-white/20 overflow-hidden"
            >
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
                            <span className="text-xs text-white/60">{court.name.split(' - ')[1]}</span>
                            <div className="flex items-center space-x-2 text-xs text-white/60 mt-1">
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
                                onClick={() => handleTimeSlotClick(court, time)}
                                className={`w-full h-12 rounded-xl transition-all duration-200 flex flex-col items-center justify-center ${getStatusColor(reservation || { id: `${court.id}-${time}`, available: true, court: court.name, time, price: court.price })}`}
                              >
                                {getStatusIcon(reservation || { id: `${court.id}-${time}`, available: true, court: court.name, time, price: court.price })}
                                {!isAvailable && !reservation?.isMemberReservation && (
                                  <span className="text-xs font-medium mt-1">
                                    Ocupado
                                  </span>
                                )}
                                {!isAvailable && reservation?.isMemberReservation && (
                                  <span className="text-xs font-medium mt-1">
                                    Sua Reserva
                                  </span>
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
            </motion.div>
          )}

          {/* Legenda */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-8 glass p-6 rounded-3xl border border-white/20"
          >
            <h3 className="text-lg font-semibold text-white mb-4">Legenda</h3>
            <div className="flex flex-wrap gap-6">
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 bg-green-500/20 border border-green-500/30 rounded"></div>
                <span className="text-white/80">Disponível</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 bg-blue-500/20 border border-blue-500/30 rounded"></div>
                <span className="text-white/80">Sua Reserva</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 bg-red-500/20 border border-red-500/30 rounded"></div>
                <span className="text-white/80">Ocupado</span>
              </div>
            </div>
          </motion.div>

          {/* Modal de Reserva */}
          {showReservationModal && selectedTimeSlot && selectedCourt && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-white rounded-2xl w-full max-w-lg mx-4 shadow-2xl overflow-hidden"
              >
                {/* Header */}
                <div className="bg-gray-800 px-6 py-4 flex items-center justify-between">
                  <h3 className="text-white font-bold text-lg">
                    {selectedCourt.name} {selectedDate.toLocaleDateString('dd/MM/yyyy')} {selectedTimeSlot}
                  </h3>
                  <button
                    onClick={() => setShowReservationModal(false)}
                    className="text-white/60 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors"
                  >
                    <XCircle className="w-6 h-6" />
                  </button>
                </div>

                {/* Content */}
                <div className="p-6 bg-gray-100">
                  {/* Logo 4SET */}
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 bg-green-500/20 border-2 border-green-500 rounded-lg flex items-center justify-center">
                      <span className="text-green-500 font-bold text-lg">4SET</span>
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-800">4SET ARENA</h2>
                    </div>
                  </div>

                  {/* Court Info */}
                  <div className="space-y-3 mb-8">
                    <div className="flex items-center gap-3 text-gray-700">
                      <MapPin className="w-5 h-5 text-gray-500" />
                      <span className="font-semibold">{selectedCourt.name}</span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-700">
                      <Clock className="w-5 h-5 text-gray-500" />
                      <span>{selectedDate.toLocaleDateString('dd/MM/yyyy')} {selectedTimeSlot}</span>
                    </div>
                  </div>

                  {/* Duration Options */}
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-800 mb-4">Escolha a duração:</h4>
                    
                    <div className="grid grid-cols-3 gap-3">
                      <button
                        onClick={() => handleReservation(60)}
                        className="bg-black text-white py-3 px-4 rounded-lg font-medium hover:bg-gray-800 transition-colors"
                      >
                        60min AVULSO
                      </button>
                      <button
                        onClick={() => handleReservation(90)}
                        className="bg-black text-white py-3 px-4 rounded-lg font-medium hover:bg-gray-800 transition-colors"
                      >
                        90min AVULSO
                      </button>
                      <button
                        onClick={() => handleReservation(120)}
                        className="bg-black text-white py-3 px-4 rounded-lg font-medium hover:bg-gray-800 transition-colors"
                      >
                        120min AVULSO
                      </button>
                    </div>
                  </div>

                  {/* Close Button */}
                  <div className="mt-6 flex justify-end">
                    <button
                      onClick={() => setShowReservationModal(false)}
                      className="bg-gray-300 text-gray-700 py-2 px-6 rounded-lg font-medium hover:bg-gray-400 transition-colors"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </div>
      </div>
    </MemberLayout>
  );
}
