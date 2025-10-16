import pool from '../config/database';

const initDatabase = async () => {
  try {
    console.log('🔄 Inicializando banco de dados...');
    
    // 1. Criar tabelas básicas
    console.log('📋 Criando tabelas...');
    const createTablesSQL = `
      -- Tabela de usuários
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        email VARCHAR(100),
        full_name VARCHAR(100),
        phone VARCHAR(20),
        avatar_url VARCHAR(255),
        role VARCHAR(20) DEFAULT 'admin',
        preferences JSONB DEFAULT '{}',
        last_login TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Tabela de membros
      CREATE TABLE IF NOT EXISTS members (
        id SERIAL PRIMARY KEY,
        member_code VARCHAR(20) UNIQUE NOT NULL,
        full_name VARCHAR(100) NOT NULL,
        email VARCHAR(100),
        phone VARCHAR(20),
        birth_date DATE,
        address TEXT,
        emergency_contact VARCHAR(100),
        emergency_phone VARCHAR(20),
        membership_type VARCHAR(50) DEFAULT 'regular',
        status VARCHAR(20) DEFAULT 'active',
        join_date DATE DEFAULT CURRENT_DATE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Tabela de quadras
      CREATE TABLE IF NOT EXISTS courts (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        description TEXT,
        type VARCHAR(50),
        capacity INTEGER,
        hourly_rate DECIMAL(10,2),
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
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
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Tabela de itens do menu
      CREATE TABLE IF NOT EXISTS menu_items (
        id SERIAL PRIMARY KEY,
        key VARCHAR(50) UNIQUE NOT NULL,
        label VARCHAR(100) NOT NULL,
        icon VARCHAR(50),
        path VARCHAR(200),
        order_index INTEGER DEFAULT 0,
        is_enabled BOOLEAN DEFAULT true,
        requires_admin BOOLEAN DEFAULT false,
        parent_key VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;
    
    await pool.query(createTablesSQL);
    
    // 2. Inserir dados iniciais
    console.log('📋 Inserindo dados iniciais...');
    const initDataSQL = `
      -- Inserir usuário admin padrão
      INSERT INTO users (username, password, email, full_name, role, preferences) 
      VALUES ('admin', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin@4set.com', 'Administrador do Sistema', 'admin', '{"theme": "dark", "language": "pt-BR", "notifications": true}')
      ON CONFLICT (username) DO NOTHING;

      -- Inserir itens padrão do menu
      INSERT INTO menu_items (key, label, icon, path, order_index, is_enabled, requires_admin) VALUES
      ('dashboard', 'Dashboard', 'LayoutDashboard', '/dashboard', 1, true, false),
      ('reservas', 'Reservas', 'Calendar', '/reservas', 2, true, false),
      ('clientes', 'Clientes', 'Users', '/clientes', 3, true, false),
      ('configuracoes', 'Configurações', 'Settings', '/configuracoes', 4, true, true),
      ('quadras', 'Quadras', 'MapPin', '/configuracoes/quadras', 5, true, true),
      ('menu-management', 'Gestão do Menu', 'Menu', '/configuracoes/menu', 6, true, true)
      ON CONFLICT (key) DO UPDATE SET
          label = EXCLUDED.label,
          icon = EXCLUDED.icon,
          path = EXCLUDED.path,
          order_index = EXCLUDED.order_index,
          is_enabled = EXCLUDED.is_enabled,
          requires_admin = EXCLUDED.requires_admin;

      -- Inserir quadras padrão
      INSERT INTO courts (name, description, type, capacity, hourly_rate, is_active) VALUES
      ('Quadra 1', 'Quadra de tênis coberta', 'tennis', 4, 50.00, true),
      ('Quadra 2', 'Quadra de futebol society', 'soccer', 14, 80.00, true),
      ('Quadra 3', 'Quadra de basquete', 'basketball', 10, 60.00, true),
      ('Quadra 4', 'Quadra de vôlei', 'volleyball', 12, 55.00, true)
      ON CONFLICT DO NOTHING;

      -- Inserir membros de exemplo
      INSERT INTO members (member_code, full_name, email, phone, membership_type, status) VALUES
      ('MEM001', 'João Silva', 'joao@email.com', '(11) 99999-9999', 'premium', 'active'),
      ('MEM002', 'Maria Santos', 'maria@email.com', '(11) 88888-8888', 'regular', 'active'),
      ('MEM003', 'Pedro Costa', 'pedro@email.com', '(11) 77777-7777', 'vip', 'active')
      ON CONFLICT (member_code) DO NOTHING;

      -- Inserir produtos de exemplo
      INSERT INTO products (code, description, price, stock, category, is_active) VALUES
      ('PROD001', 'Hambúrguer Clássico', 18.00, 100, 'Lanches', true),
      ('PROD002', 'Pizza Margherita', 28.00, 50, 'Pizzas', true),
      ('PROD003', 'Refrigerante', 4.00, 200, 'Bebidas', true),
      ('PROD004', 'Batata Frita', 9.50, 80, 'Acompanhamentos', true)
      ON CONFLICT (code) DO NOTHING;
    `;
    
    await pool.query(initDataSQL);
    
    console.log('✅ Banco de dados inicializado com sucesso!');
    console.log('📋 Dados inseridos:');
    console.log('   - Usuário admin (admin/password)');
    console.log('   - Itens do menu');
    console.log('   - Quadras de exemplo');
    console.log('   - Membros de exemplo');
    console.log('   - Produtos de exemplo');
    
  } catch (error) {
    console.error('❌ Erro ao inicializar banco de dados:', error);
    // Não fechar conexões se chamado do servidor
    if (require.main === module) {
      await pool.end();
    }
    throw error;
  }
};

// Executar se chamado diretamente
if (require.main === module) {
  initDatabase();
}

export { initDatabase };
