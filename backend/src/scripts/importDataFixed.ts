import { Pool } from 'pg';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

// Mapeamento de colunas camelCase para snake_case
const columnMapping: { [table: string]: { [camelCase: string]: string } } = {
  products: {
    'unitValue': 'unit_value',
    'totalValue': 'total_value',
    'productCode': 'product_code',
    'productDescription': 'product_description',
    'createdAt': 'created_at',
    'updatedAt': 'updated_at'
  },
  tariffs: {
    'createdAt': 'created_at',
    'updatedAt': 'updated_at'
  },
  sales: {
    'accountNumber': 'account_number',
    'clientId': 'client_id',
    'clientName': 'client_name',
    'cardNumber': 'card_number',
    'paymentMethod': 'payment_method',
    'loyaltyPoints': 'loyalty_points',
    'userId': 'user_id',
    'createdAt': 'created_at',
    'updatedAt': 'updated_at'
  },
  sale_items: {
    'saleId': 'sale_id',
    'productId': 'product_id',
    'productCode': 'product_code',
    'productDescription': 'product_description',
    'unitValue': 'unit_value',
    'totalValue': 'total_value',
    'createdAt': 'created_at',
    'updatedAt': 'updated_at'
  },
  stock_movements: {
    'productId': 'product_id',
    'createdAt': 'created_at'
  },
  members: {
    'memberCode': 'member_code',
    'fullName': 'full_name',
    'birthDate': 'birth_date',
    'emergencyContact': 'emergency_contact',
    'emergencyPhone': 'emergency_phone',
    'membershipType': 'membership_type',
    'joinDate': 'join_date',
    'createdAt': 'created_at',
    'updatedAt': 'updated_at'
  },
  courts: {
    'sportType': 'sport_type',
    'isActive': 'is_active',
    'pricePerHour': 'price_per_hour',
    'imageUrl': 'image_url',
    'createdAt': 'created_at',
    'updatedAt': 'updated_at'
  },
  menu_items: {
    'orderIndex': 'order_index',
    'isEnabled': 'is_enabled',
    'requiresAdmin': 'requires_admin',
    'parentKey': 'parent_key',
    'createdAt': 'created_at',
    'updatedAt': 'updated_at'
  },
  users: {
    'fullName': 'full_name',
    'avatarUrl': 'avatar_url',
    'lastLogin': 'last_login',
    'createdAt': 'created_at',
    'updatedAt': 'updated_at'
  }
};

const importData = async () => {
  try {
    console.log('🔄 Importando dados para o banco de produção...');

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

    // Ler arquivo de dados exportados
    const exportPath = path.join(__dirname, '../../data-export.json');
    const exportData = JSON.parse(fs.readFileSync(exportPath, 'utf8'));

    console.log('📋 Dados encontrados:');
    Object.entries(exportData).forEach(([table, data]: [string, any]) => {
      console.log(`   - ${table}: ${data.length} registros`);
    });

    // Importar dados de cada tabela
    const tables = [
      'users',
      'members', 
      'courts',
      'products',
      'menu_items',
      'tariffs',
      'sales',
      'sale_items',
      'stock_movements',
      'reservations'
    ];

    for (const table of tables) {
      const data = exportData[table] || [];
      
      if (data.length === 0) {
        console.log(`⚠️ Tabela ${table}: sem dados para importar`);
        continue;
      }

      try {
        // Limpar tabela existente (exceto users para não perder o admin)
        if (table !== 'users') {
          await client.query(`DELETE FROM ${table}`);
          console.log(`🗑️ Tabela ${table} limpa`);
        }

        // Inserir dados
        for (const row of data) {
          // Mapear nomes das colunas
          const mappedRow: any = {};
          const mapping = columnMapping[table] || {};
          
          Object.entries(row).forEach(([key, value]) => {
            const mappedKey = mapping[key] || key;
            mappedRow[mappedKey] = value;
          });

          const columns = Object.keys(mappedRow);
          const values = Object.values(mappedRow);
          const placeholders = values.map((_, index) => `$${index + 1}`).join(', ');
          
          const query = `
            INSERT INTO ${table} (${columns.join(', ')})
            VALUES (${placeholders})
            ON CONFLICT DO NOTHING
          `;
          
          await client.query(query, values);
        }
        
        console.log(`✅ ${table}: ${data.length} registros importados`);
        
      } catch (error) {
        console.error(`❌ Erro ao importar ${table}:`, error);
      }
    }

    console.log('🎉 Importação concluída com sucesso!');
    
    client.release();
    await pool.end();
    
  } catch (error) {
    console.error('❌ Erro ao importar dados:', error);
    process.exit(1);
  }
};

// Executar se chamado diretamente
if (require.main === module) {
  importData();
}

export { importData };
