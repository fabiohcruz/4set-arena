import express from 'express';
import { body } from 'express-validator';
import { CourtController } from '../controllers/courtController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// Validações
const courtValidation = [
  body('name')
    .notEmpty()
    .withMessage('Nome da quadra é obrigatório')
    .isLength({ min: 3, max: 255 })
    .withMessage('Nome deve ter entre 3 e 255 caracteres'),
  body('type')
    .isIn(['Quadra', 'Campo', 'Piscina', 'Academia'])
    .withMessage('Tipo deve ser: Quadra, Campo, Piscina ou Academia'),
  body('capacity')
    .isInt({ min: 1 })
    .withMessage('Capacidade deve ser um número inteiro maior que 0'),
  body('price')
    .isFloat({ min: 0 })
    .withMessage('Preço deve ser um número maior ou igual a 0'),
  body('description')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Descrição deve ter no máximo 1000 caracteres'),
  body('is_active')
    .optional()
    .isBoolean()
    .withMessage('Status ativo deve ser verdadeiro ou falso')
];

// Rotas públicas (para reservas)
router.get('/active', CourtController.getActiveCourts);

// Rotas protegidas (para administração)
router.get('/', authenticateToken, CourtController.getAllCourts);
router.get('/:id', authenticateToken, CourtController.getCourtById);
router.post('/', authenticateToken, courtValidation, CourtController.createCourt);
router.put('/:id', authenticateToken, courtValidation, CourtController.updateCourt);
router.delete('/:id', authenticateToken, CourtController.deleteCourt);
router.patch('/:id/toggle', authenticateToken, CourtController.toggleCourtStatus);

export default router;

