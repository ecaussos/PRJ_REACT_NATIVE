// src/database/migrations/v12_insert_config_tp.ts

/**
 * Migration para popular os grupos de produtos padrão
 */
async function up(db: any): Promise<void> {
  // Verifica se a tabela já possui algum registro para evitar duplicação
  const configCount = await db.getFirstAsync(`SELECT COUNT(*) as count FROM config_type;`);

  if (configCount && (configCount.count === 0 || configCount.count === '0')) {
    await db.execAsync(`
      INSERT INTO config_type (id_tp_config, ds_tp_config) VALUES
      ('1', 'BD Local'),
      ('2', 'BD Cloud'),
      ('3', 'BD Sync'),
      ('4', 'API Cosmos'),
      ('5', 'API Gemini'),
      ('6', 'API OpenFood');
    `);
    console.log('[Migration] v12_insert_config_tp: Tipo de configuração padrões inseridos com sucesso.');
  } else {
    console.log('[Migration] v12_insert_group: Tipo de configuração já existem. Nenhuma ação necessária.');
  }
}

export default up;