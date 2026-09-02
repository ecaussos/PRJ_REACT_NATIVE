export async function up(db: any) {
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS from_to_group (
      parent_id INTEGER PRIMARY KEY,
      description TEXT,
      id_group INTEGER,
      CONSTRAINT fk_from_to_group FOREIGN KEY (id_group) REFERENCES group_product(id_group) ON DELETE SET NULL
    );
  `);
}