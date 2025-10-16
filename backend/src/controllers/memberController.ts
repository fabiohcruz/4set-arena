import { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { Member } from '../models/Member';

export class MemberController {
  // Listar todos os membros
  static async getAllMembers(req: Request, res: Response) {
    try {
      const members = await Member.findAll({
        order: [['full_name', 'ASC']]
      });
      res.json({ success: true, data: members });
    } catch (error) {
      console.error('Erro ao buscar membros:', error);
      res.status(500).json({ success: false, message: 'Erro interno do servidor' });
    }
  }

  // Listar membros ativos
  static async getActiveMembers(req: Request, res: Response) {
    try {
      const members = await Member.findAll({ 
        where: { status: 'active' },
        order: [['full_name', 'ASC']]
      });
      res.json({ success: true, data: members });
    } catch (error) {
      console.error('Erro ao buscar membros ativos:', error);
      res.status(500).json({ success: false, message: 'Erro interno do servidor' });
    }
  }

  // Buscar membro por ID
  static async getMemberById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const memberId = parseInt(id);
      
      if (isNaN(memberId)) {
        return res.status(400).json({ 
          success: false, 
          message: 'ID do membro inválido' 
        });
      }

      const member = await Member.findByPk(memberId);
      
      if (!member) {
        return res.status(404).json({ success: false, message: 'Membro não encontrado' });
      }

      res.json({ success: true, data: member });
    } catch (error) {
      console.error('Erro ao buscar membro por ID:', error);
      res.status(500).json({ success: false, message: 'Erro interno do servidor' });
    }
  }

  // Buscar membro por código
  static async getMemberByCode(req: Request, res: Response) {
    try {
      const { code } = req.params;
      
      const member = await Member.findOne({ where: { member_code: code } });
      
      if (!member) {
        return res.status(404).json({ success: false, message: 'Membro não encontrado' });
      }
      
      res.json({ success: true, data: member });
    } catch (error) {
      console.error('Erro ao buscar membro por código:', error);
      res.status(500).json({ success: false, message: 'Erro interno do servidor' });
    }
  }

  // Criar novo membro
  static async createMember(req: Request, res: Response) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          success: false, 
          message: 'Dados inválidos',
          errors: errors.array()
        });
      }

      const {
        full_name,
        email,
        phone,
        birth_date,
        address,
        city,
        state,
        zip_code,
        emergency_contact,
        emergency_phone,
        membership_type,
        status
      } = req.body;

      // Verificar se já existe um membro com o mesmo email
      if (email) {
        const existingMember = await Member.findOne({ where: { email } });
        if (existingMember) {
          return res.status(400).json({ 
            success: false, 
            message: 'Já existe um membro com este email' 
          });
        }
      }

      // Gerar código do membro
      const memberCount = await Member.count();
      const memberCode = `MEM${(memberCount + 1).toString().padStart(4, '0')}`;

      const member = await Member.create({
        member_code: memberCode,
        full_name,
        email: email || null,
        phone: phone || null,
        birth_date: birth_date || null,
        address: address || null,
        city: city || null,
        state: state || null,
        zip_code: zip_code || null,
        emergency_contact: emergency_contact || null,
        emergency_phone: emergency_phone || null,
        membership_type: membership_type || 'regular',
        status: status || 'active',
        join_date: new Date().toISOString()
      });

      res.status(201).json({ 
        success: true, 
        message: 'Membro criado com sucesso',
        data: member 
      });
    } catch (error) {
      console.error('Erro ao criar membro:', error);
      res.status(500).json({ success: false, message: 'Erro interno do servidor' });
    }
  }

  // Atualizar membro
  static async updateMember(req: Request, res: Response) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          success: false, 
          message: 'Dados inválidos',
          errors: errors.array()
        });
      }

      const { id } = req.params;
      const memberId = parseInt(id);
      
      if (isNaN(memberId)) {
        return res.status(400).json({ 
          success: false, 
          message: 'ID do membro inválido' 
        });
      }

      const member = await Member.findByPk(memberId);
      if (!member) {
        return res.status(404).json({ success: false, message: 'Membro não encontrado' });
      }

      const {
        full_name,
        email,
        phone,
        birth_date,
        address,
        city,
        state,
        zip_code,
        emergency_contact,
        emergency_phone,
        membership_type,
        status
      } = req.body;

      // Verificar se já existe outro membro com o mesmo email
      if (email) {
        const existingMember = await Member.findOne({ 
          where: { 
            email,
            id: { $ne: memberId }
          } 
        });
        if (existingMember) {
          return res.status(400).json({ 
            success: false, 
            message: 'Já existe outro membro com este email' 
          });
        }
      }

      const updateData: any = {};
      if (full_name !== undefined) updateData.full_name = full_name;
      if (email !== undefined) updateData.email = email;
      if (phone !== undefined) updateData.phone = phone;
      if (birth_date !== undefined) updateData.birth_date = birth_date;
      if (address !== undefined) updateData.address = address;
      if (city !== undefined) updateData.city = city;
      if (state !== undefined) updateData.state = state;
      if (zip_code !== undefined) updateData.zip_code = zip_code;
      if (emergency_contact !== undefined) updateData.emergency_contact = emergency_contact;
      if (emergency_phone !== undefined) updateData.emergency_phone = emergency_phone;
      if (membership_type !== undefined) updateData.membership_type = membership_type;
      if (status !== undefined) updateData.status = status;

      await Member.update(updateData, { where: { id: memberId } });

      const updatedMember = await Member.findByPk(memberId);
      res.json({ 
        success: true, 
        message: 'Membro atualizado com sucesso',
        data: updatedMember 
      });
    } catch (error) {
      console.error('Erro ao atualizar membro:', error);
      res.status(500).json({ success: false, message: 'Erro interno do servidor' });
    }
  }

  // Alternar status do membro
  static async toggleMemberStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const memberId = parseInt(id);
      
      if (isNaN(memberId)) {
        return res.status(400).json({ 
          success: false, 
          message: 'ID do membro inválido' 
        });
      }

      const member = await Member.findByPk(memberId);
      if (!member) {
        return res.status(404).json({ success: false, message: 'Membro não encontrado' });
      }

      const newStatus = member.status === 'active' ? 'inactive' : 'active';
      await Member.update({ status: newStatus }, { where: { id: memberId } });

      const updatedMember = await Member.findByPk(memberId);
      res.json({ 
        success: true, 
        message: `Status do membro alterado para ${newStatus}`,
        data: updatedMember 
      });
    } catch (error) {
      console.error('Erro ao alterar status do membro:', error);
      res.status(500).json({ success: false, message: 'Erro interno do servidor' });
    }
  }

  // Deletar membro
  static async deleteMember(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const memberId = parseInt(id);
      
      if (isNaN(memberId)) {
        return res.status(400).json({ 
          success: false, 
          message: 'ID do membro inválido' 
        });
      }

      const member = await Member.findByPk(memberId);
      if (!member) {
        return res.status(404).json({ success: false, message: 'Membro não encontrado' });
      }

      await Member.destroy({ where: { id: memberId } });

      res.json({ 
        success: true, 
        message: 'Membro deletado com sucesso' 
      });
    } catch (error) {
      console.error('Erro ao deletar membro:', error);
      res.status(500).json({ success: false, message: 'Erro interno do servidor' });
    }
  }

  // Buscar estatísticas de membros
  static async getMemberStats(req: Request, res: Response) {
    try {
      const total = await Member.count();
      const active = await Member.count({ where: { status: 'active' } });
      const inactive = await Member.count({ where: { status: 'inactive' } });
      const suspended = await Member.count({ where: { status: 'suspended' } });
      const regular = await Member.count({ where: { membership_type: 'regular' } });
      const premium = await Member.count({ where: { membership_type: 'premium' } });
      const vip = await Member.count({ where: { membership_type: 'vip' } });

      const stats = {
        total,
        active,
        inactive,
        suspended,
        regular,
        premium,
        vip
      };

      res.json({ success: true, data: stats });
    } catch (error) {
      console.error('Erro ao buscar estatísticas de membros:', error);
      res.status(500).json({ success: false, message: 'Erro interno do servidor' });
    }
  }
}