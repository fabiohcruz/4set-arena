import { Router } from 'express';
import { SaleController } from '../controllers/saleController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Aplicar middleware de autenticação em todas as rotas
router.use(authenticateToken);

// Rotas para vendas
router.get('/', SaleController.getAllSales);
router.get('/account/:accountNumber', SaleController.getSaleByAccountNumber);
router.get('/:id', SaleController.getSaleById);
router.post('/', SaleController.createSale);
router.post('/:saleId/items', SaleController.addItemToSale);
router.put('/:saleId/items/:itemId', SaleController.updateItemInSale);
router.delete('/:saleId/items/:itemId', SaleController.removeItemFromSale);
router.put('/:id/close', SaleController.closeSale);
router.put('/:id/transfer', SaleController.transferSale);

export default router;
