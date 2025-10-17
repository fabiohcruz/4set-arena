'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { User, Lock, ArrowLeft } from 'lucide-react';

export default function MemberLoginPage() {
  const [memberCode, setMemberCode] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://4set-arena-production.up.railway.app/api';
      const response = await fetch(`${API_URL}/member/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          memberCode,
          password
        })
      });

      const data = await response.json();

      if (response.ok) {
        // Salvar token e dados do membro
        localStorage.setItem('memberToken', data.token);
        localStorage.setItem('memberData', JSON.stringify(data.member));
        
        // Redirecionar para dashboard do membro
        router.push('/member/dashboard');
      } else {
        setError(data.error || 'Erro ao fazer login');
      }
    } catch (error) {
      console.error('Erro no login:', error);
      setError('Erro de conexão. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen gradient-bg flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Botão Voltar */}
        <div className="mb-6">
          <button
            onClick={() => router.push('/')}
            className="flex items-center gap-2 text-white/70 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Voltar ao site</span>
          </button>
        </div>

        {/* Card de Login */}
        <div className="glass p-8 rounded-3xl border border-white/20">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
              <span className="text-white font-bold text-2xl">4S</span>
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">4SET ARENA</h1>
            <p className="text-white/70 text-lg">Área do Membro</p>
            <p className="text-white/60 text-sm mt-2">Faça login para acessar suas funcionalidades</p>
          </div>

          {error && (
            <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-4 mb-6">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-white/80 text-sm font-medium mb-3">Código do Membro</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/50 w-5 h-5" />
                <input
                  type="text"
                  value={memberCode}
                  onChange={(e) => setMemberCode(e.target.value)}
                  placeholder="Digite seu código de membro"
                  className="w-full pl-12 pr-4 py-4 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 transition-all"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-white/80 text-sm font-medium mb-3">Senha</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/50 w-5 h-5" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Digite sua senha"
                  className="w-full pl-12 pr-4 py-4 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 transition-all"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:from-blue-500/50 disabled:to-purple-600/50 disabled:cursor-not-allowed text-white py-4 rounded-2xl font-semibold transition-all duration-300 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Entrando...
                </>
              ) : (
                <>
                  <User className="w-5 h-5" />
                  Entrar na Área do Membro
                </>
              )}
            </button>
          </form>

          <div className="mt-8 p-6 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-2xl">
            <div className="text-center">
              <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <User className="w-4 h-4 text-blue-400" />
              </div>
              <p className="text-blue-400 font-semibold text-sm mb-3">Credenciais de Teste</p>
              <div className="space-y-2">
                <div className="flex items-center justify-center gap-2">
                  <span className="text-white/70 text-sm">Código:</span>
                  <code className="bg-blue-500/20 text-blue-300 px-3 py-1 rounded-lg text-sm font-mono">MEM0001</code>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <span className="text-white/70 text-sm">Senha:</span>
                  <code className="bg-blue-500/20 text-blue-300 px-3 py-1 rounded-lg text-sm font-mono">member123</code>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
