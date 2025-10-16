'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import Layout from '@/components/Layout';
import { useClients } from '@/context/ClientsContext';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  CreditCard,
  ArrowLeft,
  CheckCircle,
  Save,
  Trash2
} from 'lucide-react';

const timeSlots = [
  '06:00', '06:30', '07:00', '07:30', '08:00', '08:30',
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
  '15:00', '15:30', '16:00', '16:30', '17:00', '17:30',
  '18:00', '18:30', '19:00', '19:30', '20:00', '20:30',
  '21:00', '21:30', '22:00', '22:30', '23:00', '23:30'
];

export default function EditarReservaPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { clients, getActiveClients } = useClients();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    court: '',
    date: '',
    time: '',
    duration: 1,
    participants: 1,
    name: '',
    email: '',
    phone: '',
    observations: '',
    clientId: ''
  });
  const [loading, setLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Dados mockados das quadras
  const courts = [
    { id: 1, name: 'Quadra 1 - Tênis', type: 'Quadra', capacity: 4, price: 80, is_active: true },
    { id: 2, name: 'Quadra 2 - Futebol', type: 'Campo', capacity: 22, price: 120, is_active: true },
    { id: 3, name: 'Quadra 3 - Basquete', type: 'Quadra', capacity: 10, price: 100, is_active: true },
    { id: 4, name: 'Piscina - Natação', type: 'Piscina', capacity: 8, price: 60, is_active: true }
  ];

  // Preencher dados da URL e simular dados da reserva existente
  useEffect(() => {
    const court = searchParams.get('court');
    const date = searchParams.get('date');
    const time = searchParams.get('time');
    const clientId = searchParams.get('clientId');
    
    // Simular dados de uma reserva existente
    const mockReservation = {
      court: court || '1',
      date: date || new Date().toISOString().split('T')[0],
      time: time || '10:00',
      duration: 2,
      participants: 4,
      name: 'João Silva',
      email: 'joao@email.com',
      phone: '(11) 99999-9999',
      observations: 'Reserva para treino de tênis',
      clientId: clientId || '1'
    };
    
    setFormData(mockReservation);
  }, [searchParams]);

  const selectedCourt = courts.find(court => court.id === parseInt(formData.court));
  const activeClients = getActiveClients();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setLoading(true);
    
    // Simular atualização da reserva
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setLoading(false);
    setStep(4); // Página de confirmação
  };

  const handleDelete = async () => {
    setLoading(true);
    
    // Simular exclusão da reserva
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setLoading(false);
    router.push('/reservas');
  };

  const calculateTotal = () => {
    if (!selectedCourt) return 0;
    return selectedCourt.price * formData.duration;
  };

  const formatDuration = (duration: number) => {
    if (duration === 1) return '1 hora';
    if (duration === 1.5) return '1 hora e 30 minutos';
    if (duration === 2) return '2 horas';
    if (duration === 2.5) return '2 horas e 30 minutos';
    if (duration === 3) return '3 horas';
    if (duration === 3.5) return '3 horas e 30 minutos';
    if (duration === 4) return '4 horas';
    if (duration === 5) return '5 horas';
    if (duration === 6) return '6 horas';
    if (duration === 8) return '8 horas';
    return `${duration} horas`;
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (step === 4) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
          <div className="max-w-2xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-8 text-center"
            >
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-white mb-4">
                Reserva Atualizada!
              </h1>
              <p className="text-gray-300 mb-6">
                As alterações na sua reserva foram salvas com sucesso.
              </p>
              <div className="space-y-4">
                <button
                  onClick={() => router.push('/reservas')}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
                >
                  Ver Reservas
                </button>
                <button
                  onClick={() => router.push('/reservas/nova')}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg transition-colors ml-4"
                >
                  Nova Reserva
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={() => router.back()}
              className="flex items-center space-x-2 text-gray-300 hover:text-white mb-4 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Voltar</span>
            </button>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">
                  Editar Reserva
                </h1>
                <p className="text-gray-300">
                  Modifique os dados da sua reserva
                </p>
              </div>
              <button
                onClick={() => setShowDeleteModal(true)}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
              >
                <Trash2 className="w-4 h-4" />
                <span>Excluir</span>
              </button>
            </div>
          </div>

          {/* Progress Steps */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              {[1, 2, 3].map((stepNumber) => (
                <div key={stepNumber} className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    step >= stepNumber ? 'bg-blue-600 text-white' : 'bg-gray-600 text-gray-300'
                  }`}>
                    {stepNumber}
                  </div>
                  {stepNumber < 3 && (
                    <div className={`w-16 h-1 mx-2 ${
                      step > stepNumber ? 'bg-blue-600' : 'bg-gray-600'
                    }`} />
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-2 text-sm text-gray-400">
              <span>Escolher Espaço</span>
              <span>Dados da Reserva</span>
              <span>Confirmação</span>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Step 1: Escolher Espaço */}
            {step === 1 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-6">
                  <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
                    <MapPin className="w-5 h-5 mr-2" />
                    Escolher Espaço
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {courts.map(court => (
                      <div
                        key={court.id}
                        onClick={() => setFormData({ ...formData, court: court.id.toString() })}
                        className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                          formData.court === court.id.toString()
                            ? 'border-blue-500 bg-blue-500/10'
                            : 'border-white/20 hover:border-white/40'
                        }`}
                      >
                        <h3 className="text-white font-medium mb-2">{court.name}</h3>
                        <div className="flex items-center justify-between text-sm text-gray-400">
                          <span className="flex items-center">
                            <Users className="w-4 h-4 mr-1" />
                            {court.capacity} pessoas
                          </span>
                          <span className="text-green-400 font-medium">
                            R$ {court.price}/h
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-6">
                  <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
                    <Calendar className="w-5 h-5 mr-2" />
                    Data e Horário
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-white font-medium mb-2">Data</label>
                      <input
                        type="date"
                        value={formData.date}
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-white font-medium mb-2">Horário</label>
                      <select
                        value={formData.time}
                        onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      >
                        <option value="">Selecione um horário</option>
                        {timeSlots.map(time => (
                          <option key={time} value={time}>{time}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setStep(2)}
                  disabled={!formData.court || !formData.date || !formData.time}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white py-3 rounded-lg transition-colors"
                >
                  Continuar
                </button>
              </motion.div>
            )}

            {/* Step 2: Dados da Reserva */}
            {step === 2 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-6">
                  <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
                    <Clock className="w-5 h-5 mr-2" />
                    Detalhes da Reserva
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-white font-medium mb-2">
                        Duração
                        <span className="text-gray-400 text-sm font-normal ml-2">(mínimo 1 hora)</span>
                      </label>
                      <select
                        value={formData.duration}
                        onChange={(e) => setFormData({ ...formData, duration: parseFloat(e.target.value) })}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value={1}>1 hora</option>
                        <option value={1.5}>1 hora e 30 minutos</option>
                        <option value={2}>2 horas</option>
                        <option value={2.5}>2 horas e 30 minutos</option>
                        <option value={3}>3 horas</option>
                        <option value={3.5}>3 horas e 30 minutos</option>
                        <option value={4}>4 horas</option>
                        <option value={5}>5 horas</option>
                        <option value={6}>6 horas</option>
                        <option value={8}>8 horas</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-white font-medium mb-2">Número de Participantes</label>
                      <input
                        type="number"
                        min="1"
                        max={selectedCourt?.capacity || 1}
                        value={formData.participants}
                        onChange={(e) => setFormData({ ...formData, participants: parseInt(e.target.value) })}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-6">
                  <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
                    <Users className="w-5 h-5 mr-2" />
                    Dados Pessoais
                  </h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-white font-medium mb-2">Cliente</label>
                      <select
                        value={formData.clientId}
                        onChange={(e) => {
                          const selectedClient = activeClients.find(client => client.id.toString() === e.target.value);
                          setFormData({ 
                            ...formData, 
                            clientId: e.target.value,
                            name: selectedClient?.full_name || '',
                            email: selectedClient?.email || '',
                            phone: selectedClient?.phone || ''
                          });
                        }}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      >
                        <option value="">Selecione um cliente</option>
                        {activeClients.map(client => (
                          <option key={client.id} value={client.id}>
                            {client.full_name} - {client.member_code}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-white font-medium mb-2">Nome Completo</label>
                        <input
                          type="text"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-white font-medium mb-2">Email</label>
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-white font-medium mb-2">Telefone</label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-white font-medium mb-2">Observações (opcional)</label>
                      <textarea
                        value={formData.observations}
                        onChange={(e) => setFormData({ ...formData, observations: e.target.value })}
                        rows={3}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Alguma observação especial sobre sua reserva..."
                      />
                    </div>
                  </div>
                </div>

                <div className="flex space-x-4">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-3 rounded-lg transition-colors"
                  >
                    Voltar
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep(3)}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg transition-colors"
                  >
                    Continuar
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step 3: Confirmação */}
            {step === 3 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-6">
                  <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
                    <CreditCard className="w-5 h-5 mr-2" />
                    Confirmação da Edição
                  </h2>
                  
                  <div className="space-y-4">
                    <div className="bg-white/5 rounded-lg p-4">
                      <h3 className="text-white font-medium mb-2">Resumo da Reserva</h3>
                      <div className="space-y-2 text-gray-300">
                        <p><span className="font-medium">Espaço:</span> {selectedCourt?.name}</p>
                        <p><span className="font-medium">Data:</span> {formatDate(formData.date)}</p>
                        <p><span className="font-medium">Horário:</span> {formData.time}</p>
                        <p><span className="font-medium">Duração:</span> {formatDuration(formData.duration)}</p>
                        <p><span className="font-medium">Participantes:</span> {formData.participants}</p>
                        <p><span className="font-medium">Valor Total:</span> 
                          <span className="text-green-400 font-bold ml-2">
                            R$ {calculateTotal().toFixed(2)}
                          </span>
                        </p>
                      </div>
                    </div>

                    <div className="bg-white/5 rounded-lg p-4">
                      <h3 className="text-white font-medium mb-2">Dados do Responsável</h3>
                      <div className="space-y-2 text-gray-300">
                        <p><span className="font-medium">Nome:</span> {formData.name}</p>
                        <p><span className="font-medium">Email:</span> {formData.email}</p>
                        <p><span className="font-medium">Telefone:</span> {formData.phone}</p>
                        {formData.observations && (
                          <p><span className="font-medium">Observações:</span> {formData.observations}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex space-x-4">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-3 rounded-lg transition-colors"
                  >
                    Voltar
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white py-3 rounded-lg transition-colors flex items-center justify-center"
                  >
                    {loading ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Salvar Alterações
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            )}
          </form>

          {/* Modal de Confirmação de Exclusão */}
          {showDeleteModal && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-slate-800 rounded-lg p-6 w-full max-w-md mx-4"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold text-white">Confirmar Exclusão</h3>
                  <button
                    onClick={() => setShowDeleteModal(false)}
                    className="text-gray-400 hover:text-white"
                  >
                    ×
                  </button>
                </div>
                
                <p className="text-gray-300 mb-6">
                  Tem certeza que deseja excluir esta reserva? Esta ação não pode ser desfeita.
                </p>

                <div className="flex space-x-3">
                  <button
                    onClick={() => setShowDeleteModal(false)}
                    className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-lg transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={loading}
                    className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white py-2 px-4 rounded-lg transition-colors flex items-center justify-center"
                  >
                    {loading ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                      'Excluir'
                    )}
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

