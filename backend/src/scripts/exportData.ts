import pool from '../config/database';
import fs from 'fs';
import path from 'path';

const exportData = async () => {
  try {
    console.log('🔄 Exportando dados do banco local...');

    // Conectar ao banco
    const client = await pool.connect();
    
    // Exportar dados de todas as tabelas
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

    const exportData: any = {};

    for (const table of tables) {
      try {
        const result = await client.query(`SELECT * FROM ${table}`);
        exportData[table] = result.rows;
        console.log(`✅ ${table}: ${result.rows.length} registros exportados`);
      } catch (error) {
        console.log(`⚠️ Tabela ${table} não encontrada ou vazia`);
        exportData[table] = [];
      }
    }

    // Salvar em arquivo JSON
    const exportPath = path.join(__dirname, '../../data-export.json');
    fs.writeFileSync(exportPath, JSON.stringify(exportData, null, 2));
    
    console.log(`✅ Dados exportados para: ${exportPath}`);
    console.log('📋 Resumo dos dados exportados:');
    
    Object.entries(exportData).forEach(([table, data]: [string, any]) => {
      console.log(`   - ${table}: ${data.length} registros`);
    });

    client.release();
    await pool.end();
    
  } catch (error) {
    console.error('❌ Erro ao exportar dados:', error);
    process.exit(1);
  }
};

// Executar se chamado diretamente
if (require.main === module) {
  exportData();
}

export { exportData };
