import pool from '../config/database';
import bcrypt from 'bcryptjs';

const fixAdmin = async () => {
  let client;
  try {
    client = await pool.connect();
    console.log('🔄 Verificando e corrigindo usuário admin...');

    // Verificar se a tabela users existe
    const tableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'users'
      );
    `);
    
    if (!tableCheck.rows[0].exists) {
      console.log('❌ Tabela users não existe. Criando...');
      
      // Criar tabela users
      await client.query(`
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
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);
      console.log('✅ Tabela users criada');
    }

    // Verificar se o usuário admin existe
    const adminCheck = await client.query('SELECT * FROM users WHERE username = $1', ['admin']);
    
    if (adminCheck.rows.length === 0) {
      console.log('❌ Usuário admin não existe. Criando...');
      
      // Criar hash da senha 'password'
      const hashedPassword = await bcrypt.hash('password', 10);
      
      // Inserir usuário admin
      await client.query(`
        INSERT INTO users (username, password, email, full_name, role, preferences)
        VALUES ($1, $2, $3, $4, $5, $6)
      `, [
        'admin',
        hashedPassword,
        'admin@4set.com',
        'Administrador do Sistema',
        'admin',
        JSON.stringify({ theme: 'dark', language: 'pt-BR', notifications: true })
      ]);
      
      console.log('✅ Usuário admin criado com sucesso');
    } else {
      console.log('✅ Usuário admin já existe');
      
      // Verificar se a senha está correta
      const admin = adminCheck.rows[0];
      const isValidPassword = await bcrypt.compare('password', admin.password);
      
      if (!isValidPassword) {
        console.log('🔄 Atualizando senha do admin...');
        const hashedPassword = await bcrypt.hash('password', 10);
        
        await client.query(
          'UPDATE users SET password = $1 WHERE username = $2',
          [hashedPassword, 'admin']
        );
        
        console.log('✅ Senha do admin atualizada');
      } else {
        console.log('✅ Senha do admin está correta');
      }
    }

    // Testar login
    console.log('🧪 Testando login...');
    const testUser = await client.query('SELECT * FROM users WHERE username = $1', ['admin']);
    if (testUser.rows.length > 0) {
      const user = testUser.rows[0];
      const isValidPassword = await bcrypt.compare('password', user.password);
      console.log('🔐 Teste de senha:', isValidPassword ? '✅ Válida' : '❌ Inválida');
    }

  } catch (error) {
    console.error('❌ Erro ao corrigir admin:', error);
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
  fixAdmin();
}

export { fixAdmin };
