import pool from '../config/database';

const createPaymentTables = async () => {
  try {
    console.log('🔄 Criando/atualizando tabelas de pagamento...');

    // Primeiro, dropar a tabela payments se existir para recriar com estrutura correta
    await pool.query('DROP TABLE IF EXISTS payments CASCADE');
    console.log('✅ Tabela payments antiga removida');

    const createTablesSQL = `
      -- Tabela de pagamentos
      CREATE TABLE payments (
        id SERIAL PRIMARY KEY,
        payment_id VARCHAR(255) UNIQUE NOT NULL,
        external_reference VARCHAR(255),
        status VARCHAR(50) NOT NULL,
        status_detail VARCHAR(255),
        payment_type VARCHAR(50),
        payment_method VARCHAR(50),
        amount DECIMAL(10,2) NOT NULL,
        currency VARCHAR(10) DEFAULT 'BRL',
        description TEXT,
        payer_email VARCHAR(255),
        payer_name VARCHAR(255),
        payer_phone VARCHAR(50),
        member_id INTEGER REFERENCES members(id),
        reservation_id INTEGER REFERENCES reservations(id),
        order_id INTEGER,
        metadata JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        paid_at TIMESTAMP,
        approved_at TIMESTAMP,
        cancelled_at TIMESTAMP
      );

      -- Tabela de notificações
      CREATE TABLE IF NOT EXISTS notifications (
        id SERIAL PRIMARY KEY,
        type VARCHAR(50) NOT NULL,
        recipient_type VARCHAR(20) NOT NULL,
        recipient_id INTEGER NOT NULL,
        recipient_email VARCHAR(255),
        recipient_phone VARCHAR(50),
        subject VARCHAR(255),
        message TEXT NOT NULL,
        status VARCHAR(50) DEFAULT 'pending',
        sent_at TIMESTAMP,
        error_message TEXT,
        metadata JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Tabela de pedidos (orders) se não existir
      CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        order_number VARCHAR(50) UNIQUE NOT NULL,
        member_id INTEGER REFERENCES members(id),
        total DECIMAL(10,2) NOT NULL,
        status VARCHAR(50) DEFAULT 'pending',
        delivery_type VARCHAR(50) DEFAULT 'pickup',
        delivery_address TEXT,
        notes TEXT,
        payment_status VARCHAR(50) DEFAULT 'pending',
        payment_id INTEGER REFERENCES payments(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Tabela de itens do pedido
      CREATE TABLE IF NOT EXISTS order_items (
        id SERIAL PRIMARY KEY,
        order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
        product_id INTEGER REFERENCES products(id),
        product_name VARCHAR(255) NOT NULL,
        quantity INTEGER NOT NULL,
        unit_price DECIMAL(10,2) NOT NULL,
        total_price DECIMAL(10,2) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Adicionar coluna payment_status em reservations se não existir
      DO $$ 
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'reservations' AND column_name = 'payment_status'
        ) THEN
          ALTER TABLE reservations ADD COLUMN payment_status VARCHAR(50) DEFAULT 'pending';
        END IF;
      END $$;

      -- Adicionar coluna payment_id em reservations se não existir
      DO $$ 
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'reservations' AND column_name = 'payment_id'
        ) THEN
          ALTER TABLE reservations ADD COLUMN payment_id INTEGER REFERENCES payments(id);
        END IF;
      END $$;

      -- Índices para melhor performance
      DO $$ 
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_payments_member_id') THEN
          CREATE INDEX idx_payments_member_id ON payments(member_id);
        END IF;
        IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_payments_status') THEN
          CREATE INDEX idx_payments_status ON payments(status);
        END IF;
        IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_payments_external_reference') THEN
          CREATE INDEX idx_payments_external_reference ON payments(external_reference);
        END IF;
        IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_notifications_recipient') THEN
          CREATE INDEX idx_notifications_recipient ON notifications(recipient_type, recipient_id);
        END IF;
        IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_notifications_status') THEN
          CREATE INDEX idx_notifications_status ON notifications(status);
        END IF;
        IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_orders_member_id') THEN
          CREATE INDEX idx_orders_member_id ON orders(member_id);
        END IF;
        IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_orders_status') THEN
          CREATE INDEX idx_orders_status ON orders(status);
        END IF;
      END $$;
    `;

    await pool.query(createTablesSQL);

    console.log('✅ Tabelas de pagamento criadas com sucesso!');
    console.log('📋 Tabelas criadas:');
    console.log('   - payments (pagamentos)');
    console.log('   - notifications (notificações)');
    console.log('   - orders (pedidos)');
    console.log('   - order_items (itens do pedido)');

  } catch (error) {
    console.error('❌ Erro ao criar tabelas de pagamento:', error);
    throw error;
  }
};

// Executar se chamado diretamente
if (require.main === module) {
  createPaymentTables()
    .then(() => {
      console.log('✅ Script concluído');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Erro:', error);
      process.exit(1);
    });
}

export { createPaymentTables };

