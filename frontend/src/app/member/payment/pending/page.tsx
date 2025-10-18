'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function PaymentPending() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        {/* Ícone de pendente */}
        <div className="mb-6 flex justify-center">
          <div className="w-24 h-24 bg-yellow-100 rounded-full flex items-center justify-center">
            <svg className="w-12 h-12 text-yellow-500 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>

        {/* Título */}
        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          ⏳ Pagamento Pendente
        </h1>

        {/* Mensagem */}
        <p className="text-gray-600 mb-6">
          Seu pagamento está sendo processado. Você receberá uma confirmação assim que for aprovado.
        </p>

        {/* Informações */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-yellow-800 font-semibold mb-2">
            ℹ️ O que acontece agora?
          </p>
          <ul className="text-sm text-yellow-700 space-y-2 text-left">
            <li>✓ Seu pedido foi registrado</li>
            <li>⏳ Aguardando confirmação do pagamento</li>
            <li>📧 Você receberá um email quando for aprovado</li>
            <li>📱 Enviaremos um SMS de confirmação</li>
          </ul>
        </div>

        {/* Tempo estimado */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-blue-800">
            ⏱️ <strong>Tempo estimado:</strong><br />
            Boleto: até 2 dias úteis<br />
            Pix: alguns minutos<br />
            Cartão: instantâneo
          </p>
        </div>

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

        {/* Ajuda */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-500">
            Dúvidas? Entre em contato:<br />
            📞 (47) 99999-9999<br />
            📧 suporte@4setarena.com
          </p>
        </div>
      </div>
    </div>
  );
}

