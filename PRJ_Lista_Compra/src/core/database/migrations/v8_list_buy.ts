// src/database/migrations/v8_list_buy.ts

/**
 * Migration para criação da tabela de lista de compras
 */
async function up(db: any): Promise<void> {
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS list_buy (
      id_list_buy TEXT PRIMARY KEY,
      id_product TEXT NOT NULL,
      qt_product DECIMAL(10, 2) DEFAULT 1.00,
      fl_bought INTEGER DEFAULT 0,
      dt_list_buy TEXT DEFAULT (CURRENT_TIMESTAMP),
      at_updated TEXT NULL,
      at_delete TEXT NULL,
      st_sync INTEGER,
      FOREIGN KEY (id_product) REFERENCES product(id_product) ON DELETE CASCADE
    );
  `);
  console.log('[Migration] v8_list_buy aplicada com sucesso.');
}

export default up;