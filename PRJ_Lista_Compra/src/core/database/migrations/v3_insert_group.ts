// src/database/migrations/v3_insert_group.ts

/**
 * Migration para popular os grupos de produtos padrão
 */
async function up(db: any): Promise<void> {
  // Verifica se a tabela já possui algum registro para evitar duplicação
  const groupCount = await db.getFirstAsync(`SELECT COUNT(*) as count FROM group_product;`);

  if (groupCount && (groupCount.count === 0 || groupCount.count === '0')) {
    await db.execAsync(`
      INSERT INTO group_product (id_group, nm_group) VALUES
      ('1', 'MERCEARIA'),
      ('2', 'BEBIDAS'),
      ('3', 'FRIOS E LATICÍNIOS'),
      ('4', 'AÇOUGUE E PEIXARIA'),
      ('5', 'HORTIFRÚTI'),
      ('6', 'PADARIA E CONFEITARIA'),
      ('7', 'CONGELATOS'),
      ('8', 'HIGIENE E PERFUMARIA'),
      ('9', 'LIMPEZA'),
      ('10', 'NÃO CLASSIFICADOS');
    `);
    console.log('[Migration] v3_insert_group: Grupos padrões inseridos com sucesso.');
  } else {
    console.log('[Migration] v3_insert_group: Grupos já existem. Nenhuma ação necessária.');
  }
}

export default up;