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
    const rawData = fs.readFileSync(importFilePath, 'utf-8');
    const importedData = JSON.parse(rawData);

    console.log('📋 Dados encontrados:');
    for (const table in importedData) {
      console.log(`   - ${table}: ${importedData[table].length} registros`);
    }

    const importTable = async (tableName: string, data: any[], columnMap?: { [key: string]: string }) => {
      if (!data || data.length === 0) {
        console.log(`⚠️ Tabela ${tableName}: sem dados para importar`);
        return;
      }

      // Clear table before import, but only if it's not 'users' (to preserve admin)
      if (tableName !== 'users') {
        console.log(`🗑️ Limpando tabela ${tableName}...`);
        await client!.query(`TRUNCATE TABLE ${tableName} RESTART IDENTITY CASCADE`);
      }

      for (const row of data) {
        const columns = Object.keys(row)
          .map(key => columnMap && columnMap[key] ? columnMap[key] : camelToSnake(key));
        const values = Object.values(row);
        const placeholders = values.map((_, i) => `$${i + 1}`).join(', ');

        const insertQuery = `
          INSERT INTO ${tableName} (${columns.join(', ')})
          VALUES (${placeholders})
          ON CONFLICT (id) DO UPDATE SET
            ${columns.map(col => `${col} = EXCLUDED.${col}`).join(', ')}
        `;
        await client!.query(insertQuery, values);
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
