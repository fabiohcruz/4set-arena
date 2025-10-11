import pool from '../config/database';

async function seedMembers() {
  try {
    console.log('🌱 Iniciando seed de membros...');

    // Verificar se já existem membros
    const checkQuery = 'SELECT COUNT(*) as count FROM members';
    const checkResult = await pool.query(checkQuery);
    const memberCount = parseInt(checkResult.rows[0].count);

    if (memberCount > 0) {
      console.log(`✅ Já existem ${memberCount} membros no banco. Pulando seed.`);
      return;
    }

    // Dados de exemplo para membros
    const membersData = [
      {
        member_code: 'MEM0001',
        full_name: 'João Silva',
        email: 'joao@email.com',
        phone: '(11) 99999-9999',
        birth_date: '1990-05-15',
        address: 'Rua das Flores, 123',
        emergency_contact: 'Maria Silva',
        emergency_phone: '(11) 88888-8888',
        membership_type: 'premium',
        status: 'active',
        join_date: '2024-01-15'
      },
      {
        member_code: 'MEM0002',
        full_name: 'Maria Santos',
        email: 'maria@email.com',
        phone: '(11) 88888-8888',
        birth_date: '1985-08-22',
        address: 'Av. Paulista, 456',
        emergency_contact: 'José Santos',
        emergency_phone: '(11) 77777-7777',
        membership_type: 'regular',
        status: 'active',
        join_date: '2024-02-01'
      },
      {
        member_code: 'MEM0003',
        full_name: 'Pedro Costa',
        email: 'pedro@email.com',
        phone: '(11) 77777-7777',
        birth_date: '1992-12-10',
        address: 'Rua Augusta, 789',
        emergency_contact: 'Ana Costa',
        emergency_phone: '(11) 66666-6666',
        membership_type: 'vip',
        status: 'inactive',
        join_date: '2024-01-10'
      },
      {
        member_code: 'MEM0004',
        full_name: 'Ana Oliveira',
        email: 'ana@email.com',
        phone: '(11) 66666-6666',
        birth_date: '1988-03-25',
        address: 'Rua Consolação, 321',
        emergency_contact: 'Carlos Oliveira',
        emergency_phone: '(11) 55555-5555',
        membership_type: 'regular',
        status: 'active',
        join_date: '2024-03-01'
      },
      {
        member_code: 'MEM0005',
        full_name: 'Carlos Ferreira',
        email: 'carlos@email.com',
        phone: '(11) 55555-5555',
        birth_date: '1995-07-18',
        address: 'Av. Faria Lima, 654',
        emergency_contact: 'Lucia Ferreira',
        emergency_phone: '(11) 44444-4444',
        membership_type: 'premium',
        status: 'suspended',
        join_date: '2024-02-15'
      }
    ];

    // Inserir membros
    const insertQuery = `
      INSERT INTO members (
        member_code, full_name, email, phone, birth_date, address,
        emergency_contact, emergency_phone, membership_type, status, join_date
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
    `;

    for (const member of membersData) {
      await pool.query(insertQuery, [
        member.member_code,
        member.full_name,
        member.email,
        member.phone,
        member.birth_date,
        member.address,
        member.emergency_contact,
        member.emergency_phone,
        member.membership_type,
        member.status,
        member.join_date
      ]);
    }

    console.log(`✅ ${membersData.length} membros inseridos com sucesso!`);
    
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
    
    console.log('\n📊 Estatísticas dos membros:');
    console.log(`   Total: ${stats.total}`);
    console.log(`   Ativos: ${stats.active}`);
    console.log(`   Inativos: ${stats.inactive}`);
    console.log(`   Suspensos: ${stats.suspended}`);
    console.log(`   Regular: ${stats.regular}`);
    console.log(`   Premium: ${stats.premium}`);
    console.log(`   VIP: ${stats.vip}`);

  } catch (error) {
    console.error('❌ Erro ao fazer seed de membros:', error);
    throw error;
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  seedMembers()
    .then(() => {
      console.log('🎉 Seed de membros concluído!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Erro no seed de membros:', error);
      process.exit(1);
    });
}

export default seedMembers;

