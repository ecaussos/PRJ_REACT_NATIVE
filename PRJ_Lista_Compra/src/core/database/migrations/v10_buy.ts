export async function up(db: any) {
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS  buy (
      id_product   INTEGER NOT NULL,
      qt_product   DECIMAL(10,3) NOT NULL DEFAULT 1.000,
      vl_product   DECIMAL(10,2) NOT NULL DEFAULT 0.00,
      dt_list_buy  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (id_product),
      CONSTRAINT fk_buy_product FOREIGN KEY (id_product) REFERENCES product (id_product)
    );
  `);
}