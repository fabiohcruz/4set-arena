import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
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
import './models'; // Inicializar models

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

// Teste de conexão com o banco
pool.connect()
  .then(() => {
    console.log('✅ Conectado ao PostgreSQL');
  })
  .catch((err) => {
    console.error('❌ Erro ao conectar com PostgreSQL:', err);
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
  res.json({ 
    message: 'Sistema Esportivo 4Set API está funcionando!',
    timestamp: new Date().toISOString()
  });
});

// Middleware de erro
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Algo deu errado!' });
});

// Rota 404
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Rota não encontrada' });
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
});
