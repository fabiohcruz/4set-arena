import pool from '../config/database';

export interface MenuItem {
  id: number;
  key: string;
  label: string;
  icon?: string;
  path?: string;
  order_index: number;
  is_enabled: boolean;
  requires_admin: boolean;
  parent_key?: string;
  created_at: Date;
  updated_at: Date;
}

export class MenuItemModel {
  // Buscar todos os itens do menu
  static async findAll(): Promise<MenuItem[]> {
    const query = 'SELECT * FROM menu_items ORDER BY order_index, label';
    const result = await pool.query(query);
    return result.rows;
  }

  // Buscar itens habilitados
  static async findEnabled(): Promise<MenuItem[]> {
    const query = 'SELECT * FROM menu_items WHERE is_enabled = true ORDER BY order_index, label';
    const result = await pool.query(query);
    return result.rows;
  }

  // Buscar itens por chave
  static async findByKey(key: string): Promise<MenuItem | null> {
    const query = 'SELECT * FROM menu_items WHERE key = $1';
    const result = await pool.query(query, [key]);
    return result.rows[0] || null;
  }

  // Buscar itens por ID
  static async findById(id: number): Promise<MenuItem | null> {
    const query = 'SELECT * FROM menu_items WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  }

  // Buscar itens que não requerem admin
  static async findPublic(): Promise<MenuItem[]> {
    const query = 'SELECT * FROM menu_items WHERE is_enabled = true AND requires_admin = false ORDER BY order_index, label';
    const result = await pool.query(query);
    return result.rows;
  }

  // Criar novo item do menu
  static async create(itemData: Omit<MenuItem, 'id' | 'created_at' | 'updated_at'>): Promise<MenuItem> {
    const query = `
      INSERT INTO menu_items (
        key, label, icon, path, order_index, is_enabled, requires_admin, parent_key
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;
    const values = [
      itemData.key,
      itemData.label,
      itemData.icon || null,
      itemData.path || null,
      itemData.order_index,
      itemData.is_enabled,
      itemData.requires_admin,
      itemData.parent_key || null
    ];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  // Atualizar item do menu
  static async update(id: number, itemData: Partial<MenuItem>): Promise<MenuItem | null> {
    const fields = [];
    const values = [];
    let paramCount = 1;

    if (itemData.key !== undefined) {
      fields.push(`key = $${paramCount++}`);
      values.push(itemData.key);
    }
    if (itemData.label !== undefined) {
      fields.push(`label = $${paramCount++}`);
      values.push(itemData.label);
    }
    if (itemData.icon !== undefined) {
      fields.push(`icon = $${paramCount++}`);
      values.push(itemData.icon);
    }
    if (itemData.path !== undefined) {
      fields.push(`path = $${paramCount++}`);
      values.push(itemData.path);
    }
    if (itemData.order_index !== undefined) {
      fields.push(`order_index = $${paramCount++}`);
      values.push(itemData.order_index);
    }
    if (itemData.is_enabled !== undefined) {
      fields.push(`is_enabled = $${paramCount++}`);
      values.push(itemData.is_enabled);
    }
    if (itemData.requires_admin !== undefined) {
      fields.push(`requires_admin = $${paramCount++}`);
      values.push(itemData.requires_admin);
    }
    if (itemData.parent_key !== undefined) {
      fields.push(`parent_key = $${paramCount++}`);
      values.push(itemData.parent_key);
    }

    if (fields.length === 0) {
      return null;
    }

    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    const query = `
      UPDATE menu_items 
      SET ${fields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;
    
    const result = await pool.query(query, values);
    return result.rows[0] || null;
  }

  // Alternar status habilitado/desabilitado
  static async toggleStatus(id: number): Promise<MenuItem | null> {
    const query = `
      UPDATE menu_items 
      SET is_enabled = NOT is_enabled,
      updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  }

  // Atualizar ordem dos itens
  static async updateOrder(items: { id: number; order_index: number }[]): Promise<boolean> {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      for (const item of items) {
        await client.query(
          'UPDATE menu_items SET order_index = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
          [item.order_index, item.id]
        );
      }
      
      await client.query('COMMIT');
      return true;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // Deletar item do menu
  static async delete(id: number): Promise<boolean> {
    const query = 'DELETE FROM menu_items WHERE id = $1';
    const result = await pool.query(query, [id]);
    return (result.rowCount || 0) > 0;
  }

  // Buscar estatísticas do menu
  static async getStats(): Promise<{
    total: number;
    enabled: number;
    disabled: number;
    admin_only: number;
    public: number;
  }> {
    const query = `
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN is_enabled = true THEN 1 END) as enabled,
        COUNT(CASE WHEN is_enabled = false THEN 1 END) as disabled,
        COUNT(CASE WHEN requires_admin = true THEN 1 END) as admin_only,
        COUNT(CASE WHEN requires_admin = false THEN 1 END) as public
      FROM menu_items
    `;
    const result = await pool.query(query);
    const stats = result.rows[0];
    
    return {
      total: parseInt(stats.total),
      enabled: parseInt(stats.enabled),
      disabled: parseInt(stats.disabled),
      admin_only: parseInt(stats.admin_only),
      public: parseInt(stats.public)
    };
  }

  // Verificar se uma chave já existe
  static async keyExists(key: string, excludeId?: number): Promise<boolean> {
    let query = 'SELECT COUNT(*) as count FROM menu_items WHERE key = $1';
    const values: any[] = [key];
    
    if (excludeId) {
      query += ' AND id != $2';
      values.push(excludeId);
    }
    
    const result = await pool.query(query, values);
    return parseInt(result.rows[0].count) > 0;
  }
}
