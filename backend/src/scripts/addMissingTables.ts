import pool from '../config/database';

const addMissingTables = async () => {
  let client;
  try {
    client = await pool.connect();
    console.log('🔄 Adicionando tabelas e colunas faltantes...');

    // Adicionar colunas faltantes na tabela users
    console.log('🔄 Adicionando colunas faltantes na tabela users...');
    const addUsersColumnsSQL = `
      ALTER TABLE users 
        ADD COLUMN IF NOT EXISTS birth_date DATE,
        ADD COLUMN IF NOT EXISTS gender VARCHAR(10),
        ADD COLUMN IF NOT EXISTS address TEXT,
        ADD COLUMN IF NOT EXISTS city VARCHAR(100),
        ADD COLUMN IF NOT EXISTS state VARCHAR(50),
        ADD COLUMN IF NOT EXISTS zip_code VARCHAR(20),
        ADD COLUMN IF NOT EXISTS emergency_contact VARCHAR(100),
        ADD COLUMN IF NOT EXISTS emergency_phone VARCHAR(20),
        ADD COLUMN IF NOT EXISTS bio TEXT,
        ADD COLUMN IF NOT EXISTS cpf VARCHAR(20),
        ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active';
    `;
    await client.query(addUsersColumnsSQL);
    console.log('✅ Colunas adicionadas na tabela users');

    const createMissingTablesSQL = `
      -- Tabela de quadras
      CREATE TABLE IF NOT EXISTS courts (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        description TEXT,
        type VARCHAR(50),
        capacity INTEGER,
        price DECIMAL(10,2),
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        sport_type VARCHAR(50),
        price_per_hour DECIMAL(10,2),
        image_url VARCHAR(255)
      );

      -- Tabela de produtos
      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        code VARCHAR(50) UNIQUE NOT NULL,
        description VARCHAR(255) NOT NULL,
        price DECIMAL(10,2) NOT NULL,
        stock INTEGER DEFAULT 0,
        category VARCHAR(100),
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        cost_value DECIMAL(10,2)
      );

      -- Tabela de tarifas
      CREATE TABLE IF NOT EXISTS tariffs (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        description TEXT,
        price DECIMAL(10,2) NOT NULL,
        duration_minutes INTEGER,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Tabela de vendas
      CREATE TABLE IF NOT EXISTS sales (
        id SERIAL PRIMARY KEY,
        account_number VARCHAR(50),
        client_id INTEGER,
        client_name VARCHAR(100),
        card_number VARCHAR(50),
        total DECIMAL(10,2),
        status VARCHAR(20),
        payment_method VARCHAR(50),
        loyalty_points INTEGER,
        user_id INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Tabela de itens de venda
      CREATE TABLE IF NOT EXISTS sale_items (
        id SERIAL PRIMARY KEY,
        sale_id INTEGER,
        product_id INTEGER,
        product_code VARCHAR(50),
        product_description VARCHAR(255),
        quantity INTEGER,
        unit_value DECIMAL(10,2),
        total_value DECIMAL(10,2),
        type VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Tabela de movimentações de estoque
      CREATE TABLE IF NOT EXISTS stock_movements (
        id SERIAL PRIMARY KEY,
        product_id INTEGER,
        type VARCHAR(20),
        quantity INTEGER,
        reason TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Tabela de reservas
      CREATE TABLE IF NOT EXISTS reservations (
        id SERIAL PRIMARY KEY,
        court_id INTEGER,
        member_id INTEGER,
        start_time TIMESTAMP,
        end_time TIMESTAMP,
        status VARCHAR(20),
        total_price DECIMAL(10,2),
        payment_status VARCHAR(20),
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    await client.query(createMissingTablesSQL);
    console.log('✅ Tabelas e colunas faltantes foram criadas');

  } catch (error) {
    console.error('❌ Erro ao adicionar tabelas:', error);
    throw error;
  } finally {
    if (client) {
      client.release();
    }
  }
};

export { addMissingTables };
