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
      res.json({ message: 'Usuário admin criado com sucesso' });
    } else {
      console.log('✅ Usuário admin já existe');
      
      // Verificar se a senha está correta
      const admin = adminCheck.rows[0];
      const bcrypt = require('bcryptjs');
      const isValidPassword = await bcrypt.compare('password', admin.password);
      
      if (!isValidPassword) {
        console.log('🔄 Atualizando senha do admin...');
        const hashedPassword = await bcrypt.hash('password', 10);
        
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
    res.status(500).json({ error: error.message });
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

// Middleware de erro
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Algo deu errado!' });
});

// Rota catch-all para servir página de status
app.get('*', (req, res) => {
  console.log('📄 Servindo página de status para:', req.path);
  res.send(`
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>4Set Arena - Sistema Esportivo</title>
      <style>
        body { font-family: Arial, sans-serif; text-align: center; padding: 50px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; }
        .container { max-width: 600px; margin: 0 auto; }
        h1 { font-size: 2.5em; margin-bottom: 20px; }
        p { font-size: 1.2em; margin-bottom: 30px; }
        .status { background: rgba(255,255,255,0.1); padding: 20px; border-radius: 10px; margin: 20px 0; }
        .api-link { background: rgba(255,255,255,0.2); padding: 10px; border-radius: 5px; margin: 10px 0; }
        a { color: white; text-decoration: none; }
        a:hover { text-decoration: underline; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>🏆 4Set Arena</h1>
        <p>Sistema Esportivo</p>
        <div class="status">
          <h2>✅ Backend Funcionando</h2>
          <p>API está operacional</p>
          <p>Banco de dados conectado</p>
        </div>
        <div class="api-link">
          <h3>🔗 Endpoints da API:</h3>
          <p><a href="/api/health">/api/health</a> - Status da API</p>
          <p><a href="/api/menu/enabled">/api/menu/enabled</a> - Menu</p>
          <p><a href="/api/courts">/api/courts</a> - Quadras</p>
          <p><a href="/api/members">/api/members</a> - Membros</p>
        </div>
        <p>Frontend em desenvolvimento...</p>
      </div>
    </body>
    </html>
  `);
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
});
