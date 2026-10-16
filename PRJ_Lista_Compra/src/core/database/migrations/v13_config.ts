// src/database/migrations/v12_config.ts

/**
 * Migration para criação e população inicial da tabela de configurações
 */
async function up(db: any): Promise<void> {
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS config (
      id_config TEXT PRIMARY KEY,
      id_tp_config TEXT NOT NULL,
      url_config VARCHAR(255),
      port_config INTEGER,
      user_config VARCHAR(100),
      key_config VARCHAR(255),
      vers_config VARCHAR(50),
      st_ssl INTEGER NOT NULL,
      st_config INTEGER NOT NULL,
      dt_config TEXT DEFAULT (CURRENT_TIMESTAMP),
      at_updated TEXT NULL,
      at_delete TEXT NULL,
      st_sync INTEGER,
      FOREIGN KEY (id_tp_config) REFERENCES config_type (id_tp_config) ON DELETE RESTRICT
    );
  `);
  console.log('[Migration] v12_config: Tabela e configuração padrão inicializadas com sucesso.');
}

export default up;