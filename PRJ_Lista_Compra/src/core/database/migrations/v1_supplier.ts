// src/database/migrations/v1_supplier.ts

/**
 * Migration para criação da tabela de fornecedores
 */
async function up(db: any): Promise<void> {
  // Executa o CREATE TABLE padrão
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS supplier (
      id_supplier TEXT PRIMARY KEY,
      nm_supplier TEXT NOT NULL,
      at_updated TEXT NULL,
      at_delete TEXT NULL,
      st_sync INTEGER NULL
    );
  `);
  console.log('[Migration] v1_supplier aplicada com sucesso.');
}

export default up;