import { sequelize } from '../config/sequelize';
import { Product } from '../models/Product';
import { Tariff } from '../models/Tariff';
import { Sale } from '../models/Sale';
import { SaleItem } from '../models/SaleItem';

const syncDatabase = async () => {
  try {
    console.log('🔄 Sincronizando banco de dados...');
    
    // Sincronizar todas as tabelas
    await sequelize.sync({ force: false });
    
    console.log('✅ Banco de dados sincronizado com sucesso!');
    console.log('📋 Tabelas criadas:');
    console.log('   - products');
    console.log('   - tariffs');
    console.log('   - sales');
    console.log('   - sale_items');
    
  } catch (error) {
    console.error('❌ Erro ao sincronizar banco de dados:', error);
  } finally {
    await sequelize.close();
  }
};

// Executar se chamado diretamente
if (require.main === module) {
  syncDatabase();
}

export { syncDatabase };

