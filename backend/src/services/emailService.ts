import sgMail from '@sendgrid/mail';
import pool from '../config/database';

// Configurar SendGrid
sgMail.setApiKey(process.env.SENDGRID_API_KEY || '');

const FROM_EMAIL = process.env.FROM_EMAIL || 'noreply@4setarena.com';
const FROM_NAME = process.env.FROM_NAME || '4SET ARENA';

interface EmailData {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

interface NotificationData {
  type: string;
  recipientType: 'member' | 'admin';
  recipientId: number;
  recipientEmail: string;
  subject: string;
  message: string;
  metadata?: any;
}

/**
 * Enviar email
 */
export const sendEmail = async (data: EmailData) => {
  try {
    const msg = {
      to: data.to,
      from: {
        email: FROM_EMAIL,
        name: FROM_NAME
      },
      subject: data.subject,
      text: data.text || data.html.replace(/<[^>]*>/g, ''),
      html: data.html
    };

    await sgMail.send(msg);
    console.log(`✅ Email enviado para: ${data.to}`);
    
    return { success: true };
  } catch (error: any) {
    console.error('❌ Erro ao enviar email:', error);
    if (error.response) {
      console.error('Detalhes:', error.response.body);
    }
    throw error;
  }
};

/**
 * Salvar notificação no banco de dados
 */
export const saveNotification = async (data: NotificationData) => {
  try {
    const result = await pool.query(
      `INSERT INTO notifications (
        type, recipient_type, recipient_id, recipient_email,
        subject, message, status, metadata
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *`,
      [
        data.type,
        data.recipientType,
        data.recipientId,
        data.recipientEmail,
        data.subject,
        data.message,
        'pending',
        JSON.stringify(data.metadata || {})
      ]
    );
    
    return result.rows[0];
  } catch (error) {
    console.error('❌ Erro ao salvar notificação:', error);
    throw error;
  }
};

/**
 * Enviar email de confirmação de reserva
 */
export const sendReservationConfirmation = async (reservationId: number) => {
  try {
    // Buscar dados da reserva
    const result = await pool.query(
      `SELECT r.*, m.full_name, m.email, m.phone, c.name as court_name, c.hourly_rate
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
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .info-box { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
          .info-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
          .info-label { font-weight: bold; color: #667eea; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          .button { display: inline-block; padding: 12px 30px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; border-radius: 25px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎾 Reserva Confirmada!</h1>
            <p>4SET ARENA</p>
          </div>
          <div class="content">
            <p>Olá <strong>${reservation.full_name}</strong>,</p>
            <p>Sua reserva foi confirmada com sucesso!</p>
            
            <div class="info-box">
              <h3>📋 Detalhes da Reserva</h3>
              <div class="info-row">
                <span class="info-label">Quadra:</span>
                <span>${reservation.court_name}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Data/Hora:</span>
                <span>${new Date(reservation.start_time).toLocaleString('pt-BR')}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Duração:</span>
                <span>${Math.round((new Date(reservation.end_time).getTime() - new Date(reservation.start_time).getTime()) / 60000)} minutos</span>
              </div>
              <div class="info-row">
                <span class="info-label">Valor:</span>
                <span>R$ ${parseFloat(reservation.total_price).toFixed(2)}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Status:</span>
                <span>${reservation.status === 'confirmed' ? '✅ Confirmada' : '⏳ Pendente'}</span>
              </div>
            </div>
            
            <p>Chegue com 10 minutos de antecedência para aproveitar ao máximo seu tempo de jogo!</p>
            
            <center>
              <a href="${process.env.FRONTEND_URL}/member/reservations" class="button">Ver Minhas Reservas</a>
            </center>
          </div>
          <div class="footer">
            <p>4SET ARENA - Sistema de Gestão Esportiva</p>
            <p>Este é um email automático, não responda.</p>
          </div>
        </div>
      </body>
      </html>
    `;
    
    // Enviar email
    await sendEmail({
      to: reservation.email,
      subject: `✅ Reserva Confirmada - ${reservation.court_name}`,
      html
    });
    
    // Salvar notificação
    await saveNotification({
      type: 'reservation_confirmation',
      recipientType: 'member',
      recipientId: reservation.member_id,
      recipientEmail: reservation.email,
      subject: `Reserva Confirmada - ${reservation.court_name}`,
      message: `Sua reserva na ${reservation.court_name} foi confirmada para ${new Date(reservation.start_time).toLocaleString('pt-BR')}`,
      metadata: { reservationId }
    });
    
    console.log('✅ Email de confirmação de reserva enviado');
    return { success: true };
  } catch (error) {
    console.error('❌ Erro ao enviar email de confirmação de reserva:', error);
    throw error;
  }
};

/**
 * Enviar email de confirmação de pedido
 */
export const sendOrderConfirmation = async (orderId: number) => {
  try {
    // Buscar dados do pedido
    const result = await pool.query(
      `SELECT o.*, m.full_name, m.email, m.phone
       FROM orders o
       JOIN members m ON o.member_id = m.id
       WHERE o.id = $1`,
      [orderId]
    );
    
    if (result.rows.length === 0) {
      throw new Error('Pedido não encontrado');
    }
    
    const order = result.rows[0];
    
    // Buscar itens do pedido
    const itemsResult = await pool.query(
      'SELECT * FROM order_items WHERE order_id = $1',
      [orderId]
    );
    
    const items = itemsResult.rows;
    
    const itemsHtml = items.map(item => `
      <div class="info-row">
        <span>${item.quantity}x ${item.product_name}</span>
        <span>R$ ${parseFloat(item.total_price).toFixed(2)}</span>
      </div>
    `).join('');
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .info-box { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
          .info-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
          .info-label { font-weight: bold; color: #667eea; }
          .total-row { display: flex; justify-content: space-between; padding: 15px 0; font-size: 18px; font-weight: bold; color: #667eea; border-top: 2px solid #667eea; margin-top: 10px; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          .button { display: inline-block; padding: 12px 30px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; border-radius: 25px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🛒 Pedido Confirmado!</h1>
            <p>4SET ARENA</p>
          </div>
          <div class="content">
            <p>Olá <strong>${order.full_name}</strong>,</p>
            <p>Seu pedido foi recebido e está sendo preparado!</p>
            
            <div class="info-box">
              <h3>📋 Pedido #${order.order_number}</h3>
              ${itemsHtml}
              <div class="total-row">
                <span>TOTAL:</span>
                <span>R$ ${parseFloat(order.total).toFixed(2)}</span>
              </div>
            </div>
            
            <div class="info-box">
              <h3>📦 Informações de Entrega</h3>
              <div class="info-row">
                <span class="info-label">Tipo:</span>
                <span>${order.delivery_type === 'pickup' ? '🏪 Retirar no balcão' : '🚚 Entrega'}</span>
              </div>
              ${order.delivery_address ? `
              <div class="info-row">
                <span class="info-label">Endereço:</span>
                <span>${order.delivery_address}</span>
              </div>
              ` : ''}
              <div class="info-row">
                <span class="info-label">Status:</span>
                <span>🟡 Pendente</span>
              </div>
            </div>
            
            <p>Você receberá uma notificação quando seu pedido estiver pronto!</p>
            
            <center>
              <a href="${process.env.FRONTEND_URL}/member/orders" class="button">Ver Meus Pedidos</a>
            </center>
          </div>
          <div class="footer">
            <p>4SET ARENA - Sistema de Gestão Esportiva</p>
            <p>Este é um email automático, não responda.</p>
          </div>
        </div>
      </body>
      </html>
    `;
    
    // Enviar email
    await sendEmail({
      to: order.email,
      subject: `✅ Pedido Confirmado - #${order.order_number}`,
      html
    });
    
    // Salvar notificação
    await saveNotification({
      type: 'order_confirmation',
      recipientType: 'member',
      recipientId: order.member_id,
      recipientEmail: order.email,
      subject: `Pedido Confirmado - #${order.order_number}`,
      message: `Seu pedido #${order.order_number} foi confirmado e está sendo preparado`,
      metadata: { orderId }
    });
    
    console.log('✅ Email de confirmação de pedido enviado');
    return { success: true };
  } catch (error) {
    console.error('❌ Erro ao enviar email de confirmação de pedido:', error);
    throw error;
  }
};

export default {
  sendEmail,
  saveNotification,
  sendReservationConfirmation,
  sendOrderConfirmation
};


