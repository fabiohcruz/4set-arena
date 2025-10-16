'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import MemberLayout from '@/components/MemberLayout';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Shield, 
  Crown, 
  Star,
  Edit,
  Save,
  X,
  Camera,
  Bell,
  Lock,
  CreditCard,
  Settings
} from 'lucide-react';

interface MemberProfile {
  id: number;
  full_name: string;
  email: string;
  phone: string;
  address: string;
  birth_date: string;
  membership_type: string;
  membership_start_date: string;
  membership_end_date: string;
  created_at: string;
  updated_at: string;
}

export default function MemberProfilePage() {
  const [memberData, setMemberData] = useState<MemberProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<MemberProfile>>({});

  useEffect(() => {
    loadMemberData();
  }, []);

  const loadMemberData = () => {
    try {
      const data = localStorage.getItem('memberData');
      if (data) {
        const member = JSON.parse(data);
        setMemberData(member);
        setFormData(member);
      }
    } catch (error) {
      console.error('Erro ao carregar dados do membro:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    try {
      // Aqui você faria a chamada para a API para atualizar os dados
      // Por enquanto, vamos apenas atualizar o localStorage
      localStorage.setItem('memberData', JSON.stringify(formData));
      setMemberData(formData as MemberProfile);
      setEditing(false);
      
      // Mostrar notificação de sucesso
      alert('Perfil atualizado com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      alert('Erro ao atualizar perfil. Tente novamente.');
    }
  };

  const handleCancel = () => {
    setFormData(memberData || {});
    setEditing(false);
  };

  const getMembershipIcon = (type: string) => {
    switch (type) {
      case 'vip':
        return Crown;
      case 'premium':
        return Star;
      default:
        return Shield;
    }
  };

  const getMembershipColor = (type: string) => {
    switch (type) {
      case 'vip':
        return 'from-yellow-400 to-orange-500';
      case 'premium':
        return 'from-purple-400 to-pink-500';
      default:
        return 'from-blue-400 to-cyan-500';
    }
  };

  const getMembershipText = (type: string) => {
    switch (type) {
      case 'vip':
        return 'Membro VIP';
      case 'premium':
        return 'Membro Premium';
      default:
        return 'Membro Regular';
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Não informado';
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  if (loading) {
    return (
      <MemberLayout>
        <div className="flex items-center justify-center h-64">
          <div className="w-16 h-16 border-4 border-white/30 border-t-white rounded-full animate-spin" />
        </div>
      </MemberLayout>
    );
  }

  if (!memberData) {
    return (
      <MemberLayout>
        <div className="text-center py-12">
          <p className="text-white/60 text-lg">Erro ao carregar dados do perfil</p>
        </div>
      </MemberLayout>
    );
  }

  return (
    <MemberLayout>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Meu Perfil</h1>
              <p className="text-white/70">Gerencie suas informações pessoais</p>
            </div>
            <button
              onClick={() => setEditing(!editing)}
              className={`px-6 py-3 rounded-2xl font-semibold transition-all duration-300 flex items-center gap-2 ${
                editing
                  ? 'bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-400'
                  : 'bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 text-blue-400'
              }`}
            >
              {editing ? (
                <>
                  <X className="w-5 h-5" />
                  Cancelar
                </>
              ) : (
                <>
                  <Edit className="w-5 h-5" />
                  Editar
                </>
              )}
            </button>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Card de Informações Pessoais */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-2"
          >
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-8">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
                  <User className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">Informações Pessoais</h2>
                  <p className="text-white/60">Seus dados básicos</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-white/70 text-sm font-medium mb-2">
                    Nome Completo
                  </label>
                  {editing ? (
                    <input
                      type="text"
                      name="full_name"
                      value={formData.full_name || ''}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all duration-300"
                    />
                  ) : (
                    <p className="text-white font-medium">{memberData.full_name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-white/70 text-sm font-medium mb-2">
                    Email
                  </label>
                  {editing ? (
                    <input
                      type="email"
                      name="email"
                      value={formData.email || ''}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all duration-300"
                    />
                  ) : (
                    <p className="text-white font-medium">{memberData.email}</p>
                  )}
                </div>

                <div>
                  <label className="block text-white/70 text-sm font-medium mb-2">
                    Telefone
                  </label>
                  {editing ? (
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone || ''}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all duration-300"
                    />
                  ) : (
                    <p className="text-white font-medium">{memberData.phone || 'Não informado'}</p>
                  )}
                </div>

                <div>
                  <label className="block text-white/70 text-sm font-medium mb-2">
                    Data de Nascimento
                  </label>
                  {editing ? (
                    <input
                      type="date"
                      name="birth_date"
                      value={formData.birth_date || ''}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all duration-300"
                    />
                  ) : (
                    <p className="text-white font-medium">{formatDate(memberData.birth_date)}</p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-white/70 text-sm font-medium mb-2">
                    Endereço
                  </label>
                  {editing ? (
                    <input
                      type="text"
                      name="address"
                      value={formData.address || ''}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all duration-300"
                    />
                  ) : (
                    <p className="text-white font-medium">{memberData.address || 'Não informado'}</p>
                  )}
                </div>
              </div>

              {editing && (
                <div className="flex gap-4 mt-8">
                  <button
                    onClick={handleSave}
                    className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold rounded-xl transition-all duration-300 flex items-center gap-2"
                  >
                    <Save className="w-5 h-5" />
                    Salvar Alterações
                  </button>
                  <button
                    onClick={handleCancel}
                    className="px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold rounded-xl transition-all duration-300 flex items-center gap-2"
                  >
                    <X className="w-5 h-5" />
                    Cancelar
                  </button>
                </div>
              )}
            </div>
          </motion.div>

          {/* Card de Associação */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-6"
          >
            {/* Status da Associação */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className={`w-12 h-12 bg-gradient-to-br ${getMembershipColor(memberData.membership_type)} rounded-2xl flex items-center justify-center`}>
                  {React.createElement(getMembershipIcon(memberData.membership_type), { className: "w-6 h-6 text-white" })}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Associação</h3>
                  <p className="text-white/60">Status atual</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-white/70 text-sm">Tipo</p>
                  <p className="text-white font-semibold">{getMembershipText(memberData.membership_type)}</p>
                </div>
                <div>
                  <p className="text-white/70 text-sm">Início</p>
                  <p className="text-white font-semibold">{formatDate(memberData.membership_start_date)}</p>
                </div>
                <div>
                  <p className="text-white/70 text-sm">Vencimento</p>
                  <p className="text-white font-semibold">{formatDate(memberData.membership_end_date)}</p>
                </div>
              </div>
            </div>

            {/* Ações Rápidas */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-6">
              <h3 className="text-xl font-bold text-white mb-6">Ações Rápidas</h3>
              
              <div className="space-y-3">
                <button className="w-full flex items-center gap-3 p-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl transition-all duration-300">
                  <Bell className="w-5 h-5 text-blue-400" />
                  <span className="text-white font-medium">Notificações</span>
                </button>
                
                <button className="w-full flex items-center gap-3 p-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl transition-all duration-300">
                  <Lock className="w-5 h-5 text-green-400" />
                  <span className="text-white font-medium">Alterar Senha</span>
                </button>
                
                <button className="w-full flex items-center gap-3 p-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl transition-all duration-300">
                  <CreditCard className="w-5 h-5 text-purple-400" />
                  <span className="text-white font-medium">Pagamentos</span>
                </button>
                
                <button className="w-full flex items-center gap-3 p-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl transition-all duration-300">
                  <Settings className="w-5 h-5 text-orange-400" />
                  <span className="text-white font-medium">Configurações</span>
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </MemberLayout>
  );
}
