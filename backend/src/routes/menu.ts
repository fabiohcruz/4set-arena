import { Router } from 'express';
import { body } from 'express-validator';
import { MenuController } from '../controllers/menuController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Validações para criação de item do menu
const createMenuItemValidation = [
  body('key').trim().isLength({ min: 2, max: 50 }).withMessage('Chave deve ter entre 2 e 50 caracteres'),
  body('label').trim().isLength({ min: 2, max: 100 }).withMessage('Label deve ter entre 2 e 100 caracteres'),
  body('icon').optional().isLength({ max: 50 }).withMessage('Ícone deve ter no máximo 50 caracteres'),
  body('path').optional().isLength({ max: 200 }).withMessage('Caminho deve ter no máximo 200 caracteres'),
  body('order_index').optional().isInt({ min: 0 }).withMessage('Índice de ordem deve ser um número inteiro positivo'),
  body('is_enabled').optional().isBoolean().withMessage('Status habilitado deve ser booleano'),
  body('requires_admin').optional().isBoolean().withMessage('Requer admin deve ser booleano'),
  body('parent_key').optional().isLength({ max: 50 }).withMessage('Chave do pai deve ter no máximo 50 caracteres')
];

// Validações para atualização de item do menu
const updateMenuItemValidation = [
  body('key').optional().trim().isLength({ min: 2, max: 50 }).withMessage('Chave deve ter entre 2 e 50 caracteres'),
  body('label').optional().trim().isLength({ min: 2, max: 100 }).withMessage('Label deve ter entre 2 e 100 caracteres'),
  body('icon').optional().isLength({ max: 50 }).withMessage('Ícone deve ter no máximo 50 caracteres'),
  body('path').optional().isLength({ max: 200 }).withMessage('Caminho deve ter no máximo 200 caracteres'),
  body('order_index').optional().isInt({ min: 0 }).withMessage('Índice de ordem deve ser um número inteiro positivo'),
  body('is_enabled').optional().isBoolean().withMessage('Status habilitado deve ser booleano'),
  body('requires_admin').optional().isBoolean().withMessage('Requer admin deve ser booleano'),
  body('parent_key').optional().isLength({ max: 50 }).withMessage('Chave do pai deve ter no máximo 50 caracteres')
];

// Validação para atualização de ordem
const updateOrderValidation = [
  body('items').isArray().withMessage('Items deve ser um array'),
  body('items.*.id').isInt({ min: 1 }).withMessage('ID do item deve ser um número inteiro positivo'),
  body('items.*.order_index').isInt({ min: 0 }).withMessage('Índice de ordem deve ser um número inteiro positivo')
];

// Middleware para verificar se o usuário é admin
const requireAdmin = (req: any, res: any, next: any) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ success: false, message: 'Acesso negado. Apenas administradores podem acessar esta funcionalidade.' });
  }
};

// Rotas públicas (não requerem autenticação)
router.get('/public', MenuController.getPublicMenuItems);
router.get('/enabled', MenuController.getEnabledMenuItems);

// Rotas que requerem autenticação
router.use(authenticateToken);

// Rotas de consulta (requerem autenticação)
router.get('/stats', MenuController.getMenuStats);
router.get('/key/:key', MenuController.getMenuItemByKey);
router.get('/:id', MenuController.getMenuItemById);

// Rotas administrativas (requerem autenticação + admin)
router.use(requireAdmin);

// Rotas de consulta administrativa
router.get('/', MenuController.getAllMenuItems);

// Rotas de modificação administrativa
router.post('/', createMenuItemValidation, MenuController.createMenuItem);
router.put('/:id', updateMenuItemValidation, MenuController.updateMenuItem);
router.patch('/:id/toggle', MenuController.toggleMenuItemStatus);
router.patch('/order', updateOrderValidation, MenuController.updateMenuOrder);
router.delete('/:id', MenuController.deleteMenuItem);

export default router;

