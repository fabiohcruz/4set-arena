import { Request, Response } from 'express';
import { Product } from '../models/Product';
import { StockMovement } from '../models/StockMovement';
import { Op } from 'sequelize';
import { sequelize } from '../config/sequelize';

export class StockController {
  // Ajustar estoque de um produto
  static async adjustStock(req: Request, res: Response) {
    try {
      const { productId, newStock, newCost, reason } = req.body;
      const userId = (req as any).user?.id || 1; // ID do usuário autenticado

      const product = await Product.findByPk(productId);
      if (!product) {
        return res.status(404).json({ error: 'Produto não encontrado' });
      }

      const oldStock = product.stock || 0;
      const stockDifference = newStock - oldStock;

      // Atualizar produto
      await product.update({
        stock: newStock,
        costValue: newCost.toString(),
        unitValue: newCost.toString()
      });

      // Registrar movimentação
      await StockMovement.create({
        productId,
        type: 'ajuste',
        quantity: Math.abs(stockDifference),
        cost: newCost,
        reason: reason || 'Ajuste manual de estoque',
        date: new Date(),
        userId
      });

      res.json({ 
        message: 'Estoque ajustado com sucesso',
        product: {
          id: product.id,
          code: product.code,
          description: product.description,
          oldStock,
          newStock,
          newCost
        }
      });
    } catch (error) {
      console.error('Erro ao ajustar estoque:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  // Registrar entrada de estoque
  static async addStock(req: Request, res: Response) {
    try {
      const { productId, quantity, cost, reason } = req.body;
      const userId = (req as any).user?.id || 1;

      const product = await Product.findByPk(productId);
      if (!product) {
        return res.status(404).json({ error: 'Produto não encontrado' });
      }

      const oldStock = product.stock || 0;
      const newStock = oldStock + quantity;

      // Atualizar produto
      await product.update({
        stock: newStock,
        costValue: cost.toString(),
        unitValue: cost.toString()
      });

      // Registrar movimentação
      await StockMovement.create({
        productId,
        type: 'entrada',
        quantity,
        cost,
        reason: reason || 'Entrada de estoque',
        date: new Date(),
        userId
      });

      res.json({ 
        message: 'Entrada de estoque registrada com sucesso',
        product: {
          id: product.id,
          code: product.code,
          description: product.description,
          oldStock,
          newStock
        }
      });
    } catch (error) {
      console.error('Erro ao registrar entrada:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  // Registrar saída de estoque
  static async removeStock(req: Request, res: Response) {
    try {
      const { productId, quantity, reason } = req.body;
      const userId = (req as any).user?.id || 1;

      const product = await Product.findByPk(productId);
      if (!product) {
        return res.status(404).json({ error: 'Produto não encontrado' });
      }

      const oldStock = product.stock || 0;
      if (oldStock < quantity) {
        return res.status(400).json({ error: 'Estoque insuficiente' });
      }

      const newStock = oldStock - quantity;

      // Atualizar produto
      await product.update({
        stock: newStock
      });

      // Registrar movimentação
      await StockMovement.create({
        productId,
        type: 'saida',
        quantity,
        cost: parseFloat(product.costValue?.toString() || '0'),
        reason: reason || 'Saída de estoque',
        date: new Date(),
        userId
      });

      res.json({ 
        message: 'Saída de estoque registrada com sucesso',
        product: {
          id: product.id,
          code: product.code,
          description: product.description,
          oldStock,
          newStock
        }
      });
    } catch (error) {
      console.error('Erro ao registrar saída:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  // Listar movimentações de estoque
  static async getStockMovements(req: Request, res: Response) {
    try {
      const { productId, type, startDate, endDate, limit = 50, offset = 0 } = req.query;

      const where: any = {};
      if (productId) where.productId = productId;
      if (type) where.type = type;
      if (startDate || endDate) {
        where.date = {};
        if (startDate) where.date[Op.gte] = new Date(startDate as string);
        if (endDate) where.date[Op.lte] = new Date(endDate as string);
      }

      const movements = await StockMovement.findAndCountAll({
        where,
        limit: parseInt(limit as string),
        offset: parseInt(offset as string),
        order: [['date', 'DESC']],
        include: [{
          model: Product,
          as: 'product',
          attributes: ['id', 'code', 'description']
        }]
      });

      res.json({
        movements: movements.rows,
        total: movements.count,
        limit: parseInt(limit as string),
        offset: parseInt(offset as string)
      });
    } catch (error) {
      console.error('Erro ao buscar movimentações:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  // Relatório de estoque baixo
  static async getLowStockReport(req: Request, res: Response) {
    try {
      const products = await Product.findAll({
        where: {
          active: true,
          [Op.or]: [
            { stock: { [Op.lte]: 0 } },
            sequelize.literal('(stock > 0 AND min_stock > 0 AND stock <= min_stock)')
          ]
        },
        order: [['stock', 'ASC']]
      });

      const lowStock = products.filter(p => (p.stock || 0) > 0 && (p.stock || 0) <= (p.minStock || 0));
      const outOfStock = products.filter(p => (p.stock || 0) <= 0);

      res.json({
        lowStock,
        outOfStock,
        summary: {
          totalLowStock: lowStock.length,
          totalOutOfStock: outOfStock.length,
          totalProducts: products.length
        }
      });
    } catch (error) {
      console.error('Erro ao gerar relatório:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  // Importar estoque via XML
  static async importFromXML(req: Request, res: Response) {
    try {
      const { xmlData, items } = req.body;
      const userId = (req as any).user?.id || 1;

      if (!xmlData || !items || !Array.isArray(items)) {
        return res.status(400).json({ error: 'Dados XML inválidos' });
      }

      const results = {
        created: 0,
        updated: 0,
        errors: [] as string[]
      };

      // Processar cada item do XML
      for (const item of items) {
        try {
          // Verificar se o produto já existe pelo código
          let product = await Product.findOne({
            where: { code: item.code }
          });

          if (product) {
            // Atualizar produto existente
            const newStock = (product.stock || 0) + item.quantity;
            const newCost = parseFloat(item.unitValue.toString());

            await product.update({
              stock: newStock,
              costValue: newCost,
              description: item.description || product.description,
              ncm: item.ncm || product.ncm,
              barcode: item.code
            });

            // Registrar movimentação de entrada
            await StockMovement.create({
              productId: product.id,
              type: 'entrada',
              quantity: item.quantity,
              cost: newCost,
              reason: `Importação XML - ${xmlData.companyName || 'Fornecedor'}`,
              date: new Date(),
              userId,
            });

            results.updated++;
          } else {
            // Criar novo produto
            const newProduct = await Product.create({
              code: item.code,
              description: item.description,
              unitValue: item.unitValue,
              costValue: item.unitValue,
              taxSituation: 'TRIBUTADO',
              ncm: item.ncm || '00000000',
              active: true,
              category: 'IMPORTADO',
              barcode: item.code,
              stock: item.quantity,
              minStock: 0
            });

            // Registrar movimentação de entrada
            await StockMovement.create({
              productId: newProduct.id,
              type: 'entrada',
              quantity: item.quantity,
              cost: item.unitValue,
              reason: `Importação XML - ${xmlData.companyName || 'Fornecedor'}`,
              date: new Date(),
              userId,
            });

            results.created++;
          }
        } catch (itemError) {
          console.error(`Erro ao processar item ${item.code}:`, itemError);
          results.errors.push(`Erro no item ${item.code}: ${itemError}`);
        }
      }

      res.json({
        message: 'Importação XML processada com sucesso',
        results: {
          ...results,
          totalProcessed: results.created + results.updated,
          totalItems: items.length
        }
      });
    } catch (error) {
      console.error('Erro ao importar XML:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }
}
