export async function up(db: any) {
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS hist_buy (
      id_hist_buy INTEGER PRIMARY KEY AUTOINCREMENT,
      id_supplier INTEGER NOT NULL,
      id_product INTEGER NOT NULL,
      vl_product REAL NOT NULL,
      qt_product REAL NOT NULL,
      dt_list_buy TEXT NOT NULL,
      dt_hist_buy TEXT NOT NULL,
      CONSTRAINT fk_hist_buy_supplier FOREIGN KEY (id_supplier) REFERENCES "supplier"(id_supplier),
      CONSTRAINT fk_hist_buy_product FOREIGN KEY (id_product) REFERENCES "product" (id_product)
    );
  `);
}