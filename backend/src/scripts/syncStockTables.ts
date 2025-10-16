import { sequelize } from '../config/sequelize';
import { StockMovement } from '../models/StockMovement';
import { Product } from '../models/Product';

const syncStockTables = async () => {
  try {
    console.log('🔄 Sincronizando tabelas de estoque...');
    
    // Sincronizar tabela de movimentações de estoque
    await StockMovement.sync({ alter: true });
    console.log('✅ Tabela stock_movements sincronizada');
    
    // Atualizar produtos existentes com campos de estoque se necessário
    const products = await Product.findAll();
    for (const product of products) {
      if (product.stock === undefined || product.stock === null) {
        await product.update({ stock: 0 });
      }
      if (product.minStock === undefined || product.minStock === null) {
        await product.update({ minStock: 10 }); // Estoque mínimo padrão
      }
    }
    console.log(`✅ ${products.length} produtos atualizados com campos de estoque`);
    
    console.log('🎉 Sincronização de estoque concluída!');
  } catch (error) {
    console.error('❌ Erro ao sincronizar tabelas de estoque:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
};

syncStockTables();

