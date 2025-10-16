import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

// Configuração do Sequelize
const sequelizeConfig = process.env.DATABASE_URL 
  ? {
      url: process.env.DATABASE_URL,
      dialect: 'postgres' as const,
      dialectOptions: {
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
      },
      logging: false,
      pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
      }
    }
  : {
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      database: process.env.DB_NAME || '4set_sports',
      username: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres123',
      dialect: 'postgres' as const,
      logging: false,
      pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
      }
    };

const sequelize = new Sequelize(sequelizeConfig);

export { sequelize };

