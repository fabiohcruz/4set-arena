import pool from '../config/database';
import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';

// Helper function to convert camelCase to snake_case
const camelToSnake = (key: string): string => {
  return key.replace(/([A-Z])/g, '_$1').toLowerCase();
};

const resetDatabase = async () => {
  let client;
  try {
    client = await pool.connect();
    console.log('🔄 RESETANDO BANCO DE DADOS COMPLETO...');

    // 1. Apagar todas as tabelas
    console.log('🗑️ Apagando todas as tabelas...');
    await client.query(`
      DROP SCHEMA public CASCADE;
      CREATE SCHEMA public;
      GRANT ALL ON SCHEMA public TO postgres;
      GRANT ALL ON SCHEMA public TO public;
    `);
    console.log('✅ Todas as tabelas foram apagadas');

    // 2. Criar todas as tabelas com estrutura completa
    console.log('🔨 Criando todas as tabelas...');
    const createTablesSQL = `
      -- Tabela de usuários
      CREATE TABLE users (
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
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        birth_date DATE,
        gender VARCHAR(10),
        address TEXT,
        city VARCHAR(100),
        state VARCHAR(50),
        zip_code VARCHAR(20),
        emergency_contact VARCHAR(100),
        emergency_phone VARCHAR(20),
        bio TEXT,
        cpf VARCHAR(20),
        status VARCHAR(20) DEFAULT 'active'
      );

      -- Tabela de membros
      CREATE TABLE members (
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
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        city VARCHAR(100),
        state VARCHAR(50),
        zip_code VARCHAR(20),
        password VARCHAR(255)
      );

      -- Tabela de quadras
      CREATE TABLE courts (
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
      CREATE TABLE products (
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

      -- Tabela de itens do menu
      CREATE TABLE menu_items (
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

      -- Tabela de tarifas
      CREATE TABLE tariffs (
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
      CREATE TABLE sales (
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
      CREATE TABLE sale_items (
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
      CREATE TABLE stock_movements (
        id SERIAL PRIMARY KEY,
        product_id INTEGER,
        type VARCHAR(20),
        quantity INTEGER,
        reason TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Tabela de reservas
      CREATE TABLE reservations (
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

    await client.query(createTablesSQL);
    console.log('✅ Todas as tabelas foram criadas');

    // 3. Carregar dados do arquivo de exportação
    console.log('📁 Carregando dados do arquivo de exportação...');
    const importFilePath = path.join(__dirname, '../../data-export.json');
    
    if (!fs.existsSync(importFilePath)) {
      console.log('❌ Arquivo data-export.json não encontrado');
      return;
    }

    const rawData = fs.readFileSync(importFilePath, 'utf-8');
    const importedData = JSON.parse(rawData);

    console.log('📋 Dados encontrados:');
    for (const table in importedData) {
      console.log(`   - ${table}: ${importedData[table].length} registros`);
    }

    // 4. Inserir dados
    const insertData = async (tableName: string, data: any[], columnMap?: { [key: string]: string }) => {
      if (!data || data.length === 0) {
        console.log(`⚠️ Tabela ${tableName}: sem dados para importar`);
        return;
      }

      console.log(`📥 Inserindo dados na tabela ${tableName}...`);
      
      for (const row of data) {
        const columns = Object.keys(row)
          .map(key => columnMap && columnMap[key] ? columnMap[key] : camelToSnake(key));
        const values = Object.values(row);
        const placeholders = values.map((_, i) => `$${i + 1}`).join(', ');

        // Special handling for password hashing if it's the users table
        if (tableName === 'users' && row.password && !row.password.startsWith('$2a$')) {
          row.password = await bcrypt.hash(row.password, 10);
          values[columns.indexOf('password')] = row.password;
        }

        const insertQuery = `
          INSERT INTO ${tableName} (${columns.join(', ')})
          VALUES (${placeholders})
        `;
        await client!.query(insertQuery, values);
      }
      console.log(`✅ ${tableName}: ${data.length} registros inseridos`);
    };

    // Define column mappings
    const usersColumnMap = {
      fullName: 'full_name',
      avatarUrl: 'avatar_url',
      lastLogin: 'last_login',
      birthDate: 'birth_date',
      zipCode: 'zip_code',
      emergencyContact: 'emergency_contact',
      emergencyPhone: 'emergency_phone',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    };

    const salesColumnMap = {
      accountNumber: 'account_number',
      clientId: 'client_id',
      clientName: 'client_name',
      cardNumber: 'card_number',
      paymentMethod: 'payment_method',
      loyaltyPoints: 'loyalty_points',
      userId: 'user_id',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    };

    const saleItemsColumnMap = {
      saleId: 'sale_id',
      productId: 'product_id',
      productCode: 'product_code',
      productDescription: 'product_description',
      unitValue: 'unit_value',
      totalValue: 'total_value',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    };

    const productsColumnMap = {
      costValue: 'cost_value',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    };

    const tariffsColumnMap = {
      durationMinutes: 'duration_minutes',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    };

    const membersColumnMap = {
      memberCode: 'member_code',
      fullName: 'full_name',
      birthDate: 'birth_date',
      emergencyContact: 'emergency_contact',
      emergencyPhone: 'emergency_phone',
      membershipType: 'membership_type',
      joinDate: 'join_date',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    };

    const courtsColumnMap = {
      isActive: 'is_active',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      sportType: 'sport_type',
      pricePerHour: 'price_per_hour',
      imageUrl: 'image_url',
    };

    const menuItemsColumnMap = {
      orderIndex: 'order_index',
      isEnabled: 'is_enabled',
      requiresAdmin: 'requires_admin',
      parentKey: 'parent_key',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    };

    const stockMovementsColumnMap = {
      productId: 'product_id',
      createdAt: 'created_at',
    };

    const reservationsColumnMap = {
      courtId: 'court_id',
      memberId: 'member_id',
      startTime: 'start_time',
      endTime: 'end_time',
      totalPrice: 'total_price',
      paymentStatus: 'payment_status',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    };

    // Inserir dados em todas as tabelas
    await insertData('users', importedData.users, usersColumnMap);
    await insertData('members', importedData.members, membersColumnMap);
    await insertData('courts', importedData.courts, courtsColumnMap);
    await insertData('products', importedData.products, productsColumnMap);
    await insertData('menu_items', importedData.menu_items, menuItemsColumnMap);
    await insertData('tariffs', importedData.tariffs, tariffsColumnMap);
    await insertData('sales', importedData.sales, salesColumnMap);
    await insertData('sale_items', importedData.sale_items, saleItemsColumnMap);
    await insertData('stock_movements', importedData.stock_movements, stockMovementsColumnMap);
    await insertData('reservations', importedData.reservations, reservationsColumnMap);

    console.log('🎉 RESET DO BANCO CONCLUÍDO COM SUCESSO!');
    console.log('📊 Resumo:');
    console.log('   - Todas as tabelas foram recriadas');
    console.log('   - Todos os dados foram importados');
    console.log('   - Banco está pronto para uso');

  } catch (error) {
    console.error('❌ Erro ao resetar banco:', error);
    throw error;
  } finally {
    if (client) {
      client.release();
    }
    // Não fechar o pool se chamado do servidor
    if (require.main === module) {
      await pool.end();
    }
  }
};

// Executar se chamado diretamente
if (require.main === module) {
  resetDatabase();
}

export { resetDatabase };
