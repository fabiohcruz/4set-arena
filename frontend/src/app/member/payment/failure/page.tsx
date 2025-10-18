'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function PaymentFailure() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        {/* Ícone de erro */}
        <div className="mb-6 flex justify-center">
          <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center">
            <svg className="w-12 h-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
        </div>

        {/* Título */}
        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          ❌ Pagamento Não Aprovado
        </h1>

        {/* Mensagem */}
        <p className="text-gray-600 mb-6">
          Não foi possível processar seu pagamento. Isso pode ter acontecido por diversos motivos.
        </p>

        {/* Motivos possíveis */}
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-left">
          <p className="text-sm text-red-800 font-semibold mb-2">Possíveis motivos:</p>
          <ul className="text-sm text-red-700 space-y-1 list-disc list-inside">
            <li>Saldo insuficiente</li>
            <li>Dados do cartão incorretos</li>
            <li>Pagamento cancelado</li>
            <li>Limite de crédito excedido</li>
          </ul>
        </div>

        {/* Botões */}
        <div className="space-y-3">
          <button
            onClick={() => router.back()}
            className="block w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-purple-700 hover:to-indigo-700 transition-all duration-200"
          >
            🔄 Tentar Novamente
          </button>
          <Link
            href="/member/dashboard"
            className="block w-full bg-gray-100 text-gray-700 py-3 px-6 rounded-lg font-semibold hover:bg-gray-200 transition-all duration-200"
          >
            Voltar ao Dashboard
          </Link>
        </div>

        {/* Ajuda */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-500">
            Precisa de ajuda? Entre em contato conosco:<br />
            📞 (47) 99999-9999<br />
            📧 suporte@4setarena.com
          </p>
        </div>
      </div>
    </div>
  );
}

