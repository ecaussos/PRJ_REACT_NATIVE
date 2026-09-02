import * as SQLite from 'expo-sqlite';
import { runMigrations } from './migrations';

// Defina aqui o nome do arquivo do seu banco de dados local (ex: 'listbuy.db')
const DATABASE_NAME = 'listbuy.db';

let dbInstance: SQLite.SQLiteDatabase | null = null;

export async function getDBConnection(): Promise<SQLite.SQLiteDatabase> {
  if (dbInstance) {
    return dbInstance;
  }

  // É aqui que o nome do banco de dados é informado:
  dbInstance = await SQLite.openDatabaseAsync(DATABASE_NAME);

  // Executa as migrações logo após abrir a conexão pela primeira vez
  await runMigrations(dbInstance);

  return dbInstance;
}