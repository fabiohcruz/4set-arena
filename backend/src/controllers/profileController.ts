import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { UserModel } from '../models/User';
import { authenticateToken } from '../middleware/auth';
import { validateCPF } from '../utils/validators';

export class ProfileController {
  // Obter dados do perfil do usuário logado
  static async getProfile(req: Request, res: Response) {
    try {
      const userId = (req as any).user.userId;
      const user = await UserModel.findById(userId);
      
      if (!user) {
        return res.status(404).json({ message: 'Usuário não encontrado' });
      }

      // Remover senha da resposta
      const { password, ...userProfile } = user;
      
      res.json({
        success: true,
        data: userProfile
      });
    } catch (error) {
      console.error('Erro ao buscar perfil:', error);
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  }

  // Atualizar dados do perfil
  static async updateProfile(req: Request, res: Response) {
    try {
      const userId = (req as any).user.userId;
      const { 
        full_name, 
        email, 
        phone, 
        cpf,
        avatar_url, 
        birth_date, 
        gender, 
        address, 
        city, 
        state, 
        zip_code
      } = req.body;

      // Verificar se email já existe em outro usuário
      if (email) {
        const existingUser = await UserModel.findByEmail(email);
        if (existingUser && existingUser.id !== userId) {
          return res.status(400).json({ message: 'Email já está em uso' });
        }
      }

      // Validar CPF se fornecido
      if (cpf) {
        if (!validateCPF(cpf)) {
          return res.status(400).json({ message: 'CPF inválido' });
        }
        
        // Verificar se CPF já existe em outro usuário
        const existingUser = await UserModel.findByCPF(cpf);
        if (existingUser && existingUser.id !== userId) {
          return res.status(400).json({ message: 'CPF já está em uso' });
        }
      }

      const updates: any = {};
      if (full_name !== undefined) updates.full_name = full_name;
      if (email !== undefined) updates.email = email;
      if (phone !== undefined) updates.phone = phone;
      if (cpf !== undefined) updates.cpf = cpf;
      if (avatar_url !== undefined) updates.avatar_url = avatar_url;
      if (birth_date !== undefined) updates.birth_date = birth_date;
      if (gender !== undefined) updates.gender = gender;
      if (address !== undefined) updates.address = address;
      if (city !== undefined) updates.city = city;
      if (state !== undefined) updates.state = state;
      if (zip_code !== undefined) updates.zip_code = zip_code;

      const updatedUser = await UserModel.updateProfile(userId, updates);
      
      if (!updatedUser) {
        return res.status(400).json({ message: 'Nenhum campo foi atualizado' });
      }

      // Remover senha da resposta
      const { password, ...userProfile } = updatedUser;

      res.json({
        success: true,
        message: 'Perfil atualizado com sucesso',
        data: userProfile
      });
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  }

  // Alterar senha
  static async changePassword(req: Request, res: Response) {
    try {
      const userId = (req as any).user.userId;
      const { currentPassword, newPassword } = req.body;

      if (!currentPassword || !newPassword) {
        return res.status(400).json({ message: 'Senha atual e nova senha são obrigatórias' });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({ message: 'Nova senha deve ter pelo menos 6 caracteres' });
      }

      // Buscar usuário para verificar senha atual
      const user = await UserModel.findById(userId);
      if (!user) {
        return res.status(404).json({ message: 'Usuário não encontrado' });
      }

      // Verificar senha atual
      if (!user.password) {
        return res.status(400).json({ message: 'Usuário não possui senha definida' });
      }
      
      const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
      if (!isCurrentPasswordValid) {
        return res.status(400).json({ message: 'Senha atual incorreta' });
      }

      // Hash da nova senha
      const hashedNewPassword = await bcrypt.hash(newPassword, 10);

      // Atualizar senha
      const success = await UserModel.changePassword(userId, hashedNewPassword);
      
      if (!success) {
        return res.status(500).json({ message: 'Erro ao alterar senha' });
      }

      res.json({
        success: true,
        message: 'Senha alterada com sucesso'
      });
    } catch (error) {
      console.error('Erro ao alterar senha:', error);
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  }

  // Atualizar preferências
  static async updatePreferences(req: Request, res: Response) {
    try {
      const userId = (req as any).user.userId;
      const { preferences } = req.body;

      if (!preferences || typeof preferences !== 'object') {
        return res.status(400).json({ message: 'Preferências devem ser um objeto válido' });
      }

      const success = await UserModel.updatePreferences(userId, preferences);
      
      if (!success) {
        return res.status(500).json({ message: 'Erro ao atualizar preferências' });
      }

      res.json({
        success: true,
        message: 'Preferências atualizadas com sucesso'
      });
    } catch (error) {
      console.error('Erro ao atualizar preferências:', error);
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  }

  // Upload de avatar (placeholder - implementar depois)
  static async uploadAvatar(req: Request, res: Response) {
    try {
      // TODO: Implementar upload de arquivo
      res.json({
        success: true,
        message: 'Upload de avatar será implementado em breve',
        data: { avatar_url: null }
      });
    } catch (error) {
      console.error('Erro no upload de avatar:', error);
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  }
}
