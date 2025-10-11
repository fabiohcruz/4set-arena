import pool from '../config/database';

// Função para gerar CPF válido
function generateCPF(): string {
  const cpf = Array.from({ length: 9 }, () => Math.floor(Math.random() * 10));
  
  // Primeiro dígito verificador
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += cpf[i] * (10 - i);
  }
  let remainder = sum % 11;
  cpf[9] = remainder < 2 ? 0 : 11 - remainder;
  
  // Segundo dígito verificador
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += cpf[i] * (11 - i);
  }
  remainder = sum % 11;
  cpf[10] = remainder < 2 ? 0 : 11 - remainder;
  
  return cpf.join('').replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}

// Função para gerar telefone
function generatePhone(): string {
  const ddd = ['11', '21', '31', '41', '51', '61', '71', '81', '85', '47', '48', '49'];
  const randomDDD = ddd[Math.floor(Math.random() * ddd.length)];
  const number = Math.floor(Math.random() * 900000000) + 100000000;
  return `(${randomDDD}) ${number.toString().substring(0, 5)}-${number.toString().substring(5)}`;
}

// Função para gerar data de nascimento
function generateBirthDate(): string {
  const year = Math.floor(Math.random() * 50) + 1970; // 1970-2020
  const month = Math.floor(Math.random() * 12) + 1;
  const day = Math.floor(Math.random() * 28) + 1; // Evitar problemas com fevereiro
  return `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
}

// Função para gerar data de entrada
function generateJoinDate(): string {
  const year = 2024;
  const month = Math.floor(Math.random() * 12) + 1;
  const day = Math.floor(Math.random() * 28) + 1;
  return `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
}

async function seedClients() {
  try {
    console.log('🌱 Iniciando seed de clientes...');

    // Verificar se já existem muitos clientes
    const checkQuery = 'SELECT COUNT(*) as count FROM members';
    const checkResult = await pool.query(checkQuery);
    const memberCount = parseInt(checkResult.rows[0].count);

    if (memberCount >= 30) {
      console.log(`✅ Já existem ${memberCount} clientes no banco. Pulando seed.`);
      return;
    }

    // Nomes brasileiros realistas
    const firstNames = [
      'Ana', 'Carlos', 'Maria', 'João', 'Fernanda', 'Ricardo', 'Juliana', 'Pedro',
      'Camila', 'Lucas', 'Beatriz', 'Rafael', 'Larissa', 'Diego', 'Amanda', 'Gabriel',
      'Mariana', 'Felipe', 'Carolina', 'Thiago', 'Natália', 'Bruno', 'Isabela', 'André',
      'Patrícia', 'Marcos', 'Vanessa', 'Rodrigo', 'Priscila', 'Leandro', 'Tatiana', 'Gustavo',
      'Renata', 'Alexandre', 'Cristina', 'Daniel', 'Simone', 'Eduardo', 'Mônica', 'Vinícius'
    ];

    const lastNames = [
      'Silva', 'Santos', 'Oliveira', 'Souza', 'Rodrigues', 'Ferreira', 'Alves', 'Pereira',
      'Lima', 'Gomes', 'Costa', 'Ribeiro', 'Martins', 'Carvalho', 'Almeida', 'Lopes',
      'Soares', 'Fernandes', 'Vieira', 'Barbosa', 'Rocha', 'Dias', 'Monteiro', 'Cardoso',
      'Reis', 'Araújo', 'Cunha', 'Moreira', 'Mendes', 'Nascimento', 'Freitas', 'Campos'
    ];

    const cities = [
      'São Paulo', 'Rio de Janeiro', 'Belo Horizonte', 'Salvador', 'Brasília', 'Fortaleza',
      'Manaus', 'Curitiba', 'Recife', 'Porto Alegre', 'Belém', 'Goiânia', 'Guarulhos',
      'Campinas', 'São Luís', 'São Gonçalo', 'Maceió', 'Duque de Caxias', 'Natal',
      'Teresina', 'Campo Grande', 'Nova Iguaçu', 'São Bernardo do Campo', 'João Pessoa'
    ];

    const states = [
      'SP', 'RJ', 'MG', 'BA', 'DF', 'CE', 'AM', 'PR', 'PE', 'RS', 'PA', 'GO', 'MA',
      'AL', 'RN', 'PI', 'MS', 'PB', 'SC', 'ES', 'MT', 'AC', 'RO', 'RR', 'AP', 'TO'
    ];

    const membershipTypes = ['regular', 'premium', 'vip'];
    const statuses = ['active', 'inactive', 'suspended'];

    // Gerar 30 clientes
    const clientsData = [];
    const usedEmails = new Set();
    const usedMemberCodes = new Set();

    for (let i = 1; i <= 30; i++) {
      const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
      const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
      const fullName = `${firstName} ${lastName}`;
      
      // Gerar email único
      let email;
      do {
        const emailPrefix = `${firstName.toLowerCase()}.${lastName.toLowerCase()}`;
        const emailSuffix = ['@gmail.com', '@hotmail.com', '@yahoo.com.br', '@outlook.com', '@uol.com.br'][Math.floor(Math.random() * 5)];
        email = `${emailPrefix}${Math.floor(Math.random() * 100)}${emailSuffix}`;
      } while (usedEmails.has(email));
      usedEmails.add(email);

      // Gerar código de membro único
      let memberCode;
      do {
        memberCode = `MEM${(memberCount + i).toString().padStart(4, '0')}`;
      } while (usedMemberCodes.has(memberCode));
      usedMemberCodes.add(memberCode);

      const city = cities[Math.floor(Math.random() * cities.length)];
      const state = states[Math.floor(Math.random() * states.length)];
      const streetNumber = Math.floor(Math.random() * 9999) + 1;
      const streetName = ['Rua', 'Avenida', 'Alameda', 'Travessa'][Math.floor(Math.random() * 4)];
      const streetNames = [
        'das Flores', 'da Paz', 'do Comércio', 'das Palmeiras', 'dos Santos', 'da Liberdade',
        'do Sol', 'das Rosas', 'da Esperança', 'do Progresso', 'das Américas', 'da Vitória',
        'dos Navegantes', 'das Estrelas', 'do Mar', 'das Montanhas', 'da Floresta', 'do Rio'
      ];
      const street = streetNames[Math.floor(Math.random() * streetNames.length)];

      // Gerar contato de emergência
      const emergencyFirstName = firstNames[Math.floor(Math.random() * firstNames.length)];
      const emergencyLastName = lastNames[Math.floor(Math.random() * lastNames.length)];
      const emergencyContact = `${emergencyFirstName} ${emergencyLastName}`;

      clientsData.push({
        member_code: memberCode,
        full_name: fullName,
        email: email,
        phone: generatePhone(),
        birth_date: generateBirthDate(),
        address: `${streetName} ${street}, ${streetNumber}`,
        city: city,
        state: state,
        zip_code: `${Math.floor(Math.random() * 90000) + 10000}-${Math.floor(Math.random() * 900) + 100}`,
        emergency_contact: emergencyContact,
        emergency_phone: generatePhone(),
        membership_type: membershipTypes[Math.floor(Math.random() * membershipTypes.length)],
        status: statuses[Math.floor(Math.random() * statuses.length)],
        join_date: generateJoinDate()
      });
    }

    // Inserir clientes
    const insertQuery = `
      INSERT INTO members (
        member_code, full_name, email, phone, birth_date, address, city, state, zip_code,
        emergency_contact, emergency_phone, membership_type, status, join_date
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
    `;

    for (const client of clientsData) {
      await pool.query(insertQuery, [
        client.member_code,
        client.full_name,
        client.email,
        client.phone,
        client.birth_date,
        client.address,
        client.city,
        client.state,
        client.zip_code,
        client.emergency_contact,
        client.emergency_phone,
        client.membership_type,
        client.status,
        client.join_date
      ]);
    }

    console.log(`✅ ${clientsData.length} clientes inseridos com sucesso!`);
    
    // Mostrar estatísticas
    const statsQuery = `
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN status = 'active' THEN 1 END) as active,
        COUNT(CASE WHEN status = 'inactive' THEN 1 END) as inactive,
        COUNT(CASE WHEN status = 'suspended' THEN 1 END) as suspended,
        COUNT(CASE WHEN membership_type = 'regular' THEN 1 END) as regular,
        COUNT(CASE WHEN membership_type = 'premium' THEN 1 END) as premium,
        COUNT(CASE WHEN membership_type = 'vip' THEN 1 END) as vip
      FROM members
    `;
    
    const statsResult = await pool.query(statsQuery);
    const stats = statsResult.rows[0];
    
    console.log('\n📊 Estatísticas dos clientes:');
    console.log(`   Total: ${stats.total}`);
    console.log(`   Ativos: ${stats.active}`);
    console.log(`   Inativos: ${stats.inactive}`);
    console.log(`   Suspensos: ${stats.suspended}`);
    console.log(`   Regular: ${stats.regular}`);
    console.log(`   Premium: ${stats.premium}`);
    console.log(`   VIP: ${stats.vip}`);

    // Mostrar alguns exemplos
    console.log('\n👥 Exemplos de clientes criados:');
    const examplesQuery = 'SELECT member_code, full_name, email, city, state, membership_type, status FROM members ORDER BY id DESC LIMIT 5';
    const examplesResult = await pool.query(examplesQuery);
    
    examplesResult.rows.forEach((client, index) => {
      console.log(`   ${index + 1}. ${client.full_name} (${client.member_code}) - ${client.email} - ${client.city}/${client.state}/${client.membership_type}/${client.status}`);
    });

  } catch (error) {
    console.error('❌ Erro ao fazer seed de clientes:', error);
    throw error;
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  seedClients()
    .then(() => {
      console.log('🎉 Seed de clientes concluído!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Erro no seed de clientes:', error);
      process.exit(1);
    });
}

export default seedClients;
