import { Pool } from 'pg';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

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
          const columns = Object.keys(row);
          const values = Object.values(row);
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
