import { Router } from 'express';
import { body } from 'express-validator';
import { MemberController } from '../controllers/memberController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Aplicar autenticação em todas as rotas
router.use(authenticateToken);

// Validações para criação de membro
const createMemberValidation = [
  body('full_name').trim().isLength({ min: 2, max: 100 }).withMessage('Nome deve ter entre 2 e 100 caracteres'),
  body('email').optional().isEmail().withMessage('Email deve ser válido'),
  body('phone').optional().isLength({ min: 10, max: 20 }).withMessage('Telefone deve ter entre 10 e 20 caracteres'),
  body('birth_date').optional().isISO8601().withMessage('Data de nascimento deve estar no formato ISO 8601'),
  body('address').optional().isLength({ max: 500 }).withMessage('Endereço deve ter no máximo 500 caracteres'),
  body('emergency_contact').optional().isLength({ max: 100 }).withMessage('Contato de emergência deve ter no máximo 100 caracteres'),
  body('emergency_phone').optional().isLength({ min: 10, max: 20 }).withMessage('Telefone de emergência deve ter entre 10 e 20 caracteres'),
  body('membership_type').optional().isIn(['regular', 'premium', 'vip']).withMessage('Tipo de assinatura inválido'),
  body('status').optional().isIn(['active', 'inactive', 'suspended']).withMessage('Status inválido')
];

// Validações para atualização de membro
const updateMemberValidation = [
  body('full_name').optional().trim().isLength({ min: 2, max: 100 }).withMessage('Nome deve ter entre 2 e 100 caracteres'),
  body('email').optional().isEmail().withMessage('Email deve ser válido'),
  body('phone').optional().isLength({ min: 10, max: 20 }).withMessage('Telefone deve ter entre 10 e 20 caracteres'),
  body('birth_date').optional().isISO8601().withMessage('Data de nascimento deve estar no formato ISO 8601'),
  body('address').optional().isLength({ max: 500 }).withMessage('Endereço deve ter no máximo 500 caracteres'),
  body('emergency_contact').optional().isLength({ max: 100 }).withMessage('Contato de emergência deve ter no máximo 100 caracteres'),
  body('emergency_phone').optional().isLength({ min: 10, max: 20 }).withMessage('Telefone de emergência deve ter entre 10 e 20 caracteres'),
  body('membership_type').optional().isIn(['regular', 'premium', 'vip']).withMessage('Tipo de assinatura inválido'),
  body('status').optional().isIn(['active', 'inactive', 'suspended']).withMessage('Status inválido')
];

// Rotas de consulta
router.get('/', MemberController.getAllMembers);
router.get('/active', MemberController.getActiveMembers);
router.get('/stats', MemberController.getMemberStats);
router.get('/code/:code', MemberController.getMemberByCode);
router.get('/:id', MemberController.getMemberById);

// Rotas de modificação
router.post('/', createMemberValidation, MemberController.createMember);
router.put('/:id', updateMemberValidation, MemberController.updateMember);
router.patch('/:id/toggle', MemberController.toggleMemberStatus);
router.delete('/:id', MemberController.deleteMember);

export default router;

