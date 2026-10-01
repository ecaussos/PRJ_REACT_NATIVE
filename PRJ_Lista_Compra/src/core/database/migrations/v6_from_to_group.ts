export async function up(db: any) {
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS from_to_group (
      id_external INTEGER,
      description TEXT,
      id_group INTEGER,
      CONSTRAINT fk_from_to_group FOREIGN KEY (id_group) REFERENCES group_product(id_group) ON DELETE SET NULL
    );
  `);
}