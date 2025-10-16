import { Request, Response } from 'express';
import { Sale } from '../models/Sale';
import { SaleItem } from '../models/SaleItem';
import { Product } from '../models/Product';
import { Tariff } from '../models/Tariff';
import { Op } from 'sequelize';

export class SaleController {
  // Listar todas as vendas
  static async getAllSales(req: Request, res: Response) {
    try {
      const sales = await Sale.findAll({
        order: [['createdAt', 'DESC']]
      });
      
      res.json(sales);
    } catch (error) {
      console.error('Erro ao buscar vendas:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  // Buscar venda por ID
  static async getSaleById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const sale = await Sale.findByPk(id, {
        include: [{
          model: SaleItem,
          as: 'items',
          include: [{
            model: Product,
            as: 'product'
          }]
        }]
      });
      
      if (!sale) {
        return res.status(404).json({ error: 'Venda não encontrada' });
      }
      
      res.json(sale);
    } catch (error) {
      console.error('Erro ao buscar venda:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  // Buscar venda por número da conta
  static async getSaleByAccountNumber(req: Request, res: Response) {
    try {
      const { accountNumber } = req.params;
      const sale = await Sale.findOne({
        where: { accountNumber }
      });
      
      if (!sale) {
        return res.status(404).json({ error: 'Venda não encontrada' });
      }
      
      res.json(sale);
    } catch (error) {
      console.error('Erro ao buscar venda:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  // Criar nova venda
  static async createSale(req: Request, res: Response) {
    try {
      const { clientName, clientId, cardNumber, items, userId } = req.body;
      
      // Gerar número da conta único
      const accountNumber = Date.now().toString();
      
      // Calcular total
      const total = items.reduce((sum: number, item: any) => {
        return sum + (item.unitValue * item.quantity);
      }, 0);
      
      const sale = await Sale.create({
        accountNumber,
        clientName,
        clientId,
        cardNumber,
        total,
        userId,
        status: 'open'
      });
      
      // Criar itens da venda
      for (const item of items) {
        await SaleItem.create({
          saleId: sale.id,
          productId: item.productId,
          productCode: item.productCode,
          productDescription: item.productDescription,
          quantity: item.quantity,
          unitValue: item.unitValue,
          totalValue: item.unitValue * item.quantity,
          type: item.type || 'product'
        });
      }
      
      const saleWithItems = await Sale.findByPk(sale.id);
      
      res.status(201).json(saleWithItems);
    } catch (error) {
      console.error('Erro ao criar venda:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  // Adicionar item à venda
  static async addItemToSale(req: Request, res: Response) {
    try {
      const { saleId } = req.params;
      const { productCode, quantity = 1, type = 'product' } = req.body;
      
      const sale = await Sale.findByPk(saleId);
      if (!sale) {
        return res.status(404).json({ error: 'Venda não encontrada' });
      }
      
      let product: any = null;
      let productDescription = '';
      let unitValue = 0;
      
      if (type === 'product') {
        product = await Product.findOne({
          where: {
            [Op.or]: [
              { code: productCode },
              { barcode: productCode }
            ],
            active: true
          }
        });
        
        if (!product) {
          return res.status(404).json({ error: 'Produto não encontrado' });
        }
        
        productDescription = product.description;
        unitValue = parseFloat(product.unitValue.toString());
      } else if (type === 'tariff') {
        const tariff = await Tariff.findByPk(productCode);
        if (!tariff) {
          return res.status(404).json({ error: 'Tarifário não encontrado' });
        }
        
        productDescription = tariff.description;
        unitValue = parseFloat(tariff.value.toString());
      }
      
      const totalValue = unitValue * quantity;
      
      const saleItem = await SaleItem.create({
        saleId: sale.id,
        productId: product?.id,
        productCode,
        productDescription,
        quantity,
        unitValue,
        totalValue,
        type
      });
      
      // Atualizar total da venda
      const newTotal = parseFloat(sale.total.toString()) + totalValue;
      await sale.update({ total: newTotal });
      
      res.status(201).json(saleItem);
    } catch (error) {
      console.error('Erro ao adicionar item:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  // Remover item da venda
  static async removeItemFromSale(req: Request, res: Response) {
    try {
      const { saleId, itemId } = req.params;
      
      const sale = await Sale.findByPk(saleId);
      if (!sale) {
        return res.status(404).json({ error: 'Venda não encontrada' });
      }
      
      const saleItem = await SaleItem.findByPk(itemId);
      if (!saleItem) {
        return res.status(404).json({ error: 'Item não encontrado' });
      }
      
      // Atualizar total da venda
      const newTotal = parseFloat(sale.total.toString()) - parseFloat(saleItem.totalValue.toString());
      await sale.update({ total: newTotal });
      
      // Remover item
      await saleItem.destroy();
      
      res.json({ message: 'Item removido com sucesso' });
    } catch (error) {
      console.error('Erro ao remover item:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  // Atualizar item da venda
  static async updateItemInSale(req: Request, res: Response) {
    try {
      const { saleId, itemId } = req.params;
      const { quantity, unitValue } = req.body;
      
      const saleItem = await SaleItem.findOne({
        where: { id: itemId, saleId }
      });
      
      if (!saleItem) {
        return res.status(404).json({ error: 'Item não encontrado' });
      }
      
      const totalValue = quantity * unitValue;
      
      await saleItem.update({
        quantity: quantity,
        unitValue: unitValue,
        totalValue: totalValue
      });
      
      // Recalcular total da venda
      const sale = await Sale.findByPk(saleId);
      if (sale) {
        const allItems = await SaleItem.findAll({
          where: { saleId }
        });
        
        const newTotal = allItems.reduce((sum, item) => {
          return sum + parseFloat(item.totalValue.toString());
        }, 0);
        
        await sale.update({
          total: newTotal
        });
      }
      
      res.json(saleItem);
    } catch (error) {
      console.error('Erro ao atualizar item:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  // Fechar venda
  static async closeSale(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { paymentMethod, loyaltyPoints } = req.body;
      
      const sale = await Sale.findByPk(id);
      if (!sale) {
        return res.status(404).json({ error: 'Venda não encontrada' });
      }
      
      await sale.update({
        status: 'closed',
        paymentMethod,
        loyaltyPoints
      });
      
      res.json(sale);
    } catch (error) {
      console.error('Erro ao fechar venda:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  // Transferir venda
  static async transferSale(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { newClientId, newClientName } = req.body;
      
      const sale = await Sale.findByPk(id);
      if (!sale) {
        return res.status(404).json({ error: 'Venda não encontrada' });
      }
      
      await sale.update({
        clientId: newClientId,
        clientName: newClientName,
        status: 'transferred'
      });
      
      res.json(sale);
    } catch (error) {
      console.error('Erro ao transferir venda:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }
}
