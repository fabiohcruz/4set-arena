'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useCourts } from '@/context/CourtsContext';
import { useClients } from '@/context/ClientsContext';
import { Court } from '@/lib/courts';
import { 
  BarChart3, 
  Calendar, 
  TrendingUp, 
  TrendingDown,
  MapPin,
  Users,
  Filter,
  Download
} from 'lucide-react';

interface ReservationData {
  courtId: number;
  courtName: string;
  date: string;
  reservations: number;
  revenue: number;
}

interface DailyReport {
  date: string;
  totalReservations: number;
  totalRevenue: number;
  courtData: ReservationData[];
}

export default function ReservationsReport() {
  const { courts } = useCourts();
  const { clients } = useClients();
  const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '30d' | '90d'>('7d');
  const [reportData, setReportData] = useState<DailyReport[]>([]);
  const [loading, setLoading] = useState(false);

  // Gerar dados mockados do relatório
  useEffect(() => {
    if (courts.length > 0) {
      generateMockReportData();
    }
  }, [courts, selectedPeriod]);

  const generateMockReportData = () => {
    setLoading(true);
    
    const days = selectedPeriod === '7d' ? 7 : selectedPeriod === '30d' ? 30 : 90;
    const mockData: DailyReport[] = [];
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const courtData: ReservationData[] = courts.map(court => {
        // Simular número de reservas baseado no dia e ID da quadra
        const baseReservations = Math.floor(Math.random() * 8) + 2; // 2-10 reservas
        const dayMultiplier = date.getDay() === 0 || date.getDay() === 6 ? 1.5 : 1; // Fins de semana mais movimentados
        const reservations = Math.floor(baseReservations * dayMultiplier);
        
        return {
          courtId: court.id,
          courtName: court.name,
          date: dateStr,
          reservations,
          revenue: reservations * court.price
        };
      });
      
      const totalReservations = courtData.reduce((sum, court) => sum + court.reservations, 0);
      const totalRevenue = courtData.reduce((sum, court) => sum + court.revenue, 0);
      
      mockData.push({
        date: dateStr,
        totalReservations,
        totalRevenue,
        courtData
      });
    }
    
    setReportData(mockData);
    setLoading(false);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-BR', { 
      day: '2-digit', 
      month: '2-digit' 
    });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getTotalStats = () => {
    const totalReservations = reportData.reduce((sum, day) => sum + day.totalReservations, 0);
    const totalRevenue = reportData.reduce((sum, day) => sum + day.totalRevenue, 0);
    const avgReservationsPerDay = totalReservations / reportData.length;
    
    return { totalReservations, totalRevenue, avgReservationsPerDay };
  };

  const getTopCourt = () => {
    if (reportData.length === 0) return null;
    
    const courtTotals = courts.map(court => {
      const totalReservations = reportData.reduce((sum, day) => {
        const courtData = day.courtData.find(c => c.courtId === court.id);
        return sum + (courtData?.reservations || 0);
      }, 0);
      
      return { court, totalReservations };
    });
    
    return courtTotals.reduce((max, current) => 
      current.totalReservations > max.totalReservations ? current : max
    );
  };

  const stats = getTotalStats();
  const topCourt = getTopCourt();

  if (loading) {
    return (
      <div className="glass p-6 rounded-2xl">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass p-6 rounded-2xl"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <BarChart3 className="w-6 h-6 text-blue-400" />
          <h2 className="text-xl font-bold text-white">Relatório de Reservas</h2>
        </div>
        <div className="flex items-center space-x-3">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value as '7d' | '30d' | '90d')}
            className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="7d">Últimos 7 dias</option>
            <option value="30d">Últimos 30 dias</option>
            <option value="90d">Últimos 90 dias</option>
          </select>
          <button className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors">
            <Download className="w-4 h-4 text-white" />
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white/10 rounded-xl p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <Calendar className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-white/60 text-sm">Total de Reservas</p>
              <p className="text-white font-bold text-xl">{stats.totalReservations}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white/10 rounded-xl p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-500/20 rounded-lg">
              <TrendingUp className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <p className="text-white/60 text-sm">Receita Total</p>
              <p className="text-white font-bold text-xl">{formatCurrency(stats.totalRevenue)}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white/10 rounded-xl p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-500/20 rounded-lg">
              <Users className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <p className="text-white/60 text-sm">Média por Dia</p>
              <p className="text-white font-bold text-xl">{stats.avgReservationsPerDay.toFixed(1)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Top Court */}
      {topCourt && (
        <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl p-4 mb-6">
          <div className="flex items-center space-x-3">
            <MapPin className="w-5 h-5 text-blue-400" />
            <div>
              <p className="text-white/60 text-sm">Quadra Mais Movimentada</p>
              <p className="text-white font-bold">{topCourt.court.name}</p>
              <p className="text-blue-400 text-sm">{topCourt.totalReservations} reservas no período</p>
            </div>
          </div>
        </div>
      )}

      {/* Chart Area */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white">Reservas por Dia</h3>
        
        {/* Enhanced Bar Chart */}
        <div className="bg-white/5 rounded-xl p-6">
          <div className="flex items-end justify-between h-64 overflow-x-auto pb-4">
            {reportData.map((day, index) => {
              const maxReservations = Math.max(...reportData.map(d => d.totalReservations));
              const height = maxReservations > 0 ? (day.totalReservations / maxReservations) * 100 : 0;
              const isWeekend = new Date(day.date).getDay() === 0 || new Date(day.date).getDay() === 6;
              
              return (
                <motion.div 
                  key={day.date} 
                  className="flex flex-col items-center space-y-2 min-w-[50px] group cursor-pointer relative"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ scale: 1.05 }}
                >
                  {/* Tooltip */}
                  <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-slate-800 text-white text-xs px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                    <div className="text-center">
                      <div className="font-medium">{day.totalReservations} reservas</div>
                      <div className="text-gray-300">{formatCurrency(day.totalRevenue)}</div>
                    </div>
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-slate-800"></div>
                  </div>
                  
                  {/* Bar Container */}
                  <div className="flex flex-col items-center space-y-2 relative">
                    {/* Value Label */}
                    <motion.span 
                      className="text-white text-sm font-bold"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.05 + 0.3 }}
                    >
                      {day.totalReservations}
                    </motion.span>
                    
                    {/* Bar */}
                    <div className="relative w-12 h-48 flex items-end">
                      <motion.div 
                        className={`w-full rounded-t-lg relative overflow-hidden ${
                          isWeekend 
                            ? 'bg-gradient-to-t from-purple-500 via-purple-400 to-purple-300' 
                            : 'bg-gradient-to-t from-blue-500 via-blue-400 to-blue-300'
                        }`}
                        initial={{ height: 0 }}
                        animate={{ height: `${height}%` }}
                        transition={{ 
                          delay: index * 0.05 + 0.2, 
                          duration: 0.8,
                          ease: "easeOut"
                        }}
                        whileHover={{ 
                          boxShadow: isWeekend 
                            ? '0 0 20px rgba(168, 85, 247, 0.5)' 
                            : '0 0 20px rgba(59, 130, 246, 0.5)'
                        }}
                      >
                        {/* Shine effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                        
                        {/* Pattern overlay */}
                        <div className="absolute inset-0 opacity-10">
                          <div className="w-full h-full bg-repeat" style={{
                            backgroundImage: `url("data:image/svg+xml,%3Csvg width='4' height='4' viewBox='0 0 4 4' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h4v4H0z' fill='%23ffffff'/%3E%3C/svg%3E")`
                          }}></div>
                        </div>
                      </motion.div>
                    </div>
                    
                    {/* Day Label */}
                    <motion.span 
                      className={`text-xs font-medium ${
                        isWeekend ? 'text-purple-300' : 'text-white/60'
                      }`}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.05 + 0.4 }}
                    >
                      {formatDate(day.date)}
                    </motion.span>
                    
                    {/* Weekend indicator */}
                    {isWeekend && (
                      <motion.div 
                        className="w-2 h-2 bg-purple-400 rounded-full"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: index * 0.05 + 0.5 }}
                      />
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
          
          {/* Chart Legend */}
          <div className="flex items-center justify-center space-x-6 mt-4 pt-4 border-t border-white/10">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-gradient-to-r from-blue-400 to-blue-300 rounded"></div>
              <span className="text-white/70 text-sm">Dias úteis</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-gradient-to-r from-purple-400 to-purple-300 rounded"></div>
              <span className="text-white/70 text-sm">Fins de semana</span>
            </div>
          </div>
          
          {/* Chart Stats */}
          <div className="grid grid-cols-3 gap-4 mt-4">
            <div className="text-center">
              <div className="text-white/60 text-xs">Média</div>
              <div className="text-white font-bold">{stats.avgReservationsPerDay.toFixed(1)}</div>
            </div>
            <div className="text-center">
              <div className="text-white/60 text-xs">Pico</div>
              <div className="text-white font-bold">{Math.max(...reportData.map(d => d.totalReservations))}</div>
            </div>
            <div className="text-center">
              <div className="text-white/60 text-xs">Baixo</div>
              <div className="text-white font-bold">{Math.min(...reportData.map(d => d.totalReservations))}</div>
            </div>
          </div>
        </div>

        {/* Court Breakdown */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-white">Resumo por Quadra</h3>
          <div className="space-y-2">
            {courts.map(court => {
              const totalReservations = reportData.reduce((sum, day) => {
                const courtData = day.courtData.find(c => c.courtId === court.id);
                return sum + (courtData?.reservations || 0);
              }, 0);
              
              const totalRevenue = reportData.reduce((sum, day) => {
                const courtData = day.courtData.find(c => c.courtId === court.id);
                return sum + (courtData?.revenue || 0);
              }, 0);
              
              const percentage = stats.totalReservations > 0 ? (totalReservations / stats.totalReservations) * 100 : 0;
              
              return (
                <div key={court.id} className="bg-white/5 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      <MapPin className="w-4 h-4 text-blue-400" />
                      <span className="text-white font-medium">{court.name}</span>
                    </div>
                    <span className="text-white/60 text-sm">{percentage.toFixed(1)}%</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-white/60">{totalReservations} reservas</span>
                    <span className="text-green-400 font-medium">{formatCurrency(totalRevenue)}</span>
                  </div>
                  <div className="mt-2 bg-white/10 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
