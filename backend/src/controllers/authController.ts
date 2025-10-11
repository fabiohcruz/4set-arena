import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import { UserModel } from '../models/User';

export const login = async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, password } = req.body;

    // Buscar usuário por username ou CPF
    let user = await UserModel.findByUsernameForAuth(username);
    if (!user) {
      // Se não encontrou por username, tenta buscar por CPF
      user = await UserModel.findByCPFForAuth(username);
    }
    
    if (!user) {
      return res.status(401).json({ message: 'Credenciais inválidas' });
    }

    // Verificar senha
    if (!user.password) {
      return res.status(401).json({ message: 'Credenciais inválidas' });
    }
    
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Credenciais inválidas' });
    }

    // Atualizar último login
    await UserModel.updateLastLogin(user.id);

    // Buscar usuário atualizado para incluir o last_login
    const updatedUser = await UserModel.findById(user.id);
    if (!updatedUser) {
      return res.status(500).json({ message: 'Erro interno do servidor' });
    }

    // Gerar token JWT
    const jwtSecret = process.env.JWT_SECRET || 'fallback-secret-key';
    const token = jwt.sign(
      { userId: updatedUser.id, username: updatedUser.username, role: updatedUser.role },
      jwtSecret,
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login realizado com sucesso',
      token,
      user: {
        id: updatedUser.id,
        username: updatedUser.username,
        email: updatedUser.email,
        full_name: updatedUser.full_name,
        phone: updatedUser.phone,
        cpf: updatedUser.cpf,
        avatar_url: updatedUser.avatar_url,
        birth_date: updatedUser.birth_date,
        gender: updatedUser.gender,
        address: updatedUser.address,
        city: updatedUser.city,
        state: updatedUser.state,
        zip_code: updatedUser.zip_code,
        role: updatedUser.role,
        preferences: updatedUser.preferences,
        last_login: updatedUser.last_login,
        created_at: updatedUser.created_at,
        updated_at: updatedUser.updated_at
      }
    });
  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

export const register = async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, password, email } = req.body;

    // Verificar se usuário já existe
    const existingUser = await UserModel.findByUsername(username);
    if (existingUser) {
      return res.status(400).json({ message: 'Nome de usuário já existe' });
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(password, 10);

    // Criar usuário
    const user = await UserModel.create({
      username,
      password: hashedPassword,
      email,
      full_name: username, // Usar username como nome inicial
      role: 'user',
      preferences: {}
    });

    res.status(201).json({
      message: 'Usuário criado com sucesso',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        full_name: user.full_name,
        phone: user.phone,
        cpf: user.cpf,
        avatar_url: user.avatar_url,
        birth_date: user.birth_date,
        gender: user.gender,
        address: user.address,
        city: user.city,
        state: user.state,
        zip_code: user.zip_code,
        role: user.role,
        preferences: user.preferences,
        last_login: user.last_login,
        created_at: user.created_at,
        updated_at: user.updated_at
      }
    });
  } catch (error) {
    console.error('Erro no registro:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

export const getProfile = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    res.json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        full_name: user.full_name,
        phone: user.phone,
        cpf: user.cpf,
        avatar_url: user.avatar_url,
        birth_date: user.birth_date,
        gender: user.gender,
        address: user.address,
        city: user.city,
        state: user.state,
        zip_code: user.zip_code,
        role: user.role,
        preferences: user.preferences,
        last_login: user.last_login,
        created_at: user.created_at,
        updated_at: user.updated_at
      }
    });
  } catch (error) {
    console.error('Erro ao buscar perfil:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};
