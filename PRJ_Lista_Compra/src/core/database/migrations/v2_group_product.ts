export async function up(db: any) {
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS group_product (
      id_group INTEGER PRIMARY KEY AUTOINCREMENT,
      nm_group TEXT NOT NULL UNIQUE
    );
  `);
}