import { Router } from 'express';
import { StockController } from '../controllers/stockController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Aplicar middleware de autenticação em todas as rotas
router.use(authenticateToken);

// Rotas para controle de estoque
router.post('/adjust', StockController.adjustStock);
router.post('/add', StockController.addStock);
router.post('/remove', StockController.removeStock);
router.get('/movements', StockController.getStockMovements);
router.get('/low-stock-report', StockController.getLowStockReport);
router.post('/import-xml', StockController.importFromXML);

export default router;

