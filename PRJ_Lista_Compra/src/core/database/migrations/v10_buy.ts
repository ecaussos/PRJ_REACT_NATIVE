// src/database/migrations/v10_buy.ts

/**
 * Migration para criação da tabela de compra atual/carrinho
 */
async function up(db: any): Promise<void> {
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS buy (
      id_product TEXT PRIMARY KEY,
      qt_product DECIMAL(10,3) NOT NULL DEFAULT 1.000,
      vl_product DECIMAL(10,2) NOT NULL DEFAULT 0.00,
      dt_list_buy TEXT,
      at_updated TEXT NULL,
      at_delete TEXT NULL,
      st_sync INTEGER,
      CONSTRAINT fk_buy_product FOREIGN KEY (id_product) REFERENCES product (id_product) ON DELETE CASCADE
    );
  `);
  console.log('[Migration] v10_buy aplicada com sucesso.');
}

export default up;