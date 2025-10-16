import { Request, Response } from 'express';
import { Tariff } from '../models/Tariff';
import { Op } from 'sequelize';

export class TariffController {
  // Listar todos os tarifários
  static async getAllTariffs(req: Request, res: Response) {
    try {
      const { search, sport, category } = req.query;
      
      const where: any = {};
      
      if (search) {
        where.description = { [Op.iLike]: `%${search}%` };
      }
      
      if (sport) {
        where.sport = sport;
      }
      
      if (category) {
        where.category = category;
      }
      
      const tariffs = await Tariff.findAll({
        where,
        order: [['sport', 'ASC'], ['category', 'ASC'], ['description', 'ASC']]
      });
      
      res.json(tariffs);
    } catch (error) {
      console.error('Erro ao buscar tarifários:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  // Buscar tarifário por ID
  static async getTariffById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const tariff = await Tariff.findByPk(id);
      
      if (!tariff) {
        return res.status(404).json({ error: 'Tarifário não encontrado' });
      }
      
      res.json(tariff);
    } catch (error) {
      console.error('Erro ao buscar tarifário:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  // Criar novo tarifário
  static async createTariff(req: Request, res: Response) {
    try {
      const tariffData = req.body;
      const tariff = await Tariff.create(tariffData);
      res.status(201).json(tariff);
    } catch (error) {
      console.error('Erro ao criar tarifário:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  // Atualizar tarifário
  static async updateTariff(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const tariffData = req.body;
      
      const tariff = await Tariff.findByPk(id);
      if (!tariff) {
        return res.status(404).json({ error: 'Tarifário não encontrado' });
      }
      
      await tariff.update(tariffData);
      res.json(tariff);
    } catch (error) {
      console.error('Erro ao atualizar tarifário:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  // Deletar tarifário
  static async deleteTariff(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const tariff = await Tariff.findByPk(id);
      
      if (!tariff) {
        return res.status(404).json({ error: 'Tarifário não encontrado' });
      }
      
      await tariff.destroy();
      res.json({ message: 'Tarifário deletado com sucesso' });
    } catch (error) {
      console.error('Erro ao deletar tarifário:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  // Buscar esportes
  static async getSports(req: Request, res: Response) {
    try {
      const sports = await Tariff.findAll({
        attributes: ['sport'],
        group: ['sport'],
        order: [['sport', 'ASC']]
      });
      
      const sportList = sports.map(sport => sport.sport);
      res.json(sportList);
    } catch (error) {
      console.error('Erro ao buscar esportes:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  // Buscar categorias por esporte
  static async getCategoriesBySport(req: Request, res: Response) {
    try {
      const { sport } = req.params;
      const categories = await Tariff.findAll({
        attributes: ['category'],
        where: { sport },
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

