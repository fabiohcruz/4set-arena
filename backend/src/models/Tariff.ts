import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/sequelize';

export interface TariffAttributes {
  id: number;
  sport: string;
  category: string; // Mensalista, Locação, Aula
  description: string;
  value: number;
  period: string; // Ex: "18:00 Até 23:00"
  monday: boolean;
  tuesday: boolean;
  wednesday: boolean;
  thursday: boolean;
  friday: boolean;
  saturday: boolean;
  sunday: boolean;
  active: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface TariffCreationAttributes extends Optional<TariffAttributes, 'id' | 'active' | 'createdAt' | 'updatedAt'> {}

export class Tariff extends Model<TariffAttributes, TariffCreationAttributes> implements TariffAttributes {
  public id!: number;
  public sport!: string;
  public category!: string;
  public description!: string;
  public value!: number;
  public period!: string;
  public monday!: boolean;
  public tuesday!: boolean;
  public wednesday!: boolean;
  public thursday!: boolean;
  public friday!: boolean;
  public saturday!: boolean;
  public sunday!: boolean;
  public active!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Tariff.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    sport: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    category: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    value: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    period: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    monday: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    tuesday: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    wednesday: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    thursday: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    friday: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    saturday: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    sunday: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    sequelize,
    tableName: 'tariffs',
    timestamps: true,
  }
);
