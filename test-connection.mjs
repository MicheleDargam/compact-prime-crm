import 'dotenv/config';
import pg from 'pg';

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function testConnection() {
  console.log('🔌 Tentando conectar ao banco Supabase...\n');

  try {
    const client = await pool.connect();
    console.log('✅ CONEXÃO BEM SUCEDIDA!\n');

    // Verificar versão do PostgreSQL
    const versionResult = await client.query('SELECT version()');
    console.log('📦 Versão do PostgreSQL:', versionResult.rows[0].version.split(',')[0]);

    // Listar todas as tabelas do schema public
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);

    console.log(`\n📋 Tabelas encontradas no schema "public": ${tablesResult.rows.length}\n`);
    console.log('─'.repeat(55));
    console.log(`${'TABELA'.padEnd(35)} | ${'REGISTROS'.padStart(15)}`);
    console.log('─'.repeat(55));

    for (const row of tablesResult.rows) {
      try {
        const countResult = await client.query(`SELECT COUNT(*) as total FROM "${row.table_name}"`);
        const count = countResult.rows[0].total;
        console.log(`${row.table_name.padEnd(35)} | ${String(count).padStart(15)}`);
      } catch (err) {
        console.log(`${row.table_name.padEnd(35)} | ${'ERRO'.padStart(15)}`);
      }
    }

    console.log('─'.repeat(55));

    // Verificar se as tabelas do Prisma schema existem
    const expectedTables = [
      'categorias_cliente', 'cliente_telefones', 'clientes', 'combo_servicos',
      'combos', 'contratos', 'despesas_buffet', 'evento_funcionarios',
      'evento_servicos', 'evento_status_historico', 'eventos', 'funcionarios',
      'pagamentos', 'parcelas', 'proposta_servicos', 'propostas', 'recibos',
      'regras_comerciais', 'configuracoes_empresa', 'reserva_buffet',
      'socias', 'retiradas_socias', 'servicos'
    ];

    const existingTables = tablesResult.rows.map(r => r.table_name);
    const missing = expectedTables.filter(t => !existingTables.includes(t));

    if (missing.length === 0) {
      console.log('\n🎉 TODAS as tabelas do schema Prisma existem no banco!');
    } else {
      console.log(`\n⚠️  Tabelas FALTANDO no banco (${missing.length}):`);
      missing.forEach(t => console.log(`   ❌ ${t}`));
    }

    const extra = existingTables.filter(t => !expectedTables.includes(t) && !t.startsWith('_prisma'));
    if (extra.length > 0) {
      console.log(`\n📌 Tabelas EXTRAS no banco (não estão no schema Prisma):`);
      extra.forEach(t => console.log(`   ➕ ${t}`));
    }

    client.release();
  } catch (error) {
    console.error('❌ ERRO NA CONEXÃO:', error.message);
    if (error.code) console.error('   Código:', error.code);
  } finally {
    await pool.end();
  }
}

testConnection();
