export async function up(db: any) {
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS supplier (
      id_supplier INTEGER PRIMARY KEY AUTOINCREMENT,
      nm_supplier TEXT NOT NULL
    );
  `);
}