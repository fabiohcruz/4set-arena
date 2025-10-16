import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { Member } from '../models/Member';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export const authenticateMember = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Token de acesso necessário' });
    }

    const token = authHeader.substring(7);
    
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    
    if (decoded.type !== 'member') {
      return res.status(401).json({ error: 'Token inválido para membro' });
    }

    // Verificar se o membro ainda existe e está ativo
    const member = await Member.findByPk(decoded.memberId);
    
    if (!member || member.status !== 'active') {
      return res.status(401).json({ error: 'Membro não encontrado ou inativo' });
    }

    // Adicionar informações do membro ao request
    (req as any).member = {
      id: member.id,
      memberCode: member.member_code,
      fullName: member.full_name,
      membershipType: member.membership_type
    };

    next();
  } catch (error) {
    console.error('Erro na autenticação do membro:', error);
    return res.status(401).json({ error: 'Token inválido' });
  }
};
