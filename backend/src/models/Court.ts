import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/sequelize';

interface CourtAttributes {
  id: number;
  name: string;
  type: 'Quadra' | 'Campo' | 'Piscina' | 'Academia';
  capacity: number;
  price: number;
  description?: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

interface CourtCreationAttributes extends Optional<CourtAttributes, 'id' | 'created_at' | 'updated_at'> {}

export class Court extends Model<CourtAttributes, CourtCreationAttributes> implements CourtAttributes {
  public id!: number;
  public name!: string;
  public type!: 'Quadra' | 'Campo' | 'Piscina' | 'Academia';
  public capacity!: number;
  public price!: number;
  public description?: string;
  public is_active!: boolean;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

Court.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM('Quadra', 'Campo', 'Piscina', 'Academia'),
      allowNull: false,
    },
    capacity: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
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
    tableName: 'courts',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);