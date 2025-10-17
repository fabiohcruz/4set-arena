import { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import pool from '../config/database';

export class MemberController {
  // Listar todos os membros
  static async getAllMembers(req: Request, res: Response) {
    let client;
    try {
      client = await pool.connect();
      const result = await client.query('SELECT * FROM members ORDER BY full_name ASC');
      res.json({ success: true, data: result.rows });
    } catch (error) {
      console.error('Erro ao buscar membros:', error);
      res.status(500).json({ success: false, message: 'Erro interno do servidor' });
    } finally {
      if (client) client.release();
    }
  }

  // Listar membros ativos
  static async getActiveMembers(req: Request, res: Response) {
    let client;
    try {
      client = await pool.connect();
      const result = await client.query('SELECT * FROM members WHERE status = $1 ORDER BY full_name ASC', ['active']);
      res.json({ success: true, data: result.rows });
    } catch (error) {
      console.error('Erro ao buscar membros ativos:', error);
      res.status(500).json({ success: false, message: 'Erro interno do servidor' });
    } finally {
      if (client) client.release();
    }
  }

  // Buscar membro por ID
  static async getMemberById(req: Request, res: Response) {
    let client;
    try {
      const { id } = req.params;
      const memberId = parseInt(id);
      
      if (isNaN(memberId)) {
        return res.status(400).json({ 
          success: false, 
          message: 'ID do membro inválido' 
        });
      }

      client = await pool.connect();
      const result = await client.query('SELECT * FROM members WHERE id = $1', [memberId]);
      
      if (result.rows.length === 0) {
        return res.status(404).json({ success: false, message: 'Membro não encontrado' });
      }

      res.json({ success: true, data: result.rows[0] });
    } catch (error) {
      console.error('Erro ao buscar membro por ID:', error);
      res.status(500).json({ success: false, message: 'Erro interno do servidor' });
    } finally {
      if (client) client.release();
    }
  }

  // Buscar membro por código
  static async getMemberByCode(req: Request, res: Response) {
    let client;
    try {
      const { code } = req.params;

      client = await pool.connect();
      const result = await client.query('SELECT * FROM members WHERE member_code = $1', [code]);
      
      if (result.rows.length === 0) {
        return res.status(404).json({ success: false, message: 'Membro não encontrado' });
      }

      res.json({ success: true, data: result.rows[0] });
    } catch (error) {
      console.error('Erro ao buscar membro por código:', error);
      res.status(500).json({ success: false, message: 'Erro interno do servidor' });
    } finally {
      if (client) client.release();
    }
  }

  // Criar novo membro
  static async createMember(req: Request, res: Response) {
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
        member_code,
        full_name,
        email,
        phone,
        birth_date,
        address,
        emergency_contact,
        emergency_phone,
        membership_type
      } = req.body;

      client = await pool.connect();
      
      // Verificar se o código já existe
      const checkResult = await client.query('SELECT id FROM members WHERE member_code = $1', [member_code]);
      if (checkResult.rows.length > 0) {
        return res.status(400).json({ 
          success: false, 
          message: 'Código de membro já existe' 
        });
      }

      const result = await client.query(
        `INSERT INTO members (member_code, full_name, email, phone, birth_date, address, emergency_contact, emergency_phone, membership_type, status, join_date, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'active', CURRENT_DATE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
         RETURNING *`,
        [member_code, full_name, email, phone, birth_date, address, emergency_contact, emergency_phone, membership_type || 'regular']
      );

      res.status(201).json({ 
        success: true, 
        message: 'Membro criado com sucesso',
        data: result.rows[0]
      });
    } catch (error) {
      console.error('Erro ao criar membro:', error);
      res.status(500).json({ success: false, message: 'Erro interno do servidor' });
    } finally {
      if (client) client.release();
    }
  }

  // Atualizar membro
  static async updateMember(req: Request, res: Response) {
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
      const memberId = parseInt(id);
      
      if (isNaN(memberId)) {
        return res.status(400).json({ 
          success: false, 
          message: 'ID do membro inválido' 
        });
      }

      client = await pool.connect();
      
      // Verificar se o membro existe
      const checkResult = await client.query('SELECT id FROM members WHERE id = $1', [memberId]);
      if (checkResult.rows.length === 0) {
        return res.status(404).json({ success: false, message: 'Membro não encontrado' });
      }

      const {
        full_name,
        email,
        phone,
        birth_date,
        address,
        emergency_contact,
        emergency_phone,
        membership_type,
        status
      } = req.body;

      const result = await client.query(
        `UPDATE members 
         SET full_name = $1, email = $2, phone = $3, birth_date = $4, address = $5, 
             emergency_contact = $6, emergency_phone = $7, membership_type = $8, status = $9, updated_at = CURRENT_TIMESTAMP
         WHERE id = $10
         RETURNING *`,
        [full_name, email, phone, birth_date, address, emergency_contact, emergency_phone, membership_type, status, memberId]
      );

      res.json({ 
        success: true, 
        message: 'Membro atualizado com sucesso',
        data: result.rows[0]
      });
    } catch (error) {
      console.error('Erro ao atualizar membro:', error);
      res.status(500).json({ success: false, message: 'Erro interno do servidor' });
    } finally {
      if (client) client.release();
    }
  }

  // Deletar membro
  static async deleteMember(req: Request, res: Response) {
    let client;
    try {
      const { id } = req.params;
      const memberId = parseInt(id);
      
      if (isNaN(memberId)) {
        return res.status(400).json({ 
          success: false, 
          message: 'ID do membro inválido' 
        });
      }

      client = await pool.connect();
      
      // Verificar se o membro existe
      const checkResult = await client.query('SELECT id FROM members WHERE id = $1', [memberId]);
      if (checkResult.rows.length === 0) {
        return res.status(404).json({ success: false, message: 'Membro não encontrado' });
      }

      await client.query('DELETE FROM members WHERE id = $1', [memberId]);

      res.json({ 
        success: true, 
        message: 'Membro deletado com sucesso'
      });
    } catch (error) {
      console.error('Erro ao deletar membro:', error);
      res.status(500).json({ success: false, message: 'Erro interno do servidor' });
    } finally {
      if (client) client.release();
    }
  }

  // Alternar status do membro
  static async toggleMemberStatus(req: Request, res: Response) {
    let client;
    try {
      const { id } = req.params;
      const memberId = parseInt(id);
      
      if (isNaN(memberId)) {
        return res.status(400).json({ 
          success: false, 
          message: 'ID do membro inválido' 
        });
      }

      client = await pool.connect();
      
      // Buscar status atual
      const currentResult = await client.query('SELECT status FROM members WHERE id = $1', [memberId]);
      if (currentResult.rows.length === 0) {
        return res.status(404).json({ success: false, message: 'Membro não encontrado' });
      }

      const currentStatus = currentResult.rows[0].status;
      const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
      
      // Alternar status
      const result = await client.query(
        `UPDATE members SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *`,
        [newStatus, memberId]
      );

      res.json({ 
        success: true, 
        message: `Membro ${result.rows[0].status === 'active' ? 'ativado' : 'desativado'} com sucesso`,
        data: result.rows[0]
      });
    } catch (error) {
      console.error('Erro ao alternar status do membro:', error);
      res.status(500).json({ success: false, message: 'Erro interno do servidor' });
    } finally {
      if (client) client.release();
    }
  }

  // Validadores
  static validateMember() {
    return [
      body('member_code')
        .trim()
        .notEmpty()
        .withMessage('Código do membro é obrigatório')
        .isLength({ min: 3, max: 20 })
        .withMessage('Código deve ter entre 3 e 20 caracteres'),
      body('full_name')
        .trim()
        .notEmpty()
        .withMessage('Nome completo é obrigatório')
        .isLength({ min: 3, max: 100 })
        .withMessage('Nome deve ter entre 3 e 100 caracteres'),
      body('email')
        .optional()
        .trim()
        .isEmail()
        .withMessage('Email inválido'),
      body('phone')
        .optional()
        .trim()
        .isLength({ max: 20 })
        .withMessage('Telefone deve ter no máximo 20 caracteres'),
      body('membership_type')
        .optional()
        .isIn(['regular', 'premium', 'vip'])
        .withMessage('Tipo de membro inválido')
    ];
  }
}
