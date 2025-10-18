'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function PaymentSuccess() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          router.push('/member/dashboard');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        {/* Ícone de sucesso animado */}
        <div className="mb-6 flex justify-center">
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center animate-bounce">
            <svg className="w-12 h-12 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>

        {/* Título */}
        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          🎉 Pagamento Aprovado!
        </h1>

        {/* Mensagem */}
        <p className="text-gray-600 mb-6">
          Seu pagamento foi processado com sucesso! Você receberá um email de confirmação em breve.
        </p>

        {/* Informações adicionais */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-green-800">
            ✅ Transação confirmada<br />
            📧 Email de confirmação enviado<br />
            📱 SMS de confirmação enviado
          </p>
        </div>

        {/* Contador */}
        <p className="text-sm text-gray-500 mb-6">
          Redirecionando em {countdown} segundos...
        </p>

        {/* Botões */}
        <div className="space-y-3">
          <Link
            href="/member/dashboard"
            className="block w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-purple-700 hover:to-indigo-700 transition-all duration-200"
          >
            Ir para o Dashboard
          </Link>
          <Link
            href="/member/reservations"
            className="block w-full bg-gray-100 text-gray-700 py-3 px-6 rounded-lg font-semibold hover:bg-gray-200 transition-all duration-200"
          >
            Ver Minhas Reservas
          </Link>
        </div>
      </div>
    </div>
  );
}

