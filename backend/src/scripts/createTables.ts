import pool from '../config/database';

const createTables = async () => {
  try {
    console.log('🔄 Criando tabelas do PDV...');
    
    // Criar tabela sales
    await pool.query(`
      CREATE TABLE IF NOT EXISTS sales (
        id SERIAL PRIMARY KEY,
        "accountNumber" VARCHAR(255) UNIQUE NOT NULL,
        "clientId" INTEGER,
        "clientName" VARCHAR(255) NOT NULL,
        "cardNumber" VARCHAR(255),
        total DECIMAL(10,2) NOT NULL DEFAULT 0.00,
        status VARCHAR(50) NOT NULL DEFAULT 'open',
        "paymentMethod" VARCHAR(255),
        "loyaltyPoints" INTEGER DEFAULT 0,
        "userId" INTEGER NOT NULL,
        "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Criar tabela sale_items
    await pool.query(`
      CREATE TABLE IF NOT EXISTS sale_items (
        id SERIAL PRIMARY KEY,
        "saleId" INTEGER NOT NULL,
        "productId" INTEGER,
        "productCode" VARCHAR(255) NOT NULL,
        "productDescription" VARCHAR(255) NOT NULL,
        quantity DECIMAL(10,2) NOT NULL DEFAULT 1.00,
        "unitValue" DECIMAL(10,2) NOT NULL DEFAULT 0.00,
        "totalValue" DECIMAL(10,2) NOT NULL DEFAULT 0.00,
        type VARCHAR(50) NOT NULL DEFAULT 'product',
        "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY ("saleId") REFERENCES sales(id) ON DELETE CASCADE
      )
    `);
    
    console.log('✅ Tabelas do PDV criadas com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro ao criar tabelas:', error);
  } finally {
    await pool.end();
  }
};

// Executar se chamado diretamente
if (require.main === module) {
  createTables();
}

export { createTables };

