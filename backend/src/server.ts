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
import pool from './config/database';
// import './models'; // Inicializar models - removido para evitar conflitos
import { initDatabase } from './scripts/initDatabase';

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

// Servir arquivos estáticos do frontend
app.use(express.static(path.join(__dirname, '../../frontend/out')));

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

// Rota de teste
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok',
    message: 'Sistema Esportivo 4Set API está funcionando!',
    timestamp: new Date().toISOString()
  });
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

// Rota catch-all para servir o frontend
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../../frontend/out/index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
});
