// src/database/migrations/v4_product.ts

/**
 * Migration para criação da tabela de produtos
 */
async function up(db: any): Promise<void> {
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS product (
      id_product TEXT PRIMARY KEY,
      nm_product TEXT NOT NULL,
      id_group TEXT,
      cd_product_gtin TEXT,
      at_updated TEXT NULL,
      at_delete TEXT NULL,
      st_sync INTEGER,
      FOREIGN KEY (id_group) REFERENCES group_product(id_group) ON DELETE SET NULL
    );
  `);
  console.log('[Migration] v4_product aplicada com sucesso.');
}

export default up;