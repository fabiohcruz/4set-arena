'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Trophy, Shield, Users, Target } from 'lucide-react';
import { formatCPF } from '@/lib/utils';
import Logo from '@/components/Logo';

export default function LoginPage() {
  const [cpf, setCpf] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await login(cpf, password);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const features = [
    { icon: Trophy, title: 'Competições', description: 'Gerencie torneios e campeonatos' },
    { icon: Users, title: 'Atletas', description: 'Controle de jogadores e equipes' },
    { icon: Target, title: 'Treinos', description: 'Planejamento e acompanhamento' },
    { icon: Shield, title: 'Segurança', description: 'Dados protegidos e seguros' }
  ];

  return (
    <div className="min-h-screen gradient-bg flex items-center justify-center p-4">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full blur-3xl"
          animate={{ 
            x: [0, 100, 0],
            y: [0, -100, 0],
          }}
          transition={{ 
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
        />
        <motion.div
          className="absolute -bottom-40 -left-40 w-80 h-80 bg-white/10 rounded-full blur-3xl"
          animate={{ 
            x: [0, -100, 0],
            y: [0, 100, 0],
          }}
          transition={{ 
            duration: 25,
            repeat: Infinity,
            ease: "linear"
          }}
        />
      </div>

      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center">
        {/* Left Side - Features */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="text-white space-y-8"
        >
          <div>
            <div className="mb-6">
              <Logo size="xl" variant="full" className="mb-4" />
            </div>
            <h1 className="text-5xl font-bold mb-4">
              4Set <span className="text-yellow-300">Sports</span>
            </h1>
            <p className="text-xl text-white/80 mb-8">
              Sistema completo para gestão esportiva com tecnologia de ponta
            </p>
          </div>

          <div className="grid grid-cols-2 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="glass p-6 rounded-2xl hover:bg-white/20 transition-all duration-300"
              >
                <feature.icon className="w-8 h-8 text-yellow-300 mb-3" />
                <h3 className="font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-white/70">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Right Side - Login Form */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="glass p-8 rounded-3xl max-w-md mx-auto w-full"
        >
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white mb-2">Bem-vindo!</h2>
            <p className="text-white/70">Faça login para acessar o sistema</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-white/80 text-sm font-medium mb-2">
                CPF ou Usuário
              </label>
              <input
                type="text"
                value={cpf}
                onChange={(e) => {
                  const value = e.target.value;
                  // Se contém apenas números, formata como CPF
                  if (/^\d+$/.test(value.replace(/\D/g, ''))) {
                    setCpf(formatCPF(value));
                  } else {
                    // Se contém letras, permite texto livre (username)
                    setCpf(value);
                  }
                }}
                className="input-glass w-full"
                placeholder="000.000.000-00 ou admin"
                required
              />
            </div>

            <div>
              <label className="block text-white/80 text-sm font-medium mb-2">
                Senha
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-glass w-full"
                placeholder="Digite sua senha"
                required
              />
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-500/20 border border-red-500/30 text-red-200 px-4 py-3 rounded-xl text-sm"
              >
                {error}
              </motion.div>
            )}

            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                  Entrando...
                </div>
              ) : (
                'Entrar'
              )}
            </motion.button>
          </form>

          <div className="mt-8 p-4 bg-yellow-500/20 border border-yellow-500/30 rounded-xl">
            <p className="text-yellow-200 text-sm text-center">
              <strong>Credenciais de teste:</strong><br />
              <strong>Opção 1:</strong> Usuário: <code className="bg-black/20 px-2 py-1 rounded">admin</code> | Senha: <code className="bg-black/20 px-2 py-1 rounded">admin</code><br />
              <strong>Opção 2:</strong> CPF: <code className="bg-black/20 px-2 py-1 rounded">050.330.499-92</code> | Senha: <code className="bg-black/20 px-2 py-1 rounded">admin</code>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
