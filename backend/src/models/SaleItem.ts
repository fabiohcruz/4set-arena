import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/sequelize';

export interface SaleItemAttributes {
  id: number;
  saleId: number;
  productId?: number;
  productCode: string;
  productDescription: string;
  quantity: number;
  unitValue: number;
  totalValue: number;
  type: 'product' | 'service' | 'tariff';
  createdAt?: Date;
  updatedAt?: Date;
}

export interface SaleItemCreationAttributes extends Optional<SaleItemAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

export class SaleItem extends Model<SaleItemAttributes, SaleItemCreationAttributes> implements SaleItemAttributes {
  public id!: number;
  public saleId!: number;
  public productId?: number;
  public productCode!: string;
  public productDescription!: string;
  public quantity!: number;
  public unitValue!: number;
  public totalValue!: number;
  public type!: 'product' | 'service' | 'tariff';
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

SaleItem.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    saleId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    productId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    productCode: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    productDescription: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    quantity: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 1.00,
    },
    unitValue: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.00,
    },
    totalValue: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.00,
    },
    type: {
      type: DataTypes.ENUM('product', 'service', 'tariff'),
      allowNull: false,
      defaultValue: 'product',
    },
  },
  {
    sequelize,
    tableName: 'sale_items',
    timestamps: true,
  }
);
