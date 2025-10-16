import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/sequelize';

interface MemberAttributes {
  id: number;
  member_code: string;
  full_name: string;
  email?: string;
  phone?: string;
  birth_date?: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  emergency_contact?: string;
  emergency_phone?: string;
  membership_type: 'regular' | 'premium' | 'vip';
  status: 'active' | 'inactive' | 'suspended';
  join_date: string;
  password?: string;
  created_at: Date;
  updated_at: Date;
}

interface MemberCreationAttributes extends Optional<MemberAttributes, 'id' | 'created_at' | 'updated_at'> {}

export class Member extends Model<MemberAttributes, MemberCreationAttributes> implements MemberAttributes {
  public id!: number;
  public member_code!: string;
  public full_name!: string;
  public email?: string;
  public phone?: string;
  public birth_date?: string;
  public address?: string;
  public city?: string;
  public state?: string;
  public zip_code?: string;
  public emergency_contact?: string;
  public emergency_phone?: string;
  public membership_type!: 'regular' | 'premium' | 'vip';
  public status!: 'active' | 'inactive' | 'suspended';
  public join_date!: string;
  public password?: string;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

Member.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    member_code: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    full_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    birth_date: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    address: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    city: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    state: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    zip_code: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    emergency_contact: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    emergency_phone: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    membership_type: {
      type: DataTypes.ENUM('regular', 'premium', 'vip'),
      allowNull: false,
      defaultValue: 'regular',
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive', 'suspended'),
      allowNull: false,
      defaultValue: 'active',
    },
    join_date: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    password: {
      type: DataTypes.STRING,
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
    tableName: 'members',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);