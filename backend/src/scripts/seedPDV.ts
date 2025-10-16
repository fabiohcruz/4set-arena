import { sequelize } from '../config/sequelize';
import { Product } from '../models/Product';
import { Tariff } from '../models/Tariff';

const seedProducts = async () => {
  const products = [
    {
      code: '60',
      description: '2 - Agua Mineral Com Gas',
      unitValue: 3.00,
      costValue: 1.08,
      taxSituation: 'Substituido',
      ncm: '22021000',
      category: 'Bebidas',
      barcode: '7891234567890',
      stock: 50,
      minStock: 10
    },
    {
      code: '459',
      description: '13 - Agua Mineral Sem Gas',
      unitValue: 3.00,
      costValue: 3.00,
      taxSituation: 'Substituido',
      ncm: '22011000',
      category: 'Bebidas',
      barcode: '7891234567891',
      stock: 30,
      minStock: 10
    },
    {
      code: '3497',
      description: '45 - AMENDOIM',
      unitValue: 3.00,
      costValue: 2.75,
      taxSituation: 'Tributado 17%',
      ncm: '20081100',
      category: 'Alimentos',
      barcode: '7891234567892',
      stock: 20,
      minStock: 5
    },
    {
      code: '410',
      description: '10 - Aula Demonstracao',
      unitValue: 100.00,
      costValue: 0.00,
      taxSituation: 'Aliquota de serviço',
      ncm: '',
      category: 'Serviços',
      stock: 0,
      minStock: 0
    },
    {
      code: '9672',
      description: 'null - Batata frita',
      unitValue: 40.00,
      costValue: 0.00,
      taxSituation: 'Tributado 17%',
      ncm: '',
      category: 'Alimentos',
      barcode: '7891234567893',
      stock: 15,
      minStock: 5
    },
    {
      code: '8897',
      description: '65 - batata frita',
      unitValue: 20.00,
      costValue: 2.50,
      taxSituation: 'Isento',
      ncm: '',
      category: 'Alimentos',
      barcode: '7891234567894',
      stock: 25,
      minStock: 5
    },
    {
      code: '64',
      description: '4 - Bermuda de Jogo Masculino',
      unitValue: 120.00,
      costValue: 40.00,
      taxSituation: 'Tributado 17%',
      ncm: '123',
      category: 'Vestuário',
      barcode: '7891234567895',
      stock: 10,
      minStock: 2
    },
    {
      code: 'COCA001',
      description: 'Coca Cola Lata',
      unitValue: 4.00,
      costValue: 2.00,
      taxSituation: 'Tributado 17%',
      ncm: '22021000',
      category: 'Bebidas',
      barcode: '7891234567896',
      stock: 100,
      minStock: 20
    }
  ];

  for (const product of products) {
    await Product.upsert(product);
  }
  
  console.log('✅ Produtos criados com sucesso!');
};

const seedTariffs = async () => {
  const tariffs = [
    // Padel - Mensalista
    {
      sport: 'Padel',
      category: 'Mensalista',
      description: 'Padel Mensalista - Noite',
      value: 100.00,
      period: '18:00 Até 23:00',
      monday: true,
      tuesday: true,
      wednesday: true,
      thursday: true,
      friday: true,
      saturday: true,
      sunday: true
    },
    {
      sport: 'Padel',
      category: 'Mensalista',
      description: 'Padel Mensalista - Tarde',
      value: 80.00,
      period: '12:00 Até 18:00',
      monday: true,
      tuesday: true,
      wednesday: true,
      thursday: true,
      friday: true,
      saturday: true,
      sunday: true
    },
    // Padel - Locação
    {
      sport: 'Padel',
      category: 'Locação',
      description: 'Padel avulso - Tarde',
      value: 2.00,
      period: '12:00 Até 18:00',
      monday: true,
      tuesday: true,
      wednesday: true,
      thursday: true,
      friday: true,
      saturday: true,
      sunday: true
    },
    {
      sport: 'Padel',
      category: 'Locação',
      description: 'Padel avulso - Noite',
      value: 120.00,
      period: '18:00 Até 23:00',
      monday: true,
      tuesday: true,
      wednesday: true,
      thursday: true,
      friday: true,
      saturday: true,
      sunday: true
    },
    {
      sport: 'Padel',
      category: 'Locação',
      description: 'Padel avulso - Manha',
      value: 100.00,
      period: '06:00 Até 12:00',
      monday: true,
      tuesday: true,
      wednesday: true,
      thursday: true,
      friday: true,
      saturday: true,
      sunday: true
    },
    // Padel - Aula
    {
      sport: 'Padel',
      category: 'Aula',
      description: 'Padel aula',
      value: 15.00,
      period: '06:00 Até 23:00',
      monday: false,
      tuesday: false,
      wednesday: false,
      thursday: false,
      friday: false,
      saturday: false,
      sunday: false
    },
    // Volei - Locação
    {
      sport: 'Volei',
      category: 'Locação',
      description: 'Volei avulso - Tarde',
      value: 60.00,
      period: '12:00 Até 18:00',
      monday: true,
      tuesday: true,
      wednesday: true,
      thursday: true,
      friday: true,
      saturday: true,
      sunday: true
    },
    {
      sport: 'Volei',
      category: 'Locação',
      description: 'Volei avulso - Noite',
      value: 90.00,
      period: '18:00 Até 23:00',
      monday: true,
      tuesday: true,
      wednesday: true,
      thursday: true,
      friday: true,
      saturday: true,
      sunday: true
    },
    {
      sport: 'Volei',
      category: 'Locação',
      description: 'Volei Avulso - Manha',
      value: 60.00,
      period: '06:00 Até 12:00',
      monday: true,
      tuesday: true,
      wednesday: true,
      thursday: true,
      friday: true,
      saturday: true,
      sunday: true
    }
  ];

  for (const tariff of tariffs) {
    await Tariff.upsert(tariff);
  }
  
  console.log('✅ Tarifários criados com sucesso!');
};

const seedPDV = async () => {
  try {
    console.log('🌱 Iniciando seed do PDV...');
    
    await sequelize.sync({ force: false });
    
    await seedProducts();
    await seedTariffs();
    
    console.log('🎉 Seed do PDV concluído com sucesso!');
  } catch (error) {
    console.error('❌ Erro no seed do PDV:', error);
  } finally {
    await sequelize.close();
  }
};

// Executar se chamado diretamente
if (require.main === module) {
  seedPDV();
}

export { seedPDV };
