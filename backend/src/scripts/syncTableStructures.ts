import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const syncTableStructures = async () => {
  try {
    console.log('🔄 Sincronizando estruturas das tabelas...');

    // Configurar conexão com o banco de produção
    const dbConfig = process.env.DATABASE_URL
      ? {
          connectionString: process.env.DATABASE_URL,
          ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
        }
      : {
          host: process.env.DB_HOST || 'localhost',
          port: parseInt(process.env.DB_PORT || '5432'),
          database: process.env.DB_NAME || '4set_sports',
          user: process.env.DB_USER || 'postgres',
          password: process.env.DB_PASSWORD || 'postgres123',
        };

    const pool = new Pool(dbConfig);
    const client = await pool.connect();

    // Scripts SQL para atualizar as estruturas das tabelas
    const updateScripts = [
      // Atualizar tabela products
      `ALTER TABLE products 
       ADD COLUMN IF NOT EXISTS unit_value DECIMAL(10,2),
       ADD COLUMN IF NOT EXISTS total_value DECIMAL(10,2),
       ADD COLUMN IF NOT EXISTS product_code VARCHAR(50),
       ADD COLUMN IF NOT EXISTS product_description VARCHAR(255);`,

      // Atualizar tabela tariffs
      `ALTER TABLE tariffs 
       ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
       ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;`,

      // Atualizar tabela sales
      `ALTER TABLE sales 
       ADD COLUMN IF NOT EXISTS account_number VARCHAR(255),
       ADD COLUMN IF NOT EXISTS client_id INTEGER,
       ADD COLUMN IF NOT EXISTS client_name VARCHAR(255),
       ADD COLUMN IF NOT EXISTS card_number VARCHAR(255),
       ADD COLUMN IF NOT EXISTS payment_method VARCHAR(255),
       ADD COLUMN IF NOT EXISTS loyalty_points INTEGER DEFAULT 0,
       ADD COLUMN IF NOT EXISTS user_id INTEGER NOT NULL,
       ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
       ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;`,

      // Atualizar tabela sale_items
      `ALTER TABLE sale_items 
       ADD COLUMN IF NOT EXISTS sale_id INTEGER NOT NULL,
       ADD COLUMN IF NOT EXISTS product_id INTEGER,
       ADD COLUMN IF NOT EXISTS product_code VARCHAR(255),
       ADD COLUMN IF NOT EXISTS product_description VARCHAR(255),
       ADD COLUMN IF NOT EXISTS unit_value DECIMAL(10,2),
       ADD COLUMN IF NOT EXISTS total_value DECIMAL(10,2),
       ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
       ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;`,

      // Atualizar tabela stock_movements
      `ALTER TABLE stock_movements 
       ADD COLUMN IF NOT EXISTS product_id INTEGER,
       ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;`,

      // Atualizar tabela members
      `ALTER TABLE members 
       ADD COLUMN IF NOT EXISTS member_code VARCHAR(20),
       ADD COLUMN IF NOT EXISTS full_name VARCHAR(100),
       ADD COLUMN IF NOT EXISTS birth_date DATE,
       ADD COLUMN IF NOT EXISTS emergency_contact VARCHAR(100),
       ADD COLUMN IF NOT EXISTS emergency_phone VARCHAR(20),
       ADD COLUMN IF NOT EXISTS membership_type VARCHAR(50) DEFAULT 'regular',
       ADD COLUMN IF NOT EXISTS join_date DATE DEFAULT CURRENT_DATE,
       ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
       ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;`,

      // Atualizar tabela courts
      `ALTER TABLE courts 
       ADD COLUMN IF NOT EXISTS sport_type VARCHAR(50),
       ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true,
       ADD COLUMN IF NOT EXISTS price_per_hour DECIMAL(10,2),
       ADD COLUMN IF NOT EXISTS image_url VARCHAR(255),
       ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
       ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;`,

      // Atualizar tabela menu_items
      `ALTER TABLE menu_items 
       ADD COLUMN IF NOT EXISTS order_index INTEGER DEFAULT 0,
       ADD COLUMN IF NOT EXISTS is_enabled BOOLEAN DEFAULT true,
       ADD COLUMN IF NOT EXISTS requires_admin BOOLEAN DEFAULT false,
       ADD COLUMN IF NOT EXISTS parent_key VARCHAR(50),
       ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
       ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;`,

      // Atualizar tabela users
      `ALTER TABLE users 
       ADD COLUMN IF NOT EXISTS full_name VARCHAR(100),
       ADD COLUMN IF NOT EXISTS avatar_url VARCHAR(255),
       ADD COLUMN IF NOT EXISTS last_login TIMESTAMP,
       ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
       ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;`
    ];

    // Executar cada script
    for (const script of updateScripts) {
      try {
        await client.query(script);
        console.log('✅ Script executado com sucesso');
      } catch (error) {
        console.log('⚠️ Script já executado ou erro:', (error as Error).message);
      }
    }

    console.log('🎉 Estruturas das tabelas sincronizadas com sucesso!');
    
    client.release();
    await pool.end();
    
  } catch (error) {
    console.error('❌ Erro ao sincronizar estruturas:', error);
    process.exit(1);
  }
};

// Executar se chamado diretamente
if (require.main === module) {
  syncTableStructures();
}

export { syncTableStructures };
