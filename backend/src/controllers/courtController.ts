import { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { Court } from '../models/Court';

export class CourtController {
  // Listar todas as quadras
  static async getAllCourts(req: Request, res: Response) {
    try {
      const courts = await Court.findAll({
        order: [['name', 'ASC']]
      });
      res.json({ success: true, data: courts });
    } catch (error) {
      console.error('Erro ao buscar quadras:', error);
      res.status(500).json({ success: false, message: 'Erro interno do servidor' });
    }
  }

  // Listar quadras ativas
  static async getActiveCourts(req: Request, res: Response) {
    try {
      const courts = await Court.findAll({
        where: { is_active: true },
        order: [['name', 'ASC']]
      });
      res.json({ success: true, data: courts });
    } catch (error) {
      console.error('Erro ao buscar quadras ativas:', error);
      res.status(500).json({ success: false, message: 'Erro interno do servidor' });
    }
  }

  // Buscar quadra por ID
  static async getCourtById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const courtId = parseInt(id);
      
      if (isNaN(courtId)) {
        return res.status(400).json({ 
          success: false, 
          message: 'ID da quadra inválido' 
        });
      }

      const court = await Court.findByPk(courtId);
      
      if (!court) {
        return res.status(404).json({ success: false, message: 'Quadra não encontrada' });
      }

      res.json({ success: true, data: court });
    } catch (error) {
      console.error('Erro ao buscar quadra por ID:', error);
      res.status(500).json({ success: false, message: 'Erro interno do servidor' });
    }
  }

  // Criar nova quadra
  static async createCourt(req: Request, res: Response) {
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
        name,
        type,
        capacity,
        price,
        description
      } = req.body;

      const court = await Court.create({
        name,
        type,
        capacity,
        price,
        description: description || null,
        is_active: true
      });

      res.status(201).json({ 
        success: true, 
        message: 'Quadra criada com sucesso',
        data: court 
      });
    } catch (error) {
      console.error('Erro ao criar quadra:', error);
      res.status(500).json({ success: false, message: 'Erro interno do servidor' });
    }
  }

  // Atualizar quadra
  static async updateCourt(req: Request, res: Response) {
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
      const courtId = parseInt(id);
      
      if (isNaN(courtId)) {
        return res.status(400).json({ 
          success: false, 
          message: 'ID da quadra inválido' 
        });
      }

      const court = await Court.findByPk(courtId);
      if (!court) {
        return res.status(404).json({ success: false, message: 'Quadra não encontrada' });
      }

      const {
        name,
        type,
        capacity,
        price,
        description,
        is_active
      } = req.body;

      const updateData: any = {};
      if (name !== undefined) updateData.name = name;
      if (type !== undefined) updateData.type = type;
      if (capacity !== undefined) updateData.capacity = capacity;
      if (price !== undefined) updateData.price = price;
      if (description !== undefined) updateData.description = description;
      if (is_active !== undefined) updateData.is_active = is_active;

      await Court.update(updateData, { where: { id: courtId } });

      const updatedCourt = await Court.findByPk(courtId);
      res.json({ 
        success: true, 
        message: 'Quadra atualizada com sucesso',
        data: updatedCourt 
      });
    } catch (error) {
      console.error('Erro ao atualizar quadra:', error);
      res.status(500).json({ success: false, message: 'Erro interno do servidor' });
    }
  }

  // Deletar quadra
  static async deleteCourt(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const courtId = parseInt(id);
      
      if (isNaN(courtId)) {
        return res.status(400).json({ 
          success: false, 
          message: 'ID da quadra inválido' 
        });
      }

      const court = await Court.findByPk(courtId);
      if (!court) {
        return res.status(404).json({ success: false, message: 'Quadra não encontrada' });
      }

      await Court.destroy({ where: { id: courtId } });

      res.json({ 
        success: true, 
        message: 'Quadra deletada com sucesso' 
      });
    } catch (error) {
      console.error('Erro ao deletar quadra:', error);
      res.status(500).json({ success: false, message: 'Erro interno do servidor' });
    }
  }

  // Alternar status ativo/inativo da quadra
  static async toggleCourtActive(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const courtId = parseInt(id);
      
      if (isNaN(courtId)) {
        return res.status(400).json({ 
          success: false, 
          message: 'ID da quadra inválido' 
        });
      }

      const court = await Court.findByPk(courtId);
      if (!court) {
        return res.status(404).json({ success: false, message: 'Quadra não encontrada' });
      }

      const newStatus = !court.is_active;
      await Court.update({ is_active: newStatus }, { where: { id: courtId } });

      const updatedCourt = await Court.findByPk(courtId);
      res.json({ 
        success: true, 
        message: `Status da quadra alterado para ${newStatus ? 'ativo' : 'inativo'}`,
        data: updatedCourt 
      });
    } catch (error) {
      console.error('Erro ao alterar status da quadra:', error);
      res.status(500).json({ success: false, message: 'Erro interno do servidor' });
    }
  }
}