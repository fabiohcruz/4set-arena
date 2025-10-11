import { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { CourtModel } from '../models/Court';

export class CourtController {
  // Listar todas as quadras
  static async getAllCourts(req: Request, res: Response) {
    try {
      const courts = await CourtModel.findAll();
      res.json({ success: true, data: courts });
    } catch (error) {
      console.error('Erro ao buscar quadras:', error);
      res.status(500).json({ success: false, message: 'Erro interno do servidor' });
    }
  }

  // Listar quadras ativas
  static async getActiveCourts(req: Request, res: Response) {
    try {
      const courts = await CourtModel.findActive();
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
      const court = await CourtModel.findById(parseInt(id));
      
      if (!court) {
        return res.status(404).json({ success: false, message: 'Quadra não encontrada' });
      }
      
      res.json({ success: true, data: court });
    } catch (error) {
      console.error('Erro ao buscar quadra:', error);
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

      const { name, type, capacity, price, description, is_active } = req.body;

      // Verificar se já existe uma quadra com o mesmo nome
      const existingCourts = await CourtModel.findAll();
      const nameExists = existingCourts.some(court => 
        court.name.toLowerCase() === name.toLowerCase()
      );

      if (nameExists) {
        return res.status(400).json({ 
          success: false, 
          message: 'Já existe uma quadra com este nome' 
        });
      }

      const courtData = {
        name,
        type,
        capacity: parseInt(capacity),
        price: parseFloat(price),
        description: description || null,
        is_active: is_active !== undefined ? is_active : true
      };

      const newCourt = await CourtModel.create(courtData);
      res.status(201).json({ success: true, data: newCourt });
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
      const { name, type, capacity, price, description, is_active } = req.body;

      // Verificar se a quadra existe
      const existingCourt = await CourtModel.findById(parseInt(id));
      if (!existingCourt) {
        return res.status(404).json({ success: false, message: 'Quadra não encontrada' });
      }

      // Verificar se já existe outra quadra com o mesmo nome (se o nome foi alterado)
      if (name && name !== existingCourt.name) {
        const allCourts = await CourtModel.findAll();
        const nameExists = allCourts.some(court => 
          court.id !== parseInt(id) && court.name.toLowerCase() === name.toLowerCase()
        );

        if (nameExists) {
          return res.status(400).json({ 
            success: false, 
            message: 'Já existe uma quadra com este nome' 
          });
        }
      }

      const updateData: any = {};
      if (name !== undefined) updateData.name = name;
      if (type !== undefined) updateData.type = type;
      if (capacity !== undefined) updateData.capacity = parseInt(capacity);
      if (price !== undefined) updateData.price = parseFloat(price);
      if (description !== undefined) updateData.description = description;
      if (is_active !== undefined) updateData.is_active = is_active;

      const updatedCourt = await CourtModel.update(parseInt(id), updateData);
      
      if (!updatedCourt) {
        return res.status(400).json({ success: false, message: 'Nenhum campo foi atualizado' });
      }

      res.json({ success: true, data: updatedCourt });
    } catch (error) {
      console.error('Erro ao atualizar quadra:', error);
      res.status(500).json({ success: false, message: 'Erro interno do servidor' });
    }
  }

  // Deletar quadra
  static async deleteCourt(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      // Verificar se a quadra existe
      const existingCourt = await CourtModel.findById(parseInt(id));
      if (!existingCourt) {
        return res.status(404).json({ success: false, message: 'Quadra não encontrada' });
      }

      const deleted = await CourtModel.delete(parseInt(id));
      
      if (!deleted) {
        return res.status(400).json({ success: false, message: 'Erro ao deletar quadra' });
      }

      res.json({ success: true, message: 'Quadra deletada com sucesso' });
    } catch (error) {
      console.error('Erro ao deletar quadra:', error);
      res.status(500).json({ success: false, message: 'Erro interno do servidor' });
    }
  }

  // Alternar status ativo/inativo
  static async toggleCourtActive(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      // Verificar se a quadra existe
      const existingCourt = await CourtModel.findById(parseInt(id));
      if (!existingCourt) {
        return res.status(404).json({ success: false, message: 'Quadra não encontrada' });
      }

      const updatedCourt = await CourtModel.toggleActive(parseInt(id));
      
      if (!updatedCourt) {
        return res.status(400).json({ success: false, message: 'Erro ao alterar status da quadra' });
      }

      res.json({ success: true, data: updatedCourt });
    } catch (error) {
      console.error('Erro ao alterar status da quadra:', error);
      res.status(500).json({ success: false, message: 'Erro interno do servidor' });
    }
  }
}

