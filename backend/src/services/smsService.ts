import twilio from 'twilio';
import pool from '../config/database';

// Configurar Twilio
const accountSid = process.env.TWILIO_ACCOUNT_SID || '';
const authToken = process.env.TWILIO_AUTH_TOKEN || '';
const twilioPhone = process.env.TWILIO_PHONE_NUMBER || '';

const client = twilio(accountSid, authToken);

interface SMSData {
  to: string;
  message: string;
}

/**
 * Enviar SMS
 */
export const sendSMS = async (data: SMSData) => {
  try {
    // Validar se as credenciais estão configuradas
    if (!accountSid || !authToken || !twilioPhone) {
      console.log('⚠️ Twilio não configurado, SMS não será enviado');
      return { success: false, message: 'Twilio não configurado' };
    }

    const message = await client.messages.create({
      body: data.message,
      from: twilioPhone,
      to: data.to
    });

    console.log(`✅ SMS enviado para: ${data.to}`);
    console.log(`📱 SID: ${message.sid}`);
    
    return { success: true, sid: message.sid };
  } catch (error: any) {
    console.error('❌ Erro ao enviar SMS:', error);
    throw error;
  }
};

/**
 * Enviar SMS de confirmação de reserva
 */
export const sendReservationSMS = async (reservationId: number) => {
  try {
    // Buscar dados da reserva
    const result = await pool.query(
      `SELECT r.*, m.full_name, m.phone, c.name as court_name
       FROM reservations r
       JOIN members m ON r.member_id = m.id
       JOIN courts c ON r.court_id = c.id
       WHERE r.id = $1`,
      [reservationId]
    );
    
    if (result.rows.length === 0) {
      throw new Error('Reserva não encontrada');
    }
    
    const reservation = result.rows[0];
    
    if (!reservation.phone) {
      console.log('⚠️ Membro não possui telefone cadastrado');
      return { success: false, message: 'Telefone não cadastrado' };
    }
    
    const startTime = new Date(reservation.start_time);
    const message = `🎾 4SET ARENA\n\nReserva confirmada!\n\nQuadra: ${reservation.court_name}\nData: ${startTime.toLocaleDateString('pt-BR')}\nHora: ${startTime.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}\n\nNos vemos lá! 🏆`;
    
    await sendSMS({
      to: reservation.phone,
      message
    });
    
    // Salvar notificação
    await pool.query(
      `INSERT INTO notifications (
        type, recipient_type, recipient_id, recipient_phone,
        subject, message, status, sent_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        'reservation_sms',
        'member',
        reservation.member_id,
        reservation.phone,
        'Reserva Confirmada',
        message,
        'sent',
        new Date()
      ]
    );
    
    console.log('✅ SMS de confirmação de reserva enviado');
    return { success: true };
  } catch (error) {
    console.error('❌ Erro ao enviar SMS de confirmação de reserva:', error);
    throw error;
  }
};

/**
 * Enviar SMS de lembrete de reserva (1 hora antes)
 */
export const sendReservationReminder = async (reservationId: number) => {
  try {
    // Buscar dados da reserva
    const result = await pool.query(
      `SELECT r.*, m.full_name, m.phone, c.name as court_name
       FROM reservations r
       JOIN members m ON r.member_id = m.id
       JOIN courts c ON r.court_id = c.id
       WHERE r.id = $1`,
      [reservationId]
    );
    
    if (result.rows.length === 0) {
      throw new Error('Reserva não encontrada');
    }
    
    const reservation = result.rows[0];
    
    if (!reservation.phone) {
      console.log('⚠️ Membro não possui telefone cadastrado');
      return { success: false, message: 'Telefone não cadastrado' };
    }
    
    const startTime = new Date(reservation.start_time);
    const message = `⏰ 4SET ARENA\n\nLembrete!\n\nSua reserva na ${reservation.court_name} é daqui a 1 hora!\n\nHora: ${startTime.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}\n\nNão se atrase! 🏃‍♂️`;
    
    await sendSMS({
      to: reservation.phone,
      message
    });
    
    // Salvar notificação
    await pool.query(
      `INSERT INTO notifications (
        type, recipient_type, recipient_id, recipient_phone,
        subject, message, status, sent_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        'reservation_reminder',
        'member',
        reservation.member_id,
        reservation.phone,
        'Lembrete de Reserva',
        message,
        'sent',
        new Date()
      ]
    );
    
    console.log('✅ SMS de lembrete de reserva enviado');
    return { success: true };
  } catch (error) {
    console.error('❌ Erro ao enviar SMS de lembrete de reserva:', error);
    throw error;
  }
};

/**
 * Enviar SMS de pedido pronto
 */
export const sendOrderReadySMS = async (orderId: number) => {
  try {
    // Buscar dados do pedido
    const result = await pool.query(
      `SELECT o.*, m.full_name, m.phone
       FROM orders o
       JOIN members m ON o.member_id = m.id
       WHERE o.id = $1`,
      [orderId]
    );
    
    if (result.rows.length === 0) {
      throw new Error('Pedido não encontrado');
    }
    
    const order = result.rows[0];
    
    if (!order.phone) {
      console.log('⚠️ Membro não possui telefone cadastrado');
      return { success: false, message: 'Telefone não cadastrado' };
    }
    
    const message = `🍔 4SET ARENA\n\nSeu pedido #${order.order_number} está pronto!\n\n${order.delivery_type === 'pickup' ? 'Pode retirar no balcão! 🏪' : 'Saiu para entrega! 🚚'}\n\nBom apetite! 😋`;
    
    await sendSMS({
      to: order.phone,
      message
    });
    
    // Salvar notificação
    await pool.query(
      `INSERT INTO notifications (
        type, recipient_type, recipient_id, recipient_phone,
        subject, message, status, sent_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        'order_ready',
        'member',
        order.member_id,
        order.phone,
        'Pedido Pronto',
        message,
        'sent',
        new Date()
      ]
    );
    
    console.log('✅ SMS de pedido pronto enviado');
    return { success: true };
  } catch (error) {
    console.error('❌ Erro ao enviar SMS de pedido pronto:', error);
    throw error;
  }
};

export default {
  sendSMS,
  sendReservationSMS,
  sendReservationReminder,
  sendOrderReadySMS
};


