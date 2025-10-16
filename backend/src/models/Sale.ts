import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/sequelize';

export interface SaleAttributes {
  id: number;
  accountNumber: string;
  clientId?: number;
  clientName: string;
  cardNumber?: string;
  total: number;
  discount?: number;
  status: 'open' | 'partial' | 'closed' | 'transferred' | 'pending' | 'preparing' | 'completed' | 'cancelled';
  paymentMethod?: string;
  loyaltyPoints?: number;
  userId?: number;
  memberId?: number;
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface SaleCreationAttributes extends Optional<SaleAttributes, 'id' | 'loyaltyPoints' | 'createdAt' | 'updatedAt'> {}

export class Sale extends Model<SaleAttributes, SaleCreationAttributes> implements SaleAttributes {
  public id!: number;
  public accountNumber!: string;
  public clientId?: number;
  public clientName!: string;
  public cardNumber?: string;
  public total!: number;
  public status!: 'open' | 'partial' | 'closed' | 'transferred' | 'pending' | 'preparing' | 'completed' | 'cancelled';
  public paymentMethod?: string;
  public loyaltyPoints?: number;
  public userId?: number;
  public memberId?: number;
  public notes?: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Sale.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    accountNumber: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    clientId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    clientName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    cardNumber: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    total: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.00,
    },
    discount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      defaultValue: 0.00,
    },
    status: {
      type: DataTypes.ENUM('open', 'partial', 'closed', 'transferred', 'pending', 'preparing', 'completed', 'cancelled'),
      allowNull: false,
      defaultValue: 'open',
    },
    paymentMethod: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    loyaltyPoints: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    memberId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'sales',
    timestamps: true,
  }
);
