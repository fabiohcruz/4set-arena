import { Router } from 'express';
import { body, param } from 'express-validator';
import { 
  getMemberReservations, 
  createMemberReservation, 
  cancelMemberReservation,
  getAvailableCourts 
} from '../controllers/memberReservationController';
import { authenticateMember } from '../middleware/memberAuth';

const router = Router();

// Aplicar middleware de autenticação em todas as rotas
router.use(authenticateMember);

// Validações
const createReservationValidation = [
  body('courtId').isInt().withMessage('ID da quadra deve ser um número'),
  body('startTime').isISO8601().withMessage('Data/hora de início deve ser válida'),
  body('endTime').isISO8601().withMessage('Data/hora de fim deve ser válida'),
  body('notes').optional().isString().withMessage('Observações devem ser texto')
];

const cancelReservationValidation = [
  param('reservationId').isInt().withMessage('ID da reserva deve ser um número')
];

// Rotas para reservas
router.get('/', getMemberReservations);
router.post('/', createReservationValidation, createMemberReservation);
router.delete('/:reservationId', cancelReservationValidation, cancelMemberReservation);

// Rota para buscar quadras disponíveis (pública para membros autenticados)
router.get('/courts/available', getAvailableCourts);

export default router;
