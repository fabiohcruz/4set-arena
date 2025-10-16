import { Request, Response } from 'express';
import { Product } from '../models/Product';
import { Op } from 'sequelize';

export class ProductController {
  // Listar todos os produtos
  static async getAllProducts(req: Request, res: Response) {
    try {
      const { search, category, active } = req.query;
      
      const where: any = {};
      
      if (search) {
        where[Op.or] = [
          { description: { [Op.iLike]: `%${search}%` } },
          { code: { [Op.iLike]: `%${search}%` } },
          { barcode: { [Op.iLike]: `%${search}%` } }
        ];
      }
      
      if (category) {
        where.category = category;
      }
      
      if (active !== undefined) {
        where.active = active === 'true';
      }
      
      const products = await Product.findAll({
        where,
        order: [['description', 'ASC']]
      });
      
      res.json(products);
    } catch (error) {
      console.error('Erro ao buscar produtos:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  // Buscar produto por ID
  static async getProductById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const product = await Product.findByPk(id);
      
      if (!product) {
        return res.status(404).json({ error: 'Produto não encontrado' });
      }
      
      res.json(product);
    } catch (error) {
      console.error('Erro ao buscar produto:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  // Buscar produto por código ou código de barras
  static async getProductByCode(req: Request, res: Response) {
    try {
      const { code } = req.params;
      const product = await Product.findOne({
        where: {
          [Op.or]: [
            { code: code },
            { barcode: code }
          ],
          active: true
        }
      });
      
      if (!product) {
        return res.status(404).json({ error: 'Produto não encontrado' });
      }
      
      res.json(product);
    } catch (error) {
      console.error('Erro ao buscar produto por código:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  // Criar novo produto
  static async createProduct(req: Request, res: Response) {
    try {
      const productData = req.body;
      const product = await Product.create(productData);
      res.status(201).json(product);
    } catch (error) {
      console.error('Erro ao criar produto:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  // Atualizar produto
  static async updateProduct(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const productData = req.body;
      
      const product = await Product.findByPk(id);
      if (!product) {
        return res.status(404).json({ error: 'Produto não encontrado' });
      }
      
      await product.update(productData);
      res.json(product);
    } catch (error) {
      console.error('Erro ao atualizar produto:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  // Deletar produto (soft delete)
  static async deleteProduct(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const product = await Product.findByPk(id);
      
      if (!product) {
        return res.status(404).json({ error: 'Produto não encontrado' });
      }
      
      await product.update({ active: false });
      res.json({ message: 'Produto desativado com sucesso' });
    } catch (error) {
      console.error('Erro ao deletar produto:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  // Buscar categorias
  static async getCategories(req: Request, res: Response) {
    try {
      const categories = await Product.findAll({
        attributes: ['category'],
        group: ['category'],
        order: [['category', 'ASC']]
      });
      
      const categoryList = categories.map(cat => cat.category);
      res.json(categoryList);
    } catch (error) {
      console.error('Erro ao buscar categorias:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }
}

