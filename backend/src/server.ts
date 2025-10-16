import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import path from 'path';
import authRoutes from './routes/auth';
import profileRoutes from './routes/profile';
import courtRoutes from './routes/courts';
import memberRoutes from './routes/members';
import menuRoutes from './routes/menu';
import userRoutes from './routes/users';
import productRoutes from './routes/products';
import tariffRoutes from './routes/tariffs';
import saleRoutes from './routes/sales';
import stockRoutes from './routes/stock';
import memberAuthRoutes from './routes/memberAuth';
import memberReservationRoutes from './routes/memberReservations';
import memberOrderRoutes from './routes/memberOrders';
import debugRoutes from './routes/debug';
import pool from './config/database';
// import './models'; // Inicializar models - removido para evitar conflitos
import { initDatabase } from './scripts/initDatabase';
import { fixAdmin } from './scripts/fixAdmin';
import { importAllData } from './scripts/importAllData';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(helmet());
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://yourdomain.com'] 
    : ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir arquivos estáticos do frontend (temporariamente desabilitado)
// const frontendPath = path.join(__dirname, '../../frontend/out');
// console.log('📁 Caminho do frontend:', frontendPath);
// app.use(express.static(frontendPath));

// Debug das variáveis de ambiente
console.log('🔍 Variáveis de ambiente:');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'Configurada' : 'Não configurada');
console.log('PORT:', process.env.PORT);

// Teste de conexão com o banco e inicialização
pool.connect()
  .then(async () => {
    console.log('✅ Conectado ao PostgreSQL');
    
    // Inicializar banco de dados se necessário
    try {
      console.log('🔄 Verificando se banco precisa ser inicializado...');
      await initDatabase();
      console.log('✅ Banco de dados verificado/inicializado');
      
      // Corrigir usuário admin se necessário
      console.log('🔄 Verificando usuário admin...');
      await fixAdmin();
      console.log('✅ Usuário admin verificado/corrigido');
      
      // Importar todos os dados da base local
      console.log('🔄 Importando todos os dados da base local...');
      try {
        await importAllData();
        console.log('✅ Todos os dados importados com sucesso');
      } catch (error) {
        console.error('❌ Erro ao importar dados:', error);
        // Não falhar o startup se já estiver importado
      }
    } catch (error) {
      console.error('❌ Erro ao inicializar banco:', error);
      // Não falhar o startup se já estiver inicializado
    }
  })
  .catch((err) => {
    console.error('❌ Erro ao conectar com PostgreSQL:', err);
    console.error('🔍 Verifique se a variável DATABASE_URL está configurada no Railway');
  });

// Rotas
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/courts', courtRoutes);
app.use('/api/members', memberRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/tariffs', tariffRoutes);
app.use('/api/sales', saleRoutes);
app.use('/api/stock', stockRoutes);

// Rotas para membros
app.use('/api/member/auth', memberAuthRoutes);
app.use('/api/member/reservations', memberReservationRoutes);
app.use('/api/member/orders', memberOrderRoutes);

// Rotas de debug
app.use('/api/debug', debugRoutes);

// Rota de teste
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok',
    message: 'Sistema Esportivo 4Set API está funcionando!',
    timestamp: new Date().toISOString()
  });
});

// Rota para testar login simples
app.post('/api/test-login', async (req, res) => {
  let client;
  try {
    client = await pool.connect();
    const { username, password } = req.body;
    
    console.log('🔍 Testando login para:', username);
    
    // Buscar usuário diretamente no banco
    const result = await client.query('SELECT * FROM users WHERE username = $1', [username]);
    
    if (result.rows.length === 0) {
      console.log('❌ Usuário não encontrado');
      return res.status(401).json({ message: 'Usuário não encontrado' });
    }
    
    const user = result.rows[0];
    console.log('✅ Usuário encontrado:', user.username, 'Role:', user.role);
    
    // Verificar senha
    const bcrypt = require('bcryptjs');
    const isValidPassword = await bcrypt.compare(password, user.password);
    
    if (!isValidPassword) {
      console.log('❌ Senha inválida');
      return res.status(401).json({ message: 'Senha inválida' });
    }
    
    console.log('✅ Login bem-sucedido');
    res.json({ 
      message: 'Login bem-sucedido',
      user: {
        id: user.id,
        username: user.username,
        role: user.role
      }
    });
    
  } catch (error) {
    console.error('❌ Erro no teste de login:', error);
    res.status(500).json({ error: (error as Error).message });
  } finally {
    if (client) {
      client.release();
    }
  }
});

// Rota para criar usuário admin
app.post('/api/create-admin', async (req, res) => {
  let client;
  try {
    client = await pool.connect();
    console.log('🔄 Criando usuário admin...');

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
      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash('admin', 10);
      
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
      res.json({ message: 'Usuário admin criado com sucesso' });
    } else {
      console.log('✅ Usuário admin já existe');
      
      // Verificar se a senha está correta
      const admin = adminCheck.rows[0];
      const bcrypt = require('bcryptjs');
      const isValidPassword = await bcrypt.compare('admin', admin.password);
      
      if (!isValidPassword) {
        console.log('🔄 Atualizando senha do admin...');
        const hashedPassword = await bcrypt.hash('admin', 10);
        
        await client.query(
          'UPDATE users SET password = $1 WHERE username = $2',
          [hashedPassword, 'admin']
        );
        
        console.log('✅ Senha do admin atualizada');
        res.json({ message: 'Senha do admin atualizada' });
      } else {
        console.log('✅ Senha do admin está correta');
        res.json({ message: 'Usuário admin já existe e senha está correta' });
      }
    }

  } catch (error) {
    console.error('❌ Erro ao criar admin:', error);
    res.status(500).json({ error: (error as Error).message });
  } finally {
    if (client) {
      client.release();
    }
  }
});

// Rota de teste simples
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Rota de teste para verificar se as rotas estão funcionando
app.get('/api/test', (req, res) => {
  res.json({ message: 'Rotas funcionando!', timestamp: new Date().toISOString() });
});

// Rota GET para criar usuário admin
app.get('/api/create-admin', async (req, res) => {
  let client;
  try {
    client = await pool.connect();
    console.log('🔄 Criando usuário admin...');

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
      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash('admin', 10);
      
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
      res.json({ message: 'Usuário admin criado com sucesso' });
    } else {
      console.log('✅ Usuário admin já existe');
      
      // Verificar se a senha está correta
      const admin = adminCheck.rows[0];
      const bcrypt = require('bcryptjs');
      const isValidPassword = await bcrypt.compare('admin', admin.password);
      
      if (!isValidPassword) {
        console.log('🔄 Atualizando senha do admin...');
        const hashedPassword = await bcrypt.hash('admin', 10);
        
        await client.query(
          'UPDATE users SET password = $1 WHERE username = $2',
          [hashedPassword, 'admin']
        );
        
        console.log('✅ Senha do admin atualizada');
        res.json({ message: 'Senha do admin atualizada' });
      } else {
        console.log('✅ Senha do admin está correta');
        res.json({ message: 'Usuário admin já existe e senha está correta' });
      }
    }

  } catch (error) {
    console.error('❌ Erro ao criar admin:', error);
    res.status(500).json({ error: (error as Error).message });
  } finally {
    if (client) {
      client.release();
    }
  }
});

// Middleware de erro
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Algo deu errado!' });
});

// Rota para importar todos os dados
app.get('/api/import-all-data', async (req, res) => {
  try {
    console.log('🔄 Iniciando importação de todos os dados...');
    await importAllData();
    res.json({ message: 'Todos os dados foram importados com sucesso!' });
  } catch (error) {
    console.error('❌ Erro ao importar dados:', error);
    res.status(500).json({ error: (error as Error).message });
  }
});

// Rota para atualizar senha do admin
app.get('/api/update-admin-password', async (req, res) => {
  let client;
  try {
    client = await pool.connect();
    console.log('🔄 Atualizando senha do admin para "admin"...');
    
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash('admin', 10);
    
    await client.query(
      'UPDATE users SET password = $1 WHERE username = $2',
      [hashedPassword, 'admin']
    );
    
    console.log('✅ Senha do admin atualizada para "admin"');
    res.json({ message: 'Senha do admin atualizada para "admin"' });
    
  } catch (error) {
    console.error('❌ Erro ao atualizar senha:', error);
    res.status(500).json({ error: (error as Error).message });
  } finally {
    if (client) {
      client.release();
    }
  }
});

// Rota catch-all para rotas não encontradas
app.get('*', (req, res) => {
  res.status(404).json({ message: 'Rota não encontrada' });
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
});
