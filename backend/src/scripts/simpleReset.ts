import pool from '../config/database';
import fs from 'fs';
import path from 'path';

const simpleReset = async () => {
  let client;
  try {
    client = await pool.connect();
    console.log('🔄 RESET SIMPLES DO BANCO...');

    // 1. Apagar todas as tabelas
    console.log('🗑️ Apagando todas as tabelas...');
    await client.query(`
      DROP SCHEMA public CASCADE;
      CREATE SCHEMA public;
      GRANT ALL ON SCHEMA public TO postgres;
      GRANT ALL ON SCHEMA public TO public;
    `);
    console.log('✅ Todas as tabelas foram apagadas');

    // 2. Executar o script SQL de inicialização
    console.log('🔨 Executando script de inicialização...');
    const initScript = fs.readFileSync(path.join(__dirname, '../../init.sql'), 'utf-8');
    await client.query(initScript);
    console.log('✅ Script de inicialização executado');

    // 3. Carregar e inserir dados
    console.log('📁 Carregando dados...');
    const importFilePath = path.join(__dirname, '../../data-export.json');
    const rawData = fs.readFileSync(importFilePath, 'utf-8');
    const importedData = JSON.parse(rawData);

    // Inserir dados diretamente sem mapeamento complexo
    for (const [tableName, data] of Object.entries(importedData)) {
      if (!data || (data as any[]).length === 0) {
        console.log(`⚠️ Tabela ${tableName}: sem dados`);
        continue;
      }

      console.log(`📥 Inserindo ${(data as any[]).length} registros em ${tableName}...`);
      
      for (const row of data as any[]) {
        const columns = Object.keys(row);
        const values = Object.values(row);
        const placeholders = values.map((_, i) => `$${i + 1}`).join(', ');

        try {
          const insertQuery = `
            INSERT INTO ${tableName} (${columns.join(', ')})
            VALUES (${placeholders})
            ON CONFLICT (id) DO NOTHING
          `;
          await client.query(insertQuery, values);
        } catch (error) {
          console.log(`⚠️ Erro ao inserir em ${tableName}:`, (error as Error).message);
          // Continuar com o próximo registro
        }
      }
      console.log(`✅ ${tableName}: dados inseridos`);
    }

    console.log('🎉 RESET SIMPLES CONCLUÍDO!');

  } catch (error) {
    console.error('❌ Erro no reset simples:', error);
    throw error;
  } finally {
    if (client) {
      client.release();
    }
  }
};

export { simpleReset };
