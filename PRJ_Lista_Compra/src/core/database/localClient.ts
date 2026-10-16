// src/core/database/localClient.ts

import * as SQLite from 'expo-sqlite';
import { DbClient } from './database';

let dbInstance: SQLite.SQLiteDatabase | null = null;

export async function getLocalConnection(): Promise<DbClient> {
  if (!dbInstance) {
    try {
      dbInstance = await SQLite.openDatabaseAsync('app_database.db');
      console.log('[LocalClient] 📱 Conexão SQLite Local criada com sucesso.');
    } catch (error) {
      console.error('[LocalClient] ❌ Erro ao abrir banco de dados SQLite Local:', error);
      dbInstance = null;
      throw error;
    }
  }

  const nativeDb = dbInstance;

  return {
    async getAllAsync<T>(query: string, params: any[] = []): Promise<T[]> {
      console.log('[LocalClient] 📤 Executando getAllAsync:', query);
      const results = await nativeDb.getAllAsync<T>(query, params);
      console.log(`[LocalClient] 📥 Sucesso! Registros retornados: ${results.length}`);
      return results;
    },

    async getFirstAsync<T>(query: string, params: any[] = []): Promise<T | null> {
      console.log('[LocalClient] 📤 Executando getFirstAsync:', query);
      const result = await nativeDb.getFirstAsync<T>(query, params);
      return result || null;
    },

    async runAsync(query: string, params: any[] = []): Promise<{ lastInsertRowId: number; changes: number }> {
      console.log('[LocalClient] 📤 Executando runAsync:', query);
      const result = await nativeDb.runAsync(query, params);
      console.log(`[LocalClient] 📥 Executado com sucesso. Insert ID: ${result.lastInsertRowId}, Linhas afetadas: ${result.changes}`);
      return {
        lastInsertRowId: result.lastInsertRowId,
        changes: result.changes,
      };
    },

    async execAsync(query: string): Promise<void> {
      console.log('[LocalClient] 📤 Executando execAsync (script DDL/DML)');
      await nativeDb.execAsync(query);
    },
  };
}