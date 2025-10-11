'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { User } from '@/lib/auth';
import Layout from '@/components/Layout';
import { validateCPF, formatCPF, formatCEP, formatPhone, fetchAddressByCEP } from '@/lib/utils';
import { MenuPosition } from '@/components/MenuConfig';

export default function ProfilePage() {
  const { user, updateProfile, changePassword, updatePreferences } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'password' | 'settings'>('profile');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Estados para o formulário de perfil
  const [profileData, setProfileData] = useState({
    full_name: '',
    email: '',
    phone: '',
    cpf: '',
    birth_date: '',
    gender: '',
    address: '',
    city: '',
    state: '',
    zip_code: ''
  });

  // Estados para validação
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [loadingCEP, setLoadingCEP] = useState(false);

  // Estado para preferências do menu
  const [menuPosition, setMenuPosition] = useState<MenuPosition>('left');

  // Atualizar dados do perfil quando o usuário carregar
  React.useEffect(() => {
    if (user) {
      setProfileData({
        full_name: user.full_name || '',
        email: user.email || '',
        phone: user.phone || '',
        cpf: user.cpf || '',
        birth_date: user.birth_date || '',
        gender: user.gender || '',
        address: user.address || '',
        city: user.city || '',
        state: user.state || '',
        zip_code: user.zip_code || ''
      });

      // Carregar preferências do menu
      if (user.preferences?.menuPosition) {
        setMenuPosition(user.preferences.menuPosition);
      } else {
        // Carregar do localStorage como fallback
        const savedPosition = localStorage.getItem('menuPosition') as MenuPosition;
        if (savedPosition && ['top', 'left', 'right'].includes(savedPosition)) {
          setMenuPosition(savedPosition);
        }
      }
    }
  }, [user]);

  // Estados para o formulário de senha
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  // Função para validar CPF
  const validateCPFField = (cpf: string) => {
    if (cpf && !validateCPF(cpf)) {
      setErrors(prev => ({ ...prev, cpf: 'CPF inválido' }));
      return false;
    } else {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.cpf;
        return newErrors;
      });
      return true;
    }
  };

  // Função para preencher endereço automaticamente pelo CEP
  const handleCEPChange = async (cep: string) => {
    const formattedCEP = formatCEP(cep);
    setProfileData(prev => ({ ...prev, zip_code: formattedCEP }));

    if (cep.replace(/\D/g, '').length === 8) {
      setLoadingCEP(true);
      try {
        const addressData = await fetchAddressByCEP(cep);
        if (addressData) {
          setProfileData(prev => ({
            ...prev,
            address: addressData.logradouro,
            city: addressData.localidade,
            state: addressData.uf
          }));
        }
      } catch (error) {
        console.error('Erro ao buscar CEP:', error);
      } finally {
        setLoadingCEP(false);
      }
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validar campos obrigatórios
    const newErrors: {[key: string]: string} = {};
    
    if (!profileData.full_name.trim()) {
      newErrors.full_name = 'Nome completo é obrigatório';
    }
    
    if (!profileData.email.trim()) {
      newErrors.email = 'Email é obrigatório';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profileData.email)) {
      newErrors.email = 'Email inválido';
    }
    
    if (!profileData.cpf.trim()) {
      newErrors.cpf = 'CPF é obrigatório';
    } else if (!validateCPF(profileData.cpf)) {
      newErrors.cpf = 'CPF inválido';
    }
    
    // Se há erros, não prosseguir
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      showMessage('error', 'Por favor, corrija os erros no formulário');
      return;
    }
    
    setLoading(true);
    setErrors({}); // Limpar erros anteriores
    
    try {
      await updateProfile(profileData);
      showMessage('success', 'Perfil atualizado com sucesso!');
    } catch (error: any) {
      showMessage('error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showMessage('error', 'As senhas não coincidem');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      showMessage('error', 'A nova senha deve ter pelo menos 6 caracteres');
      return;
    }

    setLoading(true);
    
    try {
      await changePassword(passwordData.currentPassword, passwordData.newPassword);
      showMessage('success', 'Senha alterada com sucesso!');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error: any) {
      showMessage('error', error.message);
    } finally {
      setLoading(false);
    }
  };

  // Função para salvar preferências do menu
  const handleMenuPositionChange = async (newPosition: MenuPosition) => {
    setLoading(true);
    setMessage(null);

    try {
      // Salvar no backend
      await updatePreferences({ menuPosition: newPosition });
      
      // Salvar no localStorage como backup
      localStorage.setItem('menuPosition', newPosition);
      
      // Atualizar estado local
      setMenuPosition(newPosition);
      
      showMessage('success', 'Preferência do menu salva com sucesso!');
    } catch (error: any) {
      showMessage('error', error.message || 'Erro ao salvar preferência');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-400">Carregando perfil...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-white mb-2">Meu Perfil</h1>
          <p className="text-gray-400">Gerencie suas informações pessoais e configurações</p>
        </motion.div>

        {/* Message */}
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mb-6 p-4 rounded-lg ${
              message.type === 'success' 
                ? 'bg-green-500/20 border border-green-500/30 text-green-400' 
                : 'bg-red-500/20 border border-red-500/30 text-red-400'
            }`}
          >
            {message.text}
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-1"
          >
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
              {/* Avatar */}
              <div className="text-center mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mx-auto mb-4 flex items-center justify-center text-2xl font-bold text-white">
                  {user.full_name ? user.full_name.charAt(0).toUpperCase() : user.username.charAt(0).toUpperCase()}
                </div>
                <h3 className="text-lg font-semibold text-white">
                  {user.full_name || user.username}
                </h3>
                <p className="text-sm text-gray-400 capitalize">{user.role}</p>
              </div>

              {/* Navigation */}
              <nav className="space-y-2">
                {[
                  { id: 'profile', label: 'Perfil', icon: '👤' },
                  { id: 'password', label: 'Senha', icon: '🔒' },
                  { id: 'settings', label: 'Configurações', icon: '⚙️' }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`w-full text-left px-4 py-3 rounded-lg transition-all ${
                      activeTab === tab.id
                        ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <span className="mr-3">{tab.icon}</span>
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>
          </motion.div>

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-3"
          >
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
              {/* Profile Tab */}
              {activeTab === 'profile' && (
                <div>
                  <h2 className="text-xl font-semibold text-white mb-6">Informações do Perfil</h2>
                  
                  <form onSubmit={handleProfileUpdate} className="space-y-8">
                    {/* Informações Básicas */}
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-4">Informações Básicas</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            Nome Completo *
                          </label>
                          <input
                            type="text"
                            value={profileData.full_name}
                            onChange={(e) => {
                              setProfileData({ ...profileData, full_name: e.target.value });
                              // Limpar erro quando usuário começar a digitar
                              if (errors.full_name) {
                                setErrors(prev => {
                                  const newErrors = { ...prev };
                                  delete newErrors.full_name;
                                  return newErrors;
                                });
                              }
                            }}
                            className={`w-full px-4 py-3 bg-white/10 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                              errors.full_name ? 'border-red-500' : 'border-white/20'
                            }`}
                            placeholder="Seu nome completo"
                          />
                          {errors.full_name && (
                            <p className="text-red-400 text-xs mt-1">{errors.full_name}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            Email *
                          </label>
                          <input
                            type="email"
                            value={profileData.email}
                            onChange={(e) => {
                              setProfileData({ ...profileData, email: e.target.value });
                              // Limpar erro quando usuário começar a digitar
                              if (errors.email) {
                                setErrors(prev => {
                                  const newErrors = { ...prev };
                                  delete newErrors.email;
                                  return newErrors;
                                });
                              }
                            }}
                            className={`w-full px-4 py-3 bg-white/10 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                              errors.email ? 'border-red-500' : 'border-white/20'
                            }`}
                            placeholder="seu@email.com"
                          />
                          {errors.email && (
                            <p className="text-red-400 text-xs mt-1">{errors.email}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            Telefone
                          </label>
                          <input
                            type="tel"
                            value={profileData.phone}
                            onChange={(e) => setProfileData({ ...profileData, phone: formatPhone(e.target.value) })}
                            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="(11) 99999-9999"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            CPF *
                          </label>
                          <input
                            type="text"
                            value={profileData.cpf}
                            onChange={(e) => {
                              const formattedCPF = formatCPF(e.target.value);
                              setProfileData({ ...profileData, cpf: formattedCPF });
                              validateCPFField(formattedCPF);
                            }}
                            onBlur={() => validateCPFField(profileData.cpf)}
                            className={`w-full px-4 py-3 bg-white/10 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                              errors.cpf ? 'border-red-500' : 'border-white/20'
                            }`}
                            placeholder="000.000.000-00"
                            required
                          />
                          {errors.cpf && (
                            <p className="text-red-400 text-xs mt-1">{errors.cpf}</p>
                          )}
                        </div>


                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            Data de Nascimento
                          </label>
                          <input
                            type="date"
                            value={profileData.birth_date}
                            onChange={(e) => setProfileData({ ...profileData, birth_date: e.target.value })}
                            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            Gênero
                          </label>
                          <select
                            value={profileData.gender}
                            onChange={(e) => setProfileData({ ...profileData, gender: e.target.value })}
                            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          >
                            <option value="">Selecione...</option>
                            <option value="masculino">Masculino</option>
                            <option value="feminino">Feminino</option>
                            <option value="outro">Outro</option>
                            <option value="prefiro_nao_informar">Prefiro não informar</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Endereço */}
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-4">Endereço</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            Endereço
                          </label>
                          <input
                            type="text"
                            value={profileData.address}
                            onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
                            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Rua, número, complemento"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            Cidade
                          </label>
                          <input
                            type="text"
                            value={profileData.city}
                            onChange={(e) => setProfileData({ ...profileData, city: e.target.value })}
                            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Sua cidade"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            Estado
                          </label>
                          <input
                            type="text"
                            value={profileData.state}
                            onChange={(e) => setProfileData({ ...profileData, state: e.target.value })}
                            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Seu estado"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            CEP
                          </label>
                          <div className="relative">
                            <input
                              type="text"
                              value={profileData.zip_code}
                              onChange={(e) => handleCEPChange(e.target.value)}
                              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder="00000-000"
                            />
                            {loadingCEP && (
                              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>



                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={loading}
                        className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 text-white rounded-lg transition-colors flex items-center"
                      >
                        {loading && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>}
                        Salvar Alterações
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Password Tab */}
              {activeTab === 'password' && (
                <div>
                  <h2 className="text-xl font-semibold text-white mb-6">Alterar Senha</h2>
                  
                  <form onSubmit={handlePasswordChange} className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Senha Atual
                      </label>
                      <input
                        type="password"
                        value={passwordData.currentPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Digite sua senha atual"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Nova Senha
                        </label>
                        <input
                          type="password"
                          value={passwordData.newPassword}
                          onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Digite a nova senha"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Confirmar Nova Senha
                        </label>
                        <input
                          type="password"
                          value={passwordData.confirmPassword}
                          onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Confirme a nova senha"
                          required
                        />
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={loading}
                        className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 text-white rounded-lg transition-colors flex items-center"
                      >
                        {loading && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>}
                        Alterar Senha
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Settings Tab */}
              {activeTab === 'settings' && (
                <div>
                  <h2 className="text-xl font-semibold text-white mb-6">Configurações</h2>
                  
                  <div className="space-y-6">
                    <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                      <h3 className="text-lg font-medium text-white mb-4">Informações da Conta</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-400">Membro desde:</span>
                          <p className="text-white">{new Date(user.created_at).toLocaleDateString('pt-BR')}</p>
                        </div>
                        <div>
                          <span className="text-gray-400">Último login:</span>
                          <p className="text-white">
                            {user.last_login 
                              ? new Date(user.last_login).toLocaleString('pt-BR', {
                                  day: '2-digit',
                                  month: '2-digit',
                                  year: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })
                              : 'Nunca'
                            }
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                      <h3 className="text-lg font-medium text-white mb-4">Preferências do Menu</h3>
                      <p className="text-gray-400 mb-4">Escolha a posição do menu principal:</p>
                      
                      <div className="space-y-3">
                        {[
                          { 
                            value: 'left' as MenuPosition, 
                            label: 'Lateral Esquerdo', 
                            description: 'Menu fixo na lateral esquerda'
                          },
                          { 
                            value: 'right' as MenuPosition, 
                            label: 'Lateral Direito', 
                            description: 'Menu fixo na lateral direita'
                          },
                          { 
                            value: 'top' as MenuPosition, 
                            label: 'Superior', 
                            description: 'Menu horizontal no topo'
                          }
                        ].map((option) => (
                          <label key={option.value} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-white/5 cursor-pointer transition-colors">
                            <input
                              type="radio"
                              name="menuPosition"
                              value={option.value}
                              checked={menuPosition === option.value}
                              onChange={() => handleMenuPositionChange(option.value)}
                              className="w-4 h-4 text-blue-600 bg-white/10 border-white/20 focus:ring-blue-500 focus:ring-2"
                            />
                            <div className="flex-1">
                              <p className="text-white font-medium">{option.label}</p>
                              <p className="text-gray-400 text-sm">{option.description}</p>
                            </div>
                            {menuPosition === option.value && (
                              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                            )}
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
}
