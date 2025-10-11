import bcrypt from 'bcryptjs';
import pool from '../config/database';

async function seedAdminUser() {
  try {
    // Gerar hash da senha 'admin'
    const hashedPassword = await bcrypt.hash('admin', 10);
    
    // Inserir usuário admin
    const query = `
      INSERT INTO users (username, password, email, role) 
      VALUES ($1, $2, $3, $4) 
      ON CONFLICT (username) DO UPDATE SET
        password = EXCLUDED.password,
        email = EXCLUDED.email,
        role = EXCLUDED.role
    `;
    
    await pool.query(query, ['admin', hashedPassword, 'admin@4set.com', 'admin']);
    
    console.log('✅ Usuário admin criado/atualizado com sucesso!');
    console.log('📧 Email: admin@4set.com');
    console.log('👤 Username: admin');
    console.log('🔑 Password: admin');
    
  } catch (error) {
    console.error('❌ Erro ao criar usuário admin:', error);
  } finally {
    await pool.end();
  }
}

seedAdminUser();
