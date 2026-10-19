// src/database/migrations/v14_insert_config.ts

/**
 * Migration para popular os grupos de produtos padrão
 */
async function up(db: any): Promise<void> {
  // Verifica se a tabela já possui algum registro para evitar duplicação
  const configCount = await db.getFirstAsync(`SELECT COUNT(*) as count FROM config;`);

  if (configCount && (configCount.count === 0 || configCount.count === '0')) {
    await db.execAsync(`
      INSERT INTO config (id_config, id_tp_config, url_config, port_config, user_config, key_config, st_ssl, st_config) VALUES
      ('1', '1', NULL, NULL, NULL, NULL, 1, 1);
    `);
    console.log('[Migration] v14_insert_config: Configuração padrões inseridos com sucesso.');
  } else {
    console.log('[Migration] v14_insert_config: Configuração já existem. Nenhuma ação necessária.');
  }
}
export default up;