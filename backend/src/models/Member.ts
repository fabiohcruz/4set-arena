import pool from '../config/database';

export interface Member {
  id: number;
  member_code: string;
  full_name: string;
  email?: string;
  phone?: string;
  birth_date?: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  emergency_contact?: string;
  emergency_phone?: string;
  membership_type: 'regular' | 'premium' | 'vip';
  status: 'active' | 'inactive' | 'suspended';
  join_date: string;
  created_at: Date;
  updated_at: Date;
}

export class MemberModel {
  // Buscar todos os membros
  static async findAll(): Promise<Member[]> {
    const query = 'SELECT * FROM members ORDER BY full_name';
    const result = await pool.query(query);
    return result.rows;
  }

  // Buscar membros ativos
  static async findActive(): Promise<Member[]> {
    const query = 'SELECT * FROM members WHERE status = $1 ORDER BY full_name';
    const result = await pool.query(query, ['active']);
    return result.rows;
  }

  // Buscar membro por ID
  static async findById(id: number): Promise<Member | null> {
    const query = 'SELECT * FROM members WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  }

  // Buscar membro por código
  static async findByCode(memberCode: string): Promise<Member | null> {
    const query = 'SELECT * FROM members WHERE member_code = $1';
    const result = await pool.query(query, [memberCode]);
    return result.rows[0] || null;
  }

  // Buscar membro por email
  static async findByEmail(email: string): Promise<Member | null> {
    const query = 'SELECT * FROM members WHERE email = $1';
    const result = await pool.query(query, [email]);
    return result.rows[0] || null;
  }

  // Gerar código único para membro
  static async generateMemberCode(): Promise<string> {
    const query = 'SELECT COUNT(*) as count FROM members';
    const result = await pool.query(query);
    const count = parseInt(result.rows[0].count) + 1;
    return `MEM${count.toString().padStart(4, '0')}`;
  }

  // Criar novo membro
  static async create(memberData: Omit<Member, 'id' | 'member_code' | 'created_at' | 'updated_at'>): Promise<Member> {
    const memberCode = await this.generateMemberCode();
    
    const query = `
      INSERT INTO members (
        member_code, full_name, email, phone, birth_date, address, city, state, zip_code,
        emergency_contact, emergency_phone, membership_type, status, join_date
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      RETURNING *
    `;
    const values = [
      memberCode,
      memberData.full_name,
      memberData.email || null,
      memberData.phone || null,
      memberData.birth_date || null,
      memberData.address || null,
      memberData.city || null,
      memberData.state || null,
      memberData.zip_code || null,
      memberData.emergency_contact || null,
      memberData.emergency_phone || null,
      memberData.membership_type,
      memberData.status,
      memberData.join_date
    ];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  // Atualizar membro
  static async update(id: number, memberData: Partial<Member>): Promise<Member | null> {
    const fields = [];
    const values = [];
    let paramCount = 1;

    if (memberData.full_name !== undefined) {
      fields.push(`full_name = $${paramCount++}`);
      values.push(memberData.full_name);
    }
    if (memberData.email !== undefined) {
      fields.push(`email = $${paramCount++}`);
      values.push(memberData.email);
    }
    if (memberData.phone !== undefined) {
      fields.push(`phone = $${paramCount++}`);
      values.push(memberData.phone);
    }
    if (memberData.birth_date !== undefined) {
      fields.push(`birth_date = $${paramCount++}`);
      values.push(memberData.birth_date);
    }
    if (memberData.address !== undefined) {
      fields.push(`address = $${paramCount++}`);
      values.push(memberData.address);
    }
    if (memberData.city !== undefined) {
      fields.push(`city = $${paramCount++}`);
      values.push(memberData.city);
    }
    if (memberData.state !== undefined) {
      fields.push(`state = $${paramCount++}`);
      values.push(memberData.state);
    }
    if (memberData.zip_code !== undefined) {
      fields.push(`zip_code = $${paramCount++}`);
      values.push(memberData.zip_code);
    }
    if (memberData.emergency_contact !== undefined) {
      fields.push(`emergency_contact = $${paramCount++}`);
      values.push(memberData.emergency_contact);
    }
    if (memberData.emergency_phone !== undefined) {
      fields.push(`emergency_phone = $${paramCount++}`);
      values.push(memberData.emergency_phone);
    }
    if (memberData.membership_type !== undefined) {
      fields.push(`membership_type = $${paramCount++}`);
      values.push(memberData.membership_type);
    }
    if (memberData.status !== undefined) {
      fields.push(`status = $${paramCount++}`);
      values.push(memberData.status);
    }

    if (fields.length === 0) {
      return null;
    }

    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    const query = `
      UPDATE members 
      SET ${fields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;
    
    const result = await pool.query(query, values);
    return result.rows[0] || null;
  }

  // Deletar membro
  static async delete(id: number): Promise<boolean> {
    const query = 'DELETE FROM members WHERE id = $1';
    const result = await pool.query(query, [id]);
    return (result.rowCount || 0) > 0;
  }

  // Alternar status ativo/inativo
  static async toggleStatus(id: number): Promise<Member | null> {
    const query = `
      UPDATE members 
      SET status = CASE 
        WHEN status = 'active' THEN 'inactive'
        ELSE 'active'
      END,
      updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  }

  // Buscar estatísticas de membros
  static async getStats(): Promise<{
    total: number;
    active: number;
    inactive: number;
    suspended: number;
    regular: number;
    premium: number;
    vip: number;
  }> {
    const query = `
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN status = 'active' THEN 1 END) as active,
        COUNT(CASE WHEN status = 'inactive' THEN 1 END) as inactive,
        COUNT(CASE WHEN status = 'suspended' THEN 1 END) as suspended,
        COUNT(CASE WHEN membership_type = 'regular' THEN 1 END) as regular,
        COUNT(CASE WHEN membership_type = 'premium' THEN 1 END) as premium,
        COUNT(CASE WHEN membership_type = 'vip' THEN 1 END) as vip
      FROM members
    `;
    const result = await pool.query(query);
    const stats = result.rows[0];
    
    return {
      total: parseInt(stats.total),
      active: parseInt(stats.active),
      inactive: parseInt(stats.inactive),
      suspended: parseInt(stats.suspended),
      regular: parseInt(stats.regular),
      premium: parseInt(stats.premium),
      vip: parseInt(stats.vip)
    };
  }
}

