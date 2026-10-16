// src/database/migrations/v8_hist_buy.ts

/**
 * Migration para criação da tabela de histórico de compras
 */
async function up(db: any): Promise<void> {
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS hist_buy (
      id_hist_buy TEXT PRIMARY KEY,
      id_product TEXT NOT NULL,
      id_supplier TEXT,
      qt_product DECIMAL(10, 2) DEFAULT 1.00,
      vl_product DECIMAL(10, 2) DEFAULT 0.00,
      dt_list_buy TEXT,
      dt_hist_buy TEXT DEFAULT (CURRENT_TIMESTAMP),
      at_updated TEXT NULL,
      at_delete TEXT NULL,
      st_sync INTEGER,
      FOREIGN KEY (id_product) REFERENCES product(id_product) ON DELETE CASCADE,
      FOREIGN KEY (id_supplier) REFERENCES supplier(id_supplier) ON DELETE SET NULL
    );
  `);
  console.log('[Migration] v8_hist_buy aplicada com sucesso.');
}

export default up;