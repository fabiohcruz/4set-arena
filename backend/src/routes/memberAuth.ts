import { Router } from 'express';
import { body } from 'express-validator';
import { memberLogin, getMemberProfile, updateMemberProfile } from '../controllers/memberAuthController';
import { authenticateMember } from '../middleware/memberAuth';

const router = Router();

// Validações
const loginValidation = [
  body('memberCode').notEmpty().withMessage('Código do membro é obrigatório'),
  body('password').isLength({ min: 1 }).withMessage('Senha é obrigatória')
];

const updateProfileValidation = [
  body('full_name').optional().isLength({ min: 2 }).withMessage('Nome deve ter pelo menos 2 caracteres'),
  body('email').optional().isEmail().withMessage('Email deve ser válido'),
  body('phone').optional().isLength({ min: 10 }).withMessage('Telefone deve ter pelo menos 10 caracteres')
];

// Rotas públicas
router.post('/login', loginValidation, memberLogin);

// Rotas protegidas
router.get('/profile', authenticateMember, getMemberProfile);
router.put('/profile', authenticateMember, updateProfileValidation, updateMemberProfile);

export default router;
