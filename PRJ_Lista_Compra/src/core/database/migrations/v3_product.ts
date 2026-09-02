export async function up(db: any) {
await db.execAsync(`
    CREATE TABLE IF NOT EXISTS product (
      id_product INTEGER PRIMARY KEY AUTOINCREMENT,
      nm_product TEXT NOT NULL,
      id_group INTEGER NOT NULL,
      cd_product_gtin TEXT,
      CONSTRAINT fk_product_group FOREIGN KEY (id_group) REFERENCES group_product (id_group)
    );
  `);
}