// src/core/database/tursoClient.ts

import { createClient as createTursoClient, Client as TursoClient } from '@libsql/client/web';
import { ConfigItem, DbClient } from '../database';

let tursoInstance: TursoClient | null = null;

export function resetTursoInstance(): void {
  tursoInstance = null;
}

export async function getTursoAdapter(config: ConfigItem): Promise<DbClient> {
  const rawUrl = config.url_config || process.env.EXPO_PUBLIC_TURSO_URL || '';
  const authToken = config.key_config || process.env.EXPO_PUBLIC_TURSO_AUTH_TOKEN || '';

  if (!rawUrl || !authToken) {
    throw new Error('[Turso] ❌ URL ou Auth Token não configurados.');
  }

  if (!tursoInstance) {
    const httpUrl = rawUrl.replace('libsql://', 'https://');
    tursoInstance = createTursoClient({ url: httpUrl, authToken });
    console.log('[Turso] 🔌 Conexão HTTP criada com sucesso.');
  }

  const client = tursoInstance;

  async function getAllAsync<T>(query: string, params: any[] = []): Promise<T[]> {
    console.log('[TursoAdapter] 📤 Executando getAllAsync:', query);
    const resultSet = await client.execute({ sql: query, args: params });
    console.log(`[TursoAdapter] 📥 Resposta recebida. Registros: ${resultSet.rows.length}`);
    return resultSet.rows as unknown as T[];
  }

  async function getFirstAsync<T>(query: string, params: any[] = []): Promise<T | null> {
    const results = await getAllAsync<T>(query, params);
    return results.length > 0 ? results[0] : null;
  }

  async function runAsync(query: string, params: any[] = []): Promise<{ lastInsertRowId: number; changes: number }> {
    console.log('[TursoAdapter] 📤 Executando runAsync:', query);
    const resultSet = await client.execute({ sql: query, args: params });
    const insertId = resultSet.lastInsertRowid ? Number(resultSet.lastInsertRowid) : 0;
    const affected = resultSet.rowsAffected ?? 0;
    console.log(`[TursoAdapter] 📥 Executado com sucesso. Insert ID: ${insertId}, Linhas afetadas: ${affected}`);
    return { lastInsertRowId: insertId, changes: affected };
  }

  async function execAsync(query: string): Promise<void> {
    console.log('[TursoAdapter] 📤 Executando execAsync');
    await client.execute(query);
  }

  return { getAllAsync, getFirstAsync, runAsync, execAsync };
}