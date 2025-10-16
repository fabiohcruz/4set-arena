import { Request, Response } from 'express';
import { Sale } from '../models/Sale';
import { SaleItem } from '../models/SaleItem';
import { Product } from '../models/Product';

export const getMemberOrders = async (req: Request, res: Response) => {
  try {
    const memberId = (req as any).member?.id;
    const { status, limit = 20, offset = 0 } = req.query;

    if (!memberId) {
      return res.status(401).json({ error: 'Token de acesso necessário' });
    }

    let whereClause: any = { memberId };

    // Filtrar por status se fornecido
    if (status) {
      whereClause.status = status;
    }

    const orders = await Sale.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: SaleItem,
          as: 'items',
          include: [
            {
              model: Product,
              as: 'product',
              attributes: ['id', 'code', 'description', 'unitValue']
            }
          ]
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit as string),
      offset: parseInt(offset as string)
    });

    res.json({
      success: true,
      data: orders.rows,
      total: orders.count,
      limit: parseInt(limit as string),
      offset: parseInt(offset as string)
    });
  } catch (error) {
    console.error('Erro ao buscar pedidos do membro:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

export const createMemberOrder = async (req: Request, res: Response) => {
  try {
    const memberId = (req as any).member?.id;
    const { items, notes } = req.body;

    if (!memberId) {
      return res.status(401).json({ error: 'Token de acesso necessário' });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Itens do pedido são obrigatórios' });
    }

    // Verificar se todos os produtos existem e estão disponíveis
    const productIds = items.map((item: any) => item.productId);
    const products = await Product.findAll({
      where: { id: productIds, active: true }
    });

    if (products.length !== productIds.length) {
      return res.status(400).json({ error: 'Alguns produtos não foram encontrados ou estão inativos' });
    }

    // Calcular total do pedido
    let total = 0;
    const orderItems = [];

    for (const item of items) {
      const product = products.find(p => p.id === item.productId);
      if (!product) {
        return res.status(400).json({ error: `Produto ${item.productId} não encontrado` });
      }

      const itemTotal = product.unitValue * item.quantity;
      total += itemTotal;

      orderItems.push({
        productId: item.productId,
        quantity: item.quantity,
        unitValue: product.unitValue,
        totalValue: itemTotal
      });
    }

    // Aplicar desconto baseado no tipo de membro
    const member = (req as any).member;
    let finalTotal = total;
    let discount = 0;

    if (member.membershipType === 'premium') {
      discount = total * 0.1; // 10% de desconto
      finalTotal = total - discount;
    } else if (member.membershipType === 'vip') {
      discount = total * 0.15; // 15% de desconto
      finalTotal = total - discount;
    }

    // Gerar número da conta
    const saleCount = await Sale.count();
    const accountNumber = `MEM${(saleCount + 1).toString().padStart(6, '0')}`;

    // Criar venda
    const sale = await Sale.create({
      accountNumber,
      clientName: member.fullName || 'Membro',
      memberId,
      total: finalTotal,
      discount,
      status: 'pending',
      notes: notes || ''
    });

    // Criar itens da venda
    for (const item of orderItems) {
      const product = products.find(p => p.id === item.productId);
      await SaleItem.create({
        saleId: sale.id,
        productId: item.productId,
        productCode: product?.code || '',
        productDescription: product?.description || '',
        quantity: item.quantity,
        unitValue: item.unitValue,
        totalValue: item.totalValue,
        type: 'product'
      });
    }

    // Buscar venda completa com itens
    const saleWithItems = await Sale.findByPk(sale.id, {
      include: [
        {
          model: SaleItem,
          as: 'items',
          include: [
            {
              model: Product,
              as: 'product',
              attributes: ['id', 'code', 'description', 'unitValue']
            }
          ]
        }
      ]
    });

    res.status(201).json({
      success: true,
      message: 'Pedido criado com sucesso',
      data: saleWithItems
    });
  } catch (error) {
    console.error('Erro ao criar pedido:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

export const getMemberOrderDetails = async (req: Request, res: Response) => {
  try {
    const memberId = (req as any).member?.id;
    const { orderId } = req.params;

    if (!memberId) {
      return res.status(401).json({ error: 'Token de acesso necessário' });
    }

    const order = await Sale.findOne({
      where: { id: orderId, memberId },
      include: [
        {
          model: SaleItem,
          as: 'items',
          include: [
            {
              model: Product,
              as: 'product',
              attributes: ['id', 'code', 'description', 'unitValue']
            }
          ]
        }
      ]
    });

    if (!order) {
      return res.status(404).json({ error: 'Pedido não encontrado' });
    }

    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error('Erro ao buscar detalhes do pedido:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

export const cancelMemberOrder = async (req: Request, res: Response) => {
  try {
    const memberId = (req as any).member?.id;
    const { orderId } = req.params;

    if (!memberId) {
      return res.status(401).json({ error: 'Token de acesso necessário' });
    }

    const order = await Sale.findOne({
      where: { id: orderId, memberId }
    });

    if (!order) {
      return res.status(404).json({ error: 'Pedido não encontrado' });
    }

    if (order.status === 'cancelled') {
      return res.status(400).json({ error: 'Pedido já foi cancelado' });
    }

    if (order.status === 'completed') {
      return res.status(400).json({ error: 'Não é possível cancelar um pedido já concluído' });
    }

    if (order.status === 'preparing') {
      return res.status(400).json({ error: 'Não é possível cancelar um pedido que já está sendo preparado' });
    }

    await order.update({
      status: 'cancelled',
      updatedAt: new Date()
    });

    res.json({
      success: true,
      message: 'Pedido cancelado com sucesso'
    });
  } catch (error) {
    console.error('Erro ao cancelar pedido:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

export const getAvailableProducts = async (req: Request, res: Response) => {
  try {
    const { category, search } = req.query;

    let whereClause: any = { active: true };

    if (category && category !== 'all') {
      whereClause.category = category;
    }

    if (search) {
      whereClause.$or = [
        { description: { $iLike: `%${search}%` } },
        { code: { $iLike: `%${search}%` } }
      ];
    }

    const products = await Product.findAll({
      where: whereClause,
      order: [['description', 'ASC']]
    });

    res.json({
      success: true,
      data: products
    });
  } catch (error) {
    console.error('Erro ao buscar produtos disponíveis:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};
