// src/database/migrations/v2_group_product.ts

/**
 * Migration para criação da tabela de grupos de produtos
 */
async function up(db: any): Promise<void> {
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS group_product (
      id_group TEXT PRIMARY KEY,
      nm_group TEXT NOT NULL,
      at_updated TEXT NULL,
      at_delete TEXT NULL,
      st_sync INTEGER NULL
    );
  `);
  console.log('[Migration] v2_group_product aplicada com sucesso.');
}

export default up;