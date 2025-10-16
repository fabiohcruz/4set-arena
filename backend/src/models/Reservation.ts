import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/sequelize';

interface ReservationAttributes {
  id: number;
  memberId: number;
  courtId: number;
  startTime: Date;
  endTime: Date;
  price: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  notes?: string;
  created_at: Date;
  updated_at: Date;
}

interface ReservationCreationAttributes extends Optional<ReservationAttributes, 'id' | 'created_at' | 'updated_at'> {}

export class Reservation extends Model<ReservationAttributes, ReservationCreationAttributes> implements ReservationAttributes {
  public id!: number;
  public memberId!: number;
  public courtId!: number;
  public startTime!: Date;
  public endTime!: Date;
  public price!: number;
  public status!: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  public notes?: string;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

Reservation.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    memberId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'member_id',
    },
    courtId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'court_id',
    },
    startTime: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'start_time',
    },
    endTime: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'end_time',
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('pending', 'confirmed', 'cancelled', 'completed'),
      allowNull: false,
      defaultValue: 'pending',
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: 'reservations',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);
