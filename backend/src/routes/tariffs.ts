import { Router } from 'express';
import { TariffController } from '../controllers/tariffController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Aplicar middleware de autenticação em todas as rotas
router.use(authenticateToken);

// Rotas para tarifários
router.get('/', TariffController.getAllTariffs);
router.get('/sports', TariffController.getSports);
router.get('/sports/:sport/categories', TariffController.getCategoriesBySport);
router.get('/:id', TariffController.getTariffById);
router.post('/', TariffController.createTariff);
router.put('/:id', TariffController.updateTariff);
router.delete('/:id', TariffController.deleteTariff);

export default router;
