import { Router } from 'express';
import { body, param } from 'express-validator';
import { 
  getMemberOrders, 
  createMemberOrder, 
  getMemberOrderDetails,
  cancelMemberOrder,
  getAvailableProducts 
} from '../controllers/memberOrderController';
import { authenticateMember } from '../middleware/memberAuth';

const router = Router();

// Aplicar middleware de autenticação em todas as rotas
router.use(authenticateMember);

// Validações
const createOrderValidation = [
  body('items').isArray({ min: 1 }).withMessage('Pelo menos um item é obrigatório'),
  body('items.*.productId').isInt().withMessage('ID do produto deve ser um número'),
  body('items.*.quantity').isInt({ min: 1 }).withMessage('Quantidade deve ser um número positivo'),
  body('notes').optional().isString().withMessage('Observações devem ser texto')
];

const orderIdValidation = [
  param('orderId').isInt().withMessage('ID do pedido deve ser um número')
];

// Rotas para pedidos
router.get('/', getMemberOrders);
router.post('/', createOrderValidation, createMemberOrder);
router.get('/:orderId', orderIdValidation, getMemberOrderDetails);
router.delete('/:orderId', orderIdValidation, cancelMemberOrder);

// Rota para buscar produtos disponíveis
router.get('/products/available', getAvailableProducts);

export default router;
