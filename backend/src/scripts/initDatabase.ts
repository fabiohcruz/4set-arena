import pool from '../config/database';
import { sequelize } from '../config/sequelize';
import { Product } from '../models/Product';
import { Tariff } from '../models/Tariff';
import { Sale } from '../models/Sale';
import { SaleItem } from '../models/SaleItem';
import { Court } from '../models/Court';
import { Member } from '../models/Member';
import { MenuItem } from '../models/MenuItem';
import { User } from '../models/User';

const initDatabase = async () => {
  try {
    console.log('🔄 Inicializando banco de dados...');
    
    // 1. Criar tabelas usando Sequelize
    console.log('📋 Criando tabelas...');
    await sequelize.sync({ force: false });
    
    // 2. Executar script SQL de inicialização
    console.log('📋 Executando script de inicialização...');
    const initSQL = `
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
    
    await pool.query(initSQL);
    
    console.log('✅ Banco de dados inicializado com sucesso!');
    console.log('📋 Dados inseridos:');
    console.log('   - Usuário admin (admin/admin)');
    console.log('   - Itens do menu');
    console.log('   - Quadras de exemplo');
    console.log('   - Membros de exemplo');
    console.log('   - Produtos de exemplo');
    
  } catch (error) {
    console.error('❌ Erro ao inicializar banco de dados:', error);
    throw error;
  } finally {
    await pool.end();
    await sequelize.close();
  }
};

// Executar se chamado diretamente
if (require.main === module) {
  initDatabase();
}

export { initDatabase };
