import { MercadoPagoConfig, Payment, Preference } from 'mercadopago';
import pool from '../config/database';

// Configurar Mercado Pago
const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN || '',
  options: {
    timeout: 5000
  }
});

const payment = new Payment(client);
const preference = new Preference(client);

interface CreatePaymentData {
  amount: number;
  description: string;
  payerEmail: string;
  payerName?: string;
  payerPhone?: string;
  memberId: number;
  reservationId?: number;
  orderId?: number;
  externalReference: string;
}

interface CreatePreferenceData {
  items: Array<{
    title: string;
    quantity: number;
    unit_price: number;
  }>;
  payer?: {
    email: string;
    name?: string;
    phone?: {
      number: string;
    };
  };
  external_reference: string;
  notification_url?: string;
  back_urls?: {
    success: string;
    failure: string;
    pending: string;
  };
}

/**
 * Criar uma preferência de pagamento (para Checkout Pro)
 */
export const createPaymentPreference = async (data: CreatePreferenceData) => {
  try {
    const preferenceData: any = {
      items: data.items.map(item => ({
        id: `item_${Date.now()}`,
        title: item.title,
        quantity: item.quantity,
        unit_price: item.unit_price,
        currency_id: 'BRL'
      })),
      payer: data.payer,
      external_reference: data.external_reference,
      notification_url: data.notification_url,
      back_urls: data.back_urls || {
        success: `${process.env.FRONTEND_URL}/member/payment/success`,
        failure: `${process.env.FRONTEND_URL}/member/payment/failure`,
        pending: `${process.env.FRONTEND_URL}/member/payment/pending`
      },
      auto_return: 'approved',
      statement_descriptor: '4SET ARENA'
    };

    const response = await preference.create({ body: preferenceData });
    
    console.log('✅ Preferência criada:', response.id);
    
    return {
      id: response.id,
      init_point: response.init_point,
      sandbox_init_point: response.sandbox_init_point
    };
  } catch (error) {
    console.error('❌ Erro ao criar preferência:', error);
    throw error;
  }
};

/**
 * Criar um pagamento direto
 */
export const createPayment = async (data: CreatePaymentData) => {
  try {
    // Salvar no banco de dados primeiro
    const result = await pool.query(
      `INSERT INTO payments (
        payment_id, external_reference, status, amount, currency,
        description, payer_email, payer_name, payer_phone,
        member_id, reservation_id, order_id
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *`,
      [
        `pending_${Date.now()}`,
        data.externalReference,
        'pending',
        data.amount,
        'BRL',
        data.description,
        data.payerEmail,
        data.payerName,
        data.payerPhone,
        data.memberId,
        data.reservationId,
        data.orderId
      ]
    );

    return result.rows[0];
  } catch (error) {
    console.error('❌ Erro ao criar pagamento:', error);
    throw error;
  }
};

/**
 * Buscar informações de um pagamento
 */
export const getPaymentInfo = async (paymentId: string) => {
  try {
    const paymentInfo = await payment.get({ id: paymentId });
    return paymentInfo;
  } catch (error) {
    console.error('❌ Erro ao buscar pagamento:', error);
    throw error;
  }
};

/**
 * Processar webhook do Mercado Pago
 */
export const processWebhook = async (paymentId: string) => {
  try {
    console.log('🔔 Processando webhook para pagamento:', paymentId);
    
    // Buscar informações do pagamento no Mercado Pago
    const paymentInfo = await payment.get({ id: paymentId });
    
    console.log('📊 Status do pagamento:', paymentInfo.status);
    
    // Atualizar no banco de dados
    const result = await pool.query(
      `UPDATE payments 
       SET payment_id = $1,
           status = $2,
           status_detail = $3,
           payment_type = $4,
           payment_method = $5,
           paid_at = $6,
           approved_at = $7,
           metadata = $8,
           updated_at = CURRENT_TIMESTAMP
       WHERE external_reference = $9
       RETURNING *`,
      [
        paymentInfo.id?.toString(),
        paymentInfo.status,
        paymentInfo.status_detail,
        paymentInfo.payment_type_id,
        paymentInfo.payment_method_id,
        paymentInfo.date_approved ? new Date(paymentInfo.date_approved) : null,
        paymentInfo.status === 'approved' ? new Date() : null,
        JSON.stringify(paymentInfo),
        paymentInfo.external_reference
      ]
    );

    if (result.rows.length === 0) {
      console.log('⚠️ Pagamento não encontrado no banco de dados');
      return null;
    }

    const dbPayment = result.rows[0];
    
    // Se o pagamento foi aprovado, atualizar a reserva ou pedido
    if (paymentInfo.status === 'approved') {
      if (dbPayment.reservation_id) {
        await pool.query(
          'UPDATE reservations SET payment_status = $1, payment_id = $2 WHERE id = $3',
          ['paid', dbPayment.id, dbPayment.reservation_id]
        );
        console.log('✅ Reserva atualizada com pagamento aprovado');
      }
      
      if (dbPayment.order_id) {
        await pool.query(
          'UPDATE orders SET payment_status = $1, payment_id = $2 WHERE id = $3',
          ['paid', dbPayment.id, dbPayment.order_id]
        );
        console.log('✅ Pedido atualizado com pagamento aprovado');
      }
    }
    
    return dbPayment;
  } catch (error) {
    console.error('❌ Erro ao processar webhook:', error);
    throw error;
  }
};

/**
 * Buscar pagamentos de um membro
 */
export const getMemberPayments = async (memberId: number) => {
  try {
    const result = await pool.query(
      `SELECT * FROM payments 
       WHERE member_id = $1 
       ORDER BY created_at DESC`,
      [memberId]
    );
    
    return result.rows;
  } catch (error) {
    console.error('❌ Erro ao buscar pagamentos do membro:', error);
    throw error;
  }
};

export default {
  createPaymentPreference,
  createPayment,
  getPaymentInfo,
  processWebhook,
  getMemberPayments
};


