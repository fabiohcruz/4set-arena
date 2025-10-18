import express from 'express';
import { UserController } from '../controllers/userController';
import { authenticateToken, requireAdmin } from '../middleware/auth';

const router = express.Router();

// Todas as rotas requerem autenticação e permissão de admin
router.use(authenticateToken);
router.use(requireAdmin);

// GET /api/users - Listar todos os usuários
router.get('/', UserController.getAllUsers);

// GET /api/users/search - Buscar usuários com filtros
router.get('/search', UserController.searchUsers);

// GET /api/users/stats - Obter estatísticas dos usuários
router.get('/stats', UserController.getUserStats);

// GET /api/users/:id - Buscar usuário por ID
router.get('/:id', UserController.getUserById);

// POST /api/users - Criar novo usuário
router.post('/', UserController.createUser);

// PUT /api/users/:id - Atualizar usuário
router.put('/:id', UserController.updateUser);

// PUT /api/users/:id/password - Atualizar senha do usuário
router.put('/:id/password', UserController.updateUserPassword);

// PATCH /api/users/:id/toggle-status - Alternar status do usuário
router.patch('/:id/toggle-status', UserController.toggleUserStatus);

// DELETE /api/users/:id - Deletar usuário
router.delete('/:id', UserController.deleteUser);

export default router;






