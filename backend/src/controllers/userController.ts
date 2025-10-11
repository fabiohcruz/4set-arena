import { Request, Response } from 'express';
import { UserModel, CreateUserData, UpdateUserData } from '../models/User';
import { authenticateToken, requireAdmin } from '../middleware/auth';

export class UserController {
  // Listar todos os usuários (apenas admin)
  static async getAllUsers(req: Request, res: Response) {
    try {
      const users = await UserModel.findAll();
      
      res.json({
        success: true,
        data: users
      });
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  // Buscar usuário por ID (apenas admin)
  static async getUserById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = parseInt(id);

      if (isNaN(userId)) {
        return res.status(400).json({
          success: false,
          message: 'ID do usuário inválido'
        });
      }

      const user = await UserModel.findById(userId);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Usuário não encontrado'
        });
      }

      res.json({
        success: true,
        data: user
      });
    } catch (error) {
      console.error('Erro ao buscar usuário:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  // Criar novo usuário (apenas admin)
  static async createUser(req: Request, res: Response) {
    try {
      const userData: CreateUserData = req.body;

      // Validações básicas
      if (!userData.username || !userData.password) {
        return res.status(400).json({
          success: false,
          message: 'Username e senha são obrigatórios'
        });
      }

      if (userData.password.length < 6) {
        return res.status(400).json({
          success: false,
          message: 'A senha deve ter pelo menos 6 caracteres'
        });
      }

      // Verificar se username já existe
      const existingUser = await UserModel.findByUsername(userData.username);
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Username já está em uso'
        });
      }

      // Verificar se email já existe (se fornecido)
      if (userData.email) {
        const existingEmail = await UserModel.findByEmail(userData.email);
        if (existingEmail) {
          return res.status(400).json({
            success: false,
            message: 'Email já está em uso'
          });
        }
      }

      const newUser = await UserModel.create(userData);

      res.status(201).json({
        success: true,
        data: newUser,
        message: 'Usuário criado com sucesso'
      });
    } catch (error) {
      console.error('Erro ao criar usuário:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  // Atualizar usuário (apenas admin)
  static async updateUser(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = parseInt(id);
      const updateData: UpdateUserData = req.body;

      if (isNaN(userId)) {
        return res.status(400).json({
          success: false,
          message: 'ID do usuário inválido'
        });
      }

      // Verificar se usuário existe
      const existingUser = await UserModel.findById(userId);
      if (!existingUser) {
        return res.status(404).json({
          success: false,
          message: 'Usuário não encontrado'
        });
      }

      // Verificar se username já existe (se sendo alterado)
      if (updateData.username && updateData.username !== existingUser.username) {
        const usernameExists = await UserModel.usernameExists(updateData.username, userId);
        if (usernameExists) {
          return res.status(400).json({
            success: false,
            message: 'Username já está em uso'
          });
        }
      }

      // Verificar se email já existe (se sendo alterado)
      if (updateData.email && updateData.email !== existingUser.email) {
        const emailExists = await UserModel.emailExists(updateData.email, userId);
        if (emailExists) {
          return res.status(400).json({
            success: false,
            message: 'Email já está em uso'
          });
        }
      }

      const updatedUser = await UserModel.update(userId, updateData);

      res.json({
        success: true,
        data: updatedUser,
        message: 'Usuário atualizado com sucesso'
      });
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  // Atualizar senha do usuário (apenas admin)
  static async updateUserPassword(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = parseInt(id);
      const { newPassword } = req.body;

      if (isNaN(userId)) {
        return res.status(400).json({
          success: false,
          message: 'ID do usuário inválido'
        });
      }

      if (!newPassword || newPassword.length < 6) {
        return res.status(400).json({
          success: false,
          message: 'A nova senha deve ter pelo menos 6 caracteres'
        });
      }

      // Verificar se usuário existe
      const existingUser = await UserModel.findById(userId);
      if (!existingUser) {
        return res.status(404).json({
          success: false,
          message: 'Usuário não encontrado'
        });
      }

      const success = await UserModel.updatePassword(userId, newPassword);

      if (success) {
        res.json({
          success: true,
          message: 'Senha atualizada com sucesso'
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Erro ao atualizar senha'
        });
      }
    } catch (error) {
      console.error('Erro ao atualizar senha:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  // Deletar usuário (apenas admin)
  static async deleteUser(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = parseInt(id);

      if (isNaN(userId)) {
        return res.status(400).json({
          success: false,
          message: 'ID do usuário inválido'
        });
      }

      // Verificar se usuário existe
      const existingUser = await UserModel.findById(userId);
      if (!existingUser) {
        return res.status(404).json({
          success: false,
          message: 'Usuário não encontrado'
        });
      }

      // Verificar se não está tentando deletar a si mesmo
      const currentUserId = (req as any).user?.userId;
      if (currentUserId === userId) {
        return res.status(400).json({
          success: false,
          message: 'Você não pode deletar sua própria conta'
        });
      }

      const success = await UserModel.delete(userId);

      if (success) {
        res.json({
          success: true,
          message: 'Usuário deletado com sucesso'
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Erro ao deletar usuário'
        });
      }
    } catch (error) {
      console.error('Erro ao deletar usuário:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  // Alternar status do usuário (apenas admin)
  static async toggleUserStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = parseInt(id);

      if (isNaN(userId)) {
        return res.status(400).json({
          success: false,
          message: 'ID do usuário inválido'
        });
      }

      // Verificar se usuário existe
      const existingUser = await UserModel.findById(userId);
      if (!existingUser) {
        return res.status(404).json({
          success: false,
          message: 'Usuário não encontrado'
        });
      }

      // Verificar se não está tentando alterar o próprio status
      const currentUserId = (req as any).user?.userId;
      if (currentUserId === userId) {
        return res.status(400).json({
          success: false,
          message: 'Você não pode alterar seu próprio status'
        });
      }

      const updatedUser = await UserModel.toggleStatus(userId);

      res.json({
        success: true,
        data: updatedUser,
        message: `Usuário ${updatedUser?.status === 'active' ? 'ativado' : 'desativado'} com sucesso`
      });
    } catch (error) {
      console.error('Erro ao alterar status do usuário:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  // Obter estatísticas dos usuários (apenas admin)
  static async getUserStats(req: Request, res: Response) {
    try {
      const stats = await UserModel.getStats();

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  // Buscar usuários com filtros (apenas admin)
  static async searchUsers(req: Request, res: Response) {
    try {
      const { search, role, status } = req.query;
      
      // Por enquanto, retornar todos os usuários
      // Em uma implementação mais avançada, poderíamos implementar filtros no banco
      const users = await UserModel.findAll();
      
      let filteredUsers = users;

      // Aplicar filtros no código (temporário)
      if (search) {
        const searchTerm = (search as string).toLowerCase();
        filteredUsers = filteredUsers.filter(user => 
          user.full_name?.toLowerCase().includes(searchTerm) ||
          user.username.toLowerCase().includes(searchTerm) ||
          user.email?.toLowerCase().includes(searchTerm)
        );
      }

      if (role && role !== 'all') {
        filteredUsers = filteredUsers.filter(user => user.role === role);
      }

      if (status && status !== 'all') {
        filteredUsers = filteredUsers.filter(user => user.status === status);
      }

      res.json({
        success: true,
        data: filteredUsers
      });
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }
}

