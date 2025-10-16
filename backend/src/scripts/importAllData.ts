import pool from '../config/database';
import fs from 'fs';
import path from 'path';

// Helper function to convert camelCase to snake_case
const camelToSnake = (key: string): string => {
  return key.replace(/([A-Z])/g, '_$1').toLowerCase();
};

const importAllData = async () => {
  let client;
  try {
    client = await pool.connect();
    console.log('🔄 Importando todos os dados para o banco de produção...');

    const importFilePath = path.join(__dirname, '../../data-export.json');
    console.log('📁 Caminho do arquivo:', importFilePath);
    console.log('📁 Diretório atual:', __dirname);
    console.log('📁 Arquivos no diretório:', fs.readdirSync(path.join(__dirname, '../../')));
    
    // Verificar se o arquivo existe
    if (!fs.existsSync(importFilePath)) {
      console.log('❌ Arquivo data-export.json não encontrado');
      console.log('📁 Tentando caminhos alternativos...');
      
      // Tentar caminhos alternativos
      const alternativePaths = [
        path.join(__dirname, '../data-export.json'),
        path.join(__dirname, './data-export.json'),
        path.join(process.cwd(), 'data-export.json'),
        path.join(process.cwd(), 'backend/data-export.json')
      ];
      
      for (const altPath of alternativePaths) {
        console.log(`📁 Tentando: ${altPath}`);
        if (fs.existsSync(altPath)) {
          console.log(`✅ Arquivo encontrado em: ${altPath}`);
          const rawData = fs.readFileSync(altPath, 'utf-8');
          const importedData = JSON.parse(rawData);
          console.log('📋 Dados carregados com sucesso!');
          break;
        }
      }
      return;
    }
    
    const rawData = fs.readFileSync(importFilePath, 'utf-8');
    const importedData = JSON.parse(rawData);

    console.log('📋 Dados encontrados:');
    for (const table in importedData) {
      console.log(`   - ${table}: ${importedData[table].length} registros`);
    }

    const createTableIfNotExists = async (tableName: string) => {
      const tableDefinitions: { [key: string]: string } = {
        'users': `
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
        `,
        'members': `
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
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            city VARCHAR(100),
            state VARCHAR(50),
            zip_code VARCHAR(20),
            password VARCHAR(255)
          );
        `,
        'courts': `
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
        `,
        'products': `
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
        `,
        'menu_items': `
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
        `,
        'tariffs': `
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
        `,
        'sales': `
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
        `,
        'sale_items': `
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
        `,
        'stock_movements': `
          CREATE TABLE IF NOT EXISTS stock_movements (
            id SERIAL PRIMARY KEY,
            product_id INTEGER,
            type VARCHAR(20),
            quantity INTEGER,
            reason TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          );
        `,
        'reservations': `
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
        `
      };

      if (tableDefinitions[tableName]) {
        console.log(`🔨 Criando tabela ${tableName} se não existir...`);
        await client!.query(tableDefinitions[tableName]);
        console.log(`✅ Tabela ${tableName} verificada/criada`);
      }
    };

    const getTableColumns = async (tableName: string): Promise<string[]> => {
      const result = await client!.query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = $1 
        ORDER BY ordinal_position;
      `, [tableName]);
      return result.rows.map(row => row.column_name);
    };

    const importTable = async (tableName: string, data: any[], columnMap?: { [key: string]: string }) => {
      if (!data || data.length === 0) {
        console.log(`⚠️ Tabela ${tableName}: sem dados para importar`);
        return;
      }

      // Criar tabela se não existir
      await createTableIfNotExists(tableName);

      // Obter colunas existentes na tabela
      const existingColumns = await getTableColumns(tableName);
      console.log(`📋 Colunas existentes em ${tableName}:`, existingColumns);

      // Clear table before import, but only if it's not 'users' (to preserve admin)
      if (tableName !== 'users') {
        console.log(`🗑️ Limpando tabela ${tableName}...`);
        await client!.query(`TRUNCATE TABLE ${tableName} RESTART IDENTITY CASCADE`);
      }

      for (const row of data) {
        // Filtrar apenas colunas que existem na tabela
        const filteredRow: any = {};
        for (const [key, value] of Object.entries(row)) {
          const columnName = columnMap && columnMap[key] ? columnMap[key] : camelToSnake(key);
          if (existingColumns.includes(columnName)) {
            filteredRow[columnName] = value;
          } else {
            console.log(`⚠️ Coluna ${columnName} não existe na tabela ${tableName}, pulando...`);
          }
        }

        const columns = Object.keys(filteredRow);
        const values = Object.values(filteredRow);
        const placeholders = values.map((_, i) => `$${i + 1}`).join(', ');

        // Special handling for password hashing if it's the users table
        if (tableName === 'users' && filteredRow.password && !filteredRow.password.startsWith('$2a$')) {
          filteredRow.password = await bcrypt.hash(filteredRow.password, 10);
          values[columns.indexOf('password')] = filteredRow.password;
        }

        if (columns.length > 0) {
          const insertQuery = `
            INSERT INTO ${tableName} (${columns.join(', ')})
            VALUES (${placeholders})
            ON CONFLICT (id) DO UPDATE SET
              ${columns.map(col => `${col} = EXCLUDED.${col}`).join(', ')}
          `;
          await client!.query(insertQuery, values);
        }
      }
      console.log(`✅ ${tableName}: ${data.length} registros importados`);
    };

    // Define specific column mappings if needed (e.g., for Sequelize's camelCase)
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
      hourlyRate: 'hourly_rate',
      isActive: 'is_active',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
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

    await importTable('users', importedData.users, usersColumnMap);
    await importTable('members', importedData.members, membersColumnMap);
    await importTable('courts', importedData.courts, courtsColumnMap);
    await importTable('products', importedData.products, productsColumnMap);
    await importTable('menu_items', importedData.menu_items, menuItemsColumnMap);
    await importTable('tariffs', importedData.tariffs, tariffsColumnMap);
    await importTable('sales', importedData.sales, salesColumnMap);
    await importTable('sale_items', importedData.sale_items, saleItemsColumnMap);
    await importTable('stock_movements', importedData.stock_movements, stockMovementsColumnMap);
    await importTable('reservations', importedData.reservations, reservationsColumnMap);

    console.log('🎉 Importação concluída com sucesso!');

  } catch (error) {
    console.error('❌ Erro ao importar dados:', error);
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

if (require.main === module) {
  importAllData();
}

export { importAllData };
