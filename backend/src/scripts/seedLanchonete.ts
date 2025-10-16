import { sequelize } from '../config/sequelize';
import { Product } from '../models/Product';

const lanchoneteProducts = [
  // Bebidas
  { code: 'BEB001', description: 'Coca-Cola Lata 350ml', category: 'Bebidas', unitValue: 4.50, costValue: 2.80, stock: 50, minStock: 20, barcode: '7891234567890' },
  { code: 'BEB002', description: 'Coca-Cola 2L', category: 'Bebidas', unitValue: 8.50, costValue: 5.20, stock: 30, minStock: 15, barcode: '7891234567891' },
  { code: 'BEB003', description: 'Pepsi Lata 350ml', category: 'Bebidas', unitValue: 4.20, costValue: 2.60, stock: 45, minStock: 20, barcode: '7891234567892' },
  { code: 'BEB004', description: 'Guaraná Antarctica Lata', category: 'Bebidas', unitValue: 4.00, costValue: 2.50, stock: 40, minStock: 20, barcode: '7891234567893' },
  { code: 'BEB005', description: 'Fanta Laranja Lata', category: 'Bebidas', unitValue: 4.00, costValue: 2.50, stock: 35, minStock: 15, barcode: '7891234567894' },
  { code: 'BEB006', description: 'Sprite Lata 350ml', category: 'Bebidas', unitValue: 4.00, costValue: 2.50, stock: 30, minStock: 15, barcode: '7891234567895' },
  { code: 'BEB007', description: 'Água Mineral 500ml', category: 'Bebidas', unitValue: 2.50, costValue: 1.20, stock: 100, minStock: 50, barcode: '7891234567896' },
  { code: 'BEB008', description: 'Água com Gás 500ml', category: 'Bebidas', unitValue: 3.00, costValue: 1.50, stock: 60, minStock: 30, barcode: '7891234567897' },
  { code: 'BEB009', description: 'Suco Natural de Laranja', category: 'Bebidas', unitValue: 6.00, costValue: 3.50, stock: 25, minStock: 10, barcode: '7891234567898' },
  { code: 'BEB010', description: 'Suco Natural de Maracujá', category: 'Bebidas', unitValue: 6.50, costValue: 3.80, stock: 20, minStock: 10, barcode: '7891234567899' },
  { code: 'BEB011', description: 'Café Expresso', category: 'Bebidas', unitValue: 3.50, costValue: 1.20, stock: 200, minStock: 100, barcode: '7891234567900' },
  { code: 'BEB012', description: 'Café com Leite', category: 'Bebidas', unitValue: 4.00, costValue: 1.80, stock: 150, minStock: 75, barcode: '7891234567901' },
  { code: 'BEB013', description: 'Cappuccino', category: 'Bebidas', unitValue: 5.50, costValue: 2.50, stock: 80, minStock: 40, barcode: '7891234567902' },
  { code: 'BEB014', description: 'Chá de Camomila', category: 'Bebidas', unitValue: 3.00, costValue: 1.00, stock: 50, minStock: 25, barcode: '7891234567903' },
  { code: 'BEB015', description: 'Chocolate Quente', category: 'Bebidas', unitValue: 4.50, costValue: 2.00, stock: 60, minStock: 30, barcode: '7891234567904' },

  // Lanches
  { code: 'LAN001', description: 'X-Burger', category: 'Lanches', unitValue: 12.00, costValue: 6.50, stock: 30, minStock: 15, barcode: '7891234567905' },
  { code: 'LAN002', description: 'X-Salada', category: 'Lanches', unitValue: 13.50, costValue: 7.20, stock: 25, minStock: 12, barcode: '7891234567906' },
  { code: 'LAN003', description: 'X-Bacon', category: 'Lanches', unitValue: 15.00, costValue: 8.00, stock: 20, minStock: 10, barcode: '7891234567907' },
  { code: 'LAN004', description: 'X-Tudo', category: 'Lanches', unitValue: 18.00, costValue: 9.50, stock: 15, minStock: 8, barcode: '7891234567908' },
  { code: 'LAN005', description: 'Hambúrguer Simples', category: 'Lanches', unitValue: 8.50, costValue: 4.50, stock: 40, minStock: 20, barcode: '7891234567909' },
  { code: 'LAN006', description: 'Hot Dog Simples', category: 'Lanches', unitValue: 6.00, costValue: 3.20, stock: 50, minStock: 25, barcode: '7891234567910' },
  { code: 'LAN007', description: 'Hot Dog Completo', category: 'Lanches', unitValue: 9.00, costValue: 4.80, stock: 35, minStock: 18, barcode: '7891234567911' },
  { code: 'LAN008', description: 'Misto Quente', category: 'Lanches', unitValue: 7.50, costValue: 4.00, stock: 30, minStock: 15, barcode: '7891234567912' },
  { code: 'LAN009', description: 'Sanduíche Natural', category: 'Lanches', unitValue: 10.00, costValue: 5.50, stock: 20, minStock: 10, barcode: '7891234567913' },
  { code: 'LAN010', description: 'Pastel de Carne', category: 'Lanches', unitValue: 5.50, costValue: 2.80, stock: 60, minStock: 30, barcode: '7891234567914' },
  { code: 'LAN011', description: 'Pastel de Queijo', category: 'Lanches', unitValue: 5.00, costValue: 2.50, stock: 60, minStock: 30, barcode: '7891234567915' },
  { code: 'LAN012', description: 'Coxinha de Frango', category: 'Lanches', unitValue: 4.50, costValue: 2.20, stock: 80, minStock: 40, barcode: '7891234567916' },
  { code: 'LAN013', description: 'Empada de Frango', category: 'Lanches', unitValue: 4.00, costValue: 2.00, stock: 70, minStock: 35, barcode: '7891234567917' },
  { code: 'LAN014', description: 'Pão de Açúcar', category: 'Lanches', unitValue: 2.50, costValue: 1.20, stock: 100, minStock: 50, barcode: '7891234567918' },
  { code: 'LAN015', description: 'Pão de Queijo', category: 'Lanches', unitValue: 3.00, costValue: 1.50, stock: 90, minStock: 45, barcode: '7891234567919' },

  // Doces e Sobremesas
  { code: 'DOC001', description: 'Brigadeiro', category: 'Doces', unitValue: 2.00, costValue: 0.80, stock: 100, minStock: 50, barcode: '7891234567920' },
  { code: 'DOC002', description: 'Beijinho', category: 'Doces', unitValue: 2.00, costValue: 0.80, stock: 80, minStock: 40, barcode: '7891234567921' },
  { code: 'DOC003', description: 'Pudim de Leite', category: 'Doces', unitValue: 6.00, costValue: 3.00, stock: 25, minStock: 12, barcode: '7891234567922' },
  { code: 'DOC004', description: 'Mousse de Chocolate', category: 'Doces', unitValue: 5.50, costValue: 2.80, stock: 30, minStock: 15, barcode: '7891234567923' },
  { code: 'DOC005', description: 'Torta de Limão', category: 'Doces', unitValue: 7.00, costValue: 3.50, stock: 20, minStock: 10, barcode: '7891234567924' },
  { code: 'DOC006', description: 'Açaí 300ml', category: 'Doces', unitValue: 8.00, costValue: 4.00, stock: 40, minStock: 20, barcode: '7891234567925' },
  { code: 'DOC007', description: 'Açaí 500ml', category: 'Doces', unitValue: 12.00, costValue: 6.00, stock: 30, minStock: 15, barcode: '7891234567926' },
  { code: 'DOC008', description: 'Sorvete de Morango', category: 'Doces', unitValue: 4.50, costValue: 2.20, stock: 50, minStock: 25, barcode: '7891234567927' },
  { code: 'DOC009', description: 'Sorvete de Chocolate', category: 'Doces', unitValue: 4.50, costValue: 2.20, stock: 50, minStock: 25, barcode: '7891234567928' },
  { code: 'DOC010', description: 'Sorvete de Baunilha', category: 'Doces', unitValue: 4.50, costValue: 2.20, stock: 50, minStock: 25, barcode: '7891234567929' },

  // Salgados e Aperitivos
  { code: 'SAL001', description: 'Batata Frita P', category: 'Salgados', unitValue: 6.00, costValue: 2.50, stock: 50, minStock: 25, barcode: '7891234567930' },
  { code: 'SAL002', description: 'Batata Frita G', category: 'Salgados', unitValue: 9.00, costValue: 4.00, stock: 30, minStock: 15, barcode: '7891234567931' },
  { code: 'SAL003', description: 'Anéis de Cebola', category: 'Salgados', unitValue: 8.00, costValue: 3.50, stock: 25, minStock: 12, barcode: '7891234567932' },
  { code: 'SAL004', description: 'Nuggets de Frango', category: 'Salgados', unitValue: 10.00, costValue: 5.00, stock: 20, minStock: 10, barcode: '7891234567933' },
  { code: 'SAL005', description: 'Frango a Passarinho', category: 'Salgados', unitValue: 12.00, costValue: 6.50, stock: 15, minStock: 8, barcode: '7891234567934' },
  { code: 'SAL006', description: 'Isca de Peixe', category: 'Salgados', unitValue: 11.00, costValue: 5.80, stock: 18, minStock: 9, barcode: '7891234567935' },
  { code: 'SAL007', description: 'Polenta Frita', category: 'Salgados', unitValue: 7.50, costValue: 3.20, stock: 35, minStock: 18, barcode: '7891234567936' },
  { code: 'SAL008', description: 'Mandioca Frita', category: 'Salgados', unitValue: 8.50, costValue: 3.80, stock: 30, minStock: 15, barcode: '7891234567937' },
  { code: 'SAL009', description: 'Bolinho de Bacalhau', category: 'Salgados', unitValue: 5.00, costValue: 2.50, stock: 40, minStock: 20, barcode: '7891234567938' },
  { code: 'SAL010', description: 'Kibe', category: 'Salgados', unitValue: 4.50, costValue: 2.20, stock: 45, minStock: 22, barcode: '7891234567939' },

  // Cervejas e Bebidas Alcoólicas
  { code: 'CER001', description: 'Skol Lata 350ml', category: 'Cervejas', unitValue: 4.50, costValue: 2.80, stock: 60, minStock: 30, barcode: '7891234567940' },
  { code: 'CER002', description: 'Brahma Lata 350ml', category: 'Cervejas', unitValue: 4.50, costValue: 2.80, stock: 55, minStock: 28, barcode: '7891234567941' },
  { code: 'CER003', description: 'Antarctica Lata 350ml', category: 'Cervejas', unitValue: 4.50, costValue: 2.80, stock: 50, minStock: 25, barcode: '7891234567942' },
  { code: 'CER004', description: 'Heineken Long Neck', category: 'Cervejas', unitValue: 8.00, costValue: 4.50, stock: 40, minStock: 20, barcode: '7891234567943' },
  { code: 'CER005', description: 'Stella Artois Long Neck', category: 'Cervejas', unitValue: 9.00, costValue: 5.00, stock: 35, minStock: 18, barcode: '7891234567944' },
  { code: 'CER006', description: 'Corona Long Neck', category: 'Cervejas', unitValue: 10.00, costValue: 5.50, stock: 30, minStock: 15, barcode: '7891234567945' },
  { code: 'CER007', description: 'Cerveja Artesanal IPA', category: 'Cervejas', unitValue: 12.00, costValue: 6.50, stock: 20, minStock: 10, barcode: '7891234567946' },
  { code: 'CER008', description: 'Cerveja Artesanal Pilsen', category: 'Cervejas', unitValue: 11.00, costValue: 6.00, stock: 22, minStock: 11, barcode: '7891234567947' },
  { code: 'CER009', description: 'Caipirinha', category: 'Bebidas Alcoólicas', unitValue: 15.00, costValue: 8.00, stock: 25, minStock: 12, barcode: '7891234567948' },
  { code: 'CER010', description: 'Caipiroska', category: 'Bebidas Alcoólicas', unitValue: 16.00, costValue: 8.50, stock: 20, minStock: 10, barcode: '7891234567949' },

  // Produtos Diversos
  { code: 'DIV001', description: 'Cigarro Malboro', category: 'Diversos', unitValue: 8.50, costValue: 6.00, stock: 50, minStock: 25, barcode: '7891234567950' },
  { code: 'DIV002', description: 'Cigarro Camel', category: 'Diversos', unitValue: 8.50, costValue: 6.00, stock: 45, minStock: 22, barcode: '7891234567951' },
  { code: 'DIV003', description: 'Chiclete Trident', category: 'Diversos', unitValue: 2.50, costValue: 1.20, stock: 100, minStock: 50, barcode: '7891234567952' },
  { code: 'DIV004', description: 'Chiclete Bubbaloo', category: 'Diversos', unitValue: 1.50, costValue: 0.80, stock: 120, minStock: 60, barcode: '7891234567953' },
  { code: 'DIV005', description: 'Bala de Goma', category: 'Diversos', unitValue: 0.50, costValue: 0.25, stock: 200, minStock: 100, barcode: '7891234567954' },
  { code: 'DIV006', description: 'Chocolate Snickers', category: 'Diversos', unitValue: 4.00, costValue: 2.20, stock: 80, minStock: 40, barcode: '7891234567955' },
  { code: 'DIV007', description: 'Chocolate Kit Kat', category: 'Diversos', unitValue: 3.50, costValue: 1.90, stock: 75, minStock: 38, barcode: '7891234567956' },
  { code: 'DIV008', description: 'Chocolate Twix', category: 'Diversos', unitValue: 3.50, costValue: 1.90, stock: 70, minStock: 35, barcode: '7891234567957' },
  { code: 'DIV009', description: 'Energético Red Bull', category: 'Diversos', unitValue: 8.00, costValue: 4.50, stock: 40, minStock: 20, barcode: '7891234567958' },
  { code: 'DIV010', description: 'Energético Monster', category: 'Diversos', unitValue: 7.50, costValue: 4.20, stock: 35, minStock: 18, barcode: '7891234567959' }
];

const seedLanchonete = async () => {
  try {
    console.log('🔄 Adicionando produtos de lanchonete...');
    
    // Verificar se os produtos já existem
    for (const productData of lanchoneteProducts) {
      const existingProduct = await Product.findOne({
        where: { code: productData.code }
      });
      
      if (!existingProduct) {
        await Product.create({
          code: productData.code,
          description: productData.description,
          category: productData.category,
          unitValue: productData.unitValue,
          costValue: productData.costValue,
          stock: productData.stock,
          minStock: productData.minStock,
          barcode: productData.barcode,
          taxSituation: 'Tributado',
          ncm: '22030000', // Código NCM para bebidas
          active: true
        });
        console.log(`✅ Produto criado: ${productData.description}`);
      } else {
        console.log(`⚠️  Produto já existe: ${productData.description}`);
      }
    }
    
    console.log('🎉 Produtos de lanchonete adicionados com sucesso!');
    
    // Mostrar estatísticas
    const totalProducts = await Product.count();
    const categories = await Product.findAll({
      attributes: ['category'],
      group: ['category'],
      order: [['category', 'ASC']]
    });
    
    console.log(`📊 Total de produtos no sistema: ${totalProducts}`);
    console.log('📋 Categorias disponíveis:');
    categories.forEach(cat => {
      console.log(`   - ${cat.category}`);
    });
    
  } catch (error) {
    console.error('❌ Erro ao adicionar produtos de lanchonete:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
};

seedLanchonete();
