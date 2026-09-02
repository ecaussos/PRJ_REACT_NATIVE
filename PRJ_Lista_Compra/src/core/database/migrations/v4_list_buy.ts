export async function up(db: any) {
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS list_buy (
      id_list_buy INTEGER PRIMARY KEY AUTOINCREMENT,
      id_product TEXT NOT NULL,
      qt_product REAL NOT NULL,
      fl_bought INTEGER NOT NULL DEFAULT 0,
      dt_list_buy TEXT NOT NULL,
      CONSTRAINT fk_list_buy_product FOREIGN KEY (id_product) REFERENCES product (id_product)
    );
  `);
}