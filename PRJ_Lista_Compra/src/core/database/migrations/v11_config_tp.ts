export async function up(db: any) {
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS config_type (
        id_tp_config INTEGER PRIMARY KEY AUTOINCREMENT,
        ds_tp_config TEXT NOT NULL
    );
    INSERT OR IGNORE INTO config_type (id_tp_config, ds_tp_config) VALUES 
        (1, 'BD Local'),
        (2, 'BD Cloud'),
        (3, 'API Cosmos'),
        (4, 'API Gemini');
    `);
}