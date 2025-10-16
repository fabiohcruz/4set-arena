import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Member } from '../models/Member';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export const memberLogin = async (req: Request, res: Response) => {
  try {
    const { memberCode, password } = req.body;

    if (!memberCode || !password) {
      return res.status(400).json({ error: 'Código do membro e senha são obrigatórios' });
    }

    // Buscar membro pelo código
    const member = await Member.findOne({
      where: { member_code: memberCode, status: 'active' }
    });

    if (!member) {
      return res.status(401).json({ error: 'Código de membro inválido ou inativo' });
    }

    // Verificar senha (assumindo que temos um campo password no modelo Member)
    // Se não tiver, podemos usar uma senha padrão ou criar um sistema de senhas
    const isValidPassword = await bcrypt.compare(password, member.password || '');
    
    // Para desenvolvimento, vamos aceitar senha padrão 'membro123'
    if (!isValidPassword && password !== 'membro123') {
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

    const member = await Member.findByPk(memberId, {
      attributes: { exclude: ['password'] }
    });

    if (!member) {
      return res.status(404).json({ error: 'Membro não encontrado' });
    }

    res.json({
      success: true,
      data: member
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

    const member = await Member.findByPk(memberId);

    if (!member) {
      return res.status(404).json({ error: 'Membro não encontrado' });
    }

    // Atualizar dados do membro
    await member.update({
      full_name: full_name || member.full_name,
      email: email || member.email,
      phone: phone || member.phone,
      address: address || member.address,
      city: city || member.city,
      state: state || member.state,
      zip_code: zip_code || member.zip_code,
      updated_at: new Date()
    });

    res.json({
      success: true,
      message: 'Perfil atualizado com sucesso',
      data: member
    });
  } catch (error) {
    console.error('Erro ao atualizar perfil do membro:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};
