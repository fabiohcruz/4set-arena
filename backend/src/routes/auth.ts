import { Router } from 'express';
import { body } from 'express-validator';
import { login, register, getProfile } from '../controllers/authController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Validações
const loginValidation = [
  body('username').notEmpty().withMessage('Nome de usuário é obrigatório'),
  body('password').isLength({ min: 1 }).withMessage('Senha é obrigatória')
];

const registerValidation = [
  body('username').isLength({ min: 3 }).withMessage('Nome de usuário deve ter pelo menos 3 caracteres'),
  body('password').isLength({ min: 6 }).withMessage('Senha deve ter pelo menos 6 caracteres'),
  body('email').optional().isEmail().withMessage('Email deve ser válido')
];

// Rotas
router.post('/login', loginValidation, login);
router.post('/register', registerValidation, register);
router.get('/profile', authenticateToken, getProfile);

export default router;
