'use client';

import { useState } from 'react';

interface PaymentButtonProps {
  type: 'reservation' | 'order';
  itemId: number;
  amount: number;
  description: string;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export default function PaymentButton({
  type,
  itemId,
  amount,
  description,
  onSuccess,
  onError
}: PaymentButtonProps) {
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    try {
      setLoading(true);

      const token = localStorage.getItem('memberToken');
      if (!token) {
        throw new Error('Você precisa estar logado para fazer pagamentos');
      }

      const apiUrl = 'https://4set-arena-production.up.railway.app/api';
      const endpoint = type === 'reservation' 
        ? `${apiUrl}/payments/reservation`
        : `${apiUrl}/payments/order`;

      const body = type === 'reservation'
        ? { reservationId: itemId }
        : { orderId: itemId };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao criar pagamento');
      }

      const data = await response.json();

      if (data.success && data.data.initPoint) {
        // Redirecionar para o Mercado Pago
        window.location.href = data.data.initPoint;
      } else {
        throw new Error('Erro ao obter link de pagamento');
      }

    } catch (error: any) {
      console.error('Erro ao processar pagamento:', error);
      if (onError) {
        onError(error.message);
      } else {
        alert(`Erro: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handlePayment}
      disabled={loading}
      className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-purple-700 hover:to-indigo-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
    >
      {loading ? (
        <>
          <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Processando...
        </>
      ) : (
        <>
          💳 Pagar R$ {amount.toFixed(2)}
        </>
      )}
    </button>
  );
}

