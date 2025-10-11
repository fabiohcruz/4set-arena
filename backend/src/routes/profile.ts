import express from 'express';
import { ProfileController } from '../controllers/profileController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// Todas as rotas de perfil requerem autenticação
router.use(authenticateToken);

// GET /api/profile - Obter dados do perfil
router.get('/', ProfileController.getProfile);

// PUT /api/profile - Atualizar dados do perfil
router.put('/', ProfileController.updateProfile);

// PUT /api/profile/password - Alterar senha
router.put('/password', ProfileController.changePassword);

// PUT /api/profile/preferences - Atualizar preferências
router.put('/preferences', ProfileController.updatePreferences);

// POST /api/profile/avatar - Upload de avatar
router.post('/avatar', ProfileController.uploadAvatar);

export default router;
