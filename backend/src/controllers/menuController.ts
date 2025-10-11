import { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { MenuItemModel } from '../models/MenuItem';

export class MenuController {
  // Listar todos os itens do menu (apenas para admins)
  static async getAllMenuItems(req: Request, res: Response) {
    try {
      const items = await MenuItemModel.findAll();
      res.json({ success: true, data: items });
    } catch (error) {
      console.error('Erro ao buscar itens do menu:', error);
      res.status(500).json({ success: false, message: 'Erro interno do servidor' });
    }
  }

  // Listar itens habilitados (público)
  static async getEnabledMenuItems(req: Request, res: Response) {
    try {
      const items = await MenuItemModel.findEnabled();
      res.json({ success: true, data: items });
    } catch (error) {
      console.error('Erro ao buscar itens habilitados do menu:', error);
      res.status(500).json({ success: false, message: 'Erro interno do servidor' });
    }
  }

  // Listar itens públicos (não requerem admin)
  static async getPublicMenuItems(req: Request, res: Response) {
    try {
      const items = await MenuItemModel.findPublic();
      res.json({ success: true, data: items });
    } catch (error) {
      console.error('Erro ao buscar itens públicos do menu:', error);
      res.status(500).json({ success: false, message: 'Erro interno do servidor' });
    }
  }

  // Buscar item por ID
  static async getMenuItemById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const itemId = parseInt(id);
      
      if (isNaN(itemId)) {
        return res.status(400).json({ 
          success: false, 
          message: 'ID do item inválido' 
        });
      }

      const item = await MenuItemModel.findById(itemId);
      
      if (!item) {
        return res.status(404).json({ success: false, message: 'Item não encontrado' });
      }
      
      res.json({ success: true, data: item });
    } catch (error) {
      console.error('Erro ao buscar item do menu:', error);
      res.status(500).json({ success: false, message: 'Erro interno do servidor' });
    }
  }

  // Buscar item por chave
  static async getMenuItemByKey(req: Request, res: Response) {
    try {
      const { key } = req.params;
      
      const item = await MenuItemModel.findByKey(key);
      
      if (!item) {
        return res.status(404).json({ success: false, message: 'Item não encontrado' });
      }
      
      res.json({ success: true, data: item });
    } catch (error) {
      console.error('Erro ao buscar item por chave:', error);
      res.status(500).json({ success: false, message: 'Erro interno do servidor' });
    }
  }

  // Criar novo item do menu
  static async createMenuItem(req: Request, res: Response) {
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
        key,
        label,
        icon,
        path,
        order_index,
        is_enabled,
        requires_admin,
        parent_key
      } = req.body;

      // Verificar se a chave já existe
      const keyExists = await MenuItemModel.keyExists(key);
      if (keyExists) {
        return res.status(400).json({ 
          success: false, 
          message: 'Já existe um item com esta chave' 
        });
      }

      const itemData = {
        key,
        label,
        icon: icon || null,
        path: path || null,
        order_index: order_index || 0,
        is_enabled: is_enabled !== undefined ? is_enabled : true,
        requires_admin: requires_admin !== undefined ? requires_admin : false,
        parent_key: parent_key || null
      };

      const newItem = await MenuItemModel.create(itemData);
      res.status(201).json({ success: true, data: newItem });
    } catch (error) {
      console.error('Erro ao criar item do menu:', error);
      res.status(500).json({ success: false, message: 'Erro interno do servidor' });
    }
  }

  // Atualizar item do menu
  static async updateMenuItem(req: Request, res: Response) {
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
      const itemId = parseInt(id);
      
      if (isNaN(itemId)) {
        return res.status(400).json({ 
          success: false, 
          message: 'ID do item inválido' 
        });
      }

      // Verificar se o item existe
      const existingItem = await MenuItemModel.findById(itemId);
      if (!existingItem) {
        return res.status(404).json({ success: false, message: 'Item não encontrado' });
      }

      const {
        key,
        label,
        icon,
        path,
        order_index,
        is_enabled,
        requires_admin,
        parent_key
      } = req.body;

      // Verificar se a chave já existe (se foi alterada)
      if (key && key !== existingItem.key) {
        const keyExists = await MenuItemModel.keyExists(key, itemId);
        if (keyExists) {
          return res.status(400).json({ 
            success: false, 
            message: 'Já existe outro item com esta chave' 
          });
        }
      }

      const updateData: any = {};
      if (key !== undefined) updateData.key = key;
      if (label !== undefined) updateData.label = label;
      if (icon !== undefined) updateData.icon = icon;
      if (path !== undefined) updateData.path = path;
      if (order_index !== undefined) updateData.order_index = order_index;
      if (is_enabled !== undefined) updateData.is_enabled = is_enabled;
      if (requires_admin !== undefined) updateData.requires_admin = requires_admin;
      if (parent_key !== undefined) updateData.parent_key = parent_key;

      const updatedItem = await MenuItemModel.update(itemId, updateData);
      
      if (!updatedItem) {
        return res.status(400).json({ success: false, message: 'Nenhum campo foi atualizado' });
      }

      res.json({ success: true, data: updatedItem });
    } catch (error) {
      console.error('Erro ao atualizar item do menu:', error);
      res.status(500).json({ success: false, message: 'Erro interno do servidor' });
    }
  }

  // Alternar status do item
  static async toggleMenuItemStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const itemId = parseInt(id);
      
      if (isNaN(itemId)) {
        return res.status(400).json({ 
          success: false, 
          message: 'ID do item inválido' 
        });
      }

      // Verificar se o item existe
      const existingItem = await MenuItemModel.findById(itemId);
      if (!existingItem) {
        return res.status(404).json({ success: false, message: 'Item não encontrado' });
      }

      const updatedItem = await MenuItemModel.toggleStatus(itemId);
      
      if (!updatedItem) {
        return res.status(400).json({ 
          success: false, 
          message: 'Erro ao alterar status do item' 
        });
      }

      res.json({ success: true, data: updatedItem });
    } catch (error) {
      console.error('Erro ao alterar status do item:', error);
      res.status(500).json({ success: false, message: 'Erro interno do servidor' });
    }
  }

  // Atualizar ordem dos itens
  static async updateMenuOrder(req: Request, res: Response) {
    try {
      const { items } = req.body;
      
      if (!Array.isArray(items)) {
        return res.status(400).json({ 
          success: false, 
          message: 'Lista de itens inválida' 
        });
      }

      // Validar estrutura dos itens
      for (const item of items) {
        if (!item.id || typeof item.order_index !== 'number') {
          return res.status(400).json({ 
            success: false, 
            message: 'Estrutura de item inválida' 
          });
        }
      }

      const success = await MenuItemModel.updateOrder(items);
      
      if (!success) {
        return res.status(400).json({ 
          success: false, 
          message: 'Erro ao atualizar ordem dos itens' 
        });
      }

      res.json({ success: true, message: 'Ordem atualizada com sucesso' });
    } catch (error) {
      console.error('Erro ao atualizar ordem do menu:', error);
      res.status(500).json({ success: false, message: 'Erro interno do servidor' });
    }
  }

  // Deletar item do menu
  static async deleteMenuItem(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const itemId = parseInt(id);
      
      if (isNaN(itemId)) {
        return res.status(400).json({ 
          success: false, 
          message: 'ID do item inválido' 
        });
      }

      // Verificar se o item existe
      const existingItem = await MenuItemModel.findById(itemId);
      if (!existingItem) {
        return res.status(404).json({ success: false, message: 'Item não encontrado' });
      }

      const deleted = await MenuItemModel.delete(itemId);
      
      if (!deleted) {
        return res.status(400).json({ success: false, message: 'Erro ao deletar item' });
      }

      res.json({ success: true, message: 'Item deletado com sucesso' });
    } catch (error) {
      console.error('Erro ao deletar item do menu:', error);
      res.status(500).json({ success: false, message: 'Erro interno do servidor' });
    }
  }

  // Buscar estatísticas do menu
  static async getMenuStats(req: Request, res: Response) {
    try {
      const stats = await MenuItemModel.getStats();
      res.json({ success: true, data: stats });
    } catch (error) {
      console.error('Erro ao buscar estatísticas do menu:', error);
      res.status(500).json({ success: false, message: 'Erro interno do servidor' });
    }
  }
}

