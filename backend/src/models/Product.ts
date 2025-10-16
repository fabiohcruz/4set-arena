import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/sequelize';

export interface ProductAttributes {
  id: number;
  code: string;
  description: string;
  unitValue: number;
  costValue: number;
  taxSituation: string;
  ncm: string;
  active: boolean;
  category: string;
  barcode?: string;
  stock?: number;
  minStock?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ProductCreationAttributes extends Optional<ProductAttributes, 'id' | 'active' | 'stock' | 'minStock' | 'createdAt' | 'updatedAt'> {}

export class Product extends Model<ProductAttributes, ProductCreationAttributes> implements ProductAttributes {
  public id!: number;
  public code!: string;
  public description!: string;
  public unitValue!: number;
  public costValue!: number;
  public taxSituation!: string;
  public ncm!: string;
  public active!: boolean;
  public category!: string;
  public barcode?: string;
  public stock?: number;
  public minStock?: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Product.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    code: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    description: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    unitValue: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.00,
    },
    costValue: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.00,
    },
    taxSituation: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'Tributado 17%',
    },
    ncm: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    category: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'Geral',
    },
    barcode: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    stock: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
    },
    minStock: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
    },
  },
  {
    sequelize,
    tableName: 'products',
    timestamps: true,
  }
);
