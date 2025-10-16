import { Router } from 'express';
import { ProductController } from '../controllers/productController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Aplicar middleware de autenticação em todas as rotas
router.use(authenticateToken);

// Rotas para produtos
router.get('/', ProductController.getAllProducts);
router.get('/categories', ProductController.getCategories);
router.get('/code/:code', ProductController.getProductByCode);
router.get('/:id', ProductController.getProductById);
router.post('/', ProductController.createProduct);
router.put('/:id', ProductController.updateProduct);
router.delete('/:id', ProductController.deleteProduct);

export default router;
