import { createPaymentTables } from './createPaymentTables';
import pool from '../config/database';

/**
 * Script completo para configurar o sistema de pagamentos
 */
const setupPaymentSystem = async () => {
  try {
    console.log('🚀 Iniciando configuração do sistema de pagamentos...');
    console.log('');

    // 1. Verificar conexão com o banco
    console.log('1️⃣ Verificando conexão com o banco de dados...');
    await pool.query('SELECT NOW()');
    console.log('✅ Conexão estabelecida');
    console.log('');

    // 2. Criar tabelas
    console.log('2️⃣ Criando tabelas de pagamento...');
    await createPaymentTables();
    console.log('');

    // 3. Verificar variáveis de ambiente
    console.log('3️⃣ Verificando variáveis de ambiente...');
    const envVars = {
      'MERCADOPAGO_ACCESS_TOKEN': process.env.MERCADOPAGO_ACCESS_TOKEN ? '✅ Configurado' : '❌ NÃO CONFIGURADO',
      'SENDGRID_API_KEY': process.env.SENDGRID_API_KEY ? '✅ Configurado' : '❌ NÃO CONFIGURADO',
      'FROM_EMAIL': process.env.FROM_EMAIL ? '✅ Configurado' : '❌ NÃO CONFIGURADO',
      'TWILIO_ACCOUNT_SID': process.env.TWILIO_ACCOUNT_SID ? '✅ Configurado' : '❌ NÃO CONFIGURADO',
      'TWILIO_AUTH_TOKEN': process.env.TWILIO_AUTH_TOKEN ? '✅ Configurado' : '❌ NÃO CONFIGURADO',
      'TWILIO_PHONE_NUMBER': process.env.TWILIO_PHONE_NUMBER ? '✅ Configurado' : '❌ NÃO CONFIGURADO',
      'FRONTEND_URL': process.env.FRONTEND_URL ? '✅ Configurado' : '❌ NÃO CONFIGURADO',
    };

    console.log('');
    console.log('📋 Status das variáveis de ambiente:');
    Object.entries(envVars).forEach(([key, status]) => {
      console.log(`   ${key}: ${status}`);
    });
    console.log('');

    // 4. Verificar se todas as variáveis estão configuradas
    const allConfigured = Object.values(envVars).every(v => v.includes('✅'));
    
    if (allConfigured) {
      console.log('🎉 TUDO CONFIGURADO CORRETAMENTE!');
      console.log('');
      console.log('✅ Sistema de pagamentos pronto para uso!');
      console.log('');
      console.log('🔗 Endpoints disponíveis:');
      console.log('   POST /api/payments/reservation - Criar pagamento de reserva');
      console.log('   POST /api/payments/order - Criar pagamento de pedido');
      console.log('   POST /api/payments/webhook - Webhook do Mercado Pago');
      console.log('   GET  /api/payments/my-payments - Listar pagamentos');
      console.log('');
    } else {
      console.log('⚠️  ATENÇÃO: Algumas variáveis não estão configuradas!');
      console.log('');
      console.log('📝 Configure as variáveis faltantes no Railway:');
      console.log('   https://railway.app/project/seu-projeto/variables');
      console.log('');
    }

    // 5. Testar serviços
    console.log('4️⃣ Testando serviços...');
    console.log('');

    // Testar Mercado Pago
    if (process.env.MERCADOPAGO_ACCESS_TOKEN) {
      console.log('   💳 Mercado Pago: ✅ Token configurado');
    } else {
      console.log('   💳 Mercado Pago: ❌ Token não configurado');
    }

    // Testar SendGrid
    if (process.env.SENDGRID_API_KEY && process.env.FROM_EMAIL) {
      console.log('   📧 SendGrid: ✅ API Key e Email configurados');
    } else {
      console.log('   📧 SendGrid: ❌ Configuração incompleta');
    }

    // Testar Twilio
    if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_PHONE_NUMBER) {
      console.log('   📱 Twilio: ✅ Credenciais configuradas');
    } else {
      console.log('   📱 Twilio: ❌ Configuração incompleta');
    }

    console.log('');
    console.log('=' .repeat(60));
    console.log('🎯 CONFIGURAÇÃO CONCLUÍDA!');
    console.log('=' .repeat(60));

  } catch (error) {
    console.error('❌ Erro na configuração:', error);
    throw error;
  }
};

// Executar se chamado diretamente
if (require.main === module) {
  setupPaymentSystem()
    .then(() => {
      console.log('✅ Setup concluído com sucesso');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Erro no setup:', error);
      process.exit(1);
    });
}

export { setupPaymentSystem };

