// src/database/migrations/v6_from_to_group.ts

/**
 * Migration para criação da tabela de De-Para (NCM / Categorias)
 */
async function up(db: any): Promise<void> {
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS from_to_group (
      id_external TEXT PRIMARY KEY,
      description TEXT,
      keywords TEXT,
      tag TEXT,
      id_group TEXT NOT NULL,
      at_updated TEXT NULL,
      at_delete TEXT NULL,
      st_sync INTEGER,
      FOREIGN KEY (id_group) REFERENCES group_product(id_group) ON DELETE SET NULL
    );
  `);
  console.log('[Migration] v6_from_to_group aplicada com sucesso.');
}

export default up;