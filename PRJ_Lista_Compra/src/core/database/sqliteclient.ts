import * as SQLite from 'expo-sqlite';
import { runMigrations } from './migrations';

const DATABASE_NAME = 'listbuy.db';

let dbInstance: SQLite.SQLiteDatabase | null = null;
let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

export async function getDBConnection(): Promise<SQLite.SQLiteDatabase> {
  // 1. Se o banco já está aberto e pronto, retorna a instância
  if (dbInstance) {
    return dbInstance;
  }

  // 2. Se a inicialização já está em andamento, aguarda a mesma promessa
  if (dbPromise) {
    return dbPromise;
  }

  // 3. Inicia a promessa de conexão isolada
  dbPromise = (async () => {
    try {
      const db = await SQLite.openDatabaseAsync(DATABASE_NAME);

      // Executa as migrações apenas uma vez durante a abertura
      await runMigrations(db);

      dbInstance = db;
      return db;
    } catch (error) {
      // Se falhar, reseta a promessa para permitir novas tentativas
      dbPromise = null;
      throw error;
    }
  })();

  return dbPromise;
}