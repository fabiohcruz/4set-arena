import pool from '../config/database';
import { QueryResult } from 'pg';
import bcrypt from 'bcrypt';

export interface User {
  id: number;
  username: string;
  email?: string;
  full_name?: string;
  phone?: string;
  password?: string; // Adicionado para autenticação
  role: 'admin' | 'user' | 'manager';
  status: 'active' | 'inactive' | 'suspended';
  last_login?: string;
  created_at: Date;
  updated_at: Date;
  avatar_url?: string;
  preferences?: any;
  birth_date?: string;
  gender?: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  emergency_contact?: string;
  emergency_phone?: string;
  bio?: string;
  cpf?: string;
}

export interface CreateUserData {
  username: string;
  email?: string;
  full_name?: string;
  phone?: string;
  password: string;
  role?: 'admin' | 'user' | 'manager';
  status?: 'active' | 'inactive' | 'suspended';
  preferences?: any; // Adicionado para compatibilidade
  birth_date?: string;
  gender?: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  emergency_contact?: string;
  emergency_phone?: string;
  bio?: string;
  cpf?: string;
}

export interface UpdateUserData {
  username?: string; // Adicionado para permitir alteração de username
  email?: string;
  full_name?: string;
  phone?: string;
  role?: 'admin' | 'user' | 'manager';
  status?: 'active' | 'inactive' | 'suspended';
  preferences?: any; // Adicionado para compatibilidade
  birth_date?: string;
  gender?: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  emergency_contact?: string;
  emergency_phone?: string;
  bio?: string;
  cpf?: string;
}

export class UserModel {
  static async create(userData: CreateUserData): Promise<User> {
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    
    const query = `
      INSERT INTO users (
        username, email, full_name, phone, password, role, status,
        birth_date, gender, address, city, state, zip_code,
        emergency_contact, emergency_phone, bio, cpf
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
      RETURNING id, username, email, full_name, phone, role, status, 
                last_login, created_at, updated_at, avatar_url, preferences,
                birth_date, gender, address, city, state, zip_code,
                emergency_contact, emergency_phone, bio, cpf
    `;
    
    const values = [
      userData.username,
      userData.email,
      userData.full_name,
      userData.phone,
      hashedPassword,
      userData.role || 'user',
      userData.status || 'active',
      userData.birth_date,
      userData.gender,
      userData.address,
      userData.city,
      userData.state,
      userData.zip_code,
      userData.emergency_contact,
      userData.emergency_phone,
      userData.bio,
      userData.cpf
    ];

    const result: QueryResult<User> = await pool.query(query, values);
    return result.rows[0];
  }

  static async findAll(): Promise<User[]> {
    const query = `
      SELECT id, username, email, full_name, phone, role, status, 
             last_login, created_at, updated_at, avatar_url, preferences,
             birth_date, gender, address, city, state, zip_code,
             emergency_contact, emergency_phone, bio, cpf
      FROM users 
      ORDER BY full_name ASC, username ASC
    `;
    const result: QueryResult<User> = await pool.query(query);
    return result.rows;
  }

  static async findById(id: number): Promise<User | null> {
    const query = `
      SELECT id, username, email, full_name, phone, role, status, 
             last_login, created_at, updated_at, avatar_url, preferences,
             birth_date, gender, address, city, state, zip_code,
             emergency_contact, emergency_phone, bio, cpf
      FROM users 
      WHERE id = $1
    `;
    const result: QueryResult<User> = await pool.query(query, [id]);
    return result.rows[0] || null;
  }

  static async findByUsername(username: string): Promise<User | null> {
    const query = `
      SELECT id, username, email, full_name, phone, role, status, 
             last_login, created_at, updated_at, avatar_url, preferences,
             birth_date, gender, address, city, state, zip_code,
             emergency_contact, emergency_phone, bio, cpf
      FROM users 
      WHERE username = $1
    `;
    const result: QueryResult<User> = await pool.query(query, [username]);
    return result.rows[0] || null;
  }

  static async findByEmail(email: string): Promise<User | null> {
    const query = `
      SELECT id, username, email, full_name, phone, role, status, 
             last_login, created_at, updated_at, avatar_url, preferences,
             birth_date, gender, address, city, state, zip_code,
             emergency_contact, emergency_phone, bio, cpf
      FROM users 
      WHERE email = $1
    `;
    const result: QueryResult<User> = await pool.query(query, [email]);
    return result.rows[0] || null;
  }

  static async findByCPF(cpf: string): Promise<User | null> {
    const query = `
      SELECT id, username, email, full_name, phone, role, status, 
             last_login, created_at, updated_at, avatar_url, preferences,
             birth_date, gender, address, city, state, zip_code,
             emergency_contact, emergency_phone, bio, cpf
      FROM users 
      WHERE cpf = $1
    `;
    const result: QueryResult<User> = await pool.query(query, [cpf]);
    return result.rows[0] || null;
  }

  // Método específico para autenticação que inclui a senha
  static async findByUsernameForAuth(username: string): Promise<User | null> {
    const query = `
      SELECT id, username, email, full_name, phone, password, role, status, 
             last_login, created_at, updated_at, avatar_url, preferences,
             birth_date, gender, address, city, state, zip_code,
             emergency_contact, emergency_phone, bio, cpf
      FROM users 
      WHERE username = $1
    `;
    const result: QueryResult<User> = await pool.query(query, [username]);
    return result.rows[0] || null;
  }

  static async findByCPFForAuth(cpf: string): Promise<User | null> {
    const query = `
      SELECT id, username, email, full_name, phone, password, role, status, 
             last_login, created_at, updated_at, avatar_url, preferences,
             birth_date, gender, address, city, state, zip_code,
             emergency_contact, emergency_phone, bio, cpf
      FROM users 
      WHERE cpf = $1
    `;
    const result: QueryResult<User> = await pool.query(query, [cpf]);
    return result.rows[0] || null;
  }

  static async update(id: number, userData: UpdateUserData): Promise<User | null> {
    const fields = [];
    const values = [];
    let paramCount = 1;

    // Construir query dinamicamente baseado nos campos fornecidos
    Object.entries(userData).forEach(([key, value]) => {
      if (value !== undefined) {
        fields.push(`${key} = $${paramCount}`);
        values.push(value);
        paramCount++;
      }
    });

    if (fields.length === 0) {
      return this.findById(id);
    }

    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    const query = `
      UPDATE users 
      SET ${fields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING id, username, email, full_name, phone, role, status, 
                last_login, created_at, updated_at, avatar_url, preferences,
                birth_date, gender, address, city, state, zip_code,
                emergency_contact, emergency_phone, bio, cpf
    `;

    const result: QueryResult<User> = await pool.query(query, values);
    return result.rows[0] || null;
  }

  static async updatePassword(id: number, newPassword: string): Promise<boolean> {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    const query = `
      UPDATE users 
      SET password = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
    `;
    
    const result = await pool.query(query, [hashedPassword, id]);
    return (result.rowCount || 0) > 0;
  }

  static async delete(id: number): Promise<boolean> {
    const query = 'DELETE FROM users WHERE id = $1';
    const result = await pool.query(query, [id]);
    return (result.rowCount || 0) > 0;
  }

  static async toggleStatus(id: number): Promise<User | null> {
    const query = `
      UPDATE users 
      SET status = CASE 
        WHEN status = 'active' THEN 'inactive'
        ELSE 'active'
      END,
      updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING id, username, email, full_name, phone, role, status, 
                last_login, created_at, updated_at, avatar_url, preferences,
                birth_date, gender, address, city, state, zip_code,
                emergency_contact, emergency_phone, bio, cpf
    `;
    
    const result: QueryResult<User> = await pool.query(query, [id]);
    return result.rows[0] || null;
  }

  static async getStats(): Promise<{ total: number; active: number; inactive: number; suspended: number; byRole: { [key: string]: number } }> {
    const query = `
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN status = 'active' THEN 1 END) as active,
        COUNT(CASE WHEN status = 'inactive' THEN 1 END) as inactive,
        COUNT(CASE WHEN status = 'suspended' THEN 1 END) as suspended,
        COUNT(CASE WHEN role = 'admin' THEN 1 END) as admin_count,
        COUNT(CASE WHEN role = 'manager' THEN 1 END) as manager_count,
        COUNT(CASE WHEN role = 'user' THEN 1 END) as user_count
      FROM users
    `;
    
    const result = await pool.query(query);
    const stats = result.rows[0];
    
    return {
      total: parseInt(stats.total),
      active: parseInt(stats.active),
      inactive: parseInt(stats.inactive),
      suspended: parseInt(stats.suspended),
      byRole: {
        admin: parseInt(stats.admin_count),
        manager: parseInt(stats.manager_count),
        user: parseInt(stats.user_count)
      }
    };
  }

  static async usernameExists(username: string, excludeId?: number): Promise<boolean> {
    let query = 'SELECT COUNT(*) FROM users WHERE username = $1';
    const values: any[] = [username];
    
    if (excludeId) {
      query += ' AND id != $2';
      values.push(excludeId);
    }
    
    const result = await pool.query(query, values);
    return parseInt(result.rows[0].count) > 0;
  }

  static async emailExists(email: string, excludeId?: number): Promise<boolean> {
    let query = 'SELECT COUNT(*) FROM users WHERE email = $1';
    const values: any[] = [email];
    
    if (excludeId) {
      query += ' AND id != $2';
      values.push(excludeId);
    }
    
    const result = await pool.query(query, values);
    return parseInt(result.rows[0].count) > 0;
  }

  static async updateLastLogin(id: number): Promise<void> {
    const query = 'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1';
    await pool.query(query, [id]);
  }

  // Método para atualizar perfil (alias para update)
  static async updateProfile(id: number, userData: UpdateUserData): Promise<User | null> {
    return this.update(id, userData);
  }

  // Método para alterar senha (alias para updatePassword)
  static async changePassword(id: number, newPassword: string): Promise<boolean> {
    return this.updatePassword(id, newPassword);
  }

  // Método para atualizar preferências
  static async updatePreferences(id: number, preferences: any): Promise<User | null> {
    return this.update(id, { preferences });
  }
}