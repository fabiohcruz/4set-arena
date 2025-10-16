import { sequelize } from '../config/sequelize';
import { Product } from './Product';
import { Tariff } from './Tariff';
import { Sale } from './Sale';
import { SaleItem } from './SaleItem';
import { StockMovement } from './StockMovement';
import { Member } from './Member';
import { Reservation } from './Reservation';
import { Court } from './Court';

// Definir associações
Sale.hasMany(SaleItem, { foreignKey: 'saleId', as: 'items' });
SaleItem.belongsTo(Sale, { foreignKey: 'saleId', as: 'sale' });

Product.hasMany(SaleItem, { foreignKey: 'productId', as: 'saleItems' });
SaleItem.belongsTo(Product, { foreignKey: 'productId', as: 'product' });

Product.hasMany(StockMovement, { foreignKey: 'productId', as: 'stockMovements' });
StockMovement.belongsTo(Product, { foreignKey: 'productId', as: 'product' });

// Associações para membros
Member.hasMany(Reservation, { foreignKey: 'memberId', as: 'reservations' });
Reservation.belongsTo(Member, { foreignKey: 'memberId', as: 'member' });

Member.hasMany(Sale, { foreignKey: 'memberId', as: 'orders' });
Sale.belongsTo(Member, { foreignKey: 'memberId', as: 'member' });

// Associações para reservas
Court.hasMany(Reservation, { foreignKey: 'courtId', as: 'reservations' });
Reservation.belongsTo(Court, { foreignKey: 'courtId', as: 'court' });

export {
  sequelize,
  Product,
  Tariff,
  Sale,
  SaleItem,
  StockMovement,
  Member,
  Reservation,
  Court
};
