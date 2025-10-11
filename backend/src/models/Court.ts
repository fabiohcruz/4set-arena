import pool from '../config/database';

export interface Court {
  id: number;
  name: string;
  type: 'Quadra' | 'Campo' | 'Piscina' | 'Academia';
  capacity: number;
  price: number;
  description?: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export class CourtModel {
  // Buscar todas as quadras
  static async findAll(): Promise<Court[]> {
    const query = 'SELECT * FROM courts ORDER BY name';
    const result = await pool.query(query);
    return result.rows;
  }

  // Buscar quadras ativas
  static async findActive(): Promise<Court[]> {
    const query = 'SELECT * FROM courts WHERE is_active = true ORDER BY name';
    const result = await pool.query(query);
    return result.rows;
  }

  // Buscar quadra por ID
  static async findById(id: number): Promise<Court | null> {
    const query = 'SELECT * FROM courts WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  }

  // Criar nova quadra
  static async create(courtData: Omit<Court, 'id' | 'created_at' | 'updated_at'>): Promise<Court> {
    const query = `
      INSERT INTO courts (name, type, capacity, price, description, is_active)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
    const values = [
      courtData.name,
      courtData.type,
      courtData.capacity,
      courtData.price,
      courtData.description || null,
      courtData.is_active
    ];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  // Atualizar quadra
  static async update(id: number, courtData: Partial<Court>): Promise<Court | null> {
    const fields = [];
    const values = [];
    let paramCount = 1;

    if (courtData.name !== undefined) {
      fields.push(`name = $${paramCount++}`);
      values.push(courtData.name);
    }
    if (courtData.type !== undefined) {
      fields.push(`type = $${paramCount++}`);
      values.push(courtData.type);
    }
    if (courtData.capacity !== undefined) {
      fields.push(`capacity = $${paramCount++}`);
      values.push(courtData.capacity);
    }
    if (courtData.price !== undefined) {
      fields.push(`price = $${paramCount++}`);
      values.push(courtData.price);
    }
    if (courtData.description !== undefined) {
      fields.push(`description = $${paramCount++}`);
      values.push(courtData.description);
    }
    if (courtData.is_active !== undefined) {
      fields.push(`is_active = $${paramCount++}`);
      values.push(courtData.is_active);
    }

    if (fields.length === 0) {
      return null;
    }

    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    const query = `
      UPDATE courts 
      SET ${fields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;
    
    const result = await pool.query(query, values);
    return result.rows[0] || null;
  }

  // Deletar quadra
  static async delete(id: number): Promise<boolean> {
    const query = 'DELETE FROM courts WHERE id = $1';
    const result = await pool.query(query, [id]);
    return (result.rowCount || 0) > 0;
  }

  // Alternar status ativo/inativo
  static async toggleActive(id: number): Promise<Court | null> {
    const query = `
      UPDATE courts 
      SET is_active = NOT is_active, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  }
}

