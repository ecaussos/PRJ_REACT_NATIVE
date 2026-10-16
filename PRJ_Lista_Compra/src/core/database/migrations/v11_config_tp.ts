// src/database/migrations/v11_config_tp.ts
/**
 * Migration para criação e população dos tipos de configurações do sistema
 */
async function up(db: any): Promise<void> {
  // 1. Criação da tabela config_type (sem a vírgula sobressalente antes do parêntese)
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS config_type (
      id_tp_config TEXT PRIMARY KEY,
      ds_tp_config TEXT NOT NULL,
      at_updated TEXT NULL,
      at_delete TEXT NULL,
      st_sync INTEGER
    );
  `);
  console.log('[Migration] v11_config_tp aplicada com sucesso.');
}

export default up;