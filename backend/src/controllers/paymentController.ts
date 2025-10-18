import { Request, Response } from 'express';
import mercadopagoService from '../services/mercadopagoService';
import emailService from '../services/emailService';
import smsService from '../services/smsService';
import pool from '../config/database';

/**
 * Criar preferência de pagamento para reserva
 */
export const createReservationPayment = async (req: Request, res: Response) => {
  try {
    const { reservationId } = req.body;
    const memberId = (req as any).user?.id;

    if (!memberId) {
      return res.status(401).json({ message: 'Não autorizado' });
    }

    // Buscar dados da reserva
    const result = await pool.query(
      `SELECT r.*, m.full_name, m.email, m.phone, c.name as court_name, c.hourly_rate
       FROM reservations r
       JOIN members m ON r.member_id = m.id
       JOIN courts c ON r.court_id = c.id
       WHERE r.id = $1 AND r.member_id = $2`,
      [reservationId, memberId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Reserva não encontrada' });
    }

    const reservation = result.rows[0];

    // Criar referência externa única
    const externalReference = `RES_${reservationId}_${Date.now()}`;

    // Criar preferência de pagamento
    const preference = await mercadopagoService.createPaymentPreference({
      items: [
        {
          title: `Reserva - ${reservation.court_name}`,
          quantity: 1,
          unit_price: parseFloat(reservation.total_price)
        }
      ],
      payer: {
        email: reservation.email,
        name: reservation.full_name,
        phone: reservation.phone ? { number: reservation.phone } : undefined
      },
      external_reference: externalReference,
      notification_url: `${process.env.BACKEND_URL || 'https://4set-arena-production.up.railway.app'}/api/payments/webhook`,
      back_urls: {
        success: `${process.env.FRONTEND_URL}/member/payment/success?ref=${externalReference}`,
        failure: `${process.env.FRONTEND_URL}/member/payment/failure?ref=${externalReference}`,
        pending: `${process.env.FRONTEND_URL}/member/payment/pending?ref=${externalReference}`
      }
    });

    // Criar registro de pagamento no banco
    await mercadopagoService.createPayment({
      amount: parseFloat(reservation.total_price),
      description: `Reserva - ${reservation.court_name}`,
      payerEmail: reservation.email,
      payerName: reservation.full_name,
      payerPhone: reservation.phone,
      memberId,
      reservationId,
      externalReference
    });

    res.json({
      success: true,
      data: {
        preferenceId: preference.id,
        initPoint: preference.init_point,
        sandboxInitPoint: preference.sandbox_init_point
      }
    });
  } catch (error) {
    console.error('Erro ao criar pagamento de reserva:', error);
    res.status(500).json({ message: 'Erro ao criar pagamento' });
  }
};

/**
 * Criar preferência de pagamento para pedido
 */
export const createOrderPayment = async (req: Request, res: Response) => {
  try {
    const { orderId } = req.body;
    const memberId = (req as any).user?.id;

    if (!memberId) {
      return res.status(401).json({ message: 'Não autorizado' });
    }

    // Buscar dados do pedido
    const result = await pool.query(
      `SELECT o.*, m.full_name, m.email, m.phone
       FROM orders o
       JOIN members m ON o.member_id = m.id
       WHERE o.id = $1 AND o.member_id = $2`,
      [orderId, memberId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Pedido não encontrado' });
    }

    const order = result.rows[0];

    // Buscar itens do pedido
    const itemsResult = await pool.query(
      'SELECT * FROM order_items WHERE order_id = $1',
      [orderId]
    );

    const items = itemsResult.rows.map(item => ({
      title: item.product_name,
      quantity: item.quantity,
      unit_price: parseFloat(item.unit_price)
    }));

    // Criar referência externa única
    const externalReference = `ORD_${orderId}_${Date.now()}`;

    // Criar preferência de pagamento
    const preference = await mercadopagoService.createPaymentPreference({
      items,
      payer: {
        email: order.email,
        name: order.full_name,
        phone: order.phone ? { number: order.phone } : undefined
      },
      external_reference: externalReference,
      notification_url: `${process.env.BACKEND_URL || 'https://4set-arena-production.up.railway.app'}/api/payments/webhook`
    });

    // Criar registro de pagamento no banco
    await mercadopagoService.createPayment({
      amount: parseFloat(order.total),
      description: `Pedido #${order.order_number}`,
      payerEmail: order.email,
      payerName: order.full_name,
      payerPhone: order.phone,
      memberId,
      orderId,
      externalReference
    });

    res.json({
      success: true,
      data: {
        preferenceId: preference.id,
        initPoint: preference.init_point,
        sandboxInitPoint: preference.sandbox_init_point
      }
    });
  } catch (error) {
    console.error('Erro ao criar pagamento de pedido:', error);
    res.status(500).json({ message: 'Erro ao criar pagamento' });
  }
};

/**
 * Webhook do Mercado Pago
 */
export const handleWebhook = async (req: Request, res: Response) => {
  try {
    console.log('🔔 Webhook recebido:', req.body);

    const { type, data } = req.body;

    // Mercado Pago envia notificações de diferentes tipos
    if (type === 'payment') {
      const paymentId = data.id;
      
      // Processar o pagamento
      const payment = await mercadopagoService.processWebhook(paymentId);
      
      if (payment && payment.status === 'approved') {
        // Enviar notificações
        if (payment.reservation_id) {
          await emailService.sendReservationConfirmation(payment.reservation_id);
          await smsService.sendReservationSMS(payment.reservation_id);
        }
        
        if (payment.order_id) {
          await emailService.sendOrderConfirmation(payment.order_id);
        }
      }
    }

    // Sempre responder 200 para o Mercado Pago
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Erro ao processar webhook:', error);
    // Mesmo com erro, responder 200 para não receber o webhook novamente
    res.status(200).json({ success: false });
  }
};

/**
 * Buscar pagamentos do membro
 */
export const getMemberPayments = async (req: Request, res: Response) => {
  try {
    const memberId = (req as any).user?.id;

    if (!memberId) {
      return res.status(401).json({ message: 'Não autorizado' });
    }

    const payments = await mercadopagoService.getMemberPayments(memberId);

    res.json({
      success: true,
      data: payments
    });
  } catch (error) {
    console.error('Erro ao buscar pagamentos:', error);
    res.status(500).json({ message: 'Erro ao buscar pagamentos' });
  }
};

/**
 * Buscar status de um pagamento
 */
export const getPaymentStatus = async (req: Request, res: Response) => {
  try {
    const { externalReference } = req.params;
    const memberId = (req as any).user?.id;

    if (!memberId) {
      return res.status(401).json({ message: 'Não autorizado' });
    }

    const result = await pool.query(
      'SELECT * FROM payments WHERE external_reference = $1 AND member_id = $2',
      [externalReference, memberId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Pagamento não encontrado' });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Erro ao buscar status do pagamento:', error);
    res.status(500).json({ message: 'Erro ao buscar status do pagamento' });
  }
};

export default {
  createReservationPayment,
  createOrderPayment,
  handleWebhook,
  getMemberPayments,
  getPaymentStatus
};

