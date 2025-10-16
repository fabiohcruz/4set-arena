import { Request, Response } from 'express';
import { Op } from 'sequelize';
import { Reservation } from '../models/Reservation';
import { Court } from '../models/Court';

export const getMemberReservations = async (req: Request, res: Response) => {
  try {
    const memberId = (req as any).member?.id;
    const { status, date } = req.query;

    if (!memberId) {
      return res.status(401).json({ error: 'Token de acesso necessário' });
    }

    let whereClause: any = { memberId };

    // Filtrar por status se fornecido
    if (status) {
      whereClause.status = status;
    }

    // Filtrar por data se fornecida
    if (date) {
      const startDate = new Date(date as string);
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 1);
      
      whereClause.startTime = {
        [Op.gte]: startDate,
        [Op.lt]: endDate
      };
    }

    const reservations = await Reservation.findAll({
      where: whereClause,
      include: [
        {
          model: Court,
          as: 'court',
          attributes: ['id', 'name', 'type', 'price']
        }
      ],
      order: [['startTime', 'DESC']]
    });

    res.json({
      success: true,
      data: reservations
    });
  } catch (error) {
    console.error('Erro ao buscar reservas do membro:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

export const createMemberReservation = async (req: Request, res: Response) => {
  try {
    const memberId = (req as any).member?.id;
    const { courtId, startTime, endTime, notes } = req.body;

    if (!memberId) {
      return res.status(401).json({ error: 'Token de acesso necessário' });
    }

    if (!courtId || !startTime || !endTime) {
      return res.status(400).json({ error: 'Dados obrigatórios: courtId, startTime, endTime' });
    }

    // Verificar se a quadra existe e está ativa
    const court = await Court.findByPk(courtId);
    if (!court || !court.is_active) {
      return res.status(400).json({ error: 'Quadra não encontrada ou inativa' });
    }

    // Verificar conflitos de horário
    const conflictingReservation = await Reservation.findOne({
      where: {
        courtId,
        status: ['confirmed', 'pending'],
        [Op.or]: [
          {
            startTime: { [Op.lte]: new Date(startTime) },
            endTime: { [Op.gt]: new Date(startTime) }
          },
          {
            startTime: { [Op.lt]: new Date(endTime) },
            endTime: { [Op.gte]: new Date(endTime) }
          }
        ]
      }
    });

    if (conflictingReservation) {
      return res.status(400).json({ error: 'Horário já reservado para esta quadra' });
    }

    // Calcular preço baseado no tipo de membro
    let finalPrice = court.price;
    const member = (req as any).member;
    
    // Aplicar desconto baseado no tipo de membro
    if (member.membershipType === 'premium') {
      finalPrice = court.price * 0.8; // 20% de desconto
    } else if (member.membershipType === 'vip') {
      finalPrice = court.price * 0.7; // 30% de desconto
    }

    // Criar reserva
    const reservation = await Reservation.create({
      memberId,
      courtId,
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      price: finalPrice,
      status: 'pending',
      notes: notes || '',
      created_at: new Date(),
      updated_at: new Date()
    });

    // Buscar reserva com dados da quadra
    const reservationWithCourt = await Reservation.findByPk(reservation.id, {
      include: [
        {
          model: Court,
          as: 'court',
          attributes: ['id', 'name', 'type', 'price']
        }
      ]
    });

    res.status(201).json({
      success: true,
      message: 'Reserva criada com sucesso',
      data: reservationWithCourt
    });
  } catch (error) {
    console.error('Erro ao criar reserva:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

export const cancelMemberReservation = async (req: Request, res: Response) => {
  try {
    const memberId = (req as any).member?.id;
    const { reservationId } = req.params;

    if (!memberId) {
      return res.status(401).json({ error: 'Token de acesso necessário' });
    }

    const reservation = await Reservation.findOne({
      where: { id: reservationId, memberId }
    });

    if (!reservation) {
      return res.status(404).json({ error: 'Reserva não encontrada' });
    }

    if (reservation.status === 'cancelled') {
      return res.status(400).json({ error: 'Reserva já foi cancelada' });
    }

    if (reservation.status === 'completed') {
      return res.status(400).json({ error: 'Não é possível cancelar uma reserva já concluída' });
    }

    // Verificar se pode cancelar (ex: até 2 horas antes)
    const now = new Date();
    const reservationTime = new Date(reservation.startTime);
    const hoursUntilReservation = (reservationTime.getTime() - now.getTime()) / (1000 * 60 * 60);

    if (hoursUntilReservation < 2) {
      return res.status(400).json({ error: 'Não é possível cancelar reserva com menos de 2 horas de antecedência' });
    }

    await reservation.update({
      status: 'cancelled',
      updated_at: new Date()
    });

    res.json({
      success: true,
      message: 'Reserva cancelada com sucesso'
    });
  } catch (error) {
    console.error('Erro ao cancelar reserva:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

export const getAvailableCourts = async (req: Request, res: Response) => {
  try {
    const { date, startTime, endTime } = req.query;

    if (!date || !startTime || !endTime) {
      return res.status(400).json({ error: 'Parâmetros obrigatórios: date, startTime, endTime' });
    }

    // Buscar quadras ativas
    const courts = await Court.findAll({
      where: { is_active: true },
      order: [['name', 'ASC']]
    });

    // Verificar disponibilidade para cada quadra
    const availableCourts = await Promise.all(
      courts.map(async (court) => {
        const conflictingReservation = await Reservation.findOne({
          where: {
            courtId: court.id,
            status: ['confirmed', 'pending'],
            [Op.or]: [
              {
                startTime: { [Op.lte]: new Date(startTime as string) },
                endTime: { [Op.gt]: new Date(startTime as string) }
              },
              {
                startTime: { [Op.lt]: new Date(endTime as string) },
                endTime: { [Op.gte]: new Date(endTime as string) }
              }
            ]
          }
        });

        return {
          ...court.toJSON(),
          available: !conflictingReservation
        };
      })
    );

    res.json({
      success: true,
      data: availableCourts
    });
  } catch (error) {
    console.error('Erro ao buscar quadras disponíveis:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};
