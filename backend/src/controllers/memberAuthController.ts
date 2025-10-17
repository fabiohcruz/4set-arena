import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../config/database';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export const memberLogin = async (req: Request, res: Response) => {
  try {
    console.log('🔐 Tentativa de login de membro:', req.body);
    const { memberCode, password } = req.body;

    if (!memberCode || !password) {
      console.log('❌ Dados incompletos');
      return res.status(400).json({ error: 'Código do membro e senha são obrigatórios' });
    }

    // Buscar membro pelo código usando query direta
    console.log('🔍 Buscando membro:', memberCode);
    const result = await pool.query(
      'SELECT * FROM members WHERE member_code = $1 AND status = $2',
      [memberCode, 'active']
    );
    console.log('📊 Membros encontrados:', result.rows.length);

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Código de membro inválido ou inativo' });
    }

    const member = result.rows[0];

    // Verificar senha
    if (!member.password) {
      return res.status(401).json({ error: 'Senha não configurada para este membro' });
    }

    const isValidPassword = await bcrypt.compare(password, member.password);
    
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Senha incorreta' });
    }

    // Gerar token JWT
    const token = jwt.sign(
      { 
        memberId: member.id, 
        memberCode: member.member_code,
        type: 'member'
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login realizado com sucesso',
      token,
      member: {
        id: member.id,
        member_code: member.member_code,
        full_name: member.full_name,
        email: member.email,
        phone: member.phone,
        membership_type: member.membership_type,
        status: member.status
      }
    });
  } catch (error) {
    console.error('Erro no login do membro:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

export const getMemberProfile = async (req: Request, res: Response) => {
  try {
    const memberId = (req as any).member?.id;

    if (!memberId) {
      return res.status(401).json({ error: 'Token de acesso necessário' });
    }

    const result = await pool.query(
      'SELECT id, member_code, full_name, email, phone, birth_date, address, city, state, zip_code, emergency_contact, emergency_phone, membership_type, status, join_date, created_at, updated_at FROM members WHERE id = $1',
      [memberId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Membro não encontrado' });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Erro ao buscar perfil do membro:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

export const updateMemberProfile = async (req: Request, res: Response) => {
  try {
    const memberId = (req as any).member?.id;
    const { full_name, email, phone, address, city, state, zip_code } = req.body;

    if (!memberId) {
      return res.status(401).json({ error: 'Token de acesso necessário' });
    }

    // Atualizar dados do membro
    await pool.query(
      `UPDATE members SET 
        full_name = COALESCE($1, full_name),
        email = COALESCE($2, email),
        phone = COALESCE($3, phone),
        address = COALESCE($4, address),
        city = COALESCE($5, city),
        state = COALESCE($6, state),
        zip_code = COALESCE($7, zip_code),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $8`,
      [full_name, email, phone, address, city, state, zip_code, memberId]
    );

    // Buscar membro atualizado
    const result = await pool.query(
      'SELECT id, member_code, full_name, email, phone, birth_date, address, city, state, zip_code, emergency_contact, emergency_phone, membership_type, status, join_date, created_at, updated_at FROM members WHERE id = $1',
      [memberId]
    );

    res.json({
      success: true,
      message: 'Perfil atualizado com sucesso',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Erro ao atualizar perfil do membro:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};
