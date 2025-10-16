import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/sequelize';

export interface StockMovementAttributes {
  id: number;
  productId: number;
  type: 'entrada' | 'saida' | 'ajuste';
  quantity: number;
  cost: number;
  reason: string;
  date: Date;
  userId: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface StockMovementCreationAttributes extends Optional<StockMovementAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

export class StockMovement extends Model<StockMovementAttributes, StockMovementCreationAttributes> implements StockMovementAttributes {
  public id!: number;
  public productId!: number;
  public type!: 'entrada' | 'saida' | 'ajuste';
  public quantity!: number;
  public cost!: number;
  public reason!: string;
  public date!: Date;
  public userId!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

StockMovement.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    productId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'product_id',
    },
    type: {
      type: DataTypes.ENUM('entrada', 'saida', 'ajuste'),
      allowNull: false,
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    cost: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    reason: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    date: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'user_id',
    },
  },
  {
    sequelize,
    tableName: 'stock_movements',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);

