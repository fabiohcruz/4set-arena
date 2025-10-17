import { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import pool from '../config/database';

export class CourtController {
  // Listar todas as quadras
  static async getAllCourts(req: Request, res: Response) {
    let client;
    try {
      client = await pool.connect();
      const result = await client.query('SELECT * FROM courts ORDER BY name ASC');
      res.json({ success: true, data: result.rows });
    } catch (error) {
      console.error('Erro ao buscar quadras:', error);
      res.status(500).json({ success: false, message: 'Erro interno do servidor' });
    } finally {
      if (client) client.release();
    }
  }

  // Listar quadras ativas
  static async getActiveCourts(req: Request, res: Response) {
    let client;
    try {
      client = await pool.connect();
      const result = await client.query('SELECT * FROM courts WHERE is_active = true ORDER BY name ASC');
      res.json({ success: true, data: result.rows });
    } catch (error) {
      console.error('Erro ao buscar quadras ativas:', error);
      res.status(500).json({ success: false, message: 'Erro interno do servidor' });
    } finally {
      if (client) client.release();
    }
  }

  // Buscar quadra por ID
  static async getCourtById(req: Request, res: Response) {
    let client;
    try {
      const { id } = req.params;
      const courtId = parseInt(id);
      
      if (isNaN(courtId)) {
        return res.status(400).json({ 
          success: false, 
          message: 'ID da quadra inválido' 
        });
      }

      client = await pool.connect();
      const result = await client.query('SELECT * FROM courts WHERE id = $1', [courtId]);
      
      if (result.rows.length === 0) {
        return res.status(404).json({ success: false, message: 'Quadra não encontrada' });
      }

      res.json({ success: true, data: result.rows[0] });
    } catch (error) {
      console.error('Erro ao buscar quadra por ID:', error);
      res.status(500).json({ success: false, message: 'Erro interno do servidor' });
    } finally {
      if (client) client.release();
    }
  }

  // Criar nova quadra
  static async createCourt(req: Request, res: Response) {
    let client;
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
        hourly_rate,
        description
      } = req.body;

      client = await pool.connect();
      const result = await client.query(
        `INSERT INTO courts (name, type, capacity, hourly_rate, description, is_active, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
         RETURNING *`,
        [name, type, capacity, hourly_rate, description || null]
      );

      res.status(201).json({ 
        success: true, 
        message: 'Quadra criada com sucesso',
        data: result.rows[0]
      });
    } catch (error) {
      console.error('Erro ao criar quadra:', error);
      res.status(500).json({ success: false, message: 'Erro interno do servidor' });
    } finally {
      if (client) client.release();
    }
  }

  // Atualizar quadra
  static async updateCourt(req: Request, res: Response) {
    let client;
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

      client = await pool.connect();
      
      // Verificar se a quadra existe
      const checkResult = await client.query('SELECT id FROM courts WHERE id = $1', [courtId]);
      if (checkResult.rows.length === 0) {
        return res.status(404).json({ success: false, message: 'Quadra não encontrada' });
      }

      const {
        name,
        type,
        capacity,
        hourly_rate,
        description,
        is_active
      } = req.body;

      const result = await client.query(
        `UPDATE courts 
         SET name = $1, type = $2, capacity = $3, hourly_rate = $4, description = $5, is_active = $6, updated_at = CURRENT_TIMESTAMP
         WHERE id = $7
         RETURNING *`,
        [name, type, capacity, hourly_rate, description, is_active, courtId]
      );

      res.json({ 
        success: true, 
        message: 'Quadra atualizada com sucesso',
        data: result.rows[0]
      });
    } catch (error) {
      console.error('Erro ao atualizar quadra:', error);
      res.status(500).json({ success: false, message: 'Erro interno do servidor' });
    } finally {
      if (client) client.release();
    }
  }

  // Deletar quadra
  static async deleteCourt(req: Request, res: Response) {
    let client;
    try {
      const { id } = req.params;
      const courtId = parseInt(id);
      
      if (isNaN(courtId)) {
        return res.status(400).json({ 
          success: false, 
          message: 'ID da quadra inválido' 
        });
      }

      client = await pool.connect();
      
      // Verificar se a quadra existe
      const checkResult = await client.query('SELECT id FROM courts WHERE id = $1', [courtId]);
      if (checkResult.rows.length === 0) {
        return res.status(404).json({ success: false, message: 'Quadra não encontrada' });
      }

      await client.query('DELETE FROM courts WHERE id = $1', [courtId]);

      res.json({ 
        success: true, 
        message: 'Quadra deletada com sucesso'
      });
    } catch (error) {
      console.error('Erro ao deletar quadra:', error);
      res.status(500).json({ success: false, message: 'Erro interno do servidor' });
    } finally {
      if (client) client.release();
    }
  }

  // Alternar status da quadra
  static async toggleCourtStatus(req: Request, res: Response) {
    let client;
    try {
      const { id } = req.params;
      const courtId = parseInt(id);
      
      if (isNaN(courtId)) {
        return res.status(400).json({ 
          success: false, 
          message: 'ID da quadra inválido' 
        });
      }

      client = await pool.connect();
      
      // Buscar status atual
      const currentResult = await client.query('SELECT is_active FROM courts WHERE id = $1', [courtId]);
      if (currentResult.rows.length === 0) {
        return res.status(404).json({ success: false, message: 'Quadra não encontrada' });
      }

      const currentStatus = currentResult.rows[0].is_active;
      
      // Alternar status
      const result = await client.query(
        `UPDATE courts SET is_active = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *`,
        [!currentStatus, courtId]
      );

      res.json({ 
        success: true, 
        message: `Quadra ${result.rows[0].is_active ? 'ativada' : 'desativada'} com sucesso`,
        data: result.rows[0]
      });
    } catch (error) {
      console.error('Erro ao alternar status da quadra:', error);
      res.status(500).json({ success: false, message: 'Erro interno do servidor' });
    } finally {
      if (client) client.release();
    }
  }

  // Validadores
  static validateCourt() {
    return [
      body('name')
        .trim()
        .notEmpty()
        .withMessage('Nome da quadra é obrigatório')
        .isLength({ min: 3, max: 100 })
        .withMessage('Nome deve ter entre 3 e 100 caracteres'),
      body('type')
        .optional()
        .trim()
        .isLength({ max: 50 })
        .withMessage('Tipo deve ter no máximo 50 caracteres'),
      body('capacity')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Capacidade deve ser um número inteiro positivo'),
      body('hourly_rate')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('Taxa horária deve ser um número positivo'),
      body('description')
        .optional()
        .trim()
        .isLength({ max: 500 })
        .withMessage('Descrição deve ter no máximo 500 caracteres')
    ];
  }
}
